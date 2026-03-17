export function toISODateString(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().slice(0, 10);
}

export function addPeriods(date, plan, periods) {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  const n = Number(periods) || 0;
  if (n <= 0) return d;

  if (plan === "daily") {
    d.setDate(d.getDate() + n);
    return d;
  }
  if (plan === "weekly") {
    d.setDate(d.getDate() + 7 * n);
    return d;
  }
  // monthly
  d.setMonth(d.getMonth() + n);
  return d;
}

