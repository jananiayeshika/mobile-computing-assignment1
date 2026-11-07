/** Small formatting helpers shared by several screens. */

/** 75_000 -> "1m 15s" */
export function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

/** Timestamp -> "Sat 7 Nov, 3:45 PM" */
export function formatDateTime(timestamp) {
  return new Date(timestamp).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Timestamp -> "3:45:12 PM" */
export function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/** 41250 -> "41.3k" */
export function formatCount(count) {
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
}
