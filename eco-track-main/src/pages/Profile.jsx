import { useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";
import { AnimatePresence } from "framer-motion";
import { authAPI } from "../utils/api";
import { showToast } from "../components/Toast";
import { BADGES } from "../utils/constants";
import {
  treesEquivalent,
  kmNotDriven,
  plasticBagsAvoided,
  getUserPercentile,
} from "../utils/calculations";
import {
  User,
  Calendar,
  Zap,
  Activity,
  Leaf,
  Award,
  LogOut,
  Edit3,
  Check,
  TreePine,
  Car,
  Recycle,
  Key,
  X,
} from "lucide-react";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20 },
};

export default function Profile({ ecoData }) {
  const { user, avatar, points, activities, totalCO2, badges, joinDate, updateProfile, logout } = ecoData;
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passParams, setPassParams] = useState({ oldPassword: "", newPassword: "" });
  const [updating, setUpdating] = useState(false);

  const percentile = getUserPercentile(points);
  const earnedBadges = BADGES.filter((b) => badges.includes(b.id));

  const handleSave = () => {
    if (newName.trim()) {
      updateProfile(newName);
      setEditing(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passParams.newPassword.length < 6) {
      showToast("New password must be at least 6 characters.", "warning");
      return;
    }
    setUpdating(true);
    try {
      await authAPI.changePassword(passParams);
      showToast("Password updated successfully!", "success");
      setShowPasswordModal(false);
      setPassParams({ oldPassword: "", newPassword: "" });
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to change password", "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div className="page profile-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      
      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: "var(--bg, white)", borderRadius: 20, padding: "2rem", maxWidth: 400, width: "100%", boxShadow: "0 16px 48px rgba(0,0,0,0.2)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}><Key size={22} style={{ color: "var(--primary)" }} /> Change Password</h2>
                <button onClick={() => setShowPasswordModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}><X size={20} /></button>
              </div>

              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Current Password</label>
                  <input type="password" value={passParams.oldPassword} onChange={(e) => setPassParams({ ...passParams, oldPassword: e.target.value })} required minLength={6} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--card-border)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>New Password</label>
                  <input type="password" value={passParams.newPassword} onChange={(e) => setPassParams({ ...passParams, newPassword: e.target.value })} required minLength={6} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--card-border)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} />
                </div>
                <button type="submit" disabled={updating} style={{ padding: "14px", borderRadius: 10, background: "var(--primary)", border: "none", color: "white", fontWeight: 700, cursor: "pointer", marginTop: "1rem" }}>
                  {updating ? "Updating..." : "Update Password"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Profile Header */}
      <motion.div
        className="profile-header"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="profile-avatar-large">{avatar}</div>
        <div className="profile-name-row">
          {editing ? (
            <div className="profile-edit-name">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="profile-name-input"
                autoFocus
                maxLength={30}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
              <button className="profile-save-btn" onClick={handleSave}>
                <Check size={16} />
              </button>
            </div>
          ) : (
            <div className="profile-name-display">
              <h1>{user}</h1>
              <button className="profile-edit-btn" onClick={() => setEditing(true)}>
                <Edit3 size={16} />
              </button>
            </div>
          )}
        </div>
        <p className="profile-join-date">
          <Calendar size={14} /> Joined {new Date(joinDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
        {percentile > 0 && (
          <p className="profile-percentile">
            🌟 You are in the top {100 - percentile}% of eco warriors
          </p>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="profile-stats">
        <GlassCard className="profile-stat-card">
          <Zap size={20} className="stat-icon-inline green" />
          <span className="stat-value"><AnimatedCounter target={points} /></span>
          <span className="stat-label">Total Points</span>
        </GlassCard>
        <GlassCard className="profile-stat-card">
          <Activity size={20} className="stat-icon-inline blue" />
          <span className="stat-value"><AnimatedCounter target={activities.length} /></span>
          <span className="stat-label">Activities Logged</span>
        </GlassCard>
        <GlassCard className="profile-stat-card">
          <Leaf size={20} className="stat-icon-inline green" />
          <span className="stat-value"><AnimatedCounter target={totalCO2} decimals={2} /></span>
          <span className="stat-label">kg CO₂ Saved</span>
        </GlassCard>
        <GlassCard className="profile-stat-card">
          <Award size={20} className="stat-icon-inline purple" />
          <span className="stat-value"><AnimatedCounter target={earnedBadges.length} /></span>
          <span className="stat-label">Badges Earned</span>
        </GlassCard>
      </div>

      {/* Environmental Impact */}
      <section className="profile-impact">
        <h2 className="section-title">🌍 Your Environmental Impact</h2>
        <p className="impact-subtitle">Your CO₂ savings equal:</p>
        <div className="impact-grid">
          <GlassCard className="impact-card">
            <TreePine size={28} className="impact-icon" />
            <span className="impact-value">{treesEquivalent(totalCO2)}</span>
            <span className="impact-label">Trees Planted 🌳</span>
          </GlassCard>
          <GlassCard className="impact-card">
            <Car size={28} className="impact-icon" />
            <span className="impact-value">{kmNotDriven(totalCO2)}</span>
            <span className="impact-label">km Not Driven 🚗</span>
          </GlassCard>
          <GlassCard className="impact-card">
            <Recycle size={28} className="impact-icon" />
            <span className="impact-value">{plasticBagsAvoided(totalCO2)}</span>
            <span className="impact-label">Plastic Bags Avoided ♻️</span>
          </GlassCard>
        </div>
      </section>

      {/* Badge Showcase */}
      {earnedBadges.length > 0 && (
        <section className="profile-badges">
          <h2 className="section-title">🏅 Badge Collection</h2>
          <div className="badge-showcase">
            {earnedBadges.map((badge) => (
              <motion.div
                key={badge.id}
                className="badge-showcase-item"
                whileHover={{ scale: 1.1, y: -4 }}
              >
                <span className="badge-showcase-icon">{badge.icon}</span>
                <span className="badge-showcase-name">{badge.name}</span>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Account Settings / Danger Zone */}
      <section className="profile-danger" style={{ border: "1px solid rgba(0,0,0,0.1)", background: "var(--card-bg)" }}>
        <h2 className="section-title">⚙️ Account Settings</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
          <motion.button
            onClick={() => setShowPasswordModal(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, background: "rgba(124,58,237,0.1)", color: "var(--primary)", border: "1px solid var(--primary)", fontWeight: 600, cursor: "pointer" }}
          >
            <Key size={18} /> Change Password
          </motion.button>
          <motion.button
            className="logout-btn"
            onClick={logout}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <LogOut size={18} /> Logout
          </motion.button>
        </div>
      </section>
    </motion.div>
  );
}
