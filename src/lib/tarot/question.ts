// --- Dynamic path helpers ---

export type Selection = { A?: string; B?: string };
export type PathText = string | ((sel?: Selection) => string);

// Intention list (spread-agnostic) — add to questions.ts
// -----------------------------------------------------------------------------

export type Intention = {
  id: string;
  category: "relationships" | "home" | "career" | "growth" | "spiritual";
  label: string; // user-facing text for the dropdown
};

export const INTENTIONS: Intention[] = [
  // 💕 Relationships (10)
  { id: "rel-pattern-change", category: "relationships", label: "How do I understand the pattern I keep replaying in love and change it?" },
  { id: "rel-healthy-boundaries", category: "relationships", label: "What would it look like to set healthy boundaries in this connection?" },
  { id: "rel-unsaid-convo", category: "relationships", label: "How do I surface what’s unsaid and prepare a better conversation?" },
  { id: "rel-trust-repair", category: "relationships", label: "What is the path to repairing trust after it was strained or broken?" },
  { id: "rel-compatibility-map", category: "relationships", label: "How do I see our compatibility strengths and pressure points clearly?" },
  { id: "rel-balance-needs", category: "relationships", label: "How do I balance my needs with theirs without losing myself?" },
  { id: "rel-crossroads", category: "relationships", label: "How do I navigate this crossroads with care and self-respect?" },
  { id: "rel-release-baggage", category: "relationships", label: "What would it look like to release past baggage leaking into current connections?" },
  { id: "rel-discernment-dating", category: "relationships", label: "How do I date with discernment—what to lean into and what to avoid?" },
  { id: "rel-deeper-intimacy", category: "relationships", label: "How do I invite deeper intimacy—emotional, physical, and everyday?" },

  // 🏡 Home & Lifestyle (10)
  { id: "home-daily-rhythm", category: "home", label: "How do I design a daily rhythm that actually sustains my energy?" },
  { id: "home-keep-upgrade-letgo", category: "home", label: "How do I decide what to keep, upgrade, or let go in my space?" },
  { id: "home-move-timing", category: "home", label: "What would it look like to plan a move or living change with the right timing and steps?" },
  { id: "home-reduce-overwhelm", category: "home", label: "How do I reduce overwhelm by prioritizing the few things that matter?" },
  { id: "home-rest-recovery", category: "home", label: "How do I strengthen rest and recovery—sleep, downtime, real breaks?" },
  { id: "home-community-belonging", category: "home", label: "How do I build supportive community and a stronger sense of belonging?" },
  { id: "home-boundaries-work-screens", category: "home", label: "How do I set clean boundaries around work, screens, and home life?" },
  { id: "home-simplify-stressors", category: "home", label: "What would it look like to simplify routines and eliminate hidden stressors?" },
  { id: "home-rebuild-habits", category: "home", label: "How do I rebuild health habits after a setback or busy season?" },
  { id: "home-make-room-joy", category: "home", label: "How do I make room for play, joy, and small adventures?" },

  // 💼 Career & Finances (10)
  { id: "career-define-good-work", category: "career", label: "How do I clarify what “good work” looks like for me this season?" },
  { id: "career-find-leverage", category: "career", label: "Where can I find leverage—skills, projects, and visibility that move the needle?" },
  { id: "career-diagnose-bottleneck", category: "career", label: "How do I diagnose the bottleneck slowing my progress?" },
  { id: "career-plan-pivot", category: "career", label: "What would it look like to plan a pivot—what to carry forward and what to release?" },
  { id: "career-negotiate-clarity", category: "career", label: "How do I negotiate from clarity—value, limits, and non-negotiables?" },
  { id: "career-price-position", category: "career", label: "How do I price and position my work in line with its value?" },
  { id: "career-stabilize-cashflow", category: "career", label: "How do I stabilize cash flow and choose the next smart money move?" },
  { id: "career-select-learning-goals", category: "career", label: "How do I select learning goals with the best return on effort?" },
  { id: "career-build-reputation", category: "career", label: "How do I build reputation and relationships that open doors?" },
  { id: "career-90day-plan", category: "career", label: "What is a focused 90-day plan I can actually execute?" },

  // 🌱 Personal Growth (10)
  { id: "growth-end-pattern", category: "growth", label: "How do I name the life pattern that’s ready to end—and end it well?" },
  { id: "growth-self-trust", category: "growth", label: "How do I strengthen self-trust through small promises I keep?" },
  { id: "growth-reframe-season", category: "growth", label: "What would it look like to reframe the story I’m telling about this season?" },
  { id: "growth-move-with-fear", category: "growth", label: "How do I turn fear into forward motion without bypassing feelings?" },
  { id: "growth-embodied-confidence", category: "growth", label: "How do I build embodied confidence and calm authority?" },
  { id: "growth-set-hold-boundary", category: "growth", label: "How do I set and hold a boundary with steadiness?" },
  { id: "growth-process-grief-change", category: "growth", label: "How do I process grief or change with skill and compassion?" },
  { id: "growth-unlock-creativity", category: "growth", label: "How do I unlock creativity through play, rest, and constraint?" },
  { id: "growth-shift-procrastination", category: "growth", label: "How do I shift procrastination into repeatable momentum?" },
  { id: "growth-north-star-habits", category: "growth", label: "How do I choose a north star and build habits that match it?" },

  // 🔮 Spiritual / Big Picture (10)
  { id: "spirit-align-values-purpose", category: "spiritual", label: "How do I align choices with my core values and sense of purpose?" },
  { id: "spirit-deeper-invitation", category: "spiritual", label: "What would it look like to discern the deeper invitation beneath this challenge?" },
  { id: "spirit-trust-intuition", category: "spiritual", label: "How do I listen to intuition and act on it with confidence?" },
  { id: "spirit-read-season", category: "spiritual", label: "How do I read the season I’m in—beginning, middle, or ending?" },
  { id: "spirit-spot-patterns", category: "spiritual", label: "How do I spot meaningful patterns and signals—not just noise?" },
  { id: "spirit-balance-surrender", category: "spiritual", label: "How do I balance control and surrender wisely in this chapter?" },
  { id: "spirit-make-meaning", category: "spiritual", label: "How do I make meaning from a hard experience and integrate it?" },
  { id: "spirit-gratitude-presence", category: "spiritual", label: "How do I cultivate gratitude and presence in ordinary days?" },
  { id: "spirit-longterm-vision", category: "spiritual", label: "How do I clarify the long-term vision and the next right step?" },
  { id: "spirit-open-to-support", category: "spiritual", label: "How do I open to support—people, practices, and resources that fit?" },
];

// (Optional) helpers you can use in UI
export const INTENTIONS_BY_CATEGORY = {
  relationships: INTENTIONS.filter(i => i.category === "relationships"),
  home: INTENTIONS.filter(i => i.category === "home"),
  career: INTENTIONS.filter(i => i.category === "career"),
  growth: INTENTIONS.filter(i => i.category === "growth"),
  spiritual: INTENTIONS.filter(i => i.category === "spiritual"),
};


export type QuestionItem = {
  id: string;
  category: "relationships" | "home" | "career" | "growth" | "spiritual";
  label: string;
  /**
   * Can be a static string or a function of the user's current selection(s).
   * For simple questions, ignore Selection and return a constant string.
   */
  pathA: PathText;
  pathB: PathText;
  /**
   * When present, the UI should render dropdown(s).
   * - 'single'   => 1 dropdown that feeds both paths (e.g., only B uses it)
   * - 'twoDistinct' => 2 dropdowns (A and B) which must not be equal
   */
  subOptionMode?: "single" | "twoDistinct";
  subOptions?: string[];
};

export const resolvePath = (p: PathText, sel?: Selection) =>
  typeof p === "function" ? (p as (s?: Selection) => string)(sel) : p;

/** Ensure selection A and B are not equal. If equal, drop B. */
export const ensureDistinct = (sel: Selection): Selection => {
  if (sel.A && sel.B && sel.A === sel.B) {
    return { ...sel, B: undefined };
  }
  return sel;
};

// Small grammar helper for the 'live with' phrasing
const withPhrase = (opt?: string) => {
  if (!opt) return "Living with …";
  if (opt.toLowerCase() === "alone") return "Living alone";
  // you can tweak articles as desired:
  if (opt.toLowerCase() === "roommate") return "Living with a roommate";
  if (opt.toLowerCase() === "partner") return "Living with a partner";
  if (opt.toLowerCase() === "family") return "Living with family";
  return `Living with ${opt}`;
};

export const QUESTIONS: QuestionItem[] = [
  // 💕 Relationships
  { id: "rel-stay-or-leave", category: "relationships", label: "Should I stay in this relationship or leave?", pathA: "Staying", pathB: "Leaving" },
  { id: "rel-reconcile-or-moveon", category: "relationships", label: "Is it better to reconcile or move on?", pathA: "Reconciling", pathB: "Moving On" },
  { id: "rel-openup-or-boundaries", category: "relationships", label: "Should I open up more or set stronger boundaries?", pathA: "Opening Up", pathB: "Stronger Boundaries" },
  { id: "rel-fling-or-longterm", category: "relationships", label: "Should I treat this connection as a fling or something long-term?", pathA: "Fling", pathB: "Long-Term" },
  { id: "rel-partner-needs-or-own-growth", category: "relationships", label: "Do I focus on my partner’s needs or my own growth first?", pathA: "My Partner’s Needs", pathB: "My Own Growth" },

  // 🏡 Home & Lifestyle
  { id: "home-move-or-stay", category: "home", label: "Should I move or stay where I am?", pathA: "Moving", pathB: "Staying" },
  { id: "home-rent-or-buy", category: "home", label: "Is it better to rent or buy right now?", pathA: "Renting", pathB: "Buying" },
  {
    id: "home-live-alone-vs-with",
    category: "home",
    label: "Should I live alone or with roommates/partner/family?",
    // Two independent selections; both can be any option, but must be distinct.
    // A and B will be rendered from sel.A and sel.B respectively.
    pathA: (sel?: Selection) => withPhrase(sel?.A),
    pathB: (sel?: Selection) => withPhrase(sel?.B),
    subOptionMode: "twoDistinct",
    subOptions: ["Alone", "Roommate", "Partner", "Family"],
  },
  { id: "home-settle-or-abroad", category: "home", label: "Do I settle here or explore living abroad?", pathA: "Settling Here", pathB: "Exploring Abroad" },
  { id: "home-downsize-or-expand", category: "home", label: "Should I downsize or expand my living situation?", pathA: "Downsizing", pathB: "Expanding" },

  // 💼 Career & Finances
  { id: "car-stay-or-new", category: "career", label: "Should I stay at my current job or find a new one?", pathA: "Current Job", pathB: "New Job" },
  { id: "car-stability-or-passion", category: "career", label: "Is it better to pursue stability or passion?", pathA: "Stability", pathB: "Passion" },
  { id: "car-business-or-employment", category: "career", label: "Do I start my own business or stick with employment?", pathA: "Own Business", pathB: "Employment" },
  { id: "car-invest-or-educate", category: "career", label: "Should I invest/save money or spend on growth/education?", pathA: "Investing / Saving", pathB: "Growth / Education" },
  { id: "car-promo-or-balance", category: "career", label: "Do I take the promotion or keep work-life balance?", pathA: "Promotion", pathB: "Work-Life Balance" },

  // 🌱 Personal Growth
  { id: "gro-logic-or-intuition", category: "growth", label: "Should I follow logic or intuition?", pathA: "Logic", pathB: "Intuition" },
  { id: "gro-rest-or-push", category: "growth", label: "Is it better to rest or push forward?", pathA: "Rest", pathB: "Pushing Forward" },
  { id: "gro-continue-or-reinvent", category: "growth", label: "Do I continue on my current path or reinvent myself?", pathA: "Current Path", pathB: "Reinventing Myself" },
  { id: "gro-self-or-others", category: "growth", label: "Should I focus on self-development or helping others?", pathA: "Self-Development", pathB: "Helping Others" },
  { id: "gro-private-or-public", category: "growth", label: "Do I keep my spiritual practice private or share it publicly?", pathA: "Private", pathB: "Public" },

  // 🔮 Spiritual / Big Picture
  { id: "spi-patience-or-action", category: "spiritual", label: "Is this lesson about patience or action?", pathA: "Patience", pathB: "Action" },
  { id: "spi-surrender-or-control", category: "spiritual", label: "Do I surrender to the flow or try to take control?", pathA: "Surrendering", pathB: "Taking Control" },
  { id: "spi-trust-or-plan", category: "spiritual", label: "Should I trust the universe or make a concrete plan?", pathA: "Trusting The Universe", pathB: "Making A Concrete Plan" },
  { id: "spi-karmic-or-fresh", category: "spiritual", label: "Is this situation karmic or a fresh start?", pathA: "Karmic", pathB: "Fresh Start" },
  { id: "spi-heal-or-create", category: "spiritual", label: "Do I focus on healing the past or creating the future?", pathA: "Healing The Past", pathB: "Creating The Future" },
];

export const CATEGORIES = [
  { id: "relationships", label: "💕 Relationships" },
  { id: "home", label: "🏡 Home & Lifestyle" },
  { id: "career", label: "💼 Career & Finances" },
  { id: "growth", label: "🌱 Personal Growth" },
  { id: "spiritual", label: "🔮 Spiritual / Big Picture" },
] as const;

export type CategoryId = typeof CATEGORIES[number]["id"];

/** Resolve both path labels for a question, after enforcing distinct picks if needed. */
export const resolveQuestionPaths = (q: QuestionItem, sel?: Selection) => {
  const normalized = q.subOptionMode === "twoDistinct" ? ensureDistinct(sel ?? {}) : (sel ?? {});
  return {
    pathA: resolvePath(q.pathA, normalized),
    pathB: resolvePath(q.pathB, normalized),
  };
};

// SPREAD METADATA
export type SpreadId =
  | "ppf"            // Past • Present • Future
  | "fml"            // Focus • Moving Forward • Letting Go
  | "kdk"            // What I Know • What I Don’t • What I Need To
  | "pphao"          // Past • Present • Hidden Issues • Advice • Outcome
  | "gcsbl"          // Goal • Current Status • Block • Bridge • Lesson
  | "pathab"         // Path A / Path B
  | "horoscope";     // Horoscope

export type SpreadMeta = {
  id: SpreadId;
  label: string;
  allowsIntentions: boolean; // disable intention dropdown for certain spreads
};

export const SPREADS: SpreadMeta[] = [
  { id: "ppf",   label: "Past • Present • Future",                          allowsIntentions: true },
  { id: "fml",   label: "Focus • Moving Forward • Letting Go",              allowsIntentions: true },
  { id: "kdk",   label: "What I Know • What I Don’t • What I Need To",      allowsIntentions: true },
  { id: "pphao", label: "Past • Present • Hidden • Advice • Outcome",       allowsIntentions: true },
  { id: "gcsbl", label: "Goal • Status • Block • Bridge • Lesson",          allowsIntentions: true },
  { id: "pathab",label: "This or That With Pros and Cons",                  allowsIntentions: true },
  { id: "horoscope", label: "Horoscope",                                    allowsIntentions: false },
];

export const CATEGORY_OPTIONS: { id: CategoryId; label: string }[] = [
  { id: "relationships", label: "💕 Relationships" },
  { id: "home",          label: "🏡 Home & Lifestyle" },
  { id: "career",        label: "💼 Career & Finances" },
  { id: "growth",        label: "🌱 Personal Growth" },
  { id: "spiritual",     label: "🔮 Spiritual / Big Picture" },
];

// Small helpers
export const spreadAllowsIntentions = (id: SpreadId) =>
  SPREADS.find(s => s.id === id)?.allowsIntentions ?? true;

export const intentionsForCategory = (category: CategoryId) =>
  INTENTIONS.filter(i => i.category === category);

// Helper to get Path A/B for pathab spread based on selected intention
export const getPathsForIntention = (intentionId: string | null, selection?: Selection) => {
  if (!intentionId) return { pathA: "", pathB: "" };
  
  const question = QUESTIONS.find(q => q.id === intentionId);
  if (!question) return { pathA: "", pathB: "" };
  
  return {
    pathA: resolvePath(question.pathA, selection),
    pathB: resolvePath(question.pathB, selection)
  };
};

