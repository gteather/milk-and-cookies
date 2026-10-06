/* ==========================================================================
   The 1999 web (Netscape pages, Hotmail) and ICQ conversations with Greg
   ========================================================================== */
'use strict';

const EMAILS = [
  { id: 'carol', day: 0, from: 'Carol Dunn &lt;cdunn@sympatico.ca&gt;', subj: 'PLEASE have your mother call me', time: 'Thu 10/14/99 7:58 PM',
    body: () => `David,<br><br>It's Aunt Carol. I have been trying to call your house since SIX O'CLOCK and the line has been busy the entire time. I know that means you're on the computer, so I'm sending this to you since I can't reach anybody else.<br><br>Grandma fell on Tuesday and broke her hip — I don't know if your mom told you. They've scheduled her surgery for tomorrow morning at 8 at St. Catharines General and the surgeon needs to talk to your mother TONIGHT about the consent forms because I'm not her POA, your mother is.<br><br>Please get off the internet so your mother can use the phone. Please tell her to call me.<br><br>Love you kiddo,<br>Aunt Carol<br><br>P.S. Your grandmother says to tell you to "stop being a goose."`,
    onRead: () => { if (!F('knowsCarol')) { setF('knowsCarol'); karma(1); setTimeout(() => ev(`You read it twice. Six o'clock. The whole evening. Her mother's hip. The surgeon. "You don't do anything all day," you'd said, while she stood in the kitchen holding a dead phone. You feel something drop through you like a stone through water.`), 50); } } },
  { id: 'greg1', day: 0, from: 'Greg &lt;avogadros_greg@hotmail.com&gt;', subj: 'chem homework + r u ok', time: 'Thu 10/14/99 8:41 PM',
    body: () => `dude u left the chem chat in the middle of question 4 and then ur icq went red. r u ok? did ur mom pull the plug again lol<br><br>anyway the answer to 4 is 3 CO2 not 2. CARBON FIRST, then hydrogen, then oxygen. oxygen is always last. oxygen is the boss.<br><br>also if u need help with the quiz signature thing i'm here. not to forge it!! just like. moral support.<br><br>- G<br><br>"Make it so." - Captain Jean-Luc Picard` },
  { id: 'colhouse', day: 0, from: 'Columbia House Music Club', subj: '12 CDs for 1¢!!! (You have been PRE-SELECTED)', time: 'Thu 10/14/99 3:12 PM',
    body: () => `<b>CONGRATULATIONS DAVID!</b><br><br>You have been PRE-SELECTED to receive <b>12 CDs for ONE PENNY</b>!*<br><br>Choose from hits by Shania Twain, Matchbox 20, Sugar Ray, Santana feat. Rob Thomas, Our Lady Peace and more!<br><br><small>*Plus shipping and handling. Agreement to purchase 6 additional CDs at regular club prices ($18.98 + S&amp;H) within 3 years. Your mother will find out about this.</small>` },
  { id: 'chain', day: 0, from: 'Mike2K &lt;mike2k@hotmail.com&gt;', subj: 'FW: FW: FW: FW: Fwd: BILL GATES WILL PAY U!!!!!!!', time: 'Thu 10/14/99 1:02 PM',
    body: () => `&gt;&gt;&gt;&gt;&gt; Dear Friends, please do not take this for a junk letter. Bill Gates is sharing his fortune. Microsoft is testing a new e-mail tracking program and for every person you forward this to, Microsoft will pay you $245.00. My brother's girlfriend got a cheque for $4,324.44!!! I am an attorney and I know the law. This is real.<br><br>FORWARD TO EVERYONE YOU KNOW!!!!!!!<br><br><i>(Mike has forwarded this to you four times this month. You have not received any money. Neither has Mike.)</i>` },
  { id: 'geo', day: 0, from: 'GeoCities &lt;members@geocities.com&gt;', subj: 'Your page has new visitors!', time: 'Wed 10/13/99 11:30 PM',
    body: () => `Hi comrade_dave!<br><br>Your GeoCities homepage <b>"COMRADE DAVE'S RED PAGE"</b> (Area51/Vault/1917) has had <b>14 visitors</b> this month and <b>1 new guestbook entry</b>.<br><br>Keep building! — The GeoCities Team` },
  { id: 'carol2', day: 1, from: 'Carol Dunn &lt;cdunn@sympatico.ca&gt;', subj: 'Grandma is OUT of surgery!', time: 'Fri 10/15/99 1:15 PM',
    body: () => `David — Grandma is out of surgery and doing well. Two pins and a plate. She told the anaesthetist he had "a face like a boiled potato" so she's fine.<br><br>Your mom was at the hospital from 7am. She looked like she hadn't slept. She said you two had a "rough week." Whatever it is — be nice to her, kiddo. She's carrying a lot right now.<br><br>Grandma's in room 412 if you want to call. She'd LOVE that. 684-7271.<br><br>Love, Aunt C.`, onRead: () => setF('sawCalendar') },
  { id: 'greg_mole', day: 4, from: 'Greg &lt;avogadros_greg@hotmail.com&gt;', subj: 'MOLE DAY CUPCAKE POLL (URGENT)', time: 'Mon 10/18/99 9:22 PM',
    body: () => `ok so for mole day (FRIDAY!!! 6:02!!! 10/23 IS ACTUALLY SATURDAY BUT WE OBSERVE IT FRIDAY) i am making cupcakes. which frosting:<br><br>(a) chocolate, decorated as a mole (the animal)<br>(b) vanilla, with 6.02 x 10^23 sprinkles (impossible, i did the math, i would need 4 billion years)<br>(c) both<br><br>reply ASAP. my mom is buying icing sugar tomorrow.<br><br>- G` },
  { id: 'greg_notes', day: 12, from: 'Greg &lt;avogadros_greg@hotmail.com&gt;', subj: 'UNIT TEST NOTES (attached) READ THEM', time: 'Tue 10/26/99 8:05 PM',
    body: () => `attached: GREG_UNIT_NOTES.txt. i saved it to ur C drive last week when i was over too, just in case, because i know u.<br><br>READ THEM. the test is tomorrow.<br><br>also have u asked ur mom for help yet. i'm going to keep asking until u say yes. i'm like the ghost of christmas chemistry.<br><br>- G`, onRead: () => setF('gregNotesEmail') },
  { id: 'greg_bday', day: 9, from: 'Greg &lt;avogadros_greg@hotmail.com&gt;', subj: 'happy mole day!!!!', time: 'Sat 10/23/99 6:02 AM',
    body: () => `HAPPY MOLE DAY!!! 6:02 AM ON 10/23!!! I SET AN ALARM!!!<br><br>also didn't u say ur mom's birthday is today?? tell her happy birthday from me. tell her happy mole day too. she'll get it.<br><br>- G` },
];

const WEB = {
  resolve(text) {
    const t = (text || '').trim().toLowerCase();
    if (!t) return 'home';
    const map = { 'niagara.net': 'home', 'www.niagara.net': 'home', 'hotmail': 'hotmail', 'hotmail.com': 'hotmail', 'altavista': 'av', 'altavista.com': 'av', 'geocities': 'geo', 'askjeeves': 'jeeves', 'ask.com': 'jeeves' };
    for (const [k, v] of Object.entries(map)) if (t.replace(/^https?:\/\//, '').replace(/\/$/, '').endsWith(k)) return v;
    for (const p of Object.values(PAGES)) if (p.url && p.url.toLowerCase().replace(/\/$/, '') === t.replace(/\/$/, '')) return p.id;
    return 'q:' + text;
  },
  page(id) {
    if (id.startsWith('q:')) return Object.assign({ id, local: false }, searchPage(id.slice(2)));
    if (id.startsWith('mail:')) return mailPage(id.slice(5));
    return PAGES[id] || PAGES.notfound;
  },
};
const PAGES = {};
function page(id, def) { PAGES[id] = Object.assign({ id, host: (def.url || '').replace(/^https?:\/\//, '').split('/')[0] }, def); }
const L = (id, text) => `<a data-go="${id}">${text}</a>`;

page('home', { url: 'http://www.niagara.net/', title: 'NiagaraNet — Your Local Connection',
  html: () => `<table width="100%"><tr><td style="background:#003366;color:#fff;padding:8px"><b style="font-size:22px;font-family:Arial">NiagaraNet</b> <i style="color:#9cf">— Your Local Connection to the Information Superhighway!</i></td></tr></table>
    <div class="marquee"><span>★ Y2K: Only <b>${78 - G.day}</b> days until the Millennium! Is YOUR computer ready? ★ NiagaraNet now offers 56K access in St. Catharines! ★ Shaw Festival announces 2000 season ★</span></div>
    <table width="100%"><tr><td width="62%">
      <h2>Today's Headlines</h2>
      <p>• <b>Region says water supply "Y2K compliant"</b> — but advises residents to fill bathtubs "just in case"</p>
      <p>• <b>Leafs edge Senators 3–2</b> at the new Air Canada Centre; Sundin with the winner</p>
      <p>• <b>Icewine harvest forecast "exceptional"</b> — wineries await the first hard frost</p>
      <p>• <b>Vince Carter</b> named to Raptors' starting lineup for the season opener</p>
      <p>• <b>Weather:</b> Rain. High 9°C. Low 4°C. More rain.</p>
    </td><td style="background:#eef;padding:6px;font:12px Arial">
      <b>Quick Links</b><br>${L('hotmail', 'Hotmail — Free E-mail!')}<br>${L('av', 'AltaVista Search')}<br>${L('jeeves', 'Ask Jeeves')}<br>${L('geo', 'GeoCities — Free Homepages')}<br>${L('notl', 'Town of Niagara-on-the-Lake')}<br>${L('y2k', 'Y2K Preparedness Centre')}<br>${L('matrix', 'whatisthematrix.com')}<br><br>
      <b>Search AltaVista:</b><br><input class="field q" style="width:120px"> <button class="btn" data-search="1">Go</button>
    </td></tr></table><hr><p class="center" style="font:10px Arial">© 1999 NiagaraNet Inc. · Best viewed in Netscape Navigator 4.0 at 800×600 · You are visitor #004,112</p>` });

page('av', { url: 'http://www.altavista.com/', title: 'AltaVista — Search',
  html: () => `<div class="center"><div style="font:bold 30px Arial;color:#039">Alta<span style="color:#fc0">Vista</span><sup style="font-size:10px">™</sup></div><p style="font:12px Arial">The most powerful and useful guide to the Net</p>
    <div class="av-box" style="display:inline-block">Search for: <input class="field q" style="width:240px"> <button class="btn" data-search="1">Search</button></div>
    <p style="font:11px Arial;color:#555;margin-top:10px">Tip: Try searching for things you're wondering about. Mould. Apologies. Your mother's maiden name. Chocolate and dogs.</p></div>` });

page('jeeves', { url: 'http://www.askjeeves.com/', title: 'Ask Jeeves',
  html: () => `<div class="center"><div style="font:bold 26px Georgia;color:#600">Ask Jeeves<sup style="font-size:10px">®</sup></div><p><i>Have a question? Just type it in and click Ask!</i></p>
    <div class="av-box" style="display:inline-block;background:#fff8e8">🤵 <input class="field q" style="width:260px" placeholder="How do I..."> <button class="btn" data-search="1">Ask!</button></div>
    <p style="font:12px Arial">Popular questions: ${L('q:how do i apologize to my mom', 'How do I apologize to my mom?')} · ${L('q:can dogs eat chocolate', 'Can dogs eat chocolate?')} · ${L('q:is y2k real', 'Is Y2K real?')}</p></div>` });

page('geo', { url: 'http://www.geocities.com/Area51/Vault/1917/', title: "COMRADE DAVE'S RED PAGE", dark: true,
  onView: () => { if (!F('sawGuestbook')) { setF('sawGuestbook'); karma(1); setTimeout(() => ev(`You read the guestbook entry signed "N." three times. Your mother has been reading your website. Your mother signed your guestbook. Your mother likes your poem section, which doesn't exist yet.`), 50); } },
  html: () => `<div class="center"><h1 style="color:#f00;font-family:Impact,Arial">☭ COMRADE DAVE'S RED PAGE ☭</h1><div class="uc">🚧 UNDER CONSTRUCTION 🚧</div>
    <p style="color:#ff0">~*~ WORKERS OF THE WORLD UNITE ~*~ YOU HAVE NOTHING TO LOSE BUT YOUR CHAINS ~*~</p>
    <p>Welcome comrade! You are visitor number <span class="counter">000014</span></p></div><hr>
    <h2 style="color:#f00">ABOUT ME</h2><p style="color:#fcc">Name: Dave. Age: 17. Height: 6'6" (yes really). Location: Niagara-on-the-Lake (a bourgeois paradise). Interests: Marxism, Rage Against the Machine, computers, Shadowgate (NES), staying up late.</p>
    <h2 style="color:#f00">MY LINKS</h2><p>${L('marx', 'Marxists Internet Archive')} · ${L('ratm', 'Rage Against the Machine (official)')} · ${L('shadowgate', 'SHADOWGATE SHRINE')} · ${L('icq', 'ICQ')}</p>
    <h2 style="color:#f00">MY POEMS</h2><p style="color:#fcc"><i>coming soon!!!</i></p>
    <h2 style="color:#f00">GUESTBOOK</h2>
    <table style="color:#fcc;font:12px Arial" width="100%">
      <tr><td style="border:1px solid #600"><b>Gr3g</b> — 09/02/99<br>cool page comrade!!! ur hammer and sickle gif is a little crooked tho. also u spelled "proletariat" wrong in the title tag. live long and prosper</td></tr>
      <tr><td style="border:1px solid #600"><b>tyler_sk8</b> — 09/14/99<br>lol</td></tr>
      <tr><td style="border:1px solid #600"><b>N.</b> — 09/29/99<br>Very red. I am looking forward to the poems section. I know you have it in you.<br>Please remember to eat a vegetable. — N.</td></tr>
    </table><p class="center" style="color:#666;font-size:10px">This page best viewed with eyes. Made with Notepad. © 1999 comrade_dave</p>` });

page('hotmail', { url: 'http://www.hotmail.com/cgi-bin/HoTMaiL', title: 'Hotmail — Inbox', html: () => {
  const list = EMAILS.filter(e => e.day <= G.day).sort((a, b) => b.day - a.day);
  return `<table width="100%" style="background:#036;color:#fff"><tr><td style="padding:4px"><b style="font:bold 18px Arial">Hotmail</b> <span style="font:11px Arial">comrade_dave@hotmail.com</span></td><td align="right" style="font:11px Arial">Inbox · Compose · Address Book · Options</td></tr></table>
    <p style="font:12px Arial;margin:6px 0"><b>Inbox</b> — ${list.length} messages, ${list.filter(e => !F('read_' + e.id)).length} unread</p>
    <table width="100%" style="font:12px Arial;border:1px solid #999"><tr style="background:#ddd"><th align="left">From</th><th align="left">Subject</th><th align="left">Date</th></tr>
    ${list.map(e => `<tr class="hm-row${F('read_' + e.id) ? '' : ' unread'}" data-mail="${e.id}"><td>${e.from.split('&lt;')[0]}</td><td>${e.subj}</td><td style="white-space:nowrap">${e.time.split(' ').slice(0, 2).join(' ')}</td></tr>`).join('')}</table>
    <p style="font:10px Arial;color:#888;margin-top:8px">Get your FREE e-mail at Hotmail! · You have used 41% of your 2 MB storage.</p>`;
} });
function mailPage(mid) {
  const e = EMAILS.find(x => x.id === mid);
  return { id: 'mail:' + mid, url: 'http://www.hotmail.com/cgi-bin/getmsg?msg=' + mid, host: 'www.hotmail.com', title: 'Hotmail — ' + (e ? e.subj.replace(/<[^>]+>/g, '') : ''),
    onView: () => { if (e) { setF('read_' + e.id); if (e.onRead) e.onRead(); } },
    html: () => e ? `<p style="font:12px Arial">${L('hotmail', '« Back to Inbox')}</p><table style="font:12px Arial;background:#eee;width:100%"><tr><td><b>From:</b> ${e.from}<br><b>To:</b> comrade_dave@hotmail.com<br><b>Subject:</b> ${e.subj}<br><b>Date:</b> ${e.time}</td></tr></table><div style="font:13px Arial;padding:8px 2px;line-height:1.4">${e.body()}</div>` : 'Message not found.' };
}

/* ---- search ---- */
const SEARCH = [
  [/mou?ld|fung|spore|mycotox/, 'mould'], [/penicil|fleming/, 'fleming'], [/chocolate.*dog|dog.*chocolate|theobromine|can dogs eat/, 'theo'],
  [/apolog|sorry|say sorry|make up with|mom.*mad|mad.*mom|fight with/, 'apology'], [/titrat|endpoint|burette|phenolph/, 'titration'], [/mole day|avogadro/, 'moleday'],
  [/noreen|ashby|lakeshore|strain.?#?4|icewine|ice wine/, 'lakeshore'], [/sourdough|starter|wild yeast|yeast/, 'yeast'], [/marx|communis|soviet|lenin|proletar|revolution/, 'marx'],
  [/y2k|millennium bug|year 2000/, 'y2k'], [/shadowgate/, 'shadowgate'], [/zoltrix|modem|56k/, 'zoltrix'], [/garrison|niagara.on.the.lake|notl/, 'notl'],
  [/sodium|alkali/, 'sodium'], [/forg|fake.*signature|signature/, 'forge'], [/matrix|neo|keanu/, 'matrix'], [/greg|avogadros_greg/, 'gregpage'],
  [/rage against|ratm|zack/, 'ratm'], [/milk.*cookie|cookie.*milk/, 'milkcookie'], [/asthma|inhaler/, 'asthma'], [/canadian tire|ctfs|card operations/, 'ctfs'],
  [/hip.*(surgery|fracture)|broken hip/, 'hip'], [/corgi/, 'corgi'], [/icq/, 'icq'], [/brock/, 'brock'], [/pizza/, 'pizza'],
];
function searchPage(q) {
  const t = q.toLowerCase().trim();
  const hits = SEARCH.filter(([re]) => re.test(t)).map(([, id]) => id).filter((v, i, a) => a.indexOf(v) === i);
  return { url: 'http://www.altavista.com/cgi-bin/query?q=' + encodeURIComponent(q), host: 'www.altavista.com', title: 'AltaVista: ' + q,
    html: () => `<div style="font:bold 20px Arial;color:#039">Alta<span style="color:#fc0">Vista</span></div><div class="av-box">Search for: <input class="field q" style="width:220px" value="${esc(q)}"> <button class="btn" data-search="1">Search</button></div>
      ${hits.length ? `<p style="font:12px Arial">AltaVista found about ${(hits.length * 1371 + t.length * 17).toLocaleString()} web pages for you.</p>${hits.map(h => { const p = PAGES[h]; return `<p style="font:13px Arial">• ${L(h, p.title)}<br><span style="font-size:11px;color:#060">${p.url}</span><br><span style="font-size:12px">${p.blurb || ''}</span></p>`; }).join('')}`
      : `<p style="font:12px Arial">AltaVista found <b>no documents</b> matching your query.</p><p style="font:12px Arial">Try different words. Try fewer words. Try "mould," "apology," "titration," "sourdough," "Mole Day," or your mother's maiden name.</p>`}` };
}

/* ---- content pages ---- */
page('mould', { url: 'http://www.gov.on.ca/health/moulds.html', title: 'Ontario Ministry of Health — Moulds in the Home', blurb: 'Household moulds: health effects, sources, and how to remove them safely.',
  html: () => `<h1>Moulds in the Home</h1><p><i>Ontario Ministry of Health — Public Health Information Sheet</i></p><p>Moulds are fungi that grow wherever there is moisture, warmth, and food. In the home, common sources include damp basements, wet carpet, and <b>forgotten food</b> — especially dairy and starchy foods left at room temperature.</p>
    <p>Many moulds release microscopic <b>spores</b> into the air. Most are harmless to healthy people, but some species produce substances called <b>mycotoxins</b>, and certain rare moulds can cause serious lung illness. People with <b>asthma</b>, allergies, or weakened immune systems are at much greater risk.</p>
    <p><b>Warning signs:</b> a musty or sour smell; coughing, wheezing, or worsening asthma that improves when the person leaves the house.</p><p><b>What to do:</b> find and remove the source. Seal it in plastic before moving it. Ventilate the room. If someone is unwell, <b>tell their doctor about the possible exposure</b> — knowing the cause can make all the difference to treatment.</p>`,
  onView: () => setF('readMould') });
page('fleming', { url: 'http://www.nobel.se/medicine/laureates/1945/fleming-bio.html', title: 'Sir Alexander Fleming — Biography', blurb: '"One sometimes finds what one is not looking for." Nobel Prize in Medicine, 1945.',
  html: () => `<h1>Sir Alexander Fleming (1881–1955)</h1><p>In September 1928, Fleming returned from holiday to his laboratory at St. Mary's Hospital in London and found that a petri dish of <i>Staphylococcus</i> bacteria, left out on his bench, had been contaminated by a mould. Around the mould was a clear zone where the bacteria had been destroyed.</p><p>"That's funny," he is said to have remarked. The mould was <i>Penicillium notatum</i>. The substance it produced was penicillin.</p><p><b>"One sometimes finds what one is not looking for."</b></p><p>Fleming shared the 1945 Nobel Prize in Physiology or Medicine with Howard Florey and Ernst Chain.</p>` });
page('theo', { url: 'http://www.vetcentre.com/faq/chocolate.html', title: 'Pet Health FAQ: Chocolate Toxicity in Dogs', blurb: 'Can dogs eat chocolate? NO. Here\'s why.',
  html: () => `<h1>Chocolate and Dogs: NO.</h1><p>Chocolate contains <b>theobromine</b>, a stimulant that dogs metabolise very slowly. Even a small amount can cause vomiting, restlessness, a racing heart, and in serious cases, seizures. Small dogs are at greatest risk.</p><p><b>If your dog has eaten chocolate, call your veterinarian or emergency animal clinic immediately.</b> Don't wait for symptoms.</p><p>Good treats for dogs: commercial dog biscuits, plain carrots, apple slices (no seeds).</p>`, onView: () => setF('chocWarned') });
page('apology', { url: 'http://www.askjeeves.com/answers/apologize-to-parent.html', title: 'Ask Jeeves: How do I apologize to my mom?', blurb: 'Jeeves has found an answer to your question!',
  html: () => `<div style="font:bold 20px Georgia;color:#600">Ask Jeeves</div><p><b>You asked:</b> How do I apologize to my mom?</p><p>🤵 <i>Jeeves suggests:</i></p><ol><li><b>Be specific.</b> Say exactly what you did. "I'm sorry for what I said" is good; "I'm sorry I said you don't do anything" is better.</li><li><b>Don't say "but."</b> Everything before "but" doesn't count.</li><li><b>Don't apologise for her feelings.</b> "I'm sorry you're upset" is not an apology. It's a weather report.</li><li><b>Show it.</b> A small gesture helps: a cup of tea, a chore done without being asked, a letter if talking is hard.</li><li><b>Ask about her.</b> Parents are people. Many of them had whole lives before you.</li></ol><p style="font:11px Arial;color:#666">Was this answer helpful? [Yes] [No]</p>`, onView: () => setF('readApology') });
page('titration', { url: 'http://chem.brocku.ca/~help/titration.html', title: 'Brock Chemistry Help Desk: Titration Basics', blurb: 'Acid-base titration explained — with an example from the Niagara wine industry.',
  html: () => `<h1>Acid–Base Titration</h1><p>A <b>titration</b> finds the unknown concentration of a solution by slowly adding a solution of known concentration (from a <b>burette</b>) until the reaction is complete — the <b>endpoint</b>, usually shown by an indicator such as phenolphthalein turning pink.</p><p><b>The golden rule:</b> go slowly near the end. The last drop is the one that matters.</p><p><b>Local example:</b> Niagara wineries titrate grape juice with sodium hydroxide to measure its acidity. Titratable acidity guides harvest decisions — especially for icewine. Brock alumni have staffed winery labs across the region since the 1970s.</p><p><small>Brock University Department of Chemistry · St. Catharines, Ontario</small></p>`, onView: () => { setF('readTitration'); } });
page('moleday', { url: 'http://www.moleday.org/', title: 'National Mole Day Foundation', blurb: 'Celebrated annually on October 23 from 6:02 a.m. to 6:02 p.m.',
  html: () => `<h1 style="color:#630">🐾 National Mole Day 🐾</h1><p>Mole Day commemorates <b>Avogadro's Number</b> (6.02 × 10²³), a basic measuring unit in chemistry. It is celebrated annually on <b>October 23</b> from <b>6:02 a.m. to 6:02 p.m.</b></p><p>This year's theme: <i>"The Mole-ennium!"</i></p><p>Ideas for celebrating: mole cupcakes, mole puns, and telling someone you love them 6.02 × 10²³ times.</p>` });
page('lakeshore', { url: 'http://www.grapeandwine.com/archive/1983/lakeshore.html', title: 'Niagara Grape & Wine Festival Archive: Lakeshore Estates Wins Gold', blurb: '1983: A Niagara icewine takes gold in Germany — and the winery credits its lab.',
  html: () => `<h1>Niagara Icewine Takes Gold in Germany</h1><p><i>Reprinted from the Grape &amp; Wine Festival Programme, September 1983</i></p><p>Lakeshore Estates Winery of Niagara-on-the-Lake has won a gold medal for its 1981 Riesling Icewine at the InterVin competition in Germany — a first for the young winery and a major coup for Ontario.</p><p>Winemaker Frank Pelletier credits the win to his former laboratory chemist, <b>Noreen Ashby</b> (Brock '68), who isolated a wild yeast strain — known in the cellar simply as <b>"Number Four"</b> — from the estate's own Riesling block in 1979.</p><p>"Noreen could hear a fermentation going wrong from across the building," Pelletier said. "We'd be nowhere without her. She left last year to start a family, and I still haven't forgiven her. Neither has the Riesling."</p><p><img src="assets/ui/photo_lab.webp" alt="" style="width:140px;vertical-align:middle;border:3px solid #eee"> <small>N. Ashby in the Lakeshore lab, 1979.</small></p>`,
  onView: () => Story.learnPast('web') });
page('yeast', { url: 'http://www.geocities.com/NapaValley/Vineyard/2241/', title: "The Wild Yeast Page — Sourdough Starters & Winery Strains", blurb: 'Some bakers keep the same starter alive for decades. Some came from wineries.',
  html: () => `<h1>Wild Yeast &amp; Old Starters</h1><p>A sourdough <b>starter</b> is a living culture of wild yeast and bacteria, fed regularly with flour and water. Some families keep the same starter alive for generations.</p><p>A few of the most interesting starters in Ontario began life in <b>winery laboratories</b> — wild strains isolated from grape skins by cellar chemists who couldn't bear to throw them out. These cultures give breads (and cookies!) a distinctive sour-sweet, almost wine-like tang.</p><p><b>Caution:</b> wild cultures are living communities. Combined with other foods and left in warm, dark places, they can host unusual moulds. Keep it clean, keep it fed, keep it in the fridge.</p>` });
page('marx', { url: 'http://www.marxists.org/', title: 'Marxists Internet Archive', blurb: '"Workers of the world, unite!" — the complete works, online.',
  html: () => `<h1 style="color:#900">Marxists Internet Archive</h1><p>The Communist Manifesto (1848) · Das Kapital · Lenin Collected Works · Trotsky Internet Archive</p><blockquote><i>"The history of all hitherto existing society is the history of class struggles."</i></blockquote><p>You read the first page of the Manifesto. It's a lot. You get to "spectre" and feel very cool and then a bit tired. Your mother, you remember, once said she'd read it in university "and also Atlas Shrugged, the same week, as a sort of palate cleanser."</p>` });
page('y2k', { url: 'http://www.y2kprepare.com/', title: 'Y2K PREPAREDNESS CENTRE — ARE YOU READY???', blurb: 'Canned goods. Bottled water. Cash. Generators. Don\'t be caught unprepared on 01/01/00!',
  html: () => `<h1 style="color:#c00;font-family:Impact">ARE YOU Y2K READY???</h1><p class="marquee"><span>⚠ ${78 - G.day} DAYS LEFT ⚠ STOCK UP NOW ⚠ ${78 - G.day} DAYS LEFT ⚠</span></p><p>When the clocks roll over on January 1, 2000, millions of computers will think it's 1900! <b>Banks. Power plants. Credit cards.</b></p><p>You think of your father, at Canadian Tire Financial Services, personally responsible for the credit cards. You picture him on January 1st with a flashlight and a can of beans. You feel, briefly, very bad for him.</p>` });
page('shadowgate', { url: 'http://www.geocities.com/TimesSquare/Castle/1987/', title: 'THE SHADOWGATE SHRINE', blurb: '"It\'s a sad thing that your adventures have ended here!!" Every death, catalogued.',
  html: () => `<h1>⚔ THE SHADOWGATE SHRINE ⚔</h1><p>Every death in Shadowgate (NES, 1989), catalogued with screenshots. 47 and counting.</p><p><b>Tip #1:</b> Always carry a lit torch. <b>Tip #2:</b> Don't drink everything you find. <b>Tip #3:</b> Examine everything. Use everything on everything else. That's the whole game, really.</p><p class="center"><b>"It's a sad thing that your adventures have ended here!!"</b></p>` });
page('zoltrix', { url: 'http://www.zoltrix.com/products/phantom56k.html', title: 'Zoltrix Phantom 56K V.90 Internal Modem', blurb: 'Twice the speed! Now V.90 compliant.',
  html: () => `<h1>Zoltrix Phantom 56K</h1><p><b>Twice the speed of your old 33.6!</b> V.90 compliant. Voice/fax/data. Plug and Play for Windows 98.</p><p>MSRP: $129.99 CDN. "Available at Future Shop, Business Depot, and Canadian Tire."</p><p>You've wanted one for six months. You've mentioned it at dinner eleven times. Noreen always says, "And how would that help with the phone, exactly?"</p>` });
page('notl', { url: 'http://www.notl.org/', title: 'Town of Niagara-on-the-Lake', blurb: 'The prettiest town in Canada. Home of the Shaw Festival.',
  html: () => `<h1>Welcome to Niagara-on-the-Lake</h1><p><i>"The Prettiest Town in Canada"</i></p><p>Home of the Shaw Festival, Fort George, and more than twenty wineries. New residential development continues in <b>Garrison Village</b>, a heritage-inspired community on the former military reserve lands, with tree-lined streets and front porches.</p><p><b>Council notice:</b> Halloween trick-or-treating hours are 5–8 p.m. Please drive carefully.</p>` });
page('sodium', { url: 'http://www.chem.sfu.ca/msds/sodium.html', title: 'MSDS: Sodium Metal', blurb: 'DANGER: Reacts violently with water.',
  html: () => `<h1 style="color:#c00">MATERIAL SAFETY DATA SHEET — SODIUM</h1><p><b>DANGER. REACTS VIOLENTLY WITH WATER</b>, releasing flammable hydrogen gas which may ignite. Causes severe burns. Store under mineral oil. Keep away from water, moisture, and teenagers.</p><p>(That last part isn't on the real sheet. It should be.)</p>` });
page('forge', { url: 'http://www.askjeeves.com/answers/forge-signature.html', title: 'Ask Jeeves: How do I forge my parent\'s signature?', blurb: 'Jeeves has found an answer to your question!',
  html: () => `<div style="font:bold 20px Georgia;color:#600">Ask Jeeves</div><p><b>You asked:</b> How do I forge my parent's signature?</p><p>🤵 <i>Jeeves suggests:</i> Have you considered simply showing them? In Jeeves's long experience, the forged signature is always discovered, generally at the worst possible moment — for instance, at <b>parent–teacher interviews</b>.</p><p>Jeeves also notes that the person whose signature you are forging is very often the person who would most like to help you.</p>` });
page('matrix', { url: 'http://www.whatisthematrix.com/', title: 'What Is The Matrix?', blurb: 'Free your mind.',
  html: () => `<div class="center" style="background:#000;color:#0f0;font-family:'Courier New';padding:20px"><h1>WHAT IS THE MATRIX?</h1><p>Wake up, Neo...</p><p>Follow the white rabbit.</p><p style="font-size:11px">Coming to VHS and DVD September 21.</p></div>` });
page('gregpage', { url: 'http://www.geocities.com/CapeCanaveral/Lab/6022/', title: "Greg's Chemistry & Star Trek Corner", blurb: 'Avogadro, Picard, and the Periodic Table. Mostly Picard.',
  html: () => `<h1 style="color:#00c">Greg's Chemistry &amp; Star Trek Corner</h1><p>🖖 Welcome to my page! You are visitor <span class="counter">000203</span></p><p><b>Favourite element:</b> Carbon (it bonds with everybody). <b>Favourite captain:</b> Picard. <b>Favourite number:</b> 6.02 × 10²³.</p><p><b>Best friend:</b> comrade_dave (he's not a real communist, he just likes the font)</p><p><b>My dad's new address in Hamilton:</b> I'm not putting that on the internet, Mom.</p>` });
page('ratm', { url: 'http://www.ratm.com/', title: 'Rage Against the Machine', blurb: 'Official site.', html: () => `<h1>RAGE AGAINST THE MACHINE</h1><p>New album <i>The Battle of Los Angeles</i> — in stores November 2.</p>` });
page('milkcookie', { url: 'http://www.geocities.com/Heartland/Hollow/4410/', title: 'Milk & Cookies: A Love Story', blurb: 'A whole website about dunking. The internet in 1999 is amazing.',
  html: () => `<h1>Milk &amp; Cookies: A Love Story</h1><p>The perfect dunk is <b>three seconds</b>. Any less and the cookie stays dry; any more and it collapses into the glass and becomes a tragedy.</p><p>"My mother always left a glass of milk and two cookies on the counter for me after school. I'm 46 now. She's gone. I'd give anything for one more glass." — <i>guestbook, Barb in Ohio</i></p><p>You stare at that last line for a while.</p>` });
page('asthma', { url: 'http://www.lung.ca/asthma/', title: 'The Lung Association: Asthma', blurb: 'Asthma triggers include dust, smoke, and mould.',
  html: () => `<h1>Living With Asthma</h1><p>Common asthma triggers include dust mites, pet dander, smoke, cold air, and <b>mould spores</b>. People with asthma should keep living spaces dry and clean and avoid damp, musty rooms.</p><p>Warning signs of a serious attack: difficulty speaking, blue lips, no relief from a rescue inhaler. Call 911.</p>` });
page('ctfs', { url: 'http://www.canadiantire.ca/financial/', title: 'Canadian Tire Financial Services', blurb: 'Welland, Ontario. Making life easier for Canadian Tire customers.',
  html: () => `<h1 style="color:#c00">Canadian Tire Financial Services</h1><p>Headquartered in Welland, Ontario, Canadian Tire Financial Services manages the Canadian Tire Options MasterCard and retail card programs.</p><p><b>Y2K Statement:</b> "All CTFS systems have been fully remediated and tested for Year 2000 readiness." — Card Operations</p><p>Somewhere in Welland, your father wrote that sentence, and has been losing sleep over it since 1997.</p>` });
page('hip', { url: 'http://www.orthoinfo.org/hip-fracture.html', title: 'Hip Fractures in Older Adults', blurb: 'Surgery usually takes place within 24–48 hours.',
  html: () => `<h1>Hip Fractures</h1><p>Hip fractures are common in older adults after a fall. Most require surgery within 24–48 hours. Families are often asked to make decisions quickly, and need to be reachable by the surgical team.</p><p>Recovery can take months. Visits and phone calls from family make a real difference.</p>` });
page('corgi', { url: 'http://www.corgiclub.ca/', title: 'Canadian Pembroke Welsh Corgi Club', blurb: 'Big dogs in small bodies.', html: () => `<h1>Pembroke Welsh Corgis</h1><p>Herding dogs bred to nip at the heels of cattle. Loyal, intelligent, and <b>extremely vocal</b>. Corgis are prone to obesity and can be sensitive to rich foods — and like all dogs, must never be given chocolate.</p>` });
page('icq', { url: 'http://www.icq.com/', title: 'ICQ.com — I Seek You', blurb: 'Over 40 million users!', html: () => `<h1 style="color:#393">ICQ</h1><p>"I Seek You." Over 40 million users worldwide! Download ICQ 99b now!</p><p>Uh-oh!</p>` });
page('brock', { url: 'http://www.brocku.ca/', title: 'Brock University', blurb: 'St. Catharines, Ontario. Founded 1964.', html: () => `<h1>Brock University</h1><p>St. Catharines, Ontario · Founded 1964.</p><p><b>Alumni News:</b> Chemistry class of '68 reunion planned for next spring. "Help us find our lost classmates!" A short list follows. One of the names is <b>Noreen Ashby</b>.</p>`, onView: () => setF('hintPast') });
page('pizza', { url: 'http://www.pizzapizza.ca/', title: 'Pizza Pizza', blurb: '967-11-11!', html: () => `<h1 style="color:#f60">PIZZA PIZZA</h1><p>Call <b>967-11-11</b>! Online ordering coming soon in the year 2000!</p>` });
page('notfound', { url: 'http://', title: 'Not Found', html: () => `<h1>Not Found</h1><p>The requested URL was not found on this server.</p>` });

/* ==========================================================================
   ICQ with Greg
   ========================================================================== */
const ICQ = {
  greeting() {
    const d = G.day;
    if (Story.moldInMaster() && F('gregWarned')) return ['dude', 'did u take it out yet', 'the glass', 'DAVID'];
    if (d === 0) return ['dude where did u go', 'u disappeared from the chem chat like 2 hrs ago', 'r u ok?'];
    if (Story.noreenState() === 'hospital') return ['david i heard about ur mom', 'my mom heard from mrs. pelletier who heard from someone at the hospital', 'r u ok?? do u want me to come over'];
    if (Story.noreenState() === 'sick') return ['hey how is ur mom', 'u said she was sick?'];
    if (d === 8) return ['HAPPY MOLE DAY EVE', 'tomorrow is the real one', '6:02 am. i set an alarm. dont judge'];
    if (d === 9) return ['HAPPY MOLE DAY!!!', 'also isnt it ur moms bday today', 'tell her happy bday from me'];
    if (d === 7) return ['are ur parents at the parent teacher thing rn', 'mine arent', 'whatever', 'r u nervous'];
    if (d === 12) return ['TEST TOMORROW', 'did u read my notes', 'theyre on ur C drive. i put them there. i know u'];
    return pick([['hey', 'whats up comrade'], ['yo', 'u there?'], ['hey man', 'how r things at home']]);
  },
  options() {
    const o = [];
    const mw = Story.mixWhere();
    if (!F('toldGregFight')) o.push({ t: 'me and my mom had a huge fight', do: () => { setF('toldGregFight'); rel('greg', 1); return ['oh no', 'what happened', '...', 'wait let me guess. the phone', 'the modem?', 'what did u say'] ; } });
    if (F('toldGregFight') && !F('icqToldWords')) o.push({ t: 'i told her she doesnt do anything all day', do: () => { setF('icqToldWords'); return ['...dude', 'u said that to UR MOM?', 'the woman who corrected kowalskis grammar at the science fair. with a red pen. out loud', 'then what', '...'] ; } });
    if (F('icqToldWords') && !F('icqToldMilk')) o.push({ t: 'then she brought me milk and cookies. sarcastically', do: () => { setF('icqToldMilk'); return ['lol', 'ok sorry. not lol', 'but like. sarcastic milk and cookies is still milk and cookies', 'my moms version of sarcastic is throwing a pop tart at my head', 'u gotta apologize man. a real one', 'not "sorry ur upset". my mom says thats not an apology thats a weather report']; } });
    if (F('toldGregFight')) o.push({ t: 'ok but what do i actually DO', do: () => ICQ.advice() });
    if (exists('mixture') && !F('icqMix_' + mw)) o.push({ t: 'i crushed the cookie into the milk', do: () => ICQ.mixture(mw) });
    if (!F('icqDog')) o.push({ t: 'can i give shelby a cookie? he keeps staring at me', do: () => { setF('icqDog'); setF('chocWarned'); return ['NO', 'chocolate has theobromine', 'dogs cant metabolize it', 'a corgi is like 25 lbs', 'one cookie could make him really sick', 'give him a milkbone. ur mom keeps them on the high shelf']; } });
    if (!F('icqLetter') && F('toldGregFight')) o.push({ t: 'how do u even write an apology letter', do: () => { setF('icqLetter'); return ['ok so', '1. say what u did. like exactly', '2. say why it was wrong', '3. NO "but"', '4. say u love her (ugh i know)', 'then print it and leave it on her pillow', 'my mom keeps every note i ever wrote her in a shoebox', 'its embarrassing. its also kind of awesome']; } });
    if (!F('icqMould')) o.push({ t: 'random q. do u know anything about mould', do: () => { setF('icqMould'); return ['do i know anything about mould. DAVID', 'fleming 1928. penicillin', 'mould is basically chemistry with ambition', 'but some kinds are toxic. spores. bad for ppl with asthma', 'if ur growing something do it in a petri dish in ur room like a scientist', 'van dyk has a stack in his cabinet. second shelf', 'why do u ask', '...why do u ask']; } });
    if (F('knowsPast') && !F('icqPast')) o.push({ t: 'did u know my mom used to be a chemist? at a winery', do: () => { setF('icqPast'); setF('toldGregPast'); rel('greg', 1); return ['WHAT', 'like a fermentation chemist??', 'dude', 'titration is literally how they test wine', 'u have a TITRATION EXPERT in ur KITCHEN', 'and ur asking ME for help', 'ask her. tonight. ill wait']; } });
    if (F('knowsCarol') && !F('icqCarol')) o.push({ t: 'my grandma broke her hip. my mom was trying to call the hospital the whole time i was online', do: () => { setF('icqCarol'); return ['oh man', 'oh no', 'so when she was yelling about the phone', 'she was trying to', 'oh dude', 'ok u HAVE to apologize. like tonight', 'and ask how ur grandma is. u have to ask']; } });
    if (!F('icqDad')) o.push({ t: 'how r things with ur dad', do: () => { setF('icqDad'); rel('greg', 1); karma(1); return ['eh', 'he called sunday. talked for like 4 min', 'its fine', 'actually its not fine but whatever', 'u know whats weird', 'id give anything to have a fight with him. like a real one. in the same house', 'at least ur mom is still in the kitchen to be mad at', 'sorry thats heavy lol', 'ANYWAY']; } });
    if (!F('icqMatrix')) o.push({ t: 'is the matrix real', do: () => { setF('icqMatrix'); return ['ok so ive seen it 6 times', 'if the machines used humans as batteries theyd be violating the 2nd law of thermodynamics', 'i wrote a letter to warner bros', 'they sent me a poster', 'so basically: no. but also maybe']; } });
    o.push({ t: 'gtg. ttyl', bye: true, do: () => [pick(['ok ttyl', 'later comrade', 'k. go talk to ur mom', 'live long and prosper 🖖'])] });
    return o;
  },
  advice() {
    if (Story.moldInMaster()) return ['first thing', 'get that glass out of ur parents room', 'im not kidding', 'everything else comes after that'];
    if (Story.apology() === 0) return pick([['ok. step 1: apologize. for the actual thing u said', 'step 2: dont say but', 'step 3: shut up and let her talk', 'thats the whole algorithm'], ['if talking is hard (and with u its hard) write it down', 'notepad. print it. leave it on her pillow', 'or make her a cup of tea. my dad used to do that after fights', 'its like sorry in liquid form'], ['bring the milk and cookies back down', 'like "hey, want half?"', 'its hard to stay mad at someone holding half a cookie']]);
    if (!F('knowsPast')) return ['u apologized? ok good. huge', 'now ask her about her life', 'like actually ask', 'parents are people. its horrifying but its true', 'whats in that box in ur basement anyway. the old one'];
    return ['dude', 'u have a chemistry genius for a mom', 'and a chem unit test coming up', 'ASK HER FOR HELP', 'its the most obvious thing in the world', 'even i can see it and i cant see my own feet'];
  },
  mixture(mw) {
    setF('icqMix_' + mw); setF('toldGregMold_' + mw);
    if (mw === 'underbed_master' || mw === 'master' || mw === 'masterbath') { setF('gregWarned'); return ['ok', 'and then what', 'u WHAT', 'UNDER UR PARENTS BED???', 'david', 'milk + starch + whatever weird sourdough thing is in ur moms cookies + warm dark room with carpet = incubator', 'some moulds put toxins in the air', 'UR MOM HAS ASTHMA. u told me she has asthma', 'take it out. tonight. please', 'if u want to grow something put it in a petri dish in UR room like a scientist. not like a supervillain']; }
    if (mw === 'fridge') return ['and put it in the FRIDGE?', 'lol ur mom is gonna find that', 'and also the cold stops anything growing so its pointless'];
    setF('gregSciIdea');
    return ['wait', 'ur moms cookies have that weird sour thing right? like sourdough', 'thats a wild culture man. somethings living in there', 'if u let that go for a few days in a warm dark place...', 'ok dont get weird about it', 'but get a petri dish from van dyks cabinet and streak some on', 'keep it in UR room. somewhere warm. NOT near ur mom (asthma)', 'bring it in when stuff grows', 'FLEMING. DUDE.'];
  },
};
