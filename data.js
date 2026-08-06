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
    // The 5 songs below are real, currently-released tracks. Only their TITLES
    // are broken into vocabulary here — titles are short factual labels, not the
    // copyrighted lyric body, so this stays legally safe. Full line-by-line lyrics
    // require a licensed lyrics provider (see SPEC.md section 5) and are NOT
    // included. trackId/albumArt come from a live Spotify search (real metadata,
    // not creative expression, so no copyright issue there either).
    {
        id: 'la-cita',
        title: 'La Cita',
        artist: 'Galy Galiano',
        genre: 'Salsa',
        level: 'beginner',
        locked: false,
        cover: '🎺',
        trackId: '0XQzw53uo8V4GErre45Az1',
        albumArt: 'https://i.scdn.co/image/ab67616d00001e0216e5246b005aaeae2a3b4f70',
        titleOnly: true,
        lines: [
            {
                id: 1,
                es: 'La Cita',
                he: 'הפגישה / הדייט',
                words: [
                    { es: 'La', he: 'ה־ (ז\' נקבה)', pron: 'לָה' },
                    { es: 'Cita', he: 'פגישה / דייט', pron: 'סִיטָה' }
                ]
            }
        ]
    },
    {
        id: 'te-va-a-doler',
        title: 'Te Va a Doler',
        artist: 'Maelo Ruiz',
        genre: 'Salsa',
        level: 'beginner',
        locked: false,
        cover: '🎺',
        trackId: '2ozSogNm6z9G2Uv6a9iji4',
        albumArt: 'https://i.scdn.co/image/ab67616d00001e026bccd61ccb76645a10625854',
        titleOnly: true,
        lines: [
            {
                id: 1,
                es: 'Te Va a Doler',
                he: 'זה הולך לכאוב לך',
                words: [
                    { es: 'Te', he: 'לך / אותך', pron: 'טֶה' },
                    { es: 'Va a', he: 'הולך ל־ (עתיד קרוב)', pron: 'בָּה אָה' },
                    { es: 'Doler', he: 'לכאוב', pron: 'דּוֹלֶר' }
                ]
            }
        ]
    },
    {
        id: 'me-tengo-que-ir',
        title: 'Me Tengo Que Ir',
        artist: "Adolescent's Orquesta",
        genre: 'Salsa',
        level: 'intermediate',
        locked: false,
        cover: '🎺',
        trackId: '3fccHyCREvjvDinu9TPZv9',
        albumArt: 'https://i.scdn.co/image/ab67616d00001e028a7fa93d6c42e82149866c76',
        titleOnly: true,
        lines: [
            {
                id: 1,
                es: 'Me Tengo Que Ir',
                he: 'אני צריך/ה ללכת',
                words: [
                    { es: 'Me', he: 'אני / לי', pron: 'מֶה' },
                    { es: 'Tengo', he: 'יש לי', pron: 'טֶנְגוֹ' },
                    { es: 'Que', he: 'ש־', pron: 'קֶה' },
                    { es: 'Ir', he: 'ללכת', pron: 'אִיר' }
                ]
            }
        ]
    },
    {
        id: 'persona-ideal',
        title: 'Persona Ideal',
        artist: "Adolescent's Orquesta",
        genre: 'Salsa',
        level: 'intermediate',
        locked: false,
        cover: '🎺',
        trackId: '5H1mAzh396id1TPT0JaItz',
        albumArt: 'https://i.scdn.co/image/ab67616d00001e023463634e7bde025aa312cb8e',
        titleOnly: true,
        lines: [
            {
                id: 1,
                es: 'Persona Ideal',
                he: 'האדם האידיאלי',
                words: [
                    { es: 'Persona', he: 'אדם / בן אדם', pron: 'פֶּרְסוֹנָה' },
                    { es: 'Ideal', he: 'אידיאלי', pron: 'אִידֵאָל' }
                ]
            }
        ]
    },
    {
        id: 'amores-como-el-nuestro',
        title: 'Amores Como el Nuestro',
        artist: 'Jerry Rivera',
        genre: 'Salsa',
        level: 'expert',
        locked: false,
        cover: '🎺',
        trackId: '3dUOVExxPh0nmE6DtYVWIE',
        albumArt: 'https://i.scdn.co/image/ab67616d00001e0210a9f305f4826ba8ce8bfaa0',
        titleOnly: true,
        lines: [
            {
                id: 1,
                es: 'Amores Como el Nuestro',
                he: 'אהבות כמו שלנו',
                words: [
                    { es: 'Amores', he: 'אהבות', pron: 'אָמוֹרֶס' },
                    { es: 'Como', he: 'כמו', pron: 'קוֹמוֹ' },
                    { es: 'el', he: 'ה־ (ז\')', pron: 'אֶל' },
                    { es: 'Nuestro', he: 'שלנו', pron: 'נוּאֶסְטְרוֹ' }
                ]
            }
        ]
    }
];

function getSongById(id) {
    return SONGS.find(s => s.id === id);
}
