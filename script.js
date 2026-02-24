const photoEl = document.getElementById('daily-photo');
const captionEl = document.getElementById('photo-caption');
const errorEl = document.getElementById('image-error');
const guessInputEl = document.getElementById('guess');
const guessButtonEl = document.getElementById('guess-button');
const guessMessageEl = document.getElementById('guess-message');
const guessListEl = document.getElementById('guess-list');
const suggestionListEl = document.getElementById('course-suggestions');

const SOURCE_PAGE = 'https://golf.com/travel/courses/top-100-courses-world-2025-26/';
const MAX_GUESSES = 6;

const courseNamePool = [
  'Iti', 'Riviera', 'Peachtree', 'Oakmont', 'Turnberry', 'Lido', 'Royal Troon Golf Club',
  'St Andrews Old Course', 'Pine Valley', 'Augusta National', 'Royal County Down',
  'Muirfield', 'Shinnecock Hills', 'Cypress Point', 'Royal Melbourne', 'Sand Hills'
];

const golfDotComCoursePhotos = [
  { course: 'Iti', imageUrl: 'https://golf.com/wp-content/uploads/2025/11/iti-scaled.jpg' },
  { course: 'Riviera', imageUrl: 'https://golf.com/wp-content/uploads/2025/11/riviera.jpg' },
  { course: 'Peachtree', imageUrl: 'https://golf.com/wp-content/uploads/2025/11/peachtree.jpg' },
  { course: 'Oakmont', imageUrl: 'https://golf.com/wp-content/uploads/2022/12/oakmont.jpg' },
  { course: 'Turnberry', imageUrl: 'https://golf.com/wp-content/uploads/2025/11/turnberry.jpg' },
  { course: 'Lido', imageUrl: 'https://golf.com/wp-content/uploads/2021/12/lido-4.jpg' }
];

const LANDSCAPE_FALLBACK_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'>
  <defs>
    <linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0%' stop-color='#8ecdf7'/>
      <stop offset='100%' stop-color='#d7efff'/>
    </linearGradient>
    <linearGradient id='fairway' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0%' stop-color='#8bcf73'/>
      <stop offset='100%' stop-color='#5f9f4e'/>
    </linearGradient>
  </defs>
  <rect width='1600' height='900' fill='url(#sky)'/>
  <ellipse cx='820' cy='600' rx='920' ry='330' fill='url(#fairway)'/>
  <path d='M160 690 C450 540, 900 560, 1390 700' stroke='#d0b38b' stroke-width='70' fill='none' stroke-linecap='round'/>
  <circle cx='1180' cy='505' r='11' fill='#fff'/>
  <rect x='1178' y='410' width='4' height='95' fill='#2f2f2f'/>
  <path d='M1182 412 L1240 438 L1182 454 Z' fill='#e53935'/>
</svg>
`)}`;

let targetCourse = '';
let gameOver = false;
let filteredSuggestions = [];
let activeSuggestionIndex = -1;

const guesses = [];

function normalizeName(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ');
}

function normalizeImageUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return null;
  }

  try {
    return new URL(rawUrl.trim(), window.location.origin).toString();
  } catch {
    return null;
  }
}

function loadLandscapeImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.referrerPolicy = 'no-referrer';
    image.onload = () => {
      const isLandscape = image.naturalWidth >= image.naturalHeight * 1.2;
      if (!isLandscape) {
        reject(new Error('Not landscape enough'));
        return;
      }

      resolve(url);
    };
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = url;
  });
}

function hideSuggestions() {
  suggestionListEl.hidden = true;
  activeSuggestionIndex = -1;
}

function showSuggestions() {
  suggestionListEl.hidden = filteredSuggestions.length === 0 || gameOver;
}

function selectSuggestion(index) {
  const selected = filteredSuggestions[index];
  if (!selected) {
    return;
  }

  guessInputEl.value = selected;
  hideSuggestions();
}

function renderSuggestionItems() {
  suggestionListEl.innerHTML = filteredSuggestions
    .map((name, index) => `
      <li
        class="suggestion-item${index === activeSuggestionIndex ? ' active' : ''}"
        role="option"
        aria-selected="${index === activeSuggestionIndex}"
        data-index="${index}"
      >${name}</li>`)
    .join('');

  showSuggestions();
}

function updateSuggestions(filter = '') {
  const needle = normalizeName(filter);
  filteredSuggestions = courseNamePool
    .filter((name) => !guesses.some((guess) => normalizeName(guess.course) === normalizeName(name)))
    .filter((name) => !needle || normalizeName(name).includes(needle))
    .slice(0, 8);

  activeSuggestionIndex = filteredSuggestions.length ? 0 : -1;
  renderSuggestionItems();
}

function renderGuesses() {
  guessListEl.innerHTML = guesses
    .map((guess, index) => `
      <article class="guess-card${guess.correct ? ' correct' : ''}">
        <span>${index + 1}. ${guess.course}</span>
        <span class="guess-status">${guess.correct ? 'Correct' : 'Wrong'}</span>
      </article>`)
    .join('');
}

function finishGame(message) {
  guessMessageEl.textContent = message;
  gameOver = true;
  guessButtonEl.disabled = true;
  guessInputEl.disabled = true;
  hideSuggestions();
}

function handleGuessSubmission() {
  if (gameOver) {
    return;
  }

  const rawGuess = guessInputEl.value.trim();
  if (!rawGuess) {
    guessMessageEl.textContent = 'Select a course from the dropdown before submitting.';
    return;
  }

  let matchedCourse = courseNamePool.find(
    (name) => normalizeName(name) === normalizeName(rawGuess)
  );

  if (!matchedCourse) {
    const prefixMatches = courseNamePool.filter(
      (name) => normalizeName(name).startsWith(normalizeName(rawGuess))
    );
    if (prefixMatches.length === 1) {
      matchedCourse = prefixMatches[0];
    }
  }

  if (!matchedCourse) {
    guessMessageEl.textContent = 'Please choose a valid course from the suggestions list.';
    return;
  }

  if (guesses.some((guess) => normalizeName(guess.course) === normalizeName(matchedCourse))) {
    guessMessageEl.textContent = 'You already guessed that course. Try another.';
    return;
  }

  const isCorrect = normalizeName(matchedCourse) === normalizeName(targetCourse);
  guesses.push({ course: matchedCourse, correct: isCorrect });
  renderGuesses();

  const guessesUsed = guesses.length;
  const guessesLeft = MAX_GUESSES - guessesUsed;

  if (isCorrect) {
    finishGame(`Correct! The course is ${targetCourse}. Solved in ${guessesUsed}/${MAX_GUESSES}.`);
    return;
  }

  if (guessesLeft === 0) {
    finishGame(`Out of guesses. The course was ${targetCourse}.`);
    return;
  }

  guessMessageEl.textContent = `Incorrect. ${guessesLeft} guesses remaining.`;
  guessInputEl.value = '';
  updateSuggestions('');
  guessInputEl.focus();
}

async function pickPlayablePhoto() {
  for (const candidate of golfDotComCoursePhotos) {
    const url = normalizeImageUrl(candidate.imageUrl);
    if (!url) {
      continue;
    }

    try {
      await loadLandscapeImage(url);
      return { ...candidate, resolvedUrl: url };
    } catch {
      // Try next Golf.com course image.
    }
  }

  return null;
}

async function renderPhoto() {
  const selected = await pickPlayablePhoto();

  if (selected) {
    targetCourse = selected.course;
    photoEl.alt = `Landscape photo of ${selected.course}`;
    photoEl.src = selected.resolvedUrl;
    photoEl.hidden = false;
    errorEl.hidden = true;
    captionEl.textContent = `Photo: ${selected.course} · Source: ${SOURCE_PAGE}`;
    guessMessageEl.textContent = `You have ${MAX_GUESSES} guesses.`;
    return;
  }

  targetCourse = 'Unknown Course';
  photoEl.alt = 'Landscape fallback golf course image';
  photoEl.src = LANDSCAPE_FALLBACK_DATA_URI;
  photoEl.hidden = false;
  errorEl.hidden = true;
  captionEl.textContent = `Photo: Fallback landscape · Source: ${SOURCE_PAGE}`;
  guessMessageEl.textContent = `You have ${MAX_GUESSES} guesses.`;
}

guessButtonEl.addEventListener('click', handleGuessSubmission);
guessInputEl.addEventListener('focus', () => updateSuggestions(guessInputEl.value));
guessInputEl.addEventListener('input', () => updateSuggestions(guessInputEl.value));

guessInputEl.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown' && filteredSuggestions.length) {
    event.preventDefault();
    activeSuggestionIndex = (activeSuggestionIndex + 1) % filteredSuggestions.length;
    renderSuggestionItems();
  } else if (event.key === 'ArrowUp' && filteredSuggestions.length) {
    event.preventDefault();
    activeSuggestionIndex = (activeSuggestionIndex - 1 + filteredSuggestions.length) % filteredSuggestions.length;
    renderSuggestionItems();
  } else if (event.key === 'Enter') {
    event.preventDefault();
    if (!suggestionListEl.hidden && activeSuggestionIndex >= 0) {
      selectSuggestion(activeSuggestionIndex);
    }
    handleGuessSubmission();
  } else if (event.key === 'Escape') {
    hideSuggestions();
  }
});

suggestionListEl.addEventListener('mousedown', (event) => {
  const item = event.target.closest('.suggestion-item');
  if (!item) {
    return;
  }

  event.preventDefault();
  selectSuggestion(Number(item.dataset.index));
  handleGuessSubmission();
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.guess-input-wrap')) {
    hideSuggestions();
  }
});

updateSuggestions('');
renderPhoto();
