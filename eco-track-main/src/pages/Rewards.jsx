import { useMemo } from "react";
import { motion } from "framer-motion";
import BadgeCard from "../components/BadgeCard";
import GlassCard from "../components/GlassCard";
import ProgressBar from "../components/ProgressBar";
import { showToast } from "../components/Toast";
import { BADGES, REWARD_TIERS } from "../utils/constants";
import confetti from "canvas-confetti";
import { Award, ChevronRight } from "lucide-react";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20 },
};

export default function Rewards({ ecoData }) {
  const { points, totalCO2, activities, badges, claimBadge } = ecoData;

  const badgeStatus = useMemo(() => {
    return BADGES.map((badge) => {
      let progress = 0;
      if (badge.type === "activities") progress = activities.length;
      else if (badge.type === "points") progress = points;
      else if (badge.type === "co2") progress = totalCO2;

      return {
        ...badge,
        progress: Math.min(progress, badge.required),
        unlocked: progress >= badge.required,
        claimed: badges.includes(badge.id),
      };
    });
  }, [points, totalCO2, activities, badges]);

  const handleClaim = (badgeId) => {
    const success = claimBadge(badgeId);
    if (success) {
      const badge = BADGES.find((b) => b.id === badgeId);
      confetti({
        particleCount: 200,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#7C3AED", "#10B981", "#34D399", "#F59E0B"],
      });
      showToast(`🏅 Badge unlocked: ${badge.name}!`, "success");
    }
  };

  // Current reward tier
  const currentTierIdx = REWARD_TIERS.findIndex((t) => points < t.points);
  const currentTier = currentTierIdx === -1 ? REWARD_TIERS.length - 1 : currentTierIdx;

  return (
    <motion.div className="page rewards-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="page-header">
        <h1 className="page-title">🎁 Rewards & Badges</h1>
        <p className="page-subtitle">Unlock achievements and claim your rewards</p>
      </div>

      {/* Badge Grid */}
      <section className="badges-section">
        <h2 className="section-title"><Award size={20} /> Badges</h2>
        <div className="badge-grid">
          {badgeStatus.map((badge, i) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              unlocked={badge.unlocked}
              claimed={badge.claimed}
              progress={badge.progress}
              onClaim={handleClaim}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Reward Journey */}
      <section className="rewards-journey-section">
        <h2 className="section-title">🏆 Reward Journey</h2>
        <div className="rewards-journey">
          {REWARD_TIERS.map((tier, i) => {
            const reached = points >= tier.points;
            const isCurrent = i === currentTier && !reached;
            const prevPoints = i > 0 ? REWARD_TIERS[i - 1].points : 0;
            const progressInTier = isCurrent
              ? ((points - prevPoints) / (tier.points - prevPoints)) * 100
              : reached ? 100 : 0;

            return (
              <motion.div
                key={tier.points}
                className={`journey-step ${reached ? "reached" : ""} ${isCurrent ? "current" : ""}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="journey-indicator">
                  <div className={`journey-dot ${reached ? "filled" : ""}`}>
                    {reached ? "✓" : i + 1}
                  </div>
                  {i < REWARD_TIERS.length - 1 && <div className="journey-line" />}
                </div>
                <GlassCard className={`journey-card ${isCurrent ? "highlight" : ""}`}>
                  <div className="journey-card-content">
                    <h3>{tier.reward}</h3>
                    <span className="journey-pts">{tier.points.toLocaleString()} pts</span>
                    {isCurrent && (
                      <div className="journey-progress">
                        <ProgressBar value={points - prevPoints} max={tier.points - prevPoints} height={6} />
                        <span className="journey-remaining">
                          {tier.points - points} points to go
                        </span>
                      </div>
                    )}
                  </div>
                  {reached && <span className="journey-check">🎉</span>}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
