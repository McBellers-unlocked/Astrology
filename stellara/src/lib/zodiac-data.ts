// Shared zodiac sign data for the Stellara astrology platform

export interface ZodiacSignData {
  slug: string;
  name: string;
  symbol: string;
  dates: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
}

export const SIGNS: ZodiacSignData[] = [
  { slug: 'aries', name: 'Aries', symbol: '\u2648', dates: 'Mar 21 - Apr 19', element: 'Fire' },
  { slug: 'taurus', name: 'Taurus', symbol: '\u2649', dates: 'Apr 20 - May 20', element: 'Earth' },
  { slug: 'gemini', name: 'Gemini', symbol: '\u264A', dates: 'May 21 - Jun 20', element: 'Air' },
  { slug: 'cancer', name: 'Cancer', symbol: '\u264B', dates: 'Jun 21 - Jul 22', element: 'Water' },
  { slug: 'leo', name: 'Leo', symbol: '\u264C', dates: 'Jul 23 - Aug 22', element: 'Fire' },
  { slug: 'virgo', name: 'Virgo', symbol: '\u264D', dates: 'Aug 23 - Sep 22', element: 'Earth' },
  { slug: 'libra', name: 'Libra', symbol: '\u264E', dates: 'Sep 23 - Oct 22', element: 'Air' },
  { slug: 'scorpio', name: 'Scorpio', symbol: '\u264F', dates: 'Oct 23 - Nov 21', element: 'Water' },
  { slug: 'sagittarius', name: 'Sagittarius', symbol: '\u2650', dates: 'Nov 22 - Dec 21', element: 'Fire' },
  { slug: 'capricorn', name: 'Capricorn', symbol: '\u2651', dates: 'Dec 22 - Jan 19', element: 'Earth' },
  { slug: 'aquarius', name: 'Aquarius', symbol: '\u2652', dates: 'Jan 20 - Feb 18', element: 'Air' },
  { slug: 'pisces', name: 'Pisces', symbol: '\u2653', dates: 'Feb 19 - Mar 20', element: 'Water' },
];

export const ELEMENT_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  Fire: {
    bg: 'bg-stardust-500/10',
    text: 'text-stardust-400',
    border: 'border-stardust-500/30',
    glow: 'shadow-[0_0_12px_rgba(251,191,36,0.15)]',
  },
  Earth: {
    bg: 'bg-aurora-500/10',
    text: 'text-aurora-400',
    border: 'border-aurora-500/30',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.15)]',
  },
  Air: {
    bg: 'bg-celestial-500/10',
    text: 'text-celestial-200',
    border: 'border-celestial-500/30',
    glow: 'shadow-[0_0_12px_rgba(124,58,237,0.15)]',
  },
  Water: {
    bg: 'bg-nebula-500/10',
    text: 'text-nebula-400',
    border: 'border-nebula-500/30',
    glow: 'shadow-[0_0_12px_rgba(236,72,153,0.15)]',
  },
};

export const HOROSCOPE_TEASERS: Record<string, string> = {
  aries:
    'A burst of creative energy arrives this morning, urging you to start something bold. Trust the spark\u2014your instincts are razor-sharp today, and the universe is clearing a path just for you.',
  taurus:
    'Comfort calls, but so does curiosity. A surprise conversation could shift your perspective on finances or self-worth. Lean into the unexpected; the best things today come unplanned.',
  gemini:
    'Your words carry extra magic today\u2014speak with intention and watch doors fly open. A message from someone you haven\'t heard from in a while might just make your afternoon.',
  cancer:
    'The moon whispers of home and heart. You\'re radiating warmth that others can feel from across the room. A small act of kindness you offer today ripples further than you\'ll ever know.',
  leo:
    'All eyes are on you, and honestly? You\'re ready for it. Channel that spotlight energy into a passion project. Romance has a playful, flirtatious undertone\u2014enjoy every moment of it.',
  virgo:
    'Your analytical mind is a superpower today. A problem everyone else overlooked? You\'ll solve it before lunch. Give yourself permission to celebrate the win instead of moving straight to the next task.',
  libra:
    'Balance isn\'t about staying still\u2014it\'s about dancing gracefully through change. A partnership opportunity sparkles on the horizon. Trust your taste; your aesthetic eye is impeccable right now.',
  scorpio:
    'Intensity meets intuition in the most beautiful way today. You\'ll see through pretense effortlessly. Channel that depth into a meaningful conversation, and watch a connection transform before your eyes.',
  sagittarius:
    'Adventure is calling\u2014even if it\'s just a new coffee shop or an unexpected podcast. Your optimism is magnetic today, drawing exactly the right people and opportunities into your orbit.',
  capricorn:
    'Steady progress meets a sudden breakthrough. Something you\'ve been building quietly is about to get noticed. Stay grounded in your vision; the recognition you deserve is arriving on schedule.',
  aquarius:
    'Your unconventional thinking is especially brilliant today. A flash of inspiration could reshape how you approach a long-standing challenge. Share your vision\u2014others are ready to listen.',
  pisces:
    'Your intuition is singing loud and clear. Pay attention to dreams, symbols, and those quiet nudges from the universe. A creative endeavor gets a beautiful boost of celestial inspiration.',
};

export const HOROSCOPE_RATINGS: Record<string, { overall: number; love: number; career: number; wellness: number }> = {
  aries: { overall: 4, love: 3, career: 5, wellness: 4 },
  taurus: { overall: 3, love: 4, career: 3, wellness: 5 },
  gemini: { overall: 5, love: 4, career: 4, wellness: 3 },
  cancer: { overall: 4, love: 5, career: 3, wellness: 4 },
  leo: { overall: 5, love: 5, career: 4, wellness: 3 },
  virgo: { overall: 4, love: 3, career: 5, wellness: 4 },
  libra: { overall: 4, love: 4, career: 4, wellness: 4 },
  scorpio: { overall: 3, love: 4, career: 3, wellness: 5 },
  sagittarius: { overall: 5, love: 3, career: 4, wellness: 4 },
  capricorn: { overall: 4, love: 3, career: 5, wellness: 3 },
  aquarius: { overall: 4, love: 4, career: 5, wellness: 3 },
  pisces: { overall: 3, love: 5, career: 3, wellness: 5 },
};

export interface FullHoroscope {
  paragraphs: string[];
  luckyNumber: number;
  luckyColor: string;
  compatibility: string;
  moonReading: string[];
  risingReading: string[];
}

export function getFullHoroscope(slug: string): FullHoroscope {
  const horoscopes: Record<string, FullHoroscope> = {
    aries: {
      paragraphs: [
        'Today the cosmos ignites your pioneering spirit with a powerful Mars-Jupiter trine lighting up your chart. You woke up feeling like you could conquer the world\u2014and honestly, you\u2019re not far off. That restless energy humming through you isn\u2019t anxiety; it\u2019s pure creative potential waiting to be channeled into something extraordinary. The morning hours are especially potent for launching new initiatives or having that courageous conversation you\u2019ve been rehearsing in your head.',
        'By midday, Mercury\u2019s harmonious aspect to your sign sharpens your communication skills to a fine point. Presentations, pitches, and even casual brainstorms flow effortlessly. You have a rare ability today to articulate complex ideas in a way that genuinely moves people. A colleague or mentor may approach you with an unexpected opportunity\u2014don\u2019t dismiss it as too ambitious. The universe specifically curated this moment for your bold energy.',
        'The evening invites you to slow down just enough to savor what you\u2019ve built. Venus casts a warm glow over your social sector, making dinner with friends or a spontaneous outing feel genuinely nourishing. If you\u2019re in a relationship, your partner may surprise you with a gesture that reminds you why you fell for them. Single Aries: someone who matches your fire could appear when you least expect it.',
        'As the day closes, take a moment to journal or meditate on what you\u2019re building. The seeds you plant during this transit have staying power\u2014this isn\u2019t fleeting inspiration but the foundation of something lasting. Trust your instincts, honor your energy, and remember that rest is not the opposite of ambition; it\u2019s what sustains it.',
      ],
      luckyNumber: 7,
      luckyColor: 'Crimson Red',
      compatibility: 'Leo',
      moonReading: [
        'Your emotional landscape is unusually vivid today, dear Aries Moon. The lunar transit through your fourth house stirs deep feelings about home, family, and where you truly belong. You may find yourself reminiscing about childhood memories or feeling a sudden urge to rearrange your living space\u2014honor that impulse, as it reflects an inner shift toward greater emotional security.',
        'A conversation with a family member or close friend could surface old wounds, but today\u2019s energy supports healing rather than reopening. Approach these moments with the courage your Aries Moon is famous for, but temper it with tenderness. The breakthrough you experience will create lasting peace in a relationship that matters deeply to you.',
      ],
      risingReading: [
        'With your Aries Ascendant activated by today\u2019s transits, you\u2019re radiating an unmistakable magnetism that turns heads wherever you go. Your physical energy is amplified\u2014this is an excellent day for exercise, sports, or any activity that lets you channel your dynamic first-house energy into movement.',
        'Others perceive you as especially confident and decisive today. Use this to your advantage in negotiations, first impressions, and leadership moments. However, be mindful of coming across as overly assertive; the line between bold and bulldozing can blur when your rising sign is this fired up. Lead with enthusiasm and you\u2019ll inspire rather than intimidate.',
      ],
    },
    taurus: {
      paragraphs: [
        'The earthy wisdom of your sign is amplified today as Venus, your ruling planet, forms a gentle sextile with Neptune. This is a day that rewards patience and sensory awareness\u2014slow down and notice the beauty that surrounds you. The morning light filtering through your window, the texture of your morning coffee, the melody of a song that catches your ear\u2014these small pleasures carry cosmic significance today.',
        'Financially, the stars encourage a thoughtful review rather than bold moves. A money matter you\u2019ve been pondering becomes clearer this afternoon. You may receive information that confirms an investment strategy or savings plan is working in your favor. Trust the methodical approach you\u2019re known for; your financial instincts are exceptionally tuned today.',
        'In relationships, your grounded presence is exactly what someone close to you needs. A friend or partner may seek your counsel on a confusing situation\u2014your calm, practical perspective will be a genuine gift to them. If single, someone with a warm smile and quiet confidence could catch your attention in the most ordinary of settings.',
        'This evening, prioritize comfort and restoration. Cook a nourishing meal, light a candle, or spend time in nature if you can. Your body is asking for gentleness, and honoring that request sets you up for a powerful, productive week ahead. The cosmos rewards you not for pushing harder, but for knowing exactly when to pause.',
      ],
      luckyNumber: 14,
      luckyColor: 'Forest Green',
      compatibility: 'Cancer',
      moonReading: [
        'Your Taurus Moon craves stability today, and the universe is delivering. The lunar transit through your second house reinforces your need for material and emotional security. You\u2019ll find comfort in familiar routines\u2014your favorite meal, a trusted playlist, the company of someone who knows you deeply.',
        'However, an unexpected emotional wave around midday may challenge your desire for calm. Rather than resisting the feeling, let it move through you. Taurus Moons grow strongest when they learn that security isn\u2019t about controlling every variable but about trusting their own resilience. This evening brings a deep sense of peace.',
      ],
      risingReading: [
        'Your Taurus Rising lends you an aura of serene elegance today. People are drawn to your steady, approachable energy\u2014and you may notice more compliments than usual. Venus brightens your first house, making this an ideal day for updating your wardrobe, experimenting with a new look, or simply enjoying the way you present yourself to the world.',
        'In professional settings, your calm demeanor inspires trust. Decision-makers and collaborators alike find your energy reassuring. Lean into this natural authority, especially if you\u2019re presenting ideas or leading a meeting. Your presence alone communicates competence and reliability.',
      ],
    },
    gemini: {
      paragraphs: [
        'Mercury, your ruling planet, is buzzing with electric energy today as it connects with innovative Uranus. Your mind is a lightning rod for brilliant ideas\u2014expect sudden flashes of insight that could change how you approach a project, a relationship, or even your own self-concept. Keep a notebook close; the best ideas arrive between tasks, not during them.',
        'Conversations are your superpower today, perhaps even more than usual. You have an uncanny ability to connect disparate ideas and help others see unexpected links between seemingly unrelated topics. A brainstorming session could be extraordinarily productive. Don\u2019t be afraid to voice the idea that seems too wild\u2014it might be the one that sticks.',
        'Socially, the day sparkles with possibility. An old friend may resurface with intriguing news, or a chance encounter could lead to a fascinating new connection. Your curiosity is your compass\u2014follow it freely. The evening brings a lighter energy perfect for trivia nights, creative writing, or a deep-dive into a topic that\u2019s been living in your open browser tabs.',
        'Take care to ground yourself before bed. Your buzzing mind will benefit from a wind-down ritual\u2014perhaps some light stretching, ambient music, or a few pages of fiction. The cosmic download today was significant, and your body needs time to integrate all that mental energy into something sustainable.',
      ],
      luckyNumber: 11,
      luckyColor: 'Electric Blue',
      compatibility: 'Aquarius',
      moonReading: [
        'Your Gemini Moon is especially active today, creating a rich inner dialogue that can feel both stimulating and overwhelming. The key is to distinguish between productive curiosity and anxious overthinking. Journaling or voice-noting your thoughts can help you process the emotional data your moon sign is collecting at rapid speed.',
        'A family member or childhood friend may trigger memories that surprise you. These aren\u2019t random\u2014they\u2019re breadcrumbs leading you toward an emotional insight you\u2019re finally ready to receive. Let the conversation flow naturally and see where it takes you.',
      ],
      risingReading: [
        'Your Gemini Ascendant makes you the most engaging person in every room today. Your wit is sharper, your charm more magnetic, and your ability to read social situations borders on telepathic. Use this gift intentionally\u2014whether networking, presenting, or simply making someone\u2019s day brighter with your words.',
        'Physically, you may feel more restless than usual. Channel that nervous energy into walking meetings, quick stretch breaks, or switching between tasks to keep your momentum high. Your rising sign thrives on variety, so don\u2019t fight the urge to multitask\u2014embrace it strategically.',
      ],
    },
    cancer: {
      paragraphs: [
        'The Moon, your celestial guardian, forms a nurturing trine with Venus today, wrapping your world in warmth and emotional richness. This is one of those days where your natural empathy becomes almost telepathic\u2014you\u2019ll sense what others need before they say a word. Trust this gift, especially in close relationships where a tender gesture could heal something that\u2019s been quietly aching.',
        'Your home life glows with positive energy. Whether you\u2019re redecorating a corner of your space, cooking an elaborate meal, or simply enjoying the comfort of familiar surroundings, domestic activities bring genuine joy. If you\u2019ve been considering a home-related decision\u2014a move, a renovation, or a change in living arrangements\u2014today\u2019s cosmic energy supports clear, heartfelt discernment.',
        'Career-wise, your emotional intelligence is your secret weapon. A workplace situation that requires sensitivity and tact is perfectly suited to your skill set. A colleague may confide in you, or you might find yourself mediating a disagreement with graceful diplomacy. Don\u2019t underestimate the professional value of being the person everyone trusts.',
        'As evening approaches, honor your need for retreat. Your shell is your sanctuary, and tonight is ideal for recharging within it. A warm bath, a favorite film, or quality time with your innermost circle will restore the energy you\u2019ve generously given throughout the day. Remember, caring for yourself is not selfish\u2014it\u2019s what allows your care for others to remain genuine and sustainable.',
      ],
      luckyNumber: 2,
      luckyColor: 'Silver',
      compatibility: 'Pisces',
      moonReading: [
        'With the Moon transiting your sign today, your emotional sensitivity is at its peak, dear Cancer Moon. You feel everything more deeply\u2014the beauty of a sunset, the sting of an offhand comment, the gratitude of a quiet moment of peace. This heightened awareness is a gift, even when it feels overwhelming.',
        'Set boundaries lovingly but firmly today. Your tendency to absorb others\u2019 emotions is amplified, and not every feeling you\u2019re carrying belongs to you. A grounding practice\u2014gardening, cooking, or simply placing your feet on the earth\u2014will help you distinguish your own emotional truth from the noise around you.',
      ],
      risingReading: [
        'Your Cancer Rising softens your entire presence today, making you appear approachable, nurturing, and deeply trustworthy. People are drawn to your warmth and may share personal stories they wouldn\u2019t normally tell. This is a beautiful day for counseling, mentoring, or any role where emotional attunement matters.',
        'Pay attention to your physical comfort\u2014your rising sign is sensitive to environment. Wearing soft fabrics, staying hydrated, and eating nourishing foods will keep your energy stable. You may also feel more photogenic today; the Moon\u2019s glow literally shines through your appearance.',
      ],
    },
    leo: {
      paragraphs: [
        'The Sun, your ruling luminary, blazes through a magnificent trine with Jupiter today, and you can feel the cosmic expansion in every fiber of your being. This is your day to shine\u2014and not in a performative way, but in the deep, authentic way that comes from truly knowing your worth. Creative projects receive a surge of inspiration that feels almost channeled from a higher source.',
        'Romance is absolutely electric. Whether you\u2019re coupled or single, the energy around love and play is irresistible. Coupled Leos may experience a renaissance of passion\u2014plan something spontaneous and let your natural warmth do the rest. Single Leos: your confidence is magnetic today, and someone who appreciates your radiance rather than being intimidated by it could make a memorable entrance.',
        'Professionally, you\u2019re in a position to lead with both vision and generosity. A presentation, performance, or public-facing role goes exceptionally well. The key is to lead from the heart rather than the ego\u2014people can tell the difference, and today your heart is so full that authentic leadership comes effortlessly.',
        'Tonight, celebrate. Even if it\u2019s a quiet celebration\u2014a toast to yourself, a victory dance in your living room, or a grateful acknowledgment of how far you\u2019ve come. Jupiter\u2019s blessing is about expansion, and the most powerful expansion begins with gratitude for what you already have.',
      ],
      luckyNumber: 19,
      luckyColor: 'Gold',
      compatibility: 'Sagittarius',
      moonReading: [
        'Your Leo Moon demands to be seen and celebrated today, and there\u2019s nothing wrong with that. The emotional need for recognition and appreciation is a core part of your lunar makeup. If you\u2019ve been feeling overlooked, today\u2019s transits help you communicate that need with dignity and warmth rather than drama.',
        'Creative self-expression is your emotional medicine right now. Sing, dance, paint, write, or perform\u2014whatever lets your inner child play freely. The joy you generate through creative expression today has a ripple effect that genuinely brightens every space you enter.',
      ],
      risingReading: [
        'Your Leo Ascendant is absolutely radiant today. There\u2019s a golden quality to your energy that makes others want to orbit around you. This is a powerful day for first impressions, public speaking, auditions, or any moment where your personal presence is your greatest asset.',
        'Be mindful of the attention you attract and use it wisely. Leadership moments will arise naturally\u2014accept them gracefully. Your hair, your posture, your smile\u2014everything about your physical presentation carries an extra spark. Lean into it and own the room.',
      ],
    },
    virgo: {
      paragraphs: [
        'Mercury\u2019s meticulous dance through your analytical sector brings extraordinary clarity today. Your ability to see patterns, solve problems, and organize chaos into order is operating at peak performance. A project that seemed dauntingly complex yesterday suddenly reveals its elegant solution to your discerning eye. Trust that moment of clarity\u2014it\u2019s not overthinking; it\u2019s genuine insight.',
        'Health and wellness are highlighted with a gentle Venus aspect encouraging you to approach self-care with love rather than discipline. Instead of punishing workouts, try gentle yoga or a long walk. Instead of strict meal plans, cook something that nourishes both body and soul. Your Virgo precision is most powerful when guided by compassion, especially toward yourself.',
        'At work, your attention to detail earns you recognition. A superior or client notices something you\u2019ve been perfecting behind the scenes, and the acknowledgment feels deeply validating. You may also find yourself mentoring a colleague\u2014your patient, methodical teaching style is exactly what they need to level up their own skills.',
        'The evening brings a surprising invitation to be imperfect. A friend, sibling, or partner draws you out of your analytical comfort zone into something spontaneous and slightly messy. Say yes. The stars remind you that joy doesn\u2019t require a plan\u2014sometimes the most memorable moments arise from beautiful disorder.',
      ],
      luckyNumber: 6,
      luckyColor: 'Sage Green',
      compatibility: 'Taurus',
      moonReading: [
        'Your Virgo Moon processes emotions through analysis, and today that process is both efficient and enlightening. You\u2019re able to name exactly what you\u2019re feeling and trace it back to its source with remarkable precision. This self-awareness is healing in itself\u2014understanding an emotion is often the first step to releasing it.',
        'Be gentle with your inner critic today. The same analytical gift that makes you exceptional at problem-solving can turn inward in unhelpful ways. When the critical voice arises, ask yourself: would I say this to a friend? Then offer yourself the same kindness you\u2019d extend to someone you love.',
      ],
      risingReading: [
        'Your Virgo Ascendant projects an aura of quiet competence today that others find deeply reassuring. In meetings and social situations, people defer to your judgment and appreciate your thoughtful, measured approach. You don\u2019t need to be the loudest voice to be the most influential.',
        'Pay attention to the details of your presentation\u2014a polished appearance, organized workspace, and clear communication style all contribute to the impression you\u2019re making. Small refinements to your routine today will have outsized effects on how others perceive and value your contributions.',
      ],
    },
    libra: {
      paragraphs: [
        'Venus, your celestial patron, forms a gorgeous aspect with Jupiter today, filling your world with beauty, harmony, and social grace. You\u2019re the natural diplomat of the zodiac, and today that gift is amplified to extraordinary levels. Negotiations, collaborations, and even difficult conversations flow with unusual ease as you find the perfect words to bridge every divide.',
        'Aesthetics matter more than usual, and your eye for design and beauty is impeccable. This is an ideal day for redecorating, shopping for art, curating your wardrobe, or simply appreciating beautiful spaces. Your taste is a genuine form of intelligence\u2014honor it as such.',
        'Romantic energy is sublime. Coupled Libras experience a deepening of emotional intimacy\u2014an honest conversation about your relationship\u2019s direction could bring you closer than ever. Single Libras radiate an alluring energy that draws potential partners who appreciate both your beauty and your depth. The key is authentic connection over surface-level charm.',
        'As the day winds down, seek balance between social engagement and solitude. You\u2019ve given generously to others all day, and your inner scales need recalibrating. A quiet evening of creative pursuits\u2014music, art, or reflective writing\u2014restores the equilibrium your sign thrives on.',
      ],
      luckyNumber: 15,
      luckyColor: 'Rose Pink',
      compatibility: 'Gemini',
      moonReading: [
        'Your Libra Moon seeks harmony above all else today, and that quest leads you toward meaningful relationship breakthroughs. You\u2019re able to see both sides of every situation with extraordinary clarity, which makes you an invaluable mediator in any conflict\u2014including your own inner ones.',
        'A tendency to prioritize others\u2019 needs over your own may surface. Today\u2019s transits gently ask: what do you actually want? Not what\u2019s fair, not what keeps the peace, but what genuinely lights you up? The answer might surprise you\u2014and pursuing it is not selfish; it\u2019s necessary.',
      ],
      risingReading: [
        'Your Libra Ascendant is radiating pure elegance today. Your smile is disarming, your style is effortless, and your ability to make others feel comfortable and valued is magnetic. First impressions today are exceptionally powerful\u2014use them wisely in interviews, dates, or networking situations.',
        'Venus amplifies your natural beauty and charm, but the real magic is your ability to create balance in any environment you enter. Rooms feel calmer, conversations feel more thoughtful, and decisions feel more fair when you\u2019re present. Own that superpower today.',
      ],
    },
    scorpio: {
      paragraphs: [
        'Pluto\u2019s deep resonance with today\u2019s lunar energy activates your most powerful transformation abilities. You\u2019re not just reading between the lines today\u2014you\u2019re reading between the dimensions. Your intuition is operating at a level that would make most people uncomfortable, but for you, it\u2019s like coming home to your truest self. Trust every hunch, every gut feeling, every quiet knowing.',
        'Emotional depth is your domain, and a conversation today takes you somewhere profound. Whether it\u2019s with a partner, a therapist, or even your own reflection in the mirror, you\u2019re ready to face a truth you\u2019ve been circling for weeks. The confrontation isn\u2019t scary\u2014it\u2019s liberating. On the other side of this honesty lies freedom you didn\u2019t know you were missing.',
        'Financially, a hidden opportunity reveals itself. Your detective instincts are perfectly suited for uncovering value where others see nothing. Whether it\u2019s a shrewd investment, an undervalued asset, or a creative way to consolidate resources, your financial acumen is razor-sharp. Just remember: power is a tool, not a destination.',
        'The night belongs to introspection. A walk under the stars, a meditation practice, or deep music can help you integrate the powerful energies you\u2019ve channeled today. You\u2019re emerging from a subtle but significant inner metamorphosis. Let yourself be tender with the person you\u2019re becoming\u2014they deserve your compassion.',
      ],
      luckyNumber: 8,
      luckyColor: 'Deep Burgundy',
      compatibility: 'Cancer',
      moonReading: [
        'Your Scorpio Moon plunges into emotional depths today that would overwhelm most, but you navigate these waters with the skill of a deep-sea diver. Hidden feelings\u2014jealousy, desire, grief, passion\u2014surface not to torment you but to be acknowledged and transformed. The alchemy of turning pain into wisdom is your birthright.',
        'Intimacy is both your greatest longing and your biggest challenge today. Someone close to you wants to go deeper\u2014can you let them? Vulnerability isn\u2019t weakness for a Scorpio Moon; it\u2019s the ultimate act of courage. The trust you extend today will be honored.',
      ],
      risingReading: [
        'Your Scorpio Ascendant gives you an intensity that others find simultaneously intriguing and slightly intimidating. Today, that magnetic quality is amplified\u2014people are drawn to your gaze, your presence, your unspoken power. Use this energy to make meaningful connections rather than keeping everyone at arm\u2019s length.',
        'Your appearance carries an extra edge of mystery today. Dark colors, minimal accessories, and a confident stride enhance the natural power your rising sign projects. In negotiations, your poker face is unreadable\u2014a significant advantage. Just remember to warm it with occasional authenticity.',
      ],
    },
    sagittarius: {
      paragraphs: [
        'Jupiter, your magnificent ruling planet, beams expansive energy directly into your chart today, and the effect is exhilarating. The world feels bigger, brighter, and more full of possibility than it has in weeks. A desire for adventure\u2014physical, intellectual, or spiritual\u2014courses through you like an electric current. Don\u2019t fight it; follow the arrow.',
        'Education and philosophy capture your imagination. Whether you stumble upon a fascinating documentary, start an online course, or engage in a spirited debate about the meaning of life, your mind is hungry for big ideas. Your ability to synthesize diverse perspectives into wisdom is extraordinary today. Share your insights\u2014the world needs your optimistic philosophy.',
        'Travel energy is strong, even if you can\u2019t leave town. Explore your own city with tourist eyes, try cuisine from a culture you know little about, or plan a future trip that excites your adventurous soul. The Sagittarian spirit isn\u2019t about the destination\u2014it\u2019s about the expansion that comes from engaging with the unfamiliar.',
        'Romantic connections benefit from honesty and humor\u2014your two greatest relationship gifts. Say what you mean, laugh at yourself, and let your natural enthusiasm be the aphrodisiac it truly is. Tonight, gratitude for the freedom to explore, grow, and become is the most aligned energy you can cultivate.',
      ],
      luckyNumber: 21,
      luckyColor: 'Royal Purple',
      compatibility: 'Aries',
      moonReading: [
        'Your Sagittarius Moon is restless with emotion today, craving the expansive feeling that comes from emotional honesty and philosophical perspective. When feelings get intense, your instinct is to zoom out and find the bigger picture\u2014and today, that strategy actually works beautifully.',
        'A conversation about beliefs, values, or life direction brings unexpected emotional clarity. You may realize you\u2019ve been holding onto a perspective that no longer serves your growth. Releasing it isn\u2019t loss\u2014it\u2019s making room for a truth that fits the person you\u2019re becoming.',
      ],
      risingReading: [
        'Your Sagittarius Ascendant projects an energy of openness and enthusiasm that makes others want to join your adventure. Your smile is wide, your stride is confident, and your laughter is genuinely contagious today. People experience you as someone who makes life feel more exciting just by being in it.',
        'Physically, you\u2019re drawn to movement and outdoor activity. Your rising sign thrives when the body is in motion\u2014hiking, cycling, dancing, or even vigorous walking amplifies your natural vitality. Let your body lead and your mind will follow into joyful territory.',
      ],
    },
    capricorn: {
      paragraphs: [
        'Saturn\u2019s steady hand guides you toward a milestone today, and the patience you\u2019ve invested is finally bearing fruit. A professional goal you\u2019ve been methodically pursuing reaches a critical turning point. This isn\u2019t luck\u2014it\u2019s the result of your unwavering discipline and strategic mind. Allow yourself to feel proud; you\u2019ve earned every ounce of this progress.',
        'Authority figures take notice of your reliability and expertise. Whether it\u2019s a promotion conversation, a new responsibility, or simply a moment of public recognition, the cosmos spotlights your professional value. Imposter syndrome may whisper in the background\u2014dismiss it with the facts of your track record.',
        'Relationships benefit from vulnerability today. Your natural tendency to project strength and composure serves you well professionally, but your personal connections crave something softer. Let someone see the human behind the ambition. The tenderness you reveal won\u2019t diminish their respect\u2014it will deepen their love.',
        'This evening, invest in rest with the same strategic intention you bring to your career. Quality sleep, a nourishing meal, and perhaps some structured relaxation\u2014a puzzle, a well-crafted novel, or classical music\u2014restore the inner reserves that fuel your legendary endurance. Tomorrow builds on today; make sure the foundation includes self-care.',
      ],
      luckyNumber: 10,
      luckyColor: 'Charcoal Black',
      compatibility: 'Virgo',
      moonReading: [
        'Your Capricorn Moon processes emotions with structure and discipline\u2014and today, that approach yields real breakthroughs. You\u2019re able to set emotional goals just as you would professional ones, and the clarity this brings is remarkable. A feeling you\u2019ve been managing rather than experiencing finally gets the full attention it deserves.',
        'Be cautious about suppressing vulnerability in the name of strength. Your moon sign\u2019s greatest growth comes from learning that emotional openness is its own form of power\u2014perhaps the most important kind. Someone close to you is safe to be vulnerable with; let them in today.',
      ],
      risingReading: [
        'Your Capricorn Ascendant projects an aura of authority and quiet ambition that commands respect in every setting. Today, people look to you for leadership and guidance\u2014your composed exterior inspires confidence even when you\u2019re navigating uncertainty internally.',
        'Dress the part\u2014your rising sign responds to intentional presentation. Classic, well-fitted clothing and a purposeful demeanor amplify the natural gravitas you carry. In meetings and social situations, your measured words carry more weight than anyone else\u2019s passionate speeches.',
      ],
    },
    aquarius: {
      paragraphs: [
        'Uranus, your cosmic innovator, sends a bolt of brilliant energy through your chart today, and the ideas flowing through your mind are genuinely ahead of their time. You\u2019re seeing solutions to problems that most people haven\u2019t even identified yet. A vision for a project, community, or creative endeavor crystallizes with startling clarity\u2014write it down before the mundane world dims its brilliance.',
        'Social connections take on deeper significance. You\u2019re the zodiac\u2019s natural community builder, and today you\u2019re drawn to people who share your values and vision for a better world. A group meeting, social cause, or collaborative project gives you the sense of purposeful belonging your sign craves. You don\u2019t just want friends\u2014you want co-conspirators for positive change.',
        'Technology and innovation are your playgrounds today. Whether you\u2019re debugging code, designing a system, exploring new tools, or simply imagining how things could work better, your future-oriented mind is perfectly aligned with the cosmic frequency. Embrace your inner inventor and don\u2019t let conventional thinking limit your possibilities.',
        'As the day closes, honor your need for intellectual stimulation and emotional independence in equal measure. A documentary about space, a conversation about consciousness, or some time stargazing reconnects you with the vast perspective your Aquarian soul requires. You\u2019re not aloof\u2014you\u2019re attuned to a frequency most people can\u2019t hear yet.',
      ],
      luckyNumber: 22,
      luckyColor: 'Electric Violet',
      compatibility: 'Libra',
      moonReading: [
        'Your Aquarius Moon approaches emotions with intellectual curiosity today, analyzing feelings as if they were fascinating data points rather than chaotic experiences. This detachment isn\u2019t coldness\u2014it\u2019s your unique way of processing the human experience. Today, this approach leads to genuine emotional breakthroughs.',
        'A group or community setting stirs unexpected emotions. You may feel a surge of gratitude for your chosen family or a flash of frustration at humanity\u2019s stubbornness. Both feelings are valid and valuable\u2014they fuel the humanitarian vision that drives your deepest emotional satisfaction.',
      ],
      risingReading: [
        'Your Aquarius Ascendant gives you an unmistakable aura of originality today. People notice you not for conforming to expectations but for transcending them entirely. Your style, your ideas, your very way of moving through the world communicates that you play by your own rules\u2014and that\u2019s deeply attractive.',
        'Embrace what makes you different in your physical presentation and communication style. Today\u2019s transits reward authenticity over convention. The people and opportunities aligned with your highest good will be drawn to the real you, not a polished version of what you think they want.',
      ],
    },
    pisces: {
      paragraphs: [
        'Neptune, your mystical ruler, weaves an especially enchanting spell today, and the boundary between intuition and imagination dissolves in the most beautiful way. You\u2019re channeling creative energy that feels almost supernatural\u2014poems, paintings, melodies, and visions flow through you as if you\u2019re a vessel for something larger than yourself. Honor this flow by making time and space for creative expression.',
        'Your compassion is both your greatest gift and your most important responsibility today. Others are drawn to your empathetic presence like ships to a lighthouse, and your ability to hold space for their pain without drowning in it is stronger than usual. A conversation about feelings goes deep, and the healing that occurs benefits both of you equally.',
        'Spiritual practices are especially potent today. Whether you meditate, pray, pull tarot cards, or simply sit in silence with your inner knowing, the veil between worlds is thin. Pay close attention to synchronicities, repeating numbers, and messages that arrive through unexpected channels\u2014the universe is speaking directly to you in a language only your soul can translate.',
        'The evening invites you to dream\u2014both literally and figuratively. Set intentions before sleep, keep a dream journal nearby, and trust that your subconscious mind is working on solutions your waking mind can\u2019t yet comprehend. You are far more powerful than you realize, dear Pisces, and tonight the stars conspire to remind you of that forgotten truth.',
      ],
      luckyNumber: 3,
      luckyColor: 'Ocean Teal',
      compatibility: 'Scorpio',
      moonReading: [
        'Your Pisces Moon dissolves emotional boundaries today, allowing you to feel the collective undercurrent with extraordinary sensitivity. This empathic gift can be overwhelming if you\u2019re not mindful\u2014create sacred space around your energy with whatever grounding practices work for you. Salt baths, protective visualizations, or simply time in water can help.',
        'A creative or spiritual experience triggers a profound emotional release. Tears, laughter, awe\u2014whatever form it takes, let it move through you completely. Your Pisces Moon heals not by analyzing but by feeling fully and then surrendering the weight to something larger. Tonight, your dreams carry messages of extraordinary significance.',
      ],
      risingReading: [
        'Your Pisces Ascendant gives you an ethereal quality today that others find mesmerizing and slightly otherworldly. There\u2019s a softness to your gaze and a gentleness to your presence that makes people feel safe in your company. Artists, healers, and spiritual seekers are especially drawn to your energy.',
        'Pay attention to how environments affect your physical energy\u2014your rising sign is extraordinarily sensitive to atmosphere. Seek out beautiful, peaceful spaces and minimize time in harsh or chaotic environments. When you feel good in your surroundings, your natural grace and intuitive brilliance shine through effortlessly.',
      ],
    },
  };

  return (
    horoscopes[slug] || {
      paragraphs: [
        'The stars are aligning in your favor today, bringing clarity and purpose to your path. Trust your instincts and stay open to unexpected opportunities that may present themselves throughout the day.',
        'Relationships deepen as honest communication flows more easily than usual. Take time to express appreciation for the people who matter most, and you may be pleasantly surprised by the warmth that returns to you.',
        'Professional endeavors benefit from a blend of creativity and practicality. The unique perspective you bring to challenges today catches the attention of someone influential. Your dedication and originality are your greatest assets.',
        'End the day with gratitude and gentle reflection. The cosmic energies support personal growth and self-understanding. Journal your thoughts, nurture your dreams, and trust that the universe has beautiful plans unfolding for you.',
      ],
      luckyNumber: 9,
      luckyColor: 'Amethyst Purple',
      compatibility: 'Pisces',
      moonReading: [
        'Your moon sign energy today invites deep emotional reflection and intuitive exploration. Trust the feelings that arise, even if they don\u2019t immediately make logical sense\u2014your subconscious is processing important information.',
        'Connection with loved ones feels especially meaningful. A heart-to-heart conversation brings clarity and emotional resolution that\u2019s been building for some time.',
      ],
      risingReading: [
        'Your rising sign projects confidence and warmth today. Others are drawn to your authentic presence and find inspiration in the way you navigate the world with grace and purpose.',
        'This is an excellent day for making first impressions, whether in professional or social contexts. Your natural charisma is amplified by the current planetary transits.',
      ],
    }
  );
}
