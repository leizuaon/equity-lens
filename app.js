/*  ════════════════════════════════════════════════════════════════
    EquityLens — Main Application Logic
    Renders all components, handles sorting/filtering/drawer
    ════════════════════════════════════════════════════════════════ */

/* ──── GLOBAL STATE ──── */
let scoredStocks = [];
let currentSort = { key: "score", dir: "desc" };
let activeFilters = { sector: "all", recommendation: "all", minScore: 0, cap: "all", search: "" };
let currentView = "table";

/* ──── INIT ──── */
document.addEventListener("DOMContentLoaded", () => {
  scoredStocks = scoreAllStocks(STOCKS);
  renderIndices();
  renderSentiment();
  renderTopMovers();
  renderScoringFramework();
  renderSectorBars();
  populateSectorFilter();
  renderTable();
  renderCards();
  bindEvents();
});

/* ══════════════════════════════════════════════════════════════
   RENDERERS
   ══════════════════════════════════════════════════════════════ */

/* ─── Market Indices ─── */
function renderIndices() {
  const grid = document.getElementById("indicesGrid");
  grid.innerHTML = MARKET_INDICES.map(idx => {
    const cls = idx.change >= 0 ? "positive" : "negative";
    const sign = idx.change >= 0 ? "+" : "";
    const fmtVal = idx.value >= 1000 ? idx.value.toLocaleString("en-US", { minimumFractionDigits: 0 }) : idx.value.toFixed(2);
    const ytdStr = idx.ytd != null ? `<span class="idx-ytd" style="font-size:0.7rem;color:var(--text-tertiary);margin-left:4px;">YTD ${idx.ytd > 0 ? "+" : ""}${idx.ytd}%</span>` : "";
    return `
      <div class="index-card">
        <div class="idx-name">${idx.ticker} · ${idx.name}</div>
        <div class="idx-value">${fmtVal}</div>
        <div class="idx-change ${cls}">${sign}${idx.change.toFixed(2)}%${ytdStr}</div>
      </div>`;
  }).join("");
}

/* ─── Sentiment Gauge ─── */
function renderSentiment() {
  const val = 62;
  document.getElementById("gaugeFill").style.left = `${(val / 100) * 100 - 1}%`;
}

/* ─── Top Movers ─── */
function renderTopMovers() {
  const sorted = [...scoredStocks].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 5);
  const container = document.getElementById("topMoversList");
  container.innerHTML = sorted.map(s => {
    const cls = s.change >= 0 ? "positive" : "negative";
    const sign = s.change >= 0 ? "+" : "";
    return `
      <div class="mover-row">
        <span class="mover-ticker">${s.ticker}</span>
        <span class="mover-name">${s.name}</span>
        <span class="mover-change ${cls}">${sign}${s.change.toFixed(2)}%</span>
      </div>`;
  }).join("");
}

/* ─── Scoring Framework Widget ─── */
function renderScoringFramework() {
  const container = document.getElementById("scoringBreakdown");
  container.innerHTML = Object.entries(SCORING_WEIGHTS).map(([key, weight]) => {
    const label = SCORING_LABELS[key];
    const color = SCORING_COLORS[key];
    const pct = weight * 100;
    return `
      <div class="scoring-row">
        <span class="sr-label">${label}</span>
        <div class="sr-bar-bg">
          <div class="sr-bar-fill" style="width:${pct * 4}%;background:${color}"></div>
        </div>
        <span class="sr-weight">${pct}%</span>
      </div>`;
  }).join("");
}

/* ─── Sector Bars ─── */
function renderSectorBars() {
  const container = document.getElementById("sectorBars");
  container.innerHTML = SECTOR_PERFORMANCE
    .sort((a, b) => b.return30d - a.return30d)
    .map(s => {
      const cls = s.return30d >= 0 ? "positive" : "negative";
      const sign = s.return30d >= 0 ? "+" : "";
      return `
        <div class="sector-chip" onclick="filterBySector('${s.name}')">
          <div class="sector-dot" style="background:${s.color}"></div>
          <span class="sc-name">${s.name}</span>
          <span class="sc-return ${cls}">${sign}${s.return30d.toFixed(1)}%</span>
        </div>`;
    }).join("");
}

/* ─── Populate Sector Filter ─── */
function populateSectorFilter() {
  const sectors = [...new Set(scoredStocks.map(s => s.sector))].sort();
  const sel = document.getElementById("filterSector");
  sectors.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    sel.appendChild(opt);
  });
}

/* ══════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════ */
function fmtCap(v) {
  if (!v) return "—";
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(0)}B`;
  return `$${(v / 1e6).toFixed(0)}M`;
}

function fmtNum(v, dec = 1) {
  if (v == null) return "—";
  return v.toFixed(dec);
}

function fmtPct(v) {
  if (v == null) return "—";
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
}

function scoreColor(score) {
  if (score >= 75) return "var(--green)";
  if (score >= 60) return "var(--blue)";
  if (score >= 40) return "var(--yellow)";
  return "var(--red)";
}

function scoreClass(score) {
  if (score >= 75) return "score-excellent";
  if (score >= 60) return "score-good";
  if (score >= 40) return "score-ok";
  return "score-poor";
}

function recClass(rec) {
  if (rec === "Strong Buy") return "strong-buy";
  if (rec === "Buy") return "buy";
  if (rec === "Watch") return "watch";
  return "avoid";
}

function capCategory(cap) {
  if (!cap) return "all";
  if (cap >= 200e9) return "mega";
  if (cap >= 10e9) return "large";
  return "mid";
}

/* ══════════════════════════════════════════════════════════════
   FILTERING & SORTING
   ══════════════════════════════════════════════════════════════ */
function getFilteredStocks() {
  return scoredStocks.filter(s => {
    if (activeFilters.sector !== "all" && s.sector !== activeFilters.sector) return false;
    if (activeFilters.recommendation !== "all" && s.recommendation !== activeFilters.recommendation) return false;
    if (s.score < activeFilters.minScore) return false;
    if (activeFilters.cap !== "all" && capCategory(s.marketCap) !== activeFilters.cap) return false;
    if (activeFilters.search) {
      const q = activeFilters.search.toLowerCase();
      if (!s.ticker.toLowerCase().includes(q) && !s.name.toLowerCase().includes(q) && !s.sector.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function sortStocks(stocks) {
  const { key, dir } = currentSort;
  const mult = dir === "asc" ? 1 : -1;
  return [...stocks].sort((a, b) => {
    let av = a[key], bv = b[key];
    if (typeof av === "string") return mult * av.localeCompare(bv);
    if (av == null) av = -Infinity;
    if (bv == null) bv = -Infinity;
    return mult * (av - bv);
  });
}

/* ══════════════════════════════════════════════════════════════
   RENDER TABLE
   ══════════════════════════════════════════════════════════════ */
function renderTable() {
  const filtered = sortStocks(getFilteredStocks());
  const tbody = document.getElementById("stockTableBody");
  document.getElementById("resultsCount").textContent = `${filtered.length} stock${filtered.length !== 1 ? "s" : ""}`;

  tbody.innerHTML = filtered.map((s, i) => {
    const chgCls = s.change >= 0 ? "positive" : "negative";
    const chgSign = s.change >= 0 ? "+" : "";
    const grCls = s.revenueGrowth >= 0 ? "positive" : "negative";
    const grSign = s.revenueGrowth >= 0 ? "+" : "";
    const sc = scoreColor(s.score);
    const rc = recClass(s.recommendation);
    return `
      <tr onclick="openDrawer('${s.ticker}')">
        <td><span class="cell-rank">${i + 1}</span></td>
        <td>
          <div class="cell-ticker">
            <div class="ticker-logo">${s.ticker.substring(0, 2)}</div>
            <span class="ticker-symbol">${s.ticker}</span>
          </div>
        </td>
        <td><span class="cell-name">${s.name}</span></td>
        <td><span class="cell-sector">${s.sector}</span></td>
        <td><span class="cell-price">$${fmtNum(s.price, 2)}</span></td>
        <td><span class="cell-change ${chgCls}">${chgSign}${s.change.toFixed(2)}%</span></td>
        <td><span class="cell-cap">${fmtCap(s.marketCap)}</span></td>
        <td><span class="cell-ratio">${fmtNum(s.pe)}</span></td>
        <td><span class="cell-growth ${grCls}">${grSign}${fmtNum(s.revenueGrowth)}%</span></td>
        <td>
          <div class="cell-score">
            <div class="score-mini-bar">
              <div class="score-mini-fill" style="width:${s.score}%;background:${sc}"></div>
            </div>
            <span class="score-num ${scoreClass(s.score)}">${s.score}</span>
          </div>
        </td>
        <td>
          <span class="rec-badge ${rc}">
            <span class="rec-dot"></span>
            ${s.recommendation}
          </span>
        </td>
        <td><button class="btn-detail" onclick="event.stopPropagation();openDrawer('${s.ticker}')">Details →</button></td>
      </tr>`;
  }).join("");

  // Update sort arrows
  document.querySelectorAll(".stock-table thead th.sortable").forEach(th => {
    th.classList.remove("sorted");
    const arrow = th.querySelector(".sort-arrow");
    if (arrow) arrow.remove();
    if (th.dataset.sort === currentSort.key) {
      th.classList.add("sorted");
      const arrowEl = document.createElement("span");
      arrowEl.className = "sort-arrow";
      arrowEl.textContent = currentSort.dir === "asc" ? " ▲" : " ▼";
      th.appendChild(arrowEl);
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   RENDER CARDS
   ══════════════════════════════════════════════════════════════ */
function renderCards() {
  const filtered = sortStocks(getFilteredStocks());
  const grid = document.getElementById("stockCardsGrid");
  grid.innerHTML = filtered.map(s => {
    const chgCls = s.change >= 0 ? "positive" : "negative";
    const chgSign = s.change >= 0 ? "+" : "";
    const sc = scoreColor(s.score);
    const rc = recClass(s.recommendation);
    return `
      <div class="stock-card" onclick="openDrawer('${s.ticker}')">
        <div class="card-top">
          <div class="card-ticker-group">
            <div class="card-ticker-icon">${s.ticker.substring(0, 2)}</div>
            <div class="card-ticker-info">
              <h3>${s.ticker}</h3>
              <p>${s.name}</p>
            </div>
          </div>
          <span class="rec-badge ${rc}">
            <span class="rec-dot"></span>
            ${s.recommendation}
          </span>
        </div>
        <div class="card-metrics">
          <div class="card-metric">
            <div class="cm-label">Price</div>
            <div class="cm-value">$${fmtNum(s.price, 2)}</div>
          </div>
          <div class="card-metric">
            <div class="cm-label">Change</div>
            <div class="cm-value ${chgCls}">${chgSign}${s.change.toFixed(2)}%</div>
          </div>
          <div class="card-metric">
            <div class="cm-label">P/E</div>
            <div class="cm-value">${fmtNum(s.pe)}</div>
          </div>
          <div class="card-metric">
            <div class="cm-label">Rev Gr</div>
            <div class="cm-value ${s.revenueGrowth >= 0 ? 'positive' : 'negative'}">${fmtPct(s.revenueGrowth)}</div>
          </div>
          <div class="card-metric">
            <div class="cm-label">Mkt Cap</div>
            <div class="cm-value">${fmtCap(s.marketCap)}</div>
          </div>
          <div class="card-metric">
            <div class="cm-label">PEG</div>
            <div class="cm-value">${fmtNum(s.peg, 2)}</div>
          </div>
        </div>
        <div class="card-score-row">
          <span class="rec-badge ${rc}" style="font-size:0.65rem;padding:2px 7px;">Score</span>
          <div class="card-score-bar">
            <div class="card-score-fill" style="width:${s.score}%;background:${sc}"></div>
          </div>
          <span class="card-score-num ${scoreClass(s.score)}">${s.score}</span>
        </div>
      </div>`;
  }).join("");
}

/* ══════════════════════════════════════════════════════════════
   DRAWER — STOCK DETAIL PANEL
   ══════════════════════════════════════════════════════════════ */
function openDrawer(ticker) {
  const s = scoredStocks.find(x => x.ticker === ticker);
  if (!s) return;

  const drawer = document.getElementById("stockDrawer");
  const overlay = document.getElementById("drawerOverlay");

  // Header
  document.getElementById("drawerTicker").textContent = s.ticker;
  document.getElementById("drawerName").textContent = s.name;
  document.getElementById("drawerPrice").textContent = `$${fmtNum(s.price, 2)}`;
  
  const chgEl = document.getElementById("drawerChange");
  const chgSign = s.change >= 0 ? "+" : "";
  chgEl.textContent = `${chgSign}${s.change.toFixed(2)}%`;
  chgEl.className = `drawer-change ${s.change >= 0 ? "positive" : "negative"}`;

  const recEl = document.getElementById("drawerRecommendation");
  recEl.innerHTML = `<span class="rec-badge ${recClass(s.recommendation)}"><span class="rec-dot"></span>${s.recommendation} · Score ${s.score}/100</span>`;

  // Score Radar
  const radar = document.getElementById("drawerScoreRadar");
  radar.innerHTML = Object.entries(s.dimensions).map(([key, val]) => {
    const color = SCORING_COLORS[key];
    const label = SCORING_LABELS[key];
    const weight = Math.round(SCORING_WEIGHTS[key] * 100);
    return `
      <div class="radar-row">
        <span class="radar-label">${label} <span style="color:var(--text-tertiary);font-size:0.65rem">(${weight}%)</span></span>
        <div class="radar-bar-bg">
          <div class="radar-bar-fill" style="width:${val}%;background:${color}"></div>
        </div>
        <span class="radar-value" style="color:${color}">${val}</span>
      </div>`;
  }).join("");

  // Overall score bar
  const sc = scoreColor(s.score);
  document.getElementById("drawerScoreBar").style.cssText = `width:${s.score}%;background:${sc}`;
  const scoreNum = document.getElementById("drawerScoreNumber");
  scoreNum.textContent = s.score;
  scoreNum.style.color = sc;

  // Key Metrics
  document.getElementById("drawerMetrics").innerHTML = buildMetricGrid([
    { label: "Price", value: `$${fmtNum(s.price, 2)}` },
    { label: "Mkt Cap", value: fmtCap(s.marketCap) },
    { label: "52W High", value: `$${fmtNum(s.weekHigh52, 2)}` },
    { label: "52W Low", value: `$${fmtNum(s.weekLow52, 2)}` },
    { label: "Dist from High", value: `${fmtNum(s.distFrom52High)}%`, cls: "negative" },
    { label: "Beta", value: fmtNum(s.beta, 2) },
    { label: "P/E", value: fmtNum(s.pe) },
    { label: "Fwd P/E", value: fmtNum(s.forwardPe) },
    { label: "PEG", value: fmtNum(s.peg, 2) },
    { label: "P/S", value: fmtNum(s.ps) },
    { label: "P/B", value: fmtNum(s.pb) },
    { label: "EV/EBITDA", value: fmtNum(s.evEbitda) },
  ]);

  // Financial Health
  document.getElementById("drawerFinancials").innerHTML = buildMetricGrid([
    { label: "Rev Growth", value: fmtPct(s.revenueGrowth), cls: s.revenueGrowth >= 0 ? "positive" : "negative" },
    { label: "EPS Growth", value: fmtPct(s.epsGrowth), cls: s.epsGrowth >= 0 ? "positive" : "negative" },
    { label: "3Y Rev CAGR", value: fmtPct(s.revenueGrowth3y), cls: "positive" },
    { label: "Gross Margin", value: s.grossMargin ? `${fmtNum(s.grossMargin)}%` : "—" },
    { label: "Op Margin", value: s.operatingMargin ? `${fmtNum(s.operatingMargin)}%` : "—" },
    { label: "Net Margin", value: s.netMargin ? `${fmtNum(s.netMargin)}%` : "—" },
    { label: "ROE", value: s.roe ? `${fmtNum(s.roe)}%` : "—" },
    { label: "ROIC", value: s.roic ? `${fmtNum(s.roic)}%` : "—" },
    { label: "D/E Ratio", value: s.debtToEquity != null ? fmtNum(s.debtToEquity, 2) : "—" },
    { label: "Current Ratio", value: s.currentRatio != null ? fmtNum(s.currentRatio, 2) : "—" },
    { label: "FCF", value: s.freeCashFlow ? fmtCap(s.freeCashFlow) : "—" },
    { label: "Cash/Debt", value: s.cashToDebt != null ? `${fmtNum(s.cashToDebt, 1)}x` : "—" },
  ]);

  // Technical
  document.getElementById("drawerTechnicals").innerHTML = buildMetricGrid([
    { label: "RSI (14)", value: s.rsi != null ? s.rsi : "—", cls: s.rsi > 70 ? "negative" : s.rsi < 30 ? "positive" : "neutral" },
    { label: "50 vs 200 SMA", value: s.sma50vs200 === "above" ? "Above ↑" : "Below ↓", cls: s.sma50vs200 === "above" ? "positive" : "negative" },
    { label: "MACD Signal", value: capitalize(s.macdSignal), cls: s.macdSignal === "bullish" ? "positive" : s.macdSignal === "bearish" ? "negative" : "neutral" },
    { label: "Avg Volume", value: s.avgVolume ? fmtVolume(s.avgVolume) : "—" },
    { label: "Fwd Rev Gr", value: fmtPct(s.fwdRevenueGrowth), cls: "positive" },
    { label: "Sector", value: s.sector },
  ]);

  // Catalysts
  document.getElementById("drawerCatalysts").innerHTML = (s.catalysts || []).map(c => `<li>${c}</li>`).join("");

  // Risks
  document.getElementById("drawerRisks").innerHTML = (s.risks || []).map(r => `<li>${r}</li>`).join("");

  // Bull / Bear
  document.getElementById("drawerBull").textContent = s.bullCase || "";
  document.getElementById("drawerBear").textContent = s.bearCase || "";

  // Show
  drawer.classList.remove("hidden");
  overlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeDrawer() {
  document.getElementById("stockDrawer").classList.add("hidden");
  document.getElementById("drawerOverlay").classList.add("hidden");
  document.body.style.overflow = "";
}

function buildMetricGrid(items) {
  return items.map(m => `
    <div class="metric-item">
      <div class="mi-label">${m.label}</div>
      <div class="mi-value ${m.cls || 'neutral'}">${m.value}</div>
    </div>`).join("");
}

function capitalize(s) {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fmtVolume(v) {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(0)}M`;
  return `${(v / 1e3).toFixed(0)}K`;
}

/* ══════════════════════════════════════════════════════════════
   EVENT BINDINGS
   ══════════════════════════════════════════════════════════════ */
function bindEvents() {
  // Sorting
  document.querySelectorAll(".stock-table thead th.sortable").forEach(th => {
    th.addEventListener("click", () => {
      const key = th.dataset.sort;
      if (currentSort.key === key) {
        currentSort.dir = currentSort.dir === "asc" ? "desc" : "asc";
      } else {
        currentSort = { key, dir: key === "ticker" || key === "name" || key === "sector" ? "asc" : "desc" };
      }
      renderTable();
    });
  });

  // Filters
  document.getElementById("filterSector").addEventListener("change", e => {
    activeFilters.sector = e.target.value;
    refreshAll();
  });
  document.getElementById("filterRecommendation").addEventListener("change", e => {
    activeFilters.recommendation = e.target.value;
    refreshAll();
  });
  document.getElementById("filterMinScore").addEventListener("input", e => {
    activeFilters.minScore = parseInt(e.target.value);
    document.getElementById("filterMinScoreVal").textContent = e.target.value;
    refreshAll();
  });
  document.getElementById("filterCap").addEventListener("change", e => {
    activeFilters.cap = e.target.value;
    refreshAll();
  });

  // Search
  document.getElementById("globalSearch").addEventListener("input", e => {
    activeFilters.search = e.target.value;
    refreshAll();
  });

  // Keyboard shortcut
  document.addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      document.getElementById("globalSearch").focus();
    }
    if (e.key === "Escape") closeDrawer();
  });

  // View toggle
  document.getElementById("viewTable").addEventListener("click", () => setView("table"));
  document.getElementById("viewCards").addEventListener("click", () => setView("cards"));

  // Drawer close
  document.getElementById("drawerClose").addEventListener("click", closeDrawer);
  document.getElementById("drawerOverlay").addEventListener("click", closeDrawer);
}

function setView(view) {
  currentView = view;
  document.getElementById("tableView").classList.toggle("hidden", view !== "table");
  document.getElementById("cardsView").classList.toggle("hidden", view !== "cards");
  document.getElementById("viewTable").classList.toggle("active", view === "table");
  document.getElementById("viewCards").classList.toggle("active", view === "cards");
}

function refreshAll() {
  renderTable();
  renderCards();
}

/* ─── Sector chip click handler ─── */
function filterBySector(sectorName) {
  const sel = document.getElementById("filterSector");
  const options = Array.from(sel.options);
  const match = options.find(o => sectorName.includes(o.value) || o.value.includes(sectorName));
  if (match) {
    sel.value = match.value;
    activeFilters.sector = match.value;
  } else {
    sel.value = "all";
    activeFilters.sector = "all";
  }
  refreshAll();
}
