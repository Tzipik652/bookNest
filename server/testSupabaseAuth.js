// testUserModel.js
import dotenv from 'dotenv';
dotenv.config();

import supabase from './config/supabaseClient.js';
import jwt from 'jsonwebtoken';
import { createUser, getUserById } from './models/userModel.js';


async function test() {
  try {
    console.log('===== Supabase + JWT Test =====');

    // 1️⃣ יצירת משתמש חדש
    const testEmail = `testuser${Date.now()}@example.com`;
    const testName = 'Test User';
    const userId = crypto.randomUUID(); // id ייחודי

    console.log('Creating user...');
    const user = await createUser({
      id: userId,
      name: testName,
      email: testEmail,
    });

    console.log('User created:', user.email);

    // 2️⃣ יצירת JWT עבור המשתמש
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.SUPABASE_JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('JWT token:', token);

    // 3️⃣ בדיקת ה-JWT
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    console.log('Decoded JWT:', decoded);

    // 4️⃣ קריאה ל-getUserById
    const fetchedUser = await getUserById(user._id);
    console.log('Fetched user from DB:', fetchedUser);

    console.log('✅ All tests passed!');
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

test();
