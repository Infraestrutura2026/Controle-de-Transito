import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard";
import { ehAdministrador, operadorAtual } from "@/lib/sessao";

export const dynamic = "force-dynamic";

export default async function Home() {
  const op = await operadorAtual();
  if (!op) redirect("/login");
  return <Dashboard operador={op} ehAdmin={ehAdministrador(op)} />;
}
