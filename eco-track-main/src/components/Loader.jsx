import { motion } from "framer-motion";

export default function Loader({ size = 40, text = "" }) {
  return (
    <div className="loader-wrapper">
      <motion.div
        className="loader-spinner"
        style={{ width: size, height: size }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 50 50" width={size} height={size}>
          <circle
            cx="25" cy="25" r="20"
            fill="none"
            stroke="url(#loaderGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="80 200"
          />
          <defs>
            <linearGradient id="loaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
}
