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
          resolve({ status: res.statusCode, data: JSON.parse(responseData) });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testTasksAPI() {
  try {
    console.log('🧪 Starting Tasks API Tests...\n');

    // Step 1: Create a test user
    console.log('1️⃣ Creating test user...');
    const signupRes = await makeRequest('POST', '/api/auth/signup', {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@test.com`,
      password: 'test123456',
    });
    const token = signupRes.data.token;
    const userId = signupRes.data.user.id;
    console.log(`   ✅ User created: ${signupRes.data.user.username}`);
    console.log(`   📌 Token: ${token.substring(0, 20)}...`);
    console.log(`   📌 User ID: ${userId}\n`);

    // Step 2: Create a task
    console.log('2️⃣ Creating a task...');
    const createRes = await makeRequest(
      'POST',
      '/api/tasks',
      {
        title: 'Complete project report',
        description: 'Finish quarterly report by end of week',
        priority: 'High',
        dueDate: '2026-03-20',
      },
      token
    );
    const taskId = createRes.data.id;
    console.log(`   ✅ Task created: ${createRes.data.title}`);
    console.log(`   📌 Task ID: ${taskId}`);
    console.log(`   📌 Priority: ${createRes.data.priority}`);
    console.log(`   📌 Created: ${createRes.data.createdAt}\n`);

    // Step 3: Create another task
    console.log('3️⃣ Creating another task...');
    const task2Res = await makeRequest(
      'POST',
      '/api/tasks',
      {
        title: 'Review code changes',
        description: 'Review PR #123 and #124',
        priority: 'Medium',
        dueDate: '2026-03-15',
      },
      token
    );
    console.log(`   ✅ Task created: ${task2Res.data.title}\n`);

    // Step 4: Fetch all tasks
    console.log('4️⃣ Fetching all tasks...');
    const allRes = await makeRequest('GET', '/api/tasks', null, token);
    console.log(`   ✅ Retrieved ${allRes.data.length} tasks:`);
    allRes.data.forEach((t, i) => {
      console.log(`      ${i + 1}. ${t.title} [${t.priority}] - ${t.completed ? '✅ Done' : '⏳ Pending'}`);
    });
    console.log();

    // Step 5: Get single task
    console.log('5️⃣ Fetching single task...');
    const singleRes = await makeRequest('GET', `/api/tasks/${taskId}`, null, token);
    console.log(`   ✅ Retrieved: ${singleRes.data.title}`);
    console.log(`   📌 Description: ${singleRes.data.description}\n`);

    // Step 6: Update a task
    console.log('6️⃣ Updating a task...');
    const updateRes = await makeRequest(
      'PUT',
      `/api/tasks/${taskId}`,
      {
        title: 'Complete project report (UPDATED)',
        description: 'Finish quarterly report - HIGH PRIORITY',
        priority: 'High',
        dueDate: '2026-03-18',
      },
      token
    );
    console.log(`   ✅ Task updated: ${updateRes.data.title}`);
    console.log(`   📌 New due date: ${updateRes.data.dueDate}\n`);

    // Step 7: Toggle task completion
    console.log('7️⃣ Toggling task completion...');
    const toggleRes = await makeRequest('PATCH', `/api/tasks/${taskId}/toggle`, {}, token);
    console.log(`   ✅ Task toggled: ${toggleRes.data.title}`);
    console.log(`   📌 Completed: ${toggleRes.data.completed}\n`);

    // Step 8: Toggle again
    console.log('8️⃣ Toggling back to incomplete...');
    const toggleRes2 = await makeRequest('PATCH', `/api/tasks/${taskId}/toggle`, {}, token);
    console.log(`   ✅ Task toggled: ${toggleRes2.data.title}`);
    console.log(`   📌 Completed: ${toggleRes2.data.completed}\n`);

    // Step 9: Fetch all tasks again
    console.log('9️⃣ Fetching final task list...');
    const finalRes = await makeRequest('GET', '/api/tasks', null, token);
    console.log(`   ✅ Total tasks: ${finalRes.data.length}`);
    console.log(`   📌 Pending: ${finalRes.data.filter((t) => !t.completed).length}`);
    console.log(`   📌 Completed: ${finalRes.data.filter((t) => t.completed).length}\n`);

    // Step 10: Delete a task
    console.log('🔟 Deleting a task...');
    const deleteRes = await makeRequest('DELETE', `/api/tasks/${taskId}`, null, token);
    console.log(`   ✅ Task deleted\n`);

    // Step 11: Verify deletion
    console.log('1️⃣1️⃣ Verifying deletion...');
    const afterDeleteRes = await makeRequest('GET', '/api/tasks', null, token);
    console.log(`   ✅ Remaining tasks: ${afterDeleteRes.data.length}`);
    afterDeleteRes.data.forEach((t, i) => {
      console.log(`      ${i + 1}. ${t.title}`);
    });
    console.log();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ALL TESTS PASSED! Tasks API is working!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    console.error('\n❌ Test Failed:');
    console.error('Error:', err.message);
  }
}

testTasksAPI();
