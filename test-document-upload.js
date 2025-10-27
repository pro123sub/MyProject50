// Test script for document upload functionality
const API_BASE_URL = 'http://localhost:3000/api';

async function testDocumentUpload() {
    console.log('🧪 Testing Document Upload Integration...\n');

    try {
        // Test 1: Check if backend is running
        console.log('1. Checking backend health...');
        const healthResponse = await fetch(`${API_BASE_URL}/proxy`, {
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

        // Test 2: Test document upload endpoint
        console.log('\n2. Testing document upload endpoint...');

        // Create a test FormData
        const formData = new FormData();
        formData.append('panNumber', 'ABCDE1234F');
        formData.append('aadhaarNumber', '123456789012');
        formData.append('latitude', '28.6139');
        formData.append('longitude', '77.2090');
        formData.append('consent', 'true');

        // Create a test file (empty PDF)
        const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
        formData.append('salarySlips', testFile);
        formData.append('bankStatements', testFile);
        formData.append('selfie', testFile);

        const uploadResponse = await fetch(`${API_BASE_URL}/upload-documents`, {
            method: 'POST',
            headers: {
                // Note: Don't set Content-Type for FormData, let browser set it
            },
            body: formData,
        });

        if (uploadResponse.ok) {
            const result = await uploadResponse.json();
            console.log('✅ Document upload endpoint is working');
            console.log('Response:', result);
        } else {
            const error = await uploadResponse.json();
            console.log('❌ Document upload failed:', error.message);
        }

        console.log('\n🎉 Document upload test completed!');
        console.log('\nTo test the full signup flow:');
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

testDocumentUpload();
