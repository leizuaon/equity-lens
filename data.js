/*  ════════════════════════════════════════════════════════════════
    EquityLens — Stock Data Layer
    Market indices, sector performance, and 15 individual stocks
    All figures represent a single-day snapshot (April 11, 2025)
    ════════════════════════════════════════════════════════════════ */

const MARKET_INDICES = [
  { ticker: "SPX",  name: "S&P 500",    value: 5842.01, change:  1.81, ytd:  8.2  },
  { ticker: "NDX",  name: "Nasdaq 100",  value: 20983.50, change: 2.27, ytd: 10.5 },
  { ticker: "DJI",  name: "Dow Jones",   value: 42547.85, change: 0.97, ytd:  5.1 },
  { ticker: "RUT",  name: "Russell 2000", value: 2096.12, change: 1.21, ytd:  1.8 },
  { ticker: "VIX",  name: "Volatility",  value: 14.82,    change: -4.30, ytd: null },
  { ticker: "TNX",  name: "10Y Yield",   value: 4.38,     change:  0.02, ytd: null },
];

const SECTOR_PERFORMANCE = [
  { name: "Technology",        color: "#60a5fa", return30d:  6.8 },
  { name: "Healthcare",        color: "#34d399", return30d:  2.1 },
  { name: "Financials",        color: "#fbbf24", return30d:  3.4 },
  { name: "Consumer Cyclical", color: "#f87171", return30d:  4.2 },
  { name: "Communication",     color: "#a78bfa", return30d:  5.5 },
  { name: "Industrials",       color: "#fb923c", return30d:  1.9 },
  { name: "Consumer Defensive",color: "#4ade80", return30d:  0.7 },
  { name: "Semiconductors",    color: "#22d3ee", return30d:  8.3 },
  { name: "Software",          color: "#e879f9", return30d:  5.1 },
];

const STOCKS = [
  /* ── 1  NVDA ── */
  {
    ticker: "NVDA", name: "NVIDIA Corporation", sector: "Semiconductors",
    price: 950.02, change: 3.41,
    weekHigh52: 974.00, weekLow52: 473.20, marketCap: 2.34e12, avgVolume: 42_000_000, beta: 1.68,
    pe: 72.3, forwardPe: 38.5, peg: 1.05, ps: 37.2, pb: 56.8, evEbitda: 58.1,
    revenueGrowth: 122.0, epsGrowth: 168.0, revenueGrowth3y: 65.0, fwdRevenueGrowth: 55.0,
    grossMargin: 76.0, operatingMargin: 62.0, netMargin: 55.8,
    roe: 115.0, roic: 82.0, debtToEquity: 0.41, currentRatio: 4.17, freeCashFlow: 28.9e9, cashToDebt: 3.2,
    rsi: 64, sma50vs200: "above", distFrom52High: -2.5, macdSignal: "bullish",
    catalysts: [
      "Blackwell B200 GPU ramp — 2-3× inference perf over H100",
      "Sovereign AI infrastructure spend accelerating globally",
      "Auto / robotics TAM expansion via DRIVE Thor",
      "NIM microservices creating enterprise software moat"
    ],
    risks: [
      "Export controls tightening on China (≈25% of data-center rev)",
      "Customer concentration — top 4 hyperscalers ≈50% rev",
      "Elevated valuation leaves little room for execution misses",
      "Custom ASIC competition from Google TPU, Amazon Trainium"
    ],
    bullCase: "AI capex super-cycle extends 3-5 years; NVDA captures 80%+ of training GPU spend and grows inference share. $200B+ rev by FY27.",
    bearCase: "Hyperscaler ASIC adoption + China export ban cuts TAM by 30%. Margin compression to 55% as competition matures."
  },

  /* ── 2  AAPL ── */
  {
    ticker: "AAPL", name: "Apple Inc.", sector: "Technology",
    price: 228.50, change: 0.84,
    weekHigh52: 237.49, weekLow52: 164.08, marketCap: 3.49e12, avgVolume: 55_000_000, beta: 1.24,
    pe: 33.8, forwardPe: 29.2, peg: 2.48, ps: 8.8, pb: 52.0, evEbitda: 26.5,
    revenueGrowth: 4.9, epsGrowth: 12.0, revenueGrowth3y: 5.8, fwdRevenueGrowth: 7.0,
    grossMargin: 46.2, operatingMargin: 33.5, netMargin: 26.3,
    roe: 160.0, roic: 56.0, debtToEquity: 1.87, currentRatio: 0.99, freeCashFlow: 110.5e9, cashToDebt: 0.52,
    rsi: 58, sma50vs200: "above", distFrom52High: -3.8, macdSignal: "neutral",
    catalysts: [
      "Apple Intelligence on-device AI driving iPhone 16 upgrade cycle",
      "Services revenue accelerating — $100B+ run rate",
      "Vision Pro spatial computing platform long-term optionality",
      "India manufacturing diversification reducing geopolitical risk"
    ],
    risks: [
      "China smartphone market share erosion to Huawei",
      "EU DMA regulation forcing App Store concessions (≈$20B rev)",
      "Limited AI narrative vs. hyperscalers — perception gap",
      "Hardware growth stagnation if upgrade cycle underwhelms"
    ],
    bullCase: "Apple Intelligence creates a sticky AI-services ecosystem. iPhone installed base of 1.2B drives $150B services by 2027. Multiple re-rates to 35× forward.",
    bearCase: "Regulatory headwinds cut App Store take rate 30→20%. China share drops 5pp. Revenue barely grows and PE de-rates to 22×."
  },

  /* ── 3  MSFT ── */
  {
    ticker: "MSFT", name: "Microsoft Corporation", sector: "Technology",
    price: 448.29, change: 1.35,
    weekHigh52: 468.35, weekLow52: 362.90, marketCap: 3.33e12, avgVolume: 22_000_000, beta: 0.90,
    pe: 37.2, forwardPe: 32.0, peg: 2.15, ps: 14.5, pb: 13.2, evEbitda: 27.0,
    revenueGrowth: 16.0, epsGrowth: 21.0, revenueGrowth3y: 14.5, fwdRevenueGrowth: 15.0,
    grossMargin: 69.4, operatingMargin: 44.6, netMargin: 36.4,
    roe: 38.0, roic: 28.0, debtToEquity: 0.35, currentRatio: 1.77, freeCashFlow: 74.1e9, cashToDebt: 1.8,
    rsi: 61, sma50vs200: "above", distFrom52High: -4.3, macdSignal: "bullish",
    catalysts: [
      "Azure AI revenue growing 60%+ QoQ — fastest cloud AI adoption",
      "Copilot enterprise monetization (GitHub, M365, Dynamics)",
      "Gaming / Activision integration driving Xbox content moat",
      "LinkedIn + Copilot AI creating new enterprise workflow TAM"
    ],
    risks: [
      "Azure capex intensity rising — margin pressure near-term",
      "FTC scrutiny on Activision deal execution",
      "OpenAI partnership economics — capped profit structure",
      "Enterprise IT budget reallocation away from legacy licenses"
    ],
    bullCase: "Azure becomes the default AI cloud. Copilot adds $10B+ incremental rev by FY26. MSFT is the picks-and-shovels winner of enterprise AI.",
    bearCase: "Capex spiral for AI infra compresses margins 300bp. Copilot adoption slower than expected — enterprises resist $30/user/month pricing."
  },

  /* ── 4  AMZN ── */
  {
    ticker: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Cyclical",
    price: 206.44, change: 2.18,
    weekHigh52: 214.10, weekLow52: 151.61, marketCap: 2.15e12, avgVolume: 48_000_000, beta: 1.15,
    pe: 42.5, forwardPe: 30.0, peg: 1.32, ps: 3.5, pb: 8.8, evEbitda: 20.5,
    revenueGrowth: 12.5, epsGrowth: 55.0, revenueGrowth3y: 12.0, fwdRevenueGrowth: 11.5,
    grossMargin: 48.4, operatingMargin: 10.8, netMargin: 8.0,
    roe: 22.0, roic: 15.0, debtToEquity: 0.54, currentRatio: 1.05, freeCashFlow: 54.2e9, cashToDebt: 1.5,
    rsi: 66, sma50vs200: "above", distFrom52High: -3.6, macdSignal: "bullish",
    catalysts: [
      "AWS AI services (Bedrock, Trainium) accelerating cloud growth",
      "Retail margin expansion — regionalized fulfillment payoff",
      "Advertising business $56B+ run rate, 24% YoY growth",
      "Project Kuiper satellite constellation launch in 2025"
    ],
    risks: [
      "FTC antitrust case — potential structural remedies",
      "Retail margin pressure from Temu / Shein competition",
      "AWS growth deceleration if enterprise migration slows",
      "Heavy capex ($75B+/yr) compressing near-term FCF"
    ],
    bullCase: "AWS re-accelerates to 20%+ growth on AI workloads. Retail margins expand to 8%+. Ad business becomes 3rd profit pillar. $250 price target.",
    bearCase: "FTC imposes marketplace restrictions. AWS share lost to Azure/GCP. Capex overshoot destroys FCF narrative for 2 years."
  },

  /* ── 5  META ── */
  {
    ticker: "META", name: "Meta Platforms Inc.", sector: "Communication",
    price: 618.52, change: 1.92,
    weekHigh52: 638.40, weekLow52: 414.50, marketCap: 1.57e12, avgVolume: 18_000_000, beta: 1.22,
    pe: 28.5, forwardPe: 23.5, peg: 1.08, ps: 10.2, pb: 9.4, evEbitda: 18.3,
    revenueGrowth: 24.0, epsGrowth: 37.0, revenueGrowth3y: 18.0, fwdRevenueGrowth: 16.0,
    grossMargin: 81.5, operatingMargin: 41.0, netMargin: 34.0,
    roe: 35.0, roic: 28.0, debtToEquity: 0.30, currentRatio: 2.75, freeCashFlow: 52.1e9, cashToDebt: 4.5,
    rsi: 62, sma50vs200: "above", distFrom52High: -3.1, macdSignal: "bullish",
    catalysts: [
      "Reels monetization closing gap with TikTok — efficiency up 30%",
      "AI-powered ad targeting recovering from ATT headwinds",
      "WhatsApp Business + Click-to-Message ads scaling globally",
      "Llama open-source AI models creating developer ecosystem"
    ],
    risks: [
      "Reality Labs burning $16B+/yr with no clear revenue path",
      "Regulatory fines (EU DSA, US child safety legislation)",
      "Young user engagement shifting to TikTok / BeReal",
      "AI capex ramp could reverse efficiency gains"
    ],
    bullCase: "Ad revenue re-accelerates to 20%+ on AI targeting. WhatsApp monetization unlocks $10B rev. Reality Labs optionality becomes real by 2027.",
    bearCase: "Reality Labs continues to burn cash with no product-market fit. Regulatory fines total $20B+. User growth stalls in developed markets."
  },

  /* ── 6  GOOGL ── */
  {
    ticker: "GOOGL", name: "Alphabet Inc.", sector: "Communication",
    price: 176.89, change: 1.45,
    weekHigh52: 191.75, weekLow52: 131.55, marketCap: 2.18e12, avgVolume: 28_000_000, beta: 1.06,
    pe: 25.3, forwardPe: 21.2, peg: 1.22, ps: 7.0, pb: 7.5, evEbitda: 17.8,
    revenueGrowth: 15.0, epsGrowth: 32.0, revenueGrowth3y: 14.0, fwdRevenueGrowth: 13.0,
    grossMargin: 57.5, operatingMargin: 32.0, netMargin: 26.5,
    roe: 32.0, roic: 26.0, debtToEquity: 0.05, currentRatio: 2.10, freeCashFlow: 72.4e9, cashToDebt: 8.5,
    rsi: 55, sma50vs200: "above", distFrom52High: -7.8, macdSignal: "neutral",
    catalysts: [
      "Google Cloud AI (Gemini) driving 28% cloud growth",
      "YouTube ad revenue $45B+ — connected TV expansion",
      "Search AI Overviews increasing engagement + monetization",
      "Waymo autonomous driving scaling to new cities"
    ],
    risks: [
      "DOJ antitrust ruling — potential search distribution remedies",
      "AI search disruption from ChatGPT / Perplexity",
      "Cloud profitability still lagging AWS/Azure margins",
      "Waymo requiring $5B+/yr investment with uncertain ROI"
    ],
    bullCase: "AI Overviews defend search monopoly. GCP hits $100B run rate by 2027. Waymo becomes $50B+ standalone business. Sum-of-parts valuation at $220.",
    bearCase: "DOJ forces default search remedies — Google loses 20% of search distribution. GCP growth decelerates as AI workloads shift to specialized clouds."
  },

  /* ── 7  TSLA ── */
  {
    ticker: "TSLA", name: "Tesla Inc.", sector: "Consumer Cyclical",
    price: 271.00, change: -1.52,
    weekHigh52: 358.64, weekLow52: 138.80, marketCap: 864e9, avgVolume: 95_000_000, beta: 2.05,
    pe: 95.0, forwardPe: 62.0, peg: 3.80, ps: 8.7, pb: 16.2, evEbitda: 55.0,
    revenueGrowth: 8.2, epsGrowth: -23.0, revenueGrowth3y: 28.0, fwdRevenueGrowth: 22.0,
    grossMargin: 18.2, operatingMargin: 8.5, netMargin: 7.9,
    roe: 20.0, roic: 12.0, debtToEquity: 0.11, currentRatio: 1.84, freeCashFlow: 4.4e9, cashToDebt: 5.2,
    rsi: 48, sma50vs200: "below", distFrom52High: -24.4, macdSignal: "bearish",
    catalysts: [
      "FSD v12.x neural net approach — potential licensing revenue",
      "Model 2 ($25K) affordable EV broadening TAM massively",
      "Energy storage (Megapack) revenue growing 100%+ YoY",
      "Optimus humanoid robot long-term optionality"
    ],
    risks: [
      "EV price war compressing auto gross margins to <15%",
      "CEO distraction / brand risk from political controversies",
      "China competition from BYD eroding global market share",
      "FSD regulatory approval timeline highly uncertain"
    ],
    bullCase: "FSD achieves L4 autonomy → robotaxi revenue unlocks $500B TAM. Energy + AI robot optionality justifies $1.5T valuation.",
    bearCase: "Auto margins collapse to 10%. FSD remains L2+. Brand damage from CEO controversies causes 20% demand destruction. Fair value $120."
  },

  /* ── 8  LLY ── */
  {
    ticker: "LLY", name: "Eli Lilly and Company", sector: "Healthcare",
    price: 792.50, change: 0.67,
    weekHigh52: 972.53, weekLow52: 544.83, marketCap: 753e9, avgVolume: 4_200_000, beta: 0.42,
    pe: 82.0, forwardPe: 42.0, peg: 1.65, ps: 18.8, pb: 55.0, evEbitda: 55.0,
    revenueGrowth: 36.0, epsGrowth: 59.0, revenueGrowth3y: 22.0, fwdRevenueGrowth: 28.0,
    grossMargin: 80.5, operatingMargin: 33.0, netMargin: 22.0,
    roe: 68.0, roic: 22.0, debtToEquity: 2.10, currentRatio: 1.12, freeCashFlow: 8.2e9, cashToDebt: 0.4,
    rsi: 42, sma50vs200: "below", distFrom52High: -18.5, macdSignal: "bearish",
    catalysts: [
      "Mounjaro/Zepbound GLP-1 franchise — $40B+ peak sales potential",
      "Obesity pipeline expansion (orforglipron oral GLP-1)",
      "Alzheimer's donanemab approval broadening neuro portfolio",
      "Manufacturing capacity tripling by 2026 to meet demand"
    ],
    risks: [
      "GLP-1 competition intensifying (Novo, Amgen, Pfizer)",
      "Drug pricing reform / IRA negotiation pressure",
      "Supply constraints limiting near-term Zepbound uptake",
      "High valuation premium assumes flawless execution"
    ],
    bullCase: "GLP-1 class becomes $150B market. LLY captures 45% share with best-in-class efficacy. Oral GLP-1 unlocks primary care TAM. $1,200 target.",
    bearCase: "Compounding pharmacies + competition erode pricing power. Manufacturing delays cap growth. PEG expansion unsustainable above 1.5×."
  },

  /* ── 9  JPM ── */
  {
    ticker: "JPM", name: "JPMorgan Chase & Co.", sector: "Financials",
    price: 244.20, change: 0.92,
    weekHigh52: 254.31, weekLow52: 182.45, marketCap: 698e9, avgVolume: 10_000_000, beta: 1.08,
    pe: 12.8, forwardPe: 11.5, peg: 1.85, ps: 4.3, pb: 2.15, evEbitda: null,
    revenueGrowth: 9.5, epsGrowth: 14.0, revenueGrowth3y: 12.0, fwdRevenueGrowth: 5.0,
    grossMargin: null, operatingMargin: 38.0, netMargin: 32.0,
    roe: 17.0, roic: null, debtToEquity: 1.50, currentRatio: null, freeCashFlow: null, cashToDebt: null,
    rsi: 60, sma50vs200: "above", distFrom52High: -4.0, macdSignal: "neutral",
    catalysts: [
      "Net interest income benefiting from higher-for-longer rates",
      "Investment banking recovery — M&A/IPO pipeline strengthening",
      "First Republic integration adding $1B+ annual profit",
      "AI-driven efficiency gains across consumer & commercial banking"
    ],
    risks: [
      "Commercial real estate loan exposure — office delinquencies rising",
      "NII normalization as rate cuts eventually arrive",
      "Increased capital requirements from Basel III endgame",
      "CEO succession uncertainty post-Dimon era"
    ],
    bullCase: "JPM remains the fortress bank. IB recovery + NII stability drives 15% EPS growth. Multiple re-rates to 14× forward as bank sector recovers.",
    bearCase: "CRE losses spike in 2025. NII drops 15% on rate cuts. Basel III capital requirements force $20B+ buyback halt."
  },

  /* ── 10  AVGO ── */
  {
    ticker: "AVGO", name: "Broadcom Inc.", sector: "Semiconductors",
    price: 186.55, change: 2.75,
    weekHigh52: 199.82, weekLow52: 118.50, marketCap: 870e9, avgVolume: 32_000_000, beta: 1.18,
    pe: 38.0, forwardPe: 28.0, peg: 1.42, ps: 16.0, pb: 12.5, evEbitda: 26.0,
    revenueGrowth: 44.0, epsGrowth: 28.0, revenueGrowth3y: 24.0, fwdRevenueGrowth: 20.0,
    grossMargin: 74.0, operatingMargin: 38.0, netMargin: 28.0,
    roe: 28.0, roic: 15.0, debtToEquity: 1.02, currentRatio: 1.12, freeCashFlow: 19.8e9, cashToDebt: 0.8,
    rsi: 68, sma50vs200: "above", distFrom52High: -6.6, macdSignal: "bullish",
    catalysts: [
      "VMware integration — $8.5B synergies over 3 years",
      "Custom AI ASIC wins (Google TPU, Meta MTIA) scaling rapidly",
      "Networking silicon (Memory, Ethernet) critical for AI clusters",
      "Software-defined infrastructure pivot increasing recurring rev"
    ],
    risks: [
      "VMware integration execution risk — customer churn possible",
      "High debt load from VMware acquisition ($60B+)",
      "Custom ASIC cyclicality — hyperscaler design wins lumpy",
      "Broadband/wireless end markets in secular decline"
    ],
    bullCase: "VMware transforms AVGO into infra-software juggernaut. AI networking + custom silicon creates $30B revenue stream. $220 target.",
    bearCase: "VMware customer revolt drives churn. Debt servicing consumes FCF. AI ASIC wins plateau as GPU alternatives dominate."
  },

  /* ── 11  UNH ── */
  {
    ticker: "UNH", name: "UnitedHealth Group", sector: "Healthcare",
    price: 498.30, change: -0.45,
    weekHigh52: 630.73, weekLow52: 436.38, marketCap: 458e9, avgVolume: 4_500_000, beta: 0.58,
    pe: 18.2, forwardPe: 16.0, peg: 1.35, ps: 1.2, pb: 5.8, evEbitda: 14.5,
    revenueGrowth: 8.5, epsGrowth: 10.0, revenueGrowth3y: 12.0, fwdRevenueGrowth: 9.0,
    grossMargin: 24.0, operatingMargin: 8.8, netMargin: 5.8,
    roe: 25.0, roic: 14.0, debtToEquity: 0.75, currentRatio: 0.79, freeCashFlow: 22.3e9, cashToDebt: 0.9,
    rsi: 35, sma50vs200: "below", distFrom52High: -21.0, macdSignal: "bearish",
    catalysts: [
      "Optum Health integration — 90K+ employed physicians",
      "Medicare Advantage enrollment growth (65+ demographic wave)",
      "AI-driven claims processing reducing medical cost ratio",
      "Value-based care models improving long-term profitability"
    ],
    risks: [
      "Medical cost ratio spiking from post-COVID care utilization",
      "DOJ antitrust investigation into Optum/Change Healthcare",
      "Medicare Advantage rate cuts from CMS in 2025",
      "Political risk — Medicare-for-All rhetoric in election year"
    ],
    bullCase: "MCR normalizes in H2 2025. Optum flywheel drives 15% EPS CAGR. Aging demographics provide 20-year tailwind. $650 target.",
    bearCase: "MCR stays elevated above 86%. Regulatory crackdown on Medicare Advantage. DOJ forces Optum divestiture. Fair value $380."
  },

  /* ── 12  CRM ── */
  {
    ticker: "CRM", name: "Salesforce Inc.", sector: "Software",
    price: 278.34, change: 1.12,
    weekHigh52: 318.71, weekLow52: 212.00, marketCap: 268e9, avgVolume: 7_500_000, beta: 1.28,
    pe: 45.0, forwardPe: 28.0, peg: 1.55, ps: 7.4, pb: 4.8, evEbitda: 25.0,
    revenueGrowth: 10.5, epsGrowth: 28.0, revenueGrowth3y: 16.0, fwdRevenueGrowth: 10.0,
    grossMargin: 76.0, operatingMargin: 30.5, netMargin: 17.0,
    roe: 10.5, roic: 8.5, debtToEquity: 0.20, currentRatio: 1.05, freeCashFlow: 12.4e9, cashToDebt: 3.0,
    rsi: 52, sma50vs200: "above", distFrom52High: -12.7, macdSignal: "neutral",
    catalysts: [
      "Agentforce AI platform — autonomous AI agents for enterprise",
      "Data Cloud unification driving cross-sell and upsell",
      "Margin expansion story — operating margins targeting 35%+",
      "Multi-cloud strategy (Slack, Tableau, MuleSoft) creating sticky ecosystem"
    ],
    risks: [
      "Enterprise IT spending slowdown impacting deal velocity",
      "AI disruption risk — ChatGPT-style tools commoditizing CRM",
      "Revenue growth deceleration below 10% — multiple compression risk",
      "Acquisition integration complexity (Slack underperforming)"
    ],
    bullCase: "Agentforce becomes the enterprise AI agent standard. Margins hit 35%+. CRM becomes the AI-powered enterprise operating system. $350 target.",
    bearCase: "Growth slows to 7-8%. AI features commoditized by Microsoft Copilot. Margin expansion already priced in. Fair value $220."
  },

  /* ── 13  AMD ── */
  {
    ticker: "AMD", name: "Advanced Micro Devices", sector: "Semiconductors",
    price: 162.80, change: 3.25,
    weekHigh52: 187.28, weekLow52: 120.62, marketCap: 263e9, avgVolume: 52_000_000, beta: 1.72,
    pe: 48.0, forwardPe: 28.0, peg: 1.60, ps: 10.5, pb: 4.2, evEbitda: 35.0,
    revenueGrowth: 18.0, epsGrowth: 52.0, revenueGrowth3y: 22.0, fwdRevenueGrowth: 28.0,
    grossMargin: 52.0, operatingMargin: 22.0, netMargin: 18.0,
    roe: 9.0, roic: 7.5, debtToEquity: 0.04, currentRatio: 2.52, freeCashFlow: 5.8e9, cashToDebt: 12.0,
    rsi: 58, sma50vs200: "below", distFrom52High: -13.1, macdSignal: "neutral",
    catalysts: [
      "MI300X GPU gaining traction — $5B+ AI GPU revenue target",
      "EPYC server CPU share gains (30%+ of server market)",
      "Ryzen AI PC processor cycle — premium ASP uplift",
      "Xilinx FPGA synergies in embedded AI applications"
    ],
    risks: [
      "AI GPU market dominated by NVDA's CUDA ecosystem",
      "PC/gaming recovery slower than expected",
      "Gross margin expansion limited vs. NVDA's 76%",
      "Inventory build-up risk if AI demand softens"
    ],
    bullCase: "MI300 series captures 15% of AI GPU market by 2026. EPYC takes 40% server share. AMD becomes the credible #2 in AI compute. $220 target.",
    bearCase: "CUDA lock-in limits MI300 adoption to <5% share. PC market remains flat. Margins stuck at 52%. Fair value $130."
  },

  /* ── 14  COST ── */
  {
    ticker: "COST", name: "Costco Wholesale Corp.", sector: "Consumer Defensive",
    price: 952.40, change: 0.34,
    weekHigh52: 1008.26, weekLow52: 671.55, marketCap: 422e9, avgVolume: 2_200_000, beta: 0.75,
    pe: 55.0, forwardPe: 48.0, peg: 3.80, ps: 1.70, pb: 16.5, evEbitda: 38.0,
    revenueGrowth: 7.8, epsGrowth: 12.0, revenueGrowth3y: 10.0, fwdRevenueGrowth: 8.0,
    grossMargin: 12.6, operatingMargin: 3.7, netMargin: 2.8,
    roe: 30.0, roic: 20.0, debtToEquity: 0.32, currentRatio: 1.02, freeCashFlow: 7.4e9, cashToDebt: 2.5,
    rsi: 55, sma50vs200: "above", distFrom52High: -5.5, macdSignal: "neutral",
    catalysts: [
      "Membership fee increase ($5) — first in 7 years, 100% margin",
      "E-commerce growth 18% YoY — Costco Next marketplace",
      "International expansion (China, Japan stores outperforming)",
      "Traffic and ticket size both positive — rare dual growth"
    ],
    risks: [
      "Premium valuation (55× PE) — priced for perfection",
      "Consumer spending slowdown affecting discretionary mix",
      "Warehouse saturation in mature US markets",
      "Thin margins leave no room for cost structure missteps"
    ],
    bullCase: "Membership model is a recurring-revenue fortress. International TAM doubles store count. Membership fee hike drives 15% EPS growth. Premium multiple sustained.",
    bearCase: "Consumer recession hits traffic. 55× PE compresses to 35× even with stable earnings. Stock drops 35% on multiple alone."
  },

  /* ── 15  PLTR ── */
  {
    ticker: "PLTR", name: "Palantir Technologies", sector: "Software",
    price: 115.00, change: 4.20,
    weekHigh52: 125.41, weekLow52: 22.02, marketCap: 268e9, avgVolume: 68_000_000, beta: 2.42,
    pe: 200.0, forwardPe: 90.0, peg: 6.25, ps: 40.0, pb: 28.0, evEbitda: 160.0,
    revenueGrowth: 30.0, epsGrowth: 75.0, revenueGrowth3y: 24.0, fwdRevenueGrowth: 28.0,
    grossMargin: 82.0, operatingMargin: 25.0, netMargin: 19.0,
    roe: 12.0, roic: 10.0, debtToEquity: 0.0, currentRatio: 5.80, freeCashFlow: 950e6, cashToDebt: 99.0,
    rsi: 72, sma50vs200: "above", distFrom52High: -8.3, macdSignal: "bullish",
    catalysts: [
      "AIP (Artificial Intelligence Platform) driving commercial adoption",
      "US government contract renewals + new defense AI mandates",
      "Commercial revenue growing 40%+ — AIP boot camps converting",
      "S&P 500 inclusion driving institutional flows"
    ],
    risks: [
      "Extreme valuation — 200× PE, 40× sales",
      "Government revenue concentration (≈55% of total)",
      "Stock-based compensation diluting shareholders 5%+/yr",
      "Commercial growth must accelerate dramatically to justify valuation"
    ],
    bullCase: "AIP becomes the enterprise AI operating system. Commercial revenue grows 50%+ for 3 years. PLTR is the next Salesforce. $150 by 2026.",
    bearCase: "Growth decelerates to 20%. SBC remains excessive. 200× PE compresses to 40×. Stock drops 70% even as business grows. Fair value $35."
  },
];
