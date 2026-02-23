const MAX_GUESSES = 6;

const courses = [
  {
    name: "Augusta National Golf Club",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Augusta_National_Golf_Club%2C_Hole_18%2C_2011_Masters.jpg/1280px-Augusta_National_Golf_Club%2C_Hole_18%2C_2011_Masters.jpg",
  },
  {
    name: "St Andrews Old Course",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/St_Andrews_Old_Course_18th_hole.jpg/1280px-St_Andrews_Old_Course_18th_hole.jpg",
  },
  {
    name: "Pebble Beach Golf Links",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Pebble_Beach_Golf_Links_18th_hole.jpg/1280px-Pebble_Beach_Golf_Links_18th_hole.jpg",
  },
  {
    name: "TPC Sawgrass",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/TPC_Sawgrass_17th.jpg/1280px-TPC_Sawgrass_17th.jpg",
  },
  {
    name: "Royal Troon Golf Club",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Royal_Troon_Postage_Stamp.jpg/1280px-Royal_Troon_Postage_Stamp.jpg",
  },
  {
    name: "Pinehurst No. 2",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Pinehurst_No2_18th_hole.jpg/1280px-Pinehurst_No2_18th_hole.jpg",
  },
  {
    name: "Royal Birkdale",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Royal_Birkdale_Golf_Club.jpg/1280px-Royal_Birkdale_Golf_Club.jpg",
  },
  {
    name: "Whistling Straits",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Whistling_Straits_Hole_7.jpg/1280px-Whistling_Straits_Hole_7.jpg",
  },
];

const photoEl = document.getElementById("course-photo");
const guessInput = document.getElementById("course-guess");
const datalist = document.getElementById("course-options");
const form = document.getElementById("guess-form");
const statusEl = document.getElementById("status");
const guessListEl = document.getElementById("guess-list");
const modal = document.getElementById("result-modal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const shareBtn = document.getElementById("share-btn");
const closeModalBtn = document.getElementById("close-modal-btn");

let guesses = [];
let gameOver = false;

for (const course of courses) {
  const option = document.createElement("option");
  option.value = course.name;
  datalist.append(option);
}

const todayCourse = pickCourseForToday();
photoEl.src = todayCourse.image;
photoEl.alt = `Daily hole photo from ${todayCourse.name}`;

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (gameOver) {
    return;
  }

  const guess = guessInput.value.trim();
  if (!guess) {
    return;
  }

  if (guesses.length >= MAX_GUESSES) {
    return;
  }

  const isCorrect = normalize(guess) === normalize(todayCourse.name);
  guesses.push({ value: guess, correct: isCorrect });
  renderGuesses();

  if (isCorrect) {
    guessInput.classList.remove("error");
    guessInput.classList.add("success");
    statusEl.textContent = `Correct! You got it in ${guesses.length} guess${guesses.length === 1 ? "" : "es"}.`;
    gameOver = true;
    showResultModal(true);
    return;
  }

  guessInput.classList.remove("success");
  guessInput.classList.add("error");

  const remaining = MAX_GUESSES - guesses.length;
  if (remaining === 0) {
    statusEl.textContent = `No guesses left. The answer was ${todayCourse.name}.`;
    gameOver = true;
    showResultModal(false);
  } else {
    statusEl.textContent = `Not it. ${remaining} guess${remaining === 1 ? "" : "es"} remaining.`;
  }

  guessInput.value = "";
  guessInput.focus();
});

shareBtn.addEventListener("click", async () => {
  const guessCount = guesses.length;
  const solved = guesses[guessCount - 1]?.correct;
  const shareText = solved
    ? `I solved today's Golfle in ${guessCount}/6!`
    : `I missed today's Golfle (6/6).`;

  try {
    if (navigator.share) {
      await navigator.share({ title: "Golfle", text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
      statusEl.textContent = "Share text copied to clipboard.";
    }
  } catch (error) {
    statusEl.textContent = "Couldn't share just now.";
  }
});

closeModalBtn.addEventListener("click", () => {
  modal.close();
});

function renderGuesses() {
  guessListEl.innerHTML = "";

  for (const guess of guesses) {
    const item = document.createElement("li");
    item.className = `guess-item ${guess.correct ? "correct" : "wrong"}`;
    item.textContent = guess.value;
    guessListEl.append(item);
  }
}

function showResultModal(solved) {
  if (solved) {
    modalTitle.textContent = "Congrats!";
    modalMessage.textContent = `It took you ${guesses.length} tr${guesses.length === 1 ? "y" : "ies"}!`;
  } else {
    modalTitle.textContent = "Round over";
    modalMessage.textContent = `The course was ${todayCourse.name}.`;
  }
  modal.showModal();
}

function pickCourseForToday() {
  const now = new Date();
  const utcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const daysSinceEpoch = Math.floor(utcMidnight / 86_400_000);
  return courses[daysSinceEpoch % courses.length];
}

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}
