// data.js — Spanish Learning v1.5
// Full lesson data baked in — no server needed for the core 5 songs.
// User-added songs (via Add Song screen) are stored in localStorage.

const LEVELS = [
    { id: 'beginner', label: 'מתחיל', color: 'gt-blue' },
    { id: 'intermediate', label: 'בינוני', color: 'gt-purple' },
    { id: 'expert', label: 'מתקדם', color: 'gt-orange' }
];

// ─────────────────────────────────────────────
//  SONG DEFINITIONS
// ─────────────────────────────────────────────
const SEED_SONGS = [
    {
        id: 'baila-conmigo',
        title: 'Baila Conmigo',
        artist: 'דוגמה מקורית · בצ׳אטה',
        genre: 'Bachata',
        level: 'beginner',
        locked: false,
        cover: '🎵',
        trackId: null,
        albumArt: null,
        spotify_url: null,
        progress_percentage: 0,
        is_mastered: false,
        lines: [
            { id: 1, es: 'Hola, ¿cómo estás?', he: 'שלום, מה שלומך?',
              words: [{ es: 'Hola', he: 'שלום', pron: 'אוֹלָה' }, { es: 'cómo', he: 'איך', pron: 'קוֹמוֹ' }, { es: 'estás', he: 'את/ה (מרגיש/ה)', pron: 'אֶסְטָאס' }] },
            { id: 2, es: 'Quiero bailar contigo', he: 'אני רוצה לרקוד איתך',
              words: [{ es: 'Quiero', he: 'אני רוצה', pron: 'קְיֶירוֹ' }, { es: 'bailar', he: 'לרקוד', pron: 'בַּיְילָאר' }, { es: 'contigo', he: 'איתך', pron: 'קוֹנְטִיגוֹ' }] },
            { id: 3, es: 'La música suena en mi corazón', he: 'המוזיקה מנגנת בליבי',
              words: [{ es: 'música', he: 'מוזיקה', pron: 'מוּסִיקָה' }, { es: 'suena', he: 'נשמעת / מנגנת', pron: 'סְוֶונָה' }, { es: 'corazón', he: 'לב', pron: 'קוֹרָסוֹן' }] },
            { id: 4, es: 'Baila conmigo esta noche', he: 'רקדי איתי הלילה',
              words: [{ es: 'Baila', he: 'רקוד/י (ציווי)', pron: 'בַּיְילָה' }, { es: 'conmigo', he: 'איתי', pron: 'קוֹנְמִיגוֹ' }, { es: 'noche', he: 'לילה', pron: 'נוֹצֶ׳ה' }] },
            { id: 5, es: 'Tu sonrisa ilumina todo', he: 'החיוך שלך מאיר הכל',
              words: [{ es: 'sonrisa', he: 'חיוך', pron: 'סוֹנְרִיסָה' }, { es: 'ilumina', he: 'מאיר', pron: 'אִילוּמִינָה' }, { es: 'todo', he: 'הכל', pron: 'טוֹדוֹ' }] }
        ]
    },
    // ── La Cita — Galy Galiano ──────────────────────────────────────────
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
        spotify_url: 'https://open.spotify.com/track/0XQzw53uo8V4GErre45Az1',
        progress_percentage: 0,
        is_mastered: false,
        lines: [
            { id: 1, es: 'Pasa y siéntate, tranquilízate', he: 'היכנסי ושבי, תרגעי',
              words: [{ es: 'Pasa', he: 'היכנס/י', pron: 'פָּאסָה' }, { es: 'siéntate', he: 'שב/י', pron: 'סְיֶנְטָאטֶה' }, { es: 'tranquilízate', he: 'תרגע/י', pron: 'טְרַנְקִילִיסָאטֶה' }] },
            { id: 2, es: 'Al fin ya estás aquí, qué más te da', he: 'סוף סוף הגעת לכאן, מה אכפת לך',
              words: [{ es: 'Al fin', he: 'סוף סוף', pron: 'אַל פִין' }, { es: 'estás aquí', he: 'אתה/את כאן', pron: 'אֶסְטָאס אָקִי' }, { es: 'qué más te da', he: 'מה אכפת לך', pron: 'קֶה מָאס טֶה דָה' }] },
            { id: 3, es: 'Imagínate que yo no soy yo', he: 'תדמיין/י שאני לא אני',
              words: [{ es: 'Imagínate', he: 'דמיין/י לעצמך', pron: 'אִימָאחִינָאטֶה' }, { es: 'no soy yo', he: 'אני לא אני', pron: 'נוֹ סוֹי יוֹ' }] },
            { id: 4, es: 'Un desconocido que te ha escrito un verso', he: 'זר שכתב לך שיר',
              words: [{ es: 'desconocido', he: 'זר / לא מוכר', pron: 'דֶסְקוֹנוֹסִידוֹ' }, { es: 'escrito', he: 'כתב (עבר)', pron: 'אֶסְקְרִיטוֹ' }, { es: 'verso', he: 'שיר / בית שיר', pron: 'בֶרְסוֹ' }] },
            { id: 5, es: 'Un amante improvisado, misterioso, apasionado', he: 'אוהב אלתוראי, מסתורי, נלהב',
              words: [{ es: 'amante', he: 'אוהב / מאהב', pron: 'אָמַנְטֶה' }, { es: 'misterioso', he: 'מסתורי', pron: 'מִיסְטֶרְיוֹסוֹ' }, { es: 'apasionado', he: 'נלהב / תשוקתי', pron: 'אָפָּסְיוֹנָאדוֹ' }] },
            { id: 6, es: 'Que te dio una cita en este hotel', he: 'שנתן לך פגישה במלון הזה',
              words: [{ es: 'cita', he: 'פגישה / דייט', pron: 'סִיטָה' }, { es: 'hotel', he: 'מלון', pron: 'אוֹטֶל' }] },
            { id: 7, es: 'Te juro que hoy es la última vez', he: 'אני נשבע/ת שהיום זו הפעם האחרונה',
              words: [{ es: 'juro', he: 'אני נשבע/ת', pron: 'חוּרוֹ' }, { es: 'última vez', he: 'הפעם האחרונה', pron: 'אוּלְטִימָה בֶּס' }] },
            { id: 8, es: 'Que te burlas de mí, que me engañas', he: 'שאתה/את לועגת לי, שאתה/את מרמה אותי',
              words: [{ es: 'burlas', he: 'לועג/ת', pron: 'בּוּרְלַאס' }, { es: 'engañas', he: 'מרמה', pron: 'אֶנְגַנְיַאס' }] },
            { id: 9, es: 'Y fueron mis manos las que te escribieron la carta', he: 'וידיי הן שכתבו לך את המכתב',
              words: [{ es: 'manos', he: 'ידיים', pron: 'מָאנוֹס' }, { es: 'carta', he: 'מכתב', pron: 'קָארְטָה' }] },
            { id: 10, es: 'Han sido mis celos los que te pusieron la trampa', he: 'הקנאה שלי היא שהטמינה לך את המלכודת',
              words: [{ es: 'celos', he: 'קנאה / קינאה', pron: 'סֶלוֹס' }, { es: 'trampa', he: 'מלכודת / פח', pron: 'טְרַאמְפָּה' }] },
            { id: 11, es: 'Es mi corazón el que llora de pena por dentro', he: 'זה ליבי שבוכה מכאב מבפנים',
              words: [{ es: 'llora', he: 'בוכה', pron: 'יוֹרָה' }, { es: 'pena', he: 'כאב / עצב', pron: 'פֶנָה' }, { es: 'por dentro', he: 'מבפנים', pron: 'פּוֹר דֶנְטְרוֹ' }] },
            { id: 12, es: 'Pero te dejo y me marcho para siempre', he: 'אבל אני עוזב/ת אותך והולך/ת לעולמים',
              words: [{ es: 'te dejo', he: 'אני עוזב/ת אותך', pron: 'טֶה דֶחוֹ' }, { es: 'me marcho', he: 'אני הולך/ת', pron: 'מֶה מַארְצ׳וֹ' }, { es: 'para siempre', he: 'לעולמים / לתמיד', pron: 'פָּארָה סְיֶמְפְּרֶה' }] }
        ]
    },
    // ── Te Va a Doler — Maelo Ruiz ─────────────────────────────────────
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
        spotify_url: 'https://open.spotify.com/track/2ozSogNm6z9G2Uv6a9iji4',
        progress_percentage: 0,
        is_mastered: false,
        lines: [
            { id: 1, es: 'Es una pena que tú seas así', he: 'חבל שאתה/את ככה',
              words: [{ es: 'pena', he: 'חבל / עצב', pron: 'פֶנָה' }, { es: 'seas así', he: 'תהיה/י ככה', pron: 'סֶאַס אָסִי' }] },
            { id: 2, es: 'Que no te guste ser llevada por la buena', he: 'שאתה/את לא אוהבת להיות עם מישהו טוב',
              words: [{ es: 'llevada', he: 'מובל/ת', pron: 'יֶבָאדָה' }, { es: 'la buena', he: 'הדרך הטובה', pron: 'לָה בְּוֶונָה' }] },
            { id: 3, es: 'No entiendo cómo tú pretendes ser feliz', he: 'אני לא מבין/ה איך אתה/את מתיימר/ת להיות מאושר/ת',
              words: [{ es: 'entiendo', he: 'אני מבין/ה', pron: 'אֶנְטְיֶנְדוֹ' }, { es: 'pretendes', he: 'מתיימר/ת', pron: 'פְּרֶטֶנְדֶס' }, { es: 'feliz', he: 'מאושר/ת', pron: 'פֶלִיס' }] },
            { id: 4, es: 'Sé que algún día te hará falta mi amor', he: 'אני יודע/ת שיום אחד תחסר לך האהבה שלי',
              words: [{ es: 'algún día', he: 'יום אחד', pron: 'אַלְגּוּן דִיאָה' }, { es: 'hará falta', he: 'יחסר', pron: 'אָרָה פָאלְטָה' }] },
            { id: 5, es: 'Te equivocaste al elegir entre él y yo', he: 'טעית בבחירה בינו לביני',
              words: [{ es: 'equivocaste', he: 'טעית', pron: 'אֶקִיבוֹקָסְטֶה' }, { es: 'elegir', he: 'לבחור', pron: 'אֶלֶחִיר' }, { es: 'entre', he: 'בין', pron: 'אֶנְטְרֶה' }] },
            { id: 6, es: 'Te va a doler', he: 'זה הולך לכאוב לך',
              words: [{ es: 'va a doler', he: 'הולך לכאוב', pron: 'בָּה אָה דוֹלֶר' }] },
            { id: 7, es: 'Tarde o temprano ya verás lo que te toca', he: 'מוקדם או מאוחר תראה/י מה מגיע לך',
              words: [{ es: 'tarde o temprano', he: 'מוקדם או מאוחר', pron: 'טַארְדֶה אוֹ טֶמְפְּרָאנוֹ' }, { es: 'verás', he: 'תראה/י (עתיד)', pron: 'בֶּרָאס' }] },
            { id: 8, es: 'Cuando tu piel ya no le excite y te abandone', he: 'כשעורך כבר לא יריגש אותו והוא יעזוב אותך',
              words: [{ es: 'piel', he: 'עור', pron: 'פְּיֶל' }, { es: 'excite', he: 'יריגש', pron: 'אֶקְסִיטֶה' }, { es: 'abandone', he: 'יעזוב', pron: 'אָבָנְדוֹנֶה' }] },
            { id: 9, es: 'Como me está doliendo ahora que me dejas', he: 'כמו שכואב לי עכשיו שאתה/את עוזב/ת אותי',
              words: [{ es: 'doliendo', he: 'כואב (כרגע)', pron: 'דוֹלִיֶנְדוֹ' }, { es: 'me dejas', he: 'אתה/את עוזב/ת אותי', pron: 'מֶה דֶחַאס' }] },
            { id: 10, es: 'Y te lo advierto de una vez, mejor ni vuelvas', he: 'ואני מזהיר/ה אותך פעם אחת — עדיף שלא תחזור/י',
              words: [{ es: 'advierto', he: 'אני מזהיר/ה', pron: 'אַדְבְּיֶרְטוֹ' }, { es: 'mejor', he: 'עדיף', pron: 'מֶחוֹר' }, { es: 'vuelvas', he: 'תחזור/י', pron: 'בּוּאֶלְבָאס' }] }
        ]
    },
    // ── Me Tengo Que Ir — Adolescent's Orquesta ────────────────────────
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
        spotify_url: 'https://open.spotify.com/track/3fccHyCREvjvDinu9TPZv9',
        progress_percentage: 0,
        is_mastered: false,
        lines: [
            { id: 1, es: 'Me enamoré de la persona ideal', he: 'התאהבתי באדם האידיאלי',
              words: [{ es: 'enamoré', he: 'התאהבתי', pron: 'אֶנָּמוֹרֶה' }, { es: 'persona ideal', he: 'האדם האידיאלי', pron: 'פֶּרְסוֹנָה אִידֵאָל' }] },
            { id: 2, es: 'Es el dolor que desgarró toda mi alma y corazón', he: 'זהו הכאב שקרע את כל נשמתי וליבי',
              words: [{ es: 'dolor', he: 'כאב', pron: 'דוֹלוֹר' }, { es: 'desgarró', he: 'קרע', pron: 'דֶסְגַרּוֹ' }, { es: 'alma', he: 'נשמה / רוח', pron: 'אַלְמָה' }] },
            { id: 3, es: 'Cuando agarrados de la mano en el parque nos besamos', he: 'כשאחוזים ידיים בפארק התנשקנו',
              words: [{ es: 'agarrados', he: 'אחוזים', pron: 'אָגַרָאדוֹס' }, { es: 'parque', he: 'פארק', pron: 'פָארְקֶה' }, { es: 'besamos', he: 'התנשקנו', pron: 'בֶּסָאמוֹס' }] },
            { id: 4, es: 'Unas lágrimas caían en los pétalos de rosa', he: 'דמעות נפלו על עלי הורד',
              words: [{ es: 'lágrimas', he: 'דמעות', pron: 'לָאגְרִימָאס' }, { es: 'caían', he: 'נפלו / ירדו', pron: 'קָאִיאָן' }, { es: 'pétalos', he: 'עלי כותרת', pron: 'פֶּטָאלוֹס' }] },
            { id: 5, es: 'Me tengo que ir', he: 'אני צריך/ה ללכת',
              words: [{ es: 'tengo que', he: 'אני צריך/ה', pron: 'טֶנְגוֹ קֶה' }, { es: 'ir', he: 'ללכת', pron: 'אִיר' }] },
            { id: 6, es: 'Contigo está mi corazón', he: 'איתך נמצא ליבי',
              words: [{ es: 'contigo', he: 'איתך', pron: 'קוֹנְטִיגוֹ' }, { es: 'está', he: 'נמצא/ת', pron: 'אֶסְטָא' }] },
            { id: 7, es: 'Tomó el amor de mis entrañas, de mi pecho y de mi alma', he: 'לקח את האהבה מקרבי, מחזי ומנשמתי',
              words: [{ es: 'entrañas', he: 'קרביים / פנים', pron: 'אֶנְטְרַנְיַאס' }, { es: 'pecho', he: 'חזה', pron: 'פֶּצ׳וֹ' }] },
            { id: 8, es: 'Algún día volveré a estar aquí', he: 'יום אחד אחזור להיות כאן',
              words: [{ es: 'volveré', he: 'אחזור (עתיד)', pron: 'בּוֹלְבֶּרֶה' }, { es: 'algún día', he: 'יום אחד', pron: 'אַלְגּוּן דִיאָה' }] },
            { id: 9, es: 'Así es la vida y tiene desilusión', he: 'ככה היא החיים ויש בהם אכזבה',
              words: [{ es: 'así es la vida', he: 'ככה החיים', pron: 'אָסִי אֶס לָה בִידָה' }, { es: 'desilusión', he: 'אכזבה / אכזבה', pron: 'דֶּסִילוּסְיוֹן' }] },
            { id: 10, es: 'Ya no estarás más en mi vida, triste el adiós', he: 'כבר לא תהיה/י בחיי, עצוב הפרידה',
              words: [{ es: 'ya no', he: 'כבר לא', pron: 'יָה נוֹ' }, { es: 'adiós', he: 'להתראות / פרידה', pron: 'אַדְיוֹס' }] }
        ]
    },
    // ── Persona Ideal — Adolescent's Orquesta ──────────────────────────
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
        spotify_url: 'https://open.spotify.com/track/5H1mAzh396id1TPT0JaItz',
        progress_percentage: 0,
        is_mastered: false,
        lines: [
            { id: 1, es: '¡Ay! Es el dolor que desgarró toda mi alma y corazón', he: 'אוי! זהו הכאב שקרע את כל נשמתי וליבי',
              words: [{ es: 'dolor', he: 'כאב', pron: 'דוֹלוֹר' }, { es: 'desgarró', he: 'קרע', pron: 'דֶסְגַרּוֹ' }, { es: 'alma', he: 'נשמה', pron: 'אַלְמָה' }] },
            { id: 2, es: 'Para vivir de los recuerdos de ese amor', he: 'לחיות מהזיכרונות של אותה אהבה',
              words: [{ es: 'recuerdos', he: 'זיכרונות', pron: 'רֶקוּאֶרְדוֹס' }, { es: 'vivir', he: 'לחיות', pron: 'בִּיבִיר' }] },
            { id: 3, es: 'Cuando agarrados de la mano en el parque nos besamos', he: 'כשאחוזים ידיים בפארק התנשקנו',
              words: [{ es: 'mano', he: 'יד', pron: 'מָאנוֹ' }, { es: 'besamos', he: 'התנשקנו', pron: 'בֶּסָאמוֹס' }] },
            { id: 4, es: 'Me tengo que ir, y no es por mí, contigo está mi corazón', he: 'אני צריך/ה ללכת, וזה לא בגללי, איתך נמצא ליבי',
              words: [{ es: 'tengo que ir', he: 'אני צריך/ה ללכת', pron: 'טֶנְגוֹ קֶה אִיר' }, { es: 'no es por mí', he: 'זה לא בגללי', pron: 'נוֹ אֶס פּוֹר מִי' }] },
            { id: 5, es: 'Todo el amor de mis entrañas, de mi pecho y de mi alma', he: 'כל האהבה מעמקי, מחזי ומנשמתי',
              words: [{ es: 'todo el amor', he: 'כל האהבה', pron: 'טוֹדוֹ אֶל אָמוֹר' }, { es: 'entrañas', he: 'קרביים / עמקי הלב', pron: 'אֶנְטְרַנְיַאס' }] },
            { id: 6, es: 'Algún día volveré a estar aquí', he: 'יום אחד אחזור להיות כאן',
              words: [{ es: 'volveré', he: 'אחזור', pron: 'בּוֹלְבֶּרֶה' }, { es: 'aquí', he: 'כאן', pron: 'אָקִי' }] },
            { id: 7, es: 'Así es la vida y tiene desilusión', he: 'ככה החיים ויש בהם אכזבה',
              words: [{ es: 'vida', he: 'חיים / חיים', pron: 'בִידָה' }, { es: 'desilusión', he: 'אכזבה', pron: 'דֶּסִילוּסְיוֹן' }] },
            { id: 8, es: 'Se tiene amor y hay esperanza cuando se quiere con el alma', he: 'יש אהבה ויש תקווה כשאוהבים עם כל הנשמה',
              words: [{ es: 'esperanza', he: 'תקווה', pron: 'אֶסְפֶּרָנְסָה' }, { es: 'quiere', he: 'אוהב/ת', pron: 'קְיֶרֶה' }] },
            { id: 9, es: '¿Por qué tienen que separar el amor de mis entrañas?', he: 'למה צריך להפריד את אהבתי?',
              words: [{ es: 'separar', he: 'להפריד', pron: 'סֶפָּארָאר' }, { es: 'por qué', he: 'למה', pron: 'פּוֹר קֶה' }] },
            { id: 10, es: 'Y te amaré toda la vida', he: 'ואוהב/ת אותך כל חיי',
              words: [{ es: 'amaré', he: 'אוהב/ת (עתיד)', pron: 'אָמָארֶה' }, { es: 'toda la vida', he: 'כל החיים', pron: 'טוֹדָה לָה בִידָה' }] }
        ]
    },
    // ── Amores Como el Nuestro — Jerry Rivera ──────────────────────────
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
        spotify_url: 'https://open.spotify.com/track/3dUOVExxPh0nmE6DtYVWIE',
        progress_percentage: 0,
        is_mastered: false,
        lines: [
            { id: 1, es: 'Amores como el nuestro quedan ya muy pocos', he: 'אהבות כמו שלנו כבר נשארו מעט מאוד',
              words: [{ es: 'amores', he: 'אהבות', pron: 'אָמוֹרֶס' }, { es: 'quedan', he: 'נשארים', pron: 'קֶדָאן' }, { es: 'muy pocos', he: 'מעט מאוד', pron: 'מוּי פּוֹקוֹס' }] },
            { id: 2, es: 'Del cielo caen estrellas sin oír deseos', he: 'מהשמיים נופלות כוכבים בלי לשמוע משאלות',
              words: [{ es: 'cielo', he: 'שמיים', pron: 'סְיֶלוֹ' }, { es: 'estrellas', he: 'כוכבים', pron: 'אֶסְטְרֶיַאס' }, { es: 'deseos', he: 'משאלות / רצונות', pron: 'דֶסֶאוֹס' }] },
            { id: 3, es: 'A nadie le interesan ya los sentimientos', he: 'כבר לאף אחד לא אכפת מהרגשות',
              words: [{ es: 'nadie', he: 'אף אחד', pron: 'נָאדְיֶה' }, { es: 'sentimientos', he: 'רגשות', pron: 'סֶנְטִימְיֶנְטוֹס' }] },
            { id: 4, es: 'Como los unicornios van desapareciendo', he: 'כמו חד-קרן שנעלמים לאט',
              words: [{ es: 'unicornios', he: 'חדי קרן', pron: 'אוּנִיקוֹרְנְיוֹס' }, { es: 'desapareciendo', he: 'נעלמים', pron: 'דֶסָּאפָּארֶסְיֶנְדוֹ' }] },
            { id: 5, es: 'Un amor como el nuestro no debe morir jamás', he: 'אהבה כמו שלנו לעולם לא צריכה למות',
              words: [{ es: 'debe', he: 'צריך', pron: 'דֶּבֶה' }, { es: 'morir', he: 'למות', pron: 'מוֹרִיר' }, { es: 'jamás', he: 'לעולם לא', pron: 'חָאמָאס' }] },
            { id: 6, es: 'En los muros casi nadie pinta corazones', he: 'על הקירות כמעט אף אחד לא מצייר לבבות',
              words: [{ es: 'muros', he: 'קירות', pron: 'מוּרוֹס' }, { es: 'pinta', he: 'מצייר', pron: 'פִּינְטָה' }, { es: 'corazones', he: 'לבבות', pron: 'קוֹרָסוֹנֶס' }] },
            { id: 7, es: 'Ya nadie se promete más allá del tiempo', he: 'כבר אף אחד לא מבטיח מעבר לזמן',
              words: [{ es: 'promete', he: 'מבטיח/ה', pron: 'פְּרוֹמֶטֶה' }, { es: 'más allá', he: 'מעבר ל / מעבר', pron: 'מָאס אַיָה' }] },
            { id: 8, es: 'Como Romeo y Julieta, lo nuestro es algo eterno', he: 'כמו רומיאו ויוליה, שלנו הוא נצחי',
              words: [{ es: 'eterno', he: 'נצחי', pron: 'אֶטֶרְנוֹ' }, { es: 'lo nuestro', he: 'שלנו (הדבר שלנו)', pron: 'לוֹ נוּאֶסְטְרוֹ' }] },
            { id: 9, es: 'Este amor que nos brindamos merece la eternidad', he: 'האהבה הזו שאנחנו נותנים זה לזה ראויה לנצח',
              words: [{ es: 'brindamos', he: 'אנחנו מעניקים', pron: 'בְּרִינְדָאמוֹס' }, { es: 'merece', he: 'ראויה/ראוי', pron: 'מֶרֶסֶה' }, { es: 'eternidad', he: 'נצח / נצחיות', pron: 'אֶטֶרְנִידָד' }] },
            { id: 10, es: 'Amor es dar por completo todo lo que siente el alma', he: 'אהבה היא לתת לגמרי כל מה שהנשמה מרגישה',
              words: [{ es: 'dar', he: 'לתת', pron: 'דָּאר' }, { es: 'por completo', he: 'לגמרי', pron: 'פּוֹר קוֹמְפְּלֶטוֹ' }, { es: 'siente', he: 'מרגיש/ה', pron: 'סְיֶנְטֶה' }] }
        ]
    }
];

// ─────────────────────────────────────────────
//  RUNTIME SONG ARRAY (mutable — merged at init)
// ─────────────────────────────────────────────
let SONGS = [...SEED_SONGS];

// ---- Song Accessors ----
function getSongById(id) {
    return SONGS.find(s => s.id === id);
}

function getSongsFromLocalStorage() {
    try {
        return JSON.parse(localStorage.getItem('sl_user_songs') || '[]');
    } catch {
        return [];
    }
}

function saveSongToLocalStorage(song) {
    const existing = getSongsFromLocalStorage();
    const idx = existing.findIndex(s => s.id === song.id);
    if (idx >= 0) {
        existing[idx] = song;
    } else {
        existing.push(song);
    }
    localStorage.setItem('sl_user_songs', JSON.stringify(existing));
}

function getSongProgressFromStorage(songId) {
    try {
        const progs = JSON.parse(localStorage.getItem('sl_song_progress') || '{}');
        return progs[songId] || { progress_percentage: 0, is_mastered: false };
    } catch {
        return { progress_percentage: 0, is_mastered: false };
    }
}

function saveSongProgressToStorage(songId, progress_percentage, is_mastered) {
    try {
        const progs = JSON.parse(localStorage.getItem('sl_song_progress') || '{}');
        progs[songId] = { progress_percentage, is_mastered };
        localStorage.setItem('sl_song_progress', JSON.stringify(progs));
    } catch {}
}

// ---- Dynamic Song Loading ----
async function initSongs() {
    // Restore saved progress onto seed songs
    for (const song of SONGS) {
        const prog = getSongProgressFromStorage(song.id);
        song.progress_percentage = prog.progress_percentage;
        song.is_mastered = prog.is_mastered;
    }

    // Merge in user-added songs from localStorage
    const userSongs = getSongsFromLocalStorage();
    for (const song of userSongs) {
        if (!SONGS.find(s => s.id === song.id)) {
            const prog = getSongProgressFromStorage(song.id);
            SONGS.push({ ...song, progress_percentage: prog.progress_percentage, is_mastered: prog.is_mastered });
        }
    }
}
