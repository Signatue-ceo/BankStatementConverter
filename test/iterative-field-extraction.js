const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const fieldExtractors = [
  {
    label: 'Bank Name',
    regex: /Bank of ([A-Za-z]+)/i,
    process: m => m[0],
  },
  {
    label: 'Account Number',
    regex: /Account number:\s*([\d ]+X+)/i,
    process: m => m[1].replace(/\s+/g, ''),
  },
  {
    label: 'Statement Period',
    regex: /for\s+([A-Za-z]+ \d{2}, \d{4}) to ([A-Za-z]+ \d{2}, \d{4})/i,
    process: m => `${m[1]} to ${m[2]}`,
  },
  {
    label: 'Opening Balance',
    regex: /Beginning balance on [A-Za-z]+ \d{2}, \d{4}\s*\$([\d,]+\.\d{2})/i,
    process: m => m[1],
  },
  {
    label: 'Closing Balance',
    regex: /Ending balance on [A-Za-z]+ \d{2}, \d{4}\s*\$([\d,]+\.\d{2})/i,
    process: m => m[1],
  },
  {
    label: 'Sample Transaction',
    regex: /04\/07\/16[\s\S]*Sasha Sofee[\s\S]*?(\d+\.\d{2})/i,
    process: m => m[0],
  },
];

async function iterativeFieldExtraction(pdfPath) {
  const buffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(buffer);
  const text = data.text;

  console.log('--- Iterative Field Extraction from PDF Text ---');
  for (const { label, regex, process } of fieldExtractors) {
    const match = text.match(regex);
    if (match) {
      console.log(`✅ ${label}:`, process(match));
    } else {
      console.log(`❌ ${label}: Not found`);
    }
  }
}

const pdfFile = path.join(__dirname, 'data', 'Bank-of-America-sample-bank-statement.pdf');
iterativeFieldExtraction(pdfFile); 