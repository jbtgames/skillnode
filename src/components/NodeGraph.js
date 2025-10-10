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

  // Export state and controls
  let exportData = null;
  const getExportData = () => exportData || { nodes: [], links: [] };
  const controls = d3.select(el)
    .append('div')
    .attr('class', 'export-controls')
    .style('display', 'flex')
    .style('gap', 'var(--space-2)')
    .style('margin-top', 'var(--space-2)');

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const exportJSON = () => {
    const data = getExportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'skillnode_roadmap.json');
  };

  const exportPNG = () => {
    const svgEl = svg.node(); if (!svgEl) return;
    const serializer = new XMLSerializer();
    let src = serializer.serializeToString(svgEl);
    if (!src.match(/xmlns=\"http:\/\/www.w3.org\/2000\/svg\"/)) src = src.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    if (!src.match(/xmlns:xlink/)) src = src.replace('<svg', '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    const svgBlob = new Blob([src], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(width));
      canvas.height = Math.max(1, Math.floor(height));
      const ctx = canvas.getContext('2d');
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0e0f12';
      ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => { if (blob) downloadBlob(blob, 'skillnode_roadmap.png'); }, 'image/png');
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  };

  controls.append('button').attr('type','button').attr('class','goal-button').text('Export JSON').on('click', exportJSON);
  controls.append('button').attr('type','button').attr('class','goal-button').text('Export Image').on('click', exportPNG);

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
    const nodeKey = (v) => {
      if (v && typeof v === 'object') return v.id;
      if (typeof v === 'number') return nodes[v]?.id;
      if (typeof v === 'string' && /^\d+$/.test(v)) {
        const idx = +v; return nodes[idx]?.id ?? v;
      }
      return v;
    };
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
        // Show details modal
        try { showNodeModal(d); } catch {}
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

    // Prepare export snapshot (ids, labels only)
    const buildExport = () => ({
      nodes: nodes.map((n) => ({ id: n.id, label: n.label, group: n.group, difficulty: n.difficulty, status: n.status })),
      links: links.map((l) => ({ source: nodeKey(l.source), target: nodeKey(l.target), type: l.type || 'related' }))
    });
    exportData = buildExport();

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

// REGION: Modal helper (appends to document.body)
function showNodeModal(node) {
  const body = document.body;
  const old = document.getElementById('sn-modal-overlay');
  if (old) old.remove();

  const overlay = document.createElement('div');
  overlay.id = 'sn-modal-overlay';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0,0,0,0.5)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '10000';

  const panel = document.createElement('div');
  panel.role = 'dialog';
  panel.setAttribute('aria-modal', 'true');
  panel.style.minWidth = 'min(640px, 92vw)';
  panel.style.maxWidth = '92vw';
  panel.style.background = 'var(--panel)';
  panel.style.color = 'var(--text)';
  panel.style.border = '1px solid var(--border)';
  panel.style.borderRadius = '12px';
  panel.style.boxShadow = '0 10px 30px rgba(0,0,0,.35)';
  panel.style.padding = '16px';
  panel.style.position = 'relative';

  const close = document.createElement('button');
  close.setAttribute('aria-label', 'Close');
  close.textContent = '×';
  close.style.position = 'absolute';
  close.style.top = '8px';
  close.style.right = '12px';
  close.style.border = '0';
  close.style.background = 'transparent';
  close.style.color = 'var(--text)';
  close.style.fontSize = '20px';
  close.style.cursor = 'pointer';

  const h = document.createElement('h3');
  h.textContent = node.label || node.id || 'Node';
  h.style.margin = '0 24px 8px 0';
  h.style.color = 'var(--accent)';

  const dl = document.createElement('dl');
  const addRow = (k, v) => {
    const dt = document.createElement('dt'); dt.textContent = k; dt.style.color = 'var(--muted)'; dt.style.fontWeight = '600';
    const dd = document.createElement('dd'); dd.textContent = String(v ?? '-'); dd.style.margin = '0 0 8px 0';
    dl.append(dt, dd);
  };
  addRow('Group', node.group ?? '-');
  addRow('Difficulty', Number.isFinite(+node.difficulty) ? `Level ${+node.difficulty}` : (node.difficulty ?? '-'));

  const statusWrap = document.createElement('div');
  const badge = document.createElement('span');
  const status = node.status || 'incomplete';
  badge.className = `status-badge status-${status}`;
  badge.textContent = String(status).replace('_',' ');
  statusWrap.appendChild(badge);

  const dt = document.createElement('dt'); dt.textContent = 'Status'; dt.style.color = 'var(--muted)'; dt.style.fontWeight = '600';
  const dd = document.createElement('dd'); dd.style.margin = '0 0 8px 0'; dd.appendChild(badge);
  dl.append(dt, dd);

  // Optional summary
  if (node.summary) {
    const sumH = document.createElement('h4'); sumH.textContent = 'Summary'; sumH.style.margin = '12px 0 6px';
    const sumP = document.createElement('p'); sumP.textContent = String(node.summary);
    panel.append(sumH, sumP);
  }

  panel.append(close, h, dl);
  // Related skills (async)
  const rel = document.createElement('section');
  rel.setAttribute('aria-label', 'Related Skills');
  const relH = document.createElement('h4'); relH.textContent = 'Related Skills';
  const relStatus = document.createElement('p'); relStatus.textContent = 'Loading...';
  rel.append(relH, relStatus);
  panel.appendChild(rel);

  (async () => {
    try {
      const mod = await import('../logic/recommendations.js');
      const name = String(node.label || node.id || '');
      const list = await mod.getSkillRecommendations(name);
      if (relStatus.isConnected) relStatus.remove();
      if (Array.isArray(list) && list.length) {
        const ul = document.createElement('ul');
        for (const s of list.slice(0, 5)) {
          const li = document.createElement('li'); li.textContent = String(s);
          ul.appendChild(li);
        }
        rel.appendChild(ul);
      } else {
        const none = document.createElement('p'); none.textContent = 'No recommendations available';
        rel.appendChild(none);
      }
    } catch {
      if (relStatus.isConnected) relStatus.remove();
      const none = document.createElement('p'); none.textContent = 'No recommendations available';
      rel.appendChild(none);
    }
  })();
  overlay.appendChild(panel);
  body.appendChild(overlay);

  const cleanup = () => overlay.remove();
  close.addEventListener('click', cleanup);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) cleanup(); });
}
