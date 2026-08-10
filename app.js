// ---- State ----
const state = {
    level: localStorage.getItem('sl_level') || 'beginner',
    xp: parseInt(localStorage.getItem('sl_xp') || '0', 10),
    streak: parseInt(localStorage.getItem('sl_streak') || '1', 10),
    completedSongs: JSON.parse(localStorage.getItem('sl_completed') || '[]'),
    currentSongId: null,
    currentLineIndex: 0,
    currentCategoryId: null,
    libraryTab: 'songs',
    quiz: { questions: [], index: 0, correct: 0, origin: 'song' }
};

function saveState() {
    localStorage.setItem('sl_level', state.level);
    localStorage.setItem('sl_xp', state.xp);
    localStorage.setItem('sl_streak', state.streak);
    localStorage.setItem('sl_completed', JSON.stringify(state.completedSongs));
}

// ---- Theme ----
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('theme-btn-light').classList.toggle('active', theme === 'light');
    document.getElementById('theme-btn-dark').classList.toggle('active', theme === 'dark');
}

function setTheme(theme) {
    localStorage.setItem('sl_theme', theme);
    applyTheme(theme);
}

function initTheme() {
    const saved = localStorage.getItem('sl_theme');
    const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(theme);
}

// ---- Navigation ----
function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + name).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(b => {
        b.classList.toggle('active', b.dataset.screen === name);
    });
    if (name === 'library') renderLibraryTab();
    if (name === 'progress') renderProgress();
    if (name === 'home') renderHome();
    window.scrollTo(0, 0);
}

// ---- Level selector (shared by home + settings) ----
function renderLevelSelector(containerId) {
    const el = document.getElementById(containerId);
    el.innerHTML = LEVELS.map(l => `
        <button onclick="setLevel('${l.id}')" class="pill ${state.level === l.id ? 'active' : ''}">
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
        <button onclick="openSong('${song.id}')" class="card p-4 w-full flex items-center gap-3 text-right">
            ${song.albumArt
                ? `<img src="${song.albumArt}" alt="${song.title}" class="w-12 h-12 rounded-lg object-cover">`
                : `<span class="text-3xl">${song.cover}</span>`}
            <div class="flex-1">
                <p class="font-bold text-sm">${song.title}</p>
                <p class="text-xs" style="color:var(--color-text-muted)">${song.artist}</p>
            </div>
            <i class="fa-solid fa-chevron-left" style="color:var(--color-text-muted)"></i>
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
            <div class="card p-3 text-xs" style="color:var(--color-danger)">
                לא זיהיתי קישור שיר תקין. העתיקו קישור מתוך ספוטיפיי (שתפו שיר → העתק קישור).
            </div>`;
        return;
    }

    btn.disabled = true;
    btn.textContent = 'טוען...';
    resultBox.innerHTML = `<div class="card p-4 text-xs text-center" style="color:var(--color-text-muted)">מביא פרטי שיר אמיתיים מספוטיפיי...</div>`;

    try {
        const oembedUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/track/${trackId}`;
        const res = await fetch(oembedUrl);
        if (!res.ok) throw new Error('oEmbed request failed');
        const meta = await res.json();
        renderImportResult(trackId, meta);
    } catch (err) {
        resultBox.innerHTML = `
            <div class="card p-3 text-xs" style="color:var(--color-danger)">
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
        <div class="card p-4">
            <div class="flex items-center gap-3 mb-3">
                <img src="${meta.thumbnail_url}" alt="${meta.title}" class="w-14 h-14 rounded-lg object-cover">
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-sm truncate">${meta.title}</p>
                    <p class="text-[11px]" style="color:var(--color-text-muted)">נטען ישירות מספוטיפיי</p>
                </div>
            </div>
            <iframe src="https://open.spotify.com/embed/track/${trackId}" width="100%" height="152"
                frameborder="0" allow="encrypted-media" loading="lazy" class="rounded-xl"></iframe>
            <p class="text-[11px] mt-3 leading-relaxed" style="color:var(--color-text-muted)">
                <i class="fa-solid fa-circle-info ml-1"></i>
                שיר זה עדיין לא ערוך במאגר המילים שלנו, אז אין עדיין שיעור מילה-מילה עבורו.
            </p>
            <button onclick="openSong('baila-conmigo')" class="btn-pill w-full mt-2 py-2 rounded-xl text-xs font-bold">
                נסו במקום את שיר הדוגמה הערוך
            </button>
        </div>`;
}

// ---- Search (requires local server.js / api/search.js for the Spotify Client Credentials proxy) ----
let searchDebounceTimer = null;

function handleSearchInput() {
    const query = document.getElementById('search-input').value.trim();
    const resultsBox = document.getElementById('search-results');
    clearTimeout(searchDebounceTimer);

    if (!query) {
        resultsBox.innerHTML = '';
        return;
    }

    searchDebounceTimer = setTimeout(async () => {
        resultsBox.innerHTML = `<p class="text-xs px-1" style="color:var(--color-text-muted)">מחפש...</p>`;
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error('search failed');
            const data = await res.json();
            renderSearchResults(data.tracks || []);
        } catch (err) {
            resultsBox.innerHTML = `
                <p class="text-[11px] px-1 leading-relaxed" style="color:var(--color-text-muted)">
                    חיפוש דורש הרצת השרת המקומי (<code>npm start</code>) עם מפתחות Spotify ב-.env — ראו README. אפשר עדיין להדביק קישור שיר ישירות למעלה.
                </p>`;
        }
    }, 400);
}

function renderSearchResults(tracks) {
    const resultsBox = document.getElementById('search-results');
    if (tracks.length === 0) {
        resultsBox.innerHTML = `<p class="text-xs px-1" style="color:var(--color-text-muted)">לא נמצאו תוצאות.</p>`;
        return;
    }
    resultsBox.innerHTML = tracks.map(t => `
        <button onclick='selectSearchResult(${JSON.stringify(t).replace(/'/g, "&#39;")})' class="card p-2.5 flex items-center gap-3 text-right">
            <img src="${t.albumArt}" alt="${t.name}" class="w-10 h-10 rounded-md object-cover">
            <div class="flex-1 min-w-0">
                <p class="text-sm font-bold truncate">${t.name}</p>
                <p class="text-[11px] truncate" style="color:var(--color-text-muted)">${t.artists}</p>
            </div>
        </button>
    `).join('');
}

function selectSearchResult(track) {
    document.getElementById('search-input').value = '';
    document.getElementById('search-results').innerHTML = '';
    document.getElementById('import-result').classList.remove('hidden');
    renderImportResult(track.id, { title: `${track.name} · ${track.artists}`, thumbnail_url: track.albumArt });
}

// ---- Library ----
function renderLibraryTab() {
    document.getElementById('lib-tab-songs').classList.toggle('active', state.libraryTab === 'songs');
    document.getElementById('lib-tab-wordbank').classList.toggle('active', state.libraryTab === 'wordbank');
    document.getElementById('song-list').classList.toggle('hidden', state.libraryTab !== 'songs');
    document.getElementById('wordbank-grid').classList.toggle('hidden', state.libraryTab !== 'wordbank');

    if (state.libraryTab === 'songs') renderLibrary();
    else renderWordBank();
}

function switchLibraryTab(tab) {
    state.libraryTab = tab;
    renderLibraryTab();
}

function renderLibrary() {
    const list = document.getElementById('song-list');
    list.innerHTML = SONGS.map(song => `
        <button ${song.locked ? 'disabled' : `onclick="openSong('${song.id}')"`}
            class="card p-4 flex items-center gap-3 text-right ${song.locked ? 'opacity-50' : ''}">
            ${song.albumArt
                ? `<img src="${song.albumArt}" alt="${song.title}" class="w-12 h-12 rounded-lg object-cover">`
                : `<span class="text-3xl">${song.cover}</span>`}
            <div class="flex-1">
                <p class="font-bold text-sm">${song.title}</p>
                <p class="text-xs" style="color:var(--color-text-muted)">${song.artist}</p>
            </div>
            <div class="flex flex-col items-end gap-1">
                <span class="tag tag-neutral">${song.genre}</span>
                ${song.locked ? '<i class="fa-solid fa-lock text-xs" style="color:var(--color-text-muted)"></i>' : ''}
            </div>
        </button>
    `).join('');
}

function renderWordBank() {
    const grid = document.getElementById('wordbank-grid');
    const levelLabel = id => (LEVELS.find(l => l.id === id) || {}).label || id;
    grid.innerHTML = WORD_CATEGORIES.map(cat => `
        <button onclick="openWordCategory('${cat.id}')" class="category-card text-right">
            <i class="fa-solid ${cat.icon}" style="color:var(--color-accent)"></i>
            <p class="font-bold text-sm mt-2 mb-2">${cat.title}</p>
            <div class="flex items-center gap-2 flex-wrap">
                <span class="tag">${levelLabel(cat.level)}</span>
                <span class="text-[11px]" style="color:var(--color-text-muted)">${cat.words.length} מילים</span>
            </div>
        </button>
    `).join('');
}

function openWordCategory(id) {
    state.currentCategoryId = id;
    const cat = getWordCategoryById(id);
    const levelLabel = (LEVELS.find(l => l.id === cat.level) || {}).label || cat.level;

    document.getElementById('wb-detail-title').textContent = cat.title;
    document.getElementById('wb-detail-meta').textContent = `${cat.words.length} מילים · ${levelLabel}`;
    document.getElementById('wb-detail-words').innerHTML = cat.words.map(w => `
        <button onclick="toggleWord(this)" class="word-chip p-3 flex items-center justify-between text-right">
            <span class="flex flex-col items-start" dir="ltr">
                <span class="es-text text-sm">${w.es}</span>
                <span class="reveal hidden text-[11px]" style="color:var(--color-text-muted)">${w.pron}</span>
            </span>
            <span class="text-sm">${w.he}</span>
        </button>
    `).join('');

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-wordbank-detail').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    window.scrollTo(0, 0);
}

function backToWordbank() {
    state.libraryTab = 'wordbank';
    showScreen('library');
    document.querySelector('.nav-item[data-screen="library"]').classList.add('active');
}

function startCategoryQuiz() {
    const cat = getWordCategoryById(state.currentCategoryId);
    startQuiz(cat.words, 'wordbank');
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

    const embedWrap = document.getElementById('lesson-embed-wrap');
    if (song.trackId) {
        embedWrap.innerHTML = `
            <iframe src="https://open.spotify.com/embed/track/${song.trackId}" width="100%" height="152"
                frameborder="0" allow="encrypted-media" loading="lazy" class="rounded-xl mb-3"></iframe>
            ${song.titleOnly ? `
                <p class="text-[11px] mb-4 leading-relaxed" style="color:var(--color-text-muted)">
                    <i class="fa-solid fa-circle-info ml-1"></i>
                    לשיר האמיתי הזה יש כרגע לימוד לכותרת בלבד — פירוק שורה-שורה לכל הטקסט דורש ספק מילים מורשה (ר' SPEC.md סעיף 5).
                </p>` : ''}`;
    } else {
        embedWrap.innerHTML = '';
    }

    document.getElementById('lesson-es').textContent = line.es;
    document.getElementById('lesson-he').textContent = line.he;

    document.getElementById('lesson-words').innerHTML = line.words.map((w, i) => `
        <button onclick="toggleWord(this)" class="word-chip p-3 flex items-center justify-between text-right">
            <span class="flex flex-col items-start" dir="ltr">
                <span class="es-text text-sm">${w.es}</span>
                <span class="reveal hidden text-[11px]" style="color:var(--color-text-muted)">${w.pron}</span>
            </span>
            <span class="text-sm">${w.he}</span>
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
    alert('תרגול הגייה עם מיקרופון מתוכנן לגרסה הבאה — ראו את ה-Roadmap ב-SPEC.md.');
}

function nextLine() {
    const song = getSongById(state.currentSongId);
    if (state.currentLineIndex < song.lines.length - 1) {
        state.currentLineIndex++;
        renderLesson();
        window.scrollTo(0, 0);
    } else {
        startQuiz(song.lines.flatMap(l => l.words), 'song');
    }
}

// ---- Quiz ----
function startQuiz(words, origin) {
    const questions = words.map(w => {
        const distractors = words
            .filter(o => o.he !== w.he)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(o => o.he);
        const options = [w.he, ...distractors].sort(() => Math.random() - 0.5);
        return { word: w.es, answer: w.he, options };
    });

    state.quiz = { questions, index: 0, correct: 0, origin };
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
        <button onclick="answerQuiz(this, '${opt.replace(/'/g, "\\'")}')" class="quiz-option py-3 text-sm">${opt}</button>
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

    if (state.quiz.origin === 'song' && !state.completedSongs.includes(state.currentSongId)) {
        state.completedSongs.push(state.currentSongId);
        state.xp += 25;
        saveState();
    } else if (state.quiz.origin === 'wordbank') {
        state.xp += 15;
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
        wrap.innerHTML = `<p class="text-sm" style="color:var(--color-text-muted)">עדיין לא השלמתם שירים. התחילו עם "Baila Conmigo" בספרייה!</p>`;
    } else {
        wrap.innerHTML = state.completedSongs.map(id => {
            const s = getSongById(id);
            return `
                <div class="card p-3 flex items-center gap-3">
                    <span class="text-xl">${s.cover}</span>
                    <span class="text-sm font-bold flex-1">${s.title}</span>
                    <i class="fa-solid fa-circle-check text-sm" style="color:var(--color-success)"></i>
                </div>
            `;
        }).join('');
    }
}

// ---- Update check ----
// Reopening a tab or a home-screen icon on mobile often just resumes the
// already-loaded page instead of re-fetching, so a new deploy can go
// unnoticed. This polls version.json (bypassing cache) whenever the app
// becomes visible again, or periodically while it stays open, and shows a
// small banner if the server's version has moved past what's loaded.
let loadedVersion = null;

function checkForUpdate() {
    if (!loadedVersion) return;
    fetch('version.json?t=' + Date.now(), { cache: 'no-store' })
        .then(r => r.json())
        .then(data => {
            if (data.version !== loadedVersion) {
                document.getElementById('update-banner').classList.remove('hidden');
            }
        })
        .catch(() => {});
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderLevelSelector('level-selector');
    renderLevelSelector('settings-level-selector');
    renderHome();

    fetch('version.json')
        .then(r => r.json())
        .then(data => {
            loadedVersion = data.version;
            document.getElementById('app-version').textContent = 'v' + data.version;
            document.getElementById('settings-version').textContent = 'v' + data.version;
            document.getElementById('settings-build').textContent =
                'build: ' + new Date(data.buildDate).toLocaleDateString('he-IL');
        })
        .catch(() => {});

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate();
    });
    setInterval(checkForUpdate, 5 * 60 * 1000);
});
