import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RiskPrintTemplate from "../../components/RiskPrinterTemplate";

export default async function RiskPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);
  if (isNaN(id)) return notFound();

  const risk = await prisma.riskmain.findUnique({
    where: { riskid: id },
  });

  if (!risk) return notFound();

  return (
    <main className="min-h-screen bg-white py-6">
      <div className="container mx-auto px-4">
        <RiskPrintTemplate risk={risk} showOnScreen />
      </div>
    </main>
  );
}
