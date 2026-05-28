import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import Sidebar from "./components/Sidebar";
import DashboardTable from "./components/DashboardTable";
import SearchBar from "./components/Searchbar";
import ExportAllExcelButton from "./components/ExportAllExcelButton";

export default async function DepartmentDashboard({
  searchParams,
}: {
  searchParams: any;
}) {
  const params = await searchParams;
  const session = await getServerSession();

  const istatus = params.status || "inbox";

  if (!session) {
    redirect("/login");
  }

  const searchQuery = params.search || "";
  const searchField = params.field || "all";
  const currentStatus = params.status || "inbox";
  const currentPage = Number(params.page) || 1;
  const pageSize = 10;
  const skip = (currentPage - 1) * pageSize;
  const userDep = session.user?.name || "ไม่ทราบ";
  const sDate = params.startDate;
  const eDate = params.endDate;

  let sortCondition: any = [{ daterigter: "desc" }];

  // 1. เงื่อนไขการค้นหา (Filter)
  const whereCondition: any = {
    ...(searchQuery && {
      OR: [
        { riskhn: { contains: searchQuery, mode: "insensitive" } },
        { riskname: { contains: searchQuery, mode: "insensitive" } },
        { risktype: { contains: searchQuery, mode: "insensitive" } },
      ],
    }),
  };

  if (sDate || eDate) {
    whereCondition.daterigter = {
      ...(sDate && { gte: new Date(sDate) }),
      ...(eDate && { lte: new Date(eDate + "T23:59:59") }),
    };
  }

  // const hasBeenReviewed = {
  //   AND: [
  //     { riskresultedit: { not: null } },
  //     { riskresultedit: { not: "-" } },
  //     { riskresultedit: { not: " " } },
  //     { riskresultedit: { not: "" } },
  //     { riskresultedit: { not: "[null]" } },
  //     { riskresultedit: { not: "<br>" } },

  //   ]
  // };

  // 2. ปรับ Condition ตามแท็บที่เลือกแสดงในตาราง
  // 1. เงื่อนไขการกรองข้อมูลในตาราง (whereCondition)
  if (currentStatus === "inbox") {
    // [หน้า Inbox]: แสดงรายการขาเข้าที่มีการบันทึกรายละเอียดแล้ว (มี riskresultedit)
    whereCondition.todep = userDep;

    sortCondition = [{ daterigter: "desc" }];
  } else if (currentStatus === "sent") {
    // [หน้า Sent]: รายการที่หัวหน้าบันทึกแล้วจะย้ายมาที่นี่
    // แสดงสถานะ "หัวหน้างานตรวจสอบแล้ว" ทันที
    whereCondition.depreport = userDep;
    whereCondition.NOT = {
      OR: [
        { riskresultedit: null },
        { riskresultedit: "" },
        { riskresultedit: "[null]" },
        { riskresultedit: "-" },
        { riskresultedit: "<br>" },
      ],
    };

    // ลบเงื่อนไขที่ไม่เกี่ยวข้อง
    delete whereCondition.todep;
    sortCondition = [{ daterigter: "desc" }];
  } else if (currentStatus === "outbound") {
    // [หน้า รายงานที่ส่งออก]: แสดงเฉพาะรายการที่เราส่ง (depreport)
    // และต้องยังไม่มีการตรวจสอบ (riskresultedit เป็น null/ว่าง)
    whereCondition.depreport = userDep;

    // ลบ todep ออกเพื่อให้ดึงข้อมูลขาออกของแผนกเรา
    delete whereCondition.todep;

    whereCondition.OR = [
      { riskresultedit: null },
      { riskresultedit: "" },
      { riskresultedit: "[null]" },
      { riskresultedit: "-" },
      { riskresultedit: "<br>" },
    ];

    sortCondition = [{ riskid: "desc" }];
  }

  // 2. การนับจำนวนสำหรับ Badge ใน Sidebar
  const [
    totalInbox, // จำนวนในหน้า Inbox
    totalSent, // จำนวนในหน้า Sent
    totalAll, // ขาเข้าทั้งหมด (178 รายการ)
  ] = await Promise.all([
    // นับจำนวน Inbox (ตามเงื่อนไขที่คุณระบุว่าต้องมี riskresultedit)
    prisma.riskmain.count({
      where: {
        todep: userDep,
      },
    }),

    // นับจำนวน Sent (ค่าจะเท่ากับ Inbox หากใช้เงื่อนไขเดียวกัน)
    prisma.riskmain.count({
      where: {
        depreport: userDep,
        // เพิ่มเงื่อนไข NOT + OR เหมือนตอนดึงข้อมูลตาราง
        NOT: {
          OR: [
            { riskresultedit: null },
            { riskresultedit: "" },
            { riskresultedit: "[null]" },
            { riskresultedit: "-" },
            { riskresultedit: "<br>" },
          ],
        },
      },
    }),

    // ขาเข้าทั้งหมด (ไม่สนใจว่าตรวจหรือยัง)
    prisma.riskmain.count({
      where: {
        depreport: userDep,
        // เพิ่มเงื่อนไข NOT + OR เหมือนตอนดึงข้อมูลตาราง
        OR: [
          { riskresultedit: null },
          { riskresultedit: "" },
          { riskresultedit: "[null]" },
          { riskresultedit: "-" },
          { riskresultedit: "<br>" },
        ],
      },
    }),
  ]);

  const riskList = await prisma.riskmain.findMany({
    where: whereCondition,
    orderBy: sortCondition,
    skip: skip,
    take: pageSize,
  });
  const filteredItems = await prisma.riskmain.count({
    where: whereCondition,
  });

  const allRisks = await prisma.riskmain.findMany({
    where: whereCondition,
    orderBy: sortCondition,
    select: {
      riskid: true,
      daterigter: true,
      risktype: true,
      riskpresent: true,
      clinicseverity: true,
      depreport: true,
      todep: true,
      // riskdetail: true, ❌ ลบบรรทัดนี้ทิ้งเลยครับ!
      riskfirstedit: true,
      riskcauseanalysis: true,
      riskheadreply: true
    },
  });

  const totalPages = Math.ceil(filteredItems / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="flex flex-col md:flex-row gap-8 p-4 md:p-8">
        {/* ส่ง Props ให้ Sidebar ตามตัวแปรที่ดึงมาใหม่ */}
        <Sidebar
          currentStatus={currentStatus}
          totalAll={totalAll} // รายงานขาเข้า (178)
          totalSent={totalSent} // รายงานขาออก (ตรวจแล้ว)
          totalInbox={totalInbox} // รอตรวจสอบ
          searchQuery={searchQuery}
        />

        <main className="flex-1 min-w-0">
          <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-800">
                {currentStatus === "inbox" && "รายการรอตรวจสอบ"}
                {currentStatus === "sent" && "รายการตรวจสอบแล้ว (ขาออก)"}
                {currentStatus === "all" && "รายงานขาเข้าทั้งหมด"}
              </h2>
            </div>

            <Link
              href="/department/dashboard/add"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95"
            >
              <PlusIcon className="w-5 h-5" />
              <span>เขียนรายงานใหม่</span>
            </Link>
          </header>

          <SearchBar
            searchQuery={searchQuery}
            currentStatus={currentStatus}
            searchField={searchField}
            startDate={sDate}
            endDate={eDate}
          />
          <div className="flex justify-end mb-4 mt-2">
            <ExportAllExcelButton data={allRisks} />
          </div>
          <DashboardTable
            // ส่ง riskList ที่ดึงมาแล้วไปได้เลย ถ้าไม่มีข้อมูล Prisma จะส่ง [] มาให้อยู่แล้ว
            riskList={riskList}
            currentStatus={currentStatus}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            currentPage={currentPage}
            totalPages={totalPages}
            searchQuery={searchQuery}
            totalInbox={totalInbox}
            istatuses={istatus} // ตัวเลข Badge เฉพาะหน้า Inbox
          />
        </main>
      </div>
    </div>
  );
}
