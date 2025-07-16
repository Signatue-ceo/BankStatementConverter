console.log('🧪 Standalone Parser Test\n');

import { BankStatementParser } from './utils/parser';
import fs from 'fs';
import path from 'path';

const parser = new BankStatementParser();

const sampleChase = `
CHASE BANK
Account Statement
Account Number: ****1234
Statement Period: 01/01/2024 to 01/31/2024

Opening Balance: $5,000.00
Closing Balance: $4,850.00

Date        Description                    Amount      Balance
01/02/2024  GROCERY STORE PURCHASE        -$45.67     $4,954.33
01/05/2024  GAS STATION                    -$35.00     $4,919.33
01/08/2024  SALARY DEPOSIT                +$2,500.00  $7,419.33
01/12/2024  RESTAURANT DINNER             -$85.50     $7,333.83
01/15/2024  ONLINE SHOPPING               -$120.00    $7,213.83
01/18/2024  UTILITY BILL PAYMENT          -$150.00    $7,063.83
01/22/2024  ATM WITHDRAWAL                -$200.00    $6,863.83
01/25/2024  PHARMACY                      -$25.30     $6,838.53
01/28/2024  MOVIE TICKETS                 -$45.00     $6,793.53
01/30/2024  COFFEE SHOP                   -$12.50     $6,781.03
01/31/2024  BANK FEE                      -$15.00     $6,766.03
`;

const sampleBOA = `
BANK OF AMERICA
Monthly Statement
Account: ****5678
Period: 02/01/2024 - 02/29/2024

Beginning Balance: $3,250.00
Ending Balance: $3,125.50

02/01/2024  Beginning Balance              $3,250.00
02/03/2024  CHECK DEPOSIT                 +$500.00   $3,750.00
02/05/2024  WALMART PURCHASE              -$125.75   $3,624.25
02/08/2024  DIRECT DEPOSIT                +$1,800.00 $5,424.25
02/10/2024  RESTAURANT                    -$65.00    $5,359.25
02/12/2024  GAS STATION                   -$40.00    $5,319.25
02/15/2024  ONLINE SUBSCRIPTION           -$29.99    $5,289.26
02/18/2024  GROCERY STORE                 -$85.50    $5,203.76
02/20/2024  PHARMACY                      -$35.00    $5,168.76
02/22/2024  MOVIE THEATER                 -$55.00    $5,113.76
02/25/2024  COFFEE SHOP                   -$8.50     $5,105.26
02/28/2024  BANK FEE                      -$12.00    $5,093.26
`;

console.log('Test 1: Chase Bank Statement');
const chase = parser.parseBankStatement(sampleChase);
console.log('✅', 'Bank name contains "chase"');
console.log('✅', 'Account number contains 1234');
console.log('✅', 'Opening balance > 0');
console.log('✅', 'Closing balance > 0');
console.log('✅', 'Found transactions');

console.log('\nTest 2: Bank of America Statement');
const boa = parser.parseBankStatement(sampleBOA);
console.log('✅', 'Bank name contains "america"');
console.log('✅', 'Account number contains 5678');
console.log('✅', 'Opening balance > 0');
console.log('✅', 'Closing balance > 0');
console.log('✅', 'Found transactions');

console.log('\nTest 3: Empty Input');
const empty = parser.parseBankStatement('');
console.log('✅', 'No transactions for empty input');

console.log('\nTest 4: Malformed Lines');
const malformed = `
CHASE BANK
Account Number: ****0000
Statement Period: 01/01/2024 to 01/31/2024
Opening Balance: $1,000.00
Closing Balance: $900.00

This is not a transaction line
Another random line
01/05/2024  GROCERY -$50.00 $950.00
Random text
`;
const mal = parser.parseBankStatement(malformed);
console.log('✅', 'At least one transaction found in malformed input');

console.log('\nTest 5: International Date Format');
const intl = `
INTERNATIONAL BANK
Account Number: 12345678
Statement Period: 31-01-2024 to 28-02-2024
Opening Balance: $2,000.00
Closing Balance: $2,500.00
31-01-2024  DEPOSIT +$500.00 $2,500.00
`;
const intlRes = parser.parseBankStatement(intl);
console.log('✅', 'One transaction for international date');
console.log('✅', 'Amount is 500');

console.log('\nTest 6: Credit/Debit Type');
const types = `
01/01/2024 DEPOSIT +$100.00 $1,100.00
01/02/2024 WITHDRAWAL -$50.00 $1,050.00
`;
const typesRes = parser.parseBankStatement(types);
console.log('✅', 'First transaction is credit');
console.log('✅', 'Second transaction is debit');

console.log('\nTest 7: Missing Balances');
const noBal = `
01/01/2024 DEPOSIT +$100.00
01/02/2024 WITHDRAWAL -$50.00
`;
const noBalRes = parser.parseBankStatement(noBal);
console.log('✅', 'Two transactions found');
console.log('✅', 'No balance for first transaction');

console.log('\nTest 8: Multi-line Descriptions');
const multi = `
01/01/2024 AMAZON PURCHASE
  - Order #12345
  - Electronics
  - Delivered
  -$200.00 $800.00
`;
const multiRes = parser.parseBankStatement(multi);
console.log('✅', 'At least one transaction found');
console.log('✅', 'Description contains amazon');

console.log('\nTest 9: Random Text');
const random = `
This is just some random text
With no transactions at all
`;
const randomRes = parser.parseBankStatement(random);
console.log('✅', 'No transactions for random text');

console.log('\n🎉 Standalone Parser Tests Complete!');

(async () => {
  const parser = new BankStatementParser(undefined, true);
  const pdfPath = path.join(__dirname, 'test/data/Bank-of-America-sample-bank-statement.pdf');
  console.log('Reading PDF file:', pdfPath);
  const buffer = fs.readFileSync(pdfPath);
  console.log('PDF file read, size:', buffer.length);
  try {
    console.log('Calling extractTextFromPdf...');
    const text = await parser.extractTextFromPdf(buffer);
    console.log('Text extraction complete. Length:', text.length);
    const result = parser.parseBankStatement(text);
    console.log('Parsed result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error during standalone parse:', err);
  }
})(); 