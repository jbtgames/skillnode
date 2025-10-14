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
  const defs = svg.append('defs');
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

  let simRef = null;
  const settleLayout = () => {
    if (!simRef) return;
    let steps = 0;
    while (simRef.alpha() > 0.015 && steps < 600) { simRef.tick(); steps++; }
  };

  const exportPNG = () => {
    const svgEl = svg.node(); if (!svgEl) return;
    // Force layout settle before snapshot
    try { settleLayout(); } catch {}
    // Apply latest positions to DOM before serializing
    try {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
      node
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);
    } catch {}

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
  const zoom = d3.zoom().scaleExtent([0.5, 4]).on('zoom', (ev) => {
    currentTransform = ev.transform;
    g.attr('transform', currentTransform);
  });
  svg.call(zoom);

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
  const typeFill = (t) => {
    const T = String(t || '').toLowerCase();
    if (T === 'education') return '#5aa6ff';
    if (T === 'work' || T === 'experience' || T === 'job') return '#22b34b';
    if (T === 'cert' || T === 'certification') return '#f9c74f';
    return null;
  };

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

    // Support multi-pathway data.pathways by flattening to nodes/links with routeIndex
    let nodes = [];
    let links = [];
    if (Array.isArray(data.pathways)) {
      const seen = new Map();
      const addNode = (n) => {
        const id = n.id || `${n.routeIndex}-${n.idx}-${(n.label||'').toString()}`;
        if (!seen.has(id)) { seen.set(id, { ...n, id }); nodes.push(seen.get(id)); }
        return id;
      };
      data.pathways.forEach((path, ri) => {
        const steps = Array.isArray(path?.nodes) ? path.nodes : (Array.isArray(path) ? path : []);
        let prev = null;
        steps.forEach((raw, idx) => {
          const base = { ...raw, routeIndex: ri, idx };
          const id = addNode(base);
          if (prev) links.push({ source: prev, target: id, type: 'path', routeIndex: ri });
          prev = id;
        });
      });
    } else if (Array.isArray(data.primary) || Array.isArray(data.branches)) {
      const seen = new Map();
      const addNode = (n) => {
        const id = String(n.id ?? `${n.routeIndex}-${n.idx}-${(n.label||'').toString()}`);
        if (!seen.has(id)) { seen.set(id, { ...n, id }); nodes.push(seen.get(id)); }
        return id;
      };
      const primary = Array.isArray(data.primary) ? data.primary : [];
      let prev = null;
      primary.forEach((raw, idx) => {
        const base = { ...raw, routeIndex: 0, idx };
        const id = addNode(base);
        if (prev) links.push({ source: prev, target: id, type: 'path', routeIndex: 0 });
        prev = id;
      });
      const branches = Array.isArray(data.branches) ? data.branches : [];
      branches.forEach((path, bIdx) => {
        if (!Array.isArray(path)) return;
        let prevB = null;
        path.forEach((raw, idx) => {
          const base = { ...raw, routeIndex: bIdx + 1, idx };
          const id = addNode(base);
          if (prevB) links.push({ source: prevB, target: id, type: 'path', routeIndex: bIdx + 1 });
          prevB = id;
        });
      });
    } else {
      nodes = (data.nodes || []).map((d) => ({ ...d }));
      links = (data.links || []).map((d) => ({ ...d }));
    }
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

    // V2 Explorer: radial ripple layout with incremental expansion
    const explorerSeedLabel = String(dataset?.goal || '').toLowerCase();
    const hasRoutes = nodes.some(n => n.routeIndex != null) || Array.isArray(dataset?.primary) || Array.isArray(dataset?.branches) || !!explorerSeedLabel;
    if (hasRoutes) {
      const allNodes = nodes.map(d => ({ ...d }));
      const allLinks = links.map(d => ({ ...d }));
      const byIdAll = new Map(allNodes.map(n => [String(n.id), n]));
      const neigh = new Map();
      allNodes.forEach(n => neigh.set(String(n.id), new Set()));
      allLinks.forEach(l => {
        const a = String(nodeKey(l.source)); const b = String(nodeKey(l.target));
        if (!neigh.has(a)) neigh.set(a, new Set()); if (!neigh.has(b)) neigh.set(b, new Set());
        neigh.get(a).add(b); neigh.get(b).add(a);
      });
      const seed = (() => {
        const goal = allNodes.find(n => String(n.type||'').toLowerCase()==='goal');
        if (explorerSeedLabel) {
          const match = allNodes.find(n => String(n.label||'').toLowerCase()===explorerSeedLabel);
          if (match) return String(match.id);
        }
        return String((goal?.id) || (allNodes[0]?.id));
      })();
      const levels = new Map();
      const visible = new Set();
      const frontier = (start, depth) => {
        const q = [[start,0]]; const seen = new Set([start]);
        while (q.length) {
          const [id, d] = q.shift(); levels.set(id, Math.min(levels.get(id)||Infinity, d)); if (d<=depth) visible.add(id);
          if (d===depth) continue; for (const nb of (neigh.get(id)||[])) if (!seen.has(nb)) { seen.add(nb); q.push([nb, d+1]); }
        }
      };
      frontier(seed, 2);
      if (!visible.has(String(seed)) && seed) visible.add(String(seed));

      const cx = width/2, cy = height/2, ring = 110;
      const diffColor = d3.scaleLinear().domain([1,3,5]).range(['#22b34b','#f9c74f','#ff6b6b']).clamp(true);

      const renderExplorer = () => {
        let vNodes = allNodes.filter(n => visible.has(String(n.id))).map(n => ({...n, depth: levels.get(String(n.id))||0 }));
        if (vNodes.length === 0) {
          const firstId = String(allNodes[0]?.id || seed);
          visible.add(firstId);
          for (const nb of (neigh.get(firstId)||[])) visible.add(String(nb));
          vNodes = allNodes.filter(n => visible.has(String(n.id))).map(n => ({...n, depth: levels.get(String(n.id))||0 }));
          if (vNodes.length === 0) {
            d3.select(el).append('div').style('color', C_MUTED).style('padding','8px').text('No nodes to display');
            return;
          }
        }
        const vLinks = allLinks.filter(l => visible.has(String(nodeKey(l.source))) && visible.has(String(nodeKey(l.target))));

        // Simulation with radial rings by depth
        const sim = d3.forceSimulation(vNodes)
          .force('link', d3.forceLink(vLinks).id(d=> String(d.id)).distance(80).strength(0.4))
          .force('charge', d3.forceManyBody().strength(-40))
          .force('collide', d3.forceCollide().radius(d => radius(d)+6))
          .force('radial', d3.forceRadial(d => ring*(d.depth||0), cx, cy).strength(0.9));

        const linkSel = linkG.selectAll('line').data(vLinks, d=> String(nodeKey(d.source))+'-'+String(nodeKey(d.target))).join('line')
          .attr('class', d=> 'link ' + ((byIdAll.get(String(nodeKey(d.target)))?.routeIndex||0)>0 ? 'link-branch':'link-primary'))
          .attr('stroke', C_BORDER)
          .attr('stroke-opacity', d=> ((byIdAll.get(String(nodeKey(d.target)))?.routeIndex||0)>0)?0.6:0.85)
          .attr('stroke-width', d=> ((byIdAll.get(String(nodeKey(d.target)))?.routeIndex||0)>0)?1.5:2);

        const nodeSel = nodeG.selectAll('circle').data(vNodes, d=> String(d.id)).join('circle')
          .attr('class', d=> 'node ' + ((d.routeIndex||0)>0?'node-branch':'node-primary'))
          .attr('r', d=> radius(d))
          .attr('fill', d=> diffColor(Number.isFinite(+d.difficulty)? +d.difficulty : 2))
          .attr('stroke', d=> statusStroke(d.status))
          .attr('stroke-width', 2)
          .attr('cursor','pointer')
          .on('mouseover', (ev, d) => {
            tooltip.style('opacity',1).html(`<strong>${d.label||d.id}</strong><br/>Level: ${d.difficulty??'-'}`);
            nodeSel.attr('opacity', n=> (n.id===d.id || (neigh.get(String(d.id))||new Set()).has(String(n.id)))?1:0.25);
            linkSel.attr('stroke-opacity', l=> (nodeKey(l.source)===String(d.id) || nodeKey(l.target)===String(d.id))?0.95:0.15);
          })
          .on('mouseout', ()=>{ tooltip.style('opacity',0); nodeSel.attr('opacity',1); linkSel.attr('stroke-opacity', d=> ((byIdAll.get(String(nodeKey(d.target)))?.routeIndex||0)>0)?0.6:0.85); })
          .on('click', (ev, d) => {
            // Expand one ripple from clicked node
            const id = String(d.id);
            for (const nb of (neigh.get(id)||[])) {
              const nd = String(nb); if (!visible.has(nd)) { visible.add(nd); levels.set(nd, (levels.get(id)||0)+1); }
            }
            renderExplorer();
            try { showNodeModal(d); } catch {}
            if (window.AppBus?.emit) window.AppBus.emit('node:selected', d);
          });

        sim.on('tick', () => {
          linkSel
            .attr('x1', d => byIdAll.get(String(nodeKey(d.source)))?.x || d.source.x)
            .attr('y1', d => byIdAll.get(String(nodeKey(d.source)))?.y || d.source.y)
            .attr('x2', d => byIdAll.get(String(nodeKey(d.target)))?.x || d.target.x)
            .attr('y2', d => byIdAll.get(String(nodeKey(d.target)))?.y || d.target.y);
          nodeSel
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
        });
      };

      // Controls: Reset
      const resetBtn = d3.select(el).select('.export-controls')
        .append('button').attr('type','button').attr('class','goal-button').text('Reset Map');
      resetBtn.on('click', () => { visible.clear(); levels.clear(); frontier(seed,2); renderExplorer(); });

      renderExplorer();
      exportData = { nodes: allNodes.map(n=> ({ id:n.id, label:n.label, group:n.group, difficulty:n.difficulty, status:n.status })), links: allLinks.map(l=> ({ source: nodeKey(l.source), target: nodeKey(l.target), type: l.type||'related' })) };
      return;
    }
      const M = { top: 32, right: 32, bottom: 32, left: 32 };
      // Build route groups
      const groupsByRoute = d3.group(nodes, d => (d.routeIndex ?? 0));
      const primary = (groupsByRoute.get(0) || []).slice().sort((a,b)=> (a.idx??0)-(b.idx??0));
      const toObj = (n) => ({ id: n.id, label: n.label, type: n.type, dataRef: n, children: [] });
      // Primary trunk as nested children
      let rootObj = primary.length ? toObj(primary[0]) : toObj(nodes[0]);
      const objById = new Map([[rootObj.id, rootObj]]);
      let cursor = rootObj;
      for (let i=1;i<primary.length;i++){ const child = toObj(primary[i]); cursor.children = cursor.children||[]; cursor.children.push(child); objById.set(child.id, child); cursor = child; }
      const goalId = cursor?.id;
      // Attach branches laterally
      for (const [ri, arr0] of groupsByRoute) {
        if (ri === 0 || !arr0) continue;
        const arr = arr0.slice().sort((a,b)=> (a.idx??0)-(b.idx??0));
        const parent = objById.get(primary[Math.max(0, primary.length-2)]?.id) || rootObj;
        let chainParent = parent;
        for (let i=0;i<arr.length;i++){ const nd = toObj(arr[i]); chainParent.children = chainParent.children||[]; chainParent.children.push(nd); objById.set(nd.id, nd); chainParent = nd; }
        // Ensure merge back to goal by adding a shallow goal if last isn't goal
        if (goalId && chainParent.id !== goalId) { const g = objById.get(goalId); if (g) { chainParent.children = chainParent.children||[]; chainParent.children.push(g); } }
      }

      // Tree layout
      const h = d3.hierarchy(rootObj, d => d.children);
      const tree = d3.tree().size([width - M.left - M.right, height - M.top - M.bottom]).separation((a,b)=> (a.parent===b.parent?1.2:1.8));
      tree(h);

      // Gradients
      const goalGrad = defs.append('linearGradient').attr('id','grad-goal').attr('x1','0%').attr('x2','100%');
      goalGrad.append('stop').attr('offset','0%').attr('stop-color', C_ACCENT);
      goalGrad.append('stop').attr('offset','100%').attr('stop-color', C_ACCENT2);

      // Render links as orthogonal (flowchart) paths
      const tLinks = h.links().map(l => ({
        source:{ x:l.source.x+M.left, y:l.source.y+M.top, id:l.source.data.id },
        target:{ x:l.target.x+M.left, y:l.target.y+M.top, id:l.target.data.id },
        routeIndex: (byId.get(l.target.data.id)?.routeIndex ?? 0)
      }));
      const elbow = (d) => {
        const sx=d.source.x, sy=d.source.y, tx=d.target.x, ty=d.target.y;
        const my = Math.round((sy+ty)/2);
        return `M${sx},${sy} V${my} H${tx} V${ty}`;
      };
      const linkSel = linkG.selectAll('path').data(tLinks, d=> d.source.id+'=>'+d.target.id).join('path')
        .attr('class', d => 'link ' + (d.routeIndex>0 ? 'link-branch' : 'link-primary'))
        .attr('stroke', C_BORDER)
        .attr('fill','none')
        .attr('stroke-opacity', d => d.routeIndex>0 ? 0.6 : 0.9)
        .attr('stroke-width', d => d.routeIndex>0 ? 1.5 : 2)
        .attr('d', elbow);

      // Render nodes
      const tNodes = h.descendants().map(n => ({ x:n.x+M.left, y:n.y+M.top, dataRef: n.data.dataRef || byId.get(n.data.id) || { id:n.data.id, label:n.data.label, type:n.data.type } }));
      const nodeSel = nodeG.selectAll('circle').data(tNodes, d=> d.dataRef.id).join('circle')
        .attr('class', d => 'node ' + ((byId.get(d.dataRef.id)?.routeIndex ?? 0)>0 ? 'node-branch' : 'node-primary'))
        .attr('r', d=> radius(d.dataRef))
        .attr('fill', d=> String(d.dataRef.type||'').toLowerCase()==='goal' ? 'url(#grad-goal)' : (typeFill(d.dataRef.type) || fill(d.dataRef.group)))
        .attr('stroke', d=> statusStroke(d.dataRef.status))
        .attr('stroke-width', 2)
        .attr('cursor','pointer')
        .attr('cx', d=> d.x).attr('cy', d=> d.y)
        .on('mouseover', (ev, d) => {
          tooltip.style('opacity',1).html(`<strong>${d.dataRef.label || d.dataRef.id}</strong><br/>${d.dataRef.type||''}`);
          nodeG.selectAll('circle').attr('opacity', n=> (n===d ? 1: 0.35));
          linkSel.attr('stroke-opacity', l=> (l.source.id===d.dataRef.id || l.target.id===d.dataRef.id) ? 0.95 : 0.2);
        })
        .on('mouseout', ()=>{ tooltip.style('opacity',0); nodeG.selectAll('circle').attr('opacity',1); linkSel.attr('stroke-opacity', d=> d.routeIndex>0?0.6:0.9); })
        .on('click', (ev, d) => { nodeG.selectAll('circle').classed('is-selected', false).attr('stroke-width',2); d3.select(ev.currentTarget).classed('is-selected', true).attr('stroke-width',3); try { showNodeModal(d.dataRef); } catch {}; if (window.AppBus?.emit) window.AppBus.emit('node:selected', d.dataRef); });

      // Controls
      const centerGoal = () => { const gnode = tNodes.find(n => String(n.dataRef.type||'').toLowerCase()==='goal') || tNodes[tNodes.length-1]; if (!gnode) return; const k = currentTransform.k || 1; const tx = width/2 - gnode.x*k; const ty = height/2 - gnode.y*k; svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity.translate(tx,ty).scale(k)); };
      const resetView = () => svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity);
      d3.select(el).select('.export-controls').append('button').attr('type','button').attr('class','goal-button').text('Center Goal').on('click', centerGoal);
      d3.select(el).select('.export-controls').append('button').attr('type','button').attr('class','goal-button').text('Reset View').on('click', resetView);
      setTimeout(centerGoal, 300);

      // Resize handler for tree
      const relayout = () => {
        const W = Math.max(320, Math.floor(el.clientWidth || width));
        const H = Math.max(320, Math.floor(el.clientHeight || Math.round(W*0.6)));
        svg.attr('viewBox', [0,0,W,H]).attr('height',H);
        const tr = d3.tree().size([W - M.left - M.right, H - M.top - M.bottom]).separation((a,b)=> (a.parent===b.parent?1.2:1.8));
        tr(h);
        linkSel.each(function(d){
          const sH = h.descendants().find(n=> n.data.id===d.source.id);
          const tH = h.descendants().find(n=> n.data.id===d.target.id);
          if (sH && tH) { d.source.x = sH.x + M.left; d.source.y = sH.y + M.top; d.target.x = tH.x + M.left; d.target.y = tH.y + M.top; }
        }).attr('d', elbow);
        nodeSel
          .attr('cx', d=> (d.x = h.descendants().find(n=> n.data.id===d.dataRef.id)?.x + M.left))
          .attr('cy', d=> (d.y = h.descendants().find(n=> n.data.id===d.dataRef.id)?.y + M.top));
      };
      window.addEventListener('resize', relayout);

      // Branch visibility toggle from AppBus/localStorage
      let showBranches = false; try { showBranches = localStorage.getItem('showBranches') === 'true'; } catch {}
      const applyBranchVisibility = () => {
        linkSel.attr('display', d => (d.routeIndex>0 && !showBranches) ? 'none' : null);
        nodeSel.attr('display', d => (((byId.get(d.dataRef.id)?.routeIndex ?? 0)>0) && !showBranches) ? 'none' : null);
      };
      applyBranchVisibility();
      if (window.AppBus && typeof window.AppBus.on === 'function') {
        window.AppBus.on('branches:toggle', (v) => { showBranches = !!v; applyBranchVisibility(); });
      }
      // Prepare export data (ids only)
      exportData = { nodes: nodes.map(n=> ({ id:n.id, label:n.label, group:n.group, difficulty:n.difficulty, status:n.status })), links: links.map(l=> ({ source: nodeKey(l.source), target: nodeKey(l.target), type: l.type||'related' })) };

      return; // Skip force layout path
    }

    // Generic graph → derive a tree via incoming links and render flowchart
    try {
      const M = { top: 32, right: 32, bottom: 32, left: 32 };
      // Build DAG parent mapping via Kahn's algorithm; break cycles conservatively
      const idList = nodes.map(n => String(n.id));
      const setById = new Set(idList);
      const out = new Map(idList.map(id => [id, new Set()]));
      const indeg = new Map(idList.map(id => [id, 0]));
      links.forEach(l => {
        const s = String(nodeKey(l.source));
        const t = String(nodeKey(l.target));
        if (!setById.has(s) || !setById.has(t) || s===t) return;
        if (!out.get(s).has(t)) { out.get(s).add(t); indeg.set(t, (indeg.get(t)||0)+1); }
      });
      const queue = [];
      indeg.forEach((v,k)=>{ if (v===0) queue.push(k); });
      const order = [];
      while (queue.length) { const u = queue.shift(); order.push(u); out.get(u).forEach(v=>{ indeg.set(v, indeg.get(v)-1); if (indeg.get(v)===0) queue.push(v); }); }
      // Rank for ordering; nodes in cycles go last
      const rank = new Map(order.map((id,i)=>[id,i]));
      let rBase = order.length;
      idList.forEach(id => { if (!rank.has(id)) { rank.set(id, rBase++); } });
      // Choose parent as one predecessor with lower rank
      const preds = new Map(idList.map(id => [id, new Set()]));
      links.forEach(l=>{ const s=String(nodeKey(l.source)), t=String(nodeKey(l.target)); if (setById.has(s) && setById.has(t) && s!==t) preds.get(t).add(s); });
      const parentId = new Map();
      idList.forEach(id => {
        const cand = Array.from(preds.get(id)).filter(p => rank.get(p) < rank.get(id));
        if (cand.length) parentId.set(id, cand.sort((a,b)=> rank.get(a)-rank.get(b))[0]);
      });
      let roots = idList.filter(id => !parentId.has(id));
      if (roots.length === 0) {
        // ensure at least one root (choose earliest by rank)
        const minId = idList.reduce((a,b)=> (rank.get(a) < rank.get(b) ? a : b));
        roots = [minId];
        parentId.delete(minId);
      }
      const dataArr = nodes.map(n => ({ id: String(n.id), parentId: (parentId.get(String(n.id)) ? String(parentId.get(String(n.id))) : (roots.length>1 ? 'ROOT' : null)), dataRef: n }));
      if (roots.length>1) dataArr.push({ id:'ROOT', parentId: null, dataRef: { id:'ROOT', label:'Root' } });
      const strat = d3.stratify().id(d=>d.id).parentId(d=>d.parentId);
      const h = strat(dataArr);
      const tree = d3.tree().size([width - M.left - M.right, height - M.top - M.bottom]).separation((a,b)=> (a.parent===b.parent?1.4:1.8));
      tree(h);
      const elbow = (d) => { const sx=d.source.x, sy=d.source.y, tx=d.target.x, ty=d.target.y; const my = Math.round((sy+ty)/2); return `M${sx},${sy} V${my} H${tx} V${ty}`; };
      const tLinks = h.links().filter(l=> l.source.id!=='ROOT').map(l => ({ source:{ x:l.source.x+M.left, y:l.source.y+M.top, id:l.source.id }, target:{ x:l.target.x+M.left, y:l.target.y+M.top, id:l.target.id }}));
      const linkSel = linkG.selectAll('path').data(tLinks, d=> d.source.id+'=>'+d.target.id).join('path')
        .attr('class','link link-primary')
        .attr('stroke', C_BORDER)
        .attr('fill','none')
        .attr('stroke-opacity', 0.9)
        .attr('stroke-width', 2)
        .attr('d', elbow);
      const tNodes = h.descendants().filter(n=> n.id!=='ROOT').map(n => ({ x:n.x+M.left, y:n.y+M.top, dataRef: nodes.find(nn=> String(nn.id)===n.id) || { id:n.id, label:n.id } }));
      const nodeSel = nodeG.selectAll('circle').data(tNodes, d=> d.dataRef.id).join('circle')
        .attr('class','node node-primary')
        .attr('r', d=> radius(d.dataRef))
        .attr('fill', d=> String(d.dataRef.type||'').toLowerCase()==='goal' ? 'url(#grad-goal)' : (typeFill(d.dataRef.type) || fill(d.dataRef.group)))
        .attr('stroke', d=> statusStroke(d.dataRef.status))
        .attr('stroke-width', 2)
        .attr('cursor','pointer')
        .attr('cx', d=> d.x).attr('cy', d=> d.y)
        .on('mouseover', (ev, d) => { tooltip.style('opacity',1).html(`<strong>${d.dataRef.label || d.dataRef.id}</strong><br/>${d.dataRef.type||''}`); nodeG.selectAll('circle').attr('opacity', n=> (n===d ? 1: 0.35)); linkSel.attr('stroke-opacity', l=> (l.source.id===d.dataRef.id || l.target.id===d.dataRef.id) ? 0.95 : 0.2); })
        .on('mouseout', ()=>{ tooltip.style('opacity',0); nodeG.selectAll('circle').attr('opacity',1); linkSel.attr('stroke-opacity', 0.9); })
        .on('click', (ev, d) => { nodeG.selectAll('circle').classed('is-selected', false).attr('stroke-width',2); d3.select(ev.currentTarget).classed('is-selected', true).attr('stroke-width',3); try { showNodeModal(d.dataRef); } catch {}; if (window.AppBus?.emit) window.AppBus.emit('node:selected', d.dataRef); });

      // Controls
      const centerGoal = () => { const gnode = tNodes.find(n => String(n.dataRef.type||'').toLowerCase()==='goal') || tNodes[tNodes.length-1]; if (!gnode) return; const k = currentTransform.k || 1; const tx = width/2 - gnode.x*k; const ty = height/2 - gnode.y*k; svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity.translate(tx,ty).scale(k)); };
      const resetView = () => svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity);
      d3.select(el).select('.export-controls').append('button').attr('type','button').attr('class','goal-button').text('Center Goal').on('click', centerGoal);
      d3.select(el).select('.export-controls').append('button').attr('type','button').attr('class','goal-button').text('Reset View').on('click', resetView);
      setTimeout(centerGoal, 300);
      // Export data
      exportData = { nodes: nodes.map(n=> ({ id:n.id, label:n.label, group:n.group, difficulty:n.difficulty, status:n.status })), links: links.map(l=> ({ source: nodeKey(l.source), target: nodeKey(l.target), type: l.type||'related' })) };
      return;
    } catch (e) {
      // Fall back to explorer/force path below if stratify fails
    }

    const stageIndex = (d) => {
      const s = String(d.stage || d.type || '').toLowerCase();
      if (s.includes('goal')) return 3;
      if (s.includes('mid')) return 2;
      if (s.includes('entry')) return 1;
      if (s.includes('education') || s.includes('degree') || s.includes('bootcamp')) return 0;
      if (/junior|intern/.test(String(d.label||'').toLowerCase())) return 1;
      if (/senior|lead/.test(String(d.label||'').toLowerCase())) return 2;
      return 1;
    };
    const yFor = (d) => {
      const margin = 32; const step = (height - margin*2) / 3; return margin + stageIndex(d) * step;
    };
    const xFor = (d) => {
      const isBranch = d.routeIndex != null && d.routeIndex > 0; if (!isBranch) return width*0.5; const side = (d.routeIndex % 2) ? 0.3 : 0.7; return width*side;
    };

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.id).distance(96).strength(0.35))
      .force('charge', d3.forceManyBody().strength(-12))
      .force('collide', d3.forceCollide().radius((d) => radius(d) + 2))
      .force('x', d3.forceX(xFor).strength(1))
      .force('y', d3.forceY(yFor).strength(1));
    simRef = sim;

    // Define gradients for each routeIndex
    const routeSet = new Set(links.map(l => l.routeIndex).filter(v => v !== undefined));
    const routeIdx = Array.from(routeSet);
    const palette = d3.schemeSet2 || d3.schemeTableau10;
    routeIdx.forEach((ri, i) => {
      const grad = defs.append('linearGradient').attr('id', `grad-route-${ri}`).attr('x1','0%').attr('x2','100%');
      const c1 = palette[i % palette.length];
      const c2 = c1;
      grad.append('stop').attr('offset','0%').attr('stop-color', c1);
      grad.append('stop').attr('offset','100%').attr('stop-color', c2);
    });
    // Goal gradient from theme accents
    const goalGrad = defs.append('linearGradient').attr('id','grad-goal').attr('x1','0%').attr('x2','100%');
    goalGrad.append('stop').attr('offset','0%').attr('stop-color', C_ACCENT);
    goalGrad.append('stop').attr('offset','100%').attr('stop-color', C_ACCENT2);

    const link = linkG.selectAll('line')
      .data(links)
      .join('line')
      .attr('class', 'link')
      .attr('stroke', (l) => (l.routeIndex != null ? `url(#grad-route-${l.routeIndex})` : C_BORDER))
      .attr('stroke-opacity', (l) => (l.routeIndex != null && l.routeIndex > 0 ? 0.35 : 0.8))
      .attr('stroke-width', 1.5);

    const node = nodeG.selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('class', 'node')
      .attr('r', (d) => radius(d))
      .attr('fill', (d) => {
        if (String(d.type||'').toLowerCase() === 'goal') return 'url(#grad-goal)';
        const base = typeFill(d.type) || fill(d.group);
        if (d.routeIndex != null && d.routeIndex > 0) { const c = d3.color(base); if (c) return c.brighter(0.8).formatHex(); }
        return base;
      })
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

    // Deterministic flow layout when primary/branches are present
    const hasFlow = Array.isArray(data.primary) || Array.isArray(data.branches);
    const layoutFlow = () => {
      const margin = 40;
      const primary = nodes.filter(n => (n.routeIndex ?? 0) === 0).sort((a,b)=> (a.idx??0)-(b.idx??0));
      const goal = nodes.find(n => String(n.type||'').toLowerCase()==='goal') || primary[primary.length-1] || nodes[nodes.length-1];
      const pLen = Math.max(1, primary.length);
      const yStep = (height - margin*2) / Math.max(1, pLen-1);
      primary.forEach((n,i)=>{ n.x = width*0.5; n.y = margin + i*yStep; });
      const branches = d3.rollup(nodes.filter(n => (n.routeIndex??0)>0), v=> v.sort((a,b)=> (a.idx??0)-(b.idx??0)), n=> n.routeIndex);
      let lane = 0;
      for (const [ri, arr] of branches) {
        lane++;
        const left = (ri % 2) === 1;
        const col = 0.16 * lane;
        const x = width * (0.5 + (left ? -col : col));
        const len = Math.max(1, arr.length);
        const gy = goal && Number.isFinite(goal.y) ? goal.y : (margin + (pLen-1)*yStep);
        const step = gy / Math.max(1, len);
        arr.forEach((n,i)=>{ n.x = x; n.y = margin + Math.min(pLen-1, i)*yStep; if (i===len-1 && goal) { /* ensure merge */ } });
      }
      // Apply positions to DOM
      link
        .attr('x1', (d) => (byId.get(nodeKey(d.source))?.x ?? 0))
        .attr('y1', (d) => (byId.get(nodeKey(d.source))?.y ?? 0))
        .attr('x2', (d) => (byId.get(nodeKey(d.target))?.x ?? 0))
        .attr('y2', (d) => (byId.get(nodeKey(d.target))?.y ?? 0));
      node
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);
    };
    if (hasFlow) { try { layoutFlow(); simRef = null; } catch {} }

    // Prepare export snapshot (ids, labels only)
    const buildExport = () => ({
      nodes: nodes.map((n) => ({ id: n.id, label: n.label, group: n.group, difficulty: n.difficulty, status: n.status })),
      links: links.map((l) => ({ source: nodeKey(l.source), target: nodeKey(l.target), type: l.type || 'related' }))
    });
    exportData = buildExport();

    // Add view controls
    const centerGoal = () => {
      const goal = nodes.find(n => String(n.type||'').toLowerCase() === 'goal') || nodes.find(n => /goal/i.test(String(n.label||'')));
      if (!goal || !Number.isFinite(goal.x) || !Number.isFinite(goal.y)) return;
      const k = currentTransform.k || 1;
      const tx = width/2 - goal.x * k;
      const ty = height/2 - goal.y * k;
      svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(k));
    };
    const resetView = () => { svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity); };
    d3.select(el).select('.export-controls')
      .append('button').attr('type','button').attr('class','goal-button').text('Center Goal').on('click', centerGoal);
    d3.select(el).select('.export-controls')
      .append('button').attr('type','button').attr('class','goal-button').text('Reset View').on('click', resetView);
    let showBranches = true;
    const applyBranchVisibility = () => {
      node.attr('display', (d) => (d.routeIndex != null && d.routeIndex > 0 && !showBranches) ? 'none' : null);
      link.attr('display', (l) => (l.routeIndex != null && l.routeIndex > 0 && !showBranches) ? 'none' : null);
    };
    const toggleBtn = d3.select(el).select('.export-controls')
      .append('button').attr('type','button').attr('class','goal-button').text('Hide Alternate Routes');
    toggleBtn.on('click', () => { showBranches = !showBranches; toggleBtn.text(showBranches ? 'Hide Alternate Routes' : 'Show Alternate Routes'); applyBranchVisibility(); });
    if (window.AppBus && typeof window.AppBus.on === 'function') {
      window.AppBus.on('branches:toggle', (v) => { showBranches = !!v; toggleBtn.text(showBranches ? 'Hide Alternate Routes' : 'Show Alternate Routes'); applyBranchVisibility(); });
    }
    applyBranchVisibility();

    // Quickly settle to flow-chart layout so initial render isn't clustered
    for (let i = 0; i < 200; i++) { sim.tick(); }
    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);
    node
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y);

    // Auto-center goal after initial layout settles
    setTimeout(centerGoal, 500);

    if (simRef) {
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
    }

    const resize = () => {
      width = Math.max(320, Math.floor(el.clientWidth || width));
      height = Math.max(320, Math.floor(el.clientHeight || Math.round(width * 0.6)));
      svg.attr('viewBox', [0, 0, width, height]).attr('height', height);
      if (simRef) { simRef.force('center', d3.forceCenter(width / 2, height / 2)); simRef.alpha(0.1).restart(); }
      else { layoutFlow(); }
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

  // Next Possible Roles (debounced async)
  const rolesSec = document.createElement('section');
  rolesSec.setAttribute('aria-label', 'Next Possible Roles');
  const rolesH = document.createElement('h4'); rolesH.textContent = 'Next Possible Roles';
  const rolesStatus = document.createElement('p'); rolesStatus.textContent = 'Loading...';
  rolesSec.append(rolesH, rolesStatus);
  panel.appendChild(rolesSec);

  let rolesTimer = setTimeout(async () => {
    try {
      const mod = await import('../logic/progression.js');
      const name = String(node.label || node.id || '');
      const list = await mod.getCareerProgressions(name);
      if (rolesStatus.isConnected) rolesStatus.remove();
      if (Array.isArray(list) && list.length) {
        const ul = document.createElement('ul');
        for (const r of list.slice(0, 5)) {
          const li = document.createElement('li'); li.textContent = String(r);
          ul.appendChild(li);
        }
        rolesSec.appendChild(ul);
      } else {
        const none = document.createElement('p'); none.textContent = 'No further data.';
        rolesSec.appendChild(none);
      }
    } catch {
      if (rolesStatus && rolesStatus.isConnected) rolesStatus.remove();
      const none = document.createElement('p'); none.textContent = 'No further data.';
      rolesSec.appendChild(none);
    }
  }, 200);
  overlay.appendChild(panel);
  body.appendChild(overlay);

  const cleanup = () => overlay.remove();
  close.addEventListener('click', cleanup);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) cleanup(); });
  overlay.addEventListener('click', () => { try { clearTimeout(rolesTimer); } catch {} });
}
