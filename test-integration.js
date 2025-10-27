// Simple integration test script
// Run this after starting both frontend and backend servers

const API_BASE_URL = 'http://localhost:3000/api/proxy';

async function testAPI() {
    console.log('🧪 Testing API Integration...\n');

    try {
        // Test 1: Health check
        console.log('1. Testing health check...');
        const healthResponse = await fetch(`${API_BASE_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: '/',
                body: {}
            })
        });

        if (healthResponse.ok) {
            console.log('✅ Health check passed');
        } else {
            console.log('❌ Health check failed');
        }

        // Test 2: Phone OTP request
        console.log('\n2. Testing phone OTP request...');
        const otpResponse = await fetch(`${API_BASE_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: '/api/auth/phone/request-otp',
                body: { phone: '+919876543210' }
            })
        });

        if (otpResponse.ok) {
            console.log('✅ Phone OTP request successful');
        } else {
            const error = await otpResponse.json();
            console.log('❌ Phone OTP request failed:', error.message);
        }

        console.log('\n🎉 Integration test completed!');
        console.log('\nTo test the full flow:');
        console.log('1. Start backend: cd Backend && npm start');
        console.log('2. Start frontend: cd lin-frontend && npm run dev');
        console.log('3. Visit http://localhost:3000/signup');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\nMake sure both servers are running:');
        console.log('- Backend: http://localhost:5000');
        console.log('- Frontend: http://localhost:3000');
    }
}

testAPI();
