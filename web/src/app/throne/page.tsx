import { redirect } from "next/navigation";

// The old address of Doom's sign-in. The panel now lives under each event on the dashboard.
export default function Throne() {
  redirect("/dashboard");
}
