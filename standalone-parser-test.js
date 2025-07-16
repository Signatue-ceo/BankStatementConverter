const fs = require('fs');
const path = require('path');
const { BankStatementParser } = require('./dist/utils/parser'); // Use compiled JS

(async () => {
  const parser = new BankStatementParser(undefined, true);
  const pdfPath = path.join(__dirname, 'test/data/Bank-of-America-sample-bank-statement.pdf');
  console.log('Reading PDF file:', pdfPath);
  const buffer = fs.readFileSync(pdfPath);
  console.log('PDF file read, size:', buffer.length);
  try {
    console.log('Calling extractTextFromPdf...');
    const text = await parser.extractTextFromPdf(buffer);
    fs.writeFileSync('test/data/bank-statement-extracted.txt', text, 'utf8');
    console.log('Text extraction complete. Length:', text.length);
    const result = await parser.parseBankStatement(text);
    console.log('Parsed result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error during standalone parse:', err);
  }
})(); 