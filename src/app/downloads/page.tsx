import type { Metadata } from "next";
import { LocalDownloadsList } from "@/components/shared/local-downloads-list";

export const metadata: Metadata = {
  title: "My downloads",
  robots: { index: false, follow: false },
};

/** Open to everyone: the list lives in the visitor's browser, so no account (and no server call) is needed. */
export default function DownloadsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl sm:text-5xl break-words leading-tight">My downloads</h1>
      <LocalDownloadsList />
    </div>
  );
}
