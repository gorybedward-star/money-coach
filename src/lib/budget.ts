/** Family Budget logic: pure functions, no UI. All amounts converted to monthly. */

export type Freq = "weekly" | "biweekly" | "semimonthly" | "monthly" | "yearly";

export const FREQ_LABEL: Record<Freq, string> = {
  weekly: "/week",
  biweekly: "/2 weeks",
  semimonthly: "twice a month",
  monthly: "/month",
  yearly: "/year",
};

const PER_YEAR: Record<Freq, number> = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12, yearly: 1 };

export function toMonthly(amount: number, freq: Freq) {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return (amount * PER_YEAR[freq]) / 12;
}

export type GroupId = "income" | "save" | "essentials" | "debt" | "lifestyle";
export type Line = { id: string; label: string; amount: string; freq: Freq };
export type Budget = Record<GroupId, Line[]>;

export const SPEND_GROUPS: Exclude<GroupId, "income">[] = ["save", "essentials", "debt", "lifestyle"];

export type Check = { tone: "good" | "watch" | "info"; title: string; detail: string };

export function summarize(b: Budget) {
  const sum = (g: GroupId) => b[g].reduce((s, l) => s + toMonthly(Number(l.amount), l.freq), 0);
  const income = sum("income");
  const totals = { save: sum("save"), essentials: sum("essentials"), debt: sum("debt"), lifestyle: sum("lifestyle") };
  const planned = totals.save + totals.essentials + totals.debt + totals.lifestyle;
  const left = income - planned;
  const pct = (n: number) => (income > 0 ? (n / income) * 100 : 0);
  const housing = b.essentials
    .filter((l) => /rent|mortgage|housing/i.test(l.label))
    .reduce((s, l) => s + toMonthly(Number(l.amount), l.freq), 0);

  const checks: Check[] = [];
  if (income <= 0) {
    checks.push({ tone: "info", title: "Start with your take-home pay", detail: "Add what actually lands in your account after taxes and deductions." });
  } else {
    const savePct = pct(totals.save);
    if (savePct >= 10) checks.push({ tone: "good", title: `You pay yourself first: ${savePct.toFixed(0)}%`, detail: "A portion of all you earn is yours to keep. Keep it automatic." });
    else if (savePct > 0) checks.push({ tone: "watch", title: `Paying yourself ${savePct.toFixed(0)}%`, detail: "Great start. Try raising it 1% at a time toward 10% or more." });
    else checks.push({ tone: "watch", title: "Nothing set aside for you yet", detail: "Even $25 a paycheck builds the habit. Add it to “Pay yourself first.”" });

    if (left < -0.5) checks.push({ tone: "watch", title: `Over by ${Math.round(-left).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} a month`, detail: "Your plan spends more than you bring home. Trim lifestyle items first, then look at the biggest bills." });
    else if (left > 0.5) checks.push({ tone: "info", title: `${Math.round(left).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} not yet assigned`, detail: "Give every dollar a job: extra to savings, an emergency fund, or debt payoff." });
    else checks.push({ tone: "good", title: "Every dollar has a job", detail: "Your income and your plan match exactly. That's a zero-based budget." });

    const hPct = pct(housing);
    if (housing > 0) checks.push(hPct <= 30
      ? { tone: "good", title: `Housing is ${hPct.toFixed(0)}% of take-home`, detail: "Within the common 30% guideline." }
      : { tone: "watch", title: `Housing is ${hPct.toFixed(0)}% of take-home`, detail: "Above the common 30% guideline, which can squeeze everything else. It's a long-term lever to keep in mind." });

    const dPct = pct(totals.debt);
    if (dPct > 15) checks.push({ tone: "watch", title: `Debt payments take ${dPct.toFixed(0)}%`, detail: "Paying off high-interest balances frees this money for your goals. Try the Debt Payoff Calculator." });
    else if (totals.debt > 0) checks.push({ tone: "info", title: `Debt payments: ${dPct.toFixed(0)}%`, detail: "Keep going. Every balance you clear raises your monthly cash flow." });
  }

  return { income, totals, planned, left, pct, housing, checks };
}

let seq = 0;
export const newLine = (label = "", amount = "", freq: Freq = "monthly"): Line => ({ id: `l${Date.now().toString(36)}${seq++}`, label, amount, freq });

export function blankBudget(): Budget {
  return {
    income: [newLine("Paycheck"), newLine("Partner's paycheck"), newLine("Side income")],
    save: [newLine("Emergency fund"), newLine("Investing / retirement (outside payroll)"), newLine("Savings goal (car, holidays, home)")],
    essentials: [
      newLine("Rent or mortgage"), newLine("Utilities (power, water, gas)"), newLine("Groceries"), newLine("Car payment"),
      newLine("Gas and transit"), newLine("Car insurance"), newLine("Health insurance"), newLine("Life insurance"),
      newLine("Childcare"), newLine("Phone and internet"),
    ],
    debt: [newLine("Credit cards"), newLine("Student loans"), newLine("Personal loans")],
    lifestyle: [newLine("Eating out"), newLine("Subscriptions and streaming"), newLine("Entertainment"), newLine("Shopping and personal care"), newLine("Giving")],
  };
}

export function exampleBudget(): Budget {
  const L = newLine;
  return {
    income: [L("Paycheck", "1650", "biweekly"), L("Partner's paycheck", "1400", "biweekly"), L("Side income", "200")],
    save: [L("Emergency fund", "150"), L("Investing / retirement (outside payroll)", "200"), L("Savings goal (car, holidays, home)", "100")],
    essentials: [
      L("Rent or mortgage", "1750"), L("Utilities (power, water, gas)", "260"), L("Groceries", "900"), L("Car payment", "420"),
      L("Gas and transit", "280"), L("Car insurance", "1500", "yearly"), L("Health insurance", "0"), L("Life insurance", "45"),
      L("Childcare", "600"), L("Phone and internet", "160"),
    ],
    debt: [L("Credit cards", "250"), L("Student loans", "180"), L("Personal loans", "0")],
    lifestyle: [L("Eating out", "250"), L("Subscriptions and streaming", "60"), L("Entertainment", "120"), L("Shopping and personal care", "200"), L("Giving", "100")],
  };
}
