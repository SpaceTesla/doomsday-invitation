import { redirect } from "next/navigation";

// An event opens on its proposal, the first thing to set. The layout has checked the owner.
export default async function EventHome(props: PageProps<"/dashboard/[eventId]">) {
  redirect(`/dashboard/${(await props.params).eventId}/proposal`);
}
