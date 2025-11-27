// DOM elements: shortcuts for UI parts
const el = {
  wordDisplay: document.querySelector(".word-display"), // Shows word as blanks or letters
  guessesText: document.querySelector(".guesses-text b"), // Shows wrong guesses count
  keyboardDiv: document.querySelector(".keyboard"), // Holds on-screen buttons
  hangmanImage: document.querySelector(".hangman-box img"), // Shows hangman drawing stages
  gameModal: document.querySelector(".game-modal"), // Win/loss popup
  playAgainBtn: document.querySelector(".game-modal button"), // Restart button
  hintText: document.querySelector(".hint-text b") // Shows word hint
};

// Sounds: audio files for game events
const s = {
  win: document.getElementById("win-sound"), // Win sound
  lose: document.getElementById("lose-sound"), // Lose sound
  correct: document.getElementById("correct-sound"), // Correct guess sound
  wrong: document.getElementById("wrong-sound") // Wrong guess sound
};

// Play sound: starts a sound fresh
const playSound = (type) => {
  const sound = s[type];
  sound.pause(); sound.currentTime = 0; sound.play(); // Stop, reset, play
};

// Stop all sounds: quiets everything
const stopSounds = () => Object.values(s).forEach(sound => {
  sound.pause(); sound.currentTime = 0; // Pause and reset each sound
});

// State: tracks game info
let currentWord = '', correctLetters = [], wrongGuessCount = 0; // Word, correct guesses, wrong count
const maxGuesses = 6; // Max wrong guesses allowed

// New game: picks word and resets everything
const getRandomWord = () => {
  const { word, hint } = wordList[Math.floor(Math.random() * wordList.length)]; // Pick random word/hint
  currentWord = word.toUpperCase(); // Make uppercase
  el.hintText.innerText = hint; // Show hint
  correctLetters = []; wrongGuessCount = 0; // Clear trackers
  el.hangmanImage.src = "images/hangman-0.svg"; // Empty hangman
  el.guessesText.innerText = `0 / ${maxGuesses}`; // Reset count
  el.wordDisplay.innerHTML = currentWord.split('').map(() => `<li class="letter"></li>`).join(''); // Make blanks
  el.keyboardDiv.querySelectorAll('button').forEach(btn => btn.disabled = false); // Enable buttons
  el.gameModal.classList.remove('show'); // Hide popup
};

// Game over: plays sound and shows end screen
const gameOver = (isVictory) => {
  playSound(isVictory ? 'win' : 'lose'); // Play win or lose sound
  setTimeout(() => { // Wait 400ms
    const key = isVictory ? 'victory' : 'lost', // Image name
          title = isVictory ? 'Congrats!' : 'Game Over!', // Title
          text = isVictory ? 'You found the word:' : 'The correct word was:'; // Message
    el.gameModal.querySelector('img').src = `images/${key}.gif`; // Set image
    el.gameModal.querySelector('h4').innerText = title; // Set title
    el.gameModal.querySelector('p').innerHTML = `${text} <b>${currentWord}</b>`; // Set text with word
    el.gameModal.classList.add('show'); // Show popup
  }, 400);
};

// Guess handler: checks letter and updates game
const initGame = (button, letter) => {
  letter = letter.toUpperCase(); button.disabled = true; // Uppercase and disable button
  if (currentWord.includes(letter)) { // If correct
    playSound('correct'); // Play sound
    [...currentWord].forEach((l, i) => { // Check each position
      if (l === letter) { // If match
        const li = el.wordDisplay.querySelectorAll('li')[i];
        li.innerText = l; li.classList.add('guessed'); // Show letter and style
      }
    });
    correctLetters.push(letter); // Add to guessed list
  } else { // If wrong
    playSound('wrong'); wrongGuessCount++; // Play sound, add error
    el.hangmanImage.src = `images/hangman-${wrongGuessCount}.svg`; // Next hangman stage
  }
  el.guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`; // Update count
  if (wrongGuessCount === maxGuesses) return gameOver(false); // Lose if max errors
  if (correctLetters.length === new Set(currentWord).size) return gameOver(true); // Win if all unique letters guessed
};

// Keyboard buttons: creates A-Z buttons
for (let i = 97; i <= 122; i++) { // Loop for a-z codes
  const button = document.createElement('button'), // New button
        letter = String.fromCharCode(i).toUpperCase(); // Get letter
  button.innerText = letter; // Set text
  el.keyboardDiv.appendChild(button); // Add to page
  button.addEventListener('click', () => initGame(button, letter)); // On click, guess
}

// Keydown listener: handles keyboard input
document.addEventListener('keydown', e => { // Listen for keys
  const letter = e.key.toUpperCase(); // Uppercase key
  if (letter >= 'A' && letter <= 'Z') { // If letter
    const button = [...el.keyboardDiv.querySelectorAll('button')].find(b => b.innerText === letter); // Find button
    if (button && !button.disabled) initGame(button, letter); // Guess if button ok
  }
});

// Play again: restarts on button click
el.playAgainBtn.addEventListener('click', () => { // On click
  stopSounds(); getRandomWord(); // Stop sounds, new game
});

// Start: begins first game
getRandomWord(); // Run new game