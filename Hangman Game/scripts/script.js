// Selects DOM elements for the game UI components at the start of the script.
// These are used throughout to manipulate the game's visual state.
const wordDisplay = document.querySelector(".word-display"); // Container for displaying the word as letter blanks or revealed letters.
const guessesText = document.querySelector(".guesses-text b"); // Bold element showing wrong guesses count (e.g., "0 / 6").
const keyboardDiv = document.querySelector(".keyboard"); // Container div for the on-screen keyboard buttons.
const hangmanImage = document.querySelector(".hangman-box img"); // Image element that updates to show hangman drawing stages.
const gameModal = document.querySelector(".game-modal"); // Overlay modal for win/loss screens.
const playAgainBtn = gameModal.querySelector("button"); // Button inside the modal to restart the game.

// === Sound Effects Section ===
// References to audio elements in the HTML for game feedback sounds.
// These are played at key events like correct/wrong guesses or win/loss.
const winSound = document.getElementById("win-sound"); // Sound for victory.
const loseSound = document.getElementById("lose-sound"); // Sound for defeat.
const correctSound = document.getElementById("correct-sound"); // Sound for a correct letter guess.
const wrongSound = document.getElementById("wrong-sound"); // Sound for an incorrect letter guess.

// Utility function to play a sound effect consistently.
// Resets and plays the audio to avoid overlapping or resuming from midway.
function playSound(sound) {
  sound.pause(); // Stops any current playback.
  sound.currentTime = 0; // Resets playback position to the beginning.
  sound.play(); // Starts playing the sound.
}

// Initializing game variables
// Declares mutable variables for game state and a constant for the guess limit.
// These track the secret word, correct guesses, and wrong attempts.
let currentWord, correctLetters, wrongGuessCount; // currentWord: secret word; correctLetters: Set of guessed correct letters; wrongGuessCount: number of incorrect guesses.
const maxGuesses = 6; // Maximum wrong guesses allowed before loss.

// Reset game state function
// Called whenever a new game starts to clear previous state and update UI to initial conditions.
// Ensures the game is fresh for each round.
const resetGame = () => {
  correctLetters = new Set(); // Initializes empty Set to track unique correct letters guessed.
  wrongGuessCount = 0; // Resets wrong guess counter to zero.
  hangmanImage.src = "images/hangman-0.svg"; // Sets hangman image to initial empty scaffold (no body parts).
  guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`; // Updates display to "0 / 6".
  wordDisplay.innerHTML = currentWord.split("").map(() => `<li class="letter"></li>`).join(""); // Clears and rebuilds word display as empty <li> blanks for each letter in currentWord.
  keyboardDiv.querySelectorAll("button").forEach(btn => btn.disabled = false); // Re-enables all keyboard buttons for new guesses.
  gameModal.classList.remove("show"); // Hides the game over modal by removing the 'show' CSS class.
};

// Stop all sounds immediately
// Utility function to silence all audio effects at once, e.g., before restarting.
// Prevents overlapping sounds during transitions.
const stopAllSounds = () => {
  [winSound, loseSound, correctSound, wrongSound].forEach(sound => { // Array of all sound elements for iteration.
    sound.pause(); // Pauses each sound.
    sound.currentTime = 0; // Resets each to start position.
  });
};

// Get a random word from wordList
// Function to select and set up a new secret word with its hint, then reset the game.
// Assumes 'wordList' is a global array of {word, hint} objects defined elsewhere.
const getRandomWord = () => {
  const { word, hint } = wordList[Math.floor(Math.random() * wordList.length)]; // Destructures random object from wordList; Math.random() picks index 0 to length-1.
  currentWord = word.toUpperCase(); // Sets global currentWord to uppercase version for consistency.
  document.querySelector(".hint-text b").innerText = hint; // Updates the bold hint text in the DOM.
  resetGame(); // Calls reset to initialize UI with the new word.
};

// Handle game over
// Manages win/loss conclusion: plays sound, then after delay, shows modal with appropriate message and image.
// The delay allows the final sound to play without immediate interruption.
const gameOver = (isVictory) => {
  if (isVictory) playSound(winSound); // Plays win sound if victory.
  else playSound(loseSound); // Plays lose sound otherwise.

  setTimeout(() => { // Delays modal display by 400ms.
    const modalText = isVictory ? `You found the word:` : 'The correct word was:'; // Sets dynamic text based on outcome.
    gameModal.querySelector("img").src = `images/${isVictory ? 'victory' : 'lost'}.gif`; // Updates modal image to victory or lost GIF.
    gameModal.querySelector("h4").innerText = isVictory ? 'Congrats!' : 'Game Over!'; // Sets modal heading.
    gameModal.querySelector("p").innerHTML = `${modalText} <b>${currentWord}</b>`; // Sets modal paragraph with bolded word.
    gameModal.classList.add("show"); // Shows modal by adding 'show' CSS class.
  }, 400);
};

// What it does: Processes the guess by checking if the letter
//  is in the word, playing sounds, updating display, 
// and disabling the button.
const initGame = (button, clickedLetter) => {
  clickedLetter = clickedLetter.toUpperCase(); // Ensures letter is uppercase for matching.

  //What it does: Branches based on whether the guessed
  //  letter appears in the currentWord.
  if (currentWord.includes(clickedLetter)) { // Checks if letter is present in the secret word.
    playSound(correctSound); // Plays positive feedback sound.
    [...currentWord].forEach((letter, index) => { // Spreads word into array and loops over each position with index.
      if (letter === clickedLetter) { // For positions matching the guess:
        const li = wordDisplay.querySelectorAll("li")[index]; // Gets the specific blank <li> element.
        li.innerText = letter; // Reveals the letter.
        li.classList.add("guessed"); // Adds CSS class for visual styling (e.g., color).
      }
    });
    correctLetters.add(clickedLetter); // Adds to Set of correct unique letters (Sets auto-deduplicate).
  } else { // Wrong guess branch.
    playSound(wrongSound); // Plays negative feedback sound.
    wrongGuessCount++; // Increments wrong guess counter.
    hangmanImage.src = `images/hangman-${wrongGuessCount}.svg`; // Updates image to next hangman stage.
  }

  button.disabled = true; // Disables the button to prevent re-guessing the same letter.
  guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`; // Refreshes wrong guesses display.

  // Win condition: all unique letters guessed
  const uniqueLetters = new Set(currentWord.split("")); // Creates Set of unique letters in word for win check.
  if (wrongGuessCount === maxGuesses) return gameOver(false); // Ends game as loss if max wrong guesses reached (early return).
  if (correctLetters.size === uniqueLetters.size) return gameOver(true); // Ends game as win if all unique letters guessed (early return).
};

// Create keyboard buttons
// Dynamically generates 26 on-screen buttons for A-Z after DOM loads.
// This runs once to build the interactive keyboard.
for (let i = 97; i <= 122; i++) { // Loops over ASCII codes for lowercase a-z.
  const button = document.createElement("button"); // Creates a new <button> element.
  const letter = String.fromCharCode(i).toUpperCase(); // Converts code to uppercase letter (e.g., 97 -> 'A').
  button.innerText = letter; // Sets button text to the letter.
  keyboardDiv.appendChild(button); // Appends button to keyboard container.
  button.addEventListener("click", (e) => initGame(e.target, letter)); // Attaches click handler to process guess.
}

// What it does: Listens for keydown events, converts to uppercase,
//  finds the matching on-screen button if available and enabled, 
// and triggers the guess function.
// Adds support for physical keyboard input; runs once to attach listener.
document.addEventListener("keydown", (event) => { // Listens for any key press on the document.
  const letter = event.key.toUpperCase(); // Converts pressed key to uppercase.
  if (letter >= 'A' && letter <= 'Z') { // Validates it's a letter A-Z.
    const button = [...keyboardDiv.querySelectorAll("button")].find(btn => btn.innerText === letter); // Finds matching on-screen button.
    if (button && !button.disabled) { // If button exists and is enabled:
      initGame(button, letter); // Simulates click by calling guess handler.
    }
  }
});

// Play again button
// Attaches click listener to the restart button in the modal.
// This runs once to enable restarting.
playAgainBtn.addEventListener("click", () => { // Handles modal button click.
  stopAllSounds(); // Silences any playing audio.
  getRandomWord(); // Picks new word and resets game.
});

// Start game
// Initializes the first round when the script loads.
getRandomWord(); // Selects initial word and sets up game.