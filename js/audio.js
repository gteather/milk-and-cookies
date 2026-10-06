/* ==========================================================================
   Audio — everything is synthesized with Web Audio (works from file://).
   ========================================================================== */
'use strict';
const Audio99 = (() => {
  let ctx = null, master, musicBus, sfxBus, verb, verbSend, noiseBuf;
  let enabled = true, musicVol = 0.55, sfxVol = 0.8;
  let curTrack = null, seqTimer = null, nextBarTime = 0, barIdx = 0, trackGain = null;
  const active = new Set();   // long-running sfx (modem etc.)

  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const N = (() => { const o = {}; const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    for (let oct = 0; oct < 8; oct++) names.forEach((n, i) => { o[n + oct] = 12 * (oct + 1) + i; });
    o.Db = 1; return o; })();
  const n = s => N[s.replace('b', '#')] ?? N[s];

  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = enabled ? 0.9 : 0; master.connect(ctx.destination);
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3; comp.connect(master);
    musicBus = ctx.createGain(); musicBus.gain.value = musicVol; musicBus.connect(comp);
    sfxBus = ctx.createGain(); sfxBus.gain.value = sfxVol; sfxBus.connect(comp);
    // reverb
    verb = ctx.createConvolver(); verb.buffer = impulse(2.8, 2.2); verbSend = ctx.createGain(); verbSend.gain.value = 0.35;
    verbSend.connect(verb); verb.connect(comp);
    // noise
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  function impulse(sec, decay) {
    const len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
    return b;
  }
  const T = () => ctx.currentTime;

  // ---------- primitives ----------
  function env(g, t, a, peak, d, s, r, dur) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setTargetAtTime(peak * s, t + a, d / 3 + 0.001);
    g.gain.setTargetAtTime(0.0001, t + dur, r / 4 + 0.001);
  }
  function osc(type, freq, t, dur, { gain = 0.2, a = 0.005, d = 0.1, s = 0.6, r = 0.15, bus = sfxBus, detune = 0, wet = 0, filter = null, q = 1, glide = null } = {}) {
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t); o.detune.value = detune;
    if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
    const g = ctx.createGain(); env(g, t, a, gain, d, s, r, dur);
    let head = o;
    if (filter) { const f = ctx.createBiquadFilter(); f.type = filter.type || 'lowpass'; f.frequency.value = filter.f; f.Q.value = q; o.connect(f); head = f; if (filter.sweep) f.frequency.exponentialRampToValueAtTime(filter.sweep, t + dur); }
    head.connect(g); g.connect(bus); if (wet) { const w = ctx.createGain(); w.gain.value = wet; g.connect(w); w.connect(verbSend); }
    o.start(t); o.stop(t + dur + r + 0.3); return o;
  }
  function noise(t, dur, { gain = 0.2, a = 0.002, d = 0.05, s = 0.5, r = 0.1, type = 'bandpass', f = 1000, q = 1, sweep = null, bus = sfxBus, wet = 0 } = {}) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (sweep) fl.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    const g = ctx.createGain(); env(g, t, a, gain, d, s, r, dur);
    src.connect(fl); fl.connect(g); g.connect(bus); if (wet) { const w = ctx.createGain(); w.gain.value = wet; g.connect(w); w.connect(verbSend); }
    src.start(t, Math.random()); src.stop(t + dur + r + 0.3); return src;
  }
  function dual(f1, f2, t, dur, gain = 0.12) { osc('sine', f1, t, dur, { gain, a: 0.01, s: 1, r: 0.02 }); osc('sine', f2, t, dur, { gain, a: 0.01, s: 1, r: 0.02 }); }

  // ---------- SFX library ----------
  const SFX = {
    click(t) { osc('square', 1800, t, 0.015, { gain: 0.05, r: 0.01 }); },
    tick(t) { noise(t, 0.01, { gain: 0.12, f: 4000, q: 2 }); },
    pickup(t) { osc('triangle', 660, t, 0.07, { gain: 0.16 }); osc('triangle', 990, t + 0.06, 0.12, { gain: 0.16, wet: 0.3 }); },
    drop(t) { osc('sine', 220, t, 0.1, { gain: 0.25, glide: 110 }); noise(t, 0.05, { gain: 0.1, f: 600 }); },
    deny(t) { osc('square', 180, t, 0.09, { gain: 0.07, filter: { f: 900 } }); osc('square', 150, t + 0.1, 0.14, { gain: 0.07, filter: { f: 900 } }); },
    door(t) { noise(t, 0.35, { gain: 0.22, type: 'lowpass', f: 500, d: 0.2, s: 0.2 }); osc('sine', 90, t, 0.2, { gain: 0.3, glide: 55 }); noise(t + 0.02, 0.4, { gain: 0.05, f: 1700, q: 12, sweep: 1200 }); },
    doorclose(t) { noise(t, 0.12, { gain: 0.3, type: 'lowpass', f: 700 }); osc('sine', 75, t, 0.18, { gain: 0.4, glide: 45 }); },
    step(t) { for (let i = 0; i < 4; i++) { noise(t + i * 0.28, 0.06, { gain: 0.12, type: 'lowpass', f: 350 + Math.random() * 100 }); } },
    stairs(t) { for (let i = 0; i < 7; i++) { noise(t + i * 0.16, 0.05, { gain: 0.14, type: 'lowpass', f: 420 }); osc('sine', 70, t + i * 0.16, 0.05, { gain: 0.08 }); } },
    bark(t) { for (let i = 0; i < 3; i++) { const s = t + i * 0.19 + Math.random() * 0.03; osc('sawtooth', 900, s, 0.08, { gain: 0.12, glide: 520, filter: { type: 'bandpass', f: 1400 }, q: 3 }); noise(s, 0.07, { gain: 0.1, f: 1800, q: 2 }); } },
    yap(t) { for (let i = 0; i < 6; i++) { const s = t + i * 0.14; osc('sawtooth', 1100, s, 0.06, { gain: 0.1, glide: 650, filter: { type: 'bandpass', f: 1500 }, q: 3 }); } },
    icq(t) { // two-tone "uh-oh"-ish chirp (original)
      osc('sine', 880, t, 0.12, { gain: 0.16, glide: 760, wet: 0.2 }); osc('triangle', 1760, t, 0.1, { gain: 0.03 });
      osc('sine', 660, t + 0.16, 0.2, { gain: 0.16, glide: 520, wet: 0.2 }); osc('triangle', 1320, t + 0.16, 0.15, { gain: 0.03 }); },
    icqsend(t) { osc('sine', 1200, t, 0.05, { gain: 0.08 }); },
    dialtone(t, dur = 1.2) { dual(350, 440, t, dur, 0.07); },
    dtmf(t, digits = '5554702') {
      const R = [697, 770, 852, 941], C = [1209, 1336, 1477];
      const map = { 1: [0, 0], 2: [0, 1], 3: [0, 2], 4: [1, 0], 5: [1, 1], 6: [1, 2], 7: [2, 0], 8: [2, 1], 9: [2, 2], 0: [3, 1] };
      [...digits].forEach((dg, i) => { const [r, c] = map[dg] || [3, 1]; dual(R[r], C[c], t + i * 0.13, 0.09, 0.08); });
    },
    ring(t) { for (let k = 0; k < 2; k++) { const s = t + k * 3.2; for (let i = 0; i < 40; i++) { osc('sine', 440, s + i * 0.05, 0.025, { gain: 0.09, s: 1, a: 0.002 }); osc('sine', 480, s + i * 0.05, 0.025, { gain: 0.09, s: 1, a: 0.002 }); } } },
    busy(t) { for (let i = 0; i < 4; i++) dual(480, 620, t + i, 0.5, 0.07); },
    modem(t) { // ~7s handshake
      SFX.dialtone(t, 0.9); SFX.dtmf(t + 1.0, '9354702');
      const s = t + 2.1;
      osc('sine', 2100, s, 1.2, { gain: 0.09, s: 1, a: 0.01 });                 // answer tone
      osc('sine', 980, s + 1.3, 0.5, { gain: 0.07, s: 1 }); osc('sine', 1180, s + 1.3, 0.5, { gain: 0.07, s: 1 });
      osc('sine', 1650, s + 1.85, 0.35, { gain: 0.08, s: 1 }); osc('sine', 1850, s + 1.85, 0.35, { gain: 0.06, s: 1 });
      for (let i = 0; i < 18; i++) osc('square', 1200 + (i % 2) * 1000, s + 2.25 + i * 0.03, 0.03, { gain: 0.04, s: 1, filter: { f: 2600 } });
      noise(s + 2.8, 0.7, { gain: 0.11, f: 1800, q: 0.6, s: 1 });
      osc('sawtooth', 1800, s + 3.5, 0.6, { gain: 0.05, glide: 2400, filter: { type: 'bandpass', f: 2000 }, q: 1 });
      noise(s + 4.1, 1.0, { gain: 0.14, f: 2400, q: 0.5, s: 1, r: 0.05 });
      osc('square', 600, s + 4.1, 1.0, { gain: 0.03, s: 1, filter: { f: 1600 } });
    },
    startup(t) { // original "boot chime"
      [n('G4'), n('D5'), n('G5'), n('B5'), n('D6')].forEach((m, i) => osc('sine', mtof(m), t + i * 0.12, 1.6 - i * 0.15, { gain: 0.08, a: 0.02, d: 0.5, s: 0.4, r: 1.2, wet: 0.5 }));
      osc('triangle', mtof(n('G3')), t, 1.8, { gain: 0.08, a: 0.05, r: 1.2, wet: 0.5 }); },
    ding(t) { osc('sine', 1318, t, 0.4, { gain: 0.12, d: 0.3, s: 0.2, r: 0.5, wet: 0.3 }); osc('sine', 1975, t, 0.3, { gain: 0.05, d: 0.2, s: 0.1, r: 0.4 }); },
    error(t) { osc('triangle', 440, t, 0.25, { gain: 0.15, d: 0.2, s: 0.3, r: 0.3 }); osc('triangle', 330, t + 0.05, 0.25, { gain: 0.12, d: 0.2, s: 0.3, r: 0.3 }); },
    print(t) { for (let pass = 0; pass < 6; pass++) { const s = t + pass * 0.5; noise(s, 0.35, { gain: 0.07, f: 2200, q: 3, s: 1, sweep: 3200 }); osc('square', 80 + pass * 3, s, 0.35, { gain: 0.03, s: 1, filter: { f: 400 } }); } noise(t + 3.1, 0.3, { gain: 0.1, type: 'highpass', f: 2000, s: 0.2 }); },
    kettle(t) { noise(t, 2.2, { gain: 0.03, type: 'lowpass', f: 400, s: 1, a: 1 }); osc('sine', 1600, t + 1.4, 1.6, { gain: 0.06, a: 0.6, glide: 2300, s: 1, wet: 0.2 }); osc('sine', 1650, t + 1.6, 1.4, { gain: 0.04, a: 0.5, glide: 2350, s: 1 }); },
    pour(t) { noise(t, 1.0, { gain: 0.1, f: 700, q: 2, sweep: 1400, s: 1 }); },
    crunch(t) { for (let i = 0; i < 5; i++) noise(t + i * 0.07 + Math.random() * 0.03, 0.05, { gain: 0.2, f: 2500 + Math.random() * 2000, q: 1.5 }); },
    gulp(t) { for (let i = 0; i < 3; i++) osc('sine', 260, t + i * 0.35, 0.12, { gain: 0.25, glide: 140, filter: { f: 600 } }); },
    squish(t) { noise(t, 0.35, { gain: 0.2, type: 'lowpass', f: 900, sweep: 300 }); osc('sine', 160, t, 0.3, { gain: 0.15, glide: 60 }); },
    flush(t) { noise(t, 2.6, { gain: 0.18, type: 'lowpass', f: 1200, a: 0.3, s: 0.7, sweep: 400, r: 1, wet: 0.3 }); },
    splash(t) { noise(t, 0.5, { gain: 0.2, f: 1500, q: 0.7, sweep: 500, s: 0.3 }); },
    schoolbell(t) { const o = osc('square', 980, t, 2.2, { gain: 0.06, s: 1, a: 0.01, filter: { f: 3000 } }); const lfo = ctx.createOscillator(); lfo.frequency.value = 28; const lg = ctx.createGain(); lg.gain.value = 300; lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + 2.5); },
    kaboom(t) { noise(t, 2.5, { gain: 0.6, type: 'lowpass', f: 1800, sweep: 80, a: 0.003, d: 0.3, s: 0.4, r: 1.5, wet: 0.6 }); osc('sine', 80, t, 1.5, { gain: 0.6, glide: 30 }); },
    sizzle(t) { noise(t, 1.5, { gain: 0.08, type: 'highpass', f: 4000, s: 1 }); },
    cough(t) { for (let i = 0; i < 3; i++) noise(t + i * 0.32, 0.14, { gain: 0.25, f: 500, q: 1.2, a: 0.01, sweep: 300 }); },
    tv(t) { noise(t, 0.6, { gain: 0.08, type: 'highpass', f: 1500, s: 1 }); osc('sine', 15734, t, 0.6, { gain: 0.01, s: 1 }); },
    thump(t) { osc('sine', 60, t, 0.25, { gain: 0.5, glide: 35 }); noise(t, 0.08, { gain: 0.2, type: 'lowpass', f: 300 }); },
    sub(t) { // distorted subwoofer blast
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(48, t);
      const ws = ctx.createWaveShaper(); const c = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; c[i] = Math.tanh(x * 9); } ws.curve = c;
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260; const g = ctx.createGain(); env(g, t, 0.01, 0.35, 0.3, 0.8, 0.4, 1.4);
      o.connect(ws); ws.connect(f); f.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 2.2); },
    sleep(t) { [n('E5'), n('C5'), n('A4'), n('E4')].forEach((m, i) => osc('sine', mtof(m), t + i * 0.32, 0.9, { gain: 0.09, a: 0.02, r: 0.9, wet: 0.6 })); },
    wake(t) { [n('C5'), n('E5'), n('G5'), n('C6')].forEach((m, i) => osc('triangle', mtof(m), t + i * 0.1, 0.5, { gain: 0.06, r: 0.6, wet: 0.5 })); },
    mirror(t) { for (let i = 0; i < 6; i++) osc('sine', mtof(n('A5') + [0, 4, 7, 11, 14, 19][i]), t + i * 0.06, 0.9, { gain: 0.03, r: 1, wet: 0.8 }); },
    sting_good(t) { [n('D4'), n('F#4'), n('A4'), n('D5')].forEach((m, i) => osc('triangle', mtof(m), t + i * 0.09, 1.6, { gain: 0.08, r: 1.4, wet: 0.6 })); },
    sting_bad(t) { [n('D3'), n('G#3'), n('C#4')].forEach((m, i) => osc('sawtooth', mtof(m), t + i * 0.02, 2.2, { gain: 0.05, a: 0.05, r: 1.5, wet: 0.6, filter: { f: 900, sweep: 300 } })); osc('sine', 46, t, 2.5, { gain: 0.3 }); },
    sting_event(t) { osc('triangle', mtof(n('A4')), t, 0.4, { gain: 0.1, wet: 0.5 }); osc('triangle', mtof(n('E5')), t + 0.12, 0.6, { gain: 0.1, wet: 0.5 }); },
    paper(t) { noise(t, 0.25, { gain: 0.12, type: 'highpass', f: 2500, a: 0.04, s: 0.4 }); },
    type(t) { for (let i = 0; i < 6; i++) noise(t + i * 0.09 + Math.random() * 0.04, 0.02, { gain: 0.14, f: 3000, q: 2 }); },
    zip(t) { noise(t, 0.4, { gain: 0.1, f: 2000, q: 3, sweep: 4000 }); },
    fridge(t) { noise(t, 0.2, { gain: 0.15, type: 'lowpass', f: 500 }); osc('sine', 60, t + 0.1, 1.2, { gain: 0.04, s: 1, a: 0.2 }); },
    gas(t) { noise(t, 1.6, { gain: 0.06, type: 'highpass', f: 3000, a: 0.1, s: 1 }); },
    whoosh(t) { noise(t, 0.6, { gain: 0.12, f: 400, q: 0.8, sweep: 2500, a: 0.2 }); },
    pool(t) { osc('sine', 2400, t, 0.03, { gain: 0.2, r: 0.04 }); osc('sine', 1900, t + 0.35, 0.03, { gain: 0.14, r: 0.04 }); osc('sine', 120, t + 0.7, 0.2, { gain: 0.15, glide: 60 }); },
    nes(t) { [72, 76, 79, 84, 79, 84].forEach((m, i) => osc('square', mtof(m), t + i * 0.09, 0.08, { gain: 0.05 })); },
  };

  // ---------- music ----------
  const P = s => s.split(' ').map(x => x === '-' ? null : n(x));
  function chordNotes(root, kind = 'm') { const r = n(root); const iv = { M: [0, 4, 7], m: [0, 3, 7], M7: [0, 4, 7, 11], m7: [0, 3, 7, 10], sus: [0, 5, 7], add9: [0, 4, 7, 14], m9: [0, 3, 7, 14] }[kind]; return iv.map(i => r + i); }
  function pad(notes, t, dur, gain = 0.035) { notes.forEach((m, i) => { osc('sawtooth', mtof(m), t, dur, { gain, a: dur * 0.3, d: 0.5, s: 0.8, r: dur * 0.4, bus: musicBus, detune: (i % 2 ? 7 : -7), wet: 0.6, filter: { f: 900 } }); }); }
  function ep(m, t, dur, gain = 0.06) { osc('sine', mtof(m), t, dur, { gain, a: 0.005, d: 0.6, s: 0.25, r: 0.8, bus: musicBus, wet: 0.45 }); osc('sine', mtof(m) * 2, t, dur * 0.5, { gain: gain * 0.25, a: 0.002, d: 0.2, s: 0.05, r: 0.3, bus: musicBus }); }
  function bell(m, t, dur, gain = 0.05) { osc('sine', mtof(m), t, dur, { gain, a: 0.002, d: 0.8, s: 0.1, r: 1.2, bus: musicBus, wet: 0.7 }); osc('sine', mtof(m) * 3.01, t, 0.3, { gain: gain * 0.3, a: 0.001, d: 0.1, s: 0, r: 0.2, bus: musicBus, wet: 0.4 }); }
  function bass(m, t, dur, gain = 0.09) { osc('triangle', mtof(m), t, dur, { gain, a: 0.01, d: 0.2, s: 0.7, r: 0.15, bus: musicBus }); }
  function pluck(m, t, dur, gain = 0.04) { osc('square', mtof(m), t, dur, { gain, a: 0.002, d: 0.12, s: 0.15, r: 0.1, bus: musicBus, filter: { f: 1800, sweep: 600 }, wet: 0.25 }); }
  function lead(m, t, dur, gain = 0.045) { osc('square', mtof(m), t, dur, { gain, a: 0.01, d: 0.1, s: 0.7, r: 0.08, bus: musicBus, filter: { f: 2600 }, wet: 0.2 }); osc('square', mtof(m), t, dur, { gain: gain * 0.5, a: 0.01, s: 0.7, r: 0.08, bus: musicBus, detune: 12, filter: { f: 2600 } }); }
  function hat(t, g = 0.025) { noise(t, 0.03, { gain: g, type: 'highpass', f: 7000, bus: musicBus }); }
  function kick(t, g = 0.18) { osc('sine', 120, t, 0.15, { gain: g, glide: 45, bus: musicBus, r: 0.05 }); }
  function snare(t, g = 0.06) { noise(t, 0.12, { gain: g, f: 1800, q: 0.8, bus: musicBus, s: 0.2 }); }

  const TRACKS = {
    title: { bpm: 72, bars: [['A3', 'm9'], ['F3', 'M7'], ['C3', 'add9'], ['G3', 'sus']],
      play(b, t, beat, bar) { const [r, k] = this.bars[b % 4]; const ch = chordNotes(r, k); pad(ch, t, beat * 4); bass(n(r) - 12, t, beat * 3.5, 0.07);
        const mel = [P('E5 - C5 - B4 A4 - -'), P('C5 - A4 - G4 E4 - -'), P('G4 - E5 - D5 C5 - D5'), P('B4 - - G4 A4 - - -')][b % 4];
        if (bar >= 4) mel.forEach((m, i) => m && bell(m, t + i * beat / 2, beat * 1.5));
        for (let i = 0; i < 8; i++) ep(ch[i % ch.length] + 12, t + i * beat / 2, beat, 0.025); } },
    night: { bpm: 66, bars: [['D3', 'm9'], ['A#2', 'M7'], ['F3', 'add9'], ['C3', 'sus'], ['G3', 'm7'], ['A#2', 'M7'], ['A2', 'sus'], ['A2', 'M']],
      play(b, t, beat, bar) { const [r, k] = this.bars[b % 8]; const ch = chordNotes(r, k); pad(ch, t, beat * 4, 0.028); bass(n(r) - 12, t, beat * 4, 0.06);
        const arp = [0, 1, 2, 1, 3 % ch.length, 2, 1, 2]; arp.forEach((ix, i) => { if ((bar + i) % 3 !== 2) ep(ch[ix % ch.length] + 12, t + i * beat / 2, beat * 1.2, 0.035); });
        if (bar % 8 >= 4) { const m = [P('A5 - - F5 - - E5 -'), P('D5 - - - C5 - D5 -'), P('F5 - E5 - C5 - - -'), P('E5 - - - - - - -')][b % 4]; m.forEach((x, i) => x && bell(x, t + i * beat / 2, beat * 2, 0.03)); } } },
    day: { bpm: 84, bars: [['F3', 'M7'], ['A3', 'm7'], ['A#3', 'M7'], ['C4', 'sus']],
      play(b, t, beat) { const [r, k] = this.bars[b % 4]; const ch = chordNotes(r, k); pad(ch, t, beat * 4, 0.022); bass(n(r) - 12, t, beat * 2, 0.07); bass(n(r) - 5, t + beat * 2, beat * 2, 0.06);
        for (let i = 0; i < 8; i++) pluck(ch[(i * 2) % ch.length] + 12, t + i * beat / 2, beat / 2, 0.025);
        const m = [P('A4 - C5 - - A4 G4 -'), P('E4 - G4 - - E4 C4 -'), P('D4 - F4 - A4 - G4 -'), P('G4 - - - - - - -')][b % 4]; m.forEach((x, i) => x && ep(x + 12, t + i * beat / 2, beat, 0.03)); } },
    school: { bpm: 96, bars: [['C3', 'M7'], ['A2', 'm7'], ['F2', 'M7'], ['G2', 'sus']],
      play(b, t, beat) { const [r, k] = this.bars[b % 4]; const ch = chordNotes(r, k);
        for (let i = 0; i < 8; i++) { hat(t + i * beat / 2, i % 2 ? 0.015 : 0.025); if (i % 4 === 0) kick(t + i * beat / 2, 0.12); if (i % 4 === 2) snare(t + i * beat / 2, 0.04); }
        [0, 3, 4, 6].forEach(i => bass(n(r) + (i === 6 ? 7 : 0), t + i * beat / 2, beat / 2, 0.08));
        [1, 3, 5, 7].forEach(i => ep(ch[i % ch.length] + 24, t + i * beat / 2, beat / 2, 0.025)); pad(ch.map(x => x + 12), t, beat * 4, 0.015); } },
    dread: { bpm: 50, bars: [['D2', 'm'], ['D#2', 'M'], ['D2', 'm'], ['C#2', 'm']],
      play(b, t, beat) { const [r] = this.bars[b % 4]; pad([n(r), n(r) + 6, n(r) + 13], t, beat * 4, 0.03); osc('sine', mtof(n(r) - 12), t, beat * 4, { gain: 0.08, a: 1, s: 1, r: 1, bus: musicBus });
        if (b % 2) bell(n(r) + 25, t + beat * 2.5, beat * 2, 0.02); noise(t, beat * 4, { gain: 0.01, f: 300, q: 4, a: 2, s: 1, bus: musicBus, sweep: 900 }); } },
    good: { bpm: 70, bars: [['D3', 'add9'], ['A2', 'sus'], ['B2', 'm7'], ['G2', 'M7']],
      play(b, t, beat) { const [r, k] = this.bars[b % 4]; const ch = chordNotes(r, k); pad(ch.map(x => x + 12), t, beat * 4, 0.025); bass(n(r) - 12, t, beat * 4, 0.07);
        for (let i = 0; i < 8; i++) ep(ch[i % ch.length] + 24, t + i * beat / 2, beat, 0.025);
        const m = [P('F#5 - A5 - F#5 E5 D5 -'), P('E5 - - - C#5 - - -'), P('D5 - F#5 - D5 C#5 B4 -'), P('D5 - - - - - - -')][b % 4]; m.forEach((x, i) => x && bell(x, t + i * beat / 2, beat * 2, 0.04)); } },
    // ---- Winamp playlist ----
    internationale: { bpm: 108, loop: true, // melody by Pierre De Geyter (1888), public domain
      mel: P('G4 C5 - B4 D5 C5 G4 E4 A4 - F4 - - - D4 G4 - F4 E4 D4 C4 B3 - - - - - G4 C5 - B4 D5 C5 G4 E4 A4 - F4 - - - A4 D5 - C5 B4 A4 G4 C5 - - - - - E5 D5 - - A4 C5 - B4 - D5 - - - - - G4 C5 - B4 D5 C5 G4 E4 A4 - - - F4 - - - G4 - - - E4 - D4 - C4 - - - - - - -'),
      play(b, t, beat) { const per = 16; for (let i = 0; i < per; i++) { const m = this.mel[(b * per + i) % this.mel.length]; if (m) { lead(m, t + i * beat / 4 * 2, beat * 0.9, 0.04); } if (i % 4 === 0) { kick(t + i * beat / 2, 0.14); bass((m || n('C3')) - 24, t + i * beat / 2, beat * 0.9, 0.08); } if (i % 4 === 2) snare(t + i * beat / 2, 0.05); hat(t + i * beat / 2, 0.012); } },
      barBeats: 8 },
    comrade: { bpm: 128, bars: [['A2', 'm'], ['F2', 'M'], ['C3', 'M'], ['G2', 'M']],
      play(b, t, beat) { const [r, k] = this.bars[b % 4]; const ch = chordNotes(r, k);
        for (let i = 0; i < 8; i++) { hat(t + i * beat / 2, 0.02); if (i % 2 === 0) kick(t + i * beat / 2, 0.15); if (i % 4 === 2) snare(t + i * beat / 2, 0.06); bass(n(r) - 12 + (i % 2 ? 12 : 0), t + i * beat / 2, beat / 2, 0.08); pluck(ch[i % 3] + 24, t + i * beat / 2, beat / 3, 0.03); }
        const m = [P('E5 - E5 D5 C5 - A4 -'), P('C5 - C5 A4 F4 - A4 -'), P('G5 - E5 - C5 - E5 G5'), P('B5 - - A5 G5 - D5 -')][b % 4]; m.forEach((x, i) => x && lead(x, t + i * beat / 2, beat / 2, 0.03)); } },
    oh: { bpm: 76, // "O Canada" melody (Calixa Lavallée, 1880) — public domain
      mel: P('E4 - - - G4 - G4 C4 - - - - D4 - E4 F4 G4 A4 D4 - - - - - E4 - - F#4 G#4 - A4 B4 C5 - - - A4 - - - G4 - F4 E4 D4 - - - - - - -'),
      play(b, t, beat) { for (let i = 0; i < 8; i++) { const m = this.mel[(b * 8 + i) % this.mel.length]; if (m) bell(m + 12, t + i * beat / 2, beat * 1.5, 0.05); } pad(chordNotes(['C3', 'G2', 'F2', 'C3', 'G2', 'D3'][b % 6], 'M'), t, beat * 4, 0.02); } },
  };

  function scheduler() {
    if (!ctx || !curTrack) return;
    const tr = TRACKS[curTrack]; const beat = 60 / tr.bpm; const barLen = beat * (tr.barBeats || 4);
    while (nextBarTime < ctx.currentTime + 0.4) {
      try { tr.play(barIdx, nextBarTime, beat, barIdx); } catch (e) { console.warn(e); }
      nextBarTime += barLen; barIdx++;
    }
  }
  function music(name) {
    if (name === curTrack) return;
    curTrack = name; barIdx = 0;
    if (!ctx) return;
    // fade bus for transition
    musicBus.gain.cancelScheduledValues(T()); musicBus.gain.setValueAtTime(0.0001, T()); musicBus.gain.linearRampToValueAtTime(enabled ? musicVol : 0, T() + 2.5);
    nextBarTime = T() + 0.15;
    if (!seqTimer) seqTimer = setInterval(scheduler, 120);
  }
  function stopMusic() { curTrack = null; }

  return {
    init,
    play(name, delay = 0) { if (!enabled) return; init(); if (!ctx || !SFX[name]) return; try { SFX[name](T() + delay + 0.01); } catch (e) { console.warn(e); } },
    music(name) { init(); music(name); },
    stopMusic,
    get track() { return curTrack; },
    toggle() { enabled = !enabled; init(); if (master) master.gain.setTargetAtTime(enabled ? 0.9 : 0, T(), 0.05); return enabled; },
    get enabled() { return enabled; },
    set enabled(v) { enabled = v; if (master) master.gain.value = v ? 0.9 : 0; },
  };
})();
