const photoEl = document.getElementById('daily-photo');
const captionEl = document.getElementById('photo-caption');
const errorEl = document.getElementById('image-error');
const guessInputEl = document.getElementById('guess');
const guessButtonEl = document.getElementById('guess-button');
const guessMessageEl = document.getElementById('guess-message');
const guessListEl = document.getElementById('guess-list');
const suggestionListEl = document.getElementById('course-suggestions');

const MAX_GUESSES = 6;
const GOLF_COM_SOURCE = 'https://golf.com/travel/courses/top-100-courses-world-2025-26/';
const GOLF_DIGEST_SOURCE = 'https://www.golfdigest.com/story/americas-100-greatest-golf-courses-ranking';

// One photo per answer. Rotation size === number of possible answers.
const COURSE_ROTATION = [
  { course: 'Te Arai North', imageUrl: 'https://golf.com/wp-content/uploads/2025/11/iti-scaled.jpg', source: GOLF_COM_SOURCE },
  { course: 'Riviera Country Club', imageUrl: 'https://golf.com/wp-content/uploads/2025/11/riviera.jpg', source: GOLF_COM_SOURCE },
  { course: 'Peachtree Golf Club', imageUrl: 'https://golf.com/wp-content/uploads/2025/11/peachtree.jpg', source: GOLF_COM_SOURCE },
  { course: 'Oakmont Country Club', imageUrl: 'https://golf.com/wp-content/uploads/2022/12/oakmont.jpg', source: GOLF_COM_SOURCE },
  { course: 'Cape Wickham', imageUrl: 'https://golf.com/wp-content/uploads/2025/11/turnberry.jpg', source: GOLF_COM_SOURCE },
  { course: 'The Lido', imageUrl: 'https://golf.com/wp-content/uploads/2021/12/lido-4.jpg', source: GOLF_COM_SOURCE },

  { course: 'Pine Valley Golf Club', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2023/1/Tree%20Farm%20Aerial%202023%20Marsh%20%20-%2035.JPG.rend.hgtvcom.406.305.suffix/1702072004397.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Cypress Point Club', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2023/1/CypressPoint.jpg.rend.hgtvcom.406.229.suffix/1716917769667.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Aronimink Golf Club', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2021/5/Aronimink%20Golf%20Club%2011.3.jpg.rend.hgtvcom.966.644.suffix/1620253202445.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Crooked Stick Golf Club', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/course-photos-for-places-to-play/Crooked%20Stick%2016A_5-14.jpg.rend.hgtvcom.966.644.suffix/1649622569406.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Piping Rock Club', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2019/01/06/5c32666e2fa4575949207c04_119%20-%20Piping%20Rock%20-%20aerial%20-%20Jon%20Cavalier.jpeg.rend.hgtvcom.966.644.suffix/1573162572994.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Milwaukee Country Club', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/course-photos-for-places-to-play/milwaukee-country-club-tenth-hole-12111.jpg.rend.hgtvcom.966.725.suffix/1706714372295.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Dallas National Golf Club', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2016/12/16/58545d04dcb0bb103ffe9bc7_2017-59-Dallas-National-GC-hole-10.jpg.rend.hgtvcom.966.725.suffix/1573414442654.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Diamond Creek', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2016/12/20/585992f96b9bd0b018b64215_2017-90-Diamond-Creek-GC-Clubhouse-and-hole-9-fairway.jpg.rend.hgtvcom.966.725.suffix/1573414659253.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Prairie Dunes Country Club', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/course-photos-for-places-to-play/prairie-dunes-country-club-kansas.jpg.rend.hgtvcom.1280.720.suffix/1745526904447.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Pebble Beach Golf Links', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2018/03/13/5aa7f27291f8f35f0f7f3f50_Pebble-Beach-18th-hole.jpg.rend.hgtvcom.966.644.suffix/1520952021323.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Augusta National Golf Club', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2018/10/03/5bb4fb65b8f63f03bdfe75cb_16.jpg.rend.hgtvcom.966.544.suffix/1538585447355.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Shinnecock Hills Golf Club', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2018/03/13/5aa7f8b88ed9de323f5f0f2f_16th-hole-at-Shinnecock-Hills.jpg.rend.hgtvcom.966.644.suffix/1520951487157.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Merion Golf Club East', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2018/03/13/5aa7f7928ed9de323f5f0f2e_Merion-East.jpg.rend.hgtvcom.966.544.suffix/1520951255683.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'National Golf Links of America', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2018/03/13/5aa7f7f391f8f35f0f7f3f52_NGLA.jpg.rend.hgtvcom.966.644.suffix/1520951299839.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Sand Hills Golf Club', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2018/03/13/5aa7f7f08ed9de323f5f0f31_Sand-Hills.jpg.rend.hgtvcom.966.644.suffix/1520951283775.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Fishers Island Club', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2018/03/13/5aa7f8ce8ed9de323f5f0f32_Fisher-Island.jpg.rend.hgtvcom.966.644.suffix/1520951524985.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Chicago Golf Club', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2018/03/13/5aa7f84291f8f35f0f7f3f53_Chicago-GC.jpg.rend.hgtvcom.966.644.suffix/1520951367894.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Seminole Golf Club', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2018/03/13/5aa7f8968ed9de323f5f0f30_Seminole.jpg.rend.hgtvcom.966.644.suffix/1520951443103.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Winged Foot Golf Club West', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2018/03/13/5aa7f89f91f8f35f0f7f3f54_Winged-Foot-West.jpg.rend.hgtvcom.966.644.suffix/1520951459317.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Fris Head Golf Club', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2018/03/13/5aa7f91f8ed9de323f5f0f33_Friars-Head.jpg.rend.hgtvcom.966.644.suffix/1520951575988.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Crystal Downs Country Club', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2018/03/13/5aa7f95d91f8f35f0f7f3f55_Crystal-Downs.jpg.rend.hgtvcom.966.644.suffix/1520951636995.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'The Country Club', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2018/03/13/5aa7fa1291f8f35f0f7f3f57_The-Country-Club.jpg.rend.hgtvcom.966.644.suffix/1520951811007.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Muirfield Village Golf Club', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2018/03/13/5aa7fa8191f8f35f0f7f3f59_Muirfield-Village.jpg.rend.hgtvcom.966.544.suffix/1520951920040.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Oakland Hills South Course', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2018/03/13/5aa7fa7691f8f35f0f7f3f58_Oakland-Hills.jpg.rend.hgtvcom.966.644.suffix/1520951901324.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Oak Hill Country Club East', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2018/03/13/5aa7fb0791f8f35f0f7f3f5a_Oak-Hill.jpg.rend.hgtvcom.966.544.suffix/1520952056812.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Pacific Dunes', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2018/03/13/5aa7fbc58ed9de323f5f0f36_Pacific-Dunes.jpg.rend.hgtvcom.966.644.suffix/1520952251582.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Shadow Creek', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2018/03/13/5aa7fc208ed9de323f5f0f37_Shadow-Creek.jpg.rend.hgtvcom.966.644.suffix/1520952349869.jpeg', source: GOLF_DIGEST_SOURCE },
  { course: 'Whistling Straits Straits Course', imageUrl: 'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2018/03/13/5aa7fc8891f8f35f0f7f3f5e_Whistling-Straits.jpg.rend.hgtvcom.966.644.suffix/1520952450773.jpeg', source: GOLF_DIGEST_SOURCE }
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

const courseNamePool = COURSE_ROTATION.map((entry) => entry.course);

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

function dailyStartIndex() {
  return Math.floor(Date.now() / 86400000) % COURSE_ROTATION.length;
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
  if (!selected) return;
  guessInputEl.value = selected;
  hideSuggestions();
}

function renderSuggestionItems() {
  suggestionListEl.innerHTML = filteredSuggestions
    .map((name, index) => `
      <li class="suggestion-item${index === activeSuggestionIndex ? ' active' : ''}" role="option" aria-selected="${index === activeSuggestionIndex}" data-index="${index}">${name}</li>`)
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
  if (gameOver) return;

  const rawGuess = guessInputEl.value.trim();
  if (!rawGuess) {
    guessMessageEl.textContent = 'Select a course from the dropdown before submitting.';
    return;
  }

  let matchedCourse = courseNamePool.find((name) => normalizeName(name) === normalizeName(rawGuess));
  if (!matchedCourse) {
    const prefixMatches = courseNamePool.filter((name) => normalizeName(name).startsWith(normalizeName(rawGuess)));
    if (prefixMatches.length === 1) matchedCourse = prefixMatches[0];
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

async function pickDailyPlayablePhoto() {
  const start = dailyStartIndex();
  for (let offset = 0; offset < COURSE_ROTATION.length; offset += 1) {
    const candidate = COURSE_ROTATION[(start + offset) % COURSE_ROTATION.length];
    const url = normalizeImageUrl(candidate.imageUrl);
    if (!url) continue;

    try {
      await loadLandscapeImage(url);
      return { ...candidate, resolvedUrl: url };
    } catch {
      // try next rotation entry
    }
  }
  return null;
}

async function renderPhoto() {
  const selected = await pickDailyPlayablePhoto();

  if (selected) {
    targetCourse = selected.course;
    photoEl.alt = `Landscape photo of ${selected.course}`;
    photoEl.src = selected.resolvedUrl;
    photoEl.hidden = false;
    errorEl.hidden = true;
    captionEl.textContent = `Photo: ${selected.course} · Source: ${selected.source}`;
    guessMessageEl.textContent = `You have ${MAX_GUESSES} guesses. ${COURSE_ROTATION.length} total courses in rotation.`;
    return;
  }

  targetCourse = 'Unknown Course';
  photoEl.alt = 'Landscape fallback golf course image';
  photoEl.src = LANDSCAPE_FALLBACK_DATA_URI;
  photoEl.hidden = false;
  errorEl.hidden = true;
  captionEl.textContent = 'Photo: Fallback landscape';
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
    if (!suggestionListEl.hidden && activeSuggestionIndex >= 0) selectSuggestion(activeSuggestionIndex);
    handleGuessSubmission();
  } else if (event.key === 'Escape') {
    hideSuggestions();
  }
});

suggestionListEl.addEventListener('mousedown', (event) => {
  const item = event.target.closest('.suggestion-item');
  if (!item) return;
  event.preventDefault();
  selectSuggestion(Number(item.dataset.index));
  handleGuessSubmission();
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.guess-input-wrap')) hideSuggestions();
});

updateSuggestions('');
renderPhoto();
