import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import EditRiskForm from "../../components/EditRiskForm";
import BackButton from "../../components/BackButton";


// 1. ปรับการรับค่า params ให้เป็น Promise
export default async function EditRiskPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }> 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // 2. ต้อง await params ก่อนเสมอใน Next.js เวอร์ชันใหม่
  const { id } = await params;
  const sParams = await searchParams;
  const isSent = sParams.status === "sent";
  const isInbox = sParams.status === "inbox";
  // console.log("🚀 Status isSent:", isSent);

  const session = await getServerSession();
  if (!session) redirect("/login");

  // 3. นำ id ที่ได้จากการ await มาใช้งาน
  const riskIdNumeric = Number(id);

  const riskData = await prisma.riskmain.findUnique({
    where: { 
      riskid: riskIdNumeric 
    },
  });

  if (!riskData) notFound();

  // บังคับ Security: ถ้าตรวจสอบแล้ว (ไม่ใช่สถานะ '1') ห้ามแก้ไข
  // if (riskData.riskstatus !== '1') {
  //   redirect(`/department/dashboard/${id}?error=already_verified`);
  // }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="container mx-auto max-w-8xl">
        <header className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
  {/* ส่วนของหัวข้อ (ซ้าย) */}
  <div>
    <h1 className="text-2xl font-bold text-slate-800">แก้ไขข้อมูลอุบัติการณ์</h1>
    <p className="text-slate-500 text-sm font-medium">
      เลขที่อ้างอิง: <span className="text-blue-600 font-bold"># {riskData.riskid}</span>
    </p>
  </div>

  {/* ส่วนของปุ่ม (ขวา) */}
  <div className="shrink-0 order-first md:order-last self-end md:self-start">
    <BackButton />
  </div>
</header>

        {/* ส่งข้อมูลไปยัง Form Client Component */}
        <EditRiskForm initialData={riskData} isSent={isSent} isInbox={isInbox} />
      </div>
    </div>
  );
}