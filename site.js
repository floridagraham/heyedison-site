// Edison website: two globes (hero and demo), the scripted "Try him" demo with made-up data and his board, sound cue
// buttons, the first-touch hello, and the sign-up form (sent to Kit).
import { mountGlobe } from './edison-globe.js?v=4';
import { TALK, SCENE_NEXT, INTENTS } from './edison-talk.js?v=10';

const $ = (s) => document.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

let hero = null, ed = null, mini = null;
try { hero = mountGlobe($('#heroGlobe')); ed = mountGlobe($('#demoGlobe')); mini = mountGlobe($('#bEd')); } catch (e) { /* no WebGL: the page still works */ }
const mood = (m) => { try { ed && ed.setMood(m); mini && mini.setMood(m); } catch (e) {} };

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
    VOICE.src = src; // so stopVoice() can cut it off
    src.onended = () => { if (VOICE.src === src) VOICE.src = null; done(); }; src.start();
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

// which page of his board each scene brings up
const SCENE_PAGE = { today: 'life', team: 'glowbop', spend: 'mission', tv: 'home', long: 'glowbop', check: 'ops' };
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
  clearAll(); chips([]); const id = ++run, s = SCENES[key]; scene = key;
  asks.forEach((b) => b.setAttribute('aria-pressed', b === btn)); busy(true);
  youLine.hidden = false; youLine.textContent = heard || s.ask; himLine.textContent = ''; srLine.textContent = '';
  mood('listening'); state('LISTENING', 'on');
  later(() => { cue('heard'); mood('idle'); state('THINKING', 'think'); himLine.innerHTML = '<span class="cut">thinking...</span>'; }, 900);
  later(() => cue('thinking'), 1900);
  later(() => {
    cue('ready'); if (key === 'tv') tvOn = true;
    showPage(SCENE_PAGE[key] || page); show(s.card);
    if (s.hint) himLine.dataset.hint = '1';
    later(() => say(s.say, id, () => {
      if (!s.after) return afterTurn(id, SCENE_NEXT[key]);
      later(() => {
        cue(s.after.cue); show(s.after.card);
        say(s.after.say, id, () => afterTurn(id, SCENE_NEXT[key]), s.after.clip);
      }, s.after.wait);
    }, key), 450);
  }, 2600);
}
asks.forEach((b) => (b.onclick = () => (b.dataset.say ? talk(b.dataset.say) : b.dataset.scene === 'tour' ? tour() : play(b.dataset.scene, b))));

// Talk over him: he stops mid-word, drops the rest, and listens. During the launch plan the button stands in for
// "sorry, just the short version"; anywhere else it opens the mic (or the typing box) and he answers what you actually say.
let scene = null;
cutIn.onclick = () => {
  if (!speaking || opening) return;
  const said = speaking.words.slice(0, speaking.at()).join(' ');
  const wasLong = scene === 'long';
  clearAll(); const id = ++run;
  cutIn.disabled = true; chips([]);
  himLine.innerHTML = '';
  himLine.append(said + ' ');
  const tag = document.createElement('span'); tag.className = 'cut'; tag.textContent = '[stopped in 70 ms]'; himLine.append(tag);
  if (wasLong) {
    scene = null;
    youLine.hidden = false; youLine.textContent = 'Sorry, just the short version.';
    mood('listening'); state('LISTENING', 'on');
    later(() => { cue('heard'); state('THINKING', 'think'); mood('idle'); }, 900);
    later(() => { cue('ready'); say('Of course. Short version: live Friday at noon, and I handle the rest.', id, () => afterTurn(id, SCENE_NEXT.long), 'cut'); }, 1700);
    return;
  }
  scene = null; busy(false);
  const mic = $('#micKey');
  if (mic && !mic.hidden) return later(() => mic.click(), 250); // straight into listening, like the real Edison
  typeIt();
};
// No mic (or the visitor said no to it): he waits for them to type instead
function typeIt() {
  mood('listening'); state('LISTENING', 'on'); cue('heard');
  youLine.hidden = false; youLine.textContent = 'Go ahead, type it below.';
  $('#talkIn').focus({ preventScroll: true });
  chips(['What can you do?', 'Tell me a joke', 'Can you hear me?']);
}

// The Approve buttons, on the spend card and on the board's Needs You panel: both decide the same $40 boost
let decided = false;
function decide(yes) {
  if (decided) return; decided = true;
  document.querySelectorAll('[data-decide]').forEach((x) => (x.disabled = true));
  const card = $('#approveCard'); if (card) card.querySelector('h4').textContent = yes ? 'Approved by you' : 'Rejected by you';
  const needs = $('#bNeedsPn'); if (needs) needs.innerHTML = `<h4>NEEDS YOU <em>0</em></h4><p>${yes ? 'Ad boost approved by you. It is in the log.' : 'Ad boost rejected. Nothing was spent.'}</p>`;
  $('#bNeeds').textContent = 'NEEDS YOU 0';
  clearAll(); const id = ++run; busy(true);
  cue(yes ? 'done' : 'ready');
  say(yes ? "Approved. The ad is boosted, and it's in the log." : "Understood. Nothing was spent.", id, () => { busy(false); chips(SCENE_NEXT.decided); }, yes ? 'approved' : 'rejected');
}
function wireCard() { document.querySelectorAll('[data-decide]').forEach((b) => (b.onclick = () => decide(b.dataset.decide === 'yes'))); }

// ------------------------------------------------------------ his board: pages behind the tabs, like the real one (all data made up)
const blocks = (n, left) => `<div class="b-blocks">${'<i></i>'.repeat(n - left)}${'<i class="left"></i>'.repeat(left)}</div>`;
const PAGES = {
  mission: () => `<div class="b-pn" style="--c:#FF3D5A" id="bNeedsPn"><h4>NEEDS YOU <em>${decided ? 0 : 1}</em></h4>${decided
      ? '<p>Nothing waiting. All clear.</p>'
      : `<p style="color:var(--text)">Shop team: boost the GlowBop ad, $40 for 3 days.</p>
      <div class="row"><button class="b-key" type="button" style="--c:var(--amber)" data-decide="yes">APPROVE</button><button class="b-key" type="button" style="--c:var(--soft)" data-decide="no">NOT NOW</button></div>`}</div>
    <div class="b-pn" style="--c:#FF8A1F"><h4>TODAY'S MISSION <em>4 ON YOUR LANE</em></h4><ul>
      <li>Reply to the support email<span class="b-tag you">YOU</span></li>
      <li>Check the GlowBop launch list<span class="b-tag">EDISON</span></li>
      <li>Approve the launch post wording<span class="b-tag you">YOU</span></li>
      <li>Sort the shop's new ad clips<span class="b-tag">EDISON</span></li></ul></div>
    <div class="b-pn" style="--c:#FFE03B"><h4>GLOWBOP LAUNCH <em>FRI</em></h4><div class="b-big">1 <small>day to go</small></div>${blocks(14, 1)}</div>`,
  ops: () => `<div class="b-pn" style="--c:#FF8A1F"><h4>ROUTINES</h4><ul>
      <li>Tile refresh, hourly<span class="b-tag ok">FIRED</span></li>
      <li>Laptop cleanup, every 10 min<span class="b-tag ok">FIRED</span></li>
      <li>Voice engine, on this PC<span class="b-tag up">UP</span></li>
      <li>Weekly planning, Mondays<span class="b-tag">SET</span></li></ul></div>
    <div class="b-pn" style="--c:var(--lime)"><h4>SELF-CHECK <em>2 MIN AGO</em></h4><ul>
      <li>Memory and disk<span class="b-tag ok">OK</span></li><li>Smart home link<span class="b-tag ok">OK</span></li></ul></div>`,
  glowbop: () => `<div class="b-pn" style="--c:#FFE03B"><h4>GLOWBOP <em>MUSIC-REACTIVE LIGHTS</em></h4><p>Graham's app that makes your lights dance to whatever is playing.</p></div>
    <div class="b-pn" style="--c:var(--pink)"><h4>GLOWBOP TEAM <em>3 AGENTS</em></h4><ul>
      <li>CEO: launch list<span class="b-tag up">WORKING</span></li><li>Marketing: launch post<span class="b-tag you">NEEDS YOU</span></li><li>Support: inbox<span class="b-tag ok">CLEAR</span></li></ul></div>
    <div class="b-pn" style="--c:var(--lime)"><h4>OVERNIGHT</h4><div class="b-big">3 <small>sales · 41 new visitors</small></div></div>`,
  shop: () => `<div class="b-pn" style="--c:var(--lime)"><h4>SHOP HQ <em>TIKTOK SHOP</em></h4><ul>
      <li>New ad clips rendering<span class="b-tag up">3</span></li><li>Product waiting for your OK<span class="b-tag you">1</span></li><li>Best ad this week, 2.1% clicks<span class="b-tag ok">LIVE</span></li></ul></div>`,
  life: () => `<div class="b-pn" style="--c:var(--cyan)"><h4>CALENDAR <em>TODAY</em></h4><ul>
      <li>GlowBop launch call<span class="mono c-amber">11:00</span></li><li>Dentist<span class="mono c-amber">15:30</span></li><li>Dinner with Sam<span class="mono c-amber">19:00</span></li></ul></div>
    <div class="b-pn" style="--c:var(--violet)"><h4>WEATHER <em>DEMO</em></h4><ul><li>Sunny<span class="mono">78°</span></li><li>High and low<span class="mono">84° / 69°</span></li></ul></div>`,
  home: () => `<div class="b-pn" style="--c:var(--violet)"><h4>HOME <em>READ ONLY BUT THE TV</em></h4><ul>
      <li>Living room TV<span class="b-tag ${tvOn ? 'ok' : ''}">${tvOn ? 'ON' : 'OFF'}</span></li><li>Front door<span class="b-tag ok">LOCKED</span></li><li>Thermostat<span class="mono">72°</span></li></ul></div>`
};
const PAGE_LINES = {
  mission: 'Your mission board. One thing needs you, and the GlowBop launch is tomorrow.',
  ops: 'Operations. Every routine fired on time, and my self-check is clean.',
  glowbop: "GlowBop, Graham's music-reactive lights app. The team is on the launch list, and it sold three overnight.",
  shop: 'The shop. Three new ad clips are rendering, and one product is waiting for your OK.',
  life: "Your day. The launch call at eleven, the dentist at half three, dinner with Sam at seven, and it's a sunny seventy-eight.",
  home: "The house. The front door is locked, and the living room TV is off. Say the word, and I'll put it on."
};
const PAGE_DONE = { mission: 'Your mission board.', ops: 'Operations.', glowbop: 'GlowBop.', shop: 'Shop HQ.', life: 'Your day.', home: 'The house.' };
const tabs = [...document.querySelectorAll('.b-tab')], bPage = $('#bPage');
let page = 'mission', tvOn = false;
function showPage(p) {
  page = p; tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.page === p)));
  bPage.innerHTML = PAGES[p](); wireCard();
  bPage.querySelectorAll('.b-pn').forEach((n) => n.classList.add('bt')); // dark until his opening powers the board on
}
tabs.forEach((t) => (t.onclick = () => {
  const p = t.dataset.page; showPage(p);
  if (!reduced) bPage.querySelectorAll('.b-pn').forEach((n, i) => setTimeout(() => n.classList.add('bt-boot'), i * 70));
  SND('chirp'); if (!awake) return;
  clearAll(); const id = ++run; busy(true); youLine.hidden = true; screen.innerHTML = '';
  say(PAGE_LINES[p], id, () => afterTurn(id), 'page_' + p);
}));

// ------------------------------------------------------------ "What can you do?": the tour (what-edison-does-script.md)
// He walks through everything he does, bringing each part up on his board as he goes. Talk over him or Stop all ends it.
const tc = (color, title, items) => `<div class="card" style="box-shadow:inset 0 0 0 2px ${color}"><h4 style="color:${color}">${title}</h4><ul>${items.map((i) => `<li class="tick"><span>${i}</span></li>`).join('')}</ul></div>`;
const TOUR = [
  { page: 'mission', card: tc('var(--cyan)', 'The tour', ['Talks and listens', 'Runs your day', 'Runs your AI team', 'Watches the shop', 'Asks first', 'Runs the house', 'Looks after himself', 'Yours to shape']) },
  { page: 'mission', card: tc('var(--pink)', 'Talks and listens', ['Hearing and voice on your own PC', 'Stops in about 70 ms when you cut in', 'Four sound cues: heard, thinking, ready, team back']) },
  { page: 'life', card: tc('var(--cyan)', 'Runs your day', ['A short morning brief', 'Calendar and inbox, read only', "Reminders, and what's next"]) },
  { page: 'glowbop', card: tc('#FFE03B', 'Runs your AI team', ['A team per business: a CEO and specialists', 'Jobs open as chats in your Claude app', 'A chime, then a spoken report']) },
  { page: 'shop', card: tc('var(--lime)', 'Watches the shop', ['Trending products scouted every morning', 'A pipeline from idea to ad', 'Every stage on his board']) },
  { page: 'mission', card: tc('var(--amber)', 'Asks first', ['Spend, post, send, delete: all wait on a card', 'The cost and the proof, every time', 'Stop all halts everything at once']) },
  { page: 'home', card: tc('var(--violet)', 'Runs the house', ['Reads your whole smart home', 'Switches only what you allow', 'Today: the TV, on, off or YouTube']) },
  { page: 'ops', card: tc('#FF8A1F', 'Looks after himself', ['Self-checks and cleanup every few minutes', "Fixes what's safe, tells you in a sentence", 'A daily journal, so he remembers']) },
  { page: 'mission', card: tc('var(--pink)', 'Yours to shape', ['Looks and color themes', 'A voice mixer', 'Your own wake-up lines', 'His board on your laptop and tablet']) },
  { page: 'mission', card: null }
];
async function tour(heard) {
  clearAll(); chips([]); const id = ++run; busy(true); scene = null;
  asks.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.scene === 'tour')));
  youLine.hidden = false; youLine.textContent = heard || 'What can you do?'; himLine.textContent = ''; srLine.textContent = '';
  mood('listening'); state('LISTENING', 'on');
  await wait(800); if (id !== run) return; cue('heard'); state('THINKING', 'think'); mood('idle');
  await wait(800); if (id !== run) return; cue('ready');
  for (let i = 0; i < TOUR.length; i++) {
    const ch = TOUR[i]; showPage(ch.page); screen.innerHTML = ch.card || PITCH;
    await sayP(VOICE_TEXT['tour' + i], id, 'tour' + i);
    if (id !== run) return;
    await wait(500); if (id !== run) return;
  }
  afterTurn(id, SCENE_NEXT.tour);
}
// The tour's words (the same lines as voice-lines.json, so captions and voice match)
const VOICE_TEXT = {
  tour0: "Happy to give you the tour. I'll bring each part up on my board as I go. Talk over me any time.",
  tour1: "First, I talk and I listen. My hearing and my voice run on your own computer, and if you start speaking, I stop in about seventy milliseconds and answer what you actually said. Four little sounds tell you when I've heard you, when I'm thinking, and when I'm ready.",
  tour2: "I run your day. Each morning I read your calendar and your inbox and give you the short version: what's on, what's changed, and what needs you. I keep your reminders, help plan your week, and tell you what's next before you have to ask.",
  tour3: "I run your AI team. Each business gets its own team, a CEO and specialists. Say, have the GlowBop team check the launch list, and I hand it over as a chat in your Claude app. When they're done, you hear a chime, and I read you the report.",
  tour4: 'For the shop, a scout reads the trending products every morning, the good ones go into the pipeline, and I track every product from idea to ad, so you always know where things stand.',
  tour5: 'And I always ask first. Anything that spends, posts, sends or deletes waits on a card with the cost and the proof. Nothing happens until you tap approve, and one key stops everything at once.',
  tour6: "I look after the house too. I read your smart home all day, the doors, the thermostat, the lights, and I only switch what you allow. Right now that's the TV: on, off, or straight to YouTube.",
  tour7: "I look after myself. Every few minutes I tidy up and check my voice, memory and disk, and I fix what's safe. And I keep a journal of every day, so I remember what we did last week.",
  tour8: "Finally, I'm yours to shape. Pick my look, mix my voice, write the lines I say when I wake up, and put my board on your laptop and your tablet.",
  tour9: "That's me. The full version does all of this live, with your own accounts. Sign up below, and I'll be at your desk before you know it."
};
// Short answers about one part: which board page and card go with each
const DEMO_CARD = () => tc('var(--cyan)', 'Demo mode', ['His real voice, made by his own voice engine', 'A demo copy, on a script, in your browser', 'The live Edison runs on your own PC']);
const CAPS = {
  hearMe: { page: 'mission', card: DEMO_CARD }, areYouReal: { page: 'mission', card: DEMO_CARD },
  capHome: { page: 'home', card: () => TOUR[6].card }, capSchedule: { page: 'life', card: () => TOUR[2].card }, capEmail: { page: 'mission', card: () => TOUR[2].card },
  capMemory: { page: 'ops', card: () => TOUR[7].card }, capShop: { page: 'shop', card: () => TOUR[4].card }, capLook: { page: 'mission', card: () => TOUR[8].card },
  capConnect: { page: 'ops', card: () => tc('var(--lime)', 'Plugged in', ['Gmail, Google Calendar, Drive', 'Notion', 'Home Assistant and your smart TV', 'All read only until you say otherwise']) }
};
showPage('mission');
$('#bStop').onclick = () => { clearAll(); ++run; busy(false); mood('idle'); state('STANDING BY'); cutIn.disabled = true; himLine.textContent = 'Stopped. Everything is paused.'; };
$('#bMute').onclick = () => { $('#voiceKey').click(); $('#bMute').setAttribute('aria-pressed', String(!voiceOn)); $('#bMute').textContent = voiceOn ? 'MUTE HIM' : 'UNMUTE HIM'; };
$('#bTalk').onclick = () => { if (!awake) { wake(); return; } const m = $('#micKey'); if (m && !m.hidden) m.click(); else $('#talkIn').focus(); };
// on phones the board repeats his caption, since his caption box is above it, off screen
const WIDE = matchMedia('(min-width: 980px)'), bSay = $('#bSay');
new MutationObserver(() => { bSay.textContent = himLine.textContent; }).observe(himLine, { childList: true, characterData: true, subtree: true });
// Edison on his board: he flies to his dock (top left) when the board is ready, then drifts to a new spot every few seconds
const bEd = $('#bEd'), boardEl = $('.console-board');
const edTo = (x, y, s) => { bEd.style.setProperty('--x', Math.round(x) + 'px'); bEd.style.setProperty('--y', Math.round(y) + 'px'); bEd.style.setProperty('--s', s); };
const dockEd = () => edTo(4, 22, 1);
function roamEd() {
  const W = boardEl.clientWidth, H = boardEl.clientHeight, s = bEd.offsetWidth, r = (a, b) => a + Math.random() * Math.max(0, b - a);
  edTo(r(8, W - s - 8), r(40, H - s - 8), 1);
}
setInterval(() => { if (awake && !reduced && !document.hidden) roamEd(); }, 5200);
// the board's clock is the visitor's own time
const clockTick = () => { const d = new Date(); $('#bClock').innerHTML = `DEMO <b>${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</b>`; };
clockTick(); setInterval(clockTick, 15000);

// ------------------------------------------------------------ talk to him: type anything (or use the mic) and he answers
// The demo runs on a script (edison-talk.js): trigger words pick his answer, each answer has a few versions, and every
// reply ends with suggestion buttons. Anything he doesn't know gets a friendly redirect, never "I'm offline". Every few
// turns he tells you how well you two get along (Graham, 2026-10-27).
const LINES = {
  greetMorning: 'Good morning. What can I take off your plate?',
  greetAfternoon: 'Good afternoon. What can I take off your plate?',
  greet: 'Good evening. What can I take off your plate?',
  invite: "Tap a line below, or just type anything to me. I'm all ears.",
  rapport1: "You know, we're getting along rather well. You'd be very easy to work with. The waitlist is just below.",
  rapport2: "I must say, you ask good questions. I think we'd make a fine team. Sign up, and let's make it official.",
  rapport3: "I've enjoyed this. Truly. Put your name on the list, and I'll be at your desk before you know it.",
  micOff: "I couldn't quite hear you there. Try again, or type it to me."
};
const PITCH = `<div class="card lime"><h4>Get Edison</h4><p>Sign up and you get him first, the moment he is ready to install.</p>
  <div class="row"><a class="pill pill-pink pill-sm" href="#join">Sign up</a></div></div>`;
const PITCHY = new Set(['join', 'price', 'install', 'bye']);
// Pick one version of an answer, never the same one twice running. Version 1 uses the plain id (its clip), others id_2, id_3...
const lastPick = {};
function pickLine(id) {
  const all = TALK[id].say; let i = Math.floor(Math.random() * all.length);
  if (all.length > 1 && i === lastPick[id]) i = (i + 1) % all.length;
  lastPick[id] = i; return { text: all[i], clip: i === 0 ? id : id + '_' + (i + 1) };
}
// The suggestion buttons under his reply (and on his board, on phones): tap one and it is said to him
const chipBoxes = [$('#chips'), $('#bChips')];
function chips(list) {
  chipBoxes.forEach((box) => {
    box.innerHTML = '';
    (list || []).forEach((t) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = t; b.onclick = () => talk(t); box.append(b); });
  });
}
let turns = 0, visitor = '';
function intent(text) {
  for (const [re, id] of INTENTS) { const m = text.match(re); if (m) return { id, m }; }
  return { id: 'other', m: null };
}
// After each finished turn, every so often he tells you how well you two get along, and points to the list
function afterTurn(id, next) {
  busy(false); turns++; chips(next);
  const r = { 3: 'rapport1', 7: 'rapport2', 12: 'rapport3' }[turns];
  if (r) later(() => { if (id !== run) return; busy(true); cue('ready'); screen.innerHTML = PITCH; say(LINES[r], id, () => { busy(false); chips(['Sign me up', ...(next || []).slice(0, 2)]); }, r); }, 1100);
}
async function talk(raw) {
  const text = String(raw || '').trim().slice(0, 160); if (!text) return;
  if (!awake) { if (!opening) await wake(); if (!awake) return; }
  const t = text.toLowerCase().replace(/^(hey|hi|ok|okay|yo)?[\s,]*edison\b[\s,.!?]*/, '').trim() || 'hello';
  const { id: hit, m } = intent(t); scene = null;
  if (hit === '@tour') return tour(text);
  if (hit[0] === '@') return play(hit.slice(1), null, text);
  clearAll(); const id = ++run; busy(true); chips([]);
  asks.forEach((b) => b.setAttribute('aria-pressed', 'false'));
  youLine.hidden = false; youLine.textContent = text; himLine.textContent = ''; srLine.textContent = '';
  mood('listening'); state('LISTENING', 'on');
  later(() => { cue('heard'); mood('idle'); state('THINKING', 'think'); himLine.innerHTML = '<span class="cut">thinking...</span>'; }, 700);
  later(() => {
    cue('ready');
    // the visitor's own clock, and their name, are the live bits: captions only, since no recording can say them
    let line, clipId = null, next = ['What can you do?', 'Tell me a joke'];
    const now = new Date(), hrs = now.getHours();
    if (hit === 'time') line = `It's ${now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} on your clock. ${hrs < 12 ? 'Still morning. Plenty of day left.' : hrs < 18 ? 'Good time for a short break, I would say.' : 'Evening already. Shall we wrap up the day?'}`;
    else if (hit === 'date') line = `It's ${now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}, by your clock. On my demo board, it's always launch week.`;
    else {
      const p = pickLine(hit); line = p.text; clipId = p.clip; next = TALK[hit].next;
      if (hit === 'name' && m) { visitor = m[2].trim().split(/\s+/)[0].replace(/^./, (c) => c.toUpperCase()); line = `Lovely to meet you, ${visitor}. I'll remember that.`; clipId = null; }
    }
    if (PITCHY.has(hit)) screen.innerHTML = PITCH;
    else if (CAPS[hit]) { showPage(CAPS[hit].page); screen.innerHTML = CAPS[hit].card(); }
    else if (TALK[hit] && TALK[hit].page) showPage(TALK[hit].page);
    say(line, id, () => { if (hit === 'join') { $('#join').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); later(() => $('#email').focus({ preventScroll: true }), 900); } afterTurn(id, next); }, clipId);
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
    let denied = false;
    rec.onerror = (e) => { if (/not-allowed|service-not-allowed|audio-capture/.test(e.error)) denied = true; };
    rec.onend = () => {
      rec = null; mic.classList.remove('on'); $('#talkIn').value = '';
      if (heard.trim()) talk(heard);
      else if (denied) { mic.hidden = true; typeIt(); } // mic blocked: hide it and use the typing box from now on
      else { const id = ++run; mood('idle'); say(LINES.micOff, id, () => afterTurn(id, ['What can you do?', 'Tell me a joke', 'Can you hear me?']), 'micOff'); }
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
    consoleEl.classList.remove('asleep'); demoMark.classList.add('on'); scaleGlobe(1); dockEd();
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
    // the board's pieces flicker on one by one while he says he is getting it ready (on phones the board is below him, so the page glides down to it)
    if (!WIDE.matches) $('.console-board').scrollIntoView({ behavior: 'smooth', block: 'start' });
    const boot = (async () => {
      SND('whoosh'); await wait(250);
      for (const p of pieces) { SND('chirp'); p.classList.add('bt-boot'); await wait(60); } // top bar, down the rail, panels, then the keys
      await wait(500);
    })();
    await Promise.all([sayP('Let me get your board ready.', id, 'ready'), boot]);
    consoleEl.classList.remove('asleep'); pieces.forEach((p) => p.classList.remove('bt-boot'));
    SND('online'); dockEd(); await wait(350);
  }
  if (id !== run) return;
  awake = true; opening = false;
  // the greeting follows the visitor's own clock; the invite to talk stays on screen as a caption
  const h = new Date().getHours(), g = h < 12 ? 'greetMorning' : h < 17 ? 'greetAfternoon' : 'greet';
  await sayP(LINES[g], id, g);
  if (id !== run) return;
  himLine.textContent = LINES.invite; srLine.textContent = LINES.invite;
  chips(['Can you hear me?', 'What can you do?', "What's on today?"]);
  busy(false);
}
wakeKey.onclick = wake;
consoleEl.addEventListener('click', (e) => { if (!awake && !opening && !e.target.closest('button')) wake(); });

// "Talk to him" in the hero: scroll to the demo and wake him in the same tap (the tap is what lets the browser play sound)
document.querySelectorAll('a[data-wake]').forEach((a) => a.addEventListener('click', () => { if (!awake && !opening) wake(); }));

// The first time someone touches the page, he says hello (Graham, 2026-10-27). Browsers only allow sound after a tap, so this
// waits for one; a tap that wakes the demo skips it, since his opening says hello anyway.
const TOUCH = ['pointerup', 'touchend', 'click', 'keydown'];
let helloed = false;
const helloDone = () => { helloed = true; TOUCH.forEach((t) => document.removeEventListener(t, firstTouch, true)); };
async function firstTouch(e) {
  if (helloed) return;
  if (e.target.closest && e.target.closest('#console, a[data-wake]')) return helloDone();
  const c = vctx(); if (!c) return helloDone();
  try { await c.resume(); } catch (err) {}
  if (c.state !== 'running' || helloed || awake || opening) return; // no sound allowed yet: try again on the next touch
  helloDone();
  const bubble = $('#heroSay'); bubble.classList.remove('long'); bubble.textContent = "Hello, I'm Edison."; bubble.classList.add('on');
  try { hero && hero.setMood('speaking'); } catch (err) {}
  await playClip('hello');
  // then one of four short intros, picked at random (Graham, 2026-10-29: he should keep talking after hello).
  // Waking the demo mid-line stops it, since his opening takes over.
  const more = ['helloA', 'helloB', 'helloC', 'helloD'].filter((k) => VOICE.list && VOICE.list[k]);
  if (more.length && !awake && !opening) {
    const k = more[Math.floor(Math.random() * more.length)];
    await wait(250);
    if (!awake && !opening) { bubble.classList.add('long'); bubble.textContent = VOICE.list[k].caption; await playClip(k); }
  }
  try { hero && hero.setMood('happy'); setTimeout(() => hero && hero.setMood('idle'), 1200); } catch (err) {}
  if (!awake && !opening) setTimeout(() => bubble.classList.remove('on'), 2200); else bubble.classList.remove('on');
}
TOUCH.forEach((t) => document.addEventListener(t, firstTouch, true));

// ------------------------------------------------------------ the sign-up form
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
    note.textContent = 'Preview only: sign-ups are not open yet, so nothing was sent.';
  } else {
    const body = new FormData(); body.append('email_address', email.value.trim()); body.append('fields[first]', $('#first').value.trim().slice(0, 500));
    btn.disabled = true; note.textContent = 'Adding you...';
    try {
      await fetch(WAITLIST_ENDPOINT, { method: 'POST', body, mode: 'no-cors' });
      note.textContent = "You're signed up. Check your inbox to confirm."; $('#joinForm').reset();
    } catch (err) {
      note.className = 'form-note err'; note.textContent = 'That did not go through. Please try again in a moment.';
    } finally { btn.disabled = false; }
  }
  try { hero && hero.setMood('love'); setTimeout(() => hero && hero.setMood('idle'), 4000); } catch (err) {}
});
