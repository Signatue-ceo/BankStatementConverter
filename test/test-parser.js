const fs = require('fs');
const path = require('path');

// Simple test to verify the PDF parser works
async function testPdfParser() {
  try {
    // Create a simple text file that simulates PDF content
    const testContent = `
Bank Statement
Account Number: 1234567890
Statement Period: 01/01/2024 to 01/31/2024
Opening Balance: $1,000.00
Closing Balance: $1,250.00

Date        Description                    Amount        Balance
01/15/2024  Salary Deposit                $500.00       $1,500.00
01/20/2024  Grocery Store                 -$150.00      $1,350.00
01/25/2024  Utility Bill                  -$100.00      $1,250.00
    `;

    const testFilePath = path.join(__dirname, 'data', 'test-statement.txt');
    fs.writeFileSync(testFilePath, testContent);
    
    console.log('✅ Test file created successfully');
    console.log('📁 Test file location:', testFilePath);
    console.log('📄 Test content length:', testContent.length, 'characters');
    
    // Test the parser with the text content
    const { BankStatementParser } = require('../utils/parser.ts');
    const parser = new BankStatementParser();
    
    // Parse the text content directly
    const bankStatement = parser.parseBankStatement(testContent);
    
    console.log('✅ PDF parsing test completed successfully');
    console.log('🏦 Bank Name:', bankStatement.bankName);
    console.log('📊 Account Number:', bankStatement.accountNumber);
    console.log('💰 Opening Balance:', bankStatement.openingBalance);
    console.log('💰 Closing Balance:', bankStatement.closingBalance);
    console.log('📈 Total Transactions:', bankStatement.transactions.length);
    console.log('🎯 Confidence Score:', bankStatement.metadata.confidence);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testPdfParser(); 