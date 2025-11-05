
import sql from '../db/connection.js'; // נתיב יחסי נכון לקובץ החיבור שלך
import bcrypt from 'bcrypt'; // ספרייה נפוצה להצפנת סיסמאות

// --- 1. מציאת משתמשים ---

/**
 * מוצא משתמש לפי מזהה ייחודי (_id).
 * @param {string} id - מזהה UUID של המשתמש.
 * @returns {Promise<Object | null>} אובייקט המשתמש או null אם לא נמצא.
 */
async function findById(id) {
    const users = await sql`
        SELECT _id, name, email, role, auth_provider, favorites, date_created
        FROM users
        WHERE _id = ${id}
    `;
    return users.length ? users[0] : null;
}

/**
 * מוצא משתמש לפי כתובת אימייל.
 * @param {string} email - כתובת האימייל של המשתמש.
 * @param {boolean} includePassword - האם לכלול את הסיסמה המוצפנת (נחוץ לצורך התחברות).
 * @returns {Promise<Object | null>} אובייקט המשתמש או null.
 */
async function findByEmail(email, includePassword = false) {
    const selectFields = includePassword 
        ? '_id, name, email, password, role, auth_provider, favorites, date_created' 
        : '_id, name, email, role, auth_provider, favorites, date_created';

    const users = await sql`
        SELECT ${sql(selectFields)}
        FROM users
        WHERE email = ${email}
    `;
    return users.length ? users[0] : null;
}

// --- 2. יצירת משתמש ---

/**
 * יוצר משתמש חדש לאחר הצפנת הסיסמה.
 * @param {Object} userData - נתוני המשתמש (כולל סיסמה).
 * @returns {Promise<Object>} אובייקט המשתמש שנוצר (בלי הסיסמה המוצפנת).
 */
async function create(userData) {    
    // שלב 2: הכנסת המשתמש למסד הנתונים
    const newUser = await sql`
        INSERT INTO users (name, email, password, role, auth_provider)
        VALUES (
            ${userData.name}, 
            ${userData.email}, 
            ${userData.password}, 
            ${userData.role || 'user'}, 
            ${userData.authProvider || 'local'}
        )
        RETURNING _id, name, email, role, auth_provider, date_created; 
    `;
    
    return newUser[0];
}

// --- 3. פעולות נוספות (עדכון) ---

/**
 * מעדכן שדות ספציפיים עבור משתמש.
 * @param {string} id - מזהה UUID של המשתמש.
 * @param {Object} updates - אובייקט המכיל את השדות לעדכון.
 * @returns {Promise<Object | null>} המשתמש המעודכן.
 */
async function update(id, updates) {
    // דוגמה פשוטה - צריך לבנות את שאילתת UPDATE באופן דינמי לקבלת קלט נקי יותר
    const updatedUser = await sql`
        UPDATE users
        SET name = COALESCE(${updates.name}, name),
            email = COALESCE(${updates.email}, email),
            role = COALESCE(${updates.role}, role)
        WHERE _id = ${id}
        RETURNING _id, name, email, role, date_created
    `;
    return updatedUser.length ? updatedUser[0] : null;
}
async function manageFavorites(userId, bookId, action) {
    let updatedUser;
  
    if (action === 'add') {
        updatedUser = await sql`
            UPDATE users
            SET favorites = array_append(favorites, ${bookId})
            WHERE _id = ${userId}
            RETURNING favorites
        `;
    } else if (action === 'remove') {
        updatedUser = await sql`
            UPDATE users
            SET favorites = array_remove(favorites, ${bookId})
            WHERE _id = ${userId}
            RETURNING favorites
        `;
    }

    return updatedUser.length ? updatedUser[0] : null;
}
async function getFavorites(userId) {
    const user = await sql`
        SELECT favorites
        FROM users
        WHERE _id = ${userId}
    `;
    return user.length ? user[0].favorites : [];
}   
async function deleteUser(id) {
    await sql`
        DELETE FROM users
        WHERE _id = ${id}
    `;
}
export default {
    findById,
    findByEmail,
    create,
    update,
    manageFavorites,
    getFavorites,
    deleteUser
};