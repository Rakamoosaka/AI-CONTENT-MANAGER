import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toExcerpt(body: string, maxLength = 180) {
  return body.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}
