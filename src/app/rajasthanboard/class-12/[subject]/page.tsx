import {
  RbseSubjectPageComponent,
  generateRbseSubjectMetadata,
} from "@/components/shared/rbse-subject-page";

export const revalidate = 604800;

// Built on its first visit and cached from then on (an empty list is what turns on that caching for a dynamic page).
export function generateStaticParams() {
  return [];
}

export async function generateMetadata(props: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await props.params;
  return generateRbseSubjectMetadata("class-12", subject);
}

export default async function Page(props: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await props.params;
  return <RbseSubjectPageComponent classSlug="class-12" subjectSlug={subject} />;
}

