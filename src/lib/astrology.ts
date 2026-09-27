export type ZodiacSign = {
  name: string;
  symbol: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  dates: string;
  /** month*100+day inclusive ranges; handles Capricorn wrap */
  start: number;
  end: number;
  wrapsYear?: boolean;
};

export const ZODIAC: ZodiacSign[] = [
  { name: "Capricorn", symbol: "♑", element: "Earth", dates: "Dec 22 – Jan 19", start: 1222, end: 119, wrapsYear: true },
  { name: "Aquarius", symbol: "♒", element: "Air", dates: "Jan 20 – Feb 18", start: 120, end: 218 },
  { name: "Pisces", symbol: "♓", element: "Water", dates: "Feb 19 – Mar 20", start: 219, end: 320 },
  { name: "Aries", symbol: "♈", element: "Fire", dates: "Mar 21 – Apr 19", start: 321, end: 419 },
  { name: "Taurus", symbol: "♉", element: "Earth", dates: "Apr 20 – May 20", start: 420, end: 520 },
  { name: "Gemini", symbol: "♊", element: "Air", dates: "May 21 – Jun 20", start: 521, end: 620 },
  { name: "Cancer", symbol: "♋", element: "Water", dates: "Jun 21 – Jul 22", start: 621, end: 722 },
  { name: "Leo", symbol: "♌", element: "Fire", dates: "Jul 23 – Aug 22", start: 723, end: 822 },
  { name: "Virgo", symbol: "♍", element: "Earth", dates: "Aug 23 – Sep 22", start: 823, end: 922 },
  { name: "Libra", symbol: "♎", element: "Air", dates: "Sep 23 – Oct 22", start: 923, end: 1022 },
  { name: "Scorpio", symbol: "♏", element: "Water", dates: "Oct 23 – Nov 21", start: 1023, end: 1121 },
  { name: "Sagittarius", symbol: "♐", element: "Fire", dates: "Nov 22 – Dec 21", start: 1122, end: 1221 },
];

/** Sign-specific openers — the voice of that sun. */
const SIGN_OPENERS: Record<string, string[]> = {
  Capricorn: [
    "Steady hands build quiet miracles today.",
    "The mountain doesn't hurry — and neither should you.",
    "Someone notices your reliability.",
    "A small plan becomes the scaffold for something lasting.",
    "Discipline feels like devotion, not duty, for a few bright hours.",
    "Your patience is compounding interest the cosmos can see.",
    "Choose the solid step over the flashy leap.",
    "Ambition softens into care — build something that holds people.",
    "The long game loves you back when you show up on time.",
    "Quiet competence is your loudest charm today.",
    "A promise kept today is worth a dozen grand speeches.",
    "Legacy is just love that learned how to last.",
    "Measure the day in foundations, not fireworks.",
    "The work you do unseen still changes the house.",
    "Honor the elder in you — they already know the next right step.",
    "Status matters less than stewardship. Tend what is yours.",
    "A calendar block of focus is a love letter to your future self.",
    "Climb one honest ledge. The view arrives after the effort.",
    "Responsibility can feel like belonging when it is chosen.",
    "Build slowly enough that other people can live inside it.",
  ],
  Aquarius: [
    "A curious spark wants out of your head and into the room.",
    "Friendship is your constellation tonight.",
    "Break one tiny rule that only you invented.",
    "The future taps your shoulder with an odd, good idea.",
    "Your difference is the gift — don't sand it down.",
    "A sideways text opens a brighter orbit.",
    "Invent a kinder system for one small corner of the day.",
    "The crowd can wait; your weird truth can't.",
    "Lightning-bolt insight arrives mid-sentence — catch it.",
    "Community wants your particular frequency. Tune in.",
    "The outsider seat is sometimes the best view of the sky.",
    "Share the strange thought before you talk yourself out of it.",
    "A group chat becomes a constellation if you name the warmth.",
    "Rebel toward inclusion, not just away from the old rule.",
    "Technology, art, or a late-night theory wants a human touch.",
    "Your eccentricity is a lighthouse. Leave it on.",
    "Fix the pattern, not the person.",
    "Tomorrow's kindness can start as today's experiment.",
    "Belonging doesn't require blending in.",
    "Send the idea that feels one year early. Someone is ready.",
  ],
  Pisces: [
    "Dreams are leaving breadcrumbs.",
    "Your softness is not a weakness today — it's the weather everyone needs.",
    "Music, water, or a quiet walk will translate what words can't quite hold.",
    "Follow the gentlest instinct before the noise starts.",
    "Imagination is practical magic if you give it twenty minutes.",
    "A tide of feeling wants naming; kindness is the shore.",
    "Art finds you when you stop forcing the plot.",
    "Compassion is your compass — trust where it points.",
    "The veil is thin; listen for the whisper under the chatter.",
    "Rest is a portal. Step through without apology.",
    "A song you half-remember is trying to tell you something true.",
    "Boundaries and mercy can share the same shoreline.",
    "Let the day be lyrical. Not every hour needs a verdict.",
    "Someone's unspoken ache recognizes your presence. Stay gentle.",
    "Fantasy is a map if you bring one real step back with you.",
    "Cry if you need to. Salt water knows the way home.",
    "The poem in your chest wants a page, a voice note, or a prayer.",
    "You absorb rooms. Rinse in quiet before you absorb another.",
    "Faith today looks like trusting a feeling you can't footnote.",
    "Make something beautiful for no audience but the night.",
  ],
  Aries: [
    "Ignition without apology.",
    "A bold yes opens a door that overthinking kept locked.",
    "Friendly competition sharpens you.",
    "Start the thing you've been circling — momentum loves courage.",
    "Trust the first heat; refine it after you move.",
    "Your spark lights the room when you stop waiting for perfect.",
    "Play hard, then laugh harder.",
    "A clean beginning beats a polished hesitation.",
    "Courage today is small and immediate — take it.",
    "Lead with action; the map draws itself behind you.",
    "The first move is the spell. Cast it before noon.",
    "Protect your fire from people who only want the warmth, not the work.",
    "A sincere apology is also a kind of bravery.",
    "Race your own yesterday, not someone else's highlight reel.",
    "Passion lands better when it leaves room for a reply.",
    "Begin the project with your shoes on. Thinking can catch up.",
    "A short, honest ask beats a long, careful stall.",
    "Your impatience is information: something wants to be born.",
    "Champion someone quieter than you. That's leadership too.",
    "Strike the match, then stay to tend the flame.",
  ],
  Taurus: [
    "Pleasure is practical today: good food, a slow hour, something soft under your hands.",
    "Protect your peace like a garden.",
    "Patience pays interest.",
    "What you're tending is closer to bloom than it looks.",
    "Not every invitation deserves a seat at your table.",
    "Beauty in the body resets the mind — stretch, taste, breathe.",
    "Stability is a love language. Offer it to yourself first.",
    "A loyal yes is worth more than a dozen maybe's.",
    "Sensory joy is not a distraction; it's fuel.",
    "Hold your ground gently. Roots beat rush.",
    "The good life is made of repeatable comforts. Repeat one.",
    "Money, time, and attention are the same garden. Water what you mean to keep.",
    "A handmade thing — even a sandwich — counts as devotion.",
    "Stubbornness becomes wisdom when it guards what is sacred.",
    "Sit somewhere beautiful for longer than feels efficient.",
    "Your no protects the yes you already gave.",
    "Touch grass, linen, dough, or a pet. The body believes you.",
    "Slow affection outlasts dramatic promises.",
    "Invest in the room you actually live in.",
    "Abundance starts as enough, noticed on purpose.",
  ],
  Gemini: [
    "Two truths can sit at the same table.",
    "Your words travel farther than usual — make them kind and specific.",
    "A quick pivot isn't flaky; it's fluent.",
    "Ask one more question before you decide.",
    "Follow the brighter thread in the conversation.",
    "Wit opens doors sincerity keeps open.",
    "A short note lands louder than a long speech.",
    "Curiosity is your passport — stamp something new.",
    "Trade gossip for genuine intrigue.",
    "Your mind wants a playmate. Find one.",
    "Tell the story twice: once for sparkle, once for truth.",
    "A library, a podcast, or a stranger's tangent feeds you today.",
    "Connect two people who should have met years ago.",
    "Restlessness is a compass if you give it one destination.",
    "Write the text, then delete the clever jab. Send the warmth.",
    "Both sides of you get a vote. Neither gets a veto on joy.",
    "Learn a tiny skill you can show someone before sunset.",
    "The group needs a translator. That's often you.",
    "Change your route home. New streets rewrite old thoughts.",
    "Name the joke and the feeling underneath it.",
  ],
  Cancer: [
    "Home is a feeling you can pack.",
    "Check on your people — and let someone check on you.",
    "Nostalgia is a compass, not a cage.",
    "Bring a little hearth with you into the day.",
    "The tide runs both ways; receive as well as give.",
    "Keep the lesson; release the weight.",
    "Soft boundaries are still boundaries — draw one kindly.",
    "Family (chosen or blood) needs your particular warmth.",
    "A meal shared is a spell that works.",
    "Tend the inner child; the adult will thank you.",
    "The photo, the recipe, the old nickname — memory wants a witness.",
    "You don't have to host the whole ocean. One cup of care is enough.",
    "Protect the mood of the house like you'd protect a sleeping child.",
    "A text that says 'I remembered' heals more than advice.",
    "Moonlight thinking is valid. Write it down before morning argues.",
    "Let someone feed you. Receiving keeps the circle alive.",
    "The past knocks to be honored, not to move back in.",
    "Your sensitivity is a family heirloom. Handle it with pride.",
    "Make the bed, light the lamp, call it ceremony.",
    "Belonging is built in repetitions: same table, new day.",
  ],
  Leo: [
    "Your light doesn't need permission.",
    "Celebrate a small win out loud.",
    "Lead with heart, not volume.",
    "Offer your warmth generously and watch the room brighten.",
    "Joy multiplies when it's witnessed — invite a witness.",
    "The crown fits better when it's made of kindness.",
    "Creative fire wants a stage, even a tiny one.",
    "Pride in your people is holy today. Say it.",
    "Shine without dimming anyone else.",
    "A playful roar beats a heavy silence.",
    "Dress like the day already loves you.",
    "Applause you give away comes back warmer.",
    "The dramatic feeling is real. Give it art instead of a spiral.",
    "Loyalty looks gorgeous on you. Spend it where it's mutual.",
    "A photo, a toast, a silly voice — document the glow.",
    "You are allowed to be seen wanting something beautiful.",
    "Generosity is your spotlight. Aim it at someone overlooked.",
    "Rest is part of the performance. Even suns set.",
    "Tell the people in your orbit why they matter, in plain words.",
    "Create first, edit later. The spark hates a committee.",
  ],
  Virgo: [
    "Order one corner of the chaos and the rest softens.",
    "Your careful eye catches what others miss.",
    "Rest is also maintenance.",
    "Tiny repairs, real relief.",
    "Share the fix without the lecture.",
    "Schedule kindness to yourself like any other task.",
    "Precision is love when it serves people, not perfection.",
    "Clear the clutter; clarity follows.",
    "A useful ritual beats a grand resolution.",
    "Help where it's quiet — that's where you're needed.",
    "The list is a friend if it includes joy, not only chores.",
    "Good enough, finished, and kind beats perfect and late.",
    "Notice the detail that would make someone feel considered.",
    "Your standards are a gift when they include your own nervous system.",
    "Edit the day, not the person.",
    "A clean counter, a sent email, a folded blanket: small holy work.",
    "Ask what would actually help before you optimize their life.",
    "Health is a craft. One honest habit is the masterpiece.",
    "Let 'I don't know yet' be as precise as a plan.",
    "Service without self-erasure is the grown-up version of care.",
  ],
  Libra: [
    "Balance isn't stillness; it's a graceful adjustment.",
    "Beauty in the small things resets the whole day.",
    "A fair ask clears the air.",
    "Harmony loves honesty more than silence.",
    "Shift until it feels true — then stay.",
    "A table, a playlist, a kind reply: design the mood.",
    "Partnership thrives when both voices have room.",
    "Diplomacy with backbone is your superpower today.",
    "Choose the elegant solution that still tells the truth.",
    "Symmetry can wait; sincerity can't.",
    "The peace you want starts with one unsent harsh sentence.",
    "Invite someone into the decision instead of carrying it alone.",
    "Aesthetics are ethics when they make people feel welcome.",
    "You don't have to like both options. You have to choose one.",
    "A compliment with specifics is a work of art.",
    "Repair the tone before you repair the facts.",
    "Love looks like sharing the good chair.",
    "Your taste is a compass. Follow it into one small purchase or plan.",
    "Fairness includes you. Put your name on the list.",
    "Make the room kinder by how you enter it.",
  ],
  Scorpio: [
    "Go one layer deeper than polite.",
    "Your intuition is loud for a reason.",
    "Release what you've already outgrown.",
    "The real conversation is waiting underneath.",
    "Don't dilute the knowing to keep the peace.",
    "Empty space is an invitation, not a loss.",
    "Loyalty is sacred — spend it where it's returned.",
    "Transform one sticky feeling into clear action.",
    "Privacy is power; share only what feels earned.",
    "Truth with tenderness changes everything.",
    "The secret you keep from yourself is the one that costs the most.",
    "Intensity is a lantern. Don't use it as a weapon.",
    "A clean ending frees a truer beginning.",
    "Investigate with care, not suspicion.",
    "Someone trusts you with the unpretty part. Honor that.",
    "Power today is restraint: say less, mean more.",
    "Jealousy is a clue about desire. Read it, don't obey it.",
    "Alchemy is available: turn the grudge into a boundary.",
    "The night tells the truth the afternoon edited out.",
    "Devotion without control is the mature magic.",
  ],
  Sagittarius: [
    "The horizon is calling in a familiar voice.",
    "Humor is your passport today.",
    "Teach what you just learned.",
    "Say yes to a little more sky.",
    "Use laughter to cross a sticky moment.",
    "The lesson sticks when it leaves your mouth.",
    "Adventure can be a new street, not a new country.",
    "Optimism with evidence — look for both.",
    "Stretch your map; leave room for wonder.",
    "Freedom loves a plan loose enough to breathe.",
    "A question asked in good faith is a kind of pilgrimage.",
    "Don't outrun the people you meant to bring along.",
    "Faith and facts can share a suitcase.",
    "Tell the big story, then stay for the small follow-up.",
    "Luck favors the person who packed snacks and curiosity.",
    "Your bluntness heals when it includes hope.",
    "Study something vast for twenty minutes. Let it resize your worry.",
    "The road home counts as travel too.",
    "Promise less, explore more, tell the truth faster.",
    "Wonder is a responsibility. Point it at someone who forgot.",
  ],
};

/** Element color — a second voice so readings feel longer and less repetitive. */
const ELEMENT_LINES: Record<ZodiacSign["element"], string[]> = {
  Fire: [
    "Heat wants a direction: aim it at creation, not conflict.",
    "Courage is contagious when you go first.",
    "Burn bright, then leave coals for someone else to cook with.",
    "The spark in your chest is a message, not an emergency.",
    "Play is serious medicine for a fire sign.",
    "Passion lands when you let other people have the next line.",
    "A brave hour beats a perfect week that never starts.",
    "Warmth without pride still leads the room.",
    "Let the flame be useful: a meal, a joke, a beginning.",
    "You don't have to win the day. You have to light it.",
  ],
  Earth: [
    "The body keeps the score and the blessings. Check in with both.",
    "What you can touch, you can trust a little more today.",
    "Slow progress is still a kind of orbit.",
    "Steadiness is glamorous when the world is loud.",
    "Feed yourself like you are someone you promised to protect.",
    "The practical step is the spiritual one.",
    "Roots and routines are how love stays.",
    "Make it real: a time, a place, a dish, a dollar, a door.",
    "Beauty you can hold will calm a mind that won't sit still.",
    "Tend one living thing — a plant, a plan, a person, yourself.",
  ],
  Air: [
    "A clear sentence can change a whole afternoon.",
    "Ideas need air. Say one out loud before it goes stale.",
    "Connection is the assignment, not the distraction.",
    "Trade three tabs of noise for one true conversation.",
    "Your mind is weather. You can still choose the window you open.",
    "Curiosity is kinder than certainty today.",
    "Write it down so the thought can rest.",
    "The right question is more intimate than a speech.",
    "Share the link, the laugh, the theory — then listen back.",
    "Language is a hearth. Invite someone to sit in it.",
  ],
  Water: [
    "Feelings are data. Treat them with respect, not panic.",
    "The mood will move. You don't have to outrun it.",
    "Tenderness is a skill. Practice it on yourself first.",
    "What you absorb, you can also release.",
    "A private cry or a private song both count as maintenance.",
    "Intuition speaks in images. Don't demand it use a spreadsheet.",
    "Care is powerful when it includes a boundary.",
    "Let the feeling finish its sentence before you fix it.",
    "Memory is a tide. Visit, then come back to shore.",
    "Softness shared on purpose becomes shelter.",
  ],
};

/** Shared middle threads — rotate daily so each calendar day feels new. */
const DAY_THREADS = [
  "A small kindness changes the weather in the room.",
  "Text the person who crossed your mind twice.",
  "Leave ten minutes unscheduled and let luck find you.",
  "Name one fear out loud — it shrinks in daylight.",
  "Trade urgency for presence just once this afternoon.",
  "Wear the color that makes you feel like yourself.",
  "Cook something simple as if it were a celebration.",
  "Say the compliment you've been rehearsing in your head.",
  "Walk without headphones and notice three beautiful accidents.",
  "Choose the kinder interpretation of someone's silence.",
  "Finish one undone thing that has been humming in the background.",
  "Ask for help before you burn the candle at both ends.",
  "Write three lines you'll be glad you kept.",
  "Put your phone face-down during the best part of the day.",
  "Forgive a tiny version of yourself from last year.",
  "Make the next yes specific and the next no guilt-free.",
  "Look up — literally — and borrow a little sky.",
  "Offer water, tea, or time. Hospitality is a spell.",
  "Let a plan be 80% ready and begin anyway.",
  "Keep a promise to your body: stretch, hydrate, or sleep.",
  "Retell a family story with more laughter than before.",
  "Spend five minutes on something useless and delightful.",
  "Swap judgment for curiosity in one sticky moment.",
  "Light a candle, open a window, reset the room's mood.",
  "Send proof of love — a photo, a voice note, a meme that fits.",
  "Protect one quiet hour like it's a VIP guest.",
  "Learn one new fact about the cosmos or someone you love.",
  "Do the brave boring thing: confirm, pay, schedule, send.",
  "Leave a place better than you found it — including a conversation.",
  "Choose warmth over winning when the stakes are small.",
  "End the day with one honest sentence about how you feel.",
  "Remember someone you haven't spoken to. Let that count as care.",
  "Put a name in the sky of your mind and wish them well without needing a reply.",
  "The person who shaped you still lives in a gesture. Notice it.",
  "Call the house, even if you only stay for three true sentences.",
  "Share a childhood detail someone else has never heard.",
  "Make room at the table in your head for chosen family.",
  "Apologize for the small thing before it grows a mythology.",
  "Bless the ordinary hour: dishes, commute, bedtime, group chat.",
  "If you can't visit, send a specific memory. Specific is intimate.",
  "Let an old friend stay important even if the chat is quiet.",
  "Ask an elder one question you've never asked.",
  "Tell a child — or the child in someone — that they are easy to love.",
  "Repair a nickname, a recipe, a ritual. Continuity is romance.",
  "Notice who makes the room feel like home and thank them today.",
  "Carry one person who isn't in the room by doing something they'd be proud of.",
  "The group text is a hearth if you put something warm in it.",
  "Leave a light on, metaphorically: a 'thinking of you' with no agenda.",
  "Sort one drawer and one feeling. Both count as housekeeping.",
  "Say the family truth kindly while everyone is still here to hear it.",
  "Dance in the kitchen like the ancestors are the audience.",
  "Give the benefit of the doubt to someone who usually gets your sharpness.",
  "Plan a future meal with someone you miss.",
  "Keep a photo nearby that reminds you you are already loved.",
  "Offer the story of how you met someone. Origin myths matter.",
  "Let silence with a safe person be enough company.",
  "Buy or make the small thing that says 'you were on my mind.'",
  "Forgive the version of your family that couldn't know better yet.",
  "Mark the day on a calendar with a private star.",
  "Speak to the night sky as if it were a guestbook.",
];

type Element = ZodiacSign["element"];

type GatewayFocus = {
  name: string;
  line: string;
  /** A 60-second practice — a threshold, not a clinical method. */
  practice: string;
  elements: Element[];
};

/**
 * Gateway tones — public Monroe vocabulary used as poetry, not a method.
 * Each sign draws from foci that fit its element, so the rite feels native.
 */
const GATEWAYS: GatewayFocus[] = [
  {
    name: "Focus 10",
    line: "Mind awake, body quiet. Let the day arrive without dragging your nerves behind it.",
    practice: "Sit still. Let your body grow heavy while your attention stays bright, like a lamp in a sleeping house.",
    elements: ["Earth", "Water"],
  },
  {
    name: "Focus 12",
    line: "Awareness wider than the room. Someone you have not spoken to still fits inside this field.",
    practice: "Picture your awareness expanding past the walls, past the street, until it can hold everyone you have ever loved.",
    elements: ["Air", "Water"],
  },
  {
    name: "Focus 15",
    line: "Time loosens its grip. The love you meant to send is not late. It is waiting at the edge of now.",
    practice: "Imagine the clock going quiet. Past and future sit at the same table. Send one old kindness forward.",
    elements: ["Water", "Air"],
  },
  {
    name: "Focus 21",
    line: "The far shore of memory. Visit, bless what you find, and come back carrying only the warmth.",
    practice: "Walk to the edge of an old memory. Bless it without reliving it. Return with only the warmth.",
    elements: ["Water"],
  },
  {
    name: "Resonant tuning",
    line: "Both sides of you agree for a moment. Thought and feeling stop arguing and become one note.",
    practice: "Hum three long, low breaths. Feel the sound in your chest. Let the vibration settle the noise.",
    elements: ["Air", "Fire"],
  },
  {
    name: "Energy conversion box",
    line: "Not every weight needs carrying today. Some things can wait in a box you trust.",
    practice: "Picture a sturdy box. Place one worry inside, close the lid, and set it down. It will keep.",
    elements: ["Earth", "Fire"],
  },
  {
    name: "Energy bar",
    line: "Charge only what you mean to keep. Attention is the current. Spend it like it is sacred.",
    practice: "Imagine a bar of light in your hands. Point it at one thing you want to grow today. Nothing else.",
    elements: ["Fire"],
  },
  {
    name: "The click",
    line: "A small interior yes. You do not force the shift. You notice you already moved.",
    practice: "Breathe out slowly and wait for the tiny click of ease. Don't chase it. Just notice when it lands.",
    elements: ["Air", "Earth"],
  },
  {
    name: "Living pattern",
    line: "What you repeat becomes the shape of the day. One kind pattern is enough to retune it.",
    practice: "Choose one small gesture — a word, a glance, a glass of water — and repeat it with intention all day.",
    elements: ["Earth"],
  },
  {
    name: "Hemi-sync",
    line: "Left and right, logic and myth, meet in the middle. Speak from that meeting.",
    practice: "Close your eyes. Picture the two halves of your mind as two stars drawing into one steady orbit.",
    elements: ["Air", "Fire"],
  },
  {
    name: "Resonant energy balloon",
    line: "A field of calm moves with you. It is gentle, porous, and yours.",
    practice: "Imagine a soft sphere of light around you. Let it cool anger, warm fear, and keep your center clear.",
    elements: ["Fire", "Water"],
  },
  {
    name: "Free flow",
    line: "Stop steering for a minute. The current knows a quieter route home.",
    practice: "Let thoughts drift like clouds for sixty seconds. Do not follow any of them. Watch the sky between.",
    elements: ["Water", "Air"],
  },
  {
    name: "Patterning",
    line: "What you picture with feeling becomes easier to walk toward.",
    practice: "See one good moment from tomorrow in detail: the light, the voice, the relief. Feel it as already true.",
    elements: ["Fire", "Earth"],
  },
  {
    name: "The gateway",
    line: "A doorway, not an escape. Step through, remember someone, and return more yourself.",
    practice: "Picture a doorway of soft gold. Step through, think of someone who crossed your path, and step back.",
    elements: ["Fire", "Earth", "Air", "Water"],
  },
];

/** Energy conversion box — one thing to set aside for today. */
const BOX_PROMPTS = [
  "the email you are dreading",
  "a conversation that ended badly",
  "the part of you that thinks you're behind",
  "someone else's mood",
  "a mistake you already apologized for",
  "the future you can't control yet",
  "the need to be understood by everyone",
  "a bill, a deadline, a list",
  "an old version of yourself",
  "the fear of being forgotten",
  "tomorrow's problem",
  "the urge to prove something",
];

/** Remembrance — who to silently send warmth toward. */
const SEND_PROMPTS = [
  "someone you haven't spoken to in years",
  "a teacher who believed in you early",
  "a friend from a season that ended",
  "someone who fed you once",
  "a stranger who was kind at the right moment",
  "an elder whose laugh you still remember",
  "a cousin you drifted from",
  "someone you owe a thank-you",
  "a person who made you feel safe",
  "someone carrying a heavy week right now",
  "the child you used to be",
  "someone who is proud of you without saying it",
  "a coworker who made the hard days lighter",
  "a neighbor from a house you left behind",
];

/** First-person lines meant to be spoken once. */
const AFFIRMATIONS: Record<string, string[]> = {
  Capricorn: [
    "I build what can hold the people I love.",
    "My steadiness is a form of care.",
    "I keep the promise, including the one I made to myself.",
    "Slow work is still sacred work.",
    "I am allowed to rest without losing my place.",
    "What I tend today becomes shelter later.",
  ],
  Aquarius: [
    "My difference is a doorway, not a distance.",
    "I belong without blending in.",
    "The future can use my strange, good idea.",
    "I tune the world kinder by being precisely myself.",
    "Friendship is my constellation, and I am already in it.",
    "I share the thought before I sand it down.",
  ],
  Pisces: [
    "I trust the feeling, and I still come back to shore.",
    "My softness is strength with the volume turned true.",
    "I can dream and still choose what is real.",
    "Compassion includes me.",
    "I release what is not mine to carry.",
    "Beauty moves through me and does not have to stay stuck.",
  ],
  Aries: [
    "I begin, and the path answers.",
    "My courage can be small and still count.",
    "I lead with heat and leave room for a reply.",
    "I start before I feel finished.",
    "My fire warms; it does not have to scorch.",
    "A clean yes is enough to change the hour.",
  ],
  Taurus: [
    "I am allowed to go slow and still be abundant.",
    "My body is on my side.",
    "Peace is worth protecting.",
    "I already have enough to make today beautiful.",
    "Loyalty to myself comes first.",
    "Pleasure is practical, and I welcome it.",
  ],
  Gemini: [
    "My words can be bright and kind in the same breath.",
    "Two truths can live in me without a fight.",
    "Curiosity is how I love the world.",
    "I say the specific thing, not just the clever one.",
    "I am fluent in change and still trustworthy.",
    "A short, warm note is a complete gift.",
  ],
  Cancer: [
    "Home lives in me, and I can offer it anywhere.",
    "I remember people, and that remembering is love.",
    "I can care deeply and still have a boundary.",
    "I receive as generously as I give.",
    "The hearth I carry is real.",
    "Nostalgia guides me; it does not cage me.",
  ],
  Leo: [
    "I shine without asking anyone else to dim.",
    "My warmth is welcome in the room.",
    "I celebrate the people I love out loud.",
    "Joy is serious enough to protect.",
    "I am seen, and I do not have to perform to deserve it.",
    "My heart is a bright and accurate compass.",
  ],
  Virgo: [
    "Careful is a form of love, including toward myself.",
    "I can help without disappearing.",
    "Good and finished is holier than perfect and stuck.",
    "My eye for detail is a gift, not a verdict.",
    "Rest is part of the work.",
    "I repair what I can and release what I cannot.",
  ],
  Libra: [
    "I choose the peace that still tells the truth.",
    "My voice belongs in the balance.",
    "Beauty is how I make people feel welcome.",
    "I can decide without abandoning myself.",
    "Harmony includes honesty.",
    "I design the mood, then I tell the truth inside it.",
  ],
  Scorpio: [
    "I can know deeply and stay gentle.",
    "My intensity is a lantern, not a weapon.",
    "I share what is earned and keep what is sacred.",
    "Truth with tenderness changes the room.",
    "I release what I have already outgrown.",
    "Devotion does not require control.",
  ],
  Sagittarius: [
    "I keep wonder, and I bring people with me.",
    "My honesty can hold hope at the same time.",
    "The horizon is large enough for my questions.",
    "I am free without leaving anyone unloved.",
    "Laughter is a bridge, and I can build it.",
    "I say yes to a little more sky.",
  ],
};

const CLOSINGS = [
  "Keep the soft parts visible.",
  "The orbit answers when you show up.",
  "Fresh air follows.",
  "Let that warmth land; you earned it.",
  "Momentum loves courage.",
  "Joy multiplies in company.",
  "Trust the quieter signal.",
  "You're more ready than you feel.",
  "Tonight, rest like you mean it.",
  "Carry the good thought into tomorrow.",
  "The hearth is portable — take it with you.",
  "Stars don't rush; neither must you.",
  "You are already in someone's sky.",
  "Love doesn't expire when the conversation pauses.",
  "Leave a little light on for the next person.",
  "The estate of your heart has room.",
  "What you remember, you keep alive.",
  "Come home to yourself before the day ends.",
  "A gentle orbit still holds.",
  "Let the night keep what you can't solve.",
  "Belonging was never a performance.",
  "Take the kindness personally.",
  "The universe noticed you noticing someone else.",
  "Stay luminous in the ways that don't require an audience.",
];

function md(month: number, day: number) {
  return month * 100 + day;
}

export function getZodiacSign(month: number, day: number): ZodiacSign {
  const key = md(month, day);
  for (const sign of ZODIAC) {
    if (sign.wrapsYear) {
      if (key >= sign.start || key <= sign.end) return sign;
    } else if (key >= sign.start && key <= sign.end) {
      return sign;
    }
  }
  return ZODIAC[0];
}

function signOffset(signName: string): number {
  let h = 0;
  for (let i = 0; i < signName.length; i++) h = (h * 33 + signName.charCodeAt(i)) >>> 0;
  return h;
}

/** UTC calendar day number — stable across timezones for the same civil date. */
function dayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

function pick<T>(list: T[], day: number, salt: number, stride: number): T {
  const idx = ((day * stride + salt) % list.length + list.length) % list.length;
  return list[idx];
}

export type DailyReading = {
  prose: string;
  gateway: { name: string; line: string; practice: string };
  affirmation: string;
  /** The 60-second rite, in order: tune, box, cross, speak, send. */
  rite: Array<{ step: string; text: string }>;
};

/**
 * Deterministic daily rite: horoscope prose, an element-matched gateway focus,
 * one spoken line, and a remembrance to send. Changes every calendar day.
 */
export function dailyReading(signName: string, date = new Date()): DailyReading {
  const sign = ZODIAC.find((s) => s.name === signName);
  const elementName = sign?.element ?? "Fire";
  const openers = SIGN_OPENERS[signName] ?? SIGN_OPENERS.Leo;
  const affirmations = AFFIRMATIONS[signName] ?? AFFIRMATIONS.Leo;
  const elementLines = ELEMENT_LINES[elementName];
  const foci = GATEWAYS.filter((g) => g.elements.includes(elementName));
  const day = dayNumber(date);
  const salt = signOffset(signName);
  const opener = pick(openers, day, salt, 7);
  const element = pick(elementLines, day, salt * 5, 11);
  const thread = pick(DAY_THREADS, day, salt * 3, 13);
  const closing = pick(CLOSINGS, day, salt * 11, 5);
  const gateway = pick(foci, day, salt * 17, 3);
  const affirmation = pick(affirmations, day, salt * 19, 5);
  const box = pick(BOX_PROMPTS, day, salt * 23, 7);
  const send = pick(SEND_PROMPTS, day, salt * 29, 5);

  return {
    prose: `${opener} ${element} ${thread} ${closing}`,
    gateway: { name: gateway.name, line: gateway.line, practice: gateway.practice },
    affirmation,
    rite: [
      { step: "Tune", text: "Three slow breaths out, humming low. Let the chest buzz." },
      { step: "Box", text: `Set down ${box}. It will keep until you choose to open it.` },
      { step: "Cross", text: gateway.practice },
      { step: "Speak", text: `Out loud, once: “${affirmation}”` },
      { step: "Send", text: `Think of ${send}. Wish them well. No reply needed.` },
    ],
  };
}

export function formatBirthday(month: number, day: number): string {
  return new Date(2000, month - 1, day).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });
}

/** Days until next birthday (0 = today). */
export function daysUntilBirthday(month: number, day: number, from = new Date()): number {
  const year = from.getFullYear();
  const today = new Date(year, from.getMonth(), from.getDate());
  let next = new Date(year, month - 1, day);
  if (next < today) next = new Date(year + 1, month - 1, day);
  return Math.round((next.getTime() - today.getTime()) / 86_400_000);
}

/** Local calendar key YYYY-M-D for refreshing UI at midnight. */
export function calendarDayKey(date = new Date()): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
