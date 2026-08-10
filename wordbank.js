// Core vocabulary, independent of any song. Plain word/translation pairs —
// factual language data, not copyrighted creative expression.

const WORD_CATEGORIES = [
    {
        id: 'greetings',
        title: 'ברכות והיכרות',
        icon: 'fa-hand',
        level: 'beginner',
        words: [
            { es: 'Hola', he: 'שלום', pron: 'אוֹלָה' },
            { es: 'Adiós', he: 'להתראות', pron: 'אָדְיוֹס' },
            { es: 'Buenos días', he: 'בוקר טוב', pron: 'בּוּאֶנוֹס דִיאָס' },
            { es: 'Buenas noches', he: 'לילה טוב', pron: 'בּוּאֶנָאס נוֹצֶ׳ס' },
            { es: 'Por favor', he: 'בבקשה', pron: 'פּוֹר פָאבוֹר' },
            { es: 'Gracias', he: 'תודה', pron: 'גְרַאסְיָאס' },
            { es: 'De nada', he: 'על לא דבר', pron: 'דֶה נָאדָה' },
            { es: 'Sí', he: 'כן', pron: 'סִי' },
            { es: 'No', he: 'לא', pron: 'נוֹ' },
            { es: '¿Cómo te llamas?', he: 'איך קוראים לך?', pron: 'קוֹמוֹ טֶה יָאמָס' }
        ]
    },
    {
        id: 'numbers',
        title: 'מספרים 1–10',
        icon: 'fa-hashtag',
        level: 'beginner',
        words: [
            { es: 'uno', he: 'אחת', pron: 'אוּנוֹ' },
            { es: 'dos', he: 'שתיים', pron: 'דוֹס' },
            { es: 'tres', he: 'שלוש', pron: 'טְרֶס' },
            { es: 'cuatro', he: 'ארבע', pron: 'קוּאָטְרוֹ' },
            { es: 'cinco', he: 'חמש', pron: 'סִינְקוֹ' },
            { es: 'seis', he: 'שש', pron: 'סֶייס' },
            { es: 'siete', he: 'שבע', pron: 'סְייֶטֶה' },
            { es: 'ocho', he: 'שמונה', pron: 'אוֹצְ׳וֹ' },
            { es: 'nueve', he: 'תשע', pron: 'נוּאֶבֶה' },
            { es: 'diez', he: 'עשר', pron: 'דְייֶס' }
        ]
    },
    {
        id: 'colors',
        title: 'צבעים',
        icon: 'fa-palette',
        level: 'beginner',
        words: [
            { es: 'rojo', he: 'אדום', pron: 'רוֹחוֹ' },
            { es: 'azul', he: 'כחול', pron: 'אָסוּל' },
            { es: 'verde', he: 'ירוק', pron: 'בֶּרְדֶה' },
            { es: 'amarillo', he: 'צהוב', pron: 'אָמָרִיוֹ' },
            { es: 'negro', he: 'שחור', pron: 'נֶגְרוֹ' },
            { es: 'blanco', he: 'לבן', pron: 'בְּלָנְקוֹ' },
            { es: 'naranja', he: 'כתום', pron: 'נָרָנְחָה' },
            { es: 'rosa', he: 'ורוד', pron: 'רוֹסָה' }
        ]
    },
    {
        id: 'family',
        title: 'משפחה',
        icon: 'fa-people-roof',
        level: 'beginner',
        words: [
            { es: 'madre', he: 'אמא', pron: 'מָאדְרֶה' },
            { es: 'padre', he: 'אבא', pron: 'פָּאדְרֶה' },
            { es: 'hermano', he: 'אח', pron: 'אֶרְמָאנוֹ' },
            { es: 'hermana', he: 'אחות', pron: 'אֶרְמָאנָה' },
            { es: 'abuelo', he: 'סבא', pron: 'אָבּוּאֶלוֹ' },
            { es: 'abuela', he: 'סבתא', pron: 'אָבּוּאֶלָה' },
            { es: 'hijo', he: 'בן', pron: 'אִיחוֹ' },
            { es: 'hija', he: 'בת', pron: 'אִיחָה' }
        ]
    },
    {
        id: 'days',
        title: 'ימים בשבוע',
        icon: 'fa-calendar-days',
        level: 'beginner',
        words: [
            { es: 'lunes', he: 'יום שני', pron: 'לוּנֶס' },
            { es: 'martes', he: 'יום שלישי', pron: 'מָארְטֶס' },
            { es: 'miércoles', he: 'יום רביעי', pron: 'מְיֶירְקוֹלֶס' },
            { es: 'jueves', he: 'יום חמישי', pron: 'חוּאֶבֶס' },
            { es: 'viernes', he: 'יום שישי', pron: 'בְּיֶירְנֶס' },
            { es: 'sábado', he: 'שבת', pron: 'סָאבָּדוֹ' },
            { es: 'domingo', he: 'יום ראשון', pron: 'דוֹמִינְגוֹ' }
        ]
    },
    {
        id: 'verbs-basic',
        title: 'פעלים בסיסיים',
        icon: 'fa-bolt',
        level: 'intermediate',
        words: [
            { es: 'ser', he: 'להיות (קבוע)', pron: 'סֶר' },
            { es: 'estar', he: 'להיות (מצב)', pron: 'אֶסְטָאר' },
            { es: 'tener', he: 'להיות לו (יש לי)', pron: 'טֶנֶר' },
            { es: 'querer', he: 'לרצות', pron: 'קֶרֶר' },
            { es: 'poder', he: 'להיות מסוגל', pron: 'פּוֹדֶר' },
            { es: 'hacer', he: 'לעשות', pron: 'אָסֶר' },
            { es: 'ir', he: 'ללכת', pron: 'אִיר' },
            { es: 'comer', he: 'לאכול', pron: 'קוֹמֶר' },
            { es: 'beber', he: 'לשתות', pron: 'בֶּבֶר' },
            { es: 'hablar', he: 'לדבר', pron: 'אָבְּלָר' }
        ]
    },
    {
        id: 'food',
        title: 'אוכל ומשקאות',
        icon: 'fa-utensils',
        level: 'intermediate',
        words: [
            { es: 'agua', he: 'מים', pron: 'אָגוּאָה' },
            { es: 'pan', he: 'לחם', pron: 'פָּאן' },
            { es: 'café', he: 'קפה', pron: 'קָאפֶה' },
            { es: 'cerveza', he: 'בירה', pron: 'סֶרְבֶסָה' },
            { es: 'pollo', he: 'עוף', pron: 'פּוֹיוֹ' },
            { es: 'arroz', he: 'אורז', pron: 'אָרוֹס' },
            { es: 'fruta', he: 'פרי', pron: 'פְרוּטָה' },
            { es: 'queso', he: 'גבינה', pron: 'קֶסוֹ' }
        ]
    },
    {
        id: 'emotions',
        title: 'רגשות',
        icon: 'fa-face-smile',
        level: 'intermediate',
        words: [
            { es: 'feliz', he: 'שמח', pron: 'פֶלִיס' },
            { es: 'triste', he: 'עצוב', pron: 'טְרִיסְטֶה' },
            { es: 'cansado', he: 'עייף', pron: 'קָנְסָאדוֹ' },
            { es: 'enojado', he: 'כועס', pron: 'אֶנוֹחָאדוֹ' },
            { es: 'emocionado', he: 'נרגש', pron: 'אֶמוֹסְיוֹנָאדוֹ' },
            { es: 'nervioso', he: 'לחוץ', pron: 'נֶרְבְּיוֹסוֹ' }
        ]
    },
    {
        id: 'idioms',
        title: 'ניבים וסלנג יומיומי',
        icon: 'fa-comments',
        level: 'expert',
        words: [
            { es: '¡Qué bueno!', he: 'כמה טוב!', pron: 'קֶה בּוּאֶנוֹ' },
            { es: '¡Ni hablar!', he: 'בשום אופן!', pron: 'נִי אָבְּלָר' },
            { es: 'Me da igual', he: 'לא משנה לי', pron: 'מֶה דָה אִיגוּאָל' },
            { es: '¿Qué onda?', he: 'מה קורה? (סלנג)', pron: 'קֶה אוֹנְדָה' },
            { es: 'Echar de menos', he: 'להתגעגע', pron: 'אֶצָ׳אר דֶה מֶנוֹס' },
            { es: 'Estoy hecho polvo', he: 'אני הרוס מעייפות (ניב)', pron: 'אֶסְטוֹי אֶצְ׳וֹ פּוֹלְבוֹ' }
        ]
    }
];

function getWordCategoryById(id) {
    return WORD_CATEGORIES.find(c => c.id === id);
}

function getAllBasicWords() {
    const list = [];
    WORD_CATEGORIES.forEach(cat => {
        cat.words.forEach(w => {
            list.push({ ...w, categoryTitle: cat.title, categoryId: cat.id, source: 'basic' });
        });
    });
    return list;
}

function getLearnedSongWords(songs) {
    const list = [];
    const seen = new Set();
    (songs || []).forEach(song => {
        (song.lines || []).forEach(line => {
            (line.words || []).forEach(w => {
                const norm = (w.es || '').toLowerCase().trim();
                if (norm && !seen.has(norm)) {
                    seen.add(norm);
                    list.push({
                        es: w.es,
                        he: w.he,
                        pron: w.pron || '',
                        songTitle: song.title,
                        songId: song.id,
                        source: 'song'
                    });
                }
            });
        });
    });
    return list;
}

