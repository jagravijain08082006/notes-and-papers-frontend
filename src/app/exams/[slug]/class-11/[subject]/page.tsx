import {
  RbseSubjectPageComponent,
  generateRbseSubjectMetadata,
} from "@/components/shared/rbse-subject-page";

export const revalidate = 3600;

export async function generateMetadata(props: {
  params: Promise<{ slug: string; subject: string }>;
}) {
  const { subject } = await props.params;
  return generateRbseSubjectMetadata("class-11", subject);
}

export default async function Page(props: {
  params: Promise<{ slug: string; subject: string }>;
}) {
  const { subject } = await props.params;
  return <RbseSubjectPageComponent classSlug="class-11" subjectSlug={subject} />;
}

