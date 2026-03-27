/**
 * Local procedural quiz generator.
 * Generates varied MCQs per module without external APIs.
 */

export type ModuleName = 'budgeting' | 'saving' | 'investing' | 'credit';

export interface GeneratedQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: ModuleName;
}

type Difficulty = 'easy' | 'medium' | 'hard';

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function randint(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(rng: () => number, values: T[]): T {
  return values[randint(rng, 0, values.length - 1)];
}

function shuffle<T>(rng: () => number, arr: T[]): T[] {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i--) {
    const j = randint(rng, 0, i);
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function buildQuestion(
  rng: () => number,
  category: ModuleName,
  difficulty: Difficulty,
  question: string,
  correct: string,
  distractors: string[],
  explanation: string,
  idSeed: number
): GeneratedQuestion {
  const options = shuffle(rng, [correct, ...distractors]).slice(0, 4);
  return {
    id: `generated_${category}_${idSeed}`,
    question,
    options,
    correctAnswer: options.indexOf(correct),
    explanation,
    difficulty,
    category,
  };
}

function budgetingQuestion(rng: () => number, seed: number): GeneratedQuestion {
  const factories = [
    () => {
      const income = randint(rng, 24, 90) * 100;
      const answer = Math.round(income * 0.5);
      return buildQuestion(
        rng,
        'budgeting',
        'easy',
        `You earn ${formatUSD(income)} per month. Using the 50/30/20 rule, how much should go to needs?`,
        formatUSD(answer),
        [formatUSD(Math.round(income * 0.3)), formatUSD(Math.round(income * 0.2)), formatUSD(Math.round(income * 0.6))],
        `Needs should be 50% of income. 50% of ${formatUSD(income)} is ${formatUSD(answer)}.`,
        seed
      );
    },
    () => {
      const needs = randint(rng, 12, 35) * 100;
      const months = 3;
      const answer = needs * months;
      return buildQuestion(
        rng,
        'budgeting',
        'medium',
        `If your monthly essentials cost ${formatUSD(needs)}, what is a 3-month emergency fund target?`,
        formatUSD(answer),
        [formatUSD(needs * 2), formatUSD(needs * 4), formatUSD(needs * 6)],
        `A 3-month emergency fund is monthly essentials × 3 = ${formatUSD(answer)}.`,
        seed
      );
    },
    () => {
      const income = randint(rng, 30, 80) * 100;
      const fixed = Math.round(income * 0.55);
      const currentWants = Math.round(income * 0.35);
      const maxWants = Math.round(income * 0.3);
      const cut = currentWants - maxWants;
      return buildQuestion(
        rng,
        'budgeting',
        'hard',
        `Income is ${formatUSD(income)}. Fixed needs are ${formatUSD(fixed)} and wants are ${formatUSD(currentWants)}. To align with 50/30/20, by how much should wants be reduced?`,
        formatUSD(cut),
        [formatUSD(Math.abs(fixed - Math.round(income * 0.5))), formatUSD(Math.round(income * 0.1)), formatUSD(Math.round(income * 0.2))],
        `Wants should be 30% of income: ${formatUSD(maxWants)}. Current wants are ${formatUSD(currentWants)}, so reduce by ${formatUSD(cut)}.`,
        seed
      );
    },
  ];

  return pick(rng, factories)();
}

function savingQuestion(rng: () => number, seed: number): GeneratedQuestion {
  const factories = [
    () => {
      const initial = randint(rng, 0, 10) * 100;
      const monthly = randint(rng, 80, 300);
      const months = pick(rng, [6, 12, 18]);
      const total = initial + monthly * months;
      return buildQuestion(
        rng,
        'saving',
        'easy',
        `Starting with ${formatUSD(initial)}, you save ${formatUSD(monthly)} per month for ${months} months. About how much will you have (ignoring interest)?`,
        formatUSD(total),
        [formatUSD(total - monthly), formatUSD(total + monthly), formatUSD(initial + monthly * (months - 2))],
        `Total savings is initial + monthly savings × months = ${formatUSD(total)}.`,
        seed
      );
    },
    () => {
      const principal = randint(rng, 10, 60) * 100;
      const rate = pick(rng, [3, 4, 5]);
      const interest = Math.round(principal * (rate / 100));
      return buildQuestion(
        rng,
        'saving',
        'medium',
        `A high-yield savings account has ${rate}% APY. On ${formatUSD(principal)}, what is approximately one year of interest?`,
        formatUSD(interest),
        [formatUSD(Math.round(interest / 2)), formatUSD(Math.round(interest * 1.5)), formatUSD(Math.round(interest * 2))],
        `One year simple estimate is principal × APY = ${formatUSD(interest)}.`,
        seed
      );
    },
    () => {
      const income = randint(rng, 25, 90) * 100;
      const saved = randint(rng, 200, 1200);
      const pct = Math.round((saved / income) * 100);
      return buildQuestion(
        rng,
        'saving',
        'hard',
        `If your monthly income is ${formatUSD(income)} and you save ${formatUSD(saved)} monthly, what is your savings rate?`,
        `${pct}%`,
        [`${Math.max(1, pct - 5)}%`, `${pct + 5}%`, `${Math.round(saved / 10)}%`],
        `Savings rate = savings / income × 100 = ${pct}%.`,
        seed
      );
    },
  ];

  return pick(rng, factories)();
}

function investingQuestion(rng: () => number, seed: number): GeneratedQuestion {
  const factories = [
    () => {
      const concept = pick(rng, ['diversification', 'index funds', 'compound interest']);
      const map: Record<string, { correct: string; wrong: string[]; explanation: string }> = {
        diversification: {
          correct: 'Spreading money across different assets to reduce risk',
          wrong: ['Putting all money in one stock for faster gains', 'Buying only bonds forever', 'Trading every day'],
          explanation: 'Diversification reduces concentration risk by spreading investments.',
        },
        'index funds': {
          correct: 'A fund that tracks a market index like the S&P 500',
          wrong: ['A guaranteed-return savings account', 'A private loan portfolio', 'A high-fee day trading strategy'],
          explanation: 'Index funds are low-cost funds that track a benchmark index.',
        },
        'compound interest': {
          correct: 'Returns earning additional returns over time',
          wrong: ['Interest paid only once at account opening', 'A type of credit score', 'A tax deduction strategy'],
          explanation: 'Compounding means growth on both principal and prior gains.',
        },
      };

      const data = map[concept];
      return buildQuestion(
        rng,
        'investing',
        'easy',
        `Which statement best describes ${concept}?`,
        data.correct,
        data.wrong,
        data.explanation,
        seed
      );
    },
    () => {
      const yearly = randint(rng, 150, 500);
      const years = pick(rng, [5, 10, 15]);
      const invested = yearly * years;
      return buildQuestion(
        rng,
        'investing',
        'medium',
        `If you invest ${formatUSD(yearly)} each year for ${years} years (ignoring growth), how much principal have you invested?`,
        formatUSD(invested),
        [formatUSD(invested - yearly), formatUSD(invested + yearly), formatUSD(Math.round(invested * 0.5))],
        `Principal invested is yearly contribution × years = ${formatUSD(invested)}.`,
        seed
      );
    },
    () => {
      const horizon = pick(rng, ['2 years', '30 years']);
      const answer = horizon === '2 years' ? 'Lower-volatility mix (more bonds/cash)' : 'Higher stock allocation may be appropriate';
      return buildQuestion(
        rng,
        'investing',
        'hard',
        `An investor needs money in ${horizon}. Which approach is generally more suitable?`,
        answer,
        horizon === '2 years'
          ? [
              '100% high-volatility stocks',
              'Concentrate in one tech stock',
              'Ignore risk tolerance',
            ]
          : [
              'Keep everything in checking forever',
              'Concentrate in one stock',
              'Panic sell during every dip',
            ],
        'Time horizon strongly influences risk capacity and portfolio design.',
        seed
      );
    },
  ];

  return pick(rng, factories)();
}

function creditQuestion(rng: () => number, seed: number): GeneratedQuestion {
  const factories = [
    () => {
      const limit = pick(rng, [2000, 3000, 5000, 8000]);
      const balance = pick(rng, [300, 600, 900, 1200, 1500]);
      const util = Math.round((balance / limit) * 100);
      return buildQuestion(
        rng,
        'credit',
        'easy',
        `If your card limit is ${formatUSD(limit)} and your balance is ${formatUSD(balance)}, what is your credit utilization?`,
        `${util}%`,
        [`${Math.max(1, util - 10)}%`, `${util + 10}%`, `${Math.round((balance / (limit / 2)) * 100)}%`],
        `Utilization = balance / limit × 100 = ${util}%. Keeping it below 30% is generally healthier.`,
        seed
      );
    },
    () => {
      const apr = pick(rng, [16, 20, 24]);
      const balance = pick(rng, [500, 1000, 2000]);
      const monthly = Math.round((balance * (apr / 100)) / 12);
      return buildQuestion(
        rng,
        'credit',
        'medium',
        `A card has ${apr}% APR and a ${formatUSD(balance)} balance. About how much interest is that per month (rough estimate)?`,
        formatUSD(monthly),
        [formatUSD(Math.round(monthly / 2)), formatUSD(Math.round(monthly * 1.5)), formatUSD(Math.round(monthly * 2))],
        `Rough monthly interest is balance × APR / 12 = about ${formatUSD(monthly)}.`,
        seed
      );
    },
    () => {
      return buildQuestion(
        rng,
        'credit',
        'hard',
        'Which action usually improves credit score the fastest over time?',
        'On-time payments and lowering card utilization',
        [
          'Opening many new cards in one month',
          'Closing your oldest credit account',
          'Carrying a balance to show activity',
        ],
        'Payment history and utilization are major credit score factors.',
        seed
      );
    },
  ];

  return pick(rng, factories)();
}

export function generateRandomQuestion(moduleName: ModuleName, seed: number): GeneratedQuestion {
  const rng = mulberry32(seed);

  switch (moduleName) {
    case 'budgeting':
      return budgetingQuestion(rng, seed);
    case 'saving':
      return savingQuestion(rng, seed);
    case 'investing':
      return investingQuestion(rng, seed);
    case 'credit':
      return creditQuestion(rng, seed);
    default:
      return budgetingQuestion(rng, seed);
  }
}

export function generateRandomQuiz(moduleName: ModuleName, count: number = 5): GeneratedQuestion[] {
  const questions: GeneratedQuestion[] = [];
  const seen = new Set<string>();
  const base = Date.now() ^ Math.floor(Math.random() * 1_000_000_000);

  let attempts = 0;
  while (questions.length < count && attempts < count * 20) {
    const seed = base + attempts * 7919 + questions.length * 104729;
    const q = generateRandomQuestion(moduleName, seed);
    if (!seen.has(q.question)) {
      seen.add(q.question);
      questions.push(q);
    }
    attempts += 1;
  }

  return questions;
}
