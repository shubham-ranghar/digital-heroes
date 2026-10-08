export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    id: "subscription",
    question: "What does my subscription include?",
    answer:
      "An active subscription lets you save your latest five Stableford scores, enter the monthly prize draw, and route at least 10% of each billing cycle to the charity you choose.",
  },
  {
    id: "scores",
    question: "How many scores count toward the draw?",
    answer:
      "We use your five most recent Stableford scores. When you add a sixth, the oldest score drops off automatically so your entry always reflects your latest form.",
  },
  {
    id: "draw-timing",
    question: "When does the monthly draw run?",
    answer:
      "Draws are tied to the calendar month. Entries close before the published draw date, results are simulated and reviewed by admins, then published to the Winners page.",
  },
  {
    id: "charity-percent",
    question: "Can I change my charity or percentage?",
    answer:
      "Yes. Update your cause and contribution percentage (minimum 10%) anytime in Dashboard → Settings. Changes apply to future billing cycles.",
  },
  {
    id: "payouts",
    question: "How are prizes paid?",
    answer:
      "Winners upload scorecard proof in the dashboard. After admin verification, prizes move from pending to paid. Tier pools split equally among winners at the same match level.",
  },
  {
    id: "cancellation",
    question: "Can I cancel?",
    answer:
      "You can cancel anytime from Settings (end of billing period). Access continues until the paid period ends; charity allocations already processed are not reversed.",
  },
  {
    id: "verification",
    question: "Why do you verify winners?",
    answer:
      "Verification keeps the draw fair for every member. We compare submitted scorecards against your saved scores and draw rules before releasing funds.",
  },
  {
    id: "random-vs-algo",
    question: "Random or algorithmic draws?",
    answer:
      "Admins choose the mode per month. Random draws pick winning numbers independently. Algorithmic draws derive numbers from anonymised subscriber score data while keeping individual entries private.",
  },
  {
    id: "privacy",
    question: "What data do you store?",
    answer:
      "Account email, display name, scores, charity preference, subscription status via Razorpay, and draw entries. See our Privacy page for retention and your rights.",
  },
  {
    id: "eligibility",
    question: "Who can join?",
    answer:
      "You must be 18 or older and able to enter a binding subscription in your country. Prize draws follow the rules on our Terms page.",
  },
  {
    id: "support",
    question: "How do I get help?",
    answer:
      "Use the Contact page for account, billing, or draw questions. We aim to respond within two business days.",
  },
];
