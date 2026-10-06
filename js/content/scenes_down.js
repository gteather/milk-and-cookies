/* ==========================================================================
   Scenes — main floor, basement, patio
   ========================================================================== */
'use strict';

/* ----------------------------- FOYER ----------------------------- */
scene('foyer', {
  name: 'Front Foyer', floor: 'main',
  img: dn('foyer', 'foyer_day'), hsBase: 'foyer',
  drop: [40, 86],
  look: `<b>The foyer.</b> Two storeys tall, with the oak staircase curving up to the balcony and the chandelier hanging over everything like an enormous earring. Ceramic tile, a rag rug, an umbrella stand nobody uses. The front door has an oval of bevelled glass that throws rainbows across the tile on sunny mornings. On a console table, the day's mail.`,
  brief: `The foyer.`,
  hs: {
    turnback: { name: 'Hallway — to the Kitchen', exit: 'kitchen', rect: [36, 91, 28, 9], examine: 'Behind you: the way out.' },
    frontdoor: { name: 'Front Door', click: 'go', examine: () => Story.frontDoorLook(), go: () => Story.frontDoor(), open: () => Story.frontDoor(), operate: () => Story.frontDoor(), hit: `You thump the front door. It's solid. The builder spent the money here and nowhere else.` },
    stairs: { name: 'Stairs Up', exit: 'upstairs', examine: `The staircase up to the balcony.` },
    dining: { name: 'Dining Room', exit: 'dining', examine: `The archway to the dining room, the room for Christmas and nothing else.` },
    console: { name: 'Mail', examine: () => Story.mailLook(), take: () => Story.takeGrocery(), open: () => Story.mailLook() },
    umbrella: { name: 'Umbrella Stand', examine: `A brass umbrella stand holding one golf umbrella that says <b>CANADIAN TIRE FINANCIAL SERVICES — 1998 UNITED WAY CAMPAIGN</b>.`, take: `You don't need an umbrella. Your head is above most of the rain.` },
    sidedoor: { name: 'Basement Door', exit: 'basement', examine: `A plain white door. Behind it, the stairs down to the basement.` },
    powderdoor: { name: 'Powder Room', exit: 'powder', examine: `The powder room. For guests. The sign on the door is invisible but everyone can read it.` },
    chandelier: { name: 'Chandelier', examine: `The chandelier, seen from below. One bulb is out. It's been out since August. Nobody can reach it except you, and nobody has asked.`, operate: `You'd need to go upstairs and lean over the railing. Or ask. Neither feels possible today.` },
    rug: { name: 'Rug', examine: `A floral rag rug. Shelby, when allowed in, uses it exclusively for scooting.` },
    lamp: { name: 'Table Lamp', examine: `A brass table lamp on a timer, so that burglars will think someone's home. Someone is always home.` },
    painting: { name: 'Painting', examine: `More vineyards.` },
    balcony: { name: 'Balcony', examine: `The underside of the upstairs balcony. From down here you can see your door, and the den's blue glow.`, go: () => { Game.travel('upstairs'); return null; } },
  },
});

/* ----------------------------- POWDER ROOM ----------------------------- */
scene('powder', {
  name: 'Powder Room', floor: 'main',
  img: 'powder',
  drop: [38, 84],
  look: `<b>The powder room.</b> A tiny, perfect museum of a bathroom that exists for guests and is maintained like a shrine. Floral wallpaper with a border. A gold oval mirror. Embroidered hand towels you've been told never to dry your hands on. A dish of seashell-shaped guest soaps that have survived two Christmases untouched.`,
  brief: `The powder room. Untouched. Immaculate. Judgy.`,
  hs: {
    door: { name: 'Door', exit: 'foyer', examine: `Back to the foyer.` },
    mirror: { name: 'Gilt Mirror', examine: `An oval mirror in a gold frame. It's hung for someone about five-foot-seven. All you can see is your Adam's apple and the bottom of your chin. Typical. The honest mirror is upstairs.` },
    soaps: { name: 'Guest Soaps', examine: `Pastel seashell soaps in a glass dish. Pink, cream, and a blue one that's slightly chipped — the result of a 1997 incident you were blamed for and did not do.`, take: () => { if (exists('soap')) return `You've already taken one. The dish has a gap in it now, like a missing tooth.`; give('soap'); setF('tookSoap', G.day); return `You take a pink seashell soap. The dish has a gap in it now. She will notice. She notices everything.`; }, consume: `They look like candy. They are not candy. You learned this at age four.` },
    sink: { name: 'Pedestal Sink', examine: `A pedestal sink, dry. Nobody washes their hands in here; it would leave water spots.`, operate: () => { sfx('splash'); return `You wash your hands in the forbidden sink. Then, panicked, you dry them on your jeans rather than the embroidered towels.`; } },
    potpourri: { name: 'Potpourri', examine: `A bowl of potpourri that smells like a cinnamon-scented sneeze.`, consume: `Potpourri is not trail mix. You have been told this before, at a Christmas party, in front of people.` },
    toilet: { name: 'Toilet', examine: `A toilet with a crocheted toilet-roll cover shaped like a lady's hat. Grandma Ruth made it. It's the only thing in here that's allowed to be silly.`, operate: () => { sfx('flush'); return `You flush the guest toilet. It's very quiet. Even the plumbing is polite in here.`; } },
    window: { name: 'Window', examine: `A small window with a frosted pane and a tiny valance.` },
    towels: { name: 'Hand Towels', examine: `Embroidered with little cream roses. Decorative, not functional. Like the soaps. Like the dining room. Like, some days, it feels, you.`, take: `Touch the guest towels? Not even you are that much of a revolutionary.` },
  },
});

/* ----------------------------- DINING ROOM ----------------------------- */
scene('dining', {
  name: 'Dining Room', floor: 'main',
  img: () => G.phase === 'day' ? (here('noreen') ? 'dining_noreen_day' : 'dining_day') : 'dining',
  hsBase: 'dining', hsKeys: ['dining_noreen_day'],
  drop: [36, 90],
  look: `<b>The dining room.</b> Hunter-green walls, a chair rail, a cherry table that seats six and is used three times a year. The china cabinet glitters with Royal Doulton ladies in crinolines. On the sideboard: silver candlesticks, the bills, and a framed photo of Grandma Ruth.`,
  brief: () => `The dining room.`,
  hs: {
    turnback: { name: 'Swing Door — to the Kitchen', exit: 'kitchen', rect: [36, 91, 28, 9], examine: 'Behind you: the way out.' },
    noreen: { name: 'Noreen', npc: 'noreen', show: () => here('noreen') && G.phase === 'day' },
    cabinet: { name: 'China Cabinet', examine: `The china cabinet: the Royal Albert "Old Country Roses" set (wedding gift, used at Christmas), and nine Royal Doulton figurines of women in enormous dresses holding parasols. Noreen dusts each one with a paintbrush.`, open: `The glass door is locked. The key is on Noreen's keyring. The china is safe from you. Everything is safe from you.`, hit: `If you broke something in the china cabinet, they would find your body in the spring.` },
    table: { name: 'Dining Table', examine: `The cherry dining table, with a lace runner and a silk-flower centrepiece. Noreen does her crossword here on weekends, because it's the only room nobody else goes in.` },
    centerpiece: { name: 'Centrepiece', examine: `Silk peonies. Very lifelike. They have been "in bloom" since 1996.` },
    sideboard: { name: 'Sideboard', examine: `The sideboard: candlesticks, a silver tray, the bills, and Grandma Ruth's picture.`, open: () => once('sideboard') ? `The sideboard drawers: good napkins, napkin rings shaped like grapes, a box of birthday candles — numbers "5" and "3" — and a card in a pink envelope, already signed "Love, Don" and nothing else. Your father is a week early and two words short.` : `Good napkins, grape napkin rings, birthday candles: a 5 and a 3.` },
    bills: { name: 'Bills', examine: () => { setF('sawPhoneBill'); return `The Bell Canada bill, opened, on top. Highlighted in yellow: a $46.80 long-distance charge to a number in Mississauga — the ISP's tech-support line, which you called four times in September when the modem wouldn't handshake. Beside it, in pencil, in her perfect hand: "<i>D.?</i>" Just that. A question mark can be very loud.`; } },
    portrait: { name: 'Grandma Ruth', examine: () => `A photo of Grandma Ruth — Noreen's mother — in her garden in St. Catharines, squinting and holding a zucchini the size of a baseball bat. She's seventy-nine. ${F('knowsCarol') ? 'She is in St. Catharines General right now, with a broken hip, and your mother has been trying to get a phone call through all week.' : 'She lives alone. She refuses to discuss this.'}` },
    candles: { name: 'Candlesticks', examine: `Silver candlesticks with half-burnt tapers from last Christmas.` },
    chandelier: { name: 'Chandelier', examine: `A brass chandelier over the table, on a dimmer. Noreen sets it to "restaurant."` },
    window: { name: 'Window', examine: () => G.phase === 'day' ? `The front lawn, the street, the neighbours' identical houses. A man raking leaves into a perfect pile.` : `Dark street, wet lawn, the streetlight.` },
    archway: { name: 'Archway', exit: 'foyer', examine: `Back to the foyer.` },
    painting: { name: 'Painting', examine: `A vineyard. Of course.` },
  },
});

/* ----------------------------- KITCHEN ----------------------------- */
scene('kitchen', {
  name: 'Kitchen', floor: 'main',
  img: () => G.phase === 'day' ? 'kitchen_day' : (here('noreen') ? 'kitchen_noreen' : 'kitchen_night'),
  hsBase: 'kitchen_night', hsKeys: ['kitchen_noreen'],
  drop: [30, 92],
  look: `<b>The kitchen.</b> The engine room of the house. Honey-oak cabinets, white appliances, a border of wallpaper geese marching around the ceiling in single file. The fridge is a collage of magnets and permission slips. A barn-shaped cookie jar. A wall phone with a cord long enough to reach the dining room, stretched permanently from years of Noreen pacing on calls. A sliding door to the patio, where Shelby lives.`,
  brief: () => `The kitchen.`,
  hs: {
    turnback: { name: 'Hallway — to the Foyer', exit: 'foyer', rect: [36, 91, 28, 9], examine: 'Behind you: the way out.' },
    noreen: { name: 'Noreen', npc: 'noreen', show: () => here('noreen') && G.phase !== 'day' },
    fridge: { name: 'Fridge', examine: () => Story.fridgeLook(), open: () => Story.fridgeOpen(), take: () => Story.fridgeTake(), close: `You shut the fridge with your hip. It hums.` },
    cookiejar: { name: 'Cookie Jar', examine: `A ceramic cookie jar shaped like a red barn. The lid is the roof. When you were small it went "moo" when you opened it; the battery died in 1991 and nobody replaced it, which feels like a metaphor.`, open: () => Story.cookieJar(), take: () => Story.cookieJar(), use: { coins: () => ITEMS.coins.use.cookiejar(), ctmoney: () => ITEMS.ctmoney.use.cookiejar(), cookie: () => ITEMS.cookie.use.cookiejar() } },
    kettle: { name: 'Kettle', examine: `A white electric kettle. Noreen runs on it the way the Gateway runs on electricity.`, operate: () => { sfx('kettle'); return has('mug') ? Story.makeTea() : `You flick the kettle on. It rumbles, then whistles. Hot water, ready for... something. A mug, maybe. A tea bag.`; }, use: { mug: () => Story.makeTea(), teabag: `Tea bag, yes. But you'll need a mug.` } },
    teatin: { name: 'Tea Tin', examine: `A red tin of Red Rose tea bags. "Only in Canada, you say? Pity."`, open: () => { if (exists('teabag') || has('tea')) return `The tin's full of tea bags. You've already got one.`; give('teabag'); return `You take one Red Rose tea bag.`; }, take: () => SCENES.kitchen.hs.teatin.open() },
    sink: { name: 'Kitchen Sink', examine: `A double stainless sink under the window. A bottle of Sunlight. Noreen's yellow rubber gloves draped over the divider like a surrender.`, operate: () => { sfx('splash'); return `You run the tap. Cold water. You drink from your cupped hands, which is apparently "disgusting."`; } },
    window: { name: 'Window', examine: () => G.phase === 'day' ? `The backyard: the fence, the patio, and Shelby, who is staring at the house as if willing someone to come out.` : `Black glass. Your own face, very long, floating over the sink.` },
    phone: { name: 'Telephone', examine: () => `A beige wall phone with a curly cord stretched to about four times its original length. ${Computer.online() ? 'If you picked it up right now, you would hear the modem screaming.' : ''}`, operate: () => Story.usePhone(), take: () => Story.usePhone(), speak: () => Story.usePhone() },
    calendar: { name: 'Calendar', examine: () => Story.calendar() },
    patiodoor: { name: 'Patio Door', exit: 'patio', examine: `The sliding patio door. Beyond it: the patio, and the dog.`, open: () => { go('patio'); return null; } },
    island: { name: 'Island', examine: () => G.phase === 'morning' ? `On the island: your lunch in a brown paper bag with "D" on it in marker. She still makes it. Even this week.` : `The kitchen island, wiped down to a high shine.` },
    stove: { name: 'Stove', examine: `A white stove. The oven light is on — she's been baking. It smells like brown butter and chocolate in here, and under it, faintly, something sour, like bread.`, open: `The oven's empty, still warm. A baking sheet is cooling on the stovetop, scraped clean except for crumbs.`, operate: `You don't need to turn on the stove. Nobody in this family has ever needed you to turn on the stove.` },
    microwave: { name: 'Microwave', examine: `A white microwave. It has a "popcorn" button that burns popcorn.`, operate: `You open and shut the microwave door. Beep. There's nothing in it. Ninety-nine percent of microwave use, in this house, is you checking it for food.`, use: { milk: `Warm milk? Who are you, Grandma Ruth?`, mixture: `You are not microwaving that. The smell would end your family.`, sodium: `No. Absolutely not.` } },
    cabinets: { name: 'Cabinets', examine: `Honey-oak cupboards: glasses, plates, mugs, a junk drawer, the dog biscuits up high where Shelby can't get them, and a drawer of plastic wrap and foil.`, open: () => Story.cabinets(), use: { glass_clean: () => ITEMS.glass_clean.use.cabinets(), glass_empty: () => ITEMS.glass_empty.use.cabinets } },
    living: { name: 'Living Room', exit: 'living', examine: `The family room, through the opening.` },
  },
});

/* ----------------------------- LIVING ROOM ----------------------------- */
scene('living', {
  name: 'Living Room', floor: 'main',
  img: () => G.phase === 'day' ? 'living_day' : (here('don') ? 'living_don' : 'living_night'),
  hsBase: 'living_night', hsKeys: ['living_don'],
  drop: [42, 70],
  look: `<b>The family room.</b> Plaid sofa, plaid recliner, gas fireplace with a brass surround, and the household's true centre of worship: a 32-inch Sony Trinitron the size of a dishwasher, in an oak entertainment unit with a VCR whose clock has blinked 12:00 since 1995.`,
  brief: () => `The living room.${G.phase !== 'day' ? ' The TV glows.' : ''}`,
  hs: {
    don: { name: 'Don', npc: 'don', show: () => here('don') && G.phase !== 'day' },
    tv: { name: 'Television', examine: `A 32-inch Sony Trinitron. It weighs 140 pounds — exactly what you weigh — and took three men and Don to get into the house.`, operate: () => Story.tv(), hit: `You smack the top of the TV like you've seen Don do. The picture improves slightly. It always does. Nobody knows why.` },
    unit: { name: 'Entertainment Unit', examine: `An oak entertainment unit holding the TV, the VCR, a stack of VHS tapes — "MOM — CORONATION ST.", "D's GRADE 8 GRADUATION", "LEAFS PLAYOFFS 93 DO NOT TAPE OVER" — and a Reader's Digest Atlas.`, open: `In the cabinet doors: board games. Trivial Pursuit Genus II, Pictionary, and Monopoly with most of the money replaced by Canadian Tire money.` },
    sofa: { name: 'Sofa', examine: `The plaid sofa. You fit on it if you bend in three places.`, operate: () => Story.couchCoins(), open: () => Story.couchCoins() },
    recliner: { name: 'Recliner', examine: () => here('don') ? `Don's recliner, with Don in it.` : `Don's recliner. A dent the exact shape of your father.`, operate: () => here('don') ? `It's occupied.` : `You sit in Don's recliner and pull the lever. It flings you back. You lie there looking at the ceiling, feeling very fifty-six.` },
    table: { name: 'Coffee Table', examine: `A glass coffee table with brass corners, covered in coasters nobody uses.` },
    remote: { name: 'TV Remote', examine: `The remote. Don's sceptre.`, take: () => here('don') ? `Don's hand moves to cover the remote without his eyes leaving the screen. Instinct. Thirty years of marriage and a teenage son will do that.` : `You'd take it, but it's Don's, and when he can't find it the whole house suffers. Leave it.`, operate: () => Story.tv() },
    magazine: { name: 'TV Guide', examine: () => Story.tvGuide() },
    fireplace: { name: 'Fireplace', examine: `A gas fireplace with fake logs that never burn down. Push a button, get a fire. Very 1999.`, operate: `You click the fireplace on. Instant fire, blue at the base. You click it off before Noreen sees the gas bill.` },
    mantle: { name: 'Mantle Photos', examine: () => { setF('sawMantle'); return `Photos on the mantle: you at eight with a gap-toothed grin; Don on a golf course; Grandma Ruth; and one you've never looked at closely — a young woman in a white coat, squinting into the sun in front of a stainless-steel tank, holding up a test tube. It's faded to orange. It's your mother. You'd have walked past her on the street.`; } },
    plant: { name: 'Ficus', examine: `A ficus. Noreen talks to it. It thrives.`, speak: `"How's it going," you ask the ficus. It's been better, it implies.` },
    window: { name: 'Window', examine: () => G.phase === 'day' ? `Grey sky, bare maples, a neighbour putting up a plastic skeleton for Halloween.` : `Night, rain, the neighbour's motion-sensor light going on and off for a cat.` },
    kitchen: { name: 'Kitchen', exit: 'kitchen', examine: `Back to the kitchen.` },
    door: { name: 'Closet', examine: `A closet: vacuum, Christmas decorations, Don's golf clubs.`, open: `The Electrolux, your old hockey bag, a box marked XMAS, and a framed poster from the 1988 Calgary Olympics.` },
  },
});

/* ----------------------------- BASEMENT ----------------------------- */
scene('basement', {
  name: 'Basement Rec Room', floor: 'base',
  img: () => here('don') ? 'basement_don' : 'basement', hsBase: 'basement', hsKeys: ['basement_don'],
  drop: [36, 90],
  look: `<b>The rec room.</b> Wood panelling, a stained-glass Tiffany-style billiards lamp, a pool table Don bought "for the family" and plays with himself. A small TV on a cart with your old NES hooked up, a brown corduroy couch, an exercise ski machine used twice in 1994, and in the corner, a stack of cardboard boxes.`,
  brief: () => `The basement. Cool, quiet, smelling of carpet and felt.`,
  hs: {
    don: { name: 'Don', npc: 'don', show: () => here('don') },
    pooltable: { name: 'Pool Table', examine: `An eight-foot pool table with green felt. Don can run three balls in a row on a good night. You can't run any, because your arms are too long for the room and you keep hitting the wall with the cue.`, operate: () => Story.pool(), use: { ball: `Wrong kind of ball.` } },
    cues: { name: 'Pool Cue', examine: `A pool cue.`, operate: () => Story.pool(), take: `The cue is too long to carry around. Even for you. Especially for you.` },
    lamp: { name: 'Billiards Lamp', examine: `A stained-glass lamp with a Molson logo — a prize Don won at a credit union golf tournament in 1991. He's prouder of it than of your Grade 8 diploma.` },
    tv: { name: 'Small TV', examine: `A 20-inch Zenith on a rolling cart. Rabbit ears. It gets CHCH Hamilton and three channels of snow.`, operate: () => Story.nes() },
    nes: { name: 'NES', examine: `Your old grey Nintendo. In the deck: <i>Shadowgate</i>. You never beat it. Nobody beat it. It's the hardest game ever made, and every time you die, a cartoon Grim Reaper tells you it's a sad thing your adventures have ended here.`, operate: () => Story.nes() },
    couch: { name: 'Couch', examine: `A brown corduroy couch that used to be upstairs, before the upgrade to plaid. It's been banished down here, like you'll be one day.`, operate: `You lie on the couch. Your feet dangle off the end at the shins.` },
    skier: { name: 'Ski Machine', examine: `A NordicTrack cross-country ski machine. "America's best aerobic exerciser." Used twice. Don hangs his golf shirts on it.`, operate: `You ski. Three strides and the cord snaps back and catches you in the shin. NordicTrack: undefeated.` },
    boxes: { name: 'Storage Boxes', examine: () => `A stack of cardboard storage boxes: XMAS LIGHTS, DON — TAXES, D — BABY CLOTHES, and at the bottom, older than the rest, a box in faded marker that says <b>N.A. — LAB</b>.`, open: () => { go('box'); return null; }, operate: () => { go('box'); return null; }, go: () => { go('box'); return null; } },
    fridge: { name: 'Bar Fridge', examine: `A bar fridge: Don's O'Doul's, some Clamato, and — hidden at the back where you left it — contraband.`, open: () => { if (exists('jolt') || F('drankJolt')) return `O'Doul's. Clamato. That's it.`; give('jolt'); setF('drankJolt'); return `Behind the O'Doul's: your secret can of Jolt Cola. You liberate it.`; } },
    stairs: { name: 'Stairs Up', exit: 'foyer', examine: `Up to the foyer.` },
    painting: { name: 'Picture', examine: `A framed print of a hunting dog with a duck in its mouth. Shelby has never caught anything but a cold.` },
  },
});

/* ----------------------------- BOX (close-up) ----------------------------- */
const BOX_ITEMS = { textbook: [208, 161, 429, 406], labcoat: [553, 176, 384, 333], diploma: [902, 191, 175, 257], notebook: [572, 400, 192, 221], photo: [715, 396, 379, 283] };
scene('box', {
  name: "Box Marked 'N.A. — LAB'", floor: 'base', parent: 'basement',
  img: 'box', drop: [6, 88],
  layers: () => Object.entries(BOX_ITEMS).filter(([k]) => G.f['boxTook_' + k]).map(([k, r]) => ({ src: 'box_' + k, rect: r })),
  look: () => { setF('openedBox'); return `<b>The box.</b> You pull it out from under XMAS LIGHTS and open the flaps. It smells like dust and old paper and, faintly, like wine. This box is older than you. It has been moved from house to house and never unpacked. Inside: a fat textbook, a folded lab coat, a framed diploma, a black notebook, and a photograph.`; },
  brief: `The box from the bottom of the stack.`,
  hs: Object.assign(Object.fromEntries(['textbook', 'labcoat', 'notebook', 'photo'].map(k => [k, {
    name: () => itemName(k), show: () => !G.f['boxTook_' + k],
    examine: () => ITEMS[k].examine(),
    take: () => { setF('boxTook_' + k); give(k); return `You take ${theItem(k)} out of the box.`; },
    open: k === 'textbook' || k === 'notebook' ? () => ITEMS[k].examine() : undefined,
  }])), {
    diploma: { name: 'Diploma', examine: () => { Story.learnPast('diploma'); return `A framed diploma: <b>BROCK UNIVERSITY — Bachelor of Science, Honours, Chemistry — conferred upon NOREEN ELIZABETH ASHBY — May 1968</b>. First Class Honours. There's a little gold seal. She's never once mentioned it. Not once in seventeen years.`; }, take: `It's framed and heavy and it belongs to her. You leave it, but you can't stop looking at it.` },
  }),
});

/* ----------------------------- PATIO ----------------------------- */
scene('patio', {
  name: 'Back Patio', floor: 'main',
  img: dn('patio_night', 'patio_day'), hsBase: 'patio_night',
  drop: [12, 90],
  look: () => `<b>The back patio.</b> Interlocking paving stones, a covered barbecue, two white resin chairs, and a dog bed under the overhang. Beyond the fence, the backs of identical new houses. And in the middle of it all: <b>Shelby</b>, the Corgi. Shelby is twenty-six pounds of ears, opinions, and noise. Shelby is ${G.phase === 'day' ? 'barking at a leaf' : 'barking at the dark'}. Shelby sees you and barks at you instead, delighted.`,
  brief: () => `The patio. ${pick(['Shelby yaps.', 'Shelby barks hello.', 'Shelby spins in a circle and barks.', 'Shelby stares at you, then barks once, for emphasis.'])}`,
  enter: () => sfx('yap'),
  hs: {
    shelby: { name: 'Shelby', npc: 'shelby' },
    bbq: { name: 'Barbecue', examine: `Don's Broil King under a black cover. Don's other child.`, open: `Under the cover: a grill that is cleaner than your room has ever been.` },
    chairs: { name: 'Lawn Chairs', examine: () => `Two white resin chairs, slick with rain${G.phase === 'day' ? '' : ' and dark leaves'}.`, operate: `You sit. The chair is wet. Now you are wet.` },
    dogbed: { name: 'Dog Bed', examine: `Shelby's bed, under the overhang. Tartan, chewed at one corner, the bed of a dog who lives outside but is extremely loved.` },
    bowls: { name: 'Dog Bowls', examine: `Shelby's food and water bowls. "SHELBY" on one, in Noreen's paint-pen lettering, with a little heart.`, use: { treats: () => Story.shelbyTreat() } },
    ball: { name: 'Tennis Ball', show: () => !exists('ball'), examine: `Shelby's tennis ball. Chewed. Damp. Sacred.`, take: () => Story.takeBall() },
    leash: { name: 'Leash', examine: `Shelby's red leash on a hook. Walks are Noreen's job; Shelby pulls toward every squirrel in the Niagara peninsula.`, take: `You can't walk Shelby — your world is the house and the school, and Shelby's is the patio. You leave the leash.` },
    fence: { name: 'Fence', examine: `A six-foot privacy fence. For you, a waist-high fence. You can see over it into three yards.` },
    patiodoor: { name: 'Patio Door', exit: 'kitchen', examine: `The sliding door back into the kitchen.`, open: () => Story.letShelbyIn() },
    houses: { name: 'Neighbours', examine: () => G.phase === 'day' ? `The backs of the houses on the next street. A kid in a Raptors jersey is shooting hoops at a net with no mesh.` : `Lit windows. Blue TV-glow. Everybody in Garrison Village watching the same Leafs game.` },
    light: { name: 'Porch Light', examine: `A porch light. Moths in October, somehow.` },
  },
});
