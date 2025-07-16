const fs = require('fs');
const path = require('path');

// Debug script to isolate PDF parsing issue
async function debugPdfIssue() {
  try {
    console.log('🔍 Debugging PDF parsing issue...');
    
    // Check current working directory
    console.log('📁 Current working directory:', process.cwd());
    
    // Check if the problematic file exists in our test directory
    const ourTestPath = path.join(process.cwd(), 'test', 'data', '05-versions-space.pdf');
    console.log('📁 Our test path:', ourTestPath);
    console.log('📁 File exists:', fs.existsSync(ourTestPath));
    
    // Check if the file exists in node_modules
    const nodeModulesPath = path.join(process.cwd(), 'node_modules', 'pdf-parse', 'test', 'data', '05-versions-space.pdf');
    console.log('📁 Node modules path:', nodeModulesPath);
    console.log('📁 File exists:', fs.existsSync(nodeModulesPath));
    
    // Check environment variables
    console.log('🌍 Environment variables:');
    Object.keys(process.env).forEach(key => {
      if (key.toLowerCase().includes('pdf') || key.toLowerCase().includes('test') || key.toLowerCase().includes('path')) {
        console.log(`  ${key}: ${process.env[key]}`);
      }
    });
    
    // Check if there are any global variables
    console.log('🌍 Global variables:');
    Object.keys(global).forEach(key => {
      if (key.toLowerCase().includes('pdf') || key.toLowerCase().includes('test') || key.toLowerCase().includes('path')) {
        console.log(`  ${key}: ${typeof global[key]}`);
      }
    });
    
    // Try to import pdf-parse and see what happens
    console.log('📦 Importing pdf-parse...');
    const pdfParse = require('pdf-parse');
    console.log('✅ pdf-parse imported successfully');
    
    // Check if there are any cached paths in the module
    console.log('🔍 Checking pdf-parse module properties:');
    Object.keys(pdfParse).forEach(key => {
      console.log(`  ${key}: ${typeof pdfParse[key]}`);
    });
    
    console.log('✅ Debug completed');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

debugPdfIssue(); 