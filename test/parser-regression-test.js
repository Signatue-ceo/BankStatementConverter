const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { BankStatementParser } = require('../dist/utils/parser'); // Adjust path as needed

// List of test cases: each is { pdf: <pdf path>, expected: <expected json path> }
const testCases = [
  {
    pdf: path.join(__dirname, 'data/Bank-of-America-sample-bank-statement.pdf'),
    expected: path.join(__dirname, 'data/Bank-of-America-sample-bank-statement.expected.json'),
  },
  // Add more test cases here
];

(async () => {
  for (const { pdf, expected } of testCases) {
    console.log(`Testing: ${pdf}`);
    const parser = new BankStatementParser(undefined, true);
    const buffer = fs.readFileSync(pdf);
    const expectedJson = JSON.parse(fs.readFileSync(expected, 'utf8'));
    const text = await parser.extractTextFromPdf(buffer);
    const result = await parser.parseBankStatement(text);
    // Remove non-deterministic fields (like id, metadata)
    delete result.id;
    delete result.metadata;
    // Compare
    try {
      assert.deepStrictEqual(result, expectedJson);
      console.log('✅ PASS');
    } catch (err) {
      console.error('❌ FAIL: Output does not match expected.');
      console.error('Differences:', err.message);
      // Optionally, write the actual output for inspection
      fs.writeFileSync(pdf + '.actual.json', JSON.stringify(result, null, 2));
    }
  }
})(); 