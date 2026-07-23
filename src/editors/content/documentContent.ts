import type { EditorContent } from "./types.js";

// ─── 1. Entity Editor ────────────────────────────────────────────────────────

export function entityContent(): EditorContent {
  const workspaceHtml = `
<div class="entity-editor">
  <div class="entity-left">
    <h3>Components</h3>
    <div class="component-list">
      <label class="component-toggle"><input type="checkbox" data-comp="transform" checked /><span>Transform</span></label>
      <label class="component-toggle"><input type="checkbox" data-comp="sprite" /><span>Sprite</span></label>
      <label class="component-toggle"><input type="checkbox" data-comp="rigidbody" /><span>RigidBody</span></label>
      <label class="component-toggle"><input type="checkbox" data-comp="collider" /><span>Collider</span></label>
      <label class="component-toggle"><input type="checkbox" data-comp="script" /><span>Script</span></label>
    </div>
    <div class="add-component-wrap">
      <select id="addComponentSelect">
        <option value="">+ Add Component</option>
        <option value="transform">Transform</option>
        <option value="sprite">Sprite</option>
        <option value="rigidbody">RigidBody</option>
        <option value="collider">Collider</option>
        <option value="script">Script</option>
      </select>
    </div>
  </div>
  <div class="entity-center">
    <div class="comp-section" data-section="transform">
      <h4>Transform</h4>
      <div class="field-row"><label>X</label><input type="number" data-field="transform.x" value="0" /></div>
      <div class="field-row"><label>Y</label><input type="number" data-field="transform.y" value="0" /></div>
      <div class="field-row"><label>Rotation</label><input type="number" data-field="transform.rotation" min="0" max="360" value="0" /></div>
      <div class="field-row"><label>Scale X</label><input type="number" data-field="transform.scaleX" step="0.1" value="1" /></div>
      <div class="field-row"><label>Scale Y</label><input type="number" data-field="transform.scaleY" step="0.1" value="1" /></div>
    </div>
    <div class="comp-section hidden" data-section="sprite">
      <h4>Sprite</h4>
      <div class="field-row"><label>Path</label><input type="text" data-field="sprite.path" placeholder="sprites/player.png" /></div>
      <div class="field-row"><label>Width</label><input type="number" data-field="sprite.width" value="32" /></div>
      <div class="field-row"><label>Height</label><input type="number" data-field="sprite.height" value="32" /></div>
      <div class="field-row"><label>Anchor X</label><input type="number" data-field="sprite.anchorX" step="0.1" min="0" max="1" value="0.5" /></div>
      <div class="field-row"><label>Anchor Y</label><input type="number" data-field="sprite.anchorY" step="0.1" min="0" max="1" value="0.5" /></div>
      <div class="field-row"><label>Tint</label><input type="color" data-field="sprite.tint" value="#ffffff" /></div>
    </div>
    <div class="comp-section hidden" data-section="rigidbody">
      <h4>RigidBody</h4>
      <div class="field-row"><label>Type</label><select data-field="rigidbody.type"><option value="dynamic">Dynamic</option><option value="static">Static</option><option value="kinematic">Kinematic</option></select></div>
      <div class="field-row"><label>Mass</label><input type="number" data-field="rigidbody.mass" step="0.1" value="1" /></div>
      <div class="field-row"><label>Gravity Scale</label><input type="number" data-field="rigidbody.gravityScale" step="0.1" value="1" /></div>
      <div class="field-row"><label>Linear Damping</label><input type="number" data-field="rigidbody.linearDamping" step="0.01" value="0" /></div>
    </div>
    <div class="comp-section hidden" data-section="collider">
      <h4>Collider</h4>
      <div class="field-row"><label>Shape</label><select data-field="collider.shape"><option value="rect">Rect</option><option value="circle">Circle</option><option value="polygon">Polygon</option></select></div>
      <div class="field-row"><label>Width</label><input type="number" data-field="collider.width" step="0.1" value="32" /></div>
      <div class="field-row"><label>Height</label><input type="number" data-field="collider.height" step="0.1" value="32" /></div>
      <div class="field-row"><label>Radius</label><input type="number" data-field="collider.radius" step="0.1" value="16" /></div>
      <div class="field-row"><label>Is Trigger</label><input type="checkbox" data-field="collider.isTrigger" /></div>
    </div>
    <div class="comp-section hidden" data-section="script">
      <h4>Script</h4>
      <div class="field-row"><label>Path</label><input type="text" data-field="script.path" placeholder="scripts/enemy.lua" /></div>
      <div class="field-row"><label>Args</label><textarea data-field="script.args" rows="4" placeholder="{ speed = 100, health = 3 }"></textarea></div>
    </div>
    <div class="export-bar">
      <button id="exportLuaBtn">Export Lua</button>
      <button id="exportJsonBtn">Export JSON</button>
    </div>
  </div>
  <div class="entity-right">
    <h4>Preview</h4>
    <canvas id="entityPreview" width="200" height="200"></canvas>
  </div>
</div>`;

  const styles = `
.entity-editor { display:flex; height:100%; gap:0; }
.entity-left { width:240px; min-width:240px; border-right:1px solid var(--vscode-panel-border); padding:12px; overflow-y:auto; }
.entity-left h3 { margin:0 0 10px; font-size:13px; text-transform:uppercase; color:var(--vscode-descriptionForeground); }
.component-list { display:flex; flex-direction:column; gap:4px; }
.component-toggle { display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:4px; cursor:pointer; font-size:13px; color:var(--vscode-editor-foreground); }
.component-toggle:hover { background:var(--vscode-list-hoverBackground); }
.component-toggle input[type="checkbox"] { accent-color:var(--vscode-focusBorder); }
.add-component-wrap { margin-top:16px; }
.add-component-wrap select { width:100%; padding:6px 8px; background:var(--vscode-dropdown-background); color:var(--vscode-dropdown-foreground); border:1px solid var(--vscode-dropdown-border); border-radius:4px; font-size:12px; }
.entity-center { flex:1; padding:16px; overflow-y:auto; }
.comp-section { margin-bottom:20px; padding:12px; background:var(--vscode-editor-background); border:1px solid var(--vscode-panel-border); border-radius:6px; }
.comp-section.hidden { display:none; }
.comp-section h4 { margin:0 0 12px; font-size:13px; color:var(--vscode-editor-foreground); border-bottom:1px solid var(--vscode-panel-border); padding-bottom:6px; }
.field-row { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
.field-row label { width:100px; font-size:12px; color:var(--vscode-descriptionForeground); text-align:right; }
.field-row input[type="number"], .field-row input[type="text"], .field-row select { flex:1; padding:4px 8px; background:var(--vscode-input-background); color:var(--vscode-input-foreground); border:1px solid var(--vscode-input-border); border-radius:3px; font-size:12px; }
.field-row input[type="color"] { width:40px; height:28px; border:1px solid var(--vscode-input-border); border-radius:3px; padding:2px; background:var(--vscode-input-background); }
.field-row input[type="checkbox"] { accent-color:var(--vscode-focusBorder); }
.field-row textarea { flex:1; padding:4px 8px; background:var(--vscode-input-background); color:var(--vscode-input-foreground); border:1px solid var(--vscode-input-border); border-radius:3px; font-family:var(--vscode-editor-font-family); font-size:12px; resize:vertical; }
.export-bar { display:flex; gap:8px; margin-top:16px; padding-top:12px; border-top:1px solid var(--vscode-panel-border); }
.export-bar button { padding:6px 14px; background:var(--vscode-button-background); color:var(--vscode-button-foreground); border:none; border-radius:4px; font-size:12px; cursor:pointer; }
.export-bar button:hover { background:var(--vscode-button-hoverBackground); }
.entity-right { width:200px; min-width:200px; border-left:1px solid var(--vscode-panel-border); padding:12px; display:flex; flex-direction:column; align-items:center; }
.entity-right h4 { margin:0 0 10px; font-size:12px; color:var(--vscode-descriptionForeground); text-transform:uppercase; }
#entityPreview { background:var(--vscode-editor-background); border:1px solid var(--vscode-panel-border); border-radius:4px; }
`;

  const script = `
(function() {
  const vscode = acquireVsCodeApi();
  const checkboxes = document.querySelectorAll('.component-toggle input[type="checkbox"]');
  const sections = document.querySelectorAll('.comp-section');
  const addSelect = document.getElementById('addComponentSelect');
  const canvas = document.getElementById('entityPreview');
  const ctx = canvas.getContext('2d');

  function syncVisibility() {
    checkboxes.forEach(cb => {
      const comp = cb.getAttribute('data-comp');
      const sec = document.querySelector('[data-section="' + comp + '"]');
      if (sec) sec.classList.toggle('hidden', !cb.checked);
    });
    drawPreview();
  }

  checkboxes.forEach(cb => cb.addEventListener('change', syncVisibility));

  addSelect.addEventListener('change', function() {
    const val = this.value;
    if (!val) return;
    const cb = document.querySelector('input[data-comp="' + val + '"]');
    if (cb && !cb.checked) { cb.checked = true; syncVisibility(); }
    this.value = '';
  });

  function getField(name) {
    const el = document.querySelector('[data-field="' + name + '"]');
    if (!el) return null;
    if (el.type === 'checkbox') return el.checked;
    if (el.type === 'number') return parseFloat(el.value) || 0;
    return el.value;
  }

  function drawPreview() {
    ctx.clearRect(0, 0, 200, 200);
    const cx = 100, cy = 100;

    if (document.querySelector('input[data-comp="collider"]').checked) {
      ctx.strokeStyle = '#4488ff';
      ctx.lineWidth = 2;
      const shape = getField('collider.shape');
      if (shape === 'circle') {
        const r = Math.min(getField('collider.radius') || 16, 80);
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      } else {
        const w = Math.min(getField('collider.width') || 32, 160);
        const h = Math.min(getField('collider.height') || 32, 160);
        ctx.strokeRect(cx - w/2, cy - h/2, w, h);
      }
    }

    if (document.querySelector('input[data-comp="sprite"]').checked) {
      ctx.strokeStyle = '#44cc44';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      const sw = Math.min(getField('sprite.width') || 32, 160);
      const sh = Math.min(getField('sprite.height') || 32, 160);
      ctx.strokeRect(cx - sw/2, cy - sh/2, sw, sh);
      ctx.setLineDash([]);
    }

    ctx.fillStyle = '#ff4444';
    ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
  }

  document.querySelectorAll('.field-row input, .field-row select, .field-row textarea').forEach(el => {
    el.addEventListener('input', drawPreview);
  });

  function collectEntity() {
    const entity = {};
    checkboxes.forEach(cb => {
      if (!cb.checked) return;
      const comp = cb.getAttribute('data-comp');
      entity[comp] = {};
      document.querySelectorAll('[data-field^="' + comp + '."]').forEach(f => {
        const key = f.getAttribute('data-field').split('.')[1];
        if (f.type === 'checkbox') entity[comp][key] = f.checked;
        else if (f.type === 'number') entity[comp][key] = parseFloat(f.value) || 0;
        else entity[comp][key] = f.value;
      });
    });
    return entity;
  }

  function toLua(obj, indent) {
    indent = indent || 0;
    const pad = '  '.repeat(indent);
    const pad1 = '  '.repeat(indent + 1);
    if (typeof obj !== 'object' || obj === null) {
      if (typeof obj === 'string') return '"' + obj.replace(/"/g, '\\\\"') + '"';
      if (typeof obj === 'boolean') return obj ? 'true' : 'false';
      return String(obj);
    }
    const lines = ['{'];
    for (const [k, v] of Object.entries(obj)) {
      lines.push(pad1 + k + ' = ' + toLua(v, indent + 1) + ',');
    }
    lines.push(pad + '}');
    return lines.join('\\n');
  }

  document.getElementById('exportLuaBtn').addEventListener('click', function() {
    const entity = collectEntity();
    const lua = 'return ' + toLua(entity, 0);
    vscode.postMessage({ type: 'export', format: 'lua', content: lua });
  });

  document.getElementById('exportJsonBtn').addEventListener('click', function() {
    const entity = collectEntity();
    const json = JSON.stringify(entity, null, 2);
    vscode.postMessage({ type: 'export', format: 'json', content: json });
  });

  syncVisibility();
})();
`;

  return { workspaceHtml, styles, script };
}

// ─── 2. GUI Widget Editor ────────────────────────────────────────────────────

export function guiWidgetContent(): EditorContent {
  const workspaceHtml = `
<div class="widget-editor">
  <div class="widget-toolbox">
    <h3>Widgets</h3>
    <div class="toolbox-items">
      <div class="toolbox-item" draggable="true" data-widget="button">Button</div>
      <div class="toolbox-item" draggable="true" data-widget="label">Label</div>
      <div class="toolbox-item" draggable="true" data-widget="panel">Panel</div>
      <div class="toolbox-item" draggable="true" data-widget="image">Image</div>
      <div class="toolbox-item" draggable="true" data-widget="slider">Slider</div>
      <div class="toolbox-item" draggable="true" data-widget="textbox">TextBox</div>
      <div class="toolbox-item" draggable="true" data-widget="progressbar">ProgressBar</div>
      <div class="toolbox-item" draggable="true" data-widget="checkbox">Checkbox</div>
    </div>
    <div class="hierarchy-panel">
      <h3>Hierarchy</h3>
      <div id="hierarchyTree"></div>
    </div>
  </div>
  <div class="widget-canvas-wrap">
    <div id="widgetCanvas" class="widget-canvas"></div>
  </div>
  <div class="widget-props">
    <h3>Properties</h3>
    <div id="propsPanel" class="props-fields">
      <p class="no-selection">Select a widget</p>
    </div>
    <div class="export-bar">
      <button id="exportHtmlBtn">Export HTML</button>
      <button id="exportWidgetJsonBtn">Export JSON</button>
    </div>
  </div>
</div>`;

  const styles = `
.widget-editor { display:flex; height:100%; }
.widget-toolbox { width:160px; min-width:160px; border-right:1px solid var(--vscode-panel-border); padding:10px; overflow-y:auto; display:flex; flex-direction:column; }
.widget-toolbox h3 { margin:0 0 8px; font-size:12px; text-transform:uppercase; color:var(--vscode-descriptionForeground); }
.toolbox-items { display:flex; flex-direction:column; gap:4px; margin-bottom:16px; }
.toolbox-item { padding:6px 10px; background:var(--vscode-badge-background); color:var(--vscode-badge-foreground); border-radius:4px; font-size:12px; cursor:grab; user-select:none; text-align:center; }
.toolbox-item:hover { opacity:0.85; }
.hierarchy-panel { flex:1; overflow-y:auto; }
.hierarchy-panel h3 { margin:12px 0 6px; font-size:12px; text-transform:uppercase; color:var(--vscode-descriptionForeground); }
#hierarchyTree { font-size:12px; color:var(--vscode-editor-foreground); }
.hier-item { padding:3px 6px; cursor:pointer; border-radius:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.hier-item:hover { background:var(--vscode-list-hoverBackground); }
.hier-item.selected { background:var(--vscode-list-activeSelectionBackground); color:var(--vscode-list-activeSelectionForeground); }
.widget-canvas-wrap { flex:1; display:flex; align-items:center; justify-content:center; padding:20px; background:var(--vscode-editor-background); }
.widget-canvas { width:600px; height:400px; position:relative; background:#1e1e2e; border:1px solid var(--vscode-panel-border); border-radius:4px; overflow:hidden; }
.canvas-widget { position:absolute; display:flex; align-items:center; justify-content:center; border:1px solid transparent; font-size:12px; color:var(--vscode-editor-foreground); box-sizing:border-box; cursor:move; user-select:none; min-width:20px; min-height:20px; }
.canvas-widget.selected { border-color:var(--vscode-focusBorder); }
.canvas-widget .resize-handle { position:absolute; width:8px; height:8px; background:var(--vscode-focusBorder); border-radius:2px; display:none; }
.canvas-widget.selected .resize-handle { display:block; }
.resize-handle.tl { top:-4px; left:-4px; cursor:nw-resize; }
.resize-handle.tr { top:-4px; right:-4px; cursor:ne-resize; }
.resize-handle.bl { bottom:-4px; left:-4px; cursor:sw-resize; }
.resize-handle.br { bottom:-4px; right:-4px; cursor:se-resize; }
.widget-props { width:200px; min-width:200px; border-left:1px solid var(--vscode-panel-border); padding:10px; overflow-y:auto; display:flex; flex-direction:column; }
.widget-props h3 { margin:0 0 8px; font-size:12px; text-transform:uppercase; color:var(--vscode-descriptionForeground); }
.props-fields { flex:1; overflow-y:auto; }
.props-fields .no-selection { font-size:12px; color:var(--vscode-descriptionForeground); font-style:italic; }
.prop-row { display:flex; flex-direction:column; gap:2px; margin-bottom:8px; }
.prop-row label { font-size:11px; color:var(--vscode-descriptionForeground); }
.prop-row input, .prop-row select { padding:3px 6px; background:var(--vscode-input-background); color:var(--vscode-input-foreground); border:1px solid var(--vscode-input-border); border-radius:3px; font-size:12px; }
.widget-props .export-bar { display:flex; gap:6px; padding-top:10px; border-top:1px solid var(--vscode-panel-border); }
.widget-props .export-bar button { flex:1; padding:5px 6px; background:var(--vscode-button-background); color:var(--vscode-button-foreground); border:none; border-radius:4px; font-size:11px; cursor:pointer; }
.widget-props .export-bar button:hover { background:var(--vscode-button-hoverBackground); }
`;

  const script = `
(function() {
  const vscode = acquireVsCodeApi();
  const canvas = document.getElementById('widgetCanvas');
  const propsPanel = document.getElementById('propsPanel');
  const hierarchyTree = document.getElementById('hierarchyTree');
  let widgets = [];
  let selectedId = null;
  let nextId = 1;
  let dragInfo = null;

  const widgetDefaults = {
    button: { w:100, h:32, text:'Button', bg:'#3c3c5c', radius:4 },
    label: { w:80, h:24, text:'Label', bg:'transparent', radius:0 },
    panel: { w:150, h:100, text:'', bg:'#2a2a3a', radius:6 },
    image: { w:64, h:64, text:'[img]', bg:'#333344', radius:2 },
    slider: { w:120, h:20, text:'', bg:'#444466', radius:10 },
    textbox: { w:120, h:28, text:'', bg:'#1e1e2e', radius:3 },
    progressbar: { w:140, h:16, text:'', bg:'#2a2a4a', radius:8 },
    checkbox: { w:24, h:24, text:'✓', bg:'#3c3c5c', radius:3 }
  };

  function createWidgetEl(w) {
    const el = document.createElement('div');
    el.className = 'canvas-widget';
    el.dataset.id = w.id;
    el.style.left = w.x + 'px';
    el.style.top = w.y + 'px';
    el.style.width = w.w + 'px';
    el.style.height = w.h + 'px';
    el.style.background = w.bg;
    el.style.borderRadius = w.radius + 'px';
    el.style.fontSize = w.fontSize + 'px';
    el.textContent = w.text;
    el.innerHTML += '<div class="resize-handle tl"></div><div class="resize-handle tr"></div><div class="resize-handle bl"></div><div class="resize-handle br"></div>';
    el.addEventListener('mousedown', function(e) {
      if (e.target.classList.contains('resize-handle')) { startResize(e, w, e.target); return; }
      selectWidget(w.id);
      startDrag(e, w);
    });
    return el;
  }

  function addWidget(type, x, y) {
    const def = widgetDefaults[type] || widgetDefaults.button;
    const w = { id: nextId++, type: type, x: x, y: y, w: def.w, h: def.h, text: def.text, bg: def.bg, radius: def.radius, fontSize: 12, anchor: 'top-left' };
    widgets.push(w);
    canvas.appendChild(createWidgetEl(w));
    selectWidget(w.id);
    refreshHierarchy();
  }

  function selectWidget(id) {
    selectedId = id;
    document.querySelectorAll('.canvas-widget').forEach(el => el.classList.toggle('selected', el.dataset.id == id));
    refreshProps();
    refreshHierarchy();
  }

  function startDrag(e, w) {
    const startX = e.clientX, startY = e.clientY;
    const origX = w.x, origY = w.y;
    function move(ev) { w.x = origX + (ev.clientX - startX); w.y = origY + (ev.clientY - startY); updateWidgetEl(w); }
    function up() { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); refreshProps(); }
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  }

  function startResize(e, w, handle) {
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const origW = w.w, origH = w.h, origX = w.x, origY = w.y;
    const corner = handle.classList.contains('tl') ? 'tl' : handle.classList.contains('tr') ? 'tr' : handle.classList.contains('bl') ? 'bl' : 'br';
    function move(ev) {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      if (corner === 'br') { w.w = Math.max(20, origW + dx); w.h = Math.max(20, origH + dy); }
      else if (corner === 'tr') { w.w = Math.max(20, origW + dx); w.h = Math.max(20, origH - dy); w.y = origY + dy; }
      else if (corner === 'bl') { w.w = Math.max(20, origW - dx); w.x = origX + dx; w.h = Math.max(20, origH + dy); }
      else { w.w = Math.max(20, origW - dx); w.h = Math.max(20, origH - dy); w.x = origX + dx; w.y = origY + dy; }
      updateWidgetEl(w);
    }
    function up() { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); refreshProps(); }
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    selectWidget(w.id);
  }

  function updateWidgetEl(w) {
    const el = canvas.querySelector('[data-id="' + w.id + '"]');
    if (!el) return;
    el.style.left = w.x + 'px'; el.style.top = w.y + 'px';
    el.style.width = w.w + 'px'; el.style.height = w.h + 'px';
    el.style.background = w.bg; el.style.borderRadius = w.radius + 'px';
    el.style.fontSize = w.fontSize + 'px';
    el.childNodes[0].textContent = w.text;
  }

  function refreshProps() {
    const w = widgets.find(w => w.id === selectedId);
    if (!w) { propsPanel.innerHTML = '<p class="no-selection">Select a widget</p>'; return; }
    propsPanel.innerHTML = [
      propRow('X', 'number', 'x', w.x),
      propRow('Y', 'number', 'y', w.y),
      propRow('Width', 'number', 'w', w.w),
      propRow('Height', 'number', 'h', w.h),
      propRow('Anchor', 'select', 'anchor', w.anchor, ['top-left','top-center','top-right','center-left','center','center-right','bottom-left','bottom-center','bottom-right']),
      propRow('Text', 'text', 'text', w.text),
      propRow('Font Size', 'number', 'fontSize', w.fontSize),
      propRow('BG Color', 'color', 'bg', w.bg),
      propRow('Radius', 'number', 'radius', w.radius)
    ].join('');
    propsPanel.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('input', function() {
        const key = this.dataset.key;
        if (this.type === 'number') w[key] = parseFloat(this.value) || 0;
        else w[key] = this.value;
        updateWidgetEl(w);
      });
    });
  }

  function propRow(label, type, key, value, options) {
    if (type === 'select') {
      const opts = options.map(o => '<option value="' + o + '"' + (o === value ? ' selected' : '') + '>' + o + '</option>').join('');
      return '<div class="prop-row"><label>' + label + '</label><select data-key="' + key + '">' + opts + '</select></div>';
    }
    return '<div class="prop-row"><label>' + label + '</label><input type="' + type + '" data-key="' + key + '" value="' + (value || '') + '" /></div>';
  }

  function refreshHierarchy() {
    hierarchyTree.innerHTML = widgets.map(w =>
      '<div class="hier-item' + (w.id === selectedId ? ' selected' : '') + '" data-id="' + w.id + '">' + w.type + ' #' + w.id + '</div>'
    ).join('');
    hierarchyTree.querySelectorAll('.hier-item').forEach(el => {
      el.addEventListener('click', function() { selectWidget(parseInt(this.dataset.id)); });
    });
  }

  // Toolbox drag and drop
  document.querySelectorAll('.toolbox-item').forEach(item => {
    item.addEventListener('dragstart', function(e) { e.dataTransfer.setData('text/plain', this.dataset.widget); });
  });
  canvas.addEventListener('dragover', function(e) { e.preventDefault(); });
  canvas.addEventListener('drop', function(e) {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    if (!type) return;
    const rect = canvas.getBoundingClientRect();
    addWidget(type, e.clientX - rect.left - 40, e.clientY - rect.top - 16);
  });

  // Delete key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Delete' && selectedId !== null) {
      widgets = widgets.filter(w => w.id !== selectedId);
      const el = canvas.querySelector('[data-id="' + selectedId + '"]');
      if (el) el.remove();
      selectedId = null;
      refreshProps();
      refreshHierarchy();
    }
  });

  // Deselect on canvas click
  canvas.addEventListener('mousedown', function(e) {
    if (e.target === canvas) { selectedId = null; document.querySelectorAll('.canvas-widget').forEach(el => el.classList.remove('selected')); refreshProps(); refreshHierarchy(); }
  });

  // Export
  document.getElementById('exportHtmlBtn').addEventListener('click', function() {
    const lines = widgets.map(w => '<div style="position:absolute;left:' + w.x + 'px;top:' + w.y + 'px;width:' + w.w + 'px;height:' + w.h + 'px;background:' + w.bg + ';border-radius:' + w.radius + 'px;font-size:' + w.fontSize + 'px;">' + w.text + '</div>');
    vscode.postMessage({ type:'export', format:'html', content:'<div style="position:relative;width:600px;height:400px;">\\n' + lines.join('\\n') + '\\n</div>' });
  });
  document.getElementById('exportWidgetJsonBtn').addEventListener('click', function() {
    vscode.postMessage({ type:'export', format:'json', content: JSON.stringify(widgets, null, 2) });
  });
})();
`;

  return { workspaceHtml, styles, script };
}

// ─── 3. GUI Theme Editor ─────────────────────────────────────────────────────

export function guiThemeContent(): EditorContent {
  const components = ["Button", "Slider", "TextBox", "Panel", "Label", "Checkbox"];
  const states = ["Normal", "Hover", "Pressed", "Disabled", "Focused"];

  const componentTabs = components
    .map((c, i) => `<button class="comp-tab${i === 0 ? " active" : ""}" data-comp="${c.toLowerCase()}">${c}</button>`)
    .join("");
  const stateTabs = states
    .map((s, i) => `<button class="state-tab${i === 0 ? " active" : ""}" data-state="${s.toLowerCase()}">${s}</button>`)
    .join("");

  const workspaceHtml = `
<div class="theme-editor">
  <div class="theme-tabs">
    <div class="comp-tabs">${componentTabs}</div>
    <div class="state-tabs">${stateTabs}</div>
  </div>
  <div class="theme-body">
    <div class="theme-left">
      <h3>Style Editor</h3>
      <div class="style-fields">
        <div class="style-group">
          <label>Background</label>
          <input type="color" id="themeBg" value="#3c3c5c" />
        </div>
        <div class="style-group">
          <label>Border Width</label>
          <input type="number" id="themeBorderW" value="1" min="0" max="10" />
        </div>
        <div class="style-group">
          <label>Border Color</label>
          <input type="color" id="themeBorderC" value="#555577" />
        </div>
        <div class="style-group">
          <label>Border Style</label>
          <select id="themeBorderS"><option value="solid">Solid</option><option value="dashed">Dashed</option><option value="none">None</option></select>
        </div>
        <div class="style-group">
          <label>Border Radius</label>
          <input type="range" id="themeRadius" min="0" max="20" value="4" /><span id="radiusVal">4px</span>
        </div>
        <div class="style-group">
          <label>Box Shadow X</label>
          <input type="number" id="themeShadowX" value="0" min="-20" max="20" />
        </div>
        <div class="style-group">
          <label>Box Shadow Y</label>
          <input type="number" id="themeShadowY" value="2" min="-20" max="20" />
        </div>
        <div class="style-group">
          <label>Box Shadow Blur</label>
          <input type="number" id="themeShadowBlur" value="4" min="0" max="40" />
        </div>
        <div class="style-group">
          <label>Shadow Color</label>
          <input type="color" id="themeShadowC" value="#000000" />
        </div>
        <div class="style-group">
          <label>Foreground</label>
          <input type="color" id="themeFg" value="#ffffff" />
        </div>
        <div class="style-group">
          <label>Font Size</label>
          <input type="range" id="themeFontSize" min="10" max="24" value="13" /><span id="fontSizeVal">13px</span>
        </div>
        <div class="style-group">
          <label>Padding Top</label>
          <input type="number" id="themePadT" value="6" min="0" max="40" />
        </div>
        <div class="style-group">
          <label>Padding Right</label>
          <input type="number" id="themePadR" value="12" min="0" max="40" />
        </div>
        <div class="style-group">
          <label>Padding Bottom</label>
          <input type="number" id="themePadB" value="6" min="0" max="40" />
        </div>
        <div class="style-group">
          <label>Padding Left</label>
          <input type="number" id="themePadL" value="12" min="0" max="40" />
        </div>
      </div>
      <div class="export-bar"><button id="exportThemeCss">Export CSS</button></div>
    </div>
    <div class="theme-right">
      <h3>Preview Gallery</h3>
      <div id="themeGallery" class="theme-gallery"></div>
    </div>
  </div>
</div>`;

  const styles = `
.theme-editor { display:flex; flex-direction:column; height:100%; }
.theme-tabs { border-bottom:1px solid var(--vscode-panel-border); padding:8px 12px 0; }
.comp-tabs, .state-tabs { display:flex; gap:4px; margin-bottom:6px; }
.comp-tab, .state-tab { padding:5px 12px; background:transparent; color:var(--vscode-editor-foreground); border:1px solid var(--vscode-panel-border); border-bottom:none; border-radius:4px 4px 0 0; font-size:12px; cursor:pointer; }
.comp-tab.active, .state-tab.active { background:var(--vscode-editor-background); border-color:var(--vscode-focusBorder); color:var(--vscode-focusBorder); }
.theme-body { display:flex; flex:1; overflow:hidden; }
.theme-left { width:280px; min-width:280px; border-right:1px solid var(--vscode-panel-border); padding:12px; overflow-y:auto; }
.theme-left h3 { margin:0 0 12px; font-size:12px; text-transform:uppercase; color:var(--vscode-descriptionForeground); }
.style-fields { display:flex; flex-direction:column; gap:8px; }
.style-group { display:flex; align-items:center; gap:8px; }
.style-group label { width:110px; font-size:11px; color:var(--vscode-descriptionForeground); }
.style-group input[type="color"] { width:36px; height:24px; border:1px solid var(--vscode-input-border); border-radius:3px; padding:1px; background:var(--vscode-input-background); }
.style-group input[type="number"] { width:60px; padding:3px 6px; background:var(--vscode-input-background); color:var(--vscode-input-foreground); border:1px solid var(--vscode-input-border); border-radius:3px; font-size:12px; }
.style-group input[type="range"] { flex:1; }
.style-group select { flex:1; padding:3px 6px; background:var(--vscode-dropdown-background); color:var(--vscode-dropdown-foreground); border:1px solid var(--vscode-dropdown-border); border-radius:3px; font-size:12px; }
.style-group span { font-size:11px; color:var(--vscode-descriptionForeground); min-width:30px; }
.theme-left .export-bar { margin-top:16px; }
.theme-left .export-bar button { width:100%; padding:6px; background:var(--vscode-button-background); color:var(--vscode-button-foreground); border:none; border-radius:4px; font-size:12px; cursor:pointer; }
.theme-left .export-bar button:hover { background:var(--vscode-button-hoverBackground); }
.theme-right { flex:1; padding:16px; overflow-y:auto; }
.theme-right h3 { margin:0 0 12px; font-size:12px; text-transform:uppercase; color:var(--vscode-descriptionForeground); }
.theme-gallery { display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:16px; }
.gallery-card { background:var(--vscode-editor-background); border:1px solid var(--vscode-panel-border); border-radius:6px; padding:12px; }
.gallery-card h4 { margin:0 0 8px; font-size:12px; color:var(--vscode-descriptionForeground); }
.gallery-states { display:flex; gap:8px; flex-wrap:wrap; }
.gallery-states .preview-item { display:flex; flex-direction:column; align-items:center; gap:4px; }
.gallery-states .preview-item span { font-size:10px; color:var(--vscode-descriptionForeground); }
.preview-widget { display:inline-flex; align-items:center; justify-content:center; transition:all 0.15s; }
`;

  const script = `
(function() {
  const vscode = acquireVsCodeApi();
  const components = ['button','slider','textbox','panel','label','checkbox'];
  const states = ['normal','hover','pressed','disabled','focused'];
  let currentComp = 'button';
  let currentState = 'normal';
  const themeData = {};
  components.forEach(c => { themeData[c] = {}; states.forEach(s => { themeData[c][s] = { bg:'#3c3c5c', borderW:1, borderC:'#555577', borderS:'solid', radius:4, shadowX:0, shadowY:2, shadowBlur:4, shadowC:'#000000', fg:'#ffffff', fontSize:13, padT:6, padR:12, padB:6, padL:12 }; }); });

  function readFields() {
    return {
      bg: document.getElementById('themeBg').value,
      borderW: parseInt(document.getElementById('themeBorderW').value) || 0,
      borderC: document.getElementById('themeBorderC').value,
      borderS: document.getElementById('themeBorderS').value,
      radius: parseInt(document.getElementById('themeRadius').value) || 0,
      shadowX: parseInt(document.getElementById('themeShadowX').value) || 0,
      shadowY: parseInt(document.getElementById('themeShadowY').value) || 0,
      shadowBlur: parseInt(document.getElementById('themeShadowBlur').value) || 0,
      shadowC: document.getElementById('themeShadowC').value,
      fg: document.getElementById('themeFg').value,
      fontSize: parseInt(document.getElementById('themeFontSize').value) || 13,
      padT: parseInt(document.getElementById('themePadT').value) || 0,
      padR: parseInt(document.getElementById('themePadR').value) || 0,
      padB: parseInt(document.getElementById('themePadB').value) || 0,
      padL: parseInt(document.getElementById('themePadL').value) || 0
    };
  }

  function writeFields(d) {
    document.getElementById('themeBg').value = d.bg;
    document.getElementById('themeBorderW').value = d.borderW;
    document.getElementById('themeBorderC').value = d.borderC;
    document.getElementById('themeBorderS').value = d.borderS;
    document.getElementById('themeRadius').value = d.radius;
    document.getElementById('radiusVal').textContent = d.radius + 'px';
    document.getElementById('themeShadowX').value = d.shadowX;
    document.getElementById('themeShadowY').value = d.shadowY;
    document.getElementById('themeShadowBlur').value = d.shadowBlur;
    document.getElementById('themeShadowC').value = d.shadowC;
    document.getElementById('themeFg').value = d.fg;
    document.getElementById('themeFontSize').value = d.fontSize;
    document.getElementById('fontSizeVal').textContent = d.fontSize + 'px';
    document.getElementById('themePadT').value = d.padT;
    document.getElementById('themePadR').value = d.padR;
    document.getElementById('themePadB').value = d.padB;
    document.getElementById('themePadL').value = d.padL;
  }

  function styleStr(d) {
    return 'background:' + d.bg + ';color:' + d.fg + ';border:' + d.borderW + 'px ' + d.borderS + ' ' + d.borderC + ';border-radius:' + d.radius + 'px;box-shadow:' + d.shadowX + 'px ' + d.shadowY + 'px ' + d.shadowBlur + 'px ' + d.shadowC + ';font-size:' + d.fontSize + 'px;padding:' + d.padT + 'px ' + d.padR + 'px ' + d.padB + 'px ' + d.padL + 'px;';
  }

  function sampleContent(comp) {
    switch(comp) {
      case 'button': return 'Click Me';
      case 'slider': return '<input type="range" style="width:80px;pointer-events:none;" />';
      case 'textbox': return '<span style="opacity:0.5;">Type here...</span>';
      case 'panel': return '<span style="opacity:0.4;">Panel</span>';
      case 'label': return 'Label Text';
      case 'checkbox': return '☑ Option';
      default: return comp;
    }
  }

  function renderGallery() {
    const gallery = document.getElementById('themeGallery');
    gallery.innerHTML = components.map(comp => {
      const stateItems = states.map(s => {
        const d = themeData[comp][s];
        return '<div class="preview-item"><div class="preview-widget" style="' + styleStr(d) + '">' + sampleContent(comp) + '</div><span>' + s + '</span></div>';
      }).join('');
      return '<div class="gallery-card"><h4>' + comp.charAt(0).toUpperCase() + comp.slice(1) + '</h4><div class="gallery-states">' + stateItems + '</div></div>';
    }).join('');
  }

  function saveCurrentState() { themeData[currentComp][currentState] = readFields(); }
  function loadCurrentState() { writeFields(themeData[currentComp][currentState]); }

  document.querySelectorAll('.comp-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      saveCurrentState();
      document.querySelectorAll('.comp-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      currentComp = this.dataset.comp;
      loadCurrentState();
      renderGallery();
    });
  });

  document.querySelectorAll('.state-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      saveCurrentState();
      document.querySelectorAll('.state-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      currentState = this.dataset.state;
      loadCurrentState();
      renderGallery();
    });
  });

  document.querySelectorAll('.style-fields input, .style-fields select').forEach(el => {
    el.addEventListener('input', function() {
      if (this.id === 'themeRadius') document.getElementById('radiusVal').textContent = this.value + 'px';
      if (this.id === 'themeFontSize') document.getElementById('fontSizeVal').textContent = this.value + 'px';
      saveCurrentState();
      renderGallery();
    });
  });

  document.getElementById('exportThemeCss').addEventListener('click', function() {
    let css = ':root {\\n';
    components.forEach(comp => {
      states.forEach(state => {
        const d = themeData[comp][state];
        const p = '--gui-' + comp + '-' + state;
        css += '  ' + p + '-bg: ' + d.bg + ';\\n';
        css += '  ' + p + '-fg: ' + d.fg + ';\\n';
        css += '  ' + p + '-border: ' + d.borderW + 'px ' + d.borderS + ' ' + d.borderC + ';\\n';
        css += '  ' + p + '-radius: ' + d.radius + 'px;\\n';
        css += '  ' + p + '-shadow: ' + d.shadowX + 'px ' + d.shadowY + 'px ' + d.shadowBlur + 'px ' + d.shadowC + ';\\n';
        css += '  ' + p + '-font-size: ' + d.fontSize + 'px;\\n';
        css += '  ' + p + '-padding: ' + d.padT + 'px ' + d.padR + 'px ' + d.padB + 'px ' + d.padL + 'px;\\n';
      });
    });
    css += '}\\n';
    vscode.postMessage({ type:'export', format:'css', content: css });
  });

  loadCurrentState();
  renderGallery();
})();
`;

  return { workspaceHtml, styles, script };
}

// ─── 4. Tilemap Script Editor ────────────────────────────────────────────────

export function tilemapScriptContent(): EditorContent {
  const gridCells: string[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      gridCells.push(`<div class="tile-cell" data-row="${row}" data-col="${col}"></div>`);
    }
  }

  const workspaceHtml = `
<div class="tilescript-editor">
  <div class="tilescript-top">
    <div class="tile-grid-section">
      <h4>Tile Position</h4>
      <div class="tile-grid">${gridCells.join("")}</div>
    </div>
    <div class="event-section">
      <label>Event Type</label>
      <select id="eventType">
        <option value="OnStep">OnStep</option>
        <option value="OnInteract" selected>OnInteract</option>
        <option value="OnEnter">OnEnter</option>
        <option value="OnExit">OnExit</option>
        <option value="OnTimer">OnTimer</option>
        <option value="OnCondition">OnCondition</option>
      </select>
    </div>
    <div class="tile-status" id="tileStatus">Tile: (0, 0) | Event: OnInteract</div>
  </div>
  <div class="tilescript-body">
    <div class="snippet-bar">
      <button class="snippet-btn" data-snippet="spawn">Spawn enemy</button>
      <button class="snippet-btn" data-snippet="sound">Play sound</button>
      <button class="snippet-btn" data-snippet="dialog">Show dialog</button>
      <button class="snippet-btn" data-snippet="teleport">Teleport player</button>
      <button class="snippet-btn" data-snippet="setflag">Set flag</button>
      <button class="snippet-btn" data-snippet="checkflag">Check flag</button>
    </div>
    <textarea id="scriptArea" class="script-textarea" spellcheck="false" placeholder="-- Write tile event script here..."></textarea>
  </div>
  <div class="tilescript-bottom">
    <button id="validateBtn">Validate</button>
    <div id="validationOutput" class="validation-output"></div>
  </div>
</div>`;

  const styles = `
.tilescript-editor { display:flex; flex-direction:column; height:100%; }
.tilescript-top { display:flex; align-items:flex-start; gap:16px; padding:12px; border-bottom:1px solid var(--vscode-panel-border); flex-wrap:wrap; }
.tile-grid-section h4 { margin:0 0 6px; font-size:12px; color:var(--vscode-descriptionForeground); }
.tile-grid { display:grid; grid-template-columns:repeat(8, 24px); grid-template-rows:repeat(8, 24px); gap:1px; background:var(--vscode-panel-border); border:1px solid var(--vscode-panel-border); }
.tile-cell { background:var(--vscode-editor-background); cursor:pointer; transition:background 0.1s; }
.tile-cell:hover { background:var(--vscode-list-hoverBackground); }
.tile-cell.selected { background:var(--vscode-focusBorder); }
.event-section { display:flex; flex-direction:column; gap:4px; }
.event-section label { font-size:11px; color:var(--vscode-descriptionForeground); }
.event-section select { padding:4px 8px; background:var(--vscode-dropdown-background); color:var(--vscode-dropdown-foreground); border:1px solid var(--vscode-dropdown-border); border-radius:3px; font-size:12px; }
.tile-status { font-size:12px; color:var(--vscode-editor-foreground); background:var(--vscode-badge-background); color:var(--vscode-badge-foreground); padding:4px 10px; border-radius:4px; align-self:center; }
.tilescript-body { flex:1; display:flex; flex-direction:column; padding:12px; gap:8px; min-height:0; }
.snippet-bar { display:flex; gap:4px; flex-wrap:wrap; }
.snippet-btn { padding:4px 10px; background:var(--vscode-badge-background); color:var(--vscode-badge-foreground); border:none; border-radius:3px; font-size:11px; cursor:pointer; }
.snippet-btn:hover { opacity:0.85; }
.script-textarea { flex:1; resize:none; font-family:var(--vscode-editor-font-family); font-size:var(--vscode-editor-font-size, 13px); line-height:1.5; padding:10px; background:var(--vscode-input-background); color:var(--vscode-input-foreground); border:1px solid var(--vscode-input-border); border-radius:4px; tab-size:2; }
.script-textarea:focus { outline:none; border-color:var(--vscode-focusBorder); }
.tilescript-bottom { display:flex; align-items:center; gap:12px; padding:10px 12px; border-top:1px solid var(--vscode-panel-border); }
#validateBtn { padding:5px 14px; background:var(--vscode-button-background); color:var(--vscode-button-foreground); border:none; border-radius:4px; font-size:12px; cursor:pointer; }
#validateBtn:hover { background:var(--vscode-button-hoverBackground); }
.validation-output { font-size:12px; font-family:var(--vscode-editor-font-family); }
.validation-output.valid { color:#4ec9b0; }
.validation-output.invalid { color:#f44747; }
`;

  const script = `
(function() {
  const vscode = acquireVsCodeApi();
  let selectedRow = 0, selectedCol = 0;
  const cells = document.querySelectorAll('.tile-cell');
  const eventSelect = document.getElementById('eventType');
  const statusEl = document.getElementById('tileStatus');
  const scriptArea = document.getElementById('scriptArea');
  const validateBtn = document.getElementById('validateBtn');
  const outputEl = document.getElementById('validationOutput');

  function updateStatus() {
    statusEl.textContent = 'Tile: (' + selectedCol + ', ' + selectedRow + ') | Event: ' + eventSelect.value;
  }

  cells.forEach(cell => {
    cell.addEventListener('click', function() {
      cells.forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');
      selectedRow = parseInt(this.dataset.row);
      selectedCol = parseInt(this.dataset.col);
      updateStatus();
    });
  });
  cells[0].classList.add('selected');
  eventSelect.addEventListener('change', updateStatus);

  const snippets = {
    spawn: 'local enemy = lurek.ecs.spawn("enemy")\\nlurek.tilemap.placeEntity(enemy, tileX, tileY)\\n',
    sound: 'lurek.audio.play("sfx/interact.ogg")\\n',
    dialog: 'lurek.ui.showDialog({\\n  text = "Hello, traveler!",\\n  speaker = "NPC"\\n})\\n',
    teleport: 'lurek.tilemap.teleportPlayer(targetX, targetY)\\n',
    setflag: 'game_flags = game_flags or {}\ngame_flags.quest_started = true\n',
    checkflag: 'game_flags = game_flags or {}\nif game_flags.quest_started then\n  -- flag is set\nend\n'
  };

  document.querySelectorAll('.snippet-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const key = this.dataset.snippet;
      const text = snippets[key] || '';
      const start = scriptArea.selectionStart;
      const before = scriptArea.value.substring(0, start);
      const after = scriptArea.value.substring(scriptArea.selectionEnd);
      scriptArea.value = before + text + after;
      scriptArea.selectionStart = scriptArea.selectionEnd = start + text.length;
      scriptArea.focus();
    });
  });

  validateBtn.addEventListener('click', function() {
    const code = scriptArea.value;
    let errors = [];
    let braces = 0, parens = 0, brackets = 0;
    let inString = false, stringChar = '';
    for (let i = 0; i < code.length; i++) {
      const ch = code[i];
      if (inString) { if (ch === stringChar && code[i-1] !== '\\\\') inString = false; continue; }
      if (ch === '"' || ch === "'") { inString = true; stringChar = ch; continue; }
      if (ch === '-' && code[i+1] === '-') { while (i < code.length && code[i] !== '\\n') i++; continue; }
      if (ch === '{') braces++;
      if (ch === '}') braces--;
      if (ch === '(') parens++;
      if (ch === ')') parens--;
      if (ch === '[') brackets++;
      if (ch === ']') brackets--;
      if (braces < 0) { errors.push('Unexpected } at position ' + i); braces = 0; }
      if (parens < 0) { errors.push('Unexpected ) at position ' + i); parens = 0; }
      if (brackets < 0) { errors.push('Unexpected ] at position ' + i); brackets = 0; }
    }
    if (inString) errors.push('Unterminated string literal');
    if (braces > 0) errors.push('Missing ' + braces + ' closing }');
    if (parens > 0) errors.push('Missing ' + parens + ' closing )');
    if (brackets > 0) errors.push('Missing ' + brackets + ' closing ]');

    if (errors.length === 0) {
      outputEl.className = 'validation-output valid';
      outputEl.textContent = '✓ Valid';
    } else {
      outputEl.className = 'validation-output invalid';
      outputEl.textContent = '✗ ' + errors[0];
    }
  });

  updateStatus();
})();
`;

  return { workspaceHtml, styles, script };
}

// ─── 5. API Reference Viewer ─────────────────────────────────────────────────

export function apiReferenceContent(): EditorContent {
  const apiData = {
    "lurek.tilemap": [
      { name: "create", sig: "lurek.tilemap.create(width, height, tileSize) -> TileMap", params: [["width","number","Width of the tilemap in tiles"],["height","number","Height of the tilemap in tiles"],["tileSize","number","Size of each tile in pixels"]], ret: "TileMap — the created tilemap object", desc: "Creates a new tilemap with the given dimensions and tile size.", example: "local map = lurek.tilemap.create(32, 24, 16)\\nmap:setTile(0, 0, 1)" },
      { name: "setTile", sig: "lurek.tilemap.setTile(map, x, y, tileId)", params: [["map","TileMap","The target tilemap"],["x","number","Tile column"],["y","number","Tile row"],["tileId","number","Tile index from the tileset"]], ret: "nil", desc: "Sets a tile at the given coordinates.", example: "lurek.tilemap.setTile(map, 5, 3, 42)" },
      { name: "getTile", sig: "lurek.tilemap.getTile(map, x, y) -> number", params: [["map","TileMap","The target tilemap"],["x","number","Tile column"],["y","number","Tile row"]], ret: "number — the tile ID at the position", desc: "Gets the tile ID at the given coordinates.", example: "local id = lurek.tilemap.getTile(map, 5, 3)" }
    ],
    "lurek.physics": [
      { name: "addBody", sig: "lurek.physics.addBody(entity, bodyType, opts) -> Body", params: [["entity","Entity","The entity to attach a body to"],["bodyType","string","'dynamic', 'static', or 'kinematic'"],["opts","table|nil","Optional: { mass, restitution, friction }"]], ret: "Body — the physics body handle", desc: "Attaches a physics body to an entity.", example: "local body = lurek.physics.addBody(player, 'dynamic', { mass = 1.0 })" },
      { name: "applyForce", sig: "lurek.physics.applyForce(body, fx, fy)", params: [["body","Body","The physics body"],["fx","number","Force X component"],["fy","number","Force Y component"]], ret: "nil", desc: "Applies a force to a physics body at its center of mass.", example: "lurek.physics.applyForce(body, 0, -500)" }
    ],
    "lurek.audio": [
      { name: "play", sig: "lurek.audio.play(path, opts) -> SoundHandle", params: [["path","string","Path to the audio file"],["opts","table|nil","Optional: { volume, loop, pitch }"]], ret: "SoundHandle — handle for controlling playback", desc: "Plays an audio file with optional parameters.", example: "local sfx = lurek.audio.play('sfx/jump.ogg', { volume = 0.8 })" },
      { name: "stop", sig: "lurek.audio.stop(handle)", params: [["handle","SoundHandle","The sound handle to stop"]], ret: "nil", desc: "Stops a currently playing sound.", example: "lurek.audio.stop(bgMusic)" },
      { name: "setVolume", sig: "lurek.audio.setVolume(handle, volume)", params: [["handle","SoundHandle","The sound handle"],["volume","number","Volume from 0.0 to 1.0"]], ret: "nil", desc: "Sets the volume of a playing sound.", example: "lurek.audio.setVolume(bgMusic, 0.5)" }
    ],
    "lurek.input": [
      { name: "isPressed", sig: "lurek.input.isPressed(key) -> boolean", params: [["key","string","Key name (e.g. 'space', 'a', 'left')"]], ret: "boolean — true if pressed this frame", desc: "Returns true if the key was pressed this frame (not held).", example: "if lurek.input.isPressed('space') then\\n  player:jump()\\nend" },
      { name: "getAxis", sig: "lurek.input.getAxis(axisName) -> number", params: [["axisName","string","Axis name ('horizontal' or 'vertical')"]], ret: "number — value from -1.0 to 1.0", desc: "Gets the current value of a named input axis.", example: "local dx = lurek.input.getAxis('horizontal')\\nplayer.x = player.x + dx * speed * dt" }
    ],
    "lurek.render": [
      { name: "draw", sig: "lurek.render.draw(texture, x, y, opts)", params: [["texture","Texture","The texture to draw"],["x","number","X position"],["y","number","Y position"],["opts","table|nil","Optional: { rotation, scaleX, scaleY, tint }"]], ret: "nil", desc: "Draws a texture at the given position.", example: "lurek.render.draw(playerTex, player.x, player.y, { scaleX = 2 })" },
      { name: "clear", sig: "lurek.render.clear(r, g, b)", params: [["r","number","Red (0-255)"],["g","number","Green (0-255)"],["b","number","Blue (0-255)"]], ret: "nil", desc: "Clears the screen with the given color.", example: "lurek.render.clear(20, 20, 40)" },
      { name: "setColor", sig: "lurek.render.setColor(r, g, b, a)", params: [["r","number","Red (0-255)"],["g","number","Green (0-255)"],["b","number","Blue (0-255)"],["a","number|nil","Alpha (0-255, default 255)"]], ret: "nil", desc: "Sets the current draw color for subsequent primitives.", example: "lurek.render.setColor(255, 0, 0)\\nlurek.render.drawRect(10, 10, 50, 50)" }
    ]
  };

  const treeHtml = Object.entries(apiData)
    .map(([ns, funcs]) => {
      const items = funcs
        .map(f => `<div class="api-leaf" data-ns="${ns}" data-fn="${f.name}">${f.name}</div>`)
        .join("");
      return `<div class="api-ns"><div class="api-ns-label" data-ns="${ns}">${ns}</div><div class="api-ns-children">${items}</div></div>`;
    })
    .join("");

  const workspaceHtml = `
<div class="apiref-editor">
  <div class="apiref-sidebar">
    <input type="text" id="apiSearch" class="api-search" placeholder="Search..." />
    <div class="api-tree">${treeHtml}</div>
  </div>
  <div class="apiref-main" id="apiMain">
    <div class="api-breadcrumb" id="apiBreadcrumb">lurek</div>
    <div class="api-content" id="apiContent">
      <p class="api-placeholder">Select a function from the sidebar</p>
    </div>
  </div>
</div>`;

  const styles = `
.apiref-editor { display:flex; height:100%; }
.apiref-sidebar { width:220px; min-width:220px; border-right:1px solid var(--vscode-panel-border); display:flex; flex-direction:column; overflow:hidden; }
.api-search { margin:8px; padding:5px 8px; background:var(--vscode-input-background); color:var(--vscode-input-foreground); border:1px solid var(--vscode-input-border); border-radius:4px; font-size:12px; }
.api-search:focus { outline:none; border-color:var(--vscode-focusBorder); }
.api-tree { flex:1; overflow-y:auto; padding:0 8px 8px; }
.api-ns { margin-bottom:4px; }
.api-ns-label { padding:4px 8px; font-size:12px; font-weight:600; color:var(--vscode-editor-foreground); cursor:pointer; border-radius:3px; }
.api-ns-label:hover { background:var(--vscode-list-hoverBackground); }
.api-ns-children { padding-left:12px; }
.api-leaf { padding:3px 8px; font-size:12px; color:var(--vscode-descriptionForeground); cursor:pointer; border-radius:3px; }
.api-leaf:hover { background:var(--vscode-list-hoverBackground); color:var(--vscode-editor-foreground); }
.api-leaf.active { background:var(--vscode-list-activeSelectionBackground); color:var(--vscode-list-activeSelectionForeground); }
.api-ns.hidden { display:none; }
.api-leaf.hidden { display:none; }
.apiref-main { flex:1; padding:16px 24px; overflow-y:auto; }
.api-breadcrumb { font-size:12px; color:var(--vscode-descriptionForeground); margin-bottom:12px; }
.api-breadcrumb span { cursor:pointer; }
.api-breadcrumb span:hover { color:var(--vscode-editor-foreground); }
.api-content .api-placeholder { font-size:13px; color:var(--vscode-descriptionForeground); font-style:italic; }
.api-sig { font-family:var(--vscode-editor-font-family); font-size:14px; color:var(--vscode-editor-foreground); background:var(--vscode-textCodeBlock-background); padding:10px 14px; border-radius:6px; margin-bottom:14px; display:flex; align-items:center; gap:10px; }
.api-sig code { flex:1; }
.api-sig .copy-btn { padding:3px 8px; background:var(--vscode-button-secondaryBackground); color:var(--vscode-button-secondaryForeground); border:none; border-radius:3px; font-size:11px; cursor:pointer; }
.api-sig .copy-btn:hover { background:var(--vscode-button-secondaryHoverBackground); }
.api-params { width:100%; border-collapse:collapse; margin-bottom:14px; font-size:12px; }
.api-params th { text-align:left; padding:6px 10px; background:var(--vscode-editorGroupHeader-tabsBackground); color:var(--vscode-descriptionForeground); border-bottom:1px solid var(--vscode-panel-border); }
.api-params td { padding:6px 10px; border-bottom:1px solid var(--vscode-panel-border); color:var(--vscode-editor-foreground); }
.api-params td:nth-child(2) { font-family:var(--vscode-editor-font-family); color:var(--vscode-symbolIcon-typeParameterForeground, #4ec9b0); }
.api-returns { margin-bottom:14px; font-size:12px; }
.api-returns strong { color:var(--vscode-descriptionForeground); }
.api-desc { margin-bottom:14px; font-size:13px; color:var(--vscode-editor-foreground); line-height:1.5; }
.api-example { background:var(--vscode-textCodeBlock-background); padding:12px 14px; border-radius:6px; font-family:var(--vscode-editor-font-family); font-size:12px; color:var(--vscode-editor-foreground); white-space:pre-wrap; line-height:1.5; overflow-x:auto; }
`;

  const apiDataJson = JSON.stringify(apiData);

  const script = `
(function() {
  const vscode = acquireVsCodeApi();
  const apiData = ${apiDataJson};
  const searchInput = document.getElementById('apiSearch');
  const apiContent = document.getElementById('apiContent');
  const breadcrumb = document.getElementById('apiBreadcrumb');

  function renderFunction(ns, fnName) {
    const funcs = apiData[ns];
    if (!funcs) return;
    const fn = funcs.find(f => f.name === fnName);
    if (!fn) return;

    document.querySelectorAll('.api-leaf').forEach(el => el.classList.remove('active'));
    const active = document.querySelector('.api-leaf[data-ns="' + ns + '"][data-fn="' + fnName + '"]');
    if (active) active.classList.add('active');

    const parts = ns.split('.');
    let crumb = parts.map((p, i) => '<span>' + p + '</span>').join(' &gt; ') + ' &gt; <span><strong>' + fnName + '</strong></span>';
    breadcrumb.innerHTML = crumb;

    const paramsRows = fn.params.map(p => '<tr><td>' + p[0] + '</td><td>' + p[1] + '</td><td>' + p[2] + '</td></tr>').join('');

    apiContent.innerHTML =
      '<div class="api-sig"><code>' + fn.sig + '</code><button class="copy-btn" id="copyBtn">Copy</button></div>' +
      '<table class="api-params"><thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead><tbody>' + paramsRows + '</tbody></table>' +
      '<div class="api-returns"><strong>Returns:</strong> ' + fn.ret + '</div>' +
      '<div class="api-desc">' + fn.desc + '</div>' +
      '<div class="api-example">' + fn.example + '</div>';

    document.getElementById('copyBtn').addEventListener('click', function() {
      vscode.postMessage({ type: 'copy', text: fn.sig });
    });
  }

  document.querySelectorAll('.api-leaf').forEach(el => {
    el.addEventListener('click', function() {
      renderFunction(this.dataset.ns, this.dataset.fn);
    });
  });

  document.querySelectorAll('.api-ns-label').forEach(el => {
    el.addEventListener('click', function() {
      const children = this.nextElementSibling;
      children.style.display = children.style.display === 'none' ? 'block' : 'none';
    });
  });

  searchInput.addEventListener('input', function() {
    const q = this.value.toLowerCase();
    document.querySelectorAll('.api-ns').forEach(ns => {
      let nsVisible = false;
      ns.querySelectorAll('.api-leaf').forEach(leaf => {
        const match = leaf.textContent.toLowerCase().includes(q) || leaf.dataset.ns.toLowerCase().includes(q);
        leaf.classList.toggle('hidden', !match);
        if (match) nsVisible = true;
      });
      ns.classList.toggle('hidden', !nsVisible);
      if (nsVisible) ns.querySelector('.api-ns-children').style.display = 'block';
    });
  });
})();
`;

  return { workspaceHtml, styles, script };
}

// ─── 6. Project Export Editor ────────────────────────────────────────────────

export function projectExportContent(): EditorContent {
  const workspaceHtml = `
<div class="export-editor">
  <div class="export-form">
    <h2>Project Export</h2>

    <fieldset>
      <legend>Platform</legend>
      <label class="check-label"><input type="checkbox" data-field="windows" checked /> Windows</label>
      <label class="check-label"><input type="checkbox" data-field="linux" /> Linux</label>
      <label class="check-label"><input type="checkbox" data-field="macos" /> macOS</label>
    </fieldset>

    <fieldset>
      <legend>Window</legend>
      <div class="form-row"><label>Width</label><input type="number" id="winWidth" value="1280" /></div>
      <div class="form-row"><label>Height</label><input type="number" id="winHeight" value="720" /></div>
      <div class="form-row"><label>Fullscreen</label><input type="checkbox" id="winFullscreen" /></div>
      <div class="form-row"><label>Resizable</label><input type="checkbox" id="winResizable" checked /></div>
      <div class="form-row"><label>VSync</label><input type="checkbox" id="winVsync" checked /></div>
    </fieldset>

    <fieldset>
      <legend>Metadata</legend>
      <div class="form-row"><label>Title</label><input type="text" id="metaTitle" placeholder="My Game" /></div>
      <div class="form-row"><label>Version</label><input type="text" id="metaVersion" value="1.0.0" /></div>
      <div class="form-row"><label>Author</label><input type="text" id="metaAuthor" placeholder="Developer" /></div>
      <div class="form-row"><label>Icon</label><div class="icon-row"><input type="text" id="metaIcon" placeholder="assets/icon.png" /><button id="browseIcon">Browse</button></div></div>
    </fieldset>

    <fieldset>
      <legend>Features</legend>
      <label class="check-label"><input type="checkbox" data-feature="debug_console" /> Debug console</label>
      <label class="check-label"><input type="checkbox" data-feature="dev_tools" /> Dev tools</label>
      <label class="check-label"><input type="checkbox" data-feature="hot_reload" /> Hot reload</label>
      <label class="check-label"><input type="checkbox" data-feature="perf_overlay" /> Performance overlay</label>
      <label class="check-label"><input type="checkbox" data-feature="screenshot_key" /> Screenshot key</label>
    </fieldset>

    <fieldset>
      <legend>Exclude Patterns</legend>
      <textarea id="excludePatterns" rows="4" placeholder="One pattern per line">*.psd
*.xcf
node_modules/</textarea>
    </fieldset>

    <fieldset>
      <legend>Compression</legend>
      <select id="compression">
        <option value="none">None</option>
        <option value="zip" selected>ZIP</option>
        <option value="lz4">LZ4</option>
      </select>
    </fieldset>

    <button id="buildBtn" class="build-btn">Build</button>

    <div id="progressSection" class="progress-section hidden">
      <div class="progress-bar-wrap">
        <div class="progress-bar" id="progressBar"></div>
      </div>
      <div class="progress-text" id="progressText">Building...</div>
    </div>

    <div id="outputSection" class="output-section hidden">
      <pre id="buildOutput" class="build-output"></pre>
    </div>
  </div>
</div>`;

  const styles = `
.export-editor { display:flex; justify-content:center; padding:24px; overflow-y:auto; height:100%; }
.export-form { max-width:600px; width:100%; }
.export-form h2 { margin:0 0 20px; font-size:16px; color:var(--vscode-editor-foreground); }
.export-form fieldset { border:1px solid var(--vscode-panel-border); border-radius:6px; padding:12px 16px; margin-bottom:16px; }
.export-form legend { font-size:12px; font-weight:600; color:var(--vscode-descriptionForeground); padding:0 6px; }
.check-label { display:flex; align-items:center; gap:8px; padding:4px 0; font-size:13px; color:var(--vscode-editor-foreground); cursor:pointer; }
.check-label input { accent-color:var(--vscode-focusBorder); }
.form-row { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
.form-row label { width:90px; font-size:12px; color:var(--vscode-descriptionForeground); }
.form-row input[type="number"], .form-row input[type="text"] { flex:1; padding:4px 8px; background:var(--vscode-input-background); color:var(--vscode-input-foreground); border:1px solid var(--vscode-input-border); border-radius:3px; font-size:12px; }
.form-row input[type="checkbox"] { accent-color:var(--vscode-focusBorder); }
.icon-row { display:flex; flex:1; gap:6px; }
.icon-row input { flex:1; padding:4px 8px; background:var(--vscode-input-background); color:var(--vscode-input-foreground); border:1px solid var(--vscode-input-border); border-radius:3px; font-size:12px; }
.icon-row button { padding:4px 10px; background:var(--vscode-button-secondaryBackground); color:var(--vscode-button-secondaryForeground); border:none; border-radius:3px; font-size:11px; cursor:pointer; }
.icon-row button:hover { background:var(--vscode-button-secondaryHoverBackground); }
.export-form textarea { width:100%; padding:6px 8px; background:var(--vscode-input-background); color:var(--vscode-input-foreground); border:1px solid var(--vscode-input-border); border-radius:3px; font-family:var(--vscode-editor-font-family); font-size:12px; resize:vertical; box-sizing:border-box; }
.export-form select { width:100%; padding:5px 8px; background:var(--vscode-dropdown-background); color:var(--vscode-dropdown-foreground); border:1px solid var(--vscode-dropdown-border); border-radius:3px; font-size:12px; }
.build-btn { display:block; width:100%; padding:10px; margin-top:8px; background:var(--vscode-button-background); color:var(--vscode-button-foreground); border:none; border-radius:6px; font-size:14px; font-weight:600; cursor:pointer; }
.build-btn:hover { background:var(--vscode-button-hoverBackground); }
.build-btn:disabled { opacity:0.6; cursor:not-allowed; }
.progress-section { margin-top:16px; }
.progress-section.hidden { display:none; }
.progress-bar-wrap { height:8px; background:var(--vscode-editorWidget-background); border-radius:4px; overflow:hidden; border:1px solid var(--vscode-panel-border); }
.progress-bar { height:100%; width:0%; background:var(--vscode-progressBar-background); transition:width 0.1s linear; border-radius:4px; }
.progress-text { margin-top:6px; font-size:12px; color:var(--vscode-descriptionForeground); }
.progress-text.done { color:#4ec9b0; }
.output-section { margin-top:12px; }
.output-section.hidden { display:none; }
.build-output { background:var(--vscode-terminal-background, #1e1e1e); color:var(--vscode-terminal-foreground, #ccc); padding:10px 12px; border-radius:6px; font-family:var(--vscode-editor-font-family); font-size:12px; line-height:1.6; max-height:200px; overflow-y:auto; white-space:pre-wrap; margin:0; }
`;

  const script = `
(function() {
  const vscode = acquireVsCodeApi();
  const buildBtn = document.getElementById('buildBtn');
  const progressSection = document.getElementById('progressSection');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const outputSection = document.getElementById('outputSection');
  const buildOutput = document.getElementById('buildOutput');

  document.getElementById('browseIcon').addEventListener('click', function() {
    vscode.postMessage({ type: 'browse', field: 'icon' });
  });

  const logLines = [
    '[lurek] Scanning project files...',
    '[lurek] Found 47 Lua scripts, 23 assets',
    '[lurek] Compiling scripts...',
    '[lurek] Packing assets (ZIP)...',
    '[lurek] Generating conf.toml...',
    '[lurek] Copying runtime binary...',
    '[lurek] Applying UPX compression...',
    '[lurek] Writing output to dist/...',
    '[lurek] Build complete: dist/mygame-windows-x86_64.zip (4.8 MB)'
  ];

  buildBtn.addEventListener('click', function() {
    buildBtn.disabled = true;
    progressSection.classList.remove('hidden');
    outputSection.classList.remove('hidden');
    buildOutput.textContent = '';
    progressBar.style.width = '0%';
    progressText.textContent = 'Building...';
    progressText.classList.remove('done');

    let progress = 0;
    let lineIndex = 0;
    const totalDuration = 3000;
    const stepTime = totalDuration / 100;

    const interval = setInterval(function() {
      progress++;
      progressBar.style.width = progress + '%';

      const lineThreshold = Math.floor((progress / 100) * logLines.length);
      while (lineIndex < lineThreshold && lineIndex < logLines.length) {
        buildOutput.textContent += logLines[lineIndex] + '\\n';
        buildOutput.scrollTop = buildOutput.scrollHeight;
        lineIndex++;
      }

      if (progress >= 100) {
        clearInterval(interval);
        while (lineIndex < logLines.length) {
          buildOutput.textContent += logLines[lineIndex] + '\\n';
          lineIndex++;
        }
        buildOutput.scrollTop = buildOutput.scrollHeight;
        progressText.textContent = '\\u2713 Build complete';
        progressText.classList.add('done');
        buildBtn.disabled = false;
      }
    }, stepTime);
  });
})();
`;

  return { workspaceHtml, styles, script };
}
