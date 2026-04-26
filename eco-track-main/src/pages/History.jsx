import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";
import AnimatedCounter from "../components/AnimatedCounter";
import { PlusCircle, Leaf, Zap, Activity } from "lucide-react";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20 },
};

export default function History({ ecoData }) {
  const { activities, points, totalCO2 } = ecoData;

  // Group by date
  const grouped = useMemo(() => {
    const groups = {};
    const sorted = [...activities].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    sorted.forEach((act) => {
      const date = new Date(act.timestamp).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(act);
    });
    return groups;
  }, [activities]);

  const dateKeys = Object.keys(grouped);

  return (
    <motion.div className="page history-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="page-header">
        <h1 className="page-title">📜 Activity History</h1>
        <p className="page-subtitle">Your sustainability journey so far</p>
      </div>

      {/* Summary */}
      <div className="history-summary">
        <GlassCard className="summary-card">
          <Activity size={20} />
          <div>
            <span className="summary-value"><AnimatedCounter target={activities.length} /></span>
            <span className="summary-label">Activities</span>
          </div>
        </GlassCard>
        <GlassCard className="summary-card">
          <Zap size={20} />
          <div>
            <span className="summary-value"><AnimatedCounter target={points} /></span>
            <span className="summary-label">Points</span>
          </div>
        </GlassCard>
        <GlassCard className="summary-card">
          <Leaf size={20} />
          <div>
            <span className="summary-value"><AnimatedCounter target={totalCO2} decimals={2} suffix=" kg" /></span>
            <span className="summary-label">CO₂ Saved</span>
          </div>
        </GlassCard>
      </div>

      {/* Activity List */}
      {dateKeys.length === 0 ? (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="empty-icon">🌱</span>
          <h2>No activities yet</h2>
          <p>Start your eco journey!</p>
          <Link to="/activities" className="empty-cta">
            <PlusCircle size={18} /> Log Your First Activity
          </Link>
        </motion.div>
      ) : (
        <div className="history-list">
          {dateKeys.map((date, gi) => (
            <div key={date} className="history-group">
              <div className="history-date-header">
                <span className="history-date">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {grouped[date].map((act, i) => (
                <motion.div
                  key={act.timestamp + i}
                  className="history-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (gi * grouped[date].length + i) * 0.04 }}
                >
                  <span className="history-item-icon">{act.icon}</span>
                  <div className="history-item-info">
                    <span className="history-item-name">{act.name}</span>
                    <span className="history-item-detail">
                      ×{act.quantity} {act.unit}
                    </span>
                  </div>
                  <div className="history-item-stats">
                    <span className="history-item-points">+{act.pointsEarned} pts</span>
                    <span className="history-item-co2">-{act.co2Saved} kg</span>
                  </div>
                  <span className="history-item-time">
                    {new Date(act.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
