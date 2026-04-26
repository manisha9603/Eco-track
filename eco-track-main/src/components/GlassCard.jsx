import { motion } from "framer-motion";

export default function GlassCard({ children, className = "", onClick, glowColor, style = {}, ...props }) {
  return (
    <motion.div
      className={`glass-card ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      style={{
        ...(glowColor ? { boxShadow: `0 8px 32px rgba(0,0,0,0.08), ${glowColor}` } : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
