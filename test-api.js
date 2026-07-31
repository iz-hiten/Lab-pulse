// Quick API test script
// Run with: node test-api.js

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Lab Pulse API...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing /api/health');
    const healthRes = await fetch(`${API_URL}/api/health`);
    const healthData = await healthRes.json();
    console.log('✅ Health check:', healthData);
    console.log('');

    // Test 2: Get Schools
    console.log('2️⃣ Testing /api/schools');
    const schoolsRes = await fetch(`${API_URL}/api/schools`);
    const schoolsData = await schoolsRes.json();
    console.log('✅ Schools data:', {
      summaryCount: schoolsData.summaries?.length || 0,
      alertCount: schoolsData.alerts?.length || 0
    });
    console.log('');

    // Test 3: Login
    console.log('3️⃣ Testing /api/auth/login');
    const loginRes = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@labpulse.org',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    
    if (loginData.token) {
      console.log('✅ Login successful');
      console.log('   User:', loginData.user.name);
      console.log('   Role:', loginData.user.role);
      console.log('');

      // Test 4: Get User Profile
      console.log('4️⃣ Testing /api/auth/me');
      const meRes = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      const meData = await meRes.json();
      console.log('✅ Profile data:', meData);
      console.log('');

      // Test 5: Get Entries
      console.log('5️⃣ Testing /api/entries');
      const entriesRes = await fetch(`${API_URL}/api/entries?limit=5`);
      const entriesData = await entriesRes.json();
      console.log('✅ Recent entries:', entriesData.length, 'entries found');
      console.log('');

    } else {
      console.log('❌ Login failed:', loginData);
    }

    console.log('🎉 All tests completed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('');
    console.error('Make sure the server is running:');
    console.error('  npm run dev');
    process.exit(1);
  }
}

testAPI();
