import { type Spread} from "./spreads";

export const SPREADS: Spread[] = [
  // ------------------------------------------------------------
  {
    id: "ppf",
    title: "Past • Present • Future",
    slots: [
      { profile: "desktop", idKey: "past-3", cardLabel: "Past", xPerc: 30, yPerc: 50 },
      { profile: "desktop", idKey: "present-3", cardLabel: "Present", xPerc: 50, yPerc: 50 },
      { profile: "desktop", idKey: "future-3", cardLabel: "Future", xPerc: 70, yPerc: 50 },
      { profile: "tablet", idKey: "past-3", cardLabel: "Past", xPerc: 30, yPerc: 50 },
      { profile: "tablet", idKey: "present-3", cardLabel: "Present", xPerc: 50, yPerc: 50 },
      { profile: "tablet", idKey: "future-3", cardLabel: "Future", xPerc: 70, yPerc: 50 },
      { profile: "mobile", idKey: "past-3", cardLabel: "Past", xPerc: 30, yPerc: 20 },
      { profile: "mobile", idKey: "present-3", cardLabel: "Present", xPerc: 30, yPerc: 50 },
      { profile: "mobile", idKey: "future-3", cardLabel: "Future", xPerc: 30, yPerc: 80 },
    ],
    categories: [
      {
        id: "custom",
        title: "-------",
        intentions: [
          {
            id: "ppf:custom:own",
            kind: "simple",
            label: "Write My Own Intention",
          },
        ],
      },
      {
        id: "relationships",
        title: "💞 Relationships",
        intentions: [
          {
            id: "ppf:rel:heading",
            kind: "simple",
            label: "Where is my relationship with ${relationshipName} heading?",
            requiresName: true,
          },
          {
            id: "ppf:rel:feelings",
            kind: "simple",
            label:
              "What does ${relationshipName} think and feel about me right now?",
            requiresName: true,
          },
          {
            id: "ppf:rel:improve",
            kind: "simple",
            label:
              "How can I improve my relationship with ${relationshipName}?",
            requiresName: true,
          },
          {
            id: "ppf:rel:work-together",
            kind: "simple",
            label: "How can ${relationshipName} and I work together better?",
            requiresName: true,
          },
          {
            id: "ppf:rel:changed",
            kind: "simple",
            label:
              "What has changed between ${relationshipName} and I recently, and why?",
            requiresName: true,
          },
          {
            id: "ppf:rel:path",
            kind: "simple",
            label:
              "If nothing changes, what's the likely path for ${relationshipName} and I?",
            requiresName: true,
          },
        ],
      },
      {
        id: "home",
        title: "🏡 Home & Lifestyle",
        intentions: [
          {
            id: "ppf:home:living",
            kind: "simple",
            label: "How is my current living situation affecting me?",
          },
          {
            id: "ppf:home:selfcare",
            kind: "simple",
            label: "What does my self-care need right now?",
          },
          {
            id: "ppf:home:habits",
            kind: "simple",
            label: "How can I improve my daily habits and routines?",
          },
          {
            id: "ppf:home:community",
            kind: "simple",
            label: "What does my sense of community look like right now?",
          },
          {
            id: "ppf:home:change",
            kind: "simple",
            label: "What change at home would make the biggest difference now?",
          },
          {
            id: "ppf:home:routines",
            kind: "simple",
            label: "How are my routines affecting my wellness?",
          },
        ],
      },
      {
        id: "career",
        title: "💼 Career & Creativity",
        intentions: [
          {
            id: "ppf:career:benefits",
            kind: "simple",
            label: "What are the benefits of my job right now?",
          },
          {
            id: "ppf:career:costs",
            kind: "simple",
            label: "What are the costs or trade-offs of my job?",
          },
          {
            id: "ppf:career:meaning",
            kind: "simple",
            label: "What does my work mean to me?",
          },
          {
            id: "ppf:career:creative",
            kind: "simple",
            label: "How are my creative pursuits going?",
          },
          {
            id: "ppf:career:joy",
            kind: "simple",
            label: "Where is the joy in my work?",
          },
          {
            id: "ppf:career:trajectory",
            kind: "simple",
            label: "Where is my career headed if I stay the course?",
          },
          {
            id: "ppf:career:focus",
            kind: "simple",
            label: "What should I learn or focus on next to grow?",
          },
        ],
      },
      {
        id: "growth",
        title: "🌱 Personal Growth",
        intentions: [
          {
            id: "ppf:growth:spiritual",
            kind: "simple",
            label: "Where am I on my spiritual journey?",
          },
          {
            id: "ppf:growth:development",
            kind: "simple",
            label: "What is the status of my personal development?",
          },
          {
            id: "ppf:growth:healing",
            kind: "simple",
            label: "Where am I in my healing process?",
          },
          {
            id: "ppf:growth:pattern",
            kind: "simple",
            label: "What pattern am I ready to end?",
          },
          {
            id: "ppf:growth:habit",
            kind: "simple",
            label: "What change in habit would make the biggest difference?",
          },
          {
            id: "ppf:growth:confidence",
            kind: "simple",
            label: "What is limiting me from building confidence?",
          },
        ],
      },
      {
        id: "spiritual",
        title: "🔮 Spiritual Development",
        intentions: [
          {
            id: "ppf:spirit:intuition",
            kind: "simple",
            label: "What is my intuition trying to tell me?",
          },
          {
            id: "ppf:spirit:ego",
            kind: "simple",
            label: "What is my ego trying to protect or push right now?",
          },
          {
            id: "ppf:spirit:purpose",
            kind: "simple",
            label: "Where am I with living my souls purpose/calling?",
          },
          {
            id: "ppf:spirit:integrity",
            kind: "simple",
            label: "How can I live with integrity?",
          },
          {
            id: "ppf:spirit:values",
            kind: "simple",
            label: "How can I align daily actions with my values and purpose?",
          },
          {
            id: "ppf:spirit:anchor",
            kind: "simple",
            label: "How can I anchor into a spiritual practice?",
          },
          {
            id: "ppf:spirit:surrender",
            kind: "simple",
            label: "What do I need to surrender vs. take responsibility for?",
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------------
  {
    id: "fml",
    title: "Focus • Moving Forward • Letting Go",
    slots: [
      { profile: "desktop", idKey: "focus-3", cardLabel: "Focus", xPerc: 50, yPerc: 35 },
      { profile: "desktop", idKey: "forward-3", cardLabel: "Moving Forward", xPerc: 30, yPerc: 65 },
      { profile: "desktop", idKey: "letgo-3", cardLabel: "Letting Go", xPerc: 70, yPerc: 65 },
      { profile: "tablet", idKey: "focus-3", cardLabel: "Focus", xPerc: 50, yPerc: 35 },
      { profile: "tablet", idKey: "forward-3", cardLabel: "Moving Forward", xPerc: 30, yPerc: 65 },
      { profile: "tablet", idKey: "letgo-3", cardLabel: "Letting Go", xPerc: 70, yPerc: 65 },
      { profile: "mobile", idKey: "focus-3", cardLabel: "Focus", xPerc: 50, yPerc: 35 },
      { profile: "mobile", idKey: "forward-3", cardLabel: "Moving Forward", xPerc: 30, yPerc: 65 },
      { profile: "mobile", idKey: "letgo-3", cardLabel: "Letting Go", xPerc: 70, yPerc: 65 },
    ],
    categories: [
      {
        id: "custom",
        title: "-------",
        intentions: [
          {
            id: "fml:custom:own",
            kind: "simple",
            label: "Write My Own Intention",
          },
        ],
      },
      {
        id: "relationships",
        title: "💞 Relationships",
        intentions: [
          {
            id: "fml:rel:improve",
            kind: "simple",
            label:
              "How can I improve my relationship with ${relationshipName}?",
            requiresName: true,
          },
          {
            id: "fml:rel:work-together",
            kind: "simple",
            label: "How can ${relationshipName} and I work together better?",
            requiresName: true,
          },
          {
            id: "fml:rel:communicate",
            kind: "simple",
            label:
              "How can I communicate more clearly with ${relationshipName}?",
            requiresName: true,
          },
          {
            id: "fml:rel:heal-history",
            kind: "simple",
            label:
              "What do I need to do to heal from my history with ${relationshipName}?",
            requiresName: true,
          },
          {
            id: "fml:rel:focus-strengthen",
            kind: "simple",
            label:
              "What should I focus on now to strengthen my relationship with ${relationshipName}?",
            requiresName: true,
          },
          {
            id: "fml:rel:boundary",
            kind: "simple",
            label:
              "What boundary would help my relationship with ${relationshipName} the most?",
            requiresName: true,
          },
          {
            id: "fml:rel:approach",
            kind: "simple",
            label:
              "How do I approach my realtionship with ${relationshipName} with love and care?",
            requiresName: true,
          },
        ],
      },
      {
        id: "home",
        title: "🏡 Home & Lifestyle",
        intentions: [
          {
            id: "fml:home:improve",
            kind: "simple",
            label: "How can I improve my home life?",
          },
          {
            id: "fml:home:move",
            kind: "simple",
            label: "What do I need to consider before making a move?",
          },
          {
            id: "fml:home:community",
            kind: "simple",
            label: "How do I strengthen ties in my community?",
          },
          {
            id: "fml:home:reputation",
            kind: "simple",
            label: "How do I improve my public image and reputation?",
          },
          {
            id: "fml:home:daily",
            kind: "simple",
            label: "What should I focus on to feel better day to day?",
          },
          {
            id: "fml:home:let-go",
            kind: "simple",
            label: "What can I let go of at home to reduce stress?",
          },
          {
            id: "fml:home:fit",
            kind: "simple",
            label: "How can I create a living situation that fits me?",
          },
        ],
      },
      {
        id: "career",
        title: "💼 Career & Creativity",
        intentions: [
          {
            id: "fml:career:advance",
            kind: "simple",
            label: "What do I need to do to advance at work?",
          },
          {
            id: "fml:career:income",
            kind: "simple",
            label: "What do I need to do to increase my income?",
          },
          {
            id: "fml:career:respect",
            kind: "simple",
            label: "What do I need to do to earn more respect at work?",
          },
          {
            id: "fml:career:visibility",
            kind: "simple",
            label: "How can I get more visibility for my work?",
          },
          {
            id: "fml:career:skills",
            kind: "simple",
            label: "What should I focus on to grow my skills?",
          },
          {
            id: "fml:career:delegate",
            kind: "simple",
            label: "What can I delegate or drop to free up focus?",
          },
          {
            id: "fml:career:creative-step",
            kind: "simple",
            label: "What is the next step to move my creative work forward?",
          },
        ],
      },
      {
        id: "growth",
        title: "🌱 Personal Growth",
        intentions: [
          {
            id: "fml:growth:grace",
            kind: "simple",
            label: "How can I give myself more grace?",
          },
          {
            id: "fml:growth:align",
            kind: "simple",
            label: "What do I need to do to align my actions with my values?",
          },
          {
            id: "fml:growth:habit",
            kind: "simple",
            label: "Which habit is holding me back, and how do I break it?",
          },
          {
            id: "fml:growth:belief",
            kind: "simple",
            label: "Which belief is holding me back, and how can I refine it?",
          },
          {
            id: "fml:growth:confidence",
            kind: "simple",
            label: "How can I build steady confidence right now?",
          },
          {
            id: "fml:growth:mental",
            kind: "simple",
            label: "What should I focus on to support my mental well-being?",
          },
          {
            id: "fml:growth:momentum",
            kind: "simple",
            label: "What is the next step to create momentum?",
          },
        ],
      },
      {
        id: "spiritual",
        title: "🔮 Spiritual Development",
        intentions: [
          {
            id: "fml:spirit:intuition",
            kind: "simple",
            label: "How do I follow my intuition more consistently?",
          },
          {
            id: "fml:spirit:inner-child",
            kind: "simple",
            label: "How do I care for my inner child with compassion?",
          },
          {
            id: "fml:spirit:heartbreak",
            kind: "simple",
            label: "How do I heal from heartbreak?",
          },
          {
            id: "fml:spirit:grief",
            kind: "simple",
            label: "How do I heal from grief after a loss?",
          },
          {
            id: "fml:spirit:missed",
            kind: "simple",
            label: "How do I move on from a missed opportunity?",
          },
          {
            id: "fml:spirit:practice",
            kind: "simple",
            label: "How can I align my daily practice with my values?",
          },
          {
            id: "fml:spirit:surrender",
            kind: "simple",
            label: "What will it take for me to surrender?",
          },
        ],
      },
    ],
  },

  {
    id: "kdk",
    title: "What I Know • What I Don't • What I Need To Know",
    slots: [
  // desktop
     { profile: "desktop", idKey: "know-3",      cardLabel: "What I Know",        xPerc: 50, yPerc: 35 },
      { profile: "desktop", idKey: "dontknow-3",  cardLabel: "What I Don't Know",  xPerc: 30, yPerc: 65 },
      { profile: "desktop", idKey: "need-3",      cardLabel: "What I Need To Know",xPerc: 70, yPerc: 65 },
  // tablet
      { profile: "tablet",  idKey: "know-3",      cardLabel: "What I Know",        xPerc: 50, yPerc: 35 },
      { profile: "tablet",  idKey: "dontknow-3",  cardLabel: "What I Don't Know",  xPerc: 30, yPerc: 65 },
      { profile: "tablet",  idKey: "need-3",      cardLabel: "What I Need To Know",xPerc: 70, yPerc: 65 },
  // mobile
      { profile: "mobile",  idKey: "know-3",      cardLabel: "What I Know",        xPerc: 50, yPerc: 35 },
      { profile: "mobile",  idKey: "dontknow-3",  cardLabel: "What I Don't Know",  xPerc: 30, yPerc: 65 },
      { profile: "mobile",  idKey: "need-3",      cardLabel: "What I Need To Know",xPerc: 70, yPerc: 65 },
],
    categories: [
      {
        id: "custom",
        title: "-------",
        intentions: [
          {
            id: "kdk:custom:own",
            kind: "simple",
            label: "Write My Own Intention",
          },
        ],
      },
      {
        id: "relationships",
        title: "💞 Relationships",
        intentions: [
          {
            id: "kdk:rel:state",
            kind: "simple",
            label:
              "What is the real state of my relationship with ${relationshipName}?",
            requiresName: true,
          },
          {
            id: "kdk:rel:blindspot",
            kind: "simple",
            label: "What am I not seeing about ${relationshipName} and me?",
            requiresName: true,
          },
          {
            id: "kdk:rel:nextsay",
            kind: "simple",
            label: "What should I say or ask next with ${relationshipName}?",
            requiresName: true,
          },
          {
            id: "kdk:rel:misaligned",
            kind: "simple",
            label:
              "Where are our expectations not aligned with ${relationshipName}?",
            requiresName: true,
          },
          {
            id: "kdk:rel:signs",
            kind: "simple",
            label:
              "What signs show if this is healthy with ${relationshipName}?",
            requiresName: true,
          },
          {
            id: "kdk:rel:confirm",
            kind: "simple",
            label:
              "What do I need to confirm before I decide with ${relationshipName}?",
            requiresName: true,
          },
          {
            id: "kdk:rel:one_step",
            kind: "simple",
            label:
              "What one step would bring clarity with ${relationshipName}?",
            requiresName: true,
          },
        ],
      },
      {
        id: "home",
        title: "🏡 Home & Lifestyle",
        intentions: [
          {
            id: "kdk:home:state",
            kind: "simple",
            label: "What is the real state of my home life?",
          },
          {
            id: "kdk:home:overlook",
            kind: "simple",
            label: "What am I overlooking in my daily routines?",
          },
          {
            id: "kdk:home:first_change",
            kind: "simple",
            label: "What might be hidden from me at home?",
          },
          {
            id: "kdk:home:limits",
            kind: "simple",
            label: "Where are my limits being crossed at home?",
          },
          {
            id: "kdk:home:big_diff",
            kind: "simple",
            label:
              "What would make the biggest difference to how my home feels?",
          },
          {
            id: "kdk:home:fit",
            kind: "simple",
            label:
              "What do I need to know about my neighborhood or community fit?",
          },
          {
            id: "kdk:home:one_habit",
            kind: "simple",
            label: "What one habit would bring more clarity to my days?",
          },
        ],
      },
      {
        id: "career",
        title: "💼 Career & Creativity",
        intentions: [
          {
            id: "kdk:career:state",
            kind: "simple",
            label: "What is the real state of my work right now?",
          },
          {
            id: "kdk:career:missing",
            kind: "simple",
            label: "What important factor am I missing about my path?",
          },
          {
            id: "kdk:career:focus_next",
            kind: "simple",
            label: "What should I focus on next at work?",
          },
          {
            id: "kdk:career:gaps",
            kind: "simple",
            label: "Where are the gaps in my skills or portfolio?",
          },
          {
            id: "kdk:career:proof",
            kind: "simple",
            label: "What proof points show I'm ready for more?",
          },
          {
            id: "kdk:career:ask",
            kind: "simple",
            label: "What do I need to ask for to move forward?",
          },
          {
            id: "kdk:career:one_step",
            kind: "simple",
            label: "What one step would clarify my direction?",
          },
        ],
      },
      {
        id: "growth",
        title: "🌱 Personal Growth",
        intentions: [
          {
            id: "kdk:growth:true_now",
            kind: "simple",
            label: "What is true about my growth right now?",
          },
          {
            id: "kdk:growth:blindspot",
            kind: "simple",
            label: "What blind spot is shaping my choices?",
          },
          {
            id: "kdk:growth:one_practice",
            kind: "simple",
            label: "What one practice would help most now?",
          },
          {
            id: "kdk:growth:alignment",
            kind: "simple",
            label: "Where am I out of alignment with my values?",
          },
          {
            id: "kdk:growth:story",
            kind: "simple",
            label: "What story do I need to update?",
          },
          {
            id: "kdk:growth:support",
            kind: "simple",
            label: "What support do I need to move forward?",
          },
          {
            id: "kdk:growth:next_step",
            kind: "simple",
            label: "What is the next small step that brings clarity?",
          },
        ],
      },
      {
        id: "spiritual",
        title: "🔮 Spiritual Development",
        intentions: [
          {
            id: "kdk:spirit:true_now",
            kind: "simple",
            label: "What is true about my purpose in this season?",
          },
          {
            id: "kdk:spirit:guidance",
            kind: "simple",
            label: "What guidance am I missing or ignoring?",
          },
          {
            id: "kdk:spirit:practice",
            kind: "simple",
            label: "What practice should I return to now?",
          },
          {
            id: "kdk:spirit:holding_on",
            kind: "simple",
            label: "Where am I holding on when I could let go?",
          },
          {
            id: "kdk:spirit:pattern",
            kind: "simple",
            label: "What signs point to the bigger pattern here?",
          },
          {
            id: "kdk:spirit:values",
            kind: "simple",
            label: "What do I need to recommit to in my values?",
          },
          {
            id: "kdk:spirit:next_step",
            kind: "simple",
            label: "What is the next right step for me?",
          },
        ],
      },
    ],
  },

  // --- Past • Present • Hidden • Advice • Outcome ---
  {
    id: "pphao",
    title: "Past • Present • Hidden • Advice • Outcome",
    slots: [
    { profile: "desktop", idKey: "past-5",    cardLabel: "Past",          xPerc: 16, yPerc: 50 },
    { profile: "desktop", idKey: "present-5", cardLabel: "Present",       xPerc: 33, yPerc: 50 },
    { profile: "desktop", idKey: "hidden-5",  cardLabel: "Hidden Issues", xPerc: 50, yPerc: 50 },
    { profile: "desktop", idKey: "advice-5",  cardLabel: "Advice",        xPerc: 67, yPerc: 50 },
    { profile: "desktop", idKey: "outcome-5", cardLabel: "Outcome",       xPerc: 84, yPerc: 50 },
  // tablet (same as desktop)
    { profile: "tablet",  idKey: "past-5",    cardLabel: "Past",          xPerc: 16, yPerc: 50 },
    { profile: "tablet",  idKey: "present-5", cardLabel: "Present",       xPerc: 33, yPerc: 50 },
    { profile: "tablet",  idKey: "hidden-5",  cardLabel: "Hidden Issues", xPerc: 50, yPerc: 50 },
    { profile: "tablet",  idKey: "advice-5",  cardLabel: "Advice",        xPerc: 67, yPerc: 50 },
    { profile: "tablet",  idKey: "outcome-5", cardLabel: "Outcome",       xPerc: 84, yPerc: 50 },
  // mobile (vertical stack left @ x=30)
     { profile: "mobile",  idKey: "past-5",    cardLabel: "Past",          xPerc: 30, yPerc: 10 },
     { profile: "mobile",  idKey: "present-5", cardLabel: "Present",       xPerc: 30, yPerc: 30 },
     { profile: "mobile",  idKey: "hidden-5",  cardLabel: "Hidden Issues", xPerc: 30, yPerc: 50 },
     { profile: "mobile",  idKey: "advice-5",  cardLabel: "Advice",        xPerc: 30, yPerc: 70 },
     { profile: "mobile",  idKey: "outcome-5", cardLabel: "Outcome",       xPerc: 30, yPerc: 90 },
    ],
    categories: [
      {
        id: "custom",
        title: "-------",
        intentions: [
          {
            id: "pphao:custom:own",
            kind: "simple",
            label: "Write My Own Intention",
          },
        ],
      },
      {
        id: "relationships",
        title: "💞 Relationships",
        intentions: [
          {
            id: "pphao:rel:speak-honestly",
            kind: "simple",
            label:
              "What changes when I speak honestly with ${relationshipName}?",
            requiresName: true,
          },
          {
            id: "pphao:rel:set-boundary",
            kind: "simple",
            label:
              "How will things shift if I set a clear boundary with ${relationshipName}?",
            requiresName: true,
          },
          {
            id: "pphao:rel:move-forward",
            kind: "simple",
            label:
              "Where could this go if I want to move forward with ${relationshipName}?",
            requiresName: true,
          },
          {
            id: "pphao:rel:ask-needs",
            kind: "simple",
            label:
              "What happens when I ask ${relationshipName} directly for what I need?",
            requiresName: true,
          },
          {
            id: "pphao:rel:more-space",
            kind: "simple",
            label:
              "How does giving ${relationshipName} and me more space affect our bond?",
            requiresName: true,
          },
          {
            id: "pphao:rel:quality-time",
            kind: "simple",
            label:
              "What improves if I plan regular quality time with ${relationshipName}?",
            requiresName: true,
          },
          {
            id: "pphao:rel:focus-on-me",
            kind: "simple",
            label:
              "What unfolds when I focus on my growth before reconnecting with ${relationshipName}?",
            requiresName: true,
          },
        ],
      },
      {
        id: "home",
        title: "🏡 Home & Lifestyle",
        intentions: [
          {
            id: "pphao:home:move-this-year",
            kind: "simple",
            label: "What changes if I move this year?",
          },
          {
            id: "pphao:home:redesign",
            kind: "simple",
            label: "How will redesigning my space affect me?",
          },
          {
            id: "pphao:home:work-home-bounds",
            kind: "simple",
            label:
              "What changes if I set clearer boundaries between work and home?",
          },
          {
            id: "pphao:home:join-groups",
            kind: "simple",
            label: "Where does joining local groups lead?",
          },
          {
            id: "pphao:home:simplify-month",
            kind: "simple",
            label:
              "What happens when I simplify meals, sleep, and screens for a month?",
          },
          {
            id: "pphao:home:steady-rhythm",
            kind: "simple",
            label: "What outcome follows if I choose a steadier daily rhythm?",
          },
          {
            id: "pphao:home:prioritize-rest",
            kind: "simple",
            label: "How does prioritizing rest affect my well-being?",
          },
        ],
      },
      {
        id: "career",
        title: "💼 Career & Creativity",
        intentions: [
          {
            id: "pphao:career:accept-job",
            kind: "simple",
            label: "What follows if I accept the new job?",
          },
          {
            id: "pphao:career:promotion-case",
            kind: "simple",
            label:
              "What result can I expect if I make a clear case for promotion?",
          },
          {
            id: "pphao:career:ask-raise",
            kind: "simple",
            label: "How will asking for a raise with evidence play out?",
          },
          {
            id: "pphao:career:upskill",
            kind: "simple",
            label: "What opens up when I upskill with a targeted course?",
          },
          {
            id: "pphao:career:pivot",
            kind: "simple",
            label: "Where could a pivot toward a better-fit role take me?",
          },
          {
            id: "pphao:career:mentorship",
            kind: "simple",
            label: "How does my path shift if I seek guidance or mentorship?",
          },
          {
            id: "pphao:career:hi-impact",
            kind: "simple",
            label: "What changes if I focus on the highest-impact work?",
          },
        ],
      },
      {
        id: "growth",
        title: "🌱 Personal Growth",
        intentions: [
          {
            id: "pphao:growth:ask-support",
            kind: "simple",
            label: "What unfolds by asking for support?",
          },
          {
            id: "pphao:growth:one-boundary",
            kind: "simple",
            label: "What outcome follows if I set one firm boundary?",
          },
          {
            id: "pphao:growth:social-break",
            kind: "simple",
            label: "What would happen if I took a social media break?",
          },
          {
            id: "pphao:growth:seek-support",
            kind: "simple",
            label:
              "Where does seeking support (therapist, mentor, or group) lead?",
          },
          {
            id: "pphao:growth:self-forgive",
            kind: "simple",
            label: "What changes when I forgive myself and move forward?",
          },
          {
            id: "pphao:growth:sleep-movement",
            kind: "simple",
            label: "How does better sleep and movement affect me?",
          },
          {
            id: "pphao:growth:steady-steps",
            kind: "simple",
            label:
              "What momentum builds if I take consistent steps towards my goals?",
          },
        ],
      },
      {
        id: "spiritual",
        title: "🔮 Spiritual Development",
        intentions: [
          {
            id: "pphao:spirit:follow-intuition",
            kind: "simple",
            label: "What unfolds when I follow my intuition here?",
          },
          {
            id: "pphao:spirit:daily-practice",
            kind: "simple",
            label: "How will a simple daily practice change my outlook?",
          },
          {
            id: "pphao:spirit:release-control",
            kind: "simple",
            label: "What shifts if I release control and act where I can?",
          },
          {
            id: "pphao:spirit:align-values",
            kind: "simple",
            label: "Where does aligning choices with my values lead?",
          },
          {
            id: "pphao:spirit:retreat-circle",
            kind: "simple",
            label: "What perspective comes from a retreat or circle?",
          },
          {
            id: "pphao:spirit:serve-sustain",
            kind: "simple",
            label: "What happens when I serve in a way that also sustains me?",
          },
          {
            id: "pphao:spirit:trust-timing",
            kind: "simple",
            label:
              "What develops if I trust the timing and take the next step now?",
          },
        ],
      },
    ],
  },

  // --- Goal · Status · Block · Bridge · Lesson ---
  {
    id: "gsbbl",
    title: "Goal · Status · Block · Bridge · Lesson",
    slots: [
  // desktop (unchanged)
  { profile: "desktop", idKey: "goal-5",    cardLabel: "Goal",   xPerc: 16, yPerc: 50 },
  { profile: "desktop", idKey: "current-5", cardLabel: "Status", xPerc: 33, yPerc: 50 },
  { profile: "desktop", idKey: "block-5",   cardLabel: "Block",  xPerc: 50, yPerc: 50 },
  { profile: "desktop", idKey: "bridge-5",  cardLabel: "Bridge", xPerc: 67, yPerc: 50 },
  { profile: "desktop", idKey: "lesson-5",  cardLabel: "Lesson", xPerc: 84, yPerc: 50 },
  // tablet (same as desktop)
  { profile: "tablet",  idKey: "goal-5",    cardLabel: "Goal",   xPerc: 16, yPerc: 50 },
  { profile: "tablet",  idKey: "current-5", cardLabel: "Status", xPerc: 33, yPerc: 50 },
  { profile: "tablet",  idKey: "block-5",   cardLabel: "Block",  xPerc: 50, yPerc: 50 },
  { profile: "tablet",  idKey: "bridge-5",  cardLabel: "Bridge", xPerc: 67, yPerc: 50 },
  { profile: "tablet",  idKey: "lesson-5",  cardLabel: "Lesson", xPerc: 84, yPerc: 50 },
  // mobile (vertical stack left @ x=30)
  { profile: "mobile",  idKey: "goal-5",    cardLabel: "Goal",   xPerc: 30, yPerc: 10 },
  { profile: "mobile",  idKey: "current-5", cardLabel: "Status", xPerc: 30, yPerc: 30 },
  { profile: "mobile",  idKey: "block-5",   cardLabel: "Block",  xPerc: 30, yPerc: 50 },
  { profile: "mobile",  idKey: "bridge-5",  cardLabel: "Bridge", xPerc: 30, yPerc: 70 },
  { profile: "mobile",  idKey: "lesson-5",  cardLabel: "Lesson", xPerc: 30, yPerc: 90 },
],
    categories: [
      {
        id: "custom",
        title: "-------",
        intentions: [
          {
            id: "gsbbl:custom:own",
            kind: "simple",
            label: "Write My Own Intention",
          },
        ],
      },
      {
        id: "relationships",
        title: "💞 Relationships",
        intentions: [
          {
            id: "gsbbl:rel:improve",
            kind: "simple",
            label:
              "How can I improve my relationship with ${relationshipName}?",
            requiresName: true,
          },
          {
            id: "gsbbl:rel:communicate",
            kind: "simple",
            label:
              "How can I communicate more clearly with ${relationshipName}?",
            requiresName: true,
          },
          {
            id: "gsbbl:rel:boundaries",
            kind: "simple",
            label:
              "How can I establish healthy boundaries with ${relationshipName}?",
            requiresName: true,
          },
          {
            id: "gsbbl:rel:reconcile",
            kind: "simple",
            label:
              "What should I do to reconcile with ${relationshipName} after a rupture?",
            requiresName: true,
          },
          {
            id: "gsbbl:rel:negotiate",
            kind: "simple",
            label:
              "What should I do to negotiate a fair agreement with ${relationshipName}?",
            requiresName: true,
          },
          {
            id: "gsbbl:rel:support",
            kind: "simple",
            label:
              "How can I support ${relationshipName} on their path without losing myself?",
            requiresName: true,
          },
          {
            id: "gsbbl:rel:align-expectations",
            kind: "simple",
            label:
              "How can I align my expectations with ${relationshipName} and what could be next?",
            requiresName: true,
          },
        ],
      },
      {
        id: "home",
        title: "🏡 Home & Lifestyle",
        intentions: [
          {
            id: "gsbbl:home:save-for-place",
            kind: "simple",
            label: "What should I do to save for a new place to live?",
          },
          {
            id: "gsbbl:home:plan-move",
            kind: "simple",
            label: "How can I plan a move that's smooth and low-stress?",
          },
          {
            id: "gsbbl:home:routine-sticks",
            kind: "simple",
            label: "How can I build a daily routine that actually sticks?",
          },
          {
            id: "gsbbl:home:reduce-load",
            kind: "simple",
            label:
              "What should I do to reduce household stress and mental load?",
          },
          {
            id: "gsbbl:home:rest-sleep",
            kind: "simple",
            label: "How can I strengthen rest and sleep so I feel restored?",
          },
          {
            id: "gsbbl:home:ties-neighbors",
            kind: "simple",
            label: "How can I grow supportive ties with neighbors and friends?",
          },
          {
            id: "gsbbl:home:community-rep",
            kind: "simple",
            label:
              "How can I improve my presence and reputation in my community?",
          },
        ],
      },
      {
        id: "career",
        title: "💼 Career & Creativity",
        intentions: [
          {
            id: "gsbbl:career:better-fit-role",
            kind: "simple",
            label:
              "What should I do to advance into a role that fits me better?",
          },
          {
            id: "gsbbl:career:income-sustain",
            kind: "simple",
            label: "What should I do to increase my income sustainably?",
          },
          {
            id: "gsbbl:career:respect",
            kind: "simple",
            label: "How can I earn more respect and influence at work?",
          },
          {
            id: "gsbbl:career:showcase",
            kind: "simple",
            label:
              "How can I complete a showcase project to grow my visibility?",
          },
          {
            id: "gsbbl:career:negotiate-comp",
            kind: "simple",
            label:
              "What should I do to negotiate compensation with clarity and confidence?",
          },
          {
            id: "gsbbl:career:stabilize-cash",
            kind: "simple",
            label: "How can I stabilize my cash flow?",
          },
          {
            id: "gsbbl:career:balance",
            kind: "simple",
            label: "How can I balance workload and well-being?",
          },
        ],
      },
      {
        id: "growth",
        title: "🌱 Personal Growth",
        intentions: [
          {
            id: "gsbbl:growth:confidence-trust",
            kind: "simple",
            label: "How can I build steady confidence and self-trust?",
          },
          {
            id: "gsbbl:growth:align-values",
            kind: "simple",
            label: "What should I do to align my actions with my values?",
          },
          {
            id: "gsbbl:growth:change-habit",
            kind: "simple",
            label: "What should I do to change a habit that's holding me back?",
          },
          {
            id: "gsbbl:growth:update-belief",
            kind: "simple",
            label: "How can I update a belief that's limiting me?",
          },
          {
            id: "gsbbl:growth:momentum",
            kind: "simple",
            label:
              "What should I do to create reliable momentum and reduce procrastination?",
          },
          {
            id: "gsbbl:growth:mental-health",
            kind: "simple",
            label:
              "How can I care for my mental and emotional health this season?",
          },
          {
            id: "gsbbl:growth:honest-kind",
            kind: "simple",
            label: "How can I express myself more honestly and kindly?",
          },
        ],
      },
      {
        id: "spiritual",
        title: "🔮 Spiritual Development",
        intentions: [
          {
            id: "gsbbl:spirit:intuition",
            kind: "simple",
            label: "How can I follow my intuition more consistently?",
          },
          {
            id: "gsbbl:spirit:daily-practice",
            kind: "simple",
            label:
              "What should I do to keep a simple daily practice I'll stick with?",
          },
          {
            id: "gsbbl:spirit:purpose-values",
            kind: "simple",
            label: "How can I live closer to my purpose and values?",
          },
          {
            id: "gsbbl:spirit:grief-heal",
            kind: "simple",
            label: "How can I heal and integrate after expereincing grief?",
          },
          {
            id: "gsbbl:spirit:gratitude",
            kind: "simple",
            label:
              "What should I do to bring more gratitude and presence into everyday life?",
          },
          {
            id: "gsbbl:spirit:surrender-flow",
            kind: "simple",
            label: "How can I surrender to the flow of my life?",
          },
          {
            id: "gsbbl:spirit:contribute",
            kind: "simple",
            label: "How can I contribute in a way that also sustains me?",
          },
        ],
      },
    ],
  },

  // --- This or That With Pros and Cons (binary) ---
  {
    id: "this-or-that",
    title: "This or That With Pros and Cons",
    slots: [
  // desktop (unchanged)
  { profile: "desktop", idKey: "focus-5", cardLabel: "Focus",         xPerc: 50, yPerc: 30 },
  { profile: "desktop", idKey: "prosA-5", cardLabel: "Pros:\nOption A",xPerc: 20, yPerc: 65 },
  { profile: "desktop", idKey: "consA-5", cardLabel: "Cons:\nOption A",xPerc: 35, yPerc: 65 },
  { profile: "desktop", idKey: "prosB-5", cardLabel: "Pros:\nOption B",xPerc: 65, yPerc: 65 },
  { profile: "desktop", idKey: "consB-5", cardLabel: "Cons:\nOption B",xPerc: 80, yPerc: 65 },
  // tablet (same as desktop)
  { profile: "tablet",  idKey: "focus-5", cardLabel: "Focus",         xPerc: 50, yPerc: 30 },
  { profile: "tablet",  idKey: "prosA-5", cardLabel: "Pros:\nOption A",xPerc: 20, yPerc: 65 },
  { profile: "tablet",  idKey: "consA-5", cardLabel: "Cons:\nOption A",xPerc: 35, yPerc: 65 },
  { profile: "tablet",  idKey: "prosB-5", cardLabel: "Pros:\nOption B",xPerc: 65, yPerc: 65 },
  { profile: "tablet",  idKey: "consB-5", cardLabel: "Cons:\nOption B",xPerc: 80, yPerc: 65 },
  // mobile (requested layout)
  { profile: "mobile",  idKey: "focus-5", cardLabel: "Focus",         xPerc: 50, yPerc: 20 },
  { profile: "mobile",  idKey: "prosA-5", cardLabel: "Pros:\nOption A",xPerc: 30, yPerc: 50 },
  { profile: "mobile",  idKey: "consA-5", cardLabel: "Cons:\nOption A",xPerc: 70, yPerc: 50 },
  { profile: "mobile",  idKey: "prosB-5", cardLabel: "Pros:\nOption B",xPerc: 30, yPerc: 80 },
  { profile: "mobile",  idKey: "consB-5", cardLabel: "Cons:\nOption B",xPerc: 70, yPerc: 80 },
],
    categories: [
      {
        id: "custom",
        title: "-------",
        intentions: [
          {
            id: "tot:custom:own",
            kind: "simple",
            label: "Write My Own Intention",
          },
        ],
      },
      {
        id: "relationships",
        title: "💞 Relationships",
        intentions: [
          {
            id: "tot:rel:stay-or-leave",
            kind: "binary",
            label:
              "Should I stay in the relationship with ${relationshipName} or leave?",
            requiresName: true,
            pathA: "Staying",
            pathB: "Leaving",
          },
          {
            id: "tot:rel:reconcile-or-move-on",
            kind: "binary",
            label:
              "Is it better to reconcile with ${relationshipName} or move on?",
            requiresName: true,
            pathA: "Reconciling",
            pathB: "Moving On",
          },
          {
            id: "tot:rel:open-up-or-boundary",
            kind: "binary",
            label:
              "Should I open up more to ${relationshipName} or set stronger boundaries?",
            requiresName: true,
            pathA: "Opening Up",
            pathB: "Stronger Boundaries",
          },
          {
            id: "tot:rel:fling-or-longterm",
            kind: "binary",
            label:
              "Should I treat my connection with ${relationshipName} as a fling or something long-term?",
            requiresName: true,
            pathA: "Fling",
            pathB: "Long-Term",
          },
          {
            id: "tot:rel:partner-needs-or-growth",
            kind: "binary",
            label:
              "Do I focus on ${relationshipName}'s needs or my own growth first?",
            requiresName: true,
            pathA: "My Partner's Needs",
            pathB: "My Own Growth",
          },
        ],
      },
      {
        id: "home",
        title: "🏡 Home & Lifestyle",
        intentions: [
          {
            id: "tot:home:move-or-stay",
            kind: "binary",
            label: "Should I move or stay where I am?",
            pathA: "Moving",
            pathB: "Staying",
          },
          {
            id: "tot:home:rent-or-buy",
            kind: "binary",
            label: "Is it better to rent or buy right now?",
            pathA: "Renting",
            pathB: "Buying",
          },
          {
            id: "tot:home:settle-or-abroad",
            kind: "binary",
            label: "Do I settle here or explore living abroad?",
            pathA: "Settling Here",
            pathB: "Exploring Abroad",
          },
          {
            id: "tot:home:downsize-or-expand",
            kind: "binary",
            label: "Should I downsize or expand my living situation?",
            pathA: "Downsizing",
            pathB: "Expanding",
          },
        ],
      },
      {
        id: "career",
        title: "💼 Career & Creativity",
        intentions: [
          {
            id: "tot:career:stay-or-new",
            kind: "binary",
            label: "Should I stay at my current job or find a new one?",
            pathA: "Current Job",
            pathB: "New Job",
          },
          {
            id: "tot:career:stability-or-passion",
            kind: "binary",
            label: "Is it better to pursue stability or passion?",
            pathA: "Stability",
            pathB: "Passion",
          },
          {
            id: "tot:career:business-or-employ",
            kind: "binary",
            label: "Do I start my own business or stick with employment?",
            pathA: "Own Business",
            pathB: "Employment",
          },
          {
            id: "tot:career:invest-or-educate",
            kind: "binary",
            label: "Should I invest/save money or spend on growth/education?",
            pathA: "Investing / Saving",
            pathB: "Growth / Education",
          },
          {
            id: "tot:career:promo-or-balance",
            kind: "binary",
            label: "Do I take the promotion or keep work-life balance?",
            pathA: "Promotion",
            pathB: "Work-Life Balance",
          },
        ],
      },
      {
        id: "growth",
        title: "🌱 Personal Growth",
        intentions: [
          {
            id: "tot:growth:logic-or-intuition",
            kind: "binary",
            label: "Should I follow logic or intuition?",
            pathA: "Logic",
            pathB: "Intuition",
          },
          {
            id: "tot:growth:rest-or-push",
            kind: "binary",
            label: "Is it better to rest or push forward?",
            pathA: "Rest",
            pathB: "Pushing Forward",
          },
          {
            id: "tot:growth:continue-or-reinvent",
            kind: "binary",
            label: "Do I continue on my current path or reinvent myself?",
            pathA: "Current Path",
            pathB: "Reinventing Myself",
          },
          {
            id: "tot:growth:self-or-others",
            kind: "binary",
            label: "Should I focus on self-development or helping others?",
            pathA: "Self-Development",
            pathB: "Helping Others",
          },
          {
            id: "tot:growth:private-or-public",
            kind: "binary",
            label:
              "Do I keep my spiritual practice private or share it publicly?",
            pathA: "Private",
            pathB: "Public",
          },
        ],
      },
      {
        id: "spiritual",
        title: "🔮 Spiritual Development",
        intentions: [
          {
            id: "tot:spirit:patience-or-action",
            kind: "binary",
            label: "Is this lesson about patience or action?",
            pathA: "Patience",
            pathB: "Action",
          },
          {
            id: "tot:spirit:surrender-or-control",
            kind: "binary",
            label: "Do I surrender to the flow or try to take control?",
            pathA: "Surrendering",
            pathB: "Taking Control",
          },
          {
            id: "tot:spirit:trust-or-plan",
            kind: "binary",
            label: "Should I trust the universe or make a concrete plan?",
            pathA: "Trusting The Universe",
            pathB: "Making A Concrete Plan",
          },
          {
            id: "tot:spirit:karmic-or-fresh",
            kind: "binary",
            label: "Is this situation karmic or a fresh start?",
            pathA: "Karmic",
            pathB: "Fresh Start",
          },
          {
            id: "tot:spirit:heal-past-or-create",
            kind: "binary",
            label: "Do I focus on healing the past or creating the future?",
            pathA: "Healing The Past",
            pathB: "Creating The Future",
          },
        ],
      },
    ],
  },

  // --- Horoscope ---
  {
    id: "horoscope",
    title: "Horoscope",
    slots: [
      // Dynamic slots will be provided by horoscopeSpreadDef() function
    ],
    categories: [
      {
        id: "custom",
        title: "-------",
        intentions: [
          {
            id: "horoscope:custom:own",
            kind: "simple",
            label: "Write My Own Intention",
          },
        ],
      },
      {
        id: "relationships",
        title: "💞 Relationships",
        intentions: [
          {
            id: "horoscope:rel:learn-over-year",
            kind: "simple",
            label:
              "What can I expect to learn from my relationship with ${relationshipName} over the next year?",
            requiresName: true,
          },
          {
            id: "horoscope:rel:dating-year",
            kind: "simple",
            label: "What will my dating life look like over the next year?",
          },
        ],
      },
      {
        id: "home",
        title: "🏡 Home & Lifestyle",
        intentions: [
          {
            id: "horoscope:home:changes",
            kind: "simple",
            label:
              "What changes in my home life will occur over the next year?",
          },
          {
            id: "horoscope:home:success",
            kind: "simple",
            label:
              "How will my relationship with success develop over the next year?",
          },
        ],
      },
      {
        id: "career",
        title: "💼 Career & Creativity",
        intentions: [
          {
            id: "horoscope:career:trajectory",
            kind: "simple",
            label:
              "What will my trajectory with work look like over the next year?",
          },
          {
            id: "horoscope:career:maximize",
            kind: "simple",
            label:
              "How can I maximize my efforts for promotion or growth this year?",
          },
        ],
      },
      {
        id: "growth",
        title: "🌱 Personal Growth",
        intentions: [
          {
            id: "horoscope:growth:learn",
            kind: "simple",
            label:
              "What do I need to learn in order to reach my full potential this year?",
          },
          {
            id: "horoscope:growth:healing",
            kind: "simple",
            label: "What does the journey of my healing look like this year?",
          },
        ],
      },
      {
        id: "spiritual",
        title: "🔮 Spiritual Development",
        intentions: [
          {
            id: "horoscope:spirit:remember",
            kind: "simple",
            label:
              "What do I need to remember so I can follow my intuition over this year?",
          },
          {
            id: "horoscope:spirit:offer",
            kind: "simple",
            label:
              "How can I offer my souls purpose and share my calling this year?",
          },
        ],
      },
    ],
  },
];