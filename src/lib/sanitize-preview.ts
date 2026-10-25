/**
 * Sanitizes question paper preview excerpts to remove third-party scraper watermarks,
 * competitor website URLs (e.g., a2zsubjects.com, uoronline.com, rtuonline.com, pyqonline.com),
 * promotional headers, and scanner stamps.
 */

const COMPETITOR_DOMAINS = [
  "a2zsubjects",
  "uoronline",
  "rtuonline",
  "pyqonline",
  "onlinebu",
  "rgpvonline",
  "csvtuonline",
  "bputonline",
  "aktuonline",
  "msbteonline",
  "punjabiuniversity",
  "mduonline",
  "crsuonline",
];

const WATERMARK_LINE_REGEXES = [
  // Any line starting with or consisting of a URL
  /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.(com|org|net|in|co\.in|online|edu|info|io)(\/[^\s]*)?$/i,
  // Any line mentioning common scraper domains
  new RegExp(`\\b(${COMPETITOR_DOMAINS.join("|")})\\b`, "i"),
  // Scanner and promotional watermarks
  /scanned\s+(with|by)\s+camscanner/i,
  /follow\s+us\s+on\s+telegram/i,
  /join\s+(our\s+)?telegram(\s+channel)?/i,
  /whatsapp\s+group/i,
  /download\s+(more\s+)?(papers|solutions)\s+at/i,
];

const INLINE_REPLACEMENTS = [
  // Remove URLs embedded inside text
  /https?:\/\/[^\s]+/gi,
  /www\.[a-zA-Z0-9-]+\.(com|org|net|in|co\.in|online|edu|info|io)[^\s]*/gi,
  new RegExp(`[a-zA-Z0-9-]*(${COMPETITOR_DOMAINS.join("|")})[a-zA-Z0-9-]*\\.[a-z]{2,}[^\\s]*`, "gi"),
];

/**
 * Strips all competitor domain URLs, watermark stamps, and scraper artifacts
 * from the paper content excerpt. Returns null if the remaining excerpt is empty.
 */
export function cleanPreviewExcerpt(text: string | null | undefined): string | null {
  if (!text) return null;

  const lines = text.split(/\r?\n/);
  const cleanedLines: string[] = [];

  for (const rawLine of lines) {
    let line = rawLine.trim();
    if (!line) {
      if (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] !== "") {
        cleanedLines.push("");
      }
      continue;
    }

    // Check if the entire line is a watermark or competitor domain
    const isWatermarkLine = WATERMARK_LINE_REGEXES.some((rx) => rx.test(line));
    if (isWatermarkLine) {
      continue;
    }

    // Remove inline URLs if any remain
    for (const rx of INLINE_REPLACEMENTS) {
      line = line.replace(rx, "").trim();
    }

    // Cleanup residual punctuation left from removed URLs (e.g. "- | -")
    line = line.replace(/^[|\s·•\-–—:]+|[|\s·•\-–—:]+$/g, "").trim();

    if (line.length > 0) {
      cleanedLines.push(line);
    }
  }

  const result = cleanedLines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // If after sanitization nothing meaningful is left, return null
  if (result.length < 5) return null;

  return result;
}
