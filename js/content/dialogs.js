/* ==========================================================================
   People & dialogue trees
   ========================================================================== */
'use strict';

/* ======================================================================
   NOREEN
   ====================================================================== */
person('noreen', {
  name: 'Noreen', portraitBase: 'noreen',
  talk() {
    const st = Story.noreenState();
    if (st === 'sick') return 'noreen_sick';
    if (Story.noreenOnPhone()) return 'noreen_onphone';
    return 'noreen';
  },
  examine() {
    const st = Story.noreenState();
    if (st === 'sick') return `Your mother, propped up in bed. Her skin has gone the grey of old dishwater and she breathes like there's a hand on her chest. Every few minutes, a deep wet cough. She's trying to read and not managing.`;
    const m = Story.noreenMood();
    const base = `Noreen: five-seven, fifty-two (fifty-three on Saturday the 23rd), in her cream cable-knit cardigan over a navy turtleneck, pearl studs, ash-blonde bob "going distinguished." She is the most competent person in Garrison Village and possibly the Niagara Region.`;
    const mood = { stern: ` Right now her jaw is set like a bear trap. She is not looking at you with great effort.`, cold: ` She's moving around the room with tight, efficient little motions — the way she moves when she's hurt and has decided not to be.`, thaw: ` She looks tired. Not angry anymore, exactly. Just tired.`, warm: ` She catches you looking and almost smiles.` }[m];
    return base + mood + (st === 'cough' ? ` She's had a dry little cough for a couple of days. She keeps clearing her throat.` : st === 'smell' ? ` She keeps wrinkling her nose, as if at a smell she can't find.` : '');
  },
  hit: () => { karma(-1); return `No. Whatever else you are, you are not that. You put your hands in your pockets and keep them there.`; },
  give(id) {
    if (Story.noreenState() === 'sick' && ['tylenol', 'inhaler', 'tissue', 'tea'].includes(id)) return Story.giveNoreenMeds(id);
    switch (id) {
      case 'milk': case 'cookie': return has('milk') && has('cookie') ? (talk('noreen', 'truce'), null) : (talk('noreen', id === 'milk' ? 'return_milk' : 'return_cookie'), null);
      case 'crumbs': return `You hold out a handful of crumbs. She looks at them, then at you. "Did you... crush my cookie?" You don't answer. She sighs through her nose and goes back to what she was doing.`;
      case 'mixture': talk('noreen', 'show_mixture'); return null;
      case 'quiz': talk('noreen', 'quiz'); return null;
      case 'quiz_forged': talk('noreen', 'forged'); return null;
      case 'quiz_signed': return F('quizSignedBy') === 'noreen' ? `"I know, sweetheart. I signed it." She taps it. "Hand it in."` : (talk('noreen', 'don_signed'), null);
      case 'tea': talk('noreen', 'tea'); return null;
      case 'letter': return Story.giveLetter();
      case 'poem': return Story.givePoem();
      case 'cupcake': return Story.giveCupcake();
      case 'textbook': case 'photo': case 'notebook': case 'labcoat': talk('noreen', 'box_talk'); return null;
      case 'glass_empty': lose('glass_empty'); setF('returnedGlass'); rel('noreen', 0); return `You hand her the empty glass. She takes it, and you watch her decide not to say anything. It goes into the dishwasher. "Thank you," she says, to the dishwasher.`;
      case 'glass_clean': lose('glass_clean'); rel('noreen', 1); karma(1); return `You hand her a clean glass. She looks at it, then at you, then at it again. "Did you... wash this?" "Yeah." "Hm." She puts it away. She is trying very hard not to look pleased and losing.`;
      case 'badge': return `"That's your father's. Why do you have your father's badge?" You don't have a good answer. "Give it to him, David."`;
      case 'plunger': return ITEMS.plunger.use.noreen;
      case 'ctmoney': return `"Your father's Canadian Tire money?" She almost laughs. "Put it back before he does an audit."`;
      case 'sodium': return `"Is that from SCHOOL?" She goes white. "David. Take that back tomorrow. Do not open it. Do not put it near water. Put it on the top shelf in the garage." You've never heard her sound like that — she sounds like she knows exactly what it is.`;
      case 'soap': return ITEMS.soap.use.noreen();
      case 'treats': return `"Those are Shelby's." "I know." "...Then give them to Shelby."`;
      case 'floppy': return `"What's on it?" "I don't know yet." "Then find out first," she says. "That's the scientific method."`;
    }
  },
});

dialog('noreen_onphone', { who: 'noreen', p: 'stern', nodes: { start: { t: () => `*She's on the kitchen phone with Aunt Carol, the long cord wrapped twice around her hand, her back to you.* "...no, the line's been busy all night, Carol, I know, I KNOW—" *She sees you, puts a hand over the receiver.* Not now, David.` } } });

dialog('noreen', {
  who: 'noreen',
  p: () => Story.noreenFace(),
  start: 'start',
  nodes: {
    start: { redirect: () => {
      if (G.day === 9 && !F('wishedBday') && Story.noreenMood() !== 'stern' && !F('bdayPrompt')) { setF('bdayPrompt'); return 'bday_prompt'; }
      return 'hub';
    } },
    hub: {
      t: () => {
        const m = Story.noreenMood();
        if (has('milk') && has('cookie') && !F('noticedCarry')) { setF('noticedCarry'); return `*She notices what you're holding — her glass, her cookie — and her eyebrows go up.* You carried those all the way down here?`; }
        const ph = G.phase === 'morning' ? ['Your lunch is on the counter.', 'You\'ll be late.', 'Did you eat something?'] : G.phase === 'day' ? ['Hm?', 'Yes?', 'What is it?'] : ['What is it, David?', 'Yes?', 'Hm?'];
        if (m === 'stern') return `*She doesn't look up.* ${pick(['Yes?', 'What.', 'If this is about the phone, the answer is no.'])}`;
        if (m === 'cold') return `*She glances up, then back down.* ${pick(ph)}`;
        if (m === 'thaw') return `*She looks up.* Hi. ${pick(['What\'s up?', 'You need something?', 'Hungry?'])}`;
        return `*She smiles when she sees you — actually smiles.* ${pick(['There he is.', 'Hi, sweetheart.', 'Hello, beanpole.'])} ${G.day >= 9 && F('wishedBday') ? '' : ''}`;
      },
      ch: [
        { t: 'I brought these back down. Want to... split them?', tag: 'kind', if: () => has('milk') && has('cookie') && !F('truceDone'), go: 'truce' },
        { t: 'Mom... can you help me with my chemistry?', tag: 'ask', if: () => F('knowsPast') && !F('helpAsked'), go: 'help' },
        { t: 'I wanted to say sorry. About Thursday.', tag: 'kind', if: () => Story.apology() < 2 && !F('apolRefused_' + G.day), go: 'apol' },
        { t: 'Happy birthday, Mom.', tag: 'kind', if: () => G.day === 9 && !F('wishedBday'), go: 'bday' },
        { t: () => 'How\'s Grandma doing?', tag: 'ask', if: () => F('knowsCarol') && !F('askedGrandma'), go: 'grandma' },
        { t: 'I found your box. In the basement.', tag: 'honest', if: () => F('openedBox') && !F('talkedBox'), go: 'box_talk' },
        { t: 'What did you do — before I was born?', tag: 'ask', if: () => F('hintPast') && !F('knowsPast'), go: 'past_ask' },
        { t: 'What\'s in your cookies? Seriously.', tag: 'ask', if: () => F('examinedCookie') && !F('askedRecipe') && Story.noreenMood() !== 'stern', go: 'recipe' },
        { t: 'Do you need the phone tonight? I can stay off.', tag: 'kind', if: () => G.phase === 'evening' && !F('offeredPhone_' + G.day), go: 'phone_offer' },
        { t: 'Workers of the world, unite!', tag: 'joke', if: () => !F('commieJoke'), go: 'commie' },
        { t: 'Is this about the phone again?', tag: 'mean', if: () => Story.apology() < 1 && G.day < 4, go: 'snide' },
        { t: 'Why do you even care what I do?', tag: 'mean', if: () => Story.apology() < 1, go: 'snide2' },
        { t: 'What\'s for dinner?', tag: 'ask', if: () => G.phase !== 'morning', go: 'dinner' },
        { t: 'Never mind.', tag: 'silent', end: true },
      ],
    },

    /* ----- apology ----- */
    apol: { p: 'neutral', t: () => Story.apology() === 0 ? `*She stops what she's doing. She puts down the dishcloth, folds it once, and puts it down again.* Go on.` : `*She waits.* Go on.`,
      ch: [
        { t: 'I\'m sorry I said you don\'t do anything all day. That was a crap thing to say.', tag: 'honest', if: () => !F('apolWords'), go: 'apol_words' },
        { t: 'I\'m sorry I tied up the phone. I didn\'t know about Grandma.', tag: 'honest', if: () => F('knowsCarol') && !F('apolPhone'), go: 'apol_phone' },
        { t: 'I\'m sorry I tied up the phone.', tag: 'honest', if: () => !F('knowsCarol') && !F('apolPhoneHalf'), go: 'apol_phone_half' },
        { t: 'I\'m sorry you got so upset.', tag: 'mean', go: 'apol_non' },
        { t: 'Fine. Sorry. Okay? SORRY.', tag: 'mean', go: 'apol_sarc' },
        { t: '...Never mind.', tag: 'silent', end: true },
      ] },
    apol_words: { p: 'hurt', do: () => { setF('apolWords'); rel('noreen', 2); karma(2); },
      t: `*Something crosses her face — fast, like a car going past a window.* ...It was. *She looks at you for a long moment.* Do you know what I did today? I drove to St. Catharines and back. I paid the Bell bill. I washed and folded your laundry, which you will find on your bed, the way you have found it every week of your life. I'm not asking for a medal, David. I'm asking you not to tell me I'm nothing.`,
      ch: [{ t: 'You\'re not nothing. I know that. I knew it then.', tag: 'kind', go: 'apol_after' }, { t: 'I was angry. I wanted it to hurt.', tag: 'honest', go: 'apol_after_honest' }] },
    apol_after_honest: { p: 'hurt', do: () => rel('noreen', 1), t: `*She nods slowly.* Well. It did. *A breath.* Thank you for saying so. Most people never admit that part.`, go: 'apol_after' },
    apol_phone: { p: 'hurt', do: () => { setF('apolPhone'); rel('noreen', 2); karma(1); },
      t: `*Her hands go still.* Carol told you. *She exhales.* Mom fell on Tuesday. Her hip. They operated Friday morning, and Thursday night I was trying to reach the ward, and Carol, and the surgeon's office, and every time I picked up the phone it <i>screamed</i> at me. *She shakes her head.* I wasn't trying to ruin your night, David. I was trying to find out if my mother was going to be all right.`,
      ch: [{ t: 'I know. I\'m sorry. I should have asked why.', tag: 'honest', go: 'apol_after' }] },
    apol_phone_half: { do: () => { setF('apolPhoneHalf'); rel('noreen', 1); }, t: `*She looks at you, weighing it.* Thank you. *A pause.* You don't know why I needed it, do you. *It isn't really a question.* Maybe ask, sometime. Before the next time.`, go: 'apol_after' },
    apol_after: { redirect: () => Story.apology() >= 2 ? 'apol_full' : 'apol_partial' },
    apol_partial: { p: 'neutral', t: `*She nods. Once. It's not a hug. It's not nothing either.* Okay. Thank you, David. *She picks the dishcloth back up.* We're... we'll get there.`, end: true },
    apol_full: { p: 'warm', do: () => { if (!F('apolFullOnce')) { setF('apolFullOnce'); rel('noreen', 1); karma(1); sfx('sting_good'); } },
      t: `*She's quiet for a long moment. Then she reaches up — a long way up — and pushes your hair out of your eyes, the way she did when you were small and it was shorter and so were you.* Thank you, sweetheart. *Her voice wobbles exactly once and she gets it back.* That's... thank you.`, end: true },
    apol_non: { p: 'stern', do: () => { rel('noreen', -1); setF('apolRefused_' + G.day); }, t: `*Flat.* That's not an apology, David. That's a weather report.`, end: true },
    apol_sarc: { p: 'stern', do: () => { rel('noreen', -1); karma(-1); setF('apolRefused_' + G.day); }, t: `*She turns back to the counter.* When you mean it, I'll be here. I'm always here. Apparently that's the problem.`, end: true },

    /* ----- truce: sharing the milk & cookie ----- */
    truce: { p: 'neutral', do: () => setF('truceOffered'),
      t: () => `*She looks at the tall glass, then the cookie, then up at you — which, for her, means tipping her head way back.* You carried my sarcasm all the way back downstairs.`,
      ch: [
        { t: 'You made the cookies. You should get half.', tag: 'kind', go: 'truce2' },
        { t: 'Well — since we\'re both being childish...', tag: 'joke', go: 'truce2_joke' },
        { t: 'I don\'t want to fight anymore.', tag: 'honest', go: 'truce2' },
      ] },
    truce2_joke: { p: 'laugh', do: () => rel('noreen', 1), t: `*A laugh escapes her, surprised, like a bird out of a box.* Oh, that's — *She covers her mouth.* That's fair. That's fair.`, go: 'truce2' },
    truce2: { p: () => 'warm', do: () => { rel('noreen', 1); },
      t: () => `*She takes the cookie and breaks it in half, carefully, the way she breaks everything — exactly down the middle.* ${Story.milkSour() ? `*Then she picks up the glass, sniffs it, and recoils.* Oh, that's gone right off. *And then she's laughing — really laughing — leaning on the counter.* Three days you carried sour milk around this house? Sit down. I'll pour us fresh.` : `*She gets a second glass down from the cupboard and pours half the milk into it. Two short glasses instead of one tall one.*`} Sit.`,
      go: 'truce3' },
    truce3: { redirect: () => Story.moldInMaster() ? 'mold_pang' : Story.apology() >= 1 ? 'truce_end' : 'truce_need_apol' },
    truce_need_apol: { p: 'neutral', t: `*You sit at the island, knees up around your ears on the stool. She sits across from you. You both dunk. For a minute it's almost easy.* ...So. *She waits. She is extremely good at waiting.*`,
      ch: [
        { t: 'I\'m sorry I said you don\'t do anything all day.', tag: 'honest', do: () => { setF('apolWords'); rel('noreen', 2); karma(2); }, go: 'truce_end' },
        { t: 'I\'m sorry about the phone. I didn\'t know about Grandma.', tag: 'honest', if: () => F('knowsCarol'), do: () => { setF('apolPhone'); rel('noreen', 2); karma(1); }, go: 'truce_end' },
        { t: '*Just eat your cookie.*', tag: 'silent', go: 'truce_noapol' },
      ] },
    truce_noapol: { p: 'neutral', do: () => { setF('truceDone'); lose('milk'); lose('cookie'); rel('noreen', 1); }, t: `*You eat in silence. It's not a bad silence. It's not a good one either. When the glasses are empty, she takes them both to the sink.* Well. *She rinses them.* That was nice. *It was. It also wasn't enough, and you both know it.*`, end: true },
    truce_end: { redirect: () => F('knowsPast') ? 'truce_past' : null, p: 'warm',
      t: `*You sit at the island, your knees up around your ears on the stool. She sits across from you. You dunk at the same time without meaning to, and she notices, and you notice her noticing, and neither of you says anything. It's the best cookie you've ever had. It always was.*`,
      do: () => setF('truceReady'),
      ch: [{ t: '*Stay a while.*', tag: 'act', do: () => { lose('milk'); lose('cookie'); ending('truce'); } }] },
    truce_past: { p: 'warm', t: `*You sit at the island across from each other, dunking. And you find you want to ask her something you've never asked.*`,
      ch: [
        { t: 'Mom... what was Lakeshore like?', tag: 'ask', go: 'help_story' },
        { t: '*Just enjoy the cookie.*', tag: 'silent', do: () => { lose('milk'); lose('cookie'); ending('truce'); } },
      ] },

    mold_pang: { who: 'narrator', t: `And right in the middle of it — this, the thing you actually wanted — you think about what's under her bed. A tall glass, in the warm dark, slowly turning into something. Your mouth goes dry.`,
      ch: [
        { t: '"Mom... there\'s something under your bed. I put it there."', tag: 'honest', go: 'confess_early' },
        { t: '*Say nothing. Keep eating.*', tag: 'silent', go: 'mold_silent' },
      ] },
    mold_silent: { p: 'neutral', do: () => { karma(-2); rel('noreen', 1); setF('hidMold'); if (F('truceOffered')) { lose('milk'); lose('cookie'); setF('truceDone'); } unsetHelp(); }, t: `*"You okay? You've gone a funny colour."* "Yeah. Fine." *She looks at you a beat too long. Then she takes your glass.* The moment closes like a door. You had it — you almost had it — and you lied to her face instead, and the glass is still under her bed.`, end: true },
    confess_early: { p: 'stern', who: 'noreen', do: () => { setF('confessedEarly'); },
      t: `*She puts down the cookie.* What do you mean, "something."`,
      ch: [{ t: '"The milk and the cookie. The ones you brought me. I... mashed them up. I put it under your bed. To — I don\'t know. To get back at you."', tag: 'honest', do: () => ending('confession') }] },

    /* ----- asking for help: the best ending ----- */
    help: { p: 'neutral', do: () => setF('helpAsked'),
      t: () => `*She turns around slowly.* Chemistry. *Like the word is in a language she used to speak.* ${F('quizSigned') ? '' : 'Is this about a test?'}`,
      ch: [
        { t: 'Titration. I don\'t get it. I failed the last quiz — I got a forty-one.', tag: 'honest', do: () => setF('quizConfessed'), go: 'help2' },
        { t: 'I found your old notes. You were — you were really good at this.', tag: 'honest', if: () => F('openedBox') || has('textbook'), go: 'help2' },
      ] },
    help2: { redirect: () => Story.apology() === 0 ? 'help_needs' : Story.canTeach() ? 'help_story' : 'help_notyet' },
    help_check: { redirect: () => Story.canTeach() ? 'help_story' : 'help_notyet' },
    help_notyet: { p: 'neutral', do: () => { unsetHelp(); rel('noreen', 1); },
      t: () => `*Something in her face softens, and then, carefully, closes again.* Thank you for saying that. I mean it. *She smooths the counter with her palm.* But I can't sit at that island and play scientist with you tonight as if Thursday didn't happen. ${F('knowsCarol') ? 'Give me a little time.' : 'Not while you still don\'t know why I needed that phone so badly.'} *A beat.* Ask me again, sweetheart. I'll want you to.`, end: true },
    help_needs: { p: 'hurt', t: `*She looks at you for a long time.* I'd like to. I would. *Her voice is careful.* But three days ago you stood in this kitchen and told me I don't do anything, David. You can't skip over that and go straight to the part where I'm useful to you.`,
      ch: [
        { t: 'You\'re right. I\'m sorry. What I said was cruel, and it wasn\'t true.', tag: 'honest', do: () => { setF('apolWords'); rel('noreen', 2); karma(2); }, go: 'help_check' },
        { t: 'I didn\'t know about Grandma. I\'m sorry I tied up the phone. And for what I said.', tag: 'honest', if: () => F('knowsCarol'), do: () => { setF('apolPhone'); setF('apolWords'); rel('noreen', 3); karma(2); }, go: 'help_check' },
        { t: 'Forget it. Forget I asked.', tag: 'mean', do: () => { rel('noreen', -1); unsetHelp(); }, end: true },
      ] },
    help_story: { p: 'hurt', redirect: () => Story.moldInMaster() && !F('confessedEarly') ? 'mold_pang' : null,
      t: () => `*She sits down at the island. She's quiet for so long you think she isn't going to answer. Then:* Lakeshore Estates. Eleven years. I ran the fermentation lab. Pipettes and burettes and the smell of crushed Riesling in October — oh, David, the smell. *Her eyes are wet and she doesn't hide it.* There was a wild yeast in the Riesling block. Number four, I called it. It made the most beautiful icewine anyone had ever tasted. And when you came along I decided — I decided, nobody made me — that I wanted to be here instead. *She smiles, wobbly.* I took a little jar of number four home with me. Seventeen years I've fed it every Saturday. It's in the cookies. It's been in every cookie you've ever eaten.`,
      ch: [{ t: 'Will you show me? The titration. How you did it.', tag: 'kind', go: 'help_end' }, { t: 'You gave all that up for me?', tag: 'ask', go: 'help_gaveup' }] },
    help_gaveup: { p: 'warm', t: `*She laughs and wipes her eyes with the heel of her hand.* "Gave up." Listen to you. I didn't <i>give up</i> anything. I traded. *She reaches over and flicks your enormous ear.* Best trade I ever made. Even this week.`, go: 'help_end_q' },
    help_end_q: { p: 'warm', t: `*She sniffs, briskly, and is herself again.*`, ch: [{ t: 'Will you show me? The titration?', tag: 'kind', go: 'help_end' }] },
    help_end: { p: 'laugh', t: `*She stands up so fast the stool squeaks.* Get your textbook. And a pencil — a pencil, not a pen. And put the kettle on. *Already rolling up her cardigan sleeves.* The endpoint isn't where it changes colour, you know. It's where it <i>stays</i> changed.`,
      ch: [{ t: '*Put the kettle on.*', tag: 'act', do: () => ending('titration') }] },

    /* ----- the past ----- */
    past_ask: { p: 'neutral', do: () => { Story.learnPast('noreen'); rel('noreen', 1); },
      t: `*She blinks.* Before you were born? *A short, surprised laugh.* Nobody has asked me that in... *She sets down what she's holding.* I was a chemist, David. A real one, with a lab coat and my name on the door. I ran the fermentation lab at Lakeshore Estates — the winery, out on the Niagara Stone Road — for eleven years. *A pause.* I was good at it.`,
      ch: [{ t: 'Why did you stop?', tag: 'ask', go: 'past_why' }, { t: 'I had no idea.', tag: 'honest', go: 'past_idea' }] },
    past_why: { p: 'warm', t: `*She looks at you — all six-foot-six of you — like you're a very obvious answer to a very easy question.* Why do you think? *Then, gentler:* I wanted to be here. Nobody made me. Remember that, the next time you're tempted to tell me what I do all day.`, end: true },
    past_idea: { p: 'neutral', t: `No. Well. *She smooths the counter with her palm.* It's not the kind of thing that comes up, between "where are your shoes" and "turn that down." *A small smile.* Maybe it should have.`, end: true },
    box_talk: { p: 'hurt', do: () => { setF('talkedBox'); Story.learnPast('noreen'); rel('noreen', 1); },
      t: `*She goes very still.* The box. *She sits down.* I haven't opened that box since we moved here. I couldn't decide if it was a museum or a grave. *She takes a breath.* Did you read the notebook? The last page? *You nod.* Then you know about number four. *She smiles at the cookie jar.* It's in there. Every batch.`, end: true },
    recipe: { p: 'neutral', do: () => { setF('askedRecipe'); setF('hintPast'); },
      t: `*Her eyebrows lift.* My secret ingredient? *She considers you.* A little sourdough starter. A very old one. It has... a history. *She doesn't elaborate. She's smiling at something that isn't in the room.* Maybe I'll tell you someday.`, end: true },

    /* ----- grandma, phone, misc ----- */
    grandma: { p: 'neutral', do: () => { setF('askedGrandma'); rel('noreen', 1); karma(1); },
      t: () => `*Her face softens in a way you haven't seen all week.* ${G.day <= 1 ? 'They operated this morning. Pins in her hip. She told the surgeon his tie was ugly, so she\'s herself.' : G.day < 6 ? 'She\'s sore. She\'s cranky. She told a physiotherapist named Brent that he had "cold hands and a lazy attitude." She\'s going to be fine.' : 'They\'re moving her to rehab next week. She asked about you. She always asks about you.'} *A pause.* Thank you for asking, David.`, end: true },
    phone_offer: { p: () => Story.noreenMood() === 'stern' ? 'neutral' : 'warm', do: () => { setF('offeredPhone_' + G.day); rel('noreen', 1); karma(1); },
      t: `*She looks genuinely startled.* Oh. *A beat.* Not tonight. But — thank you. That's... thank you for asking.`, end: true },
    commie: { p: () => Story.noreenMood() === 'stern' ? 'stern' : 'laugh', do: () => setF('commieJoke'),
      t: () => Story.noreenMood() === 'stern' ? `*Without looking up:* Workers of this house, unload the dishwasher.` : `*She raises a fist without looking up.* Workers of this house, unload the dishwasher. *Then she looks at you, and there's the faintest twitch of a smile.* I was at Expo 67, you know. I've seen real communists. They had very nice pavilions.`, end: true },
    snide: { p: 'stern', do: () => { rel('noreen', -1); karma(-1); }, t: `*She sets down the dish very gently, which is worse than slamming it.* It's about a lot of things, David. The phone is the smallest one.`, end: true },
    snide2: { p: 'hurt', do: () => { rel('noreen', -2); karma(-1); }, t: `*That one lands. You watch it land.* ...Because I'm your mother. *Quietly.* That's not a choice I get to stop making.`, end: true },
    dinner: { p: 'neutral', t: () => pick([`Shepherd's pie. Your father's request.`, `Leftover lasagna. If you want it hot, the microwave works for you too, you know.`, `Chicken. Rice. A vegetable you will push to one side.`, `Pierogies. I know. Try to contain yourself.`]), end: true },
    bday_prompt: { p: 'neutral', who: 'narrator', t: `It's Saturday the 23rd. Mole Day. Her birthday. You remember this exactly now, standing in front of her.`, go: 'hub' },
    bday: { p: 'warm', do: () => { setF('wishedBday'); rel('noreen', 2); karma(1); }, t: () => `*She turns around and looks at you as if you've done a magic trick.* You remembered. *She presses her lips together.* Fifty-three. Don't tell anyone. ${F('wishedBdayGift') ? '' : 'Your father got me a card and signed it "Love, Don." Two words. He thinks he\'s being efficient.'}`, end: true },

    /* ----- returned milk / cookie ----- */
    return_milk: { p: 'neutral', t: `*You hold out the glass of milk. She looks at it.* You're giving it back. *It's not a question.* All right. *She takes it and pours it down the sink and rinses the glass and puts it in the dishwasher, and the whole time she doesn't say a word.*`, do: () => { lose('milk'); rel('noreen', -1); }, end: true },
    return_cookie: { p: 'neutral', t: `*You hold out the cookie. She looks at it for a long second.* I made those for you, you know. Before. *She takes it, and puts it back in the jar, and closes the lid.* Before.`, do: () => { lose('cookie'); rel('noreen', -1); }, end: true },
    show_mixture: { redirect: () => Story.mixFromMaster() ? 'mix_confess' : null, p: 'stern',
      t: () => Story.mixStage() >= 1 ? `*She stares at the glass. The colour drains from her face.* What. Is. That. *She backs up a step and puts her sleeve over her nose and mouth.* Take it outside. Now. No — the garbage. The <i>outside</i> garbage. And then you wash your hands, and then you tell me why my son is growing something in my good glass.` : `*She looks at the beige sludge.* You crushed the cookie into the milk. *A long sigh.* Of course you did. *She takes the glass out of your hand and dumps it into the sink and runs the water.* There. Now it's nothing.`,
      do: () => { if (Story.mixStage() >= 1) { rel('noreen', -1); } else { swap('mixture', 'glass_empty'); G.mix = null; } }, end: true },
    mix_confess: { p: 'stern', t: `*She looks at the fuzz. Then at you. Then — you see her do the math, the way she does — at the ceiling, toward her bedroom. Her hand goes to her chest.* Where did that come from, David.`,
      ch: [{ t: '"From under your bed. I put it there. I\'m sorry. I\'m so sorry."', tag: 'honest', do: () => ending('confession') }, { t: '"Nowhere. My room."', tag: 'lie', do: () => { karma(-3); rel('noreen', -1); }, go: 'mix_lie' }] },
    mix_lie: { p: 'stern', t: `*She doesn't believe you. She doesn't say so. She just says:* Get rid of it. *And then she goes upstairs and you hear her open her bedroom windows, all of them, in October.*`, end: true },

    /* ----- the quiz ----- */
    quiz: { p: 'neutral', do: () => setF('quizShown'),
      t: `*She takes the paper. She reads it — all of it, slowly, including the comments. At question one she stops.* "A small burrowing mammal." *Her mouth does something complicated.*`,
      ch: [
        { t: 'I\'m sorry. I\'m bad at this and I didn\'t want you to see.', tag: 'honest', do: () => { rel('noreen', 1); karma(1); }, go: 'quiz2' },
        { t: 'It IS a small burrowing mammal.', tag: 'joke', go: 'quiz_joke' },
        { t: 'Just sign it.', tag: 'mean', do: () => rel('noreen', -1), go: 'quiz_cold' },
      ] },
    quiz_joke: { p: 'laugh', t: `*She snorts. She actually snorts.* It is. That's why it's a terrible answer. *She shakes her head.*`, go: 'quiz2' },
    quiz_cold: { p: 'stern', t: `*She looks at you over the paper.* I'll sign it. *She does, in one clean stroke.* But I'm not just a signature, David. *She hands it back.*`, do: () => Story.signQuiz('noreen'), end: true },
    quiz2: { p: 'warm', do: () => { Story.signQuiz('noreen'); setF('hintPast'); },
      t: `*She signs it — one clean, beautiful stroke — and then, underneath, writes something else and draws a little face.* Stoichiometry, titration... *She hands it back, and for a second she looks almost shy.* I used to be quite good at this, you know.`,
      ch: [{ t: 'You did?', tag: 'ask', if: () => !F('knowsPast'), go: 'past_ask' }, { t: 'Thanks, Mom.', tag: 'kind', end: true }] },
    forged: { p: 'stern', do: () => { setF('forgeryCaughtByMom'); rel('noreen', -3); karma(-1); lose('quiz_forged'); give('quiz', true); },
      t: `*She looks at the signature for a long time. Her own name, in her own handwriting, that she did not write.* That's very good. *Very quietly.* That's very, very good, David. *She tears the bottom off the page — just the signature — folds it, and puts it in her cardigan pocket.* I'm keeping this. You can keep the rest.`, end: true },
    don_signed: { p: 'stern', t: `*She reads the signature.* Your father signed this. *A tiny pause.* Without mentioning it to me. *She hands it back.* Well. I'll be having a conversation with your father.`, do: () => rel('noreen', -1), end: true },

    /* ----- tea ----- */
    tea: { p: 'warm', do: () => { lose('tea'); setF('gaveTea'); rel('noreen', 2); karma(1); },
      t: () => `*You hold out a mug of tea. Her mug — the one with the chip. Red Rose, splash of milk, the colour of a paper bag.* ${G.f.teaMadeDay !== undefined && G.day > G.f.teaMadeDay ? '*She takes a sip. It\'s stone cold. She drinks it anyway.*' : '*She wraps both hands around it.*'} ...Well. *She looks at you over the rim.* What did you break?`,
      ch: [
        { t: 'Nothing. I just... thought you might want one.', tag: 'kind', go: 'tea2' },
        { t: 'Your trust, I think. On Thursday.', tag: 'honest', go: 'tea_apol' },
      ] },
    tea2: { p: 'warm', t: `*She takes a sip. She closes her eyes.* Perfect. You remembered the splash of milk. *A long pause.* Thank you, sweetheart.`, end: true },
    tea_apol: { p: 'hurt', t: `*She sets the mug down very carefully.* Yes. You did. *She waits.*`, go: 'apol' },
  },
});
function unsetHelp() { G.f.helpAsked = false; }

/* ---------- Noreen, sick ---------- */
dialog('noreen_sick', {
  who: 'noreen', p: 'sick',
  nodes: {
    start: { t: () => { sfx('cough'); return pick([`*Cough. Cough.* Hi, sweetheart. Don't come too close, I don't know what this is.`, `*She tries to sit up and the effort sets off a long rattling cough.* I'm fine. It's a bug. Your father's being dramatic.`, `*Her voice is a thread.* Is it Saturday? I need to feed the starter...`]); },
      ch: [
        { t: 'Mom... I think this is my fault.', tag: 'honest', if: () => F('placedMaster'), go: 'confess' },
        { t: 'Can I get you anything?', tag: 'kind', go: 'help' },
        { t: 'You\'ll be fine. It\'s just a cold.', tag: 'lie', do: () => karma(F('placedMaster') ? -1 : 0), go: 'fine' },
        { t: '*Leave her to rest.*', tag: 'silent', end: true },
      ] },
    help: { t: `Tea would be nice. And my inhaler — it's in the bathroom. *She closes her eyes.* And tell your father to stop hovering.`, end: true },
    fine: { t: () => `*She smiles without opening her eyes.* That's what Dr. Moretti said. Then he said "atypical." Doctors only say "atypical" when they're frightened. *Cough.* Go do your homework, sweetheart.`, end: true },
    confess: { t: `*She opens her eyes.* What do you mean?`,
      ch: [{ t: '"The milk and the cookie. I mashed them up and put them under your bed. To get back at you. It\'s been growing. I think — I think that\'s what\'s making you sick."', tag: 'honest', do: () => ending('confession') }, { t: '"...Nothing. Never mind."', tag: 'silent', do: () => karma(-2), end: true }] },
  },
});

/* ======================================================================
   DON
   ====================================================================== */
person('don', {
  name: 'Don', portraitBase: 'don',
  talk() { return 'don'; },
  examine() {
    return G.phase === 'day'
      ? `Your father on a Saturday: burgundy golf shirt, khakis, reading glasses pushed up on his forehead where he will later search for them. Five-foot-six, fifty-six, built like a fire hydrant. He is chalking a pool cue with the focus of a surgeon.`
      : `Your father, home from Welland: white shirt with the sleeves rolled once, tie at half-mast, his Canadian Tire Financial Services ID badge still clipped to the pocket because he forgets it's there. Five-foot-six. He has the tired, patient face of a man who has been thinking about credit card fraud for nine hours and would now like to think about the Leafs.`;
  },
  hit: `You would never. Also, Don played rugby at McMaster. Also, you would never.`,
  give(id) {
    switch (id) {
      case 'badge': return Story.returnBadge();
      case 'quiz': talk('don', 'quiz'); return null;
      case 'quiz_forged': return `You think about showing Don the forged quiz and feel your stomach drop into your shoes. You put it away.`;
      case 'milk': return `"I'm more of an O'Doul's man, Stretch," he says. "Give that back to your mother. Better yet — share it with her."`;
      case 'cookie': lose('cookie'); rel('don', 1); return `He takes the cookie and eats it in two bites. "Your mother's cookies," he says, chewing, eyes closing. "You know there's a whole story in these?" He doesn't tell it. He's chewing.`;
      case 'mixture': talk('don', Story.mixFromMaster() && Story.noreenState() !== 'well' ? 'mold_confess' : 'mold_gross'); return null;
      case 'ctmoney': lose('ctmoney'); rel('don', 1); return `He looks at the Canadian Tire money, then at you. "Were you in my drawer?" "...Yes." He takes it back and smooths it flat. "Honesty. Good. That's two-thirty-five closer to the canoe."`;
      case 'cupcake': return `"A mole," he says, studying it. "Huh. Your mother's birthday is Mole Day, you know. She always said that with a straight face. I still don't know what it means."`;
      case 'jolt': return `"Is that Jolt Cola? In my house?" He holds out his hand. You don't give it to him. He doesn't push it. Détente.`;
    }
  },
});

dialog('don', {
  who: 'don', p: () => Story.noreenState() === 'sick' || Story.noreenState() === 'hospital' ? 'stern' : 'neutral',
  nodes: {
    start: {
      t: () => {
        if (Story.noreenState() === 'sick') return `*He looks ten years older.* She won't let me take her to the hospital. Says it's a cold. It's not a cold.`;
        if (G.phase === 'day') return `*He chalks his cue and blows on the tip.* Stretch. Rack 'em?`;
        if (G.day === 1) return `*He mutes the TV, which is a sign of great respect.* Stretch. I hear there was a situation while I was in Toronto.`;
        return `*He mutes the TV.* ${pick(['Stretch. What\'s the word?', 'Hey, kiddo. Leafs are up one.', 'Hey. You eat?'])}`;
      },
      ch: [
        { t: 'Want to play pool?', tag: 'ask', if: () => G.phase === 'day' && here('don') && G.loc === 'basement', jump: 'don_pool' },
        { t: 'Mom\'s still mad at me.', tag: 'honest', if: () => Story.apology() < 2 && !F('askedDonMom'), go: 'mom' },
        { t: 'What\'s "Lakeshore"?', tag: 'ask', if: () => F('hintPast') && !F('knowsPast'), go: 'lakeshore' },
        { t: 'How did you and Mom meet?', tag: 'ask', if: () => !F('askedMeet'), go: 'meet' },
        { t: 'Dad... I think Mom\'s sick because of me.', tag: 'honest', if: () => F('placedMaster') && ['sick', 'cough'].includes(Story.noreenState()), go: 'mold_confess' },
        { t: 'How was Toronto?', tag: 'ask', if: () => G.day <= 2 && !F('askedTO'), go: 'toronto' },
        { t: 'Are the credit cards going to stop working on January 1st?', tag: 'ask', if: () => !F('askedY2K'), go: 'y2k' },
        { t: 'Workers of the world, unite.', tag: 'joke', if: () => !F('donCommie'), go: 'commie' },
        { t: 'It\'s Mom\'s birthday Saturday, right?', tag: 'ask', if: () => G.day >= 4 && G.day < 9 && !F('askedDonBday'), go: 'bday' },
        { t: 'Never mind.', tag: 'silent', end: true },
      ] },
    mom: { do: () => { setF('askedDonMom'); setF('hintPast'); rel('don', 1); },
      t: `*He takes off his glasses and rubs his eyes.* I heard. You told her she doesn't do anything all day. *He lets that sit there.* Stretch. Your mother has a degree I couldn't pronounce in 1975. She ran a lab. People out in the vineyards still talk about her. And she put it all down — her choice, I want to be clear, her choice — to raise a kid who is currently six foot six and painting his bedroom the colour of a stop sign. *He puts his glasses back on.* Ask her about Lakeshore sometime. Then apologise. In that order, or the other order. Just do both.`, end: true },
    lakeshore: { do: () => { Story.learnPast('don'); rel('don', 1); },
      t: `*He smiles at nothing.* Lakeshore Estates. The winery out past Virgil. Your mother was the lab chemist there — eleven years. I was the junior loan officer at the Commerce, sent out to approve their expansion in '78. She found a mistake in my amortisation table in front of the owner. *He laughs.* I married her two years later at the winery. There's a box in the basement she's never unpacked. N.A. — LAB. Don't tell her I told you.`, end: true },
    meet: { do: () => { setF('askedMeet'); setF('hintPast'); rel('don', 1); }, t: `*He gets a look on his face you've never seen.* I was twenty-six. Bank sent me to a winery to look at their books. Your mother came out of the lab in safety goggles and corrected my math. In front of my boss. *He shakes his head, fondly.* I asked her to dinner to get revenge. Twenty years later, here we are. Still getting revenge.`, end: true },
    toronto: { do: () => setF('askedTO'), t: `Card Services conference at the Royal York. Three days of PowerPoint about Y2K and a keynote speaker who'd climbed Everest. They gave us a stress ball shaped like a credit card. *He produces it from his pocket and squeezes it.* It doesn't help.`, end: true },
    y2k: { do: () => setF('askedY2K'), p: 'stern', t: `*A long, haunted sigh.* We have spent two years and eleven million dollars on Y2K remediation. Every line of COBOL in Welland has been checked by three people. If a single Canadian Tire card fails to swipe on January first, I will personally be on the six o'clock news. *He stares at the TV.* So, no. They will work. They have to work.`, end: true },
    commie: { do: () => setF('donCommie'), p: 'warm', t: `*He raises his beer can.* Solidarity. *Sips.* You know, I was a Trudeau man in '68. Went to the rally at Nathan Phillips Square. Grew my hair out. *A pause.* Then I got a mortgage.`, end: true },
    bday: { do: () => setF('askedDonBday'), t: `Saturday the twenty-third. Fifty-three. *He frowns.* I got her a card. *He thinks about it.* I should probably write something in the card. *He thinks about it more.* "Love, Don" is something.`, end: true },
    quiz: { p: 'stern', t: `*He reads the quiz. Forty-one percent. He reads the comments. "A small burrowing mammal." He takes off his glasses.* ...Stretch.`,
      ch: [
        { t: 'Can you just sign it? Please? Don\'t tell Mom.', tag: 'ask', go: 'quiz_sign' },
        { t: 'Should I show Mom?', tag: 'honest', go: 'quiz_mom' },
      ] },
    quiz_sign: { p: 'neutral', do: () => { Story.signQuiz('don'); rel('don', 0); }, t: `*He sighs the sigh of a man signing a document he knows will come back to haunt him.* Fine. *He signs it in his big blocky executive scrawl.* But I'm writing "talk to your mother" under it, and I want you to do it.`, end: true },
    quiz_mom: { p: 'warm', do: () => { setF('hintPast'); rel('don', 1); }, t: `*He hands it back without signing it.* Show your mother. Trust me. *He taps the word "titration."* Of all the people in Niagara to fail this in front of, you picked the son of the one who'd actually enjoy fixing it.`, end: true },
    mold_gross: { p: 'stern', t: `*He leans away from the glass.* Good Lord. What is that, a science project? *He waves a hand.* Whatever it is, it does not live in this house. Out. Garbage. Then wash your hands, and then wash them again.`, end: true },
    mold_confess: { p: 'stern', t: `*He goes very quiet.* Say that again.`,
      ch: [{ t: '"I put the milk and the cookie under your bed. Mashed up. Two weeks ago. It\'s been growing. Dad — I think it\'s what\'s making her sick."', tag: 'honest', do: () => { setF('confessedToDon'); ending('confession'); } }, { t: '"Nothing. Forget it."', tag: 'silent', do: () => karma(-2), end: true }] },
  },
});

dialog('don_pool', {
  who: 'don', p: 'warm',
  nodes: {
    start: { do: () => sfx('pool'), t: `*He racks the balls with a little wooden triangle and a lot of ceremony.* You break. Don't hit the ceiling tile again.`,
      ch: [{ t: '*Break gently.*', tag: 'act', go: 'b1' }, { t: '*Break like you mean it.*', tag: 'act', go: 'b2' }] },
    b1: { do: () => sfx('pool'), t: `*The cue ball rolls up and taps the rack apologetically. One ball wobbles.* That's a very polite break, Stretch. Very Canadian.`, go: 'talk' },
    b2: { do: () => sfx('pool'), t: `*CRACK. Balls everywhere. The four goes in. Your cue hits the wall behind you and leaves a mark next to the other marks.* Ha! *Don is delighted.* There he is.`, go: 'talk' },
    talk: { t: () => F('knowsPast') ? `*He lines up a shot.* Your mother tells me you've been asking about the old days.` : `*He lines up a shot, tongue between his teeth.* So. You and your mother.`,
      ch: [
        { t: 'Tell me about Mom. Before me.', tag: 'ask', if: () => !F('knowsPast'), go: 'story' },
        { t: 'Why\'d she never talk about it?', tag: 'ask', if: () => F('knowsPast'), go: 'why' },
        { t: 'How do you always know what to say to her?', tag: 'ask', go: 'advice' },
        { t: '*Just play.*', tag: 'silent', go: 'end' },
      ] },
    story: { do: () => { Story.learnPast('don'); rel('don', 1); sfx('pool'); }, t: `*Click. The six drops.* She was the lab chemist at Lakeshore Estates. Eleven years. Discovered some wild yeast in one of the vineyards — number four, she called it — that made icewine that won medals in Germany. In <i>Germany</i>, Stretch. *Click. Miss.* She still keeps a jar of it in the fridge. Puts it in the cookies. Seventeen years. You've been eating award-winning science your whole life and complaining it was "weird."`, go: 'end' },
    why: { t: `*He leans on his cue.* Because nobody asked, I think. And because when she tells it, she has to decide again whether it was worth it. *He looks at you over his glasses.* It was. She says so. But it's not nothing, to have to decide that again.`, go: 'end' },
    advice: { do: () => rel('don', 1), t: `*He actually laughs.* Know what to say? Kiddo, I've been married twenty years. I don't know what to say. I know what to <i>do</i>. I make her tea, I say I'm sorry first, even when I'm only forty percent wrong, and I ask her about her day like I want to know the answer. *Click.* Because I do. That's the trick. You have to actually want to know.`, go: 'end' },
    end: { do: () => sfx('pool'), t: () => pick([`*He sinks the eight off two rails and turns to you with both arms raised like Gretzky.* And the crowd goes WILD.`, `*He scratches on the eight and swears very mildly.* Fudge. Best of three?`, `*You sink the eight by accident. He stares at you.* That was an accident. *"Yeah."* I'm telling everyone it wasn't.`]), end: true },
  },
});

/* ======================================================================
   GREG (in person)
   ====================================================================== */
person('greg', {
  name: 'Greg', portraitBase: 'greg',
  talk() { return 'greg'; },
  examine: () => `Greg: six-foot-three, two hundred and ninety pounds, the starting left tackle for the NDSS senior football team — a position he was drafted into in Grade 9 by a coach who saw him walk down a hallway. Small round wire glasses, blond buzz cut, a slightly-too-tight T-shirt with the U.S.S. Enterprise on it under a red flannel. His binder has a Starfleet insignia drawn on it in silver pen. He is gently, devastatingly kind, and he is the smartest person you know. He's your best friend, though neither of you has ever said so.`,
  hit: () => { rel('greg', -1); return `You punch Greg in the arm. It's like punching a refrigerator that's been upholstered. "Ow?" he says. "I think? Are we doing a bit?"`; },
  give(id) { return Story.giveGreg(id); },
});

dialog('greg', {
  who: 'greg', p: 'neutral',
  nodes: {
    start: { t: () => pick([`*He pushes his glasses up with one enormous finger.* What's up, comrade?`, `Hey. *Whispering, which for Greg is a normal person's speaking voice.* What's up?`, `*He looks up from a page of perfectly colour-coded notes.* Yo.`]),
      ch: [
        { t: 'My mom and I had a fight. A bad one.', tag: 'honest', if: () => !F('toldGregFight'), go: 'fight' },
        { t: 'What should I do about my mom?', tag: 'ask', if: () => F('toldGregFight'), go: 'advice' },
        { t: 'Remember the milk and cookies? I did something.', tag: 'honest', if: () => (exists('mixture') || has('petri_culture')) && !F('toldGregMold_' + Story.mixWhere()), go: 'mold' },
        { t: 'I failed the quiz. Forty-one.', tag: 'honest', if: () => !F('toldGregQuiz'), go: 'quiz' },
        { t: 'Where would I get a petri dish?', tag: 'ask', if: () => !F('askedPetri') && !has('petri') && !has('petri_culture'), go: 'petri' },
        { t: 'My mom used to be a chemist. At a winery.', tag: 'honest', if: () => F('knowsPast') && !F('toldGregPast'), go: 'past' },
        { t: 'How are you doing? Like, actually?', tag: 'kind', if: () => !F('askedGregDad'), go: 'dad' },
        { t: 'Is The Matrix actually real, do you think?', tag: 'joke', if: () => !F('gregMatrix'), go: 'matrix' },
        { t: '*Go back to the lesson.*', tag: 'silent', end: true },
      ] },
    fight: { p: 'worried', do: () => { setF('toldGregFight'); rel('greg', 1); },
      t: `*He swivels on his stool, which creaks in protest.* Oh no. What happened? *You tell him: the phone, the modem, the cord, what you said.* ...Dude. *He takes off his glasses, cleans them on his flannel, puts them back on.* You said she doesn't do anything? <i>Your</i> mom? Your mom corrected Mr. Kowalski's grammar at the Grade 7 science fair. With a red pen. Out loud. She's terrifying. In a good way.`,
      ch: [{ t: 'She brought me milk and cookies after. Sarcastically.', tag: 'honest', go: 'fight2' }, { t: 'She deserved it.', tag: 'mean', go: 'fight_mean' }] },
    fight2: { p: 'neutral', t: `*He thinks about this with his whole face.* Okay, but — sarcastic milk and cookies is still milk and cookies, man. My mom's version of sarcastic is throwing a Pop-Tart at my head. *Gently.* You gotta apologise. A real one. Not "sorry you're upset." My mom says that's not an apology, that's a weather report.`, end: true },
    fight_mean: { p: 'sad', do: () => rel('greg', -1), t: `*He looks at you for a long time, sadly, like a large disappointed golden retriever.* Nobody deserves that, David. *Quietly.* Not even you, and you're kind of being a jerk right now.`, end: true },
    advice: { p: 'neutral', t: () => Story.gregAdvice(), end: true },
    mold: { p: 'worried', do: () => setF('toldGregMold_' + Story.mixWhere()), redirect: () => Story.mixWhere() === 'underbed_master' || Story.mixWhere() === 'master' ? 'mold_master' : (has('petri_culture') ? 'mold_culture' : 'mold_safe') },
    mold_master: { p: 'worried', do: () => { setF('gregWarned'); karma(-1); },
      t: `*You tell him. All of it. Under your parents' bed.* ...DUDE. NO. *Several people turn around. He lowers his voice to merely loud.* David. Milk plus starch plus whatever's in your mom's cookies, in a warm dark room with carpet — that's an incubator. Some moulds put mycotoxins in the air. Your mom has asthma! You told me she has asthma! *He grabs your sleeve with a hand the size of a catcher's mitt.* Take it out. Tonight. Please. If you want to grow something, grow it in a dish, in your room, like a scientist. Not like a — like a supervillain.`, end: true },
    mold_safe: { p: 'excited', do: () => { setF('gregSciIdea'); rel('greg', 1); },
      t: `*His eyes go huge behind his glasses.* Wait wait wait. Your mom's cookies have that weird sour thing, right? Like sourdough? *He's almost bouncing.* That's a wild culture, man. Something's living in there. If you mash that up with milk and let it go... *He grabs his binder.* Okay. Don't get weird about it. Get a petri dish from Van Dyk's cabinet, smear some on, keep it somewhere warm and dark — your room, NOT anywhere else — and in a few days bring it in. Fleming, dude. FLEMING.`, end: true },
    mold_culture: { p: 'excited', t: `*You show him the dish.* Oh. Oh, that's — *he holds it up to the window* — look at the halo around the colonies. Nothing's growing near it. That's what penicillin does. Show Van Dyk. Show him right now.`, end: true },
    quiz: { p: 'neutral', do: () => { setF('toldGregQuiz'); rel('greg', 1); setF('gregNotes'); }, t: `*He winces with you.* Forty-one's rough. Okay. Okay. I'm making colour-coded notes for the unit test. You get a copy. That's non-negotiable. *A pause.* Also — and don't get mad — isn't your mom, like, a science person? She talked to my mom about pH for an hour at a barbecue once. My mom still brings it up.`, end: true },
    petri: { p: 'neutral', do: () => setF('askedPetri'), t: `Van Dyk's supply cabinet, front of the room, second shelf. They're poured with agar for next semester's bio classes. He doesn't count them. *He squints at you.* Why? What are you growing? Is it a science thing? Tell me it's a science thing.`, end: true },
    past: { p: 'excited', do: () => { setF('toldGregPast'); rel('greg', 1); }, t: `*He stares at you.* Wait. Your mom was a <i>winery chemist</i>? Like a fermentation scientist? In NIAGARA? Dude, that's — that's like being a... a rocket scientist in Florida. *He's thinking hard.* You know Van Dyk is obsessed with that stuff. And titration is literally how they test wine acidity. *He points at you.* You have a titration expert living in your house and you've been asking ME?`, end: true },
    dad: { p: 'sad', do: () => { setF('askedGregDad'); rel('greg', 2); karma(1); }, t: `*He's quiet for a second.* My dad moved to Hamilton in July. He calls on Sundays. Mostly. *He fiddles with his calculator.* It's fine. It's — you know what's weird? I'd give anything to have a fight with him. Like, a real one, in the same house, where you're mad and then you get over it. *He shrugs, huge shoulders rising and falling.* At least your mom's still in the kitchen to be mad at, you know?`, end: true },
    matrix: { p: 'excited', do: () => setF('gregMatrix'), t: `*He lights up.* Okay so I've seen it six times, and the thing nobody talks about is: if the machines needed human body heat for power, they'd be violating the second law of thermodynamics. It's a plot hole. I wrote to Warner Bros. *Proudly.* They sent me a poster.`, end: true },
  },
});

/* ======================================================================
   MR. VAN DYK
   ====================================================================== */
person('vandyk', {
  name: 'Mr. Van Dyk', portraitBase: 'vandyk',
  talk() { return 'vandyk'; },
  examine: `Mr. Van Dyk: tall, thinning reddish hair, a moustache like a push broom, white lab coat over a brown sweater vest, safety goggles permanently parked on his forehead. He has taught chemistry at NDSS since 1979 and still gets genuinely excited every time something turns pink.`,
  hit: () => { setF('kaboomWhere', 'teacher'); return `You raise your hand to — no. You lower it. Mr. Van Dyk sees, and raises one magnificent eyebrow. "Question, David?"`; },
  give(id) { return Story.giveVanDyk(id); },
});
dialog('vandyk', {
  who: 'vandyk', p: 'neutral',
  nodes: {
    start: { t: () => pick([`*He turns from the board, chalk in hand.* Ah — David. Question?`, `Yes, Mr. — David. Yes?`, `*He peers at you over his goggles.* You have the look of a man with a question.`]),
      ch: [
        { t: 'Could I have a petri dish? For a project.', tag: 'ask', if: () => !has('petri') && !has('petri_culture') && !F('vdPetri'), go: 'petri' },
        { t: 'Can I hand in my quiz?', tag: 'ask', if: () => (has('quiz') || has('quiz_signed') || has('quiz_forged')) && !F('quizIn'), go: 'quiz' },
        { t: 'What did you mean about Fleming? "That\'s funny"?', tag: 'ask', if: () => G.day >= 11, go: 'fleming' },
        { t: 'My mom used to work at Lakeshore Estates. In the lab.', tag: 'honest', if: () => F('knowsPast') && !F('toldVD'), go: 'lakeshore' },
        { t: 'Why do you still get excited when it turns pink?', tag: 'ask', if: () => !F('askedPink'), go: 'pink' },
        { t: 'Nothing. Sorry.', tag: 'silent', end: true },
      ] },
    petri: { t: `*He studies you.* For what?`, ch: [
      { t: 'I want to culture something. My mom\'s sourdough starter, kind of. Mixed with milk.', tag: 'honest', do: () => { give('petri'); setF('vdPetri'); }, go: 'petri_yes' },
      { t: 'Extra credit.', tag: 'lie', do: () => { give('petri'); setF('vdPetri'); }, go: 'petri_ok' }] },
    petri_yes: { p: 'neutral', t: `*His moustache lifts in what might be a smile.* A wild culture. Ha. Good man. *He slides a plate across the bench.* Keep it warm and dark, keep the lid on, don't sniff it, and bring me what grows. That's how all the good stuff starts.`, end: true },
    petri_ok: { t: `*He hands you one, sceptical.* Extra credit requires actual credit, David. Bring me results.`, end: true },
    quiz: { redirect: () => has('quiz_signed') ? 'q_signed' : has('quiz_forged') ? 'q_forged' : 'q_unsigned' },
    q_signed: { do: () => { lose('quiz_signed'); setF('quizIn'); setF('quizHonest'); }, t: () => `*He takes it, reads the signature, reads the note underneath.* Good. *He looks up at you, and it's almost kind.* ${F('quizSignedBy') === 'noreen' ? '"We\'ll fix this together." I like your mother already.' : '"Talk to your mother." Hm. Wise man, your father.'}`, end: true },
    q_forged: { do: () => { lose('quiz_forged'); setF('quizIn'); setF('forgedIn'); karma(-1); }, t: `*He takes it, glances at the signature, files it.* Thank you, David. *He doesn't look at it twice.* I'll be seeing your parents Thursday night, I hope.`, end: true },
    q_unsigned: { p: 'angry', t: `*He glances at the empty line.* Signed, David. By a parent. Not by you. Not by Greg. *Greg, behind you, holds up both hands.* By Friday.`, end: true },
    fleming: { t: `*He sits on the edge of the bench, delighted to be asked.* Most people, when they find something growing where it shouldn't, say "gross" and throw it out. Fleming said "that's funny" and looked closer. *He taps his temple.* The difference between a disaster and a discovery, David, is very often just whether you're paying attention — and whether you're honest about what you find.`, end: true },
    lakeshore: { p: 'neutral', do: () => setF('toldVD'), t: () => F('vdMetMom') ? `*He beams.* I know! I met her on Thursday! Noreen ASHBY. We talked for forty minutes about titration curves and the other parents started to queue. Strain number four! I wrote a paper about that icewine in 1983 — from the outside, of course, I never got into the lab. *He shakes his head.* Do you know how lucky you are?` : `*He stops.* Lakeshore? In the lab? *He looks at you very carefully.* Not — Noreen Ashby? *You nod.* Strain number four? *He sits down on his stool.* David. Your mother is a minor legend. I wrote a paper about that icewine in 1983. You have a titration expert in your <i>kitchen</i>.`, end: true },
    pink: { do: () => setF('askedPink'), t: `*He considers this seriously.* Because it's the moment the thing you couldn't see becomes the thing you can't miss. Every time. *He shrugs.* Twenty years, and the last drop still gets me.`, end: true },
  },
});

/* ======================================================================
   SHELBY
   ====================================================================== */
person('shelby', {
  name: 'Shelby', portraitBase: 'shelby',
  talk() { return 'shelby'; },
  examine: () => `Shelby: a Pembroke Welsh Corgi, red and white, twenty-six pounds, with ears like satellite dishes — a shared trait, Greg likes to point out. Shelby has short legs, a fluffy white chest, no tail to speak of, and an opinion about every leaf, car, and cloud in the Niagara Region, which he delivers at volume. ${F('shelbyLoves') ? 'He looks at you with total, uncomplicated adoration.' : 'He is looking at you like you might have food.'}`,
  hit: () => { karma(-1); return `You raise your hand. Shelby looks up at you with complete, uncomplicated trust, wagging the stump where his tail should be. You lower your hand and crouch down and scratch his ears instead. What is wrong with you this week?`; },
  give(id) {
    switch (id) {
      case 'treats': return Story.shelbyTreat();
      case 'ball': return Story.shelbyFetch();
      case 'cookie': case 'crumbs': case 'cupcake': return Story.shelbyChocolate(id);
      case 'milk': return Story.shelbyMilk();
    }
    return `Shelby sniffs ${theItem(id)} thoroughly, sneezes, and looks at you as if to say: <i>and?</i>`;
  },
});
dialog('shelby', {
  who: 'shelby', p: () => F('shelbyLoves') ? 'happy' : 'neutral',
  nodes: {
    start: { do: () => sfx('yap'), t: () => pick(['*YAP. YAP YAP. YAP.*', '*Shelby barks once, then sits, expectant.*', '*Shelby spins in a circle and yaps at his own back end.*']),
      ch: [
        { t: 'Who\'s a good boy?', tag: 'kind', go: 'good' },
        { t: 'Shelby, what should I do about Mom?', tag: 'ask', go: 'advice' },
        { t: 'Sit.', tag: 'act', go: 'sit' },
        { t: 'Workers of the world, unite!', tag: 'joke', go: 'commie' },
        { t: 'Bye, Shelby.', tag: 'silent', end: true },
      ] },
    good: { p: 'happy', do: () => sfx('yap'), t: `*Shelby is. Shelby is a good boy. Shelby communicates this with his entire body, which wiggles from the ears backward.*`, end: true },
    advice: { who: 'narrator', t: () => pick([`Shelby considers your question gravely, then lies down on your feet. You think the advice is: be near her. Also: food.`, `Shelby looks at the patio door, toward the kitchen, where Noreen is. Then back at you. Then at the door again. Dogs aren't subtle.`, `Shelby licks your hand. It's not advice, exactly. It's better.`]), end: true },
    sit: { who: 'narrator', t: () => pick([`Shelby lies down. Close enough.`, `Shelby sits, then immediately stands, then sits, then barks. He's covering all his bases.`, `Shelby looks at you with an expression that says he knows the word "sit" and has chosen freedom.`]), end: true },
    commie: { who: 'narrator', do: () => sfx('bark'), t: `Shelby, a Welsh Corgi — historically a herding dog of the working class — howls in solidarity. Somewhere a neighbour's dog joins in. The revolution has begun, and it is very loud.`, end: true },
  },
});

/* ======================================================================
   PHONE
   ====================================================================== */
person('ruth', { name: 'Grandma Ruth' });
person('carol', { name: 'Aunt Carol' });
person('phone', { name: 'Telephone' });
dialog('phone', {
  who: 'narrator',
  nodes: {
    start: { do: () => sfx('dialtone'), t: () => `You lift the receiver. ${Computer.online() ? 'Instead of a dial tone, the modem SCREAMS in your ear. You are on the internet. You are on the phone. You cannot be both. You hang up, ears ringing.' : 'Dial tone: that flat, patient hum.'}`,
      ch: () => Computer.online() ? [] : [
        { t: 'Call Greg (468-2290)', tag: 'act', go: 'greg' },
        { t: 'Call St. Catharines General — Grandma\'s room', tag: 'act', if: () => F('sawCalendar') || F('knowsCarol'), go: 'ruth' },
        { t: 'Call Pizza Pizza (967-11-11)', tag: 'act', go: 'pizza' },
        { t: 'Call the talking clock', tag: 'act', go: 'clock' },
        { t: 'Hang up', tag: 'silent', end: true },
      ] },
    greg: { do: () => sfx('dtmf'), t: () => G.phase === 'morning' ? `*Ring... ring...* Greg's mom answers: "He's in the shower, hon. You'll see him at school!"` : `*Ring... ring...* Greg's mom answers, cheerful: "Hi David! GREG! PHONE!" A thunderous approach down stairs. "Yo! Why are you calling? You never call. Did your modem die? Is it the Y2K? Is it early?" You talk for a while. It's nice to hear a voice.`, do2: null, end: true },
    ruth: { do: () => { sfx('dtmf'); setF('calledRuth'); Story.learnPast('ruth'); karma(1); }, t: `*Ring... ring...* "Fourth floor, Ortho." "Ruth Ashby's room, please?" ...Click. "Hello?" The voice is thin but crisp as a cracker. "Grandma? It's David." "<i>David!</i> Well! The tall one! Are you calling to see if I'm dead?" "No—" "I'm not. The physiotherapist is an idiot named Brent." She asks about school. You tell her about the quiz. There's a long pause, and then she laughs and laughs. "Chemistry! Oh, that's rich. Have you asked your mother? Your mother was the smartest girl in the Niagara Peninsula. She had a laboratory, David, with her own name on the door. She gave it all up for you, and she'd do it again in a heartbeat, and she'd never in a million years tell you so. So I'm telling you." A cough. "Now go and be nice to her. That's an order from a woman with a titanium hip."`, end: true },
    pizza: { do: () => sfx('dtmf'), t: `*Nine-six-seven, eleven-eleven.* "Pizza Pizza, can I have your phone number?" You panic and hang up. You have no money. You have Canadian Tire money, at best. The jingle plays in your head for the next hour.`, end: true },
    clock: { do: () => sfx('dtmf'), t: () => `"At the tone, the time will be... ${G.phase === 'morning' ? 'seven' : G.phase === 'day' ? 'two' : 'nine'}... ${pick(['fourteen', 'thirty-two', 'forty-seven'])}... and ${pick(['ten', 'twenty', 'forty'])} seconds." *Beep.* It's comforting, the talking clock. It always knows exactly where it is.`, end: true },
  },
});

/* ======================================================================
   OPENING — Noreen at the den door
   ====================================================================== */
dialog('opening', {
  who: 'noreen', p: 'sarcastic',
  nodes: {
    start: { who: 'narrator', t: `Footsteps on the stairs. Measured, precise, the footsteps of a woman who irons pillowcases. The den door swings open without a knock.`, go: 'n1' },
    n1: { t: `Knock knock. *She does not knock.* *She has a tall glass of milk in one hand and a chocolate chip cookie on a saucer in the other, and an expression of tremendous, weaponised calm.*`, go: 'n2' },
    n2: { t: `Well. Since you've decided to act like you're six years old tonight... *She sets the glass down beside the keyboard. Then the cookie, on its little saucer, with a click.* ...would you like some milk and cookies? Hm? Since you're going to be so <i>childish</i>.`,
      ch: [
        { t: 'Gee, thanks, Mom. Should I get my blankie, too?', tag: 'mean', do: () => { rel('noreen', -1); karma(-1); setF('openTone', 'mean'); }, go: 'r_mean' },
        { t: '*Say nothing. Stare at the monitor.*', tag: 'silent', do: () => setF('openTone', 'silent'), go: 'r_silent' },
        { t: 'I\'m not hungry. Take them back.', tag: 'mean', do: () => setF('openTone', 'defiant'), go: 'r_defiant' },
        { t: '...Thanks.', tag: 'kind', do: () => { rel('noreen', 1); karma(1); setF('openTone', 'soft'); }, go: 'r_soft' },
      ] },
    r_mean: { p: 'stern', t: `Your blankie is in a box in the basement with the rest of your childhood. *Ice.* Enjoy your cookie.`, go: 'n3' },
    r_silent: { p: 'stern', t: `*She waits exactly three seconds.* Right. The silent treatment. Very mature. Very Soviet.`, go: 'n3' },
    r_defiant: { p: 'stern', t: `They're yours. Do whatever you like with them. *A thin smile.* You usually do.`, go: 'n3' },
    r_soft: { p: 'hurt', t: `*That stops her. For a second she almost says something else. You can see it come up and get swallowed.* ...You're welcome.`, go: 'n3' },
    n3: { p: 'stern', t: `I've plugged the phone back in. Carol is supposed to call about Mom tonight, and if I pick up that phone and hear that machine screeching at me <i>one more time</i>, David, so help me, I will throw it off the balcony. *She turns to go, then turns back.* Your father's home tomorrow night. You can explain to him why I couldn't use my own telephone in my own house.`, go: 'n4' },
    n4: { who: 'narrator', t: `She leaves. The door doesn't quite slam. You hear her go down the stairs — fourteen steps, measured, precise — and then the kitchen tap, running hard. The milk is cold. The cookie is still warm. On the monitor, the cursor blinks.`, end: true },
  },
});
