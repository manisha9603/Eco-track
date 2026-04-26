import { FAKE_USERS } from "./constants";

// ─── Rank Calculation ────────────────────────────────────────────
export function calculateRank(userPoints) {
  const allPoints = [...FAKE_USERS.map((u) => u.points), userPoints];
  allPoints.sort((a, b) => b - a);
  return allPoints.indexOf(userPoints) + 1;
}

export function getTotalParticipants() {
  return FAKE_USERS.length + 1;
}

// ─── CO₂ Impact Equivalents ─────────────────────────────────────
export function treesEquivalent(co2Kg) {
  return (co2Kg / 21).toFixed(1);
}

export function kmNotDriven(co2Kg) {
  return (co2Kg / 0.21).toFixed(1);
}

export function plasticBagsAvoided(co2Kg) {
  return Math.round(co2Kg / 0.008);
}

// ─── Greeting ────────────────────────────────────────────────────
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Streak Calculation ─────────────────────────────────────────
export function calculateStreak(activities) {
  if (!activities || activities.length === 0) return 0;

  const dates = [...new Set(activities.map((a) => new Date(a.timestamp).toDateString()))];
  dates.sort((a, b) => new Date(b) - new Date(a));

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const curr = new Date(dates[i]);
    const prev = new Date(dates[i + 1]);
    const diff = (curr - prev) / 86400000;
    if (Math.round(diff) === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ─── Weekly Points ───────────────────────────────────────────────
export function getWeeklyPointsData(activities) {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });

    const dayPoints = (activities || [])
      .filter((a) => new Date(a.timestamp).toDateString() === dateStr)
      .reduce((sum, a) => sum + a.pointsEarned, 0);

    data.push({ day: dayLabel, points: dayPoints });
  }
  return data;
}

// ─── Total Community CO₂ ────────────────────────────────────────
export function getCommunityTotal(userCO2) {
  const fakeCO2 = FAKE_USERS.reduce((sum, u) => sum + u.co2, 0);
  return (fakeCO2 + userCO2).toFixed(1);
}

// ─── Percentile Calculation ─────────────────────────────────────
export function getUserPercentile(userPoints) {
  const below = FAKE_USERS.filter((u) => u.points < userPoints).length;
  return Math.round((below / FAKE_USERS.length) * 100);
}
