/* ==========================================================================
   The Gateway 2000 — a small Windows 98 inside the game
   ========================================================================== */
'use strict';
const Computer = (() => {
  let root = null, scr = null, scale = 1, z = 20, wins = {}, timers = [], waTimer = null, waState = null, nsState = null, chatBusy = false;

  /* -------- tiny SVG icons -------- */
  const IC = {
    pc: `<svg viewBox="0 0 32 32" width="32" height="32"><rect x="4" y="3" width="24" height="18" fill="#c0c0c0" stroke="#000"/><rect x="7" y="6" width="18" height="12" fill="#008080"/><rect x="10" y="22" width="12" height="3" fill="#a0a0a0" stroke="#000"/><rect x="6" y="25" width="20" height="4" fill="#c0c0c0" stroke="#000"/></svg>`,
    bin: `<svg viewBox="0 0 32 32" width="32" height="32"><path d="M8 8h16l-2 21H10z" fill="#ddd" stroke="#000"/><path d="M11 11l1 15M16 11v15M21 11l-1 15" stroke="#888"/><rect x="6" y="5" width="20" height="3" fill="#bbb" stroke="#000"/></svg>`,
    dun: `<svg viewBox="0 0 32 32" width="32" height="32"><rect x="3" y="14" width="18" height="11" fill="#c0c0c0" stroke="#000"/><circle cx="7" cy="20" r="1.5" fill="#0c0"/><circle cx="11" cy="20" r="1.5" fill="#0c0"/><path d="M18 6c4-3 10 0 10 4l-3 2c-1-2-4-3-6-2z" fill="#333"/><path d="M22 12c2 3 2 6-1 9" stroke="#000" fill="none"/></svg>`,
    icq: `<svg viewBox="0 0 32 32" width="32" height="32">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<ellipse cx="16" cy="7" rx="4" ry="6" fill="${a % 90 ? '#2a2' : '#4c4'}" stroke="#060" transform="rotate(${a} 16 16)"/>`).join('')}<circle cx="16" cy="16" r="4" fill="#e22" stroke="#600"/></svg>`,
    ns: `<svg viewBox="0 0 32 32" width="32" height="32"><rect x="2" y="2" width="28" height="28" rx="3" fill="#003"/><path d="M3 24 Q16 18 29 24 V29 H3z" fill="#036"/><text x="16" y="22" text-anchor="middle" font-family="Georgia" font-weight="bold" font-size="20" fill="#7cf">N</text><circle cx="24" cy="8" r="1" fill="#fff"/><circle cx="8" cy="10" r=".8" fill="#fff"/></svg>`,
    wa: `<svg viewBox="0 0 32 32" width="32" height="32"><rect x="3" y="5" width="26" height="22" rx="3" fill="#2a2a3e" stroke="#000"/><path d="M18 7l-7 11h5l-3 8 9-12h-5l3-7z" fill="#fc0" stroke="#850"/></svg>`,
    np: `<svg viewBox="0 0 32 32" width="32" height="32"><rect x="6" y="3" width="20" height="26" fill="#fff" stroke="#000"/><rect x="6" y="3" width="20" height="4" fill="#00a"/><path d="M9 11h14M9 14h14M9 17h11M9 20h14M9 23h8" stroke="#888"/></svg>`,
    ms: `<svg viewBox="0 0 32 32" width="32" height="32"><rect x="2" y="2" width="28" height="28" fill="#c0c0c0" stroke="#808080"/><circle cx="16" cy="16" r="7" fill="#000"/><path d="M16 5v22M5 16h22M8 8l16 16M24 8L8 24" stroke="#000" stroke-width="2"/><rect x="12" y="12" width="3" height="3" fill="#fff"/></svg>`,
    flop: `<svg viewBox="0 0 32 32" width="32" height="32"><path d="M4 4h21l3 3v21H4z" fill="#222" stroke="#000"/><rect x="9" y="4" width="13" height="9" fill="#aaa"/><rect x="17" y="5" width="3" height="7" fill="#222"/><rect x="8" y="17" width="16" height="10" fill="#fff"/></svg>`,
    hm: `<svg viewBox="0 0 32 32" width="32" height="32"><rect x="3" y="7" width="26" height="18" fill="#ffd" stroke="#000"/><path d="M3 7l13 10 13-10" fill="none" stroke="#000"/><circle cx="25" cy="8" r="5" fill="#f60" stroke="#900"/><text x="25" y="11" text-anchor="middle" font-size="8" font-weight="bold" fill="#fff">!</text></svg>`,
  };

  /* -------- state helpers -------- */
  const online = () => !!(G && G.f.online && G.f.onlineDay === G.day && G.phase !== 'school');
  function clock() {
    const base = G.phase === 'morning' ? 7 * 60 + 8 : G.phase === 'day' ? 13 * 60 + 40 : G.day === 0 ? 21 * 60 + 9 : 19 * 60 + 50;
    const m = Math.min(base + G.dayTurns * 3, 23 * 60 + 58); let h = Math.floor(m / 60), mm = m % 60; const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    return `${h}:${String(mm).padStart(2, '0')} ${ap}`;
  }
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

  /* -------- open / close -------- */
  function open() {
    if (!G) return;
    root = $('#computer'); root.classList.remove('hidden'); root.innerHTML = '';
    Game.toggleHotspots(false);
    const bez = document.createElement('div'); bez.className = 'crt-bezel';
    bez.innerHTML = `<div class="crt-glass"><div class="w98"></div></div><div class="crt-led"></div>`;
    root.appendChild(bez);
    const up = document.createElement('button'); up.className = 'stand-up'; up.textContent = '⏏ Stand up (Esc)'; up.onclick = () => close(); root.appendChild(up);
    scr = bez.querySelector('.w98'); wins = {};
    fit(); window.addEventListener('resize', fit);
    buildDesktop();
    if (!G.f.sawBoot) { G.f.sawBoot = 1; sfx('startup'); }
    if (online()) later(() => greetICQ(), 900);
    if (G.f.printWaiting) toast('A page is waiting in the printer tray.');
    say(pick([`You sit down at the Gateway. The CRT hums. The world shrinks to 17 inches.`, `You pull the chair in. The chair sinks an inch. The monitor glows.`, `You sit at the computer. Home.`]));
  }
  function close(silent) {
    timers.forEach(clearTimeout); timers = []; stopWinamp(true);
    window.removeEventListener('resize', fit);
    const r = $('#computer'); if (r) { r.classList.add('hidden'); r.innerHTML = ''; }
    scr = null; wins = {};
    if (!silent && G && !Game.ended) { say(online() ? `You stand up. The modem lights keep blinking. You're still online — tying up the phone line.` : `You stand up from the computer.`); Game.renderAll(); Game.autosave(); }
  }
  function fit() {
    if (!root) return; const vp = $('#viewport').getBoundingClientRect();
    const gh = Math.min(vp.height * 0.8, vp.width * 0.82 * 0.75); const gw = gh * 4 / 3;
    scale = gw / 640;
    const glass = root.querySelector('.crt-glass'); glass.style.width = gw + 'px'; glass.style.height = gh + 'px';
    scr.style.transform = `scale(${scale})`;
  }
  function toast(t) { Game.toast(t); }

  /* -------- desktop -------- */
  function buildDesktop() {
    scr.innerHTML = `
      <div class="icons">
        ${[['mycomp', IC.pc, 'My Computer'], ['dun', IC.dun, 'Connect to NiagaraNet'], ['ns', IC.ns, 'Netscape Navigator'], ['icq', IC.icq, 'ICQ'], ['hotmail', IC.hm, 'Hotmail'], ['bin', IC.bin, 'Recycle Bin'],
           ['winamp', IC.wa, 'Winamp'], ['notepad', IC.np, 'Notepad'], ['mines', IC.ms, 'Minesweeper']].map(([id, g, l]) => `<div class="ico" data-app="${id}"><div class="g">${g}</div><span>${l}</span></div>`).join('')}
      </div>
      <div class="taskbar"><button class="btn start"><i></i>Start</button><div class="tasks"></div><div class="tray"><div class="modem${online() ? ' on' : ''}" title="Modem"><b></b><b></b></div><div class="flower${online() ? '' : ' off'}" title="ICQ"></div><span class="clk">${clock()}</span></div></div>`;
    // single-click launches (it's a game, not a test of double-click skill)
    scr.querySelectorAll('.ico').forEach(el => el.onclick = () => { scr.querySelectorAll('.ico').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); launch(el.dataset.app); });
    scr.querySelector('.start').onclick = e => { e.stopPropagation(); toggleStart(); };
    scr.querySelector('.flower').onclick = () => launch('icq');
    scr.addEventListener('mousedown', e => { if (!e.target.closest('.startmenu') && !e.target.closest('.start')) { const m = scr.querySelector('.startmenu'); if (m) m.remove(); } });
  }
  function refreshTray() {
    if (!scr) return; const m = scr.querySelector('.tray .modem'); if (m) m.classList.toggle('on', online());
    const f = scr.querySelector('.tray .flower'); if (f) f.classList.toggle('off', !online());
    const c = scr.querySelector('.clk'); if (c) c.textContent = clock();
  }
  function toggleStart() {
    const ex = scr.querySelector('.startmenu'); if (ex) { ex.remove(); return; }
    const m = document.createElement('div'); m.className = 'startmenu';
    m.innerHTML = `<div class="side"><b>Windows</b>98</div><ul>
      <li data-a="ns">${IC.ns.replace(/32/g, '16')} Netscape Navigator</li><li data-a="icq">${IC.icq.replace(/32/g, '16')} ICQ</li><li data-a="winamp">${IC.wa.replace(/32/g, '16')} Winamp</li>
      <li data-a="notepad">${IC.np.replace(/32/g, '16')} Notepad</li><li data-a="mines">${IC.ms.replace(/32/g, '16')} Minesweeper</li><li data-a="mycomp">${IC.pc.replace(/32/g, '16')} My Computer</li>
      <li class="sep"></li><li data-a="help">❔ Help</li><li data-a="run">▶ Run...</li><li class="sep"></li><li data-a="shutdown">⏻ Shut Down...</li></ul>`;
    scr.appendChild(m);
    m.querySelectorAll('li[data-a]').forEach(li => li.onclick = () => { m.remove(); const a = li.dataset.a; if (a === 'shutdown') return shutdown(); if (a === 'help') return msgbox('Windows Help', 'ℹ️', 'To get started, click the Start button. For help with your mother, Windows Help is not the right program.'); if (a === 'run') return msgbox('Run', '▶', 'Type the name of a program, folder, or document, and Windows will open it for you.<br><br>You type "apology.exe". Windows cannot find "apology.exe". Make sure you typed the name correctly, and then try again.'); launch(a); });
  }
  function shutdown() {
    sfx('ding');
    const b = document.createElement('div'); b.className = 'boot safe'; b.textContent = "It's now safe to turn off your computer."; scr.appendChild(b);
    later(() => close(), 1500);
  }
  function msgbox(title, icon, html, btns = [['OK', null]]) {
    const id = 'msg' + Math.random().toString(36).slice(2, 6);
    const w = makeWin(id, title, { w: 300, x: 170, y: 150 });
    w.body.innerHTML = `<div class="dlgbody"><div class="row" style="align-items:flex-start"><div class="msgicon">${icon}</div><div>${html}</div></div><div class="row" style="justify-content:center">${btns.map(([t], i) => `<button class="btn" data-i="${i}" style="min-width:70px">${t}</button>`).join('')}</div></div>`;
    w.body.querySelectorAll('button[data-i]').forEach(b => b.onclick = () => { const fn = btns[b.dataset.i][1]; closeWin(id); if (fn) fn(); });
    sfx(icon === '⚠️' || icon === '⛔' ? 'error' : 'ding');
    return w;
  }

  /* -------- window manager -------- */
  function makeWin(id, title, { w = 400, h, x = 60, y = 40, cls = '' } = {}) {
    if (wins[id]) { focus(id); return wins[id]; }
    const el = document.createElement('div'); el.className = 'win ' + cls; el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.width = w + 'px'; if (h) el.style.height = h + 'px';
    el.innerHTML = `<div class="tbar"><span class="tt">${title}</span><button class="btn x" title="Close">×</button></div><div class="body"></div>`;
    scr.appendChild(el);
    const rec = { el, body: el.querySelector('.body'), title: el.querySelector('.tt'), id };
    wins[id] = rec;
    el.querySelector('.x').onclick = (e) => { e.stopPropagation(); closeWin(id); };
    el.addEventListener('mousedown', () => focus(id));
    const tb = el.querySelector('.tbar');
    tb.addEventListener('mousedown', e => {
      if (e.target.closest('.x')) return;
      const sx = e.clientX, sy = e.clientY, ox = el.offsetLeft, oy = el.offsetTop;
      const mv = ev => { el.style.left = clamp(ox + (ev.clientX - sx) / scale, -w + 60, 600) + 'px'; el.style.top = clamp(oy + (ev.clientY - sy) / scale, 0, 440) + 'px'; };
      const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
      window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
    });
    focus(id); renderTasks();
    return rec;
  }
  function focus(id) { const r = wins[id]; if (!r) return; Object.values(wins).forEach(w => w.el.classList.remove('active')); r.el.classList.add('active'); r.el.style.zIndex = ++z; renderTasks(); }
  function closeWin(id) { const r = wins[id]; if (!r) return; if (r.onClose) r.onClose(); r.el.remove(); delete wins[id]; renderTasks(); }
  function renderTasks() {
    if (!scr) return; const t = scr.querySelector('.tasks'); if (!t) return;
    t.innerHTML = Object.values(wins).filter(w => !w.id.startsWith('msg')).map(w => `<button class="btn task${w.el.classList.contains('active') ? ' down' : ''}" data-w="${w.id}">${w.title.textContent}</button>`).join('');
    t.querySelectorAll('.task').forEach(b => b.onclick = () => focus(b.dataset.w));
  }

  /* -------- apps -------- */
  function launch(app) {
    sfx('click');
    switch (app) {
      case 'dun': return appDialup();
      case 'icq': return appICQ();
      case 'ns': return appNetscape('home');
      case 'hotmail': return appNetscape('hotmail');
      case 'winamp': return appWinamp();
      case 'notepad': return appNotepad();
      case 'mines': return appMines();
      case 'mycomp': return appMyComputer();
      case 'bin': return appBin();
    }
  }

  /* ----- Dial-Up Networking ----- */
  function appDialup() {
    const w = makeWin('dun', online() ? 'Connected to NiagaraNet' : 'Connect To', { w: 300, x: 150, y: 90 });
    if (online()) {
      w.body.innerHTML = `<div class="dlgbody"><div class="row">${IC.dun}<div><b>Connected to NiagaraNet</b><br>at 33,600 bps<br>Duration: 000:${String(12 + (G.f.onlineTurns || 0) * 3).padStart(2, '0')}:41</div></div><div class="row" style="justify-content:flex-end"><button class="btn" data-a="dis">Disconnect</button><button class="btn" data-a="ok">OK</button></div></div>`;
      w.body.querySelector('[data-a=dis]').onclick = () => { hangup(); closeWin('dun'); };
      w.body.querySelector('[data-a=ok]').onclick = () => closeWin('dun');
      return;
    }
    w.body.innerHTML = `<div class="dlgbody"><div class="row">${IC.dun}<b style="font-size:13px">NiagaraNet</b></div>
      <div class="row"><span style="width:80px">User name:</span><input class="field" value="comrade_dave" style="flex:1"></div>
      <div class="row"><span style="width:80px">Password:</span><input class="field" type="password" value="trotsky99" style="flex:1"></div>
      <div class="row"><input type="checkbox" checked> Save password</div>
      <div class="row"><span style="width:80px">Phone number:</span><input class="field" value="468-9900" style="flex:1"></div>
      <div class="row" style="justify-content:flex-end"><button class="btn" data-a="c" style="min-width:70px">Connect</button><button class="btn" data-a="x" style="min-width:70px">Cancel</button></div></div>`;
    w.body.querySelector('[data-a=x]').onclick = () => closeWin('dun');
    w.body.querySelector('[data-a=c]').onclick = () => dial();
  }
  function dial() {
    if (G.phase === 'morning' && !isWeekend()) { closeWin('dun'); return msgbox('NiagaraNet', '⏰', `The bus comes in eleven minutes. Your mother's voice from the kitchen: "Don't you DARE dial up."<br><br>You don't dare.`); }
    if (G.day === 0 && F('cordYanked')) { closeWin('dun'); Story.tick(1); say(`You click Connect. Nothing. Then you remember: the cord. She took the cord.`); return msgbox('Dial-Up Networking', '⛔', 'Error 680: There is no dial tone. Make sure your modem is connected to the phone line properly.'); }
    if (Story.noreenOnPhone()) {
      closeWin('dun'); sfx('dtmf'); rel('noreen', -1);
      ev(`The modem picks up the line — and you hear, through the tiny speaker, your mother's voice mid-sentence, and then: "DAVID! I'M ON THE PHONE!" You cancel so fast you nearly break the mouse.`);
      return msgbox('Dial-Up Networking', '⛔', 'Error 680: There is no dial tone.<br><br>(There is, however, a mother.)');
    }
    const w = wins.dun; w.title.textContent = 'Connecting to NiagaraNet';
    w.body.innerHTML = `<div class="dlgbody"><div class="row">${IC.dun}<div class="st" style="flex:1">Status: Dialing...</div></div><div class="row" style="justify-content:flex-end"><button class="btn" data-a="x">Cancel</button></div></div>`;
    let cancelled = false; w.body.querySelector('[data-a=x]').onclick = () => { cancelled = true; closeWin('dun'); };
    sfx('modem');
    const st = () => w.body.querySelector('.st');
    later(() => { if (!cancelled && st()) st().textContent = 'Status: Verifying user name and password...'; }, 5200);
    later(() => { if (!cancelled && st()) st().textContent = 'Status: Logging on to network...'; }, 7400);
    later(() => {
      if (cancelled || !scr) return;
      G.f.online = true; G.f.onlineDay = G.day; G.f.onlineTurns = 0; closeWin('dun'); refreshTray(); sfx('ding');
      say(`<i>KSSSHHHHHH-BWEEEEE-DING-DING-KSSSHHHH.</i> The Zoltrix handshakes with NiagaraNet at a blistering 33.6 kilobits per second. You are on the internet. The house's only phone line is now yours.`);
      Story.tick(2); toast('Connected at 33,600 bps');
      later(() => greetICQ(), 1600);
    }, 8600);
  }
  function hangup(silent) {
    if (!G) return;
    const was = online(); G.f.online = false; refreshTray();
    if (wins.icq) renderICQ(); if (wins.chat) closeWin('chat');
    if (was && !silent) { say(`You disconnect. The phone line is free again. Somewhere in the house, a dial tone becomes available.`); sfx('click'); }
  }

  /* ----- ICQ ----- */
  function appICQ() {
    const w = makeWin('icq', 'ICQ', { w: 150, h: 260, x: 470, y: 20 });
    renderICQ();
  }
  function renderICQ() {
    const w = wins.icq; if (!w) return;
    if (!online()) { w.body.innerHTML = `<div class="icq-list sunk"><div style="padding:8px;color:#800">Not connected to the Internet.<br><br>Use <b>Connect to NiagaraNet</b> to dial up.</div></div><div class="status">Offline</div>`; return; }
    const g = Story.gregOnline();
    w.body.innerHTML = `<div class="icq-list sunk">
      <div class="icq-grp">Online</div>${g ? `<div class="icq-c${G.f.icqUnread ? ' blink' : ''}" data-c="greg"><span class="st"></span>Gr3g</div>` : ''}
      <div class="icq-c" data-c="jen"><span class="st away"></span>Jen K. (Away)</div>
      <div class="icq-grp">Offline</div>${g ? '' : `<div class="icq-c" data-c="greg"><span class="st off"></span>Gr3g</div>`}
      <div class="icq-c" data-c="tyler"><span class="st off"></span>tyler_sk8</div><div class="icq-c" data-c="mike"><span class="st off"></span>Mike2K</div>
      <div class="icq-c" data-c="sys"><span class="st off"></span>ICQ System</div></div>
      <div class="status">comrade_dave #41729083</div>`;
    w.body.querySelectorAll('.icq-c').forEach(c => c.onclick = () => openContact(c.dataset.c));
  }
  function openContact(c) {
    if (c === 'jen') return msgbox('Jen K. — Away Message', '💬', `<i>"at the mall w/ steph ~*~ if this is about the chem homework ask GREG lol ~*~ 'i want it that way' ~*~"</i>`);
    if (c === 'tyler') return msgbox('tyler_sk8', '💬', 'tyler_sk8 is offline. Last seen: 3 days ago. Profile: "skate or die. mostly die."');
    if (c === 'mike') return msgbox('Mike2K', '💬', 'Mike2K is offline. Profile: "Y2K IS REAL. STOCK UP. ALSO GO LEAFS."');
    if (c === 'sys') return msgbox('ICQ System Message', 'ℹ️', 'Welcome to ICQ 99a! Did you know? ICQ stands for "I Seek You." 30 million users and counting.');
    openChat();
  }
  function greetICQ() {
    if (!scr || !online() || !Story.gregOnline()) return;
    if (G.f.icqGreetDay === G.day) return;
    G.f.icqGreetDay = G.day; G.f.icqUnread = 1; sfx('icq');
    const f = scr.querySelector('.tray .flower'); if (f) f.classList.add('blink');
    toast('ICQ: Message from Gr3g'); renderICQ();
    G.f.icqPending = ICQ.greeting();
  }
  function openChat() {
    const w = makeWin('chat', 'Gr3g — Message Session', { w: 330, h: 300, x: 130, y: 60 });
    G.f.icqUnread = 0; const f = scr.querySelector('.tray .flower'); if (f) f.classList.remove('blink'); renderICQ();
    w.body.innerHTML = `<div class="chat sunk"></div><div class="replies"></div>`;
    const log = G.f.icqLog || (G.f.icqLog = []);
    log.slice(-40).forEach(([who, t]) => appendChat(who, t, true));
    if (!online()) { appendChat('sys', 'You are not connected. Messages cannot be sent.'); return; }
    if (!Story.gregOnline()) { appendChat('sys', 'Gr3g is offline. (He\'s probably asleep, or at school, like a normal person.)'); return; }
    if (G.f.icqPending) { const lines = G.f.icqPending; G.f.icqPending = null; gregSays(lines, () => showReplies()); }
    else showReplies();
  }
  function appendChat(who, t, restoring) {
    const w = wins.chat; if (!w) return; const c = w.body.querySelector('.chat');
    const p = document.createElement('p');
    if (who === 'sys') { p.className = 'sys'; p.textContent = t; }
    else { p.className = who === 'me' ? 'me' : 'them'; p.innerHTML = `<span class="who">${who === 'me' ? 'comrade_dave' : 'Gr3g'}:</span> ${esc(t)}`; }
    c.appendChild(p); c.scrollTop = c.scrollHeight;
    if (!restoring && who !== 'sys') { const log = G.f.icqLog || (G.f.icqLog = []); log.push([who, t]); if (log.length > 80) log.splice(0, log.length - 80); }
  }
  function gregSays(lines, done) {
    lines = (lines || []).slice(); chatBusy = true;
    const w = wins.chat; if (!w) return; const rep = w.body.querySelector('.replies'); rep.innerHTML = '';
    const next = () => {
      if (!wins.chat) { chatBusy = false; return; }
      if (!lines.length) { chatBusy = false; done && done(); return; }
      const t = lines.shift();
      const c = w.body.querySelector('.chat'); const ty = document.createElement('p'); ty.className = 'typing'; ty.textContent = 'Gr3g is typing...'; c.appendChild(ty); c.scrollTop = c.scrollHeight;
      later(() => { ty.remove(); appendChat('greg', t); sfx('icq'); later(next, 350); }, 500 + Math.min(1600, t.length * 22));
    };
    next();
  }
  function showReplies() {
    const w = wins.chat; if (!w) return; const rep = w.body.querySelector('.replies'); rep.innerHTML = '';
    const opts = ICQ.options();
    opts.forEach(o => { const b = document.createElement('button'); b.className = 'btn'; b.textContent = o.t; b.onclick = () => {
      if (chatBusy) return; appendChat('me', o.t); sfx('icqsend'); rep.innerHTML = ''; Story.tick(1); refreshTray();
      const res = o.do ? o.do() : null; if (Game.ended) return;
      if (o.bye) { gregSays(res || ['ok ttyl'], () => { appendChat('sys', 'Gr3g has gone idle.'); }); return; }
      gregSays(res || [], () => showReplies());
    }; rep.appendChild(b); });
  }

  /* ----- Netscape ----- */
  function appNetscape(start) {
    const w = makeWin('ns', 'Netscape', { w: 520, h: 400, x: 60, y: 14 });
    if (!w.built) {
      w.built = true; nsState = { hist: [], idx: -1 };
      w.body.innerHTML = `<div class="menubar"><span>File</span><span>Edit</span><span>View</span><span>Go</span><span>Communicator</span><span>Help</span></div>
        <div class="ns-tools"><button class="btn" data-n="back"><b>◄</b>Back</button><button class="btn" data-n="fwd"><b>►</b>Forward</button><button class="btn" data-n="reload"><b>↻</b>Reload</button><button class="btn" data-n="home"><b>⌂</b>Home</button><button class="btn" data-n="search"><b>⌕</b>Search</button><button class="btn" data-n="stop"><b>✖</b>Stop</button><div class="ns-logo">N</div></div>
        <div class="ns-loc"><b>Location:</b><input class="field"></div>
        <div class="ns-bm">${[['home', 'NiagaraNet'], ['hotmail', 'Hotmail'], ['av', 'AltaVista'], ['geo', 'My Page'], ['jeeves', 'Ask Jeeves']].map(([p, l]) => `<button class="btn" data-p="${p}">${l}</button>`).join('')}</div>
        <div class="page sunk"></div><div class="status">Document: Done.</div>`;
      w.body.querySelector('[data-n=back]').onclick = () => { if (nsState.idx > 0) { nsState.idx--; render(nsState.hist[nsState.idx], true); } };
      w.body.querySelector('[data-n=fwd]').onclick = () => { if (nsState.idx < nsState.hist.length - 1) { nsState.idx++; render(nsState.hist[nsState.idx], true); } };
      w.body.querySelector('[data-n=reload]').onclick = () => render(nsState.hist[nsState.idx], true);
      w.body.querySelector('[data-n=home]').onclick = () => nav('home');
      w.body.querySelector('[data-n=search]').onclick = () => nav('av');
      w.body.querySelector('[data-n=stop]').onclick = () => { };
      w.body.querySelectorAll('[data-p]').forEach(b => b.onclick = () => nav(b.dataset.p));
      const loc = w.body.querySelector('.ns-loc input');
      loc.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') nav(WEB.resolve(loc.value)); });
      w.body.querySelector('.page').addEventListener('click', e => {
        const a = e.target.closest('[data-go]'); if (a) { e.preventDefault(); a.classList.add('v'); nav(a.dataset.go); return; }
        const m = e.target.closest('[data-mail]'); if (m) { nav('mail:' + m.dataset.mail); return; }
        const s = e.target.closest('[data-search]'); if (s) { const inp = w.body.querySelector('.page input.q'); nav('q:' + (inp ? inp.value : '')); return; }
      });
      w.body.querySelector('.page').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter' && e.target.matches('input.q')) nav('q:' + e.target.value); });
    }
    nav(start);
  }
  function nav(id) {
    if (!id) return; nsState.hist = nsState.hist.slice(0, nsState.idx + 1); nsState.hist.push(id); nsState.idx++; render(id);
  }
  function render(id, quick) {
    const w = wins.ns; if (!w) return;
    const pg = w.body.querySelector('.page'), st = w.body.querySelector('.status'), logo = w.body.querySelector('.ns-logo'), loc = w.body.querySelector('.ns-loc input');
    const P = WEB.page(id);
    loc.value = P.url; w.title.textContent = `Netscape - [${P.title}]`; renderTasks();
    if (!online() && !P.local) {
      pg.className = 'page sunk'; pg.innerHTML = `<div class="err"><p><b>Netscape is unable to locate the server ${esc(P.host || 'www.niagara.net')}.</b></p><p>The server does not have a DNS entry. Check the server name in the Location (URL) and try again.</p><p><i>(You are not connected to the Internet. Double-click <b>Connect to NiagaraNet</b> on the desktop.)</i></p></div>`;
      st.textContent = 'Document: Done.'; sfx('error'); return;
    }
    logo.classList.add('busy'); st.textContent = `Contacting host: ${P.host || 'www.niagara.net'}...`; pg.style.opacity = .3;
    later(() => {
      st.textContent = 'Host contacted. Waiting for reply...';
      later(() => {
        logo.classList.remove('busy'); pg.style.opacity = 1; pg.className = 'page sunk' + (P.dark ? ' dark' : '');
        pg.innerHTML = P.html(); pg.scrollTop = 0; st.textContent = 'Document: Done.';
        if (P.onView) P.onView();
        Story.tick(1); refreshTray();
        const q = pg.querySelector('input.q'); if (q) q.focus();
      }, quick ? 120 : 300 + Math.random() * 500);
    }, quick ? 80 : 250 + Math.random() * 400);
  }

  /* ----- Winamp ----- */
  const TRACKS = [['internationale', 'Pierre De Geyter - L\'Internationale (MIDI remix).mid', 96], ['comrade', 'comrade_dave - Red Dawn (tracker mix).mod', 120], ['oh', 'Calixa Lavallee - O Canada (8-bit).mid', 70], ['napster', 'Our Lady Peace - Superman\'s Dead.mp3', 0]];
  function appWinamp() {
    const w = makeWin('winamp', 'WINAMP', { w: 280, x: 330, y: 230, cls: 'winamp' });
    if (w.built) return; w.built = true;
    waState = waState || { i: 0, playing: false, t: 0, vol: 70 };
    w.body.innerHTML = `<div class="wa-disp"><div class="wa-time">00:00</div><div class="wa-title">Winamp 2.22 — It really whips the llama's ass.</div><div class="wa-viz">${'<i></i>'.repeat(16)}</div></div>
      <div class="wa-ctl"><button class="btn" data-a="prev">⏮</button><button class="btn" data-a="play">▶</button><button class="btn" data-a="pause">⏸</button><button class="btn" data-a="stop">⏹</button><button class="btn" data-a="next">⏭</button>
      <label style="margin-left:auto">VOL <input type="range" min="0" max="100" value="${waState.vol}"></label></div>
      <div class="wa-pl">${TRACKS.map((t, i) => `<div data-i="${i}">${i + 1}. ${t[1]}</div>`).join('')}</div>`;
    w.onClose = () => { stopWinamp(); wins.winamp && (wins.winamp.built = false); };
    const q = s => w.body.querySelector(s);
    q('[data-a=play]').onclick = () => playTrack(waState.i);
    q('[data-a=pause]').onclick = () => stopWinamp();
    q('[data-a=stop]').onclick = () => { stopWinamp(); waState.t = 0; updWA(); };
    q('[data-a=next]').onclick = () => playTrack((waState.i + 1) % TRACKS.length);
    q('[data-a=prev]').onclick = () => playTrack((waState.i + TRACKS.length - 1) % TRACKS.length);
    q('input[type=range]').oninput = e => { waState.vol = +e.target.value; if (waState.playing) loudCheck(); };
    w.body.querySelectorAll('.wa-pl div').forEach(d => d.onclick = () => playTrack(+d.dataset.i));
    updWA();
  }
  function playTrack(i) {
    waState.i = i; const t = TRACKS[i];
    if (t[0] === 'napster') { stopWinamp(); updWA(); return msgbox('Winamp', '⚠️', `Error: file is corrupted or incomplete.<br><br>(Napster download stopped at 2.1 of 4.3 MB when your mother picked up the phone on October 3rd.)`); }
    waState.playing = true; waState.t = 0; Audio99.music(t[0]); updWA();
    clearInterval(waTimer); waTimer = setInterval(() => { waState.t++; updWA(true); }, 1000);
    loudCheck();
  }
  function stopWinamp(silent) {
    clearInterval(waTimer); waTimer = null;
    if (waState && waState.playing) { waState.playing = false; if (!silent) updWA(); Game.music(); if (silent) Game.music(); }
  }
  function updWA(tick) {
    const w = wins.winamp; if (!w) return;
    const t = TRACKS[waState.i];
    w.body.querySelector('.wa-time').textContent = `${String(Math.floor(waState.t / 60)).padStart(2, '0')}:${String(waState.t % 60).padStart(2, '0')}`;
    w.body.querySelector('.wa-title').textContent = waState.playing ? `${waState.i + 1}. ${t[1]} *** ` : 'Winamp 2.22 — stopped';
    w.body.querySelectorAll('.wa-pl div').forEach((d, i) => d.classList.toggle('cur', i === waState.i));
    w.body.querySelectorAll('.wa-viz i').forEach(b => b.style.height = waState.playing ? (10 + Math.random() * 90 * waState.vol / 100) + '%' : '2%');
    if (tick && waState.playing && waState.t % 2 === 0) { /* animate */ }
  }
  function loudCheck() {
    if (!waState.playing || waState.vol < 90) return;
    if (waState.i === 0) internationale(); else if (once('loudOther_' + G.day)) { sfx('sub'); say(`You crank the volume. The Zoltrix subwoofer distorts gloriously. The windows buzz in their frames.`); }
  }
  function internationale() {
    if (G.f.intlDay === G.day && G.f.intlTurn === G.turns) return;
    G.f.intlDay = G.day; G.f.intlTurn = G.turns;
    sfx('sub');
    const home = Story.where('don') || Story.where('noreen');
    const night = G.phase !== 'day';
    if (!home) { say(`You blast <i>L'Internationale</i> at full volume through the Zoltrix. The house is empty. The revolution has no audience. Shelby, outside, howls along.`); return; }
    const n = inc('intlCount');
    if (n === 1) { ev(`<i>L'Internationale</i>, at full volume, through a subwoofer with its bass knob taped to MAX. The chandelier sways. A picture frame falls somewhere. ${Story.where('don') ? `From downstairs, your father's voice, very calm: "<b>Stretch.</b> One more time and the State seizes the means of production."` : `From downstairs, your mother: "<b>DAVID!</b> Your father will hear about this!"`}`); rel(Story.where('don') ? 'don' : 'noreen', -1); return; }
    if (Story.where('don') && night) { stopWinamp(true); ending('seized'); return; }
    rel('noreen', -1); ev(`Again. The whole house shakes. ${Story.where('don') ? 'Don yells from the basement. It\'s daytime, so he only yells.' : 'Noreen bangs on the ceiling with a broom. "When your FATHER gets home—"'}`);
  }

  /* ----- Notepad ----- */
  function appNotepad(opts = {}) {
    const id = opts.id || 'notepad';
    const w = makeWin(id, `${opts.name || (G.f.letterDraft ? 'Letter to Mom.txt' : 'Untitled')} - Notepad`, { w: 360, h: 290, x: 110 + (opts.id ? 20 : 0), y: 60 });
    if (w.built) return; w.built = true;
    w.kind = opts.kind || 'letter';
    w.body.innerHTML = `<div class="menubar"><span data-m="file">File</span><span>Edit</span><span>Search</span><span>Help</span></div><textarea class="field" style="flex:1" spellcheck="false"${opts.ro ? ' readonly' : ''}></textarea><div class="status">${opts.ro ? 'Read-only' : 'Write whatever you can\'t say out loud. File → Print sends it to the DeskJet.'}</div>`;
    const ta = w.body.querySelector('textarea');
    ta.value = opts.text != null ? opts.text : (G.f.letterDraft != null ? G.f.letterDraft : 'Dear Mom,\n\n');
    ta.addEventListener('keydown', e => e.stopPropagation());
    if (!opts.ro) ta.addEventListener('input', () => { G.f.letterDraft = ta.value; if (Math.random() < 0.08) sfx('type'); });
    w.body.querySelector('[data-m=file]').onclick = e => {
      e.stopPropagation(); const sp = e.currentTarget; const ex = sp.querySelector('.dd'); if (ex) { ex.remove(); return; }
      const dd = document.createElement('div'); dd.className = 'dd'; dd.innerHTML = `<div data-f="new">New</div><div data-f="print">Print</div><div data-f="exit">Exit</div>`; sp.appendChild(dd);
      dd.querySelectorAll('[data-f]').forEach(d => d.onclick = ev2 => { ev2.stopPropagation(); dd.remove(); const f = d.dataset.f;
        if (f === 'new') { if (!opts.ro) { ta.value = ''; G.f.letterDraft = ''; } }
        if (f === 'exit') closeWin(id);
        if (f === 'print') printDoc(ta.value, w.kind); });
    };
    setTimeout(() => { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }, 50);
  }
  function printDoc(text, kind) {
    if (text.replace(/dear mom,?/i, '').trim().length < 8) return msgbox('Notepad', '⚠️', 'There\'s nothing much to print yet. A blank apology is just a piece of paper.');
    if (F('printWaiting')) return msgbox('HP DeskJet 682C', '⚠️', 'There is already a page in the output tray. Take it first.');
    if (kind === 'manifesto') { sfx('print'); say(`The DeskJet prints your manifesto. You read it as it comes out. "Article 3: The Mother Shall Knock." You fold it up and put it in the recycling bin, where it belongs.`); return; }
    if (kind === 'notes') { sfx('print'); setF('gregNotes'); say(`You print Greg's notes. Four pages, colour-coded, though the DeskJet renders every colour as green. You'll actually read these.`); return; }
    G.f.printKind = kind === 'poem' ? 'poem' : 'letter'; if (kind !== 'poem') G.f.letterText = text; G.f.printWaiting = true; G.f.printed = true;
    sfx('print');
    msgbox('Printing', '🖨', `Printing "${kind === 'poem' ? 'POEM93.TXT' : 'Letter to Mom.txt'}" on HP DeskJet 682C on LPT1:...`);
    say(kind === 'poem' ? `The DeskJet whirs and buzzes and prints your Grade 6 poem in Courier, faintly green. It's waiting in the printer tray.` : `The DeskJet wakes up with a grinding sound, thinks about it, and slowly feeds a page through. Your words come out one line at a time, faintly green. It's waiting in the printer tray.`);
    Story.tick(1);
  }

  /* ----- Minesweeper ----- */
  function appMines() {
    const w = makeWin('mines', 'Minesweeper', { w: 186, x: 220, y: 110 });
    let grid, open, flag, dead, won, started, t0, tim;
    const N = 9, M = 10;
    const reset = () => { grid = Array(N * N).fill(0); open = Array(N * N).fill(false); flag = Array(N * N).fill(false); dead = won = started = false; clearInterval(tim); draw(); };
    const nb = i => { const x = i % N, y = Math.floor(i / N), r = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const X = x + dx, Y = y + dy; if ((dx || dy) && X >= 0 && Y >= 0 && X < N && Y < N) r.push(Y * N + X); } return r; };
    const plant = safe => { let k = 0; while (k < M) { const i = Math.floor(Math.random() * N * N); if (i !== safe && grid[i] !== -1 && !nb(safe).includes(i)) { grid[i] = -1; k++; } } for (let i = 0; i < N * N; i++) if (grid[i] !== -1) grid[i] = nb(i).filter(j => grid[j] === -1).length; };
    const flood = i => { if (open[i] || flag[i]) return; open[i] = true; if (grid[i] === 0) nb(i).forEach(flood); };
    const draw = () => {
      const left = M - flag.filter(Boolean).length; const secs = started && !dead && !won ? Math.min(999, Math.floor((Date.now() - t0) / 1000)) : (w.secs || 0);
      w.body.innerHTML = `<div class="sunk" style="background:#c0c0c0;padding:5px"><div class="ms-top sunk" style="background:#c0c0c0"><span class="ms-led">${String(left).padStart(3, '0')}</span><button class="btn ms-face">${dead ? '😵' : won ? '😎' : '🙂'}</button><span class="ms-led">${String(secs).padStart(3, '0')}</span></div>
        <div class="ms-grid sunk" style="padding:0">${grid.map((v, i) => `<div data-i="${i}" class="${open[i] ? 'o' : ''}${open[i] && v === -1 ? ' boom' : ''}" style="color:${['', '#00f', '#080', '#f00', '#008', '#800', '#088', '#000', '#888'][v] || '#000'}">${open[i] ? (v === -1 ? '💣' : v || '') : flag[i] ? '🚩' : ''}</div>`).join('')}</div></div>`;
      w.body.querySelector('.ms-face').onclick = reset;
      w.body.querySelectorAll('.ms-grid div').forEach(c => {
        c.onclick = () => { if (dead || won) return; const i = +c.dataset.i; if (flag[i]) return; if (!started) { started = true; t0 = Date.now(); plant(i); tim = setInterval(() => { w.secs = Math.floor((Date.now() - t0) / 1000); if (wins.mines) draw(); else clearInterval(tim); }, 1000); }
          if (grid[i] === -1) { dead = true; open = open.map((o, j) => o || grid[j] === -1); clearInterval(tim); sfx('kaboom'); draw(); return; }
          flood(i); if (open.filter(Boolean).length === N * N - M) { won = true; clearInterval(tim); sfx('ding'); if (once('msWin')) say(`You win a game of Minesweeper in ${w.secs || 0} seconds. Nobody will ever know. This is the purest kind of victory.`); } draw(); };
        c.oncontextmenu = e => { e.preventDefault(); e.stopPropagation(); const i = +c.dataset.i; if (!open[i] && !dead && !won) { flag[i] = !flag[i]; draw(); } };
      });
    };
    w.onClose = () => clearInterval(tim);
    reset();
  }

  /* ----- My Computer / Floppy / Recycle Bin ----- */
  function appMyComputer() {
    const w = makeWin('mycomp', 'My Computer', { w: 300, x: 90, y: 80 });
    w.body.innerHTML = `<div class="sunk" style="display:flex;gap:16px;flex-wrap:wrap;padding:10px">${[['a', IC.flop, '3½ Floppy (A:)'], ['c', IC.pc, 'GATEWAY (C:)'], ['d', IC.pc, '(D:) CD-ROM'], ['cp', IC.pc, 'Control Panel']].map(([k, g, l]) => `<div class="ico" style="color:#000" data-d="${k}"><div class="g">${g}</div><span>${l}</span></div>`).join('')}</div><div class="status">4 object(s)</div>`;
    w.body.querySelectorAll('[data-d]').forEach(d => d.onclick = () => {
      const k = d.dataset.d;
      if (k === 'a') { if (!G.f.floppyIn) { sfx('error'); return msgbox('A:\\', '⛔', 'A:\\ is not accessible.<br><br>The device is not ready.'); } return appFloppy(); }
      if (k === 'c') return appCdrive();
      if (k === 'd') return msgbox('D:\\', '💿', `The CD-ROM drive contains: "AOL 4.0 — 700 FREE HOURS!" (the fourth one this month).`);
      if (k === 'cp') return msgbox('Display Properties', '🖥', 'Screen area: 640 by 480 pixels<br>Colors: High Color (16 bit)<br><br>Your father set it to 640×480 "so he can read it." You leave it. You choose your battles.');
    });
  }
  function appFloppy() {
    const w = makeWin('floppy', '3½ Floppy (A:)', { w: 260, x: 140, y: 120 });
    w.body.innerHTML = `<div class="sunk" style="padding:6px;min-height:100px"><div class="icq-c" data-f="poem">📄 POEM93.TXT</div><div class="icq-c" data-f="mani">📄 MANIFSTO.TXT</div><div class="icq-c" data-f="sav">💾 SHDWGATE.SAV</div></div><div class="row" style="justify-content:space-between;padding-top:3px"><span>3 object(s) — 1.38MB free</span><button class="btn" data-f="eject">Eject</button></div>`;
    w.body.querySelectorAll('[data-f]').forEach(d => d.onclick = () => {
      const f = d.dataset.f;
      if (f === 'poem') { setF('readPoem'); karma(1); appNotepad({ id: 'np_poem', name: 'POEM93.TXT', text: Story.poemText(), ro: true, kind: 'poem' }); say(`You open POEM93.TXT. You were eleven. You'd forgotten all of it. You hadn't forgotten any of it.`); return; }
      if (f === 'mani') return appNotepad({ id: 'np_mani', name: 'MANIFSTO.TXT', ro: true, kind: 'manifesto', text: `THE PEOPLES REPUBLIC OF DAVIDS ROOM\nA MANIFESTO (draft 3)\n\nArticle 1. The Room belongs to the Workers (me).\nArticle 2. All Laundry is Collective Property.\nArticle 3. The Mother Shall Knock.\nArticle 4. The Father Shall Not Say "Well, It's... Bold."\nArticle 5. The Dog is an honorary Comrade.\nArticle 6. Internet After 6 p.m. is a Human Right.\nArticle 7. ...\n\n(article 7 is "to be continued," and has been since August)` });
      if (f === 'sav') return msgbox('SHDWGATE.SAV', '⛔', 'Windows cannot open this file.<br><br>It is a save file from a game on a different computer (an NES), which is not, and never was, how floppy disks work. You were eleven.');
      if (f === 'eject') { G.f.floppyIn = false; closeWin('floppy'); give('floppy'); say(`<i>Ka-chunk.</i> The floppy pops out. You take it.`); }
    });
  }
  function appCdrive() {
    const w = makeWin('cdrive', 'C:\\My Documents', { w: 280, x: 160, y: 100 });
    w.body.innerHTML = `<div class="sunk" style="padding:6px;min-height:100px"><div class="icq-c" data-f="chem">📄 chem_lab_titration.doc</div>${F('gregNotesEmail') ? '<div class="icq-c" data-f="notes">📄 GREG_UNIT_NOTES.txt</div>' : ''}<div class="icq-c" data-f="quake">📁 QUAKE</div><div class="icq-c" data-f="mp3">📁 mp3s (14)</div></div>`;
    w.body.querySelectorAll('[data-f]').forEach(d => d.onclick = () => {
      const f = d.dataset.f;
      if (f === 'chem') return msgbox('chem_lab_titration.doc', '⛔', 'Windows cannot open this file: no program is associated with .doc files.<br><br>(Greg installed WordPad. You deleted it to make room for Quake.)');
      if (f === 'notes') { setF('gregNotes'); return appNotepad({ id: 'np_notes', name: 'GREG_UNIT_NOTES.txt', ro: true, kind: 'notes', text: `GREG'S UNIT NOTES — FOR DAVID (READ THEM!!!)\n\n1. MOLE = 6.02 x 10^23 THINGS. NOT AN ANIMAL. (sorry)\n2. moles = grams / molar mass. ALWAYS write units.\n3. Balancing: do C first, then H, then O. O is always last. O is the boss.\n4. TITRATION:\n   - burette has the KNOWN stuff\n   - flask has the UNKNOWN stuff + indicator\n   - add SLOWLY near the end. the last drop matters.\n   - endpoint = colour change that STAYS.\n   - M1V1 = M2V2 (for 1:1 reactions)\n5. Ask your mom. (I'm serious. My mom says your mom is a genius.)\n\n- G\n  live long and prosper` }); }
      if (f === 'quake') return msgbox('QUAKE', '🎮', 'QUAKE.EXE: "Not enough memory to run Quake with your current settings." You have 64 MB. It\'s 1999. Nothing is ever enough.');
      if (f === 'mp3') return msgbox('mp3s', '🎵', '14 files, all from Napster, all slightly wrong: a Tragically Hip song that is actually a Barenaked Ladies song, "Blink-182 - All the Small Things (LIVE) (REAL)" which is someone humming, and so on.');
    });
  }
  function appBin() {
    const w = makeWin('bin', 'Recycle Bin', { w: 260, x: 120, y: 140 });
    w.body.innerHTML = `<div class="sunk" style="padding:6px;min-height:80px"><div class="icq-c" data-f="mom">📄 mom.txt <span style="color:#888;margin-left:auto">Deleted: 9:02 PM</span></div></div><div class="status">Double-click to restore.</div>`;
    w.body.querySelector('[data-f=mom]').onclick = () => { setF('foundDraft'); if (G.f.letterDraft == null) G.f.letterDraft = 'Mom,\n\ni\'m sorry i'; appNotepad({}); say(`mom.txt. Deleted at 9:02 tonight, twenty minutes after the fight. You don't remember writing it. It says: "Mom, i'm sorry i" — and then nothing. You stopped. You don't remember why you stopped.`); };
  }

  /* -------- floppy from the inventory -------- */
  function insertFloppy() { lose('floppy'); G.f.floppyIn = true; if (scr) { if (wins.mycomp) appFloppy(); } }

  return { open, close, online, hangup, insertFloppy, refreshTray, get isOpen() { return !!scr; } };
})();
