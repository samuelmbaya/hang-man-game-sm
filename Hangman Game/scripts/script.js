// Consolidated DOM elements for UI access.
// Groups all key HTML element references in one object to minimize querySelector calls and improve code organization.
const elements = {
  wordDisplay: document.querySelector(".word-display"), // Holds the letter blanks/revealed word as <li> list.
  guessesText: document.querySelector(".guesses-text b"), // Displays wrong guesses count (e.g., "0 / 6").
  keyboardDiv: document.querySelector(".keyboard"), // Container for dynamically created letter buttons.
  hangmanImage: document.querySelector(".hangman-box img"), // Updates to show progressive hangman drawings.
  gameModal: document.querySelector(".game-modal"), // Popup for win/loss messages and restart.
  playAgainBtn: document.querySelector(".game-modal button"), // Button to start a new game.
  hintText: document.querySelector(".hint-text b") // Shows the hint for the current word.
};

// Sound elements for feedback.
// References to HTML <audio> elements by ID for quick access during events.
const sounds = {
  win: document.getElementById("win-sound"), // Plays on victory.
  lose: document.getElementById("lose-sound"), // Plays on defeat.
  correct: document.getElementById("correct-sound"), // Plays on right letter guess.
  wrong: document.getElementById("wrong-sound") // Plays on wrong letter guess.
};

// Play a specific sound (reset and play).
// Utility to handle individual sound playback: pauses, resets, and plays to ensure clean audio.
const playSound = (type) => {
  const sound = sounds[type];
  sound.pause(); sound.currentTime = 0; sound.play(); // Chain for brevity: stop, reset, start.
};

// Stop all sounds.
// Silences every audio element to prevent overlap, e.g., before restarting.
const stopSounds = () => Object.values(sounds).forEach(s => { s.pause(); s.currentTime = 0; }); // Iterates object values (sounds) and resets each.

// Game state.
// Global variables for tracking word, guesses, and errors; initialized empty.
let currentWord = '', correctLetters = [], wrongGuessCount = 0; // currentWord: secret uppercase string; correctLetters: array of guessed letters; wrongGuessCount: error tally.
const maxGuesses = 6; // Hard limit for wrong guesses before loss.

// Select random word, set hint, and reset state/UI in one go.
// Combines word selection, hint update, and full game reset for a single new round.
const getRandomWord = () => {
  const { word, hint } = wordList[Math.floor(Math.random() * wordList.length)]; // Picks random {word, hint} from global wordList.
  currentWord = word.toUpperCase(); // Normalizes to uppercase.
  elements.hintText.innerText = hint; // Updates UI hint.
  correctLetters = []; wrongGuessCount = 0; // Clears tracking arrays/counters.
  elements.hangmanImage.src = "images/hangman-0.svg"; // Resets to empty hangman.
  elements.guessesText.innerText = `0 / ${maxGuesses}`; // Shows fresh guess count.
  elements.wordDisplay.innerHTML = currentWord.split('').map(() => `<li class="letter"></li>`).join(''); // Rebuilds blank slots.
  elements.keyboardDiv.querySelectorAll('button').forEach(btn => btn.disabled = false); // Reactivates buttons.
  elements.gameModal.classList.remove('show'); // Hides end modal.
};

// End game: sound + delayed modal.
// Triggers audio and shows outcome modal after brief pause for sound.
const gameOver = (isVictory) => {
  playSound(isVictory ? 'win' : 'lose'); // Plays win or lose sound based on result.
  setTimeout(() => { // 400ms delay lets sound finish before UI popup.
    const key = isVictory ? 'victory' : 'lost', title = isVictory ? 'Congrats!' : 'Game Over!', text = isVictory ? 'You found the word:' : 'The correct word was:'; // Ternary vars for dynamic content.
    elements.gameModal.querySelector('img').src = `images/${key}.gif`; // Sets celebratory or sad GIF.
    elements.gameModal.querySelector('h4').innerText = title; // Modal heading.
    elements.gameModal.querySelector('p').innerHTML = `${text} <b>${currentWord}</b>`; // Message with bold word reveal.
    elements.gameModal.classList.add('show'); // Displays modal.
  }, 400);
};

// Handle guess: update UI, check win/loss.
// Core logic for processing a letter: reveals matches, advances errors, or ends game.
const initGame = (button, letter) => {
  letter = letter.toUpperCase(); button.disabled = true; // Normalize and lock button.
  if (currentWord.includes(letter)) { // Correct guess path.
    playSound('correct'); // Audio cue.
    [...currentWord].forEach((l, i) => l === letter && (elements.wordDisplay.querySelectorAll('li')[i].innerText = l, elements.wordDisplay.querySelectorAll('li')[i].classList.add('guessed'))); // Reveal all instances in one chained loop (comma operator for brevity).
    correctLetters.push(letter); // Tracks guess (array allows duplicates, but win check uses unique count).
  } else { // Wrong guess path.
    playSound('wrong'); wrongGuessCount++; elements.hangmanImage.src = `images/hangman-${wrongGuessCount}.svg`; // Audio, increment, update image.
  }
  elements.guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`; // Refreshes counter.
  if (wrongGuessCount === maxGuesses) return gameOver(false); // Loss: max errors.
  if (correctLetters.length === new Set(currentWord).size) return gameOver(true); // Win: guessed letters match unique word letters count.
};

// Build on-screen keyboard.
// Generates A-Z buttons once on load, with click handlers.
for (let i = 97; i <= 122; i++) { // ASCII loop for lowercase a-z.
  const btn = document.createElement('button'), letter = String.fromCharCode(i).toUpperCase(); // Create and label button.
  btn.innerText = letter; elements.keyboardDiv.appendChild(btn); // Add to DOM.
  btn.addEventListener('click', () => initGame(btn, letter)); // Binds guess handler.
}

// Physical keyboard support.
// Listens for key presses to simulate button clicks.
document.addEventListener('keydown', e => { // Global event listener.
  const letter = e.key.toUpperCase(); // Normalize.
  if (letter >= 'A' && letter <= 'Z') { // Letter validation.
    const btn = [...elements.keyboardDiv.querySelectorAll('button')].find(b => b.innerText === letter); // Locate matching button.
    btn && !btn.disabled && initGame(btn, letter); // Conditional trigger if valid.
  }
});

// Restart on play again.
// Binds modal button to full reset.
elements.playAgainBtn.addEventListener('click', () => { stopSounds(); getRandomWord(); }); // Stop audio, new round.

// Init first game.
// Starts the game immediately on script load.
getRandomWord(); // Selects initial word and setup.