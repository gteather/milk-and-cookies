# Milk & Cookies — A Garrison Village Adventure

A first-person, point-and-click adventure in the spirit of *Shadowgate* and *Uninvited*, set in Niagara-on-the-Lake, Ontario, in October 1999.

You are **David**: seventeen, 6'6", 140 lbs, uneven ears, a bedroom painted communist red, and a 1996 Gateway 2000 with a Zoltrix modem. Forty minutes ago you had a fight with your mother, Noreen. Now she's at the den door with a tall glass of milk and a chocolate chip cookie: *"Would you like some milk and cookies, since you're going to be so childish?"*

What you do with them is up to you.

## How to play

**Open `index.html` in any modern browser** (Chrome, Edge, Firefox, Safari). No server or install needed; double-clicking the file works.

`MilkAndCookies_standalone.html` is the same game packed into one ~11 MB file, handy for emailing or putting on a USB stick.

- **Verbs:** Examine, Take, Open, Close, Operate, Speak, Consume, Hit, Leave, Go. Pick a verb, then click something in the picture, in your inventory, or the **Self** button.
- **Operate** uses things on other things: choose *Operate*, click an inventory item, then click the target.
- **Leave** puts an item down wherever you are, including under beds.
- Clicking with no verb examines things, walks through doors and talks to people. Right-click examines.
- Keys: `E T O C U S F H L G` for the verbs, `Space` to show hotspots, `Backspace` to step back, `M` to mute, `1–9` for dialogue choices, `Esc` for the menu.
- The game autosaves. There are also three manual save slots.

### Time
- Leave for school through the **front door** on a weekday morning. You can go once a day, and school means Room 214, Grade 11 Chemistry, next to Greg.
- You can only go to **bed** (in your room) on a weekend or after you've been to school.
- The story runs from Thursday, October 14 to Halloween. Some things take days. Some things *grow*.

### The computer
The Gateway in the den is a working little Windows 98: dial-up (mind the phone line), ICQ with Greg, Netscape and a 1999 web, Hotmail, Winamp, Notepad (which prints to the DeskJet), Minesweeper, and whatever is on that old floppy disk.

## Endings
There are 13. Some take two weeks; some take one bad idea. After a bad one you can always **Undo**. Endings you've found are tracked on the title screen.

## Credits & notes
- Story, design, code, music and sound: written for this project. Every sound effect and piece of music is synthesized live with the Web Audio API, so there are no audio files.
- Background, character and ending art was generated with Google Gemini 3 Pro Image; item icons with Gemini 3.1 Flash Image (via OpenRouter). Hotspots were located with Gemini vision and checked by hand.
- Fonts: Silkscreen, Spectral and VT323 (SIL Open Font License), bundled locally.
- "L'Internationale" (De Geyter, 1888) and "O Canada" (Lavallée, 1880) are public-domain melodies.
- Brand names (Gateway 2000, Zoltrix, ICQ, Netscape, Hotmail, Winamp, Canadian Tire) appear as period flavour. All characters and events are fictional.

## Project layout
```
index.html                 the game (open this)
MilkAndCookies_standalone.html   single-file build
css/  js/  assets/         styles, engine + content, art/fonts
tools/                     art generation, hotspot detection, bundler, tests (not needed to play)
```
Rebuild the standalone file with `python3 tools/bundle.py`.
