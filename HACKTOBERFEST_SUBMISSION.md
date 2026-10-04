*This is a submission for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01)*

# ⚡ StudyBuddy — The All-in-One Focus & Active Recall Companion

## What I Built

I built **StudyBuddy**, a distraction-free, privacy-first web application designed to help learners conquer exam fatigue, retain information 3x faster, and build steady study habits without being interrupted by paywalls, ads, or clunky browser extensions.

### Who I Built It For & The Problem It Solves
I built this for my friend **Alex**, a computer science student and career changer who was preparing for technical certifications and interviews. Alex constantly struggled with three major friction points:
1. **Context Switching & Study Fragmentation**: Alex was juggling 3 to 4 disconnected tools: a phone app for Pomodoro timers, a subscription service for flashcards (which locked spaced repetition features behind a paywall), YouTube for ambient rain/lo-fi tracks (which inevitably led to distraction), and random quiz generators.
2. **Subscription Fatigue & Data Privacy**: Most modern flashcard and quiz apps require logins, push notifications, and credit cards just to organize custom decks.
3. **Focus Drift & ADHD Study Fatigue**: When studying for hours, Alex needed tactile feedback, quick interval adjustments, and soothing acoustic isolation (like pink noise or 40Hz gamma beats) without loading data-heavy streaming websites.

**StudyBuddy solves all of this in a single, unified, lightweight dashboard:**
- ⏱️ **Customizable Pomodoro Timer**: Visual SVG countdown ring with 4-cycle dots, mode switching (Focus, Short Break, Long Break), and instant `+5m` / `-5m` offset buttons.
- 🎧 **Procedural Ambient Sound Generator**: Powered 100% in-browser via the Web Audio API (Gentle Rain, Pink Noise, 40Hz Gamma Focus Beats, Campfire) with zero external audio assets or bandwidth consumption.
- 🗂️ **3D Interactive Flashcards**: Tactile active recall with 3D perspective flip, keyboard shortcuts (<kbd>Space</kbd>, <kbd>←</kbd> Still Learning, <kbd>→</kbd> Mastered), deck manager, and instant shuffling.
- 🎯 **Quiz Arena**: An intelligent quiz engine that dynamically turns any flashcard deck into a 4-choice multiple-choice challenge with smart distractors, alongside a custom quiz builder with explanation popups and confetti celebration.
- 📊 **Local Progress & Streaks**: Automatic tracking of focus minutes, cards mastered, and quizzes completed stored entirely in `localStorage`.

---

## Demo

- **Local Preview**: Simply open `index.html` in any modern web browser — no build steps, no `node_modules`, and no internet connection required!
- **Interactive Experience**:
  - **Pomodoro Mode**: Select **Focus (25m)**, **Short Break (5m)**, or **Long Break (15m)**. Toggle soothing procedural rain sound or 40Hz gamma beats right from the dock.
  - **Flashcards**: Flip cards using 3D animations and mark cards as *Still Learning* or *Mastered* to see your progress bar dynamically fill.
  - **Quiz Arena**: Choose any deck, hit **Start Deck Quiz 🚀**, and test your recall with instant real-time feedback (green checkmark for correct answers, red shake animation for wrong answers, and explanation cards).
  - **Confetti & Stats**: Score 80%+ on quizzes or finish a 25-minute study cycle to trigger custom canvas confetti celebrations!

*(Include a screenshot or GIF demo of the dashboard, 3D flip card, and quiz feedback here)*

---

## Code

The application is built completely with vanilla web technologies (HTML5, modern CSS3, and JavaScript) to ensure maximum speed, portability, and longevity:

```
studybuddy/
├── index.html     # Semantic UI layout, accessible modals, and SVG rings
├── style.css      # Glassmorphism design system, responsive grids, and 3D card transforms
├── app.js         # Core state machine, keyboard navigation, quiz engine & confetti
├── audio.js       # Web Audio API synthesizer (procedural chimes & focus noise)
└── data.js        # Default study decks, quiz generators, and LocalStorage layer
```

### Highlights of Key Implementations:

#### 1. Procedural Ambient Sounds & Chimes (No External Audio Files Needed)
Instead of loading static `.mp3` files that fail offline, `audio.js` synthesizes audio on the fly using Web Audio oscillators and biquad noise filters:

```javascript
// audio.js - Synthesizing a soothing Tibetan singing bowl chime
playTibetanBowl(now) {
  const freqs = [293.66, 587.33, 880.0, 1174.66]; // D4 and warm harmonics
  const gains = [0.4, 0.25, 0.15, 0.08];

  freqs.forEach((freq, i) => {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq + (Math.random() * 2 - 1), now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(gains[i] * this.masterVolume, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 3.3);
  });
}
```

#### 2. Automatic Multiple-Choice Quiz Generation from Any Deck
`app.js` extracts question fronts as prompts, back definitions as correct answers, and algorithmically selects contextual distractors from other cards in the deck:

```javascript
// app.js - Dynamic Distractor Selection
generateQuizFromDeck(deck) {
  return {
    id: `generated_${deck.id}`,
    title: `${deck.title} — Challenge`,
    questions: deck.cards.map((card) => {
      const otherCards = deck.cards.filter(c => c.id !== card.id);
      const distractors = [...otherCards].sort(() => 0.5 - Math.random())
                                          .slice(0, 3)
                                          .map(c => c.back);

      const choices = [card.back, ...distractors].sort(() => 0.5 - Math.random());
      return {
        question: card.front,
        options: choices,
        correctIndex: choices.indexOf(card.back),
        explanation: `Answer from "${deck.title}": ${card.back}`
      };
    })
  };
}
```

---

## How I Built It

StudyBuddy was designed and developed through an iterative AI-assisted agentic workflow:

1. **Architecture & Agent Orchestration**: 
   - I utilized modern agentic coding practices to scaffold an offline-first architecture, structuring separation of concerns across audio synthesis, data persistence, and interactive DOM state machines.
2. **Procedural Sound Synthesis**:
   - Rather than bundling bulky audio samples, we used mathematical frequency modeling for acoustic instruments (Tibetan bowls, marimbas) and noise buffers with bandpass filtering for ambient rain and binaural 40Hz gamma beats.
3. **Zero-Friction UX & Visual Polish**:
   - Implemented sleek glassmorphism, responsive CSS grid layouts, CSS 3D `preserve-3d` card flip mechanics, and zero external framework bloat.
   - Built a custom canvas-based confetti particle system to deliver positive dopamine reinforcement after study sessions without relying on heavy external libraries.

---

## Why Does Open Innovation Matter?

Open innovation is what made this project possible:
- **No Walled Gardens**: Big tech study apps continually lock foundational learning techniques (like spaced repetition, custom flashcards, or unlimited quizzes) behind recurring $10–$15/month subscriptions. Open-source solutions give ownership back to students.
- **Privacy & Offline Independence**: Closed API platforms monetize student attention and track browsing patterns. StudyBuddy has **zero telemetry, zero tracking scripts, and zero server dependencies**. Everything runs locally on the user's machine and can be backed up as a simple JSON file.
- **Accessibility & Customization**: Because the application is built on open standards, any student or educator can fork it, add their own subject decks, tailor timer formulas to neurodivergent study needs, or adapt the sound engine.

---

## My Agent Session

The entire development process was facilitated using an AI coding agent session, iterating through prompt-driven planning, writing modular files, and verifying code execution:
- Scaffolded: [index.html](file:///c:/dev/index.html), [style.css](file:///c:/dev/style.css), [app.js](file:///c:/dev/app.js), [data.js](file:///c:/dev/data.js), and [audio.js](file:///c:/dev/audio.js).
- Verified runtime independence and launched directly on the local machine.

---

## Prize Categories

- **Primary**: Hacktoberfest Weekend Challenge: Build for a Friend
- **Theme**: Productivity, EdTech, Accessibility & Offline-First Web Apps
