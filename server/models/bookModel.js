import sql from '../db/connection.js'; // נתיב יחסי נכון לקובץ החיבור שלך

/**
 * מוסיף ספר חדש למסד הנתונים.
 * @param {Object} bookData - נתוני הספר.
 * @returns {Promise<Object>} הספר שנוצר.
 */
async function create(bookData) {
    const newBook = await sql`
        INSERT INTO books (title, author, description, category, img_url, price, ai_summary, user_id)
        VALUES (
            ${bookData.title}, 
            ${bookData.author}, 
            ${bookData.description}, 
            ${bookData.category}, 
            ${bookData.imgUrl}, 
            ${bookData.price}, 
            ${bookData?.aiSummary}, 
            ${bookData.userId} -- user_id הוא ה-UUID של המשתמש המעלה
        )
        RETURNING *; -- מחזיר את כל שדות הספר שנוצר
    `;
    return newBook[0];
}

// --- 2. מציאת ספרים ---

/**
 * מוצא את כל הספרים.
 * @returns {Promise<Array<Object>>} רשימת הספרים.
 */
async function findAll() {
    return sql`
        SELECT *
        FROM books
        ORDER BY date_created DESC
    `;
}

/**
 * מוצא ספר לפי מזהה.
 * @param {string} id - מזהה UUID של הספר.
 * @returns {Promise<Object | null>} אובייקט הספר.
 */
async function findById(id) {
    const books = await sql`
        SELECT *
        FROM books
        WHERE _id = ${id}
    `;
    return books.length ? books[0] : null;
}

// --- 3. עדכון ומחיקה ---

/**
 * מעדכן פרטי ספר קיים.
 * @param {string} id - מזהה UUID של הספר.
 * @param {Object} updates - השדות לעדכון.
 * @returns {Promise<Object | null>} הספר המעודכן.
 */
async function update(id, updates) {
    // זו דוגמה לשאילתה דינמית יותר ב-postgres:
    const updatedBook = await sql`
        UPDATE books
        SET ${sql(updates, 'title', 'author', 'description', 'category', 'img_url', 'price', 'ai_summary')}
        WHERE _id = ${id}
        RETURNING *;
    `;
    return updatedBook.length ? updatedBook[0] : null;
}

/**
 * מוחק ספר לפי מזהה.
 * @param {string} id - מזהה UUID של הספר.
 * @returns {Promise<boolean>} האם המחיקה הצליחה.
 */
async function remove(id) {
    const result = await sql`
        DELETE FROM books
        WHERE _id = ${id}
        RETURNING _id;
    `;
    return result.length > 0;
}


export default {
    create,
    findAll,
    findById,
    update,
    remove,
};