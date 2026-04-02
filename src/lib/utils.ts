import { clsx } from "clsx";
import {
  format,
  formatDistanceToNow,
  isValid,
  parseISO,
  startOfMonth,
} from "date-fns";

export function cn(...inputs: Array<string | false | null | undefined>) {
  return clsx(inputs);
}

export function formatDisplayDate(value: string) {
  const date = parseISO(value);
  return isValid(date) ? format(date, "EEEE, MMMM d") : value;
}

export function formatMonthLabel(value: Date) {
  return format(value, "MMMM yyyy");
}

export function formatRelativeTime(value: string) {
  const date = parseISO(value);
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : value;
}

export function toMonthKey(value: Date) {
  return format(startOfMonth(value), "yyyy-MM");
}

export function clipText(value: string, maxLength = 120) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trim()}...`;
}

export function slugDate(value: Date) {
  return format(value, "yyyy-MM-dd");
}

export function readEnvList(value?: string | null) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}
