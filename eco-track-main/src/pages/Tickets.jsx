import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ticketAPI } from "../utils/api";
import { showToast } from "../components/Toast";
import GlassCard from "../components/GlassCard";
import Loader from "../components/Loader";
import { pageVariants, staggerContainer, staggerItem } from "../utils/animations";
import { Plus, Clock, CheckCircle, AlertTriangle, RotateCcw, ThumbsUp, ThumbsDown, X, Eye, User, Calendar, MessageSquare, Image, Upload } from "lucide-react";

const STATUS_CONFIG = {
  pending: { bg: "rgba(245,158,11,0.15)", color: "#F59E0B", label: "🟡 Pending", icon: Clock },
  in_progress: { bg: "rgba(59,130,246,0.15)", color: "#3B82F6", label: "🔵 In Progress", icon: AlertTriangle },
  resolved: { bg: "rgba(16,185,129,0.15)", color: "#10B981", label: "🟢 Resolved", icon: CheckCircle },
  reopened: { bg: "rgba(239,68,68,0.15)", color: "#EF4444", label: "🔴 Reopened", icon: RotateCcw },
};

const PRIORITY_COLORS = {
  low: { bg: "rgba(107,114,128,0.15)", color: "#6B7280" },
  medium: { bg: "rgba(245,158,11,0.15)", color: "#F59E0B" },
  high: { bg: "rgba(239,68,68,0.15)", color: "#EF4444" },
};

export default function Tickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  
  // Student resolve modal state
  const [resolveModal, setResolveModal] = useState(null);
  const [remark, setRemark] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => { fetchTickets(); }, [tab, statusFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = tab === "mine" ? await ticketAPI.getMine() : await ticketAPI.getAll(params);
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (ticketId, satisfied) => {
    try {
      await ticketAPI.verify(ticketId, satisfied);
      if (satisfied) {
        showToast("✅ Thank you! Issue marked as resolved. +5 pts!", "success");
      } else {
        showToast("🔴 Ticket reopened. Admin will look into it again.", "warning");
      }
      fetchTickets();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to verify ticket", "error");
    }
  };

  const handleStudentResolve = async () => {
    if (!resolveModal) return;
    if (!proofFile) {
      showToast("❌ Proof photo is necessary to resolve this ticket!", "warning");
      return;
    }
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("status", "resolved");
      if (remark.trim()) formData.append("remark", remark.trim());
      formData.append("proofImage", proofFile);

      await ticketAPI.updateWithProof(resolveModal, formData);
      showToast("🎉 Awesome! Please wait for verification to receive your 50 points.", "success");
      setResolveModal(null);
      setRemark("");
      setProofFile(null);
      setProofPreview(null);
      fetchTickets();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to resolve", "error");
    } finally {
      setUpdating(false);
    }
  };

  const timeAgo = (date) => {
    if (!date) return "";
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <motion.div className="page" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ padding: 20 }}>
      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} onClick={(e) => e.stopPropagation()} style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
              <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: -40, right: 0, background: "rgba(255,255,255,0.2)", border: "none", color: "white", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={20} /></button>
              <img src={lightbox} alt="Full size" style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: 12, objectFit: "contain" }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student Resolve Modal */}
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
                <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}><CheckCircle size={22} style={{ color: "#10B981" }} /> I Solved This!</h2>
                <button onClick={() => setResolveModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}><X size={20} /></button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: 4, fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                    <MessageSquare size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> How did you fix it?
                  </label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="Describe what you did to fix the problem..."
                    style={{ width: "100%", padding: "0.85rem", borderRadius: 12, border: "1px solid var(--card-border, #e5e7eb)", background: "var(--bg-secondary, #f0fdf4)", color: "var(--text-primary)", fontSize: "1rem", minHeight: 100, resize: "vertical", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 4, fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)" }}>
                    <Upload size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Upload Proof Photo
                  </label>
                  <div
                    onClick={() => document.getElementById("student-proof-upload").click()}
                    style={{ border: "2px dashed var(--card-border, #e5e7eb)", borderRadius: 12, padding: "1.2rem", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    <input type="file" id="student-proof-upload" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files[0]; if (f) { setProofFile(f); setProofPreview(URL.createObjectURL(f)); } }} />
                    {proofPreview ? (
                      <div>
                        <img src={proofPreview} alt="Proof preview" style={{ maxHeight: 150, borderRadius: 8, marginBottom: 8 }} />
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Click to change</p>
                      </div>
                    ) : (
                      <div>
                        <Upload size={28} style={{ color: "var(--text-secondary)", marginBottom: 6 }} />
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Upload a clear photo proving the issue is fixed</p>
                      </div>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleStudentResolve}
                  disabled={updating}
                  style={{ background: "#10B981", color: "white", padding: "14px", borderRadius: 14, fontWeight: 700, border: "none", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}
                >
                  {updating ? "Submitting..." : <><CheckCircle size={18} /> Submit Solution</>}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="page-title">🎟️ Campus Issues</h1>
          <p className="page-subtitle">Report, track, and verify campus problem resolution</p>
        </div>
        <Link to="/tickets/create" style={{ display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#7C3AED,#10B981)", color: "white", padding: "12px 24px", borderRadius: 14, fontWeight: 600, textDecoration: "none", fontSize: "0.95rem" }}>
          <Plus size={18} /> Report Issue
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {["all", "mine"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 20px", borderRadius: 100, border: "none", background: tab === t ? "var(--primary)" : "var(--card-bg, rgba(255,255,255,0.6))", color: tab === t ? "white" : "var(--text-primary)", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem", transition: "all 0.2s" }}>
            {t === "all" ? "All Tickets" : "My Tickets"}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["", "pending", "in_progress", "resolved", "reopened"].map((s) => {
            const conf = STATUS_CONFIG[s];
            return (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "6px 14px", borderRadius: 100, border: statusFilter === s ? "2px solid var(--primary)" : "1px solid var(--card-border, #e5e7eb)", background: statusFilter === s ? "rgba(124,58,237,0.08)" : "transparent", color: "var(--text-primary)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 500, transition: "all 0.2s" }}>
                {s === "" ? "All" : conf?.label?.replace(/^.{2}/, "") || s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ticket List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}><Loader size={40} text="Loading tickets..." /></div>
      ) : tickets.length === 0 ? (
        <GlassCard style={{ padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎟️</div>
          <h3 style={{ marginBottom: "0.5rem" }}>All clear! Campus looks good 🏫</h3>
          <p style={{ color: "var(--text-secondary)" }}>No tickets found. Be the first to report an issue!</p>
        </GlassCard>
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {tickets.map((ticket) => {
            const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.pending;
            const priority = PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.medium;
            const isExpanded = expanded === ticket._id;
            const isMyTicket = ticket.createdBy === user?._id;
            const canVerify = isMyTicket && ticket.status === "resolved" && !ticket.isVerifiedByUser;

            return (
              <motion.div key={ticket._id} variants={staggerItem} layout>
                <GlassCard
                  style={{
                    padding: "1.2rem",
                    cursor: "pointer",
                    borderLeft: `4px solid ${status.color}`,
                    transition: "all 0.3s",
                    ...(ticket.isVerifiedByUser ? { background: "rgba(16,185,129,0.05)" } : {}),
                  }}
                  onClick={() => setExpanded(isExpanded ? null : ticket._id)}
                >
                  {/* Header Row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                        <motion.span
                          layout
                          style={{ background: status.bg, color: status.color, padding: "4px 12px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}
                        >
                          {status.label}
                        </motion.span>
                        <span style={{ background: priority.bg, color: priority.color, padding: "3px 10px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 600 }}>{ticket.priority?.toUpperCase()}</span>
                        <span style={{ background: "rgba(124,58,237,0.1)", color: "var(--primary)", padding: "3px 10px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 600 }}>{ticket.department}</span>
                        {ticket.isVerifiedByUser && (
                          <span style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", padding: "3px 10px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 700 }}>✅ Verified</span>
                        )}
                        {ticket.isVerifiedByAdmin && (
                          <span style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", padding: "3px 10px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 700 }}>🛡️ Admin Verified</span>
                        )}
                        {isMyTicket && (
                          <span style={{ background: "rgba(124,58,237,0.1)", color: "var(--primary)", padding: "3px 10px", borderRadius: 100, fontSize: "0.7rem", fontWeight: 600 }}>YOUR TICKET</span>
                        )}
                      </div>
                      <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{ticket.title || "Untitled"}</h3>
                      {!isExpanded && (
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 500 }}>
                          {ticket.description}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{timeAgo(ticket.createdAt)}</div>
                      {ticket.location && (
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 2 }}>
                          📍 {ticket.location} {ticket.roomNumber && `- ${ticket.roomNumber}`}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--card-border, #e5e7eb)" }}>
                          {/* Description */}
                          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1rem" }}>{ticket.description}</p>

                          {/* Issue Image */}
                          {ticket.image && (
                            <div style={{ marginBottom: "1rem" }}>
                              <label style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                                <Image size={14} /> Issue Photo
                              </label>
                              <img
                                src={`http://localhost:5000${ticket.image}`}
                                alt="Issue"
                                style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12, cursor: "pointer" }}
                                onClick={(e) => { e.stopPropagation(); setLightbox(`http://localhost:5000${ticket.image}`); }}
                              />
                            </div>
                          )}

                          {/* Resolution Info */}
                          {(ticket.status === "resolved" || ticket.resolvedBy) && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              style={{ background: "rgba(16,185,129,0.08)", borderRadius: 12, padding: "1rem", marginBottom: "1rem", border: "1px solid rgba(16,185,129,0.2)" }}
                            >
                              <h4 style={{ color: "#10B981", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                                <CheckCircle size={16} /> Resolution Details
                              </h4>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: "0.9rem" }}>
                                {ticket.resolvedBy && (
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <User size={14} style={{ color: "var(--text-secondary)" }} />
                                    <span>Resolved by <strong>{ticket.resolvedBy}</strong></span>
                                  </div>
                                )}
                                {ticket.resolvedAt && (
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <Calendar size={14} style={{ color: "var(--text-secondary)" }} />
                                    <span>{formatDate(ticket.resolvedAt)}</span>
                                  </div>
                                )}
                              </div>

                              {/* Proof Image */}
                              {ticket.proofImage && (
                                <div style={{ marginTop: "0.75rem" }}>
                                  <label style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                                    <Image size={14} /> Resolution Proof
                                  </label>
                                  <img
                                    src={`http://localhost:5000${ticket.proofImage}`}
                                    alt="Resolution proof"
                                    style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12, cursor: "pointer", border: "2px solid rgba(16,185,129,0.3)" }}
                                    onClick={(e) => { e.stopPropagation(); setLightbox(`http://localhost:5000${ticket.proofImage}`); }}
                                  />
                                </div>
                              )}
                            </motion.div>
                          )}

                          {/* Remarks Timeline */}
                          {ticket.remarks && ticket.remarks.length > 0 && (
                            <div style={{ marginBottom: "1rem" }}>
                              <label style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
                                <MessageSquare size={14} /> Activity Timeline
                              </label>
                              <div style={{ borderLeft: "2px solid var(--card-border, #e5e7eb)", paddingLeft: "1rem", display: "flex", flexDirection: "column", gap: 8 }}>
                                {ticket.remarks.map((r, i) => (
                                  <div key={i} style={{ position: "relative" }}>
                                    <div style={{ position: "absolute", left: "-1.35rem", top: 4, width: 10, height: 10, borderRadius: "50%", background: r.text?.startsWith("✅") ? "#10B981" : r.text?.startsWith("❌") ? "#EF4444" : "var(--primary)" }} />
                                    <div style={{ padding: "8px 12px", background: "var(--card-bg, rgba(255,255,255,0.5))", borderRadius: 10, fontSize: "0.9rem" }}>
                                      <p style={{ margin: 0 }}>{r.text}</p>
                                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 4 }}>
                                        {r.addedByName && <span>— {r.addedByName}</span>}
                                        {r.addedAt && <span> · {formatDate(r.addedAt)}</span>}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Submitted By */}
                          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                            Reported by <strong>{ticket.authorName || "Anonymous"}</strong> · {formatDate(ticket.createdAt)}
                          </div>

                          {/* Student can resolve someone else's ticket */}
                          {!isMyTicket && (ticket.status === "pending" || ticket.status === "in_progress") && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={(e) => { e.stopPropagation(); setResolveModal(ticket._id); }}
                              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #10B981, #059669)", color: "white", fontWeight: 700, fontSize: "1rem", cursor: "pointer", boxShadow: "0 4px 20px rgba(16,185,129,0.3)", marginBottom: "1rem" }}
                            >
                              🛠️ I Fixed This! (Upload Photo)
                            </motion.button>
                          )}

                          {/* ✅ User Verification Buttons */}
                          {canVerify && !ticket.isVerifiedByAdmin && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(16,185,129,0.08))", borderRadius: 16, padding: "1.2rem", border: "2px dashed rgba(124,58,237,0.2)" }}
                            >
                              <h4 style={{ marginBottom: 8, textAlign: "center" }}>Is this issue resolved to your satisfaction?</h4>
                              <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                                Your feedback ensures accountability and helps improve campus.
                              </p>
                              <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => { e.stopPropagation(); handleVerify(ticket._id, true); }}
                                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 14, border: "none", background: "#10B981", color: "white", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 4px 20px rgba(16,185,129,0.3)" }}
                                >
                                  <ThumbsUp size={18} /> Satisfied ✔
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => { e.stopPropagation(); handleVerify(ticket._id, false); }}
                                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 14, border: "none", background: "#EF4444", color: "white", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 4px 20px rgba(239,68,68,0.3)" }}
                                >
                                  <ThumbsDown size={18} /> Not Fixed ❌
                                </motion.button>
                              </div>
                            </motion.div>
                          )}

                          {/* Already verified message */}
                          {isMyTicket && ticket.isVerifiedByUser && (
                            <div style={{ textAlign: "center", padding: "1rem", background: "rgba(16,185,129,0.08)", borderRadius: 12 }}>
                              <CheckCircle size={24} style={{ color: "#10B981", marginBottom: 4 }} />
                              <p style={{ color: "#10B981", fontWeight: 600 }}>You confirmed this issue is resolved ✅</p>
                            </div>
                          )}
                          
                          {/* Admin verified message */}
                          {ticket.isVerifiedByAdmin && (
                            <div style={{ textAlign: "center", padding: "1rem", background: "rgba(124,58,237,0.08)", borderRadius: 12 }}>
                              <Shield size={24} style={{ color: "#7C3AED", marginBottom: 4 }} />
                              <p style={{ color: "#7C3AED", fontWeight: 600 }}>This fix was officially verified by an Admin 🛡️</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
