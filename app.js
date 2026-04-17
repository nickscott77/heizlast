'use strict';

// ═══════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════

const CITY_TEMPS = {
    'Flensburg': -12, 'Hamburg': -12, 'Rostock': -14, 'Berlin': -14,
    'Hannover': -13, 'Dortmund': -11, 'Düsseldorf': -10, 'Köln': -10,
    'Kassel': -14, 'Frankfurt am Main': -12, 'Erfurt': -16,
    'Dresden': -15, 'Leipzig': -15, 'Stuttgart': -13,
    'Nürnberg': -16, 'Freiburg': -11, 'München': -16,
    'Garmisch-Partenkirchen': -20
};

const PRESETS = [
    { id: 'aw_massiv',   label: 'Außenwand (massiv, Altbau)',       u: 1.40, fx: 1.0 },
    { id: 'aw_gedaemmt', label: 'Außenwand (gedämmt, ≤ 2000)',      u: 0.40, fx: 1.0 },
    { id: 'aw_neu',      label: 'Außenwand (Neubau / EnEV)',        u: 0.25, fx: 1.0 },
    { id: 'aw_passiv',   label: 'Außenwand (Passivhaus)',            u: 0.10, fx: 1.0 },
    { id: 'fn_einfach',  label: 'Fenster (Einfachverglasung)',       u: 5.80, fx: 1.0 },
    { id: 'fn_2alt',     label: 'Fenster (2-fach, alt)',             u: 2.80, fx: 1.0 },
    { id: 'fn_2wsv',     label: 'Fenster (2-fach Wärmeschutz)',      u: 1.40, fx: 1.0 },
    { id: 'fn_3wsv',     label: 'Fenster (3-fach Wärmeschutz)',      u: 0.70, fx: 1.0 },
    { id: 'tuer',        label: 'Außentür',                          u: 1.80, fx: 1.0 },
    { id: 'dach_alt',    label: 'Dach (ungedämmt)',                  u: 0.80, fx: 1.0 },
    { id: 'dach_neu',    label: 'Dach (gedämmt)',                    u: 0.20, fx: 1.0 },
    { id: 'dach_passiv', label: 'Dach (Passivhaus)',                 u: 0.10, fx: 1.0 },
    { id: 'boden_erde',  label: 'Bodenplatte (gegen Erdreich)',      u: 0.40, fx: 0.45 },
    { id: 'boden_keller',label: 'Boden (gegen Keller, unbeheizt)',   u: 0.80, fx: 0.50 },
    { id: 'boden_aussen',label: 'Boden (gegen Außenluft)',           u: 0.30, fx: 1.0 },
    { id: 'wand_unbeh',  label: 'Wand (gegen unbeheizten Raum)',     u: 1.00, fx: 0.50 },
    { id: 'custom',      label: '— Benutzerdefiniert —',             u: 0,    fx: 1.0 },
];

// ═══════════════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════════════

let state = {
    ti: 20,
    te: -12,
    thermalBridge: true,
    rooms: [],
};

let _roomId = 0;
let _compId = 0;

// ═══════════════════════════════════════════════════════════
// Calculation
// ═══════════════════════════════════════════════════════════

function calcRoom(room) {
    const dT = state.ti - state.te;
    const vol = (parseFloat(room.area) || 0) * (parseFloat(room.height) || 0);

    let HT = room.components.reduce((sum, c) => {
        return sum + (parseFloat(c.area) || 0) * (parseFloat(c.u) || 0) * (parseFloat(c.fx) || 0);
    }, 0);

    if (state.thermalBridge) HT *= 1.1;

    const HV  = 0.34 * (parseFloat(room.airChange) || 0) * vol;
    const phi = (HT + HV) * dT;

    return { HT, HV, Htot: HT + HV, phi, vol, dT };
}

function calcTotal() {
    return state.rooms.reduce((acc, r) => {
        const res = calcRoom(r);
        acc.phi   += res.phi;
        acc.HT    += res.HT;
        acc.HV    += res.HV;
        acc.area  += parseFloat(r.area) || 0;
        return acc;
    }, { phi: 0, HT: 0, HV: 0, area: 0 });
}

// ═══════════════════════════════════════════════════════════
// Formatting helpers
// ═══════════════════════════════════════════════════════════

function fmtW(w) {
    return w >= 1000
        ? (w / 1000).toFixed(2) + ' kW'
        : Math.round(w) + ' W';
}

function esc(s) {
    return String(s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ═══════════════════════════════════════════════════════════
// DOM builders
// ═══════════════════════════════════════════════════════════

function presetOptions(selectedId) {
    return PRESETS.map(p =>
        `<option value="${p.id}"${p.id === selectedId ? ' selected' : ''}>${esc(p.label)}</option>`
    ).join('');
}

function compRowHtml(roomId, c) {
    const aufx = (parseFloat(c.area)||0) * (parseFloat(c.u)||0) * (parseFloat(c.fx)||0);
    return `
    <tr data-cid="${c.id}" data-rid="${roomId}">
        <td><select class="c-preset" data-rid="${roomId}" data-cid="${c.id}">${presetOptions(c.pid)}</select></td>
        <td><input type="text"   class="c-field" data-rid="${roomId}" data-cid="${c.id}" data-f="name"
                   value="${esc(c.name)}" placeholder="Bezeichnung"></td>
        <td><input type="number" class="c-field c-num" data-rid="${roomId}" data-cid="${c.id}" data-f="area"
                   value="${c.area}" min="0" step="0.1"></td>
        <td><input type="number" class="c-field c-num" data-rid="${roomId}" data-cid="${c.id}" data-f="u"
                   value="${c.u}" min="0" step="0.01"></td>
        <td><input type="number" class="c-field c-num" data-rid="${roomId}" data-cid="${c.id}" data-f="fx"
                   value="${c.fx}" min="0" max="1" step="0.05"></td>
        <td class="aufx-cell">${aufx.toFixed(3)}</td>
        <td><button class="btn btn-danger btn-xs c-del" data-rid="${roomId}" data-cid="${c.id}" title="Bauteil löschen">×</button></td>
    </tr>`;
}

function roomCardHtml(room) {
    const res = calcRoom(room);
    const compRows = room.components.map(c => compRowHtml(room.id, c)).join('');
    return `
    <div class="card room-card" data-rid="${room.id}">
        <div class="room-header">
            <div class="room-title">
                <input type="text" class="room-name-input" data-rid="${room.id}"
                       value="${esc(room.name)}" placeholder="Raumname">
            </div>
            <div class="room-phi">
                <span class="phi-label">Heizlast:</span>
                <span class="phi-value" data-phi="${room.id}">${fmtW(res.phi)}</span>
            </div>
            <button class="btn btn-danger btn-sm r-del" data-rid="${room.id}">× Raum löschen</button>
        </div>

        <div class="room-params">
            <div class="form-group">
                <label>Fläche (m²)</label>
                <input type="number" class="r-param" data-rid="${room.id}" data-f="area"
                       value="${room.area}" min="0" step="0.1">
            </div>
            <div class="form-group">
                <label>Raumhöhe (m)</label>
                <input type="number" class="r-param" data-rid="${room.id}" data-f="height"
                       value="${room.height}" min="0" step="0.05">
            </div>
            <div class="form-group">
                <label>Luftwechsel n (1/h)</label>
                <input type="number" class="r-param" data-rid="${room.id}" data-f="airChange"
                       value="${room.airChange}" min="0" step="0.1">
                <span class="hint-text">Wohnen: 0,5 · Küche/Bad: 1,0–1,5</span>
            </div>
            <div class="form-group">
                <div class="calc-grid" data-calc="${room.id}">
                    <span class="clabel">Volumen</span>
                    <span class="cval">${res.vol.toFixed(1)} m³</span>
                    <span class="clabel">H<sub>T</sub></span>
                    <span class="cval">${res.HT.toFixed(2)} W/K</span>
                    <span class="clabel">H<sub>V</sub></span>
                    <span class="cval">${res.HV.toFixed(2)} W/K</span>
                </div>
            </div>
        </div>

        <h3>Bauteile (Transmissionswärmeverluste)</h3>
        <div class="tbl-wrap">
            <table class="comp-table">
                <thead>
                    <tr>
                        <th>Typ</th>
                        <th>Bezeichnung</th>
                        <th>Fläche (m²)</th>
                        <th>U-Wert (W/m²K)</th>
                        <th>f<sub>x</sub></th>
                        <th>A·U·f<sub>x</sub> (W/K)</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="comp-tbody-${room.id}">${compRows}</tbody>
            </table>
        </div>
        <button class="btn btn-secondary btn-sm c-add" data-rid="${room.id}">+ Bauteil hinzufügen</button>
    </div>`;
}

// ═══════════════════════════════════════════════════════════
// Render functions
// ═══════════════════════════════════════════════════════════

function renderRooms() {
    document.getElementById('rooms-container').innerHTML =
        state.rooms.map(r => roomCardHtml(r)).join('');
}

function renderResults() {
    const el = document.getElementById('results-content');

    if (state.rooms.length === 0) {
        el.innerHTML = '<p class="hint">Fügen Sie Räume hinzu, um die Berechnung zu starten.</p>';
        return;
    }

    const tot = calcTotal();

    const rows = state.rooms.map(r => {
        const res = calcRoom(r);
        const area = parseFloat(r.area) || 0;
        const spec = area > 0 ? res.phi / area : 0;
        return `<tr>
            <td>${esc(r.name) || '(Kein Name)'}</td>
            <td>${area.toFixed(1)} m²</td>
            <td>${res.HT.toFixed(2)}</td>
            <td>${res.HV.toFixed(2)}</td>
            <td>${res.Htot.toFixed(2)}</td>
            <td><strong>${fmtW(res.phi)}</strong></td>
            <td>${spec.toFixed(1)} W/m²</td>
        </tr>`;
    }).join('');

    const totSpec = tot.area > 0 ? tot.phi / tot.area : 0;

    el.innerHTML = `
        <table class="results-table">
            <thead><tr>
                <th>Raum</th><th>Fläche</th>
                <th>H<sub>T</sub> (W/K)</th><th>H<sub>V</sub> (W/K)</th>
                <th>H<sub>ges</sub> (W/K)</th>
                <th>Φ<sub>HL</sub></th><th>spez. Heizlast</th>
            </tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr>
                <td><strong>Gesamt</strong></td>
                <td>${tot.area.toFixed(1)} m²</td>
                <td>${tot.HT.toFixed(2)}</td>
                <td>${tot.HV.toFixed(2)}</td>
                <td>${(tot.HT + tot.HV).toFixed(2)}</td>
                <td><strong class="total-phi">${fmtW(tot.phi)}</strong></td>
                <td>${totSpec.toFixed(1)} W/m²</td>
            </tr></tfoot>
        </table>

        <div class="summary-box">
            <div class="summary-item">
                <div class="slabel">Gesamt-Heizlast</div>
                <div class="sval">${fmtW(tot.phi)}</div>
            </div>
            <div class="summary-item">
                <div class="slabel">Beheizte Fläche</div>
                <div class="sval">${tot.area.toFixed(1)} m²</div>
            </div>
            <div class="summary-item">
                <div class="slabel">Spez. Heizlast</div>
                <div class="sval">${totSpec.toFixed(1)} W/m²</div>
            </div>
            <div class="summary-item">
                <div class="slabel">Temp.-Differenz</div>
                <div class="sval">Δ${state.ti - state.te} K</div>
            </div>
        </div>

        ${state.thermalBridge ? '<p class="note">* Wärmebrückenzuschlag +10 % ist in H<sub>T</sub> enthalten.</p>' : ''}
        <p class="disclaimer">
            Diese Berechnung ist vereinfacht und dient nur als erste Orientierung.
            Für die Auslegung von Heizungsanlagen ist eine vollständige Berechnung
            nach DIN EN 12831 durch einen Fachplaner erforderlich.
        </p>`;
}

// ── Partial update helpers (avoid full DOM rebuild during typing) ──

function refreshRoomDisplay(roomId) {
    const room = state.rooms.find(r => r.id === roomId);
    if (!room) return;
    const res = calcRoom(room);

    const phiEl = document.querySelector(`[data-phi="${roomId}"]`);
    if (phiEl) phiEl.textContent = fmtW(res.phi);

    const calcEl = document.querySelector(`[data-calc="${roomId}"]`);
    if (calcEl) {
        const vals = calcEl.querySelectorAll('.cval');
        if (vals[0]) vals[0].textContent = res.vol.toFixed(1) + ' m³';
        if (vals[1]) vals[1].textContent = res.HT.toFixed(2) + ' W/K';
        if (vals[2]) vals[2].textContent = res.HV.toFixed(2) + ' W/K';
    }
}

function refreshAufxCell(roomId, compId) {
    const room = state.rooms.find(r => r.id === roomId);
    const comp = room && room.components.find(c => c.id === compId);
    if (!comp) return;
    const row = document.querySelector(`tr[data-cid="${compId}"]`);
    if (!row) return;
    const aufx = (parseFloat(comp.area)||0) * (parseFloat(comp.u)||0) * (parseFloat(comp.fx)||0);
    const cell = row.querySelector('.aufx-cell');
    if (cell) cell.textContent = aufx.toFixed(3);
}

// ═══════════════════════════════════════════════════════════
// State mutations
// ═══════════════════════════════════════════════════════════

function addRoom() {
    const id = ++_roomId;
    state.rooms.push({ id, name: `Raum ${id}`, area: 20, height: 2.5, airChange: 0.5, components: [] });
    renderRooms();
    renderResults();
    const cards = document.querySelectorAll('.room-card');
    if (cards.length) cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteRoom(rid) {
    state.rooms = state.rooms.filter(r => r.id !== rid);
    renderRooms();
    renderResults();
}

function addComponent(rid) {
    const room = state.rooms.find(r => r.id === rid);
    if (!room) return;
    const preset = PRESETS[0];
    const id = ++_compId;
    room.components.push({ id, pid: preset.id, name: preset.label, area: 10, u: preset.u, fx: preset.fx });
    const tbody = document.getElementById(`comp-tbody-${rid}`);
    if (tbody) tbody.insertAdjacentHTML('beforeend', compRowHtml(rid, room.components[room.components.length - 1]));
    refreshRoomDisplay(rid);
    renderResults();
}

function deleteComponent(rid, cid) {
    const room = state.rooms.find(r => r.id === rid);
    if (!room) return;
    room.components = room.components.filter(c => c.id !== cid);
    const row = document.querySelector(`tr[data-cid="${cid}"]`);
    if (row) row.remove();
    refreshRoomDisplay(rid);
    renderResults();
}

function applyPreset(rid, cid, presetId) {
    const room = state.rooms.find(r => r.id === rid);
    const comp = room && room.components.find(c => c.id === cid);
    if (!comp) return;
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    comp.pid = presetId;
    if (presetId !== 'custom') {
        comp.name = preset.label;
        comp.u    = preset.u;
        comp.fx   = preset.fx;
    }
    // Re-render only this row (preserves other rows)
    const row = document.querySelector(`tr[data-cid="${cid}"]`);
    if (row) row.outerHTML = compRowHtml(rid, comp);
    refreshRoomDisplay(rid);
    renderResults();
}

// ═══════════════════════════════════════════════════════════
// Event Listeners
// ═══════════════════════════════════════════════════════════

function initEvents() {
    // Global settings
    const tiInput = document.getElementById('temp-indoor');
    const teInput = document.getElementById('temp-outdoor');
    const cityEl  = document.getElementById('city-select');
    const tbEl    = document.getElementById('thermal-bridge');

    tiInput.addEventListener('input', () => {
        state.ti = parseFloat(tiInput.value) || 20;
        state.rooms.forEach(r => refreshRoomDisplay(r.id));
        renderResults();
    });

    teInput.addEventListener('input', () => {
        state.te = parseFloat(teInput.value) || -12;
        cityEl.value = 'custom';
        state.rooms.forEach(r => refreshRoomDisplay(r.id));
        renderResults();
    });

    cityEl.addEventListener('change', () => {
        const temp = CITY_TEMPS[cityEl.value];
        if (temp !== undefined) {
            state.te = temp;
            teInput.value = temp;
            state.rooms.forEach(r => refreshRoomDisplay(r.id));
            renderResults();
        }
    });

    tbEl.addEventListener('change', () => {
        state.thermalBridge = tbEl.checked;
        state.rooms.forEach(r => refreshRoomDisplay(r.id));
        renderResults();
    });

    // Add room
    document.getElementById('btn-add-room').addEventListener('click', addRoom);

    // Delegate events on rooms container
    const rc = document.getElementById('rooms-container');

    rc.addEventListener('click', e => {
        const rid = n => parseInt(n, 10);

        const rDel = e.target.closest('.r-del');
        if (rDel) return deleteRoom(rid(rDel.dataset.rid));

        const cAdd = e.target.closest('.c-add');
        if (cAdd) return addComponent(rid(cAdd.dataset.rid));

        const cDel = e.target.closest('.c-del');
        if (cDel) return deleteComponent(rid(cDel.dataset.rid), rid(cDel.dataset.cid));
    });

    rc.addEventListener('input', e => {
        const rid = n => parseInt(n, 10);

        // Room name
        if (e.target.classList.contains('room-name-input')) {
            const room = state.rooms.find(r => r.id === rid(e.target.dataset.rid));
            if (room) { room.name = e.target.value; renderResults(); }
            return;
        }

        // Room parameters
        if (e.target.classList.contains('r-param')) {
            const room = state.rooms.find(r => r.id === rid(e.target.dataset.rid));
            if (room) {
                room[e.target.dataset.f] = parseFloat(e.target.value) || 0;
                refreshRoomDisplay(room.id);
                renderResults();
            }
            return;
        }

        // Component field
        if (e.target.classList.contains('c-field')) {
            const room = state.rooms.find(r => r.id === rid(e.target.dataset.rid));
            const comp = room && room.components.find(c => c.id === rid(e.target.dataset.cid));
            if (comp) {
                const f = e.target.dataset.f;
                comp[f] = f === 'name' ? e.target.value : (parseFloat(e.target.value) || 0);
                refreshAufxCell(room.id, comp.id);
                refreshRoomDisplay(room.id);
                renderResults();
            }
            return;
        }
    });

    rc.addEventListener('change', e => {
        if (e.target.classList.contains('c-preset')) {
            applyPreset(
                parseInt(e.target.dataset.rid, 10),
                parseInt(e.target.dataset.cid, 10),
                e.target.value
            );
        }
    });
}

// ═══════════════════════════════════════════════════════════
// Bootstrap
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    initEvents();
    addRoom(); // Start with one empty room
});
