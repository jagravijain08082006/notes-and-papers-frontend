import {
  RbseChannelPageComponent,
  generateRbseChannelMetadata,
} from "@/components/shared/rbse-channel-page";

export const revalidate = 3600;

export async function generateMetadata() {
  return generateRbseChannelMetadata("model-papers");
}

export default async function Page() {
  return <RbseChannelPageComponent channelSlug="model-papers" />;
}
