import type { EditorContent } from "./types.js";

// ─── Shared timeline base ───────────────────────────────────────────────────

interface TrackDef {
  name: string;
  color: string;
}

interface KeyframeDef {
  id: number;
  track: number;
  time: number;
  value: number;
  easing: string;
}

interface TimelineBaseConfig {
  tracks: TrackDef[];
  duration: number;
  fps: number;
  keyframes: KeyframeDef[];
  extraHtml?: string;
  extraStyles?: string;
  extraScript?: string;
}

function timelineBase(config: TimelineBaseConfig): EditorContent {
  const { tracks, duration, fps, keyframes, extraHtml, extraStyles, extraScript } = config;

  const trackHeaders = tracks.map((t, i) =>
    `<div class="track-header" data-track="${i}" style="border-left:3px solid ${t.color}">
          <span class="track-name">${t.name}</span>
          <button class="track-btn mute-btn" data-track="${i}" title="Mute">M</button>
          <button class="track-btn lock-btn" data-track="${i}" title="Lock">\u{1F512}</button>
        </div>`
  ).join("\n        ");

  const workspaceHtml = `
    <div class="timeline-editor">
      <div class="toolbar">
        <button id="playBtn" title="Play">\u25B6</button>
        <button id="stopBtn" title="Stop">\u25A0</button>
        <span id="timeDisplay" class="time-display">00:00.000</span>
        <label class="toolbar-label">FPS: <input id="fpsInput" type="number" min="1" max="120" value="${fps}" class="fps-input"></label>
        <button id="addKeyframeBtn" title="Add Keyframe">\u25C6</button>
        <select id="easingSelect" class="easing-select">
          <option value="linear">linear</option>
          <option value="ease-in">ease-in</option>
          <option value="ease-out">ease-out</option>
          <option value="ease-in-out">ease-in-out</option>
          <option value="bounce">bounce</option>
        </select>
        ${extraHtml ?? ""}
      </div>
      <div class="main-area">
        <div class="track-list">
          ${trackHeaders}
        </div>
        <canvas id="timelineCanvas" class="timeline-canvas"></canvas>
      </div>
      <div class="properties-panel" id="propsPanel">
        <span class="props-label">No keyframe selected</span>
      </div>
    </div>`;

  const styles = `
    .timeline-editor {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      overflow: hidden;
    }
    .toolbar {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      background: var(--vscode-titleBar-activeBackground);
      border-bottom: 1px solid var(--vscode-panel-border);
      flex-shrink: 0;
    }
    .toolbar button, .toolbar select {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: 1px solid var(--vscode-button-border, transparent);
      padding: 3px 8px;
      cursor: pointer;
      border-radius: 3px;
    }
    .toolbar button:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    .time-display {
      font-family: monospace;
      padding: 2px 8px;
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border);
      border-radius: 3px;
      min-width: 80px;
      text-align: center;
    }
    .fps-input {
      width: 48px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 3px;
      padding: 2px 4px;
    }
    .easing-select {
      background: var(--vscode-dropdown-background);
      color: var(--vscode-dropdown-foreground);
      border: 1px solid var(--vscode-dropdown-border);
    }
    .toolbar-label {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .main-area {
      display: flex;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }
    .track-list {
      width: 140px;
      flex-shrink: 0;
      border-right: 1px solid var(--vscode-panel-border);
      overflow-y: auto;
      background: var(--vscode-sideBar-background);
    }
    .track-header {
      display: flex;
      align-items: center;
      height: 40px;
      padding: 0 6px;
      gap: 4px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .track-header:nth-child(even) {
      background: rgba(255,255,255,0.02);
    }
    .track-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 11px;
    }
    .track-btn {
      width: 20px;
      height: 20px;
      padding: 0;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: 1px solid var(--vscode-button-border, transparent);
      border-radius: 3px;
      cursor: pointer;
    }
    .track-btn:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    .track-btn.active {
      background: var(--vscode-inputValidation-warningBackground);
      color: var(--vscode-inputValidation-warningForeground);
    }
    .timeline-canvas {
      flex: 1;
      min-width: 0;
      cursor: crosshair;
    }
    .properties-panel {
      height: 60px;
      flex-shrink: 0;
      border-top: 1px solid var(--vscode-panel-border);
      padding: 6px 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      background: var(--vscode-sideBar-background);
      font-size: 11px;
    }
    .props-label {
      color: var(--vscode-descriptionForeground);
    }
    .props-field {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .props-field input, .props-field select {
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 3px;
      padding: 2px 4px;
      width: 70px;
    }
    ${extraStyles ?? ""}`;

  const script = `
    (function() {
      const DURATION = ${duration};
      const RULER_H = 30;
      const TRACK_H = 40;
      const TRACK_COUNT = ${tracks.length};
      const TRACK_COLORS = ${JSON.stringify(tracks.map(t => t.color))};

      let pixelsPerMs = 0.15;
      let scrollX = 0;
      let playhead = 0;
      let playing = false;
      let lastFrameTime = 0;
      let selectedKeyframe = null;
      let draggingKf = null;
      let dragStartX = 0;
      let dragStartTime = 0;

      let keyframes = ${JSON.stringify(keyframes)};
      let nextId = keyframes.length ? Math.max(...keyframes.map(k => k.id)) + 1 : 1;

      const canvas = document.getElementById("timelineCanvas");
      const ctx = canvas.getContext("2d");
      const playBtn = document.getElementById("playBtn");
      const stopBtn = document.getElementById("stopBtn");
      const timeDisplay = document.getElementById("timeDisplay");
      const fpsInput = document.getElementById("fpsInput");
      const addKfBtn = document.getElementById("addKeyframeBtn");
      const easingSelect = document.getElementById("easingSelect");
      const propsPanel = document.getElementById("propsPanel");

      function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        const trackListW = 140;
        canvas.width = rect.width - trackListW;
        canvas.height = rect.height;
        draw();
      }
      window.addEventListener("resize", resize);
      setTimeout(resize, 0);

      function formatTime(ms) {
        const totalSec = ms / 1000;
        const min = Math.floor(totalSec / 60);
        const sec = Math.floor(totalSec % 60);
        const millis = Math.floor(ms % 1000);
        return String(min).padStart(2,"0") + ":" + String(sec).padStart(2,"0") + "." + String(millis).padStart(3,"0");
      }

      function draw() {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Track lanes
        for (let i = 0; i < TRACK_COUNT; i++) {
          const y = RULER_H + i * TRACK_H;
          ctx.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)";
          ctx.fillRect(0, y, w, TRACK_H);
          ctx.strokeStyle = "rgba(128,128,128,0.15)";
          ctx.beginPath();
          ctx.moveTo(0, y + TRACK_H);
          ctx.lineTo(w, y + TRACK_H);
          ctx.stroke();
        }

        // Ruler
        ctx.fillStyle = "rgba(30,30,30,0.6)";
        ctx.fillRect(0, 0, w, RULER_H);
        ctx.strokeStyle = "rgba(128,128,128,0.4)";
        ctx.beginPath();
        ctx.moveTo(0, RULER_H);
        ctx.lineTo(w, RULER_H);
        ctx.stroke();

        const startMs = scrollX / pixelsPerMs;
        const endMs = (scrollX + w) / pixelsPerMs;
        const tickInterval = 100;
        const labelInterval = 1000;
        const firstTick = Math.floor(startMs / tickInterval) * tickInterval;

        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        for (let t = firstTick; t <= endMs; t += tickInterval) {
          const x = (t * pixelsPerMs) - scrollX;
          if (x < 0) continue;
          const isLabel = t % labelInterval === 0;
          ctx.strokeStyle = isLabel ? "rgba(200,200,200,0.5)" : "rgba(128,128,128,0.3)";
          ctx.beginPath();
          ctx.moveTo(x, isLabel ? 0 : RULER_H - 8);
          ctx.lineTo(x, RULER_H);
          ctx.stroke();
          if (isLabel) {
            ctx.fillStyle = "rgba(200,200,200,0.8)";
            ctx.fillText((t / 1000).toFixed(1) + "s", x, 12);
          }
        }

        // Keyframes
        for (const kf of keyframes) {
          const x = (kf.time * pixelsPerMs) - scrollX;
          const y = RULER_H + kf.track * TRACK_H + TRACK_H / 2;
          if (x < -10 || x > w + 10) continue;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(Math.PI / 4);
          const size = 6;
          ctx.fillStyle = (selectedKeyframe && selectedKeyframe.id === kf.id)
            ? "#f0c040"
            : TRACK_COLORS[kf.track] || "var(--vscode-focusBorder, #007acc)";
          ctx.fillRect(-size/2, -size/2, size, size);
          ctx.strokeStyle = "rgba(255,255,255,0.5)";
          ctx.strokeRect(-size/2, -size/2, size, size);
          ctx.restore();
        }

        // Playhead
        const phX = (playhead * pixelsPerMs) - scrollX;
        if (phX >= 0 && phX <= w) {
          ctx.strokeStyle = "#e03030";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(phX, 0);
          ctx.lineTo(phX, h);
          ctx.stroke();
          ctx.lineWidth = 1;
          // Playhead handle
          ctx.fillStyle = "#e03030";
          ctx.beginPath();
          ctx.moveTo(phX - 5, 0);
          ctx.lineTo(phX + 5, 0);
          ctx.lineTo(phX, 8);
          ctx.closePath();
          ctx.fill();
        }

        timeDisplay.textContent = formatTime(playhead);
      }

      function animate(timestamp) {
        if (!playing) return;
        if (!lastFrameTime) lastFrameTime = timestamp;
        const delta = timestamp - lastFrameTime;
        lastFrameTime = timestamp;
        playhead += delta;
        if (playhead >= DURATION) playhead = 0;
        draw();
        requestAnimationFrame(animate);
      }

      playBtn.addEventListener("click", () => {
        if (!playing) {
          playing = true;
          lastFrameTime = 0;
          playBtn.textContent = "\u23F8";
          requestAnimationFrame(animate);
        } else {
          playing = false;
          playBtn.textContent = "\u25B6";
        }
      });

      stopBtn.addEventListener("click", () => {
        playing = false;
        playhead = 0;
        playBtn.textContent = "\u25B6";
        draw();
      });

      addKfBtn.addEventListener("click", () => {
        const track = 0;
        const kf = { id: nextId++, track, time: playhead, value: 0, easing: easingSelect.value };
        keyframes.push(kf);
        selectedKeyframe = kf;
        updateProps();
        draw();
      });

      fpsInput.addEventListener("change", () => {
        // FPS stored for external consumers
      });

      // Canvas interaction
      canvas.addEventListener("mousedown", (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const timeAtMouse = (mx + scrollX) / pixelsPerMs;
        const trackAtMouse = Math.floor((my - RULER_H) / TRACK_H);

        // Check keyframe hit
        let hit = null;
        for (const kf of keyframes) {
          const kx = (kf.time * pixelsPerMs) - scrollX;
          const ky = RULER_H + kf.track * TRACK_H + TRACK_H / 2;
          if (Math.abs(mx - kx) < 8 && Math.abs(my - ky) < 8) {
            hit = kf;
            break;
          }
        }

        if (hit) {
          selectedKeyframe = hit;
          draggingKf = hit;
          dragStartX = mx;
          dragStartTime = hit.time;
          updateProps();
          draw();
        } else if (my < RULER_H || (trackAtMouse >= 0 && trackAtMouse < TRACK_COUNT)) {
          playhead = Math.max(0, Math.min(DURATION, timeAtMouse));
          selectedKeyframe = null;
          updateProps();
          draw();
        }
      });

      canvas.addEventListener("mousemove", (e) => {
        if (!draggingKf) return;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const delta = mx - dragStartX;
        const newTime = dragStartTime + delta / pixelsPerMs;
        draggingKf.time = Math.max(0, Math.min(DURATION, newTime));
        updateProps();
        draw();
      });

      canvas.addEventListener("mouseup", () => { draggingKf = null; });
      canvas.addEventListener("mouseleave", () => { draggingKf = null; });

      canvas.addEventListener("dblclick", (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const trackAtMouse = Math.floor((my - RULER_H) / TRACK_H);
        if (trackAtMouse >= 0 && trackAtMouse < TRACK_COUNT) {
          const time = (mx + scrollX) / pixelsPerMs;
          const kf = { id: nextId++, track: trackAtMouse, time: Math.max(0, Math.min(DURATION, time)), value: 0, easing: easingSelect.value };
          keyframes.push(kf);
          selectedKeyframe = kf;
          updateProps();
          draw();
        }
      });

      canvas.addEventListener("wheel", (e) => {
        if (e.ctrlKey) {
          e.preventDefault();
          const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
          pixelsPerMs = Math.max(0.05, Math.min(0.5, pixelsPerMs * zoomFactor));
          draw();
        } else {
          scrollX = Math.max(0, scrollX + e.deltaX + e.deltaY);
          draw();
        }
      }, { passive: false });

      function updateProps() {
        if (!selectedKeyframe) {
          propsPanel.innerHTML = '<span class="props-label">No keyframe selected</span>';
          return;
        }
        const kf = selectedKeyframe;
        propsPanel.innerHTML =
          '<div class="props-field"><label>Time:</label><input id="propTime" type="number" step="10" value="' + Math.round(kf.time) + '"></div>' +
          '<div class="props-field"><label>Value:</label><input id="propValue" type="number" step="0.1" value="' + kf.value.toFixed(2) + '"></div>' +
          '<div class="props-field"><label>Easing:</label><select id="propEasing">' +
            '<option value="linear"' + (kf.easing==="linear"?" selected":"") + '>linear</option>' +
            '<option value="ease-in"' + (kf.easing==="ease-in"?" selected":"") + '>ease-in</option>' +
            '<option value="ease-out"' + (kf.easing==="ease-out"?" selected":"") + '>ease-out</option>' +
            '<option value="ease-in-out"' + (kf.easing==="ease-in-out"?" selected":"") + '>ease-in-out</option>' +
            '<option value="bounce"' + (kf.easing==="bounce"?" selected":"") + '>bounce</option>' +
          '</select></div>';
        document.getElementById("propTime").addEventListener("change", (ev) => {
          kf.time = Math.max(0, Math.min(DURATION, Number(ev.target.value)));
          draw();
        });
        document.getElementById("propValue").addEventListener("change", (ev) => {
          kf.value = Number(ev.target.value);
          draw();
        });
        document.getElementById("propEasing").addEventListener("change", (ev) => {
          kf.easing = ev.target.value;
        });
      }

      // Mute/lock buttons
      document.querySelectorAll(".mute-btn").forEach(btn => {
        btn.addEventListener("click", () => btn.classList.toggle("active"));
      });
      document.querySelectorAll(".lock-btn").forEach(btn => {
        btn.addEventListener("click", () => btn.classList.toggle("active"));
      });

      ${extraScript ?? ""}

      draw();
    })();`;

  return { workspaceHtml, styles, script };
}

// ─── 1. Cutscene timeline ───────────────────────────────────────────────────

export function timelineContent(): EditorContent {
  return timelineBase({
    tracks: [
      { name: "Animation", color: "#4fc3f7" },
      { name: "Audio", color: "#81c784" },
      { name: "Camera", color: "#ffb74d" },
      { name: "Event", color: "#ce93d8" },
    ],
    duration: 5000,
    fps: 24,
    keyframes: [
      { id: 1, track: 0, time: 0, value: 0, easing: "linear" },
      { id: 2, track: 0, time: 1200, value: 1, easing: "ease-in" },
      { id: 3, track: 1, time: 500, value: 0.8, easing: "linear" },
      { id: 4, track: 2, time: 0, value: 0, easing: "ease-out" },
      { id: 5, track: 2, time: 2500, value: 1, easing: "ease-in-out" },
      { id: 6, track: 3, time: 1800, value: 1, easing: "bounce" },
    ],
  });
}

// ─── 2. Sprite animation editor ────────────────────────────────────────────

export function spriteAnimContent(): EditorContent {
  const workspaceHtml = `
    <div class="sprite-anim-editor">
      <div class="toolbar">
        <button id="saPlayBtn" title="Play">\u25B6</button>
        <button id="saStopBtn" title="Stop">\u25A0</button>
        <label class="toolbar-label">FPS: <input id="saFpsSlider" type="range" min="1" max="60" value="12" class="fps-slider"><span id="saFpsVal">12</span></label>
        <button id="saAddFrameBtn">Add Frame</button>
        <button id="saDelFrameBtn">Delete Frame</button>
        <button id="saHitboxToggle" class="toggle-btn">Hitbox</button>
        <button id="saOnionToggle" class="toggle-btn">Onion</button>
      </div>
      <div class="sprite-main">
        <canvas id="saPreviewCanvas" class="preview-canvas" width="256" height="256"></canvas>
        <div class="frame-data-panel" id="saFrameData">
          <span class="props-label">No frame selected</span>
        </div>
      </div>
      <div class="frame-strip" id="saFrameStrip"></div>
    </div>`;

  const styles = `
    .sprite-anim-editor {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      overflow: hidden;
    }
    .toolbar {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      background: var(--vscode-titleBar-activeBackground);
      border-bottom: 1px solid var(--vscode-panel-border);
      flex-shrink: 0;
    }
    .toolbar button, .toolbar select {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: 1px solid var(--vscode-button-border, transparent);
      padding: 3px 8px;
      cursor: pointer;
      border-radius: 3px;
    }
    .toolbar button:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    .toolbar-label {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .fps-slider {
      width: 80px;
      cursor: pointer;
    }
    .toggle-btn.active {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    .sprite-main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 8px;
      min-height: 0;
      padding: 10px;
    }
    .preview-canvas {
      border: 1px solid var(--vscode-panel-border);
      background: repeating-conic-gradient(rgba(128,128,128,0.15) 0% 25%, transparent 0% 50%) 50% / 16px 16px;
      image-rendering: pixelated;
    }
    .frame-data-panel {
      display: flex;
      gap: 10px;
      align-items: center;
      font-size: 11px;
      padding: 4px 8px;
      background: var(--vscode-sideBar-background);
      border-radius: 4px;
      min-height: 28px;
    }
    .frame-data-panel label {
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .frame-data-panel input[type="number"] {
      width: 50px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 3px;
      padding: 1px 3px;
    }
    .frame-data-panel input[type="checkbox"] {
      cursor: pointer;
    }
    .props-label {
      color: var(--vscode-descriptionForeground);
    }
    .frame-strip {
      height: 80px;
      flex-shrink: 0;
      border-top: 1px solid var(--vscode-panel-border);
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 10px;
      overflow-x: auto;
      background: var(--vscode-sideBar-background);
    }
    .frame-thumb {
      width: 60px;
      height: 60px;
      border: 2px solid var(--vscode-panel-border);
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      flex-shrink: 0;
      position: relative;
    }
    .frame-thumb.selected {
      border-color: var(--vscode-focusBorder);
      box-shadow: 0 0 0 1px var(--vscode-focusBorder);
    }
    .frame-thumb .frame-num {
      position: absolute;
      bottom: 2px;
      right: 4px;
      font-size: 9px;
      color: var(--vscode-descriptionForeground);
    }`;

  const script = `
    (function() {
      const FRAME_COLORS = ["#e57373","#64b5f6","#81c784","#ffb74d","#ce93d8","#4dd0e1","#fff176","#a1887f"];
      let frames = [
        { color: FRAME_COLORS[0], duration: 83, flipX: false, flipY: false, hitbox: {x:60,y:60,w:136,h:136}, hurtbox: {x:80,y:40,w:96,h:176} },
        { color: FRAME_COLORS[1], duration: 83, flipX: false, flipY: false, hitbox: {x:50,y:50,w:156,h:156}, hurtbox: {x:70,y:30,w:116,h:196} },
        { color: FRAME_COLORS[2], duration: 83, flipX: false, flipY: false, hitbox: {x:60,y:60,w:136,h:136}, hurtbox: {x:80,y:40,w:96,h:176} },
        { color: FRAME_COLORS[3], duration: 83, flipX: false, flipY: false, hitbox: {x:55,y:55,w:146,h:146}, hurtbox: {x:75,y:35,w:106,h:186} },
      ];
      let selectedFrame = 0;
      let playing = false;
      let lastFrameTime = 0;
      let accumulator = 0;
      let showHitbox = false;
      let showOnion = false;

      const canvas = document.getElementById("saPreviewCanvas");
      const ctx = canvas.getContext("2d");
      const strip = document.getElementById("saFrameStrip");
      const playBtn = document.getElementById("saPlayBtn");
      const stopBtn = document.getElementById("saStopBtn");
      const fpsSlider = document.getElementById("saFpsSlider");
      const fpsVal = document.getElementById("saFpsVal");
      const addBtn = document.getElementById("saAddFrameBtn");
      const delBtn = document.getElementById("saDelFrameBtn");
      const hitboxToggle = document.getElementById("saHitboxToggle");
      const onionToggle = document.getElementById("saOnionToggle");
      const frameData = document.getElementById("saFrameData");

      function getFps() { return parseInt(fpsSlider.value) || 12; }
      function getFrameDuration(i) { return frames[i].duration || (1000 / getFps()); }

      function renderStrip() {
        strip.innerHTML = "";
        frames.forEach((f, i) => {
          const div = document.createElement("div");
          div.className = "frame-thumb" + (i === selectedFrame ? " selected" : "");
          div.style.background = f.color;
          div.innerHTML = '<span class="frame-num">' + i + '</span>';
          div.addEventListener("click", () => { selectedFrame = i; renderStrip(); drawPreview(); updateFrameData(); });
          strip.appendChild(div);
        });
      }

      function drawPreview() {
        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Pixel grid
        ctx.strokeStyle = "rgba(128,128,128,0.1)";
        const gridSize = 16;
        for (let x = 0; x <= w; x += gridSize) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 0; y <= h; y += gridSize) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        // Onion skin (previous and next frame)
        if (showOnion && frames.length > 1) {
          const prevIdx = (selectedFrame - 1 + frames.length) % frames.length;
          const nextIdx = (selectedFrame + 1) % frames.length;
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = frames[prevIdx].color;
          ctx.fillRect(20, 20, w - 40, h - 40);
          ctx.fillStyle = frames[nextIdx].color;
          ctx.fillRect(30, 30, w - 60, h - 60);
          ctx.globalAlpha = 1.0;
        }

        // Current frame
        const f = frames[selectedFrame];
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.scale(f.flipX ? -1 : 1, f.flipY ? -1 : 1);
        ctx.fillStyle = f.color;
        ctx.fillRect(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20);
        ctx.restore();

        // Hitbox/hurtbox overlay
        if (showHitbox && f.hitbox && f.hurtbox) {
          ctx.strokeStyle = "rgba(60,120,255,0.8)";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(f.hitbox.x, f.hitbox.y, f.hitbox.w, f.hitbox.h);
          ctx.fillStyle = "rgba(60,120,255,0.1)";
          ctx.fillRect(f.hitbox.x, f.hitbox.y, f.hitbox.w, f.hitbox.h);

          ctx.strokeStyle = "rgba(255,60,60,0.8)";
          ctx.strokeRect(f.hurtbox.x, f.hurtbox.y, f.hurtbox.w, f.hurtbox.h);
          ctx.fillStyle = "rgba(255,60,60,0.1)";
          ctx.fillRect(f.hurtbox.x, f.hurtbox.y, f.hurtbox.w, f.hurtbox.h);
          ctx.setLineDash([]);
          ctx.lineWidth = 1;
        }
      }

      function updateFrameData() {
        const f = frames[selectedFrame];
        frameData.innerHTML =
          '<label>Frame: <strong>' + selectedFrame + '</strong></label>' +
          '<label>Duration(ms): <input type="number" id="fdDur" min="10" value="' + f.duration + '"></label>' +
          '<label>Flip X: <input type="checkbox" id="fdFlipX"' + (f.flipX ? " checked" : "") + '></label>' +
          '<label>Flip Y: <input type="checkbox" id="fdFlipY"' + (f.flipY ? " checked" : "") + '></label>';
        document.getElementById("fdDur").addEventListener("change", (e) => { f.duration = Math.max(10, Number(e.target.value)); });
        document.getElementById("fdFlipX").addEventListener("change", (e) => { f.flipX = e.target.checked; drawPreview(); });
        document.getElementById("fdFlipY").addEventListener("change", (e) => { f.flipY = e.target.checked; drawPreview(); });
      }

      function animate(timestamp) {
        if (!playing) return;
        if (!lastFrameTime) lastFrameTime = timestamp;
        const delta = timestamp - lastFrameTime;
        lastFrameTime = timestamp;
        accumulator += delta;
        const dur = getFrameDuration(selectedFrame);
        if (accumulator >= dur) {
          accumulator -= dur;
          selectedFrame = (selectedFrame + 1) % frames.length;
          renderStrip();
          drawPreview();
          updateFrameData();
        }
        requestAnimationFrame(animate);
      }

      playBtn.addEventListener("click", () => {
        if (!playing) {
          playing = true;
          lastFrameTime = 0;
          accumulator = 0;
          playBtn.textContent = "\u23F8";
          requestAnimationFrame(animate);
        } else {
          playing = false;
          playBtn.textContent = "\u25B6";
        }
      });

      stopBtn.addEventListener("click", () => {
        playing = false;
        playBtn.textContent = "\u25B6";
        selectedFrame = 0;
        renderStrip();
        drawPreview();
        updateFrameData();
      });

      fpsSlider.addEventListener("input", () => { fpsVal.textContent = fpsSlider.value; });

      addBtn.addEventListener("click", () => {
        const color = FRAME_COLORS[frames.length % FRAME_COLORS.length];
        frames.push({ color, duration: Math.round(1000 / getFps()), flipX: false, flipY: false, hitbox: {x:60,y:60,w:136,h:136}, hurtbox: {x:80,y:40,w:96,h:176} });
        selectedFrame = frames.length - 1;
        renderStrip();
        drawPreview();
        updateFrameData();
      });

      delBtn.addEventListener("click", () => {
        if (frames.length <= 1) return;
        frames.splice(selectedFrame, 1);
        if (selectedFrame >= frames.length) selectedFrame = frames.length - 1;
        renderStrip();
        drawPreview();
        updateFrameData();
      });

      hitboxToggle.addEventListener("click", () => {
        showHitbox = !showHitbox;
        hitboxToggle.classList.toggle("active", showHitbox);
        drawPreview();
      });

      onionToggle.addEventListener("click", () => {
        showOnion = !showOnion;
        onionToggle.classList.toggle("active", showOnion);
        drawPreview();
      });

      renderStrip();
      drawPreview();
      updateFrameData();
    })();`;

  return { workspaceHtml, styles, script };
}

// ─── 3. Skeleton rigging editor ─────────────────────────────────────────────

export function skeletonRiggingContent(): EditorContent {
  const defaultBones = [
    { name: "Root", parent: -1, length: 40, rotation: -90 },
    { name: "Spine", parent: 0, length: 60, rotation: -90 },
    { name: "Head", parent: 1, length: 30, rotation: -90 },
    { name: "Arm_L", parent: 1, length: 50, rotation: -160 },
    { name: "Arm_R", parent: 1, length: 50, rotation: -20 },
    { name: "Leg_L", parent: 0, length: 55, rotation: 110 },
    { name: "Leg_R", parent: 0, length: 55, rotation: 70 },
  ];

  const trackDefs = defaultBones.map((b, i) => ({ name: b.name, color: `hsl(${i * 51}, 60%, 60%)` }));
  const initialKeyframes = [
    { id: 1, track: 0, time: 0, value: -90, easing: "linear" },
    { id: 2, track: 1, time: 0, value: -90, easing: "linear" },
    { id: 3, track: 2, time: 0, value: -90, easing: "linear" },
    { id: 4, track: 3, time: 0, value: -160, easing: "ease-in-out" },
    { id: 5, track: 4, time: 0, value: -20, easing: "ease-in-out" },
    { id: 6, track: 5, time: 0, value: 110, easing: "linear" },
    { id: 7, track: 6, time: 0, value: 70, easing: "linear" },
    { id: 8, track: 3, time: 1500, value: -140, easing: "ease-in-out" },
    { id: 9, track: 4, time: 1500, value: -40, easing: "ease-in-out" },
    { id: 10, track: 5, time: 1200, value: 120, easing: "ease-in" },
    { id: 11, track: 6, time: 1200, value: 60, easing: "ease-in" },
  ];

  const base = timelineBase({
    tracks: trackDefs,
    duration: 3000,
    fps: 30,
    keyframes: initialKeyframes,
    extraHtml: `
        <button id="skAddBoneBtn">Add Bone</button>
        <button id="skIkToggle" class="toggle-btn">IK</button>
        <button id="skWeightToggle" class="toggle-btn">Weight Paint</button>`,
    extraStyles: `
    .skeleton-layout {
      display: flex;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }
    .bone-preview-wrap {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }
    .bone-preview-canvas {
      width: 320px;
      height: 320px;
      border: 1px solid var(--vscode-panel-border);
      background: var(--vscode-editor-background);
      cursor: pointer;
      align-self: center;
      margin: 8px;
    }
    .bone-hierarchy {
      width: 160px;
      flex-shrink: 0;
      border-left: 1px solid var(--vscode-panel-border);
      overflow-y: auto;
      padding: 6px;
      background: var(--vscode-sideBar-background);
      font-size: 11px;
    }
    .bone-tree-item {
      padding: 3px 4px;
      cursor: pointer;
      border-radius: 3px;
      white-space: nowrap;
    }
    .bone-tree-item:hover {
      background: rgba(255,255,255,0.05);
    }
    .bone-tree-item.selected {
      background: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
    }
    .bone-props {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 4px 8px;
      font-size: 11px;
    }
    .bone-props label {
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .bone-props input, .bone-props select {
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 3px;
      padding: 1px 4px;
      width: 60px;
    }
    .weight-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
    }`,
    extraScript: `
      // Skeleton rigging extension
      const BONES = ${JSON.stringify(defaultBones)};
      let selectedBone = 0;
      let ikMode = false;
      let weightMode = false;

      const boneCanvas = document.createElement("canvas");
      boneCanvas.id = "skBoneCanvas";
      boneCanvas.className = "bone-preview-canvas";
      boneCanvas.width = 320;
      boneCanvas.height = 320;

      const hierarchyDiv = document.createElement("div");
      hierarchyDiv.className = "bone-hierarchy";

      // Insert bone preview above main timeline area
      const mainArea = document.querySelector(".main-area");
      const timelineEditor = document.querySelector(".timeline-editor");

      const skeletonLayout = document.createElement("div");
      skeletonLayout.className = "skeleton-layout";

      const boneWrap = document.createElement("div");
      boneWrap.className = "bone-preview-wrap";
      boneWrap.appendChild(boneCanvas);

      skeletonLayout.appendChild(boneWrap);
      skeletonLayout.appendChild(hierarchyDiv);
      timelineEditor.insertBefore(skeletonLayout, mainArea);

      const boneCtx = boneCanvas.getContext("2d");
      const skAddBoneBtn = document.getElementById("skAddBoneBtn");
      const skIkToggle = document.getElementById("skIkToggle");
      const skWeightToggle = document.getElementById("skWeightToggle");

      function getBoneWorldPos(index) {
        let x = boneCanvas.width / 2;
        let y = boneCanvas.height * 0.75;
        const chain = [];
        let cur = index;
        while (cur >= 0) {
          chain.unshift(cur);
          cur = BONES[cur].parent;
        }
        let angle = 0;
        const positions = [{x, y}];
        for (let i = 0; i < chain.length; i++) {
          const b = BONES[chain[i]];
          angle += b.rotation * Math.PI / 180;
          if (i < chain.length - 1) {
            x += Math.cos(angle) * b.length;
            y += Math.sin(angle) * b.length;
            positions.push({x, y});
          }
        }
        const lastBone = BONES[chain[chain.length - 1]];
        const endX = x + Math.cos(angle) * lastBone.length;
        const endY = y + Math.sin(angle) * lastBone.length;
        return { startX: x, startY: y, endX, endY, jointX: x, jointY: y };
      }

      function getAllJointPositions() {
        const positions = [];
        const rootX = boneCanvas.width / 2;
        const rootY = boneCanvas.height * 0.75;
        positions.push({ x: rootX, y: rootY, bone: 0 });

        for (let i = 0; i < BONES.length; i++) {
          const chain = [];
          let cur = i;
          while (cur >= 0) { chain.unshift(cur); cur = BONES[cur].parent; }
          let x = rootX, y = rootY, angle = 0;
          for (const ci of chain) {
            const b = BONES[ci];
            angle += b.rotation * Math.PI / 180;
            x += Math.cos(angle) * b.length;
            y += Math.sin(angle) * b.length;
          }
          positions.push({ x, y, bone: i });
        }
        return positions;
      }

      function drawBones() {
        const w = boneCanvas.width;
        const h = boneCanvas.height;
        boneCtx.clearRect(0, 0, w, h);

        // Weight paint mode
        if (weightMode) {
          const stripeH = h / BONES.length;
          for (let i = 0; i < BONES.length; i++) {
            const hue = i * 51;
            const grad = boneCtx.createLinearGradient(0, i * stripeH, w, i * stripeH);
            grad.addColorStop(0, "hsla(" + hue + ",60%,50%,0.6)");
            grad.addColorStop(0.5, "hsla(" + hue + ",60%,50%,0.2)");
            grad.addColorStop(1, "hsla(" + hue + ",60%,50%,0.0)");
            boneCtx.fillStyle = grad;
            boneCtx.fillRect(0, i * stripeH, w, stripeH);
          }
          boneCtx.font = "10px monospace";
          boneCtx.fillStyle = "rgba(255,255,255,0.7)";
          for (let i = 0; i < BONES.length; i++) {
            boneCtx.fillText(BONES[i].name, 4, i * stripeH + 14);
          }
          return;
        }

        // Draw bone lines
        const rootX = w / 2;
        const rootY = h * 0.75;

        function drawBoneChain(boneIdx, startX, startY, parentAngle) {
          const b = BONES[boneIdx];
          const angle = parentAngle + b.rotation * Math.PI / 180;
          const endX = startX + Math.cos(angle) * b.length;
          const endY = startY + Math.sin(angle) * b.length;

          // Bone line
          boneCtx.strokeStyle = boneIdx === selectedBone
            ? "var(--vscode-focusBorder, #007acc)"
            : "hsl(" + (boneIdx * 51) + ",60%,60%)";
          boneCtx.lineWidth = boneIdx === selectedBone ? 3 : 2;
          boneCtx.beginPath();
          boneCtx.moveTo(startX, startY);
          boneCtx.lineTo(endX, endY);
          boneCtx.stroke();

          // Joint circle
          boneCtx.fillStyle = boneIdx === selectedBone
            ? "var(--vscode-focusBorder, #007acc)"
            : "hsl(" + (boneIdx * 51) + ",60%,60%)";
          boneCtx.beginPath();
          boneCtx.arc(endX, endY, 5, 0, Math.PI * 2);
          boneCtx.fill();
          boneCtx.strokeStyle = "rgba(255,255,255,0.5)";
          boneCtx.lineWidth = 1;
          boneCtx.stroke();

          // Draw children
          for (let i = 0; i < BONES.length; i++) {
            if (BONES[i].parent === boneIdx) {
              drawBoneChain(i, endX, endY, angle);
            }
          }
        }

        // Root joint
        boneCtx.fillStyle = selectedBone === 0
          ? "var(--vscode-focusBorder, #007acc)"
          : "hsl(0,60%,60%)";
        boneCtx.beginPath();
        boneCtx.arc(rootX, rootY, 6, 0, Math.PI * 2);
        boneCtx.fill();

        // Draw from root
        const rootAngle = 0;
        for (let i = 0; i < BONES.length; i++) {
          if (BONES[i].parent === -1) {
            drawBoneChain(i, rootX, rootY, rootAngle);
          }
        }

        // IK indicator
        if (ikMode) {
          boneCtx.font = "10px monospace";
          boneCtx.fillStyle = "rgba(255,200,60,0.8)";
          boneCtx.fillText("IK MODE", 8, 14);
        }
      }

      function renderHierarchy() {
        hierarchyDiv.innerHTML = "<div style='font-weight:bold;margin-bottom:4px;'>Bone Hierarchy</div>";
        function renderBone(idx, indent) {
          const div = document.createElement("div");
          div.className = "bone-tree-item" + (idx === selectedBone ? " selected" : "");
          div.style.paddingLeft = (indent * 12 + 4) + "px";
          div.textContent = BONES[idx].name;
          div.addEventListener("click", () => { selectedBone = idx; renderHierarchy(); drawBones(); updateBoneProps(); });
          hierarchyDiv.appendChild(div);
          for (let i = 0; i < BONES.length; i++) {
            if (BONES[i].parent === idx) renderBone(i, indent + 1);
          }
        }
        for (let i = 0; i < BONES.length; i++) {
          if (BONES[i].parent === -1) renderBone(i, 0);
        }
      }

      function updateBoneProps() {
        const propsPanel = document.getElementById("propsPanel");
        const b = BONES[selectedBone];
        const parentOptions = '<option value="-1">None</option>' + BONES.map((bn, i) =>
          i === selectedBone ? "" : '<option value="' + i + '"' + (b.parent === i ? " selected" : "") + '>' + bn.name + '</option>'
        ).join("");
        propsPanel.innerHTML =
          '<div class="bone-props">' +
          '<label>Bone: <strong>' + b.name + '</strong></label>' +
          '<label>Length: <input id="bpLen" type="number" value="' + b.length + '"></label>' +
          '<label>Rotation: <input id="bpRot" type="number" value="' + b.rotation + '"></label>' +
          '<label>Parent: <select id="bpParent">' + parentOptions + '</select></label>' +
          '</div>';
        document.getElementById("bpLen").addEventListener("change", (e) => { b.length = Number(e.target.value); drawBones(); });
        document.getElementById("bpRot").addEventListener("change", (e) => { b.rotation = Number(e.target.value); drawBones(); });
        document.getElementById("bpParent").addEventListener("change", (e) => { b.parent = Number(e.target.value); renderHierarchy(); drawBones(); });
      }

      // 2-bone IK solver
      function solveIK(boneIdx, targetX, targetY) {
        const b = BONES[boneIdx];
        if (b.parent < 0) return;
        const parent = BONES[b.parent];

        const rootX = boneCanvas.width / 2;
        const rootY = boneCanvas.height * 0.75;

        // Get parent joint world pos
        let px = rootX, py = rootY, pAngle = 0;
        const chain = [];
        let cur = b.parent;
        while (cur >= 0) { chain.unshift(cur); cur = BONES[cur].parent; }
        for (const ci of chain) {
          if (ci === b.parent) break;
          const cb = BONES[ci];
          pAngle += cb.rotation * Math.PI / 180;
          px += Math.cos(pAngle) * cb.length;
          py += Math.sin(pAngle) * cb.length;
        }
        pAngle += parent.rotation * Math.PI / 180;
        const jointX = px + Math.cos(pAngle) * parent.length;
        const jointY = py + Math.sin(pAngle) * parent.length;

        // Distance from parent start to target
        const dx = targetX - px;
        const dy = targetY - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const l1 = parent.length;
        const l2 = b.length;

        if (dist > l1 + l2) {
          // Stretch toward target
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          parent.rotation = angle - (pAngle - parent.rotation * Math.PI / 180) * 180 / Math.PI;
          b.rotation = 0;
        } else if (dist > 0) {
          // Law of cosines
          const cosA = (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist);
          const cosB = (l1 * l1 + l2 * l2 - dist * dist) / (2 * l1 * l2);
          const angleToTarget = Math.atan2(dy, dx);
          const angleA = Math.acos(Math.max(-1, Math.min(1, cosA)));
          const angleB = Math.acos(Math.max(-1, Math.min(1, cosB)));

          const basePAngle = (pAngle - parent.rotation * Math.PI / 180);
          parent.rotation = (angleToTarget - angleA - basePAngle) * 180 / Math.PI;
          b.rotation = (Math.PI - angleB) * 180 / Math.PI;
        }
      }

      boneCanvas.addEventListener("mousedown", (e) => {
        const rect = boneCanvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        if (ikMode && selectedBone > 0) {
          solveIK(selectedBone, mx, my);
          drawBones();
          updateBoneProps();
          return;
        }

        // Click to select bone (find nearest joint)
        const joints = getAllJointPositions();
        let nearest = -1;
        let nearDist = 20;
        for (const j of joints) {
          const d = Math.sqrt((mx - j.x) ** 2 + (my - j.y) ** 2);
          if (d < nearDist) { nearDist = d; nearest = j.bone; }
        }
        if (nearest >= 0) {
          selectedBone = nearest;
          renderHierarchy();
          drawBones();
          updateBoneProps();
        }
      });

      boneCanvas.addEventListener("mousemove", (e) => {
        if (!ikMode || !(e.buttons & 1)) return;
        const rect = boneCanvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        if (selectedBone > 0) {
          solveIK(selectedBone, mx, my);
          drawBones();
          updateBoneProps();
        }
      });

      skAddBoneBtn.addEventListener("click", () => {
        const name = "Bone_" + BONES.length;
        BONES.push({ name, parent: selectedBone, length: 40, rotation: 0 });
        selectedBone = BONES.length - 1;
        renderHierarchy();
        drawBones();
        updateBoneProps();
      });

      skIkToggle.addEventListener("click", () => {
        ikMode = !ikMode;
        skIkToggle.classList.toggle("active", ikMode);
        drawBones();
      });

      skWeightToggle.addEventListener("click", () => {
        weightMode = !weightMode;
        skWeightToggle.classList.toggle("active", weightMode);
        drawBones();
      });

      renderHierarchy();
      drawBones();
      updateBoneProps();`,
  });

  return base;
}
