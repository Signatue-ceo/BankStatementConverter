const fs = require('fs');
const path = require('path');
const { BankStatementParser } = require('../utils/parser');
const pdfParse = require('pdf-parse');

function findClosestLine(lines, value) {
  // Simple similarity: find the line with the most shared characters
  let maxScore = 0;
  let bestLine = '';
  for (const line of lines) {
    let score = 0;
    for (const char of value) {
      if (line.includes(char)) score++;
    }
    if (score > maxScore) {
      maxScore = score;
      bestLine = line;
    }
  }
  return bestLine;
}

async function compareParserToLines(pdfPath, linesPath) {
  // Run parser
  const buffer = fs.readFileSync(pdfPath);
  const parser = new BankStatementParser();
  const text = (await pdfParse(buffer)).text;
  const parsed = parser.parseBankStatement(text);

  // Load lines
  const lines = JSON.parse(fs.readFileSync(linesPath, 'utf8'));

  // Fields to check
  const checks = [
    { label: 'Account Number', value: parsed.accountNumber, expect: /account number/i },
    { label: 'Opening Balance', value: parsed.openingBalance, expect: /beginning balance/i },
    { label: 'Closing Balance', value: parsed.closingBalance, expect: /ending balance/i },
    { label: 'Statement Period', value: parsed.statementPeriod ? `${parsed.statementPeriod.start} to ${parsed.statementPeriod.end}` : '', expect: /for [A-Za-z]+ \d{2}, \d{4} to [A-Za-z]+ \d{2}, \d{4}/i },
    { label: 'Sample Transaction', value: parsed.transactions && parsed.transactions[0] ? JSON.stringify(parsed.transactions[0]) : '', expect: /cash app|sofee|156\.87/i },
  ];

  console.log('--- Comparing Parser Output to Extracted PDF Lines ---');
  for (const { label, value, expect } of checks) {
    if (!value || value === 0 || value === '0' || value === 'undefined') {
      console.log(`❌ ${label}: Not found by parser.`);
      // Try to find the closest matching line
      const bestLine = findClosestLine(lines, label.replace(/[^a-zA-Z0-9]/g, ''));
      console.log(`   Closest line in PDF: "${bestLine}"`);
    } else {
      // Try to find the value in the lines
      const found = lines.some(line => line.includes(String(value)));
      if (found) {
        console.log(`✅ ${label}: "${value}" found in PDF lines.`);
      } else {
        console.log(`❌ ${label}: "${value}" NOT found in PDF lines.`);
        // Show the closest line
        const bestLine = findClosestLine(lines, String(value));
        console.log(`   Closest line in PDF: "${bestLine}"`);
      }
    }
  }
}

const pdfFile = path.join(__dirname, 'data', 'Bank-of-America-sample-bank-statement.pdf');
const linesFile = path.join(__dirname, 'data', 'boa_pdf_lines.json');
compareParserToLines(pdfFile, linesFile); 