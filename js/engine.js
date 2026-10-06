/* ==========================================================================
   Milk & Cookies — engine
   ========================================================================== */
'use strict';

/* ---------------- registries ---------------- */
const SCENES = {}, ITEMS = {}, DIALOGS = {}, ENDINGS = {}, PEOPLE = {};
const ENDING_ORDER = [];
let G = null;                      // live game state
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const VERBS = [
  ['examine', 'Examine', 'E'], ['take', 'Take', 'T'], ['open', 'Open', 'O'], ['close', 'Close', 'C'], ['operate', 'Operate', 'U'],
  ['speak', 'Speak', 'S'], ['consume', 'Consume', 'F'], ['hit', 'Hit', 'H'], ['leave', 'Leave', 'L'], ['go', 'Go', 'G'],
];
const DAY0 = new Date(1999, 9, 14);   // Thursday, October 14, 1999
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const LAST_DAY = 17;               // Sunday, October 31, 1999

function newState() {
  return {
    v: 1, day: 0, phase: 'evening', school: true, loc: 'desk', prev: null,
    inv: [], drops: {}, f: {}, karma: 0, rel: { noreen: 0, don: 0, greg: 0 },
    visited: {}, seen: {}, turns: 0, dayTurns: 0, mix: null, milkDay: 0, log: [],
    ui: { verb: null, item: null },
  };
}

/* ---------------- content helpers (used by content files) ---------------- */
function say(html, cls) { Game.log(html, cls); }
function ev(html) { Game.log(html, 'event'); }
function sys(html) { Game.log(html, 'sys'); }
function has(id) { return G.inv.includes(id); }
function where(id) { if (has(id)) return 'inv'; for (const [s, arr] of Object.entries(G.drops)) if (arr.includes(id)) return s; return null; }
function exists(id) { return where(id) !== null; }
function give(id, quiet) {
  removeEverywhere(id); G.inv.push(id); Game.newItem = id;
  if (!quiet) Audio99.play('pickup');
  Game.renderInv(); Game.renderScene(true);
}
function removeEverywhere(id) {
  G.inv = G.inv.filter(x => x !== id);
  for (const s in G.drops) G.drops[s] = G.drops[s].filter(x => x !== id);
}
function lose(id) { removeEverywhere(id); Game.renderInv(); Game.renderScene(true); }
function swap(a, b) { const i = G.inv.indexOf(a); if (i >= 0) { removeEverywhere(b); G.inv[i] = b; Game.newItem = b; } else { const w = where(a); removeEverywhere(a); if (w) drop(b, w); else G.inv.push(b); } Game.renderInv(); Game.renderScene(true); }
function drop(id, scene) { removeEverywhere(id); (G.drops[scene] = G.drops[scene] || []).push(id); Game.renderInv(); Game.renderScene(true); }
function F(k) { return G.f[k]; }
function setF(k, v = true) { G.f[k] = v; }
function inc(k, n = 1) { G.f[k] = (G.f[k] || 0) + n; return G.f[k]; }
function once(k) { if (G.f['once_' + k]) return false; G.f['once_' + k] = 1; return true; }
function karma(n) { G.karma += n; }
function rel(who, n) { G.rel[who] = (G.rel[who] || 0) + n; }
function go(id, quiet) { Game.goto(id, quiet); }
function talk(id, node) { Game.dialog(id, node); }
function sfx(n, d) { Audio99.play(n, d); }
function ending(id) { Game.ending(id); }
function itemName(id) { const it = ITEMS[id]; return it ? val(it.name) : id; }
/* "the cookie", "Noreen's grocery list", "the fuzzy glass" — name with the right article, mid-sentence */
function theItem(id) { const it = ITEMS[id]; if (it && it.the) return val(it.the); const n = itemName(id); if (/^[A-Z][a-z]+'s /.test(n)) return n.replace(/ (\S)/g, (m, c) => ' ' + c.toLowerCase()); const low = n.replace(/^The /, '').replace(/(^|\s)([A-Z])(?=[a-z])/g, (m, a, c) => a + c.toLowerCase()); return 'the ' + low.replace(/\b(tv|cd|id)\b/gi, x => x.toUpperCase()); }
function val(x, ...a) { return typeof x === 'function' ? x(...a) : x; }
function day() { return G.day; }
function dow(d = G.day) { return (4 + d) % 7; }           // 0=Sun
function isWeekend(d = G.day) { const w = dow(d); return w === 0 || w === 6; }
function dateStr(d = G.day, short) { const dt = new Date(DAY0.getTime() + d * 864e5); return short ? `${DOW[dt.getDay()].slice(0, 3)} ${MON[dt.getMonth()].slice(0, 3)} ${dt.getDate()}` : `${DOW[dt.getDay()]}, ${MON[dt.getMonth()]} ${dt.getDate()}, 1999`; }
function phase() { return G.phase; }
function isNight() { return G.phase !== 'day'; }
function here(who) { return Story.where(who) === Game.baseScene(G.loc); }
function closeup(img, cap) { Game.closeup({ img, cap }); }
function paper(text, hand) { Game.closeup({ paper: text, hand }); }

/* ---------------- definitions ---------------- */
function scene(id, def) { SCENES[id] = Object.assign({ id, hs: {}, exits: [], drop: [8, 80] }, def); }
function item(id, def) { ITEMS[id] = Object.assign({ id }, def); }
function dialog(id, def) { DIALOGS[id] = def; }
function endingDef(id, def) { ENDINGS[id] = Object.assign({ id }, def); ENDING_ORDER.push(id); }
function person(id, def) { PEOPLE[id] = def; }

/* ==========================================================================
   Game object
   ========================================================================== */
const Game = {
  history: [], newItem: null, busy: false, typing: null,

  /* ---------- boot / title ---------- */
  boot() {
    this.buildVerbs(); this.bindUI(); this.layout();
    window.addEventListener('resize', () => this.layout());
    this.refreshTitle();
    // first gesture unlocks audio + title music
    const unlock = () => { Audio99.init(); if ($('#title').classList.contains('active')) Audio99.music('title'); window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
    window.addEventListener('pointerdown', unlock); window.addEventListener('keydown', unlock);
    try { const s = JSON.parse(localStorage.getItem('mc99_settings') || '{}'); if (s.mute) { Audio99.enabled = false; } } catch (e) { }
    this.syncSoundBtn();
    // preload key images
    ['desk', 'den_night', 'upstairs', 'kitchen_noreen'].forEach(k => { const i = new Image(); i.src = `assets/scenes/${k}.webp`; });
  },
  refreshTitle() {
    $('#btn-continue').disabled = !this.hasSave('auto');
    const got = this.endingsGot();
    $('#ending-count').textContent = `Endings discovered: ${got.length} / ${ENDING_ORDER.length}`;
  },
  show(screen) { $$('.screen').forEach(s => s.classList.toggle('active', s.id === screen)); if (screen === 'game') this.layout(); },
  layout() {
    const W = window.innerWidth, H = window.innerHeight;
    if (W <= 980) { document.documentElement.style.setProperty('--vw', '100%'); return; }
    const vw = Math.max(480, Math.min(W - 300 - 40, (H - 38 - 20 - 50 - 8 - 130) * 1.5, 1200));
    document.documentElement.style.setProperty('--vw', vw + 'px');
  },

  newGame() {
    G = newState(); this.history = [];
    Story.init();
    this.show('intro'); this.playIntro();
  },
  playIntro() {
    Audio99.music('night');
    const box = $('#intro-text'); box.innerHTML = '';
    const lines = Story.introLines();
    let i = 0, timer = null, finished = false;
    const token = this.introToken = (this.introToken || 0) + 1;
    const intro = $('#intro'); intro.classList.remove('lit');
    setTimeout(() => intro.classList.add('lit'), 600);
    const next = () => {
      if (finished || token !== this.introToken) return;
      if (i >= lines.length) { timer = setTimeout(done, 3200); return; }
      const p = document.createElement('p'); p.innerHTML = lines[i]; box.appendChild(p);
      requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add('on')));
      i++; timer = setTimeout(next, i === 1 ? 2200 : 3600);
    };
    const done = () => { if (finished || token !== this.introToken) return; finished = true; clearTimeout(timer); intro.onclick = null; $('#intro-skip').onclick = null; this.startPlay(true); };
    $('#intro-skip').onclick = (e) => { e.stopPropagation(); done(); };
    intro.onclick = () => { clearTimeout(timer); if (i < lines.length) next(); else done(); };
    timer = setTimeout(next, 900);
  },
  startPlay(fresh) {
    this.show('game');
    $('#log').innerHTML = '';
    if (fresh) { G.log = []; this.renderAll(); Story.opening(); }
    else { G.log.slice(-60).forEach(([h, c]) => this.log(h, c, true)); this.renderAll(); this.log(`<i>Game restored — ${dateStr()}.</i>`, 'sys'); }
    this.music();
  },

  /* ---------- UI construction ---------- */
  buildVerbs() {
    $('#verbs').innerHTML = VERBS.map(([id, label, key]) => `<button class="verb" data-verb="${id}" title="${label} (${key})">${label}</button>`).join('');
  },
  bindUI() {
    $('#btn-new').onclick = () => { Audio99.init(); if (this.hasSave('auto')) this.confirm('Start a new game?', 'Your autosave will be overwritten when you next play. Manual save slots are kept.', () => this.newGame()); else this.newGame(); };
    $('#btn-continue').onclick = () => { Audio99.init(); this.load('auto'); };
    $('#btn-load').onclick = () => this.saveMenu(true);
    $('#btn-endings').onclick = () => this.endingsMenu();
    $('#btn-howto').onclick = () => this.howTo();
    $('#verbs').onclick = e => { const b = e.target.closest('.verb'); if (b) this.selectVerb(b.dataset.verb); };
    $('#tb-hint').onclick = () => this.toggleHotspots();
    $('#tb-sound').onclick = () => { Audio99.toggle(); this.syncSoundBtn(); try { localStorage.setItem('mc99_settings', JSON.stringify({ mute: !Audio99.enabled })); } catch (e) { } };
    $('#tb-save').onclick = () => this.saveMenu(false);
    $('#tb-menu').onclick = () => this.pauseMenu();
    $('#selfbtn').onclick = () => this.clickSelf();
    $('#backbtn').onclick = () => this.back();
    $('#end-rewind').onclick = () => this.rewind();
    $('#end-load').onclick = () => this.saveMenu(true);
    $('#end-title-btn').onclick = () => { this.show('title'); this.refreshTitle(); Audio99.music('title'); };
    $('#bsod').onclick = () => this.bsodDone && this.bsodDone();
    const vp = $('#viewport');
    vp.addEventListener('contextmenu', e => { e.preventDefault(); const hs = e.target.closest('.hs'); if (hs && !this.busy) this.command('examine', hs.dataset.id); });
    vp.addEventListener('mousemove', e => this.hover(e));
    vp.addEventListener('mouseleave', () => { $('#hover-label').style.display = 'none'; });
    $('#hotspots').addEventListener('click', e => { const hs = e.target.closest('.hs'); if (hs && !this.busy) this.clickHotspot(hs.dataset.id); else if (!hs && G && G.ui.verb && !this.busy) { /* click on nothing */ } });
    $('#inventory').addEventListener('click', e => { const s = e.target.closest('.inv-slot'); if (s && !this.busy) this.clickItem(s.dataset.id); });
    $('#inventory').addEventListener('contextmenu', e => { e.preventDefault(); const s = e.target.closest('.inv-slot'); if (s && !this.busy) this.command('examine', 'item:' + s.dataset.id); });
    $('#inventory').addEventListener('mousemove', e => { const s = e.target.closest('.inv-slot'); this.setCmdLine(s ? s.dataset.id && ('item:' + s.dataset.id) : null); });
    $('#map').addEventListener('click', e => { const r = e.target.closest('[data-go]'); if (r && !this.busy) this.travel(r.dataset.go); });
    $('#closeup').onclick = () => this.closeCloseup();
    document.addEventListener('keydown', e => this.key(e));
  },
  key(e) {
    if (e.target.closest('input, textarea, [contenteditable]')) return;
    if (!$('#modal').classList.contains('hidden')) { if (e.key === 'Escape') this.closeModal(); return; }
    if ($('#bsod').classList.contains('active')) { this.bsodDone && this.bsodDone(); return; }
    if (!$('#game').classList.contains('active')) return;
    if (!$('#computer').classList.contains('hidden')) { if (e.key === 'Escape') Computer.close(); return; }
    if (!$('#closeup').classList.contains('hidden')) { this.closeCloseup(); e.preventDefault(); return; }
    if (!$('#dialog').classList.contains('hidden')) {
      const n = parseInt(e.key, 10); const ch = $$('#dlg-choices .dlg-choice');
      if (n >= 1 && n <= ch.length) { ch[n - 1].click(); e.preventDefault(); }
      else if (e.key === 'Enter' || e.key === ' ') { const c = $('#dialog .dlg-cont'); if (this.typing) this.typing.finish(); else if (c) c.click(); e.preventDefault(); }
      return;
    }
    if (e.key === 'Escape') { if (G.ui.verb || G.ui.item) { this.clearVerb(); } else this.pauseMenu(); return; }
    if (e.key === ' ' || e.key === 'Tab') { e.preventDefault(); this.toggleHotspots(); return; }
    if (e.key === 'Backspace') { e.preventDefault(); this.back(); return; }
    if (e.key === 'm' || e.key === 'M') { $('#tb-sound').click(); return; }
    const v = VERBS.find(v => v[2].toLowerCase() === e.key.toLowerCase());
    if (v && !e.ctrlKey && !e.metaKey && !e.altKey) this.selectVerb(v[0]);
  },
  syncSoundBtn() { $('#tb-sound').classList.toggle('on', Audio99.enabled); $('#tb-sound').innerHTML = Audio99.enabled ? '&#9835; Sound' : '&#9835; Muted'; },
  toggleHotspots(force) { const v = $('#viewport'); v.classList.toggle('show-hs', force); $('#tb-hint').classList.toggle('on', v.classList.contains('show-hs')); },

  /* ---------- verbs & clicks ---------- */
  selectVerb(v) {
    if (!G) return;
    Audio99.play('click');
    if (G.ui.verb === v) { this.clearVerb(); return; }
    G.ui.verb = v; G.ui.item = null; this.syncVerbs();
  },
  clearVerb() { if (!G) return; G.ui.verb = null; G.ui.item = null; this.syncVerbs(); },
  syncVerbs() {
    $$('.verb').forEach(b => b.classList.toggle('sel', b.dataset.verb === G.ui.verb));
    $$('.inv-slot').forEach(s => s.classList.toggle('sel', s.dataset.id === G.ui.item));
    $('#viewport').classList.toggle('verb-pending', !!G.ui.verb);
    this.setCmdLine();
  },
  setCmdLine(target) {
    const ui = G.ui; let t = '';
    const vname = ui.verb ? VERBS.find(v => v[0] === ui.verb)[1].toUpperCase() : '';
    const tname = target ? this.targetName(target) : '';
    if (ui.verb === 'operate' && ui.item) t = `OPERATE ${itemName(ui.item)} on ${tname || '…'}`;
    else if (ui.verb) t = `${vname} ${tname || '…'}`;
    else if (target) t = tname;
    $('#command').innerHTML = t ? esc(t) : '&nbsp;';
  },
  targetName(t) {
    if (t === 'self') return 'yourself';
    if (t.startsWith('item:')) return itemName(t.slice(5));
    const hs = this.hsDef(t); return hs ? val(hs.name) : t;
  },
  clickHotspot(id) {
    const ui = G.ui;
    if (id.startsWith('item:')) { // dropped item in the scene
      const iid = id.slice(5);
      if (ui.verb === 'operate' && ui.item) return this.command('operate', ui.item, 'item:' + iid);
      return this.command(ui.verb || 'examine', 'item:' + iid);
    }
    const hs = this.hsDef(id); if (!hs) return;
    if (ui.verb === 'operate' && ui.item) return this.command('operate', ui.item, id);
    if (ui.verb === 'leave' && ui.item) return this.command('leave', ui.item, id);
    if (ui.verb) return this.command(ui.verb, id);
    const def = hs.click || (hs.exit ? 'go' : hs.npc ? 'speak' : 'examine');
    this.command(def, id);
  },
  clickItem(id) {
    const ui = G.ui;
    if (ui.verb === 'operate' && !ui.item) { ui.item = id; Audio99.play('click'); this.syncVerbs(); return; }
    if (ui.verb === 'operate' && ui.item) { if (ui.item === id) { ui.item = null; this.syncVerbs(); return; } return this.command('operate', ui.item, 'item:' + id); }
    this.command(ui.verb || 'examine', 'item:' + id);
  },
  clickSelf() {
    const ui = G.ui;
    if (ui.verb === 'operate' && ui.item) return this.command('operate', ui.item, 'self');
    this.command(ui.verb || 'examine', 'self');
  },
  hover(e) {
    const lab = $('#hover-label'); const hs = e.target.closest('.hs');
    if (!hs || !$('#dialog').classList.contains('hidden')) { lab.style.display = 'none'; this.setCmdLine(); return; }
    const id = hs.dataset.id; const ui = G.ui;
    let txt = this.targetName(id);
    if (ui.verb === 'operate' && ui.item) txt = `Use ${itemName(ui.item)} on ${txt}`;
    else if (ui.verb) txt = `${VERBS.find(v => v[0] === ui.verb)[1]} ${txt}`;
    else { const d = this.hsDef(id); if (d && d.exit) txt = '→ ' + txt; }
    lab.textContent = txt; lab.style.display = 'block';
    const r = $('#viewport').getBoundingClientRect();
    let x = e.clientX - r.left + 14, y = e.clientY - r.top + 16;
    if (x + lab.offsetWidth > r.width - 4) x = e.clientX - r.left - lab.offsetWidth - 10;
    if (y + 24 > r.height) y = e.clientY - r.top - 28;
    lab.style.left = x + 'px'; lab.style.top = y + 'px';
    this.setCmdLine(id);
  },

  /* ---------- command resolution ---------- */
  snapshot() { const s = JSON.stringify(G); this.history.push(s); if (this.history.length > 40) this.history.shift(); },
  command(verb, a, b) {
    if (!G || this.busy) return;
    this.snapshot();
    G.turns++; G.dayTurns++;
    const ui = G.ui; ui.verb = null; ui.item = null; this.syncVerbs();
    $$('#log p').forEach(p => p.classList.add('old'));
    const vlabel = VERBS.find(v => v[0] === verb)?.[1] || verb;
    let line = verb === 'operate' && b ? `Operate ${itemName(a)} on ${this.targetName(b)}` : `${vlabel} ${this.targetName(a.startsWith?.('item:') ? a : a)}`;
    if (verb === 'leave' && b) line = `Leave ${itemName(a.replace('item:', ''))}`;
    this.log(esc(line), 'cmd');
    let res;
    try { res = this.resolve(verb, a, b); } catch (err) { console.error(err); res = 'Something went sideways. (Error: ' + esc(err.message) + ')'; }
    if (typeof res === 'string' && res) say(res);
    this.renderInv(); this.renderScene(true);
    if (G && !this.ended) { try { Story.afterCommand(verb, a, b); } catch (e) { console.error(e); } this.autosave(); }
  },
  hsDef(id, sceneId = G.loc) { const sc = SCENES[sceneId]; return sc && sc.hs[id]; },
  run(h, ...args) { if (h === undefined || h === null) return undefined; if (typeof h === 'function') { const r = h(...args); return this.ended ? null : r; } return h; },
  resolve(verb, a, b) {
    // ---- OPERATE item on target ----
    if (verb === 'operate' && b) {
      const id = a, it = ITEMS[id];
      const tgt = b.startsWith('item:') ? b.slice(5) : b;
      const tIsItem = b.startsWith('item:');
      let r;
      if (it.use && tgt in it.use) r = this.run(it.use[tgt], tgt); if (r !== undefined) return r;
      if (tIsItem) { const ti = ITEMS[tgt]; if (ti.use && id in ti.use) r = this.run(ti.use[id], id); if (r !== undefined) return r; }
      if (!tIsItem && tgt !== 'self') { const hs = this.hsDef(tgt); if (hs && hs.use) { if (id in hs.use) r = this.run(hs.use[id], id); if (r === undefined && '*' in hs.use) r = this.run(hs.use['*'], id); } if (r !== undefined) return r; if (hs && hs.npc && PEOPLE[hs.npc]?.give) { r = this.run(PEOPLE[hs.npc].give, id); if (r !== undefined) return r; } }
      if (it.use && '*' in it.use) r = this.run(it.use['*'], tgt, tIsItem); if (r !== undefined) return r;
      return Defaults.use(id, tgt, tIsItem);
    }
    // ---- LEAVE (drop) ----
    if (verb === 'leave') {
      const id = (a || '').replace('item:', '');
      if (!a.startsWith('item:') && !b) { const hs = this.hsDef(a); return hs && hs.leave !== undefined ? this.run(hs.leave) : Defaults.leaveHs(a); }
      if (!has(id)) return `You'd have to be holding it first.`;
      const it = ITEMS[id]; const sc = SCENES[G.loc];
      let r = it.leave !== undefined ? this.run(it.leave, G.loc) : undefined; if (r !== undefined) return r;
      r = sc.onLeave ? this.run(sc.onLeave, id) : undefined; if (r !== undefined) return r;
      if (sc.noDrop) return val(sc.noDrop) || `There's nowhere sensible to put that down here.`;
      drop(id, G.loc); Audio99.play('drop');
      return pick([`You set down ${theItem(id)}.`, `You put ${theItem(id)} down here.`, `You leave ${theItem(id)} here. You'll remember where. Probably.`]);
    }
    // ---- verbs on self ----
    if (a === 'self') return this.run(Self[verb]) ?? Defaults.self(verb);
    // ---- verbs on an item (inventory or dropped) ----
    if (a.startsWith('item:')) {
      const id = a.slice(5), it = ITEMS[id];
      if (!it) return 'Huh?';
      const inScene = !has(id);
      if (verb === 'take') { if (!inScene) return pick(['You already have that.', 'It\'s already in your pocket. Your long, long pocket.']); let r = it.take !== undefined ? this.run(it.take) : undefined; if (r !== undefined) return r; give(id); return `You pick up ${theItem(id)}.`; }
      if (verb === 'examine') return this.run(it.examine ?? it.desc) ?? `It's ${theItem(id)}.`;
      if (verb === 'go') return `You can't go into ${theItem(id)}.`;
      if (verb === 'operate') { const r = this.run(it.operate); if (r !== undefined) return r; G.ui.verb = 'operate'; G.ui.item = id; this.syncVerbs(); return null; }
      const r = this.run(it[verb]); if (r !== undefined) return r;
      return Defaults.item(verb, id);
    }
    // ---- verbs on a hotspot ----
    const hs = this.hsDef(a); if (!hs) return 'Nothing there.';
    if (verb === 'go' || (verb === 'open' && hs.exit && hs.open === undefined)) {
      if (hs.go !== undefined) { const r = this.run(hs.go); if (r !== undefined) return r; }
      if (hs.exit) { this.travel(val(hs.exit)); return null; }
    }
    if (verb === 'speak' && hs.npc && hs.speak === undefined) { this.dialog(PEOPLE[hs.npc].talk()); return null; }
    if (verb === 'examine' && hs.npc && hs.examine === undefined) return this.run(PEOPLE[hs.npc].examine);
    if (verb === 'hit' && hs.npc && hs.hit === undefined) return this.run(PEOPLE[hs.npc].hit);
    const h = hs[verb === 'examine' ? (hs.examine !== undefined ? 'examine' : 'look') : verb];
    const r = this.run(h); if (r !== undefined) return r;
    return Defaults.hs(verb, a, hs);
  },

  /* ---------- travel ---------- */
  baseScene(id) { const s = SCENES[id]; return (s && s.parent) || id; },
  travel(to) {
    if (Story.travelHook && Story.travelHook(to)) return;
    if (!SCENES[to]) return;
    const gate = Story.canTravel(G.loc, to); if (gate !== true) { if (gate) say(gate); return; }
    this.goto(to);
  },
  goto(id, quiet) {
    const sc = SCENES[id]; if (!sc) { console.warn('no scene', id); return; }
    G.prev = G.loc; G.loc = id;
    this.closeCloseup(true);
    const first = !G.visited[id]; G.visited[id] = (G.visited[id] || 0) + 1;
    const fade = $('#fade');
    const doIt = () => {
      this.renderAll();
      if (!quiet) {
        const d = first ? val(sc.look) : (val(sc.brief) || null);
        if (d) say(d); else if (!first) say(`<b>${esc(val(sc.name))}.</b>`);
        const extra = Story.presence(id); if (extra) say(extra);
      }
      if (sc.enter) this.run(sc.enter, first);
      Story.onEnter(id, first);
      this.music();
      const im = $('#scene-img'); let shown = false;
      const reveal = () => { if (shown) return; shown = true; fade.classList.remove('on'); };
      if (im.complete && im.naturalWidth) reveal(); else { im.onload = reveal; setTimeout(reveal, 900); }
      this.preloadAround();
    };
    if (G.prev && G.prev !== id && $('#game').classList.contains('active')) {
      const ps = SCENES[G.prev];
      if (!(ps && (ps.parent === id || sc.parent === G.prev))) Audio99.play(sc.floor !== (ps && ps.floor) && sc.floor && ps && ps.floor ? 'stairs' : 'step');
      fade.classList.add('on'); setTimeout(doIt, 260);
    } else doIt();
  },
  preloadAround() {
    try {
      (Story.exits(G.loc) || []).forEach(sid => { const sc = SCENES[sid]; if (!sc) return; const k = val(sc.img) || sid; if (!this._pre) this._pre = {}; if (this._pre[k]) return; const i = new Image(); i.src = `assets/scenes/${k}.webp`; this._pre[k] = i; });
    } catch (e) { }
  },
  back() { const sc = SCENES[G.loc]; if (sc.parent) this.travel(sc.parent); else if (sc.backTo) this.travel(val(sc.backTo)); },
  music() { const sc = SCENES[G.loc]; const m = Story.music(sc); if (m) Audio99.music(m); },

  /* ---------- rendering ---------- */
  renderAll() { this.renderScene(); this.renderInv(); this.renderMap(); this.renderTop(); },
  renderTop() {
    $('#tb-date').textContent = dateStr();
    const ph = { morning: 'Morning', evening: G.day === 0 ? 'Night' : 'Evening', day: 'Weekend', school: 'At School' }[G.phase];
    const el = $('#tb-phase'); el.textContent = ph; el.className = 'tb-phase ' + (G.phase === 'school' ? 'school' : isNight() ? 'night' : '');
  },
  imgKey() { const sc = SCENES[G.loc]; return val(sc.img) || sc.id; },
  renderScene(soft) {
    if (!G) return;
    const sc = SCENES[G.loc]; const key = this.imgKey();
    const img = $('#scene-img'); const src = `assets/scenes/${key}.webp`;
    if (this._curImg !== src || !img.getAttribute('src')) { this._curImg = src; img.src = src; }
    $('#scene-name').textContent = val(sc.name);
    // layers (patches)
    const L = $('#scene-layers'); L.innerHTML = '';
    (val(sc.layers) || []).forEach(l => {
      const el = document.createElement('img'); el.src = `assets/patches/${l.src}.png`;
      const [x, y, w, h] = l.rect; Object.assign(el.style, { left: x / 12 + '%', top: y / 8 + '%', width: w / 12 + '%', height: h / 8 + '%' }); L.appendChild(el);
    });
    // dropped items
    const drops = G.drops[G.loc] || [];
    const [dx, dy] = sc.drop;
    const hsHtml = [];
    const patchItems = val(sc.patchItems) || {};
    let slot = 0;
    drops.forEach((id) => {
      const ik = val(ITEMS[id].icon, id); const pk = (ik in patchItems) ? patchItems[ik] : patchItems[id];
      if (pk) {
        const el = document.createElement('img'); el.src = `assets/patches/${pk.src}.png`;
        const [px, py, pw, ph] = pk.rect; Object.assign(el.style, { left: px / 12 + '%', top: py / 8 + '%', width: pw / 12 + '%', height: ph / 8 + '%' }); L.appendChild(el);
        hsHtml.push(`<div class="hs" data-id="item:${id}" style="left:${px / 12}%;top:${py / 8}%;width:${pw / 12}%;height:${ph / 8}%"></div>`);
        return;
      }
      const i = slot++;
      const x = dx + (i % 8) * 8.5, y = dy - Math.floor(i / 8) * 11;
      const d = document.createElement('div'); d.className = 'drop-item'; d.style.left = x + '%'; d.style.top = (y - 6) + '%';
      d.innerHTML = `<img src="assets/items/${val(ITEMS[id].icon, id) || id}.png" alt="">`; L.appendChild(d);
      hsHtml.push(`<div class="hs" data-id="item:${id}" style="left:${x}%;top:${y - 6}%;width:7.5%;height:11.25%"></div>`);
    });
    // hotspots: biggest first so small ones sit on top
    const list = [];
    for (const [id, h] of Object.entries(sc.hs)) {
      if (h.show && !h.show()) continue;
      const r = this.rectFor(sc, key, id, h); if (!r) continue;
      list.push([id, h, r]);
    }
    list.sort((p, q) => q[2][2] * q[2][3] - p[2][2] * p[2][3]);
    $('#hotspots').innerHTML = list.map(([id, h, [x, y, w, hh]]) =>
      `<div class="hs${h.exit ? ' exit' : ''}${h.npc ? ' npc' : ''}" data-id="${id}" style="left:${x}%;top:${y}%;width:${w}%;height:${hh}%"></div>`).join('') + hsHtml.join('');
    if (!soft) this.renderMap();
  },
  rectFor(sc, key, id, h) {
    if (h.rect) return val(h.rect);
    const src = h.from || id;
    const tryKeys = [key, ...(sc.hsKeys || []), sc.hsBase || sc.id];
    for (const k of tryKeys) { const t = HOTSPOTS[k]; if (t && t[src]) { const [y0, x0, y1, x1] = t[src]; const pad = h.pad ?? 0; return [x0 / 10 - pad, y0 / 10 - pad, (x1 - x0) / 10 + pad * 2, (y1 - y0) / 10 + pad * 2]; } }
    return null;
  },
  renderInv() {
    if (!G) return;
    const el = $('#inventory');
    if (!G.inv.length) { el.innerHTML = `<div class="inv-empty">Your pockets are empty. Your jeans are very long, and very empty.</div>`; return; }
    el.innerHTML = G.inv.map(id => { const it = ITEMS[id]; return `<div class="inv-slot${G.ui.item === id ? ' sel' : ''}${this.newItem === id ? ' new' : ''}" data-id="${id}" title="${esc(val(it.name))}"><img src="assets/items/${val(it.icon, id) || id}.png" alt="${esc(val(it.name))}"></div>`; }).join('');
    this.newItem = null;
  },
  renderMap() { Map99.render(); },

  /* ---------- text log ---------- */
  log(html, cls, restoring) {
    const p = document.createElement('p'); if (cls) p.className = cls; p.innerHTML = html;
    const L = $('#log'); L.appendChild(p);
    while (L.children.length > 220) L.removeChild(L.firstChild);
    if (!restoring && G) { G.log.push([html, cls || '']); if (G.log.length > 120) G.log.splice(0, G.log.length - 120); }
    L.scrollTop = L.scrollHeight;
  },
  toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(this._toast); this._toast = setTimeout(() => el.classList.remove('on'), 2200); },

  /* ---------- closeups ---------- */
  closeup({ img, cap, paper, hand }) {
    const c = $('#closeup'); c.classList.remove('hidden');
    c.innerHTML = paper ? `<div class="paper${hand ? ' hand' : ''}">${paper}</div><div id="closeup-cap">${cap || '(click to close)'}</div>` : `<img src="${img}" alt=""><div id="closeup-cap">${cap || ''}</div>`;
    Audio99.play('paper');
  },
  closeCloseup(silent) { $('#closeup').classList.add('hidden'); },

  /* ---------- dialog ---------- */
  dialog(id, start) {
    const D = typeof id === 'string' ? DIALOGS[id] : id; if (!D) { console.warn('no dialog', id); return; }
    const dlgId = typeof id === 'string' ? id : (D.id || 'anon');
    this.curDlg = { D, id: dlgId };
    this.toggleHotspots(false);
    $('#dialog').classList.remove('hidden');
    this.dlgNode(val(start) || val(D.start) || 'start');
  },
  dlgNode(nid) {
    const { D, id } = this.curDlg;
    if (!nid || nid === 'END') return this.endDialog();
    const node = typeof D.nodes === 'function' ? D.nodes()[nid] : D.nodes[nid];
    if (!node) { console.warn('missing node', id, nid); return this.endDialog(); }
    if (node.do) node.do();
    if (this.ended) return;
    if (node.redirect) { const r = val(node.redirect); if (r) return this.dlgNode(r); }
    const who = val(node.who) || D.who || 'narrator';
    const P = PEOPLE[who] || { name: '' };
    const portrait = val(node.p) ?? val(D.p) ?? 'neutral';
    const pimg = who === 'narrator' || who === 'david' || portrait === false ? null : `assets/portraits/${P.portraitBase || who}${portrait === 'neutral' ? '' : '_' + portrait}.webp`;
    const dEl = $('#dialog');
    dEl.classList.toggle('noportrait', !pimg);
    $('.dlg-portrait').classList.toggle('none', !pimg);
    if (pimg) { const im = $('#dlg-img'); if (this._curPortrait !== pimg) { this._curPortrait = pimg; im.src = pimg; im.style.animation = 'none'; im.offsetHeight; im.style.animation = ''; } }
    $('#dlg-name').textContent = who === 'narrator' ? '' : who === 'david' ? 'You' : val(P.name);
    $('#dlg-name').style.display = who === 'narrator' ? 'none' : '';
    const text = val(node.t) || '';
    const html = text.replace(/\*([^*]+)\*/g, '<span class="act">$1</span>');
    const ch = (val(node.ch) || []).filter(c => !c.if || c.if());
    const box = $('#dlg-choices'); box.innerHTML = '';
    // log
    const plain = html.replace(/<[^>]+>/g, '');
    if (who === 'narrator') this.log(`<i>${plain}</i>`); else if (who !== 'david') this.log(`<b>${esc(val(P.name))}:</b> <span class="say">${html}</span>`);
    const finish = () => {
      this.typing = null;
      if (ch.length) {
        ch.forEach((c, i) => {
          const b = document.createElement('button'); b.className = 'dlg-choice';
          const key = `${id}/${nid}/${val(c.t)}`.slice(0, 120); if (G.seen[key]) b.classList.add('seen');
          const tag = c.tag ? `<span class="tag t-${c.tag}">${{ kind: 'Kind', mean: 'Snide', honest: 'Honest', lie: 'Lie', silent: '…', joke: 'Joke', ask: 'Ask', give: 'Give', act: 'Do' }[c.tag] || c.tag}</span>` : '';
          b.innerHTML = `${i + 1}. ${tag}${val(c.t)}`;
          b.onclick = () => {
            G.seen[key] = 1; Audio99.play('click');
            const said = val(c.say ?? c.t); if (said && c.tag !== 'act' && c.tag !== 'silent' && !c.quiet) this.log(`<b>You:</b> <span class="say">${esc(String(said).replace(/<[^>]+>/g, ''))}</span>`);
            if (c.do) c.do(); if (this.ended) return;
            if (c.jump) { this.dialog(val(c.jump)); return; }
            this.dlgNode(val(c.go) || (c.end ? 'END' : null));
          };
          box.appendChild(b);
        });
      } else {
        const b = document.createElement('button'); b.className = 'dlg-cont'; b.textContent = node.end || !node.go ? 'Done ▸' : 'Continue ▸';
        b.onclick = () => { Audio99.play('click'); this.dlgNode(val(node.go) || 'END'); };
        box.appendChild(b);
      }
    };
    this.typewrite($('#dlg-text'), html, finish, who);
  },
  typewrite(el, html, done, who) {
    if (this.typing) this.typing.cancel();
    el.innerHTML = html; const total = el.textContent.length;
    // Reveal by clipping text nodes progressively
    const nodes = []; const walk = n => { n.childNodes.forEach(c => { if (c.nodeType === 3) { nodes.push([c, c.textContent]); c.textContent = ''; } else walk(c); }); }; walk(el);
    let i = 0, fin = false, raf;
    const blip = who && who !== 'narrator' && who !== 'david';
    const step = () => {
      i += Math.max(2, Math.round(total / 90));
      let k = i; for (const [n, t] of nodes) { n.textContent = t.slice(0, Math.max(0, k)); k -= t.length; }
      if (i >= total) return finish();
      raf = setTimeout(step, 16);
    };
    const finish = () => { if (fin) return; fin = true; clearTimeout(raf); nodes.forEach(([n, t]) => n.textContent = t); done(); };
    this.typing = { finish, cancel: () => { fin = true; clearTimeout(raf); } };
    el.onclick = () => finish();
    step();
  },
  endDialog() {
    if (this.typing) this.typing.cancel(); this.typing = null;
    $('#dialog').classList.add('hidden'); const d = this.curDlg; this.curDlg = null;
    if (d && d.D.after) d.D.after();
    this.renderAll(); this.autosave();
    Story.afterDialog && Story.afterDialog(d && d.id);
  },

  /* ---------- day cycle ---------- */
  sleep() {
    const why = Story.canSleep(); if (why !== true) { say(why); return; }
    this.busy = true; Audio99.play('sleep');
    const fade = $('#fade'); fade.style.transition = 'opacity 1.2s'; fade.classList.add('on');
    setTimeout(() => {
      Story.night();                       // overnight processing (may trigger ending)
      if (this.ended) { this.busy = false; fade.classList.remove('on'); fade.style.transition = ''; return; }
      G.day++; G.dayTurns = 0; G.school = false;
      G.phase = isWeekend() ? 'day' : 'morning';
      G.loc = 'davidroom'; G.prev = null;
      $$('#log p').forEach(p => p.classList.add('old'));
      this.log(dateStr().toUpperCase(), 'day');
      this.renderAll(); this.music();
      setTimeout(() => { fade.classList.remove('on'); fade.style.transition = ''; this.busy = false; Audio99.play('wake'); Story.morning(); this.renderAll(); this.autosave(); }, 500);
    }, 1400);
  },
  toSchool() {
    this.busy = true; const fade = $('#fade'); fade.style.transition = 'opacity 1s'; fade.classList.add('on'); Audio99.play('doorclose');
    setTimeout(() => {
      G.phase = 'school'; G.loc = 'classroom'; G.prev = null; G.visited.classroom = (G.visited.classroom || 0) + 1;
      $$('#log p').forEach(p => p.classList.add('old'));
      this.renderAll(); this.music(); Audio99.play('schoolbell', 0.4);
      setTimeout(() => { fade.classList.remove('on'); fade.style.transition = ''; this.busy = false; Story.schoolStart(); this.autosave(); }, 600);
    }, 1100);
  },
  fromSchool() {
    this.busy = true; const fade = $('#fade'); fade.style.transition = 'opacity 1s'; fade.classList.add('on'); Audio99.play('schoolbell');
    setTimeout(() => {
      G.phase = 'evening'; G.school = true; G.loc = 'foyer'; G.prev = null;
      $$('#log p').forEach(p => p.classList.add('old'));
      this.renderAll(); this.music();
      setTimeout(() => { fade.classList.remove('on'); fade.style.transition = ''; this.busy = false; Audio99.play('door'); Story.homeFromSchool(); this.renderAll(); this.autosave(); }, 600);
    }, 1400);
  },

  /* ---------- endings ---------- */
  endingsGot() { try { return JSON.parse(localStorage.getItem('mc99_endings') || '[]'); } catch (e) { return []; } },
  ending(id) {
    const E = ENDINGS[id]; if (!E) { console.warn('no ending', id); return; }
    this.ended = id; this.busy = false;
    if (this.typing) this.typing.cancel();
    const got = this.endingsGot(); if (!got.includes(id)) { got.push(id); try { localStorage.setItem('mc99_endings', JSON.stringify(got)); } catch (e) { } }
    try { localStorage.removeItem('mc99_save_auto'); } catch (e) { }
    const show = () => {
      $('#dialog').classList.add('hidden'); Computer.close(true);
      this.show('ending');
      $('#end-img').src = `assets/endings/${val(E.img) || id}.webp`;
      const idx = ENDING_ORDER.indexOf(id) + 1;
      $('#end-kicker').textContent = `Ending ${idx} of ${ENDING_ORDER.length} · ${{ good: 'A good ending', best: 'The best ending', bad: 'A bad ending', worst: 'The worst ending', joke: 'Game over', mixed: 'A complicated ending', neutral: 'An ending' }[E.kind] || ''}`;
      $('#end-title').textContent = val(E.title);
      const paras = val(E.text) || [];
      $('#end-text').innerHTML = paras.map((p, i) => `<p style="animation-delay:${0.8 + i * 1.1}s" class="${p.startsWith('§') ? 'sad' : ''}">${p.replace(/^§/, '')}</p>`).join('');
      const news = val(E.news); const ne = $('#end-news');
      if (news) { ne.classList.remove('hidden'); ne.innerHTML = `<div class="np-mast">The Niagara Ledger</div><div class="np-date">${news.date || 'Niagara-on-the-Lake'} &middot; 50&cent;</div><div class="np-head">${news.head}</div><div class="np-body">${news.body}</div>`; } else ne.classList.add('hidden');
      const got2 = this.endingsGot();
      $('#end-tally').innerHTML = ENDING_ORDER.map((eid, i) => `<span class="${eid === id ? 'cur' : got2.includes(eid) ? 'got' : ''}">${got2.includes(eid) ? esc(val(ENDINGS[eid].short || ENDINGS[eid].title)) : '?'.repeat(3)}</span>`).join('');
      $('#end-rewind').style.display = this.history.length ? '' : 'none';
      $('#end-rewind').textContent = E.kind === 'joke' || E.kind === 'bad' || E.kind === 'worst' ? 'Undo That' : 'Rewind';
      Audio99.music(E.music || (['good', 'best', 'mixed'].includes(E.kind) ? 'good' : 'dread'));
      Audio99.play(['good', 'best'].includes(E.kind) ? 'sting_good' : 'sting_bad');
      $('#ending').scrollTop = 0;
    };
    if (E.bsod) { this.show('bsod'); Audio99.stopMusic(); Audio99.play('error'); this.bsodDone = () => { this.bsodDone = null; show(); }; }
    else { const f = $('#fade'); f.style.transition = 'opacity 1.5s'; f.classList.add('on'); setTimeout(() => { f.classList.remove('on'); f.style.transition = ''; show(); }, 1500); }
  },
  rewind() {
    const s = this.history.pop(); if (!s) return;
    G = JSON.parse(s); this.ended = null; G.ui = { verb: null, item: null };
    this.show('game'); $('#log').innerHTML = ''; G.log.slice(-40).forEach(([h, c]) => this.log(h, c, true));
    this.log('<i>…Wait. Let\'s not do that.</i>', 'sys'); this.renderAll(); this.music(); this.autosave();
  },

  /* ---------- save / load ---------- */
  hasSave(slot) { try { return !!localStorage.getItem('mc99_save_' + slot); } catch (e) { return false; } },
  saveMeta(slot) { try { const s = JSON.parse(localStorage.getItem('mc99_save_' + slot)); return s && s.meta; } catch (e) { return null; } },
  save(slot, quiet) {
    if (!G || this.ended) return;
    try { localStorage.setItem('mc99_save_' + slot, JSON.stringify({ meta: { when: new Date().toLocaleString(), day: dateStr(G.day, true), place: val(SCENES[G.loc].name), phase: G.phase }, state: G })); if (!quiet) this.toast('Game saved'); } catch (e) { if (!quiet) this.toast('Could not save (storage unavailable)'); }
  },
  autosave() { if (G && !this.ended && !this.curDlg && G.phase !== undefined) this.save('auto', true); },
  load(slot) {
    try { const s = JSON.parse(localStorage.getItem('mc99_save_' + slot)); if (!s) return; G = s.state; G.ui = { verb: null, item: null }; this.history = []; this.ended = null; this.closeModal(); this.startPlay(false); } catch (e) { this.toast('Could not load save'); }
  },
  saveMenu(loadOnly) {
    const slots = ['auto', '1', '2', '3'];
    const rows = slots.map(s => { const m = this.saveMeta(s); return `<div class="slot-row"><div class="slot-info"><b>${s === 'auto' ? 'AUTOSAVE' : 'SLOT ' + s}</b>${m ? `<small>${esc(m.day)} — ${esc(m.place)} · saved ${esc(m.when)}</small>` : '<small>Empty</small>'}</div>${!loadOnly && s !== 'auto' && G && !this.ended ? `<button class="mbtn" data-save="${s}">Save</button>` : ''}${m ? `<button class="mbtn" data-load="${s}">Load</button>` : ''}</div>`; }).join('');
    this.modal(loadOnly ? 'Load Game' : 'Save / Load', rows, [['Close', () => this.closeModal()]]);
    $('#modal-body').onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.save) { this.save(b.dataset.save); this.saveMenu(loadOnly); } if (b.dataset.load) this.load(b.dataset.load); };
  },
  pauseMenu() {
    this.modal('Menu', `<p style="margin:0">${G ? `<b>${esc(dateStr())}</b><br>${esc(val(SCENES[G.loc].name))}` : ''}</p>`, [
      ['How to Play', () => this.howTo()], ['Endings', () => this.endingsMenu()], ['Save / Load', () => this.saveMenu(false)],
      ['Quit to Title', () => { this.closeModal(); this.autosave(); this.show('title'); this.refreshTitle(); Audio99.music('title'); }], ['Resume', () => this.closeModal(), true]]);
  },
  endingsMenu() {
    const got = this.endingsGot();
    const cards = ENDING_ORDER.map(id => { const E = ENDINGS[id]; const g = got.includes(id); return `<div class="end-card${g ? ' got' : ''}"><div class="ec-img" style="background-image:url(assets/endings/${(typeof E.img === 'string' && E.img) || id}.webp)"></div><div class="ec-name">${g ? esc(val(E.short || E.title)) : '? ? ?'}</div></div>`; }).join('');
    this.modal(`Endings — ${got.length} / ${ENDING_ORDER.length}`, `<p style="margin-top:0">Every ending is earned by something David does — or doesn't do. Some take two weeks. Some take one bad idea.</p><div class="endings-grid">${cards}</div>`, [['Close', () => this.closeModal()]]);
  },
  howTo() {
    this.modal('How to Play', `
      <p style="margin-top:0">You are <b>David</b>: seventeen, six-foot-six, a hundred and forty pounds, and in a cold war with your mother. It is October 1999.</p>
      <h4>VERBS</h4><p>Pick a verb, then click something in the picture, in your inventory, or the <b>Self</b> button. <b>Operate</b> uses things: choose <i>Operate</i>, click an inventory item, then click what to use it on (or Self). <b>Leave</b> puts an item down wherever you are.</p>
      <h4>SHORTCUTS</h4><ul><li>Click with no verb: examine (or walk through doors, or talk to people)</li><li>Right-click: examine</li><li>Keys: <b>E</b>xamine <b>T</b>ake <b>O</b>pen <b>C</b>lose <b>U</b> Operate <b>S</b>peak <b>F</b> Consume <b>H</b>it <b>L</b>eave <b>G</b>o</li><li><b>Space</b>: show hotspots &middot; <b>Backspace</b>: step back &middot; <b>M</b>: mute &middot; <b>1–9</b>: dialogue choices</li></ul>
      <h4>TIME</h4><p>Use the <b>front door</b> on a school-day morning to go to school (once a day). You can only go to <b>bed</b> on a weekend or after school. Some things take days to happen. Some things grow.</p>
      <h4>THE COMPUTER</h4><p>The Gateway 2000 in the den is very much alive: dial-up, ICQ, the web, a printer. Your friend Greg is usually online in the evenings. He gives good advice. You don't have to take it.</p>
      <h4>DEATHS &amp; ENDINGS</h4><p>There are ${ENDING_ORDER.length} endings. Some are instant. After a bad one you can always <b>Undo</b>.</p><h4>CREDITS</h4><p style="font-size:14px">Story, design, code, music &amp; sound written for this game. All audio is synthesized live. Art generated with Google Gemini. Fonts: Silkscreen, Spectral, VT323 (OFL). All characters and events are fictional.</p>`, [['Got it', () => this.closeModal(), true]]);
  },
  modal(title, body, btns) {
    $('#modal-title').textContent = title; $('#modal-body').innerHTML = body; $('#modal-body').onclick = null;
    const b = $('#modal-btns'); b.innerHTML = '';
    btns.forEach(([t, fn, primary]) => { const e = document.createElement('button'); e.className = 'mbtn' + (primary ? ' primary' : ''); e.textContent = t; e.onclick = fn; b.appendChild(e); });
    $('#modal').classList.remove('hidden');
  },
  confirm(title, text, yes) { this.modal(title, `<p style="margin:0">${text}</p>`, [['Cancel', () => this.closeModal()], ['Yes', () => { this.closeModal(); yes(); }, true]]); },
  closeModal() { $('#modal').classList.add('hidden'); },
};

/* ==========================================================================
   Map (floor plan)
   ========================================================================== */
const Map99 = {
  // rect: x,y,w,h in a 280x300 box
  ROOMS: {
    masterbath: [8, 20, 64, 30, 'Ensuite'], master: [8, 52, 64, 48, 'Master'], guestbath: [76, 20, 90, 30, 'Bath'],
    den: [170, 20, 102, 38, 'Den'], upstairs: [76, 54, 90, 46, 'Balcony'], davidroom: [170, 62, 102, 38, "David's"],
    patio: [8, 130, 64, 46, 'Patio'], kitchen: [76, 130, 106, 46, 'Kitchen'], living: [186, 130, 86, 46, 'Living'],
    dining: [8, 180, 64, 48, 'Dining'], foyer: [76, 180, 106, 48, 'Foyer'], powder: [186, 180, 86, 48, 'Powder Rm'],
    basement: [76, 252, 106, 40, 'Rec Room'],
  },
  SCHOOL: { classroom: [40, 60, 200, 90, 'Room 214 — Chemistry'], teacherdesk: [90, 160, 100, 44, "Teacher's Bench"] },
  render() {
    if (!G) return;
    const sc = SCENES[G.loc]; const cur = Game.baseScene(G.loc);
    const adj = new Set(Story.exits(G.loc));
    const school = G.phase === 'school';
    const R = school ? this.SCHOOL : this.ROOMS;
    let s = `<svg viewBox="0 0 280 ${school ? 220 : 300}" xmlns="http://www.w3.org/2000/svg">`;
    if (school) s += `<text x="140" y="24" text-anchor="middle" class="lbl">NIAGARA DISTRICT SECONDARY</text><text x="140" y="40" text-anchor="middle" class="lbl">GRADE 11 CHEMISTRY</text>`;
    else s += `<text x="8" y="13" class="lbl">UPSTAIRS</text><text x="8" y="124" class="lbl">MAIN FLOOR</text><text x="8" y="246" class="lbl">BASEMENT</text>`;
    for (const [id, [x, y, w, h, label]] of Object.entries(R)) {
      const isCur = id === cur, isAdj = adj.has(id) && !isCur;
      s += `<g ${isAdj ? `data-go="${id}"` : ''}><rect class="room ${isCur ? 'cur' : isAdj ? 'adj' : 'dim'}" x="${x}" y="${y}" width="${w}" height="${h}" rx="2"></rect>`;
      s += `<text x="${x + w / 2}" y="${id === 'upstairs' ? y + 10 : y + h / 2 + 3}" text-anchor="middle" class="${isCur ? 'cur' : ''}">${label}</text></g>`;
    }
    if (!school) { s += `<rect class="void" x="96" y="69" width="50" height="24"></rect><text x="121" y="84" text-anchor="middle" style="font-size:6px;fill:#6d604c">open to below</text>`;
      s += `<path d="M120 228 v8" stroke="#2a2119" stroke-width="3"/><text x="129" y="240" style="font-size:7px;fill:#6d604c">front door</text>`; }
    s += `</svg>`;
    const extra = Story.extraExits(G.loc) || [];
    const btns = extra.map(([id, label]) => `<button class="exit-btn" data-go="${id}">${esc(label)}</button>`).join('');
    $('#map').innerHTML = s + (btns ? `<div class="exit-list">${btns}</div>` : '');
  },
};

/* ==========================================================================
   Defaults — fallback responses
   ========================================================================== */
const Defaults = {
  hs(verb, id, hs) {
    const n = (val(hs.name) || id).toLowerCase(); const the = hs.proper ? val(hs.name) : 'the ' + n;
    switch (verb) {
      case 'examine': return `It's ${hs.proper ? val(hs.name) : 'a ' + n}. Nothing about it jumps out at you.`;
      case 'take': return hs.npc ? `You can't just pick up a person. Even with your reach.` : pick([`You can't take ${the}.`, `${cap(the)} is staying right where it is.`, `What would you even do with ${the}?`, `Noreen would notice ${the} was gone. Noreen notices everything.`]);
      case 'open': return pick([`${cap(the)} doesn't open.`, `There's no way to open ${the}.`]);
      case 'close': return pick([`${cap(the)} isn't open.`, `You can't close ${the}.`]);
      case 'operate': return pick([`You fiddle with ${the}. Nothing happens.`, `Operating ${the} accomplishes nothing.`, `You poke ${the} with one long finger. It does not respond.`]);
      case 'speak': return hs.npc ? '' : pick([`${cap(the)} has nothing to say to you. Join the club.`, `You say a few words to ${the}. Your mother would say this is a cry for help.`, `"Hey." ${cap(the)} doesn't answer.`]);
      case 'consume': return pick([`You are not going to eat ${the}.`, `Even you aren't that hungry.`, `That's not food. Even by teenage standards.`]);
      case 'hit': return pick([`You hit ${the}. Your knuckles hurt. ${cap(the)} is fine.`, `Violence won't help. Not against ${the}.`, `You give ${the} a whack. You feel exactly as angry as before.`]);
      case 'go': return hs.exit ? '' : `You can't go into ${the}.`;
      case 'leave': return `You can't leave ${the} — it was never yours.`;
    }
    return 'Nothing happens.';
  },
  leaveHs(id) { return `Pick an item from your inventory to leave here.`; },
  item(verb, id) {
    const t = theItem(id);
    switch (verb) {
      case 'open': return `${cap(t)} doesn't open.`;
      case 'close': return `${cap(t)} isn't something you close.`;
      case 'speak': return pick([`You talk to ${t}. It's a good listener, at least.`, `"I know, right?" you say to ${t}. It doesn't know.`]);
      case 'consume': return pick([`That's not edible.`, `You consider eating ${t}. You reconsider.`, `Even at your hungriest, no.`]);
      case 'hit': return `You smack ${t}. Nothing useful comes of it.`;
    }
    return `Nothing happens.`;
  },
  use(id, tgt, tIsItem) {
    const a = theItem(id);
    const hs = !tIsItem && tgt !== 'self' && Game.hsDef(tgt);
    const b = tgt === 'self' ? 'yourself' : tIsItem ? theItem(tgt) : hs && hs.npc ? val(hs.name) : 'the ' + ((hs && val(hs.name)) || tgt).toLowerCase();
    return pick([`Using ${a} on ${b} doesn't do anything.`, `You try ${a} on ${b}. Nothing interesting happens.`, `${cap(a)} and ${b} have nothing to say to each other.`, `That doesn't work.`]);
  },
  self(verb) {
    return { take: 'You pull yourself together. Briefly.', open: 'You open your heart. It closes again on its own.', close: 'You close your eyes. The problems are still there when you open them.', consume: 'You chew your lip. Not satisfying.', go: 'Go where?', leave: 'You can\'t leave yourself somewhere. You\'ve tried.', operate: 'You crack your knuckles, one by one, all ten.' }[verb] || 'Nothing happens.';
  },
};
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* Self interactions (overridden in story.js) */
const Self = {};
