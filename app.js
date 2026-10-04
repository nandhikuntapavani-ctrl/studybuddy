/**
 * StudyBuddy Application Controller
 * Handles Pomodoro Clock, 3D Flashcards, Quiz Arena, Procedural Ambient Audio, and Data Storage.
 */

// --- Canvas Confetti Celebration Engine ---
class ConfettiCannon {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire(particleCount = 100) {
    if (!this.canvas) return;
    const colors = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#38bdf8'];
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2 + 50,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        decay: Math.random() * 0.015 + 0.008
      });
    }
    if (!this.animationId) {
      this.animate();
    }
  }

  animate() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rotation += p.rotationSpeed;
      p.opacity -= p.decay;

      if (p.opacity <= 0 || p.y > this.canvas.height + 20) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.animationId = null;
    }
  }
}

// --- App State & Core Controller ---
class StudyBuddyApp {
  constructor() {
    this.decks = StorageManager.getDecks();
    this.quizzes = StorageManager.getQuizzes();
    this.settings = StorageManager.getSettings();
    this.stats = StorageManager.getStats();

    this.confetti = new ConfettiCannon('confetti-canvas');
    this.activeTab = 'pomodoro';

    // Pomodoro State
    this.timerMode = 'focus'; // 'focus', 'shortBreak', 'longBreak'
    this.timerSecondsRemaining = this.settings.focusTime * 60;
    this.timerTotalSeconds = this.settings.focusTime * 60;
    this.timerInterval = null;
    this.timerIsRunning = false;
    this.pomodoroCyclesCompleted = 0;

    // Flashcards State
    this.activeDeckId = this.decks.length > 0 ? this.decks[0].id : null;
    this.activeCardIndex = 0;
    this.isCardFlipped = false;
    this.flashcardViewMode = 'study'; // 'study' or 'editor'

    // Quiz State
    this.activeQuiz = null;
    this.quizQuestionIndex = 0;
    this.quizScore = 0;
    this.quizUserAnswers = [];
    this.quizIsAnswered = false;

    this.init();
  }

  init() {
    this.applyTheme(this.settings.theme);
    this.updateStreakDisplay();
    this.initNavigation();
    this.initPomodoro();
    this.initFlashcards();
    this.initQuizHub();
    this.initStats();
    this.initSettings();
    this.initGlobalShortcuts();
  }

  // --- Global Toast Notification ---
  showToast(message, icon = '✨') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // --- Theme Manager ---
  applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    this.settings.theme = theme;
    StorageManager.saveSettings(this.settings);
    const select = document.getElementById('setting-theme-select');
    if (select) select.value = theme;
  }

  cycleTheme() {
    const themes = ['dark-indigo', 'cyber', 'sunset', 'light'];
    const current = document.body.getAttribute('data-theme') || 'dark-indigo';
    const nextIdx = (themes.indexOf(current) + 1) % themes.length;
    this.applyTheme(themes[nextIdx]);
    this.showToast(`Theme switched to ${themes[nextIdx]}`, '🎨');
  }

  // --- Streak Tracker ---
  updateStreakDisplay() {
    const streakCountEl = document.getElementById('streak-count');
    if (streakCountEl) {
      streakCountEl.textContent = this.stats.streakDays || 1;
    }
  }

  // --- Tab Navigation ---
  initNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const panels = {
      pomodoro: document.getElementById('panel-pomodoro'),
      flashcards: document.getElementById('panel-flashcards'),
      quiz: document.getElementById('panel-quiz'),
      stats: document.getElementById('panel-stats')
    };

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.activeTab = tab;

        tabBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        Object.keys(panels).forEach(key => {
          if (panels[key]) {
            panels[key].classList.toggle('active', key === tab);
          }
        });

        if (tab === 'stats') {
          this.renderStatsView();
        } else if (tab === 'flashcards') {
          this.renderFlashcardDeck();
        }
      });
    });

    // Theme button
    document.getElementById('theme-btn')?.addEventListener('click', () => this.cycleTheme());
  }


  // ========================================================
  // MODULE 1: POMODORO CLOCK & AMBIENT AUDIO
  // ========================================================
  initPomodoro() {
    // Mode Buttons
    const modeBtns = document.querySelectorAll('.mode-btn');
    modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        this.switchPomodoroMode(mode);
      });
    });

    // Toggle (Start / Pause) Button
    document.getElementById('timer-toggle-btn')?.addEventListener('click', () => {
      this.togglePomodoro();
    });

    // Reset Button
    document.getElementById('timer-reset-btn')?.addEventListener('click', () => {
      this.resetPomodoro();
      this.showToast('Timer reset', '🔄');
    });

    // Skip Button
    document.getElementById('timer-skip-btn')?.addEventListener('click', () => {
      this.skipPomodoroMode();
    });

    // Quick Minute Offsets
    document.getElementById('adjust-plus-5')?.addEventListener('click', () => {
      this.adjustTimerMinutes(5);
    });
    document.getElementById('adjust-minus-5')?.addEventListener('click', () => {
      this.adjustTimerMinutes(-5);
    });

    // Ambient Sound Generator Chips
    const ambientChips = document.querySelectorAll('.ambient-chip');
    ambientChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const ambientType = chip.dataset.ambient;
        if (chip.classList.contains('active')) {
          chip.classList.remove('active');
          window.soundEngine.stopAmbient();
          this.showToast('Ambient sound stopped', '🔇');
        } else {
          ambientChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          window.soundEngine.startAmbient(ambientType);
          this.showToast(`Playing ${chip.innerText.trim()}`, '🎧');
        }
      });
    });

    // Ambient Volume Slider
    const ambientSlider = document.getElementById('ambient-vol-slider');
    if (ambientSlider) {
      ambientSlider.value = this.settings.ambientVolume;
      window.soundEngine.setAmbientVolume(this.settings.ambientVolume / 100);
      ambientSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.settings.ambientVolume = val;
        StorageManager.saveSettings(this.settings);
        window.soundEngine.setAmbientVolume(val / 100);
      });
    }

    // Task completion check
    const taskCheck = document.getElementById('task-completed-check');
    const taskInput = document.getElementById('focus-task-input');
    taskCheck?.addEventListener('change', () => {
      if (taskCheck.checked) {
        taskInput.style.textDecoration = 'line-through';
        taskInput.style.opacity = '0.6';
        this.confetti.fire(40);
        this.showToast('Session task completed! 🎉', '✅');
      } else {
        taskInput.style.textDecoration = 'none';
        taskInput.style.opacity = '1';
      }
    });

    this.updateTimerDisplay();
  }

  getModeDuration(mode) {
    if (mode === 'focus') return this.settings.focusTime * 60;
    if (mode === 'shortBreak') return this.settings.shortBreakTime * 60;
    if (mode === 'longBreak') return this.settings.longBreakTime * 60;
    return 25 * 60;
  }

  switchPomodoroMode(mode) {
    this.timerMode = mode;
    this.pausePomodoro();

    // Update active class on mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    const label = document.getElementById('timer-mode-label');
    const ring = document.getElementById('timer-progress-ring');
    if (mode === 'focus') {
      label.textContent = 'FOCUS TIME';
      if (ring) ring.style.stroke = 'var(--accent-primary)';
    } else if (mode === 'shortBreak') {
      label.textContent = 'SHORT BREAK';
      if (ring) ring.style.stroke = 'var(--color-success)';
    } else if (mode === 'longBreak') {
      label.textContent = 'LONG BREAK';
      if (ring) ring.style.stroke = 'var(--color-info)';
    }

    this.timerTotalSeconds = this.getModeDuration(mode);
    this.timerSecondsRemaining = this.timerTotalSeconds;
    this.updateTimerDisplay();
  }

  adjustTimerMinutes(diffMinutes) {
    const diffSeconds = diffMinutes * 60;
    this.timerSecondsRemaining = Math.max(60, this.timerSecondsRemaining + diffSeconds);
    this.timerTotalSeconds = Math.max(this.timerSecondsRemaining, this.timerTotalSeconds + diffSeconds);
    this.updateTimerDisplay();
  }

  togglePomodoro() {
    if (this.timerIsRunning) {
      this.pausePomodoro();
    } else {
      this.startPomodoro();
    }
  }

  startPomodoro() {
    this.timerIsRunning = true;
    const digits = document.getElementById('timer-display');
    if (digits) digits.classList.add('ticking');

    const toggleText = document.getElementById('timer-toggle-text');
    const toggleIcon = document.getElementById('play-pause-icon');
    if (toggleText) toggleText.textContent = 'Pause';
    if (toggleIcon) {
      toggleIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>`;
    }

    this.timerInterval = setInterval(() => {
      if (this.timerSecondsRemaining > 0) {
        this.timerSecondsRemaining--;
        this.updateTimerDisplay();

        // Increment focus minutes in stats once every 60 seconds if in focus mode
        if (this.timerMode === 'focus' && this.timerSecondsRemaining % 60 === 0) {
          this.stats.totalFocusMinutes++;
          StorageManager.saveStats(this.stats);
        }
      } else {
        this.onPomodoroComplete();
      }
    }, 1000);
  }

  pausePomodoro() {
    this.timerIsRunning = false;
    clearInterval(this.timerInterval);
    const digits = document.getElementById('timer-display');
    if (digits) digits.classList.remove('ticking');

    const toggleText = document.getElementById('timer-toggle-text');
    const toggleIcon = document.getElementById('play-pause-icon');
    if (toggleText) {
      toggleText.textContent = this.timerMode === 'focus' ? 'Start Focus' : 'Start Break';
    }
    if (toggleIcon) {
      toggleIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;
    }
  }

  resetPomodoro() {
    this.pausePomodoro();
    this.timerSecondsRemaining = this.getModeDuration(this.timerMode);
    this.timerTotalSeconds = this.timerSecondsRemaining;
    this.updateTimerDisplay();
  }

  skipPomodoroMode() {
    this.pausePomodoro();
    if (this.timerMode === 'focus') {
      this.pomodoroCyclesCompleted = (this.pomodoroCyclesCompleted + 1) % 4;
      this.updateCycleDots();
      if (this.pomodoroCyclesCompleted === 0) {
        this.switchPomodoroMode('longBreak');
      } else {
        this.switchPomodoroMode('shortBreak');
      }
    } else {
      this.switchPomodoroMode('focus');
    }
    this.showToast('Skipped to next session', '⏭️');
  }

  onPomodoroComplete() {
    this.pausePomodoro();
    // Play alert sound
    window.soundEngine.playNotification(this.settings.soundAlert || 'tibetan');

    if (this.timerMode === 'focus') {
      this.pomodoroCyclesCompleted = (this.pomodoroCyclesCompleted + 1) % 4;
      this.stats.completedPomodoros++;
      StorageManager.saveStats(this.stats);
      this.updateCycleDots();

      this.confetti.fire(70);
      this.showToast('Pomodoro session completed! Time for a well-earned break.', '🎉');

      if (this.pomodoroCyclesCompleted === 0) {
        this.switchPomodoroMode('longBreak');
      } else {
        this.switchPomodoroMode('shortBreak');
      }
    } else {
      this.showToast('Break finished! Ready to dive back in?', '🔔');
      this.switchPomodoroMode('focus');
    }
  }

  updateTimerDisplay() {
    const mins = Math.floor(this.timerSecondsRemaining / 60);
    const secs = this.timerSecondsRemaining % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const display = document.getElementById('timer-display');
    if (display) display.textContent = formatted;
    document.title = `(${formatted}) StudyBuddy — Focus`;

    // SVG Circular Ring Progress
    const ring = document.getElementById('timer-progress-ring');
    if (ring && this.timerTotalSeconds > 0) {
      const radius = 125;
      const circumference = 2 * Math.PI * radius; // ~785.4
      const fraction = this.timerSecondsRemaining / this.timerTotalSeconds;
      const offset = circumference - (fraction * circumference);
      ring.style.strokeDashoffset = offset;
    }
  }

  updateCycleDots() {
    const dots = document.querySelectorAll('.cycle-dot');
    dots.forEach((dot, idx) => {
      dot.classList.remove('filled', 'current');
      if (idx < this.pomodoroCyclesCompleted) {
        dot.classList.add('filled');
      } else if (idx === this.pomodoroCyclesCompleted) {
        dot.classList.add('current');
      }
    });
  }


  // ========================================================
  // MODULE 2: 3D FLASHCARDS & DECK MANAGEMENT
  // ========================================================
  initFlashcards() {
    this.renderDeckSelector();

    // 3D Card Click or Space to flip
    const cardEl = document.getElementById('flashcard-element');
    cardEl?.addEventListener('click', () => this.toggleCardFlip());

    // Manual Flip Button
    document.getElementById('card-manual-flip-btn')?.addEventListener('click', () => this.toggleCardFlip());

    // Rating Buttons
    document.getElementById('card-rate-learning-btn')?.addEventListener('click', () => {
      this.rateActiveCard(false);
    });

    document.getElementById('card-rate-mastered-btn')?.addEventListener('click', () => {
      this.rateActiveCard(true);
    });

    // Prev / Next Navigation
    document.getElementById('card-prev-btn')?.addEventListener('click', () => this.prevCard());
    document.getElementById('card-next-btn')?.addEventListener('click', () => this.nextCard());

    // Reset Deck Mastery Status
    document.getElementById('card-reset-status-btn')?.addEventListener('click', () => {
      const deck = this.getCurrentDeck();
      if (!deck) return;
      deck.cards.forEach(c => c.mastered = false);
      StorageManager.saveDecks(this.decks);
      this.renderFlashcardDeck();
      this.showToast('Deck mastery status reset', '🔄');
    });

    // Shuffle Button
    document.getElementById('shuffle-deck-btn')?.addEventListener('click', () => {
      const deck = this.getCurrentDeck();
      if (!deck || deck.cards.length <= 1) return;
      // Fisher-Yates Shuffle
      for (let i = deck.cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck.cards[i], deck.cards[j]] = [deck.cards[j], deck.cards[i]];
      }
      this.activeCardIndex = 0;
      this.renderFlashcardDeck();
      this.showToast('Deck shuffled!', '🔀');
    });

    // View Mode Toggle (Study vs Manage)
    document.getElementById('fc-view-study-btn')?.addEventListener('click', () => {
      this.switchFlashcardView('study');
    });
    document.getElementById('fc-view-editor-btn')?.addEventListener('click', () => {
      this.switchFlashcardView('editor');
    });

    // Deck Selector change
    document.getElementById('deck-selector')?.addEventListener('change', (e) => {
      this.activeDeckId = e.target.value;
      this.activeCardIndex = 0;
      this.renderFlashcardDeck();
    });

    // Delete Deck Button
    document.getElementById('delete-deck-btn')?.addEventListener('click', () => {
      if (this.decks.length <= 1) {
        this.showToast('You must keep at least one deck!', '⚠️');
        return;
      }
      if (confirm('Are you sure you want to delete this deck and all its cards?')) {
        this.decks = this.decks.filter(d => d.id !== this.activeDeckId);
        this.activeDeckId = this.decks[0].id;
        this.activeCardIndex = 0;
        StorageManager.saveDecks(this.decks);
        this.renderDeckSelector();
        this.renderFlashcardDeck();
        this.showToast('Deck deleted', '🗑️');
      }
    });

    // New Deck Modal triggers
    document.getElementById('open-new-deck-modal-btn')?.addEventListener('click', () => {
      document.getElementById('new-deck-modal')?.classList.add('active');
    });
    document.getElementById('close-deck-modal-btn')?.addEventListener('click', () => {
      document.getElementById('new-deck-modal')?.classList.remove('active');
    });
    document.getElementById('cancel-deck-modal-btn')?.addEventListener('click', () => {
      document.getElementById('new-deck-modal')?.classList.remove('active');
    });
    document.getElementById('new-deck-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('deck-name-input').value.trim();
      const desc = document.getElementById('deck-desc-input').value.trim();
      if (!title) return;

      const newDeck = {
        id: `deck_${Date.now()}`,
        title,
        description: desc || 'Custom study deck',
        color: '#6366f1',
        cards: []
      };

      this.decks.push(newDeck);
      this.activeDeckId = newDeck.id;
      this.activeCardIndex = 0;
      StorageManager.saveDecks(this.decks);
      this.renderDeckSelector();
      this.switchFlashcardView('editor'); // open editor to add cards!
      document.getElementById('new-deck-modal')?.classList.remove('active');
      document.getElementById('new-deck-form').reset();
      this.showToast(`Deck "${title}" created! Add your first card.`, '🎉');
    });

    // Add Card Form Submission
    document.getElementById('add-card-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const front = document.getElementById('new-card-front').value.trim();
      const back = document.getElementById('new-card-back').value.trim();
      const tag = document.getElementById('new-card-tag').value.trim() || 'General';

      const deck = this.getCurrentDeck();
      if (!deck) return;

      const newCard = {
        id: `card_${Date.now()}`,
        front,
        back,
        tag,
        mastered: false
      };

      deck.cards.push(newCard);
      StorageManager.saveDecks(this.decks);
      document.getElementById('add-card-form').reset();
      this.renderCardsEditorList();
      this.showToast('Card added to deck!', '➕');
    });

    // Card search filter
    document.getElementById('card-search-input')?.addEventListener('input', (e) => {
      this.renderCardsEditorList(e.target.value.toLowerCase());
    });

    this.renderFlashcardDeck();
  }

  getCurrentDeck() {
    return this.decks.find(d => d.id === this.activeDeckId) || this.decks[0];
  }

  renderDeckSelector() {
    const selector = document.getElementById('deck-selector');
    const quizDeckPicker = document.getElementById('quiz-deck-picker');
    if (!selector) return;

    selector.innerHTML = '';
    if (quizDeckPicker) quizDeckPicker.innerHTML = '';

    this.decks.forEach(deck => {
      const opt = document.createElement('option');
      opt.value = deck.id;
      opt.textContent = `${deck.title} (${deck.cards.length} cards)`;
      if (deck.id === this.activeDeckId) opt.selected = true;
      selector.appendChild(opt);

      if (quizDeckPicker) {
        const qOpt = opt.cloneNode(true);
        quizDeckPicker.appendChild(qOpt);
      }
    });
  }

  switchFlashcardView(mode) {
    this.flashcardViewMode = mode;
    const studyContainer = document.getElementById('fc-study-mode-container');
    const editorContainer = document.getElementById('fc-editor-mode-container');
    const studyBtn = document.getElementById('fc-view-study-btn');
    const editorBtn = document.getElementById('fc-view-editor-btn');

    if (mode === 'study') {
      studyContainer.style.display = 'block';
      editorContainer.classList.remove('active');
      studyBtn.classList.add('active');
      editorBtn.classList.remove('active');
      this.renderFlashcardDeck();
    } else {
      studyContainer.style.display = 'none';
      editorContainer.classList.add('active');
      studyBtn.classList.remove('active');
      editorBtn.classList.add('active');
      this.renderCardsEditorList();
    }
  }

  renderFlashcardDeck() {
    const deck = this.getCurrentDeck();
    if (!deck) return;

    // Reset flip state
    this.isCardFlipped = false;
    const cardEl = document.getElementById('flashcard-element');
    cardEl?.classList.remove('is-flipped');

    // Handle empty deck
    if (deck.cards.length === 0) {
      document.getElementById('card-front-text').textContent = 'This deck is currently empty.';
      document.getElementById('card-back-text').textContent = 'Switch to the "Manage" tab above to add cards!';
      document.getElementById('card-front-tag').textContent = 'EMPTY';
      document.getElementById('card-index-indicator').textContent = '0 of 0';
      document.getElementById('card-mastery-status').textContent = '';
      document.getElementById('deck-progress-summary').textContent = '0 cards (0% Mastered)';
      document.getElementById('deck-progress-fill').style.width = '0%';
      return;
    }

    if (this.activeCardIndex >= deck.cards.length) {
      this.activeCardIndex = 0;
    }

    const card = deck.cards[this.activeCardIndex];
    document.getElementById('card-front-text').textContent = card.front;
    document.getElementById('card-back-text').textContent = card.back;
    document.getElementById('card-front-tag').textContent = card.tag || 'QUESTION';
    document.getElementById('card-index-indicator').textContent = `Card ${this.activeCardIndex + 1} of ${deck.cards.length}`;

    const masteryStatus = document.getElementById('card-mastery-status');
    if (card.mastered) {
      masteryStatus.textContent = '🟢 Mastered';
      masteryStatus.style.color = '#34d399';
    } else {
      masteryStatus.textContent = '⚪ Still Learning';
      masteryStatus.style.color = 'var(--text-muted)';
    }

    // Progress bar
    const masteredCount = deck.cards.filter(c => c.mastered).length;
    const percent = Math.round((masteredCount / deck.cards.length) * 100);
    document.getElementById('deck-progress-summary').textContent = `Card ${this.activeCardIndex + 1}/${deck.cards.length} • ${percent}% Mastered`;
    document.getElementById('deck-progress-fill').style.width = `${percent}%`;
  }

  toggleCardFlip() {
    const cardEl = document.getElementById('flashcard-element');
    this.isCardFlipped = !this.isCardFlipped;
    cardEl?.classList.toggle('is-flipped', this.isCardFlipped);
    window.soundEngine.playCardFlip();
  }

  rateActiveCard(isMastered) {
    const deck = this.getCurrentDeck();
    if (!deck || deck.cards.length === 0) return;

    const card = deck.cards[this.activeCardIndex];
    if (isMastered && !card.mastered) {
      this.stats.cardsMastered++;
      StorageManager.saveStats(this.stats);
      window.soundEngine.playSuccess();
    } else {
      window.soundEngine.playCardFlip();
    }

    card.mastered = isMastered;
    StorageManager.saveDecks(this.decks);

    // Auto advance to next card after rating
    this.nextCard();
  }

  nextCard() {
    const deck = this.getCurrentDeck();
    if (!deck || deck.cards.length === 0) return;
    this.activeCardIndex = (this.activeCardIndex + 1) % deck.cards.length;
    this.renderFlashcardDeck();
  }

  prevCard() {
    const deck = this.getCurrentDeck();
    if (!deck || deck.cards.length === 0) return;
    this.activeCardIndex = (this.activeCardIndex - 1 + deck.cards.length) % deck.cards.length;
    this.renderFlashcardDeck();
  }

  renderCardsEditorList(query = '') {
    const deck = this.getCurrentDeck();
    const listContainer = document.getElementById('cards-editor-list');
    const titleEl = document.getElementById('editor-deck-title');
    if (!deck || !listContainer) return;

    if (titleEl) titleEl.textContent = deck.title;
    listContainer.innerHTML = '';

    const filtered = deck.cards.filter(c => 
      c.front.toLowerCase().includes(query) || 
      c.back.toLowerCase().includes(query) || 
      (c.tag && c.tag.toLowerCase().includes(query))
    );

    if (filtered.length === 0) {
      listContainer.innerHTML = `<div style="text-align:center; padding:1.5rem; color:var(--text-muted);">No cards found. Add one above!</div>`;
      return;
    }

    filtered.forEach((card) => {
      const row = document.createElement('div');
      row.className = 'card-item-row';
      row.innerHTML = `
        <div class="card-item-info">
          <div class="card-item-q">${this.escapeHtml(card.front)}</div>
          <div class="card-item-a">${this.escapeHtml(card.back)}</div>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:0.75rem; background:rgba(255,255,255,0.06); padding:0.2rem 0.5rem; border-radius:999px;">${card.tag || 'General'}</span>
          <button class="card-item-delete" title="Delete card" data-card-id="${card.id}">🗑️</button>
        </div>
      `;

      row.querySelector('.card-item-delete').addEventListener('click', () => {
        deck.cards = deck.cards.filter(c => c.id !== card.id);
        StorageManager.saveDecks(this.decks);
        this.renderCardsEditorList(query);
        this.renderDeckSelector();
        this.showToast('Card deleted', '🗑️');
      });

      listContainer.appendChild(row);
    });
  }


  // ========================================================
  // MODULE 3: QUIZ ARENA (DYNAMIC & CUSTOM)
  // ========================================================
  initQuizHub() {
    // Option 1: Instant Flashcard Quiz
    document.getElementById('start-flashcard-quiz-btn')?.addEventListener('click', () => {
      const picker = document.getElementById('quiz-deck-picker');
      const deckId = picker ? picker.value : this.activeDeckId;
      const deck = this.decks.find(d => d.id === deckId) || this.decks[0];

      if (!deck || deck.cards.length < 2) {
        this.showToast('Please add at least 2 cards to this deck to generate a quiz!', '⚠️');
        return;
      }

      const generatedQuiz = this.generateQuizFromDeck(deck);
      this.launchQuiz(generatedQuiz);
    });

    // Option 2: Prebuilt Cognitive Science Quiz
    document.getElementById('start-mastery-quiz-btn')?.addEventListener('click', () => {
      const masteryQuiz = this.quizzes[0];
      if (masteryQuiz) {
        this.launchQuiz(masteryQuiz);
      }
    });

    // Option 3: Custom Quiz Builder Modal
    document.getElementById('open-quiz-builder-modal-btn')?.addEventListener('click', () => {
      document.getElementById('quiz-builder-modal')?.classList.add('active');
    });
    document.getElementById('close-quiz-builder-btn')?.addEventListener('click', () => {
      document.getElementById('quiz-builder-modal')?.classList.remove('active');
    });
    document.getElementById('cancel-quiz-builder-btn')?.addEventListener('click', () => {
      document.getElementById('quiz-builder-modal')?.classList.remove('active');
    });

    document.getElementById('custom-quiz-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('custom-quiz-title').value.trim();
      const qText = document.getElementById('q-text').value.trim();
      const opt0 = document.getElementById('q-opt-0').value.trim();
      const opt1 = document.getElementById('q-opt-1').value.trim();
      const opt2 = document.getElementById('q-opt-2').value.trim();
      const opt3 = document.getElementById('q-opt-3').value.trim();
      const explanation = document.getElementById('q-explanation').value.trim() || 'Well done!';
      
      const correctRadios = document.querySelectorAll('input[name="correct-opt"]');
      let correctIndex = 0;
      correctRadios.forEach((r, idx) => {
        if (r.checked) correctIndex = idx;
      });

      const newQuiz = {
        id: `custom_quiz_${Date.now()}`,
        title,
        description: 'User-created custom test',
        deckSourceId: null,
        questions: [
          {
            question: qText,
            options: [opt0, opt1, opt2, opt3],
            correctIndex,
            explanation
          }
        ]
      };

      this.quizzes.push(newQuiz);
      StorageManager.saveQuizzes(this.quizzes);
      document.getElementById('quiz-builder-modal')?.classList.remove('active');
      document.getElementById('custom-quiz-form').reset();
      this.showToast(`Quiz "${title}" created! Starting now...`, '🎉');
      this.launchQuiz(newQuiz);
    });

    // Quiz Player Navigation & Results
    document.getElementById('quiz-next-btn')?.addEventListener('click', () => {
      this.nextQuizQuestion();
    });

    document.getElementById('quiz-quit-btn')?.addEventListener('click', () => {
      if (confirm('Exit current quiz and return to Quiz Arena?')) {
        this.returnToQuizHub();
      }
    });

    document.getElementById('results-back-hub-btn')?.addEventListener('click', () => {
      this.returnToQuizHub();
    });

    document.getElementById('results-retake-btn')?.addEventListener('click', () => {
      if (this.activeQuiz) {
        this.launchQuiz(this.activeQuiz);
      }
    });
  }

  // Generates multiple choice distractors using other flashcards
  generateQuizFromDeck(deck) {
    const questions = [];
    const cards = [...deck.cards];

    cards.forEach((card) => {
      // Correct answer is card.back
      const correctAnswer = card.back;

      // Select up to 3 distractors from other cards in the deck
      const otherCards = cards.filter(c => c.id !== card.id);
      const shuffledOthers = [...otherCards].sort(() => 0.5 - Math.random());
      const distractorAnswers = shuffledOthers.slice(0, 3).map(c => c.back);

      // If we don't have enough other cards in this deck, grab from other decks
      if (distractorAnswers.length < 3) {
        this.decks.forEach(otherDeck => {
          if (distractorAnswers.length < 3 && otherDeck.id !== deck.id) {
            otherDeck.cards.forEach(oc => {
              if (distractorAnswers.length < 3 && oc.back !== correctAnswer && !distractorAnswers.includes(oc.back)) {
                distractorAnswers.push(oc.back);
              }
            });
          }
        });
      }

      // Assemble all choices & shuffle
      const choices = [correctAnswer, ...distractorAnswers];
      choices.sort(() => 0.5 - Math.random());
      const correctIdx = choices.indexOf(correctAnswer);

      questions.push({
        question: card.front,
        options: choices,
        correctIndex: correctIdx,
        explanation: `Answer from "${deck.title}": ${card.back}`
      });
    });

    return {
      id: `generated_${deck.id}`,
      title: `${deck.title} — Challenge`,
      questions: questions.sort(() => 0.5 - Math.random()).slice(0, 10) // up to 10 questions
    };
  }

  launchQuiz(quiz) {
    this.activeQuiz = quiz;
    this.quizQuestionIndex = 0;
    this.quizScore = 0;
    this.quizUserAnswers = [];
    this.quizIsAnswered = false;

    // View Switching
    document.getElementById('quiz-hub-view').style.display = 'none';
    document.getElementById('quiz-results-view').classList.remove('active');
    document.getElementById('quiz-player-view').classList.add('active');

    this.renderCurrentQuestion();
  }

  renderCurrentQuestion() {
    if (!this.activeQuiz || this.quizQuestionIndex >= this.activeQuiz.questions.length) {
      this.showQuizResults();
      return;
    }

    this.quizIsAnswered = false;
    const q = this.activeQuiz.questions[this.quizQuestionIndex];
    const totalQ = this.activeQuiz.questions.length;

    // Status counters
    document.getElementById('quiz-question-number').textContent = `Question ${this.quizQuestionIndex + 1} of ${totalQ}`;
    document.getElementById('quiz-live-score').textContent = `Score: ${this.quizScore} / ${this.quizQuestionIndex}`;
    
    // Progress fill
    const percent = Math.round(((this.quizQuestionIndex + 1) / totalQ) * 100);
    document.getElementById('quiz-progress-fill').style.width = `${percent}%`;

    // Question Prompt
    document.getElementById('quiz-active-question').textContent = q.question;

    // Reset explanation & Next button
    const expBox = document.getElementById('quiz-explanation-box');
    expBox.classList.remove('active');
    const nextBtn = document.getElementById('quiz-next-btn');
    nextBtn.style.display = 'none';

    // Render Options
    const grid = document.getElementById('quiz-options-grid');
    grid.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    q.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn';
      btn.innerHTML = `
        <span class="opt-prefix">${letters[idx] || (idx + 1)}</span>
        <span>${this.escapeHtml(optText)}</span>
      `;
      btn.addEventListener('click', () => this.handleOptionSelection(idx));
      grid.appendChild(btn);
    });
  }

  handleOptionSelection(selectedIndex) {
    if (this.quizIsAnswered) return;
    this.quizIsAnswered = true;

    const q = this.activeQuiz.questions[this.quizQuestionIndex];
    const optButtons = document.querySelectorAll('.quiz-opt-btn');
    const isCorrect = selectedIndex === q.correctIndex;

    if (isCorrect) {
      this.quizScore++;
      window.soundEngine.playSuccess();
    } else {
      window.soundEngine.playError();
    }

    this.quizUserAnswers.push({
      question: q.question,
      selectedAnswer: q.options[selectedIndex],
      correctAnswer: q.options[q.correctIndex],
      isCorrect,
      explanation: q.explanation
    });

    // Visual styles for options
    optButtons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correctIndex) {
        btn.classList.add('correct');
      } else if (idx === selectedIndex && !isCorrect) {
        btn.classList.add('wrong');
      }
    });

    // Show Explanation
    const expBox = document.getElementById('quiz-explanation-box');
    const expText = document.getElementById('quiz-explanation-text');
    expText.textContent = q.explanation || 'No explanation provided.';
    expBox.classList.add('active');

    // Show Next Button
    const nextBtn = document.getElementById('quiz-next-btn');
    const isLast = this.quizQuestionIndex === this.activeQuiz.questions.length - 1;
    nextBtn.textContent = isLast ? 'Finish Quiz 🏁' : 'Next Question ➡️';
    nextBtn.style.display = 'block';

    // Update live score display
    document.getElementById('quiz-live-score').textContent = `Score: ${this.quizScore} / ${this.quizQuestionIndex + 1}`;
  }

  nextQuizQuestion() {
    this.quizQuestionIndex++;
    this.renderCurrentQuestion();
  }

  showQuizResults() {
    document.getElementById('quiz-player-view').classList.remove('active');
    const resultsView = document.getElementById('quiz-results-view');
    resultsView.classList.add('active');

    const total = this.activeQuiz.questions.length;
    const percentage = Math.round((this.quizScore / total) * 100);

    document.getElementById('results-score-percentage').textContent = `${percentage}%`;

    const headline = document.getElementById('results-headline');
    const subtitle = document.getElementById('results-subtitle');

    if (percentage >= 80) {
      headline.textContent = 'Mastery Achieved! 🏆';
      subtitle.textContent = `Brilliant performance! You mastered ${this.quizScore} out of ${total} questions.`;
      this.confetti.fire(120);
    } else if (percentage >= 50) {
      headline.textContent = 'Great Effort! ⭐';
      subtitle.textContent = `Solid work! You scored ${this.quizScore} out of ${total}. Review missed items below to reinforce your memory.`;
      this.confetti.fire(50);
    } else {
      headline.textContent = 'Keep Practicing! 💡';
      subtitle.textContent = `You scored ${this.quizScore} out of ${total}. Active recall takes repetition — review the cards and try again!`;
    }

    // Populate review list
    const reviewList = document.getElementById('results-review-list');
    reviewList.innerHTML = '';

    this.quizUserAnswers.forEach((ans, idx) => {
      const item = document.createElement('div');
      item.className = `review-item ${ans.isCorrect ? 'was-correct' : ''}`;
      item.innerHTML = `
        <div style="font-weight:600; color:var(--text-primary); margin-bottom:0.25rem;">
          ${idx + 1}. ${this.escapeHtml(ans.question)}
        </div>
        <div style="font-size:0.8rem; color:${ans.isCorrect ? '#34d399' : '#f87171'};">
          Your Answer: ${this.escapeHtml(ans.selectedAnswer)} ${ans.isCorrect ? '✅' : '❌'}
        </div>
        ${!ans.isCorrect ? `<div style="font-size:0.8rem; color:var(--text-secondary);">Correct: ${this.escapeHtml(ans.correctAnswer)}</div>` : ''}
      `;
      reviewList.appendChild(item);
    });

    // Update global user stats
    this.stats.quizzesTaken++;
    StorageManager.saveStats(this.stats);
  }

  returnToQuizHub() {
    document.getElementById('quiz-player-view').classList.remove('active');
    document.getElementById('quiz-results-view').classList.remove('active');
    document.getElementById('quiz-hub-view').style.display = 'block';
  }


  // ========================================================
  // MODULE 4: STATS VIEW
  // ========================================================
  initStats() {
    this.renderStatsView();
  }

  renderStatsView() {
    this.stats = StorageManager.getStats();
    document.getElementById('stats-total-minutes').textContent = this.stats.totalFocusMinutes;
    document.getElementById('stats-total-pomodoros').textContent = this.stats.completedPomodoros;
    document.getElementById('stats-cards-mastered').textContent = this.stats.cardsMastered;
    document.getElementById('stats-quizzes-taken').textContent = this.stats.quizzesTaken;
    this.updateStreakDisplay();
  }


  // ========================================================
  // MODULE 5: SETTINGS & BACKUP/RESTORE
  // ========================================================
  initSettings() {
    // Open & Close
    const modal = document.getElementById('settings-modal');
    document.getElementById('open-settings-btn')?.addEventListener('click', () => {
      this.populateSettingsForm();
      modal?.classList.add('active');
    });
    document.getElementById('close-settings-btn')?.addEventListener('click', () => {
      modal?.classList.remove('active');
    });

    // Form inputs change handlers
    document.getElementById('setting-focus-time')?.addEventListener('change', (e) => {
      this.settings.focusTime = parseInt(e.target.value, 10) || 25;
      StorageManager.saveSettings(this.settings);
      if (this.timerMode === 'focus' && !this.timerIsRunning) {
        this.resetPomodoro();
      }
    });

    document.getElementById('setting-short-break')?.addEventListener('change', (e) => {
      this.settings.shortBreakTime = parseInt(e.target.value, 10) || 5;
      StorageManager.saveSettings(this.settings);
      if (this.timerMode === 'shortBreak' && !this.timerIsRunning) {
        this.resetPomodoro();
      }
    });

    document.getElementById('setting-long-break')?.addEventListener('change', (e) => {
      this.settings.longBreakTime = parseInt(e.target.value, 10) || 15;
      StorageManager.saveSettings(this.settings);
      if (this.timerMode === 'longBreak' && !this.timerIsRunning) {
        this.resetPomodoro();
      }
    });

    document.getElementById('setting-sound-tone')?.addEventListener('change', (e) => {
      this.settings.soundAlert = e.target.value;
      StorageManager.saveSettings(this.settings);
      window.soundEngine.playNotification(this.settings.soundAlert);
    });

    document.getElementById('setting-volume-slider')?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.settings.volume = val;
      StorageManager.saveSettings(this.settings);
      window.soundEngine.setMasterVolume(val / 100);
    });

    document.getElementById('setting-theme-select')?.addEventListener('change', (e) => {
      this.applyTheme(e.target.value);
    });

    // Export JSON
    document.getElementById('export-data-btn')?.addEventListener('click', () => {
      const backupData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        decks: this.decks,
        quizzes: this.quizzes,
        settings: this.settings,
        stats: this.stats
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `StudyBuddy_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('Data exported successfully!', '⬇️');
    });

    // Import JSON
    const fileInput = document.getElementById('import-file-input');
    document.getElementById('import-data-btn')?.addEventListener('click', () => {
      fileInput?.click();
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported.decks) {
            StorageManager.saveDecks(imported.decks);
            this.decks = imported.decks;
          }
          if (imported.quizzes) {
            StorageManager.saveQuizzes(imported.quizzes);
            this.quizzes = imported.quizzes;
          }
          if (imported.settings) {
            StorageManager.saveSettings(imported.settings);
            this.settings = imported.settings;
          }
          if (imported.stats) {
            StorageManager.saveStats(imported.stats);
            this.stats = imported.stats;
          }

          this.renderDeckSelector();
          this.renderFlashcardDeck();
          this.applyTheme(this.settings.theme);
          this.showToast('Backup restored successfully!', '✅');
          modal?.classList.remove('active');
        } catch (err) {
          alert('Invalid backup JSON file.');
        }
      };
      reader.readAsText(file);
    });

    // Reset Defaults
    document.getElementById('reset-defaults-btn')?.addEventListener('click', () => {
      if (confirm('Restore default sample decks and reset settings? This will reset your custom cards.')) {
        StorageManager.resetToDefaults();
        this.decks = StorageManager.getDecks();
        this.quizzes = StorageManager.getQuizzes();
        this.settings = StorageManager.getSettings();
        this.stats = StorageManager.getStats();

        this.activeDeckId = this.decks[0].id;
        this.activeCardIndex = 0;
        this.renderDeckSelector();
        this.renderFlashcardDeck();
        this.renderStatsView();
        this.populateSettingsForm();
        this.applyTheme(this.settings.theme);
        this.showToast('Default data restored', '🔄');
      }
    });
  }

  populateSettingsForm() {
    document.getElementById('setting-focus-time').value = this.settings.focusTime;
    document.getElementById('setting-short-break').value = this.settings.shortBreakTime;
    document.getElementById('setting-long-break').value = this.settings.longBreakTime;
    document.getElementById('setting-sound-tone').value = this.settings.soundAlert;
    document.getElementById('setting-volume-slider').value = this.settings.volume;
    document.getElementById('setting-theme-select').value = this.settings.theme;
  }

  // --- Keyboard Shortcuts ---
  initGlobalShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignore if user is currently typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      // Spacebar
      if (e.code === 'Space') {
        e.preventDefault();
        if (this.activeTab === 'flashcards' && this.flashcardViewMode === 'study') {
          this.toggleCardFlip();
        } else if (this.activeTab === 'pomodoro') {
          this.togglePomodoro();
        }
      }

      // Arrow Left / Arrow Right for Flashcards
      if (this.activeTab === 'flashcards' && this.flashcardViewMode === 'study') {
        if (e.code === 'ArrowLeft') {
          e.preventDefault();
          this.rateActiveCard(false); // Still Learning
        } else if (e.code === 'ArrowRight') {
          e.preventDefault();
          this.rateActiveCard(true); // Mastered
        }
      }
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Bootstrap Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.studyBuddy = new StudyBuddyApp();
});
