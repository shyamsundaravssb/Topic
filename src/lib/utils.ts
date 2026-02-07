import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stripMarkdown(text: string): string {
  if (!text) return "";

  // 1. Remove headers (e.g., # Header, ## Header)
  let plain = text.replace(/^#{1,6}\s+/gm, "");

  // 2. Remove bold/italic (e.g., **bold**, *italic*, __bold__, _italic_)
  // Note: This is a simple regex and might not catch nested cases perfectly, but good enough for previews.
  plain = plain.replace(/(\*\*|__)(.*?)\1/g, "$2");
  plain = plain.replace(/(\*|_)(.*?)\1/g, "$2");

  // 3. Remove links (e.g., [text](url)) - keep only text
  plain = plain.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // 4. Remove images (e.g., ![alt](url)) - remove entirely or keep alt
  plain = plain.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");

  // 5. Remove blockquotes (e.g., > text)
  plain = plain.replace(/^>\s+/gm, "");

  // 6. Remove list markers (e.g., - item, * item, 1. item)
  plain = plain.replace(/^[\s]*[-+*]\s+/gm, "");
  plain = plain.replace(/^[\s]*\d+\.\s+/gm, "");

  // 7. Remove code blocks (```code```) and inline code (`code`)
  plain = plain.replace(/```[\s\S]*?```/g, "");
  plain = plain.replace(/`([^`]+)`/g, "$1");

  // 8. Remove horizontal rules (---, ***, ___)
  plain = plain.replace(/^[-*_]{3,}\s*$/gm, "");

  // 9. Collapse multiple newlines/spaces
  plain = plain.replace(/\n{2,}/g, "\n");

  return plain.trim();
}
