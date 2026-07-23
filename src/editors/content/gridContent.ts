import type { EditorContent } from "./types.js";

// ─── Shared Grid Base ────────────────────────────────────────────────────────

interface GridConfig {
  gridWidth: number;
  gridHeight: number;
  cellSize: number;
  palette: string[];
  tools: { key: string; label: string; shortcut?: string }[];
  layers?: { name: string; visible: boolean }[];
  extraHtml?: string;
  extraStyles?: string;
  extraScript?: string;
}

function gridBase(config: GridConfig): EditorContent {
  const {
    gridWidth,
    gridHeight,
    cellSize,
    palette,
    tools,
    layers,
    extraHtml = "",
    extraStyles = "",
    extraScript = "",
  } = config;

  const paletteSwatches = palette
    .map(
      (c, i) =>
        `<div class="swatch${i === 0 ? " active" : ""}" data-color="${c}" style="background:${c};" title="${c}"></div>`
    )
    .join("");

  const toolButtons = tools
    .map(
      (t, i) =>
        `<button class="tool-btn${i === 0 ? " active" : ""}" data-tool="${t.key}" title="${t.label}${t.shortcut ? ` (${t.shortcut})` : ""}">${t.label}</button>`
    )
    .join("");

  const layerHtml = layers
    ? `<div class="layers-panel"><h3>Layers</h3>${layers
        .map(
          (l, i) =>
            `<div class="layer-item${i === 0 ? " active" : ""}" data-layer="${i}"><span class="vis-toggle" data-layer="${i}" title="Toggle visibility">${l.visible ? "👁" : "○"}</span><span class="layer-name">${l.name}</span></div>`
        )
        .join("")}</div>`
    : "";

  const workspaceHtml = `
<div class="grid-editor">
  <div class="toolbar">
    <div class="tool-group">${toolButtons}</div>
    <div class="tool-group">
      <label>Size: <input type="range" id="brushSize" min="1" max="5" value="1"></label>
      <button id="zoomOut" title="Zoom out">−</button>
      <span id="zoomLabel">100%</span>
      <button id="zoomIn" title="Zoom in">+</button>
      <label><input type="checkbox" id="showGrid" checked> Grid</label>
    </div>
  </div>
  <div class="editor-body">
    <div class="palette-panel">
      <h3>Palette</h3>
      <div class="swatches">${paletteSwatches}</div>
    </div>
    <div class="canvas-area">
      <canvas id="mainCanvas" width="${gridWidth * cellSize}" height="${gridHeight * cellSize}"></canvas>
    </div>
    <div class="props-panel">
      ${layerHtml}
      ${extraHtml}
    </div>
  </div>
  <div class="status-bar">
    <span id="statusPos">0, 0</span>
    <span id="statusSize">${gridWidth}×${gridHeight}</span>
    <span id="statusLayer">Layer: ${layers?.[0]?.name ?? "-"}</span>
    <span id="statusTool">Tool: ${tools[0]?.label ?? "-"}</span>
  </div>
</div>`;

  const styles = `
.grid-editor { display:flex; flex-direction:column; height:100%; font-family:var(--vscode-font-family); color:var(--vscode-foreground); background:var(--vscode-editor-background); }
.toolbar { display:flex; gap:12px; padding:6px 10px; background:var(--vscode-titleBar-activeBackground); border-bottom:1px solid var(--vscode-panel-border); align-items:center; flex-wrap:wrap; }
.tool-group { display:flex; gap:4px; align-items:center; }
.tool-btn { padding:4px 8px; border:1px solid var(--vscode-button-border,transparent); background:var(--vscode-button-secondaryBackground); color:var(--vscode-button-secondaryForeground); cursor:pointer; border-radius:3px; font-size:12px; }
.tool-btn.active { background:var(--vscode-button-background); color:var(--vscode-button-foreground); }
.tool-btn:hover { background:var(--vscode-button-hoverBackground); }
.editor-body { display:flex; flex:1; overflow:hidden; }
.palette-panel { width:160px; padding:8px; border-right:1px solid var(--vscode-panel-border); overflow-y:auto; }
.palette-panel h3, .props-panel h3 { margin:0 0 8px; font-size:12px; text-transform:uppercase; color:var(--vscode-descriptionForeground); }
.swatches { display:grid; grid-template-columns:repeat(4,1fr); gap:4px; }
.swatch { width:28px; height:28px; border-radius:3px; cursor:pointer; border:2px solid transparent; }
.swatch.active { border-color:var(--vscode-focusBorder); }
.swatch:hover { opacity:0.8; }
.canvas-area { flex:1; display:flex; align-items:center; justify-content:center; overflow:auto; background:var(--vscode-editor-background); }
#mainCanvas { border:1px solid var(--vscode-panel-border); image-rendering:pixelated; }
.props-panel { width:180px; padding:8px; border-left:1px solid var(--vscode-panel-border); overflow-y:auto; }
.layers-panel .layer-item { display:flex; gap:6px; padding:4px 6px; cursor:pointer; border-radius:3px; align-items:center; font-size:12px; }
.layers-panel .layer-item.active { background:var(--vscode-list-activeSelectionBackground); color:var(--vscode-list-activeSelectionForeground); }
.layers-panel .layer-item:hover { background:var(--vscode-list-hoverBackground); }
.vis-toggle { cursor:pointer; font-size:14px; }
.status-bar { display:flex; gap:16px; padding:4px 10px; font-size:11px; background:var(--vscode-statusBar-background); color:var(--vscode-statusBar-foreground); border-top:1px solid var(--vscode-panel-border); }
label { font-size:12px; display:flex; align-items:center; gap:4px; }
input[type=range] { width:60px; }
${extraStyles}`;

  const script = `
(function(){
  const GRID_W = ${gridWidth}, GRID_H = ${gridHeight}, CELL_SIZE = ${cellSize};
  const PALETTE = ${JSON.stringify(palette)};
  const TOOLS = ${JSON.stringify(tools.map((t) => t.key))};
  const canvas = document.getElementById('mainCanvas');
  const ctx = canvas.getContext('2d');
  let zoom = 1, showGrid = true, brushSize = 1;
  let activeColor = PALETTE[0], activeTool = TOOLS[0], activeLayer = 0;
  let painting = false, dirty = false;
  const layers = ${JSON.stringify(layers?.map((l) => ({ name: l.name, visible: l.visible })) ?? [{ name: "Default", visible: true }])};
  const layerData = layers.map(() => Array.from({length:GRID_W*GRID_H}, ()=>null));
  const undoStack = [], redoStack = [];
  const MAX_UNDO = 50;

  function saveState(){ undoStack.push(layerData.map(l=>[...l])); if(undoStack.length>MAX_UNDO) undoStack.shift(); redoStack.length=0; dirty=true; }
  function undo(){ if(!undoStack.length)return; redoStack.push(layerData.map(l=>[...l])); const s=undoStack.pop(); s.forEach((l,i)=>{for(let j=0;j<l.length;j++) layerData[i][j]=l[j];}); render(); }
  function redo(){ if(!redoStack.length)return; undoStack.push(layerData.map(l=>[...l])); const s=redoStack.pop(); s.forEach((l,i)=>{for(let j=0;j<l.length;j++) layerData[i][j]=l[j];}); render(); }

  function screenToGrid(e){ const rect=canvas.getBoundingClientRect(); return {x:Math.floor((e.clientX-rect.left)/(CELL_SIZE*zoom)), y:Math.floor((e.clientY-rect.top)/(CELL_SIZE*zoom))}; }
  function inBounds(x,y){ return x>=0&&x<GRID_W&&y>=0&&y<GRID_H; }
  function idx(x,y){ return y*GRID_W+x; }

  function paintCell(x,y){
    if(!inBounds(x,y))return;
    const half=Math.floor(brushSize/2);
    for(let dy=-half;dy<=half;dy++) for(let dx=-half;dx<=half;dx++){
      const nx=x+dx,ny=y+dy;
      if(inBounds(nx,ny)){
        if(activeTool==='eraser') layerData[activeLayer][idx(nx,ny)]=null;
        else layerData[activeLayer][idx(nx,ny)]=activeColor;
      }
    }
  }

  function floodFill(sx,sy,fillColor){
    if(!inBounds(sx,sy))return;
    const target=layerData[activeLayer][idx(sx,sy)];
    if(target===fillColor)return;
    const stack=[{x:sx,y:sy}];
    const visited=new Set();
    while(stack.length){
      const{x,y}=stack.pop();
      const key=x+','+y;
      if(visited.has(key))continue; visited.add(key);
      if(!inBounds(x,y))continue;
      if(layerData[activeLayer][idx(x,y)]!==target)continue;
      layerData[activeLayer][idx(x,y)]=fillColor;
      stack.push({x:x+1,y},{x:x-1,y},{x,y:y+1},{x,y:y-1});
    }
  }

  function eyedropper(x,y){
    if(!inBounds(x,y))return;
    const c=layerData[activeLayer][idx(x,y)];
    if(c){activeColor=c; updatePaletteUI();}
  }

  function drawCells(){
    for(let li=0;li<layers.length;li++){
      if(!layers[li].visible)continue;
      for(let y=0;y<GRID_H;y++) for(let x=0;x<GRID_W;x++){
        const c=layerData[li][idx(x,y)];
        if(c){ ctx.fillStyle=c; ctx.fillRect(x*CELL_SIZE*zoom,y*CELL_SIZE*zoom,CELL_SIZE*zoom,CELL_SIZE*zoom); }
      }
    }
  }

  function drawGridLines(){
    ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=0.5;
    for(let x=0;x<=GRID_W;x++){ctx.beginPath();ctx.moveTo(x*CELL_SIZE*zoom,0);ctx.lineTo(x*CELL_SIZE*zoom,GRID_H*CELL_SIZE*zoom);ctx.stroke();}
    for(let y=0;y<=GRID_H;y++){ctx.beginPath();ctx.moveTo(0,y*CELL_SIZE*zoom);ctx.lineTo(GRID_W*CELL_SIZE*zoom,y*CELL_SIZE*zoom);ctx.stroke();}
  }

  function render(){
    canvas.width=GRID_W*CELL_SIZE*zoom; canvas.height=GRID_H*CELL_SIZE*zoom;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawCells();
    if(showGrid) drawGridLines();
    drawOverlays();
  }

  function drawOverlays(){}

  function updatePaletteUI(){
    document.querySelectorAll('.swatch').forEach(s=>{s.classList.toggle('active',s.dataset.color===activeColor);});
  }

  // Events
  canvas.addEventListener('mousedown',e=>{
    const g=screenToGrid(e);
    if(activeTool==='eyedropper'){eyedropper(g.x,g.y);return;}
    if(activeTool==='fill'){saveState();floodFill(g.x,g.y,activeColor);render();return;}
    saveState(); painting=true; paintCell(g.x,g.y); render();
  });
  canvas.addEventListener('mousemove',e=>{
    const g=screenToGrid(e);
    document.getElementById('statusPos').textContent=g.x+', '+g.y;
    if(painting){paintCell(g.x,g.y);render();}
  });
  canvas.addEventListener('mouseup',()=>{painting=false;});
  canvas.addEventListener('mouseleave',()=>{painting=false;});

  document.querySelectorAll('.tool-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.tool-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active'); activeTool=btn.dataset.tool;
      document.getElementById('statusTool').textContent='Tool: '+btn.textContent;
    });
  });
  document.querySelectorAll('.swatch').forEach(s=>{
    s.addEventListener('click',()=>{activeColor=s.dataset.color;updatePaletteUI();});
  });
  document.querySelectorAll('.vis-toggle').forEach(t=>{
    t.addEventListener('click',e=>{
      e.stopPropagation();
      const li=+t.dataset.layer; layers[li].visible=!layers[li].visible;
      t.textContent=layers[li].visible?'👁':'○'; render();
    });
  });
  document.querySelectorAll('.layer-item').forEach(item=>{
    item.addEventListener('click',()=>{
      document.querySelectorAll('.layer-item').forEach(i=>i.classList.remove('active'));
      item.classList.add('active'); activeLayer=+item.dataset.layer;
      document.getElementById('statusLayer').textContent='Layer: '+layers[activeLayer].name;
    });
  });
  document.getElementById('brushSize').addEventListener('input',e=>{brushSize=+e.target.value;});
  document.getElementById('showGrid').addEventListener('change',e=>{showGrid=e.target.checked;render();});
  document.getElementById('zoomIn').addEventListener('click',()=>{zoom=Math.min(zoom+0.25,4);document.getElementById('zoomLabel').textContent=Math.round(zoom*100)+'%';render();});
  document.getElementById('zoomOut').addEventListener('click',()=>{zoom=Math.max(zoom-0.25,0.25);document.getElementById('zoomLabel').textContent=Math.round(zoom*100)+'%';render();});

  document.addEventListener('keydown',e=>{
    if(e.ctrlKey&&e.key==='z'){e.preventDefault();undo();}
    else if(e.ctrlKey&&e.key==='y'){e.preventDefault();redo();}
    else { TOOLS.forEach((t,i)=>{ const btn=document.querySelectorAll('.tool-btn')[i]; if(btn&&btn.title.includes('('+e.key.toUpperCase()+')')) btn.click(); }); }
  });

  render();
  ${extraScript}
})();`;

  return { workspaceHtml, styles, script };
}

// ─── 1. TileMap Editor ───────────────────────────────────────────────────────

export function tileMapContent(): EditorContent {
  const palette = [
    "#2d5a27", "#4a8c3f", "#7bc96f", "#f5e6c8",
    "#c4a35a", "#8b6914", "#4a3728", "#2c2c2c",
    "#5b8dd9", "#3b5dc9", "#1a1c2c", "#f4f4f4",
    "#ef7d57", "#b13e53", "#ffcd75", "#94b0c2",
  ];
  const tools = [
    { key: "pencil", label: "Pencil", shortcut: "B" },
    { key: "eraser", label: "Eraser", shortcut: "E" },
    { key: "fill", label: "Fill", shortcut: "G" },
    { key: "select", label: "Select", shortcut: "S" },
    { key: "eyedropper", label: "Eyedropper", shortcut: "I" },
    { key: "stamp", label: "Stamp" },
  ];
  const layers = [
    { name: "Base", visible: true },
    { name: "Collision", visible: true },
    { name: "Metadata", visible: false },
  ];

  return gridBase({
    gridWidth: 32,
    gridHeight: 18,
    cellSize: 32,
    palette,
    tools,
    layers,
    extraHtml: `<div class="export-section"><h3>Export</h3><button id="exportBtn" class="tool-btn">Export JSON</button><pre id="exportOutput" style="font-size:10px;max-height:120px;overflow:auto;margin-top:6px;"></pre></div>`,
    extraStyles: `.export-section{margin-top:12px;} .collision-overlay{position:absolute;pointer-events:none;}`,
    extraScript: `
      // Collision overlay rendering
      const origDrawOverlays = drawOverlays;
      drawOverlays = function(){
        if(layers[1] && layers[1].visible){
          ctx.fillStyle='rgba(255,0,0,0.25)';
          for(let y=0;y<GRID_H;y++) for(let x=0;x<GRID_W;x++){
            if(layerData[1][idx(x,y)]){
              ctx.fillRect(x*CELL_SIZE*zoom,y*CELL_SIZE*zoom,CELL_SIZE*zoom,CELL_SIZE*zoom);
            }
          }
        }
      };
      document.getElementById('exportBtn').addEventListener('click',()=>{
        const out={layers:layers.map((l,i)=>({name:l.name,data:layerData[i].slice()})),tileset_ref:'tileset.png'};
        document.getElementById('exportOutput').textContent=JSON.stringify(out,null,2).slice(0,2000);
      });
      render();
    `,
  });
}

// ─── 2. Pixel Art Editor ─────────────────────────────────────────────────────

export function pixelArtContent(): EditorContent {
  const palette = [
    "#1a1c2c", "#5d275d", "#b13e53", "#ef7d57",
    "#ffcd75", "#a7f070", "#38b764", "#257179",
    "#29366f", "#3b5dc9", "#41a6f6", "#73eff7",
    "#f4f4f4", "#94b0c2", "#566c86", "#333c57",
  ];
  const tools = [
    { key: "pencil", label: "Pencil", shortcut: "B" },
    { key: "eraser", label: "Eraser", shortcut: "E" },
    { key: "line", label: "Line", shortcut: "L" },
    { key: "circle", label: "Circle", shortcut: "C" },
    { key: "rect", label: "Rect", shortcut: "R" },
    { key: "fill", label: "Fill", shortcut: "G" },
    { key: "eyedropper", label: "Eyedropper", shortcut: "I" },
  ];

  const workspaceHtml = `
<div class="grid-editor">
  <div class="toolbar">
    <div class="tool-group">
      ${tools.map((t, i) => `<button class="tool-btn${i === 0 ? " active" : ""}" data-tool="${t.key}" title="${t.label} (${t.shortcut})">${t.label}</button>`).join("")}
    </div>
    <div class="tool-group">
      <label>Size: <input type="range" id="brushSize" min="1" max="5" value="1"></label>
      <button id="zoomOut">−</button><span id="zoomLabel">800%</span><button id="zoomIn">+</button>
      <label><input type="checkbox" id="showGrid" checked> Grid</label>
      <label><input type="checkbox" id="symH"> Mirror H</label>
      <label><input type="checkbox" id="symV"> Mirror V</label>
    </div>
  </div>
  <div class="editor-body">
    <div class="palette-panel">
      <h3>Palette</h3>
      <div class="swatches">${palette.map((c, i) => `<div class="swatch${i === 0 ? " active" : ""}" data-color="${c}" style="background:${c};" title="${c}"></div>`).join("")}</div>
    </div>
    <div class="canvas-area">
      <canvas id="mainCanvas" width="${64 * 8}" height="${64 * 8}"></canvas>
    </div>
    <div class="props-panel">
      <h3>Frames</h3>
      <div id="frameList"><div class="frame-item active" data-frame="0">Frame 1</div></div>
      <button id="addFrame" class="tool-btn" style="margin-top:6px;">+ Frame</button>
      <div style="margin-top:12px;">
        <button id="playBtn" class="tool-btn">▶ Play</button>
        <label>FPS: <input type="range" id="fpsSlider" min="1" max="24" value="8"><span id="fpsVal">8</span></label>
      </div>
      <label style="margin-top:8px;"><input type="checkbox" id="onionSkin"> Onion skin</label>
    </div>
  </div>
  <div class="status-bar">
    <span id="statusPos">0, 0</span>
    <span id="statusSize">64×64</span>
    <span id="statusTool">Tool: Pencil</span>
    <span id="statusFrame">Frame: 1/1</span>
  </div>
</div>`;

  const styles = `
.grid-editor { display:flex; flex-direction:column; height:100%; font-family:var(--vscode-font-family); color:var(--vscode-foreground); background:var(--vscode-editor-background); }
.toolbar { display:flex; gap:12px; padding:6px 10px; background:var(--vscode-titleBar-activeBackground); border-bottom:1px solid var(--vscode-panel-border); align-items:center; flex-wrap:wrap; }
.tool-group { display:flex; gap:4px; align-items:center; }
.tool-btn { padding:4px 8px; border:1px solid var(--vscode-button-border,transparent); background:var(--vscode-button-secondaryBackground); color:var(--vscode-button-secondaryForeground); cursor:pointer; border-radius:3px; font-size:12px; }
.tool-btn.active { background:var(--vscode-button-background); color:var(--vscode-button-foreground); }
.tool-btn:hover { background:var(--vscode-button-hoverBackground); }
.editor-body { display:flex; flex:1; overflow:hidden; }
.palette-panel { width:160px; padding:8px; border-right:1px solid var(--vscode-panel-border); overflow-y:auto; }
.palette-panel h3, .props-panel h3 { margin:0 0 8px; font-size:12px; text-transform:uppercase; color:var(--vscode-descriptionForeground); }
.swatches { display:grid; grid-template-columns:repeat(4,1fr); gap:4px; }
.swatch { width:28px; height:28px; border-radius:3px; cursor:pointer; border:2px solid transparent; }
.swatch.active { border-color:var(--vscode-focusBorder); }
.canvas-area { flex:1; display:flex; align-items:center; justify-content:center; overflow:auto; background:#111; }
#mainCanvas { border:1px solid var(--vscode-panel-border); image-rendering:pixelated; }
.props-panel { width:180px; padding:8px; border-left:1px solid var(--vscode-panel-border); overflow-y:auto; }
.frame-item { padding:4px 6px; cursor:pointer; border-radius:3px; font-size:12px; margin-bottom:2px; }
.frame-item.active { background:var(--vscode-list-activeSelectionBackground); color:var(--vscode-list-activeSelectionForeground); }
.frame-item:hover { background:var(--vscode-list-hoverBackground); }
.status-bar { display:flex; gap:16px; padding:4px 10px; font-size:11px; background:var(--vscode-statusBar-background); color:var(--vscode-statusBar-foreground); border-top:1px solid var(--vscode-panel-border); }
label { font-size:12px; display:flex; align-items:center; gap:4px; }
input[type=range] { width:60px; }`;

  const script = `
(function(){
  const W=64,H=64,CELL=1,DISPLAY_ZOOM=8;
  const PALETTE=${JSON.stringify(palette)};
  const canvas=document.getElementById('mainCanvas');
  const ctx=canvas.getContext('2d');
  let zoom=DISPLAY_ZOOM, showGrid=true, brushSize=1;
  let activeColor=PALETTE[0], activeTool='pencil';
  let painting=false, symH=false, symV=false;
  let lineStart=null;
  const frames=[Array.from({length:W*H},()=>null)];
  let currentFrame=0;
  const undoStack=[], redoStack=[];
  const MAX_UNDO=50;
  let playInterval=null, fps=8, onionSkin=false;

  function idx(x,y){return y*W+x;}
  function inBounds(x,y){return x>=0&&x<W&&y>=0&&y<H;}
  function saveState(){undoStack.push(frames[currentFrame].slice());if(undoStack.length>MAX_UNDO)undoStack.shift();redoStack.length=0;}
  function undo(){if(!undoStack.length)return;redoStack.push(frames[currentFrame].slice());frames[currentFrame]=undoStack.pop();render();}
  function redo(){if(!redoStack.length)return;undoStack.push(frames[currentFrame].slice());frames[currentFrame]=redoStack.pop();render();}

  function screenToGrid(e){const rect=canvas.getBoundingClientRect();return{x:Math.floor((e.clientX-rect.left)/zoom),y:Math.floor((e.clientY-rect.top)/zoom)};}

  function setPixel(x,y,c){
    if(!inBounds(x,y))return;
    frames[currentFrame][idx(x,y)]=c;
    if(symH){const mx=W-1-x;if(inBounds(mx,y))frames[currentFrame][idx(mx,y)]=c;}
    if(symV){const my=H-1-y;if(inBounds(x,my))frames[currentFrame][idx(x,my)]=c;}
    if(symH&&symV){const mx=W-1-x,my=H-1-y;if(inBounds(mx,my))frames[currentFrame][idx(mx,my)]=c;}
  }

  function paintBrush(x,y){
    const c=activeTool==='eraser'?null:activeColor;
    const half=Math.floor(brushSize/2);
    for(let dy=-half;dy<=half;dy++)for(let dx=-half;dx<=half;dx++)setPixel(x+dx,y+dy,c);
  }

  function drawLine(x0,y0,x1,y1,c){
    const dx=Math.abs(x1-x0),dy=Math.abs(y1-y0);
    const sx=x0<x1?1:-1,sy=y0<y1?1:-1;
    let err=dx-dy;
    while(true){
      setPixel(x0,y0,c);
      if(x0===x1&&y0===y1)break;
      const e2=2*err;
      if(e2>-dy){err-=dy;x0+=sx;}
      if(e2<dx){err+=dx;y0+=sy;}
    }
  }

  function drawCircle(cx,cy,r,c){
    let x=r,y=0,d=1-r;
    while(x>=y){
      setPixel(cx+x,cy+y,c);setPixel(cx-x,cy+y,c);
      setPixel(cx+x,cy-y,c);setPixel(cx-x,cy-y,c);
      setPixel(cx+y,cy+x,c);setPixel(cx-y,cy+x,c);
      setPixel(cx+y,cy-x,c);setPixel(cx-y,cy-x,c);
      y++;
      if(d<=0)d+=2*y+1;
      else{x--;d+=2*(y-x)+1;}
    }
  }

  function drawRect(x0,y0,x1,y1,c){
    const minX=Math.min(x0,x1),maxX=Math.max(x0,x1),minY=Math.min(y0,y1),maxY=Math.max(y0,y1);
    for(let x=minX;x<=maxX;x++){setPixel(x,minY,c);setPixel(x,maxY,c);}
    for(let y=minY;y<=maxY;y++){setPixel(minX,y,c);setPixel(maxX,y,c);}
  }

  function floodFill(sx,sy,fillColor){
    if(!inBounds(sx,sy))return;
    const target=frames[currentFrame][idx(sx,sy)];
    if(target===fillColor)return;
    const stack=[{x:sx,y:sy}];const visited=new Set();
    while(stack.length){
      const{x,y}=stack.pop();const key=x+','+y;
      if(visited.has(key))continue;visited.add(key);
      if(!inBounds(x,y))continue;
      if(frames[currentFrame][idx(x,y)]!==target)continue;
      frames[currentFrame][idx(x,y)]=fillColor;
      stack.push({x:x+1,y},{x:x-1,y},{x,y:y+1},{x,y:y-1});
    }
  }

  function render(){
    canvas.width=W*zoom;canvas.height=H*zoom;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // Onion skin
    if(onionSkin&&currentFrame>0){
      ctx.globalAlpha=0.3;
      const prev=frames[currentFrame-1];
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){
        const c=prev[idx(x,y)];if(c){ctx.fillStyle=c;ctx.fillRect(x*zoom,y*zoom,zoom,zoom);}
      }
      ctx.globalAlpha=1.0;
    }
    // Current frame
    const data=frames[currentFrame];
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const c=data[idx(x,y)];if(c){ctx.fillStyle=c;ctx.fillRect(x*zoom,y*zoom,zoom,zoom);}
    }
    if(showGrid&&zoom>=4){
      ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.lineWidth=0.5;
      for(let x=0;x<=W;x++){ctx.beginPath();ctx.moveTo(x*zoom,0);ctx.lineTo(x*zoom,H*zoom);ctx.stroke();}
      for(let y=0;y<=H;y++){ctx.beginPath();ctx.moveTo(0,y*zoom);ctx.lineTo(W*zoom,y*zoom);ctx.stroke();}
    }
  }

  function updateFrameStatus(){document.getElementById('statusFrame').textContent='Frame: '+(currentFrame+1)+'/'+frames.length;}

  canvas.addEventListener('mousedown',e=>{
    const g=screenToGrid(e);
    if(activeTool==='eyedropper'){const c=frames[currentFrame][idx(g.x,g.y)];if(c){activeColor=c;document.querySelectorAll('.swatch').forEach(s=>s.classList.toggle('active',s.dataset.color===activeColor));}return;}
    if(activeTool==='fill'){saveState();floodFill(g.x,g.y,activeColor);render();return;}
    if(activeTool==='line'||activeTool==='circle'||activeTool==='rect'){lineStart=g;return;}
    saveState();painting=true;paintBrush(g.x,g.y);render();
  });
  canvas.addEventListener('mousemove',e=>{
    const g=screenToGrid(e);
    document.getElementById('statusPos').textContent=g.x+', '+g.y;
    if(painting){paintBrush(g.x,g.y);render();}
  });
  canvas.addEventListener('mouseup',e=>{
    if(lineStart){
      const g=screenToGrid(e);saveState();
      if(activeTool==='line')drawLine(lineStart.x,lineStart.y,g.x,g.y,activeColor);
      else if(activeTool==='circle'){const r=Math.round(Math.hypot(g.x-lineStart.x,g.y-lineStart.y));drawCircle(lineStart.x,lineStart.y,r,activeColor);}
      else if(activeTool==='rect')drawRect(lineStart.x,lineStart.y,g.x,g.y,activeColor);
      lineStart=null;render();
    }
    painting=false;
  });
  canvas.addEventListener('mouseleave',()=>{painting=false;});

  document.querySelectorAll('.tool-btn').forEach(btn=>{if(!btn.dataset.tool)return;btn.addEventListener('click',()=>{document.querySelectorAll('.tool-btn[data-tool]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeTool=btn.dataset.tool;document.getElementById('statusTool').textContent='Tool: '+btn.textContent;});});
  document.querySelectorAll('.swatch').forEach(s=>{s.addEventListener('click',()=>{activeColor=s.dataset.color;document.querySelectorAll('.swatch').forEach(sw=>sw.classList.toggle('active',sw.dataset.color===activeColor));});});
  document.getElementById('brushSize').addEventListener('input',e=>{brushSize=+e.target.value;});
  document.getElementById('showGrid').addEventListener('change',e=>{showGrid=e.target.checked;render();});
  document.getElementById('symH').addEventListener('change',e=>{symH=e.target.checked;});
  document.getElementById('symV').addEventListener('change',e=>{symV=e.target.checked;});
  document.getElementById('zoomIn').addEventListener('click',()=>{zoom=Math.min(zoom+2,16);document.getElementById('zoomLabel').textContent=Math.round(zoom*100/DISPLAY_ZOOM*100)+'%';render();});
  document.getElementById('zoomOut').addEventListener('click',()=>{zoom=Math.max(zoom-2,2);document.getElementById('zoomLabel').textContent=Math.round(zoom*100/DISPLAY_ZOOM*100)+'%';render();});
  document.getElementById('onionSkin').addEventListener('change',e=>{onionSkin=e.target.checked;render();});
  document.getElementById('fpsSlider').addEventListener('input',e=>{fps=+e.target.value;document.getElementById('fpsVal').textContent=fps;});

  document.getElementById('addFrame').addEventListener('click',()=>{
    frames.push(Array.from({length:W*H},()=>null));
    currentFrame=frames.length-1;
    const el=document.createElement('div');el.className='frame-item active';el.dataset.frame=currentFrame;el.textContent='Frame '+(currentFrame+1);
    document.querySelectorAll('.frame-item').forEach(f=>f.classList.remove('active'));
    document.getElementById('frameList').appendChild(el);
    el.addEventListener('click',()=>{document.querySelectorAll('.frame-item').forEach(f=>f.classList.remove('active'));el.classList.add('active');currentFrame=+el.dataset.frame;updateFrameStatus();render();});
    updateFrameStatus();render();
  });
  document.querySelectorAll('.frame-item').forEach(f=>{f.addEventListener('click',()=>{document.querySelectorAll('.frame-item').forEach(ff=>ff.classList.remove('active'));f.classList.add('active');currentFrame=+f.dataset.frame;updateFrameStatus();render();});});

  document.getElementById('playBtn').addEventListener('click',()=>{
    if(playInterval){clearInterval(playInterval);playInterval=null;document.getElementById('playBtn').textContent='▶ Play';return;}
    document.getElementById('playBtn').textContent='⏸ Pause';
    playInterval=setInterval(()=>{currentFrame=(currentFrame+1)%frames.length;document.querySelectorAll('.frame-item').forEach((f,i)=>f.classList.toggle('active',i===currentFrame));updateFrameStatus();render();},1000/fps);
  });

  document.addEventListener('keydown',e=>{
    if(e.ctrlKey&&e.key==='z'){e.preventDefault();undo();}
    else if(e.ctrlKey&&e.key==='y'){e.preventDefault();redo();}
  });

  render();
})();`;

  return { workspaceHtml, styles, script };
}

// ─── 3. Voxel Editor ─────────────────────────────────────────────────────────

export function voxelContent(): EditorContent {
  const palette = [
    "#1a1c2c","#5d275d","#b13e53","#ef7d57","#ffcd75","#a7f070","#38b764","#257179",
    "#29366f","#3b5dc9","#41a6f6","#73eff7","#f4f4f4","#94b0c2","#566c86","#333c57",
    "#6b3e75","#c04040","#e88040","#e8d040","#40c040","#40a0c0","#4040c0","#8040c0",
    "#c08080","#80c080","#8080c0","#c0c080","#c080c0","#80c0c0","#808080","#404040",
  ];
  const tools = [
    { key: "pencil", label: "Pencil", shortcut: "B" },
    { key: "eraser", label: "Eraser", shortcut: "E" },
    { key: "fill", label: "Fill", shortcut: "G" },
    { key: "extrude", label: "Extrude", shortcut: "X" },
    { key: "hollow", label: "Hollow", shortcut: "H" },
  ];

  const workspaceHtml = `
<div class="grid-editor">
  <div class="toolbar">
    <div class="tool-group">
      ${tools.map((t, i) => `<button class="tool-btn${i === 0 ? " active" : ""}" data-tool="${t.key}" title="${t.label} (${t.shortcut})">${t.label}</button>`).join("")}
    </div>
    <div class="tool-group">
      <label>Z-Slice: <input type="range" id="zSlider" min="0" max="15" value="0"><span id="zVal">0</span></label>
      <button id="zoomOut">−</button><span id="zoomLabel">100%</span><button id="zoomIn">+</button>
      <label><input type="checkbox" id="showGrid" checked> Grid</label>
    </div>
  </div>
  <div class="editor-body">
    <div class="palette-panel">
      <h3>Palette</h3>
      <div class="swatches">${palette.map((c, i) => `<div class="swatch${i === 0 ? " active" : ""}" data-color="${c}" style="background:${c};" title="${c}"></div>`).join("")}</div>
    </div>
    <div class="canvas-area">
      <canvas id="mainCanvas" width="${16 * 24}" height="${16 * 24}"></canvas>
    </div>
    <div class="props-panel">
      <h3>Iso Preview</h3>
      <canvas id="previewCanvas" width="180" height="180" style="border:1px solid var(--vscode-panel-border);background:#111;"></canvas>
      <div style="margin-top:12px;font-size:11px;">
        <div id="voxelCount">Voxels: 0</div>
      </div>
    </div>
  </div>
  <div class="status-bar">
    <span id="statusPos">0, 0, 0</span>
    <span id="statusSize">16×16×16</span>
    <span id="statusTool">Tool: Pencil</span>
    <span id="statusVoxels">Voxels: 0</span>
  </div>
</div>`;

  const styles = `
.grid-editor { display:flex; flex-direction:column; height:100%; font-family:var(--vscode-font-family); color:var(--vscode-foreground); background:var(--vscode-editor-background); }
.toolbar { display:flex; gap:12px; padding:6px 10px; background:var(--vscode-titleBar-activeBackground); border-bottom:1px solid var(--vscode-panel-border); align-items:center; flex-wrap:wrap; }
.tool-group { display:flex; gap:4px; align-items:center; }
.tool-btn { padding:4px 8px; border:1px solid var(--vscode-button-border,transparent); background:var(--vscode-button-secondaryBackground); color:var(--vscode-button-secondaryForeground); cursor:pointer; border-radius:3px; font-size:12px; }
.tool-btn.active { background:var(--vscode-button-background); color:var(--vscode-button-foreground); }
.editor-body { display:flex; flex:1; overflow:hidden; }
.palette-panel { width:160px; padding:8px; border-right:1px solid var(--vscode-panel-border); overflow-y:auto; }
.palette-panel h3, .props-panel h3 { margin:0 0 8px; font-size:12px; text-transform:uppercase; color:var(--vscode-descriptionForeground); }
.swatches { display:grid; grid-template-columns:repeat(4,1fr); gap:3px; }
.swatch { width:24px; height:24px; border-radius:3px; cursor:pointer; border:2px solid transparent; }
.swatch.active { border-color:var(--vscode-focusBorder); }
.canvas-area { flex:1; display:flex; align-items:center; justify-content:center; overflow:auto; background:var(--vscode-editor-background); }
#mainCanvas { border:1px solid var(--vscode-panel-border); image-rendering:pixelated; }
.props-panel { width:180px; padding:8px; border-left:1px solid var(--vscode-panel-border); overflow-y:auto; }
.status-bar { display:flex; gap:16px; padding:4px 10px; font-size:11px; background:var(--vscode-statusBar-background); color:var(--vscode-statusBar-foreground); border-top:1px solid var(--vscode-panel-border); }
label { font-size:12px; display:flex; align-items:center; gap:4px; }
input[type=range] { width:60px; }`;

  const script = `
(function(){
  const W=16,H=16,D=16,CELL=24;
  const PALETTE=${JSON.stringify(palette)};
  const canvas=document.getElementById('mainCanvas');
  const ctx=canvas.getContext('2d');
  const preview=document.getElementById('previewCanvas');
  const pctx=preview.getContext('2d');
  let zoom=1, showGrid=true, currentZ=0;
  let activeColor=PALETTE[0], activeTool='pencil';
  let painting=false;
  // 3D voxel data: voxels[z][y*W+x]
  const voxels=Array.from({length:D},()=>Array.from({length:W*H},()=>null));
  const undoStack=[],redoStack=[];const MAX_UNDO=50;

  function idx(x,y){return y*W+x;}
  function inBounds(x,y){return x>=0&&x<W&&y>=0&&y<H;}
  function saveState(){undoStack.push(voxels.map(s=>s.slice()));if(undoStack.length>MAX_UNDO)undoStack.shift();redoStack.length=0;}
  function undo(){if(!undoStack.length)return;redoStack.push(voxels.map(s=>s.slice()));const st=undoStack.pop();st.forEach((s,i)=>{for(let j=0;j<s.length;j++)voxels[i][j]=s[j];});render();}
  function redo(){if(!redoStack.length)return;undoStack.push(voxels.map(s=>s.slice()));const st=redoStack.pop();st.forEach((s,i)=>{for(let j=0;j<s.length;j++)voxels[i][j]=s[j];});render();}

  function screenToGrid(e){const rect=canvas.getBoundingClientRect();return{x:Math.floor((e.clientX-rect.left)/(CELL*zoom)),y:Math.floor((e.clientY-rect.top)/(CELL*zoom))};}

  function paintCell(x,y){
    if(!inBounds(x,y))return;
    if(activeTool==='eraser')voxels[currentZ][idx(x,y)]=null;
    else voxels[currentZ][idx(x,y)]=activeColor;
  }

  function floodFill(sx,sy,fillColor){
    if(!inBounds(sx,sy))return;
    const target=voxels[currentZ][idx(sx,sy)];
    if(target===fillColor)return;
    const stack=[{x:sx,y:sy}];const visited=new Set();
    while(stack.length){
      const{x,y}=stack.pop();const key=x+','+y;
      if(visited.has(key))continue;visited.add(key);
      if(!inBounds(x,y))continue;
      if(voxels[currentZ][idx(x,y)]!==target)continue;
      voxels[currentZ][idx(x,y)]=fillColor;
      stack.push({x:x+1,y},{x:x-1,y},{x,y:y+1},{x,y:y-1});
    }
  }

  function extrude(){
    if(currentZ>=D-1)return;
    saveState();
    voxels[currentZ+1]=voxels[currentZ].slice();
    currentZ++;document.getElementById('zSlider').value=currentZ;document.getElementById('zVal').textContent=currentZ;
    render();
  }

  function hollow(){
    saveState();
    const slice=voxels[currentZ];
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
      const surrounded=slice[idx(x-1,y)]&&slice[idx(x+1,y)]&&slice[idx(x,y-1)]&&slice[idx(x,y+1)];
      if(surrounded)slice[idx(x,y)]=null;
    }
    render();
  }

  function countVoxels(){let c=0;for(let z=0;z<D;z++)for(let i=0;i<W*H;i++)if(voxels[z][i])c++;return c;}

  function render(){
    canvas.width=W*CELL*zoom;canvas.height=H*CELL*zoom;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const slice=voxels[currentZ];
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const c=slice[idx(x,y)];
      if(c){ctx.fillStyle=c;ctx.fillRect(x*CELL*zoom,y*CELL*zoom,CELL*zoom,CELL*zoom);}
    }
    if(showGrid){
      ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=0.5;
      for(let x=0;x<=W;x++){ctx.beginPath();ctx.moveTo(x*CELL*zoom,0);ctx.lineTo(x*CELL*zoom,H*CELL*zoom);ctx.stroke();}
      for(let y=0;y<=H;y++){ctx.beginPath();ctx.moveTo(0,y*CELL*zoom);ctx.lineTo(W*CELL*zoom,y*CELL*zoom);ctx.stroke();}
    }
    const vc=countVoxels();
    document.getElementById('statusVoxels').textContent='Voxels: '+vc;
    document.getElementById('voxelCount').textContent='Voxels: '+vc;
    document.getElementById('statusPos').textContent='--, --, '+currentZ;
    renderPreview();
  }

  function renderPreview(){
    pctx.clearRect(0,0,180,180);
    const ox=90,oy=160;const sz=6;
    for(let z=0;z<D;z++){
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){
        const c=voxels[z][idx(x,y)];
        if(c){
          const ix=ox+(x-y)*sz*0.5;
          const iy=oy+(x+y)*sz*0.25-z*sz*0.5;
          pctx.fillStyle=c;pctx.fillRect(ix,iy,sz*0.6,sz*0.6);
        }
      }
    }
  }

  canvas.addEventListener('mousedown',e=>{
    const g=screenToGrid(e);
    if(activeTool==='fill'){saveState();floodFill(g.x,g.y,activeColor);render();return;}
    if(activeTool==='extrude'){extrude();return;}
    if(activeTool==='hollow'){hollow();return;}
    saveState();painting=true;paintCell(g.x,g.y);render();
  });
  canvas.addEventListener('mousemove',e=>{
    const g=screenToGrid(e);
    document.getElementById('statusPos').textContent=g.x+', '+g.y+', '+currentZ;
    if(painting){paintCell(g.x,g.y);render();}
  });
  canvas.addEventListener('mouseup',()=>{painting=false;});
  canvas.addEventListener('mouseleave',()=>{painting=false;});

  document.querySelectorAll('.tool-btn').forEach(btn=>{if(!btn.dataset.tool)return;btn.addEventListener('click',()=>{document.querySelectorAll('.tool-btn[data-tool]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeTool=btn.dataset.tool;document.getElementById('statusTool').textContent='Tool: '+btn.textContent;});});
  document.querySelectorAll('.swatch').forEach(s=>{s.addEventListener('click',()=>{activeColor=s.dataset.color;document.querySelectorAll('.swatch').forEach(sw=>sw.classList.toggle('active',sw.dataset.color===activeColor));});});
  document.getElementById('zSlider').addEventListener('input',e=>{currentZ=+e.target.value;document.getElementById('zVal').textContent=currentZ;render();});
  document.getElementById('showGrid').addEventListener('change',e=>{showGrid=e.target.checked;render();});
  document.getElementById('zoomIn').addEventListener('click',()=>{zoom=Math.min(zoom+0.25,3);document.getElementById('zoomLabel').textContent=Math.round(zoom*100)+'%';render();});
  document.getElementById('zoomOut').addEventListener('click',()=>{zoom=Math.max(zoom-0.25,0.5);document.getElementById('zoomLabel').textContent=Math.round(zoom*100)+'%';render();});

  document.addEventListener('keydown',e=>{
    if(e.ctrlKey&&e.key==='z'){e.preventDefault();undo();}
    else if(e.ctrlKey&&e.key==='y'){e.preventDefault();redo();}
  });

  render();
})();`;

  return { workspaceHtml, styles, script };
}

// ─── 4. Province Map Editor ──────────────────────────────────────────────────

export function provinceContent(): EditorContent {
  const provinceColors = [
    "#e6194b","#3cb44b","#ffe119","#4363d8","#f58231","#911eb4","#42d4f4","#f032e6",
    "#bfef45","#fabed4","#469990","#dcbeff","#9a6324","#fffac8","#800000","#aaffc3",
    "#808000","#ffd8b1","#000075","#a9a9a9","#ffffff","#e6beff","#aa6e28","#808080",
  ];

  const workspaceHtml = `
<div class="grid-editor">
  <div class="toolbar">
    <div class="tool-group">
      <button class="tool-btn active" data-tool="paint" title="Paint (B)">Paint</button>
      <button class="tool-btn" data-tool="eyedropper" title="Pick province (I)">Pick</button>
      <button class="tool-btn" data-tool="erase" title="Erase (E)">Erase</button>
    </div>
    <div class="tool-group">
      <button id="addProvince" class="tool-btn">+ Province</button>
      <label>Heatmap: <select id="heatmapMode"><option value="none">None</option><option value="population">Population</option><option value="wealth">Wealth</option></select></label>
      <button id="zoomOut">−</button><span id="zoomLabel">100%</span><button id="zoomIn">+</button>
      <label><input type="checkbox" id="showGrid" checked> Grid</label>
    </div>
  </div>
  <div class="editor-body">
    <div class="palette-panel">
      <h3>Provinces</h3>
      <div id="provinceList"></div>
    </div>
    <div class="canvas-area">
      <canvas id="mainCanvas" width="${64 * 16}" height="${36 * 16}"></canvas>
    </div>
    <div class="props-panel">
      <h3>Inspector</h3>
      <div id="inspector">
        <label>Name: <input type="text" id="provName" style="width:100%;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border);padding:2px 4px;"></label>
        <label>Population: <input type="number" id="provPop" min="0" value="1000" style="width:80px;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border);padding:2px 4px;"></label>
        <label>Wealth: <input type="number" id="provWealth" min="0" value="500" style="width:80px;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border);padding:2px 4px;"></label>
        <label>Type: <select id="provType" style="background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border);"><option value="land">Land</option><option value="sea">Sea</option></select></label>
        <div id="adjacencyInfo" style="margin-top:8px;font-size:11px;"></div>
      </div>
    </div>
  </div>
  <div class="status-bar">
    <span id="statusPos">0, 0</span>
    <span id="statusSize">64×36</span>
    <span id="statusProvince">Province: -</span>
    <span id="statusTool">Tool: Paint</span>
  </div>
</div>`;

  const styles = `
.grid-editor { display:flex; flex-direction:column; height:100%; font-family:var(--vscode-font-family); color:var(--vscode-foreground); background:var(--vscode-editor-background); }
.toolbar { display:flex; gap:12px; padding:6px 10px; background:var(--vscode-titleBar-activeBackground); border-bottom:1px solid var(--vscode-panel-border); align-items:center; flex-wrap:wrap; }
.tool-group { display:flex; gap:4px; align-items:center; }
.tool-btn { padding:4px 8px; border:1px solid var(--vscode-button-border,transparent); background:var(--vscode-button-secondaryBackground); color:var(--vscode-button-secondaryForeground); cursor:pointer; border-radius:3px; font-size:12px; }
.tool-btn.active { background:var(--vscode-button-background); color:var(--vscode-button-foreground); }
.editor-body { display:flex; flex:1; overflow:hidden; }
.palette-panel { width:160px; padding:8px; border-right:1px solid var(--vscode-panel-border); overflow-y:auto; }
.palette-panel h3, .props-panel h3 { margin:0 0 8px; font-size:12px; text-transform:uppercase; color:var(--vscode-descriptionForeground); }
.canvas-area { flex:1; display:flex; align-items:center; justify-content:center; overflow:auto; background:var(--vscode-editor-background); }
#mainCanvas { border:1px solid var(--vscode-panel-border); }
.props-panel { width:180px; padding:8px; border-left:1px solid var(--vscode-panel-border); overflow-y:auto; }
.props-panel label { display:block; margin-bottom:6px; font-size:12px; }
.prov-item { display:flex; align-items:center; gap:6px; padding:4px 6px; cursor:pointer; border-radius:3px; font-size:12px; margin-bottom:2px; }
.prov-item.active { background:var(--vscode-list-activeSelectionBackground); color:var(--vscode-list-activeSelectionForeground); }
.prov-item:hover { background:var(--vscode-list-hoverBackground); }
.prov-swatch { width:14px; height:14px; border-radius:2px; }
.status-bar { display:flex; gap:16px; padding:4px 10px; font-size:11px; background:var(--vscode-statusBar-background); color:var(--vscode-statusBar-foreground); border-top:1px solid var(--vscode-panel-border); }
label { font-size:12px; }
select { font-size:12px; }`;

  const script = `
(function(){
  const W=64,H=36,CELL=16;
  const COLORS=${JSON.stringify(provinceColors)};
  const canvas=document.getElementById('mainCanvas');
  const ctx=canvas.getContext('2d');
  let zoom=1,showGrid=true,activeTool='paint',painting=false;
  let heatmapMode='none';

  const provinces=[{id:0,name:'Province 1',color:COLORS[0],population:1000,wealth:500,type:'land'}];
  let activeProvince=0;
  const grid=Array.from({length:W*H},()=>-1);
  const undoStack=[],redoStack=[];const MAX_UNDO=50;

  function idx(x,y){return y*W+x;}
  function inBounds(x,y){return x>=0&&x<W&&y>=0&&y<H;}
  function saveState(){undoStack.push(grid.slice());if(undoStack.length>MAX_UNDO)undoStack.shift();redoStack.length=0;}
  function undo(){if(!undoStack.length)return;redoStack.push(grid.slice());const s=undoStack.pop();for(let i=0;i<s.length;i++)grid[i]=s[i];render();}
  function redo(){if(!redoStack.length)return;undoStack.push(grid.slice());const s=redoStack.pop();for(let i=0;i<s.length;i++)grid[i]=s[i];render();}
  function screenToGrid(e){const rect=canvas.getBoundingClientRect();return{x:Math.floor((e.clientX-rect.left)/(CELL*zoom)),y:Math.floor((e.clientY-rect.top)/(CELL*zoom))};}

  function getAdjacency(provId){
    const neighbors=new Set();
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      if(grid[idx(x,y)]!==provId)continue;
      [{x:x+1,y},{x:x-1,y},{x,y:y+1},{x,y:y-1}].forEach(n=>{
        if(inBounds(n.x,n.y)){const nid=grid[idx(n.x,n.y)];if(nid!==-1&&nid!==provId)neighbors.add(nid);}
      });
    }
    return[...neighbors];
  }

  function renderProvinceList(){
    const list=document.getElementById('provinceList');
    list.innerHTML=provinces.map((p,i)=>'<div class="prov-item'+(i===activeProvince?' active':'')+'" data-id="'+i+'"><div class="prov-swatch" style="background:'+p.color+';"></div><span>'+p.name+'</span></div>').join('');
    list.querySelectorAll('.prov-item').forEach(el=>{
      el.addEventListener('click',()=>{activeProvince=+el.dataset.id;renderProvinceList();updateInspector();});
    });
  }

  function updateInspector(){
    const p=provinces[activeProvince];
    if(!p)return;
    document.getElementById('provName').value=p.name;
    document.getElementById('provPop').value=p.population;
    document.getElementById('provWealth').value=p.wealth;
    document.getElementById('provType').value=p.type;
    const adj=getAdjacency(activeProvince);
    document.getElementById('adjacencyInfo').textContent='Neighbors: '+(adj.length?adj.map(a=>provinces[a]?.name||'?').join(', '):'none');
    document.getElementById('statusProvince').textContent='Province: '+p.name;
  }

  function heatColor(value,max){
    const t=Math.min(value/max,1);
    const r=Math.round(255*t),g=Math.round(255*(1-t));
    return 'rgb('+r+','+g+',80)';
  }

  function render(){
    canvas.width=W*CELL*zoom;canvas.height=H*CELL*zoom;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    let maxPop=1,maxW=1;
    provinces.forEach(p=>{if(p.population>maxPop)maxPop=p.population;if(p.wealth>maxW)maxW=p.wealth;});
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const pid=grid[idx(x,y)];
      if(pid>=0){
        const p=provinces[pid];
        if(heatmapMode==='population')ctx.fillStyle=heatColor(p.population,maxPop);
        else if(heatmapMode==='wealth')ctx.fillStyle=heatColor(p.wealth,maxW);
        else ctx.fillStyle=p.color;
        ctx.fillRect(x*CELL*zoom,y*CELL*zoom,CELL*zoom,CELL*zoom);
      }
    }
    if(showGrid){
      ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=0.5;
      for(let x=0;x<=W;x++){ctx.beginPath();ctx.moveTo(x*CELL*zoom,0);ctx.lineTo(x*CELL*zoom,H*CELL*zoom);ctx.stroke();}
      for(let y=0;y<=H;y++){ctx.beginPath();ctx.moveTo(0,y*CELL*zoom);ctx.lineTo(W*CELL*zoom,y*CELL*zoom);ctx.stroke();}
    }
  }

  canvas.addEventListener('mousedown',e=>{
    const g=screenToGrid(e);
    if(activeTool==='eyedropper'){if(inBounds(g.x,g.y)){const pid=grid[idx(g.x,g.y)];if(pid>=0){activeProvince=pid;renderProvinceList();updateInspector();}}return;}
    saveState();painting=true;
    if(inBounds(g.x,g.y)){grid[idx(g.x,g.y)]=activeTool==='erase'?-1:activeProvince;}
    render();
  });
  canvas.addEventListener('mousemove',e=>{
    const g=screenToGrid(e);
    document.getElementById('statusPos').textContent=g.x+', '+g.y;
    if(painting&&inBounds(g.x,g.y)){grid[idx(g.x,g.y)]=activeTool==='erase'?-1:activeProvince;render();}
  });
  canvas.addEventListener('mouseup',()=>{painting=false;});
  canvas.addEventListener('mouseleave',()=>{painting=false;});

  document.querySelectorAll('.tool-btn[data-tool]').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.tool-btn[data-tool]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeTool=btn.dataset.tool;document.getElementById('statusTool').textContent='Tool: '+btn.textContent;});});
  document.getElementById('addProvince').addEventListener('click',()=>{
    const c=COLORS[provinces.length%COLORS.length];
    provinces.push({id:provinces.length,name:'Province '+(provinces.length+1),color:c,population:1000,wealth:500,type:'land'});
    activeProvince=provinces.length-1;renderProvinceList();updateInspector();
  });
  document.getElementById('provName').addEventListener('input',e=>{provinces[activeProvince].name=e.target.value;renderProvinceList();updateInspector();});
  document.getElementById('provPop').addEventListener('input',e=>{provinces[activeProvince].population=+e.target.value;if(heatmapMode==='population')render();});
  document.getElementById('provWealth').addEventListener('input',e=>{provinces[activeProvince].wealth=+e.target.value;if(heatmapMode==='wealth')render();});
  document.getElementById('provType').addEventListener('change',e=>{provinces[activeProvince].type=e.target.value;});
  document.getElementById('heatmapMode').addEventListener('change',e=>{heatmapMode=e.target.value;render();});
  document.getElementById('showGrid').addEventListener('change',e=>{showGrid=e.target.checked;render();});
  document.getElementById('zoomIn').addEventListener('click',()=>{zoom=Math.min(zoom+0.25,3);document.getElementById('zoomLabel').textContent=Math.round(zoom*100)+'%';render();});
  document.getElementById('zoomOut').addEventListener('click',()=>{zoom=Math.max(zoom-0.25,0.5);document.getElementById('zoomLabel').textContent=Math.round(zoom*100)+'%';render();});

  document.addEventListener('keydown',e=>{
    if(e.ctrlKey&&e.key==='z'){e.preventDefault();undo();}
    else if(e.ctrlKey&&e.key==='y'){e.preventDefault();redo();}
  });

  renderProvinceList();updateInspector();render();
})();`;

  return { workspaceHtml, styles, script };
}

// ─── 5. NavMesh Editor ───────────────────────────────────────────────────────

export function navMeshContent(): EditorContent {
  const workspaceHtml = `
<div class="grid-editor">
  <div class="toolbar">
    <div class="tool-group">
      <button class="tool-btn active" data-tool="polygon" title="Draw polygon (P)">Polygon</button>
      <button class="tool-btn" data-tool="subtract" title="Cut hole (H)">Subtract</button>
      <button class="tool-btn" data-tool="select" title="Select (S)">Select</button>
      <button class="tool-btn" data-tool="vertex" title="Move vertex (V)">Vertex</button>
    </div>
    <div class="tool-group">
      <label>Agent radius: <input type="range" id="agentRadius" min="0" max="30" value="8"><span id="radiusVal">8</span></label>
      <label>Cost: <input type="range" id="costSlider" min="10" max="30" step="1" value="10"><span id="costVal">1.0</span></label>
      <label><input type="checkbox" id="showRadius"> Show shrink</label>
    </div>
  </div>
  <div class="editor-body">
    <div class="palette-panel">
      <h3>Polygons</h3>
      <div id="polyList"></div>
      <button id="deletePoly" class="tool-btn" style="margin-top:8px;">Delete selected</button>
    </div>
    <div class="canvas-area">
      <canvas id="mainCanvas" width="960" height="540"></canvas>
    </div>
    <div class="props-panel">
      <h3>Properties</h3>
      <div id="polyProps" style="font-size:12px;">
        <div>Vertices: <span id="vertCount">-</span></div>
        <div>Cost: <span id="polyCost">-</span></div>
        <div>Area: <span id="polyArea">-</span></div>
      </div>
    </div>
  </div>
  <div class="status-bar">
    <span id="statusPos">0, 0</span>
    <span id="statusSize">960×540</span>
    <span id="statusTool">Tool: Polygon</span>
    <span id="statusPolys">Polygons: 0</span>
  </div>
</div>`;

  const styles = `
.grid-editor { display:flex; flex-direction:column; height:100%; font-family:var(--vscode-font-family); color:var(--vscode-foreground); background:var(--vscode-editor-background); }
.toolbar { display:flex; gap:12px; padding:6px 10px; background:var(--vscode-titleBar-activeBackground); border-bottom:1px solid var(--vscode-panel-border); align-items:center; flex-wrap:wrap; }
.tool-group { display:flex; gap:4px; align-items:center; }
.tool-btn { padding:4px 8px; border:1px solid var(--vscode-button-border,transparent); background:var(--vscode-button-secondaryBackground); color:var(--vscode-button-secondaryForeground); cursor:pointer; border-radius:3px; font-size:12px; }
.tool-btn.active { background:var(--vscode-button-background); color:var(--vscode-button-foreground); }
.editor-body { display:flex; flex:1; overflow:hidden; }
.palette-panel { width:160px; padding:8px; border-right:1px solid var(--vscode-panel-border); overflow-y:auto; }
.palette-panel h3, .props-panel h3 { margin:0 0 8px; font-size:12px; text-transform:uppercase; color:var(--vscode-descriptionForeground); }
.canvas-area { flex:1; display:flex; align-items:center; justify-content:center; overflow:auto; }
#mainCanvas { border:1px solid var(--vscode-panel-border); background:#1a1c2c; cursor:crosshair; }
.props-panel { width:180px; padding:8px; border-left:1px solid var(--vscode-panel-border); overflow-y:auto; }
.poly-item { padding:4px 6px; cursor:pointer; border-radius:3px; font-size:12px; margin-bottom:2px; display:flex; align-items:center; gap:6px; }
.poly-item.active { background:var(--vscode-list-activeSelectionBackground); color:var(--vscode-list-activeSelectionForeground); }
.poly-item:hover { background:var(--vscode-list-hoverBackground); }
.poly-color { width:12px; height:12px; border-radius:2px; }
.status-bar { display:flex; gap:16px; padding:4px 10px; font-size:11px; background:var(--vscode-statusBar-background); color:var(--vscode-statusBar-foreground); border-top:1px solid var(--vscode-panel-border); }
label { font-size:12px; display:flex; align-items:center; gap:4px; }
input[type=range] { width:60px; }`;

  const script = `
(function(){
  const canvas=document.getElementById('mainCanvas');
  const ctx=canvas.getContext('2d');
  let activeTool='polygon';
  let agentRadius=8, showRadius=false;

  const POLY_COLORS=['rgba(56,183,100,0.4)','rgba(65,166,246,0.4)','rgba(239,125,87,0.4)','rgba(167,240,112,0.4)','rgba(177,62,83,0.4)','rgba(115,239,247,0.4)','rgba(93,39,93,0.4)','rgba(255,205,117,0.4)'];
  const polygons=[];
  let selectedPoly=-1;
  let currentVerts=[];
  let draggingVertex=null;
  const undoStack=[],redoStack=[];const MAX_UNDO=50;

  function saveState(){undoStack.push(JSON.parse(JSON.stringify(polygons)));if(undoStack.length>MAX_UNDO)undoStack.shift();redoStack.length=0;}
  function undo(){if(!undoStack.length)return;redoStack.push(JSON.parse(JSON.stringify(polygons)));const s=undoStack.pop();polygons.length=0;s.forEach(p=>polygons.push(p));render();updatePolyList();}
  function redo(){if(!redoStack.length)return;undoStack.push(JSON.parse(JSON.stringify(polygons)));const s=redoStack.pop();polygons.length=0;s.forEach(p=>polygons.push(p));render();updatePolyList();}

  function getMousePos(e){const rect=canvas.getBoundingClientRect();return{x:e.clientX-rect.left,y:e.clientY-rect.top};}

  function polyArea(verts){
    let a=0;
    for(let i=0;i<verts.length;i++){const j=(i+1)%verts.length;a+=verts[i].x*verts[j].y-verts[j].x*verts[i].y;}
    return Math.abs(a/2);
  }

  function shrinkPoly(verts,amount){
    if(verts.length<3)return verts;
    const cx=verts.reduce((s,v)=>s+v.x,0)/verts.length;
    const cy=verts.reduce((s,v)=>s+v.y,0)/verts.length;
    return verts.map(v=>{
      const dx=v.x-cx,dy=v.y-cy;
      const dist=Math.hypot(dx,dy);
      if(dist===0)return{x:v.x,y:v.y};
      const factor=Math.max(0,(dist-amount)/dist);
      return{x:cx+dx*factor,y:cy+dy*factor};
    });
  }

  function pointInPoly(px,py,verts){
    let inside=false;
    for(let i=0,j=verts.length-1;i<verts.length;j=i++){
      const xi=verts[i].x,yi=verts[i].y,xj=verts[j].x,yj=verts[j].y;
      if(((yi>py)!==(yj>py))&&(px<(xj-xi)*(py-yi)/(yj-yi)+xi))inside=!inside;
    }
    return inside;
  }

  function findVertex(pos){
    for(let pi=0;pi<polygons.length;pi++){
      for(let vi=0;vi<polygons[pi].verts.length;vi++){
        const v=polygons[pi].verts[vi];
        if(Math.hypot(v.x-pos.x,v.y-pos.y)<8)return{pi,vi};
      }
    }
    return null;
  }

  function render(){
    ctx.clearRect(0,0,960,540);
    // Draw polygons
    polygons.forEach((poly,pi)=>{
      ctx.beginPath();
      poly.verts.forEach((v,i)=>{if(i===0)ctx.moveTo(v.x,v.y);else ctx.lineTo(v.x,v.y);});
      ctx.closePath();
      ctx.fillStyle=poly.color;ctx.fill();
      ctx.strokeStyle=pi===selectedPoly?'#fff':'rgba(255,255,255,0.6)';ctx.lineWidth=pi===selectedPoly?2:1;ctx.stroke();
      // Vertices
      poly.verts.forEach(v=>{ctx.beginPath();ctx.arc(v.x,v.y,4,0,Math.PI*2);ctx.fillStyle=pi===selectedPoly?'#ffcd75':'#94b0c2';ctx.fill();});
      // Agent radius preview
      if(showRadius&&agentRadius>0){
        const shrunk=shrinkPoly(poly.verts,agentRadius);
        ctx.beginPath();shrunk.forEach((v,i)=>{if(i===0)ctx.moveTo(v.x,v.y);else ctx.lineTo(v.x,v.y);});ctx.closePath();
        ctx.strokeStyle='rgba(255,205,117,0.5)';ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([]);
      }
      // Cost label
      if(poly.cost!==1.0){
        const cx=poly.verts.reduce((s,v)=>s+v.x,0)/poly.verts.length;
        const cy=poly.verts.reduce((s,v)=>s+v.y,0)/poly.verts.length;
        ctx.fillStyle='#fff';ctx.font='11px monospace';ctx.textAlign='center';ctx.fillText(poly.cost.toFixed(1),cx,cy);
      }
    });
    // Draw current polygon in progress
    if(currentVerts.length>0){
      ctx.beginPath();currentVerts.forEach((v,i)=>{if(i===0)ctx.moveTo(v.x,v.y);else ctx.lineTo(v.x,v.y);});
      ctx.strokeStyle='#a7f070';ctx.lineWidth=2;ctx.stroke();
      currentVerts.forEach(v=>{ctx.beginPath();ctx.arc(v.x,v.y,4,0,Math.PI*2);ctx.fillStyle='#a7f070';ctx.fill();});
    }
    document.getElementById('statusPolys').textContent='Polygons: '+polygons.length;
    updateProps();
  }

  function updatePolyList(){
    const list=document.getElementById('polyList');
    list.innerHTML=polygons.map((p,i)=>'<div class="poly-item'+(i===selectedPoly?' active':'')+'" data-id="'+i+'"><div class="poly-color" style="background:'+p.color.replace('0.4','1')+';"></div>Poly '+(i+1)+' (cost:'+p.cost.toFixed(1)+')</div>').join('');
    list.querySelectorAll('.poly-item').forEach(el=>{el.addEventListener('click',()=>{selectedPoly=+el.dataset.id;updatePolyList();render();});});
  }

  function updateProps(){
    if(selectedPoly>=0&&selectedPoly<polygons.length){
      const p=polygons[selectedPoly];
      document.getElementById('vertCount').textContent=p.verts.length;
      document.getElementById('polyCost').textContent=p.cost.toFixed(1);
      document.getElementById('polyArea').textContent=Math.round(polyArea(p.verts))+'px²';
    } else {
      document.getElementById('vertCount').textContent='-';
      document.getElementById('polyCost').textContent='-';
      document.getElementById('polyArea').textContent='-';
    }
  }

  canvas.addEventListener('mousedown',e=>{
    const pos=getMousePos(e);
    if(activeTool==='vertex'){
      draggingVertex=findVertex(pos);
      if(draggingVertex)saveState();
      return;
    }
    if(activeTool==='select'){
      selectedPoly=-1;
      for(let i=polygons.length-1;i>=0;i--){
        if(pointInPoly(pos.x,pos.y,polygons[i].verts)){selectedPoly=i;break;}
      }
      updatePolyList();render();return;
    }
  });

  canvas.addEventListener('mousemove',e=>{
    const pos=getMousePos(e);
    document.getElementById('statusPos').textContent=Math.round(pos.x)+', '+Math.round(pos.y);
    if(draggingVertex){
      polygons[draggingVertex.pi].verts[draggingVertex.vi]=pos;render();
    }
  });

  canvas.addEventListener('mouseup',()=>{draggingVertex=null;});

  canvas.addEventListener('click',e=>{
    if(activeTool!=='polygon'&&activeTool!=='subtract')return;
    const pos=getMousePos(e);
    currentVerts.push(pos);render();
  });

  canvas.addEventListener('dblclick',e=>{
    if((activeTool!=='polygon'&&activeTool!=='subtract')||currentVerts.length<3)return;
    saveState();
    const cost=+document.getElementById('costSlider').value/10;
    const color=POLY_COLORS[polygons.length%POLY_COLORS.length];
    if(activeTool==='polygon'){
      polygons.push({verts:currentVerts.slice(),cost,color,type:'walk'});
    } else {
      polygons.push({verts:currentVerts.slice(),cost,color:'rgba(200,50,50,0.4)',type:'hole'});
    }
    currentVerts=[];selectedPoly=polygons.length-1;
    updatePolyList();render();
  });

  document.querySelectorAll('.tool-btn[data-tool]').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.tool-btn[data-tool]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeTool=btn.dataset.tool;currentVerts=[];document.getElementById('statusTool').textContent='Tool: '+btn.textContent;render();});});
  document.getElementById('agentRadius').addEventListener('input',e=>{agentRadius=+e.target.value;document.getElementById('radiusVal').textContent=agentRadius;render();});
  document.getElementById('costSlider').addEventListener('input',e=>{
    const v=+e.target.value/10;document.getElementById('costVal').textContent=v.toFixed(1);
    if(selectedPoly>=0){polygons[selectedPoly].cost=v;updatePolyList();render();}
  });
  document.getElementById('showRadius').addEventListener('change',e=>{showRadius=e.target.checked;render();});
  document.getElementById('deletePoly').addEventListener('click',()=>{if(selectedPoly<0)return;saveState();polygons.splice(selectedPoly,1);selectedPoly=-1;updatePolyList();render();});

  document.addEventListener('keydown',e=>{
    if(e.ctrlKey&&e.key==='z'){e.preventDefault();undo();}
    else if(e.ctrlKey&&e.key==='y'){e.preventDefault();redo();}
    else if(e.key==='Escape'){currentVerts=[];render();}
  });

  updatePolyList();render();
})();`;

  return { workspaceHtml, styles, script };
}

// ─── 6. Tileset Editor ───────────────────────────────────────────────────────

export function tilesetContent(): EditorContent {
  const workspaceHtml = `
<div class="grid-editor">
  <div class="toolbar">
    <div class="tool-group">
      <button class="tool-btn active" data-tool="select" title="Select tile (S)">Select</button>
      <button class="tool-btn" data-tool="collision" title="Draw collision (C)">Collision</button>
      <button class="tool-btn" data-tool="tag" title="Tag tile (T)">Tag</button>
      <button class="tool-btn" data-tool="animate" title="Animation link (A)">Animate</button>
    </div>
    <div class="tool-group">
      <label><input type="checkbox" id="showGrid" checked> Grid</label>
      <label><input type="checkbox" id="showCollision" checked> Collision</label>
      <label><input type="checkbox" id="showTags" checked> Tags</label>
    </div>
  </div>
  <div class="editor-body">
    <div class="palette-panel">
      <h3>Tile Colors</h3>
      <div class="swatches" id="tileColors"></div>
      <h3 style="margin-top:12px;">Tags</h3>
      <div id="tagPalette">
        <button class="tag-btn" data-tag="solid">solid</button>
        <button class="tag-btn" data-tag="water">water</button>
        <button class="tag-btn" data-tag="ice">ice</button>
        <button class="tag-btn" data-tag="damage">damage</button>
      </div>
    </div>
    <div class="canvas-area">
      <canvas id="mainCanvas" width="${8 * 32}" height="${8 * 32}"></canvas>
    </div>
    <div class="props-panel">
      <h3>Tile Properties</h3>
      <div id="tileProps" style="font-size:12px;">
        <div>Selected: <span id="selTile">-</span></div>
        <div>Tags: <span id="selTags">-</span></div>
        <div>Collision: <span id="selCollision">none</span></div>
        <div>Anim seq: <span id="selAnim">-</span></div>
      </div>
      <h3 style="margin-top:12px;">Animation Sequences</h3>
      <div id="animList" style="font-size:11px;"></div>
      <button id="newAnim" class="tool-btn" style="margin-top:6px;">+ Sequence</button>
    </div>
  </div>
  <div class="status-bar">
    <span id="statusPos">0, 0</span>
    <span id="statusSize">8×8 tiles (32px each)</span>
    <span id="statusTool">Tool: Select</span>
    <span id="statusSel">Tile: -</span>
  </div>
</div>`;

  const styles = `
.grid-editor { display:flex; flex-direction:column; height:100%; font-family:var(--vscode-font-family); color:var(--vscode-foreground); background:var(--vscode-editor-background); }
.toolbar { display:flex; gap:12px; padding:6px 10px; background:var(--vscode-titleBar-activeBackground); border-bottom:1px solid var(--vscode-panel-border); align-items:center; flex-wrap:wrap; }
.tool-group { display:flex; gap:4px; align-items:center; }
.tool-btn { padding:4px 8px; border:1px solid var(--vscode-button-border,transparent); background:var(--vscode-button-secondaryBackground); color:var(--vscode-button-secondaryForeground); cursor:pointer; border-radius:3px; font-size:12px; }
.tool-btn.active { background:var(--vscode-button-background); color:var(--vscode-button-foreground); }
.editor-body { display:flex; flex:1; overflow:hidden; }
.palette-panel { width:160px; padding:8px; border-right:1px solid var(--vscode-panel-border); overflow-y:auto; }
.palette-panel h3, .props-panel h3 { margin:0 0 8px; font-size:12px; text-transform:uppercase; color:var(--vscode-descriptionForeground); }
.swatches { display:grid; grid-template-columns:repeat(4,1fr); gap:3px; }
.swatch { width:24px; height:24px; border-radius:3px; cursor:pointer; border:2px solid transparent; }
.swatch.active { border-color:var(--vscode-focusBorder); }
.canvas-area { flex:1; display:flex; align-items:center; justify-content:center; overflow:auto; background:var(--vscode-editor-background); }
#mainCanvas { border:1px solid var(--vscode-panel-border); image-rendering:pixelated; }
.props-panel { width:180px; padding:8px; border-left:1px solid var(--vscode-panel-border); overflow-y:auto; }
.tag-btn { display:inline-block; padding:2px 6px; margin:2px; font-size:11px; border:1px solid var(--vscode-button-border,transparent); background:var(--vscode-button-secondaryBackground); color:var(--vscode-button-secondaryForeground); cursor:pointer; border-radius:3px; }
.tag-btn.active { background:var(--vscode-button-background); color:var(--vscode-button-foreground); }
.anim-item { padding:3px 6px; font-size:11px; cursor:pointer; border-radius:3px; margin-bottom:2px; }
.anim-item.active { background:var(--vscode-list-activeSelectionBackground); color:var(--vscode-list-activeSelectionForeground); }
.anim-item:hover { background:var(--vscode-list-hoverBackground); }
.status-bar { display:flex; gap:16px; padding:4px 10px; font-size:11px; background:var(--vscode-statusBar-background); color:var(--vscode-statusBar-foreground); border-top:1px solid var(--vscode-panel-border); }
label { font-size:12px; display:flex; align-items:center; gap:4px; }`;

  const script = `
(function(){
  const COLS=8,ROWS=8,TILE_SIZE=32;
  const canvas=document.getElementById('mainCanvas');
  const ctx=canvas.getContext('2d');
  let activeTool='select',showGrid=true,showCollision=true,showTags=true;
  let selectedTile=-1, activeTag='solid', activeAnim=-1;
  let collisionDrawing=false, collisionStart=null;

  // Generate placeholder tile colors
  const tileColors=[];
  const baseColors=['#2d5a27','#4a8c3f','#7bc96f','#f5e6c8','#c4a35a','#8b6914','#5b8dd9','#3b5dc9','#ef7d57','#b13e53','#ffcd75','#94b0c2','#1a1c2c','#566c86','#333c57','#f4f4f4'];
  for(let i=0;i<COLS*ROWS;i++) tileColors.push(baseColors[i%baseColors.length]);

  // Tile data
  const tiles=Array.from({length:COLS*ROWS},()=>({tags:new Set(),collision:null,animSeq:-1}));
  const animSequences=[];
  const undoStack=[],redoStack=[];const MAX_UNDO=50;

  function saveState(){undoStack.push(JSON.parse(JSON.stringify(tiles.map(t=>({tags:[...t.tags],collision:t.collision,animSeq:t.animSeq})))));if(undoStack.length>MAX_UNDO)undoStack.shift();redoStack.length=0;}
  function undo(){if(!undoStack.length)return;redoStack.push(JSON.parse(JSON.stringify(tiles.map(t=>({tags:[...t.tags],collision:t.collision,animSeq:t.animSeq})))));const s=undoStack.pop();s.forEach((d,i)=>{tiles[i].tags=new Set(d.tags);tiles[i].collision=d.collision;tiles[i].animSeq=d.animSeq;});render();updateProps();}
  function redo(){if(!redoStack.length)return;undoStack.push(JSON.parse(JSON.stringify(tiles.map(t=>({tags:[...t.tags],collision:t.collision,animSeq:t.animSeq})))));const s=redoStack.pop();s.forEach((d,i)=>{tiles[i].tags=new Set(d.tags);tiles[i].collision=d.collision;tiles[i].animSeq=d.animSeq;});render();updateProps();}

  function tileAt(e){const rect=canvas.getBoundingClientRect();const x=Math.floor((e.clientX-rect.left)/TILE_SIZE);const y=Math.floor((e.clientY-rect.top)/TILE_SIZE);if(x>=0&&x<COLS&&y>=0&&y<ROWS)return y*COLS+x;return-1;}
  function tileXY(idx){return{x:idx%COLS,y:Math.floor(idx/COLS)};}

  function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // Draw tile colors
    for(let i=0;i<COLS*ROWS;i++){
      const{x,y}=tileXY(i);
      ctx.fillStyle=tileColors[i];ctx.fillRect(x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE,TILE_SIZE);
    }
    // Grid
    if(showGrid){
      ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1;
      for(let x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(x*TILE_SIZE,0);ctx.lineTo(x*TILE_SIZE,ROWS*TILE_SIZE);ctx.stroke();}
      for(let y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*TILE_SIZE);ctx.lineTo(COLS*TILE_SIZE,y*TILE_SIZE);ctx.stroke();}
    }
    // Collision overlays
    if(showCollision){
      for(let i=0;i<tiles.length;i++){
        if(!tiles[i].collision)continue;
        const{x,y}=tileXY(i);const c=tiles[i].collision;
        ctx.fillStyle='rgba(255,80,80,0.35)';
        ctx.fillRect(x*TILE_SIZE+c.x,y*TILE_SIZE+c.y,c.w,c.h);
        ctx.strokeStyle='rgba(255,80,80,0.8)';ctx.lineWidth=1;
        ctx.strokeRect(x*TILE_SIZE+c.x,y*TILE_SIZE+c.y,c.w,c.h);
      }
    }
    // Tags
    if(showTags){
      ctx.font='9px monospace';ctx.textAlign='left';
      for(let i=0;i<tiles.length;i++){
        if(tiles[i].tags.size===0)continue;
        const{x,y}=tileXY(i);
        ctx.fillStyle='rgba(255,255,255,0.85)';
        const tagStr=[...tiles[i].tags].join(',');
        ctx.fillText(tagStr,x*TILE_SIZE+2,y*TILE_SIZE+TILE_SIZE-3);
      }
    }
    // Animation sequence highlights
    animSequences.forEach((seq,si)=>{
      seq.forEach((tidx,fi)=>{
        const{x,y}=tileXY(tidx);
        ctx.strokeStyle=si===activeAnim?'#a7f070':'#ffcd75';ctx.lineWidth=2;ctx.setLineDash([3,3]);
        ctx.strokeRect(x*TILE_SIZE+1,y*TILE_SIZE+1,TILE_SIZE-2,TILE_SIZE-2);ctx.setLineDash([]);
        ctx.fillStyle='#fff';ctx.font='bold 10px monospace';ctx.textAlign='center';
        ctx.fillText(''+(fi+1),x*TILE_SIZE+TILE_SIZE/2,y*TILE_SIZE+12);
      });
    });
    // Selection highlight
    if(selectedTile>=0){
      const{x,y}=tileXY(selectedTile);
      ctx.strokeStyle='var(--vscode-focusBorder,#007acc)';ctx.lineWidth=3;
      ctx.strokeRect(x*TILE_SIZE,y*TILE_SIZE,TILE_SIZE,TILE_SIZE);
    }
  }

  function updateProps(){
    if(selectedTile<0){
      document.getElementById('selTile').textContent='-';
      document.getElementById('selTags').textContent='-';
      document.getElementById('selCollision').textContent='none';
      document.getElementById('selAnim').textContent='-';
      document.getElementById('statusSel').textContent='Tile: -';
      return;
    }
    const t=tiles[selectedTile];const{x,y}=tileXY(selectedTile);
    document.getElementById('selTile').textContent='('+x+','+y+') #'+selectedTile;
    document.getElementById('selTags').textContent=t.tags.size?[...t.tags].join(', '):'none';
    document.getElementById('selCollision').textContent=t.collision?t.collision.x+','+t.collision.y+' '+t.collision.w+'x'+t.collision.h:'none';
    document.getElementById('selAnim').textContent=t.animSeq>=0?'Seq '+(t.animSeq+1):'-';
    document.getElementById('statusSel').textContent='Tile: ('+x+','+y+')';
  }

  function updateAnimList(){
    const list=document.getElementById('animList');
    list.innerHTML=animSequences.map((seq,i)=>'<div class="anim-item'+(i===activeAnim?' active':'')+'" data-id="'+i+'">Seq '+(i+1)+': '+seq.length+' frames</div>').join('');
    list.querySelectorAll('.anim-item').forEach(el=>{el.addEventListener('click',()=>{activeAnim=+el.dataset.id;updateAnimList();render();});});
  }

  // Render tile color swatches in palette
  const tileColorsEl=document.getElementById('tileColors');
  baseColors.forEach((c,i)=>{
    const div=document.createElement('div');div.className='swatch'+(i===0?' active':'');div.dataset.color=c;div.style.background=c;div.title=c;
    tileColorsEl.appendChild(div);
  });

  canvas.addEventListener('mousedown',e=>{
    const t=tileAt(e);
    if(t<0)return;
    if(activeTool==='select'){
      selectedTile=t;updateProps();render();return;
    }
    if(activeTool==='collision'&&selectedTile>=0){
      const{x,y}=tileXY(selectedTile);
      const rect=canvas.getBoundingClientRect();
      const px=e.clientX-rect.left-x*TILE_SIZE;
      const py=e.clientY-rect.top-y*TILE_SIZE;
      collisionDrawing=true;collisionStart={x:Math.max(0,px),y:Math.max(0,py)};
      return;
    }
    if(activeTool==='tag'){
      saveState();
      if(tiles[t].tags.has(activeTag))tiles[t].tags.delete(activeTag);
      else tiles[t].tags.add(activeTag);
      selectedTile=t;updateProps();render();return;
    }
    if(activeTool==='animate'){
      if(activeAnim<0)return;
      saveState();
      const seq=animSequences[activeAnim];
      const existing=seq.indexOf(t);
      if(existing>=0){seq.splice(existing,1);tiles[t].animSeq=-1;}
      else{seq.push(t);tiles[t].animSeq=activeAnim;}
      selectedTile=t;updateAnimList();updateProps();render();return;
    }
  });

  canvas.addEventListener('mouseup',e=>{
    if(collisionDrawing&&selectedTile>=0){
      const{x,y}=tileXY(selectedTile);
      const rect=canvas.getBoundingClientRect();
      const px=e.clientX-rect.left-x*TILE_SIZE;
      const py=e.clientY-rect.top-y*TILE_SIZE;
      const ex=Math.min(TILE_SIZE,Math.max(0,px));
      const ey=Math.min(TILE_SIZE,Math.max(0,py));
      const sx=Math.min(collisionStart.x,ex),sy=Math.min(collisionStart.y,ey);
      const w=Math.abs(ex-collisionStart.x),h=Math.abs(ey-collisionStart.y);
      if(w>2&&h>2){saveState();tiles[selectedTile].collision={x:Math.round(sx),y:Math.round(sy),w:Math.round(w),h:Math.round(h)};}
      collisionDrawing=false;collisionStart=null;updateProps();render();
    }
  });

  canvas.addEventListener('mousemove',e=>{
    const rect=canvas.getBoundingClientRect();
    const px=Math.floor((e.clientX-rect.left)/TILE_SIZE);
    const py=Math.floor((e.clientY-rect.top)/TILE_SIZE);
    document.getElementById('statusPos').textContent=px+', '+py;
  });

  document.querySelectorAll('.tool-btn[data-tool]').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.tool-btn[data-tool]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeTool=btn.dataset.tool;document.getElementById('statusTool').textContent='Tool: '+btn.textContent;});});
  document.querySelectorAll('.tag-btn').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.tag-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeTag=btn.dataset.tag;});});
  document.querySelectorAll('.tag-btn')[0].classList.add('active');

  document.getElementById('showGrid').addEventListener('change',e=>{showGrid=e.target.checked;render();});
  document.getElementById('showCollision').addEventListener('change',e=>{showCollision=e.target.checked;render();});
  document.getElementById('showTags').addEventListener('change',e=>{showTags=e.target.checked;render();});
  document.getElementById('newAnim').addEventListener('click',()=>{animSequences.push([]);activeAnim=animSequences.length-1;updateAnimList();render();});

  document.addEventListener('keydown',e=>{
    if(e.ctrlKey&&e.key==='z'){e.preventDefault();undo();}
    else if(e.ctrlKey&&e.key==='y'){e.preventDefault();redo();}
  });

  updateAnimList();render();
})();`;

  return { workspaceHtml, styles, script };
}
