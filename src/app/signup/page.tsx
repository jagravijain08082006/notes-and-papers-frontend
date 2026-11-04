import type { Metadata } from "next";
import { AuthCard } from "@/components/shared/auth-card";
import { SignupForm } from "@/components/shared/auth-forms";
import { safeNext } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: true },
};

export default async function SignupPage(props: PageProps<"/signup">) {
  // Coming from a download? Take the visitor back to it after signing up, so the download starts.
  const next = safeNext((await props.searchParams).next);
  return (
    <AuthCard
      title="Create your account"
      description="A free account lets you download papers and bookmark them."
    >
      <SignupForm next={next} />
    </AuthCard>
  );
}
