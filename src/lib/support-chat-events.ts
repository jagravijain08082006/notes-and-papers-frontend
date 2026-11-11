/**
 * Event-driven trigger to open the Support Chat widget from anywhere on the site
 * (e.g. Header, Footer, Contact Page, Mascot Button, or paper problem links).
 */

export function openSupportChat(initialQuestion?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("np:open-support-chat", { detail: { question: initialQuestion } })
    );
  }
}

export function openGuideTour() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("np:open-guide-tour"));
  }
}

