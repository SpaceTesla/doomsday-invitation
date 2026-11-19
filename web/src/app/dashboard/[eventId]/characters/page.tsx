import { CharactersPanel } from "@/components/throne/CharactersPanel";
import { councilForAdmin } from "@/domain/council";
import { requirePageEvent } from "@/lib/admin";

export default async function ThroneCharacters(
  props: PageProps<"/dashboard/[eventId]/characters">,
) {
  const { domain } = await requirePageEvent(props.params);
  const council = await councilForAdmin(domain);
  return <CharactersPanel characters={council.characters} />;
}
