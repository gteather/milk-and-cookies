/* ==========================================================================
   Story — schedule, systems, consequences, endings
   ========================================================================== */
'use strict';

const ADJ = {
  den: ['upstairs', 'desk'], desk: ['den'], upstairs: ['den', 'master', 'guestbath', 'davidroom', 'foyer'],
  master: ['upstairs', 'masterbath', 'underbed_master'], masterbath: ['master'], underbed_master: ['master'],
  guestbath: ['upstairs', 'mirror'], mirror: ['guestbath'], davidroom: ['upstairs', 'underbed_david'], underbed_david: ['davidroom'],
  foyer: ['upstairs', 'dining', 'kitchen', 'powder', 'basement'], powder: ['foyer'], dining: ['foyer', 'kitchen'],
  kitchen: ['foyer', 'dining', 'living', 'patio'], living: ['kitchen'], patio: ['kitchen'], basement: ['foyer', 'box'], box: ['basement'],
  classroom: ['teacherdesk'], teacherdesk: ['classroom'],
};
const PUBLIC_ROOMS = ['kitchen', 'dining', 'living', 'foyer', 'powder', 'upstairs', 'patio'];
const MASTER_ROOMS = ['underbed_master', 'master', 'masterbath'];

const Story = {
  /* ------------------------------------------------------------------ setup */
  init() {
    G.drops = { desk: ['milk', 'cookie'] };
    G.rel = { noreen: -2, don: 0, greg: 1 };
    G.milkAge = 0; G.cookieAge = 0; G.mix = null; G.f.exposure = 0;
  },
  introLines() {
    return [
      `<span class="k">Niagara-on-the-Lake, Ontario &middot; Thursday, October 14, 1999</span>`,
      `The Garrison Village subdivision is new and tidy and very quiet: heritage-style porches, two-car garages, nine-foot ceilings, saplings held up with stakes. Fourteen streets of people who chose this.`,
      `Forty minutes ago, in one of these houses, there was a fight. You said some things. She said some things. A phone cord came out of a wall.`,
      `You are <b>David</b>. You are seventeen years old, six foot six, and one hundred and forty pounds. You have uneven ears, a bedroom painted communist red, and a 1996 Gateway 2000 with a Zoltrix 33.6 modem.`,
      `You are sulking at that computer now. And you can hear her coming up the stairs.`,
    ];
  },
  opening() {
    G.loc = 'desk'; G.visited.desk = 1;
    Game.renderAll();
    say(SCENES.desk.look());
    setTimeout(() => { sfx('stairs'); setTimeout(() => { sfx('door'); Game.dialog('opening'); }, 1400); }, 700);
  },

  /* ------------------------------------------------------------------ people */
  noreenState() {
    const e = G.f.exposure || 0;
    if (e >= 9) return 'hospital'; /* 12+ is fatal, handled overnight */ if (e >= 6) return 'sick'; if (e >= 4) return 'cough'; if (e >= 2) return 'smell'; return 'well';
  },
  noreenMood() { const r = G.rel.noreen; if (r <= -3) return 'stern'; if (r <= 0) return 'cold'; if (r <= 3) return 'thaw'; return 'warm'; },
  noreenFace() { return { stern: 'stern', cold: 'neutral', thaw: 'neutral', warm: 'warm' }[this.noreenMood()]; },
  noreenOnPhone() { return G.day === 0 && F('carolCallAt') && !F('carolCalled'); },
  apology() { return (F('apolWords') ? 1 : 0) + (F('apolPhone') ? 1 : 0); },
  canTeach() { return this.apology() >= 2 || G.rel.noreen >= 3; },
  where(who) {
    const d = G.day, ph = G.phase, ns = this.noreenState();
    if (ph === 'school') return { greg: 'classroom', vandyk: 'classroom' }[who] || null;
    if (who === 'shelby') return F('shelbyInside') ? null : 'patio';
    if (who === 'noreen') {
      if (ns === 'hospital') return null;
      if (ns === 'sick') return 'master';
      if (d === 7 && ph === 'evening') return null;         // parent-teacher night
      if (ph === 'day') return 'dining';
      return 'kitchen';
    }
    if (who === 'don') {
      if (ns === 'hospital') return null;
      if (d === 0) return null;                              // Toronto
      if (d === 7 && ph === 'evening') return null;
      if (ph === 'morning') return null;                     // gone to Welland at 6:45
      if (ph === 'day') return 'basement';
      return 'living';
    }
    return null;
  },
  presence(id) {
    const out = [];
    if (this.where('noreen') === id) {
      const m = this.noreenMood();
      if (id === 'master') out.push(`Your mother is in bed. She looks terrible.`);
      else if (this.noreenOnPhone()) out.push(`Noreen is on the kitchen phone, her back to you, the long curly cord wrapped around her wrist.`);
      else out.push(`<b>Noreen</b> is here${id === 'dining' ? ', doing the Saturday crossword in pen' : G.phase === 'morning' ? ', packing a lunch with surgical precision' : ', wiping a counter that is already clean'}. ${{ stern: 'She does not look at you.', cold: 'She glances at you, then away.', thaw: 'She looks up when you come in.', warm: 'She smiles when you come in.' }[m]}${this.noreenState() === 'cough' ? ' She coughs into her elbow.' : ''}`);
    }
    if (this.where('don') === id) out.push(id === 'basement' ? `<b>Don</b> is here, lining up a shot at the pool table in a golf shirt.` : `<b>Don</b> is here, in his recliner, tie loosened, watching the Leafs.`);
    if (id === 'kitchen' && G.day === 7 && G.phase === 'evening') out.push(`The house is empty. A note on the fridge in Noreen's handwriting: "<i>Parent-teacher night. Lasagna in fridge. Feed Shelby. — M.</i>"`);
    if (id === 'kitchen' && this.noreenState() === 'hospital') out.push(`The kitchen is dark and wrong. A note on the fridge in Don's blocky hand: "<i>At St. C. General with Mom. Call if you need anything. Feed Shelby. Love, Dad.</i>" The cookie jar is empty.`);
    return out.join(' ');
  },

  onEnter(id, first) {
    if (G.phase === 'school') return;
    if (here('noreen') && F('tookSoap') !== undefined && F('tookSoap') !== false && !F('soapNoticed') && G.day > F('tookSoap')) { setF('soapNoticed'); ev(`"David." Noreen doesn't look up. "There is a gap in my guest soaps." A pause. "I'm not going to ask. I'm just letting you know that I know."`); }
    if (id === 'patio' && F('shelbyMilk') !== undefined && G.day === F('shelbyMilk') + 1 && once('shelbyGas')) ev(`The patio smells... unwell. Shelby looks up at you with the dignified shame of a dog who has had a long night because of something you gave him.`);
    if (id === 'kitchen' && F('glassPutAway') && here('noreen') && once('glassNoticed')) { rel('noreen', 1); ev(`Noreen is holding up a tall glass to the light, frowning at it. "Someone put this back. Clean." She looks at you. You look at the ceiling. "Hm," she says, and something in her face goes soft for exactly one second.`); }
    if (id === 'master' && this.moldInMaster() && this.mixStage() >= 1 && once('smellMaster_' + G.day)) ev(this.mixStage() >= 2 ? `The master bedroom smells wrong: sour, sweetish, and underneath it something like a wet basement. The air feels thick. Your throat tickles.` : `There's a faint sour smell in here. You know exactly what it is.`);
    if (id === 'underbed_david' && G.mix && this.mixWhere() === 'underbed_david' && this.mixStage() >= 2 && once('ownCough')) { sfx('cough'); ev(`You cough. Then cough again. The air under here has gone thick and sweet. Maybe a closed glass, or a dish, would be smarter than an open one.`); }
  },
  /* ------------------------------------------------------------------ travel */
  exits(loc) { return ADJ[Game.baseScene(loc)] || []; },
  extraExits(loc) {
    const sc = SCENES[loc]; const out = [];
    if (G.phase === 'school') out.push(['leaveschool', '⇥ Leave class (go home)']);
    if (sc.parent) out.push([sc.parent, '↩ Back']);
    if (loc === 'davidroom') out.push(['sleep', '☾ Go to bed']);
    if (loc === 'foyer' && G.phase === 'morning' && !G.school && !isWeekend()) out.push(['school', '⇥ Leave for school']);
    return out;
  },
  travelHook(to) {
    if (to === 'leaveschool') { this.leaveSchool(); return true; }
    if (to === 'sleep') { Game.snapshot(); Game.sleep(); return true; }
    if (to === 'school') { Game.snapshot(); const r = this.frontDoor(); if (r) say(r); return true; }
    return false;
  },
  canTravel(from, to) {
    if (G.phase === 'school' && !['classroom', 'teacherdesk'].includes(to)) return `You're at school. The house will still be there after the bell.`;
    if (G.phase !== 'school' && ['classroom', 'teacherdesk'].includes(to)) return false;
    return true;
  },
  music(sc) {
    if (G.phase === 'school') return 'school';
    const ns = this.noreenState();
    if (ns === 'sick' || ns === 'hospital' || (sc && ['underbed_master', 'mirror'].includes(sc.id) && G.karma <= -4)) return 'dread';
    return G.phase === 'day' ? 'day' : 'night';
  },

  /* ------------------------------------------------------------------ time */
  canSleep() {
    if (G.phase === 'school') return `You can't sleep at school. Well, Mike can. You can't.`;
    if (G.loc !== 'davidroom') return `You'd need to be in your own bed.`;
    if (isWeekend() || G.school) {
      if (F('jolted') && !F('joltSleepTried')) { setF('joltSleepTried'); return `You lie down. Your heart is doing a drum solo. The Jolt Cola has opinions about sleep. You stare at the ceiling for an hour, then try again.`; }
      return true;
    }
    return G.phase === 'morning' ? `It's a school day and you haven't gone yet. If you go back to bed, Noreen will drag you out by your ankles, which she has done before, in 1996, and which you will never live down.` : `You can't go to bed yet.`;
  },
  frontDoorLook() {
    if (G.phase === 'morning' && !isWeekend() && !G.school) return `The front door. Outside, the school bus is about to come around the corner. Time to go.`;
    return `The front door, with its oval of bevelled glass. Beyond it: the rest of the world, which, for the moment, consists of school and nothing else.`;
  },
  frontDoor() {
    if (G.phase === 'school') return '';
    if (isWeekend()) return `It's ${DOW[dow()]}. There's no school, and nowhere else you're allowed to be. You open the door, breathe in the wet-leaf October air, watch a minivan go by, and close it again. Your whole world is this house this week, and you know it.`;
    if (G.school) return `You've already been to school today. Once is plenty. Once is, arguably, too many. You open the door and look at the street, then close it.`;
    if (G.phase !== 'morning') return `It's night. Where would you even go?`;
    Game.toSchool(); return null;
  },
  schoolStart() {
    const L = lesson();
    say(`<b>Niagara District Secondary School — ${dateStr()}.</b>`);
    say(`The day slides past in a blur of lockers and French verbs and a cafeteria lunch you don't remember eating, until third period: <b>Grade 11 Chemistry, Room 214.</b> You fold yourself onto your stool beside Greg.`);
    say(L.intro);
    if (L.greg) say(L.greg);
    if (G.day === 8) { if (!exists('cupcake') && !F('gotCupcake')) { setF('gotCupcake'); give('cupcake'); ev(`Greg's Mole Day cupcake is now in your possession. It is looking at you with candy eyes.`); } if (F('vdMetMom') && !F('vdToldPast')) { setF('vdToldPast'); setTimeout(() => Game.dialog('vd_ptn'), 600); } }
    if (G.day === 13) this.unitTest();
  },
  leaveSchool() {
    if (has('sodium') && !F('sodiumWarned')) { setF('sodiumWarned'); ev(`As you shoulder your backpack, the jar of sodium clinks against your calculator. Your heart stops. Nobody notices. You are now, technically, smuggling an alkali metal.`); }
    Game.fromSchool();
  },
  homeFromSchool() {
    say(`You get home a little after four. ${pick(['The house smells like whatever Noreen has in the oven.', 'Shelby barks at the bus as it pulls away, then at you, then at the bus again.', 'The rain has stopped. Everything drips.'])}`);
    if (G.day === 7) ev(`The minivan is gone. On the fridge, a note: "<i>Parent-teacher night. Lasagna in the fridge. Feed Shelby. — M.</i>" They're at your school right now. Talking to Mr. Van Dyk. About you.`);
    const p = this.presence('foyer'); if (p) say(p);
    this.badgeEvening();
  },
  unitTest() {
    let score = 52, notes = [];
    if (F('studied')) { score += 18; notes.push('her notes in the margins'); }
    if (F('gregNotes')) { score += 10; notes.push("Greg's colour-coded notes"); }
    if (F('studiedWithMom')) score += 15;
    if (F('readClassText')) score += 5;
    score = Math.min(score, 94);
    G.f.testScore = score + '%';
    say(score >= 75 ? `You know this. You actually know this. ${notes.length ? `You can practically hear ${notes.join(' and ')} in your head.` : ''} When you hand it in, Mr. Van Dyk glances at the first page and his moustache lifts.` : score >= 60 ? `Some of it makes sense. Some of it swims. You finish with four minutes left and a feeling like a coin toss.` : `The questions might as well be in Dutch. You write what you can. On question four, about titration, you write "you add stuff until it turns pink" and then, ashamed, cross it out.`);
    sys(`(Unit test result, posted later: ${G.f.testScore})`);
  },

  /* overnight ----------------------------------------------------------------- */
  night() {
    const d = G.day; const msgs = [];
    G.f.slept = (G.f.slept || 0) + 1;
    // ageing
    if (exists('milk') && where('milk') !== 'fridge') G.milkAge = (G.milkAge || 0) + 1;
    if (exists('cookie')) G.cookieAge = (G.cookieAge || 0) + 1;
    if (G.mix && exists('mixture') && where('mixture') !== 'fridge') G.mix.age++;
    if (exists('petri_culture')) G.f.cultureAge = (G.f.cultureAge || 0) + 1;
    // mould exposure
    const mw = this.mixWhere();
    if (G.mix && MASTER_ROOMS.includes(mw) && !G.mix.wrapped && this.mixStage() >= 1) G.f.exposure = (G.f.exposure || 0) + 1;
    else if ((G.f.exposure || 0) > 0 && !(G.mix && MASTER_ROOMS.includes(mw) && !G.mix.wrapped)) G.f.exposure = Math.max(0, G.f.exposure - (G.f.exposure >= 9 ? 1 : 2));
    if (G.f.exposure >= 12) { ending('spores'); return; }
    // discoveries
    if (mw === 'master') { setF('bustedHow', 'floor'); ending('busted'); return; }
    if (G.mix && mw === 'fridge' && this.where('noreen')) { lose('mixture'); G.mix = null; setF('fridgeTossed'); rel('noreen', -1); msgs.push(`Overnight, Noreen found your glass of sludge in her fridge. It's gone, and so is the glass. On the fridge door, a sticky note: "<i>NOT IN MY FRIDGE. — M.</i>"`); }
    if (G.mix && PUBLIC_ROOMS.includes(mw) && this.where('noreen')) { lose('mixture'); G.mix = null; rel('noreen', -1); msgs.push(`Overnight, someone found the glass of slurry you left in the ${SCENES[mw].name.toLowerCase()}. It's gone. So is the glass. Nobody says anything about it at breakfast, which is somehow worse.`); }
    if (exists('milk') && MASTER_ROOMS.includes(where('milk')) && G.milkAge >= 3 && !F('milkFoundMaster')) { setF('milkFoundMaster'); lose('milk'); rel('noreen', -2); msgs.push(`Noreen found a glass of sour milk in her bedroom. She doesn't ask. She just looks at you over breakfast for a long time, the way you'd look at a dog that has done something on the carpet.`); }
    // Don's badge
    if (F('badgeTaken') && !F('badgeReturned') && F('donNoticedBadge') && !F('donSearched')) {
      setF('donSearched');
      if (G.mix && mw === 'underbed_master') { setF('bustedHow', 'don'); ending('busted'); return; }
      msgs.push(`Overnight you heard your father turning the master bedroom inside out looking for his ID badge: drawers, pockets, under the bed. "It's not HERE, Noreen." He didn't find it. Of course he didn't. You have it.`);
    }
    // the letter / poem on the pillow
    const pl = (G.drops.master || []).concat(G.drops.bed || []);
    if (G.f.pillow) { const kind = G.f.pillow; G.f.pillow = null; lose(kind); if (this.letterGood(kind)) { setF('dearKind', kind); ending('dearmom'); return; } rel('noreen', 1); msgs.push(`In the morning the ${kind === 'poem' ? 'poem' : 'letter'} is gone from her pillow. It turns up on your own bed, folded, with "<i>Thank you. — M.</i>" written on the back. It's something. It isn't everything.`); }
    // parent-teacher night
    if (d === 7) {
      if (F('forgedIn') && !F('forgeryCaughtByMom')) { ending('forgery'); return; }
      if (['well', 'smell', 'cough'].includes(this.noreenState())) { setF('vdMetMom'); setF('ptmPending'); }
    }
    // Noreen's birthday
    if (d === 9 && !F('wishedBday') && this.where('noreen')) { rel('noreen', -2); karma(-1); msgs.push(`You never said happy birthday. She noticed. She didn't say anything about it, which is how you know exactly how much she noticed.`); }
    // final night
    if (d >= LAST_DAY) { ending('coldwar'); return; }
    G.f.morningMsgs = msgs;
  },
  morning() {
    const msgs = G.f.morningMsgs || []; G.f.morningMsgs = [];
    const d = G.day, ns = this.noreenState();
    say(`You wake in your red room. ${isWeekend() ? pick(['It\'s the weekend. Grey light, the furnace ticking.', 'Saturday-ish light. Somebody downstairs is making coffee.']) : pick(['Your alarm clock radio is playing Our Lady Peace far too loudly.', '"DAVID. SCHOOL." comes up through the floor, followed by the smell of toast.', 'The bus comes at 7:40. It\'s 7:21.'])}`);
    if (d === 9) say(`It's Saturday, October 23rd. Through the floor you hear your father singing "Happy Birthday" very badly, and being shushed.`);
    if (d === 16) say(`Halloween is tomorrow. Noreen has put a carved pumpkin on the porch with a face that looks, somehow, disappointed in you.`);
    if (d === LAST_DAY) say(`<b>Sunday, October 31st. Halloween.</b> The last day of October. Somehow it feels like a deadline.`);
    msgs.forEach(m => ev(m));
    // mould symptoms
    const e = G.f.exposure || 0;
    if (G.mix && MASTER_ROOMS.includes(this.mixWhere())) {
      if (e === 2) ev(`At breakfast, Noreen wrinkles her nose. "Don, did you leave your gym socks somewhere in our room? Something smells... off. Sour."`);
      if (e === 4) { sfx('cough'); ev(`Noreen has a cough this morning — a dry, tight little cough she keeps clearing her throat over. "It's nothing," she says. "Allergies." She's been using her inhaler.`); }
      if (e === 6) { sfx('cough'); ev(`Noreen didn't get up this morning. Don's voice through the door, low and worried: "Nor, I'm calling Dr. Moretti." From inside the room, a long rattling cough.`); }
      if (e === 7 || e === 8) { sfx('cough'); ev(`From your parents' room: coughing. It goes on a long time.`); }
      if (e === 9) { ev(`At 4 a.m. you woke to blue and red lights on your ceiling. Paramedics on the stairs. Don in his bathrobe, carrying her slippers. "They think it's some kind of pneumonia," he told you, white-faced, at the door. "Atypical. They're taking her to St. Catharines General. Feed Shelby. I'll call." Then the house was empty.`); sfx('sting_bad'); }
      if (e === 10 || e === 11) ev(`Don calls from the hospital at seven. His voice sounds like it's coming from the bottom of a well. "They've got her on oxygen. They keep asking if we've had any water damage. Mould. Anything like that." A pause. "Have we?"`);
      if (e >= 2 && e < 9 && G.karma > -3 && once('gregWorryEmail')) { /* Greg might email */ }
    } else if (e > 0) {
      ev(ns === 'hospital' ? `Don calls from the hospital. "She's breathing better. The doctors don't know why. They say she might come home in a few days."` : ns === 'well' ? `Noreen is up and about, a little pale, but herself. Her cough is nearly gone.` : `Noreen's cough sounds a little looser this morning. The air in the house feels lighter.`);
    }
    // parent-teacher aftermath
    if (F('ptmPending')) { G.f.ptmPending = false; setTimeout(() => Game.dialog('ptm'), 400); }
    // badge morning
    if (F('badgeTaken') && !F('badgeReturned') && !F('donNoticedBadge') && !isWeekend() && this.where('noreen') !== null) { setF('donNoticedBadge'); ev(`Before dawn, you hear your father stomping around the house: "Has anybody seen my BADGE? I have the eight o'clock with the VP —" The front door slams. He'll have to get a temporary one from security. They'll take a new photo. It'll be worse.`); rel('don', -1); }
    if (F('jolted')) { G.f.jolted = false; G.f.joltSleepTried = false; }
    Game.music();
  },
  afterCommand(verb, a, b) { this.tick(1); },
  tick(n = 1) {
    if (Game.ended) return;
    // Day 0: Aunt Carol's call
    if (G.day === 0) {
      if (!F('carolCallAt') && G.dayTurns >= 7) {
        if (Computer.online()) { this.modemFight(); return; }
        setF('carolCallAt', G.turns); sfx('ring'); ev(`Downstairs, the phone rings — the real phone, the kitchen one. Once. Twice. Then it stops mid-ring: Noreen has pounced on it. Faintly, through the floor: "Carol? Oh, thank God. How is she?"`);
      } else if (F('carolCallAt') && !F('carolCalled') && G.turns - F('carolCallAt') >= 6) {
        setF('carolCalled'); ev(`Through the floor you hear the kitchen phone go back into its cradle. Then nothing. Then the kettle.`);
      }
    }
    // online too long while Noreen is home
    if (Computer.online()) {
      G.f.onlineTurns = (G.f.onlineTurns || 0) + n;
      if (G.f.onlineTurns >= 14 && this.where('noreen') && !this.noreenOnPhone()) { G.f.onlineTurns = 0; this.lineNeeded(); }
    } else G.f.onlineTurns = 0;
  },
  modemFight() {
    if (Computer.isOpen) Computer.close(true);
    setF('carolCallAt', G.turns + 2); setF('cordYanked'); Computer.hangup(true);
    rel('noreen', -2); karma(-1); sfx('door');
    ev(`Downstairs, someone picks up the kitchen phone — and gets an earful of screaming modem. There's a sound like a cutlery drawer being dropped. Then footsteps: fast, furious, up all fourteen stairs. Noreen sweeps into the den without a word, follows the phone cord to the wall, yanks it out of the jack, coils it around her hand, and leaves. She didn't look at you once. The modem light goes dark. A minute later, through the floor, the phone rings, and she answers on the first ring.`);
    if (G.loc !== 'desk' && G.loc !== 'den') say(`(You hear all of this from where you are. Everybody in Garrison Village probably heard it.)`);
  },
  lineNeeded() {
    if (Computer.isOpen) Computer.close(true);
    const m = this.noreenMood();
    sfx('dialtone');
    if (m === 'warm' || m === 'thaw') { Computer.hangup(true); ev(`A gentle knock on the den door frame. "Sweetheart? I need the line for ten minutes. Sorry." She waits until you disconnect. "Thank you." You notice that she said sorry. You notice that you didn't mind.`); }
    else { Computer.hangup(true); rel('noreen', -1); ev(`Downstairs, the kitchen phone gets picked up mid-screech. "DAVID! OFF! NOW!" You disconnect before she comes up the stairs. Through the floor, the slam of a receiver.`); }
  },

  /* ------------------------------------------------------------------ milk, cookie, mould */
  milkSour() { return (G.milkAge || 0) >= 2; },
  cookieStale() { return (G.cookieAge || 0) >= 3; },
  mixStage() { if (!G.mix) return 0; const a = G.mix.age; return a >= 6 ? 2 : a >= 3 ? 1 : 0; },
  mixWhere() { return where('mixture'); },
  moldInMaster() { return !!G.mix && MASTER_ROOMS.includes(this.mixWhere()); },
  mixFromMaster() { return !!G.mix && (G.mix.master || 0) > 0 || F('placedMaster'); },
  cultureReady() { return (G.f.cultureAge || 0) >= 3; },
  cookieMilk() { Game.dialog('dunk'); return null; },
  makeMixture(src) {
    const sour = this.milkSour();
    lose(src); swap('milk', 'mixture'); G.mix = { age: Math.max(0, (G.milkAge || 0) - 1), wrapped: false, made: G.day, master: 0 };
    sfx('squish'); karma(-1); setF('madeMixture');
    return `${src === 'crumbs' ? 'You sprinkle the crumbs into the glass' : 'You snap the cookie into pieces over the glass and drop them in'}, then stir it with your finger until the milk goes the colour of wet cardboard and the chocolate chips sink like little stones. ${sour ? 'The sour milk curdles around the crumbs. It smells like a mistake.' : ''} You've made something. You're not sure what. A feeling, maybe. A small, ugly feeling in a tall glass.`;
  },
  leaveMixture(scene) {
    if (scene === 'underbed_master') {
      drop('mixture', 'underbed_master'); sfx('drop');
      if (!F('placedMaster')) { setF('placedMaster'); setF('placedDay', G.day); karma(-5); }
      G.mix.master = (G.mix.master || 0) + 1;
      return `You slide the glass across the carpet, deep under your parents' bed, until it's sitting in the dark beside your mother's slippers. Warm air from the floor vent breathes over it. Nobody will see it here. Nobody ever looks under here. You lower the dust ruffle. Your hands, you notice, are shaking a little. ${this.mixStage() >= 1 ? 'Already it smells.' : ''}`;
    }
    if (scene === 'master') {
      drop('mixture', 'master'); setF('placedMaster'); karma(-3);
      return `You set the glass down on your parents' bedroom carpet, right out in the open. That's... a choice. She will absolutely see that.`;
    }
    if (scene === 'underbed_david') { drop('mixture', 'underbed_david'); sfx('drop'); return `You slide the glass under your own bed, between the shoebox and the dust bunnies. Warm. Dark. Your own private laboratory. Your experiment, your risk.`; }
    if (scene === 'desk') { drop('mixture', 'desk'); return `You set the glass of slurry down on the desk next to the keyboard. It looks back at you.`; }
    return undefined;
  },
  wrapMix() {
    if (!has('cling')) return `You'd need something to seal it with.`;
    if (!exists('mixture')) return `Nothing to wrap.`;
    if (G.mix.wrapped) return `It's already sealed. The cling wrap is starting to dome upward. That's probably fine.`;
    G.mix.wrapped = true; karma(1);
    return `You stretch a layer of cling wrap tight across the top of the glass and smooth it down the sides. Sealed. Whatever grows in there now, stays in there. That feels... responsible. Weirdly responsible.`;
  },
  culture() {
    if (!has('petri')) return `You'd need a petri dish.`;
    if (!exists('mixture')) return `You need something to culture.`;
    swap('petri', 'petri_culture'); G.f.cultureAge = this.mixStage() >= 1 ? 2 : 0; setF('madeCulture'); if (this.mixFromMaster()) setF('cultureFromMaster');
    return `You lift the lid, dip a clean pen cap into the slurry, and streak it across the agar in a zig-zag the way Mr. Van Dyk taught you in September, when you weren't listening, and apparently were. Lid on. ${this.mixStage() >= 1 ? 'There\'s already a lot going on in that glass. This should take quickly.' : 'Now it needs time, and warm, and dark.'}`;
  },
  fridgePut(id) {
    if (id === 'cookie') return `You don't put cookies in the fridge. That's how you get a cold, sad cookie. Even you have principles.`;
    drop(id, 'fridge'); sfx('fridge');
    if (id === 'milk') return `You put the glass of milk in the fridge, next to the bag of 2%. Cold, safe, and out of your sight. Very mature, actually.`;
    if (id === 'mixture') return `You slide the glass of slurry into the back of the fridge, behind the pickles. The cold will stop anything growing in it. It will not stop Noreen.`;
    return `You put it in the fridge.`;
  },
  fridgeLook() { const mine = (G.drops.fridge || []).map(itemName); return `The fridge door is a mosaic: a Canadian Tire magnet calendar, a Pizza Pizza magnet, your Grade 4 drawing of a dinosaur (still up), a "SHELBY — VET — NOV 3" card, and a postcard of Niagara Falls from Grandma Ruth that just says "WET." ${mine.length ? `Inside, behind the milk bag: your ${mine.join(' and ').toLowerCase()}.` : ''}`; },
  fridgeOpen() {
    sfx('fridge'); setF('sawStarter');
    const mine = (G.drops.fridge || []).map(itemName);
    return `You open the fridge and stand in its cold light like your father always tells you not to. A bag of 2% in the plastic jug, leftover lasagna, Don's Clamato, a jar of pickles, and on the top shelf, front and centre, a mason jar of bubbling grey-beige goo with masking tape on the lid: <b>"#4 — LE '79 — FEED SATURDAYS — DO NOT TOUCH (THIS MEANS YOU, DON)."</b> ${mine.length ? `And your ${mine.join(' and ').toLowerCase()}, at the back.` : ''}`;
  },
  fridgeTake() {
    const mine = G.drops.fridge || [];
    if (mine.length) { const id = mine[mine.length - 1]; give(id); return `You take ${theItem(id).replace(/^the /, 'your ')} back out of the fridge.`; }
    if (has('glass_empty') || has('glass_clean')) return this.refillMilk();
    return `You don't need anything from the fridge. You just like opening it.`;
  },
  washGlass() {
    if (!has('glass_empty')) return `Nothing to wash.`;
    swap('glass_empty', 'glass_clean'); sfx('splash'); setF('washedGlass');
    if (here('noreen')) { rel('noreen', 1); return `You wash the glass at the sink — hot water, Sunlight, actually scrubbing — while she watches from the corner of her eye. She doesn't say anything. She doesn't have to.`; }
    return `You wash the glass with hot water and Sunlight. It squeaks. You are seventeen years old and you have washed a dish without being asked. Somewhere, a choir sings.`;
  },
  refillMilk() {
    const g = has('glass_clean') ? 'glass_clean' : has('glass_empty') ? 'glass_empty' : null;
    if (!g) return `You'd need a glass.`;
    if (this.noreenState() === 'hospital') return `The milk bag is empty. Nobody's been shopping.`;
    swap(g, 'milk'); G.milkAge = 0; sfx('pour');
    return `You pour fresh milk from the bag in the jug, tilting it carefully so it doesn't glug. Bagged milk: the great Canadian secret. A tall cold glass, again.`;
  },

  /* ------------------------------------------------------------------ Shelby */
  shelbyMilk() { swap('milk', 'glass_empty'); setF('shelbyMilk', G.day); sfx('yap'); return `You set the glass down. Shelby drinks the whole thing in about four seconds, flawlessly, then sneezes milk out of his nose and looks up at you with total love. Corgis and lactose: not friends. Anyone downwind of Shelby tonight will learn this.`; },
  shelbyChocolate(src) {
    if (!F('chocWarned')) { setF('chocWarned'); return `You hold out ${theItem(src)}. Shelby's nose goes into overdrive. And then something tugs at the back of your brain — Greg, last spring, going on about <i>theobromine</i>: chocolate is poison to dogs, and a little dog is a little body. You pull your hand back. Shelby looks betrayed.`; }
    lose(src); karma(-3); setF('dogChoc', src); sfx('yap');
    return ending('dogdays');
  },
  shelbyTreat() { if (!has('treats')) return `You'd need treats.`; lose('treats'); setF('shelbyLoves'); karma(1); sfx('yap'); return `You crouch way, way down and hold out the dog biscuits. Shelby sits — properly sits, for once — and takes them one at a time with tremendous gentleness, then pushes his whole head into your hand. Afterward he trots to his bed, picks up his tennis ball, and drops it on your foot. An offering. You've been accepted.`; },
  takeBall() { if (!F('shelbyLoves')) { sfx('bark'); return `You reach for the tennis ball. Shelby gets there first and stands over it, growling a tiny growl. It's HIS. You haven't earned the ball.`; } give('ball'); return `Shelby lets you take the ball. He's quivering with anticipation.`; },
  shelbyFetch() { sfx('yap'); return pick([`You throw the ball across the patio. Shelby launches after it, skids on wet leaves, recovers, retrieves, returns, drops it at your feet, barks. Again. Again. Again. For a few minutes, your whole life is this, and it's fine.`, `You throw it. Shelby brings it back. You throw it. Shelby brings it back. You could do this until Y2K.`, `You throw the ball over the fence by accident. Shelby stares at the fence, then at you, devastated. A small hand reaches over from next door and tosses it back. "Thanks," you say. "No prob," says the fence.`]); },
  letShelbyIn() {
    if (G.phase === 'school') return '';
    sfx('door'); setF('shelbyInCount', (F('shelbyInCount') || 0) + 1);
    if (G.mix && this.mixWhere() === 'underbed_master' && this.mixStage() >= 1) {
      say(`You slide open the patio door and Shelby rockets past your shins into the house, nails skittering on the tile. He doesn't go for the kitchen. He doesn't go for the couch. He goes straight up the stairs, ears flat, nose down, like he's on a mission — into the master bedroom — and under the bed. And then the barking starts.`);
      setF('bustedHow', 'shelby'); ending('busted'); return null;
    }
    go('kitchen', true);
    return `You slide open the patio door. Shelby rockets inside, does three laps of the kitchen island, skids into the living room, barks at the TV, barks at the ficus, and comes back to the kitchen to stand in the exact spot where Noreen ${this.where('noreen') ? 'is standing' : 'usually stands'}. ${this.where('noreen') ? `"<i>David!</i> Out — Shelby, OUT — David, he's wet!" ` : ''}You herd him back out onto the patio. He seems pleased with the whole tour.`;
  },

  /* ------------------------------------------------------------------ quiz & past */
  forge() {
    if (!has('quiz')) return `You need something to sign.`;
    if (!has('grocery') && !F('readGrocery')) return `You practise her signature on your palm. It looks like the signature of a kidnapper. Without something in her handwriting to copy, you'd never pull it off.`;
    swap('quiz', 'quiz_forged'); lose('pen'); give('pen', true); karma(-3); setF('forged');
    return `You put her grocery list beside the quiz and study the way her N loops back on itself, the way the "een" runs together like water. Then you sign. <i>Noreen.</i> It's good. It's really, really good. You look at it for a long time and feel like someone has opened a window in your stomach.`;
  },
  signQuiz(who) { if (has('quiz')) swap('quiz', 'quiz_signed'); setF('quizSigned'); setF('quizSignedBy', who); },
  learnPast(src) {
    if (!F('knowsPast')) { setF('knowsPast'); setF('hintPast'); sfx('sting_event'); if (src !== 'noreen' && src !== 'don') { karma(1); setTimeout(() => ev(`You stand there for a minute, holding it. Your mother had a whole life. A lab. Her name on a door. You told her she doesn't do anything all day.`), 50); } }
    setF('past_' + src);
  },

  /* ------------------------------------------------------------------ Don's badge */
  badgeOnDresser() { return !F('badgeTaken') && this.where('don') && G.phase !== 'morning' && G.day > 0 && this.noreenState() !== 'hospital'; },
  takeBadge() {
    if (F('badgeTaken') && !F('badgeReturned')) return `You already have it.`;
    if (!this.badgeOnDresser()) return `There's nothing on the tray worth taking. Keys. Lint.`;
    setF('badgeTaken'); setF('badgeReturned', false); give('badge'); karma(-1);
    return `You palm your father's ID badge. Canadian Tire Financial Services. "DON." His photo looks up at you, trapped and blinking. He can't get into his building without this. You put it in your pocket anyway.`;
  },
  badgeEvening() {},
  returnBadge(onDresser) {
    if (!has('badge')) return `You don't have it.`;
    lose('badge'); setF('badgeReturned');
    if (onDresser) { karma(1); return `You put the badge back on his valet tray, exactly where it was, a little to the left of his keys. ${F('donNoticedBadge') ? 'Tomorrow he will find it and think he is losing his mind.' : 'He\'ll never know.'}`; }
    if (F('donNoticedBadge')) { rel('don', 2); karma(1); return `"Found your badge," you say, holding it out. He takes it and looks at it, then at you, a long look over his glasses. "Found it." "Yeah." "Where?" A long pause. "...I took it." He nods slowly. "Thank you for saying so." He clips it on. "The temporary one made me look like a hostage." "This one makes you look like a hostage." "Yes, but it's my hostage."`; }
    rel('don', 1); return `You hand him his badge. "Oh — thanks, Stretch. Where was that?" "On the stairs," you lie, smoothly, and feel bad about how smoothly.`;
  },

  /* ------------------------------------------------------------------ tea, letters, gifts */
  teaPrep() { return `A tea bag in a cold mug isn't tea. You need hot water: the kettle's in the kitchen.`; },
  makeTea() {
    if (!has('mug')) return `You need a mug.`;
    if (!has('teabag')) return `Hot water, ready, but no tea bag. The red tin's on the counter.`;
    if (G.loc !== 'kitchen') return `The kettle's in the kitchen.`;
    lose('teabag'); swap('mug', 'tea'); G.f.teaMadeDay = G.day; sfx('kettle'); sfx('pour', 2.6);
    return `You boil the kettle, drop the tea bag in her chipped mug, pour, wait the full four minutes (she can tell), fish out the bag, and add a splash of milk from the jug until it's the colour of a paper bag. The way she likes it. You didn't know you knew that. You did.`;
  },
  takePrint() {
    if (F('printWaiting')) { setF('printWaiting', false); const k = F('printKind') || 'letter'; give(k); setF('letterTaken'); return k === 'poem' ? `You take the printed poem out of the tray. The ink is still a little tacky.` : `You take the printed letter out of the DeskJet tray. Warm. Slightly green, because of the cyan cartridge. Yours.`; }
    return undefined;
  },
  letterGood(kind) {
    if (kind === 'poem') return true;
    const t = (G.f.letterText || '').toLowerCase();
    let s = 0;
    if (/sorry|apolog/.test(t)) s += 2;
    if (/grandma|phone|line|carol/.test(t)) s += 1;
    if (/didn.?t mean|shouldn.?t have|wrong|cruel|mean|hurt/.test(t)) s += 1;
    if (/love|thank/.test(t)) s += 1;
    if (t.length > 120) s += 1; if (t.length > 350) s += 1;
    if (/whatever|bourgeois|your fault|deserved|shut up|leave me alone|hate you|stupid/.test(t)) s -= 4;
    G.f.letterScore = s;
    return s >= 3;
  },
  letterOnPillow(kind = 'letter') {
    if (!has(kind)) return `You'd need something to leave.`;
    if (this.noreenState() === 'sick' || this.noreenState() === 'hospital') return `She's not sleeping in that bed in any way that a letter could help right now.`;
    if (G.loc !== 'master') return `It should go on her pillow — in the master bedroom.`;
    lose(kind); G.f.pillow = kind; setF('leftLetter');
    return `You prop the ${kind === 'poem' ? 'poem' : 'letter'} up against her pillow on the left side, where she'll find it when she pulls back the thirty decorative cushions tonight. You almost take it back. You don't.`;
  },
  giveLetter() { if (!has('letter')) return; if (!this.where('noreen')) return; return `You hold out the letter. She looks at it — then back at you, as if trying to read your face first. "What's this?" You can't do it. Not in person, not with her watching. You put it back in your pocket. Maybe her pillow. Maybe tonight.`; },
  givePoem() { if (!has('poem')) return; lose('poem'); rel('noreen', 2); karma(1); setF('gavePoem'); return `You hand her the poem. She reads it once fast and once slow, and somewhere in the second reading she has to put her hand over her mouth. "Ms. Penner's class," she says. "Grade six. You wouldn't let me read it. You said it was 'classified.'" She folds it into her cardigan pocket. "Thank you, sweetheart." Her voice goes on "sweetheart." She gets it back.`; },
  giveCupcake() { lose('cupcake'); setF('gaveCupcake'); rel('noreen', G.day === 9 ? 3 : 1); if (G.day === 9) setF('wishedBdayGift'); return G.day === 9 ? `You hold out Greg's Mole Day cupcake. "Happy Mole Day," you say. "Also — happy birthday." She stares at the little chocolate mole with its jellybean nose, and then she laughs so hard she has to sit down. "You know what Mole Day is?" "Greg told me." "Oh, I love Greg," she says, wiping her eyes. "Six-oh-two, ten-twenty-three. Do you know I used to tell people I was born at six-oh-two? I wasn't. It was four in the afternoon. I just liked the idea." ${F('wishedBday') ? '' : ''}` : `You give her Greg's Mole Day cupcake. She examines the little mole face. "Is this a — mole? As in Avogadro?" "Greg made it." "Of course he did." She puts it on a saucer like it's precious.`; },
  giveLabcoat() { lose('labcoat'); rel('noreen', 2); setF('gaveLabcoat'); Story.learnPast('noreen'); return `You hold out the folded lab coat with her name on the pocket. She takes it in both hands. She doesn't say anything for a long time. Then she shakes it out, holds it up against you, and laughs. "It would come to your elbows." "It does. I tried it on." "Of course you did." She folds it again, slowly, the way you'd fold a flag.`; },
  giveNoreenMeds(id) { lose(id); rel('noreen', 1); karma(1); return { tylenol: `You bring her two Tylenol and a glass of water. "My hero," she rasps.`, inhaler: `You put her inhaler in her hand. She takes two puffs and the coughing eases. "Thank you, sweetheart." She closes her eyes.`, tissue: `You hand her a tissue. She uses it, then holds onto your hand for a second before letting go.`, tea: `You bring her tea. She can barely hold the mug. She sips it anyway. "Perfect," she whispers.` }[id]; },
  poemText() { return `MY MOM\nby David — Grade 6, Ms. Penner's class\n(May 1993)\n\nMy mom is very smart.\nShe knows what every chemical does\nand which ones make bread go up.\nShe can make a cookie out of almost nothing\nand fix a cut, and a broken lamp,\nand also my feelings.\nShe says I ask too many questions\nbut she always answers them.\nI love my mom more than Nintendo.\n(That is a lot.)\n\nTHE END`; },

  /* ------------------------------------------------------------------ odds & ends */
  playRage() { sfx('sub'); inc('rageCount'); if (this.where('noreen') && isNight()) rel('noreen', -1); return `You put on <i>Evil Empire</i> and crank it. Zack de la Rocha yells about the system. The boombox distorts. The red walls throb. Downstairs, ${this.where('noreen') ? 'a broom handle thumps the kitchen ceiling three times. Message received. You turn it down to merely loud.' : 'nobody is home to object, which is somehow less satisfying.'}`; },
  openBackpack() {
    const got = [];
    if (!exists('quiz') && !exists('quiz_signed') && !exists('quiz_forged') && !F('quizIn') && !F('quizOut')) { give('quiz'); setF('quizOut'); got.push('the folded chemistry quiz you\'ve been trying not to think about'); }
    if (!exists('calculator') && !F('calcOut')) { give('calculator', true); setF('calcOut'); got.push('your TI-83'); }
    return `You unzip the backpack: a French textbook, a crushed granola bar, a Discman with dead batteries, a permission slip for a field trip to the Shaw Festival that already happened. ${got.length ? `You take out ${got.join(' and ')}.` : 'Nothing else you need.'}`;
  },
  stashSummary(sc) { const a = (G.drops[sc] || []).map(id => theItem(id).replace(/^the /, '')); return a.length ? `Stashed here: ${a.join(', ')}.` : ''; },
  peekGift() {
    if (F('peekedGift')) return `The gift is re-taped, badly. You can see where you opened it.`;
    return Game.dialog('gift'), null;
  },
  mirrorLevel() { const k = G.karma; return k >= 6 ? 5 : k >= 2 ? 4 : k >= -1 ? 3 : k >= -5 ? 2 : 1; },
  mirrorText(full) {
    const L = this.mirrorLevel();
    const base = [, `Something's wrong with the light. The boy in the mirror is all angles and shadow — the cheekbones too sharp, the eyes sunk deep and glinting red where the bulbs catch them. His uneven ears throw long, crooked shadows up the wall. He's smiling. You are not smiling. You are almost certain you are not smiling. ${this.moldInMaster() ? 'Fine grey dust hangs in the air around him, like spores.' : ''}`,
      `The boy in the mirror looks shifty. Dark circles. A smirk that you didn't put there. One bulb flickers green above him. He looks like the kind of kid security follows around Mac's Milk.`,
      `The boy in the mirror: six-six, one-forty, a long thin neck, a prominent Adam's apple, shaggy curtains of brown hair, and the ears — the left one sticking out further and sitting higher than the right, like it's trying to hear something the other one can't. He looks tired. He looks sulky. He looks, mostly, seventeen.`,
      `The boy in the mirror looks... all right, actually. A little tired. A small tentative smile you didn't know you could make. The ears are still uneven, but on a good day you could almost call that character.`,
      `The boy in the mirror is standing up straight for once, in warm gold light, with a shy, honest smile. The ears are exactly as uneven as ever — the left one up and out, the right one down and in — and somehow, today, they look like they belong on someone decent. He looks like someone you'd trust. He looks like her son.`][L];
    return full ? base + ` <i>(${['', 'You feel sick looking at him.', 'You don\'t like him much.', 'You\'re used to him.', 'You kind of like him.', 'You\'d be friends with him.'][L]})</i>` : base;
  },
  mirrorSpeak() {
    const L = this.mirrorLevel();
    return [, `"What did you do?" you whisper. The boy in the mirror mouths it back, a half-second late.`, `"I'm not a bad person," you tell him. He doesn't look convinced.`, `"Hey," you tell your reflection. "You're fine." Your reflection looks like it would like a second opinion.`, `"Not bad," you tell him. He grins. Dork.`, `"Good job," you tell him, and mean it, and feel ridiculous, and mean it anyway.`][L];
  },
  mailLook() {
    return `The mail on the console table: a Canadian Tire flyer (Halloween costumes, 20% off snow tires), a Columbia House envelope promising 12 CDs for a penny, a Bell Canada bill, and something for Noreen from Brock University Alumni Affairs. ${exists('grocery') || F('tookGrocery') ? '' : 'Tucked under it all: her grocery list, in her perfect handwriting.'}`;
  },
  takeGrocery() { if (exists('grocery') || F('tookGrocery')) return `Bills and flyers. Nothing else worth taking.`; setF('tookGrocery'); give('grocery'); return `You take Noreen's grocery list. Her handwriting is like calligraphy.`; },
  cookieJar() {
    if (this.noreenState() === 'hospital') return `The cookie jar is empty. Nobody's baked.`;
    if (exists('cookie')) return `You open the barn's roof. A few more cookies, the same as yours. You don't need two. She counts them anyway.`;
    give('cookie'); G.cookieAge = 0; setF('jarCookie');
    return `You lift the barn's roof. Inside: a dozen of the same cookies — brown-butter edges, that sour-sweet tang. She made a whole batch. Before the fight, you realise. These were for you before they were sarcastic. You take one.`;
  },
  usePhone() { Game.dialog('phone'); return null; },
  calendar() {
    setF('sawCalendar');
    return `The kitchen calendar: "Lakes &amp; Vineyards of Niagara 1999," October's photo a sunset over Lake Ontario. In Noreen's handwriting: <b>Fri 15 — MOM SURGERY 8am — SCGH rm 412 (684-7271)</b> · <b>Thu 21 — Parent-Teacher, NDSS 6pm</b> · <b>Fri 22 — D. quiz signed??</b> (she knows?) · <b>Sat 23 — ★</b> (just a star, and in Don's handwriting underneath: "<i>N's b-day!! cake!!</i>") · <b>Sun 31 — Halloween / candy!</b> Every Saturday has a tiny note: "feed #4."`;
  },
  cabinets() {
    const got = [];
    if (!exists('cling') && !F('gotCling')) { setF('gotCling'); give('cling', true); got.push('a box of plastic wrap'); }
    if (!exists('mug') && !exists('tea') && !F('gotMug')) { setF('gotMug'); give('mug', true); got.push('her chipped tea mug'); }
    if (!exists('treats') && !F('shelbyLoves') && !F('gotTreats')) { setF('gotTreats'); give('treats', true); got.push('a few dog biscuits from the high shelf'); }
    if (got.length) sfx('pickup');
    return `Plates, glasses in neat rows, Tupperware lids without bottoms, the junk drawer of rubber bands and twist ties and Canadian Tire money. ${got.length ? `You take ${got.join(', ')}.` : 'Nothing else you need.'}`;
  },
  tv() { sfx('tv'); const d = G.day; return pick([`CBC: Peter Mansbridge, solemn, about Y2K preparedness and whether you should fill your bathtub on New Year's Eve.`, `TSN: Leafs and Senators. Mats Sundin carries the puck in. The Air Canada Centre crowd sounds like a distant ocean.`, `MuchMusic: Rick the Temp's Christmas-coloured hair. Then a Backstreet Boys video. You change the channel faster than you've ever done anything.`, `YTV: a cartoon you're too old for. You watch eleven minutes of it.`, `The Weather Network, local forecast on the 8s, smooth jazz underneath. Rain for Niagara. Of course.`, `CHCH Hamilton: a news piece about the Canadian Tire money "collector's market." Your father would be riveted.`, `A Pizza Pizza ad. "Nine-six-seven, eleven-eleven, call Pizza Pizza, hey hey hey!" It's in your head for the rest of your life.`]); },
  tvGuide() { return `The TV Guide, Oct. 9–15 edition, with Noreen's pen circles: <i>Coronation Street</i>, <i>The National</i>, and — circled twice, with a star — a PBS documentary called <i>The Secret Life of Yeast</i>.`; },
  couchCoins() { if (F('gotCoins')) return `You've already strip-mined the couch. Only crumbs and a Lego remain.`; setF('gotCoins'); give('coins'); return `You dig under the sofa cushions: a TV Guide from 1997, a Lego, popcorn kernels, a hairpin, and seventy-five cents. Finders keepers.`; },
  pool() { if (here('don')) { Game.dialog('don_pool'); return null; } sfx('pool'); return `You knock the balls around by yourself. On your third shot the back of your cue goes into the panelling. There's a dent there now, next to all the other dents, which are also yours.`; },
  nes() { sfx('nes'); inc('nesPlays'); return F('nesPlays') >= 3 ? `You play <i>Shadowgate</i> again. You die again — this time by opening a door you knew was trapped. "It's a sad thing that your adventures have ended here," the screen says. You turn it off. You know the feeling.` : pick([`You play <i>Shadowgate</i>. Your torch goes out in the hall of mirrors and you die. "It's a sad thing that your adventures have ended here!!"`, `You play <i>Shadowgate</i>. You drink a mysterious potion. You die. Typical.`]); },
  gasTap() { sfx('gas'); inc('gasCount'); if (F('gasCount') >= 2) { karma(-1); return `You crack the gas tap again. Hissssss. Greg slaps your hand off it. "DUDE." Mr. Van Dyk, without turning around from the board: "Whoever is playing with the gas, I can smell you, and I will remember your face."`; } return `You twist the gas nozzle a quarter turn. A faint hiss and the smell of rotten eggs (they add that so you can smell leaks, Greg informs you). You turn it off before anyone notices.`; },
  lightBurner() { if (G.day === 1) { setF('litBurner'); return `Following the speech, you turn the gas on, strike the striker — <i>skritch, skritch</i> — and the burner catches with a soft <i>whump</i>. You twist the collar. Yellow, sooty... then blue. A happy flame. Greg gives you a thumbs-up. You feel unreasonably proud.`; } return `Today isn't a burner day. Mr. Van Dyk has eyes in the back of his head, and the back of his head is pointed at you.`; },

  /* ------------------------------------------------------------------ Greg & Van Dyk */
  gregOnline() {
    if (G.phase === 'morning' || G.phase === 'school') return false;
    if (G.day === 0) return true;
    return true;
  },
  gregAdvice() {
    if (this.moldInMaster()) return `*He looks at you very seriously.* First thing: get that glass out of your parents' room. I'm not kidding, man. Everything else comes after that.`;
    if (this.apology() === 0) return pick([`*He counts on his fingers.* One: apologise. For the actual thing. Two: don't say "but." Three: shut up and let her talk. That's it. That's the whole algorithm.`, `If talking is hard — and with you, talking is hard — write it down. Notepad, then print it on your printer. Leave it on her pillow or something. My mom kept every note I ever wrote her. In a shoebox. It's embarrassing. It's also kind of awesome.`, `Make her a cup of tea. My dad used to do that after fights. It's like, "I'm sorry" in liquid form.`]);
    if (!F('knowsPast')) return `*He thinks.* You apologised? Good. Okay, so — now what? Ask her about her life. Like, actually ask. Parents are people. It's horrifying, but it's true.`;
    return `*He grins.* Dude, you have a chemistry genius for a mother and a chemistry unit test coming up. Ask her for help. It's the most obvious thing in the world. Even I can see it, and I can't even see my own feet.`;
  },
  giveGreg(id) {
    switch (id) {
      case 'cookie': lose('cookie'); rel('greg', 1); setF('gregAteCookie'); setF('hintPast'); return `Greg takes the cookie like it's a holy relic. "Your mom's? Her cookies are LEGENDARY." He bites. He chews. His eyes go distant. "Okay, see, there's a fermentation note in here. Like sourdough. Like a <i>wild yeast</i>. Dude, your mom's cookies are alive. That's — that's so cool. Is she a scientist or something?"`;
      case 'milk': return `"Is this... the milk? The sarcastic milk?" Greg holds up both hands. "I can't take that, man. That's between you and her."`;
      case 'mixture': case 'petri_culture':
        if (id === 'petri_culture' && !this.cultureReady()) return `Greg peers into the dish. "Give it a couple more days. Science is mostly waiting."`;
        if (id === 'mixture' && this.mixStage() < 2) return `Greg peers into the glass. "It's... a soggy milkshake. Give it time. Or don't. Ew."`;
        return this.discovery(id, 'greg');
      case 'ctmoney': lose('ctmoney'); rel('greg', 1); if (!has('petri') && !has('petri_culture')) { give('petri'); setF('gregPetri'); return `Greg's eyes go wide. "Canadian Tire money? Two thirty-five? Do you know some of the 1961 notes are worth fifty bucks to collectors?" He reaches into his backpack. "Okay. Fair trade." He hands you a petri dish, sealed. "From my personal stash. Don't ask."`; } return `"CANADIAN TIRE MONEY!" Greg carefully files it in his binder. "You're a true friend."`;
      case 'quiz': setF('toldGregQuiz'); setF('gregNotes'); return `Greg reads it and winces. "Okay. Okay. My notes. You're getting my notes. That's not a question."`;
      case 'textbook': case 'notebook': case 'photo': this.learnPast('greg'); setF('toldGregPast'); return `Greg looks at it, then at you. "Noreen <i>Ashby</i>? Brock '68? Is this your MOM'S? Dude." He reverently turns a page. "Her notes are better than the textbook. Her notes are better than <i>Van Dyk</i>. Show him. No — wait — ask HER. Ask her to help you with titration. You live with a titration wizard!"`;
      case 'sodium': return `Greg sees the jar and goes pale. "Is that Van Dyk's SODIUM? David. Put it back. Put it BACK. Do you know what happens if that touches water? Put it back before something bad happens to you or a toilet."`;
      case 'cupcake': return `"No, that's yours! I made it for you." A pause. "Okay, if you're not going to eat it, give it to your mom. Isn't her birthday, like, Mole Day? That's the coolest birthday in the world."`;
      case 'calculator': return `Greg takes your TI-83, punches buttons faster than you can follow, and hands it back. "Tetris high score: beaten. You're welcome."`;
      case 'letter': return `Greg reads it, slowly. Then he hands it back very carefully. "That's good, man," he says, and his voice is a little thick. "Give it to her."`;
      case 'plunger': return ITEMS.plunger.use.greg;
      case 'badge': return `"Why do you have your dad's work badge? Is this a heist? Are we doing a heist?" He thinks. "Put it back."`;
    }
  },
  giveVanDyk(id) {
    switch (id) {
      case 'quiz': case 'quiz_signed': case 'quiz_forged': Game.dialog('vandyk', 'quiz'); return null;
      case 'mixture': case 'petri_culture':
        if (id === 'petri_culture' && !this.cultureReady()) return `Mr. Van Dyk peers at the dish. "Too early to say. Come back in a few days. And David — keep it warm."`;
        if (id === 'mixture' && this.mixStage() < 2) return `Mr. Van Dyk peers at the glass. "That's... a soggy dessert, David." He hands it back. "Interesting smell, though. Let it go a while longer. Somewhere safe."`;
        return this.discovery(id, 'vandyk');
      case 'sodium': lose('sodium'); setF('tookSodium', false); karma(2); return `You put the jar of sodium on his bench. He looks at it. He looks at you. He goes, for a second, very still. "Thank you for returning this," he says quietly. "Don't ever do that again." He puts it back where it belongs and you will never, ever know what he was thinking.`;
      case 'textbook': this.learnPast('vandyk'); setF('toldVD'); return `He takes the old textbook and opens the cover. "Morrison and Boyd, 1968 — Noreen <i>Ashby</i>?" He looks up at you. "As in Lakeshore Estates? As in strain number four?" He flips through her margin notes and laughs out loud. "These are better than mine. Do you know who your mother <i>is</i>?"`;
      case 'cupcake': return `"Ah! A mole! Very good. Very topical." He does not take it. "Give it to someone who'll appreciate the historical context."`;
      case 'letter': return `He glances at it and hands it back. "This isn't addressed to me, David."`;
    }
  },
  discovery(id, who) {
    const fromMaster = id === 'mixture' ? this.mixFromMaster() : F('cultureFromMaster');
    const ns = this.noreenState();
    if (fromMaster && ns !== 'well') { setF('antidote'); ending('confession'); return null; }
    setF('discoveryVia', who); setF('discoveryItem', id); ending('penicillin'); return null;
  },
};

/* ======================================================================
   Small dialogs used by Story
   ====================================================================== */
dialog('dunk', { who: 'narrator', nodes: { start: { t: `You hold the cookie over the tall glass of milk. A decision presents itself.`,
  ch: [
    { t: 'Dunk it, and eat it.', tag: 'act', go: 'dunk' },
    { t: 'Crush it into the milk.', tag: 'act', do: () => { const r = Story.makeMixture('cookie'); say(r); }, end: true },
    { t: 'Never mind.', tag: 'silent', end: true },
  ] },
  dunk: { do: () => { lose('cookie'); sfx('crunch'); setF('dunked'); }, t: `You dunk the cookie. Three seconds — the perfect amount, the amount she taught you when you were five, kneeling on a kitchen chair. It's soft and warm and good. You eat it in two bites, standing up, alone, and it is one of the better moments of your week, and you hate that.`, end: true } } });

dialog('gift', { who: 'narrator', nodes: { start: { t: `In the bin, on top of the wrapping paper: a box-shaped gift, already wrapped in snowman paper, with a tag in Noreen's handwriting: <b>"D. — Xmas '99 — NO PEEKING (I MEAN IT)."</b> It's October. She's already done your Christmas shopping. The tape is just barely holding at one corner.`,
  ch: [{ t: 'Peek.', tag: 'act', go: 'peek' }, { t: 'Leave it alone.', tag: 'kind', do: () => karma(1), go: 'leave' }] },
  peek: { do: () => { setF('peekedGift'); karma(-1); }, t: `You slide a fingernail under the tape. Through the gap you can read the box: <b>ZOLTRIX PHANTOM 56K V.90 MODEM — "Twice the speed!"</b> She bought you a faster modem. She bought you a faster modem in October, before the fight, so you could spend even more time on the computer she complains about. You tape it back. Badly. You sit there on the carpet for a while.`, end: true },
  leave: { t: `You leave it. Some surprises are a gift, too. You lower the dust ruffle back down.`, end: true } } });

dialog('ptm', { who: 'noreen', p: () => F('quizSigned') && F('quizIn') ? 'warm' : 'stern', nodes: {
  start: { who: 'narrator', t: `There's a knock on your door frame. Noreen is standing there in her cardigan, car keys still in her hand from last night, as if she's been holding them since parent-teacher interviews.`, go: 'n1' },
  n1: { redirect: () => F('quizSigned') && F('quizIn') ? 'good' : F('quizSignedBy') === 'don' ? 'don' : 'bad' },
  good: { do: () => rel('noreen', 1), t: `Your Mr. Van Dyk is a character. *A small smile.* He says you're "brighter than your marks," and he asked me if I was <i>the</i> Noreen Ashby — from Lakeshore — and then we talked about titration curves for forty minutes and the father behind us cleared his throat six times. *She shakes her head.* I'd forgotten I could talk like that.`, end: true },
  don: { p: 'stern', do: () => { rel('noreen', -1); setF('hintPast'); }, t: `Mr. Van Dyk showed us your quiz. With your father's signature on it. *She lets that sit.* Your father and I have discussed it. At length. In the car. *A beat.* You could have come to me, David. I used to — *she stops herself.* Never mind. We'll talk about it.`, end: true },
  bad: { do: () => { rel('noreen', -1); setF('hintPast'); setF('ptmBad'); }, t: `Forty-one percent. *She says it quietly.* Mr. Van Dyk showed us. He was very kind about it. He said you were "brighter than your marks." *She looks at you.* Were you going to tell me? Or were you going to hope it went away, the way you hope everything goes away?`,
    ch: [{ t: 'I was scared you\'d be disappointed.', tag: 'honest', do: () => rel('noreen', 2), go: 'scared' }, { t: 'It\'s not a big deal.', tag: 'mean', do: () => rel('noreen', -1), go: 'notbig' }] },
  scared: { p: 'hurt', t: `*Her face does the thing — the fast car past a window.* Oh, sweetheart. I'm not disappointed you failed a quiz. I'm disappointed you thought you had to hide it. *A pause.* I used to be good at this, you know. Chemistry. A long time ago.`, end: true },
  notbig: { p: 'stern', t: `*She looks at you for a long moment.* It is to me. *And she goes downstairs.*`, end: true },
} });

dialog('vd_ptn', { who: 'vandyk', p: 'neutral', nodes: { start: { do: () => { Story.learnPast('vandyk'); }, t: `*Before the bell, Mr. Van Dyk stops at your bench, eyes bright.* David. I met your mother last night. *He leans in.* Noreen <i>Ashby</i>. Lakeshore Estates. Strain number four. I wrote a paper on that icewine in 1983! We talked titration for forty minutes. *He taps your bench.* You have a world-class fermentation chemist in your kitchen and you are getting forty-one percent. Do you see the tragedy? Do you see the <i>comedy</i>? Go home and ask her for help.`, end: true } } });

/* Phone additions that depend on story state */
(() => {
  const P = DIALOGS.phone; const base = P.nodes.start.ch;
  P.nodes.start.ch = () => { const arr = val(base); if (Story.noreenState() === 'hospital' && !Computer.online()) arr.unshift({ t: 'Call St. Catharines General — Mom\'s room', tag: 'act', go: 'hosp' }); return arr; };
  P.nodes.hosp = { who: 'don', p: 'stern', do: () => sfx('dtmf'), t: `*Ring... ring...* "Hello?" Your father, hoarse. "Stretch? Is everything okay at home?" Behind him, the beep of a monitor, and the hiss of oxygen.`,
    ch: [
      { t: '"Dad. It\'s my fault. There\'s something under your bed — the milk and the cookie. I put it there. It\'s been growing. Tell the doctors it\'s mould."', tag: 'honest', do: () => { setF('confessedToDon'); setF('phoneConfession'); ending('confession'); } },
      { t: '"Everything\'s fine. How is she?"', tag: 'lie', go: 'hosp2' },
    ] };
  P.nodes.hosp2 = { who: 'don', p: 'stern', do: () => karma(-2), t: `"They don't know. They keep asking about mould. Water damage. Anything." A long breath. "Feed Shelby. I love you, Stretch." Click.`, end: true };
})();

/* Opening hint */
DIALOGS.opening.after = () => {
  sys(`(Tip: choose a verb, then click on things. Right-click to examine. Press Space to see what's clickable. The milk and the cookie are on the desk.)`);
};

/* Self */
Object.assign(Self, {
  examine: () => `You look down at yourself, which takes a while. Six-six. A hundred and forty pounds. Size 13 feet. A faded red T-shirt with a small yellow star, jeans that end two inches above your ankles no matter what length Noreen buys. ${['', 'You feel like something is crawling under your skin.', 'You feel shifty, and a little sick.', 'You feel like yourself, unfortunately.', 'You feel all right. Lighter, somehow.', 'You feel good. Clean. Like you finally put something down.'][Story.mirrorLevel()]}`,
  speak: () => pick([`You mutter to yourself. Mostly about the bourgeoisie.`, `"Get it together," you tell yourself. You do not, at this time, get it together.`]),
  hit: `You punch yourself in the arm. Ow. Point taken, though it's not clear what the point was.`,
  consume: `You bite a fingernail. It's not a meal.`,
});

/* ======================================================================
   ENDINGS
   ====================================================================== */
endingDef('titration', { title: 'Titration', short: 'Titration', kind: 'best', img: 'titration', music: 'good',
  text: () => [
    `The kettle boils. She makes the tea; you get the textbook. She makes you get a <i>pencil</i>. And then, at eleven o'clock at night on a ${DOW[dow()]} in October, at the kitchen island in Garrison Village, your mother teaches you titration.`,
    `Not the way Mr. Van Dyk does. She does it with the measuring cup and a jar of vinegar and the red cabbage she boils into purple indicator because "every kitchen is a laboratory, David, people just don't notice." She talks with her hands. She draws curves on the back of the Canadian Tire flyer. She says "<i>slowly, slowly — the last drop is the one that matters</i>," and the cabbage water goes from purple to green all at once, and she claps, actually claps, like a girl in a lab coat in 1979.`,
    `At some point Don comes in in his bathrobe, looks at the two of you, opens his mouth, closes it again, and goes back to bed smiling.`,
    G.f.testScore ? `You got ${G.f.testScore} on the unit test. On the next one, in November, you get an 88. Mr. Van Dyk writes "WHO ARE YOU" across the top in red pen.` : `On the unit test, two weeks later, you get an 88. Mr. Van Dyk writes "WHO ARE YOU" across the top in red pen.`,
    `In December, Noreen takes a part-time job two mornings a week at a small new winery out on the Niagara Stone Road. "Consulting," she calls it, very casually, as if she hasn't bought a new lab coat. She takes a little jar of number four with her.`,
    F('badgeReturned') && F('badgeTaken') ? `(Don, for the record, never asks again where his badge went. But at Christmas he gives you a stress ball shaped like a credit card, and winks.)` : `At Christmas you open a Zoltrix 56K modem — "twice the speed!" — and she says "Don't make me regret it," and you say "I won't," and for the most part, you don't.`,
    `You never repaint the room. But you do, eventually, knock before you go into hers.`,
    `The endpoint, she told you, isn't where it changes colour. It's where it stays changed.`,
  ] });
endingDef('truce', { title: 'Milk & Cookies', short: 'Milk & Cookies', kind: 'good', img: 'truce', music: 'good',
  text: () => [
    `You stay at the island until the glasses are empty and then a while after that. She tells you about Grandma Ruth and the physiotherapist named Brent. You tell her about Greg's Matrix theory, and she has opinions about the second law of thermodynamics that you were not expecting.`,
    `She doesn't say "I forgive you." You don't say "I love you." It's a Thursday-night kind of family, and those words are kept in the china cabinet with the good plates, for occasions.`,
    `But the next night there are two glasses of milk on the island when you come down, and two cookies, and she's already sitting there with the crossword, and she pushes one glass an inch toward you with one finger without looking up.`,
    `It becomes a thing. Nobody decides it. Nine p.m., the island, two glasses, two cookies. It lasts until you leave for university, and the first night you're home from Waterloo for Christmas, there they are again.`,
    `It turns out the gift was never sarcastic. It was just wrapped that way.`,
  ] });
endingDef('dearmom', { title: 'Dear Mom', short: 'Dear Mom', kind: 'good', img: 'dearmom', music: 'good',
  text: () => [
    G.f.dearKind === 'poem' ? `She finds the poem when she pulls back the thirty pillows at ten-thirty. "MY MOM, by David, Grade 6." She reads it standing up. Then she sits down on the edge of the bed and reads it again.` : `She finds the letter when she pulls back the thirty pillows at ten-thirty. Times New Roman, slightly green from the dying cyan cartridge. She reads it standing up. Then she sits down on the edge of the bed and reads it again.`,
    G.f.dearKind === 'poem' ? `"<i>She can make a cookie out of almost nothing and fix a cut, and a broken lamp, and also my feelings.</i>"` : `"<i>${esc((G.f.letterText || '').trim().slice(0, 260))}${(G.f.letterText || '').length > 260 ? '…' : ''}</i>"`,
    `You don't hear any of this. You're in your room with the lights off, pretending to be asleep, listening as hard as you've ever listened to anything. You hear nothing. Then — very softly — your door opens. A long rectangle of hall light falls across the red carpet. She stands there for a while.`,
    `"Goodnight, sweetheart," she says, to a boy who is very obviously awake.`,
    `In the morning there's a note in your lunch bag, on the back of a grocery list, in her perfect handwriting: "<i>Got your letter. Keeping it. — Mom. P.S. Dinner Saturday — your choice. P.P.S. Not pierogies.</i>"`,
    `She keeps it in her jewellery box, next to the locket with the grape leaf. You find this out twenty years later, when you're helping her move, and you have to go and stand in the garage for a while.`,
  ] });
endingDef('penicillin', { title: 'Penicillium davidii', short: 'Penicillium davidii', kind: 'good', img: 'penicillin', music: 'good',
  text: () => [
    `Mr. Van Dyk holds the ${G.f.discoveryItem === 'mixture' ? 'glass' : 'dish'} up to the window for a long time. Greg is holding his breath so hard he goes pink. "Look at the halo," Mr. Van Dyk says finally, very quietly. "Nothing is growing near it. Nothing <i>can</i>." He looks at you over his goggles. "Where did this come from, David?"`,
    `You tell him: the milk, the cookie, the sourdough starter in your mother's fridge — the wild yeast she brought home from a winery lab in 1982 and has fed every Saturday for seventeen years. Mr. Van Dyk sits down very slowly on his stool. "Strain number four," he whispers. "Lakeshore Estates. Noreen <i>Ashby</i>."`,
    `He sends a sample to a microbiologist he knows at Brock. In January, the microbiologist calls your house and asks to speak to your mother, and they're on the phone for two hours, and Noreen is laughing in a way you've never heard, and at one point she says "<i>David</i> did?" and looks at you across the kitchen like you're someone she's just been introduced to.`,
    `It isn't penicillin. It's something new: a symbiotic Penicillium that only grows alongside her wild yeast, and it produces a compound that stops three kinds of antibiotic-resistant bacteria cold. It will take eleven years and a lot of other people's work to turn it into anything. But the paper, in 2001, lists the strain as <i>Penicillium</i> sp. NDSS-1, and in the acknowledgements: "<i>We thank N. Ashby for the yeast, and D. and G. for leaving it out too long.</i>"`,
    `You and Greg win the Niagara Regional Science Fair. Noreen comes, and Don, with a disposable camera. Greg's dad drives in from Hamilton. Greg doesn't stop smiling for a week.`,
    `On the way home, in the minivan, your mother says, "So. You crushed my cookie into my milk." "Yeah." "To spite me." "...Yeah." A long pause. "That," she says, "is the most scientific thing you've ever done." And then: "I'm still mad about Thursday." And then: "Not very."`,
  ] });
endingDef('confession', { title: () => F('antidote') ? 'The Antidote' : 'Confession', short: 'Confession', kind: 'mixed', img: () => F('antidote') || F('phoneConfession') ? 'antidote' : 'confession', music: 'good',
  text: () => {
    const ns = Story.noreenState();
    if (F('antidote')) return [
      `Mr. Van Dyk looks at the mould, and then at your face, and stops being a chemistry teacher and starts being an adult. "David. Where has this been?" And it all comes out of you, in Room 214, in front of Greg: under your parents' bed, for ${G.day - (G.f.placedDay || 0)} days, and your mother is sick, and you knew, you think you knew.`,
      `He drives you to St. Catharines General himself, the culture in a sealed bag on your lap. He talks to the doctors. Somebody calls a mycologist at McMaster. They have a name for it by midnight and the right drug by morning. It worked, they say, because they knew exactly what to look for. Because somebody told them.`,
      `Noreen comes home eight days later, thin and tired, with a new inhaler and a hospital bracelet she forgets to take off. She knows. Don told her. For the first week she can't look at you, and you understand.`,
      `Then one night she knocks on your door frame — actually knocks — and sits on the end of your bed, and says, "You could have let me die and nobody would have ever known." "I know." "But you didn't." "...No." She looks at the red walls for a long time. "I don't know what to do with that yet, David. I'm going to need some time." "Okay." She puts her hand on your enormous foot, through the blanket, and leaves it there for a while.`,
      `It takes about a year. It takes a lot of tea. But it happens.`,
    ];
    if (F('confessedEarly')) return [
      `She doesn't yell. That's the worst part. She goes upstairs, lifts the dust ruffle, and looks for a long time at the glass sitting in the dark next to her slippers. Then she gets the rubber gloves and a garbage bag and takes it out to the curb herself, at eleven at night, in her cardigan, and comes back, and washes her hands for a very long time.`,
      `"To get back at me," she says, finally, at the sink. "Yes." "With my own milk and cookies." "...Yes." She dries her hands. "Do you know I have asthma?" "Yes." "Did you think about that?" And here's the thing — you hadn't. Not really. And now you can't stop.`,
      `You're grounded until approximately the year 2000. You deserve it, and you take it. You open all her windows every morning for a week, and you vacuum under her bed every Saturday until Christmas, and she lets you.`,
      `At the end of November, you find two cookies and a glass of milk on your desk. No note. No sarcasm. You eat them slowly, at the keyboard, and you don't crush anything.`,
    ];
    return [
      `It comes out of you in pieces: the milk, the cookie, the glass, under the bed, ${G.day - (G.f.placedDay || 0)} days. ${F('phoneConfession') ? 'Over the phone, at first — your father, very quiet on the other end — and then, an hour later, in a hospital corridor that smells of floor wax.' : 'Your mother listens from her pillows with her eyes closed. Your father, in the doorway, goes grey.'}`,
      `Don gets the glass out himself in rubber gloves and a dust mask from the garage, and you watch from the hall as he carries it down the stairs at arm's length like a bomb. ${ns === 'hospital' || F('phoneConfession') ? 'At the hospital they finally know what they\'re fighting. They have a name for it by morning.' : 'An ambulance comes anyway, to be safe. With a name for it, the doctors move fast.'}`,
      `She recovers. It takes six weeks and a new inhaler and a lot of ugly nights. Your parents have the carpets pulled up in their room and the vents cleaned. Nobody tells the neighbours why.`,
      `For a long time — weeks — she can't look at you. Then one night she knocks on your door frame. Actually knocks. "You told the truth when it cost you everything," she says. "I want you to know I noticed that part." You say you're sorry. You say it a lot, that winter. She lets you.`,
      `Forgiveness, it turns out, isn't an endpoint. It's a titration. You add it a drop at a time and wait to see what stays changed.`,
    ];
  } });
endingDef('dogdays', { title: 'Dog Days', short: 'Dog Days', kind: 'mixed', img: 'dogdays', music: 'good',
  text: () => [
    `Shelby wolfs down the ${({ cookie: 'cookie', crumbs: 'crumbs', cupcake: 'cupcake' })[G.f.dogChoc] || 'chocolate'} in one bite, wags, and seems fine — for an hour. Then he's pacing. Panting. Throwing up on the patio. Shaking. You stand at the patio door with your heart going like a hummingbird, and then you do the only thing you can think of: you yell for your mother.`,
    `Noreen is out the door in her slippers before you've finished the word "chocolate." She doesn't ask questions. She scoops up twenty-six pounds of Corgi and you drive — she drives, you hold Shelby — to the all-night emergency vet on Welland Avenue.`,
    `They make Shelby throw up, and give him charcoal, and put him on a drip. "He'll be fine," the vet says. "Small dose. You got him here fast." The bill is $412. Shelby is fine.`,
    `You sit in the waiting room until 3 a.m. under the fluorescent lights, and somewhere around one o'clock, with nothing else to do and nobody else to talk to, you and your mother start talking. Really talking. About the fight, and Grandma's hip, and what you said, and why. About Shelby as a puppy, who ate a whole birthday candle when you turned ten. About chemistry, of all things. She knows a terrifying amount about theobromine.`,
    `On the drive home, with Shelby asleep in your lap, she says, "Never feed the dog chocolate again." "I won't." "And never tell your father about the four hundred dollars." "...Okay." A pause. "Thank you for yelling for me," she says. "Instead of hiding it." You think about how close you came to hiding it.`,
    `It's not the way anyone would choose to make up. But you'd choose it again. (Shelby, for the record, would not.)`,
  ] });
endingDef('coldwar', { title: () => Story.apology() >= 1 && G.rel.noreen >= 3 ? 'Détente' : 'Cold War', short: 'Cold War', kind: 'neutral', img: () => G && Story.apology() >= 1 && G.rel.noreen >= 3 ? 'detente' : 'coldwar', music: 'night',
  text: () => {
    if (Story.apology() >= 1 && G.rel.noreen >= 3) return [
      `October ends. Halloween comes and goes: a pirate, two Spice Girls and a Teletubby ring the doorbell, and you hand out Coffee Crisps from the bowl by the door while Noreen does the voices.`,
      `Things are... fine. Better. You said sorry, and she accepted it, and the house has gone back to its old rhythms: her in the kitchen, you in the den, Don in the recliner, Shelby yapping at the dark. It's not a war anymore. It's a détente: peaceful, polite, a little careful.`,
      `There was a moment in there, you think — some door you could have opened, some question you could have asked her. You don't know what it was. Maybe you'll find it next year. Maybe at Christmas. There's time.`,
      `There's always more time. That's the thing you'll learn, eventually, isn't true.`,
    ];
    return [
      `October ends. Halloween comes and goes. A pirate, two Spice Girls and a Teletubby ring the doorbell, and Noreen hands out Coffee Crisps from the bowl by the door, and you watch from the top of the stairs and don't come down.`,
      `Nothing explodes. Nothing gets fixed. The fight just... sets, like a jelly, into the shape of the house. She makes your lunch. You eat it. You say "thanks" and she says "mm" and the space between those two words gets a little wider every week.`,
      `In November it snows. You stay in the den with the Gateway, and the 33.6 modem screams, and Greg sends you ICQ messages that you answer with "lol" and "brb." ${exists('cookie') || exists('mixture') || exists('milk') ? 'Somewhere in the house, a glass and a cookie that were meant as a kind of olive branch, wrapped in sarcasm, are still exactly where you left them.' : ''}`,
      `Years later, you will try to remember what the fight was even about. The phone, you'll think. Something about the phone. You'll remember the milk and the cookies perfectly, though. You'll remember them for the rest of your life.`,
      `§It's a sad thing that your adventure has ended here.`,
    ];
  } });
endingDef('forgery', { title: 'Forgery', short: 'Forgery', kind: 'bad', img: 'forgery', music: 'dread',
  text: () => [
    `Parent-teacher night, Room 214, 7:40 p.m. Mr. Van Dyk is delighted to meet them. He pulls out your quiz. "Thank you so much for signing this, Mrs. —" he says to Noreen, and stops, because Noreen is looking at her own signature with an expression that could etch glass.`,
    `"That," she says, "is a very good forgery."`,
    `Don puts his head in his hand. Mr. Van Dyk, who has been teaching since 1979, goes very quiet and very kind, which is so much worse.`,
    `They come home at 9:15. Nobody yells. There's a "family meeting" at the dining-room table — the dining room, the room for Christmas and funerals — and Noreen lays the quiz on the lace runner between the silk peonies and says, "Explain it to me," and you can't.`,
    `You get a three-day suspension (Academic Integrity Policy, Section 4). The computer gets moved into your parents' room, password-protected — Don's password, which is "LEAFS93," which you figure out in a day, which you are smart enough not to use.`,
    `It's not the forging that hurts her, she tells you much later. It's that you were so good at it. That you'd studied her hand that closely, and used it for that.`,
    `§It's a sad thing that your adventures have ended here.`,
  ] });
endingDef('busted', { title: 'Busted', short: 'Busted', kind: 'bad', img: 'busted', music: 'dread',
  text: () => {
    const how = G.f.bustedHow;
    const open = how === 'shelby' ? `Shelby goes under the bed like a heat-seeking missile and comes out backward, barking hysterically, nose covered in grey fuzz. Noreen arrives at a run. Don arrives in his bathrobe. Noreen gets down on her hands and knees and lifts the dust ruffle and screams — an actual scream — and comes out holding it at arm's length.`
      : how === 'don' ? `At 6:10 a.m. your father, searching every inch of the master bedroom for his ID badge, gets down on his hands and knees and looks under the bed. You hear him make a sound you have never heard a grown man make. Then Noreen's voice, rising: "What IS that? Don, what IS that?"`
      : `Noreen walks into her bedroom at 10:30 p.m., and there it is, on her carpet, in the middle of the floor, in her good tall glass: a column of beige sludge, ${Story.mixStage() >= 1 ? 'furred with mould' : 'gently separating'}. She doesn't scream. She just says, very quietly, "<i>David</i>," in a voice that carries through two closed doors.`;
    return [open,
      `A tall glass — <i>her</i> tall glass — ${Story.mixStage() >= 2 ? 'crowned with a fuzzy, rainbow-sheened dome of green and black mould' : Story.mixStage() >= 1 ? 'of sour, spotted slurry' : 'of beige slurry'}. It does not take a detective. There's a crushed chocolate chip in it.`,
      `Don stands in the doorway holding his nose. Shelby is having the best day of his life.`,
      `There's no "family meeting." There's just Noreen in your doorway in her robe, holding the garbage bag, saying, "Under my bed, David. Under my <i>bed</i>. I have <i>asthma</i>." And you have nothing to say, because there's nothing to say.`,
      `You are grounded until the year 2000. You point out that that's only two months. She says, "Then you'd better hope Y2K doesn't happen, because if the calendars reset to 1900, you're grounded for a century." Don, from the hall: "Hundred and one years, technically." Noreen: "<i>Don.</i>"`,
      `You vacuum under their bed every Saturday until Christmas. Shelby gets a new tennis ball.`,
      `§It's a sad thing that your adventures have ended here.`,
    ];
  } });
endingDef('seized', { title: 'The State Seizes the Means of Production', short: 'Seized Assets', kind: 'joke', img: 'seized', music: 'dread',
  text: () => [
    `At 11:52 p.m., <i>L'Internationale</i> — the 8-bit MIDI version, at full volume, through a Zoltrix subwoofer with its bass knob taped to MAX — shakes every window in the house. The chandelier sways. In the master bedroom, a picture of a vineyard falls off the wall.`,
    `Don comes up the stairs in his bathrobe and slippers with the silent, terrible calm of a man who approves credit limits for a living. He does not say a word. He unplugs the Gateway 2000. He unplugs the subwoofer. He tucks the tower under one arm and the subwoofer under the other — both of which together weigh more than he does — and carries them down all fourteen stairs.`,
    `"You can't do that!" you say, from the top of the stairs, silhouetted against your red bedroom. "That's — that's private property!" "Funny," says Don, without turning around, "coming from you."`,
    `The Gateway goes into the trunk of the Camry and to Don's office in Welland, where it remains until Christmas. The subwoofer is "donated." You never find out to whom.`,
    `Comrade, the revolution has failed. The bourgeoisie have seized the means of production. They were in your father's bathrobe the whole time.`,
    `§It's a sad thing that your adventures have ended here.`,
  ] });
endingDef('kaboom', { title: 'Alkali Metal', short: 'Kaboom', kind: 'joke', img: 'kaboom', music: 'dread',
  text: () => [
    G.f.kaboomWhere === 'toilet' ? `You drop a lump of sodium into the toilet. For one second, it skates around on the water, fizzing merrily, like a little silver boat. Then it finds the rest of its friends.` : G.f.kaboomWhere === 'kettle' ? `You drop sodium into the kettle. The kettle has a lid. That's the problem with the kettle.` : `You drop the sodium into the ${G.f.kaboomWhere === 'sink' || G.f.kaboomWhere === 'sinks' ? 'sink' : 'water'}. For one second it skates across the surface, fizzing and hissing, like something alive.`,
    `<b>WHUMPF.</b>`,
    `The good news: nobody is seriously hurt. The bad news: your eyebrows are gone, the ${G.phase === 'school' ? 'lab bench' : 'room'} has a scorch mark shaped like Saskatchewan, the fire department comes, the <i>Niagara Ledger</i> runs a small item headlined "STUDENT, SODIUM, SINK," and you are sitting in a plastic chair covered in soot while ${G.phase === 'school' ? 'Mr. Van Dyk explains to the principal, very slowly, the concept of an alkali metal' : 'Noreen, very slowly, explains the concept of an alkali metal to you — correctly, in detail, from memory, while picking glass out of the grout'}.`,
    `You are suspended for two weeks. Your eyebrows take six weeks to grow back. Greg visits every day with homework and a Polaroid camera.`,
    `§It's a sad thing that your adventures have ended here.`,
  ] });
endingDef('bluescreen', { title: 'Fatal Exception 0E', short: 'Blue Screen', kind: 'joke', img: 'bluescreen', bsod: true, music: 'dread',
  text: () => [
    `You pour the ${G.f.bsodCause || 'milk'} into the Gateway 2000. You're not sure why. To make a point, maybe. To show her. To show it.`,
    `The Pentium Pro makes a sound like a tiny dying robot. The 17-inch CRT goes blue — that specific, terrible Microsoft blue — and then, with a flash and a smell like burnt popcorn and wet cardboard, black. The Zoltrix subwoofer emits one final, distorted <i>WHUMMMMP</i>, like a whale saying goodbye.`,
    `Don will spend the next three weekends trying to fix it with a hair dryer and a Gateway support technician named Darrell on a 1-800 line in South Dakota. Darrell has never heard of anyone doing this on purpose.`,
    `No ICQ. No internet. No Greg at night. No Winamp. Just you, in a red room, in Garrison Village, in October, with nothing to do but go downstairs and eventually talk to your mother. Which, now that you think about it, was maybe the point all along.`,
    `§It's a sad thing that your adventures have ended here.`,
  ] });
endingDef('spores', { title: 'Spores', short: 'Spores', kind: 'worst', img: 'spores', music: 'dread',
  news: () => ({ date: `Thursday, November 11, 1999`, head: `Teen Charged After Mother's Death Linked to "Rare Toxic Mould"`,
    body: `A Niagara-on-the-Lake teenager has been charged in connection with the death of his mother, 53, a former winery chemist, who died at St. Catharines General Hospital on October 28 of what doctors described as an "atypical fungal pneumonitis."<br><br>Investigators from Niagara Regional Police, working with public health inspectors, traced the source to a glass of milk and baked goods concealed beneath the victim's bed in the family's Garrison Village home. A specialist at McMaster University identified a previously undocumented species of airborne mould, apparently the product of a rare wild yeast culture and dairy.<br><br>The accused, 17, who cannot be named under the Young Offenders Act, was described by a classmate as "not a bad guy, he just... I told him. I TOLD him." He has been remanded to a youth detention facility in Brampton. A memorial service will be held at St. Mark's Anglican Church. In lieu of flowers, the family asks for donations to the Ontario Lung Association.` }),
  text: () => [
    `She dies on a Thursday, two weeks to the day after she brought you the milk and cookies. ${F('gregWarned') ? 'Greg told you. He told you, and you didn\'t listen.' : ''} The doctors at St. Catharines General never figure out what it is until afterward.`,
    `Then a public health inspector in a paper suit goes into your parents' room, and gets down on his hands and knees, and lifts the dust ruffle.`,
    `The glass is still there, beside her slippers. What's inside it has filled the glass and spilled over the rim and spread across the carpet in a soft grey-green bloom the size of a dinner plate, shimmering faintly like oil on water. They take it away in three sealed bags. A mycologist from McMaster flies in from a conference in Atlanta.`,
    `It doesn't take a detective. It's her glass. It's her cookie. There's a chocolate chip in it. And there's you, who wasn't at the hospital very much, and couldn't look anyone in the eye, and whose bedroom is painted the colour of a warning.`,
    `Don doesn't say anything at all, at the end. He just looks at you the way you'd look at a house that has burned down — something you used to live in.`,
    `The youth centre in Brampton has a cinder-block room with a narrow bed, and your feet hang off the end of it, the way they always did at home. On the wall someone has scratched the words <i>NOT MY FAULT</i>. You stare at them a lot.`,
    `The mould is eventually named, in a paper nobody in your family reads, <i>Penicillium noreenii</i>. It's very beautiful under a microscope. That's what the paper says.`,
    `§It's a sad thing that your adventures have ended here.`,
  ] });
