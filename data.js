// Demo content only. Original example sentences written for this prototype —
// NOT lyrics from an existing copyrighted song. Real lyric integration is
// planned via a licensed provider (see SPEC.md, section 5).

const LEVELS = [
    { id: 'beginner', label: 'מתחיל', color: 'gt-blue' },
    { id: 'intermediate', label: 'בינוני', color: 'gt-purple' },
    { id: 'expert', label: 'מתקדם', color: 'gt-orange' }
];

const SONGS = [
    {
        id: 'baila-conmigo',
        title: 'Baila Conmigo',
        artist: 'דוגמה מקורית · בצ׳אטה',
        genre: 'Bachata',
        level: 'beginner',
        locked: false,
        cover: '🎵',
        lines: [
            {
                id: 1,
                es: 'Hola, ¿cómo estás?',
                he: 'שלום, מה שלומך?',
                words: [
                    { es: 'Hola', he: 'שלום', pron: 'אוֹלָה' },
                    { es: 'cómo', he: 'איך', pron: 'קוֹמוֹ' },
                    { es: 'estás', he: 'את/ה (מרגיש/ה)', pron: 'אֶסְטָאס' }
                ]
            },
            {
                id: 2,
                es: 'Quiero bailar contigo',
                he: 'אני רוצה לרקוד איתך',
                words: [
                    { es: 'Quiero', he: 'אני רוצה', pron: 'קְיֶירוֹ' },
                    { es: 'bailar', he: 'לרקוד', pron: 'בַּיְילָאר' },
                    { es: 'contigo', he: 'איתך', pron: 'קוֹנְטִיגוֹ' }
                ]
            },
            {
                id: 3,
                es: 'La música suena en mi corazón',
                he: 'המוזיקה מנגנת בליבי',
                words: [
                    { es: 'música', he: 'מוזיקה', pron: 'מוּסִיקָה' },
                    { es: 'suena', he: 'מנגנת / נשמעת', pron: 'סְוֶונָה' },
                    { es: 'corazón', he: 'לב', pron: 'קוֹרָסוֹן' }
                ]
            },
            {
                id: 4,
                es: 'Baila conmigo esta noche',
                he: 'רקדי איתי הלילה',
                words: [
                    { es: 'Baila', he: 'רקוד/י (ציווי)', pron: 'בַּיְילָה' },
                    { es: 'conmigo', he: 'איתי', pron: 'קוֹנְמִיגוֹ' },
                    { es: 'noche', he: 'לילה', pron: 'נוֹצֶ׳ה' }
                ]
            },
            {
                id: 5,
                es: 'Tu sonrisa ilumina todo',
                he: 'החיוך שלך מאיר הכל',
                words: [
                    { es: 'sonrisa', he: 'חיוך', pron: 'סוֹנְרִיסָה' },
                    { es: 'ilumina', he: 'מאיר', pron: 'אִילוּמִינָה' },
                    { es: 'todo', he: 'הכל', pron: 'טוֹדוֹ' }
                ]
            }
        ]
    },
    {
        id: 'salsa-del-barrio',
        title: 'Salsa del Barrio',
        artist: 'בקרוב · סלסה',
        genre: 'Salsa',
        level: 'intermediate',
        locked: true,
        cover: '🎺',
        lines: []
    },
    {
        id: 'noches-de-ron',
        title: 'Noches de Ron',
        artist: 'בקרוב · בצ׳אטה',
        genre: 'Bachata',
        level: 'expert',
        locked: true,
        cover: '🥃',
        lines: []
    }
];

function getSongById(id) {
    return SONGS.find(s => s.id === id);
}
