// app.js — Spanish Learning v2.0.0

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
    wordbankSubtab: 'basic',
    quiz: { questions: [], index: 0, correct: 0, origin: 'song' }
};

function saveState() {
    localStorage.setItem('sl_level', state.level);
    localStorage.setItem('sl_xp', state.xp);
    localStorage.setItem('sl_streak', state.streak);
    localStorage.setItem('sl_completed', JSON.stringify(state.completedSongs));
}

// ============================================================
// THEME — 3-way (light / dark / high-contrast)
// ============================================================
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('theme-btn-light').classList.toggle('active', theme === 'light');
    document.getElementById('theme-btn-dark').classList.toggle('active', theme === 'dark');
    document.getElementById('theme-btn-high-contrast').classList.toggle('active', theme === 'high-contrast');
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

// ============================================================
// NAVIGATION
// ============================================================
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

// ============================================================
// LEVEL SELECTOR
// ============================================================
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

// ============================================================
// CIRCULAR PROGRESS RING
// ============================================================
const RING_R = 24;
const RING_C = 2 * Math.PI * RING_R;

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

// ============================================================
// SONG PROGRESS
// ============================================================
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

    const userSongs = getSongsFromLocalStorage();
    const idx = userSongs.findIndex(s => s.id === songId);
    if (idx >= 0) {
        userSongs[idx] = { ...userSongs[idx], ...song };
        localStorage.setItem('sl_user_songs', JSON.stringify(userSongs));
    }
}

// ============================================================
// SONG CARD
// ============================================================
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

// ============================================================
// HOME
// ============================================================
function renderHome() {
    document.getElementById('home-streak').textContent = state.streak;
    document.getElementById('home-xp').textContent = state.xp;
    renderLevelSelector('level-selector');

    const wrap = document.getElementById('home-continue');
    const inProgress = SONGS.find(s => !s.locked && s.progress_percentage > 0 && !s.is_mastered);
    const song = inProgress || SONGS.find(s => !s.locked);
    if (song) {
        wrap.innerHTML = renderSongCard(song);
    }
}

// ============================================================
// LIBRARY
// ============================================================
function renderLibraryTab() {
    document.getElementById('lib-tab-songs').classList.toggle('active', state.libraryTab === 'songs');
    document.getElementById('lib-tab-wordbank').classList.toggle('active', state.libraryTab === 'wordbank');
    document.getElementById('song-list').classList.toggle('hidden', state.libraryTab !== 'songs');
    document.getElementById('wordbank-section').classList.toggle('hidden', state.libraryTab !== 'wordbank');

    if (state.libraryTab === 'songs') renderLibrary();
    else renderWordBank();
}

function switchLibraryTab(tab) {
    state.libraryTab = tab;
    renderLibraryTab();
}

function switchWordbankSubtab(subtab) {
    state.wordbankSubtab = subtab;
    renderWordBank();
}

function renderLibrary() {
    const list = document.getElementById('song-list');
    list.innerHTML = SONGS
        .filter(s => !s.locked)
        .map(song => renderSongCard(song))
        .join('');
}

function renderWordBank() {
    const isBasic = (state.wordbankSubtab || 'basic') === 'basic';
    document.getElementById('wb-subtab-basic').classList.toggle('active', isBasic);
    document.getElementById('wb-subtab-songs').classList.toggle('active', !isBasic);

    const grid = document.getElementById('wordbank-grid');
    const songContainer = document.getElementById('wordbank-song-container');

    if (isBasic) {
        grid.classList.remove('hidden');
        songContainer.classList.add('hidden');

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
    } else {
        grid.classList.add('hidden');
        songContainer.classList.remove('hidden');

        const songWords = getLearnedSongWords(SONGS);
        if (songWords.length === 0) {
            songContainer.innerHTML = `
                <div class="card p-6 text-center">
                    <p class="text-sm" style="color:var(--color-text-muted)">עדיין לא נלמדו מילים משירים. למדו שיר בספרייה כדי להוסיף מילים למאגר!</p>
                </div>`;
        } else {
            songContainer.innerHTML = `
                <div class="flex items-center justify-between mb-2 px-1">
                    <p class="text-xs font-bold" style="color:var(--color-text-muted)">${songWords.length} מילים שנלמדו משירים</p>
                    <button onclick="startRandomPractice('songs')" class="btn-pill text-xs px-3 py-1 font-bold" style="border-color:var(--color-accent);color:var(--color-accent)">
                        <i class="fa-solid fa-shuffle ml-1"></i>תרגול אקראי
                    </button>
                </div>
                ${songWords.map(w => `
                    <button onclick="toggleWord(this)" class="word-chip p-3 flex items-center justify-between text-right">
                        <span class="flex flex-col items-start" dir="ltr">
                            <span class="es-text text-sm">${w.es}</span>
                            <span class="reveal hidden text-[11px]" style="color:var(--color-text-muted)">${w.pron || ''}</span>
                        </span>
                        <div class="flex flex-col items-end">
                            <span class="text-sm">${w.he}</span>
                            <span class="text-[10px]" style="color:var(--color-text-muted)">${w.songTitle}</span>
                        </div>
                    </button>
                `).join('')}`;
        }
    }
}

function startRandomPractice(bankType) {
    let pool = [];
    if (bankType === 'basic') {
        pool = getAllBasicWords();
    } else if (bankType === 'songs') {
        pool = getLearnedSongWords(SONGS);
    } else {
        pool = [...getAllBasicWords(), ...getLearnedSongWords(SONGS)];
    }

    if (pool.length < 2) {
        alert('אין מספיק מילים במאגר לתרגול אקראי.');
        return;
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    startQuiz(shuffled, 'wordbank');
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

// ============================================================
// LESSON (normal mode)
// ============================================================
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

    document.getElementById('lesson-es').textContent = line.spanish_text || line.es;
    document.getElementById('lesson-he').textContent = line.hebrew_translation || line.he;

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
        ? 'סיימתי — לתרגול...'
        : 'המשך למשפט הבא ...';
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
    if (!line) return;
    
    if (state.currentAudio) {
        state.currentAudio.pause();
    }
    
    if (line.audio_es_path) {
        state.currentAudio = new Audio(line.audio_es_path);
        state.currentAudio.playbackRate = rate || 1;
        state.currentAudio.play();
    } else if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(line.spanish_text || line.es);
        utter.lang = 'es-ES';
        utter.rate = rate;
        speechSynthesis.cancel();
        speechSynthesis.speak(utter);
    }
}

function nextLine() {
    const song = getSongById(state.currentSongId);
    if (!song) return;

    updateSongProgress(state.currentSongId);

    if (state.currentLineIndex < song.lines.length - 1) {
        state.currentLineIndex++;
        renderLesson();
        window.scrollTo(0, 0);
    } else {
        startQuiz(song.lines.flatMap(l => l.words || []), 'song');
    }
}

// ============================================================
// PRONUNCIATION PRACTICE
// ============================================================
let pronRecognition = null;
let pronIsRecording = false;

function startPronunciationPractice() {
    const song = getSongById(state.currentSongId);
    if (!song) return;
    const line = song.lines[state.currentLineIndex];
    if (!line) return;
    openPronunciationModal(line.es, line.he);
}

function openPronunciationModal(sentence, translation) {
    const modal = document.getElementById('pronunciation-modal');
    document.getElementById('pron-sentence').textContent = sentence;
    document.getElementById('pron-he').textContent = translation;
    document.getElementById('pron-words-result').innerHTML =
        sentence.split(/\s+/).map(w =>
            `<span class="pron-word-chip pending">${w.replace(/[¿¡.,!?]/g,'')}</span>`
        ).join('');
    document.getElementById('pron-status').textContent = 'לחץ כדי להתחיל';
    const btn = document.getElementById('pron-mic-btn');
    btn.classList.remove('mic-recording');
    btn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
    pronIsRecording = false;
    if (pronRecognition) { try { pronRecognition.abort(); } catch(e){} pronRecognition = null; }
}

function closePronunciationModal() {
    const modal = document.getElementById('pronunciation-modal');
    modal.style.display = 'none';
    modal.classList.add('hidden');
    pronIsRecording = false;
    if (pronRecognition) { try { pronRecognition.abort(); } catch(e){} pronRecognition = null; }
}

function togglePronunciationRecording() {
    if (pronIsRecording) {
        stopPronunciationRecording();
    } else {
        startPronunciationRecording();
    }
}

function startPronunciationRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        document.getElementById('pron-status').textContent = 'הדפדפן לא תומך בזיהוי דיבור';
        return;
    }

    const chips = document.querySelectorAll('#pron-words-result .pron-word-chip');
    chips.forEach(chip => {
        chip.classList.remove('correct', 'incorrect');
        chip.classList.add('pending');
    });

    pronRecognition = new SpeechRecognition();
    pronRecognition.lang = 'es-ES';
    pronRecognition.continuous = false;
    pronRecognition.interimResults = true;
    pronRecognition.maxAlternatives = 1;

    const btn = document.getElementById('pron-mic-btn');
    btn.classList.add('mic-recording');
    btn.innerHTML = '<i class="fa-solid fa-stop"></i>';
    document.getElementById('pron-status').textContent = 'מאזין... דברו בספרדית';
    document.getElementById('pron-status').style.color = 'var(--color-text-muted)';
    pronIsRecording = true;

    pronRecognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map(r => r[0].transcript)
            .join(' ')
            .trim();
        if (event.results[0].isFinal) {
            showPronunciationResult(transcript);
        } else {
            document.getElementById('pron-status').textContent = '"' + transcript + '"';
        }
    };

    pronRecognition.onerror = (event) => {
        btn.classList.remove('mic-recording');
        btn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        pronIsRecording = false;
        const msgs = {
            'not-allowed': 'גישה למיקרופון נדחתה — אשרו הרשאה בהגדרות הדפדפן',
            'no-speech': 'לא זוהה דיבור — נסו שוב',
            'network': 'שגיאת רשת — בדקו חיבור'
        };
        document.getElementById('pron-status').textContent = msgs[event.error] || ('שגיאה: ' + event.error);
    };

    pronRecognition.onend = () => {
        btn.classList.remove('mic-recording');
        btn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        pronIsRecording = false;
    };

    pronRecognition.start();
}

function stopPronunciationRecording() {
    if (pronRecognition) {
        try { pronRecognition.stop(); } catch(e){}
    }
    pronIsRecording = false;
}

function normalizeWord(w) {
    return w.toLowerCase()
        .replace(/[¿¡.,!?;:"'()\[\]]/g, '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .trim();
}

function showPronunciationResult(transcript) {
    const sentence = document.getElementById('pron-sentence').textContent;
    const expectedWords = sentence.split(/\s+/).map(normalizeWord);
    const spokenWords = transcript.split(/\s+/).map(normalizeWord);

    let correctCount = 0;
    const chips = document.querySelectorAll('#pron-words-result .pron-word-chip');
    chips.forEach((chip, i) => {
        chip.classList.remove('pending', 'correct', 'incorrect');
        const expected = expectedWords[i];
        const found = spokenWords.some(sw => sw === expected || sw.startsWith(expected) || expected.startsWith(sw));
        if (found) {
            chip.classList.add('correct');
            correctCount++;
        } else {
            chip.classList.add('incorrect');
        }
    });

    const pct = Math.round((correctCount / expectedWords.length) * 100);
    const statusEl = document.getElementById('pron-status');
    if (pct === 100) {
        statusEl.textContent = '🎉 מושלם! הגייה מעולה';
        statusEl.style.color = 'var(--color-success)';
    } else if (pct >= 60) {
        statusEl.textContent = `👍 ${pct}% נכון — נסו שוב`;
        statusEl.style.color = 'var(--color-accent)';
    } else {
        statusEl.textContent = `🎯 ${pct}% — המשיכו להתאמן`;
        statusEl.style.color = 'var(--color-text-muted)';
    }
}

// ============================================================
// QUIZ
// ============================================================
function startQuiz(words, origin) {
    const filtered = words.filter(w => w && w.es && w.he);
    if (filtered.length < 2) {
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

// ============================================================
// PROGRESS
// ============================================================
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

// ============================================================
// ADD NEW SONG (BYOT)
// ============================================================
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

        saveSongToLocalStorage(newSong);
        if (!SONGS.find(s => s.id === songId)) {
            SONGS.push(newSong);
        }

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

// ============================================================
// AUDIO FEEDBACK — AudioContext Beep (40ms, ~880Hz)
// ============================================================
let _audioCtx = null;

function getAudioCtx() {
    if (!_audioCtx) {
        _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Safari requires resume after a user gesture
    if (_audioCtx.state === 'suspended') {
        _audioCtx.resume();
    }
    return _audioCtx;
}

function playBeep(freq = 880, durationMs = 40, volume = 0.18) {
    try {
        const ctx = getAudioCtx();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + durationMs / 1000);
    } catch (e) {
        // Silently ignore if AudioContext unavailable
    }
}

// ============================================================
// DRIVING MODE STATE
// ============================================================
const drivingState = {
    active: false,
    autoPlay: false,
    autoPlayTimer: null,
    wakeLock: null,
    touchStartX: 0,
    touchStartY: 0,
    touchStartTime: 0,
    isSwiping: false
};

// ---- Wake Lock ----
async function acquireWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            drivingState.wakeLock = await navigator.wakeLock.request('screen');
        } catch (e) {
            // Wake Lock not critical — ignore
        }
    }
}

function releaseWakeLock() {
    if (drivingState.wakeLock) {
        drivingState.wakeLock.release().catch(() => {});
        drivingState.wakeLock = null;
    }
}

// Re-acquire wake lock if page becomes visible again (iOS releases it on visibility change)
document.addEventListener('visibilitychange', () => {
    if (drivingState.active && document.visibilityState === 'visible') {
        acquireWakeLock();
    }
});

// ---- Enter / Exit ----
function enterDrivingMode() {
    const song = getSongById(state.currentSongId);
    if (!song) return;

    drivingState.active = true;

    const overlay = document.getElementById('driving-overlay');
    overlay.classList.remove('hidden');

    renderDrivingScreen();
    attachDrivingGestures();
    acquireWakeLock();

    // Unlock AudioContext on first user interaction
    getAudioCtx();
}

function exitDrivingMode() {
    drivingState.active = false;
    stopDrivingAutoPlay();
    releaseWakeLock();

    const overlay = document.getElementById('driving-overlay');
    overlay.classList.add('hidden');

    detachDrivingGestures();
}

// ---- Render ----
function renderDrivingScreen(animate = false) {
    const song = getSongById(state.currentSongId);
    if (!song) return;
    const line = song.lines[state.currentLineIndex];
    if (!line) return;

    const esEl = document.getElementById('driving-es');
    const heEl = document.getElementById('driving-he');

    if (animate) {
        esEl.classList.remove('driving-sentence-enter');
        heEl.classList.remove('driving-sentence-enter');
        // Force reflow to restart animation
        void esEl.offsetWidth;
        void heEl.offsetWidth;
        esEl.classList.add('driving-sentence-enter');
        heEl.classList.add('driving-sentence-enter');
    }

    esEl.textContent = line.spanish_text || line.es;
    heEl.textContent = line.hebrew_translation || line.he;

    document.getElementById('driving-meta').textContent =
        `${song.title} · ${state.currentLineIndex + 1} / ${song.lines.length}`;

    const pct = ((state.currentLineIndex + 1) / song.lines.length) * 100;
    document.getElementById('driving-progress-fill').style.width = pct + '%';
}

// ---- Navigation ----
function drivingNextLine() {
    const song = getSongById(state.currentSongId);
    if (!song) return;
    if (state.currentLineIndex < song.lines.length - 1) {
        updateSongProgress(state.currentSongId);
        state.currentLineIndex++;
        renderDrivingScreen(true);
        // Mirror to lesson screen for when user exits
        renderLesson();
    }
    // If at the last line, stay and do nothing (no quiz in driving mode)
}

function drivingPrevLine() {
    if (state.currentLineIndex > 0) {
        state.currentLineIndex--;
        renderDrivingScreen(true);
        renderLesson();
    }
}

// ---- Play current line (Spanish) ----
function drivingPlayCurrent() {
    const song = getSongById(state.currentSongId);
    if (!song) return;
    const line = song.lines[state.currentLineIndex];
    if (!line) return;
    
    if (state.currentAudio) {
        state.currentAudio.pause();
    }
    
    if (line.audio_es_path) {
        state.currentAudio = new Audio(line.audio_es_path);
        state.currentAudio.play();
        return state.currentAudio;
    } else if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(line.spanish_text || line.es);
        utter.lang = 'es-ES';
        utter.rate = 1;
        speechSynthesis.speak(utter);
        return utter; // return for auto-play chaining
    }
}

// ---- Touch/Gesture Handling ----
function onDrivingTouchStart(e) {
    const t = e.changedTouches[0];
    drivingState.touchStartX = t.clientX;
    drivingState.touchStartY = t.clientY;
    drivingState.touchStartTime = Date.now();
    drivingState.isSwiping = false;
}

function onDrivingTouchMove(e) {
    const t = e.changedTouches[0];
    const dx = Math.abs(t.clientX - drivingState.touchStartX);
    const dy = Math.abs(t.clientY - drivingState.touchStartY);
    if (dx > 10 || dy > 10) drivingState.isSwiping = true;
    // Prevent page scroll inside overlay
    e.preventDefault();
}

function onDrivingTouchEnd(e) {
    const t = e.changedTouches[0];
    const deltaX = t.clientX - drivingState.touchStartX;
    const deltaY = t.clientY - drivingState.touchStartY;
    const elapsed = Date.now() - drivingState.touchStartTime;
    const absDx = Math.abs(deltaX);
    const absDy = Math.abs(deltaY);

    // Horizontal swipe: deltaX threshold 50px, dominant axis
    if (absDx > 50 && absDx > absDy) {
        playBeep(880, 35, 0.15);
        flashTouchZone();
        if (deltaX < 0) {
            // Swipe left → Next
            drivingNextLine();
            if (drivingState.autoPlay) restartDrivingAutoPlay();
        } else {
            // Swipe right → Previous
            drivingPrevLine();
            if (drivingState.autoPlay) restartDrivingAutoPlay();
        }
    } else if (!drivingState.isSwiping || (absDx < 20 && absDy < 20)) {
        // Tap — play/speak current line
        playBeep(660, 30, 0.12);
        flashTouchZone();
        drivingPlayCurrent();
        if (drivingState.autoPlay) restartDrivingAutoPlay();
    }
}

function flashTouchZone() {
    const zone = document.getElementById('driving-touch-zone');
    zone.classList.remove('tap-flash');
    void zone.offsetWidth; // reflow
    zone.classList.add('tap-flash');
}

function attachDrivingGestures() {
    const zone = document.getElementById('driving-touch-zone');
    zone.addEventListener('touchstart', onDrivingTouchStart, { passive: true });
    zone.addEventListener('touchmove', onDrivingTouchMove, { passive: false });
    zone.addEventListener('touchend', onDrivingTouchEnd, { passive: true });
}

function detachDrivingGestures() {
    const zone = document.getElementById('driving-touch-zone');
    zone.removeEventListener('touchstart', onDrivingTouchStart);
    zone.removeEventListener('touchmove', onDrivingTouchMove);
    zone.removeEventListener('touchend', onDrivingTouchEnd);
}

// ============================================================
// AUTO-PLAY LOOP
// ============================================================
function toggleDrivingAutoPlay() {
    if (drivingState.autoPlay) {
        stopDrivingAutoPlay();
    } else {
        startDrivingAutoPlay();
    }
    updateAutoPlayBtn();
}

function updateAutoPlayBtn() {
    const btn = document.getElementById('driving-autoplay-btn');
    if (!btn) return;
    if (drivingState.autoPlay) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fa-solid fa-rotate fa-spin"></i> השמעה אוטומטית: פעיל';
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fa-solid fa-rotate"></i> השמעה אוטומטית: כבוי';
    }
}

function stopDrivingAutoPlay() {
    drivingState.autoPlay = false;
    if (drivingState.autoPlayTimer) {
        clearTimeout(drivingState.autoPlayTimer);
        drivingState.autoPlayTimer = null;
    }
    if (state.currentAudio) state.currentAudio.pause();
    speechSynthesis.cancel();
    updateAutoPlayBtn();
}

function startDrivingAutoPlay() {
    drivingState.autoPlay = true;
    updateAutoPlayBtn();
    runAutoPlayCycle();
}

function restartDrivingAutoPlay() {
    if (drivingState.autoPlayTimer) {
        clearTimeout(drivingState.autoPlayTimer);
        drivingState.autoPlayTimer = null;
    }
    if (state.currentAudio) state.currentAudio.pause();
    speechSynthesis.cancel();
    // Small delay before restarting loop after manual swipe
    drivingState.autoPlayTimer = setTimeout(() => {
        if (drivingState.autoPlay && drivingState.active) {
            runAutoPlayCycle();
        }
    }, 800);
}

function runAutoPlayCycle() {
    if (!drivingState.autoPlay || !drivingState.active) return;

    const song = getSongById(state.currentSongId);
    if (!song) return;
    const line = song.lines[state.currentLineIndex];
    if (!line) return;

    if (state.currentAudio) state.currentAudio.pause();
    speechSynthesis.cancel();
    
    if (line.audio_es_path && line.audio_he_path) {
        // Step 1: Play Spanish MP3
        state.currentAudio = new Audio(line.audio_es_path);
        state.currentAudio.onended = () => {
            if (!drivingState.autoPlay || !drivingState.active) return;
            // Step 2: Pause 2 seconds, then play Hebrew MP3
            drivingState.autoPlayTimer = setTimeout(() => {
                if (!drivingState.autoPlay || !drivingState.active) return;
                state.currentAudio = new Audio(line.audio_he_path);
                state.currentAudio.onended = () => {
                    if (!drivingState.autoPlay || !drivingState.active) return;
                    // Step 3: Pause 1.5 seconds, advance to next line
                    drivingState.autoPlayTimer = setTimeout(() => {
                        if (!drivingState.autoPlay || !drivingState.active) return;
                        const atEnd = state.currentLineIndex >= song.lines.length - 1;
                        if (atEnd) {
                            stopDrivingAutoPlay();
                            return;
                        }
                        playBeep(880, 35, 0.1);
                        drivingNextLine();
                        drivingState.autoPlayTimer = setTimeout(() => {
                            runAutoPlayCycle();
                        }, 300);
                    }, 1500);
                };
                state.currentAudio.play();
            }, 2000);
        };
        state.currentAudio.play();
    } else {
        // Fallback to TTS
        const esUtter = new SpeechSynthesisUtterance(line.spanish_text || line.es);
        esUtter.lang = 'es-ES';
        esUtter.rate = 0.9;
    
        esUtter.onend = () => {
            if (!drivingState.autoPlay || !drivingState.active) return;
            drivingState.autoPlayTimer = setTimeout(() => {
                if (!drivingState.autoPlay || !drivingState.active) return;
                const heUtter = new SpeechSynthesisUtterance(line.hebrew_translation || line.he);
                heUtter.lang = 'he-IL';
                heUtter.rate = 0.9;
                heUtter.onend = () => {
                    if (!drivingState.autoPlay || !drivingState.active) return;
                    drivingState.autoPlayTimer = setTimeout(() => {
                        if (!drivingState.autoPlay || !drivingState.active) return;
                        const atEnd = state.currentLineIndex >= song.lines.length - 1;
                        if (atEnd) {
                            stopDrivingAutoPlay();
                            return;
                        }
                        playBeep(880, 35, 0.1);
                        drivingNextLine();
                        drivingState.autoPlayTimer = setTimeout(() => {
                            runAutoPlayCycle();
                        }, 300);
                    }, 1500);
                };
                speechSynthesis.speak(heUtter);
            }, 2000);
        };
    
        speechSynthesis.speak(esUtter);
    }
}

// ============================================================
// PWA INSTALL & UPDATE
// ============================================================
let loadedVersion = null;
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
});

function triggerPwaInstall() {
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then((choiceResult) => {
            deferredInstallPrompt = null;
        });
    } else {
        const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIos) {
            openIosInstallModal();
        } else if (window.matchMedia('(display-mode: standalone)').matches) {
            alert('האפליקציה כבר מותקנת ופועלת במצב אפליקציה עצמאי במכשירכם!');
        } else {
            alert('להתקנת האפליקציה בטלפון: פתחו את תפריט הדפדפן (3 נקודות) ולחצו "הוסף למסך הבית" / "התקן אפליקציה".');
        }
    }
}

function openIosInstallModal() {
    const modal = document.getElementById('ios-install-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
    }
}

function closeIosInstallModal() {
    const modal = document.getElementById('ios-install-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    }
}

// ---- Passive update check (background) ----
function checkForUpdate() {
    if (!loadedVersion) return;
    fetch('version.json?t=' + Date.now(), { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } })
        .then(r => r.json())
        .then(data => {
            if (data.version !== loadedVersion) {
                document.getElementById('update-banner').classList.remove('hidden');
            }
        })
        .catch(() => {});
}

// ---- Manual "Check for Updates" — full FORCE_UPDATE flow ----
async function checkForUpdateManual() {
    const btn = document.getElementById('check-update-btn');
    const result = document.getElementById('check-update-result');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin ml-1"></i> בודק...';
    result.classList.add('hidden');

    try {
        const res = await fetch('version.json?t=' + Date.now(), {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
        });
        const data = await res.json();

        if (!loadedVersion || data.version !== loadedVersion) {
            result.innerHTML = `<span style="color:var(--color-accent)">🆕 גרסה ${data.version} זמינה — מנקה מטמון ומרענן...</span>`;
            result.classList.remove('hidden');

            // 1. Tell the SW to wipe all caches and skipWaiting
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage('FORCE_UPDATE');
            }

            // 2. Also wipe from the page side for safety
            if ('caches' in window) {
                await caches.keys().then(names =>
                    Promise.all(names.map(name => caches.delete(name)))
                );
            }

            // 3. Hard reload after a short delay
            setTimeout(() => location.reload(true), 1400);
        } else {
            result.innerHTML = `<span style="color:var(--color-success)">✓ אתם מעודכנים (v${data.version})</span>`;
            result.classList.remove('hidden');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-arrows-rotate ml-1"></i> בדוק עדכון';
        }
    } catch {
        result.innerHTML = `<span style="color:var(--color-danger)">שגיאת רשת — נסו שוב</span>`;
        result.classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-arrows-rotate ml-1"></i> בדוק עדכון';
    }
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();

    // Load songs (seed + user-added) before rendering
    await initSongs();

    renderLevelSelector('level-selector');
    renderLevelSelector('settings-level-selector');
    renderHome();

    // Check PWA standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
        const sub = document.getElementById('pwa-install-sub');
        const btn = document.getElementById('pwa-install-btn');
        if (sub) sub.textContent = 'האפליקציה מותקנת ופעילה במכשירך ✓';
        if (btn) {
            btn.textContent = 'מותקן';
            btn.disabled = true;
            btn.style.opacity = '0.7';
        }
    }

    // Load version info
    fetch('version.json?t=' + Date.now(), { cache: 'no-store' })
        .then(r => r.json())
        .then(data => {
            loadedVersion = data.version;
            document.getElementById('app-version').textContent = 'v' + data.version;
            document.getElementById('settings-version').textContent = 'v' + data.version;
            document.getElementById('settings-build').textContent =
                'build: ' + new Date(data.buildDate).toLocaleDateString('he-IL');
        })
        .catch(() => {});

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').then(reg => {
            console.log('SW Registered v2.0.0:', reg.scope);
        }).catch(err => console.log('SW Reg failed:', err));
    }

    // Passive update polling
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate();
    });
    setInterval(checkForUpdate, 5 * 60 * 1000);
});
