const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

// Key fields to look for (as regex patterns)
const keyPatterns = [
  { label: 'Account number', pattern: /Account number:\s*8981\s*1929\s*X+/i },
  { label: 'Statement period', pattern: /for\s+April\s+01,\s*2016\s*to\s*April\s+30,\s*2016/i },
  { label: 'Opening balance', pattern: /Beginning balance on April 01, 2016\s*\$?48,993\.43/ },
  { label: 'Closing balance', pattern: /Ending balance on April 30, 2016\s*\$?50,587\.57/ },
  { label: 'Deposits and other additions', pattern: /Deposits and other additions\s*6,517\.58/ },
  { label: 'Withdrawals and other subtractions', pattern: /Withdrawals and other subtractions\s*-4,923\.44/ },
  { label: 'Sample transaction', pattern: /04\/07\/16[\s\S]*Sasha Sofee[\s\S]*156\.87/ },
  { label: 'ACH Direct Deposit', pattern: /ACH Direct Deposit There & Safe Logistics LLC, Ref#45250285/ },
];

async function verifyFieldsInExtractedText(pdfPath) {
  const buffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(buffer);
  const extractedText = data.text;

  console.log('--- Verifying Key Fields in Extracted PDF Text (Regex/Fuzzy) ---');
  let allFound = true;
  for (const { label, pattern } of keyPatterns) {
    const match = extractedText.match(pattern);
    if (match) {
      console.log(`✅ Found [${label}]: "${match[0].replace(/\n/g, ' | ')}"`);
    } else {
      console.log(`❌ Missing [${label}] (pattern: ${pattern})`);
      allFound = false;
    }
  }
  if (allFound) {
    console.log('\n🎉 All key fields were found in the extracted text!');
  } else {
    console.log('\n⚠️ Some key fields were NOT found. Check the extraction or patterns.');
  }
}

const pdfFile = path.join(__dirname, 'data', 'Bank-of-America-sample-bank-statement.pdf');
verifyFieldsInExtractedText(pdfFile); 