const trim = (v: string) => v.replace(/\/+$/, "");

const isProd = process.env.NODE_ENV === "production";
const rawSite = process.env.NEXT_PUBLIC_SITE_URL;
export const SITE_URL = trim(
  isProd && (!rawSite || rawSite.includes("localhost"))
    ? "https://notesandpapers.dpdns.org"
    : (rawSite ?? "http://localhost:3010"),
);

const rawApi = process.env.NEXT_PUBLIC_API_URL;
export const API_URL = trim(
  isProd && (!rawApi || rawApi.includes("localhost"))
    ? "https://backend.notesandpapers.dpdns.org/api/v1"
    : (rawApi ?? "http://localhost:8000/api/v1"),
);

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "thecodinggiant@gmail.com";
export const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "";

export const SITE_NAME = "Notes & Papers";

