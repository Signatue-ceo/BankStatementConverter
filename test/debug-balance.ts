import fs from 'fs';
import path from 'path';
import { BankStatementParser } from '@/utils/parser';

async function debugBalance() {
  console.log('Debugging balance extraction...');
  
  const pdfPath = path.join(__dirname, 'data', 'Bank-of-America-sample-bank-statement.pdf');
  
  if (!fs.existsSync(pdfPath)) {
    console.error('PDF file not found:', pdfPath);
    return;
  }
  
  try {
    // Read the PDF file
    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log('PDF file loaded, size:', pdfBuffer.length, 'bytes');
    
    // Create parser instance with debug enabled
    const parser = new BankStatementParser(undefined, true);
    
    // Extract text
    const extractedText = await parser.extractTextFromPdf(pdfBuffer);
    
    // Look for balance patterns in the text
    console.log('\n=== LOOKING FOR BALANCE PATTERNS ===');
    
    // Search for the specific pattern mentioned
    const balancePatterns = [
      /\$[\d,]+\.\d{2}\s*[-–—]\s*$/gm,
      /\$[\d,]+\.\d{2}\s*$/gm,
      /ending\s+balance.*\$/gi,
      /closing\s+balance.*\$/gi
    ];
    
    balancePatterns.forEach((pattern, index) => {
      console.log(`\nPattern ${index + 1}:`, pattern.source);
      const matches = extractedText.match(pattern);
      if (matches) {
        console.log('Matches found:', matches);
      } else {
        console.log('No matches found');
      }
    });
    
    // Show the last 20 lines of the text
    console.log('\n=== LAST 20 LINES ===');
    const lines = extractedText.split('\n');
    const lastLines = lines.slice(-20);
    lastLines.forEach((line, index) => {
      console.log(`${lines.length - 20 + index}: "${line}"`);
    });
    
    // Show lines containing dollar amounts
    console.log('\n=== LINES WITH DOLLAR AMOUNTS ===');
    const dollarLines = lines.filter(line => /\$[\d,]+\.\d{2}/.test(line));
    dollarLines.forEach((line, index) => {
      console.log(`${index + 1}: "${line}"`);
    });
    
  } catch (error) {
    console.error('Error debugging balance:', error);
  }
}

debugBalance().catch(console.error); 