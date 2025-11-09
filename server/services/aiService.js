// src/services/aiService.js

import { GoogleGenAI } from '@google/genai';
import 'dotenv/config'; // שיטה מודרנית לטעינת .env (אם לא השתמשת ב-import dotenv)

const apiKey = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash"; // מודל מומלץ למהירות ויעילות

if (!apiKey) {
    // זורק שגיאה אם המפתח חסר, עוצר את השרת מראש
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

// יצירת מופע של ה-AI Client
const ai = new GoogleGenAI({ apiKey });

// --- 1. AI Book Summary (סיכום ספר) ---

/**
 * יוצר סיכום קצר לספר באמצעות Gemini.
 * @param {string} title - שם הספר.
 * @param {string} author - שם המחבר.
 * @param {string} description - תיאור קצר מהמשתמש.
 * @returns {Promise<string>} הסיכום שנוצר על ידי AI.
 */
export async function generateBookSummary(title, author, description) {
    const prompt = `
        צור סיכום תמציתי ומזמין (2-3 משפטים) לספר בשם: 
        "${title}" מאת: "${author}". 
        השתמש בתיאור הספר הבא כרפרנס: "${description}".
        ודא שהסיכום הוא בעברית רהוטה.
    `;

    try {
        // ✅ הקריאה המתוקנת לפי הדוקומנטציה
        const response = await ai.models.generateContent({
             model: MODEL_NAME,
             contents: prompt,
             config: { 
                 temperature: 0.7 // רמת יצירתיות
             }
        });
        
        return response.text.trim();
        
    } catch (error) {
        console.error("Gemini Summary Error:", error);
        return "אין סיכום AI זמין כרגע."; // ערך ברירת מחדל במקרה של תקלה
    }
}

// --- 2. AI Recommendations (המלצות) ---

/**
 * מספק המלצות לספרים על בסיס רשימת ספרים מועדפים.
 * @param {Array<Object>} favoriteBooks - רשימת הספרים המועדפים של המשתמש (עם שדות title).
 * @param {Array<Object>} candidateBooks - רשימת הספרים הזמינים במערכת (עם שדות id, title, author).
 * @returns {Promise<Array<Object>>} רשימת המלצות (עד 5) בפורמט JSON.
 */
// export async function getBookRecommendations(favoriteBooks) {
//     // יצירת רשימה מופרדת בפסיקים של כותרי הספרים
//     const bookTitles = favoriteBooks.map(book => book.title).join(', ');
    
//     // הנחיה ל-Gemini לעבוד בפורמט JSON
//     const prompt = `
//         המשתמש אוהב את הספרים הבאים: ${bookTitles}. 
//         הצע לו 5 המלצות לספרים דומים (שם ספר ומחבר) המתאימים לסגנון, ז'אנר ונושא הספרים שהוא אוהב. 
//         ספק את התוצאה בפורמט JSON בלבד.
//     `;

//     try {
//         // ✅ הקריאה המתוקנת ל-Gemini JSON Mode
//         const response = await ai.models.generateContent({
//              model: MODEL_NAME,
//              contents: prompt,
//              config: {
//                  responseMimeType: "application/json", 
//                  responseSchema: { // הגדרת מבנה ה-JSON הצפוי
//                      type: "object",
//                      properties: {
//                          recommendations: {
//                              type: "array",
//                              items: {
//                                  type: "object",
//                                  properties: {
//                                      title: { type: "string" },
//                                      author: { type: "string" }
//                                  },
//                                  required: ["title", "author"]
//                              }
//                          }
//                      },
//                      required: ["recommendations"]
//                  }
//              }
//         });

//         // ניתוח פלט ה-JSON
//         const jsonText = response.text.trim();
//         const result = JSON.parse(jsonText);
//         return result.recommendations;

//     } catch (error) {
//         console.error("Gemini Recommendation Error:", error);
//         return [];
//     }
// }
export async function getBookRecommendations(favoriteBooks, candidateBooks) {
  const prompt = `
  המשתמש אהב את הספרים הבאים:
  ${JSON.stringify(favoriteBooks, null, 2)}

  הנה ספרים זמינים במערכת:
  ${JSON.stringify(candidateBooks, null, 2)}

  בחר עד 5 ספרים רק מתוך רשימת המועמדים.
  החזר בפורמט JSON:
  {
    "recommendations": [ { "id": "string", "reason": "string" } ]
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text.trim());
    return result.recommendations;

  } catch (error) {
    console.error("Gemini Recommendation Error:", error);
    return [];
  }
}
