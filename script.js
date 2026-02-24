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

function renderSuggestions(filter = '') {
  const needle = normalizeName(filter);
  const matches = courseNamePool
    .filter((name) => !needle || normalizeName(name).includes(needle))
    .slice(0, 12);

  suggestionListEl.innerHTML = matches
    .map((name) => `<option value="${name}"></option>`)
    .join('');
}

function renderGuesses() {
  guessListEl.innerHTML = guesses
    .map((guess) => `<li>${guess}</li>`)
    .join('');
}

function finishGame(message) {
  guessMessageEl.textContent = message;
  gameOver = true;
  guessButtonEl.disabled = true;
  guessInputEl.disabled = true;
}

function handleGuessSubmission() {
  if (gameOver) {
    return;
  }

  const rawGuess = guessInputEl.value.trim();
  if (!rawGuess) {
    guessMessageEl.textContent = 'Type a course name before submitting.';
    return;
  }

  if (guesses.length >= MAX_GUESSES) {
    finishGame(`No guesses remaining. The answer was ${targetCourse}.`);
    return;
  }

  guesses.push(rawGuess);
  renderGuesses();

  const isCorrect = normalizeName(rawGuess) === normalizeName(targetCourse);
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

  guessMessageEl.textContent = `Not quite. ${guessesLeft} guess${guessesLeft === 1 ? '' : 'es'} left.`;
  guessInputEl.value = '';
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
guessInputEl.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    handleGuessSubmission();
  }
});
guessInputEl.addEventListener('input', () => renderSuggestions(guessInputEl.value));

renderSuggestions();
renderPhoto();
