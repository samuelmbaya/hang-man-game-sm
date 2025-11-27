const wordDisplay = document.querySelector(".word-display");
const guessesText = document.querySelector(".guesses-text b");
const keyboardDiv = document.querySelector(".keyboard");
const hangmanImage = document.querySelector(".hangman-box img");
const gameModal = document.querySelector(".game-modal");
const playAgainBtn = gameModal.querySelector("button");

// === Sound Effects ===
const winSound = document.getElementById("win-sound");
const loseSound = document.getElementById("lose-sound");
const correctSound = document.getElementById("correct-sound");
const wrongSound = document.getElementById("wrong-sound");

function playSound(sound) {
  sound.pause();
  sound.currentTime = 0;
  sound.play();
}

// Initializing game variables
let currentWord, correctLetters, wrongGuessCount;
const maxGuesses = 6;

// Reset game state
const resetGame = () => {
  correctLetters = new Set();
  wrongGuessCount = 0;
  hangmanImage.src = "images/hangman-0.svg";
  guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`;
  wordDisplay.innerHTML = currentWord.split("").map(() => `<li class="letter"></li>`).join("");
  keyboardDiv.querySelectorAll("button").forEach(btn => btn.disabled = false);
  gameModal.classList.remove("show");
};

// Stop all sounds immediately
const stopAllSounds = () => {
  [winSound, loseSound, correctSound, wrongSound].forEach(sound => {
    sound.pause();
    sound.currentTime = 0;
  });
};

// Get a random word from wordList
const getRandomWord = () => {
  const { word, hint } = wordList[Math.floor(Math.random() * wordList.length)];
  currentWord = word.toUpperCase();
  document.querySelector(".hint-text b").innerText = hint;
  resetGame();
};

// Handle game over
const gameOver = (isVictory) => {
  if (isVictory) playSound(winSound);
  else playSound(loseSound);

  setTimeout(() => {
    const modalText = isVictory ? `You found the word:` : 'The correct word was:';
    gameModal.querySelector("img").src = `images/${isVictory ? 'victory' : 'lost'}.gif`;
    gameModal.querySelector("h4").innerText = isVictory ? 'Congrats!' : 'Game Over!';
    gameModal.querySelector("p").innerHTML = `${modalText} <b>${currentWord}</b>`;
    gameModal.classList.add("show");
  }, 400);
};

// Handle letter guesses
const initGame = (button, clickedLetter) => {
  clickedLetter = clickedLetter.toUpperCase();

  if (currentWord.includes(clickedLetter)) {
    playSound(correctSound);
    [...currentWord].forEach((letter, index) => {
      if (letter === clickedLetter) {
        const li = wordDisplay.querySelectorAll("li")[index];
        li.innerText = letter;
        li.classList.add("guessed");
      }
    });
    correctLetters.add(clickedLetter);
  } else {
    playSound(wrongSound);
    wrongGuessCount++;
    hangmanImage.src = `images/hangman-${wrongGuessCount}.svg`;
  }

  button.disabled = true;
  guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`;

  // Win condition: all unique letters guessed
  const uniqueLetters = new Set(currentWord.split(""));
  if (wrongGuessCount === maxGuesses) return gameOver(false);
  if (correctLetters.size === uniqueLetters.size) return gameOver(true);
};

// Create keyboard buttons
for (let i = 97; i <= 122; i++) {
  const button = document.createElement("button");
  const letter = String.fromCharCode(i).toUpperCase();
  button.innerText = letter;
  keyboardDiv.appendChild(button);
  button.addEventListener("click", (e) => initGame(e.target, letter));
}

// Listen to PC keyboard
document.addEventListener("keydown", (event) => {
  const letter = event.key.toUpperCase();
  if (letter >= 'A' && letter <= 'Z') {
    const button = [...keyboardDiv.querySelectorAll("button")].find(btn => btn.innerText === letter);
    if (button && !button.disabled) {
      initGame(button, letter);
    }
  }
});

// Play again button
playAgainBtn.addEventListener("click", () => {
  stopAllSounds();
  getRandomWord();
});

// Start game
getRandomWord();
