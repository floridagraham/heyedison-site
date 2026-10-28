// Edison website: two globes (hero and demo), the scripted "Try him" demo with made-up data and his board, sound cue
// buttons, the first-touch hello, and the crew list form (sent to Kit).
import { mountGlobe } from './edison-globe.js';

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
  clearAll(); const id = ++run, s = SCENES[key];
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
      if (!s.after) return afterTurn(id);
      later(() => {
        cue(s.after.cue); show(s.after.card);
        say(s.after.say, id, () => afterTurn(id), s.after.clip);
      }, s.after.wait);
    }, key), 450);
  }, 2600);
}
asks.forEach((b) => (b.onclick = () => (b.dataset.say ? talk(b.dataset.say) : b.dataset.scene === 'tour' ? tour() : play(b.dataset.scene, b))));

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
  say(yes ? "Approved. The ad is boosted, and it's in the log." : "Understood. Nothing was spent.", id, () => busy(false), yes ? 'approved' : 'rejected');
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
  { page: 'glowbop', card: tc('#FFE03B', 'Runs your AI team', ['A crew per business: a CEO and specialists', 'Jobs open as chats in your Claude app', 'A chime, then a spoken report']) },
  { page: 'shop', card: tc('var(--lime)', 'Watches the shop', ['Trending products scouted every morning', 'A pipeline from idea to ad', 'Every stage on his board']) },
  { page: 'mission', card: tc('var(--amber)', 'Asks first', ['Spend, post, send, delete: all wait on a card', 'The cost and the proof, every time', 'Stop all halts everything at once']) },
  { page: 'home', card: tc('var(--violet)', 'Runs the house', ['Reads your whole smart home', 'Switches only what you allow', 'Today: the TV, on, off or YouTube']) },
  { page: 'ops', card: tc('#FF8A1F', 'Looks after himself', ['Self-checks and cleanup every few minutes', "Fixes what's safe, tells you in a sentence", 'A daily journal, so he remembers']) },
  { page: 'mission', card: tc('var(--pink)', 'Yours to shape', ['Looks and color themes', 'A voice mixer', 'Your own wake-up lines', 'His board on your laptop and tablet']) },
  { page: 'mission', card: null }
];
async function tour(heard) {
  clearAll(); const id = ++run; busy(true);
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
  afterTurn(id);
}
// The tour's words (the same lines as voice-lines.json, so captions and voice match)
const VOICE_TEXT = {
  tour0: "Happy to give you the tour. I'll bring each part up on my board as I go. Talk over me any time.",
  tour1: "First, I talk and I listen. My hearing and my voice run on your own computer, and if you start speaking, I stop in about seventy milliseconds and answer what you actually said. Four little sounds tell you when I've heard you, when I'm thinking, and when I'm ready.",
  tour2: "I run your day. Each morning I read your calendar and your inbox and give you the short version: what's on, what's changed, and what needs you. I keep your reminders, help plan your week, and tell you what's next before you have to ask.",
  tour3: "I run your AI team. Each business gets its own crew, a CEO and specialists. Say, have the GlowBop team check the launch list, and I hand it over as a chat in your Claude app. When they're done, you hear a chime, and I read you the report.",
  tour4: 'For the shop, a scout reads the trending products every morning, the good ones go into the pipeline, and I track every product from idea to ad, so you always know where things stand.',
  tour5: 'And I always ask first. Anything that spends, posts, sends or deletes waits on a card with the cost and the proof. Nothing happens until you tap approve, and one key stops everything at once.',
  tour6: "I look after the house too. I read your smart home all day, the doors, the thermostat, the lights, and I only switch what you allow. Right now that's the TV: on, off, or straight to YouTube.",
  tour7: "I look after myself. Every few minutes I tidy up and check my voice, memory and disk, and I fix what's safe. And I keep a journal of every day, so I remember what we did last week.",
  tour8: "Finally, I'm yours to shape. Pick my look, mix my voice, write the lines I say when I wake up, and put my board on your laptop and your tablet.",
  tour9: "That's me. The full version does all of this live, with your own accounts. Join the crew, and I'll be at your desk before you know it."
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
  micOff: "I couldn't quite hear you there. Try again, or type it to me.",
  // the first thing most people ask (Graham, 2026-10-27): is he really there?
  hearMe: "Loud and clear. You're talking to a demo copy of me, right here in your browser. I know the common questions, and I'll tell you honestly when something's beyond me. The real me listens on your own computer and answers anything.",
  areYouReal: "That's my real voice, made by my own voice engine on Graham's PC. But this is a demo copy of me, running on a script in your browser. The live me runs on your own computer, with your own accounts, and he's rather quicker on his feet.",
  // short answers about one part of what he does (what-edison-does-script.md)
  capHome: "Home automation, yes. I read your whole smart home, the doors, the thermostat, the lights, and I only switch what you allow, one device at a time. In this demo, that's the TV.",
  capSchedule: "I read your calendar, tell you what's next, keep your reminders, and give you the short version every morning. I don't move anything without asking.",
  capEmail: "I read your inbox and flag what matters, so you don't have to dig. Sending anything always waits for your OK.",
  capMemory: 'I keep a journal of every day, with weekly and monthly summaries, so I remember what we did and what you decided.',
  capShop: 'A scout reads the trending products every morning, the good ones go into the pipeline, and I track every product from idea to ad. Spending always waits for you.',
  capLook: 'Make me yours. Pick my look and colors, mix my voice from several, and write the lines I say when I wake up.',
  capConnect: 'I plug into Gmail, Google Calendar, Drive, Notion and Home Assistant, all read only until you say otherwise.'
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
  [/\b(can you hear me|do you hear me|hear me|are you listening|listening to me|am i (talking|speaking) to you|you there|anyone there|hello\?+)/, 'hearMe'],
  [/\b(are you (real|live|alive|human|a bot|a robot|an ai|ai|recorded|really edison|a person)|is (this|that) (really )?(you|real|live|recorded|ai|a recording)|real person|pre-?recorded|just a script)\b/, 'areYouReal'],
  [/\b(privacy|private|safe|safety|secure|security|my data|spy|record(ing)? me)\b/, 'privacy'],
  [/\b(jarvis|iron ?man|tony stark|movie|film)\b/, 'movie'],
  [/\b(who (made|built|created|designed) you|your (maker|creator|dad)|graham)\b/, 'maker'],
  [/\b(why .*edison|your name|named)\b/, 'whyName'],
  [/\b(what (can|do|does) (you|he|edison) do|what (else )?can you do|everything you (can )?do|what are you (good|capable)|features|capabilit\w*|tour|show me around|what('?s| is) (it|he|edison) for|help me with)\b/, '@tour'],
  [/\b(are you ok(ay)?|self.?check|status report|diagnostic)\b/, '@check'],
  [/\b(how are you|how're you|how do you do|how('s| is) it going|you well)\b/, 'howru'],
  [/\b(who are you|what are you|what is edison|about yourself|introduce)\b/, 'who'],
  [/\b(launch plan|walk me through)\b/, '@long'],
  [/\b((manage|handle|organi[sz]e|run|book|do|help with|keep) (my |the )?(schedule|calendar|appointments)|scheduling|remind\w*)\b/, 'capSchedule'],
  [/\b(what'?s on|my day|calendar|schedule|agenda|today|meetings?)\b/, '@today'],
  [/\b(team|checklist|launch list|delegate)\b/, '@team'],
  [/\b(ad|ads|boost|spend|budget|campaign)\b/, '@spend'],
  [/\b(tv|television|youtube|netflix)\b/, '@tv'],
  [/\b(home automation|smart ?home|lights?|thermostat|lock|doors?|alexa|google home|home assistant|automat\w*)\b/, 'capHome'],
  [/\b(schedul\w*|remind\w*|plan (my|the) week|appointments?|organi[sz]e)\b/, 'capSchedule'],
  [/\b(e-?mails?|inbox|gmail|outlook)\b/, 'capEmail'],
  [/\b(remember|memory|memories|journal|forget)\b/, 'capMemory'],
  [/\b(shop|tiktok|products?|store|ecommerce|sales)\b/, 'capShop'],
  [/\b(customi[sz]\w*|change (your|the) (look|voice)|themes?|colou?rs?|personali[sz]\w*|your voice|accent)\b/, 'capLook'],
  [/\b(connect\w*|integrat\w*|plug ?ins?|notion|google drive|drive|apps?)\b/, 'capConnect'],
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
  if (hit === '@tour') return tour(text);
  if (hit[0] === '@') return play(hit.slice(1), null, text);
  clearAll(); const id = ++run; busy(true);
  asks.forEach((b) => b.setAttribute('aria-pressed', 'false'));
  youLine.hidden = false; youLine.textContent = text; himLine.textContent = ''; srLine.textContent = '';
  mood('listening'); state('LISTENING', 'on');
  later(() => { cue('heard'); mood('idle'); state('THINKING', 'think'); himLine.innerHTML = '<span class="cut">thinking...</span>'; }, 700);
  later(() => {
    cue('ready');
    if (hit.startsWith('offline') || hit === 'weather') screen.innerHTML = OFFLINE; else if (PITCHY.has(hit)) screen.innerHTML = PITCH;
    else if (CAPS[hit]) { showPage(CAPS[hit].page); screen.innerHTML = CAPS[hit].card(); }
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
  const bubble = $('#heroSay'); bubble.textContent = "Hello, I'm Edison."; bubble.classList.add('on');
  try { hero && hero.setMood('speaking'); } catch (err) {}
  await playClip('hello');
  try { hero && hero.setMood('happy'); setTimeout(() => hero && hero.setMood('idle'), 1200); } catch (err) {}
  setTimeout(() => bubble.classList.remove('on'), 2200);
}
TOUCH.forEach((t) => document.addEventListener(t, firstTouch, true));

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
