import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../components/Toast";
import ParticleBackground from "../components/ParticleBackground";
import confetti from "canvas-confetti";
import { initUser } from "../utils/storage";
import { UserPlus, ArrowRight, Mail, Lock, User, Building, Eye, EyeOff } from "lucide-react";

const DEPARTMENTS = ["CSE", "Mechanical", "Electrical", "Civil", "Hostel", "Mess", "Library", "Other"];
const AVATARS = ["🌱", "🌿", "🦋", "⚡", "🌊", "🔥", "🌍", "💫"];

export default function Register() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", department: "CSE", role: "student", avatar: "🌱",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      showToast("All fields are required!", "error");
      return;
    }
    if (form.password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    try {
      const userData = await register(form);
      // Initialize local gamification tracking for the new session
      initUser(userData.name, userData.avatar, userData._id);

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#7C3AED", "#10B981", "#34D399", "#F59E0B"],
      });

      showToast(`Welcome to EcoTrack, ${userData.name}! 🌿`, "success");
      setTimeout(() => navigate("/dashboard"), 600);
    } catch (err) {
      const msg = err.response?.data?.error || "Registration failed. Try again.";
      showToast(msg, "error");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="login-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
        style={{ maxWidth: 460 }}
      >
        <motion.div className="login-logo" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}>
          <span className="login-logo-icon">🌿</span>
        </motion.div>

        <h1 className="login-title">Join EcoTrack</h1>
        <p className="login-subtitle">Start your sustainability journey today 🚀</p>

        <form className="login-form" onSubmit={handleRegister}>
          <div className="login-field">
            <label><User size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Your Name</label>
            <input type="text" placeholder="Rahul Sharma" value={form.name} onChange={(e) => update("name", e.target.value)} maxLength={30} autoFocus />
          </div>

          <div className="login-field">
            <label><Mail size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Email</label>
            <input type="email" placeholder="rahul@college.edu" value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>

          <div className="login-field">
            <label><Lock size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Password</label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={form.password} onChange={(e) => update("password", e.target.value)} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="login-field">
            <label><Building size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> Department</label>
            <select value={form.department} onChange={(e) => update("department", e.target.value)} style={{ width: "100%", padding: "0.8rem", borderRadius: "12px", border: "1px solid var(--card-border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "1rem" }}>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="login-field">
            <label>Choose Avatar</label>
            <div className="avatar-picker">
              {AVATARS.map((av) => (
                <motion.button key={av} type="button" className={`avatar-option ${form.avatar === av ? "selected" : ""}`} onClick={() => update("avatar", av)} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                  {av}
                </motion.button>
              ))}
            </div>
          </div>


          <motion.button className="login-btn" type="submit" disabled={loading} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            {loading ? (
              <span className="login-btn-loading"><UserPlus size={18} className="spin" /> Creating account...</span>
            ) : (
              <span className="login-btn-content">Create Account <ArrowRight size={18} /></span>
            )}
          </motion.button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.2rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <Link to="/" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Sign In →</Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
