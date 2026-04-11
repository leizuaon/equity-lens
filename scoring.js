/*  ════════════════════════════════════════════════════════════════
    EquityLens — Transparent Weighted Scoring Framework v3.2
    6 dimensions → 0-100 composite score → recommendation tier
    ════════════════════════════════════════════════════════════════ */

/* ── Weight Configuration ── */
const SCORING_WEIGHTS = {
  valuation:    0.20,   // 20%
  growth:       0.25,   // 25%
  profitability:0.20,   // 20%
  health:       0.10,   // 10%
  technical:    0.10,   // 10%
  quality:      0.15,   // 15%
};

const SCORING_LABELS = {
  valuation:    "Valuation",
  growth:       "Growth",
  profitability:"Profitability",
  health:       "Financial Health",
  technical:    "Technical",
  quality:      "Quality",
};

const SCORING_COLORS = {
  valuation:    "#60a5fa",
  growth:       "#34d399",
  profitability:"#fbbf24",
  health:       "#a78bfa",
  technical:    "#f87171",
  quality:      "#22d3ee",
};

/* ══════════════════════════════════════════════════════════════
   SUB-SCORE CALCULATORS  (each returns 0-100)
   ══════════════════════════════════════════════════════════════ */

function lerp(val, worst, best) {
  if (val == null) return 50;
  const clamped = Math.max(0, Math.min(1, (val - worst) / (best - worst)));
  return Math.round(clamped * 100);
}

/* ─ Valuation (lower multiples = better) ─ */
function scoreValuation(s) {
  const pe   = lerp(s.forwardPe, 80, 10);       // 10× forward = perfect, 80× = 0
  const peg  = lerp(s.peg, 4.0, 0.5);           // 0.5 PEG = perfect
  const ps   = lerp(s.ps, 40, 1);               // 1× P/S = perfect
  const eveb = lerp(s.evEbitda, 60, 8);          // 8× EV/EBITDA = perfect
  return Math.round((pe * 0.35 + peg * 0.30 + ps * 0.20 + eveb * 0.15));
}

/* ─ Growth (higher = better) ─ */
function scoreGrowth(s) {
  const rev   = lerp(s.revenueGrowth, -5, 50);   // 50%+ rev growth = perfect
  const eps   = lerp(s.epsGrowth, -10, 60);       // 60%+ EPS growth = perfect
  const rev3y = lerp(s.revenueGrowth3y, 0, 40);   // 40% 3-year CAGR = perfect
  const fwd   = lerp(s.fwdRevenueGrowth, 0, 35);  // 35%+ forward = perfect
  return Math.round(rev * 0.30 + eps * 0.25 + rev3y * 0.25 + fwd * 0.20);
}

/* ─ Profitability (higher = better) ─ */
function scoreProfitability(s) {
  const gross = lerp(s.grossMargin, 10, 80);      // 80%+ gross margin = perfect
  const op    = lerp(s.operatingMargin, 0, 45);   // 45%+ op margin = perfect
  const net   = lerp(s.netMargin, 0, 35);         // 35%+ net margin = perfect
  return Math.round(gross * 0.35 + op * 0.35 + net * 0.30);
}

/* ─ Financial Health ─ */
function scoreHealth(s) {
  const de   = lerp(s.debtToEquity, 3.0, 0.0);    // 0 D/E = perfect
  const cr   = lerp(s.currentRatio, 0.5, 3.0);    // 3.0+ current ratio = perfect
  const ctd  = lerp(s.cashToDebt, 0, 5.0);        // 5× cash-to-debt = perfect
  return Math.round(de * 0.40 + cr * 0.30 + ctd * 0.30);
}

/* ─ Technical (momentum signals) ─ */
function scoreTechnical(s) {
  // RSI — best around 55-65 (bullish but not overbought)
  let rsiScore = 50;
  if (s.rsi != null) {
    if (s.rsi >= 50 && s.rsi <= 65) rsiScore = 90;
    else if (s.rsi >= 40 && s.rsi <= 70) rsiScore = 65;
    else if (s.rsi > 70) rsiScore = 30;  // overbought
    else rsiScore = 40; // oversold — contrarian opportunity but risky
  }
  const sma = s.sma50vs200 === "above" ? 85 : 30;
  const macd = s.macdSignal === "bullish" ? 90 : s.macdSignal === "neutral" ? 55 : 20;
  const dist = lerp(s.distFrom52High, -40, 0);  // closer to 52w high = better
  return Math.round(rsiScore * 0.25 + sma * 0.25 + macd * 0.25 + dist * 0.25);
}

/* ─ Quality (earnings quality, capital allocation) ─ */
function scoreQuality(s) {
  const roe  = lerp(s.roe, 0, 40);        // 40%+ ROE = perfect
  const roic = lerp(s.roic, 0, 30);       // 30%+ ROIC = perfect
  const fcf  = s.freeCashFlow != null ? lerp(s.freeCashFlow / 1e9, 0, 50) : 50; // $50B+ FCF = perfect
  return Math.round(roe * 0.40 + roic * 0.35 + fcf * 0.25);
}

/* ══════════════════════════════════════════════════════════════
   COMPOSITE SCORE & RECOMMENDATION
   ══════════════════════════════════════════════════════════════ */

function computeScore(stock) {
  const dimensions = {
    valuation:     scoreValuation(stock),
    growth:        scoreGrowth(stock),
    profitability: scoreProfitability(stock),
    health:        scoreHealth(stock),
    technical:     scoreTechnical(stock),
    quality:       scoreQuality(stock),
  };

  const composite = Math.round(
    Object.entries(dimensions).reduce((sum, [key, val]) => sum + val * SCORING_WEIGHTS[key], 0)
  );

  let recommendation;
  if (composite >= 75) recommendation = "Strong Buy";
  else if (composite >= 60) recommendation = "Buy";
  else if (composite >= 40) recommendation = "Watch";
  else recommendation = "Avoid";

  return { ...stock, dimensions, score: composite, recommendation };
}

function scoreAllStocks(stocks) {
  return stocks.map(computeScore).sort((a, b) => b.score - a.score);
}
