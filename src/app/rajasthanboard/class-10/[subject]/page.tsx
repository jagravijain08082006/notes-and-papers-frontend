import {
  RbseSubjectPageComponent,
  generateRbseSubjectMetadata,
} from "@/components/shared/rbse-subject-page";

export const revalidate = 3600;

export async function generateMetadata(props: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await props.params;
  return generateRbseSubjectMetadata("class-10", subject);
}

export default async function Page(props: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await props.params;
  return <RbseSubjectPageComponent classSlug="class-10" subjectSlug={subject} />;
}

