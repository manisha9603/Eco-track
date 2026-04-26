export default function ProgressBar({ value, max, color = "var(--secondary)", height = 8, showLabel = false, className = "" }) {
  const percent = Math.min((value / max) * 100, 100);
  return (
    <div className={`progress-bar-wrapper ${className}`}>
      <div className="progress-bar-track" style={{ height }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${color}, var(--accent))`,
            height,
          }}
        />
      </div>
      {showLabel && (
        <span className="progress-bar-label">{Math.round(percent)}%</span>
      )}
    </div>
  );
}
