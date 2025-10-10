// NodeGraph.js — D3 force graph (placeholder data)
// Dependencies: d3@7 via CDN ESM
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// REGION: Mount
export function mountGraph(el, dataset) {
  if (!el) return;

  let width = Math.max(320, Math.floor(el.clientWidth || 640));
  let height = Math.max(320, Math.floor(el.clientHeight || Math.round(width * 0.6)));

  const rootStyle = getComputedStyle(document.documentElement);
  const cssVar = (n, fb) => (rootStyle.getPropertyValue(n) || fb).trim();
  const C_BORDER = cssVar('--border', '#252932');
  const C_MUTED = cssVar('--muted', '#9aa0aa');
  const C_ACCENT = cssVar('--accent', '#5aa6ff');
  const C_ACCENT2 = cssVar('--accent-2', '#7bd389');

  const svg = d3.select(el)
    .append('svg')
    .attr('role', 'img')
    .attr('aria-label', 'Roadmap graph')
    .attr('width', '100%')
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])
    .style('display', 'block');

  const g = svg.append('g');
  const linkG = g.append('g').attr('class', 'links');
  const nodeG = g.append('g').attr('class', 'nodes');

  let currentTransform = d3.zoomIdentity;
  svg.call(
    d3.zoom().scaleExtent([0.5, 4]).on('zoom', (ev) => {
      currentTransform = ev.transform;
      g.attr('transform', currentTransform);
    })
  );

  const tooltip = d3.select('body')
    .append('div')
    .style('position', 'absolute')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('background', 'rgba(21, 23, 27, 0.95)')
    .style('color', '#e6e8ef')
    .style('font', '12px system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,"Helvetica Neue",Arial')
    .style('padding', '8px 10px')
    .style('border', `1px solid ${C_BORDER}`)
    .style('border-radius', '8px');

  const statusStroke = (s) => (s === 'complete' ? C_ACCENT2 : s === 'in_progress' ? C_ACCENT : C_MUTED);
  const radius = (d) => 6 + (Number.isFinite(+d.difficulty) ? +d.difficulty * 2 : 0);
  const idOf = (n) => (n && typeof n === 'object' ? n.id : n);

  const fetchData = async () => {
    const r = await fetch('./data/sampleRoadmap.json?v=2.0', { cache: 'no-store' });
    if (!r.ok) throw new Error('sampleRoadmap.json not found');
    return r.json();
  };

  const run = async () => {
    let data = dataset;
    if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.links)) {
      try { data = await fetchData(); }
      catch (e) {
        d3.select(el).append('div').style('color', C_MUTED).style('padding', '8px').text('No data: data/sampleRoadmap.json');
        return;
      }
    }

    const nodes = (data.nodes || []).map((d) => ({ ...d }));
    const links = (data.links || []).map((d) => ({ ...d }));
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const groups = Array.from(new Set(nodes.map((d) => d.group))).filter((v) => v != null);
    const fill = d3.scaleOrdinal(groups, d3.schemeTableau10);

    const neighbor = new Map();
    const nodeKey = (v) => (v && typeof v === 'object') ? v.id : (typeof v === 'number' ? (nodes[v]?.id) : v);
    const buildNeighbors = () => {
      neighbor.clear();
      nodes.forEach((n) => neighbor.set(n.id, new Set()));
      links.forEach((l) => {
        const a = nodeKey(l.source);
        const b = nodeKey(l.target);
        if (!a || !b) return;
        neighbor.get(a)?.add(b);
        neighbor.get(b)?.add(a);
      });
    };

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.id).distance(48).strength(0.2))
      .force('charge', d3.forceManyBody().strength(-80))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((d) => radius(d) + 2));

    const link = linkG.selectAll('line')
      .data(links)
      .join('line')
      .attr('class', 'link')
      .attr('stroke', C_BORDER)
      .attr('stroke-opacity', 0.5)
      .attr('stroke-width', 1.5);

    const node = nodeG.selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('class', 'node')
      .attr('r', (d) => radius(d))
      .attr('fill', (d) => fill(d.group))
      .attr('stroke', (d) => statusStroke(d.status))
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer')
      .on('mouseover', (ev, d) => {
        tooltip.style('opacity', 1).html(`<strong>${d.label || d.id}</strong><br/>Group: ${d.group ?? ''}`);
        node.attr('opacity', (n) => (n.id === d.id || neighbor.get(d.id)?.has(n.id) ? 1 : 0.25));
        link.attr('stroke-opacity', (l) => {
          const a = nodeKey(l.source); const b = nodeKey(l.target);
          return (a === d.id || b === d.id) ? 0.9 : 0.15;
        });
      })
      .on('mousemove', (ev) => {
        const [x, y] = d3.pointer(ev, document.body);
        tooltip.style('left', x + 12 + 'px').style('top', y + 12 + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
        node.attr('opacity', 1);
        link.attr('stroke-opacity', 0.5);
      })
      .on('click', (ev, d) => {
        node.classed('is-selected', false).attr('stroke-width', 2);
        d3.select(ev.currentTarget).classed('is-selected', true).attr('stroke-width', 3);
        if (window.AppBus && typeof window.AppBus.emit === 'function') {
          const ids = Array.from(neighbor.get(d.id) || []);
          const labels = ids.map((id) => byId.get(id)?.label ?? String(id));
          window.AppBus.emit('node:selected', {
            id: d.id,
            label: d.label,
            group: d.group,
            difficulty: d.difficulty,
            status: d.status,
            neighbors: labels
          });
        }
      })
      .call(
        d3.drag()
          .on('start', (ev, d) => {
            if (!ev.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on('drag', (ev, d) => {
            const p = d3.pointer(ev, svg.node());
            d.fx = currentTransform.invertX(p[0]);
            d.fy = currentTransform.invertY(p[1]);
          })
          .on('end', (ev, d) => {
            if (!ev.active) sim.alphaTarget(0);
            d.fx = null; d.fy = null;
          })
      );

    // Resolve neighbor map after link force initializes source/target
    buildNeighbors();

    sim.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);
    });

    const resize = () => {
      width = Math.max(320, Math.floor(el.clientWidth || width));
      height = Math.max(320, Math.floor(el.clientHeight || Math.round(width * 0.6)));
      svg.attr('viewBox', [0, 0, width, height]).attr('height', height);
      sim.force('center', d3.forceCenter(width / 2, height / 2));
      sim.alpha(0.1).restart();
    };

    let t;
    const onResize = () => { clearTimeout(t); t = setTimeout(resize, 150); };
    window.addEventListener('resize', onResize);
  };

  run();
}
