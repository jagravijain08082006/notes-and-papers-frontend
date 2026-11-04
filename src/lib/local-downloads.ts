/**
 * The visitor's own list of downloaded papers, kept in this browser only (nothing about downloads is stored on the server).
 * It works without an account. Every storage call is wrapped, because storage can be blocked (private windows, site data off).
 */

export interface LocalDownload {
  slug: string;
  title: string;
  /** Where the paper page lives, so the saved entry is a normal link. */
  href: string;
  /** Epoch milliseconds of the last download. */
  at: number;
}

const KEY = "np_downloads_v1";
const MAX = 200;
const EVENT = "np-downloads-changed";

export function readDownloads(): LocalDownload[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(list)) return [];
    return list.filter(
      (d): d is LocalDownload =>
        !!d && typeof d.slug === "string" && typeof d.href === "string" && typeof d.title === "string",
    );
  } catch {
    return [];
  }
}

function write(list: LocalDownload[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* storage unavailable: the download itself already worked */
  }
}

/** Newest first; downloading the same paper again moves it to the top instead of adding a copy. */
export function rememberDownload(entry: Omit<LocalDownload, "at">) {
  const rest = readDownloads().filter((d) => d.slug !== entry.slug);
  write([{ ...entry, at: Date.now() }, ...rest]);
}

export function forgetDownload(slug: string) {
  write(readDownloads().filter((d) => d.slug !== slug));
}

export function clearDownloads() {
  write([]);
}

/** Subscribe to changes made in this tab (custom event) or another tab (storage event). */
export function onDownloadsChange(fn: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) fn();
  };
  window.addEventListener(EVENT, fn);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, fn);
    window.removeEventListener("storage", onStorage);
  };
}
