// ---- State ----
const state = {
    level: localStorage.getItem('sl_level') || 'beginner',
    xp: parseInt(localStorage.getItem('sl_xp') || '0', 10),
    streak: parseInt(localStorage.getItem('sl_streak') || '1', 10),
    completedSongs: JSON.parse(localStorage.getItem('sl_completed') || '[]'),
    currentSongId: null,
    currentLineIndex: 0,
    quiz: { questions: [], index: 0, correct: 0 }
};

function saveState() {
    localStorage.setItem('sl_level', state.level);
    localStorage.setItem('sl_xp', state.xp);
    localStorage.setItem('sl_streak', state.streak);
    localStorage.setItem('sl_completed', JSON.stringify(state.completedSongs));
}

// ---- Navigation ----
function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + name).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(b => {
        b.classList.toggle('active', b.dataset.screen === name);
    });
    if (name === 'library') renderLibrary();
    if (name === 'progress') renderProgress();
    if (name === 'home') renderHome();
    window.scrollTo(0, 0);
}

// ---- Level selector (shared by home + settings) ----
function renderLevelSelector(containerId) {
    const el = document.getElementById(containerId);
    el.innerHTML = LEVELS.map(l => `
        <button onclick="setLevel('${l.id}')"
            class="glass-card rounded-xl py-2 text-xs font-bold ${state.level === l.id ? 'ring-2 ring-' + l.color : ''}"
            style="${state.level === l.id ? 'background:rgba(59,130,246,0.15);border-color:rgba(96,165,250,0.5);' : ''}">
            ${l.label}
        </button>
    `).join('');
}

function setLevel(id) {
    state.level = id;
    saveState();
    renderLevelSelector('level-selector');
    renderLevelSelector('settings-level-selector');
}

// ---- Home ----
function renderHome() {
    document.getElementById('home-streak').textContent = state.streak;
    document.getElementById('home-xp').textContent = state.xp;
    renderLevelSelector('level-selector');

    const wrap = document.getElementById('home-continue');
    const song = SONGS.find(s => !s.locked);
    wrap.innerHTML = `
        <button onclick="openSong('${song.id}')" class="glass-card rounded-2xl p-4 w-full flex items-center gap-3 text-right">
            <span class="text-3xl">${song.cover}</span>
            <div class="flex-1">
                <p class="font-bold text-sm">${song.title}</p>
                <p class="text-xs text-gray-500">${song.artist}</p>
            </div>
            <i class="fa-solid fa-chevron-left text-gray-500"></i>
        </button>
    `;
}

function extractSpotifyTrackId(url) {
    const match = url.match(/track[\/:]([a-zA-Z0-9]{10,})/);
    return match ? match[1].split('?')[0] : null;
}

async function handleSpotifyImport() {
    const input = document.getElementById('spotify-input');
    const url = input.value.trim();
    if (!url) {
        input.focus();
        return;
    }

    const trackId = extractSpotifyTrackId(url);
    const resultBox = document.getElementById('import-result');
    const btn = document.getElementById('import-btn');
    resultBox.classList.remove('hidden');

    if (!trackId) {
        resultBox.innerHTML = `
            <div class="glass-card rounded-xl p-3 text-xs text-red-300">
                לא זיהיתי קישור שיר תקין. העתיקו קישור מתוך ספוטיפיי (שתפו שיר → העתק קישור).
            </div>`;
        return;
    }

    btn.disabled = true;
    btn.textContent = 'טוען...';
    resultBox.innerHTML = `<div class="glass-card rounded-xl p-4 text-xs text-gray-400 text-center">מביא פרטי שיר אמיתיים מספוטיפיי...</div>`;

    try {
        const oembedUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/track/${trackId}`;
        const res = await fetch(oembedUrl);
        if (!res.ok) throw new Error('oEmbed request failed');
        const meta = await res.json();
        renderImportResult(trackId, meta);
    } catch (err) {
        resultBox.innerHTML = `
            <div class="glass-card rounded-xl p-3 text-xs text-red-300">
                לא הצלחתי להביא את פרטי השיר כרגע (בעיית רשת או קישור לא תקין). נסו שוב, או נסו את השיר לדוגמה בספרייה.
            </div>`;
    } finally {
        btn.disabled = false;
        btn.textContent = 'ייבא שיר';
    }
}

function renderImportResult(trackId, meta) {
    const resultBox = document.getElementById('import-result');
    resultBox.innerHTML = `
        <div class="glass-card rounded-2xl p-4">
            <div class="flex items-center gap-3 mb-3">
                <img src="${meta.thumbnail_url}" alt="${meta.title}" class="w-14 h-14 rounded-lg object-cover">
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-sm truncate">${meta.title}</p>
                    <p class="text-[11px] text-gray-500">נטען ישירות מספוטיפיי</p>
                </div>
            </div>
            <iframe src="https://open.spotify.com/embed/track/${trackId}" width="100%" height="152"
                frameborder="0" allow="encrypted-media" loading="lazy" class="rounded-xl"></iframe>
            <p class="text-[11px] text-gray-500 mt-3 leading-relaxed">
                <i class="fa-solid fa-circle-info ml-1"></i>
                שיר זה עדיין לא ערוך במאגר המילים שלנו, אז אין עדיין שיעור מילה-מילה עבורו.
            </p>
            <button onclick="openSong('baila-conmigo')" class="w-full mt-2 py-2 rounded-xl glass-card text-xs font-bold">
                נסו במקום את שיר הדוגמה הערוך
            </button>
        </div>`;
}

// ---- Library ----
function renderLibrary() {
    const list = document.getElementById('song-list');
    list.innerHTML = SONGS.map(song => `
        <button ${song.locked ? 'disabled' : `onclick="openSong('${song.id}')"`}
            class="glass-card rounded-2xl p-4 flex items-center gap-3 text-right ${song.locked ? 'opacity-50' : ''}">
            <span class="text-3xl">${song.cover}</span>
            <div class="flex-1">
                <p class="font-bold text-sm">${song.title}</p>
                <p class="text-xs text-gray-500">${song.artist}</p>
            </div>
            <div class="flex flex-col items-end gap-1">
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/10">${song.genre}</span>
                ${song.locked ? '<i class="fa-solid fa-lock text-gray-500 text-xs"></i>' : ''}
            </div>
        </button>
    `).join('');
}

// ---- Lesson ----
function openSong(songId) {
    state.currentSongId = songId;
    state.currentLineIndex = 0;
    showLessonScreen();
}

function showLessonScreen() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-lesson').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    renderLesson();
    window.scrollTo(0, 0);
}

function renderLesson() {
    const song = getSongById(state.currentSongId);
    const line = song.lines[state.currentLineIndex];

    document.getElementById('lesson-title').textContent = song.title;
    document.getElementById('lesson-progress').textContent =
        `שורה ${state.currentLineIndex + 1} מתוך ${song.lines.length}`;
    document.getElementById('lesson-progress-bar').style.width =
        `${((state.currentLineIndex + 1) / song.lines.length) * 100}%`;

    document.getElementById('lesson-es').textContent = line.es;
    document.getElementById('lesson-he').textContent = line.he;

    document.getElementById('lesson-words').innerHTML = line.words.map((w, i) => `
        <button onclick="toggleWord(this)" class="word-chip glass-card rounded-xl p-3 flex items-center justify-between text-right">
            <span class="flex flex-col items-start" dir="ltr">
                <span class="font-bold text-sm">${w.es}</span>
                <span class="reveal hidden text-[11px] text-gray-500">${w.pron}</span>
            </span>
            <span class="text-sm text-gray-300">${w.he}</span>
        </button>
    `).join('');

    const btn = document.getElementById('lesson-next-btn');
    btn.textContent = state.currentLineIndex < song.lines.length - 1
        ? 'המשך לשורה הבאה'
        : 'סיימתי — לתרגול';
}

function toggleWord(el) {
    el.classList.toggle('revealed');
    el.querySelector('.reveal').classList.toggle('hidden');
}

function playLine(rate) {
    const song = getSongById(state.currentSongId);
    const line = song.lines[state.currentLineIndex];
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(line.es);
    utter.lang = 'es-ES';
    utter.rate = rate;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
}

function startPronunciationPractice() {
    alert('תרגול הגייה עם מיקרופון מתוכנן לגרסה הבאה (V1.3) — ראו את ה-Roadmap ב-SPEC.md.');
}

function nextLine() {
    const song = getSongById(state.currentSongId);
    if (state.currentLineIndex < song.lines.length - 1) {
        state.currentLineIndex++;
        renderLesson();
        window.scrollTo(0, 0);
    } else {
        startQuiz(song);
    }
}

// ---- Quiz ----
function startQuiz(song) {
    const allWords = song.lines.flatMap(l => l.words);
    const questions = allWords.map(w => {
        const distractors = allWords
            .filter(o => o.he !== w.he)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(o => o.he);
        const options = [w.he, ...distractors].sort(() => Math.random() - 0.5);
        return { word: w.es, answer: w.he, options };
    });

    state.quiz = { questions, index: 0, correct: 0 };
    document.getElementById('quiz-result').classList.add('hidden');
    document.getElementById('quiz-question-wrap').classList.remove('hidden');
    document.getElementById('quiz-options').classList.remove('hidden');

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-quiz').classList.add('active');
    renderQuizQuestion();
    window.scrollTo(0, 0);
}

function renderQuizQuestion() {
    const q = state.quiz.questions[state.quiz.index];
    document.getElementById('quiz-score').textContent =
        `${state.quiz.correct} / ${state.quiz.questions.length}`;
    document.getElementById('quiz-word').textContent = q.word;

    document.getElementById('quiz-options').innerHTML = q.options.map(opt => `
        <button onclick="answerQuiz(this, '${opt.replace(/'/g, "\\'")}')"
            class="quiz-option glass-card rounded-xl py-3 text-sm">${opt}</button>
    `).join('');
}

function answerQuiz(el, chosen) {
    const q = state.quiz.questions[state.quiz.index];
    const buttons = document.querySelectorAll('#quiz-options button');
    buttons.forEach(b => b.onclick = null);

    const isCorrect = chosen === q.answer;
    if (isCorrect) {
        el.classList.add('correct');
        state.quiz.correct++;
        state.xp += 10;
        saveState();
    } else {
        el.classList.add('incorrect');
        buttons.forEach(b => { if (b.textContent === q.answer) b.classList.add('correct'); });
    }

    setTimeout(() => {
        state.quiz.index++;
        if (state.quiz.index < state.quiz.questions.length) {
            renderQuizQuestion();
        } else {
            finishQuiz();
        }
    }, 700);
}

function finishQuiz() {
    document.getElementById('quiz-question-wrap').classList.add('hidden');
    document.getElementById('quiz-options').classList.add('hidden');
    document.getElementById('quiz-result').classList.remove('hidden');

    if (!state.completedSongs.includes(state.currentSongId)) {
        state.completedSongs.push(state.currentSongId);
        state.xp += 25;
        saveState();
    }
}

// ---- Progress ----
function renderProgress() {
    document.getElementById('progress-streak').textContent = state.streak;
    document.getElementById('progress-xp').textContent = state.xp;

    const vocabPct = Math.min(100, state.xp);
    const grammarPct = Math.min(100, Math.round(state.xp * 0.6));
    const listeningPct = Math.min(100, Math.round(state.xp * 0.4));

    document.getElementById('skill-vocab').style.width = vocabPct + '%';
    document.getElementById('skill-vocab-pct').textContent = vocabPct + '%';
    document.getElementById('skill-grammar').style.width = grammarPct + '%';
    document.getElementById('skill-grammar-pct').textContent = grammarPct + '%';
    document.getElementById('skill-listening').style.width = listeningPct + '%';
    document.getElementById('skill-listening-pct').textContent = listeningPct + '%';

    const wrap = document.getElementById('progress-songs');
    if (state.completedSongs.length === 0) {
        wrap.innerHTML = `<p class="text-sm text-gray-500">עדיין לא השלמתם שירים. התחילו עם "Baila Conmigo" בספרייה!</p>`;
    } else {
        wrap.innerHTML = state.completedSongs.map(id => {
            const s = getSongById(id);
            return `
                <div class="glass-card rounded-xl p-3 flex items-center gap-3">
                    <span class="text-xl">${s.cover}</span>
                    <span class="text-sm font-bold flex-1">${s.title}</span>
                    <i class="fa-solid fa-circle-check text-green-400 text-sm"></i>
                </div>
            `;
        }).join('');
    }
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    renderLevelSelector('level-selector');
    renderLevelSelector('settings-level-selector');
    renderHome();

    fetch('version.json')
        .then(r => r.json())
        .then(data => {
            document.getElementById('app-version').textContent = 'v' + data.version;
            document.getElementById('settings-version').textContent = 'v' + data.version;
            document.getElementById('settings-build').textContent =
                'build: ' + new Date(data.buildDate).toLocaleDateString('he-IL');
        })
        .catch(() => {});
});
