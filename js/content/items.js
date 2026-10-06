/* ==========================================================================
   Items
   ========================================================================== */
'use strict';

const ELECTRONICS = ['monitor', 'keyboard', 'tower', 'mouse', 'speakerL', 'speakerR', 'subwoofer', 'printer'];
const WATER = ['sink', 'sinks', 'toilet', 'tub', 'kettle', 'shower'];
function liquidOnComputer(what) {
  return () => { setF('bsodCause', what); ending('bluescreen'); return null; };
}
function pourOut(id, where) {
  if (id === 'milk') { swap('milk', 'glass_empty'); sfx('pour'); return `You pour the milk down the ${where}. A small, pointless act of rebellion. The glass is empty now, except for a white film of regret.`; }
  if (id === 'mixture') {
    const st = Story.mixStage(); swap('mixture', 'glass_empty'); G.mix = null; sfx('squish');
    setF('mixDisposed');
    if (st >= 2) return `You tip the glass. The mould comes out in one horrible gelatinous plug and slides down the ${where} with a sound you will hear in your sleep. You run the water for a full minute. The glass is empty. You are, in some sense, cleaner.`;
    if (st === 1) return `You pour the sour, separating slurry down the ${where}. It smells like a gym bag that has been to war. Gone now.`;
    return `You pour the beige slurry down the ${where}. It goes reluctantly, in clumps. Goodbye, milk. Goodbye, cookie.`;
  }
}
function wrapRefuse() { return null; }

/* ---------------- the milk ---------------- */
item('milk', {
  name: () => Story.milkSour() ? 'Glass of Sour Milk' : 'Tall Glass of Milk',
  icon: () => Story.milkSour() ? 'milk_sour' : 'milk',
  examine: () => Story.milkSour()
    ? `The milk has turned. It's gone faintly yellow, and there's a skin on top that wrinkles when you tilt the glass. It smells like the inside of a lunch box in June.`
    : `A tall glass of 2% milk, poured from the bag in the plastic jug downstairs, filled right to the brim. Condensation beads on the glass. She filled it to the very top, which is either love or a dare.`,
  consume: () => {
    if (Story.milkSour()) { swap('milk', 'glass_empty'); sfx('gulp'); karma(0); setF('drankSour'); return `You drink the sour milk in three heroic gulps. For a moment, nothing. Then your whole body files a formal complaint. You spend the next fifteen minutes in the bathroom, thinking about choices.`; }
    swap('milk', 'glass_empty'); sfx('gulp'); setF('drankMilk');
    return here('noreen') ? `You drink the whole glass while she watches. She says nothing, but one eyebrow goes up a millimetre. Point: Noreen.` :
      `You drink it in one long pull. It's cold and perfect and you hate that it's perfect. You are left holding an empty glass with a white milk moustache line around the rim.`;
  },
  hit: `You flick the glass with a fingernail. <i>Ting.</i> A tiny ripple runs across the surface. That showed it.`,
  open: `It's a glass. It's as open as it gets.`,
  use: {
    cookie: () => Story.cookieMilk(),
    crumbs: () => Story.makeMixture('crumbs'),
    self: `You hold the glass above your head, ready to pour it all over yourself in some grand gesture of... what, exactly? You lower it. That is exactly what a child would do, and she'd be right.`,
    fridge: () => Story.fridgePut('milk'),
    sink: () => pourOut('milk', 'sink'), sinks: () => pourOut('milk', 'sink'), toilet: () => pourOut('milk', 'toilet'), tub: () => pourOut('milk', 'drain'),
    plant: () => { swap('milk', 'glass_empty'); karma(-1); return `You water Noreen's ficus with milk. The ficus has done nothing to you. You are not a good person right now.`; },
    petri: `Plain milk on a petri dish? Mr. Van Dyk's voice in your head: <i>"Nutrient-rich but monotonous, David."</i> You'd want something more... interesting in there.`,
    cling: () => { return `You stretch cling wrap over the milk. Then you peel it off again. Why would you seal plain milk?`; },
    shelby: () => Story.shelbyMilk(),
    ...Object.fromEntries(ELECTRONICS.map(e => [e, liquidOnComputer('milk')])),
  },
});

/* ---------------- the cookie ---------------- */
item('cookie', {
  name: () => Story.cookieStale() ? 'Stale Cookie' : 'Chocolate Chip Cookie',
  icon: 'cookie',
  examine: () => {
    setF('examinedCookie');
    return Story.cookieStale()
      ? `The cookie has gone hard enough to skip across Lake Ontario. Still smells good, though — that faint sour-sweet tang under the chocolate.`
      : `A big homemade chocolate chip cookie, still faintly warm, with the crisp brown-butter edges she always gets right. Underneath the chocolate there's a faint sour-sweet tang you've never been able to place. Noreen's recipe. She has never once told anyone what's in it.`;
  },
  consume: () => {
    lose('cookie'); sfx('crunch'); setF('ateCookie');
    if (Story.cookieStale()) return `You gnaw the stale cookie down to nothing. It fights back. You win, technically.`;
    if (here('noreen')) { rel('noreen', 1); return `You eat the cookie in front of her. She watches you chew. "Good?" she asks, despite herself. You nod. Something in her shoulders lets go, just a little.`; }
    return `You eat it in four bites. It's annoyingly, unforgivably good. That tang again — like bread, or wine, or something alive. You lick the chocolate off your thumb and feel about nine years old.`;
  },
  hit: () => { swap('cookie', 'crumbs'); sfx('crunch'); karma(-1); return `You crush the cookie in your fist. It gives up instantly, the way good cookies do. Now you have a fistful of crumbs and chocolate smeared on your palm. Very mature. Very adult. She'd be so proud.`; },
  use: {
    milk: () => Story.cookieMilk(),
    self: `You balance the cookie on your nose like a seal. Nobody is around to appreciate it. This is the loneliest trick in the world.`,
    shelby: () => Story.shelbyChocolate('cookie'),
    tower: `You try to post the cookie into the 3.5" floppy drive. It doesn't fit. This is, on reflection, a good thing.`,
    subwoofer: () => { sfx('sub'); return `You set the cookie on top of the subwoofer and tap a key. The Zoltrix lets out one distorted <i>WHUMMMP</i> and the cookie hops an inch into the air like it's been electrocuted. Science.`; },
    petri: `A dry cookie on a petri dish won't grow much. It needs moisture. Something wet. Something like... milk.`,
    cookiejar: () => { lose('cookie'); return `You put the cookie back in the barn-shaped jar, where it came from. Returned to the herd.`; },
    fridge: () => Story.fridgePut('cookie'),
  },
});

item('crumbs', {
  name: 'Cookie Crumbs', icon: 'crumbs',
  examine: `What used to be a perfectly good cookie, now a handful of crumbs and shame. Some chocolate has melted into the creases of your palm.`,
  consume: () => { lose('crumbs'); sfx('crunch'); return `You tip the crumbs into your mouth straight from your hand like a raccoon. Delicious. Undignified.`; },
  use: {
    milk: () => Story.makeMixture('crumbs'),
    shelby: () => Story.shelbyChocolate('crumbs'),
    petri: `Dry crumbs won't grow anything interesting. Mould wants moisture.`,
    self: `You sprinkle the crumbs into your own hair. Why? Nobody knows. You brush them out.`,
  },
});

/* ---------------- glasses ---------------- */
item('glass_empty', {
  name: 'Empty Glass', icon: 'glass_empty',
  examine: () => G.f.mixDisposed ? `The tall glass, empty but for a grey-beige ring of residue you will not be describing to anyone.` : `The tall glass, empty now, with a cloudy white film down the inside.`,
  use: {
    sink: () => Story.washGlass(), sinks: () => Story.washGlass(),
    fridge: () => Story.refillMilk(),
    cabinets: `You can't put a dirty glass back in the cupboard. Even you know that. Even you have limits.`,
    self: `You look through the bottom of the glass. Everything is round and wobbly. Same as usual.`,
  },
  hit: `You tap the empty glass. It rings. A clear, judgmental note.`,
});
item('glass_clean', {
  name: 'Clean Glass', icon: 'glass_clean',
  examine: `A tall glass, washed and dried. Sparkling. You did this. A small domestic miracle.`,
  use: {
    cabinets: () => { lose('glass_clean'); setF('glassPutAway'); karma(1); return `You put the clean glass back in the cupboard, right where it lives, in the row of matching tall glasses. There is no audience for this. You do it anyway.`; },
    fridge: () => Story.refillMilk(),
    sink: `It's already clean. Washing it again would be showing off.`,
  },
});

/* ---------------- the mixture ---------------- */
item('mixture', {
  name: () => { const s = Story.mixStage(); const w = G.mix && G.mix.wrapped ? ' (Sealed)' : ''; return (['Milk-and-Cookie Slurry', 'Sour, Spotted Slurry', 'Fuzzy Glass of Mould'][s]) + w; },
  icon: () => G.mix && G.mix.wrapped ? 'mixture_wrapped' : ['mixture', 'mixture_old', 'mixture_mold'][Story.mixStage()],
  examine: () => {
    const s = Story.mixStage(), age = G.mix ? G.mix.age : 0; let t;
    if (s === 0) t = `A tall glass of beige sludge: milk with a crushed chocolate chip cookie stirred into it. Soggy chunks float near the top. It looks like a milkshake that lost a fight.`;
    else if (s === 1) t = `The slurry has separated into grey whey and a beige silt. A skin has formed on top, and on the skin, little islands of white fuzz with green hearts. It smells sour, and under the sour, weirdly, like wine.`;
    else t = `A dome of mould has risen out of the glass like a soufflé from hell: velvet green, smoky grey, and black at the centre, with an oily rainbow sheen that seems to move when you aren't looking directly at it. It's almost beautiful. ${G.mix && G.mix.wrapped ? 'The cling wrap above it bulges.' : 'Fine grey dust drifts up from it whenever the air moves.'}`;
    if (age >= 9) t += ` It has been ${age} days. It's started making a faint ticking sound. That can't be right.`;
    return t;
  },
  consume: () => {
    const s = Story.mixStage();
    if (s === 0) { swap('mixture', 'glass_empty'); G.mix = null; sfx('gulp'); return `You drink the slurry. It's basically a soggy milkshake. A sad one. It's gone, at least.`; }
    if (s === 1) return `You raise the glass to your lips. Your body, which has kept you alive for seventeen years, physically refuses. Your arm will not bend any further.`;
    return `Absolutely not. You'd sooner eat the subwoofer.`;
  },
  hit: () => Story.mixStage() >= 2 ? `You tap the glass. A puff of grey spores rises out of the fuzz and hangs in the air like a tiny ghost. You step back very quickly.` : `You give the glass a whack. Slurry sloshes. A crumb surfaces, then sinks again, like something in a horror movie.`,
  open: () => G.mix && G.mix.wrapped ? (G.mix.wrapped = false, `You peel back the cling wrap. The smell comes out to greet you personally.`) : `There's nothing to open. It's a glass of sludge.`,
  close: () => has('cling') ? Story.wrapMix() : `You'd need something to seal it with. Cling wrap, maybe.`,
  use: {
    cling: () => Story.wrapMix(),
    petri: () => Story.culture(),
    sink: () => pourOut('mixture', 'sink'), sinks: () => pourOut('mixture', 'sink'), toilet: () => pourOut('mixture', 'toilet'), tub: () => pourOut('mixture', 'drain'),
    fridge: () => Story.fridgePut('mixture'),
    shelby: () => { sfx('yap'); return `Shelby takes one sniff, sneezes violently, and backs away until his stumpy behind hits the fence. He growls at the glass. Dogs know things.`; },
    self: () => Story.mixStage() >= 2 ? `You hold it up to your face to get a better look. The fuzz seems to lean toward you. You lean away.` : `You consider pouring it over your head. That would be both childish and moist.`,
    plant: () => Story.mixStage() >= 1 ? `You are not feeding that to the ficus. The ficus has a family.` : `You tip the slurry into the ficus pot... no. No. Even the ficus deserves better.`,
    ...Object.fromEntries(ELECTRONICS.map(e => [e, liquidOnComputer('mixture')])),
  },
  leave: (scene) => Story.leaveMixture(scene),
});

item('cling', {
  name: 'Plastic Wrap', icon: 'cling',
  examine: `A long box of cling wrap with the serrated metal edge that has drawn more family blood than any war.`,
  use: { mixture: () => Story.wrapMix(), milk: `You don't need to seal plain milk.`, self: `You wrap your hand in plastic wrap. It's very shiny. You unwrap it. That was a minute you'll never get back.`, shelby: `No. Absolutely not.` },
  hit: `You flick the serrated edge. Ow. It bites.`,
});

/* ---------------- science ---------------- */
item('petri', {
  name: 'Petri Dish', icon: 'petri',
  examine: `A sterile plastic petri dish, with a thin layer of beige nutrient agar set in the bottom. It's waiting for something to grow.`,
  use: { mixture: () => Story.culture(), milk: `Plain milk would grow plain things. You want something stranger.`, cookie: `A whole dry cookie? Mould needs moisture. Mix it with something first.`, crumbs: `Dry crumbs won't take. It needs to be wet.`, self: `You press your thumb onto the agar like Fleming's assistant. Then you think better of it. That's how you get a dish full of thumb.` },
});
item('petri_culture', {
  name: () => Story.cultureReady() ? 'Glowing Culture' : 'Petri Culture',
  icon: 'petri_culture',
  examine: () => {
    const a = G.f.cultureAge || 0;
    if (a < 1) return `A petri dish with a smear of slurry across the agar. Nothing's happening yet. Science, it turns out, is mostly waiting.`;
    if (a < 3) return `Tiny white freckles have appeared on the agar, each with a faint green centre. Something is moving in.`;
    return `The dish has erupted into perfect concentric colonies: velvet blue-green rings, each surrounded by a strange clear halo where nothing else will grow. Around the edges of the dish, the agar has gone faintly, impossibly iridescent. Even you can tell: this is not normal bread mould.`;
  },
  consume: `It's a science experiment, not a snack.`,
  hit: `You do not hit the science.`,
});

/* ---------------- school stuff ---------------- */
item('quiz', { the: 'the chemistry quiz',
  name: 'Chemistry Quiz (41%)', icon: 'quiz',
  examine: () => { setF('readQuiz'); paper(`<b>NIAGARA DISTRICT S.S. — SCH3A — Mr. Van Dyk</b>
QUIZ 3: THE MOLE &amp; STOICHIOMETRY

Name: <u>David</u>                          <span style="color:#c00;font-size:22px">41%</span>

1. Define one mole.    <span style="color:#c00">"a small burrowing mammal" — see me.</span>
2. How many moles in 36 g of H₂O?  <span style="color:#c00">✗</span>
3. Balance: __C₃H₈ + __O₂ → __CO₂ + __H₂O   <span style="color:#c00">✗ (close!)</span>
4. Explain titration in your own words.   <span style="color:#c00">"You add stuff until it turns pink" — technically yes. 1/4</span>

<span style="color:#c00">David — you're better than this. PARENT SIGNATURE REQUIRED. Due Fri. Oct. 22.</span>

Parent / Guardian signature: _______________________`, false); return `Quiz 3. Forty-one percent. Mr. Van Dyk's red pen has a lot to say. The signature line at the bottom is the problem. Fridays are the deadline. That's next Friday, the 22nd.`; },
  hit: `You crumple it into a ball and throw it at the wall... then go and get it, and smooth it flat again. You still need it signed. That's the whole problem.`,
  consume: `You could eat the evidence. People have. But you'd still have a 41%, plus a paper-cut tongue.`,
  use: {
    pen: () => Story.forge(), grocery: `You hold the quiz next to her grocery list. Her handwriting is beautiful. Yours is not. You'd need a pen, too.`,
    self: `You stare at it hard enough to change the number. It stays a 41.`,
  },
});
item('quiz_forged', { the: 'the forged quiz',
  name: 'Quiz (Forged Signature)', icon: 'quiz_forged',
  examine: () => { paper(`QUIZ 3: THE MOLE &amp; STOICHIOMETRY          <span style="color:#c00">41%</span>
...
<span style="color:#c00">PARENT SIGNATURE REQUIRED.</span>

Parent / Guardian signature: <span style="font-family:var(--serif);font-style:italic;font-size:22px;color:#1f3a7a">Noreen</span>`); return `Her signature, in your hand. It's a good forgery. It's a really good forgery. You feel a little sick looking at it.`; },
  use: { pen: `You've done enough with that pen.`, self: `You're a forger now. You've crossed a line. Lines are not, historically, something your family uncrosses.` },
  hit: `You crumple it — then smooth it out again. Destroying it won't un-forge it.`,
});
item('quiz_signed', { the: 'the signed quiz',
  name: 'Signed Quiz', icon: 'quiz_signed',
  examine: () => F('quizSignedBy') === 'noreen'
    ? `Your 41%, with your mother's real signature at the bottom in her perfect cursive. Below it, in smaller letters: "<i>We'll fix this together. — Mom</i>" and a small, slightly sarcastic smiley face.`
    : `Your 41%, signed by your father in his big blocky executive scrawl, the same signature that approves credit limits for half of Ontario. Below it: "<i>Talk to your mother. — D.</i>"`,
});
item('pen', {
  name: 'Ballpoint Pen', icon: 'pen',
  examine: `A clear Bic with a chewed blue cap. Writes first try, which makes it the best pen in the house.`,
  operate: `Click-click. Click-click. Click-click. You could do this all night.`,
  use: {
    quiz: () => Story.forge(),
    grocery: () => { if (F('addedJolt')) return `You've already vandalised the list once.`; setF('addedJolt'); return `At the bottom of her immaculate list, in your worst handwriting, you add: <i>JOLT COLA (case)</i>. A small act of insurgency.`; },
    self: `You draw a small hammer and sickle on the back of your hand. It looks like a fish. You leave it.`,
    letter: `It's printed. Pen on top would just make it look like a ransom note.`,
  },
});
item('calculator', {
  name: 'TI-83 Calculator', icon: 'calculator',
  examine: `A TI-83 graphing calculator, $129.99 at Future Shop, purchased by your father with the solemnity of a man buying a used car. Greg put Tetris on it.`,
  operate: `You type 5318008 and turn it upside-down. Still funny. You are seventeen years old and it is still funny.`,
  hit: `You whack it on the desk. The screen flickers but survives. TI-83s are built like tanks. Greg says they'll outlive the cockroaches.`,
});

/* ---------------- Noreen's things ---------------- */
item('grocery', { the: "Noreen's grocery list",
  name: "Noreen's Grocery List", icon: 'grocery',
  examine: () => { setF('readGrocery'); paper(`Bagged milk (2%) — 2
Red Rose (the big box)
Chipits — semi-sweet ×2
Brown sugar
Butter (unsalted!!)
Dog food (the GOOD kind — S. is sensitive)
Metamucil — Don
Rye bread
Lettuce, tomatoes, cukes
FEED THE STARTER — Sat.
Candles — Oct 23 (just a few!!)${F('addedJolt') ? '\n<span style="font-family:Comic Sans MS, cursive;color:#333">JOLT COLA (case)</span>' : ''}`, true); return `Her handwriting is the most beautiful thing in the house, including the china. Every capital has a little flourish. "FEED THE STARTER" is underlined twice. Starter? And candles for October 23rd...`; },
  use: { pen: () => Item_pen_grocery(), quiz: `Her signature's not on here, but her handwriting is. If you had a pen, you could probably fake her looping N... You hate that you thought of that.` },
});
function Item_pen_grocery() { return ITEMS.pen.use.grocery(); }
item('badge', { the: "Don's ID badge",
  name: "Don's ID Badge", icon: 'badge',
  examine: () => `A red-and-white photo ID on a clip: <b>CANADIAN TIRE FINANCIAL SERVICES — Welland, Ont.</b> — "DON — Director, Card Operations." In the photo, your father is trying to smile and has instead achieved "hostage." Without this, he can't get through the security doors at work.`,
  use: {
    self: `You clip it to your shirt. On you it hangs at roughly your father's eye level. "Director, Card Operations." You approve a $5,000 credit limit increase for yourself. It doesn't take.`,
    don: () => Story.returnBadge(),
    dresser: () => Story.returnBadge(true), valet: () => Story.returnBadge(true),
  },
});
item('ctmoney', { the: 'the Canadian Tire money',
  name: 'Canadian Tire Money', icon: 'ctmoney',
  examine: `$2.35 in Canadian Tire money — little paper notes with Sandy McTire, the cheerful bearded Scotsman, smiling up at you in his tam. Your father has a sock drawer full of these. He's "saving up for something." He has been saving up since 1981.`,
  use: { self: `You fan the bills and pretend to be rich. In Canadian Tire money, you could almost afford a windshield-washer fluid.`, cookiejar: () => { lose('ctmoney'); return `You stuff the Canadian Tire money into the cookie jar as "payment." Maybe it's a joke. Maybe it's an apology. You don't know either.`; } },
});
item('coins', {
  name: 'Couch Change', icon: 'coins',
  examine: `Seventy-five cents fished out of the couch: a loonie-coloured nothing (actually a quarter, a dime, a nickel, and a sticky something), plus a caribou quarter with a hair stuck to it.`,
  use: { cookiejar: () => { lose('coins'); setF('paidForCookie'); karma(1); return `You drop the change into the barn-shaped cookie jar with a clink. Payment for one cookie, rendered. It's stupid. It's a little bit funny. It might be the nicest thing you've done all week.`; } },
});
item('treats', {
  name: 'Dog Biscuits', icon: 'treats',
  examine: `Three bone-shaped Milk-Bone biscuits. Shelby's currency. With these you could buy his eternal loyalty, though to be fair it's always on sale.`,
  consume: `You nibble the corner of a dog biscuit. It tastes like a Saltine that has given up. Shelby, if he knew, would never forgive you.`,
  use: { shelby: () => Story.shelbyTreat() },
});
item('ball', {
  name: 'Tennis Ball', icon: 'ball',
  examine: `Shelby's tennis ball: damp, fuzzy, and chewed into something closer to a prune. It's warm. You don't want to know why.`,
  use: { shelby: () => Story.shelbyFetch(), self: `You bounce it off your own forehead. Thwop. That's about where you are, mentally.` },
});

/* ---------------- tea ---------------- */
item('teabag', { name: 'Tea Bag', icon: 'teabag', examine: `One Red Rose orange pekoe tea bag. "Only in Canada, you say? Pity." The commercial plays in your head unbidden, like it always does.`, use: { mug: () => Story.teaPrep(), kettle: `The kettle would need a mug, too.` }, consume: `You chew a dry tea bag. Bitter. Educational.` });
item('mug', { name: 'Mug', icon: 'mug', examine: `A plain white mug. Noreen's tea mug, specifically — the one with the hairline chip on the handle. She thinks nobody knows about the chip.`, use: { kettle: () => Story.makeTea(), teabag: () => Story.teaPrep(), sink: `You give the mug a rinse. It wasn't dirty. It's cleaner now.` } });
item('tea', {
  name: 'Cup of Tea', icon: 'tea',
  examine: () => `A mug of hot Red Rose with a splash of milk — the colour of a paper bag, the way she likes it. ${G.f.teaMadeDay !== undefined && G.day > G.f.teaMadeDay ? 'It has gone stone cold.' : 'Steam curls off the top.'}`,
  consume: () => { lose('tea'); return `You drink the tea yourself. It's good. It was not for you.`; },
});

/* ---------------- letters & paper ---------------- */
item('letter', {
  name: 'Printed Letter', icon: 'letter',
  examine: () => { paper(esc(G.f.letterText || '(blank)')); return `Your letter, printed in Times New Roman on the DeskJet. The ink is a little streaky where the cartridge is running out.`; },
  use: { bed: () => Story.letterOnPillow(), noreen: () => Story.giveLetter(), self: `You read it to yourself again under your breath. It sounds different out loud.` },
  hit: `You crumple it — and then flatten it back out. You meant it. Mostly.`,
});
item('poem', { the: "the Mother's Day poem",
  name: "Mother's Day Poem (1993)", icon: 'letter',
  examine: () => { paper(Story.poemText(), true); return `You wrote this when you were eleven. Ms. Penner made the whole class do it in Computer Lab on the Commodore PETs, and you saved it to a floppy and never thought about it again.`; },
  use: { noreen: () => Story.givePoem(), bed: () => Story.letterOnPillow('poem') },
});

/* ---------------- the box ---------------- */
item('textbook', {
  name: 'Old Chemistry Textbook', icon: 'textbook',
  examine: () => { Story.learnPast('textbook'); return `<i>Organic Chemistry</i>, Morrison &amp; Boyd, 1968. Inside the cover, in a younger version of your mother's perfect handwriting: <b>Noreen Ashby — Brock University — Chemistry '68.</b> Every margin is full of notes. Sticky tabs bristle out of it. Next to a diagram of a titration curve she's written: <i>"The endpoint isn't where it changes colour. It's where it STAYS changed. — N."</i>`; },
  operate: () => { setF('studied'); Story.learnPast('textbook'); return `You read her notes on acid-base titration. Somehow they make more sense than Van Dyk's entire unit. "Add slowly near the end — the last drop is the one that matters." You understand it. You actually understand it.`; },
  consume: `It's a textbook, not a pizza.`,
});
item('photo', {
  name: 'Old Photograph', icon: 'photo',
  examine: () => { Story.learnPast('photo'); closeup('assets/ui/photo_lab.webp', `On the back, in pencil: <i>"N.A. — Lakeshore Estates lab, Feb. '79. FIRST GOOD BATCH!!"</i>`); return `A young woman in a lab coat, laughing so hard her eyes are closed, holding up a flask of something golden to the window. It takes you a full five seconds to recognise her. It's your mother. You have never seen her laugh like that.`; },
});
item('notebook', {
  name: 'Lab Notebook', icon: 'notebook',
  examine: () => { Story.learnPast('notebook'); paper(`LAKESHORE ESTATES WINERY — FERMENTATION LAB
N. Ashby — Vol. 7 — 1981–82

Jan 12 — Riesling icewine, tank 4. Brix 39.5. The wild culture (#4) is outperforming the commercial yeast AGAIN. Mr. P. says I'm "too attached to my bugs." I am exactly as attached as I need to be.
...
Mar 30 — Offered the head of lab position at Inniskillin. Don says take it. Baby says otherwise (kicking!!)
...
Jul 2 — Last day. Everybody signed a flask. Took a culture of #4 home in a mason jar. Somebody should keep it alive.
          I'll bake with it. Don't laugh.
          — N.`); return `Her lab notebook. Page after page of numbers in her immaculate hand — Brix readings, pH, titration results. And at the very end, the last entry.`; },
});
item('labcoat', {
  name: 'Old Lab Coat', icon: 'labcoat',
  examine: () => { Story.learnPast('labcoat'); return `A white cotton lab coat, folded with military precision. A small faded wine stain on one cuff. Embroidered over the pocket in red thread: <b>N. ASHBY</b>.`; },
  use: { self: `You put it on. The sleeves end just below your elbows and it won't button across your chest. You look like a mad scientist who has had a growth spurt mid-experiment. You take it off and fold it back up, carefully, the way it was.`, noreen: () => Story.giveLabcoat() },
});

/* ---------------- misc ---------------- */
item('jolt', { the: 'the Jolt Cola',
  name: 'Jolt Cola', icon: 'jolt',
  examine: `Jolt Cola: "All the sugar and twice the caffeine." You stashed it in the basement bar fridge behind Don's O'Doul's. Contraband.`,
  consume: () => { lose('jolt'); setF('jolted'); return `You crack it and chug it. Within minutes your eyelids are wide open and you can hear the furnace thinking. You will not be sleeping easily tonight.`; },
  use: { shelby: `No caffeine for the dog. Shelby is already running on pure chaos.`, ...Object.fromEntries(ELECTRONICS.map(e => [e, liquidOnComputer('Jolt Cola')])) },
});
item('plunger', {
  name: 'Plunger', icon: 'plunger',
  examine: `A red rubber plunger with a wooden handle. A noble tool. Possibly the most honest object in the house.`,
  use: {
    self: `You put the plunger on your head like a helmet. It suctions to your scalp with a disturbing pop. You remove it. You're glad nobody saw.`,
    toilet: () => { sfx('flush'); return `You plunge the toilet with professional vigour. It wasn't clogged. Now it's extra-not-clogged.`; },
    monitor: `You stick the plunger to the CRT. It suctions on with a satisfying <i>thwock</i> and a crackle of static that makes your arm hair stand up. You pull it off. Your reflection in the dark glass looks unimpressed.`,
    tower: `You plunge the CD-ROM tray. It ejects, smacks you in the knuckles, and retracts. The computer has won this round.`,
    subwoofer: () => { sfx('sub'); return `You plunge the subwoofer port. It makes a noise like a whale clearing its throat.`; },
    shelby: `Shelby sniffs the plunger, then looks at you with deep, ancestral disappointment.`,
    noreen: `"David," she says, without looking up. "Whatever you're about to do with that plunger. Don't."`,
    don: `Don looks at the plunger, then at you. "Is there a situation upstairs I should know about?" "No." "Then put it back, Stretch."`,
    greg: `Greg stares at the plunger. "Is that... a metaphor? Are you saying I'm full of—" "No, Greg." "Okay. Okay. Cool."`,
    mirror: `You plunge the mirror. It sticks. For a second you and your reflection are joined by a red rubber cup. Very deep. Very art-school.`,
    sink: `You plunge the sink. Glorp. Glorp. It drains faster now, out of sheer fear.`,
  },
});
item('floppy', {
  name: 'Floppy Disk', icon: 'floppy',
  examine: `A black 3.5" floppy. The label, in your eleven-year-old handwriting: <b>DAVES STUFF — DO NOT ERASE!!!</b> You haven't looked at it in years.`,
  use: { tower: () => { Computer.insertFloppy(); return `You slide the floppy into the drive. <i>Ka-chunk.</i> The drive light flickers green and it grinds away, the way they always do, like it's chewing.`; }, monitor: () => ITEMS.floppy.use.tower(), keyboard: () => ITEMS.floppy.use.tower(), subwoofer: `Magnets and floppies do not mix. That subwoofer could wipe it clean. You hold it well away.` },
});
item('cupcake', { the: 'the Mole Day cupcake',
  name: 'Mole Day Cupcake', icon: 'cupcake',
  examine: `Greg's homemade Mole Day cupcake: chocolate frosting shaped into a little mole face with candy eyes and a pink jellybean nose. Greg says it represents 6.02 × 10²³ units of love. It's a bit squashed from his backpack.`,
  consume: () => { lose('cupcake'); sfx('crunch'); return `You eat the mole's face first. It's very good. Greg's mom must have helped. Or Greg is a secret baking genius, which would be extremely on-brand.`; },
  use: { shelby: () => Story.shelbyChocolate('cupcake'), noreen: () => Story.giveCupcake() },
});
item('cd', { the: 'the Rage Against the Machine CD',
  name: 'Rage Against the Machine CD', icon: 'cd',
  examine: `<i>Evil Empire</i>, Rage Against the Machine. The jewel case is cracked. Noreen once read the back cover and said "Well, that's a bit much," which you consider a victory.`,
  use: { boombox: () => Story.playRage(), tower: `You could play it on the computer, but the boombox in your room has the better speakers. Well. The second-best speakers. Nothing beats the Zoltrix.` },
});
item('sodium', {
  name: 'Jar of Sodium', icon: 'sodium',
  examine: `A squat brown jar of mineral oil with grey lumps of sodium metal sitting at the bottom like river stones. The label says SODIUM (in mineral oil) in Mr. Van Dyk's capital letters, plus a skull he drew himself. The oil is there to keep it away from water. It is very, very important to keep this away from water.`,
  use: Object.assign({ self: `You do not touch sodium with your bare hands. Even you know that much from Grade 9.`, shelby: `Not near the dog. Never near the dog.`, bowls: `Not near the dog's water. What is wrong with you?`, milk: `Milk is mostly water. You set the jar down, very gently, very far away from the milk.` },
    ...WATER.map(w => ({ [w]: () => { setF('kaboomWhere', w); ending('kaboom'); return null; } }))),
  consume: `Eat sodium? Your stomach is mostly water. That would be the shortest, loudest meal of your life.`,
  hit: `You shake the jar. The lumps of sodium tumble lazily through the oil. You stop shaking the jar.`,
});
item('soap', {
  name: 'Guest Soap', icon: 'soap',
  examine: `One of the seashell-shaped guest soaps from the powder room. Pale pink. Never once used by a guest. Possibly never once used by anyone, ever, in recorded history.`,
  use: { self: `You wash your hands with a guest soap. It barely lathers. It wasn't designed to clean. It was designed to be looked at.`, noreen: () => { lose('soap'); rel('noreen', 0); return `You hand her the guest soap. She looks at it. Then at you. "Are you... returning my soap?" "Yeah." "...Thank you, David." She puts it in her cardigan pocket like evidence.`; } },
  consume: `It smells like a grandmother's bathroom. You don't eat it.`,
});
item('tylenol', { the: 'the Tylenol',
  name: 'Tylenol', icon: 'tylenol',
  examine: `Extra Strength Tylenol from the master bathroom cabinet. Noreen's.`,
  consume: `You don't have a headache. You have a mother. Different medicine.`,
  use: { noreen: () => Story.giveNoreenMeds('tylenol') },
});
item('inhaler', { the: "Noreen's inhaler",
  name: "Noreen's Inhaler", icon: 'inhaler',
  examine: `Your mother's blue Ventolin inhaler. She's had asthma since she was a girl. It's always somewhere within arm's reach of her.`,
  use: { noreen: () => Story.giveNoreenMeds('inhaler'), self: `You don't need it. She does.` },
});
item('tissue', { name: 'Tissue', icon: 'tissue', examine: `A Kleenex. Clean, thankfully.`, use: { noreen: () => Story.giveNoreenMeds('tissue') } });
