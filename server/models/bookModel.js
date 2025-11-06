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
            ${bookData.aiSummary}, 
            ${bookData.user_id} -- user_id הוא ה-UUID של המשתמש המעלה
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

async function update(id, updates) {
    // 1. Define the keys that are allowed to be updated.
    const validKeys = [
        'title', 'author', 'description', 'category', 'img_url', 
        'price', 'ai_summary'
    ];
    
    // 2. Filter: Create a new object containing only valid keys 
    //    that exist and are not undefined in the 'updates' object.
    const filteredUpdates = Object.keys(updates).reduce((acc, key) => {
        // Check if the key is valid AND the value is not undefined.
        if (validKeys.includes(key) && updates[key] !== undefined) {
            acc[key] = updates[key];
        }
        return acc;
    }, {});

    // 3. Exit if there's nothing valid to update.
    if (Object.keys(filteredUpdates).length === 0) {
        return null; 
    }
    
    // 4. Construct a secure, dynamic SQL UPDATE query.
    const updatedBook = await sql`
        UPDATE books
        SET ${sql(filteredUpdates)}
        WHERE _id = ${id}
        RETURNING *;
    `;
    
    // Return the updated record or null if the book was not found
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