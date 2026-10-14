/* ---------------------------------------------------
   DATA
   Feel free to add your own movies/games here — just
   follow the same shape: { title, desc, moods: [...] }
--------------------------------------------------- */
 
const MOVIES = [
  { title: "Mad Max: Fury Road", desc: "A two-hour chase scene disguised as a movie. Loud, relentless, oddly beautiful.", moods: ["adventurous", "energetic"] },
  { title: "The Grand Budapest Hotel", desc: "A pastel, precise little caper about loyalty and a very particular concierge.", moods: ["cozy", "nostalgic"] },
  { title: "Spirited Away", desc: "A girl gets trapped in a spirit world and has to work her way out. Gorgeous and strange.", moods: ["adventurous", "cozy"] },
  { title: "Whiplash", desc: "A drummer and his teacher push each other past reasonable limits. Tense from minute one.", moods: ["energetic"] },
  { title: "Amélie", desc: "A shy Parisian waitress starts quietly fixing the lives of strangers around her.", moods: ["cozy", "nostalgic"] },
  { title: "Back to the Future", desc: "A teenager, a time machine made from a car, and his parents' awkward high school years.", moods: ["nostalgic", "energetic"] },
  { title: "Everything Everywhere All at Once", desc: "A laundromat owner discovers the multiverse mid tax audit. Genuinely unlike anything else.", moods: ["adventurous", "energetic"] },
  { title: "My Neighbor Totoro", desc: "Two sisters, a new house in the countryside, and a very large forest spirit.", moods: ["cozy"] },
  { title: "The Truman Show", desc: "A man slowly realizes his entire life has been a television show. Quietly unsettling.", moods: ["nostalgic", "adventurous"] },
  { title: "La La Land", desc: "Two people in Los Angeles trying to make it, and trying to make it work.", moods: ["cozy", "nostalgic"] }
];
 
const GAMES = [
  { title: "Stardew Valley", desc: "Inherit a run-down farm, fix it up at your own pace. No timers, no pressure.", moods: ["cozy"] },
  { title: "Slay the Spire", desc: "A deckbuilding climb up a spire. Short runs, sharp decisions, easy to pick up for ten minutes.", moods: ["energetic", "adventurous"] },
  { title: "Journey", desc: "A short, wordless walk across a desert with a stranger. Takes about two hours, stays with you longer.", moods: ["cozy", "nostalgic"] },
  { title: "Unpacking", desc: "Unpack someone's boxes into a new home and quietly piece their life story together.", moods: ["cozy"] },
  { title: "Hades", desc: "Fight your way out of the underworld, die, come back, try again. Addictive in the best way.", moods: ["energetic", "adventurous"] },
  { title: "Animal Crossing", desc: "Move to an island, pay off your debt to a raccoon at your own pace.", moods: ["cozy", "nostalgic"] },
  { title: "Portal 2", desc: "Physics puzzles narrated by a sarcastic AI. Short, clever, endlessly quotable.", moods: ["adventurous", "energetic"] },
  { title: "Chicory: A Colorful Tale", desc: "The world lost its color and someone handed you the only paintbrush left.", moods: ["cozy", "adventurous"] },
  { title: "Old-school Tetris", desc: "The original. No story, no pressure, just blocks and a beat that speeds up.", moods: ["nostalgic", "energetic"] },
  { title: "Firewatch", desc: "A summer job watching for wildfires in Wyoming, and a voice on the radio.", moods: ["nostalgic", "cozy"] }
];
 
// mood -> which TheMealDB categories to pull from
const FOOD_MOOD_MAP = {
  adventurous: ["Seafood", "Vegan"],
  cozy: ["Dessert", "Pasta"],
  energetic: ["Chicken", "Beef"],
  nostalgic: ["Pasta", "Miscellaneous"]
};
 
const MOOD_COLORS = {
  adventurous: "#FF6B4A",
  cozy: "#7C9885",
  energetic: "#FFC94A",
  nostalgic: "#6C7BC4"
};
 
const MOOD_LABELS = {
  adventurous: "Feeling adventurous",
  cozy: "Feeling cozy",
  energetic: "Feeling energetic",
  nostalgic: "Feeling nostalgic"
};
 
/* ---------------------------------------------------
   STATE
--------------------------------------------------- */
 
let currentMood = null;
let currentCategory = "food";
let lastTitle = null;
let history = []; // [{category, title}], newest first, max 5
 
/* ---------------------------------------------------
   ELEMENTS
--------------------------------------------------- */
 
const moodScreen = document.getElementById("mood-screen");
const mainScreen = document.getElementById("main-screen");
const moodLabel = document.getElementById("mood-label");
const changeMoodBtn = document.getElementById("change-mood");
const tabs = document.querySelectorAll(".tab-btn");
const spinBtn = document.getElementById("spin-btn");
const copyBtn = document.getElementById("copy-btn");
const copyToast = document.getElementById("copy-toast");
const card = document.getElementById("result-card");
const cardEmpty = document.getElementById("card-empty");
const cardContent = document.getElementById("card-content");
const cardTag = document.getElementById("card-tag");
const cardTitle = document.getElementById("card-title");
const cardDesc = document.getElementById("card-desc");
const historyList = document.getElementById("history-list");
 
/* ---------------------------------------------------
   MOOD SELECTION
--------------------------------------------------- */
 
document.querySelectorAll(".mood-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentMood = btn.dataset.mood;
    document.documentElement.style.setProperty("--mood-color", MOOD_COLORS[currentMood]);
    moodLabel.textContent = MOOD_LABELS[currentMood];
    moodScreen.classList.add("hidden");
    mainScreen.classList.remove("hidden");
    resetCard();
  });
});
 
changeMoodBtn.addEventListener("click", () => {
  mainScreen.classList.add("hidden");
  moodScreen.classList.remove("hidden");
});
 
/* ---------------------------------------------------
   CATEGORY TABS
--------------------------------------------------- */
 
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    currentCategory = tab.dataset.category;
    lastTitle = null;
    resetCard();
  });
});
 
function resetCard() {
  cardContent.classList.add("hidden");
  cardEmpty.classList.remove("hidden");
  copyBtn.classList.add("hidden");
}
 
/* ---------------------------------------------------
   PICKING LOGIC
--------------------------------------------------- */
 
function pickFromStaticList(list) {
  const filtered = list.filter((item) => item.moods.includes(currentMood));
  const pool = filtered.length ? filtered : list;
  let choice;
  // avoid repeating the same title twice in a row when possible
  do {
    choice = pool[Math.floor(Math.random() * pool.length)];
  } while (pool.length > 1 && choice.title === lastTitle);
  return {
    title: choice.title,
    desc: choice.desc,
    spinPool: pool.map((p) => p.title)
  };
}
 
function truncate(str, max) {
  if (!str) return "";
  const clean = str.replace(/\r?\n/g, " ").trim();
  return clean.length > max ? clean.slice(0, max).trim() + "…" : clean;
}
 
async function pickFood() {
  const categories = FOOD_MOOD_MAP[currentMood] || ["Miscellaneous"];
  const category = categories[Math.floor(Math.random() * categories.length)];
 
  const listRes = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`);
  const listData = await listRes.json();
  const meals = (listData && listData.meals) || [];
 
  if (!meals.length) {
    throw new Error("No meals found for this category");
  }
 
  const spinPool = meals.slice(0, 12).map((m) => m.strMeal);
  const chosen = meals[Math.floor(Math.random() * meals.length)];
 
  const detailRes = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${chosen.idMeal}`);
  const detailData = await detailRes.json();
  const meal = detailData.meals[0];
 
  return {
    title: meal.strMeal,
    tag: `Food · ${meal.strArea || category}`,
    desc: truncate(meal.strInstructions, 190),
    spinPool
  };
}
 
/* ---------------------------------------------------
   SLOT MACHINE SPIN
--------------------------------------------------- */
 
function runSpinAnimation(pool, onDone) {
  card.classList.add("spinning");
  cardEmpty.classList.add("hidden");
  cardContent.classList.remove("hidden");
  cardTag.textContent = "···";
  cardDesc.textContent = "";
 
  const delays = [70, 70, 90, 90, 110, 130, 160, 200, 260, 340];
  let i = 0;
 
  function tick() {
    if (i < delays.length) {
      cardTitle.textContent = pool[Math.floor(Math.random() * pool.length)] || "…";
      setTimeout(tick, delays[i]);
      i++;
    } else {
      card.classList.remove("spinning");
      onDone();
    }
  }
  tick();
}
 
/* ---------------------------------------------------
   SPIN BUTTON
--------------------------------------------------- */
 
spinBtn.addEventListener("click", async () => {
  spinBtn.disabled = true;
  spinBtn.textContent = "Spinning…";
  copyBtn.classList.add("hidden");
 
  try {
    let result;
    let tagText;
 
    if (currentCategory === "movies") {
      result = pickFromStaticList(MOVIES);
      tagText = "Movie";
    } else if (currentCategory === "games") {
      result = pickFromStaticList(GAMES);
      tagText = "Chill game";
    } else {
      result = await pickFood();
      tagText = result.tag;
    }
 
    runSpinAnimation(result.spinPool, () => {
      cardTag.textContent = tagText;
      cardTitle.textContent = result.title;
      cardDesc.textContent = result.desc;
      lastTitle = result.title;
 
      addToHistory(currentCategory, result.title);
      copyBtn.classList.remove("hidden");
      spinBtn.disabled = false;
      spinBtn.textContent = "Spin again";
    });
  } catch (err) {
    cardContent.classList.remove("hidden");
    cardEmpty.classList.add("hidden");
    cardTag.textContent = "Oops";
    cardTitle.textContent = "Couldn't get a pick";
    cardDesc.textContent = "Something went wrong reaching the food API. Try again in a moment.";
    spinBtn.disabled = false;
    spinBtn.textContent = "Try again";
  }
});
 
/* ---------------------------------------------------
   COPY BUTTON
--------------------------------------------------- */
 
copyBtn.addEventListener("click", async () => {
  const text = `${cardTitle.textContent} — ${cardDesc.textContent}`;
  try {
    await navigator.clipboard.writeText(text);
    copyToast.classList.remove("hidden");
    setTimeout(() => copyToast.classList.add("hidden"), 1800);
  } catch (err) {
    // clipboard API unavailable (e.g. insecure context) — fail silently
  }
});
 
/* ---------------------------------------------------
   HISTORY
--------------------------------------------------- */
 
function addToHistory(category, title) {
  history.unshift({ category, title });
  history = history.slice(0, 5);
  renderHistory();
}
 
function renderHistory() {
  if (!history.length) {
    historyList.innerHTML = `<li class="history-empty">Nothing yet — your picks will show up here.</li>`;
    return;
  }
  const labelMap = { food: "Food", movies: "Movie", games: "Game" };
  historyList.innerHTML = history
    .map((h) => `<li>${h.title}<span class="h-cat">${labelMap[h.category]}</span></li>`)
    .join("");
}
 