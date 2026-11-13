import {
  RbseChannelPageComponent,
  generateRbseChannelMetadata,
} from "@/components/shared/rbse-channel-page";

export const revalidate = 604800;

export async function generateMetadata() {
  return generateRbseChannelMetadata("class-9");
}

export default async function Page() {
  return <RbseChannelPageComponent channelSlug="class-9" />;
}

