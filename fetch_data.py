#!/usr/bin/env python3
"""
fetch_data.py — Pull real stock data from Yahoo Finance (free, no API key)
and regenerate data.js for the EquityLens dashboard.

Usage:  python fetch_data.py
Output: stocks_dashboard/data.js (overwritten)
"""

import json, datetime, textwrap
import yfinance as yf

# ── Config ──────────────────────────────────────────────────────────
import os as _os
OUTPUT = _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "data.js")

TICKERS = [
    # ── Mega-cap tech ──
    "NVDA", "AAPL", "MSFT", "AMZN", "META", "GOOGL",
    # ── High-growth / momentum ──
    "TSLA", "PLTR", "COIN", "SHOP", "ARM", "SNOW",
    # ── Semiconductors ──
    "AVGO", "AMD", "INTC",
    # ── Enterprise software ──
    "CRM", "NOW", "PANW", "CRWD",
    # ── Consumer / streaming ──
    "NFLX", "SPOT", "DIS", "UBER", "ABNB",
    # ── Fintech / payments ──
    "V", "MA", "SQ", "GS",
    # ── Healthcare ──
    "LLY", "UNH", "ISRG",
    # ── Industrials / defense ──
    "BA", "LMT",
    # ── Retail / consumer ──
    "COST", "JPM",
    # ── Airlines ──
    "ELAL.TA",
]

INDEX_MAP = {
    "^GSPC": ("SPX",  "S&P 500"),
    "^NDX":  ("NDX",  "Nasdaq 100"),
    "^DJI":  ("DJI",  "Dow Jones"),
    "^RUT":  ("RUT",  "Russell 2000"),
    "^VIX":  ("VIX",  "Volatility"),
    "^TNX":  ("TNX",  "10Y Yield"),
}

SECTOR_ETFS = {
    "XLK": ("Technology",        "#60a5fa"),
    "XLV": ("Healthcare",        "#34d399"),
    "XLF": ("Financials",        "#fbbf24"),
    "XLY": ("Consumer Cyclical", "#f87171"),
    "XLC": ("Communication",     "#a78bfa"),
    "XLI": ("Industrials",       "#fb923c"),
    "XLP": ("Consumer Defensive","#4ade80"),
    "SMH": ("Semiconductors",    "#22d3ee"),
    "IGV": ("Software",          "#e879f9"),
    "HACK":("Cybersecurity",     "#f472b6"),
    "ITA": ("Aerospace & Defense","#94a3b8"),
    "IPAY":("Digital Payments",  "#fcd34d"),
}

# Catalysts / risks / bull-bear are qualitative — keep the hand-written ones
# Override display ticker symbols (yf ticker → display label)
TICKER_DISPLAY = {
    "ELAL.TA": "ELAL",
}

# Override display names
NAME_OVERRIDE = {
    "ELAL.TA": "El Al Israel Airlines",
}

QUALITATIVE = {
    "ELAL.TA": {
        "catalysts": [
            "Post-COVID traffic recovery — international routes at record capacity",
            "Israel-Europe route monopoly on key corridors provides pricing power",
            "Fleet modernization with Boeing 787 Dreamliners reducing fuel costs",
            "Tourism rebound + diaspora travel creating structural demand floor",
        ],
        "risks": [
            "Geopolitical risk — regional conflict directly impacts flight operations",
            "High fuel cost exposure with limited hedging program",
            "Labor disputes with unions historically disruptive",
            "Competition from low-cost carriers on European routes",
        ],
        "bullCase": "Israel air travel normalizes post-conflict. ELAL captures full rebound as the flag carrier with government backing. Fleet upgrades drive margin recovery.",
        "bearCase": "Prolonged regional instability grounds routes and collapses ticket volumes. High fixed costs + debt load create existential pressure.",
    },
    "NVDA": {
        "catalysts": ["Blackwell B200 GPU ramp — 2-3x inference perf over H100","Sovereign AI infrastructure spend accelerating globally","Auto / robotics TAM expansion via DRIVE Thor","NIM microservices creating enterprise software moat"],
        "risks": ["Export controls tightening on China (~25% of data-center rev)","Customer concentration — top 4 hyperscalers ~50% rev","Elevated valuation leaves little room for execution misses","Custom ASIC competition from Google TPU, Amazon Trainium"],
        "bullCase": "AI capex super-cycle extends 3-5 years; NVDA captures 80%+ of training GPU spend and grows inference share. $200B+ rev by FY27.",
        "bearCase": "Hyperscaler ASIC adoption + China export ban cuts TAM by 30%. Margin compression to 55% as competition matures.",
    },
    "AAPL": {
        "catalysts": ["Apple Intelligence on-device AI driving iPhone upgrade cycle","Services revenue accelerating — $100B+ run rate","Vision Pro spatial computing platform long-term optionality","India manufacturing diversification reducing geopolitical risk"],
        "risks": ["China smartphone market share erosion to Huawei","EU DMA regulation forcing App Store concessions","Limited AI narrative vs. hyperscalers — perception gap","Hardware growth stagnation if upgrade cycle underwhelms"],
        "bullCase": "Apple Intelligence creates a sticky AI-services ecosystem. iPhone installed base of 1.2B drives $150B services by 2027.",
        "bearCase": "Regulatory headwinds cut App Store take rate. China share drops. Revenue barely grows and PE de-rates.",
    },
    "MSFT": {
        "catalysts": ["Azure AI revenue growing 60%+ QoQ — fastest cloud AI adoption","Copilot enterprise monetization (GitHub, M365, Dynamics)","Gaming / Activision integration driving Xbox content moat","LinkedIn + Copilot AI creating new enterprise workflow TAM"],
        "risks": ["Azure capex intensity rising — margin pressure near-term","FTC scrutiny on Activision deal execution","OpenAI partnership economics — capped profit structure","Enterprise IT budget reallocation away from legacy licenses"],
        "bullCase": "Azure becomes the default AI cloud. Copilot adds $10B+ incremental rev by FY26. MSFT is the picks-and-shovels winner of enterprise AI.",
        "bearCase": "Capex spiral for AI infra compresses margins 300bp. Copilot adoption slower than expected.",
    },
    "AMZN": {
        "catalysts": ["AWS AI services (Bedrock, Trainium) accelerating cloud growth","Retail margin expansion — regionalized fulfillment payoff","Advertising business $56B+ run rate, 24% YoY growth","Project Kuiper satellite constellation launch"],
        "risks": ["FTC antitrust case — potential structural remedies","Retail margin pressure from Temu / Shein competition","AWS growth deceleration if enterprise migration slows","Heavy capex ($75B+/yr) compressing near-term FCF"],
        "bullCase": "AWS re-accelerates to 20%+ growth on AI workloads. Retail margins expand. Ad business becomes 3rd profit pillar.",
        "bearCase": "FTC imposes marketplace restrictions. AWS share lost to Azure/GCP. Capex overshoot destroys FCF narrative.",
    },
    "META": {
        "catalysts": ["Reels monetization closing gap with TikTok — efficiency up 30%","AI-powered ad targeting recovering from ATT headwinds","WhatsApp Business + Click-to-Message ads scaling globally","Llama open-source AI models creating developer ecosystem"],
        "risks": ["Reality Labs burning $16B+/yr with no clear revenue path","Regulatory fines (EU DSA, US child safety legislation)","Young user engagement shifting to TikTok / BeReal","AI capex ramp could reverse efficiency gains"],
        "bullCase": "Ad revenue re-accelerates on AI targeting. WhatsApp monetization unlocks $10B rev. Reality Labs optionality becomes real by 2027.",
        "bearCase": "Reality Labs continues to burn cash. Regulatory fines total $20B+. User growth stalls in developed markets.",
    },
    "GOOGL": {
        "catalysts": ["Google Cloud AI (Gemini) driving 28% cloud growth","YouTube ad revenue $45B+ — connected TV expansion","Search AI Overviews increasing engagement + monetization","Waymo autonomous driving scaling to new cities"],
        "risks": ["DOJ antitrust ruling — potential search distribution remedies","AI search disruption from ChatGPT / Perplexity","Cloud profitability still lagging AWS/Azure margins","Waymo requiring $5B+/yr investment with uncertain ROI"],
        "bullCase": "AI Overviews defend search monopoly. GCP hits $100B run rate by 2027. Waymo becomes $50B+ standalone business.",
        "bearCase": "DOJ forces default search remedies. GCP growth decelerates as AI workloads shift to specialized clouds.",
    },
    "TSLA": {
        "catalysts": ["FSD v12.x neural net approach — potential licensing revenue","Model 2 ($25K) affordable EV broadening TAM massively","Energy storage (Megapack) revenue growing 100%+ YoY","Optimus humanoid robot long-term optionality"],
        "risks": ["EV price war compressing auto gross margins","CEO distraction / brand risk from political controversies","China competition from BYD eroding global market share","FSD regulatory approval timeline highly uncertain"],
        "bullCase": "FSD achieves L4 autonomy — robotaxi revenue unlocks $500B TAM. Energy + AI robot optionality justifies premium valuation.",
        "bearCase": "Auto margins collapse. FSD remains L2+. Brand damage causes demand destruction.",
    },
    "LLY": {
        "catalysts": ["Mounjaro/Zepbound GLP-1 franchise — $40B+ peak sales potential","Obesity pipeline expansion (orforglipron oral GLP-1)","Alzheimer's donanemab approval broadening neuro portfolio","Manufacturing capacity tripling by 2026 to meet demand"],
        "risks": ["GLP-1 competition intensifying (Novo, Amgen, Pfizer)","Drug pricing reform / IRA negotiation pressure","Supply constraints limiting near-term Zepbound uptake","High valuation premium assumes flawless execution"],
        "bullCase": "GLP-1 class becomes $150B market. LLY captures 45% share with best-in-class efficacy. Oral GLP-1 unlocks primary care TAM.",
        "bearCase": "Compounding pharmacies + competition erode pricing power. Manufacturing delays cap growth.",
    },
    "JPM": {
        "catalysts": ["Net interest income benefiting from higher-for-longer rates","Investment banking recovery — M&A/IPO pipeline strengthening","First Republic integration adding $1B+ annual profit","AI-driven efficiency gains across consumer & commercial banking"],
        "risks": ["Commercial real estate loan exposure — office delinquencies rising","NII normalization as rate cuts eventually arrive","Increased capital requirements from Basel III endgame","CEO succession uncertainty post-Dimon era"],
        "bullCase": "JPM remains the fortress bank. IB recovery + NII stability drives 15% EPS growth. Multiple re-rates as bank sector recovers.",
        "bearCase": "CRE losses spike. NII drops on rate cuts. Basel III capital requirements force buyback halt.",
    },
    "AVGO": {
        "catalysts": ["VMware integration — $8.5B synergies over 3 years","Custom AI ASIC wins (Google TPU, Meta MTIA) scaling rapidly","Networking silicon (Memory, Ethernet) critical for AI clusters","Software-defined infrastructure pivot increasing recurring rev"],
        "risks": ["VMware integration execution risk — customer churn possible","High debt load from VMware acquisition ($60B+)","Custom ASIC cyclicality — hyperscaler design wins lumpy","Broadband/wireless end markets in secular decline"],
        "bullCase": "VMware transforms AVGO into infra-software juggernaut. AI networking + custom silicon creates $30B revenue stream.",
        "bearCase": "VMware customer revolt drives churn. Debt servicing consumes FCF. AI ASIC wins plateau.",
    },
    "UNH": {
        "catalysts": ["Optum Health integration — 90K+ employed physicians","Medicare Advantage enrollment growth (65+ demographic wave)","AI-driven claims processing reducing medical cost ratio","Value-based care models improving long-term profitability"],
        "risks": ["Medical cost ratio spiking from post-COVID care utilization","DOJ antitrust investigation into Optum/Change Healthcare","Medicare Advantage rate cuts from CMS","Political risk — Medicare-for-All rhetoric"],
        "bullCase": "MCR normalizes. Optum flywheel drives 15% EPS CAGR. Aging demographics provide 20-year tailwind.",
        "bearCase": "MCR stays elevated. Regulatory crackdown on Medicare Advantage. DOJ forces Optum divestiture.",
    },
    "CRM": {
        "catalysts": ["Agentforce AI platform — autonomous AI agents for enterprise","Data Cloud unification driving cross-sell and upsell","Margin expansion story — operating margins targeting 35%+","Multi-cloud strategy (Slack, Tableau, MuleSoft) creating sticky ecosystem"],
        "risks": ["Enterprise IT spending slowdown impacting deal velocity","AI disruption risk — ChatGPT-style tools commoditizing CRM","Revenue growth deceleration — multiple compression risk","Acquisition integration complexity (Slack underperforming)"],
        "bullCase": "Agentforce becomes the enterprise AI agent standard. Margins hit 35%+. CRM becomes the AI-powered enterprise OS.",
        "bearCase": "Growth slows. AI features commoditized by Microsoft Copilot. Margin expansion already priced in.",
    },
    "AMD": {
        "catalysts": ["MI300X GPU gaining traction — $5B+ AI GPU revenue target","EPYC server CPU share gains (30%+ of server market)","Ryzen AI PC processor cycle — premium ASP uplift","Xilinx FPGA synergies in embedded AI applications"],
        "risks": ["AI GPU market dominated by NVDA's CUDA ecosystem","PC/gaming recovery slower than expected","Gross margin expansion limited vs. NVDA's 76%","Inventory build-up risk if AI demand softens"],
        "bullCase": "MI300 series captures 15% of AI GPU market by 2026. EPYC takes 40% server share. AMD becomes credible #2 in AI compute.",
        "bearCase": "CUDA lock-in limits MI300 adoption. PC market remains flat. Margins stuck.",
    },
    "COST": {
        "catalysts": ["Membership fee increase — first in 7 years, 100% margin","E-commerce growth 18% YoY — Costco Next marketplace","International expansion (China, Japan stores outperforming)","Traffic and ticket size both positive — rare dual growth"],
        "risks": ["Premium valuation — priced for perfection","Consumer spending slowdown affecting discretionary mix","Warehouse saturation in mature US markets","Thin margins leave no room for cost structure missteps"],
        "bullCase": "Membership model is a recurring-revenue fortress. International TAM doubles store count. Premium multiple sustained.",
        "bearCase": "Consumer recession hits traffic. Premium PE compresses even with stable earnings.",
    },
    "PLTR": {
        "catalysts": ["AIP (Artificial Intelligence Platform) driving commercial adoption","US government contract renewals + new defense AI mandates","Commercial revenue growing 40%+ — AIP boot camps converting","S&P 500 inclusion driving institutional flows"],
        "risks": ["Extreme valuation — high PE and P/S multiples","Government revenue concentration (~55% of total)","Stock-based compensation diluting shareholders 5%+/yr","Commercial growth must accelerate dramatically to justify valuation"],
        "bullCase": "AIP becomes the enterprise AI operating system. Commercial revenue grows 50%+ for 3 years. PLTR is the next Salesforce.",
        "bearCase": "Growth decelerates. SBC remains excessive. PE compresses dramatically even as business grows.",
    },
    # ── New additions ──
    "NFLX": {
        "catalysts": ["Ad-supported tier scaling rapidly — 40M+ monthly active users","Password sharing crackdown driving paid subscriber growth","Live sports (WWE, NFL) expanding addressable audience","Gaming and interactive content creating engagement moat"],
        "risks": ["Subscriber saturation in developed markets","Content cost inflation as competition bids up talent","Ad tier cannibalization of premium subscriptions","Regulatory scrutiny on market dominance in streaming"],
        "bullCase": "Ad tier reaches 100M users by 2027. Live sports + gaming diversify revenue to $50B+. NFLX becomes the global entertainment utility.",
        "bearCase": "Subscriber growth stalls. Content costs spike. Ad revenue disappoints as advertisers fragment budgets.",
    },
    "V": {
        "catalysts": ["Cross-border travel recovery driving premium transaction volumes","Value-added services (fraud detection, consulting) growing 20%+","Tap-to-pay / digital wallet adoption accelerating globally","New flows (B2B payments, remittances) expanding TAM beyond consumer"],
        "risks": ["Regulatory cap on interchange fees (Credit Card Competition Act)","Real-time payment networks (FedNow, UPI) disintermediating cards","Fintech competition from Stripe, Adyen on merchant acceptance","Debit shift from credit in economic downturn compresses margins"],
        "bullCase": "Global digital payments TAM grows to $20T. Visa captures growing share via new flows + value-added services. 15% EPS CAGR sustained.",
        "bearCase": "Interchange regulation passes. Real-time payments bypass card rails. Revenue growth slows to single digits.",
    },
    "MA": {
        "catalysts": ["Multi-rail strategy (cards, ACH, real-time payments) future-proofing","Services revenue (cybersecurity, analytics) growing 20%+ YoY","Emerging market penetration — cash-to-digital conversion","Open banking APIs creating new data monetization streams"],
        "risks": ["Same regulatory risks as Visa — interchange caps","Slower cross-border recovery in some geographies","Fintech partnerships could turn into competition","Currency headwinds from strong dollar"],
        "bullCase": "Mastercard becomes the 'network of networks' for all payment types. Services business hits $15B by 2027.",
        "bearCase": "Regulation compresses take rates. Emerging market growth slower than expected. Fintech disintermediation.",
    },
    "DIS": {
        "catalysts": ["Disney+ turning profitable — combined streaming approaching breakeven","Parks & Experiences resilient with pricing power","ESPN direct-to-consumer launch expanding sports streaming TAM","Franchise IP pipeline (Marvel, Star Wars, Pixar) unmatched"],
        "risks": ["Linear TV decline accelerating — cord-cutting hitting ESPN","Streaming profitability still unproven at scale","Theme park macro sensitivity in recession scenario","Content quality inconsistency hurting brand perception"],
        "bullCase": "Streaming hits profitability. ESPN DTC becomes sports super-app. Parks + IP = durable 10% earnings growth.",
        "bearCase": "Streaming losses persist. Linear TV collapse accelerates. Parks hit by consumer recession.",
    },
    "SPOT": {
        "catalysts": ["Gross margin expansion as podcast monetization scales","Price increases sticking — low churn elasticity","Audiobook marketplace creating high-margin content vertical","AI-powered personalization driving engagement and ad yields"],
        "risks": ["Music label renegotiations could spike content costs","Ad market cyclicality affecting Spotify's ad-supported tier","Competition from Apple Music, YouTube Music, Amazon","Podcast investment ROI still unproven at scale"],
        "bullCase": "Spotify becomes the audio everything platform. Gross margins hit 35%+. 1B MAU by 2028 with pricing power.",
        "bearCase": "Label costs stay at 70%+. Podcast ad market disappoints. Growth decelerates in saturated markets.",
    },
    "SHOP": {
        "catalysts": ["Shopify Payments + Capital creating fintech ecosystem","Enterprise upmarket push (Shopify Plus) driving ARPU growth","AI-powered Sidekick assistant reducing merchant churn","Offline POS expansion challenging Square in omnichannel"],
        "risks": ["Amazon competition for merchant mindshare","Macro sensitivity — SMB merchants vulnerable in downturn","Take rate pressure from payment processing competition","International expansion execution risk"],
        "bullCase": "Shopify becomes the commerce OS for millions of merchants. GMV hits $500B. Fintech takes revenue to $15B+.",
        "bearCase": "SMB bankruptcies spike in recession. Amazon undercuts with Buy with Prime. Take rates compress.",
    },
    "COIN": {
        "catalysts": ["Spot Bitcoin + Ethereum ETF custody driving institutional revenue","Base L2 blockchain creating developer ecosystem + fee revenue","Regulatory clarity (staking, tokenization) expanding product set","USDC partnership with Circle — stablecoin infrastructure moat"],
        "risks": ["Crypto winter / Bitcoin drawdown directly crushes trading volume","SEC enforcement actions on altcoin listings","Competition from decentralized exchanges (Uniswap, dYdX)","Revenue concentration in volatile trading fees"],
        "bullCase": "Crypto becomes mainstream asset class. Coinbase captures institutional custody + staking. Revenue diversifies to $8B+.",
        "bearCase": "Crypto bear market returns. Regulatory crackdown limits product offerings. Trading fees collapse.",
    },
    "ARM": {
        "catalysts": ["AI inference demand driving premium Armv9 royalty growth","Smartphone recovery cycle lifting licensing revenue","Data center CPU expansion (Neoverse) challenging x86","Automotive compute (ADAS, infotainment) long-term growth vector"],
        "risks": ["Customer concentration — Apple ~15% of royalty revenue","RISC-V open-source alternative gaining traction in China","Qualcomm custom core dispute creating licensing uncertainty","Premium valuation assumes flawless execution across new TAMs"],
        "bullCase": "ARM becomes the compute architecture for AI edge devices. Royalty rates expand 2x on Armv9. $10B+ revenue by 2028.",
        "bearCase": "RISC-V erodes licensing base. Smartphone market stays flat. Data center penetration stalls.",
    },
    "SNOW": {
        "catalysts": ["Cortex AI/ML features driving consumption growth","Data sharing marketplace (Snowflake Marketplace) network effects","Government cloud (FedRAMP) contracts expanding TAM","Product expansion into streaming, Apache Iceberg interop"],
        "risks": ["Consumption model means revenue is inherently volatile","Competition from Databricks, BigQuery, Azure Synapse intensifying","Customer optimization reducing per-account spend","Net revenue retention rate declining from peak"],
        "bullCase": "Snowflake becomes the data cloud standard. AI features drive consumption re-acceleration. $10B product revenue by 2029.",
        "bearCase": "Consumption growth slows. Databricks wins AI workloads. Margins don't reach profitability targets.",
    },
    "UBER": {
        "catalysts": ["Autonomous vehicle partnerships (Waymo, Aurora) preserving platform value","Advertising business reaching $1B+ run rate — high-margin","Uber One membership driving cross-platform retention","Delivery profitability improving — grocery + retail expansion"],
        "risks": ["Autonomous driving could disintermediate Uber entirely","Driver supply / cost regulation (gig economy legislation)","Food delivery competition from DoorDash intensifying","Profitability still thin — macro downturn could swing to losses"],
        "bullCase": "Uber becomes the global mobility + delivery super-app. AV integration adds margin. $10B+ EBITDA by 2027.",
        "bearCase": "AV companies go direct-to-consumer. Gig economy regulation spikes driver costs. Profitability evaporates.",
    },
    "ABNB": {
        "catalysts": ["Experiences & Adventures category creating new travel vertical","AI-powered trip planning increasing booking conversion","Supply growth in non-urban / international markets","Icon stays driving brand buzz and premium pricing"],
        "risks": ["Regulatory crackdown on short-term rentals in major cities","Hotel competition (loyalty programs, price matching)","Macro sensitivity — travel is discretionary spending","Insurance / liability risk from property damage incidents"],
        "bullCase": "Airbnb expands beyond lodging into full travel platform. 2B+ guest arrivals by 2028. Take rate expands on services.",
        "bearCase": "City bans reduce supply. Economic downturn crushes travel demand. Hotels recapture share with better pricing.",
    },
    "SQ": {
        "catalysts": ["Cash App ecosystem — 55M+ monthly actives, lending + investing","Square hardware + software creating omnichannel SMB moat","Afterpay BNPL integration driving consumer acquisition","Bitcoin / crypto revenue optionality"],
        "risks": ["SMB merchant churn in economic downturn","Cash App monetization slower than expected","Competition from Stripe, Toast, Clover in payments","Crypto revenue is low-margin and volatile"],
        "bullCase": "Cash App becomes a neobank for 100M users. Square ecosystem dominates SMB. Block hits $30B revenue with expanding margins.",
        "bearCase": "SMB spending collapses. Cash App growth stalls. Afterpay integration fails to drive synergies.",
    },
    "GS": {
        "catalysts": ["Investment banking recovery — M&A and IPO pipeline accelerating","Asset & wealth management pivot creating durable fee revenue","Trading desk excellence — fixed income + equities market share","Platform Solutions profitability improving after consumer exit"],
        "risks": ["IB recovery slower than expected if macro deteriorates","Trading revenue inherently volatile and cyclical","Reputational risk from prior consumer banking missteps","Regulatory capital requirements limiting leverage"],
        "bullCase": "M&A supercycle drives IB fees to record levels. AWM grows to $3T AUM. GS re-rates as a diversified financial.",
        "bearCase": "IB stays depressed. Trading normalizes lower. Consumer exit costs linger.",
    },
    "NOW": {
        "catalysts": ["AI-powered workflows (Now Assist) driving premium upsell","Federal government IT modernization contracts expanding","Platform consolidation — companies standardizing on ServiceNow","$15B+ revenue target by 2026 with 25%+ growth"],
        "risks": ["Enterprise IT budget tightening in recession scenario","Competition from Microsoft, Salesforce in workflow automation","Premium valuation leaves no margin for growth deceleration","Large deal lumpiness creating quarterly volatility"],
        "bullCase": "ServiceNow becomes the enterprise AI workflow platform. Revenue hits $20B by 2028. Operating margins expand to 35%+.",
        "bearCase": "Growth decelerates to 15%. Microsoft Copilot cannibalizes workflow TAM. Multiple compresses sharply.",
    },
    "PANW": {
        "catalysts": ["Platformization strategy — customers consolidating security vendors","Next-gen security (SASE, XDR, cloud security) driving ARR growth","AI-powered security operations (XSIAM) differentiation","Government cybersecurity mandates creating durable demand"],
        "risks": ["Billings growth deceleration from platformization transition","Competition from CrowdStrike, Zscaler in specific verticals","Free cash flow conversion during platform transition period","Customer resistance to vendor lock-in"],
        "bullCase": "PANW becomes the one-stop cybersecurity platform. ARR grows to $15B+. Platformization drives 80%+ gross margins.",
        "bearCase": "Platformization cannibalizes near-term billings. Best-of-breed competitors win key verticals. Growth slows.",
    },
    "CRWD": {
        "catalysts": ["Falcon platform module adoption — customers buying 7+ modules","Identity security (Falcon Identity) fastest-growing module","Cloud security capturing shift from on-prem to cloud workloads","AI-native architecture advantage vs. legacy security vendors"],
        "risks": ["July 2024 outage aftermath — customer trust and legal liability","Valuation premium assumes sustained 30%+ growth","Competition from Microsoft Defender, SentinelOne, Palo Alto","Macro-driven IT budget cuts hitting security spend"],
        "bullCase": "CrowdStrike becomes the Salesforce of cybersecurity. ARR hits $10B by 2028. Module adoption drives 80%+ gross margins.",
        "bearCase": "Outage fallout causes customer churn. Microsoft bundles erode market. Growth slows to 20%.",
    },
    "INTC": {
        "catalysts": ["Intel 18A process node — foundry competitiveness returning","CHIPS Act subsidies ($20B+) funding US fab expansion","AI PC cycle driving Core Ultra premium ASP uplift","Foundry services (IFS) winning external customers"],
        "risks": ["Foundry execution risk — years behind TSMC on process","Data center GPU market lost to NVDA/AMD entirely","Cash burn from massive fab capex ($25B+/yr)","Market share losses continuing in server and client CPUs"],
        "bullCase": "18A process works. IFS wins major foundry customers. Intel reclaims technology leadership by 2027. Massive re-rating.",
        "bearCase": "Process delays continue. Foundry remains uncompetitive. Cash burn forces dividend cut. Server share hits single digits.",
    },
    "ISRG": {
        "catalysts": ["da Vinci 5 system launch — next-gen multiport surgical robot","Procedure growth 15-20% YoY across expanding specialties","International expansion — China, India, emerging markets","Ion bronchoscopy platform creating new lung biopsy TAM"],
        "risks": ["Premium valuation — 60x+ earnings","Competition from Medtronic Hugo, J&J Ottava, Asensus","Hospital capital budget constraints limiting system placements","Reimbursement pressure on robotic surgery procedures"],
        "bullCase": "da Vinci 5 drives upgrade cycle + new specialties. Procedures grow 18% CAGR. ISRG maintains 80%+ market share in surgical robotics.",
        "bearCase": "Competition erodes pricing power. Hospital budgets tighten. Procedure growth slows to single digits.",
    },
    "BA": {
        "catalysts": ["737 MAX production ramp to 38+/month after safety resolution","Defense & Space backlog $60B+ providing revenue floor","Commercial aviation demand recovery — record order backlog","New leadership executing on quality and safety culture"],
        "risks": ["Ongoing FAA scrutiny and production caps","Quality control issues damaging reputation and delivery timeline","Free cash flow negative until production normalizes","Supply chain constraints limiting ramp-up speed"],
        "bullCase": "Production normalizes. 737 MAX deliveries hit 50/month. FCF turns strongly positive. BA re-rates as aviation duopoly.",
        "bearCase": "Safety issues persist. Production stays capped. FCF remains negative. Defense margins compress.",
    },
    "LMT": {
        "catalysts": ["Global defense spending surge — NATO countries hitting 2%+ GDP targets","F-35 program long-term revenue visibility ($2T lifetime value)","Hypersonic weapons and space contracts expanding TAM","Classified programs driving above-reported revenue growth"],
        "risks": ["US defense budget politics — potential sequestration or cuts","Fixed-price contract losses on development programs","Supply chain inflation compressing margins","Talent shortage in aerospace engineering workforce"],
        "bullCase": "Geopolitical tensions sustain 5-7% defense budget growth globally. F-35 deliveries accelerate. LMT hits $80B+ revenue by 2028.",
        "bearCase": "Peace dividend returns. Budget cuts hit procurement. Fixed-price losses expand.",
    },
}

# ── Helpers ─────────────────────────────────────────────────────────
def safe(val, default=None):
    """Return val if it's a real number, else default."""
    if val is None:
        return default
    try:
        f = float(val)
        if f != f:  # NaN check
            return default
        return f
    except (TypeError, ValueError):
        return default

def pct(val):
    v = safe(val)
    return round(v * 100, 1) if v is not None else None

def fmt_js_num(v):
    if v is None:
        return "null"
    if isinstance(v, str):
        return json.dumps(v)
    if abs(v) >= 1e12:
        return f"{v:.2e}"
    if abs(v) >= 1e9:
        return f"{v:.3e}"
    return str(round(v, 2))

# ── Fetch Index Data ────────────────────────────────────────────────
def fetch_indices():
    print("Fetching indices...")
    results = []
    for yf_ticker, (display, name) in INDEX_MAP.items():
        try:
            t = yf.Ticker(yf_ticker)
            hist = t.history(period="5d")
            if len(hist) < 2:
                hist = t.history(period="1mo")
            if len(hist) >= 2:
                curr = float(hist["Close"].iloc[-1])
                prev = float(hist["Close"].iloc[-2])
                change = round((curr - prev) / prev * 100, 2)
            else:
                curr = 0
                change = 0

            # YTD
            ytd = None
            if display not in ("VIX", "TNX"):
                try:
                    hist_ytd = t.history(period="ytd")
                    if len(hist_ytd) >= 2:
                        ytd_start = float(hist_ytd["Close"].iloc[0])
                        ytd = round((curr - ytd_start) / ytd_start * 100, 1)
                except Exception:
                    pass

            results.append({
                "ticker": display, "name": name,
                "value": round(curr, 2), "change": change, "ytd": ytd
            })
            print(f"  ✓ {display}: {curr:.2f} ({change:+.2f}%)")
        except Exception as e:
            print(f"  ✗ {display}: {e}")
            results.append({"ticker": display, "name": name, "value": 0, "change": 0, "ytd": None})
    return results

# ── Fetch Sector Performance ────────────────────────────────────────
def fetch_sectors():
    print("Fetching sectors...")
    results = []
    for etf, (name, color) in SECTOR_ETFS.items():
        try:
            t = yf.Ticker(etf)
            hist = t.history(period="1mo")
            if len(hist) >= 2:
                start = float(hist["Close"].iloc[0])
                end = float(hist["Close"].iloc[-1])
                ret = round((end - start) / start * 100, 1)
            else:
                ret = 0
            results.append({"name": name, "color": color, "return30d": ret})
            print(f"  ✓ {name}: {ret:+.1f}%")
        except Exception as e:
            print(f"  ✗ {name}: {e}")
            results.append({"name": name, "color": color, "return30d": 0})
    return results

# ── Fetch Individual Stocks ─────────────────────────────────────────
def fetch_stock(ticker):
    t = yf.Ticker(ticker)
    info = t.info
    hist = t.history(period="5d")

    # Price & change
    price = safe(info.get("currentPrice")) or safe(info.get("regularMarketPrice"))
    prev_close = safe(info.get("regularMarketPreviousClose")) or safe(info.get("previousClose"))
    if price and prev_close and prev_close > 0:
        change = round((price - prev_close) / prev_close * 100, 2)
    elif len(hist) >= 2:
        price = float(hist["Close"].iloc[-1])
        prev = float(hist["Close"].iloc[-2])
        change = round((price - prev) / prev * 100, 2)
    else:
        price = price or 0
        change = 0

    # Basic info
    sector = info.get("sector", "Technology")
    market_cap = safe(info.get("marketCap"))
    avg_vol = safe(info.get("averageVolume"))
    beta = safe(info.get("beta"))
    w52_high = safe(info.get("fiftyTwoWeekHigh"))
    w52_low = safe(info.get("fiftyTwoWeekLow"))

    # Valuation
    pe = safe(info.get("trailingPE"))
    fwd_pe = safe(info.get("forwardPE"))
    peg = safe(info.get("pegRatio"))
    ps = safe(info.get("priceToSalesTrailing12Months"))
    pb = safe(info.get("priceToBook"))
    ev_ebitda = safe(info.get("enterpriseToEbitda"))

    # Growth
    rev_growth = pct(info.get("revenueGrowth"))
    eps_growth = pct(info.get("earningsGrowth"))
    # 3-year revenue CAGR approximation from quarterly revenue
    rev_growth_3y = None
    try:
        fins = t.quarterly_financials
        if fins is not None and not fins.empty and "Total Revenue" in fins.index:
            revs = fins.loc["Total Revenue"].dropna().sort_index()
            if len(revs) >= 8:
                recent_4q = revs.iloc[-4:].sum()
                old_4q = revs.iloc[-8:-4].sum()
                if old_4q > 0:
                    rev_growth_3y = round(((recent_4q / old_4q) - 1) * 100, 1)
    except Exception:
        pass

    # Forward revenue growth estimate
    fwd_rev_growth = None
    try:
        growth_est = info.get("revenueGrowth")
        if growth_est:
            fwd_rev_growth = round(float(growth_est) * 100, 1)
    except Exception:
        pass

    # Profitability
    gross_margin = pct(info.get("grossMargins"))
    op_margin = pct(info.get("operatingMargins"))
    net_margin = pct(info.get("profitMargins"))

    # Returns
    roe = pct(info.get("returnOnEquity"))
    roic = None  # yfinance doesn't directly provide ROIC

    # Financial health
    de = safe(info.get("debtToEquity"))
    if de is not None:
        de = round(de / 100, 2)  # yfinance returns as percentage
    cr = safe(info.get("currentRatio"))
    fcf = safe(info.get("freeCashflow"))
    total_cash = safe(info.get("totalCash"), 0)
    total_debt = safe(info.get("totalDebt"), 1)
    cash_to_debt = round(total_cash / total_debt, 1) if total_debt and total_debt > 0 else None

    # Technical
    rsi_val = None  # Compute RSI from history
    sma50_vs_200 = "above"
    macd_signal = "neutral"
    dist_52h = None

    try:
        hist_long = t.history(period="1y")
        closes = hist_long["Close"]
        if len(closes) >= 200:
            sma50 = closes.iloc[-50:].mean()
            sma200 = closes.iloc[-200:].mean()
            sma50_vs_200 = "above" if sma50 > sma200 else "below"

        if len(closes) >= 14:
            delta = closes.diff().iloc[-14:]
            gain = delta.clip(lower=0).mean()
            loss = (-delta.clip(upper=0)).mean()
            if loss > 0:
                rs = gain / loss
                rsi_val = round(100 - (100 / (1 + rs)))
            else:
                rsi_val = 100

        # MACD
        if len(closes) >= 26:
            ema12 = closes.ewm(span=12).mean()
            ema26 = closes.ewm(span=26).mean()
            macd_line = ema12 - ema26
            signal_line = macd_line.ewm(span=9).mean()
            if macd_line.iloc[-1] > signal_line.iloc[-1]:
                macd_signal = "bullish"
            else:
                macd_signal = "bearish"
    except Exception:
        pass

    if price and w52_high and w52_high > 0:
        dist_52h = round((price - w52_high) / w52_high * 100, 1)

    # Get qualitative data
    q = QUALITATIVE.get(ticker, {})
    display_ticker = TICKER_DISPLAY.get(ticker, ticker)

    return {
        "ticker": display_ticker,
        "name": NAME_OVERRIDE.get(ticker, info.get("shortName", info.get("longName", ticker))),
        "sector": sector,
        "price": round(price, 2) if price else 0,
        "change": change,
        "weekHigh52": round(w52_high, 2) if w52_high else None,
        "weekLow52": round(w52_low, 2) if w52_low else None,
        "marketCap": market_cap,
        "avgVolume": int(avg_vol) if avg_vol else None,
        "beta": round(beta, 2) if beta else None,
        "pe": round(pe, 1) if pe else None,
        "forwardPe": round(fwd_pe, 1) if fwd_pe else None,
        "peg": round(peg, 2) if peg else None,
        "ps": round(ps, 1) if ps else None,
        "pb": round(pb, 1) if pb else None,
        "evEbitda": round(ev_ebitda, 1) if ev_ebitda else None,
        "revenueGrowth": rev_growth,
        "epsGrowth": eps_growth,
        "revenueGrowth3y": rev_growth_3y,
        "fwdRevenueGrowth": fwd_rev_growth,
        "grossMargin": gross_margin,
        "operatingMargin": op_margin,
        "netMargin": net_margin,
        "roe": roe,
        "roic": roic,
        "debtToEquity": de,
        "currentRatio": round(cr, 2) if cr else None,
        "freeCashFlow": fcf,
        "cashToDebt": cash_to_debt,
        "rsi": rsi_val,
        "sma50vs200": sma50_vs_200,
        "distFrom52High": dist_52h,
        "macdSignal": macd_signal,
        "catalysts": q.get("catalysts", []),
        "risks": q.get("risks", []),
        "bullCase": q.get("bullCase", ""),
        "bearCase": q.get("bearCase", ""),
    }

# ── Generate data.js ────────────────────────────────────────────────
def to_js_val(v):
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, str):
        return json.dumps(v)
    if isinstance(v, list):
        items = ",\n".join(f"      {json.dumps(x)}" for x in v)
        return f"[\n{items}\n    ]"
    if isinstance(v, (int, float)):
        if abs(v) >= 1e12:
            return f"{v:.2e}".replace("+", "")
        if abs(v) >= 1e9:
            return f"{v:.2e}".replace("+", "")
        return str(v)
    return json.dumps(v)

def generate_data_js(indices, sectors, stocks):
    now = datetime.datetime.now().strftime("%B %d, %Y %H:%M")
    lines = []
    lines.append(f"/*  Auto-generated by fetch_data.py — {now}")
    lines.append(f"    Source: Yahoo Finance (yfinance) — free, real-time data")
    lines.append(f"    Qualitative fields (catalysts, risks, bull/bear) are hand-written */\n")

    # Indices
    lines.append("const MARKET_INDICES = [")
    for idx in indices:
        ytd_str = f"{idx['ytd']}" if idx['ytd'] is not None else "null"
        lines.append(f'  {{ ticker: "{idx["ticker"]}", name: "{idx["name"]}", value: {idx["value"]}, change: {idx["change"]}, ytd: {ytd_str} }},')
    lines.append("];\n")

    # Sectors
    lines.append("const SECTOR_PERFORMANCE = [")
    for s in sectors:
        lines.append(f'  {{ name: "{s["name"]}", color: "{s["color"]}", return30d: {s["return30d"]} }},')
    lines.append("];\n")

    # Stocks
    lines.append("const STOCKS = [")
    for i, s in enumerate(stocks):
        lines.append(f"  /* ── {i+1}  {s['ticker']} ── */")
        lines.append("  {")
        simple_keys = [
            "ticker", "name", "sector", "price", "change",
            "weekHigh52", "weekLow52", "marketCap", "avgVolume", "beta",
            "pe", "forwardPe", "peg", "ps", "pb", "evEbitda",
            "revenueGrowth", "epsGrowth", "revenueGrowth3y", "fwdRevenueGrowth",
            "grossMargin", "operatingMargin", "netMargin",
            "roe", "roic", "debtToEquity", "currentRatio", "freeCashFlow", "cashToDebt",
            "rsi", "sma50vs200", "distFrom52High", "macdSignal",
        ]
        for k in simple_keys:
            v = s.get(k)
            lines.append(f"    {k}: {to_js_val(v)},")
        # Arrays
        lines.append(f"    catalysts: {to_js_val(s.get('catalysts', []))},")
        lines.append(f"    risks: {to_js_val(s.get('risks', []))},")
        lines.append(f"    bullCase: {to_js_val(s.get('bullCase', ''))},")
        lines.append(f"    bearCase: {to_js_val(s.get('bearCase', ''))},")
        lines.append("  },\n")
    lines.append("];")

    return "\n".join(lines)

# ── Main ────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("EquityLens — Fetching real data from Yahoo Finance")
    print("=" * 60)

    indices = fetch_indices()
    sectors = fetch_sectors()

    print("\nFetching individual stocks...")
    stocks = []
    for ticker in TICKERS:
        try:
            s = fetch_stock(ticker)
            stocks.append(s)
            print(f"  ✓ {ticker}: ${s['price']:.2f} ({s['change']:+.2f}%) | PE={s['pe']} | MktCap={s['marketCap']}")
        except Exception as e:
            print(f"  ✗ {ticker}: {e}")

    js = generate_data_js(indices, sectors, stocks)

    with open(OUTPUT, "w") as f:
        f.write(js)
    print(f"\n✅ Written to {OUTPUT} ({len(js):,} bytes, {len(stocks)} stocks)")
    print("=" * 60)
