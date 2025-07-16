const fs = require('fs');
const path = require('path');

async function testActualPdf() {
  console.log('Testing parser on actual PDF file...');
  
  const pdfPath = path.join(__dirname, 'data', 'Bank-of-America-sample-bank-statement.pdf');
  
  if (!fs.existsSync(pdfPath)) {
    console.error('PDF file not found:', pdfPath);
    return;
  }
  
  try {
    // Read the PDF file
    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log('PDF file loaded, size:', pdfBuffer.length, 'bytes');
    
    // Import the parser using dynamic import for TypeScript
    const { BankStatementParser } = await import('../utils/parser.ts');
    
    // Create parser instance with debug enabled
    const parser = new BankStatementParser(undefined, true);
    
    // Extract text first to see what we're working with
    console.log('\n=== EXTRACTING TEXT ===');
    const extractedText = await parser.extractTextFromPdf(pdfBuffer);
    console.log('Extracted text length:', extractedText.length);
    console.log('\n=== FIRST 500 CHARACTERS ===');
    console.log(extractedText.substring(0, 500));
    console.log('\n=== LAST 500 CHARACTERS ===');
    console.log(extractedText.substring(extractedText.length - 500));
    
    // Parse the bank statement
    console.log('\n=== PARSING BANK STATEMENT ===');
    const result = await parser.parseBankStatement(extractedText);
    
    console.log('\n=== PARSING RESULTS ===');
    console.log('Bank Name:', result.bankName);
    console.log('Account Number:', result.accountNumber);
    console.log('Statement Period:', result.statementPeriod);
    console.log('Opening Balance:', result.openingBalance);
    console.log('Closing Balance:', result.closingBalance);
    console.log('Total Transactions:', result.transactions.length);
    console.log('Confidence:', result.metadata.confidence);
    console.log('Processing Time:', result.metadata.processingTime, 'ms');
    
    if (result.transactions.length > 0) {
      console.log('\n=== FIRST 5 TRANSACTIONS ===');
      result.transactions.slice(0, 5).forEach((tx, index) => {
        console.log(`${index + 1}. ${tx.date.toISOString().split('T')[0]} | ${tx.description.substring(0, 40)}... | $${tx.amount} | ${tx.type}`);
      });
    } else {
      console.log('\n=== NO TRANSACTIONS FOUND ===');
      console.log('This indicates the parser needs to be updated for multi-line transaction support.');
    }
    
  } catch (error) {
    console.error('Error testing PDF:', error);
  }
}

testActualPdf().catch(console.error); 