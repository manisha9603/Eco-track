import { motion } from "framer-motion";
import GlassCard from "./GlassCard";

export default function ActivityCard({ activity, selected, onSelect }) {
  return (
    <GlassCard
      className={`activity-card ${selected ? "selected" : ""}`}
      onClick={() => onSelect(activity.id)}
      layout
    >
      <div className="activity-card-icon">{activity.icon}</div>
      <div className="activity-card-content">
        <h3 className="activity-card-name">{activity.name}</h3>
        <div className="activity-card-meta">
          <span className="badge badge-points">+{activity.points} pts</span>
          <span className="badge badge-co2">-{activity.co2} kg CO₂</span>
        </div>
        <span className="activity-card-unit">per {activity.unit}</span>
      </div>
      {selected && (
        <motion.div
          className="activity-card-check"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          ✓
        </motion.div>
      )}
    </GlassCard>
  );
}
