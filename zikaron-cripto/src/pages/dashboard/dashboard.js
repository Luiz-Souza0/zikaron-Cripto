import { useState } from "react";
import ZikaronSidebar from "../components/menuLateral";

// ─── DATA ────────────────────────────────────────────────────────────────────

const USER = {
  name: "Rafael Mendonça",
  initials: "RM",
  plan: "Pro",
  email: "rafael@email.com",
};

const METRICS = [
  {
    id: "patrimonio",
    label: "Patrimônio total",
    value: "R$ 84.320",
    change: "↑ 12,4% este mês",
    trend: "up",
    accent: "green",
  },
  {
    id: "ganho",
    label: "Ganho realizado",
    value: "R$ 23.150",
    change: "↑ maio–junho",
    trend: "up",
    accent: null,
  },
  {
    id: "ir",
    label: "IR estimado",
    value: "R$ 3.472",
    change: "15% sobre ganho",
    trend: "down",
    accent: "brown",
  },
  {
    id: "limite",
    label: "Limite mensal",
    value: "R$ 35.000",
    change: "R$ 11.850 restantes",
    trend: "neutral",
    accent: null,
  },
];

const CHART_MONTHS = [
  { month: "Jan", height: 40, current: false },
  { month: "Fev", height: 36, current: false },
  { month: "Mar", height: 53, current: false },
  { month: "Abr", height: 46, current: false },
  { month: "Mai", height: 66, current: false },
  { month: "Jun", height: 78, current: true },
];

const WALLETS = [
  {
    id: "btc",
    symbol: "₿",
    name: "Bitcoin · Ledger",
    address: "bc1q...x9r4",
    brl: "R$ 48.200",
    coin: "0.482 BTC",
    color: "#f7931a",
    connected: true,
  },
  {
    id: "eth",
    symbol: "Ξ",
    name: "Ethereum · MetaMask",
    address: "0x3f...a712",
    brl: "R$ 22.400",
    coin: "4.21 ETH",
    color: "#627eea",
    connected: true,
  },
  {
    id: "bnb",
    symbol: "B",
    name: "BNB · Binance",
    address: "API key ativa",
    brl: "R$ 13.720",
    coin: "28.4 BNB",
    color: "#e6b800",
    colorText: "#333",
    connected: true,
  },
];

const TAX_EVENTS = [
  { month: "Março", gain: "R$ 8.400",  ir: "R$ 1.260", status: "Pago" },
  { month: "Abril",  gain: "R$ 12.200", ir: "R$ 1.830", status: "Pago" },
  { month: "Maio",   gain: "R$ 18.750", ir: "R$ 2.812", status: "Pendente" },
  { month: "Junho",  gain: "R$ 23.150", ir: "R$ 3.472", status: "Em aberto" },
];

const GCAP_REPORTS = [
  { month: "Março 2025",  gain: "R$ 8.400 em ganhos",  status: "Enviado" },
  { month: "Abril 2025",  gain: "R$ 12.200 em ganhos", status: "Enviado" },
  { month: "Maio 2025",   gain: "R$ 18.750 em ganhos", status: "Pendente" },
];

// NAV_ITEMS moved to ZikaronSidebar.jsx

const MOBILE_NAV = [
  { icon: "▦", label: "Início",    id: "dashboard" },
  { icon: "◈", label: "Carteiras", id: "wallets"   },
  { icon: "⊟", label: "GCAP",     id: "gcap"      },
  { icon: "⚙", label: "Conta",    id: "settings"  },
];

const BANNER_AD = {
  icon: "🛡",
  title: "Contador especialista em cripto — CriptoContábil",
  sub: "Declaração de IR para investidores. Primeira consulta grátis.",
  cta: "Saiba mais",
};

// ─── TOKENS ──────────────────────────────────────────────────────────────────

const C = {
  green:      "#06402B",
  greenHover: "#0a5c3e",
  greenPale:  "#e6f0eb",
  brown:      "#7A4E38",
  brownLight: "#f0e6e0",
  brownMid:   "#9B6245",
  brownDark:  "#5C3520",
  textPri:    "#1a1a1a",
  textSec:    "#6b7280",
  border:     "#e5e7eb",
  bg:         "#f4f6f4",
  card:       "#ffffff",
  up:         "#0a6e42",
  down:       "#b91c1c",
};

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────





function StatusPill({ status }) {
  const map = {
    "Pago":      { bg: "#dcfce7", color: "#15803d" },
    "Enviado":   { bg: "#dcfce7", color: "#15803d" },
    "Pendente":  { bg: C.brownLight, color: C.brownDark },
    "Em aberto": { bg: "#fee2e2", color: C.down },
  };
  const s = map[status] || { bg: "#f3f4f6", color: C.textSec };
  return (
    <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: 10, fontSize: 10.5, fontWeight: 500, background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, ...style }}>
      {children}
    </div>
  );
}

function CardHeader({ title, action, onAction }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: C.textPri }}>{title}</div>
      {action && (
        <span onClick={onAction} style={{ fontSize: 11, color: C.green, cursor: "pointer" }}>{action}</span>
      )}
    </div>
  );
}

// ─── METRIC CARD ─────────────────────────────────────────────────────────────

function MetricCard({ metric }) {
  const accentColor = metric.accent === "green" ? C.green : metric.accent === "brown" ? C.brown : null;
  const changeColor = metric.trend === "up" ? C.up : metric.trend === "down" ? C.down : C.textSec;
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 15px",
      borderLeft: accentColor ? `3px solid ${accentColor}` : `1px solid ${C.border}`,
    }}>
      <div style={{ fontSize: 10.5, color: C.textSec, marginBottom: 6 }}>{metric.label}</div>
      <div style={{ fontSize: 21, fontWeight: 600, color: C.textPri }}>{metric.value}</div>
      <div style={{ fontSize: 10.5, color: changeColor, marginTop: 4 }}>{metric.change}</div>
    </div>
  );
}

// ─── CHART ───────────────────────────────────────────────────────────────────

function PatrimonioChart({ data }) {
  return (
    <Card>
      <CardHeader title="Evolução patrimonial" action="Ver detalhe →" />
      <div style={{ display: "flex", alignItems: "flex-end", gap: 7, height: 90 }}>
        {data.map(d => (
          <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{
              width: "100%", borderRadius: "3px 3px 0 0",
              height: d.height,
              background: d.current ? C.brown : C.green,
            }} />
            <div style={{ fontSize: 9.5, color: C.textSec }}>{d.month}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
        {[{ color: C.green, label: "Patrimônio (R$)" }, { color: C.brown, label: "Mês atual" }].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: C.textSec }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── WALLETS ─────────────────────────────────────────────────────────────────

function WalletItem({ wallet }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, background: C.bg, borderRadius: 8 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 7, background: wallet.color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, color: wallet.colorText || "#fff", flexShrink: 0,
      }}>
        {wallet.symbol}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 500, color: C.textPri }}>{wallet.name}</div>
        <div style={{ fontSize: 10, color: C.textSec }}>{wallet.address}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: C.textPri }}>{wallet.brl}</div>
        <div style={{ fontSize: 10, color: C.textSec }}>{wallet.coin}</div>
      </div>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", flexShrink: 0 }} />
    </div>
  );
}

function WalletsPanel({ wallets }) {
  return (
    <Card>
      <CardHeader title="Carteiras conectadas" action="+ Adicionar" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {wallets.map(w => <WalletItem key={w.id} wallet={w} />)}
      </div>
    </Card>
  );
}

// ─── TAX TABLE ───────────────────────────────────────────────────────────────

function TaxEventsTable({ events }) {
  const thStyle = { fontSize: 10.5, color: C.textSec, fontWeight: 500, textAlign: "left", padding: "0 0 8px", borderBottom: `1px solid ${C.border}` };
  const tdStyle = { padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.textPri };
  return (
    <Card>
      <CardHeader title="Eventos tributáveis · 2025" />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Mês", "Ganho", "IR", "Status"].map(h => <th key={h} style={thStyle}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={e.month} style={i === events.length - 1 ? {} : {}}>
              <td style={{ ...tdStyle, borderBottom: i === events.length - 1 ? "none" : `1px solid ${C.border}` }}>{e.month}</td>
              <td style={{ ...tdStyle, borderBottom: i === events.length - 1 ? "none" : `1px solid ${C.border}` }}>{e.gain}</td>
              <td style={{ ...tdStyle, borderBottom: i === events.length - 1 ? "none" : `1px solid ${C.border}` }}>{e.ir}</td>
              <td style={{ ...tdStyle, borderBottom: i === events.length - 1 ? "none" : `1px solid ${C.border}` }}><StatusPill status={e.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ─── GCAP PANEL ──────────────────────────────────────────────────────────────

function GcapPanel({ reports }) {
  const [hov, setHov] = useState(false);
  return (
    <Card>
      <CardHeader title="Relatório GCAP" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {reports.map(r => (
          <div key={r.month} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: C.bg, borderRadius: 8 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: C.textPri }}>{r.month}</div>
              <div style={{ fontSize: 10.5, color: C.textSec, marginTop: 1 }}>{r.gain}</div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, color: r.status === "Enviado" ? "#15803d" : C.brownDark }}>
              {r.status === "Enviado" ? "✓ " : "⏱ "}{r.status}
            </div>
          </div>
        ))}
        <button
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{ width: "100%", background: hov ? C.greenHover : C.green, color: "#fff", border: "none", borderRadius: 8, padding: 11, fontSize: 13, cursor: "pointer", fontWeight: 500, marginTop: 4, transition: "background 0.15s" }}
        >
          ↓ Baixar GCAP – Maio 2025
        </button>
      </div>
    </Card>
  );
}

// ─── TOPBAR ──────────────────────────────────────────────────────────────────

function Topbar() {
  const [hovSync, setHovSync] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: C.textPri }}>Visão geral · junho 2025</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ background: C.brownLight, color: C.brownDark, fontSize: 11, padding: "4px 11px", borderRadius: 20, border: `1px solid ${C.brownMid}`, fontWeight: 500 }}>
          ⚠ IR vence em 12 dias
        </span>
        <button
          onMouseEnter={() => setHovSync(true)}
          onMouseLeave={() => setHovSync(false)}
          style={{ background: hovSync ? C.greenHover : C.green, color: "#fff", fontSize: 12, padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer", transition: "background 0.15s" }}
        >
          ↻ Sincronizar
        </button>
      </div>
    </div>
  );
}

// ─── BANNER ──────────────────────────────────────────────────────────────────

function BannerFooter({ ad, onClose }) {
  const [hovCta, setHovCta] = useState(false);
  return (
    <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, padding: "9px 20px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      <span style={{ fontSize: 9.5, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.7px", flexShrink: 0 }}>Anúncio</span>
      <div style={{ flex: 1, background: "linear-gradient(90deg,#f9f4f1,#ede0d8)", border: `1px solid ${C.brownMid}`, borderRadius: 8, padding: "7px 14px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: C.brown, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
          {ad.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.brownDark }}>{ad.title}</div>
          <div style={{ fontSize: 10, color: C.textSec }}>{ad.sub}</div>
        </div>
        <span
          onMouseEnter={() => setHovCta(true)}
          onMouseLeave={() => setHovCta(false)}
          style={{ fontSize: 11, color: C.brownDark, border: `1px solid ${C.brown}`, borderRadius: 6, padding: "4px 12px", cursor: "pointer", whiteSpace: "nowrap", fontWeight: 500, background: hovCta ? C.brownLight : "#fff", transition: "background 0.15s" }}
        >
          {ad.cta}
        </span>
      </div>
      <span onClick={onClose} style={{ fontSize: 15, color: C.textSec, cursor: "pointer", flexShrink: 0 }}>✕</span>
    </div>
  );
}

// ─── MOBILE NAV ──────────────────────────────────────────────────────────────

function MobileNav({ active, onNav }) {
  return (
    <div style={{ display: "flex", background: C.card, borderTop: `1px solid ${C.border}`, padding: "6px 0 10px" }}>
      {MOBILE_NAV.map(item => (
        <div
          key={item.id}
          onClick={() => onNav(item.id)}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontSize: 9.5, color: active === item.id ? C.green : C.textSec, cursor: "pointer", padding: "4px 0" }}
        >
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          {item.label}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────

export default function ZikaronDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [bannerVisible, setBannerVisible] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: C.bg, overflow: "hidden" }}>

      {/* SIDEBAR */}
      {!isMobile && (
        <ZikaronSidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(prev => !prev)}
          activeNav={activeNav}
          onNav={setActiveNav}
          user={USER}
        />
      )}

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <Topbar />

        {/* SCROLLABLE CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* METRICS ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
            {METRICS.map(m => <MetricCard key={m.id} metric={m} />)}
          </div>

          {/* MID ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 12 }}>
            <PatrimonioChart data={CHART_MONTHS} />
            <WalletsPanel wallets={WALLETS} />
          </div>

          {/* BOTTOM ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TaxEventsTable events={TAX_EVENTS} />
            <GcapPanel reports={GCAP_REPORTS} />
          </div>

        </div>

        {/* BANNER */}
        {bannerVisible && <BannerFooter ad={BANNER_AD} onClose={() => setBannerVisible(false)} />}

        {/* MOBILE NAV */}
        {isMobile && <MobileNav active={activeNav} onNav={setActiveNav} />}
      </div>
    </div>
  );
}