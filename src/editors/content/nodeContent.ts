import type { EditorContent } from "./types.js";

// ─── Shared node-graph base ─────────────────────────────────────────────────

interface PortDef {
  name: string;
  type: string; // "exec" | "bool" | "number" | "string" | "vec2" | "vec4" | "float" | "audio" | "any"
}

interface NodeTypeDef {
  type: string;
  label: string;
  color: string;
  inputs: PortDef[];
  outputs: PortDef[];
  data?: { name: string; default: string }[];
}

interface NodeInstance {
  id: string;
  type: string;
  x: number;
  y: number;
}

interface LinkInstance {
  from: string;
  fromPort: number;
  to: string;
  toPort: number;
}

interface NodeBaseConfig {
  nodeTypes: NodeTypeDef[];
  initialNodes: NodeInstance[];
  initialLinks: LinkInstance[];
  extraHtml?: string;
  extraStyles?: string;
  extraScript?: string;
}

function nodeBase(config: NodeBaseConfig): EditorContent {
  const { nodeTypes, initialNodes, initialLinks, extraHtml, extraStyles, extraScript } = config;

  const paletteItems = nodeTypes.map(nt =>
    `<div class="palette-item" data-type="${nt.type}" style="border-left:4px solid ${nt.color}">${nt.label}</div>`
  ).join("\n        ");

  const workspaceHtml = `
    <div class="node-editor">
      <div class="node-toolbar">
        <button id="btnAddNode" title="Add Node">+ Node</button>
        <button id="btnDelete" title="Delete Selected">Delete</button>
        <button id="btnAutoLayout" title="Auto Layout">Auto Layout</button>
        <button id="btnFit" title="Fit View">Fit</button>
        <span class="toolbar-stats" id="statsDisplay">Nodes: 0 | Links: 0</span>
      </div>
      <div class="node-body">
        <div class="node-palette" id="nodePalette">
          <div class="palette-title">Node Types</div>
          ${paletteItems}
        </div>
        <div class="node-canvas-wrap" id="canvasWrap">
          <svg id="nodeCanvas" width="100%" height="100%">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--vscode-editor-foreground)" opacity="0.6"/>
              </marker>
              <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="var(--vscode-editor-foreground)" opacity="0.15"/>
              </pattern>
            </defs>
            <rect width="10000" height="10000" fill="url(#dotGrid)" x="-5000" y="-5000"/>
            <g id="viewportGroup">
              <g id="linksLayer"></g>
              <g id="nodesLayer"></g>
              <path id="tempLink" fill="none" stroke="var(--vscode-editor-foreground)" stroke-width="2" stroke-dasharray="5,5" d="" opacity="0.5"/>
            </g>
          </svg>
        </div>
        <div class="node-inspector" id="nodeInspector">
          <div class="inspector-title">Inspector</div>
          <div id="inspectorContent"><p class="inspector-empty">Select a node</p></div>
        </div>
      </div>
      ${extraHtml || ""}
    </div>`;

  const styles = `
    .node-editor { display:flex; flex-direction:column; height:100%; overflow:hidden; }
    .node-toolbar { display:flex; align-items:center; gap:8px; padding:6px 12px; background:var(--vscode-editor-background); border-bottom:1px solid var(--vscode-panel-border); }
    .node-toolbar button { padding:4px 10px; background:var(--vscode-button-background); color:var(--vscode-button-foreground); border:none; border-radius:3px; cursor:pointer; font-size:12px; }
    .node-toolbar button:hover { background:var(--vscode-button-hoverBackground); }
    .toolbar-stats { margin-left:auto; font-size:11px; color:var(--vscode-descriptionForeground); }
    .node-body { display:flex; flex:1; overflow:hidden; }
    .node-palette { width:180px; min-width:180px; background:var(--vscode-sideBar-background); border-right:1px solid var(--vscode-panel-border); padding:8px; overflow-y:auto; }
    .palette-title { font-size:11px; font-weight:600; text-transform:uppercase; margin-bottom:8px; color:var(--vscode-sideBarSectionHeader-foreground); }
    .palette-item { padding:6px 8px; margin-bottom:4px; background:var(--vscode-editor-background); border-radius:3px; cursor:grab; font-size:12px; color:var(--vscode-editor-foreground); }
    .palette-item:hover { background:var(--vscode-list-hoverBackground); }
    .node-canvas-wrap { flex:1; overflow:hidden; position:relative; background:var(--vscode-editor-background); }
    #nodeCanvas { display:block; width:100%; height:100%; }
    .node-inspector { width:220px; min-width:220px; background:var(--vscode-sideBar-background); border-left:1px solid var(--vscode-panel-border); padding:8px; overflow-y:auto; }
    .inspector-title { font-size:11px; font-weight:600; text-transform:uppercase; margin-bottom:8px; color:var(--vscode-sideBarSectionHeader-foreground); }
    .inspector-empty { color:var(--vscode-descriptionForeground); font-size:12px; font-style:italic; }
    .inspector-field { margin-bottom:8px; }
    .inspector-field label { display:block; font-size:11px; color:var(--vscode-descriptionForeground); margin-bottom:2px; }
    .inspector-field input, .inspector-field select { width:100%; padding:3px 6px; background:var(--vscode-input-background); color:var(--vscode-input-foreground); border:1px solid var(--vscode-input-border); border-radius:2px; font-size:12px; box-sizing:border-box; }
    .graph-node rect.node-bg { rx:6; ry:6; stroke-width:2; }
    .graph-node.selected rect.node-bg { stroke:var(--vscode-focusBorder)!important; stroke-width:3; }
    .graph-node text { fill:#fff; font-size:11px; pointer-events:none; }
    .graph-node text.node-type-label { font-size:9px; opacity:0.7; }
    .port-circle { r:6; stroke:#fff; stroke-width:1.5; cursor:crosshair; }
    .port-circle:hover { r:8; }
    .link-path { fill:none; stroke:var(--vscode-editor-foreground); stroke-width:2; opacity:0.6; marker-end:url(#arrowhead); }
    .link-path:hover { stroke-width:3; opacity:1; }
    .link-path.selected { stroke:var(--vscode-focusBorder); stroke-width:3; opacity:1; }
    ${extraStyles || ""}`;

  const script = `
(function() {
  const NODE_TYPES = ${JSON.stringify(nodeTypes)};
  const typeMap = {};
  NODE_TYPES.forEach(nt => { typeMap[nt.type] = nt; });

  let nodes = ${JSON.stringify(initialNodes)};
  let links = ${JSON.stringify(initialLinks)};
  let nextId = nodes.length + 1;
  let selectedNodeId = null;
  let selectedLinkIdx = -1;
  let dragging = null;
  let connecting = null;
  let panning = false;
  let panStart = {x:0, y:0};
  let viewX = 0, viewY = 0, viewScale = 1;

  const canvas = document.getElementById("nodeCanvas");
  const viewGroup = document.getElementById("viewportGroup");
  const linksLayer = document.getElementById("linksLayer");
  const nodesLayer = document.getElementById("nodesLayer");
  const tempLink = document.getElementById("tempLink");
  const inspectorContent = document.getElementById("inspectorContent");
  const statsDisplay = document.getElementById("statsDisplay");

  function getNodeWidth() { return 160; }
  function getNodeHeight(nodeType) {
    const nt = typeMap[nodeType];
    if (!nt) return 80;
    const ports = Math.max(nt.inputs.length, nt.outputs.length);
    return 60 + ports * 20;
  }

  function getPortPos(node, portIdx, direction) {
    const w = getNodeWidth();
    return {
      x: node.x + (direction === "output" ? w : 0),
      y: node.y + 50 + portIdx * 20
    };
  }

  function renderLink(fromPos, toPos) {
    const dx = Math.abs(toPos.x - fromPos.x) * 0.5;
    return "M" + fromPos.x + "," + fromPos.y + " C" + (fromPos.x+dx) + "," + fromPos.y + " " + (toPos.x-dx) + "," + toPos.y + " " + toPos.x + "," + toPos.y;
  }

  function updateStats() {
    statsDisplay.textContent = "Nodes: " + nodes.length + " | Links: " + links.length;
  }

  function renderAll() {
    viewGroup.setAttribute("transform", "translate(" + viewX + "," + viewY + ") scale(" + viewScale + ")");
    // Render links
    linksLayer.innerHTML = "";
    links.forEach(function(lk, idx) {
      const fromNode = nodes.find(function(n){ return n.id === lk.from; });
      const toNode = nodes.find(function(n){ return n.id === lk.to; });
      if (!fromNode || !toNode) return;
      const fromPos = getPortPos(fromNode, lk.fromPort, "output");
      const toPos = getPortPos(toNode, lk.toPort, "input");
      const path = document.createElementNS(('http' + '://www.w3.org/2000/svg'), "path");
      path.setAttribute("d", renderLink(fromPos, toPos));
      path.setAttribute("class", "link-path" + (idx === selectedLinkIdx ? " selected" : ""));
      path.setAttribute("data-link-idx", idx);
      path.addEventListener("click", function(e) {
        e.stopPropagation();
        selectedNodeId = null;
        selectedLinkIdx = idx;
        renderAll();
        updateInspectorLink(idx);
      });
      linksLayer.appendChild(path);
    });
    // Render nodes
    nodesLayer.innerHTML = "";
    nodes.forEach(function(node) {
      const nt = typeMap[node.type];
      if (!nt) return;
      const w = getNodeWidth();
      const h = getNodeHeight(node.type);
      const g = document.createElementNS(('http' + '://www.w3.org/2000/svg'), "g");
      g.setAttribute("class", "graph-node" + (node.id === selectedNodeId ? " selected" : ""));
      g.setAttribute("transform", "translate(" + node.x + "," + node.y + ")");
      g.setAttribute("data-node-id", node.id);
      // Background rect
      const rect = document.createElementNS(('http' + '://www.w3.org/2000/svg'), "rect");
      rect.setAttribute("class", "node-bg");
      rect.setAttribute("width", w);
      rect.setAttribute("height", h);
      rect.setAttribute("fill", nt.color);
      rect.setAttribute("stroke", nt.color);
      rect.setAttribute("rx", "6");
      rect.setAttribute("ry", "6");
      g.appendChild(rect);
      // Title
      const title = document.createElementNS(('http' + '://www.w3.org/2000/svg'), "text");
      title.setAttribute("x", "10");
      title.setAttribute("y", "20");
      title.setAttribute("font-weight", "bold");
      title.textContent = node.id;
      g.appendChild(title);
      // Type label
      const typeLabel = document.createElementNS(('http' + '://www.w3.org/2000/svg'), "text");
      typeLabel.setAttribute("class", "node-type-label");
      typeLabel.setAttribute("x", "10");
      typeLabel.setAttribute("y", "34");
      typeLabel.textContent = nt.label;
      g.appendChild(typeLabel);
      // Input ports
      nt.inputs.forEach(function(port, pi) {
        const cy = 50 + pi * 20;
        const circle = document.createElementNS(('http' + '://www.w3.org/2000/svg'), "circle");
        circle.setAttribute("class", "port-circle");
        circle.setAttribute("cx", "0");
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", "6");
        circle.setAttribute("fill", getPortColor(port.type));
        circle.setAttribute("data-node-id", node.id);
        circle.setAttribute("data-port-idx", pi);
        circle.setAttribute("data-port-dir", "input");
        g.appendChild(circle);
        const plabel = document.createElementNS(('http' + '://www.w3.org/2000/svg'), "text");
        plabel.setAttribute("x", "10");
        plabel.setAttribute("y", cy + 4);
        plabel.setAttribute("font-size", "9");
        plabel.textContent = port.name;
        g.appendChild(plabel);
      });
      // Output ports
      nt.outputs.forEach(function(port, pi) {
        const cy = 50 + pi * 20;
        const circle = document.createElementNS(('http' + '://www.w3.org/2000/svg'), "circle");
        circle.setAttribute("class", "port-circle");
        circle.setAttribute("cx", w);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", "6");
        circle.setAttribute("fill", getPortColor(port.type));
        circle.setAttribute("data-node-id", node.id);
        circle.setAttribute("data-port-idx", pi);
        circle.setAttribute("data-port-dir", "output");
        g.appendChild(circle);
        const plabel = document.createElementNS(('http' + '://www.w3.org/2000/svg'), "text");
        plabel.setAttribute("x", w - 10);
        plabel.setAttribute("y", cy + 4);
        plabel.setAttribute("font-size", "9");
        plabel.setAttribute("text-anchor", "end");
        plabel.textContent = port.name;
        g.appendChild(plabel);
      });
      nodesLayer.appendChild(g);
    });
    updateStats();
  }

  function getPortColor(type) {
    switch(type) {
      case "exec": return "#e0e0e0";
      case "bool": return "#cc4444";
      case "number": case "float": return "#44cc44";
      case "string": return "#cccc44";
      case "vec2": return "#44cccc";
      case "vec4": return "#cc44cc";
      case "audio": return "#ff8844";
      default: return "#aaaaaa";
    }
  }

  function updateInspector() {
    if (!selectedNodeId) {
      inspectorContent.innerHTML = '<p class="inspector-empty">Select a node</p>';
      return;
    }
    const node = nodes.find(function(n){ return n.id === selectedNodeId; });
    if (!node) return;
    const nt = typeMap[node.type];
    if (!nt) return;
    let html = '<div class="inspector-field"><label>ID</label><input value="' + node.id + '" readonly/></div>';
    html += '<div class="inspector-field"><label>Type</label><input value="' + nt.label + '" readonly/></div>';
    html += '<div class="inspector-field"><label>X</label><input type="number" data-prop="x" value="' + Math.round(node.x) + '"/></div>';
    html += '<div class="inspector-field"><label>Y</label><input type="number" data-prop="y" value="' + Math.round(node.y) + '"/></div>';
    if (nt.data) {
      nt.data.forEach(function(d) {
        const val = (node.data && node.data[d.name]) || d.default;
        html += '<div class="inspector-field"><label>' + d.name + '</label><input data-data="' + d.name + '" value="' + escapeAttr(val) + '"/></div>';
      });
    }
    inspectorContent.innerHTML = html;
    inspectorContent.querySelectorAll("input[data-prop]").forEach(function(inp) {
      inp.addEventListener("change", function() {
        node[inp.dataset.prop] = parseFloat(inp.value) || 0;
        renderAll();
      });
    });
    inspectorContent.querySelectorAll("input[data-data]").forEach(function(inp) {
      inp.addEventListener("change", function() {
        if (!node.data) node.data = {};
        node.data[inp.dataset.data] = inp.value;
      });
    });
  }

  function updateInspectorLink(idx) {
    const lk = links[idx];
    if (!lk) { inspectorContent.innerHTML = '<p class="inspector-empty">Select a node</p>'; return; }
    inspectorContent.innerHTML =
      '<div class="inspector-field"><label>Link</label><input value="' + lk.from + "[" + lk.fromPort + '] → ' + lk.to + "[" + lk.toPort + ']" readonly/></div>' +
      '<div class="inspector-field"><button id="btnDeleteLink">Delete Link</button></div>';
    document.getElementById("btnDeleteLink").addEventListener("click", function() {
      links.splice(idx, 1);
      selectedLinkIdx = -1;
      renderAll();
      inspectorContent.innerHTML = '<p class="inspector-empty">Select a node</p>';
    });
  }

  function escapeAttr(s) { return String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }

  function svgPoint(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - viewX) / viewScale,
      y: (e.clientY - rect.top - viewY) / viewScale
    };
  }

  // ── Dragging ──
  canvas.addEventListener("mousedown", function(e) {
    const pt = svgPoint(e);
    // Check port click
    const portEl = e.target.closest(".port-circle");
    if (portEl) {
      const nodeId = portEl.getAttribute("data-node-id");
      const portIdx = parseInt(portEl.getAttribute("data-port-idx"), 10);
      const portDir = portEl.getAttribute("data-port-dir");
      if (portDir === "output") {
        connecting = { fromId: nodeId, fromPort: portIdx, startPos: pt };
        e.preventDefault();
        return;
      } else {
        // Clicking an input port while connecting completes connection
        return;
      }
    }
    // Check node click
    const nodeEl = e.target.closest(".graph-node");
    if (nodeEl && e.button === 0) {
      const nodeId = nodeEl.getAttribute("data-node-id");
      selectedNodeId = nodeId;
      selectedLinkIdx = -1;
      const node = nodes.find(function(n){ return n.id === nodeId; });
      if (node) {
        dragging = { nodeId: nodeId, offsetX: pt.x - node.x, offsetY: pt.y - node.y };
      }
      renderAll();
      updateInspector();
      e.preventDefault();
      return;
    }
    // Pan
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      panning = true;
      panStart = { x: e.clientX - viewX, y: e.clientY - viewY };
      e.preventDefault();
      return;
    }
    // Deselect
    if (e.button === 0) {
      selectedNodeId = null;
      selectedLinkIdx = -1;
      renderAll();
      updateInspector();
    }
  });

  canvas.addEventListener("mousemove", function(e) {
    if (dragging) {
      const pt = svgPoint(e);
      const node = nodes.find(function(n){ return n.id === dragging.nodeId; });
      if (node) {
        node.x = pt.x - dragging.offsetX;
        node.y = pt.y - dragging.offsetY;
        renderAll();
      }
    } else if (connecting) {
      const pt = svgPoint(e);
      const fromNode = nodes.find(function(n){ return n.id === connecting.fromId; });
      if (fromNode) {
        const fromPos = getPortPos(fromNode, connecting.fromPort, "output");
        tempLink.setAttribute("d", renderLink(fromPos, pt));
      }
    } else if (panning) {
      viewX = e.clientX - panStart.x;
      viewY = e.clientY - panStart.y;
      renderAll();
    }
  });

  canvas.addEventListener("mouseup", function(e) {
    if (connecting) {
      const portEl = e.target.closest(".port-circle");
      if (portEl) {
        const toId = portEl.getAttribute("data-node-id");
        const toPort = parseInt(portEl.getAttribute("data-port-idx"), 10);
        const toDir = portEl.getAttribute("data-port-dir");
        if (toDir === "input" && toId !== connecting.fromId) {
          const exists = links.some(function(lk) {
            return lk.from === connecting.fromId && lk.fromPort === connecting.fromPort && lk.to === toId && lk.toPort === toPort;
          });
          if (!exists) {
            links.push({ from: connecting.fromId, fromPort: connecting.fromPort, to: toId, toPort: toPort });
          }
        }
      }
      connecting = null;
      tempLink.setAttribute("d", "");
      renderAll();
    }
    dragging = null;
    panning = false;
  });

  // ── Zoom ──
  canvas.addEventListener("wheel", function(e) {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    viewX = mx - (mx - viewX) * scaleFactor;
    viewY = my - (my - viewY) * scaleFactor;
    viewScale *= scaleFactor;
    viewScale = Math.max(0.2, Math.min(3, viewScale));
    renderAll();
  });

  // ── Delete ──
  document.addEventListener("keydown", function(e) {
    if (e.key === "Delete" || e.key === "Backspace") {
      if (document.activeElement && document.activeElement.tagName === "INPUT") return;
      if (selectedNodeId) {
        nodes = nodes.filter(function(n){ return n.id !== selectedNodeId; });
        links = links.filter(function(lk){ return lk.from !== selectedNodeId && lk.to !== selectedNodeId; });
        selectedNodeId = null;
        renderAll();
        updateInspector();
      } else if (selectedLinkIdx >= 0) {
        links.splice(selectedLinkIdx, 1);
        selectedLinkIdx = -1;
        renderAll();
        inspectorContent.innerHTML = '<p class="inspector-empty">Select a node</p>';
      }
    }
  });

  // ── Toolbar: Add Node ──
  document.getElementById("btnAddNode").addEventListener("click", function() {
    const firstType = NODE_TYPES[0];
    if (!firstType) return;
    const id = firstType.type.charAt(0).toUpperCase() + "_" + (nextId++);
    nodes.push({ id: id, type: firstType.type, x: 100 + Math.random()*200, y: 100 + Math.random()*200 });
    renderAll();
  });

  // ── Toolbar: Delete ──
  document.getElementById("btnDelete").addEventListener("click", function() {
    if (selectedNodeId) {
      nodes = nodes.filter(function(n){ return n.id !== selectedNodeId; });
      links = links.filter(function(lk){ return lk.from !== selectedNodeId && lk.to !== selectedNodeId; });
      selectedNodeId = null;
      renderAll();
      updateInspector();
    } else if (selectedLinkIdx >= 0) {
      links.splice(selectedLinkIdx, 1);
      selectedLinkIdx = -1;
      renderAll();
      inspectorContent.innerHTML = '<p class="inspector-empty">Select a node</p>';
    }
  });

  // ── Toolbar: Auto Layout (BFS layering) ──
  document.getElementById("btnAutoLayout").addEventListener("click", function() {
    if (nodes.length === 0) return;
    // Build adjacency
    const adj = {};
    const inDeg = {};
    nodes.forEach(function(n) { adj[n.id] = []; inDeg[n.id] = 0; });
    links.forEach(function(lk) {
      if (adj[lk.from]) adj[lk.from].push(lk.to);
      if (inDeg[lk.to] !== undefined) inDeg[lk.to]++;
    });
    // BFS layers
    const layers = [];
    const visited = {};
    const queue = [];
    nodes.forEach(function(n) { if (inDeg[n.id] === 0) { queue.push(n.id); visited[n.id] = 0; } });
    if (queue.length === 0) { queue.push(nodes[0].id); visited[nodes[0].id] = 0; }
    let qi = 0;
    while (qi < queue.length) {
      const cur = queue[qi++];
      const layer = visited[cur];
      if (!layers[layer]) layers[layer] = [];
      layers[layer].push(cur);
      (adj[cur] || []).forEach(function(next) {
        if (visited[next] === undefined) {
          visited[next] = layer + 1;
          queue.push(next);
        }
      });
    }
    // Assign unvisited
    nodes.forEach(function(n) {
      if (visited[n.id] === undefined) {
        if (!layers[0]) layers[0] = [];
        layers[0].push(n.id);
      }
    });
    // Position
    const xGap = 240;
    const yGap = 120;
    layers.forEach(function(layer, li) {
      layer.forEach(function(nid, ni) {
        const node = nodes.find(function(n){ return n.id === nid; });
        if (node) {
          node.x = 80 + li * xGap;
          node.y = 80 + ni * yGap;
        }
      });
    });
    renderAll();
  });

  // ── Toolbar: Fit ──
  document.getElementById("btnFit").addEventListener("click", function() {
    if (nodes.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(function(n) {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + getNodeWidth());
      maxY = Math.max(maxY, n.y + getNodeHeight(n.type));
    });
    const rect = canvas.getBoundingClientRect();
    const padX = 60, padY = 60;
    const contentW = maxX - minX + padX * 2;
    const contentH = maxY - minY + padY * 2;
    viewScale = Math.min(rect.width / contentW, rect.height / contentH, 1.5);
    viewX = (rect.width - contentW * viewScale) / 2 - (minX - padX) * viewScale;
    viewY = (rect.height - contentH * viewScale) / 2 - (minY - padY) * viewScale;
    renderAll();
  });

  // ── Palette: click to add ──
  document.getElementById("nodePalette").addEventListener("click", function(e) {
    const item = e.target.closest(".palette-item");
    if (!item) return;
    const type = item.getAttribute("data-type");
    const nt = typeMap[type];
    if (!nt) return;
    const id = type.charAt(0).toUpperCase() + "_" + (nextId++);
    nodes.push({ id: id, type: type, x: 150 + Math.random()*100, y: 100 + Math.random()*100 });
    renderAll();
  });

  // Initial render
  renderAll();

  ${extraScript || ""}
})();`;

  return { workspaceHtml, styles, script };
}

// ─── 1. graphContent — Generic visual scripting ─────────────────────────────

export function graphContent(): EditorContent {
  return nodeBase({
    nodeTypes: [
      { type: "event", label: "Event", color: "#2d5a3a", inputs: [], outputs: [{ name: "exec", type: "exec" }] },
      { type: "action", label: "Action", color: "#3a3a5d", inputs: [{ name: "exec", type: "exec" }], outputs: [{ name: "exec", type: "exec" }] },
      { type: "condition", label: "Condition/If", color: "#5d5a2d", inputs: [{ name: "exec", type: "exec" }, { name: "bool", type: "bool" }], outputs: [{ name: "true", type: "exec" }, { name: "false", type: "exec" }] },
      { type: "variable", label: "Variable", color: "#2d4a5d", inputs: [], outputs: [{ name: "value", type: "any" }], data: [{ name: "name", default: "myVar" }, { name: "value", default: "0" }] },
      { type: "math", label: "Math", color: "#4a2d5d", inputs: [{ name: "a", type: "number" }, { name: "b", type: "number" }], outputs: [{ name: "result", type: "number" }], data: [{ name: "op", default: "+" }] },
      { type: "print", label: "Print", color: "#5d2d2d", inputs: [{ name: "exec", type: "exec" }, { name: "text", type: "string" }], outputs: [{ name: "exec", type: "exec" }] }
    ],
    initialNodes: [
      { id: "OnStart", type: "event", x: 50, y: 100 },
      { id: "SetX", type: "action", x: 300, y: 100 },
      { id: "CheckHP", type: "condition", x: 550, y: 80 },
      { id: "LogMsg", type: "print", x: 800, y: 60 }
    ],
    initialLinks: [
      { from: "OnStart", fromPort: 0, to: "SetX", toPort: 0 },
      { from: "SetX", fromPort: 0, to: "CheckHP", toPort: 0 },
      { from: "CheckHP", fromPort: 0, to: "LogMsg", toPort: 0 }
    ]
  });
}

// ─── 2. dialogContent — Dialog tree ─────────────────────────────────────────

export function dialogContent(): EditorContent {
  return nodeBase({
    nodeTypes: [
      { type: "npc_say", label: "NPC Say", color: "#2d5a5a", inputs: [{ name: "flow", type: "exec" }], outputs: [{ name: "flow", type: "exec" }], data: [{ name: "text", default: "Hello traveler!" }, { name: "character", default: "NPC" }, { name: "mood", default: "neutral" }] },
      { type: "player_choice", label: "Player Choice", color: "#4a5a2d", inputs: [{ name: "flow", type: "exec" }], outputs: [{ name: "choice1", type: "exec" }, { name: "choice2", type: "exec" }, { name: "choice3", type: "exec" }], data: [{ name: "opt1", default: "Option A" }, { name: "opt2", default: "Option B" }, { name: "opt3", default: "Option C" }] },
      { type: "condition", label: "Condition", color: "#8a7a2d", inputs: [{ name: "flow", type: "exec" }], outputs: [{ name: "yes", type: "exec" }, { name: "no", type: "exec" }], data: [{ name: "flag", default: "hasKey" }] },
      { type: "set_flag", label: "Set Flag", color: "#6a2d6a", inputs: [{ name: "flow", type: "exec" }], outputs: [{ name: "flow", type: "exec" }], data: [{ name: "flag", default: "questStarted" }, { name: "value", default: "true" }] },
      { type: "end", label: "End", color: "#555555", inputs: [{ name: "flow", type: "exec" }], outputs: [] }
    ],
    initialNodes: [
      { id: "Greet", type: "npc_say", x: 50, y: 100 },
      { id: "Ask", type: "player_choice", x: 320, y: 80 },
      { id: "Accept", type: "npc_say", x: 600, y: 40 },
      { id: "Decline", type: "end", x: 600, y: 220 }
    ],
    initialLinks: [
      { from: "Greet", fromPort: 0, to: "Ask", toPort: 0 },
      { from: "Ask", fromPort: 0, to: "Accept", toPort: 0 },
      { from: "Ask", fromPort: 1, to: "Decline", toPort: 0 }
    ],
    extraHtml: "",
    extraStyles: `
      .node-portrait { width:32px; height:32px; border-radius:50%; background:var(--vscode-badge-background); display:inline-block; vertical-align:middle; margin-right:4px; text-align:center; line-height:32px; font-size:16px; }
      .mood-indicator { display:inline-block; padding:2px 6px; border-radius:8px; font-size:10px; background:var(--vscode-badge-background); color:var(--vscode-badge-foreground); margin-left:4px; }`,
    extraScript: ""
  });
}

// ─── 3. questTreeContent — Quest tree ───────────────────────────────────────

export function questTreeContent(): EditorContent {
  return nodeBase({
    nodeTypes: [
      { type: "quest_start", label: "Quest Start", color: "#2d7a3a", inputs: [], outputs: [{ name: "next", type: "exec" }], data: [{ name: "questName", default: "Main Quest" }] },
      { type: "objective", label: "Objective", color: "#2d4a7a", inputs: [{ name: "in", type: "exec" }], outputs: [{ name: "complete", type: "exec" }, { name: "fail", type: "exec" }], data: [{ name: "description", default: "Collect 10 items" }, { name: "target", default: "10" }, { name: "type", default: "collect" }] },
      { type: "branch", label: "Branch", color: "#8a7a2d", inputs: [{ name: "in", type: "exec" }], outputs: [{ name: "a", type: "exec" }, { name: "b", type: "exec" }], data: [{ name: "condition", default: "playerLevel > 5" }] },
      { type: "reward", label: "Reward", color: "#7a7a2d", inputs: [{ name: "in", type: "exec" }], outputs: [{ name: "next", type: "exec" }], data: [{ name: "items", default: "sword" }, { name: "xp", default: "500" }, { name: "gold", default: "100" }] },
      { type: "quest_end", label: "Quest End", color: "#555555", inputs: [{ name: "in", type: "exec" }], outputs: [], data: [{ name: "status", default: "completed" }] }
    ],
    initialNodes: [
      { id: "Start", type: "quest_start", x: 50, y: 120 },
      { id: "Obj1", type: "objective", x: 300, y: 80 },
      { id: "Obj2", type: "objective", x: 300, y: 250 },
      { id: "Rew", type: "reward", x: 570, y: 80 },
      { id: "End", type: "quest_end", x: 820, y: 120 }
    ],
    initialLinks: [
      { from: "Start", fromPort: 0, to: "Obj1", toPort: 0 },
      { from: "Obj1", fromPort: 0, to: "Rew", toPort: 0 },
      { from: "Rew", fromPort: 0, to: "End", toPort: 0 }
    ]
  });
}

// ─── 4. sceneFlowContent — Scene flow diagram ──────────────────────────────

export function sceneFlowContent(): EditorContent {
  return nodeBase({
    nodeTypes: [
      { type: "scene", label: "Scene", color: "#2d5a7a", inputs: [{ name: "enter", type: "exec" }], outputs: [{ name: "exit", type: "exec" }], data: [{ name: "name", default: "GamePlay" }] },
      { type: "splash", label: "Splash", color: "#8a7a2d", inputs: [], outputs: [{ name: "done", type: "exec" }], data: [{ name: "duration", default: "2.0" }] },
      { type: "menu", label: "Menu", color: "#2d7a3a", inputs: [{ name: "enter", type: "exec" }], outputs: [{ name: "play", type: "exec" }, { name: "settings", type: "exec" }, { name: "quit", type: "exec" }], data: [{ name: "title", default: "Main Menu" }] },
      { type: "transition", label: "Transition", color: "#5a2d7a", inputs: [{ name: "from", type: "exec" }, { name: "to", type: "exec" }], outputs: [], data: [{ name: "effect", default: "fade" }, { name: "duration", default: "0.5" }] }
    ],
    initialNodes: [
      { id: "Splash", type: "splash", x: 50, y: 150 },
      { id: "MainMenu", type: "menu", x: 300, y: 120 },
      { id: "Game", type: "scene", x: 600, y: 80 },
      { id: "Settings", type: "scene", x: 600, y: 250 }
    ],
    initialLinks: [
      { from: "Splash", fromPort: 0, to: "MainMenu", toPort: 0 },
      { from: "MainMenu", fromPort: 0, to: "Game", toPort: 0 },
      { from: "MainMenu", fromPort: 1, to: "Settings", toPort: 0 }
    ]
  });
}

// ─── 5. aiBehaviorContent — Behavior tree (top-down) ────────────────────────

export function aiBehaviorContent(): EditorContent {
  return nodeBase({
    nodeTypes: [
      { type: "root", label: "Root", color: "#1a1a1a", inputs: [], outputs: [{ name: "child", type: "exec" }] },
      { type: "sequence", label: "Sequence", color: "#2d4a7a", inputs: [{ name: "parent", type: "exec" }], outputs: [{ name: "child1", type: "exec" }, { name: "child2", type: "exec" }, { name: "child3", type: "exec" }] },
      { type: "selector", label: "Selector", color: "#2d7a3a", inputs: [{ name: "parent", type: "exec" }], outputs: [{ name: "child1", type: "exec" }, { name: "child2", type: "exec" }, { name: "child3", type: "exec" }] },
      { type: "parallel", label: "Parallel", color: "#5a2d7a", inputs: [{ name: "parent", type: "exec" }], outputs: [{ name: "child1", type: "exec" }, { name: "child2", type: "exec" }] },
      { type: "decorator", label: "Decorator", color: "#7a5a2d", inputs: [{ name: "parent", type: "exec" }], outputs: [{ name: "child", type: "exec" }], data: [{ name: "mode", default: "inverter" }] },
      { type: "bt_condition", label: "Condition", color: "#5d5a2d", inputs: [{ name: "parent", type: "exec" }], outputs: [], data: [{ name: "check", default: "canSeeEnemy" }] },
      { type: "bt_action", label: "Action", color: "#7a2d2d", inputs: [{ name: "parent", type: "exec" }], outputs: [], data: [{ name: "action", default: "attack" }] }
    ],
    initialNodes: [
      { id: "Root", type: "root", x: 350, y: 30 },
      { id: "Sel1", type: "selector", x: 300, y: 180 },
      { id: "Seq1", type: "sequence", x: 100, y: 340 },
      { id: "CanSee", type: "bt_condition", x: 50, y: 500 },
      { id: "Attack", type: "bt_action", x: 250, y: 500 },
      { id: "Patrol", type: "bt_action", x: 500, y: 340 }
    ],
    initialLinks: [
      { from: "Root", fromPort: 0, to: "Sel1", toPort: 0 },
      { from: "Sel1", fromPort: 0, to: "Seq1", toPort: 0 },
      { from: "Sel1", fromPort: 1, to: "Patrol", toPort: 0 },
      { from: "Seq1", fromPort: 0, to: "CanSee", toPort: 0 },
      { from: "Seq1", fromPort: 1, to: "Attack", toPort: 0 }
    ],
    extraStyles: `
      .bt-toolbar-extra { display:inline-block; margin-left:12px; }
      .bt-toolbar-extra button { background:var(--vscode-button-secondaryBackground); color:var(--vscode-button-secondaryForeground); }
      .bt-highlight rect.node-bg { filter:brightness(1.4); }`,
    extraHtml: "",
    extraScript: `
  // Behavior tree tick simulation
  (function() {
    const toolbar = document.querySelector(".node-toolbar");
    const tickBtn = document.createElement("button");
    tickBtn.textContent = "Tick";
    tickBtn.title = "Step through tree execution";
    tickBtn.style.marginLeft = "8px";
    toolbar.appendChild(tickBtn);
    let tickIdx = 0;
    const tickOrder = ["Root","Sel1","Seq1","CanSee","Attack","Patrol"];
    tickBtn.addEventListener("click", function() {
      // Remove previous highlights
      document.querySelectorAll(".graph-node").forEach(function(g) { g.classList.remove("bt-highlight"); });
      const targetId = tickOrder[tickIdx % tickOrder.length];
      const el = document.querySelector('.graph-node[data-node-id="' + targetId + '"]');
      if (el) el.classList.add("bt-highlight");
      tickIdx++;
    });
  })();`
  });
}

// ─── 6. visualShaderContent — Shader node graph ─────────────────────────────

export function visualShaderContent(): EditorContent {
  return nodeBase({
    nodeTypes: [
      { type: "uv", label: "UV", color: "#2d5a5a", inputs: [], outputs: [{ name: "uv", type: "vec2" }] },
      { type: "time", label: "Time", color: "#2d5a5a", inputs: [], outputs: [{ name: "t", type: "float" }] },
      { type: "texture", label: "Texture", color: "#8a7a2d", inputs: [{ name: "uv", type: "vec2" }], outputs: [{ name: "color", type: "vec4" }], data: [{ name: "path", default: "diffuse.png" }] },
      { type: "shader_math", label: "Math", color: "#4a2d5d", inputs: [{ name: "a", type: "float" }, { name: "b", type: "float" }], outputs: [{ name: "result", type: "float" }], data: [{ name: "op", default: "multiply" }] },
      { type: "mix", label: "Mix", color: "#2d4a7a", inputs: [{ name: "a", type: "vec4" }, { name: "b", type: "vec4" }, { name: "t", type: "float" }], outputs: [{ name: "result", type: "vec4" }] },
      { type: "fragment_out", label: "Fragment Out", color: "#7a2d2d", inputs: [{ name: "color", type: "vec4" }], outputs: [] }
    ],
    initialNodes: [
      { id: "UV1", type: "uv", x: 50, y: 100 },
      { id: "Time1", type: "time", x: 50, y: 250 },
      { id: "Tex1", type: "texture", x: 300, y: 80 },
      { id: "Math1", type: "shader_math", x: 300, y: 250 },
      { id: "Mix1", type: "mix", x: 560, y: 120 },
      { id: "Out", type: "fragment_out", x: 820, y: 140 }
    ],
    initialLinks: [
      { from: "UV1", fromPort: 0, to: "Tex1", toPort: 0 },
      { from: "Tex1", fromPort: 0, to: "Mix1", toPort: 0 },
      { from: "Time1", fromPort: 0, to: "Math1", toPort: 0 },
      { from: "Math1", fromPort: 0, to: "Mix1", toPort: 2 },
      { from: "Mix1", fromPort: 0, to: "Out", toPort: 0 }
    ],
    extraHtml: `<div class="shader-preview" id="shaderPreview"><canvas id="shaderCanvas" width="64" height="64"></canvas><div class="preview-label">Preview</div></div>`,
    extraStyles: `
      .shader-preview { position:absolute; bottom:12px; right:240px; width:80px; background:var(--vscode-editor-background); border:1px solid var(--vscode-panel-border); border-radius:4px; padding:4px; text-align:center; z-index:10; }
      .preview-label { font-size:9px; color:var(--vscode-descriptionForeground); margin-top:2px; }
      #shaderCanvas { display:block; margin:0 auto; image-rendering:pixelated; border:1px solid var(--vscode-panel-border); }`,
    extraScript: `
  // Simple shader preview — renders gradient based on time
  (function() {
    const cvs = document.getElementById("shaderCanvas");
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    let frame = 0;
    function drawPreview() {
      const w = 64, h = 64;
      const imgData = ctx.createImageData(w, h);
      const t = frame * 0.02;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const u = x / w, v = y / h;
          imgData.data[i]   = Math.floor((Math.sin(u * 6.28 + t) * 0.5 + 0.5) * 255);
          imgData.data[i+1] = Math.floor((Math.cos(v * 6.28 + t) * 0.5 + 0.5) * 255);
          imgData.data[i+2] = Math.floor((Math.sin((u+v) * 3.14 + t) * 0.5 + 0.5) * 200);
          imgData.data[i+3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      frame++;
      requestAnimationFrame(drawPreview);
    }
    drawPreview();
  })();`
  });
}

// ─── 7. soundDspContent — Audio DSP chain ───────────────────────────────────

export function soundDspContent(): EditorContent {
  return nodeBase({
    nodeTypes: [
      { type: "audio_in", label: "Audio In", color: "#2d7a3a", inputs: [], outputs: [{ name: "audio", type: "audio" }], data: [{ name: "source", default: "mic" }] },
      { type: "eq", label: "EQ", color: "#2d4a7a", inputs: [{ name: "audio", type: "audio" }], outputs: [{ name: "audio", type: "audio" }], data: [{ name: "low", default: "0" }, { name: "mid", default: "0" }, { name: "high", default: "0" }] },
      { type: "reverb", label: "Reverb", color: "#5a2d7a", inputs: [{ name: "audio", type: "audio" }], outputs: [{ name: "audio", type: "audio" }], data: [{ name: "room", default: "0.5" }, { name: "damp", default: "0.3" }] },
      { type: "compressor", label: "Compressor", color: "#8a7a2d", inputs: [{ name: "audio", type: "audio" }], outputs: [{ name: "audio", type: "audio" }], data: [{ name: "threshold", default: "-12" }, { name: "ratio", default: "4" }] },
      { type: "delay", label: "Delay", color: "#2d5a5a", inputs: [{ name: "audio", type: "audio" }], outputs: [{ name: "audio", type: "audio" }], data: [{ name: "time", default: "0.25" }, { name: "feedback", default: "0.4" }] },
      { type: "audio_out", label: "Audio Out", color: "#7a2d2d", inputs: [{ name: "audio", type: "audio" }], outputs: [], data: [{ name: "gain", default: "1.0" }] }
    ],
    initialNodes: [
      { id: "In1", type: "audio_in", x: 50, y: 120 },
      { id: "EQ1", type: "eq", x: 280, y: 80 },
      { id: "Rev1", type: "reverb", x: 500, y: 80 },
      { id: "Comp1", type: "compressor", x: 500, y: 250 },
      { id: "Out1", type: "audio_out", x: 740, y: 140 }
    ],
    initialLinks: [
      { from: "In1", fromPort: 0, to: "EQ1", toPort: 0 },
      { from: "EQ1", fromPort: 0, to: "Rev1", toPort: 0 },
      { from: "Rev1", fromPort: 0, to: "Out1", toPort: 0 }
    ],
    extraHtml: `<div class="spectrum-analyzer" id="spectrumAnalyzer"></div>`,
    extraStyles: `
      .spectrum-analyzer { position:absolute; bottom:12px; left:200px; display:flex; gap:3px; align-items:flex-end; height:50px; padding:4px 8px; background:var(--vscode-editor-background); border:1px solid var(--vscode-panel-border); border-radius:4px; z-index:10; }
      .spectrum-bar { width:12px; background:var(--vscode-charts-green); border-radius:2px 2px 0 0; transition:height 0.1s; }`,
    extraScript: `
  // Spectrum analyzer simulation (8 bars)
  (function() {
    const container = document.getElementById("spectrumAnalyzer");
    if (!container) return;
    const bars = [];
    for (let i = 0; i < 8; i++) {
      const bar = document.createElement("div");
      bar.className = "spectrum-bar";
      bar.style.height = "4px";
      container.appendChild(bar);
      bars.push(bar);
    }
    function animBars() {
      bars.forEach(function(bar) {
        const h = 4 + Math.random() * 40;
        bar.style.height = h + "px";
      });
      setTimeout(animBars, 120);
    }
    animBars();
  })();`
  });
}

// ─── 8. worldMapContent — World map with POI nodes ──────────────────────────

export function worldMapContent(): EditorContent {
  return nodeBase({
    nodeTypes: [
      { type: "city", label: "City \ud83c\udff0", color: "#2d5a7a", inputs: [{ name: "path", type: "any" }], outputs: [{ name: "path", type: "any" }], data: [{ name: "name", default: "Capital" }, { name: "population", default: "5000" }, { name: "unlock", default: "none" }] },
      { type: "dungeon", label: "Dungeon \ud83d\udde1\ufe0f", color: "#7a2d2d", inputs: [{ name: "path", type: "any" }], outputs: [{ name: "path", type: "any" }], data: [{ name: "name", default: "Dark Cave" }, { name: "level", default: "5" }, { name: "unlock", default: "hasKey" }] },
      { type: "mountain", label: "Mountain \u26f0\ufe0f", color: "#5a5a5a", inputs: [{ name: "path", type: "any" }], outputs: [{ name: "path", type: "any" }], data: [{ name: "name", default: "Peak" }, { name: "unlock", default: "climbing" }] },
      { type: "water", label: "Water \ud83c\udf0a", color: "#2d4a8a", inputs: [{ name: "path", type: "any" }], outputs: [{ name: "path", type: "any" }], data: [{ name: "name", default: "Lake" }, { name: "unlock", default: "boat" }] }
    ],
    initialNodes: [
      { id: "Town1", type: "city", x: 100, y: 200 },
      { id: "Cave1", type: "dungeon", x: 380, y: 100 },
      { id: "Peak1", type: "mountain", x: 380, y: 320 },
      { id: "Town2", type: "city", x: 650, y: 200 },
      { id: "Lake1", type: "water", x: 200, y: 400 }
    ],
    initialLinks: [
      { from: "Town1", fromPort: 0, to: "Cave1", toPort: 0 },
      { from: "Town1", fromPort: 0, to: "Peak1", toPort: 0 },
      { from: "Cave1", fromPort: 0, to: "Town2", toPort: 0 },
      { from: "Peak1", fromPort: 0, to: "Town2", toPort: 0 },
      { from: "Town1", fromPort: 0, to: "Lake1", toPort: 0 }
    ],
    extraStyles: `
      .map-toggle { position:absolute; top:50px; right:240px; z-index:10; }
      .map-toggle button { padding:3px 8px; font-size:11px; background:var(--vscode-button-secondaryBackground); color:var(--vscode-button-secondaryForeground); border:none; border-radius:3px; cursor:pointer; }`,
    extraHtml: `<div class="map-toggle"><button id="btnToggleBg">Toggle BG</button></div>`,
    extraScript: `
  // World map background toggle
  (function() {
    const wrap = document.getElementById("canvasWrap");
    const btn = document.getElementById("btnToggleBg");
    if (!btn || !wrap) return;
    let dark = true;
    btn.addEventListener("click", function() {
      dark = !dark;
      wrap.style.background = dark ? "var(--vscode-editor-background)" : "#d4c9a8";
    });
  })();`
  });
}

// ─── 9. networkTopologyContent — Network topology ───────────────────────────

export function networkTopologyContent(): EditorContent {
  return nodeBase({
    nodeTypes: [
      { type: "server", label: "Server", color: "#2d4a7a", inputs: [], outputs: [{ name: "broadcast", type: "any" }], data: [{ name: "tickRate", default: "20" }] },
      { type: "client", label: "Client", color: "#2d7a3a", inputs: [{ name: "receive", type: "any" }], outputs: [{ name: "send", type: "any" }], data: [{ name: "latency", default: "50" }] },
      { type: "synced_entity", label: "Synced Entity", color: "#8a7a2d", inputs: [{ name: "authority", type: "any" }], outputs: [{ name: "replicate", type: "any" }], data: [{ name: "entity", default: "Player" }, { name: "interpolation", default: "linear" }] },
      { type: "rpc", label: "RPC", color: "#7a2d6a", inputs: [{ name: "caller", type: "any" }], outputs: [{ name: "target", type: "any" }], data: [{ name: "name", default: "fireWeapon" }, { name: "reliable", default: "true" }] }
    ],
    initialNodes: [
      { id: "Srv", type: "server", x: 350, y: 50 },
      { id: "Client1", type: "client", x: 100, y: 250 },
      { id: "Client2", type: "client", x: 600, y: 250 },
      { id: "Entity1", type: "synced_entity", x: 350, y: 250 },
      { id: "RPC1", type: "rpc", x: 350, y: 420 }
    ],
    initialLinks: [
      { from: "Srv", fromPort: 0, to: "Client1", toPort: 0 },
      { from: "Srv", fromPort: 0, to: "Client2", toPort: 0 },
      { from: "Srv", fromPort: 0, to: "Entity1", toPort: 0 },
      { from: "Client1", fromPort: 0, to: "RPC1", toPort: 0 },
      { from: "Entity1", fromPort: 0, to: "Client1", toPort: 0 },
      { from: "Entity1", fromPort: 0, to: "Client2", toPort: 0 }
    ],
    extraHtml: `<div class="net-stats" id="netStats"><span class="net-bw">Est. bandwidth: <strong id="bwValue">0</strong> kbps</span></div>`,
    extraStyles: `
      .net-stats { position:absolute; bottom:12px; left:200px; padding:6px 12px; background:var(--vscode-editor-background); border:1px solid var(--vscode-panel-border); border-radius:4px; font-size:11px; color:var(--vscode-editor-foreground); z-index:10; }
      .net-bw strong { color:var(--vscode-charts-yellow); }`,
    extraScript: `
  // Bandwidth estimator: sum links * base rate
  (function() {
    const bwEl = document.getElementById("bwValue");
    if (!bwEl) return;
    function estimate() {
      // Each link = ~2 kbps base, synced entities = ~5 kbps, RPCs = ~0.5 kbps per call
      const linkCount = document.querySelectorAll(".link-path").length;
      const entityCount = document.querySelectorAll('.graph-node[data-node-id]').length;
      const bw = linkCount * 2.1 + entityCount * 1.5;
      bwEl.textContent = bw.toFixed(1);
    }
    estimate();
    // Re-estimate periodically
    setInterval(estimate, 1000);
  })();`
  });
}
