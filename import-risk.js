const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function importCSV() {
  const results = [];

  // 1. อ่านไฟล์ CSV (เปลี่ยนชื่อไฟล์ให้ตรงกับของคุณ)
  fs.createReadStream('data.csv') 
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`อ่านข้อมูลเสร็จสิ้น: ${results.length} รายการ`);
      console.log('กำลังเริ่มนำเข้าข้อมูล...');

      for (const row of results) {
        try {
          await prisma.riskmain.create({
            data: {
              // แมพชื่อคอลัมน์จาก CSV (ซ้าย) ให้ตรงกับ Prisma (ขวา)
              riskname: row.riskname || null,
              riskhn: row.riskhn || null,
              riskage: row.riskage || null,
              // แก้ไข Format วันที่ให้ Postgres ยอมรับ
              daterigter: row.daterigter ? new Date(row.daterigter) : null,
              timepicker: row.timepicker ? new Date(`1970-01-01T${row.timepicker}`) : null,
              depreport: row.depreport || null,
              todep: row.todep || null,
              riskstatus: row.riskstatus || '1',
              riskshow: row.riskshow || '1',
              // เพิ่มคอลัมน์อื่นๆ ตาม schema.prisma ของคุณที่นี่
            },
          });
        } catch (error) {
          console.error(`Error ที่ ID ${row.riskid}:`, error.message);
        }
      }

      console.log('นำเข้าข้อมูลเรียบร้อยแล้ว!');
      await prisma.$disconnect();
    });
}

importCSV();