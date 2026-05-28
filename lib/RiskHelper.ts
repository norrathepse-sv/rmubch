/**
 * ตรวจสอบว่าระดับความรุนแรงทางคลินิก อยู่ในระดับที่เกิดอันตรายหรือไม่ (ระดับ E - I)
 * @param code ตัวอักษรระดับความรุนแรง เช่น 'A', 'E', 'H'
 * @returns boolean (true ถ้าเป็นระดับ E ขึ้นไป)
 */
export const isHighClinicSeverity = (code?: string | null): boolean => {
  if (!code) return false;
  
  // แปลงเป็นพิมพ์ใหญ่และตัดช่องว่าง
  const upperCode = code.trim().toUpperCase();
  
  // ตรวจสอบว่าอยู่ในกลุ่ม E, F, G, H, I หรือไม่
  // (วิธีนี้ปลอดภัยกว่าการใช้ >= 'E' เพราะป้องกันบั๊กกรณีมีรหัส 'Z' หรือ '0' โผล่มา)
  return ["E", "F", "G", "H", "I"].includes(upperCode);
};

// ในอนาคตถ้ามีฟังก์ชันอื่นๆ ที่เกี่ยวกับความเสี่ยง ก็สามารถนำมาเขียนรวมในไฟล์นี้ได้
// เช่น export const formatRiskStatus = () => { ... }