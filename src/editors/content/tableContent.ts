import type { EditorContent } from "./types.js";

interface ColumnDef {
  name: string;
  type: "string" | "int" | "float" | "bool" | "enum";
  enumValues?: string[];
  editable?: boolean;
}

interface TableConfig {
  columns: ColumnDef[];
  rows: Record<string, unknown>[];
  features: string[];
  extraHtml?: string;
  extraStyles?: string;
  extraScript?: string;
}

function tableBase(config: TableConfig): EditorContent {
  const { columns, rows, features, extraHtml, extraStyles, extraScript } = config;

  const headerCells = columns
    .map(
      (col) =>
        `<th data-col="${col.name}" data-type="${col.type}">${col.name}<span class="sort-indicator"></span></th>`
    )
    .join("\n            ");

  const bodyRows = rows
    .map((row, ri) => {
      const cells = columns
        .map((col) => {
          const val = row[col.name] ?? "";
          const editable = col.editable !== false ? 'contenteditable="true"' : "";
          return `<td data-col="${col.name}" data-type="${col.type}" data-row="${ri}" ${editable}>${val}</td>`;
        })
        .join("");
      return `<tr data-row-index="${ri}">${cells}</tr>`;
    })
    .join("\n            ");

  const workspaceHtml = `
    <div class="table-editor">
      <div class="table-toolbar">
        <input type="text" class="filter-input" placeholder="Filter rows..." />
        <button class="btn btn-add-row">+ Add Row</button>
        <button class="btn btn-delete-row">- Delete Row</button>
        <span class="col-count">${columns.length} columns</span>
        ${features.includes("export") ? '<button class="btn btn-export-json">Export JSON</button><button class="btn btn-export-csv">Export CSV</button>' : ""}
      </div>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
            ${headerCells}
            </tr>
          </thead>
          <tbody>
            ${bodyRows}
          </tbody>
        </table>
      </div>
      <div class="table-status">
        <span class="row-count">${rows.length} rows</span>
        <span class="selected-cell">No cell selected</span>
        <span class="validation-status">Valid</span>
        <span class="dirty-indicator"></span>
      </div>
      ${extraHtml ?? ""}
    </div>`;

  const styles = `
    .table-editor {
      display: flex;
      flex-direction: column;
      height: 100%;
      font-size: 13px;
      color: var(--vscode-editor-foreground);
      background: var(--vscode-editor-background);
    }
    .table-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--vscode-sideBar-background);
      border-bottom: 1px solid var(--vscode-panel-border);
      flex-shrink: 0;
    }
    .filter-input {
      padding: 4px 8px;
      font-size: 12px;
      border: 1px solid var(--vscode-input-border);
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border-radius: 3px;
      min-width: 180px;
    }
    .filter-input:focus {
      outline: 1px solid var(--vscode-focusBorder);
    }
    .btn {
      padding: 4px 10px;
      font-size: 11px;
      border: 1px solid var(--vscode-button-border, var(--vscode-panel-border));
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border-radius: 3px;
      cursor: pointer;
    }
    .btn:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    .btn-primary {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    .btn-primary:hover {
      background: var(--vscode-button-hoverBackground);
    }
    .col-count {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      margin-left: auto;
    }
    .table-scroll {
      flex: 1;
      overflow: auto;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: auto;
    }
    .data-table th {
      position: sticky;
      top: 0;
      background: var(--vscode-editorGroupHeader-tabsBackground);
      padding: 6px 8px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      border-bottom: 2px solid var(--vscode-panel-border);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      z-index: 1;
    }
    .data-table th:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .sort-indicator {
      margin-left: 4px;
      font-size: 10px;
    }
    .data-table td {
      padding: 4px 8px;
      border-bottom: 1px solid var(--vscode-panel-border);
      font-size: 12px;
      min-width: 60px;
      outline: none;
    }
    .data-table td[contenteditable="true"]:focus {
      outline: 2px solid var(--vscode-focusBorder);
      outline-offset: -2px;
    }
    .data-table td.invalid {
      border: 1px solid var(--vscode-errorForeground);
      background: var(--vscode-inputValidation-errorBackground);
    }
    .data-table tbody tr:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .data-table tbody tr.selected {
      background: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
    }
    .table-status {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 4px 12px;
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      background: var(--vscode-statusBar-background);
      border-top: 1px solid var(--vscode-panel-border);
      flex-shrink: 0;
    }
    .dirty-indicator::after {
      content: "";
    }
    .dirty-indicator.dirty::after {
      content: "● Modified";
      color: var(--vscode-gitDecoration-modifiedResourceForeground);
    }
    ${extraStyles ?? ""}
  `;

  const script = `
    (function() {
      const table = document.querySelector('.data-table');
      const tbody = table.querySelector('tbody');
      const thead = table.querySelector('thead');
      const filterInput = document.querySelector('.filter-input');
      const rowCountEl = document.querySelector('.row-count');
      const selectedCellEl = document.querySelector('.selected-cell');
      const validationEl = document.querySelector('.validation-status');
      const dirtyEl = document.querySelector('.dirty-indicator');
      let isDirty = false;
      let sortCol = null;
      let sortDir = 'asc';
      let selectedCell = null;

      function markDirty() {
        isDirty = true;
        dirtyEl.classList.add('dirty');
      }

      function updateRowCount() {
        const visible = tbody.querySelectorAll('tr:not([style*="display: none"])').length;
        const total = tbody.querySelectorAll('tr').length;
        rowCountEl.textContent = visible === total ? total + ' rows' : visible + '/' + total + ' rows';
      }

      function validateCell(td) {
        const type = td.dataset.type;
        const val = td.textContent.trim();
        let valid = true;
        if (type === 'int') valid = val === '' || /^-?\\d+$/.test(val);
        else if (type === 'float') valid = val === '' || /^-?\\d+(\\.\\d+)?$/.test(val);
        else if (type === 'bool') valid = ['true','false',''].includes(val.toLowerCase());
        else if (type === 'enum') {
          const th = thead.querySelector('th[data-col="' + td.dataset.col + '"]');
          if (th) {
            const enumVals = (th.dataset.enumValues || '').split(',');
            valid = val === '' || enumVals.includes(val);
          }
        }
        td.classList.toggle('invalid', !valid);
        return valid;
      }

      function validateAll() {
        let allValid = true;
        tbody.querySelectorAll('td[contenteditable]').forEach(td => {
          if (!validateCell(td)) allValid = false;
        });
        validationEl.textContent = allValid ? 'Valid' : 'Has errors';
        validationEl.style.color = allValid ? '' : 'var(--vscode-errorForeground)';
      }

      // Sort
      thead.querySelectorAll('th').forEach(th => {
        th.addEventListener('click', () => {
          const col = th.dataset.col;
          if (sortCol === col) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
          else { sortCol = col; sortDir = 'asc'; }
          thead.querySelectorAll('.sort-indicator').forEach(s => s.textContent = '');
          th.querySelector('.sort-indicator').textContent = sortDir === 'asc' ? ' ▲' : ' ▼';
          const rows = Array.from(tbody.querySelectorAll('tr'));
          const type = th.dataset.type;
          rows.sort((a, b) => {
            const av = a.querySelector('td[data-col="' + col + '"]').textContent.trim();
            const bv = b.querySelector('td[data-col="' + col + '"]').textContent.trim();
            let cmp = 0;
            if (type === 'int' || type === 'float') cmp = (parseFloat(av) || 0) - (parseFloat(bv) || 0);
            else cmp = av.localeCompare(bv);
            return sortDir === 'asc' ? cmp : -cmp;
          });
          rows.forEach(r => tbody.appendChild(r));
        });
      });

      // Filter
      filterInput.addEventListener('input', () => {
        const q = filterInput.value.toLowerCase();
        tbody.querySelectorAll('tr').forEach(tr => {
          const text = tr.textContent.toLowerCase();
          tr.style.display = text.includes(q) ? '' : 'none';
        });
        updateRowCount();
      });

      // Cell selection and editing
      tbody.addEventListener('click', (e) => {
        const td = e.target.closest('td');
        if (!td) return;
        if (selectedCell) selectedCell.classList.remove('selected');
        td.classList.add('selected');
        selectedCell = td;
        selectedCellEl.textContent = td.dataset.col + '[' + td.dataset.row + ']';
      });

      tbody.addEventListener('blur', (e) => {
        const td = e.target.closest('td');
        if (td && td.contentEditable === 'true') {
          validateCell(td);
          markDirty();
          validateAll();
        }
      }, true);

      // Add row
      document.querySelector('.btn-add-row').addEventListener('click', () => {
        const cols = thead.querySelectorAll('th');
        const rowIdx = tbody.querySelectorAll('tr').length;
        const tr = document.createElement('tr');
        tr.dataset.rowIndex = rowIdx;
        cols.forEach(th => {
          const td = document.createElement('td');
          td.dataset.col = th.dataset.col;
          td.dataset.type = th.dataset.type;
          td.dataset.row = rowIdx;
          td.contentEditable = 'true';
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
        markDirty();
        updateRowCount();
      });

      // Delete row
      document.querySelector('.btn-delete-row').addEventListener('click', () => {
        if (selectedCell) {
          const tr = selectedCell.closest('tr');
          if (tr) { tr.remove(); markDirty(); updateRowCount(); selectedCell = null; selectedCellEl.textContent = 'No cell selected'; }
        }
      });

      // Export support
      const exportJsonBtn = document.querySelector('.btn-export-json');
      const exportCsvBtn = document.querySelector('.btn-export-csv');
      function getTableData() {
        const cols = Array.from(thead.querySelectorAll('th')).map(th => th.dataset.col);
        const data = [];
        tbody.querySelectorAll('tr').forEach(tr => {
          const obj = {};
          cols.forEach(col => {
            const td = tr.querySelector('td[data-col="' + col + '"]');
            obj[col] = td ? td.textContent.trim() : '';
          });
          data.push(obj);
        });
        return { cols, data };
      }
      if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', () => {
          const { data } = getTableData();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'table_export.json';
          a.click();
          URL.revokeObjectURL(a.href);
        });
      }
      if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => {
          const { cols, data } = getTableData();
          let csv = cols.join(',') + '\\n';
          data.forEach(row => { csv += cols.map(c => '"' + (row[c] || '').replace(/"/g, '""') + '"').join(',') + '\\n'; });
          const blob = new Blob([csv], { type: 'text/csv' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'table_export.csv';
          a.click();
          URL.revokeObjectURL(a.href);
        });
      }

      // Store enum values on th for validation
      const colDefs = ${JSON.stringify(columns)};
      colDefs.forEach(col => {
        if (col.type === 'enum' && col.enumValues) {
          const th = thead.querySelector('th[data-col="' + col.name + '"]');
          if (th) th.dataset.enumValues = col.enumValues.join(',');
        }
      });

      updateRowCount();
      validateAll();
      ${extraScript ?? ""}
    })();
  `;

  return { workspaceHtml, styles, script };
}

// ─── 1. Database Content ────────────────────────────────────────────────────

export function databaseContent(): EditorContent {
  const columns: ColumnDef[] = [
    { name: "id", type: "string" },
    { name: "name", type: "string" },
    { name: "type", type: "enum", enumValues: ["weapon", "armor", "potion", "material"] },
    { name: "damage", type: "int" },
    { name: "price", type: "int" },
    { name: "weight", type: "float" },
    { name: "stackable", type: "bool" },
    { name: "description", type: "string" },
  ];

  const rows = [
    { id: "sword_01", name: "Iron Sword", type: "weapon", damage: 15, price: 120, weight: 3.2, stackable: false, description: "A basic iron sword" },
    { id: "potion_01", name: "Health Potion", type: "potion", damage: 0, price: 25, weight: 0.5, stackable: true, description: "Restores 50 HP" },
    { id: "armor_01", name: "Leather Armor", type: "armor", damage: 0, price: 80, weight: 5.0, stackable: false, description: "Light body armor" },
  ];

  const extraHtml = `
    <div class="schema-panel">
      <h3>Schema</h3>
      <ul>
        ${columns.map((c) => `<li><span class="schema-col">${c.name}</span>: <span class="schema-type">${c.type}${c.enumValues ? "(" + c.enumValues.join("|") + ")" : ""}</span></li>`).join("")}
      </ul>
    </div>`;

  const extraStyles = `
    .table-editor { flex-direction: row; flex-wrap: wrap; }
    .table-toolbar { width: 100%; }
    .table-scroll { flex: 1; min-width: 0; }
    .table-status { width: 100%; }
    .schema-panel {
      width: 200px;
      padding: 12px;
      background: var(--vscode-sideBar-background);
      border-left: 1px solid var(--vscode-panel-border);
      overflow-y: auto;
      order: 2;
    }
    .schema-panel h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 8px 0;
      color: var(--vscode-sideBarSectionHeader-foreground);
    }
    .schema-panel ul { list-style: none; padding: 0; margin: 0; }
    .schema-panel li { font-size: 11px; padding: 3px 0; border-bottom: 1px solid var(--vscode-panel-border); }
    .schema-col { color: var(--vscode-symbolIcon-fieldForeground, var(--vscode-editor-foreground)); font-weight: 500; }
    .schema-type { color: var(--vscode-symbolIcon-typeParameterForeground, var(--vscode-descriptionForeground)); }
    .btn-export-lua { margin-left: 4px; }
  `;

  const extraScript = `
      // Export as Lua table
      const toolbar = document.querySelector('.table-toolbar');
      const luaBtn = document.createElement('button');
      luaBtn.className = 'btn btn-export-lua';
      luaBtn.textContent = 'Export Lua';
      toolbar.querySelector('.col-count').before(luaBtn);
      luaBtn.addEventListener('click', () => {
        const { cols, data } = getTableData();
        let lua = 'return {\\n';
        data.forEach(row => {
          lua += '  {';
          cols.forEach((c, i) => {
            const v = row[c] || '';
            const isNum = /^-?\\d+(\\.\\d+)?$/.test(v);
            const isBool = v === 'true' || v === 'false';
            lua += c + ' = ' + (isBool ? v : isNum ? v : '"' + v.replace(/"/g, '\\\\"') + '"');
            if (i < cols.length - 1) lua += ', ';
          });
          lua += '},\\n';
        });
        lua += '}\\n';
        const blob = new Blob([lua], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'table_export.lua';
        a.click();
        URL.revokeObjectURL(a.href);
      });
  `;

  return tableBase({ columns, rows, features: ["export"], extraHtml, extraStyles, extraScript });
}

// ─── 2. Localization Content ────────────────────────────────────────────────

export function localizationContent(): EditorContent {
  const columns: ColumnDef[] = [
    { name: "key", type: "string" },
    { name: "en", type: "string" },
    { name: "pl", type: "string" },
    { name: "de", type: "string" },
    { name: "context", type: "string" },
  ];

  const rows = [
    { key: "menu.start", en: "Start Game", pl: "Rozpocznij grę", de: "Spiel starten", context: "Main menu button" },
    { key: "menu.quit", en: "Quit", pl: "Wyjdź", de: "Beenden", context: "Main menu button" },
    { key: "dialog.greeting", en: "Hello, {name}!", pl: "Cześć, {name}!", de: "", context: "NPC greeting, {name} = player name" },
  ];

  const langCols = ["en", "pl", "de"];

  const extraHtml = `
    <div class="loc-progress-panel">
      <h3>Translation Progress</h3>
      ${langCols
        .map(
          (lang) => `
        <div class="progress-row">
          <span class="progress-lang">${lang}</span>
          <div class="progress-bar"><div class="progress-fill" data-lang="${lang}"></div></div>
          <span class="progress-pct" data-lang="${lang}">0%</span>
        </div>`
        )
        .join("")}
      <button class="btn btn-add-lang">+ Add Language</button>
    </div>`;

  const extraStyles = `
    .loc-progress-panel {
      padding: 12px;
      background: var(--vscode-sideBar-background);
      border-top: 1px solid var(--vscode-panel-border);
    }
    .loc-progress-panel h3 {
      font-size: 11px;
      text-transform: uppercase;
      margin: 0 0 8px 0;
      color: var(--vscode-sideBarSectionHeader-foreground);
    }
    .progress-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .progress-lang {
      font-size: 11px;
      font-weight: 600;
      width: 24px;
    }
    .progress-bar {
      flex: 1;
      height: 6px;
      background: var(--vscode-progressBar-background, #333);
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--vscode-progressBar-background, #0078d4);
      border-radius: 3px;
      transition: width 0.3s;
    }
    .progress-pct {
      font-size: 11px;
      width: 36px;
      text-align: right;
      color: var(--vscode-descriptionForeground);
    }
    .data-table td.missing-translation {
      background: var(--vscode-editorWarning-background, rgba(255, 200, 0, 0.15));
    }
    .data-table td .var-highlight {
      background: var(--vscode-editor-findMatchHighlightBackground, rgba(234, 170, 0, 0.3));
      border-radius: 2px;
      padding: 0 2px;
    }
    .data-table td .var-missing {
      background: var(--vscode-inputValidation-errorBackground);
      color: var(--vscode-errorForeground);
      border-radius: 2px;
      padding: 0 2px;
    }
    .btn-add-lang { margin-top: 8px; }
  `;

  const extraScript = `
      const langCols = ${JSON.stringify(langCols)};

      function updateProgress() {
        const rows = tbody.querySelectorAll('tr');
        const total = rows.length;
        langCols.forEach(lang => {
          let filled = 0;
          rows.forEach(tr => {
            const td = tr.querySelector('td[data-col="' + lang + '"]');
            if (td && td.textContent.trim() !== '') filled++;
          });
          const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
          const fill = document.querySelector('.progress-fill[data-lang="' + lang + '"]');
          const pctEl = document.querySelector('.progress-pct[data-lang="' + lang + '"]');
          if (fill) fill.style.width = pct + '%';
          if (pctEl) pctEl.textContent = pct + '%';
        });
      }

      function highlightVariables() {
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(tr => {
          const enTd = tr.querySelector('td[data-col="en"]');
          const enVars = enTd ? (enTd.textContent.match(/\\{\\w+\\}/g) || []) : [];
          langCols.forEach(lang => {
            if (lang === 'en') return;
            const td = tr.querySelector('td[data-col="' + lang + '"]');
            if (!td) return;
            const val = td.textContent.trim();
            if (val === '') {
              td.classList.add('missing-translation');
            } else {
              td.classList.remove('missing-translation');
            }
          });
        });
      }

      function checkVariableConsistency() {
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(tr => {
          const enTd = tr.querySelector('td[data-col="en"]');
          const enVars = enTd ? (enTd.textContent.match(/\\{\\w+\\}/g) || []) : [];
          langCols.forEach(lang => {
            if (lang === 'en') return;
            const td = tr.querySelector('td[data-col="' + lang + '"]');
            if (!td) return;
            const val = td.textContent.trim();
            if (val === '') return;
            const langVars = val.match(/\\{\\w+\\}/g) || [];
            const missing = enVars.filter(v => !langVars.includes(v));
            if (missing.length > 0) {
              td.title = 'Missing variables: ' + missing.join(', ');
              td.classList.add('invalid');
            } else {
              td.title = '';
              td.classList.remove('invalid');
            }
          });
        });
      }

      // Add language column
      document.querySelector('.btn-add-lang').addEventListener('click', () => {
        const name = prompt('Language code (e.g., fr, es):');
        if (!name || name.trim() === '') return;
        const lang = name.trim().toLowerCase();
        langCols.push(lang);
        const newTh = document.createElement('th');
        newTh.dataset.col = lang;
        newTh.dataset.type = 'string';
        newTh.innerHTML = lang + '<span class="sort-indicator"></span>';
        const contextTh = thead.querySelector('th[data-col="context"]');
        contextTh.before(newTh);
        tbody.querySelectorAll('tr').forEach((tr, i) => {
          const td = document.createElement('td');
          td.dataset.col = lang;
          td.dataset.type = 'string';
          td.dataset.row = i;
          td.contentEditable = 'true';
          td.classList.add('missing-translation');
          const contextTd = tr.querySelector('td[data-col="context"]');
          contextTd.before(td);
        });
        markDirty();
        updateProgress();
      });

      tbody.addEventListener('blur', () => {
        setTimeout(() => { updateProgress(); highlightVariables(); checkVariableConsistency(); }, 0);
      }, true);

      updateProgress();
      highlightVariables();
      checkVariableConsistency();
  `;

  return tableBase({ columns, rows, features: [], extraHtml, extraStyles, extraScript });
}

// ─── 3. Input Mapper Content ────────────────────────────────────────────────

export function inputMapperContent(): EditorContent {
  const columns: ColumnDef[] = [
    { name: "action", type: "string" },
    { name: "keyboard", type: "string" },
    { name: "gamepad", type: "string" },
    { name: "mouse", type: "string" },
    { name: "deadzone", type: "float" },
    { name: "combo", type: "string" },
  ];

  const rows = [
    { action: "jump", keyboard: "Space", gamepad: "A", mouse: "", deadzone: 0.0, combo: "" },
    { action: "shoot", keyboard: "", gamepad: "RT", mouse: "LMB", deadzone: 0.1, combo: "" },
    { action: "interact", keyboard: "E", gamepad: "X", mouse: "", deadzone: 0.0, combo: "" },
    { action: "move_left", keyboard: "A", gamepad: "LS_Left", mouse: "", deadzone: 0.15, combo: "" },
    { action: "move_right", keyboard: "D", gamepad: "LS_Right", mouse: "", deadzone: 0.15, combo: "" },
  ];

  const extraStyles = `
    .record-btn {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 3px;
      border: 1px solid var(--vscode-button-border, var(--vscode-panel-border));
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      cursor: pointer;
      margin-left: 4px;
    }
    .record-btn.listening {
      background: var(--vscode-inputValidation-warningBackground);
      color: var(--vscode-inputValidation-warningForeground, #fff);
      animation: pulse 1s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    .data-table td.conflict {
      border: 1px solid var(--vscode-errorForeground);
      background: var(--vscode-inputValidation-errorBackground);
    }
    .deadzone-slider {
      width: 60px;
      height: 4px;
      vertical-align: middle;
      accent-color: var(--vscode-progressBar-background, #0078d4);
    }
    .deadzone-val {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      margin-left: 4px;
    }
  `;

  const extraScript = `
      // Convert deadzone cells to sliders
      function renderDeadzoneSliders() {
        tbody.querySelectorAll('td[data-col="deadzone"]').forEach(td => {
          const val = parseFloat(td.textContent) || 0;
          td.contentEditable = 'false';
          td.innerHTML = '<input type="range" class="deadzone-slider" min="0" max="1" step="0.05" value="' + val + '" /><span class="deadzone-val">' + val.toFixed(2) + '</span>';
          td.querySelector('.deadzone-slider').addEventListener('input', (e) => {
            td.querySelector('.deadzone-val').textContent = parseFloat(e.target.value).toFixed(2);
            markDirty();
          });
        });
      }

      // Add record buttons to binding cells
      function addRecordButtons() {
        const bindCols = ['keyboard', 'gamepad', 'mouse'];
        tbody.querySelectorAll('tr').forEach(tr => {
          bindCols.forEach(col => {
            const td = tr.querySelector('td[data-col="' + col + '"]');
            if (!td || td.querySelector('.record-btn')) return;
            const btn = document.createElement('button');
            btn.className = 'record-btn';
            btn.textContent = '⏺';
            btn.title = 'Record Key';
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              if (btn.classList.contains('listening')) {
                btn.classList.remove('listening');
                btn.textContent = '⏺';
                return;
              }
              btn.classList.add('listening');
              btn.textContent = '...';
              const handler = (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                let key = '';
                if (ev.type === 'keydown') key = ev.code || ev.key;
                else if (ev.type === 'mousedown') key = ['LMB','MMB','RMB'][ev.button] || 'Mouse' + ev.button;
                if (key) {
                  td.childNodes[0].textContent = key;
                  markDirty();
                  checkConflicts();
                }
                btn.classList.remove('listening');
                btn.textContent = '⏺';
                document.removeEventListener('keydown', handler, true);
                document.removeEventListener('mousedown', handler, true);
              };
              document.addEventListener('keydown', handler, true);
              document.addEventListener('mousedown', handler, true);
            });
            // Wrap existing text
            const text = td.textContent;
            td.textContent = '';
            const span = document.createElement('span');
            span.textContent = text;
            span.contentEditable = 'true';
            td.appendChild(span);
            td.appendChild(btn);
            td.contentEditable = 'false';
          });
        });
      }

      // Conflict detection
      function checkConflicts() {
        const bindCols = ['keyboard', 'gamepad', 'mouse'];
        const bindings = {};
        tbody.querySelectorAll('tr').forEach(tr => {
          bindCols.forEach(col => {
            const td = tr.querySelector('td[data-col="' + col + '"]');
            if (!td) return;
            td.classList.remove('conflict');
            const span = td.querySelector('span');
            const val = span ? span.textContent.trim() : td.textContent.trim();
            if (!val) return;
            const key = col + ':' + val;
            if (bindings[key]) {
              td.classList.add('conflict');
              bindings[key].classList.add('conflict');
            } else {
              bindings[key] = td;
            }
          });
        });
      }

      renderDeadzoneSliders();
      addRecordButtons();
      checkConflicts();

      tbody.addEventListener('blur', () => { setTimeout(checkConflicts, 0); }, true);
  `;

  return tableBase({ columns, rows, features: [], extraStyles, extraScript });
}

// ─── 4. Test Runner Content ─────────────────────────────────────────────────

export function testRunnerContent(): EditorContent {
  const columns: ColumnDef[] = [
    { name: "test", type: "string", editable: false },
    { name: "suite", type: "string", editable: false },
    { name: "status", type: "enum", enumValues: ["pass", "fail", "skip", "running"], editable: false },
    { name: "duration_ms", type: "int", editable: false },
    { name: "error", type: "string", editable: false },
  ];

  const rows = [
    { test: "test_player_spawn", suite: "gameplay", status: "pass", duration_ms: 12, error: "" },
    { test: "test_collision_detection", suite: "physics", status: "fail", duration_ms: 45, error: "Expected position (10,5) but got (10,4.9)" },
    { test: "test_audio_volume", suite: "audio", status: "skip", duration_ms: 0, error: "Skipped: no audio device" },
    { test: "test_shader_compile", suite: "render", status: "running", duration_ms: 0, error: "" },
  ];

  const extraHtml = `
    <div class="test-actions">
      <button class="btn btn-primary btn-run-all">▶ Run All</button>
      <button class="btn btn-run-failed">▶ Run Failed</button>
      <div class="coverage-bar-container">
        <span class="coverage-label">Coverage</span>
        <div class="coverage-bar"><div class="coverage-fill"></div></div>
        <span class="coverage-pct">75%</span>
      </div>
    </div>`;

  const extraStyles = `
    .data-table td[data-col="status"] { font-weight: 600; }
    .status-pass { color: var(--vscode-testing-iconPassed, #73c991); }
    .status-fail { color: var(--vscode-testing-iconFailed, #f14c4c); }
    .status-skip { color: var(--vscode-descriptionForeground); }
    .status-running { color: var(--vscode-progressBar-background, #0078d4); }
    .test-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--vscode-sideBar-background);
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .coverage-bar-container {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: auto;
    }
    .coverage-label { font-size: 11px; color: var(--vscode-descriptionForeground); }
    .coverage-bar {
      width: 100px;
      height: 6px;
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 3px;
      overflow: hidden;
    }
    .coverage-fill {
      height: 100%;
      width: 75%;
      background: var(--vscode-testing-iconPassed, #73c991);
      border-radius: 3px;
      transition: width 0.3s;
    }
    .coverage-pct { font-size: 11px; color: var(--vscode-descriptionForeground); }
    .error-details {
      display: none;
      padding: 6px 12px;
      background: var(--vscode-inputValidation-errorBackground);
      border-left: 3px solid var(--vscode-errorForeground);
      font-size: 11px;
      font-family: var(--vscode-editor-font-family, monospace);
      white-space: pre-wrap;
      margin: 2px 0;
    }
    .error-details.visible { display: block; }
    .data-table tr.expandable { cursor: pointer; }
  `;

  const extraScript = `
      const statusIcons = { pass: '✓', fail: '✗', skip: '○', running: '⟳' };

      function renderStatuses() {
        tbody.querySelectorAll('td[data-col="status"]').forEach(td => {
          const val = td.textContent.trim();
          const icon = statusIcons[val] || val;
          td.innerHTML = '<span class="status-' + val + '">' + icon + ' ' + val + '</span>';
        });
      }

      function addErrorExpansion() {
        tbody.querySelectorAll('tr').forEach(tr => {
          const errorTd = tr.querySelector('td[data-col="error"]');
          const errorText = errorTd ? errorTd.textContent.trim() : '';
          if (errorText) {
            tr.classList.add('expandable');
            tr.addEventListener('click', () => {
              let detail = tr.nextElementSibling;
              if (detail && detail.classList.contains('error-details')) {
                detail.classList.toggle('visible');
              } else {
                detail = document.createElement('tr');
                const td = document.createElement('td');
                td.colSpan = ${columns.length};
                td.className = 'error-details visible';
                td.textContent = errorText;
                detail.appendChild(td);
                tr.after(detail);
              }
            });
          }
        });
      }

      // Run All simulation
      document.querySelector('.btn-run-all').addEventListener('click', () => {
        tbody.querySelectorAll('td[data-col="status"]').forEach(td => {
          td.textContent = 'running';
        });
        renderStatuses();
        setTimeout(() => {
          tbody.querySelectorAll('td[data-col="status"]').forEach(td => {
            const outcomes = ['pass','pass','pass','fail','skip'];
            td.textContent = outcomes[Math.floor(Math.random() * outcomes.length)];
          });
          renderStatuses();
          updateCoverage();
        }, 1500);
      });

      // Run Failed
      document.querySelector('.btn-run-failed').addEventListener('click', () => {
        tbody.querySelectorAll('tr').forEach(tr => {
          const statusTd = tr.querySelector('td[data-col="status"]');
          if (statusTd && statusTd.textContent.includes('fail')) {
            statusTd.textContent = 'running';
          }
        });
        renderStatuses();
        setTimeout(() => {
          tbody.querySelectorAll('tr').forEach(tr => {
            const statusTd = tr.querySelector('td[data-col="status"]');
            if (statusTd && statusTd.textContent.includes('running')) {
              statusTd.textContent = Math.random() > 0.3 ? 'pass' : 'fail';
            }
          });
          renderStatuses();
          updateCoverage();
        }, 1000);
      });

      function updateCoverage() {
        const all = tbody.querySelectorAll('td[data-col="status"]');
        let passed = 0;
        all.forEach(td => { if (td.textContent.includes('pass')) passed++; });
        const pct = all.length > 0 ? Math.round((passed / all.length) * 100) : 0;
        document.querySelector('.coverage-fill').style.width = pct + '%';
        document.querySelector('.coverage-pct').textContent = pct + '%';
      }

      renderStatuses();
      addErrorExpansion();
      updateCoverage();
  `;

  return tableBase({ columns, rows, features: [], extraHtml, extraStyles, extraScript });
}

// ─── 5. Global Autoload Content ─────────────────────────────────────────────

export function globalAutoloadContent(): EditorContent {
  const columns: ColumnDef[] = [
    { name: "name", type: "string" },
    { name: "script_path", type: "string" },
    { name: "load_order", type: "int" },
    { name: "persistent", type: "bool" },
    { name: "hot_reload", type: "bool" },
    { name: "sandbox", type: "enum", enumValues: ["none", "read_only", "isolated"] },
  ];

  const rows = [
    { name: "GameState", script_path: "scripts/autoload/game_state.lua", load_order: 1, persistent: true, hot_reload: false, sandbox: "none" },
    { name: "AudioManager", script_path: "scripts/autoload/audio_mgr.lua", load_order: 2, persistent: true, hot_reload: true, sandbox: "read_only" },
    { name: "InputHandler", script_path: "scripts/autoload/input_handler.lua", load_order: 3, persistent: false, hot_reload: true, sandbox: "isolated" },
  ];

  const extraStyles = `
    .data-table tbody tr {
      cursor: grab;
    }
    .data-table tbody tr.dragging {
      opacity: 0.4;
      background: var(--vscode-list-dropBackground);
    }
    .data-table tbody tr.drag-over {
      border-top: 2px solid var(--vscode-focusBorder);
    }
    .toggle-cell {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .toggle-switch {
      position: relative;
      width: 28px;
      height: 14px;
      background: var(--vscode-input-border);
      border-radius: 7px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .toggle-switch.active {
      background: var(--vscode-progressBar-background, #0078d4);
    }
    .toggle-switch::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 10px;
      height: 10px;
      background: var(--vscode-editor-foreground);
      border-radius: 50%;
      transition: transform 0.2s;
    }
    .toggle-switch.active::after {
      transform: translateX(14px);
    }
  `;

  const extraScript = `
      // Render boolean cells as toggles
      function renderToggles() {
        tbody.querySelectorAll('td[data-type="bool"]').forEach(td => {
          const val = td.textContent.trim().toLowerCase() === 'true';
          td.contentEditable = 'false';
          td.innerHTML = '<div class="toggle-cell"><div class="toggle-switch ' + (val ? 'active' : '') + '"></div></div>';
          td.querySelector('.toggle-switch').addEventListener('click', () => {
            const sw = td.querySelector('.toggle-switch');
            sw.classList.toggle('active');
            markDirty();
          });
        });
      }

      // Drag-reorder
      let dragRow = null;
      tbody.addEventListener('dragstart', (e) => {
        dragRow = e.target.closest('tr');
        if (dragRow) {
          dragRow.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
        }
      });
      tbody.addEventListener('dragover', (e) => {
        e.preventDefault();
        const target = e.target.closest('tr');
        if (target && target !== dragRow) {
          tbody.querySelectorAll('tr').forEach(tr => tr.classList.remove('drag-over'));
          target.classList.add('drag-over');
        }
      });
      tbody.addEventListener('drop', (e) => {
        e.preventDefault();
        const target = e.target.closest('tr');
        if (target && dragRow && target !== dragRow) {
          const rect = target.getBoundingClientRect();
          const mid = rect.top + rect.height / 2;
          if (e.clientY < mid) target.before(dragRow);
          else target.after(dragRow);
          updateLoadOrder();
          markDirty();
        }
        tbody.querySelectorAll('tr').forEach(tr => tr.classList.remove('drag-over'));
      });
      tbody.addEventListener('dragend', () => {
        if (dragRow) dragRow.classList.remove('dragging');
        dragRow = null;
        tbody.querySelectorAll('tr').forEach(tr => tr.classList.remove('drag-over'));
      });

      // Make rows draggable
      tbody.querySelectorAll('tr').forEach(tr => { tr.draggable = true; });

      function updateLoadOrder() {
        tbody.querySelectorAll('tr').forEach((tr, i) => {
          const td = tr.querySelector('td[data-col="load_order"]');
          if (td) td.textContent = (i + 1).toString();
        });
      }

      renderToggles();
  `;

  return tableBase({ columns, rows, features: [], extraStyles, extraScript });
}

// ─── 6. Asset Manifest Content ──────────────────────────────────────────────

export function assetManifestContent(): EditorContent {
  const columns: ColumnDef[] = [
    { name: "asset_path", type: "string" },
    { name: "group", type: "string" },
    { name: "priority", type: "enum", enumValues: ["critical", "high", "normal", "low"] },
    { name: "size_kb", type: "int" },
    { name: "preload", type: "bool" },
    { name: "encrypted", type: "bool" },
  ];

  const rows = [
    { asset_path: "sprites/player.png", group: "sprites", priority: "critical", size_kb: 256, preload: true, encrypted: false },
    { asset_path: "audio/bgm_main.ogg", group: "audio", priority: "high", size_kb: 4200, preload: false, encrypted: false },
    { asset_path: "maps/world.ltm", group: "maps", priority: "normal", size_kb: 1024, preload: false, encrypted: true },
  ];

  const extraHtml = `
    <div class="ram-estimation">
      <h3>RAM Estimation by Group</h3>
      <div class="ram-groups"></div>
      <div class="ram-total"></div>
    </div>`;

  const extraStyles = `
    .data-table td.priority-critical { color: var(--vscode-errorForeground); font-weight: 600; }
    .data-table td.priority-high { color: var(--vscode-editorWarning-foreground, #cca700); font-weight: 500; }
    .data-table td.priority-normal { }
    .data-table td.priority-low { color: var(--vscode-descriptionForeground); opacity: 0.7; }
    .ram-estimation {
      padding: 12px;
      background: var(--vscode-sideBar-background);
      border-top: 1px solid var(--vscode-panel-border);
    }
    .ram-estimation h3 {
      font-size: 11px;
      text-transform: uppercase;
      margin: 0 0 8px 0;
      color: var(--vscode-sideBarSectionHeader-foreground);
    }
    .ram-group-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      padding: 3px 0;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .ram-group-name { font-weight: 500; }
    .ram-group-size { color: var(--vscode-descriptionForeground); }
    .ram-total {
      margin-top: 8px;
      font-size: 12px;
      font-weight: 600;
      text-align: right;
    }
  `;

  const extraScript = `
      function applyPriorityColors() {
        tbody.querySelectorAll('td[data-col="priority"]').forEach(td => {
          const val = td.textContent.trim();
          td.className = '';
          td.classList.add('priority-' + val);
          td.dataset.col = 'priority';
          td.dataset.type = 'enum';
        });
      }

      function updateRamEstimation() {
        const groups = {};
        tbody.querySelectorAll('tr').forEach(tr => {
          const groupTd = tr.querySelector('td[data-col="group"]');
          const sizeTd = tr.querySelector('td[data-col="size_kb"]');
          if (!groupTd || !sizeTd) return;
          const group = groupTd.textContent.trim();
          const size = parseInt(sizeTd.textContent.trim()) || 0;
          groups[group] = (groups[group] || 0) + size;
        });
        const container = document.querySelector('.ram-groups');
        container.innerHTML = '';
        let total = 0;
        Object.entries(groups).sort((a, b) => b[1] - a[1]).forEach(([name, size]) => {
          total += size;
          const row = document.createElement('div');
          row.className = 'ram-group-row';
          row.innerHTML = '<span class="ram-group-name">' + name + '</span><span class="ram-group-size">' + formatSize(size) + '</span>';
          container.appendChild(row);
        });
        document.querySelector('.ram-total').textContent = 'Total: ' + formatSize(total);
      }

      function formatSize(kb) {
        if (kb >= 1024) return (kb / 1024).toFixed(1) + ' MB';
        return kb + ' KB';
      }

      // Render bool cells as toggles
      tbody.querySelectorAll('td[data-type="bool"]').forEach(td => {
        const val = td.textContent.trim().toLowerCase() === 'true';
        td.contentEditable = 'false';
        td.innerHTML = '<div class="toggle-cell"><div class="toggle-switch ' + (val ? 'active' : '') + '"></div></div>';
        td.querySelector('.toggle-switch').addEventListener('click', () => {
          const sw = td.querySelector('.toggle-switch');
          sw.classList.toggle('active');
          markDirty();
        });
      });

      applyPriorityColors();
      updateRamEstimation();

      tbody.addEventListener('blur', () => {
        setTimeout(() => { applyPriorityColors(); updateRamEstimation(); }, 0);
      }, true);
  `;

  return tableBase({ columns, rows, features: [], extraHtml, extraStyles, extraScript });
}
