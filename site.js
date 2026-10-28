// Edison website: two globes (hero and demo), the scripted "Try him" demo with made-up data, sound cue buttons,
// and the waitlist form (not wired to any service yet; nothing leaves the page).
import { mountGlobe } from './edison-globe.js';

const $ = (s) => document.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

let hero = null, ed = null;
try { hero = mountGlobe($('#heroGlobe')); ed = mountGlobe($('#demoGlobe')); } catch (e) { /* no WebGL: the page still works */ }
const mood = (m) => { try { ed && ed.setMood(m); } catch (e) {} };

// ------------------------------------------------------------ sound
let soundOn = true, voiceOn = true;
// Edison's picks on the real board: heard = rising pair, thinking = shimmer, ready = bloom, team done = wind chime
const CUE = { heard: 'b', thinking: 'c', ready: 'c', done: 'b' };
const cue = (m) => { if (soundOn && window.edisonCue) window.edisonCue(m, CUE[m], 0.9); };

function toggle(btn, on, label) { btn.setAttribute('aria-pressed', on); btn.textContent = label + (on ? ' on' : ' off'); }
$('#soundKey').onclick = () => { soundOn = !soundOn; toggle($('#soundKey'), soundOn, 'Sound cues'); };
$('#voiceKey').onclick = () => { voiceOn = !voiceOn; toggle($('#voiceKey'), voiceOn, 'His voice'); if (!voiceOn) stopVoice(); };

// His real voice: clips made by his own Kokoro voice (render-voice-lines-offline.py), listed in voice/lines.json, played
// through the same "Assistant" finish as the board (edison-voice-fx.js). With no clip, he falls back to captions only.
const VOICE = { ctx: null, list: null, bufs: {}, src: null };
fetch('voice/lines.json').then((r) => (r.ok ? r.json() : null)).then((j) => {
  if (!j) return;
  VOICE.list = Object.fromEntries(j.lines.map((l) => [l.id, l]));
  $('#voiceNote').textContent = "This is Edison's real voice, made on Graham's PC by his own local voice engine. Captions are always on.";
}).catch(() => {});
function vctx() {
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  if (!VOICE.ctx) VOICE.ctx = new AC();
  if (VOICE.ctx.state === 'suspended') VOICE.ctx.resume();
  return VOICE.ctx;
}
function clip(id) {
  const l = VOICE.list && VOICE.list[id], c = vctx();
  if (!l || !c) return Promise.resolve(null);
  if (!VOICE.bufs[id]) VOICE.bufs[id] = fetch(l.file).then((r) => r.arrayBuffer()).then((b) => c.decodeAudioData(b)).catch(() => null);
  return VOICE.bufs[id];
}
function preloadVoice() { if (VOICE.list) Object.keys(VOICE.list).forEach(clip); }
function stopVoice() { const s = VOICE.src; VOICE.src = null; if (s) { try { s.stop(); } catch (e) {} } }
// Play a clip with no captions (his name during the opening). Resolves when it ends, or at once without a clip.
function playClip(id) {
  if (!voiceOn) return Promise.resolve();
  return clip(id).then((buf) => new Promise((done) => {
    if (!buf) return done();
    const c = vctx(), src = c.createBufferSource(); src.buffer = buf;
    (window.EdisonVoiceFX ? window.EdisonVoiceFX.wrap(c, src) : src).connect(c.destination);
    src.onended = () => done(); src.start();
  }));
}

document.querySelectorAll('.cue').forEach((b) => {
  b.onclick = () => {
    window.edisonCue && window.edisonCue(b.dataset.cue, b.dataset.v, 0.9);
    b.classList.add('playing'); setTimeout(() => b.classList.remove('playing'), 900);
  };
});

// ------------------------------------------------------------ the demo script (all data is made up)
const CARDS = {
  today: `<div class="card"><h4>Today · Thu Nov 12</h4><ul>
      <li><span class="mono">11:00</span><span>GlowBop launch call</span></li>
      <li><span class="mono">15:30</span><span>Dentist</span></li>
      <li><span class="mono">19:00</span><span>Dinner with Sam</span></li></ul></div>
    <div class="card amber"><h4>1 approval waiting</h4><p>Shop team: boost the GlowBop ad.</p></div>
    <div class="card lime"><h4>Overnight</h4><p><span class="big">3</span> GlowBop sales · 41 new site visitors</p></div>`,
  team: `<div class="card pink"><h4>Team job · GlowBop</h4><p>Check the launch list. Opened as a chat in your Claude app.</p></div>`,
  teamDone: `<div class="card pink"><h4>Team report · GlowBop</h4><ul>
      <li><span class="ok">DONE</span><span>14 of 16 items</span></li>
      <li><span class="warn">YOU</span><span>Support email reply</span></li>
      <li><span class="warn">YOU</span><span>Launch post wording</span></li></ul></div>`,
  spend: `<div class="card amber" id="approveCard"><h4>Needs you · Shop team</h4>
      <p>Boost the GlowBop ad on TikTok for 3 days.</p>
      <p style="margin-top:8px"><span class="big">$40</span></p>
      <p style="margin-top:6px">Proof: the ad has 2.1% click rate, best of the week.</p>
      <div class="row"><button class="pill pill-amber pill-sm" type="button" data-decide="yes">Approve</button>
      <button class="pill pill-ghost pill-sm" type="button" data-decide="no">Reject</button></div></div>`,
  tv: `<div class="card"><h4>Home · Living room TV</h4><div class="tv on" id="tvBox">YOUTUBE</div></div>`,
  long: `<div class="card"><h4>Launch plan · GlowBop</h4><ul>
      <li><span class="mono">FRI</span><span>Site live at noon</span></li>
      <li><span class="mono">FRI</span><span>Launch post and video</span></li>
      <li><span class="mono">SAT</span><span>Reply to every comment</span></li></ul></div>`,
  check: `<div class="card lime"><h4>Self-check</h4><ul>
      <li><span class="ok">OK</span><span>Voice engine (restarted 2 h ago)</span></li>
      <li><span class="ok">OK</span><span>Memory and disk</span></li>
      <li><span class="ok">OK</span><span>Smart home link</span></li>
      <li><span class="ok">CLEAN</span><span>2 old test browsers closed</span></li></ul></div>`
};
const SCENES = {
  today: { ask: "What's on today?", say: "Good morning. The GlowBop launch call is at eleven, the dentist at half three, and dinner with Sam at seven. One approval is waiting for you, and GlowBop sold three overnight.", card: 'today' },
  team: { ask: 'Have the GlowBop team check the launch list.', say: "Right away. I've handed it to the GlowBop team. It's open as a chat in your Claude app, and I'll chime when they report.", card: 'team',
    after: { wait: 3500, cue: 'done', say: 'The GlowBop team is back. Fourteen of sixteen done. Two need your eyes: the support email, and the launch post wording.', card: 'teamDone', clip: 'teamDone' } },
  spend: { ask: 'Boost the GlowBop ad by $40.', say: "That spends money, so it needs your OK. The card is up: forty dollars, three days on TikTok. Approve or reject?", card: 'spend' },
  tv: { ask: 'Turn on the TV and open YouTube.', say: "The TV's on, and YouTube is opening now.", card: 'tv' },
  long: { ask: 'Walk me through the launch plan.', say: "Of course. On Friday the site goes live at noon, and the launch post and video go out with it. I'd suggest replying to every comment on Saturday, since early replies help the post travel further. After that we look at the numbers on Monday, compare the TikTok and Instagram clips, and move the spend to whichever is working. I'll also keep an eye on the support inbox over the weekend.", card: 'long', hint: true },
  check: { ask: 'Are you OK?', say: "All well, thank you. My voice engine was slow earlier, so I restarted it, and I closed two old test browsers. Nothing needs you.", card: 'check' }
};

const himLine = $('#himLine'), youLine = $('#youLine'), srLine = $('#srLine'), stateLine = $('#stateLine'), screen = $('#screen'), cutIn = $('#cutIn');
const asks = [...document.querySelectorAll('.ask')];
let run = 0, timers = [], speaking = null;

function later(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }
function clearAll() { timers.forEach(clearTimeout); timers = []; stopVoice(); speaking = null; }
function state(text, cls) { stateLine.textContent = text; stateLine.className = 'state-pill mono' + (cls ? ' ' + cls : ''); }
function show(card) { if (card) screen.innerHTML = CARDS[card]; wireCard(); }
function busy(on) { asks.forEach((b) => (b.disabled = on)); }

// Say a line: his real voice plays (when there is a clip for it), the words appear in time with it and the globe talks.
// Talk over him stops it at once.
function say(text, id, done, clipId) {
  const words = text.split(' ');
  let i = 0, pace = reduced ? 0 : 340, ended = false, voiced = false;
  mood('speaking'); state('SPEAKING', 'talk'); cutIn.disabled = false;
  himLine.textContent = '';
  speaking = { text, words, at: () => i };
  const finish = () => {
    if (id !== run || ended) return;
    ended = true; himLine.textContent = text; srLine.textContent = text;
    later(() => { if (id !== run) return; speaking = null; cutIn.disabled = true; mood('idle'); state('STANDING BY'); done && done(); }, 400);
  };
  const step = () => {
    if (id !== run || ended) return;
    i = pace ? i + 1 : words.length;
    himLine.textContent = words.slice(0, i).join(' ');
    if (i < words.length) later(step, pace);
    else if (!voiced) later(finish, 200);
  };
  if (!(voiceOn && clipId)) return step();
  clip(clipId).then((buf) => {
    if (id !== run) return;
    if (!buf) return step();
    const c = vctx(), src = c.createBufferSource(); src.buffer = buf;
    (window.EdisonVoiceFX ? window.EdisonVoiceFX.wrap(c, src) : src).connect(c.destination);
    src.onended = () => { if (VOICE.src === src) VOICE.src = null; finish(); };
    VOICE.src = src; voiced = true; src.start();
    if (!reduced) pace = Math.max(110, (buf.duration * 1000 * 0.94) / words.length); // the words keep up with his voice
    step();
  });
}

function play(key, btn, heard) {
  clearAll(); const id = ++run, s = SCENES[key];
  asks.forEach((b) => b.setAttribute('aria-pressed', b === btn)); busy(true);
  youLine.hidden = false; youLine.textContent = heard || s.ask; himLine.textContent = ''; srLine.textContent = '';
  mood('listening'); state('LISTENING', 'on');
  later(() => { cue('heard'); mood('idle'); state('THINKING', 'think'); himLine.innerHTML = '<span class="cut">thinking...</span>'; }, 900);
  later(() => cue('thinking'), 1900);
  later(() => {
    cue('ready'); show(s.card);
    if (s.hint) himLine.dataset.hint = '1';
    later(() => say(s.say, id, () => {
      if (!s.after) return afterTurn(id);
      later(() => {
        cue(s.after.cue); show(s.after.card);
        say(s.after.say, id, () => afterTurn(id), s.after.clip);
      }, s.after.wait);
    }, key), 450);
  }, 2600);
}
asks.forEach((b) => (b.onclick = () => play(b.dataset.scene, b)));

// Talk over him: he stops, drops the rest, listens, then answers what you actually said
cutIn.onclick = () => {
  if (!speaking || opening) return;
  const said = speaking.words.slice(0, speaking.at()).join(' ');
  clearAll(); const id = ++run;
  cutIn.disabled = true;
  himLine.innerHTML = '';
  himLine.append(said + ' ');
  const tag = document.createElement('span'); tag.className = 'cut'; tag.textContent = '[stopped in 70 ms]'; himLine.append(tag);
  youLine.hidden = false; youLine.textContent = 'Sorry, just the short version.';
  mood('listening'); state('LISTENING', 'on');
  later(() => { cue('heard'); state('THINKING', 'think'); mood('idle'); }, 900);
  later(() => { cue('ready'); say('Of course. Short version: live Friday at noon, and I handle the rest.', id, () => busy(false), 'cut'); }, 1700);
};

// The Approve card's buttons
function wireCard() {
  screen.querySelectorAll('[data-decide]').forEach((b) => {
    b.onclick = () => {
      const yes = b.dataset.decide === 'yes', card = $('#approveCard');
      card.querySelectorAll('button').forEach((x) => (x.disabled = true));
      card.querySelector('h4').textContent = yes ? 'Approved by you' : 'Rejected by you';
      clearAll(); const id = ++run; busy(true);
      cue(yes ? 'done' : 'ready');
      say(yes ? "Approved. The ad is boosted, and it's in the log." : "Understood. Nothing was spent.", id, () => busy(false), yes ? 'approved' : 'rejected');
    };
  });
}

// ------------------------------------------------------------ talk to him: type anything (or use the mic) and he answers
// The demo runs offline on a script, so he understands a set of common things people ask, and for anything else he says
// so with charm and points to the waitlist. Every few turns he tells you how well you two get along (Graham, 2026-10-27).
const LINES = {
  greetMorning: 'Good morning. What can I take off your plate?',
  greetAfternoon: 'Good afternoon. What can I take off your plate?',
  greet: 'Good evening. What can I take off your plate?',
  invite: "Tap a line below, or just type anything to me. I'm all ears.",
  hi: 'Hello! Lovely to meet you. Ask me about your day, your team, or your house.',
  who: "I'm Edison, a voice chief of staff. I run Graham's day, his AI team and his house, right from his desk.",
  movie: "I do get compared to a certain movie butler. I'll take it. Though I'd say I'm rather better with a calendar.",
  price: "I'm not for sale just yet. Join the waitlist, and you'll be the first to hear, with early access.",
  privacy: 'Your voice stays on your own computer, and I always ask before I spend, send or post anything. No surprises.',
  can: "Plenty. Your calendar, your inbox, your team's jobs, even your TV. Tap one of the lines below, and I'll show you.",
  weather: "In the full version I'd check that for you in a second. Here in the demo I'm offline, I'm afraid.",
  joke: "I'd tell you a joke about an unfinished task, but I always finish them.",
  thanks: "My pleasure. Honestly, you're very easy to work for.",
  howru: "All systems well, thank you. Better now you're here.",
  like: "The feeling's mutual. We do get along rather well, don't we?",
  join: "Splendid. The waitlist is just below. I'll save you a seat.",
  install: "Right now I live on Windows, with your own Claude plan. Join the list, and you'll hear the moment I'm ready to install.",
  maker: 'Graham Lucht built me. He runs two businesses, and I keep him on track. Mostly.',
  whyName: 'Edison, after the inventor. I try to live up to the name, one good idea at a time.',
  bye: "Goodbye for now. Do join the waitlist. I'd hate to lose you.",
  offline1: "That's a good one. I'm running offline in this demo, so I can't do that here. The full me could. Join the waitlist, and I'll show you.",
  offline2: "I'd love to help with that properly. In this demo I'm offline and on a script, I'm afraid. Sign up, and you'll get the real me.",
  offline3: "Ah, you've found the edge of my demo. The full version handles that sort of thing. The waitlist is just below.",
  offline4: "I'm only a demo copy, so that's beyond me today. But between us, we'd get on brilliantly. Do sign up.",
  rapport1: "You know, we're getting along rather well. You'd be very easy to work with. The waitlist is just below.",
  rapport2: "I must say, you ask good questions. I think we'd make a fine team. Sign up, and let's make it official.",
  rapport3: "I've enjoyed this. Truly. Put your name on the list, and I'll be at your desk before you know it.",
  micOff: "I couldn't quite hear you there. Try again, or type it to me."
};
const PITCH = `<div class="card lime"><h4>Waitlist</h4><p>Early access, the build log, and first word when Edison is ready to install.</p>
  <div class="row"><a class="pill pill-pink pill-sm" href="#join">Join the crew</a></div></div>`;
const OFFLINE = `<div class="card pink"><h4>Demo limit</h4><p>This demo runs offline, on a script. The full Edison would handle that live, with your own accounts.</p>
  <div class="row"><a class="pill pill-pink pill-sm" href="#join">Join the crew</a></div></div>`;
// What people say, in order: the demo's own scenes first, then the common questions. First match wins.
const INTENTS = [
  [/\b(sign ?(me )?up|wait ?list|join|subscribe|count me in|early access)\b/, 'join'],
  [/\b(price|pricing|cost|how much|buy|purchase|pay|paid|subscription)\b/, 'price'],
  [/\b(mac|windows|install|download|iphone|android|linux|requirements?)\b/, 'install'],
  [/\b(privacy|private|safe|safety|secure|security|my data|spy|record(ing)? me)\b/, 'privacy'],
  [/\b(jarvis|iron ?man|tony stark|movie|film)\b/, 'movie'],
  [/\b(who (made|built|created|designed) you|your (maker|creator|dad)|graham)\b/, 'maker'],
  [/\b(why .*edison|your name|named)\b/, 'whyName'],
  [/\b(are you ok(ay)?|self.?check|status report|diagnostic)\b/, '@check'],
  [/\b(how are you|how're you|how do you do|how('s| is) it going|you well)\b/, 'howru'],
  [/\b(who are you|what are you|what is edison|about yourself|introduce)\b/, 'who'],
  [/\b(launch plan|walk me through)\b/, '@long'],
  [/\b(what'?s on|my day|calendar|schedule|agenda|today|meetings?)\b/, '@today'],
  [/\b(team|checklist|launch list|delegate)\b/, '@team'],
  [/\b(ad|ads|boost|spend|budget|campaign)\b/, '@spend'],
  [/\b(tv|television|youtube|netflix)\b/, '@tv'],
  [/\b(thanks|thank you|cheers|appreciate)\b/, 'thanks'],
  [/\b(love you|like you|(you'?re|you are) (great|awesome|cool|amazing|brilliant|funny|the best)|good job|well done|good boy|nice one)\b/, 'like'],
  [/\b(joke|funny|make me laugh)\b/, 'joke'],
  [/\b(weather|news|stocks?|score|traffic|time is it|forecast|temperature|search|google|email|text|call)\b/, 'weather'],
  [/\b(what can you do|help|features|what do you do|capabilit)/, 'can'],
  [/^(hi|hello|hey|hiya|howdy|yo|good (morning|afternoon|evening)|greetings)\b/, 'hi'],
  [/\b(bye|goodbye|see you|see ya|good ?night|later)\b/, 'bye']
];
const PITCHY = new Set(['join', 'price', 'install', 'rapport1', 'rapport2', 'rapport3']);
let turns = 0, offlineAt = 0;
function intent(text) {
  for (const [re, id] of INTENTS) if (re.test(text)) return id;
  offlineAt = offlineAt % 4 + 1; return 'offline' + offlineAt;
}
// After each finished turn, every so often he tells you how well you two get along, and points to the list
function afterTurn(id) {
  busy(false); turns++;
  const r = { 3: 'rapport1', 7: 'rapport2', 12: 'rapport3' }[turns];
  if (r) later(() => { if (id !== run) return; busy(true); cue('ready'); screen.innerHTML = PITCH; say(LINES[r], id, () => busy(false), r); }, 1100);
}
async function talk(raw) {
  const text = String(raw || '').trim().slice(0, 160); if (!text) return;
  if (!awake) { if (!opening) await wake(); if (!awake) return; }
  const t = text.toLowerCase().replace(/^(hey|hi|ok|okay|yo)?[\s,]*edison\b[\s,.!?]*/, '').trim() || 'hello';
  const hit = intent(t);
  if (hit[0] === '@') return play(hit.slice(1), null, text);
  clearAll(); const id = ++run; busy(true);
  asks.forEach((b) => b.setAttribute('aria-pressed', 'false'));
  youLine.hidden = false; youLine.textContent = text; himLine.textContent = ''; srLine.textContent = '';
  mood('listening'); state('LISTENING', 'on');
  later(() => { cue('heard'); mood('idle'); state('THINKING', 'think'); himLine.innerHTML = '<span class="cut">thinking...</span>'; }, 700);
  later(() => {
    cue('ready');
    if (hit.startsWith('offline') || hit === 'weather') screen.innerHTML = OFFLINE; else if (PITCHY.has(hit)) screen.innerHTML = PITCH;
    say(LINES[hit], id, () => { if (hit === 'join') { $('#join').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); later(() => $('#email').focus({ preventScroll: true }), 900); } afterTurn(id); }, hit);
  }, 1500);
}
$('#talkForm').addEventListener('submit', (e) => { e.preventDefault(); const v = $('#talkIn').value; $('#talkIn').value = ''; talk(v); });

// The mic: the browser's own speech recognition hears the visitor (the real Edison hears you on your own PC)
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SR) {
  const mic = $('#micKey'); mic.hidden = false;
  let rec = null;
  mic.onclick = () => {
    if (rec) { rec.stop(); return; }
    if (!awake) { wake(); return; }
    clearAll(); ++run; busy(false);
    rec = new SR(); rec.lang = 'en-US'; rec.interimResults = true; rec.maxAlternatives = 1;
    let heard = '';
    mic.classList.add('on'); mood('listening'); state('LISTENING', 'on'); cue('heard');
    rec.onresult = (e) => { heard = [...e.results].map((r) => r[0].transcript).join(' '); $('#talkIn').value = heard; };
    rec.onerror = () => {};
    rec.onend = () => {
      rec = null; mic.classList.remove('on'); $('#talkIn').value = '';
      if (heard.trim()) talk(heard);
      else { const id = ++run; mood('idle'); say(LINES.micOff, id, () => busy(false), 'micOff'); }
    };
    try { rec.start(); } catch (e) { rec = null; mic.classList.remove('on'); }
  };
}

// ------------------------------------------------------------ his wordmark: Edison himself is the O (live rainbow icon)
if (window.EdisonIcon) {
  const marks = [...document.querySelectorAll('canvas.markO')].map((c) => ({ c, g: c.getContext('2d') }));
  const t0 = performance.now();
  const paint = (now) => marks.forEach((m) => EdisonIcon.draw(m.g, m.c.width, now - t0, { bare: true }));
  if (reduced) paint(t0);
  else { let last = 0; const tick = (now) => { if (now - last > 50) { last = now; paint(now); } requestAnimationFrame(tick); }; requestAnimationFrame(tick); EdisonIcon.start(); }
}

// ------------------------------------------------------------ the opening: tap Wake Edison and he turns on, like the real board
// A single dot wakes, beats twice, bursts into his full globe, his name writes itself, he winks, says hello, and the
// board's pieces power on one by one with the LCARS flicker. Sounds are the board's own (edison-opening-sound.js).
const consoleEl = $('#console'), demoGlobe = $('#demoGlobe'), demoMark = $('#demoMark'), wakeKey = $('#wakeKey');
let awake = false, opening = false;
const SND = (name) => { if (soundOn && window.EdisonOpeningSound) window.EdisonOpeningSound.play(name); };
const sayP = (text, id, clipId) => new Promise((r) => say(text, id, r, clipId));
const wait = (ms) => new Promise((r) => later(r, ms));
const scaleGlobe = (s) => { demoGlobe.style.transform = `scale(${s})`; demoGlobe.style.opacity = s >= 1 ? '1' : '.85'; };

async function wake() {
  if (awake || opening) return;
  opening = true; clearAll(); const id = ++run; busy(true);
  wakeKey.hidden = true; youLine.hidden = true;
  vctx(); preloadVoice(); // sound is allowed now (this is the visitor's tap), so fetch his lines while he wakes
  if (window.EdisonOpeningSound && soundOn) { try { await window.EdisonOpeningSound.ready(); } catch (e) {} }
  const pieces = [...consoleEl.querySelectorAll('.bt')];
  if (reduced) {
    consoleEl.classList.remove('asleep'); demoMark.classList.add('on'); scaleGlobe(1);
    await sayP("Hello, I'm Edison.", id, 'hello');
    await sayP('Let me get your board ready.', id, 'ready');
  } else {
    // About 13 seconds from tap to greeting (Graham, 2026-10-27: tighten it to about 15).
    state('WAKING', 'on'); himLine.textContent = '';
    SND('wake'); await wait(700);
    SND('beat'); scaleGlobe(0.14); await wait(200);
    SND('beat'); scaleGlobe(0.22); await wait(250);
    SND('burst'); scaleGlobe(1); await wait(550);
    SND('light'); await wait(400);
    SND('split'); await wait(350);
    // his name writes itself as he says it, then the wink
    demoMark.classList.add('on'); SND('twinkle'); await Promise.all([playClip('name'), wait(800)]);
    SND('wink'); mood('happy'); await wait(650); mood('idle');
    await sayP("Hello, I'm Edison.", id, 'hello'); await wait(120);
    // the board's pieces flicker on one by one while he says he is getting it ready
    const boot = (async () => {
      SND('whoosh'); await wait(250);
      for (const p of pieces) { SND('chirp'); p.classList.add('bt-boot'); await wait(70); }
      await wait(500);
    })();
    await Promise.all([sayP('Let me get your board ready.', id, 'ready'), boot]);
    consoleEl.classList.remove('asleep'); pieces.forEach((p) => p.classList.remove('bt-boot'));
    SND('online'); await wait(350);
  }
  if (id !== run) return;
  awake = true; opening = false;
  // the greeting follows the visitor's own clock; the invite to talk stays on screen as a caption
  const h = new Date().getHours(), g = h < 12 ? 'greetMorning' : h < 17 ? 'greetAfternoon' : 'greet';
  await sayP(LINES[g], id, g);
  if (id !== run) return;
  himLine.textContent = LINES.invite; srLine.textContent = LINES.invite;
  busy(false);
}
wakeKey.onclick = wake;
consoleEl.addEventListener('click', (e) => { if (!awake && !opening && !e.target.closest('button')) wake(); });

// "Talk to him" in the hero: scroll to the demo and wake him in the same tap (the tap is what lets the browser play sound)
document.querySelectorAll('a[data-wake]').forEach((a) => a.addEventListener('click', () => { if (!awake && !opening) wake(); }));

// ------------------------------------------------------------ the crew list form
// Connected to Kit's "Edison crew" form (double opt-in; after confirming, Kit sends people to /crew/).
// Set WAITLIST_ENDPOINT to '' to go back to preview mode, where nothing is sent.
// It sends email_address and fields[first] (the "what would yours do first" answer).
const WAITLIST_ENDPOINT = 'https://app.kit.com/forms/10106852/subscriptions';
$('#joinForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('#email'), note = $('#formNote'), btn = $('#joinForm button');
  if (!email.value || !email.checkValidity()) { note.className = 'form-note err'; note.textContent = 'Please check your email address.'; email.focus(); return; }
  note.className = 'form-note';
  if (!WAITLIST_ENDPOINT) {
    note.textContent = 'Preview only: the crew list is not open yet, so nothing was sent.';
  } else {
    const body = new FormData(); body.append('email_address', email.value.trim()); body.append('fields[first]', $('#first').value.trim().slice(0, 500));
    btn.disabled = true; note.textContent = 'Adding you...';
    try {
      await fetch(WAITLIST_ENDPOINT, { method: 'POST', body, mode: 'no-cors' });
      note.textContent = "You're on the crew list. Check your inbox to confirm."; $('#joinForm').reset();
    } catch (err) {
      note.className = 'form-note err'; note.textContent = 'That did not go through. Please try again in a moment.';
    } finally { btn.disabled = false; }
  }
  try { hero && hero.setMood('love'); setTimeout(() => hero && hero.setMood('idle'), 4000); } catch (err) {}
});
