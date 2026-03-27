export const quizData = {
  budgeting: [
    {
      id: 'b1',
      question: 'What does the 50/30/20 budgeting rule suggest?',
      options: [
        '50% Savings, 30% Needs, 20% Wants',
        '50% Needs, 30% Wants, 20% Savings',
        '50% Wants, 30% Savings, 20% Needs',
        '50% Investing, 30% Rent, 20% Food',
      ],
      correctAnswer: 1,
      explanation:
        'Allocate 50% of your income to absolute necessities, 30% to wants, and 20% to savings or debt.',
    },
    {
      id: 'b2',
      question: "Which of the following is considered a 'Need' rather than a 'Want'?",
      options: [
        'A daily $5 coffee',
        'The latest smartphone upgrade',
        'Basic health insurance',
        'A gym membership',
      ],
      correctAnswer: 2,
      explanation:
        'Needs are essential for survival and basic security. Health insurance protects you from catastrophic medical debt.',
    },
    {
      id: 'b3',
      question: "What is an 'Emergency Fund' primarily used for?",
      options: [
        'A down payment on a house',
        'Unexpected expenses like medical bills or car repairs',
        'An upcoming vacation',
        'Investing in the stock market',
      ],
      correctAnswer: 1,
      explanation:
        'It should be easily accessible cash specifically reserved for unforeseen, urgent costs.',
    },
  ],
  saving: [
    {
      id: 's1',
      question: 'What is the recommended emergency fund amount?',
      options: [
        '$500 minimum',
        '3-6 months of living expenses',
        'Whatever you can save',
        'One year of income',
      ],
      correctAnswer: 1,
      explanation:
        'Most financial experts recommend keeping 3-6 months of living expenses in an easily accessible savings account.',
    },
    {
      id: 's2',
      question: 'Which saving strategy uses the "pay yourself first" approach?',
      options: [
        'Spending first, then saving the rest',
        'Automatically transferring money to savings before spending',
        'Saving only at year-end',
        'Investing all money immediately',
      ],
      correctAnswer: 1,
      explanation:
        'Paying yourself first means automatically setting aside savings before using money for expenses, making saving automatic and consistent.',
    },
    {
      id: 's3',
      question: 'What is a High-Yield Savings Account primarily useful for?',
      options: [
        'Earning higher interest on short-term savings',
        'Trading stocks',
        'Getting a loan',
        'Paying taxes',
      ],
      correctAnswer: 0,
      explanation:
        'High-yield savings accounts offer better interest rates than regular savings accounts, perfect for building your emergency fund or short-term goals.',
    },
  ],
  investing: [
    {
      id: 'i1',
      question: 'What is a mutual fund?',
      options: [
        'A single company stock',
        'A pool of money from many investors invested in diversified assets',
        'A type of credit card',
        'A savings bond',
      ],
      correctAnswer: 1,
      explanation:
        'A mutual fund pools money from multiple investors to purchase a diversified portfolio of stocks, bonds, or other securities.',
    },
    {
      id: 'i2',
      question: 'What is the main advantage of starting to invest early?',
      options: [
        'You pay fewer taxes',
        'Compound interest gives your money more time to grow',
        'You avoid inflation',
        'Stocks are cheaper early in the year',
      ],
      correctAnswer: 1,
      explanation:
        'Starting early lets compound interest work in your favor—your earnings generate their own earnings, creating exponential growth over time.',
    },
    {
      id: 'i3',
      question: 'What does "diversification" mean in investing?',
      options: [
        'Putting all money in one stock',
        'Spreading investments across different asset types to reduce risk',
        'Trading stocks every day',
        'Only investing in bonds',
      ],
      correctAnswer: 1,
      explanation:
        'Diversification spreads your investments across various assets (stocks, bonds, sectors) so poor performance in one area doesn\'t devastate your whole portfolio.',
    },
  ],
  credit: [
    {
      id: 'c1',
      question: 'What does APR stand for in relation to credit cards?',
      options: [
        'Annual Payment Ratio',
        'Average Percentage Rate',
        'Annual Percentage Rate',
        'Accrued Principal Rate',
      ],
      correctAnswer: 2,
      explanation:
        'Annual Percentage Rate (APR) represents the yearly cost of borrowing money, including interest and fees.',
    },
    {
      id: 'c2',
      question: 'Which action will negatively impact your credit score the fastest?',
      options: [
        'Checking your own credit score',
        'Missing a payment by more than 30 days',
        'Paying off your balance in full every month',
        'Opening a savings account',
      ],
      correctAnswer: 1,
      explanation:
        'Payment history makes up about 35% of your credit score. A single late payment drops your score significantly.',
    },
    {
      id: 'c3',
      question: 'What is a good credit score range?',
      options: ['300-400', '500-650', '700-850', '900-1000'],
      correctAnswer: 2,
      explanation:
        'Credit scores typically range from 300-850. A score above 700 is considered good, and above 750 is excellent.',
    },
  ],
};
