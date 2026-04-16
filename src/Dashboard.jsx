import { useState, useEffect } from "react";

// ===== LIVE DATA HOOK =====
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

// ===== GL DATA (hardcoded fallback) =====
const glData = [
  { name: "B2C outbound from WH", p1a26: 452316, p2a26: 1476790, p1b26: 1206810, p2b26: 1178695, p1a25: 886506, p2a25: 782926 },
  { name: "B2B transport var.", p1a26: 624685, p2a26: 654415, p1b26: 618092, p2b26: 618028, p1a25: 589324, p2a25: 571774 },
  { name: "WH storage", p1a26: 480081, p2a26: 256079, p1b26: 412521, p2b26: 361897, p1a25: 308766, p2a25: 325415, flag: "storage" },
  { name: "WH outbound handling", p1a26: 351681, p2a26: 364928, p1b26: 304556, p2b26: 293135, p1a25: 275951, p2a25: 290202, note: "Volume-driven: orders up 37% YoY, cost up 27%.", saving: 36000, savingAnn: 72000, savingNote: "Est: 5% handling rate reduction on \u20ac717k P1+P2 actual = \u20ac36k. Volume grew 37% YoY but cost only 27% \u2014 negotiate scale discount." },
  { name: "B2C returns to WH", p1a26: 208295, p2a26: 380519, p1b26: 121972, p2b26: 112404, p1a25: 130718, p2a25: 112392, flag: "returns", saving: 153000, savingAnn: 306000, savingNote: "Est: (a) 15% return carrier rate negotiation = \u20ac88k. Basis: \u20ac589k return cost, UPS 83%. (b) 5pp webstore return rate reduction (45%\u219240%) = \u20ac65k." },
  { name: "Other logistics", p1a26: 333858, p2a26: 246973, p1b26: 162669, p2b26: 161465, p1a25: 161639, p2a25: 160212, note: "detail", flag: "decompose", saving: 84000, savingAnn: 84000, savingNote: "Reclassification only: Laguna Mauritius recharges (\u20ac84k) to COGS. Not a real cost saving." },
  { name: "Customs duties", p1a26: 131367, p2a26: 314005, p1b26: 259423, p2b26: 259975, p1a25: 146367, p2a25: 223175 },
  { name: "B2C outbound store", p1a26: 145769, p2a26: 227734, p1b26: 95394, p2b26: 94722, p1a25: 88027, p2a25: 101118, note: "detail", flag: "ea", saving: 56000, savingAnn: 112000, savingNote: "Est: 15% store UPS rate negotiation on \u20ac374k P1+P2 = \u20ac56k. Root cause is allocation gap \u2014 fixing that reduces EA volume and thus transport." },
  { name: "WH inbound handling", p1a26: 198299, p2a26: 156189, p1b26: 241545, p2b26: 159193, p1a25: 138254, p2a25: 157277 },
  { name: "HQ transport", p1a26: 44063, p2a26: 118159, p1b26: 42876, p2b26: 42968, p1a25: 58344, p2a25: 68225, note: "detail", flag: "hq", savingNote: "P2 spike driven by Trisco QC consolidation UPS shipments. \u20ac100k UPS in P2 vs \u20ac33k in P1. Incremental ~\u20ac67k is Trisco pullback transport from 78 stores." },
  { name: "WH quality control", p1a26: 39351, p2a26: 32872, p1b26: 61578, p2b26: 61578, p1a25: 64932, p2a25: 29834, note: "detail", flag: "qc", savingNote: "Under budget P1+P2. But Trisco QC project (\u20ac64k P3+P4) will push over budget from P3. Full Trisco cost chain: ~\u20ac357k total across transport + QC." },
  { name: "WH returns handling", p1a26: 28923, p2a26: 45096, p1b26: 77649, p2b26: 74119, p1a25: 66584, p2a25: 55428 },
  { name: "B2B transport returns", p1a26: 18635, p2a26: 9169, p1b26: 27638, p2b26: 26408, p1a25: 12285, p2a25: 25541 },
  { name: "B2B transport fixed", p1a26: 11426, p2a26: 1395, p1b26: 0, p2b26: 0, p1a25: 18785, p2a25: -94944 },
  { name: "Recharged transport", p1a26: 0, p2a26: 0, p1b26: 0, p2b26: 0, p1a25: -15775, p2a25: 0 },
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

// ===== TRISCO QC PROJECT DATA =====
const triscoTransfers = [
  { period: "P1", namUnits: 70, emeaUnits: 146, totalUnits: 216, inventoryCost: 19708, upsHqCost: 33233, modexQc: 0 },
  { period: "P2", namUnits: 7566, emeaUnits: 1070, totalUnits: 8636, inventoryCost: 961575, upsHqCost: 100003, modexQc: 0 },
  { period: "P3", namUnits: 1668, emeaUnits: 990, totalUnits: 2658, inventoryCost: 220813, upsHqCost: 123563, modexQc: 38845 },
  { period: "P4*", namUnits: 586, emeaUnits: 727, totalUnits: 1313, inventoryCost: 116800, upsHqCost: 36428, modexQc: 25330 },
];

const triscoAnnouncements = [
  { week: "W5/W6", date: "31 Jan", region: "US + EU", action: "First consolidation \u2014 transit issue from Indonesia factory. Poor pressing, twisted sleeves, unclean sleeve head. Stores to inspect all \u2018Made in Indonesia\u2019 / \u2018INTC\u2019 items.", items: "22 NAM item codes" },
  { week: "W7", date: "9 Feb", region: "US", action: "C261021 hemline check (wavy hem) + consolidation of P7230, P7235, P7249, C6855, C7010.", items: "6 items" },
  { week: "W13", date: "24 Mar", region: "EU", action: "EU-specific consolidation via \u2018Trisco in Store EU.xlsx\u2019. 653 units across 36 EU stores.", items: "11 EU item codes" },
];

// ===== DWH INVESTIGATION DATA (from BigQuery queries) =====
const whInventoryTrend = [
  { date: "Jan 25", units: 1918675, valueEur: 83208438 },
  { date: "Feb 25", units: 1895506, valueEur: 81739719 },
  { date: "Mar 25", units: 1894112, valueEur: 79760265 },
  { date: "Apr 25", units: 1902804, valueEur: 80357924 },
  { date: "Jan 26", units: 1890807, valueEur: 80206068 },
  { date: "Feb 26", units: 1839652, valueEur: 79411913 },
  { date: "Mar 26", units: 1880164, valueEur: 79999983 },
  { date: "Apr 26", units: 1904850, valueEur: 79858058 },
  { date: "Apr 26*", units: 1892431, valueEur: 79592644 },
];

const returnsVolumeData = [
  { year: 2025, period: 1, units: 27944, lines: 27709 },
  { year: 2025, period: 2, units: 27714, lines: 26958 },
  { year: 2026, period: 1, units: 34053, lines: 33847 },
  { year: 2026, period: 2, units: 34611, lines: 34394 },
];

const webstoreOrderData = [
  { year: 2025, period: 1, units: 34400, orders: 34244 },
  { year: 2025, period: 2, units: 40601, orders: 34905 },
  { year: 2026, period: 1, units: 36923, orders: 43540 },
  { year: 2026, period: 2, units: 45531, orders: 44940 },
];

// ===== HELPERS =====
const fmtK = (n) => n >= 1000000 ? `\u20ac${(n/1000000).toFixed(1)}M` : `\u20ac${Math.round(n / 1000)}k`;
const fmtPct = (n) => `${n >= 0 ? "+" : ""}${(n * 100).toFixed(1)}%`;
const fmtN = (n) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : `${n}`;

function Pill({ children, color = "#64748b", bg = "#f1f5f9" }) {
  return <span style={{ fontSize: 9, fontWeight: 600, color, background: bg, padding: "1px 5px", borderRadius: 10, whiteSpace: "nowrap" }}>{children}</span>;
}

// Mini bar chart for investigation panels
function MiniBar({ label, value, max, color = "#93c5fd", suffix = "" }) {
  const pct = max > 0 ? (Math.abs(value) / max) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
      <div style={{ width: 70, fontSize: 10, color: "#64748b", textAlign: "right" }}>{label}</div>
      <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 3, height: 12 }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 3, height: "100%", minWidth: value > 0 ? 2 : 0 }} />
      </div>
      <div style={{ width: 72, fontSize: 10, fontWeight: 600, textAlign: "right" }}>{typeof value === "number" ? (suffix === "k" ? fmtK(value) : value.toLocaleString()) : value}{suffix && suffix !== "k" ? suffix : ""}</div>
    </div>
  );
}

// ======================================================================
// SUMMARY TAB COMPONENT
// ======================================================================
function SummaryTab() {
  const cardStyle = { borderRadius: 8, padding: "12px 14px", border: "1px solid" };
  const detailLine = { display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: "1px solid rgba(0,0,0,0.05)", fontSize: 10 };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", margin: 0 }}>P1+P2 2026 \u2014 Cost Overrun Analysis</h2>
        <p style={{ fontSize: 11, color: "#94a3b8", margin: "2px 0 0" }}>Net logistics overrun of +3.9% vs budget, broken down by cause</p>
      </div>

      {/* Waterfall */}
      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Budget to Actual Bridge (P1+P2)</h3>
        {[
          { label: "Budget", left: 0, width: 80, color: "#cbd5e1", value: "\u20ac7,077k", vc: "#64748b" },
          { label: "One-off: Trisco QC (P1+P2 impact)", left: 80, width: 1, color: "#a78bfa", value: "+\u20ac76k", vc: "#dc2626" },
          { label: "Volume-driven (sales)", left: 81, width: 9, color: "#60a5fa", value: "+\u20ac656k", vc: "#dc2626" },
          { label: "Misclassification", left: 90, width: 1.2, color: "#fbbf24", value: "+\u20ac84k", vc: "#dc2626" },
          { label: "To investigate", left: 91.2, width: 2.5, color: "#f87171", value: "+\u20ac173k", vc: "#dc2626" },
          { label: "Under budget (other lines)", left: 86, width: 7.1, color: "#86efac", value: "\u2212\u20ac713k", vc: "#16a34a" },
        ].map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "220px 1fr 80px", gap: 8, alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f8fafc" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#334155" }}>{r.label}</div>
            <div style={{ height: 18, position: "relative" }}>
              <div style={{ position: "absolute", left: `${r.left}%`, width: `${r.width}%`, height: "100%", background: r.color, borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, textAlign: "right", color: r.vc }}>{r.value}</div>
          </div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 80px", gap: 8, alignItems: "center", padding: "8px 0 0", borderTop: "2px solid #0f172a", marginTop: 4, fontWeight: 800 }}>
          <div style={{ fontSize: 11, color: "#0f172a" }}>Actual (incl. CN local)</div>
          <div style={{ height: 18, position: "relative" }}>
            <div style={{ position: "absolute", left: 0, width: "84%", height: "100%", background: "#0f172a", borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 11, textAlign: "right", color: "#0f172a" }}>\u20ac7,353k</div>
        </div>
      </div>

      {/* Category cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {/* Trisco One-Off */}
        <div style={{ ...cardStyle, background: "#faf5ff", borderColor: "#d8b4fe" }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", marginBottom: 2 }}>
            One-Off: Trisco QC Project <Pill color="#7c3aed" bg="#ede9fe">COMPLETED</Pill>
          </h3>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#7c3aed", marginBottom: 4 }}>\u20ac357k</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa", marginBottom: 6 }}>Total project cost (P1\u2013P4) \u00b7 Won't recur</div>
          <div style={{ fontSize: 10, lineHeight: 1.5, color: "#6b21a8" }}>
            <div style={detailLine}><span style={{ opacity: 0.8 }}>UPS consolidation transport (P1\u2013P4)</span><span style={{ fontWeight: 600 }}>\u20ac293k</span></div>
            <div style={{ ...detailLine, paddingLeft: 10, opacity: 0.7 }}><span>\u21b3 P1: \u20ac33k \u00a0 P2: \u20ac100k \u00a0 P3: \u20ac124k \u00a0 P4: \u20ac36k</span><span></span></div>
            <div style={detailLine}><span style={{ opacity: 0.8 }}>Modexpress QC handling (P3\u2013P4)</span><span style={{ fontWeight: 600 }}>\u20ac64k</span></div>
            <div style={{ ...detailLine, paddingLeft: 10, opacity: 0.7 }}><span>\u21b3 P3: \u20ac39k \u00a0 P4: \u20ac25k</span><span></span></div>
            <div style={{ marginTop: 6, paddingTop: 4, borderTop: "1px dashed rgba(0,0,0,0.1)" }}>
              <strong>P1+P2 budget impact:</strong> +\u20ac76k on HQ transport (actual \u20ac162k vs budget \u20ac86k). WH QC under budget by \u20ac51k in P1+P2 \u2014 QC costs land in P3+P4. 12,823 units recalled from 78+ stores across NAM and EMEA.
            </div>
          </div>
        </div>

        {/* Volume-Driven */}
        <div style={{ ...cardStyle, background: "#eff6ff", borderColor: "#93c5fd" }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", marginBottom: 2 }}>
            Volume-Driven / Structural <Pill color="#1e40af" bg="#dbeafe">SCALES WITH SALES</Pill>
          </h3>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#1e40af", marginBottom: 4 }}>\u20ac656k</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#60a5fa", marginBottom: 6 }}>66% of gross overrun \u00b7 Expected at current volumes</div>
          <div style={{ fontSize: 10, lineHeight: 1.5, color: "#1e3a5f" }}>
            <div style={detailLine}><span style={{ opacity: 0.8 }}>B2C returns to WH</span><span style={{ fontWeight: 600 }}>+\u20ac354k</span></div>
            <div style={detailLine}><span style={{ opacity: 0.8 }}>B2C outbound store (Endless Aisle)</span><span style={{ fontWeight: 600 }}>+\u20ac183k</span></div>
            <div style={detailLine}><span style={{ opacity: 0.8 }}>WH outbound handling</span><span style={{ fontWeight: 600 }}>+\u20ac119k</span></div>
            <div style={{ marginTop: 4, fontStyle: "italic", opacity: 0.8 }}>
              Returns volume +23% YoY (69k vs 56k units), but cost per return rose from \u20ac4.37\u2192\u20ac8.57 \u2014 rate increase is the bigger driver. Webstore orders +28% YoY. EA driven by store allocation gap. Budget was set too low vs actual sales trajectory.
            </div>
          </div>
        </div>

        {/* Misclassification */}
        <div style={{ ...cardStyle, background: "#fefce8", borderColor: "#fde68a" }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: "#92400e", marginBottom: 2 }}>
            Misclassification <Pill color="#92400e" bg="#fef3c7">RECLASSIFY</Pill>
          </h3>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#92400e", marginBottom: 4 }}>\u20ac84k</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#b45309", marginBottom: 6 }}>8% of gross overrun \u00b7 Not a real logistics cost</div>
          <div style={{ fontSize: 10, lineHeight: 1.5, color: "#78350f" }}>
            <div style={detailLine}><span style={{ opacity: 0.8 }}>Laguna Mauritius recharges \u2192 COGS</span><span style={{ fontWeight: 600 }}>\u20ac84k</span></div>
            <div style={{ marginTop: 4, fontStyle: "italic", opacity: 0.8 }}>
              Laguna delivers DDP into USA as importer of record. This is production logistics and should sit in COGS, not Category 56. Reclassifying removes \u20ac84k from the logistics overrun.
            </div>
          </div>
        </div>

        {/* To Investigate */}
        <div style={{ ...cardStyle, background: "#fef2f2", borderColor: "#fca5a5" }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: "#991b1b", marginBottom: 2 }}>
            To Investigate <Pill color="#991b1b" bg="#fee2e2">ACTION NEEDED</Pill>
          </h3>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#dc2626", marginBottom: 4 }}>\u20ac173k</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#ef4444", marginBottom: 6 }}>18% of gross overrun \u00b7 Not volume or project-driven</div>
          <div style={{ fontSize: 10, lineHeight: 1.5, color: "#7f1d1d" }}>
            <div style={detailLine}><span style={{ opacity: 0.8 }}>Other logistics (excl. Laguna reclass)</span><span style={{ fontWeight: 600 }}>+\u20ac173k</span></div>
            <div style={{ ...detailLine, paddingLeft: 10, opacity: 0.7 }}><span>\u21b3 Modexpress transport (misallocated GL)</span><span>\u20ac179k</span></div>
            <div style={{ ...detailLine, paddingLeft: 10, opacity: 0.7 }}><span>\u21b3 Modexpress warehousing (misallocated GL)</span><span>\u20ac176k</span></div>
            <div style={{ ...detailLine, paddingLeft: 10, opacity: 0.7 }}><span>\u21b3 Modexpress VAS / Brandart / DHL / OIA</span><span>\u20ac62k</span></div>
            <div style={detailLine}><span style={{ opacity: 0.8 }}>B2B transport var.</span><span style={{ fontWeight: 600 }}>+\u20ac43k</span></div>
            <div style={detailLine}><span style={{ opacity: 0.8 }}>B2B transport fixed</span><span style={{ fontWeight: 600 }}>+\u20ac13k</span></div>
            <div style={{ marginTop: 4, fontStyle: "italic", opacity: 0.8 }}>
              "Other logistics" contains \u20ac355k of Modexpress 3PL invoices needing reallocation to correct GL lines. Once reallocated, genuine unexplained overrun needs root-cause analysis. See Details tab for DWH investigation.
            </div>
          </div>
        </div>
      </div>

      {/* Net Position */}
      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: "14px 16px" }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Net Position After Classification</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div style={{ textAlign: "center", padding: 8, borderRadius: 6, background: "#faf5ff" }}>
            <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3, color: "#64748b" }}>One-off (Trisco)</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#7c3aed", marginTop: 2 }}>\u20ac357k</div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>\u20ac76k in P1+P2 \u00b7 \u20ac281k in P3+P4</div>
          </div>
          <div style={{ textAlign: "center", padding: 8, borderRadius: 6, background: "#eff6ff" }}>
            <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3, color: "#64748b" }}>Structural (volume)</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1e40af", marginTop: 2 }}>\u20ac656k</div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>Scales with sales \u00b7 budget gap</div>
          </div>
          <div style={{ textAlign: "center", padding: 8, borderRadius: 6, background: "#fef2f2" }}>
            <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3, color: "#64748b" }}>Needs action</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#dc2626", marginTop: 2 }}>\u20ac257k</div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>\u20ac84k reclass + \u20ac173k investigate</div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "#64748b" }}>
          Offset by <strong style={{ color: "#16a34a" }}>\u20ac713k underspend</strong> on other lines (B2C outbound from WH, WH returns, WH inbound, customs, WH QC) \u2192 <strong>Net P1+P2 overrun: \u20ac276k</strong> (+3.9% vs budget)
        </div>
      </div>

      {/* DWH Investigation Highlights */}
      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0", padding: "14px 16px", marginTop: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 10 }}>Key Findings from Data Warehouse Analysis</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {/* Returns insight */}
          <div style={{ background: "#fff7ed", borderRadius: 8, padding: "10px 12px", border: "1px solid #fed7aa" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#c2410c", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 }}>\u26a0\ufe0f Returns: Rate Increase Hidden</div>
            <div style={{ fontSize: 10, color: "#7c2d12", lineHeight: 1.5 }}>
              Return <strong>volume</strong> is up +23% YoY (69k vs 56k units) but return <strong>cost</strong> is up +142% (\u20ac589k vs \u20ac243k). Cost per return nearly doubled: <strong>\u20ac4.37 \u2192 \u20ac8.57</strong>. Volume explains only ~\u20ac57k of the \u20ac346k increase \u2014 the remaining \u20ac289k is a rate/mix issue.
            </div>
            <div style={{ fontSize: 9, color: "#9a3412", marginTop: 4, fontWeight: 600 }}>Action: investigate UPS return contract terms and parcel weight mix YoY</div>
          </div>
          {/* Storage insight */}
          <div style={{ background: "#ecfeff", borderRadius: 8, padding: "10px 12px", border: "1px solid #a5f3fc" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#0e7490", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 }}>\u2705 Storage: No Concern</div>
            <div style={{ fontSize: 10, color: "#164e63", lineHeight: 1.5 }}>
              WH inventory is <strong>flat YoY</strong> (~1.88M vs ~1.90M units). Storage cost rose +16% due to Modexpress rate increase, but this was <strong>anticipated in budget</strong>. Storage is actually <strong style={{ color: "#0d9488" }}>\u20ac38k under budget</strong>. No action needed.
            </div>
            <div style={{ fontSize: 9, color: "#0e7490", marginTop: 4 }}>Source: DWH fct__inventory_history (warehouse locations)</div>
          </div>
          {/* Orders insight */}
          <div style={{ background: "#eff6ff", borderRadius: 8, padding: "10px 12px", border: "1px solid #93c5fd" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 }}>\ud83d\udcc8 Webstore Orders: +28% YoY</div>
            <div style={{ fontSize: 10, color: "#1e3a5f", lineHeight: 1.5 }}>
              Webstore order count: <strong>88.5k vs 69.1k</strong> (+28%). This drives outbound handling (+\u20ac119k) and return volume increases. Budget was set on lower volume expectations \u2014 explains most of the structural overrun. Handling cost grew only +27% vs 37% volume increase \u2014 showing <strong>operational leverage</strong>.
            </div>
            <div style={{ fontSize: 9, color: "#1e40af", marginTop: 4 }}>Source: DWH fct__sales_v6 (webstore channel)</div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: "#64748b" }}>
          See the <strong>GL Detail & Investigation</strong> tab for full interactive analysis with expandable DWH panels per GL line
        </div>
      </div>

      <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 12, lineHeight: 1.4 }}>
        P1+P2 2026. All figures EUR. "Gross overrun" = sum of lines individually over budget (\u20ac989k). Lines under budget net off to produce \u20ac276k net overrun. Trisco total (\u20ac357k) spans P1\u2013P4; only \u20ac76k hits P1+P2 budget variance. CN local entity (~\u20ac307k) included in totals. Sources: D365 GL actuals, D365 budget, DWH fct__inventory_history, DWH fct__sales_returns, DWH fct__sales_v6, DWH fct__inventory_transfers.
      </div>
    </div>
  );
}

// ======================================================================
// DETAILS TAB COMPONENT
// ======================================================================
function DetailsTab({ period, setPeriod }) {
  const [expanded, setExpanded] = useState(null);
  const [showSavingNote, setShowSavingNote] = useState(null);

  // Account metadata for live data mapping
  const accountMeta = {
    "5213102": { name: "B2C outbound from WH" },
    "5213111": { name: "B2B transport var." },
    "5213104": { name: "WH storage", flag: "storage" },
    "5213110": { name: "WH outbound handling", note: "Volume-driven: orders up 37% YoY, cost up 27%.", saving: 36000, savingAnn: 72000, savingNote: "Est: 5% handling rate reduction. Volume grew 37% YoY but cost only 27% \u2014 negotiate scale discount." },
    "5213105": { name: "B2C returns to WH", flag: "returns", saving: 153000, savingAnn: 306000, savingNote: "Est: (a) 15% return carrier rate nego = \u20ac88k. (b) 5pp return rate reduction = \u20ac65k." },
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

  const availablePeriods = [{ id: "combined", label: "P1+P2" }, { id: "p1", label: "P1" }, { id: "p2", label: "P2" }];
  const allPeriodIds = ["p1", "p2"];

  const g = (r, field) => {
    if (period === "combined") return allPeriodIds.reduce((sum, pid) => sum + (r[`${pid}${field}`] || 0), 0);
    return r[`${period}${field}`] || 0;
  };

  const cnTotal = period === "combined"
    ? allPeriodIds.reduce((sum, pid) => sum + (cnLocal[pid.replace("p","p") + "a26"] || 0), 0)
    : (cnLocal[period + "a26"] || 0);

  const cnTotalCalc = period === "combined" ? cnLocal.p1a26 + cnLocal.p2a26 : (period === "p1" ? cnLocal.p1a26 : cnLocal.p2a26);
  const totalActual = glData.reduce((s, r) => s + g(r, "a26"), 0) + cnTotalCalc;
  const totalBudget = glData.reduce((s, r) => s + g(r, "b26"), 0);
  const totalLy = glData.reduce((s, r) => s + g(r, "a25"), 0);

  const getRevField = (field) => {
    if (period === "combined") return allPeriodIds.reduce((sum, pid) => sum + (revenue[`${pid}${field}`] || 0), 0);
    return revenue[`${period}${field}`] || 0;
  };
  const rev = getRevField("a26");
  const revBudget = getRevField("b26");
  const revLy = getRevField("a25");
  const totalSaving = glData.reduce((s, r) => s + (r.saving || 0), 0);

  const sorted = [...glData].map(r => {
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

  // ===== B2C STORE OUTBOUND PANEL (Endless Aisle) =====
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
        <strong>Conclusion: allocation gap, not customer behaviour.</strong> 78% of Endless Aisle orders originate from the warehouse and ship to the store for customer pickup. The store didn't have the right product in stock \u2014 the WH is bridging the demand gap via EA at \u20ac3.29/unit. Root cause: stores aren't allocated the right inventory. Fixing allocation reduces EA volume and the \u20ac374k transport cost.
      </div>
      {renderDecomp(storeBreakdown, Math.max(...storeBreakdown.map(x => Math.abs(period === "p1" ? x.p1 : period === "p2" ? x.p2 : x.p1 + x.p2))))}
    </div>
  );

  // ===== TRISCO QC PANEL =====
  const renderQcPanel = () => (
    <div style={{ padding: "8px 0 4px 0" }}>
      <div style={{ fontSize: 10, color: "#64748b", marginBottom: 6 }}>Full Trisco QC project cost chain \u2014 store pullback transfers + UPS transport + Modexpress WH QC</div>
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
      <div style={{ fontSize: 10, color: "#991b1b", padding: "6px 8px", background: "#fef2f2", borderRadius: 5, lineHeight: 1.5, marginTop: 6 }}>
        <strong>Full Trisco QC cost chain (P1\u2013P4 2026):</strong> 12,823 units pulled back from 78 stores. UPS transport: \u20ac293k total. Modexpress QC: \u20ac64k. <strong>Total project cost: \u20ac357k.</strong> Plus \u20ac1.32M inventory tied up in QC pipeline. GL doesn't reference "Trisco" \u2014 UPS books to HQ Transport, Modexpress QC references "SS QC PROJECT" only.
      </div>
      <div style={{ fontSize: 9, color: "#64748b", marginTop: 3 }}>* P4 partial through mid-April 2026. Sources: fct__inventory_transfers, fct__ledger_transactions_d365 GL 5213115 + 5213114, SharePoint Store Knowledgebase.</div>
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
        <strong>Connection:</strong> UPS on HQ Transport spiked from \u20ac33k (P1) \u2192 \u20ac100k (P2) \u2192 \u20ac124k (P3). The P2 spike aligns exactly with the 8,636-unit Trisco pullback wave (W5/W6 announcement hit 31 Jan). Incremental ~\u20ac67k in P2 and ~\u20ac90k in P3 over P1 baseline are the consolidation UPS shipments from 78 stores.
      </div>
    </div>
  );

  // ===== WH STORAGE INVESTIGATION PANEL (NEW) =====
  const renderStoragePanel = () => {
    const ly25 = 308766 + 325415; // P1+P2 2025
    const act26 = 480081 + 256079;  // P1+P2 2026
    const bgt26 = 412521 + 361897;  // P1+P2 2026 budget
    const avgInv25 = (1918675 + 1895506 + 1894112) / 3;
    const avgInv26 = (1890807 + 1839652 + 1880164) / 3;
    const costPerUnit25 = ly25 / avgInv25;
    const costPerUnit26 = act26 / avgInv26;

    return (
      <div style={{ padding: "8px 0 4px 0" }}>
        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 8 }}>Warehouse inventory position vs storage costs \u2014 sourced from DWH fct__inventory_history (warehouse locations only)</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div style={{ background: "#f0f9ff", borderRadius: 6, padding: "8px 10px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>WH Inventory (avg units, period-end snapshots)</div>
            <MiniBar label="2025 Q1" value={Math.round(avgInv25)} max={2000000} color="#93c5fd" />
            <MiniBar label="2026 Q1" value={Math.round(avgInv26)} max={2000000} color="#3b82f6" />
            <div style={{ fontSize: 10, fontWeight: 600, color: "#1e40af", marginTop: 4 }}>
              {fmtPct((avgInv26 - avgInv25) / avgInv25)} YoY \u2014 essentially flat
            </div>
          </div>
          <div style={{ background: "#faf5ff", borderRadius: 6, padding: "8px 10px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Storage cost per unit (P1+P2 annualised)</div>
            <MiniBar label="2025" value={`\u20ac${costPerUnit25.toFixed(2)}`} max={1} color="#c4b5fd" />
            <MiniBar label="2026" value={`\u20ac${costPerUnit26.toFixed(2)}`} max={1} color="#8b5cf6" />
            <div style={{ fontSize: 10, fontWeight: 600, color: "#7c3aed", marginTop: 4 }}>
              +{((costPerUnit26 - costPerUnit25) / costPerUnit25 * 100).toFixed(0)}% rate increase on flat volume
            </div>
          </div>
        </div>

        <div style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>WH inventory trend (total units, end-of-period snapshots)</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 50, marginBottom: 4 }}>
          {whInventoryTrend.map((d, i) => {
            const h = ((d.units - 1800000) / 150000) * 50;
            const is26 = d.date.includes("26");
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "80%", height: Math.max(h, 2), background: is26 ? "#3b82f6" : "#cbd5e1", borderRadius: "2px 2px 0 0" }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {whInventoryTrend.map((d, i) => (
            <div key={i} style={{ flex: 1, fontSize: 8, textAlign: "center", color: "#94a3b8" }}>{d.date}</div>
          ))}
        </div>

        <div style={{ fontSize: 10, color: "#166534", padding: "6px 8px", background: "#f0fdf4", borderRadius: 5, lineHeight: 1.5, marginTop: 8 }}>
          <strong>Conclusion: rate increase, not volume-driven.</strong> WH inventory is flat YoY (~1.87M vs ~1.90M units). Storage cost rose +16% (\u20ac634k \u2192 \u20ac736k), driven by a Modexpress storage rate increase. However, this was <strong>anticipated in the budget</strong> (\u20ac774k) \u2014 storage is actually <strong style={{ color: "#15803d" }}>\u20ac38k under budget</strong>. No further action needed.
        </div>
      </div>
    );
  };

  // ===== B2C RETURNS INVESTIGATION PANEL (NEW) =====
  const renderReturnsPanel = () => {
    const ret25 = returnsVolumeData.filter(r => r.year === 2025);
    const ret26 = returnsVolumeData.filter(r => r.year === 2026);
    const totalRet25 = ret25.reduce((s, r) => s + r.units, 0);
    const totalRet26 = ret26.reduce((s, r) => s + r.units, 0);
    const cost25 = 130718 + 112392; // LY GL
    const cost26 = 208295 + 380519; // 2026 GL
    const cpu25 = cost25 / totalRet25;
    const cpu26 = cost26 / totalRet26;
    const budget26 = 121972 + 112404;

    const ord25 = webstoreOrderData.filter(r => r.year === 2025);
    const ord26 = webstoreOrderData.filter(r => r.year === 2026);
    const totalOrd25 = ord25.reduce((s, r) => s + r.orders, 0);
    const totalOrd26 = ord26.reduce((s, r) => s + r.orders, 0);

    return (
      <div style={{ padding: "8px 0 4px 0" }}>
        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 8 }}>Returns volume from DWH fct__sales_returns + webstore orders from fct__sales_v6 \u2014 correlated with GL 5213105 costs</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
          <div style={{ background: "#fef2f2", borderRadius: 6, padding: "8px 10px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Return volume (P1+P2)</div>
            <MiniBar label="2025" value={totalRet25} max={75000} color="#fca5a5" />
            <MiniBar label="2026" value={totalRet26} max={75000} color="#ef4444" />
            <div style={{ fontSize: 10, fontWeight: 600, color: "#dc2626", marginTop: 2 }}>+{((totalRet26 - totalRet25) / totalRet25 * 100).toFixed(0)}% YoY ({fmtN(totalRet26 - totalRet25)} more units)</div>
          </div>
          <div style={{ background: "#fff7ed", borderRadius: 6, padding: "8px 10px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Cost per return</div>
            <MiniBar label="2025" value={`\u20ac${cpu25.toFixed(2)}`} max={1} color="#fdba74" />
            <MiniBar label="2026" value={`\u20ac${cpu26.toFixed(2)}`} max={1} color="#f97316" />
            <div style={{ fontSize: 10, fontWeight: 600, color: "#ea580c", marginTop: 2 }}>+{((cpu26 - cpu25) / cpu25 * 100).toFixed(0)}% \u2014 cost per return nearly doubled</div>
          </div>
          <div style={{ background: "#eff6ff", borderRadius: 6, padding: "8px 10px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 4 }}>Webstore orders (P1+P2)</div>
            <MiniBar label="2025" value={totalOrd25} max={100000} color="#93c5fd" />
            <MiniBar label="2026" value={totalOrd26} max={100000} color="#3b82f6" />
            <div style={{ fontSize: 10, fontWeight: 600, color: "#1e40af", marginTop: 2 }}>+{((totalOrd26 - totalOrd25) / totalOrd25 * 100).toFixed(0)}% YoY order count</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          {ret26.map((r, i) => {
            const ly = ret25[i];
            return (
              <div key={i} style={{ background: "#f8fafc", borderRadius: 5, padding: "6px 8px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#334155" }}>P{r.period}</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>
                  2026: {r.units.toLocaleString()} returns \u00b7 2025: {ly.units.toLocaleString()} returns
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#dc2626" }}>+{((r.units - ly.units) / ly.units * 100).toFixed(0)}% YoY</div>
              </div>
            );
          })}
        </div>

        <div style={{ fontSize: 10, color: "#991b1b", padding: "6px 8px", background: "#fef2f2", borderRadius: 5, lineHeight: 1.5 }}>
          <strong>Key finding: this is NOT purely volume-driven.</strong> Return volume is +23% YoY (69k vs 56k units), explaining ~\u20ac57k of the \u20ac346k YoY cost increase. The remaining ~\u20ac289k is a cost-per-return increase (\u20ac4.37\u2192\u20ac8.57 per unit, +96%). Possible causes: UPS rate increase, heavier/more expensive items being returned, or change in return routing. The budget (\u20ac234k) was set far below both LY and the run rate \u2014 needs rebasing. <strong>Recommended:</strong> investigate UPS contract terms for returns and compare parcel weight/size mix YoY.
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 2, marginBottom: 12, background: "#e2e8f0", borderRadius: 7, padding: 2, width: "fit-content" }}>
        {availablePeriods.map(t => (
          <button key={t.id} onClick={() => setPeriod(t.id)} style={{
            padding: "5px 12px", borderRadius: 5, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer",
            background: period === t.id ? "#fff" : "transparent", color: period === t.id? "#0f172a" : "#64748b",
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
          const hasDetail = ["decompose","ea","qc","hq","storage","returns"].includes(r.flag);
          const varBColor = r.varB > 10000 ? "#dc2626" : r.varB < -10000 ? "#16a34a" : "#64748b";
          const varBBg = r.varB > 10000 ? "#fef2f2" : r.varB < -10000 ? "#f0fdf4" : "transparent";
          const varLyColor = r.varLy > 10000 ? "#dc2626" : r.varLy < -10000 ? "#16a34a" : "#64748b";
          const bgtDot = r.budget > 0 ? (r.varB > 10000 ? "\ud83d\udd34" : r.varB ? "\ud83d\udfe2" : "\u26aa") : "";

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
                <div style={{ fontSize: 9, color: hasDetail ? "#3b82f6" : "#e2e8f0" }}>{hasDetail ? (isExpanded? "\u25bc" : "\u25b6") : "\u00b7"}</div>
                <div style={{ fontWeight: 600, color: "#334155", display: "flex", alignItems: "center", gap: 3, fontSize: 11 }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                  {r.flag === "decompose" && !isExpanded && <Pill color="#3b82f6" bg="#eff6ff">+</Pill>}
                  {r.flag === "ea" && !isExpanded && <Pill color="#b45309" bg="#fffbeb">EA</Pill>}
                  {r.flag === "qc" && !isExpanded && <Pill color="#7c3aed" bg="#f5f3ff">QC</Pill>}
                  {r.flag === "hq" && !isExpanded && <Pill color="#dc2626" bg="#fef2f2">Trisco</Pill>}
                  {r.flag === "storage" && !isExpanded && <Pill color="#0891b2" bg="#ecfeff">DWH</Pill>}
                  {r.flag === "returns" && !isExpanded && <Pill color="#ea580c" bg="#fff7ed">DWH</Pill>}
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

              {/* Expanded investigation panels */}
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
              {isExpanded && r.name === "WH storage" && (
                <div style={{ padding: "6px 12px 8px 34px", background: "#ecfeff", borderBottom: "1px solid #a5f3fc" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0e7490", marginBottom: 1 }}>WH Storage Investigation \u2014 Inventory Position vs Cost (DWH)</div>
                  {renderStoragePanel()}
                </div>
              )}
              {isExpanded && r.name === "B2C returns to WH" && (
                <div style={{ padding: "6px 12px 8px 34px", background: "#fff7ed", borderBottom: "1px solid #fed7aa" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#c2410c", marginBottom: 1 }}>B2C Returns Investigation \u2014 Volume vs Rate Analysis (DWH)</div>
                  {renderReturnsPanel()}
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
          <div style={{ textAlign: "center", fontSize: 9 }}>{"\ud83d\udd34"}</div>
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
            <br/><strong>3. Trisco QC costs across two GL lines:</strong> Transport on 5213115, reconditioning on 5213114. Neither references "Trisco". Total \u20ac357k.
          </div>
        </div>
        <div style={{ background: "#f0fdf4", borderRadius: 7, padding: "9px 11px", border: "1px solid #86efac" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", marginBottom: 3 }}>Saving Potential (data-backed estimates)</div>
          <div style={{ fontSize: 10, color: "#166534", lineHeight: 1.5 }}>
            <strong>Returns transport (\u20ac153k):</strong> 15% UPS rate nego + 5pp return rate reduction.
            <br/><strong>Laguna reclass (\u20ac84k):</strong> P&L reclassification to COGS.
            <br/><strong>Store outbound (\u20ac56k):</strong> 15% store UPS rate nego. Root cause: fix allocation.
            <br/><strong>WH handling (\u20ac36k):</strong> 5% rate reduction on volume scale.
            <br/><strong style={{ color: "#0f172a" }}>Total: \u20ac329k P1+P2 \u00b7 ~\u20ac574k annualised</strong>
            <br/><span style={{ fontSize: 9, color: "#64748b" }}>Click \u24d8 for methodology. Trisco QC \u20ac357k cost is incremental and not in budget.</span>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 9, color: "#b0b8c4", lineHeight: 1.4 }}>
        Sources: D365 GL \u00b7 D365 budget \u00b7 Exact GL LY \u00b7 DWH fct__inventory_transfers (Trisco) \u00b7 DWH fct__inventory_history (storage analysis) \u00b7 DWH fct__sales_returns (return volumes) \u00b7 DWH fct__sales_v6 (order volumes) \u00b7 D365 GL 5213115 UPS charges \u00b7 SharePoint W5/W6/W7/W13 \u00b7 CN local (~\u20ac307k) in totals \u00b7 \ud83d\udd34 over budget \ud83d\udfe2 under budget
      </div>
    </div>
  );
}

// ======================================================================
// MAIN DASHBOARD WITH TABS
// ======================================================================
export default function LogisticsDashboard() {
  const [activeTab, setActiveTab] = useState("summary");
  const [period, setPeriod] = useState("combined");
  const { liveData, lastUpdated, error: dataError } = useLiveData();
  const isLive = !!liveData;

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: "#f8fafc", minHeight: "100vh", padding: "18px 22px", maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
        <h1 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0 }}>Logistics Cost Analysis \u2014 2026</h1>
        <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: isLive ? "#dcfce7" : "#fef3c7", color: isLive ? "#166534" : "#92400e" }}>
          {isLive ? `LIVE \u00b7 ${new Date(lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : "OFFLINE DATA"}
        </span>
      </div>
      <p style={{ fontSize: 10, color: "#94a3b8", margin: "0 0 12px 0" }}>
        D365 GL actuals \u00b7 D365 budget \u00b7 DWH inventory \u00b7 DWH sales returns \u00b7 SharePoint store comms
      </p>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "2px solid #e2e8f0" }}>
        {[
          { id: "summary", label: "Overrun Summary", icon: "\ud83d\udcca" },
          { id: "details", label: "GL Detail & Investigation", icon: "\ud83d\udd0d" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "8px 18px", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer",
            background: "transparent",
            color: activeTab === tab.id ? "#1e40af" : "#94a3b8",
            borderBottom: activeTab === tab.id ? "2px solid #1e40af" : "2px solid transparent",
            marginBottom: -2,
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "summary" && <SummaryTab />}
      {activeTab === "details" && <DetailsTab period={period} setPeriod={setPeriod} />}
    </div>
  );
}
