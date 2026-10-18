import type { MessageTemplate } from "@/types";

/**
 * Send-time helpers for templates with an IMAGE / VIDEO / DOCUMENT
 * header. Meta needs the media link on every send, and templates
 * synced from WhatsApp Manager carry no reusable `header_media_url`
 * (only the creation-time `header_handle`, which the send builder
 * can't use) — so the send dialog has to collect a URL. Pure, so the
 * picker's gating rules are testable without rendering it.
 */

export type MediaHeaderType = "image" | "video" | "document";

export function templateMediaHeaderType(
  template: MessageTemplate,
): MediaHeaderType | null {
  const type = template.header_type;
  return type === "image" || type === "video" || type === "document"
    ? type
    : null;
}

/** Why `url` can't be sent as this template's header media, or null if it can. */
export function headerMediaUrlError(
  template: MessageTemplate,
  url: string,
): "missing" | "invalid" | null {
  if (!templateMediaHeaderType(template)) return null;
  const value = url.trim();
  if (!value) return "missing";
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:" ? null : "invalid";
  } catch {
    return "invalid";
  }
}
