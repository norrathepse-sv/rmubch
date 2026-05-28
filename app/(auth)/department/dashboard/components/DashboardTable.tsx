// app/(auth)/department/dashboard/components/DashboardTable.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  CircleDashed,
  Trash2,
  Printer,
} from "lucide-react";

import Swal from "sweetalert2";

// 1. อัปเดต Interface ให้ตรงกับ Props ที่ส่งมา
interface DashboardTableProps {
  riskList: any[];
  currentStatus: string;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  totalInbox: number;
  istatuses?: string; // เพิ่ม Props สำหรับสถานะหน้า Inbox (ถ้าต้องการ)
}

export default function DashboardTable({
  riskList,
  currentStatus,
  hasNextPage,
  hasPrevPage,
  currentPage,
  totalPages,
  searchQuery,
  totalInbox,
  istatuses,
}: DashboardTableProps) {
  const router = useRouter();

  // ฟังก์ชันเปลี่ยนหน้าโดยอัปเดต URL Param
  const goToPage = (newPage: number) => {
    // สร้าง URLSearchParams เพื่อเก็บค่าเดิมไว้ (status, search) และเปลี่ยนแค่ page
    const params = new URLSearchParams();
    params.set("status", currentStatus);
    if (searchQuery) params.set("search", searchQuery);
    params.set("page", newPage.toString());

    router.push(`?${params.toString()}`); // จะได้ URL เช่น ?status=inbox&page=2
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-slate-200 flex flex-col">
      <div className="overflow-x-auto min-h-[600px] flex-1">
        <table className="w-full text-left table-fixed">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 w-[8%]">
                วันที่เกิดเหตุ
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 w-[8%]">
                {currentStatus === "sent" || currentStatus === "approved"
                  ? "ส่งถึง"
                  : "รายงานจาก"}
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 w-[15%]">
                ประเภท
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 w-[8%]">
                ความรุนแรง
              </th>

              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center w-[25%]">
                เหตุการณ์โดยย่อ
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 w-[10%]">
                สถานะ
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 w-[8%] text-center">
                พิมพ์
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {riskList.length > 0 ? (
              riskList.map((item) => {
                const invalidValues = ["", "-", "[null]", "null", "<br>"];

                // ตรวจสอบสถานะการพิมพ์ความเห็น
                const hasManagerComment =
                  item.riskresultedit &&
                  !invalidValues.includes(
                    String(item.riskresultedit).trim().toLowerCase(),
                  );

                const hasCommentReply =
                  item.riskheadreply &&
                  !invalidValues.includes(
                    String(item.riskheadreply).trim().toLowerCase(),
                  );

                const hasAdminComment =
                  item.riskcommenthead &&
                  !invalidValues.includes(
                    String(item.riskcommenthead).trim().toLowerCase(),
                  );

                return (
                  <tr
                    key={item.riskid}
                    onClick={() =>
                      router.push(
                        `/department/dashboard/edit/${item.riskid}?status=${istatuses}`,
                      )
                    }
                    className="hover:bg-blue-50/50 transition-all cursor-pointer group relative"
                  >
                    {/* 1. วันที่เกิดเหตุ */}
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700">
                          {item.daterigter
                            ? new Date(item.daterigter).toLocaleDateString(
                                "th-TH",
                              )
                            : "-"}
                        </span>
                        <span className="text-xs text-blue-500 font-semibold">
                          {item.timepicker
                            ? new Date(item.timepicker).toLocaleTimeString(
                                "th-TH",
                                { hour: "2-digit", minute: "2-digit" },
                              )
                            : ""}
                        </span>
                      </div>
                    </td>

                    {/* 2. ส่งถึง (แสดงตามสถานะหน้า) */}
                    <td className="px-6 py-4 text-sm text-slate-600 truncate">
                      {currentStatus === "sent" || currentStatus === "outbound"
                        ? item.todep
                        : item.depreport}
                    </td>

                    {/* 3. เหตุการณ์ */}
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col">
                        <span
                          className="font-bold text-slate-800 truncate max-w-[200px]"
                          title={item.risktype}
                        >
                          {item.risktype}
                        </span>
                        {item.risktypedt && (
                          <span
                            className="text-[11px] text-slate-500 truncate max-w-[200px]"
                            title={item.risktypedt}
                          >
                            {item.risktypedt}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 4. ความรุนแรง (อักษรตัวแรกในกล่องสี) */}
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {/* Clinic Severity: ระดับ E ขึ้นไปสีแดง, ที่เหลือสีเขียว */}
                        {item.clinicseverity && (
                          <span
                            className={`w-7 h-7 flex items-center justify-center rounded-lg font-black shadow-sm ${
                              item.clinicseverity.charAt(0).toUpperCase() >=
                                "E" &&
                              item.clinicseverity.charAt(0).toUpperCase() !==
                                "Z"
                                ? "bg-red-600 text-white shadow-red-200" // ระดับ E ขึ้นไป (สีแดง)
                                : "bg-emerald-100 text-emerald-700" // ระดับอื่นๆ เช่น A, B, C, D (สีเขียว)
                            }`}
                            title={`Clinic: ${item.clinicseverity}`}
                          >
                            {item.clinicseverity.charAt(0)}
                          </span>
                        )}

                        {/* General Severity: โค้ดเดิม */}
                        {item.genseverity && (
                          <span
                            className={`w-7 h-7 flex items-center justify-center rounded-lg font-black shadow-sm ${
                              parseInt(item.genseverity.charAt(0)) >= 5
                                ? "bg-red-600 text-white shadow-red-200" // ระดับ 5 ขึ้นไป (สีแดง)
                                : "bg-emerald-100 text-emerald-700" // ระดับต่ำกว่า 5 (สีส้ม/เหลือง)
                            }`}
                            title={`General: ${item.genseverity}`}
                          >
                            {item.genseverity.charAt(0)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 5. เหตุการณ์โดยย่อ (riskpresent) */}
                    <td className="px-6 py-4 text-sm relative z-20">
                      <div
                        className="text-slate-600 truncate max-w-[400px]"
                        title={item.riskpresent}
                      >
                        {item.riskpresent || "-"}
                      </div>
                    </td>

                    {/* 6. สถานะ (Dynamic Badge) */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        {/* ไอคอนสถานะ: หัวหน้างาน */}
                        <div
                          title={
                            hasManagerComment
                              ? "หัวหน้าตรวจสอบแล้ว"
                              : "รอหัวหน้าตรวจสอบ"
                          }
                        >
                          {hasManagerComment ? (
                            <CheckCircle2
                              size={20}
                              className="text-emerald-500 drop-shadow-sm"
                            />
                          ) : (
                            <CircleDashed
                              size={20}
                              className="text-slate-300"
                            />
                          )}
                        </div>

                        {/* เส้นคั่นบางๆ */}
                        <div className="h-4 w-[1px] bg-slate-200"></div>

                        {/* ไอคอนสถานะ: ผู้บริหาร */}
                        <div
                          title={
                            hasCommentReply
                              ? "หน่วยงานตอบกลับ"
                              : "รอหัวหน้าหน่วยงานตอบกลับ"
                          }
                        >
                          {hasCommentReply ? (
                            <CheckCircle2
                              size={20}
                              className="text-amber-500 drop-shadow-sm"
                            />
                          ) : (
                            <CircleDashed
                              size={20}
                              className="text-slate-300"
                            />
                          )}
                        </div>

                        {/* เส้นคั่นบางๆ */}
                        <div className="h-4 w-[1px] bg-slate-200"></div>

                        {/* ไอคอนสถานะ: ผู้บริหาร */}
                        <div
                          title={
                            hasAdminComment
                              ? "ผู้บริหารตรวจสอบแล้ว"
                              : "รอผู้บริหารตรวจสอบ"
                          }
                        >
                          {hasAdminComment ? (
                            <CheckCircle2
                              size={20}
                              className="text-purple-500 drop-shadow-sm"
                            />
                          ) : (
                            <CircleDashed
                              size={20}
                              className="text-slate-300"
                            />
                          )}
                        </div>
                        {istatuses === "outbound" && (
                          <button
                            onClick={async () => {
                              const result = await Swal.fire({
                                title: "ยืนยันการลบ?",
                                text: `คุณต้องการลบรายการ ID: #${item.riskid} ใช่หรือไม่?`,
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#e11d48",
                                cancelButtonColor: "#64748b",
                                confirmButtonText: "ใช่, ลบเลย!",
                                cancelButtonText: "ยกเลิก",
                                // ใช้ customClass ของ Swal เพื่อใส่ Tailwind แทน
                                customClass: {
                                  popup: "rounded-[2rem]", // ปรับความโค้งของ Modal
                                  confirmButton: "rounded-xl px-6 py-2", // ปรับความโค้งปุ่ม
                                  cancelButton: "rounded-xl px-6 py-2",
                                },
                              });

                              if (result.isConfirmed) {
                                try {
                                  const res = await fetch(
                                    `/api/risks/${item.riskid}`,
                                    {
                                      method: "DELETE",
                                    },
                                  );

                                  if (res.ok) {
                                    await Swal.fire({
                                      title: "ลบสำเร็จ!",
                                      text: "ข้อมูลของคุณถูกลบออกแล้ว",
                                      icon: "success",
                                      confirmButtonColor: "#2563eb",
                                      customClass: {
                                        popup: "rounded-[2rem]",
                                        confirmButton: "rounded-xl px-6 py-2",
                                      },
                                    });
                                    router.push(
                                      "/department/dashboard?status=outbound",
                                    );
                                  } else {
                                    Swal.fire({
                                      title: "เกิดข้อผิดพลาด!",
                                      text: "ไม่สามารถลบข้อมูลได้",
                                      icon: "error",
                                      confirmButtonColor: "#2563eb",
                                    });
                                  }
                                } catch (error) {
                                  Swal.fire({
                                    title: "ล้มเหลว!",
                                    text: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
                                    icon: "error",
                                    confirmButtonColor: "#2563eb",
                                  });
                                }
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="ลบรายการ"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* 7. ปุ่มพิมพ์ */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // ป้องกันการคลิกไปที่ row
                          window.open(
                            `/department/dashboard/${item.riskid}`,
                            "_blank",
                          );
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="พิมพ์รายงาน"
                      >
                        <Printer size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr className="h-[400px]">
                <td
                  colSpan={7}
                  className="text-center text-slate-400 font-medium bg-slate-50/30"
                >
                  ไม่พบข้อมูลอุบัติการณ์ในหมวดนี้
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- 3. อัปเดตส่วนควบคุม Pagination โดยใช้ Props จาก Server --- */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            หน้า{" "}
            <span className="font-semibold text-slate-700">{currentPage}</span>{" "}
            จากทั้งหมด{" "}
            <span className="font-semibold text-slate-700">{totalPages}</span>{" "}
            หน้า
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={!hasPrevPage}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* แสดงตัวเลขหน้า */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                  currentPage === page
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={!hasNextPage}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
