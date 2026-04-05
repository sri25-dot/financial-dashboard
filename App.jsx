import { useState, useContext, createContext, useReducer, useEffect, useMemo, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
const CATEGORIES = ["Food", "Travel", "Utilities", "Shopping", "Health", "Entertainment", "Rent", "Salary", "Freelance", "Other"];
const CATEGORY_COLORS = {
  Food: "#e07b54", Travel: "#5b9bd5", Utilities: "#6ab187", Shopping: "#f0a500",
  Health: "#c35b9b", Entertainment: "#7c5cbf", Rent: "#e05555", Salary: "#2ecc71",
  Freelance: "#1abc9c", Other: "#95a5a6"
};

function genId() { return Math.random().toString(36).slice(2, 10); }

const SEED_TRANSACTIONS = [
  { id: genId(), title: "Monthly Rent", amount: 15000, category: "Rent", date: "2025-03-01" },
  { id: genId(), title: "Grocery Run", amount: 2400, category: "Food", date: "2025-03-05" },
  { id: genId(), title: "Flight to Mumbai", amount: 5800, category: "Travel", date: "2025-03-08" },
  { id: genId(), title: "Electricity Bill", amount: 1200, category: "Utilities", date: "2025-03-10" },
  { id: genId(), title: "Pharmacy", amount: 650, category: "Health", date: "2025-03-12" },
  { id: genId(), title: "Netflix", amount: 649, category: "Entertainment", date: "2025-03-14" },
  { id: genId(), title: "Weekend Dining", amount: 1800, category: "Food", date: "2025-03-18" },
  { id: genId(), title: "Freelance Project", amount: 22000, category: "Freelance", date: "2025-03-20" },
  { id: genId(), title: "Monthly Salary", amount: 85000, category: "Salary", date: "2025-03-25" },
  { id: genId(), title: "Monthly Rent", amount: 15000, category: "Rent", date: "2025-02-01" },
  { id: genId(), title: "Supermarket", amount: 3100, category: "Food", date: "2025-02-06" },
  { id: genId(), title: "Uber Rides", amount: 1400, category: "Travel", date: "2025-02-09" },
  { id: genId(), title: "Water Bill", amount: 400, category: "Utilities", date: "2025-02-11" },
  { id: genId(), title: "Gym Membership", amount: 1500, category: "Health", date: "2025-02-13" },
  { id: genId(), title: "Amazon Shopping", amount: 4200, category: "Shopping", date: "2025-02-15" },
  { id: genId(), title: "Monthly Salary", amount: 85000, category: "Salary", date: "2025-02-25" },
];

// ─── Context ─────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "ADD_TX": return { ...state, transactions: [action.payload, ...state.transactions] };
    case "EDIT_TX": return { ...state, transactions: state.transactions.map(t => t.id === action.payload.id ? action.payload : t) };
    case "DELETE_TX": return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };
    case "SET_ROLE": return { ...state, role: action.payload };
    case "SET_FILTER_CAT": return { ...state, filterCategory: action.payload };
    case "SET_FILTER_DATE": return { ...state, filterDate: action.payload };
    case "TOGGLE_DARK": return { ...state, dark: !state.dark };
    default: return state;
  }
}

function getInitialState() {
  try {
    const saved = localStorage.getItem("fin_dashboard");
    if (saved) return JSON.parse(saved);
  } catch {}
  return { transactions: SEED_TRANSACTIONS, role: "Admin", filterCategory: "All", filterDate: "", dark: false };
}

function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, getInitialState);
  useEffect(() => { localStorage.setItem("fin_dashboard", JSON.stringify(state)); }, [state]);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

function useApp() { return useContext(AppContext); }

// ─── Utilities ───────────────────────────────────────────────────────────────
function fmt(n) { return "₹" + n.toLocaleString("en-IN"); }
function fmtDate(d) { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const paths = {
    plus: "M12 5v14M5 12h14",
    edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
    trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
    sun: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z",
    moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
    download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
    filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
    trend: "M23 6l-9.5 9.5-5-5L1 18",
    alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
    x: "M18 6L6 18M6 6l12 12",
    eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
    chart: "M18 20V10M12 20V4M6 20v-6",
    wallet: "M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", padding: "1rem" }}>
      <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: "1.5rem", width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex" }}><Icon name="x" size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Transaction Form ─────────────────────────────────────────────────────────
function TxForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { title: "", amount: "", category: "Food", date: new Date().toISOString().split("T")[0] });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = "Enter a valid amount";
    if (!form.date) e.date = "Date is required";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ ...form, amount: Number(form.amount), id: form.id || genId() });
  }

  const inputStyle = (err) => ({
    width: "100%", padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${err ? "var(--danger)" : "var(--border)"}`,
    background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 14, boxSizing: "border-box",
    outline: "none", transition: "border-color .15s",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Title</label>
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Grocery Run" style={{ ...inputStyle(errors.title), marginTop: 4 }} />
        {errors.title && <span style={{ fontSize: 12, color: "var(--danger)" }}>{errors.title}</span>}
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Amount (₹)</label>
        <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" style={{ ...inputStyle(errors.amount), marginTop: 4 }} />
        {errors.amount && <span style={{ fontSize: 12, color: "var(--danger)" }}>{errors.amount}</span>}
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</label>
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ ...inputStyle(false), marginTop: 4 }}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</label>
        <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={{ ...inputStyle(errors.date), marginTop: 4 }} />
        {errors.date && <span style={{ fontSize: 12, color: "var(--danger)" }}>{errors.date}</span>}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1.5px solid var(--border)", background: "transparent", color: "var(--text-primary)", cursor: "pointer", fontWeight: 500 }}>Cancel</button>
        <button onClick={handleSubmit} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
          {initial ? "Save Changes" : "Add Transaction"}
        </button>
      </div>
    </div>
  );
}

// ─── Category Badge ───────────────────────────────────────────────────────────
function CategoryBadge({ cat }) {
  const color = CATEGORY_COLORS[cat] || "#888";
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: color + "22", color, letterSpacing: "0.03em" }}>{cat}</span>
  );
}

// ─── Transactions Table ───────────────────────────────────────────────────────
function TransactionsTable({ transactions, onEdit, onDelete, isAdmin }) {
  if (!transactions.length) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>💸</div>
        <p style={{ fontSize: 16, fontWeight: 500 }}>No transactions found</p>
        <p style={{ fontSize: 13, marginTop: 4 }}>Try adjusting your filters or add a new transaction</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1.5px solid var(--border)" }}>
            {["Title", "Category", "Date", "Amount", ...(isAdmin ? ["Actions"] : [])].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, i) => (
            <tr key={tx.id} style={{ borderBottom: "1px solid var(--border-light)", background: i % 2 === 0 ? "transparent" : "var(--bg-stripe)", transition: "background .1s" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "var(--bg-stripe)"}
            >
              <td style={{ padding: "12px 14px", fontWeight: 500, color: "var(--text-primary)" }}>{tx.title}</td>
              <td style={{ padding: "12px 14px" }}><CategoryBadge cat={tx.category} /></td>
              <td style={{ padding: "12px 14px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{fmtDate(tx.date)}</td>
              <td style={{ padding: "12px 14px", fontWeight: 700, color: ["Salary","Freelance"].includes(tx.category) ? "var(--success)" : "var(--text-primary)", whiteSpace: "nowrap" }}>
                {["Salary","Freelance"].includes(tx.category) ? "+" : ""}{fmt(tx.amount)}
              </td>
              {isAdmin && (
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => onEdit(tx)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--accent)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 500 }}>
                      <Icon name="edit" size={12} /> Edit
                    </button>
                    <button onClick={() => onDelete(tx.id)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "transparent", color: "var(--danger)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 500 }}>
                      <Icon name="trash" size={12} /> Del
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Insights ─────────────────────────────────────────────────────────────────
function InsightCard({ icon, label, value, sub, color = "var(--accent)" }) {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color, marginBottom: 4 }}>
        <Icon name={icon} size={16} />
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{sub}</div>}
    </div>
  );
}

function BarChart({ data, title }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map(d => (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 90, fontSize: 12, color: "var(--text-muted)", textAlign: "right", flexShrink: 0 }}>{d.label}</div>
            <div style={{ flex: 1, background: "var(--bg-stripe)", borderRadius: 4, overflow: "hidden", height: 22 }}>
              <div style={{ width: `${(d.value / max) * 100}%`, height: "100%", background: d.color || "var(--accent)", borderRadius: 4, transition: "width 0.6s ease", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6, boxSizing: "border-box" }}>
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", width: 80, flexShrink: 0 }}>{fmt(d.value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PieChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let angle = -90;
  const cx = 80, cy = 80, r = 60;
  const slices = data.map(d => {
    const pct = d.value / total;
    const a1 = angle, a2 = angle + pct * 360;
    angle = a2;
    const r2d = Math.PI / 180;
    const x1 = cx + r * Math.cos(a1 * r2d), y1 = cy + r * Math.sin(a1 * r2d);
    const x2 = cx + r * Math.cos(a2 * r2d), y2 = cy + r * Math.sin(a2 * r2d);
    const large = pct > 0.5 ? 1 : 0;
    return { ...d, pct, path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z` };
  });
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "1rem" }}>Spending by category</div>
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
        <svg width={160} height={160} viewBox="0 0 160 160">
          {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke="var(--bg-card)" strokeWidth={2} />)}
          <circle cx={cx} cy={cy} r={32} fill="var(--bg-card)" />
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize={10} fill="var(--text-muted)">Total</text>
          <text x={cx} y={cy + 8} textAnchor="middle" fontSize={9} fill="var(--text-primary)" fontWeight="700">{fmt(total)}</text>
        </svg>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          {slices.slice(0, 6).map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
              <span style={{ flex: 1, color: "var(--text-muted)" }}>{s.label}</span>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{(s.pct * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightsSection({ transactions }) {
  const now = new Date();
  const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

  // Use March 2025 and Feb 2025 as "current" and "prev" since seed data is there
  const effectiveCur = "2025-03";
  const effectivePrev = "2025-02";

  const expense = (month) => transactions.filter(t => t.date.startsWith(month) && !["Salary","Freelance"].includes(t.category));
  const curExpenses = expense(effectiveCur);
  const prevExpenses = expense(effectivePrev);
  const curTotal = curExpenses.reduce((s, t) => s + t.amount, 0);
  const prevTotal = prevExpenses.reduce((s, t) => s + t.amount, 0);
  const diff = curTotal - prevTotal;
  const pctChange = prevTotal ? ((diff / prevTotal) * 100).toFixed(1) : 0;

  const byCategory = {};
  curExpenses.forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; });
  const topCat = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  const allExpenses = transactions.filter(t => !["Salary","Freelance"].includes(t.category));
  const allByCategory = {};
  allExpenses.forEach(t => { allByCategory[t.category] = (allByCategory[t.category] || 0) + t.amount; });
  const pieData = Object.entries(allByCategory).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => ({ label: k, value: v, color: CATEGORY_COLORS[k] || "#888" }));
  const barData = topCat.slice(0, 5).map(([k, v]) => ({ label: k, value: v, color: CATEGORY_COLORS[k] || "#888" }));

  const income = transactions.filter(t => ["Salary","Freelance"].includes(t.category));
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalSpend = allExpenses.reduce((s, t) => s + t.amount, 0);
  const savings = totalIncome - totalSpend;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <InsightCard icon="wallet" label="Mar spending" value={fmt(curTotal)} sub={`${diff >= 0 ? "+" : ""}${pctChange}% vs Feb`} color={diff > 0 ? "var(--danger)" : "var(--success)"} />
        <InsightCard icon="chart" label="Top category" value={topCat[0]?.[0] || "—"} sub={topCat[0] ? fmt(topCat[0][1]) + " spent" : ""} color={CATEGORY_COLORS[topCat[0]?.[0]] || "var(--accent)"} />
        <InsightCard icon="trend" label="Total income" value={fmt(totalIncome)} sub="Salary + Freelance" color="var(--success)" />
        <InsightCard icon="alert" label="Net savings" value={fmt(Math.max(0, savings))} sub={savings < 0 ? "⚠ Overspent!" : "After all expenses"} color={savings < 0 ? "var(--danger)" : "var(--success)"} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
        {barData.length > 0 && <BarChart data={barData} title="Top expense categories (Mar)" />}
        {pieData.length > 0 && <PieChart data={pieData} />}
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ dark, onToggleDark, role, onRoleChange }) {
  return (
    <header style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "var(--bg-header)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <Icon name="wallet" size={16} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)", lineHeight: 1.2 }}>FinTrack</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Financial Dashboard</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 12px" }}>
          {role === "Admin" ? <Icon name="edit" size={14} /> : <Icon name="eye" size={14} />}
          <select value={role} onChange={e => onRoleChange(e.target.value)}
            style={{ border: "none", background: "transparent", color: "var(--text-primary)", fontSize: 13, fontWeight: 600, cursor: "pointer", outline: "none" }}>
            <option value="Admin">Admin</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>
        <button onClick={onToggleDark} style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-card)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-primary)" }}>
          <Icon name={dark ? "sun" : "moon"} size={16} />
        </button>
      </div>
    </header>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function Dashboard() {
  const { state, dispatch } = useApp();
  const { transactions, role, filterCategory, filterDate, dark } = state;
  const isAdmin = role === "Admin";
  const [tab, setTab] = useState("transactions");
  const [addOpen, setAddOpen] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (filterCategory !== "All" && t.category !== filterCategory) return false;
      if (filterDate && !t.date.startsWith(filterDate)) return false;
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filterCategory, filterDate]);

  function exportCSV() {
    const rows = [["Title","Amount","Category","Date"], ...filtered.map(t => [t.title, t.amount, t.category, t.date])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "transactions.csv";
    a.click();
  }

  const tabs = [
    { id: "transactions", label: "Transactions", icon: "chart" },
    { id: "insights", label: "Insights", icon: "trend" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", color: "var(--text-primary)", fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
      <Header dark={dark} onToggleDark={() => dispatch({ type: "TOGGLE_DARK" })} role={role} onRoleChange={v => dispatch({ type: "SET_ROLE", payload: v })} />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 1rem" }}>

        {/* Role Banner */}
        {!isAdmin && (
          <div style={{ background: "var(--info-bg)", border: "1px solid var(--info-border)", borderRadius: 10, padding: "10px 16px", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 10, color: "var(--info-text)" }}>
            <Icon name="lock" size={14} />
            <span style={{ fontSize: 13 }}>You are in <strong>Viewer mode</strong>. Switch to Admin to add or edit transactions.</span>
          </div>
        )}

        {/* Tab Nav */}
        <div style={{ display: "flex", gap: 4, marginBottom: "1.5rem", borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: "8px 18px", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6, borderBottom: `2px solid ${tab === t.id ? "var(--accent)" : "transparent"}`, color: tab === t.id ? "var(--accent)" : "var(--text-muted)", marginBottom: -1, transition: "color .15s" }}>
              <Icon name={t.icon} size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Transactions Tab */}
        {tab === "transactions" && (
          <div>
            {/* Controls */}
            <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}>
                <Icon name="filter" size={13} />
                <select value={filterCategory} onChange={e => dispatch({ type: "SET_FILTER_CAT", payload: e.target.value })}
                  style={{ border: "none", background: "transparent", color: "var(--text-primary)", fontSize: 13, cursor: "pointer", outline: "none" }}>
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <input type="month" value={filterDate} onChange={e => dispatch({ type: "SET_FILTER_DATE", payload: e.target.value })}
                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: 13, outline: "none" }} />
              {filterDate && <button onClick={() => dispatch({ type: "SET_FILTER_DATE", payload: "" })} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}>Clear</button>}
              <div style={{ flex: 1 }} />
              <button onClick={exportCSV} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500 }}>
                <Icon name="download" size={13} /> Export CSV
              </button>
              {isAdmin && (
                <button onClick={() => setAddOpen(true)} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}>
                  <Icon name="plus" size={14} /> Add Transaction
                </button>
              )}
            </div>

            {/* Summary Strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: "1.25rem" }}>
              {[
                { label: "Showing", val: filtered.length + " txns" },
                { label: "Total", val: fmt(filtered.reduce((s, t) => s + t.amount, 0)) },
                { label: "Income", val: fmt(filtered.filter(t => ["Salary","Freelance"].includes(t.category)).reduce((s, t) => s + t.amount, 0)) },
                { label: "Expenses", val: fmt(filtered.filter(t => !["Salary","Freelance"].includes(t.category)).reduce((s, t) => s + t.amount, 0)) },
              ].map(s => (
                <div key={s.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2, color: "var(--text-primary)" }}>{s.val}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <TransactionsTable transactions={filtered} isAdmin={isAdmin} onEdit={tx => setEditTx(tx)} onDelete={id => setDeleteConfirm(id)} />
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {tab === "insights" && <InsightsSection transactions={transactions} />}
      </main>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Transaction">
        <TxForm onSave={tx => { dispatch({ type: "ADD_TX", payload: tx }); setAddOpen(false); }} onCancel={() => setAddOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editTx} onClose={() => setEditTx(null)} title="Edit Transaction">
        <TxForm initial={editTx} onSave={tx => { dispatch({ type: "EDIT_TX", payload: tx }); setEditTx(null); }} onCancel={() => setEditTx(null)} />
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Transaction">
        <p style={{ color: "var(--text-muted)", marginTop: 0 }}>Are you sure you want to delete this transaction? This action cannot be undone.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-primary)", cursor: "pointer", fontWeight: 500 }}>Cancel</button>
          <button onClick={() => { dispatch({ type: "DELETE_TX", payload: deleteConfirm }); setDeleteConfirm(null); }}
            style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "var(--danger)", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ─── CSS Variables (Light / Dark) ─────────────────────────────────────────────
function ThemeInjector({ dark }) {
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.style.setProperty("--bg-page", "#0f1117");
      root.style.setProperty("--bg-card", "#1a1d27");
      root.style.setProperty("--bg-header", "rgba(15,17,23,0.92)");
      root.style.setProperty("--bg-stripe", "#1e2130");
      root.style.setProperty("--bg-hover", "#252840");
      root.style.setProperty("--bg-input", "#1a1d27");
      root.style.setProperty("--text-primary", "#f0f2f8");
      root.style.setProperty("--text-muted", "#7e8499");
      root.style.setProperty("--border", "#2a2e3f");
      root.style.setProperty("--border-light", "#22253a");
      root.style.setProperty("--accent", "#5b7fff");
      root.style.setProperty("--success", "#4ade80");
      root.style.setProperty("--danger", "#f87171");
      root.style.setProperty("--info-bg", "#1a2340");
      root.style.setProperty("--info-border", "#2a3660");
      root.style.setProperty("--info-text", "#7ba7ef");
    } else {
      root.style.setProperty("--bg-page", "#f4f5f9");
      root.style.setProperty("--bg-card", "#ffffff");
      root.style.setProperty("--bg-header", "rgba(255,255,255,0.95)");
      root.style.setProperty("--bg-stripe", "#f9fafb");
      root.style.setProperty("--bg-hover", "#f0f3ff");
      root.style.setProperty("--bg-input", "#ffffff");
      root.style.setProperty("--text-primary", "#111827");
      root.style.setProperty("--text-muted", "#6b7280");
      root.style.setProperty("--border", "#e5e7eb");
      root.style.setProperty("--border-light", "#f3f4f6");
      root.style.setProperty("--accent", "#4f6ef7");
      root.style.setProperty("--success", "#16a34a");
      root.style.setProperty("--danger", "#dc2626");
      root.style.setProperty("--info-bg", "#eff6ff");
      root.style.setProperty("--info-border", "#bfdbfe");
      root.style.setProperty("--info-text", "#1d4ed8");
    }
  }, [dark]);
  return null;
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <AppWithTheme />
    </AppProvider>
  );
}

function AppWithTheme() {
  const { state } = useApp();
  return (
    <>
      <ThemeInjector dark={state.dark} />
      <Dashboard />
    </>
  );
}
