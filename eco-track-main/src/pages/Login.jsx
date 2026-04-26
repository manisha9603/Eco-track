import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../components/Toast";
import ParticleBackground from "../components/ParticleBackground";
import confetti from "canvas-confetti";
import { initUser } from "../utils/storage";
import { Leaf, ArrowRight, Mail, Lock, Eye, EyeOff, Shield, GraduationCap } from "lucide-react";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [selectedRole, setSelectedRole] = useState("student"); // "student" | "admin"
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === "admin") {
      setEmail("admin@ecotrack.com");
      setPassword("Admin@123");
    } else {
      setEmail("");
      setPassword("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please fill in all fields", "error");
      return;
    }
    setLoading(true);
    try {
      const userData = await login(email, password);
      initUser(userData.name, userData.avatar, userData._id);

      if (onLoginSuccess) onLoginSuccess();

      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.9 },
        colors: ["#10B981", "#34D399"],
      });

      showToast(`Welcome back, ${userData.name}! 🌿`, "success");

      // Redirect based on actual role from server
      const destination = userData.role === "admin" ? "/admin" : "/dashboard";
      setTimeout(() => navigate(destination), 400);
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed. Please try again.";
      showToast(msg, "error");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="login-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <ParticleBackground />
      <div className="login-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <motion.div
        className={`login-card ${shake ? "shake" : ""}`}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="login-logo"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        >
          <span className="login-logo-icon">🌱</span>
        </motion.div>

        <h1 className="login-title">EcoTrack Pro</h1>
        <p className="login-subtitle">Make sustainability a game. Make impact real. 🌍</p>

        {/* Role Selector */}
        <div style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "1.5rem",
          background: "rgba(0,0,0,0.05)",
          padding: "6px",
          borderRadius: "14px",
        }}>
          {[
            { role: "student", label: "Student", icon: <GraduationCap size={16} />, color: "#10B981" },
            { role: "admin",   label: "Admin",   icon: <Shield size={16} />,        color: "#7C3AED" },
          ].map(({ role, label, icon, color }) => (
            <motion.button
              key={role}
              onClick={() => handleRoleSelect(role)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "10px 0",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.9rem",
                transition: "all 0.25s",
                background: selectedRole === role ? color : "transparent",
                color: selectedRole === role ? "white" : "var(--text-secondary)",
                boxShadow: selectedRole === role ? `0 4px 14px ${color}40` : "none",
              }}
            >
              {icon} {label}
            </motion.button>
          ))}
        </div>

        {/* Admin hint */}
        <AnimatePresence>
          {selectedRole === "admin" && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: "1rem" }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              style={{
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.2)",
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "0.82rem",
                color: "#7C3AED",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Shield size={14} />
              Admin credentials pre-filled. You can change them if needed.
            </motion.div>
          )}
        </AnimatePresence>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-field">
            <label htmlFor="email-input">
              <Mail size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Email
            </label>
            <input
              id="email-input"
              type="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <div className="login-field">
            <label htmlFor="password-input">
              <Lock size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <motion.button
            className="login-btn"
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={selectedRole === "admin" ? {
              background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
            } : {}}
          >
            {loading ? (
              <span className="login-btn-loading">
                <Leaf size={18} className="spin" /> Logging in...
              </span>
            ) : (
              <span className="login-btn-content">
                {selectedRole === "admin" ? <><Shield size={18} /> Enter Admin Panel</> : <>Sign In <ArrowRight size={18} /></>}
              </span>
            )}
          </motion.button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.2rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
            Register →
          </Link>
        </p>

        <p className="login-footer">Built for HackForge 2.0</p>
      </motion.div>
    </motion.div>
  );
}