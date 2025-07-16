const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Test the API endpoint
async function testApi() {
  try {
    console.log('🧪 Testing API endpoint...');
    
    // Dynamic import for fetch
    const fetch = (await import('node-fetch')).default;
    
    // Create form data
    const form = new FormData();
    const testFile = fs.createReadStream(path.join(__dirname, 'data', 'test-content.txt'));
    form.append('file', testFile, 'test-content.txt');
    form.append('format', 'json');
    
    console.log('📤 Sending request to API...');
    
    // Send request
    const response = await fetch('http://localhost:3000/api/convert', {
      method: 'POST',
      body: form
    });
    
    console.log('📥 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ API test successful');
      console.log('📊 Response:', JSON.stringify(result, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ API test failed');
      console.log('📄 Error response:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testApi(); 