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
/*Table structure for table `riskdepart` */

CREATE TABLE `riskdepart` (
  `depid` int(11) NOT NULL auto_increment,
  `depname` varchar(200) default NULL,
  `depuser` varchar(200) default NULL,
  `deppass` varchar(50) default NULL,
  `deplevel` varchar(1) default NULL,
  PRIMARY KEY  (`depid`)
) ENGINE=MyISAM AUTO_INCREMENT=114 DEFAULT CHARSET=utf8;

/*Table structure for table `riskgroup` */

CREATE TABLE `riskgroup` (
  `grid` int(11) NOT NULL auto_increment,
  `grname` text,
  `dtgrid` int(5) default NULL,
  PRIMARY KEY  (`grid`)
) ENGINE=MyISAM AUTO_INCREMENT=19 DEFAULT CHARSET=utf8;

/*Table structure for table `riskgroupdt` */

CREATE TABLE `riskgroupdt` (
  `dtgrid` int(11) NOT NULL auto_increment,
  `dtgrname` text,
  `drid` int(11) default NULL,
  PRIMARY KEY  (`dtgrid`)
) ENGINE=MyISAM AUTO_INCREMENT=179 DEFAULT CHARSET=utf8;

/*Table structure for table `riskgrouplv` */

CREATE TABLE `riskgrouplv` (
  `grlvid` int(11) NOT NULL auto_increment,
  `grlvcode` varchar(10) default NULL,
  `grlvname` text,
  `grlvlevel` varchar(10) default NULL,
  PRIMARY KEY  (`grlvid`)
) ENGINE=MyISAM AUTO_INCREMENT=23 DEFAULT CHARSET=utf8;

/*Table structure for table `riskmain` */

CREATE TABLE `riskmain` (
  `riskid` int(11) NOT NULL auto_increment,
  `riskname` text,
  `riskhn` varchar(50) default NULL,
  `riskage` varchar(5) default NULL,
  `daterigter` date default NULL,
  `timepicker` time default NULL,
  `depreport` text,
  `todep` text,
  `risktype` text,
  `risktypedt` text,
  `risktypedrug` text,
  `risktypedrugdt` text,
  `risktypedrugresult` text,
  `clinicseverity` text,
  `genseverity` text,
  `riskpresent` text,
  `riskfirstedit` text,
  `riskresultedit` text,
  `riskcommenthead` text,
  `risknote` text,
  `riskcauseanalysis` text,
  `riskstatus` varchar(1) default NULL,
  `riskdaterep` date default NULL,
  `riskdaterespon` date default NULL,
  `riskshow` varchar(1) default '1',
  PRIMARY KEY  (`riskid`),
  KEY `daterigter` (`daterigter`),
  KEY `riskhn` (`riskhn`),
  KEY `riskdaterep` (`riskdaterep`),
  KEY `riskdaterespon` (`riskdaterespon`)
) ENGINE=MyISAM AUTO_INCREMENT=10624 DEFAULT CHARSET=utf8;

/*Table structure for table `riskstatus` */

CREATE TABLE `riskstatus` (
  `stid` int(11) NOT NULL auto_increment,
  `stname` varchar(200) default NULL,
  `stlevel` varchar(1) default NULL,
  PRIMARY KEY  (`stid`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
