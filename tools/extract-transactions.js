const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  console.error('Usage: node extract-transactions.js <extracted-text-file>');
  process.exit(1);
}

const inputPath = process.argv[2];
const outputPath = process.argv[3] || 'transactions.json';
const year = 2016; // Set the correct year for your statement

const text = fs.readFileSync(inputPath, 'utf8');
const lines = text.split(/\r?\n/);

const transactionRegex = /^(\d{2})\/(\d{2})\/IN.*?([\-\d,.]+)\s*(.*)$/i;
const altTransactionRegex = /^(\d{2})\/(\d{2})\/IN.*?([\-\d,.]+)$/i;

const transactions = [];

for (const line of lines) {
  // Try to match transaction lines
  let match = line.match(/^(\d{2})\/(\d{2})\/IN.*?([\-\d,.]+)\s*(.*)$/i);
  if (!match) {
    // Try alternate pattern (amount at end, no description)
    match = line.match(/^(\d{2})\/(\d{2})\/IN.*?([\-\d,.]+)$/i);
  }
  if (match) {
    const [_, month, day, amountStr, desc] = match;
    const date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const amount = parseFloat(amountStr.replace(/,/g, ''));
    const description = (desc || line.replace(/^(\d{2})\/(\d{2})\/IN/, '').replace(amountStr, '').trim());
    transactions.push({
      date,
      description,
      amount,
      type: amount > 0 ? 'deposit' : 'withdrawal',
    });
  }
}

fs.writeFileSync(outputPath, JSON.stringify(transactions, null, 2));
console.log(`Extracted ${transactions.length} transactions to ${outputPath}`); 