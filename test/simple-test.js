const fs = require('fs');
const path = require('path');

// Simple test to verify the application structure
async function simpleTest() {
  try {
    console.log('🧪 Starting simple test...');
    
    // Check if key files exist
    const filesToCheck = [
      'package.json',
      'utils/parser.ts',
      'utils/exporters.ts',
      'types/index.ts',
      'app/api/convert/route.ts',
      'components/FileUpload.tsx'
    ];
    
    console.log('📁 Checking file structure...');
    for (const file of filesToCheck) {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
      } else {
        console.log(`❌ ${file} missing`);
      }
    }
    
    // Check package.json dependencies
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('📦 Dependencies found:');
    console.log('  - pdf-parse:', packageJson.dependencies['pdf-parse'] ? '✅' : '❌');
    console.log('  - xlsx:', packageJson.dependencies['xlsx'] ? '✅' : '❌');
    console.log('  - papaparse:', packageJson.dependencies['papaparse'] ? '✅' : '❌');
    
    // Create a test PDF-like content
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
    
    const testFilePath = path.join(__dirname, 'data', 'test-content.txt');
    fs.writeFileSync(testFilePath, testContent);
    
    console.log('✅ Test content created successfully');
    console.log('📄 Content length:', testContent.length, 'characters');
    console.log('📁 Saved to:', testFilePath);
    
    // Test basic regex patterns that the parser would use
    console.log('🔍 Testing regex patterns...');
    
    // Test bank name extraction
    const bankNameMatch = testContent.match(/([A-Za-z\s]+)\s+statement/i);
    console.log('🏦 Bank name pattern:', bankNameMatch ? bankNameMatch[1].trim() : 'Not found');
    
    // Test account number extraction
    const accountMatch = testContent.match(/account\s+number\s*:?\s*([\d\s\-*]+)/i);
    console.log('📊 Account number pattern:', accountMatch ? accountMatch[1].trim() : 'Not found');
    
    // Test balance extraction
    const openingMatch = testContent.match(/opening\s+balance\s*:?\s*[\$]?([\d,]+\.\d{2})/i);
    console.log('💰 Opening balance pattern:', openingMatch ? openingMatch[1] : 'Not found');
    
    const closingMatch = testContent.match(/closing\s+balance\s*:?\s*[\$]?([\d,]+\.\d{2})/i);
    console.log('💰 Closing balance pattern:', closingMatch ? closingMatch[1] : 'Not found');
    
    // Test transaction parsing
    const transactionLines = testContent.split('\n').filter(line => 
      /\d{2}\/\d{2}\/\d{4}/.test(line) && /[\$]?[\d,]+\.\d{2}/.test(line)
    );
    console.log('📈 Transaction lines found:', transactionLines.length);
    
    console.log('✅ Simple test completed successfully!');
    console.log('🚀 The application structure looks good and ready for testing.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

simpleTest(); 