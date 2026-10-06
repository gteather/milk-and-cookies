/* ==========================================================================
   Scenes — upstairs
   ========================================================================== */
'use strict';
const dn = (night, day) => () => (G.phase === 'day' ? day : night);

/* ----------------------------- DESK (close-up) ----------------------------- */
scene('desk', {
  name: 'Den — The Gateway', floor: 'up', parent: 'den',
  img: dn('desk', 'desk_day'), hsBase: 'desk',
  patchItems: () => G.phase === 'day'
    ? { milk: { src: 'desk_day_milk', rect: [791, 400, 99, 163] }, cookie: { src: 'desk_day_cookie', rect: [847, 518, 188, 92] } }
    : { milk: { src: 'desk_milk', rect: [790, 420, 90, 140] }, cookie: { src: 'desk_cookie', rect: [860, 515, 155, 85] } },
  drop: [56, 62],
  look: () => `<b>The Gateway 2000.</b> Your command centre. A beige Pentium Pro 200 tower with 64 megs of RAM and a Zoltrix internal modem; a 17-inch CRT that hums at a frequency only dogs and teenagers can hear; two little beige satellite speakers; and under the desk, the crown jewel — the big black Zoltrix subwoofer, which distorts anything louder than a whisper and which you love more than most people.`,
  brief: () => `The Gateway hums. ${where('milk') === 'desk' || where('cookie') === 'desk' ? 'Her milk and cookie are still sitting where she left them.' : ''}`,
  hs: {
    monitor: { name: '17" CRT Monitor', examine: () => `A 17-inch Gateway Vivitron CRT, deep as a bar fridge and about as heavy. ${Computer.online() ? 'The ICQ flower in the system tray is green.' : 'Windows 98 waits patiently on the screen, teal and full of possibility.'} A thin film of static dust coats the glass.`, operate: () => { Computer.open(); return null; }, open: () => { Computer.open(); return null; }, hit: `You thump the side of the monitor, the universal technique. The picture wobbles and degausses with a deep <i>BWONG</i>. Satisfying.`, click: 'operate' },
    keyboard: { name: 'Keyboard', examine: `A beige Gateway AnyKey keyboard, with an M&M wedged permanently under the F7 key. The space bar has worn shiny.`, operate: () => { Computer.open(); return null; }, click: 'operate', hit: `You mash the keyboard with both palms. Somewhere in Windows, a Notepad window fills with "kjhsdfgkjhsdf." Catharsis.` },
    mouse: { name: 'Ball Mouse', examine: `A two-button ball mouse. You took the ball out once to clean the rollers and found what looked like a whole second mouse in there.`, operate: () => { Computer.open(); return null; }, click: 'operate', open: `You twist off the ring and pop the ball out. You look at it. You put it back. That's the ritual.` },
    tower: { name: 'Gateway 2000 Tower', examine: `The tower: Pentium Pro 200 MHz, 64MB EDO RAM, a 2.5 gig hard drive, a 6x CD-ROM, and the Zoltrix internal modem whose screaming handshake has been the soundtrack of this household for two years. A Gateway cow-spot sticker on the side. Bought in 1996 for an amount of money your father still mentions at Christmas.`, operate: () => { Computer.open(); return null; }, open: `You are not opening the case. The last time you opened the case, you installed a sound card upside down and Don had to call a man named Rajinder.`, hit: `You thump the tower. The hard drive makes a noise like a cricket being stepped on. You stop.` },
    subwoofer: { name: 'Zoltrix Subwoofer', examine: `The Zoltrix subwoofer: a big black box with an 8-inch woofer and a bass knob that you have permanently turned to MAX with a piece of tape over it. It distorts everything. It makes Rage Against the Machine sound like it's being played inside a whale. It's perfect.`, operate: () => { sfx('sub'); return `You tap the cone with a knuckle while the speakers are on. <i>WHUMMMP.</i> Downstairs, a picture frame shivers on its nail. ${here('noreen') ? '' : 'Faintly, from the kitchen: "...David."'}`; }, hit: () => { sfx('thump'); return `You kick the subwoofer. It answers with a booming thud. It's the only thing in this house that's on your side.`; }, take: `It weighs as much as Shelby and it's wired into everything. It stays.` },
    speakerL: { name: 'Left Speaker', examine: `A little beige satellite speaker. Together with its twin, it handles everything the subwoofer is too proud to.`, operate: `You nudge it a quarter-inch toward the centre. Stereo imaging: perfected.` },
    speakerR: { name: 'Right Speaker', examine: `The right speaker. Slightly louder than the left. Nobody knows why. Nobody will ever know why.`, operate: `You nudge it. Perfect.` },
    printer: { name: 'HP DeskJet', examine: () => F('printed') && !F('letterTaken') ? `The DeskJet. There's a freshly printed page sitting in the output tray.` : `An HP DeskJet 682C. Prints in colour, theoretically. In practice everything comes out faintly green, because the cyan cartridge is a liar.`, take: () => Story.takePrint(), open: () => Story.takePrint(), operate: () => Story.takePrint() || `It only prints from the computer. You'd need to print something first.` },
    lamp: { name: 'Banker\'s Lamp', examine: `A green-glass banker's lamp. Noreen bought it so the den would look "studious." It casts a pool of gold across the desk.`, operate: `You click it off. Darkness, and the blue glow of the monitor. You click it back on. Better.` },
    window: { name: 'Window', examine: () => G.phase === 'day' ? `Grey October daylight. Across the street, the new houses of Garrison Village stand in neat rows like they're waiting to be inspected.` : `Rain streaks down the glass. Out there, the streetlights of Garrison Village, and in the glass, faintly, a very long, very sullen reflection that you choose to ignore.`, open: `It's October. Noreen would have a stroke about the heating bill.` },
    pens: { name: 'Mug of Pens', examine: `A Brock University mug full of pens, half of which work. The mug has a hairline crack and a faded Brock Badgers logo.`, take: () => { if (has('pen') || exists('pen')) return `You already took the one that works.`; give('pen'); return `You test pens on your palm until you find one that writes on the first try. A clear blue Bic. You take it.`; } },
    floppies: { name: 'Disks & CDs', examine: `A drift of floppy disks and CD jewel cases: an AOL trial disc (the 4th one this month), Encarta 97, a burned CD labelled "MIX 4 GREG," and an old black floppy in your eleven-year-old handwriting.`, take: () => { if (has('floppy') || exists('floppy')) return `You've got the one that matters.`; give('floppy'); return `You fish out the old black floppy. "DAVES STUFF — DO NOT ERASE!!!" You have no memory of what's on it.`; } },
    drawer: { name: 'Desk Drawer', examine: `The desk drawer. It sticks.`, open: () => { if (once('denDrawer')) return `You wrestle the drawer open. Inside: a ream of printer paper, the Gateway warranty card (never mailed in), a dried-out highlighter, a box of staples, and a sticky note in Noreen's handwriting: "<i>David — please don't use the internet between 6 and 8, I'm expecting calls. Love, Mom.</i>" It's dated three weeks ago. You never saw it. Or you saw it and forgot. Same thing, really.`; return `Paper, warranty card, staples, and that sticky note you can't stop thinking about.`; }, close: `You shove it shut. It sticks halfway. Typical.` },
    phonecord: { name: 'Phone Cord', examine: () => F('cordYanked') && G.day === 0 ? `The phone cord is gone. She took it. She actually took it. The jack on the wall gapes at you.` : `The beige phone cord runs from the back of the Zoltrix modem to the wall jack. This one cord is the reason for approximately 60% of all arguments in this house.`, take: () => F('cordYanked') && G.day === 0 ? `There's nothing left to take.` : `You could unplug it, but then you couldn't get online. Which is, you suppose, exactly what she'd want.`, operate: () => Computer.online() ? (Computer.hangup(true), `You yank the phone cord out of the wall. The modem screams and dies. Somewhere downstairs, a dial tone becomes available.`) : `It's plugged in. That's all a cord can do.` },
    painting: { name: 'Framed Print', examine: `A framed print of a stone bridge over a creek. It came with the house. Nobody chose it, and nobody can bring themselves to take it down.` },
  },
});

/* ----------------------------- DEN (wide) ----------------------------- */
scene('den', {
  name: 'Den', floor: 'up',
  img: dn('den_night', 'den_day'), hsBase: 'den_night',
  drop: [30, 82],
  look: `<b>The den.</b> The smallest room upstairs, and the most important one in your life. Beige walls, beige carpet, beige computer. A tall bookshelf of encyclopedias nobody has opened since 1994. The Gateway's original cow-spotted shipping box squats in the corner because your father "might need it for a return."`,
  brief: () => `The den. The Gateway glows${Computer.online() ? ', the modem lights flickering' : ''}.`,
  hs: {
    turnback: { name: 'Doorway — to the Balcony', exit: 'upstairs', rect: [36, 91, 28, 9], examine: 'Behind you: the way out.' },
    desk: { name: 'Computer Desk', exit: 'desk', examine: `The computer desk. The Gateway hums on top of it, the Zoltrix subwoofer crouches beneath. Sit down?`, click: 'go' },
    cowbox: { name: 'Gateway Box', examine: `The famous Gateway 2000 shipping box, printed with black-and-white Holstein cow spots. It came from South Dakota with your future inside it.`, open: () => once('cowbox') ? `You open the flaps. Packing foam, the Windows 95 CD (you upgraded to 98 off Greg's copy), a "Getting Started" binder, and a mouse pad shaped like a cow. Moo.` : `Foam. Manuals. A cow mouse pad. Moo.`, hit: `You punch the cow box. It's a cardboard cow. It can take it.`, speak: `"Moo," you say to the box. You are alone. Thank God.` },
    bookshelf: { name: 'Bookshelf', examine: `Encyclopaedia Britannica (1987), a shelf of Readers' Digest Condensed Books, Don's binders labelled "TAXES 91–98," Noreen's Joy of Cooking, and — wedged at the end, spine faded — <i>The Microbe Hunters</i> by Paul de Kruif, with "N.A." pencilled inside the cover.`, take: `You could take <i>The Microbe Hunters</i>, but you'd never read it, and she'd notice it was gone.` },
    window: { name: 'Window', examine: () => G.phase === 'day' ? `Overcast. A maple on the boulevard has gone the colour of a fire truck.` : `Night and rain. Garrison Village glows in the wet.`, open: `The window's painted shut. Builder-grade.` },
    chair: { name: 'Office Chair', examine: `A grey office chair, permanently lowered to its lowest setting by Noreen and permanently raised to its highest by you. The pneumatic cylinder has picked a side: it slowly sinks.`, operate: `You spin in the chair. Once. Twice. It sinks an inch. You stop.` },
    painting: { name: 'Vineyard Watercolour', examine: `A watercolour of vineyard rows going down toward the lake, signed in the corner: "<i>Lakeshore Estates — for N., with thanks — 1982</i>." You've walked past it a thousand times and never read the corner.`, once: true },
    subwoofer: { name: 'Subwoofer', examine: `The Zoltrix, under the desk, glowering.`, go: () => { go('desk'); return null; } },
  },
});

/* ----------------------------- UPSTAIRS BALCONY ----------------------------- */
scene('upstairs', {
  name: 'Upstairs Balcony', floor: 'up',
  img: dn('upstairs', 'upstairs_day'), hsBase: 'upstairs',
  drop: [40, 86],
  look: `<b>The upstairs balcony.</b> A horseshoe of beige carpet wrapped around the open drop to the foyer, with an oak railing and white spindles. The brass chandelier hangs in the middle like a jellyfish. Four doors: the master suite on the far left, the bathroom, the den in the corner, and your room — the one with the red light leaking out from under it.`,
  brief: `The balcony. Four doors and a long drop.`,
  hs: {
    masterdoor: { name: 'Master Bedroom', exit: 'master', examine: `The double doors to your parents' room. You haven't been in there without a reason since you were nine.` },
    bathdoor: { name: 'Bathroom', exit: 'guestbath', examine: `The upstairs bathroom. Yours, functionally.` },
    dendoor: { name: 'Den', exit: 'den', examine: `The den, glowing monitor-blue.` },
    daviddoor: { name: 'Your Room', exit: 'davidroom', examine: `Your door. Red light seeps out from underneath it, like the room is on fire, or is a darkroom, or is in the Soviet Union.` },
    stairs: { name: 'Stairs Down', exit: 'foyer', examine: `The oak staircase down to the foyer. Fourteen steps. You can do it in five.` },
    chandelier: { name: 'Chandelier', examine: `A brass chandelier with eight frosted tulip shades, hanging down into the stairwell. You can reach it from the balcony if you lean. You know this because you've done it, and you know you shouldn't because Noreen saw you do it.`, operate: `You lean over the railing and set the chandelier swinging gently. The shadows of the spindles sweep across the foyer below like the beam of a lighthouse. You stop it before anyone sees.`, hit: `You bat at the chandelier. It tinkles. Somewhere downstairs: "Is that the chandelier?"` },
    table: { name: 'Hall Table', examine: `A half-moon table with silk flowers that Noreen dusts on Thursdays. On it, a china dish of potpourri and a framed photo of you at about six, at the Ontario Science Centre, with your face pressed against a plasma globe. Your mother is behind you in the photo, crouched down, pointing at the lightning and explaining something. She looks like the happiest person in the building.`, take: `It's her favourite photo. You leave it.` },
    photos: { name: 'Family Photos', examine: `A gallery of framed photos along the hall: school pictures of you getting progressively longer and more unfortunate, Grade 1 to Grade 11. In the Grade 9 one you have a bowl cut. Noreen insists on keeping it up "for balance."` },
    railing: { name: 'Railing', examine: `The oak railing round the open drop. Seventeen feet to the tile.`, operate: `You lean on the railing and look down into the foyer. It's a long way. You lean back.`, hit: `You smack the railing. It wobbles in a way that suggests the builder did this in an afternoon.` },
  },
});

/* ----------------------------- MASTER BEDROOM ----------------------------- */
scene('master', {
  name: 'Master Bedroom', floor: 'up',
  img: () => Story.noreenState() === 'sick' ? 'master_sick' : G.phase === 'day' ? 'master_day' : 'master',
  hsBase: 'master',
  drop: [46, 88],
  look: `<b>Your parents' room.</b> A king bed swamped in burgundy floral and about thirty decorative pillows that exist only to be removed every night and replaced every morning. It smells like Oil of Olay and Don's Old Spice. The bed skirt goes all the way to the carpet. You notice, the way you'd notice a door left open, that there's a lot of dark space under that bed.`,
  brief: () => Story.noreenState() === 'sick' ? `The master bedroom. The air is thick and close. Your mother is in bed.` : `Your parents' room. Quiet. Pillowed.`,
  hs: {
    turnback: { name: 'Doorway — to the Balcony', exit: 'upstairs', rect: [36, 91, 28, 9], examine: 'Behind you: the way out.' },
    noreen: { name: 'Noreen', npc: 'noreen', show: () => Story.noreenState() === 'sick', from: 'noreen' },
    bed: { name: 'King Bed', examine: () => Story.noreenState() === 'sick' ? `Your mother is propped up on the pillows, grey-faced, breathing like the air is too thick. There's a box of tissues and a glass of water on the nightstand.` : `The king bed. Thirty pillows. Her side is the left — you can tell from the dent in the reading pillow and the hand cream on the nightstand.`, operate: () => Story.noreenState() === 'sick' ? `Not now.` : `You flop backwards onto your parents' bed like you did when you were six. It's very soft. You immediately feel like a burglar and get up.`, go: () => { go('underbed_master'); return null; }, use: { letter: () => Story.letterOnPillow(), poem: () => Story.letterOnPillow('poem') } },
    bedskirt: { name: 'Under the Bed', exit: 'underbed_master', examine: `The pleated dust ruffle hangs to the carpet all the way around. Under there it's dark, warm, and nobody ever looks.`, open: () => { go('underbed_master'); return null; } },
    nightL: { name: "Noreen's Nightstand", examine: () => { setF('sawJournal'); return `Her side: a brass lamp, her reading glasses folded on top of a Maeve Binchy paperback, a tube of hand cream, and underneath it all, half-hidden, a copy of the <i>American Journal of Enology and Viticulture</i>, Summer 1999, with a bookmark in an article about wild yeast fermentation. Pencil notes in the margins.`; }, open: `Her drawer: a sleep mask, Halls, a rosary she doesn't use, and a pocket notebook of crossword answers. Nothing you should be reading.`, take: `You leave her things alone.` },
    nightR: { name: "Don's Nightstand", examine: `Don's side: a digital alarm clock set to 5:45 a.m., a coin dish, Tums, and a Tom Clancy the size of a brick.`, open: () => { if (exists('ctmoney')) return `The drawer: Tums, reading glasses, a Day-Timer.`; give('ctmoney'); return `In the drawer, between a Day-Timer and a roll of Tums, there's a thick wad of Canadian Tire money held with an elastic. You peel off a few bills. He'll never notice. He's been saving it since 1981.`; } },
    dresser: { name: "Don's Dresser", examine: () => `A tall oak dresser. ${Story.badgeOnDresser() ? 'His valet tray on top has his keys, his wallet, and his work ID badge.' : 'A valet tray on top: car keys, a few coins.'}`, open: `Socks, folded in pairs. Undershirts, folded in thirds. Your father lives an orderly life.`, use: { badge: () => Story.returnBadge(true) } },
    valet: { name: 'Valet Tray', examine: () => Story.badgeOnDresser() ? `Car keys, wallet, and his red Canadian Tire Financial Services ID badge on its clip.` : `Car keys. Spare change. Lint.`, take: () => Story.takeBadge(), use: { badge: () => Story.returnBadge(true) } },
    vanity: { name: "Noreen's Vanity", examine: `Her vanity. A hairbrush, a bottle of Chanel No. 19 she wears only for "occasions," and a wooden jewellery box.`, open: `You open the vanity drawer: scarves folded like flags. You close it. Respectfully.` },
    jewelry: { name: 'Jewellery Box', examine: `A walnut jewellery box with a tiny brass key.`, open: () => { setF('sawLocket'); return `Inside, on blue velvet: her pearl earrings, her mother's wedding ring, a charm bracelet with a tiny silver Erlenmeyer flask on it, and a locket. In the locket: on one side, a baby picture of you, bald and furious. On the other side, a tiny dried grape leaf, pressed flat.`; }, take: `You are not stealing your mother's jewellery. There are lines.` },
    photo: { name: 'Wedding Photo', examine: () => { setF('sawWedding'); return `Their wedding photo, 1980. Don in a brown three-piece suit with lapels like wings; Noreen in an off-white dress, both of them standing between rows of grapevines. There's a sign behind them, slightly out of focus: LAKESHORE ESTATES WINERY. You never asked why they got married at a winery.`; } },
    ensuite: { name: 'Ensuite Bathroom', exit: 'masterbath', examine: `Their bathroom, through the door.` },
    curtains: { name: 'Curtains', examine: `Heavy swagged curtains in a pattern Noreen called "Hunter Rose." They block all light. They could block a nuclear blast.` , open: () => G.phase === 'day' ? `You part the curtains. Grey daylight. The neighbour's kid is jumping in leaves.` : `Night. Rain on the window. You close them again.` },
    painting: { name: 'Vineyard Painting', examine: `Another vineyard painting. This house has more paintings of grapevines than the Art Gallery of Ontario.` },
  },
});

/* ----------------------------- MASTER BATH ----------------------------- */
scene('masterbath', {
  name: 'Ensuite Bathroom', floor: 'up',
  img: 'masterbath',
  drop: [44, 84],
  look: `<b>The ensuite.</b> Double sinks in cultured marble, Hollywood bulbs, a corner whirlpool tub with seashell soaps that are purely ceremonial. The whole room is peach and seafoam, like being inside a seashell yourself.`,
  brief: `The ensuite. Peach and seafoam.`,
  backTo: 'master',
  hs: {
    turnback: { name: 'Doorway — to the Bedroom', exit: 'master', rect: [36, 91, 28, 9], examine: 'Behind you: the way out.' },
    mirror: { name: 'Mirror', examine: `The Hollywood bulbs make everyone look like they're about to win an Oscar. This mirror lies. The honest mirror is the one in your bathroom.`, hit: `Seven years' bad luck. Plus Noreen. You don't.` },
    sinks: { name: 'Double Vanity', examine: `His and hers sinks. His has a crust of shaving foam. Hers is spotless. There's a medicine cabinet behind the mirror.`, open: () => { if (exists('tylenol')) return `The medicine cabinet: Tums, dental floss, Don's Metamucil, a box of Band-Aids.`; give('tylenol'); return `You open the medicine cabinet. Band-Aids, floss, Don's Metamucil, Noreen's prescriptions lined up like soldiers. You take the bottle of Extra Strength Tylenol.`; }, operate: `You run the tap. Water. Wow.` },
    aftershave: { name: 'Aftershave', examine: `A blue bottle of Old Spice. The smell of your father, specifically. It's the smell of being picked up from hockey in 1989.`, operate: () => { setF('oldSpice', G.day); return `You splash on some Old Spice. Instantly you smell like a fifty-six-year-old middle manager. You are, for a moment, Don.`; }, take: `It's Don's. And you already smell like him now, probably, if you touched it.` },
    inhaler: { name: 'Inhaler', show: () => !exists('inhaler'), examine: `Your mother's blue Ventolin inhaler, left on the counter. She's had asthma since she was a girl. Mould and dust set it off, she always says. It's why she vacuums like it's a religion.`, take: () => { if (Story.noreenState() === 'sick' || Story.noreenState() === 'cough') { give('inhaler'); return `You take her inhaler. She'll need it near her.`; } return `That's your mother's inhaler. Even at your worst, you're not taking that.`; } },
    tub: { name: 'Whirlpool Tub', examine: `A corner whirlpool tub. Your parents have used the jets exactly once, and the noise frightened Shelby so badly he hid in the dryer.`, operate: `You turn on the jets. They roar like a 747. You turn them off before anyone comes up.` },
    shower: { name: 'Shower', examine: `A glass shower stall with a gold frame. It's very clean. Suspiciously clean.` },
    towels: { name: 'Towels', examine: `Peach towels and seafoam towels, folded into thirds, then rolled. You are not allowed to touch these.` },
    window: { name: 'Window', examine: `A frosted bathroom window.` },
  },
});

/* ----------------------------- GUEST BATH ----------------------------- */
scene('guestbath', {
  name: 'Bathroom', floor: 'up',
  img: 'guestbath',
  layers: () => G.f.tookPlunger ? [{ src: 'guestbath_plunger', rect: [877, 549, 114, 234] }] : [],
  drop: [40, 86],
  look: `<b>Your bathroom.</b> Navy anchors on the towels from Noreen's "nautical" phase. A toothbrush in a cup, an exploded tube of Crest, a can of body spray, hair gel, and the big mirror over the sink that you try very hard not to look into on your way past.`,
  brief: `The bathroom. The mirror waits.`,
  hs: {
    turnback: { name: 'Doorway — to the Balcony', exit: 'upstairs', rect: [36, 91, 28, 9], examine: 'Behind you: the way out.' },
    mirror: { name: 'Mirror', click: 'examine', examine: () => { go('mirror'); return null; }, operate: () => { go('mirror'); return null; }, go: () => { go('mirror'); return null; }, hit: `You raise your fist at the mirror. Your reflection raises its fist at you. Stalemate.` },
    sink: { name: 'Sink', examine: `The sink, freckled with toothpaste.`, operate: () => { sfx('splash'); return `You splash cold water on your face. It doesn't wash anything off.`; } },
    toothbrush: { name: 'Toothbrush', examine: `Your toothbrush, splayed like a broom from aggressive use.`, operate: `You brush your teeth. Two minutes, the way the dentist says. Well — forty seconds.`, take: `It's your toothbrush. It lives here.` },
    mouthwash: { name: 'Mouthwash', examine: `Scope. Mint.`, consume: `You swish and spit. Minty. Your mouth is clean even if your conscience isn't.`, operate: `You swish and spit. Minty.` },
    spray: { name: 'Body Spray', examine: `A black can of "Tag" body spray, "Instinct" scent. The ads promised women would chase you through a city. So far: no.`, operate: () => { inc('sprayed'); return F('sprayed') > 2 ? `You fog the entire bathroom. From downstairs, faintly but clearly: "DAVID. OPEN. A. WINDOW."` : `Psssht. You are now a walking cloud of "Instinct." Your eyes water. Somewhere a girl is not running toward you.`; }, consume: `No.` },
    toilet: { name: 'Toilet', examine: `The toilet. It runs a little if you don't jiggle the handle.`, operate: () => { sfx('flush'); return `You flush. It runs. You jiggle the handle. It stops. This is the one problem in your life you know how to fix.`; } },
    plunger: { name: 'Plunger', show: () => !G.f.tookPlunger, examine: `A red rubber plunger beside the toilet. Ready for anything.`, take: () => { setF('tookPlunger'); give('plunger'); return `You take the plunger. You're not sure why. It feels like the kind of thing an adventurer should carry.`; } },
    tub: { name: 'Bathtub', examine: `A tub behind a navy shower curtain. There's a ring of Noreen's "special" mildew spray on the edge. She wages a quiet war on mould in this house. She's winning.`, operate: `You run the tub for a second. Hot water. You turn it off.` },
    curtain: { name: 'Shower Curtain', examine: `A navy shower curtain with tiny white anchors. Nautical.`, open: `You pull the shower curtain aside like you're in Psycho. Nobody there. Just the tub and a bottle of Pert Plus.`, close: `You pull it closed.` },
    towels: { name: 'Towels', examine: `Navy towels with white anchors. Very nautical. You have never been on a boat.` },
    window: { name: 'Window', examine: () => G.phase === 'day' ? `A small window: grey sky, a maple, the corner of the neighbours' roof.` : `A small window, dark and rainy.` },
    pictures: { name: 'Pictures', examine: `Watercolours of Tuscan streets. Your parents went to Italy in 1997 and came back changed people. For about a month.` },
  },
});

/* ----------------------------- MIRROR (close-up) ----------------------------- */
scene('mirror', {
  name: 'The Mirror', floor: 'up', parent: 'guestbath', noDrop: 'You don\'t want to leave anything here, in front of him.',
  img: () => 'mirror_' + Story.mirrorLevel(), hsBase: 'mirror_3',
  look: () => Story.mirrorText(),
  brief: () => Story.mirrorText(),
  enter: () => sfx('mirror'),
  hs: {
    reflection: { name: 'Your Reflection', examine: () => Story.mirrorText(true), speak: () => Story.mirrorSpeak(), hit: `You punch toward the mirror and stop an inch short. The boy in the glass stops an inch short too. Neither of you is brave enough.`, operate: `You make faces at yourself: the Elvis lip, the Spock eyebrow, the "Mom-I'm-not-angry-I'm-just-disappointed." They're all a little too good.` },
    lights: { name: 'Vanity Lights', examine: `A strip of round bulbs. One is a different wattage than the others. Noreen's been meaning to replace it.` },
    cup: { name: 'Toothbrush Cup', examine: `Your toothbrush cup.` },
    door: { name: 'Reflected Door', examine: `In the mirror, the bathroom door behind you stands half open. For a second you think someone is standing in the hall. Nobody is.` },
  },
});

/* ----------------------------- DAVID'S ROOM ----------------------------- */
scene('davidroom', {
  name: 'Your Room', floor: 'up',
  img: dn('davidroom', 'davidroom_day'), hsBase: 'davidroom',
  drop: [44, 88],
  look: `<b>Your room.</b> You painted it in August: two coats of a colour called "Revolution Red" from Canadian Tire, without asking. Soviet propaganda on one wall, the hammer-and-sickle flag from the army surplus in St. Catharines on another, Che glowering by the door. Your parents' reaction was the best part. Don said, "Well, it's... bold." Noreen didn't speak to you for a day. It's the only room in the house that's entirely yours.`,
  brief: () => `Your room. Red as the inside of an eyelid.${G.inv.length ? '' : ''}`,
  hs: {
    bed: { name: 'Bed', examine: `Your twin bed. Your feet hang off the end, and have since Grade 9. Noreen bought you an extra-long one for Christmas; it is also too short.`, operate: () => { Game.sleep(); return null; }, go: () => { Game.sleep(); return null; }, consume: `You are not going to eat your bed, no matter how hungry.` },
    underbed: { name: 'Under the Bed', exit: 'underbed_david', examine: `The dark gap under the bed. Your stash. Your vault. Your treasury.` },
    poster: { name: 'Propaganda Poster', examine: `A Soviet-style poster of heroic red-faced workers marching forward into a glorious future. You bought it at a poster sale at Brock. Greg says one of the workers looks like Mr. Van Dyk and now you can't unsee it.` },
    flag: { name: 'Soviet Flag', examine: `A hammer-and-sickle flag, thumbtacked to the drywall. $14.99 at the army surplus. Your father, when he saw it, looked at it for a long time and said, "You know your grandfather flew a Lancaster over Germany, right?" and then didn't say anything else, which was worse.`, take: `You've thought about taking it down. Not yet.` },
    che: { name: 'Che Poster', examine: `Che Guevara in his beret, gazing off into the middle distance at a revolution. You know three facts about him, two of which are about the beret.`, speak: `"Comrade," you say. Che continues to gaze nobly at the closet.` },
    bandposter: { name: 'Band Poster', examine: `A poster of a band whose name has been so heavily stylised you've genuinely forgotten what it says.` },
    boombox: { name: 'Boombox', examine: () => `A black Sony boombox with dual tape decks and a CD player. It's on 102.1 the Edge. ${has('cd') ? '' : 'The CD tray is closed.'}`, operate: () => { sfx('tv'); return pick([`You click it on. 102.1 the Edge: "...that was Our Lady Peace, and if you're just joining us, it's a rainy one out there across the GTA..." You turn it off.`, `You click on the radio. Blink-182, "All the Small Things." You don't hate it. You'll never admit that you don't hate it. Off.`, `The radio: CFRB, some guy in a phone-in about Y2K and canned goods. You turn it off.`]); }, open: () => { if (exists('cd')) return `The CD tray is empty.`; give('cd'); return `The CD tray slides open: <i>Evil Empire</i>. You take it out.`; }, use: { cd: () => Story.playRage() } },
    backpack: { name: 'Backpack', examine: `Your school backpack, a grey JanSport with the bottom worn through. It contains, among other things, a problem.`, open: () => Story.openBackpack(), operate: () => Story.openBackpack() },
    lavalamp: { name: 'Lava Lamp', examine: `A red lava lamp. The blobs rise and fall like bad ideas.`, operate: `You switch the lava lamp off and on. The blobs take twenty minutes to warm up. You don't have twenty minutes. You have, theoretically, the rest of your life.` },
    desk: { name: 'Desk', examine: `Your desk: CDs, an empty bag of Old Dutch ketchup chips, and a drawing of a hammer and sickle you did in Math that turned into a duck.` },
    door: { name: 'Door', exit: 'upstairs', examine: `Your door. There's a hand-lettered sign on the outside: THE PEOPLE'S REPUBLIC — KNOCK. Noreen does not knock.` },
    window: { name: 'Window', examine: () => G.phase === 'day' ? `Grey light; the yard; Shelby a small orange dot on the patio, barking at a leaf.` : `Dark. Rain. The red room reflected back at you.` },
    clothes: { name: 'Clothes', examine: `Jeans, a flannel, a Roots hoodie, and a single sock. The other sock is under the bed. They have been apart for weeks.`, take: `You pick up the hoodie, consider doing laundry, and put it back down in the same spot. A tradition.` },
  },
});

/* ----------------------------- UNDER DAVID'S BED ----------------------------- */
scene('underbed_david', {
  name: 'Under Your Bed', floor: 'up', parent: 'davidroom',
  img: 'underbed_david',
  patchItems: { mixture: { src: 'underbed_david_mix0', rect: [235, 414, 272, 238] }, mixture_old: { src: 'underbed_david_mix1', rect: [0, 426, 576, 374] }, mixture_mold: { src: 'underbed_david_mix2', rect: [191, 198, 538, 547] }, mixture_wrapped: null },
  drop: [26, 72],
  look: () => `<b>Under your bed.</b> You flick on the flashlight you keep down here. Dust bunnies the size of actual bunnies. A shoebox. A sock. Cords to nothing. It's warm and dark and nobody ever looks under here, which is the whole point. ${Story.stashSummary('underbed_david')}`,
  brief: () => `Under your bed. ${Story.stashSummary('underbed_david')}`,
  hs: {
    shoebox: { name: 'Shoebox', examine: `An Adidas shoebox. Your archive.`, open: () => { setF('openedShoebox'); return `Inside: a tube of Pogs and two slammers, a 1990 Nintendo Power with a dog-eared page of <i>Shadowgate</i> tips ("It's a sad thing that your adventures have ended here"), and your Grade 3 report card. Mrs. Ricci wrote: "<i>David is a curious, kind boy who asks wonderful questions. He should share them more.</i>" Somebody — Noreen — has underlined "kind" twice.`; } },
    sock: { name: 'Sock', examine: `The missing sock. Reunite it with its partner? No. Some relationships are over.` },
    dust: { name: 'Dust Bunnies', examine: `Dust bunnies. Noreen doesn't vacuum in here anymore since the Great Room Argument of 1998.`, speak: `"Hey, guys." The dust bunnies say nothing. Good listeners.` },
    cords: { name: 'Cords', examine: `Cords to devices long since lost: a Game Boy link cable, a Sega Genesis power brick, something that might be for a Tamagotchi, which died in 1997.` },
    flashlight: { name: 'Flashlight', examine: `Your flashlight. Batteries mostly dead, beam mostly yellow.`, take: `It lives down here. It's the only light in the vault.` },
    floor: { name: 'Carpet', examine: () => `Clear carpet, in the warm dark. A good place to hide something. ${Story.stashSummary('underbed_david')}` },
  },
});

/* ----------------------------- UNDER THE MASTER BED ----------------------------- */
scene('underbed_master', {
  name: "Under Your Parents' Bed", floor: 'up', parent: 'master',
  img: 'underbed_master',
  patchItems: { mixture: { src: 'underbed_master_mix0', rect: [483, 437, 199, 286] }, mixture_old: { src: 'underbed_master_mix1', rect: [494, 445, 193, 297] }, mixture_mold: { src: 'underbed_master_mix2', rect: [481, 287, 359, 458] }, mixture_wrapped: null },
  drop: [34, 74],
  look: () => `<b>Under your parents' bed.</b> You lift the dust ruffle and peer in. It's the cleanest underbed in the Niagara Region — Noreen vacuums under here like it's a crime scene — but it's dark, and warm from the heating vent, and the dust ruffle hides everything. ${Story.stashSummary('underbed_master')}`,
  brief: () => `Under your parents' bed. ${Story.stashSummary('underbed_master')}`,
  enter: () => { if (Story.noreenState() === 'sick') ev(`Above you, through the mattress, you can hear your mother breathing. It sounds wet.`); },
  hs: {
    slippers: { name: 'Slippers', examine: `Noreen's slippers, sheepskin, side by side, toes pointing out, ready for the morning.` },
    bin: { name: 'Storage Bin', examine: `A flat plastic bin of wrapping paper and ribbon. And one gift already wrapped.`, open: () => Story.peekGift() },
    ruffle: { name: 'Dust Ruffle', exit: 'master', examine: `The pleated bed skirt, lifted. Back to the room.` },
    floor: { name: 'Carpet', examine: () => `Clean beige carpet, warm from the vent. Nobody would see anything left here. Not for a long time. ${Story.stashSummary('underbed_master')}` },
  },
});
