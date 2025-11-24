// GoogleTranslate.tsx

import React from 'react';

/**
 * קומפוננטה המכילה את ה-DIV הנדרש לאתחול ווידג'ט התרגום של גוגל.
 * אין צורך ב-useEffect או בטעינת סקריפטים כאן, מכיוון שהם מוגדרים ב-index.html.
 */
const GoogleTranslate: React.FC = () => {
  return (
    // יש לוודא שה-ID הזה תואם ל-ID שהוגדר בפונקציית googleTranslateElementInit ב-index.html
    <div 
      id="google_translate_element" 
      className="google-translate-container" // ניתן להוסיף קלאס לצורך עיצוב
    >
      {/* ווידג'ט התרגום יוזרק אוטומטית לתוך ה-DIV הזה */}
    </div>
  );
};

export default GoogleTranslate;