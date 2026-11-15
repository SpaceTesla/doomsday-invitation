import { notFound } from "next/navigation";

// There is no public page. A visitor without a summons sees what any invalid link sees.
export default function Home() {
  notFound();
}
