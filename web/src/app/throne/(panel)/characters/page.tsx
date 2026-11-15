import { CharactersPanel } from "@/components/throne/CharactersPanel";
import { councilForAdmin } from "@/domain/council";
import { serverDomain } from "@/lib/admin";

export default async function ThroneCharacters() {
  const council = await councilForAdmin(serverDomain());
  return <CharactersPanel characters={council.characters} />;
}
