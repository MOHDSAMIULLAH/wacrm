import { describe, expect, it } from "vitest";
import type { MessageTemplate } from "@/types";
import {
  headerMediaUrlError,
  templateMediaHeaderType,
} from "./template-media-header";

function tpl(overrides: Partial<MessageTemplate>): MessageTemplate {
  return {
    id: "t1",
    name: "promo",
    language: "en",
    category: "Marketing",
    body_text: "Hello",
    status: "APPROVED",
    ...overrides,
  } as MessageTemplate;
}

describe("templateMediaHeaderType", () => {
  it("returns the media type for image / video / document headers", () => {
    expect(templateMediaHeaderType(tpl({ header_type: "image" }))).toBe("image");
    expect(templateMediaHeaderType(tpl({ header_type: "video" }))).toBe("video");
    expect(templateMediaHeaderType(tpl({ header_type: "document" }))).toBe("document");
  });

  it("returns null for text headers and templates without a header", () => {
    expect(templateMediaHeaderType(tpl({ header_type: "text" }))).toBeNull();
    expect(templateMediaHeaderType(tpl({}))).toBeNull();
  });
});

describe("headerMediaUrlError", () => {
  it("is null when the template has no media header", () => {
    expect(headerMediaUrlError(tpl({ header_type: "text" }), "")).toBeNull();
  });

  it("flags a missing URL on a media-header template", () => {
    expect(headerMediaUrlError(tpl({ header_type: "image" }), "   ")).toBe("missing");
  });

  it("flags non-http(s) or malformed URLs", () => {
    const t = tpl({ header_type: "image" });
    expect(headerMediaUrlError(t, "not a url")).toBe("invalid");
    expect(headerMediaUrlError(t, "ftp://example.com/a.jpg")).toBe("invalid");
  });

  it("accepts an http(s) URL", () => {
    const t = tpl({ header_type: "image" });
    expect(headerMediaUrlError(t, " https://example.com/a.jpg ")).toBeNull();
  });
});
