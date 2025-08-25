export type QuestionItem = {
  id: string;
  category: "relationships" | "home" | "career" | "growth" | "spiritual";
  label: string;
  pathA: string;
  pathB: string;
  requiresSubDropdown?: boolean;
  subOptions?: string[];
};

export const QUESTIONS: QuestionItem[] = [
  // 💕 Relationships
  { id: "rel-stay-or-leave", category: "relationships", label: "Should I stay in this relationship or leave?", pathA: "Stay in the relationship", pathB: "Leave the relationship" },
  { id: "rel-reconcile-or-moveon", category: "relationships", label: "Is it better to reconcile or move on?", pathA: "Reconcile", pathB: "Move on" },
  { id: "rel-openup-or-boundaries", category: "relationships", label: "Should I open up more or set stronger boundaries?", pathA: "Open up more", pathB: "Set stronger boundaries" },
  { id: "rel-fling-or-longterm", category: "relationships", label: "Should I treat this connection as a fling or something long-term?", pathA: "Fling", pathB: "Long-term" },
  { id: "rel-partner-needs-or-own-growth", category: "relationships", label: "Do I focus on my partner’s needs or my own growth first?", pathA: "Partner’s needs", pathB: "My own growth" },

  // 🏡 Home & Lifestyle
  { id: "home-move-or-stay", category: "home", label: "Should I move or stay where I am?", pathA: "Move", pathB: "Stay" },
  { id: "home-rent-or-buy", category: "home", label: "Is it better to rent or buy right now?", pathA: "Rent", pathB: "Buy" },
  { id: "home-live-alone-vs-with", category: "home", label: "Should I live alone or with roommates/partner/family?", pathA: "Live with …", pathB: "Live with …", requiresSubDropdown: true, subOptions: ["Alone","Roommate","Partner","Family"] },
  { id: "home-settle-or-abroad", category: "home", label: "Do I settle here or explore living abroad?", pathA: "Settle here", pathB: "Explore abroad" },
  { id: "home-downsize-or-expand", category: "home", label: "Should I downsize or expand my living situation?", pathA: "Downsize", pathB: "Expand" },

  // 💼 Career & Finances
  { id: "car-stay-or-new", category: "career", label: "Should I stay at my current job or find a new one?", pathA: "Stay at current job", pathB: "Find a new job" },
  { id: "car-stability-or-passion", category: "career", label: "Is it better to pursue stability or passion?", pathA: "Stability", pathB: "Passion" },
  { id: "car-business-or-employment", category: "career", label: "Do I start my own business or stick with employment?", pathA: "Start a business", pathB: "Stick with employment" },
  { id: "car-invest-or-educate", category: "career", label: "Should I invest/save money or spend on growth/education?", pathA: "Invest / Save", pathB: "Spend on growth / education" },
  { id: "car-promo-or-balance", category: "career", label: "Do I take the promotion or keep work-life balance?", pathA: "Take the promotion", pathB: "Keep work-life balance" },

  // 🌱 Personal Growth
  { id: "gro-logic-or-intuition", category: "growth", label: "Should I follow logic or intuition?", pathA: "Logic", pathB: "Intuition" },
  { id: "gro-rest-or-push", category: "growth", label: "Is it better to rest or push forward?", pathA: "Rest", pathB: "Push forward" },
  { id: "gro-continue-or-reinvent", category: "growth", label: "Do I continue on my current path or reinvent myself?", pathA: "Continue current path", pathB: "Reinvent myself" },
  { id: "gro-self-or-others", category: "growth", label: "Should I focus on self-development or helping others?", pathA: "Self-development", pathB: "Helping others" },
  { id: "gro-private-or-public", category: "growth", label: "Do I keep my spiritual practice private or share it publicly?", pathA: "Keep it private", pathB: "Share publicly" },

  // 🔮 Spiritual / Big Picture
  { id: "spi-patience-or-action", category: "spiritual", label: "Is this lesson about patience or action?", pathA: "Patience", pathB: "Action" },
  { id: "spi-surrender-or-control", category: "spiritual", label: "Do I surrender to the flow or try to take control?", pathA: "Surrender to the flow", pathB: "Take control" },
  { id: "spi-trust-or-plan", category: "spiritual", label: "Should I trust the universe or make a concrete plan?", pathA: "Trust the universe", pathB: "Make a concrete plan" },
  { id: "spi-karmic-or-fresh", category: "spiritual", label: "Is this situation karmic or a fresh start?", pathA: "Karmic", pathB: "Fresh start" },
  { id: "spi-heal-or-create", category: "spiritual", label: "Do I focus on healing the past or creating the future?", pathA: "Healing the past", pathB: "Creating the future" },
];

export const CATEGORIES = [
  { id: "relationships", label: "💕 Relationships" },
  { id: "home", label: "🏡 Home & Lifestyle" },
  { id: "career", label: "💼 Career & Finances" },
  { id: "growth", label: "🌱 Personal Growth" },
  { id: "spiritual", label: "🔮 Spiritual / Big Picture" },
] as const;

export type CategoryId = typeof CATEGORIES[number]["id"];
