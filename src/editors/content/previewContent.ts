import type { EditorContent } from "./types.js";

// ─── 1. Particle Preview ────────────────────────────────────────────────────

export function particleContent(): EditorContent {
  const workspaceHtml = `
    <div class="preview-editor">
      <div class="toolbar">
        <span class="toolbar-title">Particle Preview</span>
        <button id="pauseBtn">Pause</button>
        <button id="resetBtn">Reset</button>
      </div>
      <div class="main-area">
        <div class="controls-panel" style="width:240px">
          <label>Emitter Shape
            <select id="emitterShape"><option value="point">Point</option><option value="circle">Circle</option><option value="line">Line</option></select>
          </label>
          <label>Rate <span id="rateVal">50</span>
            <input type="range" id="rate" min="1" max="200" value="50">
          </label>
          <label>Lifetime <span id="lifetimeVal">2.0</span>s
            <input type="range" id="lifetime" min="5" max="50" value="20" step="1">
          </label>
          <label>Gravity <span id="gravityVal">0.5</span>
            <input type="range" id="gravity" min="0" max="200" value="50">
          </label>
          <label>Spread Angle <span id="spreadVal">90</span>&deg;
            <input type="range" id="spread" min="0" max="360" value="90">
          </label>
          <label>Speed <span id="speedVal">80</span>
            <input type="range" id="speed" min="1" max="200" value="80">
          </label>
          <hr>
          <label>Start Color <input type="color" id="startColor" value="#ff6600"></label>
          <label>End Color <input type="color" id="endColor" value="#ffff00"></label>
          <label>Start Size <span id="startSizeVal">8</span>
            <input type="range" id="startSize" min="1" max="20" value="8">
          </label>
          <label>End Size <span id="endSizeVal">2</span>
            <input type="range" id="endSize" min="0" max="10" value="2">
          </label>
        </div>
        <div class="preview-area">
          <canvas id="particleCanvas" width="480" height="360"></canvas>
        </div>
      </div>
    </div>`;

  const styles = `
    .preview-editor { display:flex; flex-direction:column; height:100%; background:var(--vscode-editor-background); color:var(--vscode-editor-foreground); font-family:var(--vscode-font-family); font-size:13px; }
    .toolbar { display:flex; align-items:center; gap:8px; padding:6px 12px; border-bottom:1px solid var(--vscode-panel-border); }
    .toolbar-title { font-weight:600; flex:1; }
    .toolbar button { background:var(--vscode-button-background); color:var(--vscode-button-foreground); border:none; padding:4px 10px; cursor:pointer; border-radius:3px; }
    .toolbar button:hover { background:var(--vscode-button-hoverBackground); }
    .main-area { display:flex; flex:1; overflow:hidden; }
    .controls-panel { padding:10px; overflow-y:auto; border-right:1px solid var(--vscode-panel-border); display:flex; flex-direction:column; gap:6px; }
    .controls-panel label { display:flex; flex-direction:column; gap:2px; font-size:12px; }
    .controls-panel select, .controls-panel input[type="range"] { width:100%; }
    .controls-panel input[type="color"] { width:48px; height:24px; border:none; cursor:pointer; }
    .controls-panel hr { border:none; border-top:1px solid var(--vscode-panel-border); margin:4px 0; }
    .preview-area { flex:1; display:flex; align-items:center; justify-content:center; padding:10px; }
    #particleCanvas { background:#111; border-radius:4px; }`;

  const script = `
(function(){
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let paused = false;
  let lastTime = performance.now();

  function getVal(id) { return document.getElementById(id).value; }
  function getNum(id) { return parseFloat(getVal(id)); }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return {r,g,b};
  }

  function lerpColor(c1, c2, t) {
    return { r: c1.r+(c2.r-c1.r)*t, g: c1.g+(c2.g-c1.g)*t, b: c1.b+(c2.b-c1.b)*t };
  }

  function spawn() {
    const shape = getVal('emitterShape');
    const spd = getNum('speed');
    const spreadDeg = getNum('spread');
    const lt = getNum('lifetime') / 10;
    const ss = getNum('startSize');
    const es = getNum('endSize');
    let x = 240, y = 300;
    if (shape === 'circle') { const a = Math.random()*Math.PI*2; const r = Math.random()*30; x += Math.cos(a)*r; y += Math.sin(a)*r; }
    if (shape === 'line') { x += (Math.random()-0.5)*100; }
    const baseAngle = -Math.PI/2;
    const spreadRad = spreadDeg * Math.PI / 180;
    const angle = baseAngle + (Math.random()-0.5)*spreadRad;
    return { x, y, vx: Math.cos(angle)*spd, vy: Math.sin(angle)*spd, life: lt, maxLife: lt, startSize: ss, endSize: es };
  }

  function update() {
    if (paused) { requestAnimationFrame(update); return; }
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const grav = getNum('gravity') / 100 * 980;
    const rate = getNum('rate');
    const startCol = hexToRgb(getVal('startColor'));
    const endCol = hexToRgb(getVal('endColor'));

    const toSpawn = Math.floor(rate * dt + Math.random());
    for (let i = 0; i < toSpawn && particles.length < 200; i++) {
      particles.push(spawn());
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.vy += grav * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      const t = 1 - p.life / p.maxLife;
      const alpha = 1 - t;
      const size = p.startSize + (p.endSize - p.startSize) * t;
      const col = lerpColor(startCol, endCol, t);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgb(' + Math.round(col.r) + ',' + Math.round(col.g) + ',' + Math.round(col.b) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(update);
  }

  // Slider value display
  ['rate','lifetime','gravity','spread','speed','startSize','endSize'].forEach(id => {
    const el = document.getElementById(id);
    const valEl = document.getElementById(id+'Val');
    if (el && valEl) el.addEventListener('input', () => {
      let v = el.value;
      if (id === 'lifetime') v = (v/10).toFixed(1);
      else if (id === 'gravity') v = (v/100).toFixed(2);
      else v = v;
      valEl.textContent = v;
    });
  });

  document.getElementById('pauseBtn').addEventListener('click', () => {
    paused = !paused;
    document.getElementById('pauseBtn').textContent = paused ? 'Resume' : 'Pause';
    if (!paused) { lastTime = performance.now(); }
  });
  document.getElementById('resetBtn').addEventListener('click', () => { particles = []; });

  requestAnimationFrame(update);
})();`;

  return { workspaceHtml, styles, script };
}

// ─── 2. Post-FX Preview ─────────────────────────────────────────────────────

export function postfxContent(): EditorContent {
  const workspaceHtml = `
    <div class="preview-editor">
      <div class="toolbar">
        <span class="toolbar-title">Post-FX Preview</span>
        <label class="toolbar-toggle"><input type="checkbox" id="splitView" checked> Split View</label>
      </div>
      <div class="main-area">
        <div class="controls-panel" style="width:220px">
          <label><input type="checkbox" id="bloomOn" checked> Bloom</label>
          <label>Threshold <span id="bloomThreshVal">0.6</span><input type="range" id="bloomThresh" min="0" max="100" value="60"></label>
          <label>Intensity <span id="bloomIntVal">1.0</span><input type="range" id="bloomInt" min="0" max="200" value="100"></label>
          <hr>
          <label><input type="checkbox" id="vignetteOn" checked> Vignette</label>
          <label>Strength <span id="vigStrVal">0.5</span><input type="range" id="vigStr" min="0" max="100" value="50"></label>
          <hr>
          <label><input type="checkbox" id="caOn"> Chromatic Aberration</label>
          <label>Offset <span id="caOffVal">3</span>px<input type="range" id="caOff" min="0" max="10" value="3"></label>
          <hr>
          <label><input type="checkbox" id="crtOn"> CRT Lines</label>
          <label>Density <span id="crtDenVal">2</span><input type="range" id="crtDen" min="0" max="5" value="2"></label>
          <hr>
          <label><input type="checkbox" id="scanOn"> Scanlines</label>
          <label>Opacity <span id="scanOpVal">0.3</span><input type="range" id="scanOp" min="0" max="100" value="30"></label>
        </div>
        <div class="preview-area">
          <canvas id="fxCanvas" width="480" height="320"></canvas>
        </div>
      </div>
    </div>`;

  const styles = `
    .preview-editor { display:flex; flex-direction:column; height:100%; background:var(--vscode-editor-background); color:var(--vscode-editor-foreground); font-family:var(--vscode-font-family); font-size:13px; }
    .toolbar { display:flex; align-items:center; gap:8px; padding:6px 12px; border-bottom:1px solid var(--vscode-panel-border); }
    .toolbar-title { font-weight:600; flex:1; }
    .toolbar-toggle { display:flex; align-items:center; gap:4px; font-size:12px; cursor:pointer; }
    .main-area { display:flex; flex:1; overflow:hidden; }
    .controls-panel { padding:10px; overflow-y:auto; border-right:1px solid var(--vscode-panel-border); display:flex; flex-direction:column; gap:4px; }
    .controls-panel label { display:flex; flex-direction:column; gap:2px; font-size:12px; }
    .controls-panel hr { border:none; border-top:1px solid var(--vscode-panel-border); margin:4px 0; }
    .preview-area { flex:1; display:flex; align-items:center; justify-content:center; padding:10px; }
    #fxCanvas { background:#000; border-radius:4px; }`;

  const script = `
(function(){
  const canvas = document.getElementById('fxCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Render base scene to offscreen
  const baseCanvas = document.createElement('canvas');
  baseCanvas.width = W; baseCanvas.height = H;
  const baseCtx = baseCanvas.getContext('2d');
  baseCtx.fillStyle = '#1a1a2e'; baseCtx.fillRect(0,0,W,H);
  baseCtx.fillStyle = '#e94560'; baseCtx.fillRect(40,60,120,100);
  baseCtx.fillStyle = '#0f3460'; baseCtx.fillRect(200,40,140,80);
  baseCtx.fillStyle = '#16213e'; baseCtx.fillRect(100,200,200,80);
  baseCtx.fillStyle = '#53a8b6'; baseCtx.fillRect(360,150,80,130);
  // bright spot for bloom
  const g = baseCtx.createRadialGradient(300,160,0,300,160,60);
  g.addColorStop(0,'rgba(255,255,200,1)'); g.addColorStop(1,'rgba(255,255,200,0)');
  baseCtx.fillStyle = g; baseCtx.fillRect(240,100,120,120);

  function getCheck(id) { return document.getElementById(id).checked; }
  function getSlider(id, div) { return parseFloat(document.getElementById(id).value) / (div||1); }

  function render() {
    const split = document.getElementById('splitView').checked;
    const imgData = baseCtx.getImageData(0, 0, W, H);
    const src = imgData.data;
    const out = ctx.createImageData(W, H);
    const dst = out.data;

    const bloomOn = getCheck('bloomOn');
    const bloomThresh = getSlider('bloomThresh', 100);
    const bloomInt = getSlider('bloomInt', 100);
    const vigOn = getCheck('vignetteOn');
    const vigStr = getSlider('vigStr', 100);
    const caOn = getCheck('caOn');
    const caOff = Math.round(getSlider('caOff', 1));
    const crtOn = getCheck('crtOn');
    const crtDen = Math.round(getSlider('crtDen', 1));
    const scanOn = getCheck('scanOn');
    const scanOp = getSlider('scanOp', 100);

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        let r = src[i], g = src[i+1], b = src[i+2];

        // chromatic aberration
        if (caOn && caOff > 0) {
          const lx = Math.max(0, Math.min(W-1, x - caOff));
          const rx = Math.max(0, Math.min(W-1, x + caOff));
          r = src[(y*W+rx)*4];
          b = src[(y*W+lx)*4+2];
        }

        // bloom (simplified: brighten pixels above threshold)
        if (bloomOn) {
          const lum = (r*0.299 + g*0.587 + b*0.114) / 255;
          if (lum > bloomThresh) {
            const boost = (lum - bloomThresh) * bloomInt * 80;
            r = Math.min(255, r + boost);
            g = Math.min(255, g + boost);
            b = Math.min(255, b + boost);
          }
        }

        // vignette
        if (vigOn) {
          const cx = (x/W - 0.5)*2, cy = (y/H - 0.5)*2;
          const dist = Math.sqrt(cx*cx + cy*cy) / 1.414;
          const vig = 1 - dist * vigStr;
          r *= vig; g *= vig; b *= vig;
        }

        // crt lines
        if (crtOn && crtDen > 0 && y % (6 - crtDen) === 0) {
          r *= 0.7; g *= 0.7; b *= 0.7;
        }

        // scanlines
        if (scanOn && y % 2 === 0) {
          r *= (1 - scanOp); g *= (1 - scanOp); b *= (1 - scanOp);
        }

        // split view: left half = original
        if (split && x < W/2) {
          r = src[i]; g = src[i+1]; b = src[i+2];
        }

        dst[i] = Math.max(0,Math.min(255,r));
        dst[i+1] = Math.max(0,Math.min(255,g));
        dst[i+2] = Math.max(0,Math.min(255,b));
        dst[i+3] = 255;
      }
    }

    ctx.putImageData(out, 0, 0);

    // split line
    if (split) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H); ctx.stroke();
    }
  }

  // slider display updates
  ['bloomThresh','bloomInt','vigStr','caOff','crtDen','scanOp'].forEach(id => {
    const el = document.getElementById(id);
    const valEl = document.getElementById(id.replace('bloom','bloom').replace('Thresh','ThreshVal').replace('Int','IntVal')
      .replace('vigStr','vigStrVal').replace('caOff','caOffVal').replace('crtDen','crtDenVal').replace('scanOp','scanOpVal'));
  });
  document.querySelectorAll('.controls-panel input').forEach(el => {
    el.addEventListener('input', () => {
      const map = {bloomThresh:'bloomThreshVal',bloomInt:'bloomIntVal',vigStr:'vigStrVal',caOff:'caOffVal',crtDen:'crtDenVal',scanOp:'scanOpVal'};
      for (const [k,v] of Object.entries(map)) {
        const s = document.getElementById(k);
        const d = document.getElementById(v);
        if (s && d) { d.textContent = k==='caOff'||k==='crtDen' ? s.value : (s.value/100).toFixed(1); }
      }
      render();
    });
  });

  render();
})();`;

  return { workspaceHtml, styles, script };
}

// ─── 3. Procedural Map Preview ──────────────────────────────────────────────

export function procMapContent(): EditorContent {
  const workspaceHtml = `
    <div class="preview-editor">
      <div class="toolbar">
        <span class="toolbar-title">Procedural Map</span>
        <button id="regenBtn">Regenerate</button>
        <span id="genStatus" style="font-size:11px;opacity:0.7"></span>
      </div>
      <div class="main-area">
        <div class="controls-panel" style="width:220px">
          <label>Seed <input type="number" id="seed" value="42" style="width:80px"></label>
          <label>Frequency <span id="freqVal">0.04</span>
            <input type="range" id="freq" min="1" max="10" value="4">
          </label>
          <label>Octaves <span id="octVal">4</span>
            <input type="range" id="octaves" min="1" max="8" value="4">
          </label>
          <label>Lacunarity <span id="lacVal">2.0</span>
            <input type="range" id="lac" min="15" max="30" value="20">
          </label>
          <label>Persistence <span id="persVal">0.5</span>
            <input type="range" id="pers" min="3" max="7" value="5">
          </label>
        </div>
        <div class="preview-area">
          <canvas id="mapCanvas" width="512" height="512"></canvas>
        </div>
      </div>
    </div>`;

  const styles = `
    .preview-editor { display:flex; flex-direction:column; height:100%; background:var(--vscode-editor-background); color:var(--vscode-editor-foreground); font-family:var(--vscode-font-family); font-size:13px; }
    .toolbar { display:flex; align-items:center; gap:8px; padding:6px 12px; border-bottom:1px solid var(--vscode-panel-border); }
    .toolbar-title { font-weight:600; flex:1; }
    .toolbar button { background:var(--vscode-button-background); color:var(--vscode-button-foreground); border:none; padding:4px 10px; cursor:pointer; border-radius:3px; }
    .main-area { display:flex; flex:1; overflow:hidden; }
    .controls-panel { padding:10px; overflow-y:auto; border-right:1px solid var(--vscode-panel-border); display:flex; flex-direction:column; gap:6px; }
    .controls-panel label { display:flex; flex-direction:column; gap:2px; font-size:12px; }
    .controls-panel input[type="number"] { background:var(--vscode-input-background); color:var(--vscode-input-foreground); border:1px solid var(--vscode-input-border); padding:2px 4px; }
    .preview-area { flex:1; display:flex; align-items:center; justify-content:center; padding:10px; }
    #mapCanvas { border-radius:4px; image-rendering:pixelated; }`;

  const script = `
(function(){
  const canvas = document.getElementById('mapCanvas');
  const ctx = canvas.getContext('2d');
  const W = 512, H = 512;

  // Minimal 2D simplex noise
  const F2 = 0.5*(Math.sqrt(3)-1), G2 = (3-Math.sqrt(3))/6;
  const grad3 = [[1,1],[−1,1],[1,−1],[−1,−1],[1,0],[−1,0],[0,1],[0,−1]].map(v=>({x:v[0],y:v[1]}));
  // fix: use arrays
  const grad3arr = [{x:1,y:1},{x:-1,y:1},{x:1,y:-1},{x:-1,y:-1},{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
  let perm = new Uint8Array(512);

  function initPerm(seed) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    // Fisher-Yates with seed
    let s = seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807 + 0) % 2147483647;
      const j = s % (i + 1);
      const tmp = p[i]; p[i] = p[j]; p[j] = tmp;
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  }

  function simplex2(xin, yin) {
    let s = (xin + yin) * F2;
    let i = Math.floor(xin + s), j = Math.floor(yin + s);
    let t = (i + j) * G2;
    let X0 = i - t, Y0 = j - t;
    let x0 = xin - X0, y0 = yin - Y0;
    let i1, j1;
    if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }
    let x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    let x2 = x0 - 1 + 2*G2, y2 = y0 - 1 + 2*G2;
    let ii = i & 255, jj = j & 255;
    let gi0 = perm[ii + perm[jj]] % 8;
    let gi1 = perm[ii + i1 + perm[jj + j1]] % 8;
    let gi2 = perm[ii + 1 + perm[jj + 1]] % 8;
    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = 0.5 - x0*x0 - y0*y0;
    if (t0 >= 0) { t0 *= t0; n0 = t0*t0*(grad3arr[gi0].x*x0 + grad3arr[gi0].y*y0); }
    let t1 = 0.5 - x1*x1 - y1*y1;
    if (t1 >= 0) { t1 *= t1; n1 = t1*t1*(grad3arr[gi1].x*x1 + grad3arr[gi1].y*y1); }
    let t2 = 0.5 - x2*x2 - y2*y2;
    if (t2 >= 0) { t2 *= t2; n2 = t2*t2*(grad3arr[gi2].x*x2 + grad3arr[gi2].y*y2); }
    return 70*(n0 + n1 + n2) * 0.5 + 0.5;
  }

  function fbm(x, y, octaves, lac, pers) {
    let val = 0, amp = 1, freq = 1, max = 0;
    for (let o = 0; o < octaves; o++) {
      val += simplex2(x*freq, y*freq) * amp;
      max += amp;
      amp *= pers;
      freq *= lac;
    }
    return val / max;
  }

  function heightColor(h) {
    if (h < 0.3) return [30, 60, 180];
    if (h < 0.4) return [210, 180, 120];
    if (h < 0.7) return [40, 160, 60];
    if (h < 0.85) return [130, 130, 130];
    return [240, 240, 255];
  }

  function generate() {
    const t0 = performance.now();
    const seed = parseInt(document.getElementById('seed').value) || 42;
    const frequency = parseInt(document.getElementById('freq').value) / 100;
    const octaves = parseInt(document.getElementById('octaves').value);
    const lac = parseInt(document.getElementById('lac').value) / 10;
    const pers = parseInt(document.getElementById('pers').value) / 10;

    initPerm(seed);
    const imgData = ctx.createImageData(W, H);
    const d = imgData.data;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const h = fbm(x * frequency, y * frequency, octaves, lac, pers);
        const [r, g, b] = heightColor(h);
        const i = (y * W + x) * 4;
        d[i] = r; d[i+1] = g; d[i+2] = b; d[i+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    const elapsed = (performance.now() - t0).toFixed(1);
    document.getElementById('genStatus').textContent = 'Generated in ' + elapsed + 'ms';
  }

  // Slider value display
  document.querySelectorAll('.controls-panel input[type=range]').forEach(el => {
    el.addEventListener('input', () => {
      const map = {freq:'freqVal',octaves:'octVal',lac:'lacVal',pers:'persVal'};
      const vEl = document.getElementById(map[el.id]);
      if (vEl) {
        if (el.id==='freq') vEl.textContent = (el.value/100).toFixed(2);
        else if (el.id==='lac') vEl.textContent = (el.value/10).toFixed(1);
        else if (el.id==='pers') vEl.textContent = (el.value/10).toFixed(1);
        else vEl.textContent = el.value;
      }
    });
  });

  document.getElementById('regenBtn').addEventListener('click', () => {
    document.getElementById('seed').value = Math.floor(Math.random()*99999);
    generate();
  });

  generate();
})();`;

  return { workspaceHtml, styles, script };
}

// ─── 4. Shader Preview ──────────────────────────────────────────────────────

export function shaderPreviewContent(): EditorContent {
  const workspaceHtml = `
    <div class="preview-editor">
      <div class="toolbar">
        <span class="toolbar-title">Shader Preview</span>
        <button id="compileBtn">Compile</button>
        <label class="toolbar-toggle"><input type="checkbox" id="autoCompile" checked> Auto</label>
      </div>
      <div class="main-area">
        <div class="code-panel">
          <textarea id="shaderCode" spellcheck="false">// Fragment shader (JS simulation)
function fragment(x, y, time) {
  return [
    Math.sin(x * 0.05 + time) * 0.5 + 0.5,
    Math.cos(y * 0.03 + time) * 0.5 + 0.5,
    0.5,
    1.0
  ];
}</textarea>
          <div id="errorDisplay"></div>
        </div>
        <div class="preview-panel">
          <canvas id="shaderCanvas" width="320" height="240"></canvas>
        </div>
      </div>
    </div>`;

  const styles = `
    .preview-editor { display:flex; flex-direction:column; height:100%; background:var(--vscode-editor-background); color:var(--vscode-editor-foreground); font-family:var(--vscode-font-family); font-size:13px; }
    .toolbar { display:flex; align-items:center; gap:8px; padding:6px 12px; border-bottom:1px solid var(--vscode-panel-border); }
    .toolbar-title { font-weight:600; flex:1; }
    .toolbar button { background:var(--vscode-button-background); color:var(--vscode-button-foreground); border:none; padding:4px 10px; cursor:pointer; border-radius:3px; }
    .toolbar-toggle { display:flex; align-items:center; gap:4px; font-size:12px; cursor:pointer; }
    .main-area { display:flex; flex:1; overflow:hidden; }
    .code-panel { width:50%; display:flex; flex-direction:column; border-right:1px solid var(--vscode-panel-border); }
    #shaderCode { flex:1; background:var(--vscode-editor-background); color:var(--vscode-editor-foreground); border:none; resize:none; padding:10px; font-family:var(--vscode-editor-font-family,'Consolas,monospace'); font-size:13px; outline:none; tab-size:2; }
    #errorDisplay { padding:6px 10px; font-size:11px; color:var(--vscode-errorForeground,#f44); min-height:20px; border-top:1px solid var(--vscode-panel-border); white-space:pre-wrap; }
    .preview-panel { width:50%; display:flex; align-items:center; justify-content:center; }
    #shaderCanvas { background:#000; border-radius:4px; }`;

  const script = `
(function(){
  const canvas = document.getElementById('shaderCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const step = 4;
  let time = 0;
  let fragmentFn = null;
  let running = true;

  function compile() {
    const code = document.getElementById('shaderCode').value;
    const errEl = document.getElementById('errorDisplay');
    try {
      const fn = new Function('x','y','time','resolution', code + '\\nreturn fragment(x,y,time);');
      // test call
      fn(0, 0, 0, [W, H]);
      fragmentFn = fn;
      errEl.textContent = '';
    } catch(e) {
      errEl.textContent = e.message;
    }
  }

  function render() {
    if (!fragmentFn) { requestAnimationFrame(render); return; }
    const imgData = ctx.createImageData(W, H);
    const d = imgData.data;
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        let col;
        try { col = fragmentFn(x, y, time, [W, H]); } catch(e) { col = [0,0,0,1]; }
        const r = Math.max(0,Math.min(255, (col[0]||0)*255));
        const g = Math.max(0,Math.min(255, (col[1]||0)*255));
        const b = Math.max(0,Math.min(255, (col[2]||0)*255));
        const a = Math.max(0,Math.min(255, (col[3]||1)*255));
        for (let dy = 0; dy < step && y+dy < H; dy++) {
          for (let dx = 0; dx < step && x+dx < W; dx++) {
            const i = ((y+dy)*W + (x+dx))*4;
            d[i]=r; d[i+1]=g; d[i+2]=b; d[i+3]=a;
          }
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
    time += 0.03;
    if (running) requestAnimationFrame(render);
  }

  document.getElementById('compileBtn').addEventListener('click', compile);
  document.getElementById('shaderCode').addEventListener('input', () => {
    if (document.getElementById('autoCompile').checked) compile();
  });

  compile();
  requestAnimationFrame(render);
})();`;

  return { workspaceHtml, styles, script };
}

// ─── 5. Font Preview ────────────────────────────────────────────────────────

export function fontPreviewContent(): EditorContent {
  const workspaceHtml = `
    <div class="preview-editor">
      <div class="toolbar">
        <span class="toolbar-title">Font Preview</span>
      </div>
      <div class="main-area">
        <div class="controls-panel" style="width:280px">
          <label>Sample Text
            <input type="text" id="sampleText" value="The quick brown fox jumps over the lazy dog. 0123456789">
          </label>
          <label>Font Size <span id="fontSizeVal">32</span>px
            <input type="range" id="fontSize" min="8" max="128" value="32">
          </label>
          <label>Line Height <span id="lineHeightVal">1.5</span>
            <input type="range" id="lineHeight" min="10" max="30" value="15">
          </label>
          <label>Kerning <span id="kerningVal">0</span>px
            <input type="range" id="kerning" min="-5" max="5" value="0">
          </label>
          <label><input type="checkbox" id="hinting" checked> Hinting</label>
          <label>Anti-aliasing
            <select id="antiAlias"><option value="grayscale">Grayscale</option><option value="subpixel">Subpixel</option><option value="none">None</option></select>
          </label>
          <label><input type="checkbox" id="showGuides" checked> Show Guides</label>
          <label>Background
            <select id="bgMode"><option value="dark">Dark</option><option value="light">Light</option></select>
          </label>
          <hr>
          <div style="font-size:11px;opacity:0.7" id="atlasInfo">Atlas: ~0 KB</div>
        </div>
        <div class="preview-panel-v">
          <canvas id="fontCanvas" width="600" height="300"></canvas>
          <canvas id="atlasCanvas" width="256" height="64"></canvas>
        </div>
      </div>
    </div>`;

  const styles = `
    .preview-editor { display:flex; flex-direction:column; height:100%; background:var(--vscode-editor-background); color:var(--vscode-editor-foreground); font-family:var(--vscode-font-family); font-size:13px; }
    .toolbar { display:flex; align-items:center; gap:8px; padding:6px 12px; border-bottom:1px solid var(--vscode-panel-border); }
    .toolbar-title { font-weight:600; flex:1; }
    .main-area { display:flex; flex:1; overflow:hidden; }
    .controls-panel { padding:10px; overflow-y:auto; border-right:1px solid var(--vscode-panel-border); display:flex; flex-direction:column; gap:6px; }
    .controls-panel label { display:flex; flex-direction:column; gap:2px; font-size:12px; }
    .controls-panel input[type="text"] { background:var(--vscode-input-background); color:var(--vscode-input-foreground); border:1px solid var(--vscode-input-border); padding:3px 6px; }
    .controls-panel select { background:var(--vscode-dropdown-background); color:var(--vscode-dropdown-foreground); border:1px solid var(--vscode-dropdown-border); padding:2px 4px; }
    .controls-panel hr { border:none; border-top:1px solid var(--vscode-panel-border); margin:4px 0; }
    .preview-panel-v { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:10px; }
    #fontCanvas { border-radius:4px; }
    #atlasCanvas { border:1px solid var(--vscode-panel-border); border-radius:3px; }`;

  const script = `
(function(){
  const fontCanvas = document.getElementById('fontCanvas');
  const fCtx = fontCanvas.getContext('2d');
  const atlasCanvas = document.getElementById('atlasCanvas');
  const aCtx = atlasCanvas.getContext('2d');

  function render() {
    const text = document.getElementById('sampleText').value || 'ABC';
    const size = parseInt(document.getElementById('fontSize').value);
    const lh = parseInt(document.getElementById('lineHeight').value) / 10;
    const kern = parseInt(document.getElementById('kerning').value);
    const showGuides = document.getElementById('showGuides').checked;
    const bgMode = document.getElementById('bgMode').value;
    const aa = document.getElementById('antiAlias').value;

    const W = fontCanvas.width, H = fontCanvas.height;
    fCtx.clearRect(0,0,W,H);
    fCtx.fillStyle = bgMode === 'dark' ? '#1e1e1e' : '#f5f5f5';
    fCtx.fillRect(0,0,W,H);

    const fg = bgMode === 'dark' ? '#e0e0e0' : '#222';
    fCtx.fillStyle = fg;
    fCtx.font = size + 'px monospace';
    if (aa === 'none') fCtx.imageSmoothingEnabled = false;
    else fCtx.imageSmoothingEnabled = true;

    const baseline = 60 + size;
    const ascent = baseline - size * 0.8;
    const descent = baseline + size * 0.2;

    // Draw guides
    if (showGuides) {
      fCtx.setLineDash([4,4]);
      fCtx.strokeStyle = '#888';
      fCtx.lineWidth = 1;
      fCtx.beginPath(); fCtx.moveTo(0, baseline); fCtx.lineTo(W, baseline); fCtx.stroke();
      fCtx.strokeStyle = '#4a9';
      fCtx.beginPath(); fCtx.moveTo(0, ascent); fCtx.lineTo(W, ascent); fCtx.stroke();
      fCtx.strokeStyle = '#a49';
      fCtx.beginPath(); fCtx.moveTo(0, descent); fCtx.lineTo(W, descent); fCtx.stroke();
      fCtx.setLineDash([]);
    }

    // Draw text with kerning
    let x = 20;
    for (let i = 0; i < text.length; i++) {
      fCtx.fillStyle = fg;
      fCtx.fillText(text[i], x, baseline);
      x += fCtx.measureText(text[i]).width + kern;
      if (x > W - 20) break;
    }

    // Second line
    const line2y = baseline + size * lh;
    if (line2y < H - 20) {
      fCtx.fillStyle = fg;
      fCtx.font = Math.round(size*0.6) + 'px monospace';
      fCtx.fillText('AaBbCcDdEeFfGg ÁÉÍÓÚ àèìòù 0123456789 !@#$%', 20, line2y);
    }

    // Atlas preview (mock glyph grid)
    aCtx.clearRect(0, 0, 256, 64);
    aCtx.fillStyle = '#222';
    aCtx.fillRect(0, 0, 256, 64);
    const glyphSize = 8;
    const cols = Math.floor(256 / glyphSize);
    const rows = Math.floor(64 / glyphSize);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const hue = ((r*cols+c)*7) % 360;
        aCtx.fillStyle = 'hsl('+hue+',60%,50%)';
        aCtx.fillRect(c*glyphSize+1, r*glyphSize+1, glyphSize-2, glyphSize-2);
      }
    }

    // Atlas size estimation
    const chars = 95; // printable ASCII
    const kb = Math.round(chars * size * size * 4 / 1024);
    document.getElementById('atlasInfo').textContent = 'Atlas: ~' + kb + ' KB (' + chars + ' glyphs @ ' + size + 'px)';

    // Slider vals
    document.getElementById('fontSizeVal').textContent = size;
    document.getElementById('lineHeightVal').textContent = lh.toFixed(1);
    document.getElementById('kerningVal').textContent = kern;
  }

  document.querySelectorAll('.controls-panel input, .controls-panel select').forEach(el => {
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });

  render();
})();`;

  return { workspaceHtml, styles, script };
}

// ─── 6. Audio Mixer ─────────────────────────────────────────────────────────

export function audioMixerContent(): EditorContent {
  const channels = ["Master", "BGM", "SFX", "UI", "Voice"];
  const channelHtml = channels.map((name, i) => `
    <div class="channel-strip" data-ch="${i}">
      <div class="ch-label">${name}</div>
      <div class="vu-meter"><div class="vu-fill" id="vu${i}"></div></div>
      <input type="range" class="fader" id="fader${i}" min="0" max="100" value="${i===0?80:70}" orient="vertical">
      <div class="ch-buttons">
        <button class="btn-mute" id="mute${i}">M</button>
        <button class="btn-solo" id="solo${i}">S</button>
      </div>
      <label class="pan-label">Pan
        <input type="range" class="pan-knob" id="pan${i}" min="-100" max="100" value="0">
      </label>
    </div>`).join("\n");

  const workspaceHtml = `
    <div class="preview-editor">
      <div class="toolbar">
        <span class="toolbar-title">Audio Mixer</span>
      </div>
      <div class="mixer-area">
        ${channelHtml}
      </div>
    </div>`;

  const styles = `
    .preview-editor { display:flex; flex-direction:column; height:100%; background:var(--vscode-editor-background); color:var(--vscode-editor-foreground); font-family:var(--vscode-font-family); font-size:13px; }
    .toolbar { display:flex; align-items:center; gap:8px; padding:6px 12px; border-bottom:1px solid var(--vscode-panel-border); }
    .toolbar-title { font-weight:600; flex:1; }
    .mixer-area { display:flex; flex:1; justify-content:center; align-items:stretch; gap:12px; padding:20px; }
    .channel-strip { display:flex; flex-direction:column; align-items:center; gap:8px; padding:12px 10px; border:1px solid var(--vscode-panel-border); border-radius:6px; min-width:70px; background:var(--vscode-sideBar-background, #252526); transition:opacity 0.2s; }
    .channel-strip.muted { opacity:0.4; }
    .ch-label { font-weight:600; font-size:12px; text-align:center; }
    .vu-meter { width:16px; height:140px; background:#111; border-radius:3px; position:relative; overflow:hidden; }
    .vu-fill { position:absolute; bottom:0; left:0; right:0; background:linear-gradient(to top, #4caf50, #8bc34a, #ffeb3b, #f44336); transition:height 0.1s; height:50%; }
    .fader { writing-mode:vertical-lr; direction:rtl; width:30px; height:140px; cursor:pointer; appearance:slider-vertical; }
    .ch-buttons { display:flex; gap:4px; }
    .btn-mute, .btn-solo { width:26px; height:22px; border:1px solid var(--vscode-panel-border); border-radius:3px; background:var(--vscode-button-secondaryBackground,#3a3d41); color:var(--vscode-button-secondaryForeground,#ccc); cursor:pointer; font-size:11px; font-weight:bold; }
    .btn-mute.active { background:#c62828; color:#fff; }
    .btn-solo.active { background:#f9a825; color:#000; }
    .pan-label { font-size:10px; display:flex; flex-direction:column; align-items:center; gap:2px; }
    .pan-knob { width:60px; }`;

  const script = `
(function(){
  const NUM = 5;
  const muted = [false,false,false,false,false];
  const soloed = [false,false,false,false,false];

  function getVol(i) { return parseInt(document.getElementById('fader'+i).value)/100; }

  function updateVU() {
    const masterVol = getVol(0);
    const anySolo = soloed.some(s => s);
    for (let i = 0; i < NUM; i++) {
      const el = document.getElementById('vu'+i);
      const strip = el.closest('.channel-strip');
      const isMuted = muted[i] || (anySolo && !soloed[i] && i !== 0);
      strip.classList.toggle('muted', isMuted);
      if (isMuted) { el.style.height = '0%'; continue; }
      const vol = getVol(i) * (i === 0 ? 1 : masterVol);
      const level = vol * (0.5 + Math.random() * 0.5);
      el.style.height = Math.min(100, level * 100) + '%';
    }
  }

  for (let i = 0; i < NUM; i++) {
    document.getElementById('mute'+i).addEventListener('click', function() {
      muted[i] = !muted[i];
      this.classList.toggle('active', muted[i]);
    });
    document.getElementById('solo'+i).addEventListener('click', function() {
      soloed[i] = !soloed[i];
      this.classList.toggle('active', soloed[i]);
    });
  }

  setInterval(updateVU, 100);
})();`;

  return { workspaceHtml, styles, script };
}

// ─── 7. Color Palette ───────────────────────────────────────────────────────

export function colorPaletteContent(): EditorContent {
  const workspaceHtml = `
    <div class="preview-editor">
      <div class="toolbar">
        <span class="toolbar-title">Color Palette</span>
        <button id="addSwatch">+ Add</button>
        <button id="exportBtn">Export Lua</button>
      </div>
      <div class="main-area">
        <div class="picker-panel">
          <canvas id="wheelCanvas" width="200" height="200"></canvas>
          <label>Lightness <span id="lVal">50</span>%
            <input type="range" id="lightSlider" min="0" max="100" value="50">
          </label>
          <div class="current-color">
            <div id="colorPreview" style="width:40px;height:40px;border-radius:4px;border:1px solid #555"></div>
            <span id="colorHex">#808080</span>
          </div>
          <hr>
          <div class="contrast-section">
            <strong style="font-size:11px">Contrast Checker</strong>
            <div style="display:flex;gap:8px;margin-top:4px">
              <input type="color" id="contrastA" value="#1a1c2c">
              <input type="color" id="contrastB" value="#f4f4f4">
            </div>
            <div id="contrastResult" style="font-size:12px;margin-top:4px"></div>
          </div>
          <hr>
          <div class="gradient-section">
            <strong style="font-size:11px">Gradient</strong>
            <div style="display:flex;gap:8px;margin-top:4px">
              <input type="color" id="gradA" value="#ff0000">
              <input type="color" id="gradB" value="#0000ff">
            </div>
            <div id="gradPreview" style="height:20px;border-radius:3px;margin-top:4px"></div>
          </div>
        </div>
        <div class="swatch-panel">
          <div id="swatchGrid" class="swatch-grid"></div>
          <pre id="exportOutput" style="font-size:11px;margin-top:10px;max-height:120px;overflow:auto;background:var(--vscode-textCodeBlock-background);padding:6px;border-radius:3px;display:none"></pre>
        </div>
      </div>
    </div>`;

  const styles = `
    .preview-editor { display:flex; flex-direction:column; height:100%; background:var(--vscode-editor-background); color:var(--vscode-editor-foreground); font-family:var(--vscode-font-family); font-size:13px; }
    .toolbar { display:flex; align-items:center; gap:8px; padding:6px 12px; border-bottom:1px solid var(--vscode-panel-border); }
    .toolbar-title { font-weight:600; flex:1; }
    .toolbar button { background:var(--vscode-button-background); color:var(--vscode-button-foreground); border:none; padding:4px 10px; cursor:pointer; border-radius:3px; }
    .main-area { display:flex; flex:1; overflow:hidden; }
    .picker-panel { width:240px; padding:12px; border-right:1px solid var(--vscode-panel-border); display:flex; flex-direction:column; gap:8px; overflow-y:auto; }
    .picker-panel label { font-size:12px; display:flex; flex-direction:column; gap:2px; }
    .picker-panel hr { border:none; border-top:1px solid var(--vscode-panel-border); margin:4px 0; }
    .current-color { display:flex; align-items:center; gap:8px; }
    .swatch-panel { flex:1; padding:12px; overflow-y:auto; }
    .swatch-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
    .swatch-item { width:100%; aspect-ratio:1; border-radius:6px; cursor:pointer; border:2px solid transparent; position:relative; }
    .swatch-item.selected { border-color:var(--vscode-focusBorder); }
    .swatch-item .swatch-label { position:absolute; bottom:2px; left:2px; right:2px; text-align:center; font-size:9px; color:#fff; text-shadow:0 0 2px #000; }
    #wheelCanvas { cursor:crosshair; border-radius:50%; }`;

  const script = `
(function(){
  const wheelCanvas = document.getElementById('wheelCanvas');
  const wCtx = wheelCanvas.getContext('2d');
  let hue = 0, sat = 100, light = 50;
  const defaultSwatches = [
    {name:'bg',color:'#1a1c2c'},{name:'fg',color:'#f4f4f4'},{name:'primary',color:'#4fc1e9'},
    {name:'secondary',color:'#a0d468'},{name:'accent',color:'#fc6e51'},{name:'warn',color:'#ffce54'},
    {name:'error',color:'#ed5565'},{name:'success',color:'#48cfad'},{name:'info',color:'#5d9cec'},
    {name:'muted',color:'#656d78'},{name:'dark',color:'#434a54'},{name:'light',color:'#e6e9ed'},
    {name:'gold',color:'#f6bb42'},{name:'purple',color:'#967adc'},{name:'pink',color:'#ec87c0'},
    {name:'teal',color:'#37bc9b'}
  ];
  let swatches = [...defaultSwatches];
  let selectedIdx = 0;

  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1-l);
    const f = n => { const k = (n + h/30) % 12; return l - a * Math.max(Math.min(k-3, 9-k, 1), -1); };
    const toHex = x => Math.round(x*255).toString(16).padStart(2,'0');
    return '#' + toHex(f(0)) + toHex(f(8)) + toHex(f(4));
  }

  function drawWheel() {
    const cx = 100, cy = 100, r = 95;
    const imgData = wCtx.createImageData(200, 200);
    const d = imgData.data;
    for (let y = 0; y < 200; y++) {
      for (let x = 0; x < 200; x++) {
        const dx = x - cx, dy = y - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > r) continue;
        const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
        const s = (dist / r) * 100;
        const hex = hslToHex(angle, s, light);
        const i = (y*200+x)*4;
        d[i] = parseInt(hex.slice(1,3),16);
        d[i+1] = parseInt(hex.slice(3,5),16);
        d[i+2] = parseInt(hex.slice(5,7),16);
        d[i+3] = 255;
      }
    }
    wCtx.putImageData(imgData, 0, 0);
  }

  function updateColor() {
    const hex = hslToHex(hue, sat, light);
    document.getElementById('colorPreview').style.background = hex;
    document.getElementById('colorHex').textContent = hex;
    document.getElementById('lVal').textContent = light;
  }

  wheelCanvas.addEventListener('click', e => {
    const rect = wheelCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const dx = x-100, dy = y-100, dist = Math.sqrt(dx*dx+dy*dy);
    if (dist > 95) return;
    hue = (Math.atan2(dy, dx)*180/Math.PI+360)%360;
    sat = (dist/95)*100;
    updateColor();
  });

  document.getElementById('lightSlider').addEventListener('input', e => {
    light = parseInt(e.target.value);
    drawWheel();
    updateColor();
  });

  function renderSwatches() {
    const grid = document.getElementById('swatchGrid');
    grid.innerHTML = swatches.map((s,i) =>
      '<div class="swatch-item'+(i===selectedIdx?' selected':'')+'" data-idx="'+i+'" style="background:'+s.color+'"><span class="swatch-label">'+s.name+'</span></div>'
    ).join('');
    grid.querySelectorAll('.swatch-item').forEach(el => {
      el.addEventListener('click', () => { selectedIdx = parseInt(el.dataset.idx); renderSwatches(); });
    });
  }

  document.getElementById('addSwatch').addEventListener('click', () => {
    const hex = hslToHex(hue, sat, light);
    swatches.push({name:'color'+swatches.length, color:hex});
    renderSwatches();
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    const out = document.getElementById('exportOutput');
    const lua = '{\\n' + swatches.map(s => "  "+s.name+" = '"+s.color+"'").join(',\\n') + '\\n}';
    out.textContent = lua;
    out.style.display = 'block';
  });

  // Contrast checker
  function luminance(hex) {
    const r = parseInt(hex.slice(1,3),16)/255;
    const g = parseInt(hex.slice(3,5),16)/255;
    const b = parseInt(hex.slice(5,7),16)/255;
    const toL = c => c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
    return 0.2126*toL(r) + 0.7152*toL(g) + 0.0722*toL(b);
  }
  function contrastRatio(hex1, hex2) {
    const l1 = luminance(hex1), l2 = luminance(hex2);
    const lighter = Math.max(l1,l2), darker = Math.min(l1,l2);
    return (lighter + 0.05) / (darker + 0.05);
  }
  function updateContrast() {
    const a = document.getElementById('contrastA').value;
    const b = document.getElementById('contrastB').value;
    const ratio = contrastRatio(a, b).toFixed(2);
    const pass = parseFloat(ratio) >= 4.5 ? 'PASS (AA)' : parseFloat(ratio) >= 3 ? 'PASS (AA Large)' : 'FAIL';
    document.getElementById('contrastResult').textContent = ratio + ':1 — ' + pass;
  }
  document.getElementById('contrastA').addEventListener('input', updateContrast);
  document.getElementById('contrastB').addEventListener('input', updateContrast);

  // Gradient
  function updateGradient() {
    const a = document.getElementById('gradA').value;
    const b = document.getElementById('gradB').value;
    document.getElementById('gradPreview').style.background = 'linear-gradient(to right, '+a+', '+b+')';
  }
  document.getElementById('gradA').addEventListener('input', updateGradient);
  document.getElementById('gradB').addEventListener('input', updateGradient);

  drawWheel();
  updateColor();
  renderSwatches();
  updateContrast();
  updateGradient();
})();`;

  return { workspaceHtml, styles, script };
}

// ─── 8. Physics Materials ───────────────────────────────────────────────────

export function physicsMaterialsContent(): EditorContent {
  const workspaceHtml = `
    <div class="preview-editor">
      <div class="toolbar">
        <span class="toolbar-title">Physics Materials</span>
      </div>
      <div class="main-area">
        <div class="mat-list" style="width:160px">
          <div class="mat-card active" data-mat="ice">Ice</div>
          <div class="mat-card" data-mat="rubber">Rubber</div>
          <div class="mat-card" data-mat="metal">Metal</div>
          <div class="mat-card" data-mat="wood">Wood</div>
          <div class="mat-card" data-mat="custom">Custom</div>
        </div>
        <div class="props-panel" style="width:200px">
          <label>Density <span id="densVal">1.0</span>
            <input type="range" id="density" min="1" max="200" value="10">
          </label>
          <label>Static Friction <span id="sfVal">0.50</span>
            <input type="range" id="sFriction" min="0" max="200" value="50">
          </label>
          <label>Dynamic Friction <span id="dfVal">0.40</span>
            <input type="range" id="dFriction" min="0" max="200" value="40">
          </label>
          <label>Restitution <span id="restVal">0.30</span>
            <input type="range" id="restitution" min="0" max="100" value="30">
          </label>
          <hr>
          <strong style="font-size:11px">Collision Matrix</strong>
          <div id="collisionMatrix" class="collision-matrix"></div>
        </div>
        <div class="sandbox-panel">
          <canvas id="physCanvas" width="200" height="300"></canvas>
        </div>
      </div>
    </div>`;

  const styles = `
    .preview-editor { display:flex; flex-direction:column; height:100%; background:var(--vscode-editor-background); color:var(--vscode-editor-foreground); font-family:var(--vscode-font-family); font-size:13px; }
    .toolbar { display:flex; align-items:center; gap:8px; padding:6px 12px; border-bottom:1px solid var(--vscode-panel-border); }
    .toolbar-title { font-weight:600; flex:1; }
    .main-area { display:flex; flex:1; overflow:hidden; }
    .mat-list { padding:8px; display:flex; flex-direction:column; gap:4px; border-right:1px solid var(--vscode-panel-border); overflow-y:auto; }
    .mat-card { padding:8px 12px; border:1px solid var(--vscode-panel-border); border-radius:4px; cursor:pointer; font-size:12px; }
    .mat-card.active { background:var(--vscode-list-activeSelectionBackground); color:var(--vscode-list-activeSelectionForeground); }
    .props-panel { padding:10px; border-right:1px solid var(--vscode-panel-border); display:flex; flex-direction:column; gap:6px; overflow-y:auto; }
    .props-panel label { display:flex; flex-direction:column; gap:2px; font-size:12px; }
    .props-panel hr { border:none; border-top:1px solid var(--vscode-panel-border); margin:4px 0; }
    .sandbox-panel { flex:1; display:flex; align-items:center; justify-content:center; padding:10px; }
    #physCanvas { background:#111; border-radius:4px; }
    .collision-matrix { display:grid; grid-template-columns:repeat(8, 18px); gap:2px; margin-top:4px; }
    .collision-matrix input[type="checkbox"] { width:16px; height:16px; cursor:pointer; }`;

  const script = `
(function(){
  const canvas = document.getElementById('physCanvas');
  const ctx = canvas.getContext('2d');
  const W = 200, H = 300;
  const presets = {
    ice: {density:0.9, sFriction:0.05, dFriction:0.03, restitution:0.1},
    rubber: {density:1.2, sFriction:0.9, dFriction:0.8, restitution:0.8},
    metal: {density:7.8, sFriction:0.4, dFriction:0.3, restitution:0.3},
    wood: {density:0.6, sFriction:0.6, dFriction:0.5, restitution:0.2},
    custom: {density:1.0, sFriction:0.5, dFriction:0.4, restitution:0.3}
  };

  let ball = { x:100, y:20, vy:0, vx:30, radius:12 };
  const gravity = 980;
  let lastTime = performance.now();

  function setSliders(p) {
    document.getElementById('density').value = Math.round(p.density*10);
    document.getElementById('sFriction').value = Math.round(p.sFriction*100);
    document.getElementById('dFriction').value = Math.round(p.dFriction*100);
    document.getElementById('restitution').value = Math.round(p.restitution*100);
    updateLabels();
  }

  function updateLabels() {
    document.getElementById('densVal').textContent = (parseInt(document.getElementById('density').value)/10).toFixed(1);
    document.getElementById('sfVal').textContent = (parseInt(document.getElementById('sFriction').value)/100).toFixed(2);
    document.getElementById('dfVal').textContent = (parseInt(document.getElementById('dFriction').value)/100).toFixed(2);
    document.getElementById('restVal').textContent = (parseInt(document.getElementById('restitution').value)/100).toFixed(2);
  }

  function getRestitution() { return parseInt(document.getElementById('restitution').value)/100; }
  function getDFriction() { return parseInt(document.getElementById('dFriction').value)/100; }

  function resetBall() { ball = { x:40+Math.random()*120, y:20, vy:0, vx:30+Math.random()*40, radius:12 }; }

  function simulate() {
    const now = performance.now();
    const dt = Math.min((now - lastTime)/1000, 0.03);
    lastTime = now;
    const rest = getRestitution();
    const fric = getDFriction();

    ball.vy += gravity * dt;
    ball.y += ball.vy * dt;
    ball.x += ball.vx * dt;

    // Floor bounce
    if (ball.y + ball.radius > H - 10) {
      ball.y = H - 10 - ball.radius;
      ball.vy = -ball.vy * rest;
      ball.vx *= (1 - fric);
      if (Math.abs(ball.vy) < 5) ball.vy = 0;
    }
    // Walls
    if (ball.x - ball.radius < 0) { ball.x = ball.radius; ball.vx = -ball.vx * rest; }
    if (ball.x + ball.radius > W) { ball.x = W - ball.radius; ball.vx = -ball.vx * rest; }

    // Draw
    ctx.clearRect(0, 0, W, H);
    // Floor
    ctx.fillStyle = '#333'; ctx.fillRect(0, H-10, W, 10);
    // Ball
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = '#4fc3f7'; ctx.fill();
    ctx.strokeStyle = '#29b6f6'; ctx.lineWidth = 2; ctx.stroke();

    requestAnimationFrame(simulate);
  }

  // Material cards
  document.querySelectorAll('.mat-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.mat-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const p = presets[card.dataset.mat];
      setSliders(p);
      resetBall();
    });
  });

  document.querySelectorAll('.props-panel input[type=range]').forEach(el => {
    el.addEventListener('input', updateLabels);
  });

  // Collision matrix
  const layers = ['Def','Plr','Ene','Prj','Ter','Trg','Wat','UI'];
  const matrixEl = document.getElementById('collisionMatrix');
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = r === c || (r < 5 && c < 5);
      cb.title = layers[r] + ' vs ' + layers[c];
      matrixEl.appendChild(cb);
    }
  }

  setSliders(presets.ice);
  requestAnimationFrame(simulate);
})();`;

  return { workspaceHtml, styles, script };
}

// ─── 9. Lighting Preview ────────────────────────────────────────────────────

export function lightingContent(): EditorContent {
  const workspaceHtml = `
    <div class="preview-editor">
      <div class="toolbar">
        <span class="toolbar-title">Lighting Preview</span>
        <button id="addLightBtn">+ Add Light</button>
      </div>
      <div class="main-area">
        <div class="controls-panel" style="width:260px">
          <label>Ambient Color <input type="color" id="ambientColor" value="#1a1a2e"></label>
          <label>Ambient Intensity <span id="ambIntVal">0.2</span>
            <input type="range" id="ambientInt" min="0" max="100" value="20">
          </label>
          <hr>
          <label>Fog Density <span id="fogDenVal">0.0</span>
            <input type="range" id="fogDensity" min="0" max="50" value="0">
          </label>
          <label>Fog Color <input type="color" id="fogColor" value="#334455"></label>
          <hr>
          <strong style="font-size:11px">Lights</strong>
          <div id="lightList" style="max-height:200px;overflow-y:auto"></div>
        </div>
        <div class="preview-area">
          <canvas id="lightCanvas" width="480" height="320"></canvas>
        </div>
      </div>
    </div>`;

  const styles = `
    .preview-editor { display:flex; flex-direction:column; height:100%; background:var(--vscode-editor-background); color:var(--vscode-editor-foreground); font-family:var(--vscode-font-family); font-size:13px; }
    .toolbar { display:flex; align-items:center; gap:8px; padding:6px 12px; border-bottom:1px solid var(--vscode-panel-border); }
    .toolbar-title { font-weight:600; flex:1; }
    .toolbar button { background:var(--vscode-button-background); color:var(--vscode-button-foreground); border:none; padding:4px 10px; cursor:pointer; border-radius:3px; }
    .main-area { display:flex; flex:1; overflow:hidden; }
    .controls-panel { padding:10px; overflow-y:auto; border-right:1px solid var(--vscode-panel-border); display:flex; flex-direction:column; gap:6px; }
    .controls-panel label { display:flex; flex-direction:column; gap:2px; font-size:12px; }
    .controls-panel hr { border:none; border-top:1px solid var(--vscode-panel-border); margin:4px 0; }
    .preview-area { flex:1; display:flex; align-items:center; justify-content:center; padding:10px; }
    #lightCanvas { background:#111; border-radius:4px; cursor:crosshair; }
    .light-row { display:flex; align-items:center; gap:4px; padding:3px 0; font-size:11px; }
    .light-row .swatch { width:14px; height:14px; border-radius:2px; border:1px solid #555; }
    .light-row button { background:none; border:none; color:var(--vscode-errorForeground,#f44); cursor:pointer; font-size:14px; }`;

  const script = `
(function(){
  const canvas = document.getElementById('lightCanvas');
  const ctx = canvas.getContext('2d');
  const W = 480, H = 320;

  let lights = [
    {x:120, y:100, color:'#fff5e0', intensity:1.0, radius:150},
    {x:350, y:80, color:'#6080ff', intensity:0.8, radius:120},
    {x:240, y:250, color:'#ff4040', intensity:0.7, radius:100}
  ];
  let dragging = -1;

  const sceneRects = [
    {x:60, y:80, w:100, h:60, color:'#4a6741'},
    {x:200, y:140, w:120, h:80, color:'#5c4a6e'},
    {x:360, y:100, w:80, h:140, color:'#6e5c3a'}
  ];

  function hexToRgba(hex, a) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return 'rgba('+r+','+g+','+b+','+a+')';
  }

  function render() {
    const ambColor = document.getElementById('ambientColor').value;
    const ambInt = parseInt(document.getElementById('ambientInt').value)/100;
    const fogDen = parseInt(document.getElementById('fogDensity').value)/100;
    const fogCol = document.getElementById('fogColor').value;

    // Clear with ambient
    ctx.fillStyle = hexToRgba(ambColor, 1);
    ctx.fillRect(0, 0, W, H);

    // Scene objects (dimmed by ambient)
    sceneRects.forEach(r => {
      ctx.fillStyle = r.color;
      ctx.globalAlpha = 0.3 + ambInt * 0.7;
      ctx.fillRect(r.x, r.y, r.w, r.h);
    });
    ctx.globalAlpha = 1;

    // Lights as radial gradients (additive-like via globalCompositeOperation)
    ctx.globalCompositeOperation = 'lighter';
    lights.forEach(l => {
      const grad = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.radius);
      grad.addColorStop(0, hexToRgba(l.color, l.intensity * 0.6));
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(l.x - l.radius, l.y - l.radius, l.radius*2, l.radius*2);
    });
    ctx.globalCompositeOperation = 'source-over';

    // Fog overlay
    if (fogDen > 0) {
      ctx.fillStyle = hexToRgba(fogCol, fogDen);
      ctx.fillRect(0, 0, W, H);
    }

    // Light handles
    lights.forEach((l, i) => {
      ctx.beginPath(); ctx.arc(l.x, l.y, 8, 0, Math.PI*2);
      ctx.fillStyle = '#ffeb3b'; ctx.fill();
      ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#000'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(String(i+1), l.x, l.y+3);
    });
  }

  function renderLightList() {
    const el = document.getElementById('lightList');
    el.innerHTML = lights.map((l,i) =>
      '<div class="light-row"><span>#'+(i+1)+'</span><div class="swatch" style="background:'+l.color+'"></div><span>I:'+l.intensity.toFixed(1)+'</span><button data-idx="'+i+'">&times;</button></div>'
    ).join('');
    el.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => { lights.splice(parseInt(btn.dataset.idx),1); renderLightList(); render(); });
    });
  }

  canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    for (let i = 0; i < lights.length; i++) {
      const dx = mx - lights[i].x, dy = my - lights[i].y;
      if (dx*dx+dy*dy < 144) { dragging = i; return; }
    }
  });
  canvas.addEventListener('mousemove', e => {
    if (dragging < 0) return;
    const rect = canvas.getBoundingClientRect();
    lights[dragging].x = e.clientX - rect.left;
    lights[dragging].y = e.clientY - rect.top;
    render();
  });
  canvas.addEventListener('mouseup', () => { dragging = -1; });

  canvas.addEventListener('click', e => {
    if (dragging >= 0) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    // Check if near existing light
    for (const l of lights) { if (Math.hypot(mx-l.x, my-l.y) < 12) return; }
  });

  document.getElementById('addLightBtn').addEventListener('click', () => {
    const hue = Math.floor(Math.random()*360);
    lights.push({x:100+Math.random()*280, y:60+Math.random()*200, color:'hsl('+hue+',70%,70%)', intensity:0.8, radius:120});
    renderLightList();
    render();
  });

  document.querySelectorAll('.controls-panel input').forEach(el => {
    el.addEventListener('input', () => {
      document.getElementById('ambIntVal').textContent = (parseInt(document.getElementById('ambientInt').value)/100).toFixed(1);
      document.getElementById('fogDenVal').textContent = (parseInt(document.getElementById('fogDensity').value)/100).toFixed(1);
      render();
    });
  });

  renderLightList();
  render();
})();`;

  return { workspaceHtml, styles, script };
}

// ─── 10. Profiler Preview ───────────────────────────────────────────────────

export function profilerContent(): EditorContent {
  const workspaceHtml = `
    <div class="preview-editor">
      <div class="toolbar">
        <span class="toolbar-title">Profiler</span>
        <span id="statsLine" style="font-size:11px;opacity:0.8">Avg: --ms | P95: --ms | P99: --ms</span>
      </div>
      <div class="main-area-col">
        <canvas id="profilerCanvas" width="800" height="400"></canvas>
        <div class="flame-section">
          <strong style="font-size:11px;padding:4px 10px">Flame Graph (sample)</strong>
          <div id="flameGraph" class="flame-graph"></div>
        </div>
      </div>
    </div>`;

  const styles = `
    .preview-editor { display:flex; flex-direction:column; height:100%; background:var(--vscode-editor-background); color:var(--vscode-editor-foreground); font-family:var(--vscode-font-family); font-size:13px; }
    .toolbar { display:flex; align-items:center; gap:8px; padding:6px 12px; border-bottom:1px solid var(--vscode-panel-border); }
    .toolbar-title { font-weight:600; flex:1; }
    .main-area-col { display:flex; flex-direction:column; flex:1; overflow:hidden; }
    #profilerCanvas { width:100%; height:300px; display:block; }
    .flame-section { border-top:1px solid var(--vscode-panel-border); padding:4px 0; }
    .flame-graph { display:flex; flex-direction:column; gap:2px; padding:4px 10px; }
    .flame-bar { height:22px; border-radius:3px; display:flex; align-items:center; padding:0 6px; font-size:10px; color:#fff; white-space:nowrap; overflow:hidden; }`;

  const script = `
(function(){
  const canvas = document.getElementById('profilerCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const MAX_POINTS = 120;
  const frameData = [], drawData = [], vramData = [];
  let frameIdx = 0;

  const flameEntries = [
    {name:'main_loop()', width:100, color:'#e65100'},
    {name:'update_physics()', width:45, color:'#1565c0'},
    {name:'render_scene()', width:40, color:'#2e7d32'},
    {name:'lua_callbacks()', width:30, color:'#6a1b9a'},
    {name:'audio_mix()', width:15, color:'#c62828'}
  ];
  const flameEl = document.getElementById('flameGraph');
  flameEntries.forEach(e => {
    const bar = document.createElement('div');
    bar.className = 'flame-bar';
    bar.style.width = e.width + '%';
    bar.style.background = e.color;
    bar.textContent = e.name + ' (' + (e.width*0.167).toFixed(1) + 'ms)';
    flameEl.appendChild(bar);
  });

  function drawChart(data, yMin, yMax, yLabel, chartY, chartH, color, targetLine) {
    const chartX = 60, chartW = W - 80;
    // Axes
    ctx.strokeStyle = '#444'; ctx.lineWidth = 1;
    ctx.strokeRect(chartX, chartY, chartW, chartH);
    // Y labels
    ctx.fillStyle = '#888'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(yMax.toString(), chartX-4, chartY+10);
    ctx.fillText(yMin.toString(), chartX-4, chartY+chartH);
    ctx.fillText(yLabel, chartX + chartW/2, chartY - 4);
    // Target line
    if (targetLine !== undefined) {
      const ty = chartY + chartH - ((targetLine-yMin)/(yMax-yMin))*chartH;
      ctx.strokeStyle = '#4caf50'; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(chartX, ty); ctx.lineTo(chartX+chartW, ty); ctx.stroke();
      ctx.setLineDash([]);
    }
    // Data line
    if (data.length < 2) return;
    ctx.strokeStyle = color; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = chartX + (i / MAX_POINTS) * chartW;
      const y = chartY + chartH - ((data[i]-yMin)/(yMax-yMin))*chartH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function update() {
    // Generate data
    const spike = Math.random() < 0.02;
    frameData.push(spike ? 28 + Math.random()*8 : 16 + Math.random()*4);
    drawData.push(80 + Math.random()*40);
    vramData.push(128 + Math.random()*10);
    if (frameData.length > MAX_POINTS) { frameData.shift(); drawData.shift(); vramData.shift(); }

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#111'; ctx.fillRect(0, 0, W, H);

    const section = Math.floor(H / 3);
    drawChart(frameData, 0, 40, 'Frame Time (ms)', 10, section-20, '#ffeb3b', 16.67);
    drawChart(drawData, 0, 200, 'Draw Calls', section+5, section-20, '#4fc3f7', undefined);
    drawChart(vramData, 0, 512, 'VRAM (MB)', section*2, section-20, '#ab47bc', undefined);

    // Stats
    if (frameData.length > 10) {
      const sorted = [...frameData].sort((a,b)=>a-b);
      const avg = (frameData.reduce((a,b)=>a+b,0)/frameData.length).toFixed(1);
      const p95 = sorted[Math.floor(sorted.length*0.95)].toFixed(1);
      const p99 = sorted[Math.floor(sorted.length*0.99)].toFixed(1);
      document.getElementById('statsLine').textContent = 'Avg: '+avg+'ms | P95: '+p95+'ms | P99: '+p99+'ms';
    }

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
})();`;

  return { workspaceHtml, styles, script };
}

// ─── 11. Globe Preview ──────────────────────────────────────────────────────

export function globeContent(): EditorContent {
  const workspaceHtml = `
    <div class="preview-editor">
      <div class="toolbar">
        <span class="toolbar-title">Globe</span>
        <select id="projection"><option value="equirect">Equirectangular</option><option value="mercator">Mercator</option><option value="mollweide">Mollweide</option></select>
        <select id="tool"><option value="waypoint">Place Waypoint</option><option value="measure">Measure</option></select>
        <label>Time <span id="timeVal">12</span>h <input type="range" id="timeSlider" min="0" max="24" value="12" style="width:100px"></label>
        <span id="coordDisplay" style="font-size:11px;opacity:0.7"></span>
      </div>
      <div class="main-area">
        <div class="preview-area" style="flex:1">
          <canvas id="globeCanvas" width="480" height="480"></canvas>
        </div>
        <div class="waypoint-panel" style="width:200px">
          <strong style="font-size:11px">Waypoints</strong>
          <table id="waypointTable" style="width:100%;font-size:11px;border-collapse:collapse;margin-top:4px">
            <thead><tr><th>#</th><th>Lat</th><th>Lon</th><th>Label</th></tr></thead>
            <tbody></tbody>
          </table>
          <div id="measureResult" style="font-size:11px;margin-top:8px"></div>
        </div>
      </div>
    </div>`;

  const styles = `
    .preview-editor { display:flex; flex-direction:column; height:100%; background:var(--vscode-editor-background); color:var(--vscode-editor-foreground); font-family:var(--vscode-font-family); font-size:13px; }
    .toolbar { display:flex; align-items:center; gap:8px; padding:6px 12px; border-bottom:1px solid var(--vscode-panel-border); flex-wrap:wrap; }
    .toolbar-title { font-weight:600; }
    .toolbar select { background:var(--vscode-dropdown-background); color:var(--vscode-dropdown-foreground); border:1px solid var(--vscode-dropdown-border); padding:2px 4px; font-size:12px; }
    .toolbar label { display:flex; align-items:center; gap:4px; font-size:12px; }
    .main-area { display:flex; flex:1; overflow:hidden; }
    .preview-area { display:flex; align-items:center; justify-content:center; padding:10px; overflow:auto; }
    #globeCanvas { background:#111; border-radius:4px; cursor:crosshair; }
    .waypoint-panel { padding:10px; border-left:1px solid var(--vscode-panel-border); overflow-y:auto; }
    .waypoint-panel th { text-align:left; border-bottom:1px solid var(--vscode-panel-border); padding:2px 4px; }
    .waypoint-panel td { padding:2px 4px; }`;

  const script = `
(function(){
  const canvas = document.getElementById('globeCanvas');
  const ctx = canvas.getContext('2d');
  const W = 480, H = 480;
  let lonOffset = 0, scale = 1;
  let waypoints = [];
  let measurePts = [];
  let dragging = false, dragStartX = 0, dragStartLon = 0;

  // Simplified land rectangles (lat/lon bounding boxes)
  const landMasses = [
    {lat1:35,lat2:70,lon1:-10,lon2:40},   // Europe
    {lat1:15,lat2:35,lon1:-20,lon2:50},    // N Africa / Middle East
    {lat1:-35,lat2:15,lon1:10,lon2:50},    // Africa
    {lat1:25,lat2:72,lon1:-130,lon2:-60},  // N America
    {lat1:-55,lat2:12,lon1:-80,lon2:-35},  // S America
    {lat1:10,lat2:55,lon1:70,lon2:140},    // Asia
    {lat1:-45,lat2:-10,lon1:110,lon2:155}, // Australia
    {lat1:50,lat2:72,lon1:40,lon2:180},    // Russia
  ];

  function project(lat, lon) {
    const proj = document.getElementById('projection').value;
    const adjLon = ((lon - lonOffset) % 360 + 540) % 360 - 180;
    let x, y;
    if (proj === 'equirect') {
      x = (adjLon + 180) / 360 * W;
      y = (90 - lat) / 180 * H;
    } else if (proj === 'mercator') {
      x = (adjLon + 180) / 360 * W;
      const latRad = lat * Math.PI / 180;
      const mercY = Math.log(Math.tan(Math.PI/4 + latRad/2));
      y = H/2 - mercY * H / (2*Math.PI) * scale;
    } else { // mollweide
      const latRad = lat * Math.PI / 180;
      let theta = latRad;
      for (let i = 0; i < 10; i++) { theta -= (2*theta + Math.sin(2*theta) - Math.PI*Math.sin(latRad)) / (2 + 2*Math.cos(2*theta)); }
      x = W/2 + (adjLon/180) * (W/2 * 0.9) * Math.cos(theta);
      y = H/2 - (H/2 * 0.9) * Math.sin(theta);
    }
    return {x: x*scale + (W*(1-scale))/2, y: y*scale + (H*(1-scale))/2};
  }

  function unproject(px, py) {
    const proj = document.getElementById('projection').value;
    const sx = (px - (W*(1-scale))/2) / scale;
    const sy = (py - (H*(1-scale))/2) / scale;
    let lat, lon;
    if (proj === 'equirect') {
      lon = (sx / W) * 360 - 180 + lonOffset;
      lat = 90 - (sy / H) * 180;
    } else if (proj === 'mercator') {
      lon = (sx / W) * 360 - 180 + lonOffset;
      const mercY = (H/2 - sy) * (2*Math.PI) / H / scale;
      lat = (2*Math.atan(Math.exp(mercY)) - Math.PI/2) * 180 / Math.PI;
    } else {
      lon = lonOffset; lat = 0; // approximate
    }
    return { lat: Math.round(lat*10)/10, lon: Math.round(((lon+540)%360-180)*10)/10 };
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0a1628'; ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 0.5;
    for (let lat = -75; lat <= 75; lat += 15) {
      ctx.beginPath();
      for (let lon = -180; lon <= 180; lon += 2) {
        const p = project(lat, lon);
        if (lon === -180) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    for (let lon = -180; lon <= 180; lon += 15) {
      ctx.beginPath();
      for (let lat = -90; lat <= 90; lat += 2) {
        const p = project(lat, lon);
        if (lat === -90) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // Land masses
    ctx.fillStyle = '#2e7d32';
    landMasses.forEach(lm => {
      ctx.beginPath();
      const tl = project(lm.lat2, lm.lon1);
      const tr = project(lm.lat2, lm.lon2);
      const br = project(lm.lat1, lm.lon2);
      const bl = project(lm.lat1, lm.lon1);
      ctx.moveTo(tl.x, tl.y); ctx.lineTo(tr.x, tr.y); ctx.lineTo(br.x, br.y); ctx.lineTo(bl.x, bl.y);
      ctx.closePath(); ctx.fill();
    });

    // Day/Night terminator
    const time = parseInt(document.getElementById('timeSlider').value);
    const terminatorLon = (time - 12) * 15 + lonOffset;
    ctx.fillStyle = 'rgba(0,0,30,0.4)';
    ctx.beginPath();
    const startP = project(90, terminatorLon);
    ctx.moveTo(startP.x, startP.y);
    for (let lat = 90; lat >= -90; lat -= 2) { const p = project(lat, terminatorLon); ctx.lineTo(p.x, p.y); }
    // close night side
    const nightSide = terminatorLon + 180;
    for (let lat = -90; lat <= 90; lat += 2) { const p = project(lat, nightSide); ctx.lineTo(p.x, p.y); }
    ctx.closePath(); ctx.fill();

    // Waypoints
    waypoints.forEach((wp, i) => {
      const p = project(wp.lat, wp.lon);
      ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI*2);
      ctx.fillStyle = '#f44336'; ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(String(i+1), p.x, p.y+3);
    });

    // Measure line
    if (measurePts.length === 2) {
      const p1 = project(measurePts[0].lat, measurePts[0].lon);
      const p2 = project(measurePts[1].lat, measurePts[1].lon);
      ctx.strokeStyle = '#ffeb3b'; ctx.lineWidth = 2; ctx.setLineDash([6,4]);
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function greatCircleDist(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  function renderWaypointTable() {
    const tbody = document.querySelector('#waypointTable tbody');
    tbody.innerHTML = waypoints.map((wp, i) =>
      '<tr><td>'+(i+1)+'</td><td>'+wp.lat.toFixed(1)+'</td><td>'+wp.lon.toFixed(1)+'</td><td>WP'+(i+1)+'</td></tr>'
    ).join('');
  }

  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const coord = unproject(mx, my);
    const tool = document.getElementById('tool').value;

    document.getElementById('coordDisplay').textContent = coord.lat.toFixed(1) + ', ' + coord.lon.toFixed(1);

    if (tool === 'waypoint') {
      waypoints.push(coord);
      renderWaypointTable();
    } else if (tool === 'measure') {
      measurePts.push(coord);
      if (measurePts.length > 2) measurePts = [coord];
      if (measurePts.length === 2) {
        const d = greatCircleDist(measurePts[0].lat, measurePts[0].lon, measurePts[1].lat, measurePts[1].lon);
        document.getElementById('measureResult').textContent = 'Distance: ' + d.toFixed(0) + ' km';
      }
    }
    render();
  });

  // Drag to rotate
  canvas.addEventListener('mousedown', e => { dragging = true; dragStartX = e.clientX; dragStartLon = lonOffset; });
  canvas.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx = e.clientX - dragStartX;
    lonOffset = dragStartLon + dx * 0.5;
    render();
  });
  canvas.addEventListener('mouseup', () => { dragging = false; });
  canvas.addEventListener('mouseleave', () => { dragging = false; });

  // Zoom
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    scale = Math.max(0.5, Math.min(4, scale - e.deltaY * 0.001));
    render();
  }, {passive:false});

  document.getElementById('timeSlider').addEventListener('input', e => {
    document.getElementById('timeVal').textContent = e.target.value;
    render();
  });
  document.getElementById('projection').addEventListener('change', render);

  render();
})();`;

  return { workspaceHtml, styles, script };
}
