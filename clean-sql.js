const fs = require("fs");

const inputFile = "D:/NextJs/rmubch/csv/riskmain2.csv";
const outputFile = "D:/NextJs/rmubch/csv/riskmain_fixed.csv";

let data = fs.readFileSync(inputFile, "utf8");

// fix mysql escape quote
data = data.replace(/\\"/g, '""');

// fix mysql zero date
data = data.replace(/0000-00-00 00:00:00/g, "NULL");
data = data.replace(/0000-00-00/g, "NULL");

// fix "NULL"
data = data.replace(/,"NULL"/g, ",NULL");
data = data.replace(/"NULL",/g, "NULL,");
data = data.replace(/"NULL"/g, "NULL");

// remove \r
data = data.replace(/\r/g, "");

fs.writeFileSync(outputFile, data, "utf8");

console.log("✅ CSV fixed:", outputFile);