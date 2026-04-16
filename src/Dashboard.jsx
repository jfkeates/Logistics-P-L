import { useState, useEffect } from "react";

// ===== LIVE DATA HOOK =====
// Fetches from /api/data (Vercel serverless function → BigQuery)
// Falls back to hardcoded data below if the API is unavailable
function useLiveData() {
  const [liveData, setLiveData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(r => r.ok ? r.json() : Promise.reject('API unavailable'))
      .then(data => {
        setLiveData(data);
        setLastUpdated(data.generated_at);
      })
      .catch(err => {
        console.log('Using hardcoded data (API unavailable):', err);
        setError('Using offline data');
      });
  }, []);

  return { liveData, lastUpdated, error };
}

// ===== GL DATA (hardcoded fallback — also used when API is unavailable) =====
const glData = [
  { name: "B2C outbound from WH", p1a26: 452316, p2a26: 1476790, p1b26: 1206810, p2b26: 1178695, p1a25: 886506, p2a25: 782926, note: null, saving: null, savingNote: null },
  { name: "B2B transport var.", p1a26: 624685, p2a26: 654415, p1b26: 618092, p2b26: 618028, p1a25: 589324, p2a25: 571774, note: null, saving: null, savingNote: null },
  { name: "WH storage", p1a26: 480081, p2a26: 256079, p1b26: 412521, p2b26: 361897, p1a25: 308766, p2a25: 325415, note: null, saving: null, savingNote: null },
  { name: "WH outbound handling", p1a26: 351681, p2a26: 364928, p1b26: 304556, p2b26: 293135, p1a25: 275951, p2a25: 290202, note: "Volume-driven: orders up 37% YoY, cost up 27%.", saving: 36000, savingAnn: 72000, savingNote: "Est: 5% handling rate reduction on \u20ac717k P1+P2 actual = \u20ac36k. Volume grew 37% YoY but cost only 27% — negotiate scale discount." },
  { name: "B2C returns to WH", p1a26: 208295, p2a26: 380519, p1b26: 121972, p2b26: 112404, p1a25: 130718, p2a25: 112392, note: "Running 2.5x budget. UPS carries 83% (\u20ac490k).", saving: 153000, savingAnn: 306000, savingNote: "Est: (a) 15% return carrier rate negotiation = \u20ac88k. Basis: \u20ac589k return cost, UPS 83%. (b) 5pp webstore return rate reduction (45%\u219240%) = \u20ac65k. Basis: 431,741 gross \u00d7 5% \u00d7 \u20ac2.99/return." },
  { name: "Other logistics", p1a26: 333858, p2a26: 246973, p1b26: 162669, p2b26: 161465, p1a25: 161639, p2a25: 160212, note: "detail", flag: "decompose", saving: 84000, savingAnn: 84000, savingNote: "Reclassification only: Laguna Mauritius recharges (\u20ac84k) to COGS. Not a real cost saving." },
  { name: "Customs duties", p1a26: 131367, p2a26: 314005, p1b26: 259423, p2b26: 259975, p1a25: 146367, p2a25: 223175, note: null, saving: null, savingNote: null },
  { name: "B2C outbound store", p1a26: 145769, p2a26: 227734, p1b26: 95394, p2b26: 94722, p1a25: 88027, p2a25: 101118, note: "detail", flag: "ea", saving: 56000, savingAnn: 112000, savingNote: "Est: 15% store UPS rate negotiation on \u20ac374k P1+P2 = \u20ac56k. 113,690 EA units at \u20ac3.29/unit. Root cause is allocation gap — fixing that reduces EA volume and thus transport." },
  { name: "WH inbound handling", p1a26: 198299, p2a26: 156189, p1b26: 241545, p2b26: 159193, p1a25: 138254, p2a25: 157277, note: null, saving: null, savingNote: null },
  { name: "HQ transport", p1a26: 44063, p2a26: 118159, p1b26: 42876, p2b26: 42968, p1a25: 58344, p2a25: 68225, note: "detail", flag: "hq", saving: null, savingNote: "P2 spike driven by Trisco QC consolidation UPS shipments (see detail). \u20ac100k UPS in P2 vs \u20ac33k baseline in P1. Incremental ~\u20ac67k is Trisco pullback transport from 78 stores." },
  { name: "WH quality control", p1a26: 39351, p2a26: 32872, p1b26: 61578, p2b26: 61578, p1a25: 64932, p2a25: 29834, note: "detail", flag: "qc", saving: null, savingNote: "Under budget P1+P2. But Trisco QC project (\u20ac64k P3+P4) will push over budget from P3. Full Trisco cost chain: ~\u20ac224-254k total across transport + QC." },
  { name: "WH returns handling", p1a26: 28923, p2a26: 45096, p1b26: 77649, p2b26: 74119, p1a25: 66584, p2a25: 55428, note: null, saving: null, savingNote: null },
  { name: "B2B transport returns", p1a26: 18635, p2a26: 9169, p1b26: 27638, p2b26: 26408, p1a25: 12285, p2a25: 25541, note: null, saving: null, savingNote: null },
  { name: "B2B transport fixed", p1a26: 11426, p2a26: 1395, p1b26: 0, p2b26: 0, p1a25: 18785, p2a25: -94944, note: null, saving: null, savingNote: null },
  { name: "Recharged transport", p1a26: 0, p2a26: 0, p1b26: 0, p2b26: 0, p1a25: -15775, p2a25: 0, note: null, saving: null, savingNote: null },
];

const cnLocal = { p1a26: 149347, p2a26: 157423 };
const revenue = { p1a26: 38915141, p2a26: 41163300, p1b26: 42010450, p2b26: 41691531, p1a25: 44067778, p2a25: 40909361 };

// ===== DECOMPOSITION DATA =====
const otherBreakdown = [
  { name: "Modexpress \u2014 Transport", p1: 88059, p2: 91390, desc: "Weekly 3PL transport invoices. Should be reallocated to B2B/B2C transport GL lines." },
  { name: "Modexpress \u2014 Warehousing", p1: 67405, p2: 108604, desc: "Weekly 3PL warehousing. Should be reallocated to WH storage (5213104)." },
  { name: "Laguna Clo \u2014 Recharges", p1: 118017, p2: -34389, desc: "\u26a0\ufe0f MISCLASSIFIED \u2014 should be in COGS. Laguna (Mauritius) delivers DDP into USA as importer of record.", flag: "cogs" },
  { name: "Modexpress \u2014 VAS", p1: 27748, p2: 32818, desc: "Visuals prep/steaming, FTZ bonded warehouse, Sunday shift premium, metal disposal, LTL." },
  { name: "Brandart (packaging)", p1: 7688, p2: 15816, desc: "Packaging materials, labels, hangtags." },
  { name: "DHL International", p1: 7587, p2: 15526, desc: "B2B/interstore shipments via DHL." },
  { name: "OIA Global + Other", p1: 17354, p2: 5207, desc: "Freight forwarding, customs brokerage, misc." },
];

const storeBreakdown = [
  { name: "UPS \u2014 US Stores", p1: 65549, p2: 163727, desc: "Ship-from-store to customers. P2 spiked 2.5x vs P1." },
  { name: "UPS \u2014 US Warehouse", p1: 21136, p2: 22020, desc: "Store-originated orders routed through WH." },
  { name: "UPS \u2014 NL/HQ", p1: 24801, p2: 710, desc: "Cross-border store fulfillment." },
  { name: "UPS \u2014 EMEA Stores", p1: 10991, p2: 11378, desc: "European store shipments to customers." },
  { name: "UPS \u2014 Canada", p1: 2731, p2: 14007, desc: "Canadian store shipments. P2 spiked 5x." },
  { name: "UPS \u2014 China + Other", p1: 19561, p2: 15892, desc: "China store shipments and misc." },
];

// ===== TRISCO QC PROJECT DATA (from DWH fct__inventory_transfers + D365 GL) =====
const triscoTransfers = [
  { period: "P1", namUnits: 70, emeaUnits: 146, totalUnits: 216, inventoryCost: 19708, upsHqCost: 33233, modexQc: 0 },
  { period: "P2", namUnits: 7566, emeaUnits: 1070, totalUnits: 8636, inventoryCost: 961575, upsHqCost: 100003, modexQc: 0 },
  { period: "P3", namUnits: 1668, emeaUnits: 990, totalUnits: 2658, inventoryCost: 220813, upsHqCost: 123563, modexQc: 38845 },
  { period: "P4*", namUnits: 586, emeaUnits: 727, totalUnits: 1313, inventoryCost: 116800, upsHqCost: 36428, modexQc: 25330 },
];

const triscoAnnouncements = [
  { week: "W5/W6", date: "31 Jan", region: "US + EU", action: "First consolidation \u2014 transit issue from Indonesia factory. Poor pressing, twisted sleeves, unclean sleeve head. Separate NAM + EMEA lists. Stores to inspect all 'Made in Indonesia' / 'INTC' items, set aside for WH reconditioning.", items: "22 NAM item codes, EMEA list" },
  { week: "W7", date: "9 Feb", region: "US", action: "C261021 hemline check (wavy hem on Light Blue Check Roma Jacket) + consolidation of P7230, P7235, P7249, C6855, C7010. Reminder of W5/W6 actions.", items: "C261021, P7230, P7235, P7249, C6855, C7010" },
  { week: "W13", date: "24 Mar", region: "EU", action: "EU-specific consolidation via 'Trisco in Store EU.xlsx'. 653 units across 36 EU stores. Items need reconditioning at warehouse due to nature of fabric.", items: "11 EU item codes incl. C9555, C9565, C7505, C7506, P7275" },
];

// ===== HELPERS =====
const fmtK = (n) => n >= 1000000 ? `\u20ac${(n/1000000).toFixed(1)}M` : `\u20ac${Math.round(n / 1000)}k`;
const fmtPct = (n) => `${n >= 0 ? "+" : ""}${(n * 100).toFixed(1)}%`;
const fmtN = (n) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : `${n}`;

function Pill({ children, color = "#64748b", bg = "#f1f5f9" }) {
  return <span style={{ fontSize: 9, fontWeight: 600, color, background: bg, padding: "1px 5px", borderRadius: 10, whiteSpace: "nowrap" }}>{children}</span>;
}

// ===== MAIN =====
export default function LogisticsDashboard() {
  const [period, setPeriod] = useState("combined");
  const [expanded, setExpanded] = useState(null);
  const [showSavingNote, setShowSavingNote] = useState(null);
  const { liveData, lastUpdated, error: dataError } = useLiveData();

  // ===== LIVE DATA TRANSFORMATION =====
  const accountMeta = {
    "5213102": { name: "B2C outbound from WH" },
    "5213111": { name: "B2B transport var." },
    "5213104": { name: "WH storage" },
    "5213110": { name: "WH outbound handling", note: "Volume-driven: orders up 37% YoY, cost up 27%.", saving: 36000, savingAnn: 72000, savingNote: "Est: 5% handling rate reduction. Volume grew 37% YoY but cost only 27% — negotiate scale discount." },
    "5213105": { name: "B2C returns to WH", note: "Running 2.5x budget. UPS carries 83% (\u20ac490k).", saving: 153000, savingAnn: 306000, savingNote: "Est: (a) 15% return carrier rate nego = \u20ac88k. (b) 5pp return rate reduction = \u20ac65k. Basis: \u20ac2.99/return on 197k returns." },
    "5213101": { name: "Other logistics", note: "detail", flag: "decompose", saving: 84000, savingAnn: 84000, savingNote: "Reclassification only: Laguna Mauritius recharges (\u20ac84k) to COGS." },
    "5213113": { name: "Customs duties" },
    "5213140": { name: "B2C outbound store", note: "detail", flag: "ea", saving: 56000, savingAnn: 112000, savingNote: "Est: 15% store UPS rate nego = \u20ac56k. Root cause is allocation gap." },
    "5213106": { name: "WH inbound handling" },
    "5213115": { name: "HQ transport", note: "detail", flag: "hq", savingNote: "P2 spike driven by Trisco QC consolidation UPS shipments." },
    "5213114": { name: "WH quality control", note: "detail", flag: "qc", savingNote: "Trisco QC project (\u20ac64k P3+P4) will push over budget from P3." },
    "5213112": { name: "WH returns handling" },
    "5213108": { name: "B2B transport returns" },
    "5213107": { name: "B2B transport fixed" },
    "5213199": { name: "Recharged transport" },
  };

  const isLive = !!liveData;
  let displayData = glData;
  let availablePeriods = [{ id: "combined", label: "P1+P2" }, { id: "p1", label: "P1" }, { id: "p2", label: "P2" }];
  let cnLocalData = cnLocal;
  let revenueData = revenue;

  if (isLive) {
    const periodsWithData = [...new Set(liveData.gl.map(r => Number(r.period)))].sort((a, b) => a - b);
    availablePeriods = [];
    if (periodsWithData.length > 1) {
      const rangeLabel = `P${periodsWithData[0]}+P${periodsWithData[periodsWithData.length - 1]}`;
      availablePeriods.push({ id: "combined", label: rangeLabel });
    }
    periodsWithData.forEach(p => availablePeriods.push({ id: `p${p}`, label: `P${p}` }));

    const accountMap = {};
    const cnAccounts = new Set();
    liveData.gl.forEach(row => {
      const acct = row.account;
      const p = Number(row.period);
      if (acct.startsWith("660")) {
        cnAccounts.add(acct);
        if (!accountMap["_cn"]) accountMap["_cn"] = {};
        if (!accountMap["_cn"][p]) accountMap["_cn"][p] = { actual: 0, budget: 0, ly: 0 };
        accountMap["_cn"][p].actual += Number(row.actual || 0);
        return;
      }
      if (!accountMap[acct]) accountMap[acct] = {};
      if (!accountMap[acct][p]) accountMap[acct][p] = { actual: 0, budget: 0, ly: 0 };
      accountMap[acct][p].actual += Number(row.actual || 0);
      accountMap[acct][p].budget += Number(row.budget || 0);
      accountMap[acct][p].ly += Number(row.ly || 0);
    });

    cnLocalData = {};
    periodsWithData.forEach(p => {
      cnLocalData[`p${p}`] = accountMap["_cn"]?.[p]?.actual || 0;
    });

    displayData = Object.entries(accountMap)
      .filter(([acct]) => acct !== "_cn")
      .map(([acct, periods]) => {
        const meta = accountMeta[acct] || { name: acct };
        const row = { name: meta.name, ...meta };
        periodsWithData.forEach(p => {
          row[`p${p}a26`] = periods[p]?.actual || 0;
          row[`p${p}b26`] = periods[p]?.budget || 0;
          row[`p${p}a25`] = periods[p]?.ly || 0;
        });
        return row;
      });

    if (liveData.revenue) {
      revenueData = {};
      liveData.revenue.forEach(r => {
        const yr = Number(r.year);
        const p = Number(r.period);
        if (yr === 2026) {
          revenueData[`p${p}a26`] = Number(r.revenue || 0);
          revenueData[`p${p}b26`] = Number(r.revenue || 0);
        } else if (yr === 2025) {
          revenueData[`p${p}a25`] = Number(r.revenue || 0);
        }
      });
    }
  }

  const allPeriodIds = availablePeriods.filter(p => p.id !== "combined").map(p => p.id);
  const g = (r, field) => {
    if (period === "combined") {
      return allPeriodIds.reduce((sum, pid) => sum + (r[`${pid}${field}`] || 0), 0);
    }
    return r[`${period}${field}`] || 0;
  };

  const cnTotal = period === "combined"
    ? allPeriodIds.reduce((sum, pid) => sum + (cnLocalData[pid] || 0), 0)
    : (cnLocalData[period] || 0);

  const totalActual = displayData.reduce((s, r) => s + g(r, "a26"), 0) + cnTotal;
  const totalBudget = displayData.reduce((s, r) => s + g(r, "b26"), 0);
  const totalLy = displayData.reduce((s, r) => s + g(r, "a25"), 0);

  const getRevField = (field) => {
    if (period === "combined") {
      return allPeriodIds.reduce((sum, pid) => sum + (revenueData[`${pid}${field}`] || 0), 0);
    }
    return revenueData[`${period}${field}`] || 0;
  };
  const rev = getRevField("a26");
  const revBudget = getRevField("b26");
  const revLy = getRevField("a25");
  const totalSaving = displayData.reduce((s, r) => s + (r.saving || 0), 0);

  const sorted = [...displayData].map(r => {
    const actual = g(r, "a26"), budget = g(r, "b26"), ly = g(r, "a25");
    return { ...r, actual, budget, ly, varB: actual - budget, varLy: actual - ly };
  }).sort((a, b) => b.varB - a.varB);

  const cols = "24px 148px 64px 64px 64px 20px 64px 64px 88px";

  const renderDecomp = (items, maxVal) => (
    <div style={{ padding: "8px 0 4px 0" }}>
      {items.map((r, i) => {
        const val = period === "p1" ? r.p1 : period === "p2" ? r.p2 : r.p1 + r.p2;
        const pct = maxVal > 0 ? (Math.abs(val) / maxVal) * 100 : 0;
        return (
          <div key={i} style={{ marginBottom: 7 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <div style={{ width: 140, fontSize: 11, fontWeight: 600, color: "#334155" }}>{r.name}</div>
              <div style={{ flex: 1, background: "#f8fafc", borderRadius: 3, height: 13 }}>
                <div style={{ width: `${Math.min(pct, 100)}%`, background: r.flag === "cogs" ? "#fbbf24" : "#93c5fd", borderRadius: 3, height: "100%", minWidth: val !== 0 ? 2 : 0 }} />
              </div>
              <div style={{ width: 52, fontSize: 11, fontWeight: 600, textAlign: "right" }}>{fmtK(val)}</div>
            </div>
            <div style={{ fontSize: 10, color: r.flag === "cogs" ? "#92400e" : "#94a3b8", lineHeight: 1.4 }}>
              {r.flag === "cogs" && <span style={{ background: "#fef3c7", padding: "0 4px", borderRadius: 3, marginRight: 3, fontSize: 9, fontWeight: 600 }}>RECLASSIFY</span>}
              {r.desc}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ===== B2C STORE OUTBOUND PANEL (Endless Aisle analysis) =====
  const renderEaPanel = () => (
    <div style={{ padding: "8px 0 4px 0" }}>
      <div style={{ fontSize: 10, color: "#64748b", marginBottom: 6 }}>Order fulfilment data from DWH: where do Endless Aisle orders ship FROM and TO?</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <div style={{ background: "#dbeafe", borderRadius: 5, padding: "8px 10px" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1e3a5f" }}>78%</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#1e40af" }}>WH \u2192 Store (pickup)</div>
          <div style={{ fontSize: 10, color: "#64748b" }}>89,203 units \u00b7 \u20ac214k transport</div>
          <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>Store didn't have stock \u2192 WH ships to store for customer collection</div>
        </div>
        <div style={{ background: "#f0f9ff", borderRadius: 5, padding: "8px 10px" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1e3a5f" }}>22%</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#1e40af" }}>WH \u2192 Customer home</div>
          <div style={{ fontSize: 10, color: "#64748b" }}>24,473 units \u00b7 \u20ac69k transport</div>
          <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>Classic "order in store, ship to home"</div>
        </div>
      </div>
      <div style={{ fontSize: 10, color: "#991b1b", padding: "6px 8px", background: "#fef2f2", borderRadius: 5, lineHeight: 1.5, marginBottom: 6 }}>
        <strong>Conclusion: allocation gap, not customer uncollected goods.</strong> 78% of Endless Aisle orders originate from the warehouse and ship to the store address for customer pickup. The store didn't have the right product in stock \u2014 the WH is bridging the demand gap via EA at \u20ac3.29/unit. This is NOT customers failing to collect or customer-owned goods being shipped home. The root cause is that stores aren't allocated the right inventory for customer demand. Fixing allocation would reduce EA volume and the associated \u20ac374k transport cost.
      </div>
      {renderDecomp(storeBreakdown, Math.max(...storeBreakdown.map(x => Math.abs(period === "p1" ? x.p1 : period === "p2" ? x.p2 : x.p1 + x.p2))))}
    </div>
  );

  // ===== TRISCO QC PANEL (full cost chain) =====
  const renderQcPanel = () => (
    <div style={{ padding: "8px 0 4px 0" }}>
      <div style={{ fontSize: 10, color: "#64748b", marginBottom: 6 }}>Full Trisco QC project cost chain \u2014 store pullback transfers + UPS transport + Modexpress WH QC</div>

      {/* Transfer volumes table */}
      <div style={{ display: "grid", gridTemplateColumns: "48px 56px 56px 56px 72px 72px 64px", gap: 2, fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", padding: "3px 0", borderBottom: "1px solid #e2e8f0" }}>
        <div>Period</div><div style={{textAlign:"right"}}>NAM</div><div style={{textAlign:"right"}}>EMEA</div><div style={{textAlign:"right"}}>Units</div><div style={{textAlign:"right"}}>Inv. Cost</div><div style={{textAlign:"right"}}>UPS HQ</div><div style={{textAlign:"right"}}>QC WH</div>
      </div>
      {triscoTransfers.map((p, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "48px 56px 56px 56px 72px 72px 64px", gap: 2, fontSize: 11, padding: "4px 0", borderBottom: "1px solid #f8fafc", fontWeight: p.totalUnits > 1000 ? 600 : 400, color: p.totalUnits > 1000 ? "#0f172a" : "#64748b" }}>
          <div>{p.period}</div>
          <div style={{textAlign:"right"}}>{fmtN(p.namUnits)}</div>
          <div style={{textAlign:"right"}}>{fmtN(p.emeaUnits)}</div>
          <div style={{textAlign:"right", fontWeight:700}}>{fmtN(p.totalUnits)}</div>
          <div style={{textAlign:"right"}}>{fmtK(p.inventoryCost)}</div>
          <div style={{textAlign:"right", color: p.upsHqCost > 50000 ? "#dc2626" : "#64748b"}}>{fmtK(p.upsHqCost)}</div>
          <div style={{textAlign:"right", color: p.modexQc > 0 ? "#7c3aed" : "#cbd5e1"}}>{p.modexQc > 0 ? fmtK(p.modexQc) : "\u2014"}</div>
        </div>
      ))}
      <div style={{ display: "grid", gridTemplateColumns: "48px 56px 56px 56px 72px 72px 64px", gap: 2, fontSize: 11, padding: "4px 0", borderTop: "1px solid #334155", fontWeight: 800 }}>
        <div>Total</div><div style={{textAlign:"right"}}>{fmtN(9890)}</div><div style={{textAlign:"right"}}>{fmtN(2933)}</div><div style={{textAlign:"right"}}>{fmtN(12823)}</div><div style={{textAlign:"right"}}>{fmtK(1318896)}</div><div style={{textAlign:"right", color:"#dc2626"}}>{fmtK(293227)}</div><div style={{textAlign:"right", color:"#7c3aed"}}>{fmtK(64175)}</div>
      </div>

      {/* Store announcements timeline */}
      <div style={{ marginTop: 8, fontSize: 10, color: "#334155" }}>
        <div style={{ fontWeight: 700, color: "#5b21b6", marginBottom: 4 }}>Store Announcement Timeline (SharePoint)</div>
        {triscoAnnouncements.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4, lineHeight: 1.4 }}>
            <div style={{ minWidth: 44, fontWeight: 700, color: "#7c3aed" }}>{a.week}</div>
            <div style={{ minWidth: 42, color: "#94a3b8" }}>{a.date}</div>
            <div><Pill color={a.region.includes("EU") ? "#1e40af" : "#b45309"} bg={a.region.includes("EU") ? "#eff6ff" : "#fffbeb"}>{a.region}</Pill> {a.action}</div>
          </div>
        ))}
      </div>

      {/* Cost summary */}
      <div style={{ fontSize: 10, color: "#991b1b", padding: "6px 8px", background: "#fef2f2", borderRadius: 5, lineHeight: 1.5, marginTop: 6 }}>
        <strong>Full Trisco QC cost chain (P1-P4 2026):</strong> 12,823 units pulled back from 78 stores across NAM + EMEA. Store\u2192WH transport via UPS on GL 5213115: ~\u20ac293k total, of which ~\u20ac160-190k is incremental over baseline. Modexpress WH QC/reconditioning on GL 5213114: \u20ac64k (P3+P4 only, run rate \u20ac38-48k/period). <strong>Estimated total logistics cost: \u20ac224-254k.</strong> Plus: \u20ac1.32M inventory tied up in QC pipeline, replacement allocation transport, and store labour for manual inspection. GL doesn't reference "Trisco" on either line \u2014 UPS invoices book to HQ Transport, Modexpress QC invoices reference "SS QC PROJECT" / "QC PROJECT" only.
      </div>
      <div style={{ fontSize: 9, color: "#64748b", marginTop: 3 }}>* P4 partial through mid-April 2026. Sources: fct__inventory_transfers (product_key join to dim__product for item codes), fct__ledger_transactions_d365 GL 5213115 + 5213114, SharePoint Store Knowledgebase W5/W6/W7/W13 communications.</div>
    </div>
  );

  // ===== HQ TRANSPORT PANEL =====
  const renderHqPanel = () => (
    <div style={{ padding: "8px 0 4px 0" }}>
      <div style={{ fontSize: 10, color: "#64748b", marginBottom: 6 }}>UPS charges on GL 5213115 \u2014 correlated with Trisco store-to-warehouse consolidation shipments.</div>
      <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 72px 72px", gap: 4, marginBottom: 6 }}>
        {[
          { p: "P1", ups: 33233, total: 44063, units: 216 },
          { p: "P2", ups: 100003, total: 118159, units: 8636 },
          { p: "P3", ups: 123563, total: 137794, units: 2658 },
          { p: "P4*", ups: 36428, total: 46283, units: 1313 },
        ].map((r, i) => (
          <div key={i} style={{ display: "contents" }}>
            <div style={{ fontSize: 11, fontWeight: 600 }}>{r.p}</div>
            <div style={{ height: 14, display: "flex", alignItems: "center" }}>
              <div style={{ height: 10, background: "#93c5fd", borderRadius: 2, width: `${(r.ups / 130000) * 100}%` }} />
            </div>
            <div style={{ fontSize: 11, textAlign: "right", fontWeight: r.ups > 50000 ? 700 : 400, color: r.ups > 50000 ? "#dc2626" : "#64748b" }}>UPS {fmtK(r.ups)}</div>
            <div style={{ fontSize: 10, textAlign: "right", color: "#94a3b8" }}>{fmtN(r.units)} units</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10, color: "#1e3a5f", padding: "6px 8px", background: "#dbeafe", borderRadius: 5, lineHeight: 1.5 }}>
        <strong>Connection:</strong> UPS on HQ Transport spiked from \u20ac33k (P1) \u2192 \u20ac100k (P2) \u2192 \u20ac124k (P3). The P2 spike aligns exactly with the 8,636-unit Trisco pullback wave (W5/W6 announcement hit 31 Jan). The incremental ~\u20ac67k in P2 and ~\u20ac90k in P3 over the P1 baseline are the consolidation UPS shipments from 78 stores back to the warehouse. All charges on cost centre 700104 (Logistics).
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#f8fafc", minHeight: "100vh", padding: "18px 22px", maxWidth: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
        <h1 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0 }}>Logistics Cost Analysis \u2014 2026</h1>
        <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: isLive ? "#dcfce7" : "#fef3c7", color: isLive ? "#166534" : "#92400e" }}>
          {isLive ? `LIVE \u00b7 ${new Date(lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : "OFFLINE DATA"}
        </span>
      </div>
      <p style={{ fontSize: 10, color: "#94a3b8", margin: "0 0 12px 0" }}>
        {isLive ? "Live from BigQuery \u00b7 D365 GL actuals \u00b7 D365 budget \u00b7 Inventory transfers \u00b7 Auto-updates each period" : "D365 GL actuals \u00b7 D365 budget \u00b7 Exact GL (LY) \u00b7 DWH inventory transfers \u00b7 SharePoint store comms"} \u00b7 Savings flagged with \u24d8
      </p>

      <div style={{ display: "flex", gap: 2, marginBottom: 12, background: "#e2e8f0", borderRadius: 7, padding: 2, width: "fit-content" }}>
        {availablePeriods.map(t => (
          <button key={t.id} onClick={() => setPeriod(t.id)} style={{
            padding: "5px 12px", borderRadius: 5, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer",
            background: period === t.id ? "#fff" : "transparent", color: period === t.id ? "#0f172a" : "#64748b",
            boxShadow: period === t.id ? "0 1px 2px rgba(0,0,0,0.08)" : "none"
          }}>{t.label}</button>
        ))}
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Total Logistics", value: fmtK(totalActual), trend: (totalActual - totalBudget) / Math.abs(totalBudget || 1), trendLabel: "vs Bgt", sub: `Bgt ${fmtK(totalBudget)}` },
          { label: "vs Last Year", value: fmtK(totalActual - totalLy), trend: (totalActual - totalLy) / Math.abs(totalLy || 1), trendLabel: "vs LY", sub: `LY ${fmtK(totalLy)}` },
          { label: "% of Revenue", value: `${(totalActual / rev * 100).toFixed(1)}%`, sub: `Bgt ${(totalBudget / revBudget * 100).toFixed(1)}% \u00b7 LY ${(totalLy / revLy * 100).toFixed(1)}%` },
          { label: "Net Revenue", value: fmtK(rev), sub: `Bgt ${fmtK(revBudget)} \u00b7 LY ${fmtK(revLy)}` },
          { label: "Est. Saving Potential", value: fmtK(totalSaving), sub: `P1+P2 est. \u00b7 Ann. ~${fmtK(glData.reduce((s,r) => s + (r.savingAnn || 0), 0))}`, color: "#16a34a" },
        ].map((c, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 8, padding: "10px 11px", border: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.3 }}>{c.label}</div>
            <div style={{ fontSize: 19, fontWeight: 700, color: c.color || "#0f172a", marginTop: 2 }}>{c.value}</div>
            {c.trend !== undefined && <div style={{ fontSize: 11, fontWeight: 600, color: c.trend > 0.02 ? "#ef4444" : c.trend < -0.02 ? "#22c55e" : "#64748b", marginTop: 1 }}>{fmtPct(c.trend)} {c.trendLabel}</div>}
            <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Main GL table */}
      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #f1f5f9", overflow: "hidden", marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 0, padding: "6px 10px", background: "#f8fafc", fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", alignItems: "end" }}>
          <div></div><div>Account</div><div style={{ textAlign: "right" }}>Actual</div><div style={{ textAlign: "right" }}>Budget</div><div style={{ textAlign: "right" }}>vs Bgt</div><div></div><div style={{ textAlign: "right" }}>LY</div><div style={{ textAlign: "right" }}>vs LY</div><div style={{ textAlign: "right", color: "#16a34a" }}>Est. Saving \u24d8</div>
        </div>

        {sorted.map((r, i) => {
          const isExpanded = expanded === r.name;
          const hasDetail = ["decompose","ea","qc","hq"].includes(r.flag);
          const varBColor = r.varB > 10000 ? "#dc2626" : r.varB < -10000 ? "#16a34a" : "#64748b";
          const varBBg = r.varB > 10000 ? "#fef2f2" : r.varB < -10000 ? "#f0fdf4" : "transparent";
          const varLyColor = r.varLy > 10000 ? "#dc2626" : r.varLy < -10000 ? "#16a34a" : "#64748b";
          const bgtDot = r.budget > 0 ? (r.varB > 10000 ? "\ud83d\udd34" : r.varB < -10000 ? "\ud83d\udfe2" : "\u26aa") : "";

          return (
            <div key={i}>
              <div
                onClick={() => hasDetail ? setExpanded(isExpanded ? null : r.name) : (r.savingNote && setShowSavingNote(showSavingNote === r.name ? null : r.name))}
                style={{
                  display: "grid", gridTemplateColumns: cols, gap: 0,
                  padding: "5px 10px", borderBottom: "1px solid #f8fafc", fontSize: 11, alignItems: "center",
                  cursor: (hasDetail || r.savingNote) ? "pointer" : "default",
                  background: isExpanded ? "#f0f9ff" : showSavingNote === r.name ? "#f0fdf4" : i % 2 === 0 ? "#fff" : "#fafbfc",
                }}
              >
                <div style={{ fontSize: 9, color: hasDetail ? "#3b82f6" : "#e2e8f0" }}>{hasDetail ? (isExpanded ? "\u25bc" : "\u25b6") : "\u00b7"}</div>
                <div style={{ fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", gap: 3, fontSize: 11 }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                  {r.flag === "decompose" && !isExpanded && <Pill color="#3b82f6" bg="#eff6ff">+</Pill>}
                  {r.flag === "ea" && !isExpanded && <Pill color="#b45309" bg="#fffbeb">EA</Pill>}
                  {r.flag === "qc" && !isExpanded && <Pill color="#7c3aed" bg="#f5f3ff">QC</Pill>}
                  {r.flag === "hq" && !isExpanded && <Pill color="#dc2626" bg="#fef2f2">Trisco</Pill>}
                </div>
                <div style={{ textAlign: "right", fontWeight: 600 }}>{fmtK(r.actual)}</div>
                <div style={{ textAlign: "right", color: "#94a3b8" }}>{r.budget > 0 ? fmtK(r.budget) : "\u2014"}</div>
                <div style={{ textAlign: "right", fontWeight: 600, color: varBColor, background: varBBg, borderRadius: 3, padding: "1px 2px" }}>
                  {r.budget > 0 ? (r.varB > 0 ? "+" : "") + fmtK(r.varB) : "\u2014"}
                </div>
                <div style={{ textAlign: "center", fontSize: 9 }}>{bgtDot}</div>
                <div style={{ textAlign: "right", color: "#94a3b8" }}>{Math.abs(r.ly) > 0 ? fmtK(r.ly) : "\u2014"}</div>
                <div style={{ textAlign: "right", fontWeight: 600, color: varLyColor }}>
                  {Math.abs(r.ly) > 0 ? (r.varLy > 0 ? "+" : "") + fmtK(r.varLy) : "\u2014"}
                </div>
                <div style={{ textAlign: "right" }}>
                  {r.saving ? (
                    <span style={{ color: "#16a34a", fontWeight: 600, cursor: "pointer", borderBottom: "1px dotted #86efac" }}
                      onClick={(e) => { e.stopPropagation(); setShowSavingNote(showSavingNote === r.name ? null : r.name); }}
                    >{fmtK(r.saving)} \u24d8</span>
                  ) : r.savingNote ? (
                    <span style={{ color: "#94a3b8", fontSize: 10, cursor: "pointer" }}
                      onClick={(e) => { e.stopPropagation(); setShowSavingNote(showSavingNote === r.name ? null : r.name); }}
                    >\u24d8</span>
                  ) : ""}
                </div>
              </div>

              {showSavingNote === r.name && r.savingNote && (
                <div style={{ padding: "6px 10px 8px 34px", background: "#f0fdf4", borderBottom: "1px solid #bbf7d0", fontSize: 10, color: "#166534", lineHeight: 1.5 }}>
                  <strong style={{ fontSize: 9, textTransform: "uppercase", color: "#15803d", letterSpacing: 0.3 }}>Estimate basis:</strong> {r.savingNote}
                  {r.savingAnn ? <span style={{ color: "#64748b" }}> | Annualised: ~{fmtK(r.savingAnn)}</span> : null}
                </div>
              )}

              {r.note && r.note !== "detail" && !hasDetail && !showSavingNote && (
                <div style={{ padding: "1px 10px 4px 34px", fontSize: 10, color: "#94a3b8", background: i % 2 === 0 ? "#fff" : "#fafbfc" }}>{r.note}</div>
              )}

              {/* Expanded panels */}
              {isExpanded && r.name === "Other logistics" && (
                <div style={{ padding: "6px 12px 8px 34px", background: "#f0f9ff", borderBottom: "1px solid #dbeafe" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", marginBottom: 1 }}>Decomposition \u2014 Other Logistics</div>
                  <div style={{ fontSize: 10, color: "#64748b", marginBottom: 2 }}>Genuine overrun ~\u20ac89k after Laguna reclass (\u20ac84k\u2192COGS) + Modexpress reallocation (\u20ac355k\u2192correct GL).</div>
                  {renderDecomp(otherBreakdown, Math.max(...otherBreakdown.map(x => Math.abs(period === "p1" ? x.p1 : period === "p2" ? x.p2 : x.p1 + x.p2))))}
                </div>
              )}
              {isExpanded && r.name === "B2C outbound store" && (
                <div style={{ padding: "6px 12px 8px 34px", background: "#fffbeb", borderBottom: "1px solid #fde68a" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#92400e", marginBottom: 1 }}>Endless Aisle Fulfilment Analysis \u2014 Stock Allocation Gap</div>
                  {renderEaPanel()}
                </div>
              )}
              {isExpanded && r.name === "HQ transport" && (
                <div style={{ padding: "6px 12px 8px 34px", background: "#fef2f2", borderBottom: "1px solid #fca5a5" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#991b1b", marginBottom: 1 }}>HQ Transport \u2014 Trisco Consolidation UPS Connection</div>
                  {renderHqPanel()}
                </div>
              )}
              {isExpanded && r.name === "WH quality control" && (
                <div style={{ padding: "6px 12px 8px 34px", background: "#f5f3ff", borderBottom: "1px solid #ddd6fe" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#5b21b6", marginBottom: 1 }}>Trisco QC Project \u2014 Full Cost Chain (12,823 units from 78 stores)</div>
                  {renderQcPanel()}
                </div>
              )}
            </div>
          );
        })}

        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 0, padding: "7px 10px", background: "#f8fafc", borderTop: "2px solid #0f172a", fontSize: 11, fontWeight: 800, alignItems: "center" }}>
          <div></div><div>TOTAL</div>
          <div style={{ textAlign: "right" }}>{fmtK(totalActual)}</div>
          <div style={{ textAlign: "right" }}>{fmtK(totalBudget)}</div>
          <div style={{ textAlign: "right", color: "#dc2626" }}>+{fmtK(totalActual - totalBudget)}</div>
          <div style={{ textAlign: "center", fontSize: 9 }}>\ud83d\udd34</div>
          <div style={{ textAlign: "right" }}>{fmtK(totalLy)}</div>
          <div style={{ textAlign: "right", color: "#dc2626" }}>+{fmtK(totalActual - totalLy)}</div>
          <div style={{ textAlign: "right", color: "#16a34a" }}>{fmtK(totalSaving)}</div>
        </div>
      </div>

      {/* Bottom panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div style={{ background: "#fef2f2", borderRadius: 7, padding: "9px 11px", border: "1px solid #fca5a5" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#991b1b", marginBottom: 3 }}>Classification Issues</div>
          <div style={{ fontSize: 10, color: "#7f1d1d", lineHeight: 1.5 }}>
            <strong>1. Laguna Mauritius (\u20ac84k):</strong> DDP production logistics \u2192 should be COGS.
            <br/><strong>2. Modexpress allocation (\u20ac355k):</strong> 3PL invoices in catch-all "Other logistics".
            <br/><strong>3. Trisco QC costs spread across two GL lines:</strong> Transport on 5213115 (HQ Transport), reconditioning on 5213114 (WH QC). Neither references "Trisco". Total ~\u20ac224-254k.
          </div>
        </div>
        <div style={{ background: "#f0fdf4", borderRadius: 7, padding: "9px 11px", border: "1px solid #86efac" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", marginBottom: 3 }}>Saving Potential (data-backed estimates)</div>
          <div style={{ fontSize: 10, color: "#166534", lineHeight: 1.5 }}>
            <strong>Returns transport (\u20ac153k):</strong> 15% UPS rate nego + 5pp return rate reduction.
            <br/><strong>Laguna reclass (\u20ac84k):</strong> P&L reclassification to COGS.
            <br/><strong>Store outbound (\u20ac56k):</strong> 15% store UPS rate nego. Root cause: fix store allocation.
            <br/><strong>WH handling (\u20ac36k):</strong> 5% rate reduction on volume scale.
            <br/><strong style={{ color: "#0f172a" }}>Total: \u20ac329k P1+P2 \u00b7 ~\u20ac574k annualised</strong>
            <br/><span style={{ fontSize: 9, color: "#64748b" }}>Click \u24d8 for methodology. Trisco QC ~\u20ac224-254k cost is incremental and not in budget.</span>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 9, color: "#b0b8c4", lineHeight: 1.4 }}>
        Sources: D365 GL \u00b7 D365 budget \u00b7 Exact GL LY \u00b7 DWH fct__inventory_transfers (Trisco item codes cross-referenced) \u00b7 D365 GL 5213115 UPS charges \u00b7 SharePoint W5/W6/W7/W13 Store Communications \u00b7 Order fulfilment explore (delivery_location_type \u00d7 fulfillment_location_type) \u00b7 CN local (~\u20ac307k) in totals \u00b7 \ud83d\udd34 over budget \ud83d\udfe2 under budget
      </div>
    </div>
  );
}
