export const formatTime = (seconds: number): string => {
  const d = Math.floor(seconds / 86400); // 1 ngày = 86400s
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  let str = "";
  if (d > 0) str += `${d}d`;
  if (h > 0) str += `${h}h`;
  if (m > 0) str += `${m}m`;
  if (s > 0 || str === "") str += `${s}s`;
  return str;
};
