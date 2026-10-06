/* ==========================================================================
   School — Niagara District Secondary School, Room 214, SCH3A
   ========================================================================== */
'use strict';

const LESSONS = {
  1: { title: 'Lab Safety & The Bunsen Burner', board: 'BUNSEN BURNER: air hole OPEN = blue flame (hot!), CLOSED = yellow flame (sooty). GAS ON → STRIKE → ADJUST.',
    intro: `Mr. Van Dyk is in fine form. "Ladies and gentlemen, before we go anywhere near the titration unit, we are going to refresh our relationship with FIRE." He demonstrates the Bunsen burner with the reverence of a priest. "Gas on. Striker. Adjust the collar. A blue flame is a happy flame. A yellow flame is a sad, sooty flame. Do not make sad flames in my classroom."`,
    greg: `Greg leans over, whispering hugely: "He does this speech every October. I've timed it. Four minutes, eleven seconds. He's running long today. I think he's sad."` },
  4: { title: 'The Mole', board: '1 mol = 6.02 × 10²³ particles (Avogadro\'s number). MOLE DAY: FRI. OCT 22 (6:02 a.m. – 6:02 p.m.!!)',
    intro: `"The mole," says Mr. Van Dyk, "is not a small burrowing mammal." He looks directly at you. Several people laugh. "It is six point oh two times ten to the twenty-third <i>things</i>. A mole of doughnuts would cover the earth to a depth of eight kilometres. A mole of Greg would..." He pauses. "Let's not."`,
    greg: `Greg is vibrating. "Mole Day is FRIDAY, David. Friday the twenty-second. Six-oh-two. Ten twenty-three. I'm making cupcakes. Don't tell anyone. Tell everyone."` },
  5: { title: 'Stoichiometry', board: 'C₃H₈ + 5 O₂ → 3 CO₂ + 4 H₂O   "Balance the atoms like a chequebook."  QUIZ 3 SIGNATURES DUE FRIDAY!',
    intro: `Stoichiometry. Mr. Van Dyk balances propane combustion on the board and says "like a chequebook" four times. Then: "Quiz three. I will be collecting <i>signed</i> copies on Friday. Some of you" — a slow scan of the room that ends, as these always do, on you — "will want to have a conversation at home."`,
    greg: `Greg passes you a note folded into a perfect tiny triangle. It says: <i>"u ok? that look was pointed. (also: 3 CO₂. you had 2 on the quiz.)"</i>` },
  6: { title: 'Acids & Bases', board: 'pH < 7 ACID · pH 7 NEUTRAL · pH > 7 BASE · Phenolphthalein: colourless in acid → PINK in base',
    intro: `Acids and bases. Mr. Van Dyk drips phenolphthalein into a flask, then adds base one drop at a time until — suddenly — the whole thing blooms pink. "The endpoint," he says, almost tenderly. "You go slowly. You go carefully. And the one last drop changes everything."`,
    greg: `"That's kind of beautiful," Greg whispers. Then, embarrassed: "Chemically."` },
  7: { title: 'Titration Lab (Intro)', board: 'TITRATION: known concentration → burette → unknown. Find the ENDPOINT. Parent-Teacher Interviews TONIGHT 6–9 p.m.',
    intro: `"Titration," says Mr. Van Dyk, "is how the wineries down the road know how acidic their grapes are. Every bottle of icewine in this region exists because somebody in a lab coat added sodium hydroxide one drop at a time." He looks out the window toward the vineyards, wistful. "It's the most Niagara thing in chemistry." Then: "Parent-teacher interviews are tonight, six to nine. I look forward to meeting many of your parents. Some of you" — oh no — "more than others."`,
    greg: `"Are your parents coming tonight?" Greg asks. "Mine aren't. My dad's in Hamilton now and my mom works Thursdays. It's fine. It's fine." It does not sound fine.` },
  8: { title: 'MOLE DAY', board: 'HAPPY MOLE DAY!!! 6.02 × 10²³ — "Be the mole you want to see in the world." (QUIZ 3 SLIPS DUE TODAY)',
    intro: `It's Mole Day. Mr. Van Dyk is wearing a tie with tiny moles on it. Someone has drawn a mole on the chalkboard wearing a lab coat. Greg is wearing a T-shirt that says AVOGADRO'S NUMBER: IT'S NOT JUST A NUMBER, IT'S A LIFESTYLE, and he has brought a Tupperware container of cupcakes decorated as moles.`,
    greg: `Greg, beaming, slides a cupcake across the bench toward you. It has candy eyes and a jellybean nose. "Happy Mole Day, comrade."` },
  11: { title: 'Reaction Rates & A Digression on Mould', board: 'RATE depends on: temperature, concentration, surface area, CATALYSTS. (Fleming, 1928 — "That\'s funny...")',
    intro: `Reaction rates. Temperature, concentration, surface area. But Mr. Van Dyk gets distracted, as he often does, into a story: "1928. Alexander Fleming goes on holiday and leaves his dishes out — terrible lab hygiene, don't do it — and comes back to find a mould growing on one. And around the mould, a clear ring where the bacteria are <i>dead</i>. He says, 'That's funny.' And that's penicillin. The greatest discoveries begin with somebody leaving something out too long, and then having the wit to say 'that's funny' instead of 'that's gross.'"`,
    greg: `Greg nudges you. "I love this story. Imagine growing something in a dish and it saves like a hundred million people. That's the dream, man. That's the actual dream."` },
  12: { title: 'Gas Laws', board: 'PV = nRT · Boyle · Charles · Gay-Lussac · (UNIT TEST WEDNESDAY)',
    intro: `Gas laws. Mr. Van Dyk heats an empty pop can, inverts it into ice water, and it crumples with a bang that makes three people scream. "Pressure!" he says joyfully. "Unit test Wednesday. Study, or experience pressure of a different kind."`,
    greg: `"I'm making study notes," Greg says. "Colour-coded. You want a copy? You can have a copy. You should have a copy."` },
  13: { title: 'UNIT TEST', board: 'UNIT TEST — NO TALKING — Calculators OK — "The endpoint is where it STAYS changed."',
    intro: `Unit test. The room goes silent except for the hum of the fluorescents and the tap of calculators. You look at the first question: a titration. You read it twice.`,
    greg: `Greg gives you a solemn thumbs-up that is mostly thumb.` },
  14: { title: 'Fermentation & Organic Chem Preview', board: 'C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂ (YEAST!) · Wild vs. cultured yeast · Niagara icewine: 35+ Brix',
    intro: `A preview of next year's organic chemistry: fermentation. "Yeast," says Mr. Van Dyk, "turns sugar into alcohol and carbon dioxide. Bread, wine, beer. In this region, some of the old winery chemists kept their own wild yeast strains for decades — fed them like pets. There's a famous one, out at Lakeshore Estates in the seventies; the lab chemist there isolated a wild strain that made their icewine sing. Nobody knows what happened to it."`,
    greg: `"Wild yeast," Greg breathes. "Imagine a yeast with a pedigree."` },
  15: { title: 'Halloween Demonstrations', board: 'HAPPY HALLOWEEN · "Elephant Toothpaste": H₂O₂ + KI (catalyst) → H₂O + O₂ · NO TOUCHING THE DRY ICE',
    intro: `It's the Friday before Halloween, and Mr. Van Dyk has turned off the lights for demonstrations. Dry ice fog pours off the front bench. He makes "elephant toothpaste" — a huge orange foaming column that erupts out of a graduated cylinder — and the whole class cheers like it's a concert. For a moment everybody, even you, is about eight years old.`,
    greg: `Greg is filming it on his dad's camcorder. "For posterity," he says. "For the ages."` },
};

function lesson() { return LESSONS[G.day] || { title: 'Chemistry', board: 'Review.', intro: 'Mr. Van Dyk reviews last week\'s material.', greg: '' }; }

/* ----------------------------- CLASSROOM ----------------------------- */
scene('classroom', {
  name: () => `Room 214 — ${lesson().title}`, floor: 'school',
  img: 'classroom', drop: [10, 92],
  look: () => `<b>Room 214, Grade 11 Chemistry.</b> Black epoxy benches in pairs, each with a little deep sink and two brass gas nozzles. Pale green cinder-block walls, a periodic table the size of a garage door, the hum of fluorescent lights, and twenty-six Grade 11s in flannel and frosted tips. You sit in the centre column, second row, next to Greg, who takes up most of the bench and all of the stool.`,
  brief: () => `Room 214.`,
  hs: {
    greg: { name: 'Greg', npc: 'greg' },
    vandyk: { name: 'Mr. Van Dyk', npc: 'vandyk' },
    chalkboard: { name: 'Chalkboard', examine: () => `The chalkboard, in Mr. Van Dyk's slanted capitals: <b>${lesson().board}</b>` },
    periodic: { name: 'Periodic Table', examine: `A periodic table the size of a garage door. Someone has, at some point, coloured in the boxes for Ba, Na, Na, Na, Na so that they spell BaNaNaNaNa. Mr. Van Dyk has decided it's educational.` },
    sink: { name: 'Bench Sink', examine: `The little deep sink in the middle of your bench. There's a gum wrapper in the drain from approximately 1987.`, operate: () => { sfx('splash'); return `You run the tap. Greg moves his textbook out of the splash zone without looking up. He's done this before.`; } },
    gas: { name: 'Gas Nozzle', examine: `Two brass gas nozzles on the bench, for the Bunsen burners. The handles are the kind you could turn with a pinky.`, operate: () => Story.gasTap() },
    burner: { name: 'Bunsen Burner', examine: `A Bunsen burner on a rubber hose. The air collar is stuck halfway, which Greg says is "a metaphor for this school."`, operate: () => Story.lightBurner() },
    book: { name: 'Textbook', examine: `<i>Chemistry: Concepts and Applications</i>, Ontario edition, with the previous owner's name — "JENNIFER K. '97" — on the inside cover next to a heart. You've opened it maybe four times.`, operate: () => { setF('readClassText', G.day); return `You read the section on today's topic. It's dry. You get about two-thirds of it. It's two-thirds more than yesterday.`; } },
    students: { name: 'Students', examine: () => pick([`The front row: Tyler, who is drawing a skateboard on his binder; and Amanda, who has a butterfly clip in every strand of her hair and is the only person taking notes in four colours.`, `Behind you: Jen K., who has an Abercrombie hoodie and a crush on someone that is not you. Beside her, Mike, who's asleep with his eyes open, a skill.`, `Across the aisle: Steph and Melissa, passing a note about the Backstreet Boys concert at the SkyDome. They see you looking and fold it smaller.`]), speak: () => pick([`You lean forward and whisper to Tyler. "Hey." Tyler says, "Hey, Stretch," without looking up. That's all you ever say to each other. It's a good relationship.`, `"Shh," says Amanda, before you've even said anything.`, `You try to talk to Jen K. She smiles politely in the way that means she's going to tell her friend you talked to her.`]), hit: `Mr. Van Dyk would expel you, and Greg would cry. No.` },
    windows: { name: 'Windows', examine: `Tall windows onto the school field. The maples are orange and red. Past them, a smudge of vineyards and, if you squint, the lake.` },
    hood: { name: 'Fume Hood', examine: `The fume hood: a glass box with a fan that sucks dangerous vapours out of the room. It roars when it's on. Greg says it's the most beautiful machine in the school.` },
    desk: { name: "Teacher's Bench", exit: 'teacherdesk', examine: `Mr. Van Dyk's long demonstration bench at the front. When he steps into the prep room, the front of the class becomes, briefly, lawless.` },
  },
});

/* ----------------------------- TEACHER'S BENCH ----------------------------- */
scene('teacherdesk', {
  name: "Mr. Van Dyk's Bench", floor: 'school',
  img: 'teacherdesk',
  layers: () => F('tookSodium') ? [{ src: 'teacherdesk_sodium', rect: [220, 555, 118, 175] }] : [],
  drop: [10, 90],
  look: `You wander up to the front while Mr. Van Dyk is in the prep room, rummaging for something with the door half-closed. His demonstration bench: a squat brown jar labelled SODIUM, test tubes, a flask, his gradebook, his coffee mug. Behind it, the glass-fronted supply cabinet. Nobody stops you. Nobody ever stops the tall kid; they assume you've been sent.`,
  brief: `The front bench. Mr. Van Dyk's voice drifts from the prep room.`,
  hs: {
    sodium: { name: 'Jar of Sodium', show: () => !F('tookSodium'), examine: `A squat brown jar of mineral oil with lumps of grey sodium metal at the bottom. Mr. Van Dyk drew a skull on the label. You've seen him drop a pea-sized bit into a bowl of water once: it fizzed and skittered and popped with a little orange flame and everyone screamed with joy.`, take: () => { setF('tookSodium'); give('sodium'); karma(-1); return `You glance at the prep room door. Then you slip the jar into your hoodie pocket. Your heart is pounding. This is the most criminal thing you've ever done, and you once stole a Caramilk from Mac's Milk.`; } },
    tubes: { name: 'Test Tubes', examine: `A wooden rack of clean test tubes.`, take: `Greg would be appalled. Test tubes belong to the people.` },
    flask: { name: 'Erlenmeyer Flask', examine: `An Erlenmeyer flask with a faint pink tinge in the bottom from yesterday's titration. The endpoint, stayed changed.` },
    gradebook: { name: 'Gradebook', examine: () => `Mr. Van Dyk's gradebook, open. You shouldn't look. You look. Your row: Quiz 1, 62. Quiz 2, 58. Quiz 3, 41 — circled, with "<i>call home?</i>" in pencil. ${G.f.testScore ? `Unit test: ${G.f.testScore}.` : ''} Greg's row is a solid wall of 96s, and one 100 with a star.`, take: `Taking a teacher's gradebook is the kind of thing that ends up on the news.` },
    mug: { name: 'Coffee Mug', examine: `A mug that says WORLD'S OKAYEST CHEMIST. It's still warm. Tim Hortons, double-double, by the smell.`, consume: `Drinking a teacher's coffee is a crime in at least three provinces.` },
    cabinet: { name: 'Supply Cabinet', examine: `A tall glass-fronted cabinet: beakers, graduated cylinders, reagent bottles with crusty caps, and a whole shelf of shrink-wrapped stacks of sterile plastic petri dishes, poured with agar for next semester's biology classes.`, open: () => { if (has('petri') || has('petri_culture') || exists('petri')) return `You already have a petri dish. Don't get greedy.`; give('petri'); setF('tookPetri'); return `You ease the glass door open and slide one petri dish out of the stack — a thin layer of beige nutrient agar in the bottom — and into your hoodie. Agar plates. Ready to grow anything.`; } },
    fridge: { name: 'Lab Fridge', examine: `A small lab fridge with a hand-lettered sign: NO FOOD — CHEMICALS ONLY. Through the little window you can see a ham sandwich with "VAN DYK" written on the bag.`, open: `Inside: bottles of reagent, a box of agar, and Mr. Van Dyk's ham sandwich. NO FOOD — CHEMICALS ONLY. You close it. You have seen too much.` },
    clock: { name: 'Clock', examine: `The classroom clock. It runs four minutes fast, which is the only thing everybody in this school agrees on.` },
    chalkboard: { name: 'Chalkboard', examine: () => `<b>${lesson().board}</b>` },
    periodic: { name: 'Periodic Table', examine: `Up close the periodic table is covered in the tiny initials of twenty years of students.` },
    students: { name: 'Students', examine: `Your classmates, in clumps, taking advantage of the teacher's absence. Somebody is attempting to light a pencil.` },
    back: { name: 'Back to Your Seat', exit: 'classroom', rect: [30, 88, 40, 12], examine: `Back to your seat beside Greg.` },
  },
});
