import { PaperPage, paperMetadata } from "@/components/shared/paper-page";

export const revalidate = 86400;
export const dynamicParams = true;

// Built on its first visit and cached from then on (an empty list is what turns on that caching for a dynamic page).
export function generateStaticParams() {
  return [];
}

export async function generateMetadata(props: PageProps<"/papers/[slug]">) {
  return paperMetadata((await props.params).slug);
}

export default async function Page(props: PageProps<"/papers/[slug]">) {
  return <PaperPage slug={(await props.params).slug} canonical="paper" />;
}
