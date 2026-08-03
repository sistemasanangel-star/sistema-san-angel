import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Splash from "@/components/Splash";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return <Splash />;
}
