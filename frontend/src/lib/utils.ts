export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}

export function formatStat(value: number | null | undefined, decimals = 1): string {
  if (value == null) return "-"
  return value.toFixed(decimals)
}

export function formatPct(value: number | null | undefined): string {
  if (value == null) return "-"
  return (value * 100).toFixed(1) + "%"
}
