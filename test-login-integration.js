// Test script for login integration
const API_BASE_URL = 'http://localhost:3000/api/proxy';

async function testLoginIntegration() {
    console.log('🧪 Testing Login Integration...\n');

    try {
        // Test 1: Health check
        console.log('1. Checking backend health...');
        const healthResponse = await fetch(`${API_BASE_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: '/',
                body: {}
            })
        });

        if (healthResponse.ok) {
            console.log('✅ Backend is running');
        } else {
            console.log('❌ Backend is not responding');
            return;
        }

        // Test 2: Login with phone and DOB
        console.log('\n2. Testing login with phone and DOB...');
        const loginResponse = await fetch(`${API_BASE_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: '/api/users/login',
                body: {
                    phone: '+919876543210',
                    dob: '1990-01-01'
                }
            })
        });

        if (loginResponse.ok) {
            const loginResult = await loginResponse.json();
            console.log('✅ Login request successful');
            console.log('Response:', loginResult);
        } else {
            const error = await loginResponse.json();
            console.log('❌ Login request failed:', error.message);
        }

        // Test 3: OTP verification
        console.log('\n3. Testing OTP verification...');
        const otpResponse = await fetch(`${API_BASE_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                path: '/api/auth/phone/verify-otp',
                body: {
                    phone: '+919876543210',
                    code: '123456'
                }
            })
        });

        if (otpResponse.ok) {
            const otpResult = await otpResponse.json();
            console.log('✅ OTP verification successful');
            console.log('Response:', otpResult);
        } else {
            const error = await otpResponse.json();
            console.log('❌ OTP verification failed:', error.message);
        }

        console.log('\n🎉 Login integration test completed!');
        console.log('\nTo test the full login flow:');
        console.log('1. Start backend: cd Backend && npm start');
        console.log('2. Start frontend: cd lin-frontend && npm run dev');
        console.log('3. Visit http://localhost:3000/login');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\nMake sure both servers are running:');
        console.log('- Backend: http://localhost:5000');
        console.log('- Frontend: http://localhost:3000');
    }
}

testLoginIntegration();
