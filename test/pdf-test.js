const fs = require('fs');
const path = require('path');

// Simple test to isolate PDF parsing issue
async function testPdfParse() {
  try {
    console.log('🧪 Testing PDF parsing...');
    
    // Create a simple PDF-like buffer (just for testing)
    const testBuffer = Buffer.from('Test PDF content');
    
    // Try to import pdf-parse
    console.log('📦 Importing pdf-parse...');
    const pdfParse = require('pdf-parse');
    
    console.log('✅ pdf-parse imported successfully');
    console.log('📄 pdf-parse version:', require('pdf-parse/package.json').version);
    
    // Try to parse the test buffer
    console.log('🔍 Attempting to parse test buffer...');
    try {
      const result = await pdfParse(testBuffer);
      console.log('✅ PDF parsing successful');
      console.log('📄 Extracted text length:', result.text.length);
    } catch (parseError) {
      console.log('⚠️ Expected parse error (invalid PDF):', parseError.message);
    }
    
    // Check if there are any global variables or cached paths
    console.log('🔍 Checking for any cached paths...');
    const globalVars = Object.keys(global).filter(key => 
      key.toLowerCase().includes('pdf') || 
      key.toLowerCase().includes('path') ||
      key.toLowerCase().includes('test')
    );
    console.log('🌍 Global variables with PDF/path/test:', globalVars);
    
    console.log('✅ PDF parsing test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testPdfParse(); 