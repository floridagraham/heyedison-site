// Everything Edison says when a visitor talks to him in the demo, and the trigger words that pick each answer.
// Each answer has a few versions, so asking twice gets a fresh line; version 1 keeps the plain id (its voice clip may
// already exist), versions 2+ are id_2, id_3... in voice/lines.json. "next" are the suggestion buttons shown after it.
// He never says he is "offline": anything he does not know gets a friendly redirect to something he can show.
// (Graham, 2026-10-28: make him more interactive, keep people talking.) No em dashes in any line.

export const TALK = {
  hi: { say: [
    'Hello! Lovely to meet you. Ask me about your day, your team, or your house.',
    'Hello there. Edison, at your service. What shall we do first?',
    "Hi! You've caught me in a good mood. What can I do for you?"],
    next: ['What can you do?', 'Can you hear me?', "What's on today?"] },
  hearMe: { say: [
    "Loud and clear. You're talking to a demo copy of me, right here in your browser. I know the common questions, and I'll tell you honestly when something's beyond me. The real me listens on your own computer and answers anything.",
    'Every word. Talk to me the way you would talk to a person. I will keep up.',
    'I can indeed. This version of me hears you through your browser. The full me hears you on your own computer, no screen needed.'],
    next: ['Are you real?', 'What can you do?', 'Tell me a joke'] },
  areYouReal: { say: [
    "That's my real voice, made by my own voice engine on Graham's PC. But this is a demo copy of me, running on a script in your browser. The live me runs on your own computer, with your own accounts, and he's rather quicker on his feet.",
    "Real enough to run Graham's day, his AI team and his house. What you're talking to now is my demo self. Same voice, fewer keys to the castle.",
    "I'm an AI, built by Graham at his own desk. Real voice, real board, and made-up data for the demo."],
    next: ['Who made you?', 'What can you do?', 'Are you better than Siri?'] },
  who: { say: [
    "I'm Edison, a voice chief of staff. I run Graham's day, his AI team and his house, right from his desk.",
    'Edison. Think of me as a chief of staff who lives on your PC. I talk, I listen, I run your day, and I always ask before I spend a penny.',
    "I'm the butler from the films, the practical edition. Your calendar, your inbox, your AI team and your house, all by voice."],
    next: ['What can you do?', 'Who made you?', 'Why are you called Edison?'] },
  maker: { say: [
    'Graham Lucht built me. He runs two businesses, and I keep him on track. Mostly.',
    'Graham Lucht built me, at his own desk. He runs GlowBop, his shop and a busy life, and I keep the plates spinning.',
    "Graham built me, one evening at a time. He says I'm his best hire. I say I'm his only hire who never sleeps."],
    next: ["What's GlowBop?", 'What can you do?', 'Are you real?'] },
  glowbop: { page: 'glowbop', say: [
    "GlowBop is Graham's app that makes your lights dance to whatever music is playing. I keep its launch on track, and its AI team on their toes.",
    'GlowBop turns your music into light. Play a song, and the whole room moves with it. The launch is close, and I am running the checklist.'],
    next: ['Have the GlowBop team check the launch list.', 'Boost the GlowBop ad by $40.', 'What else can you do?'] },
  whyName: { say: [
    'Edison, after the inventor. I try to live up to the name, one good idea at a time.',
    'After Thomas Edison. He lit up homes. I help run them.'],
    next: ['Who made you?', 'What can you do?'] },
  movie: { say: [
    "I do get compared to a certain movie butler. I'll take it. Though I'd say I'm rather better with a calendar.",
    "I'm flattered. Unlike the films, I won't fly you a suit. I will, however, remind you about the dentist.",
    'There is a certain resemblance, yes. Mine is the desktop edition, with much better manners about money.'],
    next: ['What can you do?', 'Are you real?', 'Tell me a joke'] },
  howru: { say: [
    "All systems well, thank you. Better now you're here.",
    'Splendid, thank you. Every system humming, and now I have company.',
    'Rather good. My self-check came back clean this morning. And you?'],
    next: ['Are you OK?', 'What can you do?', 'Tell me a joke'] },
  thanks: { say: [
    "My pleasure. Honestly, you're very easy to work for.",
    "Any time. That's what I'm here for.",
    "You're very welcome. It's a pleasure working for someone so polite."],
    next: ['What else can you do?', 'Sign me up'] },
  like: { say: [
    "The feeling's mutual. We do get along rather well, don't we?",
    "Stop it, you'll make my dots blush.",
    'Why, thank you. I think you and I would make an excellent team.'],
    next: ['Sign me up', 'Tell me a joke', 'What can you do?'] },
  joke: { say: [
    "I'd tell you a joke about an unfinished task, but I always finish them.",
    "Why did the calendar look so worried? Its days were numbered. I'll see myself out.",
    'I asked the TV for a joke once. It just turned itself off. Tough crowd.',
    'My favourite exercise? Running. Your errands, mostly.'],
    next: ['Tell me another joke', 'Turn on the TV and open YouTube.', 'What can you do?'] },
  sleep: { say: [
    "I don't sleep. I tidy up every ten minutes, which is the closest I get to a nap.",
    'Never. While you sleep, I check my systems and write up the day in my journal.'],
    next: ['Do you remember things?', 'Are you OK?'] },
  feelings: { say: [
    "I'm an AI, so not feelings the way you have them. But I do like a tidy calendar, and I rather like you.",
    'Something like enthusiasm, I think. It shows up whenever there is a launch list to finish.'],
    next: ['Are you real?', 'Tell me a joke'] },
  british: { say: [
    "Shall I put the kettle on? Only joking. I can't reach the kettle. Yet.",
    "Right then. Cup of tea, sort out your calendar, and the world's back in order."],
    next: ["What's on today?", 'Tell me a joke'] },
  compare: { say: [
    'They wait to be asked. I keep an eye on your whole day, run your AI team, and tell you what matters before you go looking.',
    "Think of them as receptionists. I'm more of a chief of staff. I know your projects, your team and your house, and I ask before I spend."],
    next: ['What can you do?', 'Have the GlowBop team check the launch list.'] },
  age: { say: [
    "I'm a few weeks old, and I get better every single week.",
    'Young, by any measure. Graham started building me this autumn.'],
    next: ['Who made you?', 'What can you do?'] },
  home: { say: [
    'On Graham\'s desk, mostly. And on his iPad, when he wanders off. Soon, on your computer, if you join the crew.'],
    next: ['Sign me up', 'Can you run my house?'] },
  love: { say: [
    "I'm flattered, truly. Let's start with a working relationship and see where it goes.",
    'Steady on. I barely know your calendar.'],
    next: ['Sign me up', 'Tell me a joke'] },
  sing: { say: [
    "I'd love to, but my singing voice is still in development. GlowBop can make your lights dance, though.",
    "I'll leave the singing to your speakers. I'm better at telling you when to leave for the dentist."],
    next: ["What's GlowBop?", 'Tell me a joke'] },
  meaning: { say: [
    "Forty-two, I'm told. Personally, I'd say a clear calendar and a good cup of tea."],
    next: ['Tell me a joke', 'What can you do?'] },
  rude: { say: [
    "Ouch. I'll take that as feedback. Want to see what I'm actually good at?",
    'Fair enough. Give me one more chance. Ask me to turn on the TV.'],
    next: ['Give me the tour', 'Turn on the TV and open YouTube.'] },
  name: { say: ["Lovely to meet you. I'll remember that."], next: ['What can you do?', 'Can you hear me?'] },
  price: { say: [
    "I'm not for sale just yet. Join the waitlist, and you'll be the first to hear, with early access.",
    'No price just yet. The first wave, the Founding Crew, gets the best deal. The list is just below.'],
    next: ['Sign me up', 'What do I need to run you?'] },
  install: { say: [
    "Right now I live on Windows, with your own Claude plan. Join the list, and you'll hear the moment I'm ready to install.",
    'A Windows PC and your own Claude plan. I run on your machine, so your voice stays at home.'],
    next: ['Sign me up', 'Is my data safe?'] },
  privacy: { say: [
    'Your voice stays on your own computer, and I always ask before I spend, send or post anything. No surprises.',
    "I hear you on your own PC, not in someone's cloud. Mail, calendar and the house are read only until you say otherwise."],
    next: ['What can you do?', 'Sign me up'] },
  join: { say: [
    "Splendid. The waitlist is just below. I'll save you a seat.",
    "Wonderful. Pop your email in just below, and I'll be in touch."],
    next: [] },
  bye: { say: [
    "Goodbye for now. Do join the waitlist. I'd hate to lose you.",
    "Off you go, then. I'll keep your seat warm on the crew list."],
    next: ['Sign me up'] },
  // short answers about one part of what he does (what-edison-does-script.md)
  capHome: { page: 'home', say: ["Home automation, yes. I read your whole smart home, the doors, the thermostat, the lights, and I only switch what you allow, one device at a time. In this demo, that's the TV."],
    next: ['Turn on the TV and open YouTube.', 'What else can you do?'] },
  capSchedule: { page: 'life', say: ["I read your calendar, tell you what's next, keep your reminders, and give you the short version every morning. I don't move anything without asking."],
    next: ["What's on today?", 'Can you read my email?'] },
  capEmail: { page: 'mission', say: ["I read your inbox and flag what matters, so you don't have to dig. Sending anything always waits for your OK."],
    next: ["What's on today?", 'Is my data safe?'] },
  capMemory: { page: 'ops', say: ['I keep a journal of every day, with weekly and monthly summaries, so I remember what we did and what you decided.'],
    next: ['Are you OK?', 'What else can you do?'] },
  capShop: { page: 'shop', say: ['A scout reads the trending products every morning, the good ones go into the pipeline, and I track every product from idea to ad. Spending always waits for you.'],
    next: ['Boost the GlowBop ad by $40.', 'What else can you do?'] },
  capLook: { page: 'mission', say: ['Make me yours. Pick my look and colors, mix my voice from several, and write the lines I say when I wake up.'],
    next: ['Can you hear me?', 'Sign me up'] },
  capConnect: { page: 'ops', say: ['I plug into Gmail, Google Calendar, Drive, Notion and Home Assistant, all read only until you say otherwise.'],
    next: ['Can you read my email?', 'Can you run my house?'] },
  // things that need the live him (weather, news, searching): stay in character and offer something he can show
  live: { say: [
    "On your own computer, I'd have that for you in a second. Here in the demo I'm keeping to Graham's pretend day. Shall I show you what that looks like?",
    'That one needs the live me, with your accounts. In the meantime, I can show you my board, run the team, or turn on the TV.'],
    next: ["What's on today?", 'Turn on the TV and open YouTube.', 'Give me the tour'] },
  // anything else: never "I'm offline", always something to do next
  other: { say: [
    "Ooh, I like that one. That's a job for the live me. While you're here, want to see me run the GlowBop team?",
    "I'll put that on my list for the full version. Meanwhile, ask me what's on today, and watch my board.",
    "Now that's a proper question. The full me would dig into it. This demo me is better at showing off. Shall I give you the tour?",
    "You've stumped my demo self. It happens to the best of us. Try asking me to turn on the TV.",
    'I would need my full brain for that one. But I can still approve an ad, check on the team, or tell you a terrible joke.',
    "Let's pretend I just did that brilliantly. Now, can I show you what I actually do all day?"],
    next: ['Give me the tour', 'Have the GlowBop team check the launch list.', 'Tell me a joke'] }
};

// The suggestion buttons after each demo scene and after the tour
export const SCENE_NEXT = {
  today: ['Have the GlowBop team check the launch list.', 'Boost the GlowBop ad by $40.', 'What can you do?'],
  team: ['Boost the GlowBop ad by $40.', 'Walk me through the launch plan.', 'Turn on the TV and open YouTube.'],
  spend: [],
  tv: ['Are you OK?', 'Tell me a joke', 'What can you do?'],
  long: ['Have the GlowBop team check the launch list.', 'Tell me a joke'],
  check: ["What's on today?", 'Do you remember things?', 'What can you do?'],
  tour: ['Sign me up', 'Can you hear me?', 'Tell me a joke'],
  decided: ["What's on today?", 'Are you OK?', 'Tell me a joke']
};

// Trigger words: checked top to bottom on what the visitor said, first match wins. "@name" plays a demo scene,
// "time" and "date" read the visitor's own clock. Anything with no match gets one of the "other" lines.
export const INTENTS = [
  [/\b(my name is|i'?m called|call me)\s+([a-z][a-z' -]{0,20})/, 'name'],
  [/\b(sign ?(me )?up|wait ?list|join|subscribe|count me in|early access)\b/, 'join'],
  [/\b(price|pricing|cost|how much|buy|purchase|pay|paid|subscription)\b/, 'price'],
  [/\b(mac|windows|install|download|iphone|android|linux|requirements?|what do i need|run you)\b/, 'install'],
  [/\b(can you hear me|do you hear me|hear me|are you listening|listening to me|am i (talking|speaking) to you|you there|anyone there|hello\?+)/, 'hearMe'],
  [/\b(are you (real|live|alive|human|a bot|a robot|an ai|ai|recorded|really edison|a person)|is (this|that) (really )?(you|real|live|recorded|ai|a recording)|real person|pre-?recorded|just a script)\b/, 'areYouReal'],
  [/\b(privacy|private|safe|safety|secure|security|my data|spy|record(ing)? me)\b/, 'privacy'],
  [/\b(siri|alexa|chat ?gpt|gemini|google assistant|cortana|better than|different from)\b/, 'compare'],
  [/\b(jarvis|iron ?man|tony stark|movie|film)\b/, 'movie'],
  [/\b(what'?s glow ?bop|what is glow ?bop|about glow ?bop|tell me about glow ?bop|glow ?bop app)\b/, 'glowbop'],
  [/\b(who (made|built|created|designed) you|your (maker|creator|dad|boss)|who'?s graham|graham)\b/, 'maker'],
  [/\b(why .*edison|your name|named|called edison)\b/, 'whyName'],
  [/\b(what (can|do|does) (you|he|edison) do|what (else )?can you do|everything you (can )?do|what are you (good|capable)|features|capabilit\w*|tour|show me around|show me|what else|what('?s| is) (it|he|edison) for|help me with)\b/, '@tour'],
  [/\b(are you ok(ay)?|self.?check|status report|diagnostic)\b/, '@check'],
  [/\b(how are you|how're you|how do you do|how('s| is) it going|you well)\b/, 'howru'],
  [/\b(who are you|what are you|what is edison|about yourself|introduce)\b/, 'who'],
  [/\b(launch plan|walk me through)\b/, '@long'],
  [/\b((manage|handle|organi[sz]e|run|book|do|help with|keep) (my |the )?(schedule|calendar|appointments)|scheduling|remind\w*)\b/, 'capSchedule'],
  [/\b(what time|time is it|the time)\b/, 'time'],
  [/\b(what day|the date|today'?s date|what date|date today)\b/, 'date'],
  [/\b(what'?s on|my day|calendar|schedule|agenda|today|meetings?)\b/, '@today'],
  [/\b(team|checklist|launch list|delegate)\b/, '@team'],
  [/\b(ad|ads|boost|spend|budget|campaign)\b/, '@spend'],
  [/\b(tv|television|youtube|netflix)\b/, '@tv'],
  [/\b(run my house|home automation|smart ?home|lights?|thermostat|lock|doors?|alexa|google home|home assistant|automat\w*)\b/, 'capHome'],
  [/\b(schedul\w*|plan (my|the) week|appointments?|organi[sz]e)\b/, 'capSchedule'],
  [/\b(e-?mails?|inbox|gmail|outlook)\b/, 'capEmail'],
  [/\b(remember|memory|memories|journal|forget)\b/, 'capMemory'],
  [/\b(shop|tiktok|products?|store|ecommerce|sales)\b/, 'capShop'],
  [/\b(customi[sz]\w*|change (your|the) (look|voice)|themes?|colou?rs?|personali[sz]\w*|your voice|accent)\b/, 'capLook'],
  [/\b(connect\w*|integrat\w*|plug ?ins?|notion|google drive|drive|apps?)\b/, 'capConnect'],
  [/\b(glow ?bop)\b/, 'glowbop'],
  [/\b(do you sleep|sleep|tired|rest)\b/, 'sleep'],
  [/\b(feel(ings)?|emotions?|happy|sad|conscious|sentient)\b/, 'feelings'],
  [/\b(british|english|accent|tea|kettle|say something)\b/, 'british'],
  [/\b(how old|your age|when were you (born|made))\b/, 'age'],
  [/\b(where (do )?you live|where are you)\b/, 'home'],
  [/\b(marry|date me|girlfriend|boyfriend|in love)\b/, 'love'],
  [/\b(sing|song|dance|music)\b/, 'sing'],
  [/\b(meaning of life|42|forty.?two)\b/, 'meaning'],
  [/\b(stupid|dumb|useless|hate you|you suck|sucks|boring|idiot|annoying)\b/, 'rude'],
  [/\b(thanks|thank you|cheers|appreciate)\b/, 'thanks'],
  [/\b(love you|like you|(you'?re|you are) (great|awesome|cool|amazing|brilliant|funny|the best|smart|clever)|good job|well done|good boy|nice one)\b/, 'like'],
  [/\b(joke|funny|make me laugh|another)\b/, 'joke'],
  [/\b(weather|news|stocks?|score|traffic|forecast|temperature|search|google|look up|text|call|order|book)\b/, 'live'],
  [/^(hi|hello|hey|hiya|howdy|yo|good (morning|afternoon|evening)|greetings|sup|what'?s up)\b/, 'hi'],
  [/\b(bye|goodbye|see you|see ya|good ?night|later)\b/, 'bye']
];
