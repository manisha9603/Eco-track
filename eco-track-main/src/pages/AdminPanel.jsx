import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { adminAPI, ticketAPI } from "../utils/api";
import { showToast } from "../components/Toast";
import GlassCard from "../components/GlassCard";
import Loader from "../components/Loader";
import { pageVariants, staggerContainer, staggerItem } from "../utils/animations";
import { Shield, Users, AlertTriangle, CheckCircle, BarChart3, Clock, X, Upload, RotateCcw, Eye, MessageSquare, Image, Key, Plus, Lock } from "lucide-react";

const STATUS_CONFIG = {
  pending: { bg: "rgba(245,158,11,0.15)", color: "#F59E0B", label: "🟡 Pending" },
  in_progress: { bg: "rgba(59,130,246,0.15)", color: "#3B82F6", label: "🔵 In Progress" },
  resolved: { bg: "rgba(16,185,129,0.15)", color: "#10B981", label: "🟢 Resolved" },
  reopened: { bg: "rgba(239,68,68,0.15)", color: "#EF4444", label: "🔴 Reopened" },
};

export default function AdminPanel() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolveModal, setResolveModal] = useState(null); // ticket being resolved
  const [remark, setRemark] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [detailView, setDetailView] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [activeTab, setActiveTab] = useState("tickets");
  const [usersList, setUsersList] = useState([]);
  
  // Admin Creation Form State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "", department: "IT" });

  useEffect(() => { loadData(); }, [filterStatus]);

  const loadData = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const [statsRes, ticketsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        ticketAPI.getAll(params),
        adminAPI.getUsers(),
      ]);
      setStats(statsRes.data);
      setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
      setUsersList(Array.isArray(usersRes.data) ? usersRes.data : []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load admin data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await adminAPI.createAdmin(adminForm);
      showToast("Admin created successfully!", "success");
      setShowAdminModal(false);
      setAdminForm({ name: "", email: "", password: "", department: "IT" });
      loadData();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to create admin", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleResetPassword = async (userId) => {
    const newPass = prompt("Enter new temporary password (min 6 chars):");
    if (!newPass || newPass.length < 6) {
      if (newPass !== null) showToast("Password must be at least 6 characters.", "warning");
      return;
    }
    setUpdating(true);
    try {
      await adminAPI.resetPassword(userId, newPass);
      showToast("Password reset successfully. Please share this with the user.", "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to reset password", "error");
    } finally {
      setUpdating(false);
    }
  };

  const updateStatus = async (ticketId, newStatus) => {
    if (newStatus === "resolved") {
      setResolveModal(ticketId);
      return;
    }
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("status", newStatus);
      await ticketAPI.updateWithProof(ticketId, formData);
      showToast(`✅ Ticket status updated to ${newStatus.replace("_", " ")}`, "success");
      loadData();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleResolve = async () => {
    if (!resolveModal) return;
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("status", "resolved");
      if (remark.trim()) formData.append("remark", remark.trim());
      if (proofFile) formData.append("proofImage", proofFile);

      await ticketAPI.updateWithProof(resolveModal, formData);
      showToast("🎉 Ticket fixed! It is now waiting for user verification.", "success");
      setResolveModal(null);
      setRemark("");
      setProofFile(null);
      setProofPreview(null);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to resolve", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleAdminVerify = async (ticketId, isVerified) => {
    setUpdating(true);
    try {
      await ticketAPI.adminVerify(ticketId, isVerified);
      if (isVerified) {
        showToast("🏆 Fix Approved! 50 points awarded to the solver.", "success");
      } else {
        showToast("❌ Fix Rejected! Ticket has been reopened.", "warning");
      }
      loadData();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to verify", "error");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}><Loader size={48} text="Loading admin panel..." /></div>;

  return (
    <motion.div className="page" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ padding: 20 }}>
      {/* Resolve Modal */}
      <AnimatePresence>
        {resolveModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
            onClick={() => setResolveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: "var(--bg, white)", borderRadius: 20, padding: "1.5rem", maxWidth: 500, width: "100%", boxShadow: "0 16px 48px rgba(0,0,0,0.2)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}><CheckCircle size={22} style={{ color: "#10B981" }} /> Resolve Ticket</h2>
                <button onClick={() => setResolveModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}><X size={20} /></button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: 4, fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                    <MessageSquare size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Admin Remarks
                  </label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="Describe what was done to fix this issue..."
                    style={{ width: "100%", padding: "0.85rem", borderRadius: 12, border: "1px solid var(--card-border, #e5e7eb)", background: "var(--bg-secondary, #f0fdf4)", color: "var(--text-primary)", fontSize: "1rem", minHeight: 100, resize: "vertical", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 4, fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                    <Upload size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Proof of Resolution (Photo)
                  </label>
                  <div
                    onClick={() => document.getElementById("admin-proof-upload").click()}
                    style={{ border: "2px dashed var(--card-border, #e5e7eb)", borderRadius: 12, padding: "1.2rem", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    <input type="file" id="admin-proof-upload" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files[0]; if (f) { setProofFile(f); setProofPreview(URL.createObjectURL(f)); } }} />
                    {proofPreview ? (
                      <div>
                        <img src={proofPreview} alt="Proof preview" style={{ maxHeight: 150, borderRadius: 8, marginBottom: 8 }} />
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Click to change</p>
                      </div>
                    ) : (
                      <div>
                        <Upload size={28} style={{ color: "var(--text-secondary)", marginBottom: 6 }} />
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Upload a photo proving the issue is fixed</p>
                      </div>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleResolve}
                  disabled={updating}
                  style={{ background: "#10B981", color: "white", padding: "14px", borderRadius: 14, fontWeight: 700, border: "none", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}
                >
                  {updating ? "Resolving..." : <><CheckCircle size={18} /> Mark as Resolved</>}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Tabs */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="page-title"><Shield size={28} style={{ verticalAlign: "middle", marginRight: 8 }} /> Admin Panel</h1>
        
        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", borderBottom: "1px solid var(--card-border)" }}>
          <button 
            onClick={() => setActiveTab("tickets")}
            style={{ padding: "0.8rem 1.5rem", background: "none", border: "none", borderBottom: activeTab === "tickets" ? "3px solid var(--primary)" : "3px solid transparent", color: activeTab === "tickets" ? "var(--primary)" : "var(--text-secondary)", fontWeight: 600, fontSize: "1rem", cursor: "pointer", transition: "all 0.2s" }}
          >
            🎟️ Ticket Management
          </button>
          <button 
            onClick={() => setActiveTab("users")}
            style={{ padding: "0.8rem 1.5rem", background: "none", border: "none", borderBottom: activeTab === "users" ? "3px solid var(--primary)" : "3px solid transparent", color: activeTab === "users" ? "var(--primary)" : "var(--text-secondary)", fontWeight: 600, fontSize: "1rem", cursor: "pointer", transition: "all 0.2s" }}
          >
            🛡️ User Controls
          </button>
        </div>
      </div>

      {activeTab === "users" ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          
          {/* Admin Creation Modal */}
          <AnimatePresence>
            {showAdminModal && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
                onClick={() => setShowAdminModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ background: "var(--bg, white)", borderRadius: 20, padding: "2rem", maxWidth: 450, width: "100%", boxShadow: "0 16px 48px rgba(0,0,0,0.2)" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}><Shield size={22} style={{ color: "var(--primary)" }} /> Create New Admin</h2>
                    <button onClick={() => setShowAdminModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}><X size={20} /></button>
                  </div>

                  <form onSubmit={handleCreateAdmin} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                    <div style={{ textAlign: "left" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Name</label>
                      <input type="text" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} required style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--card-border)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} />
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Email</label>
                      <input type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} required style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--card-border)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} />
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Temporary Password</label>
                      <input type="text" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} required minLength={6} style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--card-border)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} />
                    </div>
                    <button type="submit" disabled={updating} style={{ padding: "14px", borderRadius: 10, background: "var(--primary)", border: "none", color: "white", fontWeight: 700, cursor: "pointer", marginTop: "0.5rem" }}>
                      {updating ? "Creating..." : "Create Admin Account"}
                    </button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.4rem", margin: 0 }}>Registered Users</h2>
            <button onClick={() => setShowAdminModal(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10, background: "rgba(124,58,237,0.1)", border: "1px solid var(--primary)", color: "var(--primary)", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
              <Plus size={18} /> Create Admin
            </button>
          </div>

          <GlassCard style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.02)", borderBottom: "1px solid var(--card-border)" }}>
                    <th style={{ padding: "14px 20px", fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase" }}>User</th>
                    <th style={{ padding: "14px 20px", fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase" }}>Role</th>
                    <th style={{ padding: "14px 20px", fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase" }}>Stats</th>
                    <th style={{ padding: "14px 20px", fontWeight: 600, color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u._id} style={{ borderBottom: "1px solid var(--card-border)" }}>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                            {u.avatar || "👤"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        {u.role === "admin" ? (
                          <span style={{ padding: "4px 10px", background: "rgba(124,58,237,0.1)", color: "var(--primary)", borderRadius: 100, fontSize: "0.75rem", fontWeight: 700 }}>🛡️ Admin</span>
                        ) : (
                          <span style={{ padding: "4px 10px", background: "rgba(16,185,129,0.1)", color: "#10B981", borderRadius: 100, fontSize: "0.75rem", fontWeight: 700 }}>🎓 Student</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}><strong>{u.points}</strong> pts</div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <button 
                          onClick={() => handleResetPassword(u._id)}
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)", color: "#EF4444", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}
                        >
                          <Lock size={14} /> Reset Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                  {usersList.length === 0 && (
                    <tr><td colSpan="4" style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>No users loaded.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

      {/* Stats */}
      {stats && (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { label: "Total Users", value: stats.totalUsers, icon: <Users size={22} />, color: "#7C3AED" },
            { label: "Total Tickets", value: stats.totalTickets, icon: <AlertTriangle size={22} />, color: "#F59E0B" },
            { label: "Open", value: stats.openTickets, icon: <Clock size={22} />, color: "#EF4444" },
            { label: "Resolved", value: stats.resolvedTickets, icon: <CheckCircle size={22} />, color: "#10B981" },
            { label: "Tasks Solved", value: stats.totalTasks, icon: <BarChart3 size={22} />, color: "#3B82F6" },
            { label: "CO₂ Saved", value: `${(stats.totalCO2 || 0).toFixed(1)} kg`, icon: "🌍", color: "#059669" },
          ].map((s, i) => (
            <motion.div key={i} variants={staggerItem}>
              <GlassCard style={{ padding: "1rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", marginBottom: 4 }}>{typeof s.icon === "string" ? s.icon : s.icon}</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color }}>{s.value || 0}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>{s.label}</div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Filter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <h2 style={{ margin: 0 }}>🎟️ Ticket Management</h2>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["", "pending", "in_progress", "resolved", "reopened"].map((s) => {
            const conf = STATUS_CONFIG[s];
            return (
              <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: "6px 14px", borderRadius: 100, border: filterStatus === s ? "2px solid var(--primary)" : "1px solid var(--card-border, #e5e7eb)", background: filterStatus === s ? "rgba(124,58,237,0.08)" : "transparent", cursor: "pointer", fontSize: "0.8rem", fontWeight: 500, color: "var(--text-primary)" }}>
                {s === "" ? "All" : conf?.label || s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ticket list */}
      {tickets.length === 0 ? (
        <GlassCard style={{ padding: "2rem", textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>No tickets found.</p>
        </GlassCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {tickets.map((ticket) => {
            const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.pending;
            const isDetailOpen = detailView === ticket._id;

            return (
              <GlassCard key={ticket._id} style={{ padding: "1rem", borderLeft: `4px solid ${status.color}` }}>
                {/* Top Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ background: status.bg, color: status.color, padding: "3px 10px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 700 }}>{status.label}</span>
                      <span style={{ background: "rgba(124,58,237,0.1)", color: "var(--primary)", padding: "3px 10px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 600 }}>{ticket.department}</span>
                      {ticket.priority === "high" && <span style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444", padding: "3px 10px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 600 }}>🔥 HIGH</span>}
                      {ticket.isVerifiedByUser && <span style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", padding: "3px 10px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 700 }}>✅ User Verified</span>}
                      {ticket.isVerifiedByAdmin && <span style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", padding: "3px 10px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 700 }}>🛡️ Admin Verified</span>}
                    </div>
                    <strong style={{ fontSize: "1.05rem" }}>{ticket.title}</strong>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: 2 }}>{ticket.description?.slice(0, 120)}{ticket.description?.length > 120 ? "..." : ""}</p>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 4 }}>
                      By {ticket.authorName} · {ticket.location && `📍 ${ticket.location}`} · {formatDate(ticket.createdAt)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <button onClick={() => setDetailView(isDetailOpen ? null : ticket._id)} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid var(--card-border, #e5e7eb)", background: "transparent", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4, color: "var(--text-primary)" }}>
                      <Eye size={14} /> {isDetailOpen ? "Hide" : "Details"}
                    </button>
                    {(ticket.status === "pending" || ticket.status === "reopened") && (
                      <button onClick={() => updateStatus(ticket._id, "in_progress")} disabled={updating} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "rgba(59,130,246,0.15)", color: "#3B82F6", fontWeight: 600, cursor: "pointer", fontSize: "0.8rem" }}>
                        🔵 Start Progress
                      </button>
                    )}
                    {ticket.status === "in_progress" && (
                      <button onClick={() => updateStatus(ticket._id, "resolved")} disabled={updating} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "rgba(16,185,129,0.15)", color: "#10B981", fontWeight: 600, cursor: "pointer", fontSize: "0.8rem" }}>
                        🟢 Resolve
                      </button>
                    )}
                    {ticket.status === "resolved" && !ticket.isVerifiedByUser && !ticket.isVerifiedByAdmin && (
                      <>
                        <button onClick={() => handleAdminVerify(ticket._id, true)} disabled={updating} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "rgba(16,185,129,0.15)", color: "#10B981", fontWeight: 600, cursor: "pointer", fontSize: "0.8rem" }}>
                          🏆 Approve Fix
                        </button>
                        <button onClick={() => handleAdminVerify(ticket._id, false)} disabled={updating} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "rgba(239,68,68,0.15)", color: "#EF4444", fontWeight: 600, cursor: "pointer", fontSize: "0.8rem" }}>
                          ❌ Reject Fix
                        </button>
                      </>
                    )}
                    {ticket.status === "reopened" && (
                      <button onClick={() => updateStatus(ticket._id, "resolved")} disabled={updating} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "rgba(16,185,129,0.15)", color: "#10B981", fontWeight: 600, cursor: "pointer", fontSize: "0.8rem" }}>
                        🟢 Re-Resolve
                      </button>
                    )}
                  </div>
                </div>

                {/* Detail Drawer */}
                <AnimatePresence>
                  {isDetailOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: "hidden", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--card-border, #e5e7eb)" }}
                    >
                      {ticket.image && (
                        <div style={{ marginBottom: "0.75rem" }}>
                          <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}><Image size={14} /> Issue Photo</label>
                          <img src={`http://localhost:5000${ticket.image}`} alt="Issue" style={{ maxHeight: 200, borderRadius: 12, objectFit: "cover", width: "100%" }} />
                        </div>
                      )}
                      {ticket.proofImage && (
                        <div style={{ marginBottom: "0.75rem" }}>
                          <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#10B981", display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}><Image size={14} /> Resolution Proof</label>
                          <img src={`http://localhost:5000${ticket.proofImage}`} alt="Proof" style={{ maxHeight: 200, borderRadius: 12, objectFit: "cover", width: "100%", border: "2px solid rgba(16,185,129,0.3)" }} />
                        </div>
                      )}
                      {ticket.resolvedBy && (
                        <p style={{ fontSize: "0.9rem" }}>Resolved by: <strong>{ticket.resolvedBy}</strong> {ticket.resolvedAt && `on ${formatDate(ticket.resolvedAt)}`}</p>
                      )}
                      {ticket.remarks && ticket.remarks.length > 0 && (
                        <div style={{ marginTop: "0.75rem" }}>
                          <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Remarks History:</label>
                          {ticket.remarks.map((r, i) => (
                            <div key={i} style={{ padding: "8px 10px", background: "var(--card-bg, rgba(255,255,255,0.5))", borderRadius: 8, marginTop: 6, fontSize: "0.85rem", borderLeft: `3px solid ${r.text?.startsWith("✅") ? "#10B981" : r.text?.startsWith("❌") ? "#EF4444" : "var(--primary)"}` }}>
                              <p style={{ margin: 0 }}>{r.text}</p>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 2 }}>
                                {r.addedByName && `— ${r.addedByName}`} {r.addedAt && `· ${formatDate(r.addedAt)}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            );
          })}
        </div>
      )}
      {/* End of tab content */}
        </motion.div>
      )}
    </motion.div>
  );
}
