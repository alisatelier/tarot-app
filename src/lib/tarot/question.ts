// --- Dynamic path helpers ---

export type Selection = { A?: string; B?: string };
export type PathText = string | ((sel?: Selection) => string);

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
  { id: "rel-openup-or-boundaries", category: "relationships", label: "Should I open up more or set stronger boundaries?", pathA: "Opening Up More", pathB: "Setting Stronger Boundaries" },
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
