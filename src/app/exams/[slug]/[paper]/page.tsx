import { PaperPage, paperMetadata } from "@/components/shared/paper-page";

export const revalidate = 2592000;
export const dynamicParams = true;

// Built on its first visit and cached from then on (an empty list is what turns on that caching for a dynamic page).
export function generateStaticParams() {
  return [];
}

export async function generateMetadata(props: PageProps<"/exams/[slug]/[paper]">) {
  return paperMetadata((await props.params).paper);
}

export default async function Page(props: PageProps<"/exams/[slug]/[paper]">) {
  const { slug, paper } = await props.params;
  return <PaperPage slug={paper} canonical={{ exam: slug }} />;
}
