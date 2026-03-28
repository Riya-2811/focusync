const http = require('http');

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (token) {
      options.headers.Authorization = token;
    }

    let responseData = '';
    const req = http.request(options, (res) => {
      res.on('data', (chunk) => (responseData += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData, raw: true });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testSimple() {
  try {
    console.log('🧪 Simple API Test\n');

    // Test 1: Signup
    console.log('1️⃣ Signup...');
    const signupRes = await makeRequest('POST', '/api/auth/signup', {
      username: `user_${Date.now()}`,
      email: `test_${Date.now()}@test.com`,
      password: 'pass123',
    });
    console.log('   Status:', signupRes.status);
    console.log('   Response keys:', Object.keys(signupRes.data));
    const token = signupRes.data.token;
    console.log('   Token:', token ? '✅ Got token' : '❌ No token');
    console.log();

    // Test 2: Create task
    console.log('2️⃣ Create Task...');
    const createRes = await makeRequest(
      'POST',
      '/api/tasks',
      {
        title: 'Test task',
        description: 'Test description',
        priority: 'High',
        dueDate: '2026-03-20',
      },
      token
    );
    console.log('   Status:', createRes.status);
    console.log('   Response:', JSON.stringify(createRes.data, null, 2));
    console.log();

    // Test 3: Get tasks
    console.log('3️⃣ Get All Tasks...');
    const getRes = await makeRequest('GET', '/api/tasks', null, token);
    console.log('   Status:', getRes.status);
    console.log('   Type:', typeof getRes.data);
    if (Array.isArray(getRes.data)) {
      console.log('   Count:', getRes.data.length);
      if (getRes.data.length > 0) {
        console.log('   First task:', JSON.stringify(getRes.data[0], null, 2));
      }
    } else {
      console.log('   Response:', getRes.data);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testSimple();
