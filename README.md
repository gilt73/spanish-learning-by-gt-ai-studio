# Spanish Learning — by G.T AI Studio

אפליקציית מובייל (Web app, RTL עברית) ללימוד ספרדית לדוברי עברית, דרך שירי סלסה ובצ'אטה — מילה-מילה, משפט-משפט, הגייה ומשמעות. שלוש רמות: מתחיל, בינוני, מתקדם.

📄 מסמך איפיון מלא (מסכים, מודל נתונים, roadmap): [SPEC.md](./SPEC.md)

## הרצה מקומית

יש שני מצבים:

**בלי חיפוש שירים** (רק הדבקת קישור, עדיין עם שם/עטיפה/נגן אמיתיים דרך oEmbed):
```bash
python -m http.server 8000
```
גלשו ל-`http://localhost:8000`.

**עם חיפוש שירים אמיתי** (דורש מפתחות Spotify):
```bash
npm install
cp .env.example .env   # ואז מלאו SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET מ-developer.spotify.com/dashboard
npm start
```
גלשו ל-`http://localhost:4001` (או לפי `PORT` ב-`.env`).

⚠️ **לעולם אל תעלו את קובץ `.env`** לריפו — הוא ב-`.gitignore` מסיבה טובה (הריפו הזה ציבורי).

## מצב נוכחי — V1.2.0

- ✅ ניווט מלא בין כל המסכים (בית, ספריית שירים, שיעור מילה-מילה, תרגול, התקדמות, הגדרות)
- ✅ שיר דוגמה מלא ("Baila Conmigo") עם 5 שורות, פירוק מילים, הגייה בעברית, השמעה קולית (Web Speech API)
- ✅ בחירת רמה (מתחיל/בינוני/מתקדם), מעקב XP/streak, שמירה מקומית (localStorage)
- ✅ **ייבוא שיר אמיתי** מקישור ספוטיפיי — שם שיר, עטיפת אלבום ונגן אמיתיים דרך Spotify oEmbed הציבורי (ללא הרשמה)
- ✅ **חיפוש שירים אמיתי** לפי שם/אמן — דרך שרת proxy קטן (`server.js`) עם Spotify Web API (Client Credentials flow)
- ⚠️ פירוק מילה-מילה עדיין זמין רק לשירים שערוכים ידנית במאגר, לא לכל שיר שמיובא/נמצא בחיפוש (ר' SPEC.md סעיף 5)
- ⚠️ תרגול הגייה עם מיקרופון עדיין לא ממומש (מתוכנן ל-V1.4)

## סטאק

Frontend: HTML + Tailwind (CDN) + JS וניל. פונט Heebo. עיצוב תואם למותג G.T AI Studio (glassmorphism כהה, גרדיאנטים כחול/סגול/כתום).
Backend (אופציונלי, רק לחיפוש): Node.js + Express (`server.js`), proxy קטן ל-Spotify Web API.

---
by G.T AI Studio
