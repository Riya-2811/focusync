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

async function testAnalytics() {
  try {
    console.log('🧪 Analytics Feature Test Suite\n');

    // Step 1: Create a test user
    console.log('1️⃣ Creating test user...');
    const signupRes = await makeRequest('POST', '/api/auth/signup', {
      username: `analyticsuser_${Date.now()}`,
      email: `analytics_${Date.now()}@test.com`,
      password: 'testpass123',
    });
    const token = signupRes.data.token;
    console.log(`   ✅ User created`);
    console.log();

    // Step 2: Create test tasks
    console.log('2️⃣ Creating test tasks...');
    const taskRes1 = await makeRequest(
      'POST',
      '/api/tasks',
      {
        title: 'Complete report',
        description: 'Finish quarterly report',
        priority: 'High',
        dueDate: '2026-03-20',
      },
      token
    );
    const taskRes2 = await makeRequest(
      'POST',
      '/api/tasks',
      {
        title: 'Review code',
        description: 'Review pull requests',
        priority: 'Medium',
        dueDate: '2026-03-15',
      },
      token
    );
    const taskRes3 = await makeRequest(
      'POST',
      '/api/tasks',
      {
        title: 'Update docs',
        description: 'Update API documentation',
        priority: 'Low',
        dueDate: '2026-03-18',
      },
      token
    );
    console.log(`   ✅ Created 3 tasks`);
    console.log();

    // Step 3: Mark one task as complete
    console.log('3️⃣ Marking task as complete...');
    await makeRequest('PATCH', `/api/tasks/${taskRes1.data.id}/toggle`, {}, token);
    console.log(`   ✅ Task marked complete`);
    console.log();

    // Step 4: Create focus sessions
    console.log('4️⃣ Creating focus sessions...');
    const sessionRes1 = await makeRequest(
      'POST',
      '/api/focus',
      { duration: 25, goalCategory: 'Work' },
      token
    );
    console.log(`   ✅ Session 1: 25 min (Work)`);

    const sessionRes2 = await makeRequest(
      'POST',
      '/api/focus',
      { duration: 25, goalCategory: 'Studies' },
      token
    );
    console.log(`   ✅ Session 2: 25 min (Studies)`);

    const sessionRes3 = await makeRequest(
      'POST',
      '/api/focus',
      { duration: 30, goalCategory: 'Fitness' },
      token
    );
    console.log(`   ✅ Session 3: 30 min (Fitness)`);
    console.log();

    // Step 5: Fetch all focus sessions
    console.log('5️⃣ Fetching all focus sessions...');
    const getSessionsRes = await makeRequest('GET', '/api/focus', null, token);
    console.log(`   ✅ Retrieved ${getSessionsRes.data.length} sessions`);
    console.log();

    // Step 6: Fetch analytics summary
    console.log('6️⃣ Fetching analytics summary...');
    const analyticsRes = await makeRequest('GET', '/api/focus/analytics/summary', null, token);
    const analytics = analyticsRes.data;
    console.log(`   ✅ Analytics retrieved`);
    console.log();
    console.log('   📊 Overview:');
    console.log(`      • Total Tasks: ${analytics.overview?.totalTasks}`);
    console.log(`      • Completed Tasks: ${analytics.overview?.completedTasks}`);
    console.log(`      • Focus Sessions: ${analytics.overview?.focusSessions}`);
    console.log(`      • Total Focus Time: ${analytics.overview?.totalFocusTime} minutes`);
    console.log(`      • Average Session Duration: ${analytics.overview?.averageSessionDuration} minutes`);
    console.log();

    console.log('   📈 Weekly Focus Chart:');
    if (analytics.weeklyFocusChart && analytics.weeklyFocusChart.length > 0) {
      analytics.weeklyFocusChart.forEach((day) => {
        console.log(`      • ${day.day}: ${day.minutes} minutes`);
      });
    }
    console.log();

    console.log('   🎯 Task Completion:');
    console.log(`      • Completed: ${analytics.taskCompletion?.completed}`);
    console.log(`      • Pending: ${analytics.taskCompletion?.pending}`);
    console.log();

    console.log('   🏆 Goal Distribution:');
    Object.entries(analytics.goalDistribution || {}).forEach(([goal, count]) => {
      console.log(`      • ${goal}: ${count} tasks`);
    });
    console.log();

    console.log('   📋 Task Priority Breakdown:');
    Object.entries(analytics.tasksByPriority || {}).forEach(([priority, count]) => {
      console.log(`      • ${priority}: ${count} tasks`);
    });
    console.log();

    // Verify all data
    const passed = 
      analytics.overview?.totalTasks === 3 &&
      analytics.overview?.completedTasks === 1 &&
      analytics.overview?.focusSessions === 3 &&
      analytics.overview?.totalFocusTime === 80 &&
      analytics.taskCompletion?.completed === 1 &&
      analytics.taskCompletion?.pending === 2;

    if (passed) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ ALL ANALYTICS TESTS PASSED!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log('⚠️ Some data doesn\'t match expected values');
      console.log('Expected: 3 tasks, 1 complete, 3 sessions, 80 min total');
    }

  } catch (err) {
    console.error('\n❌ Test Failed:');
    console.error('Error:', err.message);
  }
}

testAnalytics();
