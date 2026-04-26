import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Users, ShieldAlert, Award, ArrowRight, ShieldCheck, Zap, Activity } from 'lucide-react';
import GlassCard from '../components/GlassCard';

// -------------------------------------------------------------
// Tilt Card wrapper for 3D mouse tracking
// -------------------------------------------------------------
const TiltCard = ({ children, className = "", style = {} }) => {
  const ref = useRef(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12.5deg", "-12.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12.5deg", "12.5deg"]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        ...style
      }}
      className={`perspective-1000 ${className}`}
    >
      <div style={{ transform: "translateZ(50px)" }}>
        {children}
      </div>
    </motion.div>
  );
};

// -------------------------------------------------------------
// Animated Counter Component
// -------------------------------------------------------------
const AnimatedCounter = ({ from = 0, to, duration = 2, suffix = "" }) => {
  const [count, setCount] = useState(from);
  
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setCount(Math.floor(progress * (to - from) + from));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [from, to, duration]);

  return <span>{count}{suffix}</span>;
};

// -------------------------------------------------------------
// Main Home Component
// -------------------------------------------------------------
export default function Home() {
  const navigate = useNavigate();
  
  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", background: "var(--bg, #F0FDF4)" }}>
      
      {/* Background Blobs (Using same CSS animations defined for login) */}
      <div className="login-bg preserve-3d">
        <div className="blob blob-1" style={{ width: 600, height: 600, top: "-200px", left: "-100px", background: "rgba(124, 58, 237, 0.2)" }}></div>
        <div className="blob blob-2" style={{ width: 500, height: 500, bottom: "-100px", right: "-100px", background: "rgba(16, 185, 129, 0.15)" }}></div>
      </div>

      {/* Modern Transparent Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "1.5rem", fontWeight: 800, color: "var(--primary, #7C3AED)" }}>
          <span>🌱</span> EcoTrack <span style={{ color: "var(--secondary, #10B981)" }}>Pro</span>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={() => navigate("/login")} style={{ padding: "10px 24px", borderRadius: 100, background: "transparent", border: "2px solid rgba(124,58,237,0.3)", color: "var(--primary, #7C3AED)", fontWeight: 700, cursor: "pointer", transition: "all 0.3s" }}>
            Login
          </button>
          <button onClick={() => navigate("/register")} style={{ padding: "10px 24px", borderRadius: 100, background: "linear-gradient(135deg, #7C3AED, #10B981)", border: "none", color: "white", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 15px rgba(124,58,237,0.3)", transition: "all 0.3s" }}>
            Get Started
          </button>
        </div>
      </motion.header>

      {/* --- HERO SECTION --- */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px 20px 60px", maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4rem", width: "100%" }}>
          
          {/* Left: Typography & CTAs */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ flex: "1 1 500px" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div style={{ display: "inline-block", padding: "6px 16px", background: "rgba(16,185,129,0.15)", color: "#10B981", borderRadius: 100, fontWeight: 700, fontSize: "0.85rem", marginBottom: "1.5rem", letterSpacing: "1px" }}>
                🚀 BUILT FOR HACKFORGE 2.0
              </div>
              <h1 style={{ fontSize: "clamp(3rem, 5vw, 4.5rem)", fontWeight: 900, lineHeight: 1.1, color: "var(--text-primary, #1F2937)", marginBottom: "1.5rem", letterSpacing: "-1px" }}>
                Build a Smarter,<br/>
                <span className="grad-text">Greener Campus 🌱</span>
              </h1>
              <p style={{ fontSize: "1.2rem", color: "var(--text-secondary, #6B7280)", lineHeight: 1.6, marginBottom: "2.5rem", maxWidth: 480 }}>
                Track sustainability, report campus issues, verification-driven rewards, and compete with your peers in one powerful platform.
              </p>
              
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/register")}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 32px", borderRadius: 100, background: "linear-gradient(135deg, #7C3AED, #5B21B6)", color: "white", fontWeight: 700, fontSize: "1.1rem", border: "none", cursor: "pointer", boxShadow: "0 10px 30px rgba(124,58,237,0.4)" }}
                >
                  Start Your Journey <ArrowRight size={20} />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{ padding: "16px 32px", borderRadius: 100, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(10px)", color: "var(--text-primary)", fontWeight: 700, fontSize: "1.1rem", border: "1px solid rgba(0,0,0,0.05)", cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}
                >
                  View Features
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: 3D Floating Visual Stack */}
          <div style={{ flex: "1 1 400px", position: "relative", height: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.div
              animate={{ y: [-15, 15] }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 4, ease: "easeInOut" }}
              style={{ position: "relative", width: "100%", height: "100%", perspective: 1000 }}
            >
              {/* Feature Card 1 (Back left) */}
              <TiltCard 
                style={{ position: "absolute", top: "10%", left: "5%", zIndex: 1, filter: "blur(1px)" }}
              >
                <GlassCard style={{ padding: "1.5rem", width: 280, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(16,185,129,0.3)", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ padding: 10, background: "rgba(16,185,129,0.15)", borderRadius: 12, color: "#10B981" }}><Leaf size={24} /></div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "1rem" }}>Eco Points</h4>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>Rank: Silver</p>
                    </div>
                  </div>
                  <h2 style={{ fontSize: "2rem", margin: 0, color: "var(--text-primary)", fontWeight: 800 }}>845 <span style={{ fontSize: "1rem", color: "var(--text-secondary)", fontWeight: 500 }}>pts</span></h2>
                </GlassCard>
              </TiltCard>

              {/* Feature Card 2 (Center Primary) */}
              <TiltCard 
                style={{ position: "absolute", top: "35%", left: "15%", zIndex: 3 }}
              >
                <GlassCard style={{ padding: "1.5rem", width: 320, background: "rgba(255,255,255,0.95)", border: "1px solid rgba(124,58,237,0.3)", boxShadow: "0 30px 60px rgba(124,58,237,0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ padding: "4px 10px", background: "rgba(16,185,129,0.15)", color: "#10B981", borderRadius: 100, fontSize: "0.75rem", fontWeight: 700 }}>🟢 Resolved</span>
                      <span style={{ padding: "4px 10px", background: "rgba(124,58,237,0.1)", color: "var(--primary)", borderRadius: 100, fontSize: "0.75rem", fontWeight: 700 }}>🛡️ Admin</span>
                    </div>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>2h ago</span>
                  </div>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: 6 }}>Library AC Leaking Water</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: 16 }}>Fixed the compressor line. Please verify the fix to claim points.</p>
                  <div style={{ width: "100%", height: 60, borderRadius: 8, background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(124,58,237,0.1))", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontSize: "0.85rem", fontWeight: 600 }}>
                    +50 Points Awarded
                  </div>
                </GlassCard>
              </TiltCard>

              {/* Feature Card 3 (Front Right) */}
              <motion.div animate={{ y: [-10, 10] }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 3, ease: "easeInOut" }}>
                <TiltCard 
                  style={{ position: "absolute", top: "60%", right: "0%", zIndex: 2 }}
                >
                  <GlassCard style={{ padding: "1.2rem", width: 240, background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 15px 30px rgba(0,0,0,0.08)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #F59E0B, #EF4444)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800 }}>#1</div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Jane Doe</h4>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)" }}>1,250 pts 🔥</p>
                      </div>
                    </div>
                  </GlassCard>
                </TiltCard>
              </motion.div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* --- STATISTICS IMPACT SECTION --- */}
      <section style={{ padding: "4rem 20px", background: "white", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2rem", textAlign: "center" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 style={{ fontSize: "3rem", margin: 0, fontWeight: 900, color: "var(--primary)" }}><AnimatedCounter from={0} to={500} suffix="+" /></h3>
            <p style={{ color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.9rem" }}>Active Students</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <h3 style={{ fontSize: "3rem", margin: 0, fontWeight: 900, color: "#10B981" }}><AnimatedCounter from={0} to={1200} suffix="+" /></h3>
            <p style={{ color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.9rem" }}>Issues Resolved</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <h3 style={{ fontSize: "3rem", margin: 0, fontWeight: 900, color: "#F59E0B" }}><AnimatedCounter from={0} to={300} suffix=" kg" /></h3>
            <p style={{ color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, fontSize: "0.9rem" }}>CO₂ Saved</p>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="features-section" style={{ padding: "6rem 20px", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>A Campus Platform That Actually Works</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: 600, margin: "0 auto" }}>We combined utility with gamification to ensure students actively participate in maintaining their campus.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
            {[
              { icon: <ShieldAlert size={32} />, title: "Smart Issue Reporting", desc: "Report campus maintenance issues with photos and precise locations. Track them from pending to resolved.", color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
              { icon: <ShieldCheck size={32} />, title: "Dual Verification", desc: "Tickets are only fully resolved when the original creator or an Admin officially verifies the fix, ensuring accountability.", color: "#10B981", bg: "rgba(16,185,129,0.1)" },
              { icon: <Award size={32} />, title: "Gamified Leaderboard", desc: "Earn points for reporting issues, solving campus problems, and staying active. Compete globally across departments.", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
              { icon: <Activity size={32} />, title: "Real-time Impact", desc: "Watch your carbon footprint shrink as you log daily tasks and participate in eco-friendly campus initiatives.", color: "#7C3AED", bg: "rgba(124,58,237,0.1)" },
            ].map((f, i) => (
              <motion.div key={i} whileHover={{ y: -10 }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <GlassCard style={{ padding: "2rem", height: "100%", borderTop: `4px solid ${f.color}` }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: f.bg, color: f.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>{f.title}</h3>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "0.95rem" }}>{f.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS / TIMELINE --- */}
      <section style={{ padding: "5rem 20px 8rem", background: "rgba(255,255,255,0.4)", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "3rem" }}>How It Works</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", position: "relative" }}>
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 4, background: "rgba(124,58,237,0.1)", transform: "translateX(-50%)", borderRadius: 4 }} className="timeline-line"></div>
            
            {[
              { step: 1, title: "Report an Issue", desc: "See a broken chair or leaking tap? Snap a photo and submit a ticket. Earn +5 points just for reporting." },
              { step: 2, title: "Take Action", desc: "Admins or other students can claim the ticket, fix the issue, and upload photo proof of resolution." },
              { step: 3, title: "Verify & Earn", desc: "The creator verifies the fix. Once verified, the problem solver gets a massive +50 points bounty!" },
              { step: 4, title: "Climb Ranks", desc: "Accumulate points to level up your badge, appear on the leaderboard, and unlock campus rewards." }
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} style={{ display: "flex", justifyContent: "center", position: "relative" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #10B981)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.2rem", position: "absolute", left: "50%", transform: "translate(-50%, 0)", zIndex: 2, boxShadow: "0 0 0 8px var(--bg)" }}>
                  {s.step}
                </div>
                <div style={{ width: "50%", padding: i % 2 === 0 ? "0 3rem 0 0" : "0 0 0 3rem", textAlign: i % 2 === 0 ? "right" : "left", marginLeft: i % 2 === 0 ? 0 : "auto", marginRight: i % 2 === 0 ? "auto" : 0, paddingTop: 6 }}>
                  <h4 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>{s.title}</h4>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={{ background: "white", borderTop: "1px solid rgba(0,0,0,0.05)", padding: "2rem", textAlign: "center", position: "relative", zIndex: 10 }}>
        <p style={{ margin: 0, fontWeight: 700, color: "var(--primary)", fontSize: "1.1rem" }}>EcoTrack Pro 🌱</p>
        <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>Engineered for HackForge 2.0 Hackathon • Built with 💧 and ⚡</p>
      </footer>

      {/* Internal responsive tweak for timeline on small screens */}
      <style>{`
        @media (max-width: 768px) {
          .timeline-line { left: 20px !important; }
          .timeline-line + div { align-items: flex-start !important; }
        }
      `}</style>
    </div>
  );
}
