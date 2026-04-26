import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  PlusCircle,
  Trophy,
  Gift,
  History,
  User,
  LogOut,
  Moon,
  Sun,
  AlertTriangle,
  CheckSquare,
  Shield,
  Flame,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/activities", label: "Activities", icon: PlusCircle },
  { path: "/tickets", label: "Tickets", icon: AlertTriangle },
  { path: "/leaderboard", label: "Rankings", icon: Trophy },
  { path: "/tasks", label: "Tasks", icon: CheckSquare },
  { path: "/rewards", label: "Rewards", icon: Gift },
  { path: "/history", label: "History", icon: History },
  { path: "/profile", label: "Profile", icon: User },
];

const mobileNavItems = [
  { path: "/dashboard", label: "Home", icon: LayoutDashboard },
  { path: "/activities", label: "Eco", icon: PlusCircle },
  { path: "/tickets", label: "Tickets", icon: AlertTriangle },
  { path: "/leaderboard", label: "Board", icon: Trophy },
  { path: "/profile", label: "Profile", icon: User },
];

export default function Navbar({ userName, avatar, points, streak, onLogout, darkMode, onToggleDark, isAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <>
      {/* Desktop / Top navbar */}
      <nav className="navbar-desktop">
        <div className="navbar-inner">
          <NavLink to="/dashboard" className="navbar-logo">
            <span className="logo-icon">🌱</span>
            <span className="logo-text">EcoTrack Pro</span>
          </NavLink>

          <div className="navbar-links">
            {navItems.slice(0, 6).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="navbar-right">
            {/* Points badge */}
            <div className="navbar-points-badge" title="Total EcoPoints" style={{ background: "linear-gradient(135deg, #7C3AED, #10B981)", color: "white", padding: "4px 14px", borderRadius: 100, fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              🏆 {(points || 0).toLocaleString()} pts
            </div>

            {/* Streak */}
            {streak > 0 && (
              <div className={`navbar-streak ${streak > 3 ? "streak-fire" : ""}`} style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B", padding: "4px 12px", borderRadius: 100, fontSize: "0.85rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                <Flame size={14} /> {streak}
              </div>
            )}

            <button className="navbar-dark-toggle" onClick={onToggleDark} title="Toggle dark mode">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAdmin && (
              <NavLink to="/admin" className="navbar-link" title="Admin Panel" style={{ color: "#EF4444" }}>
                <Shield size={18} />
              </NavLink>
            )}

            <div className="navbar-user">
              <span className="navbar-avatar">{avatar}</span>
              <span className="navbar-username">{userName}</span>
            </div>
            <button className="navbar-logout" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile / Bottom tab bar */}
      <nav className="navbar-mobile">
        {mobileNavItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => `mobile-tab ${isActive ? "active" : ""}`}>
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
