// authTest.js
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

dotenv.config();

const BASE_URL = 'http://localhost:3000/auth'; // שנה אם יש prefix אחר
const TEST_EMAIL = `user${Date.now()}@example.com`;
const TEST_PASSWORD = 'StrongPassword123!';
const TEST_NAME = 'Tester';

async function runTests() {
  console.log('===== Supabase Auth Test =====');

  // 1️⃣ Register
  console.log('\n🧩 Registering new user...');
  let res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD, name: TEST_NAME }),
  });
  let register = await res.json();
  console.log('Register response:', register);

  if (!register.success) throw new Error('Registration failed');

  // 2️⃣ Login
  console.log('\n🔑 Logging in...');
  res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
  });
  let login = await res.json();
  console.log('Login response:', login);

  if (!login.success || !login.token) throw new Error('Login failed');

  const token = login.token;

  // 3️⃣ Verify JWT locally
  console.log('\n🧾 Verifying JWT locally...');
  const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
  console.log('Decoded token:', decoded);

  // 4️⃣ Protected route test (אם יש)
  console.log('\n🛡️ Testing protected route (optional)...');
  try {
    const protectedRes = await fetch('http://localhost:3000/api/protected', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const protectedData = await protectedRes.json();
    console.log('Protected route response:', protectedData);
  } catch {
    console.log('Protected route not found — skipping.');
  }

  console.log('\n✅ All tests passed successfully.');
}

runTests().catch((err) => {
  console.error('\n❌ Test failed:', err.message);
  process.exit(1);
});
