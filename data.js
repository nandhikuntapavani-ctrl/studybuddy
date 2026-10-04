/**
 * StudyBuddy Default Initial Data & Storage Management
 */

const DEFAULT_DECKS = [
  {
    id: "deck_web_dev",
    title: "Web Development Essentials",
    description: "Core concepts of modern HTML, CSS, JavaScript, and Web APIs.",
    color: "#6366f1",
    cards: [
      {
        id: "c1",
        front: "What is a Closure in JavaScript?",
        back: "A function bundled together with references to its surrounding lexical environment, allowing an inner function to access an outer function's scope even after the outer function has returned.",
        tag: "JavaScript",
        mastered: false
      },
      {
        id: "c2",
        front: "What is the difference between CSS Flexbox and CSS Grid?",
        back: "Flexbox is designed for one-dimensional layouts (a row OR a column), whereas CSS Grid is designed for two-dimensional layouts (rows AND columns simultaneously).",
        tag: "CSS",
        mastered: false
      },
      {
        id: "c3",
        front: "What does the 'Event Loop' do in JavaScript?",
        back: "It continuously monitors the Call Stack and the Callback/Microtask Queues. If the stack is empty, it pushes the first task from the queue onto the call stack to execute.",
        tag: "JavaScript",
        mastered: false
      },
      {
        id: "c4",
        front: "What is the purpose of semantic HTML tags?",
        back: "Tags like <header>, <nav>, <main>, and <article> provide meaningful structure to web documents, significantly improving SEO, accessibility (screen readers), and code readability.",
        tag: "HTML",
        mastered: false
      },
      {
        id: "c5",
        front: "What is the difference between LocalStorage and SessionStorage?",
        back: "LocalStorage persists data indefinitely across browser sessions and tabs, whereas SessionStorage clears data as soon as the tab or window is closed.",
        tag: "Web APIs",
        mastered: false
      },
      {
        id: "c6",
        front: "What is Debouncing vs Throttling?",
        back: "Debouncing postpones function execution until a specified delay has passed since the last event (e.g. search input). Throttling guarantees execution at most once per defined time window (e.g. scroll events).",
        tag: "Performance",
        mastered: false
      }
    ]
  },
  {
    id: "deck_study_hacks",
    title: "High-Performance Learning Science",
    description: "Proven cognitive science methods to retain information 3x faster.",
    color: "#10b981",
    cards: [
      {
        id: "s1",
        front: "What is Active Recall?",
        back: "The practice of stimulating memory during the learning process by testing yourself or retrieving knowledge from your brain rather than passively re-reading notes.",
        tag: "Memory",
        mastered: false
      },
      {
        id: "s2",
        front: "How does Spaced Repetition work?",
        back: "It spaces out reviews of learned material at systematically increasing intervals to counteract the Ebbinghaus forgetting curve.",
        tag: "Technique",
        mastered: false
      },
      {
        id: "s3",
        front: "What is the Feynman Technique?",
        back: "A 4-step learning method: 1) Choose concept, 2) Explain it in plain, simple terms as if to a 10-year-old, 3) Identify knowledge gaps, 4) Review and simplify.",
        tag: "Understanding",
        mastered: false
      },
      {
        id: "s4",
        front: "What is the Pomodoro Technique?",
        back: "A time-management method that breaks work into intervals (typically 25 minutes of intense focus) separated by short breaks (5 minutes) to sustain mental clarity.",
        tag: "Productivity",
        mastered: false
      },
      {
        id: "s5",
        front: "What is Interleaving in study sessions?",
        back: "Mixing different topics, problem types, or subjects during a single study block rather than blocking/focusing on just one topic, fostering deeper problem-solving agility.",
        tag: "Technique",
        mastered: false
      }
    ]
  },
  {
    id: "deck_science_trivia",
    title: "General Science & Trivia",
    description: "Quick facts and fundamental science concepts for active minds.",
    color: "#f59e0b",
    cards: [
      {
        id: "t1",
        front: "What is the powerhouse of the cell?",
        back: "The Mitochondria, responsible for producing adenosine triphosphate (ATP), the primary energy currency of the cell.",
        tag: "Biology",
        mastered: false
      },
      {
        id: "t2",
        front: "What is the speed of light in a vacuum?",
        back: "Approximately 299,792,458 meters per second (about 300,000 km/s or 186,000 miles per second).",
        tag: "Physics",
        mastered: false
      },
      {
        id: "t3",
        front: "What gas do plants absorb during photosynthesis?",
        back: "Carbon Dioxide (CO2), which they convert along with water and sunlight into glucose and oxygen.",
        tag: "Botany",
        mastered: false
      },
      {
        id: "t4",
        front: "What is the most abundant gas in Earth's atmosphere?",
        back: "Nitrogen, making up approximately 78% of the atmosphere (Oxygen is second at about 21%).",
        tag: "Earth Science",
        mastered: false
      }
    ]
  }
];

const DEFAULT_QUIZZES = [
  {
    id: "quiz_study_mastery",
    title: "Cognitive Science & Study Mastery Quiz",
    description: "Test your understanding of high-efficiency study techniques and habit formation.",
    deckSourceId: null,
    questions: [
      {
        question: "Which of the following has been proven most effective for long-term retention?",
        options: [
          "Re-reading high-lighted textbook sections",
          "Active recall through flashcards and self-testing",
          "Cramming 6 hours the night before the exam",
          "Copying verbatim summaries repeatedly"
        ],
        correctIndex: 1,
        explanation: "Cognitive science shows active recall forces your neural pathways to strengthen retrieval pathways, whereas re-reading creates an illusion of competence."
      },
      {
        question: "In the classic Pomodoro Technique, how long is the standard focus session?",
        options: [
          "15 minutes",
          "25 minutes",
          "45 minutes",
          "60 minutes"
        ],
        correctIndex: 1,
        explanation: "Francesco Cirillo defined the standard Pomodoro session as 25 minutes of unbroken focus followed by a 5-minute restorative break."
      },
      {
        question: "What is the key insight behind the 'Feynman Technique'?",
        options: [
          "If you cannot explain something simply, you don't understand it well enough",
          "Study in total darkness with classical music",
          "Always study with at least 5 peers in a group",
          "Memorize dictionary definitions word-for-word"
        ],
        correctIndex: 0,
        explanation: "Nobel laureate Richard Feynman advocated teaching complex concepts in plain, jargon-free language to rapidly diagnose gaps in understanding."
      },
      {
        question: "What does the Ebbinghaus Forgetting Curve demonstrate?",
        options: [
          "We remember 100% of learned facts forever",
          "Information is forgotten exponentially quickly unless actively reinforced over spaced intervals",
          "Only visual learners retain concepts",
          "Memory capacity is completely fixed at birth"
        ],
        correctIndex: 1,
        explanation: "Hermann Ebbinghaus discovered memory retention halves within days without active review; spaced repetition counters this drop."
      },
      {
        question: "What is 'Interleaving' in studying?",
        options: [
          "Taking 3-hour naps between reading paragraphs",
          "Mixing related topics or problem types instead of massing one type in a single block",
          "Writing notes with alternating ink colors",
          "Only studying when listening to podcasts"
        ],
        correctIndex: 1,
        explanation: "Interleaving trains your brain to differentiate between problem categories and choose appropriate strategies on the fly."
      }
    ]
  }
];

const DEFAULT_SETTINGS = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundAlert: "tibetan",
  volume: 75,
  theme: "dark-indigo",
  ambientVolume: 50
};

const DEFAULT_STATS = {
  totalFocusMinutes: 0,
  completedPomodoros: 0,
  cardsMastered: 0,
  quizzesTaken: 0,
  streakDays: 1,
  lastStudyDate: new Date().toISOString().split('T')[0]
};

class StorageManager {
  static getDecks() {
    const data = localStorage.getItem('studybuddy_decks');
    if (!data) {
      this.saveDecks(DEFAULT_DECKS);
      return DEFAULT_DECKS;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_DECKS;
    }
  }

  static saveDecks(decks) {
    localStorage.setItem('studybuddy_decks', JSON.stringify(decks));
  }

  static getQuizzes() {
    const data = localStorage.getItem('studybuddy_quizzes');
    if (!data) {
      this.saveQuizzes(DEFAULT_QUIZZES);
      return DEFAULT_QUIZZES;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_QUIZZES;
    }
  }

  static saveQuizzes(quizzes) {
    localStorage.setItem('studybuddy_quizzes', JSON.stringify(quizzes));
  }

  static getSettings() {
    const data = localStorage.getItem('studybuddy_settings');
    if (!data) {
      this.saveSettings(DEFAULT_SETTINGS);
      return { ...DEFAULT_SETTINGS };
    }
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch (e) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  static saveSettings(settings) {
    localStorage.setItem('studybuddy_settings', JSON.stringify(settings));
  }

  static getStats() {
    const data = localStorage.getItem('studybuddy_stats');
    if (!data) {
      this.saveStats(DEFAULT_STATS);
      return { ...DEFAULT_STATS };
    }
    try {
      const stats = { ...DEFAULT_STATS, ...JSON.parse(data) };
      // Check streak
      const today = new Date().toISOString().split('T')[0];
      if (stats.lastStudyDate !== today) {
        const last = new Date(stats.lastStudyDate);
        const curr = new Date(today);
        const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          stats.streakDays += 1;
        } else if (diffDays > 1) {
          stats.streakDays = 1;
        }
        stats.lastStudyDate = today;
        this.saveStats(stats);
      }
      return stats;
    } catch (e) {
      return { ...DEFAULT_STATS };
    }
  }

  static saveStats(stats) {
    localStorage.setItem('studybuddy_stats', JSON.stringify(stats));
  }

  static resetToDefaults() {
    localStorage.removeItem('studybuddy_decks');
    localStorage.removeItem('studybuddy_quizzes');
    localStorage.removeItem('studybuddy_settings');
    localStorage.removeItem('studybuddy_stats');
    this.saveDecks(DEFAULT_DECKS);
    this.saveQuizzes(DEFAULT_QUIZZES);
    this.saveSettings(DEFAULT_SETTINGS);
    this.saveStats(DEFAULT_STATS);
  }
}

window.StorageManager = StorageManager;
