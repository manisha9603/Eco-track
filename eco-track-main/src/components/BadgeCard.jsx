import { motion } from "framer-motion";
import ProgressBar from "./ProgressBar";
import { Lock } from "lucide-react";

export default function BadgeCard({ badge, unlocked, claimed, progress, onClaim, index = 0 }) {
  return (
    <motion.div
      className={`badge-card ${unlocked ? "unlocked" : "locked"} ${claimed ? "claimed" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={unlocked ? { scale: 1.05, y: -4 } : {}}
    >
      <div className={`badge-icon-wrap ${unlocked ? "glow" : ""}`}>
        <span className="badge-icon">{badge.icon}</span>
        {!unlocked && (
          <div className="badge-lock-overlay">
            <Lock size={20} />
          </div>
        )}
      </div>
      <h3 className="badge-name">{badge.name}</h3>
      <p className="badge-desc">{badge.desc}</p>
      {!unlocked && (
        <ProgressBar
          value={progress}
          max={badge.required}
          height={6}
          className="badge-progress"
        />
      )}
      {!unlocked && (
        <span className="badge-progress-text">
          {progress} / {badge.required}
        </span>
      )}
      {unlocked && !claimed && (
        <motion.button
          className="badge-claim-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onClaim(badge.id)}
        >
          Claim
        </motion.button>
      )}
      {claimed && <span className="badge-claimed-tag">✅ Claimed</span>}
    </motion.div>
  );
}
