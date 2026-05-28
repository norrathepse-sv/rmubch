SET client_encoding = 'UTF8';
/*
SQLyog Ultimate v11.11 (64 bit)
MySQL - 5.0.67-log : Database - riskubcc
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*Data for the table "riskgroup" */

insert  into "riskgroup"("grid","grname","dtgrid") values (1,'1)การวินิจฉัย/การรักษา/การดูแลผู้ป่วย',1),(2,'2)ยา/สารน้ำ/เลือด',2),(3,'3)การผ่าตัด/วิสัญญี/หัตถการ',3),(4,'4)ความปลอดภัยของเจ้าหน้าหน้าที่',4),(5,'5)การป้องกันการติดเชื้อในโรงพยาบาล',5),(6,'6)ข้อร้องเรียน',6),(7,'7)โครงสร้างกายภาพสิ่งแวดล้อม',7),(8,'8)เครื่องมือ/อุปกรณ์',8),(9,'9)การติดต่อสื่อสาร',9),(10,'10)การพลัดตก/หกล้ม',10),(11,'11)การควบคุมภายใน',11),(12,'12)ความคลาดเคลื่อนของยา',12),(13,'13)อื่นๆ (ไม่สามารถจัดหมดหมู่ได้)',13),(14,'14)PE: Perscribing error',14),(15,'15)PDE: Per-dispensing error',15),(16,'16)DE: Dispensing error',16),(17,'17)AE: Administrating error',17),(18,'18)หมวดเวชระเบียน',18);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
