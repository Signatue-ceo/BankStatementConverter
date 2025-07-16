const fs = require('fs');
const path = require('path');

async function extractPdfText(pdfPath) {
  try {
    const pdfParse = require('pdf-parse');
    const buffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(buffer);
    console.log('--- Extracted PDF Text ---');
    console.log(data.text);
    console.log('--- End of PDF Text ---');
  } catch (error) {
    console.error('Failed to extract text from PDF:', error.message);
  }
}

const pdfFile = path.join(__dirname, 'data', 'Bank-of-America-sample-bank-statement.pdf');
extractPdfText(pdfFile); 