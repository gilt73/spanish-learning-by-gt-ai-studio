// app.js — Spanish Learning v1.5
// New: BYOT lesson generation, circular progress rings, mastery states, driving mode UX

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
    const screenEl = document.getElementById('screen-' + name);
    if (screenEl) screenEl.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(b => {
        b.classList.toggle('active', b.dataset.screen === name);
    });

    if (name === 'library') renderLibraryTab();
    if (name === 'progress') renderProgress();
    if (name === 'home') renderHome();
    if (name === 'add-song') resetAddSongForm();
    window.scrollTo(0, 0);
}

// ---- Level selector ----
function renderLevelSelector(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
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

// ---- Circular Progress Ring ----
// Renders an SVG ring around the song art. r=24 → circumference=~150.8
const RING_R = 24;
const RING_C = 2 * Math.PI * RING_R; // 150.796...

function renderProgressRing(song) {
    const pct = song.progress_percentage || 0;
    const mastered = song.is_mastered || false;
    const offset = RING_C - (pct / 100) * RING_C;

    const coverHtml = song.albumArt
        ? `<img src="${song.albumArt}" alt="${song.title}">`
        : `<span class="ring-cover-emoji">${song.cover || '🎵'}</span>`;

    const masteredBadge = mastered
        ? `<div class="mastered-overlay"><i class="fa-solid fa-check"></i></div>`
        : '';

    return `
        <div class="song-ring-wrap ${mastered ? 'mastered' : ''}">
            <svg class="ring-svg" viewBox="0 0 56 56">
                <circle class="ring-track" cx="28" cy="28" r="${RING_R}"/>
                <circle class="ring-fill" cx="28" cy="28" r="${RING_R}"
                    stroke-dasharray="${RING_C}"
                    stroke-dashoffset="${offset.toFixed(2)}"/>
            </svg>
            <div class="ring-cover">${coverHtml}</div>
            ${masteredBadge}
        </div>`;
}

// ---- Song Progress ----
function updateSongProgress(songId) {
    const song = getSongById(songId);
    if (!song) return;

    const totalLines = song.lines.length;
    if (totalLines === 0) return;

    const newPct = Math.min(100, Math.round(((state.currentLineIndex + 1) / totalLines) * 100));
    song.progress_percentage = newPct;

    if (newPct >= 100) {
        song.is_mastered = true;
        if (!state.completedSongs.includes(songId)) {
            state.completedSongs.push(songId);
            state.xp += 25;
            saveState();
        }
    }

    saveSongProgressToStorage(songId, song.progress_percentage, song.is_mastered);

    // If it's a user-added song, also update localStorage songs list
    const userSongs = getSongsFromLocalStorage();
    const idx = userSongs.findIndex(s => s.id === songId);
    if (idx >= 0) {
        userSongs[idx] = { ...userSongs[idx], ...song };
        localStorage.setItem('sl_user_songs', JSON.stringify(userSongs));
    }
}

// ---- Song Card Renderer ----
function renderSongCard(song) {
    const ring = renderProgressRing(song);
    const spotifyBtn = song.spotify_url
        ? `<button class="btn-spotify-small" onclick="event.stopPropagation(); window.open('${song.spotify_url}', '_blank')">
               <i class="fa-brands fa-spotify"></i> ספוטיפיי
           </button>`
        : '';

    const pctLabel = song.progress_percentage > 0
        ? `<span class="text-[10px]" style="color:var(--color-text-muted)">${song.progress_percentage}%</span>`
        : '';

    const masteredLabel = song.is_mastered
        ? `<span class="tag" style="background:var(--color-mastered-100);color:var(--color-mastered)">✓ נלמד</span>`
        : `<span class="tag tag-neutral">${song.genre}</span>`;

    return `
        <button onclick="openSong('${song.id}')"
            class="song-card ${song.is_mastered ? 'mastered' : ''}">
            ${ring}
            <div class="song-card-info">
                <p class="song-card-title">${song.title}</p>
                <p class="song-card-artist">${song.artist}</p>
                <div class="song-card-meta">
                    ${masteredLabel}
                    ${pctLabel}
                </div>
            </div>
            <div class="song-card-actions">
                ${spotifyBtn}
                <i class="fa-solid fa-chevron-left text-xs" style="color:var(--color-text-muted)"></i>
            </div>
        </button>`;
}

// ---- Home ----
function renderHome() {
    document.getElementById('home-streak').textContent = state.streak;
    document.getElementById('home-xp').textContent = state.xp;
    renderLevelSelector('level-selector');

    const wrap = document.getElementById('home-continue');
    // Find the first in-progress or first unlocked song
    const inProgress = SONGS.find(s => !s.locked && s.progress_percentage > 0 && !s.is_mastered);
    const song = inProgress || SONGS.find(s => !s.locked);
    if (song) {
        wrap.innerHTML = renderSongCard(song);
    }
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
    list.innerHTML = SONGS
        .filter(s => !s.locked)
        .map(song => renderSongCard(song))
        .join('');
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
    if (!song) return;
    const line = song.lines[state.currentLineIndex];
    if (!line) return;

    document.getElementById('lesson-title').textContent = song.title;
    document.getElementById('lesson-progress').textContent =
        `שורה ${state.currentLineIndex + 1} מתוך ${song.lines.length}`;
    document.getElementById('lesson-progress-bar').style.width =
        `${((state.currentLineIndex + 1) / song.lines.length) * 100}%`;

    // Spotify bar
    const spotifyBar = document.getElementById('lesson-spotify-bar');
    if (song.spotify_url) {
        spotifyBar.classList.remove('hidden');
        spotifyBar.dataset.url = song.spotify_url;
    } else {
        spotifyBar.classList.add('hidden');
    }

    // Spotify embed (trackId)
    const embedWrap = document.getElementById('lesson-embed-wrap');
    if (song.trackId && !song.spotify_url) {
        embedWrap.innerHTML = `
            <iframe src="https://open.spotify.com/embed/track/${song.trackId}" width="100%" height="152"
                frameborder="0" allow="encrypted-media" loading="lazy" class="rounded-xl mb-3"></iframe>`;
    } else {
        embedWrap.innerHTML = '';
    }

    document.getElementById('lesson-es').textContent = line.es;
    document.getElementById('lesson-he').textContent = line.he;

    const words = line.words || [];
    document.getElementById('lesson-words').innerHTML = words.map(w => `
        <button onclick="toggleWord(this)" class="word-chip p-3 flex items-center justify-between text-right">
            <span class="flex flex-col items-start" dir="ltr">
                <span class="es-text text-sm">${w.es}</span>
                <span class="reveal hidden text-[11px]" style="color:var(--color-text-muted)">${w.pron}</span>
            </span>
            <span class="text-sm">${w.he}</span>
        </button>
    `).join('');

    const isLastLine = state.currentLineIndex >= song.lines.length - 1;
    document.getElementById('lesson-next-label').textContent = isLastLine
        ? 'סיימתי — לתרגול'
        : 'המשך לשורה הבאה';
}

function openSpotify() {
    const bar = document.getElementById('lesson-spotify-bar');
    const url = bar.dataset.url;
    if (url) window.open(url, '_blank');
}

function toggleWord(el) {
    el.classList.toggle('revealed');
    el.querySelector('.reveal').classList.toggle('hidden');
}

function playLine(rate) {
    const song = getSongById(state.currentSongId);
    if (!song) return;
    const line = song.lines[state.currentLineIndex];
    if (!line || !('speechSynthesis' in window)) return;
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
    if (!song) return;

    // Update progress tracking
    updateSongProgress(state.currentSongId);

    if (state.currentLineIndex < song.lines.length - 1) {
        state.currentLineIndex++;
        renderLesson();
        window.scrollTo(0, 0);
    } else {
        startQuiz(song.lines.flatMap(l => l.words || []), 'song');
    }
}

// ---- Quiz ----
function startQuiz(words, origin) {
    const filtered = words.filter(w => w && w.es && w.he);
    if (filtered.length < 2) {
        // Not enough words — go back to library
        showScreen('library');
        return;
    }

    const questions = filtered.map(w => {
        const distractors = filtered
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
        <button onclick="answerQuiz(this, '${opt.replace(/'/g, "\\'")}', '${q.answer.replace(/'/g, "\\'")}'))"
            class="quiz-option py-3 text-sm">${opt}</button>
    `).join('');
}

function answerQuiz(el, chosen, answer) {
    const buttons = document.querySelectorAll('#quiz-options button');
    buttons.forEach(b => b.onclick = null);

    const isCorrect = chosen === answer;
    if (isCorrect) {
        el.classList.add('correct');
        state.quiz.correct++;
        state.xp += 10;
        saveState();
    } else {
        el.classList.add('incorrect');
        buttons.forEach(b => { if (b.textContent.trim() === answer) b.classList.add('correct'); });
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

    if (state.quiz.origin === 'song') {
        // Mark song as fully mastered
        const song = getSongById(state.currentSongId);
        if (song) {
            song.progress_percentage = 100;
            song.is_mastered = true;
            saveSongProgressToStorage(state.currentSongId, 100, true);
        }
        if (!state.completedSongs.includes(state.currentSongId)) {
            state.completedSongs.push(state.currentSongId);
            state.xp += 25;
            saveState();
        }
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
    const mastered = SONGS.filter(s => s.is_mastered);
    if (mastered.length === 0) {
        wrap.innerHTML = `<p class="text-sm" style="color:var(--color-text-muted)">עדיין לא השלמתם שירים. התחילו עם "Baila Conmigo" בספרייה!</p>`;
    } else {
        wrap.innerHTML = mastered.map(s => `
            <div class="card p-3 flex items-center gap-3">
                ${s.albumArt
                    ? `<img src="${s.albumArt}" alt="${s.title}" class="w-10 h-10 rounded-full object-cover">`
                    : `<span class="text-xl">${s.cover}</span>`}
                <span class="text-sm font-bold flex-1">${s.title}</span>
                <i class="fa-solid fa-circle-check text-lg" style="color:var(--color-mastered-ring)"></i>
            </div>
        `).join('');
    }
}

// ---- Add New Song (BYOT) ----
function resetAddSongForm() {
    ['add-title', 'add-artist', 'add-spotify', 'add-lyrics'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const btn = document.getElementById('add-song-btn');
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles ml-2"></i>צור שיעור עם AI';
    }
    const result = document.getElementById('add-song-result');
    if (result) {
        result.classList.add('hidden');
        result.innerHTML = '';
    }
}

async function handleAddSong() {
    const title = document.getElementById('add-title').value.trim();
    const artist = document.getElementById('add-artist').value.trim();
    const spotifyUrl = document.getElementById('add-spotify').value.trim();
    const lyrics = document.getElementById('add-lyrics').value.trim();

    if (!title || !artist || !lyrics) {
        showAddSongError('נא למלא שם שיר, שם אמן ומילות השיר');
        return;
    }

    const btn = document.getElementById('add-song-btn');
    const result = document.getElementById('add-song-result');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin ml-2"></i>מעבד עם AI...';
    result.classList.remove('hidden');
    result.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p class="text-sm font-bold">מנתח את מילות השיר...</p>
            <p class="text-xs" style="color:var(--color-text-muted)">זה עשוי לקחת 15-30 שניות</p>
        </div>`;

    try {
        const res = await fetch('/api/generate-lesson', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, artist, spotify_url: spotifyUrl, lyrics })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || `שגיאת שרת (${res.status})`);
        }

        const data = await res.json();
        const lyricsData = data.lyrics_data;

        if (!lyricsData || !lyricsData.lines || lyricsData.lines.length === 0) {
            throw new Error('לא הצלחתי לעבד את המילים. נסה שוב.');
        }

        // Build song object
        const songId = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
        let trackId = null;
        if (spotifyUrl) {
            const match = spotifyUrl.match(/track[\/:]([a-zA-Z0-9]{10,})/);
            if (match) trackId = match[1].split('?')[0];
        }

        const newSong = {
            id: songId,
            title,
            artist,
            spotify_url: spotifyUrl || null,
            trackId,
            albumArt: null,
            genre: 'Salsa',
            level: 'beginner',
            cover: '🎵',
            locked: false,
            lyrics_data: lyricsData,
            lines: lyricsData.lines,
            progress_percentage: 0,
            is_mastered: false
        };

        // Save to localStorage and merge into SONGS
        saveSongToLocalStorage(newSong);
        if (!SONGS.find(s => s.id === songId)) {
            SONGS.push(newSong);
        }

        // Show success
        result.innerHTML = `
            <div class="card p-4" style="border:1px solid var(--color-accent-400)">
                <div class="flex items-center gap-3 mb-3">
                    <span class="text-3xl">🎉</span>
                    <div>
                        <p class="font-bold text-sm">${title}</p>
                        <p class="text-xs" style="color:var(--color-text-muted)">${lyricsData.lines.length} שורות · ${(lyricsData.vocabulary || []).length} מילים</p>
                    </div>
                </div>
                <p class="text-sm mb-3" style="color:var(--color-text-muted)">השיר נוסף לספרייה בהצלחה!</p>
                <button onclick="openSong('${songId}')" class="btn-primary w-full py-3 text-sm font-bold">
                    <i class="fa-solid fa-play ml-2"></i>התחל שיעור
                </button>
            </div>`;

        btn.innerHTML = '<i class="fa-solid fa-check ml-2"></i>נוצר בהצלחה!';

    } catch (err) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles ml-2"></i>צור שיעור עם AI';
        showAddSongError(err.message || 'אירעה שגיאה בלתי צפויה');
    }
}

function showAddSongError(msg) {
    const result = document.getElementById('add-song-result');
    result.classList.remove('hidden');
    result.innerHTML = `
        <div class="card p-4" style="border:1px solid var(--color-danger);background:var(--color-danger-100)">
            <p class="text-sm font-bold mb-1" style="color:var(--color-danger)">שגיאה</p>
            <p class="text-sm" style="color:var(--color-danger)">${msg}</p>
        </div>`;
}

// ---- Update check ----
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
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();

    // Load songs (seed + user-added) before rendering
    await initSongs();

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
