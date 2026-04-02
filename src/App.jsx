import { useEffect, useMemo, useState } from "react";

const initialTransactions = [
  { id: 1, date: "2026-04-01", description: "Salary credit", amount: 92000, category: "Salary", type: "income" },
  { id: 2, date: "2026-03-29", description: "Stock SIP", amount: 12000, category: "Investments", type: "expense" },
  { id: 3, date: "2026-03-26", description: "Cafe meetings", amount: 1850, category: "Food", type: "expense" },
  { id: 4, date: "2026-03-23", description: "Rent transfer", amount: 24000, category: "Housing", type: "expense" },
  { id: 5, date: "2026-03-21", description: "Freelance payment", amount: 18000, category: "Side Hustle", type: "income" },
  { id: 6, date: "2026-03-18", description: "Airfare to Bengaluru", amount: 7600, category: "Travel", type: "expense" },
  { id: 7, date: "2026-03-15", description: "Grocery run", amount: 4200, category: "Groceries", type: "expense" },
  { id: 8, date: "2026-03-11", description: "Power bill", amount: 2350, category: "Utilities", type: "expense" },
  { id: 9, date: "2026-03-08", description: "Dividend payout", amount: 3200, category: "Investments", type: "income" },
  { id: 10, date: "2026-03-04", description: "Gym membership", amount: 1800, category: "Health", type: "expense" },
  { id: 11, date: "2026-03-02", description: "Team dinner", amount: 3950, category: "Food", type: "expense" },
  { id: 12, date: "2026-02-26", description: "Bonus", amount: 12000, category: "Salary", type: "income" },
];

const monthlySeries = [
  { month: "Nov", balance: 148000 },
  { month: "Dec", balance: 161500 },
  { month: "Jan", balance: 157800 },
  { month: "Feb", balance: 173600 },
  { month: "Mar", balance: 186900 },
  { month: "Apr", balance: 194200 },
];

const roleOptions = ["viewer", "admin"];
const today = new Date().toISOString().slice(0, 10);

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function sumByType(transactions, type) {
  return transactions
    .filter((item) => item.type === type)
    .reduce((total, item) => total + item.amount, 0);
}

function getCategoryBreakdown(transactions) {
  const totals = transactions
    .filter((item) => item.type === "expense")
    .reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

  const colors = ["#ff6b57", "#2d6cdf", "#f4b400", "#2f855a", "#9f7aea", "#0f766e"];

  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount], index) => ({
      category,
      amount,
      color: colors[index % colors.length],
    }));
}

function App() {
  const [transactions, setTransactions] = useState(() =>
    readStorage("finance-dashboard-transactions", initialTransactions),
  );
  const [role, setRole] = useState(() => readStorage("finance-dashboard-role", "admin"));
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("date-desc");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: today,
    description: "",
    amount: "",
    category: "Food",
    type: "expense",
  });

  useEffect(() => {
    localStorage.setItem("finance-dashboard-transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("finance-dashboard-role", JSON.stringify(role));
  }, [role]);

  const categories = useMemo(
    () => ["all", ...new Set(transactions.map((item) => item.category))],
    [transactions],
  );

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = transactions.filter((item) => {
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesSearch =
        query.length === 0 ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      return matchesType && matchesCategory && matchesSearch;
    });

    return result.sort((a, b) => {
      switch (sortKey) {
        case "amount-asc":
          return a.amount - b.amount;
        case "amount-desc":
          return b.amount - a.amount;
        case "date-asc":
          return new Date(a.date) - new Date(b.date);
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });
  }, [transactions, typeFilter, categoryFilter, search, sortKey]);

  const totalIncome = useMemo(() => sumByType(transactions, "income"), [transactions]);
  const totalExpenses = useMemo(() => sumByType(transactions, "expense"), [transactions]);
  const totalBalance = totalIncome - totalExpenses;
  const expenseBreakdown = useMemo(() => getCategoryBreakdown(transactions), [transactions]);

  const topCategory = expenseBreakdown[0];
  const lastMonthExpenses = 43850;
  const monthlyDelta = lastMonthExpenses === 0 ? 0 : ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;

  const insights = [
    topCategory
      ? `Highest spending category is ${topCategory.category} at ${currency.format(topCategory.amount)}.`
      : "No expense data available to determine a top category.",
    `${monthlyDelta >= 0 ? "Spending is up" : "Spending is down"} ${Math.abs(monthlyDelta).toFixed(1)}% compared with last month.`,
    totalIncome > totalExpenses
      ? `Cash flow remains positive with ${currency.format(totalIncome - totalExpenses)} left after expenses.`
      : "Expenses are higher than income. Review large categories for savings opportunities.",
  ];

  function handleAddTransaction(event) {
    event.preventDefault();

    if (role !== "admin") {
      return;
    }

    const amount = Number(formData.amount);
    if (!formData.description.trim() || !formData.date || !amount || amount <= 0) {
      return;
    }

    const nextTransaction = {
      id: Date.now(),
      ...formData,
      amount,
    };

    setTransactions((current) => [nextTransaction, ...current]);
    setFormData({
      date: today,
      description: "",
      amount: "",
      category: "Food",
      type: "expense",
    });
    setShowForm(false);
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <main className="dashboard">
        <section className="hero">
          <div>
            <p className="eyebrow">Finance Dashboard UI</p>
            <h1>Track cash flow, spending signals, and transaction activity in one place.</h1>
            <p className="hero-copy">
              A React dashboard with mock financial data, role-based UI, responsive layouts, and frontend-only state management.
            </p>
          </div>

          <div className="toolbar">
            <label className="field compact">
              <span>Role</span>
              <select value={role} onChange={(event) => setRole(event.target.value)}>
                {roleOptions.map((item) => (
                  <option key={item} value={item}>
                    {item[0].toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <button className="button secondary" onClick={() => setShowForm((current) => !current)} disabled={role !== "admin"}>
              {showForm ? "Close Editor" : "Add Transaction"}
            </button>
          </div>
        </section>

        <section className="summary-grid">
          <SummaryCard label="Total Balance" value={currency.format(totalBalance)} tone="default" detail="Net position across current mock data" />
          <SummaryCard label="Income" value={currency.format(totalIncome)} tone="success" detail="All incoming transactions" />
          <SummaryCard label="Expenses" value={currency.format(totalExpenses)} tone="danger" detail="All outgoing transactions" />
        </section>

        <section className="panel-grid">
          <article className="panel chart-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Time Based Visualization</p>
                <h2>Balance trend</h2>
              </div>
              <span className="badge">6 months</span>
            </div>
            <TrendChart data={monthlySeries} />
          </article>

          <article className="panel chart-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Categorical Visualization</p>
                <h2>Spending breakdown</h2>
              </div>
              <span className="badge">Expenses only</span>
            </div>
            <CategoryChart data={expenseBreakdown} />
          </article>
        </section>

        <section className="content-grid">
          <article className="panel transactions-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Transactions</p>
                <h2>Search, filter, and sort activity</h2>
              </div>
              <span className={`role-indicator ${role}`}>{role === "admin" ? "Editing enabled" : "Read-only mode"}</span>
            </div>

            <div className="filter-grid">
              <label className="field">
                <span>Search</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search description or category"
                />
              </label>

              <label className="field">
                <span>Type</span>
                <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                  <option value="all">All</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </label>

              <label className="field">
                <span>Category</span>
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "all" ? "All categories" : category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Sort</span>
                <select value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
                  <option value="date-desc">Newest first</option>
                  <option value="date-asc">Oldest first</option>
                  <option value="amount-desc">Highest amount</option>
                  <option value="amount-asc">Lowest amount</option>
                </select>
              </label>
            </div>

            {showForm && (
              <form className="transaction-form" onSubmit={handleAddTransaction}>
                <label className="field">
                  <span>Date</span>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(event) => setFormData((current) => ({ ...current, date: event.target.value }))}
                  />
                </label>
                <label className="field">
                  <span>Description</span>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                    placeholder="Enter a transaction note"
                  />
                </label>
                <label className="field">
                  <span>Amount</span>
                  <input
                    type="number"
                    min="1"
                    value={formData.amount}
                    onChange={(event) => setFormData((current) => ({ ...current, amount: event.target.value }))}
                    placeholder="Amount"
                  />
                </label>
                <label className="field">
                  <span>Category</span>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value }))}
                  />
                </label>
                <label className="field">
                  <span>Type</span>
                  <select
                    value={formData.type}
                    onChange={(event) => setFormData((current) => ({ ...current, type: event.target.value }))}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </label>
                <button className="button primary" type="submit">
                  Save Transaction
                </button>
              </form>
            )}

            <div className="table-wrap">
              {filteredTransactions.length === 0 ? (
                <div className="empty-state">
                  <h3>No transactions match the current filters.</h3>
                  <p>Clear the search or switch filters to see activity again.</p>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((item) => (
                      <tr key={item.id}>
                        <td>{item.date}</td>
                        <td>{item.description}</td>
                        <td>{item.category}</td>
                        <td>
                          <span className={`pill ${item.type}`}>{item.type}</span>
                        </td>
                        <td className={item.type === "income" ? "amount-positive" : "amount-negative"}>
                          {item.type === "income" ? "+" : "-"}
                          {currency.format(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </article>

          <aside className="panel insights-panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Insights</p>
                <h2>What stands out</h2>
              </div>
            </div>

            <div className="insight-stack">
              {insights.map((insight) => (
                <div className="insight-card" key={insight}>
                  <p>{insight}</p>
                </div>
              ))}
            </div>

            <div className="role-note">
              <h3>Role behavior</h3>
              <p>Viewer can inspect data only. Admin can open the transaction editor and add new records.</p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

function SummaryCard({ label, value, detail, tone }) {
  return (
    <article className={`summary-card ${tone}`}>
      <p>{label}</p>
      <h2>{value}</h2>
      <span>{detail}</span>
    </article>
  );
}

function TrendChart({ data }) {
  const width = 560;
  const height = 240;
  const padding = 28;
  const values = data.map((item) => item.balance);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const points = data
    .map((item, index) => {
      const x = padding + (index * (width - padding * 2)) / (data.length - 1);
      const y =
        height -
        padding -
        ((item.balance - minValue) / Math.max(maxValue - minValue, 1)) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="chart-box">
      <svg viewBox={`0 0 ${width} ${height}`} className="trend-svg" role="img" aria-label="Balance trend chart">
        <defs>
          <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(45,108,223,0.35)" />
            <stop offset="100%" stopColor="rgba(45,108,223,0)" />
          </linearGradient>
        </defs>
        <polyline fill="none" stroke="#2d6cdf" strokeWidth="4" points={points} />
        <polygon points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`} fill="url(#trendFill)" />
        {data.map((item, index) => {
          const x = padding + (index * (width - padding * 2)) / (data.length - 1);
          const y =
            height -
            padding -
            ((item.balance - minValue) / Math.max(maxValue - minValue, 1)) * (height - padding * 2);
          return (
            <g key={item.month}>
              <circle cx={x} cy={y} r="5" fill="#12304a" stroke="#f4efe4" strokeWidth="2" />
              <text x={x} y={height - 6} textAnchor="middle">
                {item.month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function CategoryChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const gradient =
    data.length === 0
      ? "conic-gradient(#d9dfeb 0deg 360deg)"
      : `conic-gradient(${data
          .map((item, index) => {
            const before = data.slice(0, index).reduce((sum, value) => sum + value.amount, 0);
            const start = total === 0 ? 0 : (before / total) * 360;
            const end = total === 0 ? 0 : ((before + item.amount) / total) * 360;
            return `${item.color} ${start}deg ${end}deg`;
          })
          .join(", ")})`;

  return (
    <div className="category-layout">
      <div className="donut" aria-hidden="true">
        <div
          className="donut-ring"
          style={{
            background: gradient,
          }}
        />
        <div className="donut-hole">
          <strong>{currency.format(total)}</strong>
          <span>Total spend</span>
        </div>
      </div>

      <div className="legend">
        {data.length === 0 ? (
          <p className="empty-inline">No expense categories available.</p>
        ) : (
          data.map((item) => (
            <div className="legend-row" key={item.category}>
              <span className="swatch" style={{ backgroundColor: item.color }} />
              <div>
                <strong>{item.category}</strong>
                <p>{currency.format(item.amount)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
