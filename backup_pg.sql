CREATE TABLE "riskdepart" (
  "depid" SERIAL NOT NULL,
  "depname" varchar(200) default NULL,
  "depuser" varchar(200) default NULL,
  "deppass" varchar(50) default NULL,
  "deplevel" varchar(1) default NULL,
  PRIMARY KEY ("depid")
);

CREATE TABLE "riskgroup" (
  "grid" SERIAL NOT NULL,
  "grname" text,
  "dtgrid" INTEGER default NULL,
  PRIMARY KEY ("grid")
);

CREATE TABLE "riskgroupdt" (
  "dtgrid" SERIAL NOT NULL,
  "dtgrname" text,
  "drid" INTEGER default NULL,
  PRIMARY KEY ("dtgrid")
);

CREATE TABLE "riskgrouplv" (
  "grlvid" SERIAL NOT NULL,
  "grlvcode" varchar(10) default NULL,
  "grlvname" text,
  "grlvlevel" varchar(10) default NULL,
  PRIMARY KEY ("grlvid")
);

CREATE TABLE "riskmain" (
  "riskid" SERIAL NOT NULL,
  "riskname" text,
  "riskhn" varchar(50) default NULL,
  "riskage" varchar(5) default NULL,
  "daterigter" date default NULL,
  "timepicker" time default NULL,
  "depreport" text,
  "todep" text,
  "risktype" text,
  "risktypedt" text,
  "risktypedrug" text,
  "risktypedrugdt" text,
  "risktypedrugresult" text,
  "clinicseverity" text,
  "genseverity" text,
  "riskpresent" text,
  "riskfirstedit" text,
  "riskresultedit" text,
  "riskcommenthead" text,
  "risknote" text,
  "riskcauseanalysis" text,
  "riskstatus" varchar(1) default NULL,
  "riskdaterep" date default NULL,
  "riskdaterespon" date default NULL,
  "riskshow" varchar(1) default '1',
  PRIMARY KEY ("riskid")
);

CREATE INDEX "idx_daterigter" ON "riskmain" ("daterigter");
CREATE INDEX "idx_riskhn" ON "riskmain" ("riskhn");
CREATE INDEX "idx_riskdaterep" ON "riskmain" ("riskdaterep");
CREATE INDEX "idx_riskdaterespon" ON "riskmain" ("riskdaterespon");

CREATE TABLE "riskstatus" (
  "stid" SERIAL NOT NULL,
  "stname" varchar(200) default NULL,
  "stlevel" varchar(1) default NULL,
  PRIMARY KEY ("stid")
);