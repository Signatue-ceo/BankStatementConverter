const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

async function extractPdfLines(pdfPath, outputPath) {
  const buffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(buffer);
  const lines = data.text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  fs.writeFileSync(outputPath, JSON.stringify(lines, null, 2), 'utf8');
  console.log(`Extracted ${lines.length} lines from PDF and saved to ${outputPath}`);
}

const pdfFile = path.join(__dirname, 'data', 'Bank-of-America-sample-bank-statement.pdf');
const outputFile = path.join(__dirname, 'data', 'boa_pdf_lines.json');
extractPdfLines(pdfFile, outputFile); 