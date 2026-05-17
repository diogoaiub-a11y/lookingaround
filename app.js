const form = document.querySelector("#recommendation-form");
const queryInput = document.querySelector("#music-query");
const countryInput = document.querySelector("#country");
const moodInput = document.querySelector("#mood");
const similarityInput = document.querySelector("#similarity");
const similarityLabel = document.querySelector("#similarity-label");
const categoryInput = document.querySelector("#category");
const statusText = document.querySelector("#status-text");
const seedSection = document.querySelector("#seed-section");
const seedCard = document.querySelector("#seed-card");
const results = document.querySelector("#results");
const clearCacheButton = document.querySelector("#clear-cache");
const categoryButton = document.querySelector("#category-button");
const surpriseButton = document.querySelector("#surprise-button");
const historyList = document.querySelector("#history-list");
const favoritesList = document.querySelector("#favorites-list");
const template = document.querySelector("#track-card-template");

const APP_VERSION = "vibingecho-discovery-v8";
const API_URL = "https://itunes.apple.com/search";
const PROXY_API_URL = "/api/itunes";
const AUDIO_PROXY_URL = "/api/audio";
const CACHE_KEY = "vibingecho-cache-v8";
const HISTORY_KEY = "vibingecho-history-v1";
const FAVORITES_KEY = "vibingecho-favorites-v1";
const CACHE_TTL = 1000 * 60 * 60 * 24;
const AUDIO_ANALYSIS_LIMIT = 60;
const currentTracks = new Map();

const moodLabels = {
  melancholic: "melancholic",
  romantic: "romantic",
  energetic: "energetic",
  calm: "calm",
  dark: "dark",
  bright: "bright",
};

const moodLexicon = {
  melancholic: [
    "sad",
    "blue",
    "lost",
    "alone",
    "cry",
    "tears",
    "rain",
    "night",
    "saudade",
    "triste",
    "dor",
  ],
  romantic: [
    "love",
    "heart",
    "kiss",
    "baby",
    "amor",
    "paixao",
    "voce",
    "you",
    "lover",
  ],
  energetic: [
    "dance",
    "party",
    "fire",
    "run",
    "jump",
    "hot",
    "club",
    "funk",
    "beat",
  ],
  calm: ["acoustic", "sleep", "dream", "soft", "quiet", "slow", "piano", "calm"],
  dark: ["dark", "black", "devil", "ghost", "bad", "blood", "grave", "shadow"],
  bright: ["sun", "summer", "happy", "gold", "light", "good", "sweet", "dia"],
};

const genreMoodHints = {
  melancholic: ["alternative", "indie", "blues", "folk", "emo", "singer/songwriter"],
  romantic: ["r&b", "soul", "latin", "mpb", "bossa nova"],
  energetic: ["pop", "dance", "electronic", "funk", "hip-hop", "rap", "rock"],
  calm: ["acoustic", "classical", "jazz", "ambient", "new age"],
  dark: ["metal", "industrial", "punk", "hard rock", "trap"],
  bright: ["reggae", "ska", "disco", "k-pop", "j-pop"],
};

const moodAnalysis = {
  melancholic: "leans into a reflective, late-night feeling",
  romantic: "feels intimate and emotionally close",
  energetic: "pushes a more active, high-motion feeling",
  calm: "keeps the mood soft, steady, and spacious",
  dark: "carries a heavier and more shadowed atmosphere",
  bright: "feels lighter, open, and more uplifting",
};

const paceAnalysis = {
  slow: "Its longer shape gives the track room to breathe.",
  steady: "Its medium length keeps the emotion focused without rushing it.",
  quick: "Its tighter length makes the feeling arrive quickly.",
};

const textureAnalysis = {
  polished: "The style suggests a clean, polished sound.",
  warm: "The style points to a warmer and more human texture.",
  raw: "The style gives it a rougher, more direct edge.",
  atmospheric: "The style makes it feel more atmospheric and immersive.",
  rhythmic: "The style is driven by groove and movement.",
};

const globalArtistBoosts = new Map([
  ["michael jackson", 90],
  ["the beatles", 85],
  ["queen", 82],
  ["madonna", 78],
  ["prince", 76],
  ["beyonce", 76],
  ["taylor swift", 76],
  ["rihanna", 74],
  ["drake", 74],
  ["the weeknd", 74],
  ["billie eilish", 72],
  ["bruno mars", 72],
  ["adele", 72],
  ["nirvana", 72],
  ["radiohead", 70],
  ["coldplay", 70],
  ["lady gaga", 70],
]);

const mainstreamArtists = new Set([
  "michael jackson",
  "the beatles",
  "queen",
  "madonna",
  "prince",
  "beyonce",
  "taylor swift",
  "rihanna",
  "drake",
  "the weeknd",
  "billie eilish",
  "bruno mars",
  "adele",
  "nirvana",
  "coldplay",
  "lady gaga",
  "dua lipa",
  "ed sheeran",
  "ariana grande",
  "justin bieber",
  "post malone",
]);

const knownOriginals = new Map([
  ["beat it", "michael jackson"],
  ["billie jean", "michael jackson"],
  ["thriller", "michael jackson"],
  ["bohemian rhapsody", "queen"],
  ["smells like teen spirit", "nirvana"],
  ["like a prayer", "madonna"],
  ["purple rain", "prince"],
  ["rolling in the deep", "adele"],
  ["bad romance", "lady gaga"],
  ["blinding lights", "the weeknd"],
]);

const categoryCatalog = {
  pop: { label: "Pop", terms: ["pop", "dance pop", "pop hits", "top songs"], tags: ["pop", "mainstream", "polished", "bright"] },
  "r&b": { label: "R&B / Soul", terms: ["r&b", "soul", "neo soul", "quiet storm"], tags: ["r&b", "soul", "warm", "romantic"] },
  rock: { label: "Rock", terms: ["rock", "pop rock", "alternative rock", "classic rock"], tags: ["rock", "raw", "guitar", "anthemic"] },
  "hip-hop": { label: "Hip-Hop", terms: ["hip-hop", "rap", "trap", "pop rap"], tags: ["hip-hop", "rap", "rhythmic", "bass"] },
  dance: { label: "Dance / Electronic", terms: ["dance", "electronic", "house", "club"], tags: ["dance", "electronic", "club", "pulse"] },
  indie: { label: "Indie / Alternative", terms: ["indie", "alternative", "dream pop", "singer/songwriter"], tags: ["indie", "alternative", "atmospheric", "intimate"] },
  latin: { label: "Latin", terms: ["latin pop", "reggaeton", "bachata", "urbano latino"], tags: ["latin", "rhythmic", "warm", "dance"] },
  funk: { label: "Funk", terms: ["funk", "funk pop", "funk rock", "boogie"], tags: ["funk", "groove", "bass", "rhythmic"] },
  disco: { label: "Disco", terms: ["disco", "nu disco", "dance pop", "boogie"], tags: ["disco", "dance", "bright", "groove"] },
  "new-wave": { label: "New Wave", terms: ["new wave", "synth pop", "post-punk", "80s pop"], tags: ["new-wave", "synth", "retro", "bright"] },
  "synth-pop": { label: "Synth Pop", terms: ["synth pop", "electropop", "new wave", "dream pop"], tags: ["synth", "electronic", "polished", "atmospheric"] },
  trap: { label: "Trap", terms: ["trap", "rap", "hip-hop", "dark trap"], tags: ["trap", "bass", "dark", "rhythmic"] },
  reggaeton: { label: "Reggaeton", terms: ["reggaeton", "urbano latino", "latin urban", "dembow"], tags: ["reggaeton", "latin", "dance", "rhythmic"] },
  mpb: { label: "MPB", terms: ["mpb", "bossa nova", "brazilian", "samba"], tags: ["mpb", "brazilian", "warm", "organic"] },
  jazz: { label: "Jazz", terms: ["jazz", "vocal jazz", "smooth jazz", "bebop"], tags: ["jazz", "warm", "organic", "improvised"] },
  blues: { label: "Blues", terms: ["blues", "electric blues", "soul blues", "blues rock"], tags: ["blues", "raw", "melancholic", "guitar"] },
  folk: { label: "Folk", terms: ["folk", "singer/songwriter", "americana", "indie folk"], tags: ["folk", "acoustic", "organic", "intimate"] },
  acoustic: { label: "Acoustic", terms: ["acoustic", "unplugged", "singer/songwriter", "piano"], tags: ["acoustic", "organic", "calm", "intimate"] },
  ambient: { label: "Ambient", terms: ["ambient", "new age", "chill", "downtempo"], tags: ["ambient", "calm", "atmospheric", "spacious"] },
  metal: { label: "Metal", terms: ["metal", "hard rock", "heavy metal", "metalcore"], tags: ["metal", "heavy", "dark", "raw"] },
  punk: { label: "Punk", terms: ["punk", "pop punk", "post-punk", "garage rock"], tags: ["punk", "raw", "fast", "guitar"] },
  "k-pop": { label: "K-Pop", terms: ["k-pop", "korean pop", "kpop", "idol"], tags: ["k-pop", "pop", "polished", "bright"] },
  soundtrack: { label: "Soundtrack", terms: ["soundtrack", "score", "cinematic", "theme"], tags: ["soundtrack", "cinematic", "atmospheric", "dramatic"] },
  calm: { label: "Calm", terms: ["acoustic", "ambient", "piano", "chill"], tags: ["calm", "soft", "spacious", "warm"] },
  dark: { label: "Dark", terms: ["dark pop", "alternative", "industrial", "trap"], tags: ["dark", "moody", "heavy", "atmospheric"] },
  party: { label: "Party", terms: ["party", "dance", "club", "pop hits"], tags: ["party", "dance", "bright", "pulse"] },
  workout: { label: "Workout", terms: ["workout", "edm", "hip-hop", "rock"], tags: ["workout", "energetic", "pulse", "heavy"] },
  "night-drive": { label: "Night Drive", terms: ["synthwave", "dark pop", "indie electronic", "night drive"], tags: ["night-drive", "synth", "dark", "atmospheric"] },
  heartbreak: { label: "Heartbreak", terms: ["heartbreak", "sad songs", "r&b", "ballad"], tags: ["heartbreak", "melancholic", "romantic", "intimate"] },
};

const surpriseQueries = [
  "Blinding Lights The Weeknd",
  "Bad Guy Billie Eilish",
  "Get Lucky Daft Punk",
  "Dreams Fleetwood Mac",
  "Sweater Weather The Neighbourhood",
  "Levitating Dua Lipa",
  "Come As You Are Nirvana",
  "Redbone Childish Gambino",
];

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const term = queryInput.value.trim();

  if (!term) return;

  await runRecommendation(term);
});

categoryButton.addEventListener("click", async () => {
  await runCategory(categoryInput.value);
});

surpriseButton.addEventListener("click", async () => {
  const query = surpriseQueries[Math.floor(Math.random() * surpriseQueries.length)];
  queryInput.value = query;
  await runRecommendation(query);
});

similarityInput.addEventListener("input", updateSimilarityLabel);

results.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const card = button.closest(".track-card");
  const track = currentTracks.get(card?.dataset.trackId);
  if (!track) return;

  if (button.classList.contains("more-like")) {
    queryInput.value = `${track.trackName} ${track.artistName}`;
    await runFromSeed(track);
  }

  if (button.classList.contains("favorite")) {
    toggleFavorite(track);
    renderFavorites();
    button.textContent = isFavorite(track) ? "Saved" : "Save";
  }
});

historyList.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  queryInput.value = button.dataset.query;
  await runRecommendation(button.dataset.query);
});

favoritesList.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  queryInput.value = button.dataset.query;
  await runRecommendation(button.dataset.query);
});

updateSimilarityLabel();
renderHistory();
renderFavorites();

async function runRecommendation(term) {
  setLoading(true, `Searching the iTunes catalog... ${APP_VERSION}`);
  seedSection.hidden = true;
  results.innerHTML = "";

  try {
    const country = countryInput.value;
    const seed = await findSeedTrack(term, country);

    if (!seed) {
      setStatus("I could not find a song for that search. Try another artist or track.");
      return;
    }

    addHistory(term);
    await runFromSeed(seed);
  } catch (error) {
    console.error(error);
    setStatus(`Search failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
}

async function runFromSeed(seed) {
  setLoading(true, `Analyzing the reference preview... ${APP_VERSION}`);
  seedSection.hidden = true;
  results.innerHTML = "";

  try {
    const country = countryInput.value;
    seed.audioFeatures = seed.audioFeatures || (await analyzeTrackAudio(seed));
    renderSeed(seed);
    setStatus(
      seed.audioFeatures
        ? "Analyzing candidate previews and matching the closest feel..."
        : "This reference preview could not be analyzed. Recommendations will be weaker.",
    );

    const selectedMood = moodInput.value === "auto" ? inferMood(seed, seed.audioFeatures) : moodInput.value;
    const candidates = await collectCandidates(seed, country, selectedMood);
    const recommendations = await rankTracks(seed, candidates, selectedMood, similarityValue());

    if (!recommendations.length) {
      setStatus("I found the reference, but not enough strong recommendations.");
      return;
    }

    renderResults(recommendations);
    setStatus(
      `${APP_VERSION}: analyzed ${recommendations.filter((track) => track.audioFeatures).length} usable previews and selected ${recommendations.length} close matches.`,
    );
  } catch (error) {
    console.error(error);
    setStatus(`Search failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
}

async function runCategory(category) {
  setLoading(true, `Exploring ${category}... ${APP_VERSION}`);
  seedSection.hidden = true;
  seedCard.innerHTML = "";
  results.innerHTML = "";

  try {
    const terms = categoryData(category).terms;
    const country = countryInput.value;
    const batches = await Promise.all(
      terms.map((term) => searchItunes({ term, country, limit: 35 })),
    );
    const candidates = prioritizeCategoryPool(
      category,
      dedupeTracks(batches.flat().filter(isSong)),
    );
    const analyzed = await mapWithConcurrency(candidates.slice(0, AUDIO_ANALYSIS_LIMIT), 6, async (track) => ({
      ...track,
      audioFeatures: await analyzeTrackAudio(track),
    }));
    const recommendations = rankCategoryTracks(category, analyzed, moodInput.value, similarityValue());

    renderResults(recommendations);
    setStatus(`${APP_VERSION}: ${recommendations.length} ${category} tracks matched by category feel.`);
  } catch (error) {
    console.error(error);
    setStatus(`Search failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
}

clearCacheButton.addEventListener("click", () => {
  localStorage.removeItem(CACHE_KEY);
  setStatus("Local cache cleared. The next searches will call iTunes again.");
});

async function findSeedTrack(term, country) {
  const [defaultResults, songResults, artistResults, usResults] = await Promise.all([
    searchItunes({ term, country, limit: 50 }),
    searchItunes({ term, country, attribute: "songTerm", limit: 25 }),
    searchItunes({ term, country, attribute: "artistTerm", limit: 25 }),
    country === "US" ? Promise.resolve([]) : searchItunes({ term, country: "US", limit: 25 }),
  ]);

  const combined = mergeSearchResults([
    { results: defaultResults, weight: 130 },
    { results: songResults, weight: 120 },
    { results: usResults, weight: 115 },
    { results: artistResults, weight: 55 },
  ]).filter(isSong);

  return dedupeTracks(combined).sort((a, b) => seedScore(term, b) - seedScore(term, a))[0];
}

async function collectCandidates(seed, country, mood) {
  const terms = candidateSearchTerms(seed, mood);

  const batches = await Promise.all(
    terms.map((term) => searchItunes({ term, country, limit: 45 })),
  );

  const usBatches =
    country === "US"
      ? []
      : await Promise.all(
          terms
            .slice(0, 4)
            .map((term) => searchItunes({ term, country: "US", limit: 35 })),
        );

  return prioritizeCandidatePool(seed, dedupeTracks([...batches, ...usBatches].flat().filter(isSong)));
}

async function searchItunes({ term, country, attribute, limit }) {
  const params = new URLSearchParams({
    term,
    country,
    media: "music",
    entity: "song",
    limit: String(limit),
  });

  if (attribute) params.set("attribute", attribute);

  const query = params.toString();
  const cacheKey = `${API_URL}?${query}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const data = await fetchItunes(query);
  writeCache(cacheKey, data.results || []);
  return data.results || [];
}

async function fetchItunes(query) {
  const proxyUrl = `${PROXY_API_URL}?${query}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`/api/itunes returned ${response.status}`);
    }

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data;
  } catch (error) {
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      return jsonp(`${API_URL}?${query}`);
    }

    throw error;
  }
}

function jsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `vibingEchoCallback_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;
    const script = document.createElement("script");
    const separator = url.includes("?") ? "&" : "?";
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("iTunes request timed out"));
    }, 12000);

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.src = `${url}${separator}callback=${callbackName}`;
    script.onerror = () => {
      cleanup();
      reject(new Error("iTunes request failed"));
    };

    document.body.appendChild(script);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }
  });
}

async function rankTracks(seed, tracks, mood, similarity = 0.72) {
  const seedProfile = vibeProfile(seed, seed.audioFeatures);
  const seedTags = trackTags(seed, seedProfile);
  const analyzedTracks = await mapWithConcurrency(tracks.slice(0, AUDIO_ANALYSIS_LIMIT), 6, async (track) => ({
      ...track,
      audioFeatures: await analyzeTrackAudio(track),
    }));

  const ranked = analyzedTracks
    .filter((track) => track.trackId !== seed.trackId)
    .map((track) => {
      const reasons = [];
      let score = 0;
      const profile = vibeProfile(track, track.audioFeatures);
      const tags = trackTags(track, profile);
      const sharedTags = intersection(seedTags, tags);
      const audioSimilarity = compareAudioFeatures(seed.audioFeatures, track.audioFeatures);

      if (audioSimilarity.available) {
        score += Math.round(audioSimilarity.score * (56 + similarity * 42));
        reasons.push(audioSimilarity.reason);
      } else if (seed.audioFeatures) {
        score -= Math.round(10 + similarity * 22);
      }

      const moodMatch = inferMood(track, track.audioFeatures) === mood;
      if (moodMatch) {
        score += audioSimilarity.available ? 8 + Math.round((1 - similarity) * 8) : 24;
        reasons.push(`${moodLabels[mood]} emotional profile`);
      }

      const durationDiff = Math.abs((seed.trackTimeMillis || 0) - (track.trackTimeMillis || 0));
      if (durationDiff && durationDiff < 45000) {
        score += audioSimilarity.available ? 5 : 16;
        reasons.push("similar pacing");
      }

      if (profile.pace === seedProfile.pace) {
        score += 6;
        reasons.push(`${profile.pace} pace`);
      }

      if (profile.texture === seedProfile.texture) {
        score += 6;
        reasons.push(`${profile.texture} texture`);
      }

      if (same(seed.primaryGenreName, track.primaryGenreName)) {
        score += audioSimilarity.available ? Math.round(3 + (1 - similarity) * 10) : 24;
        reasons.push(`nearby sound: ${track.primaryGenreName}`);
      }

      if (same(seed.artistName, track.artistName)) {
        score += 4;
      }

      score += Math.min(sharedTags.length * Math.round(4 + similarity * 8), 42);
      if (sharedTags.length) {
        reasons.push(`${sharedTags.length} shared categories`);
      }

      if (isLowQualityVariant(track)) {
        score -= 35;
      }

      score += discoveryScore(track, tags);

      return {
        ...track,
        score: Math.min(score, 99),
        reasons: reasons.slice(0, 3),
        mood: profile.mood,
        profile,
        tags,
        sharedTags,
        analysis: vibeAnalysis(track, seed, profile, audioSimilarity, sharedTags),
      };
    })
    .sort((a, b) => b.score - a.score);

  const audioRanked = ranked.filter((track) => track.audioFeatures && track.score >= 48 + similarity * 12);
  const fallbackRanked = ranked.filter((track) => !track.audioFeatures && track.score >= 42);
  const primary = diversifyTracks(audioRanked, 12, { strict: similarity > 0.55 });

  if (primary.length >= 6) {
    return primary;
  }

  return diversifyTracks([...primary, ...fallbackRanked], 12, { strict: false });
}

function diversifyTracks(tracks, limit, options = {}) {
  const selected = [];
  const profileCount = new Map();
  const artistCount = new Map();
  const tagCount = new Map();
  const strict = options.strict ?? false;

  for (const track of [...tracks].sort((a, b) => finalDiscoverySort(b) - finalDiscoverySort(a))) {
    const profileKey = `${track.profile.mood}-${track.profile.pace}-${track.profile.texture}`;
    const artistKey = normalize(track.artistName);
    const profileUses = profileCount.get(profileKey) || 0;
    const artistUses = artistCount.get(artistKey) || 0;
    const saturatedTags = (track.tags || []).filter((tag) => (tagCount.get(tag) || 0) >= 3).length;

    if (
      profileUses >= (strict ? 1 : 2) ||
      artistUses >= 1 ||
      saturatedTags >= (strict ? 1 : 3)
    ) {
      continue;
    }

    selected.push(track);
    profileCount.set(profileKey, profileUses + 1);
    artistCount.set(artistKey, artistUses + 1);
    (track.tags || []).forEach((tag) => tagCount.set(tag, (tagCount.get(tag) || 0) + 1));

    if (selected.length === limit) {
      return selected;
    }
  }

  return selected;
}

function candidateSearchTerms(seed, mood) {
  const genre = seed.primaryGenreName || "";
  const normalizedGenre = normalize(genre);
  const terms = [
    seed.artistName,
    genre,
    ...genreFamily(normalizedGenre),
    ...genreMoodHints[mood].slice(0, 2),
  ];

  return [...new Set(terms.filter(Boolean).map((term) => term.trim()).filter(Boolean))].slice(0, 8);
}

function genreFamily(genre) {
  if (genre.includes("pop")) {
    return ["pop", "dance pop", "funk", "r&b", "rock"];
  }
  if (genre.includes("rock")) {
    return ["rock", "pop rock", "alternative", "funk rock", "new wave"];
  }
  if (genre.includes("r&b") || genre.includes("soul")) {
    return ["r&b", "soul", "funk", "pop", "quiet storm"];
  }
  if (genre.includes("hip-hop") || genre.includes("rap")) {
    return ["hip-hop", "rap", "trap", "r&b", "pop rap"];
  }
  if (genre.includes("dance") || genre.includes("electronic")) {
    return ["dance", "electronic", "house", "pop", "club"];
  }
  if (genre.includes("alternative") || genre.includes("indie")) {
    return ["alternative", "indie", "rock", "dream pop", "singer/songwriter"];
  }
  if (genre.includes("latin")) {
    return ["latin", "reggaeton", "latin pop", "bachata", "urbano latino"];
  }
  return [genre];
}

function prioritizeCandidatePool(seed, tracks) {
  const seedGenre = normalize(seed.primaryGenreName);
  const seedArtist = normalize(seed.artistName);

  return tracks
    .map((track, index) => {
      let priority = Math.max(0, 120 - index);
      const genre = normalize(track.primaryGenreName);
      const artist = normalize(track.artistName);

      if (track.previewUrl) priority += 80;
      if (genre === seedGenre) priority += 35;
      if (genreFamily(seedGenre).some((term) => genre.includes(normalize(term)))) priority += 20;
      if (artist === seedArtist) priority -= 18;
      if (mainstreamArtists.has(artist)) priority -= 20;
      priority += midRankDiscoveryBonus(index);
      if (isLowQualityVariant(track)) priority -= 140;

      return { ...track, candidatePriority: priority };
    })
    .sort((a, b) => b.candidatePriority - a.candidatePriority);
}

function prioritizeCategoryPool(category, tracks) {
  const family = categoryData(category).terms;

  return tracks
    .map((track, index) => {
      const genre = normalize(track.primaryGenreName);
      const text = normalize(`${track.trackName} ${track.artistName} ${track.collectionName}`);
      let priority = Math.max(0, 110 - index);

      if (track.previewUrl) priority += 70;
      if (family.some((term) => genre.includes(normalize(term)) || text.includes(normalize(term)))) {
        priority += 45;
      }
      if (mainstreamArtists.has(normalize(track.artistName))) priority -= 24;
      priority += midRankDiscoveryBonus(index);
      if (isLowQualityVariant(track)) priority -= 120;

      return { ...track, candidatePriority: priority };
    })
    .sort((a, b) => b.candidatePriority - a.candidatePriority);
}

function rankCategoryTracks(category, tracks, selectedMood, similarity) {
  const categoryInfo = categoryData(category);
  const family = categoryInfo.terms;
  const categoryTags = new Set(categoryInfo.tags);
  const wantedMood = selectedMood === "auto" ? null : selectedMood;
  const ranked = tracks
    .map((track) => {
      const profile = vibeProfile(track, track.audioFeatures);
      const tags = trackTags(track, profile);
      const sharedTags = intersection([...categoryTags], tags);
      const genre = normalize(track.primaryGenreName);
      const text = normalize(`${track.trackName} ${track.artistName} ${track.collectionName}`);
      let score = track.audioFeatures ? 45 : 18;

      if (family.some((term) => genre.includes(normalize(term)) || text.includes(normalize(term)))) {
        score += 34;
      }
      score += Math.min(sharedTags.length * 10, 42);
      if (wantedMood && profile.mood === wantedMood) {
        score += 18;
      }
      if (track.audioFeatures) {
        score += Math.round((track.audioFeatures.energy + track.audioFeatures.pulse) * 12);
      }
      if (isLowQualityVariant(track)) {
        score -= 35;
      }
      score += discoveryScore(track, tags);

      return {
        ...track,
        score: Math.min(score, 99),
        mood: profile.mood,
        profile,
        tags,
        analysis: categoryAnalysis(track, categoryInfo, profile, sharedTags),
      };
    })
    .filter((track) => track.score >= 42)
    .sort((a, b) => b.score - a.score);

  return diversifyTracks(ranked, similarity > 0.65 ? 10 : 12, { strict: similarity > 0.65 });
}

function categoryAnalysis(track, categoryInfo, profile, sharedTags) {
  const audioLine = track.audioFeatures
    ? "Its preview was analyzed for energy, pulse, brightness, and warmth."
    : "It is included from category relevance because the preview could not be analyzed.";
  const tagLine = sharedTags.length
    ? `Shared tags: ${sharedTags.slice(0, 4).join(", ")}.`
    : "It connects through the broader category mood.";
  const discoveryLine = mainstreamArtists.has(normalize(track.artistName))
    ? "It stays because it strongly fits the category."
    : "It is prioritized as a less obvious discovery.";

  return `${moodAnalysis[profile.mood]}. ${paceAnalysis[profile.pace]} ${textureAnalysis[profile.texture]} ${audioLine} ${tagLine} ${discoveryLine} This makes it fit the ${categoryInfo.label} lane while keeping its own identity.`;
}

function categoryData(category) {
  return categoryCatalog[category] || {
    label: category,
    terms: [category],
    tags: [category],
  };
}

function trackTags(track, profile = vibeProfile(track, track.audioFeatures)) {
  const genre = normalize(track.primaryGenreName);
  const text = normalize(`${track.trackName} ${track.artistName} ${track.collectionName}`);
  const tags = new Set([profile.mood, profile.pace, profile.texture]);

  for (const [key, category] of Object.entries(categoryCatalog)) {
    const hasTerm = category.terms.some((term) => {
      const normalizedTerm = normalize(term);
      return genre.includes(normalizedTerm) || text.includes(normalizedTerm);
    });

    if (hasTerm) {
      tags.add(key);
      category.tags.forEach((tag) => tags.add(tag));
    }
  }

  if (track.audioFeatures) {
    if (track.audioFeatures.energy > 0.68) tags.add("energetic");
    if (track.audioFeatures.energy < 0.35) tags.add("soft");
    if (track.audioFeatures.pulse > 0.6) tags.add("pulse");
    if (track.audioFeatures.brightness > 0.62) tags.add("bright");
    if (track.audioFeatures.brightness < 0.34) tags.add("dark");
    if (track.audioFeatures.warmth > 0.58) tags.add("warm");
    if (track.audioFeatures.dynamics > 0.5) tags.add("dynamic");
  }

  const releaseYear = year(track.releaseDate);
  if (!Number.isNaN(releaseYear)) {
    if (releaseYear < 1980) tags.add("classic");
    else if (releaseYear < 1990) tags.add("80s");
    else if (releaseYear < 2000) tags.add("90s");
    else if (releaseYear < 2010) tags.add("2000s");
    else if (releaseYear < 2020) tags.add("2010s");
    else tags.add("current");
  }

  return [...tags].filter(Boolean);
}

function intersection(first, second) {
  const secondSet = new Set(second);
  return first.filter((item) => secondSet.has(item));
}

function discoveryScore(track, tags = []) {
  const artist = normalize(track.artistName);
  const searchRank = track.searchRank || 0;
  let score = 0;

  if (!mainstreamArtists.has(artist)) score += 24;
  else score -= 18;

  if (track.previewUrl) score += 10;
  if (tags.length >= 8) score += 12;
  if (searchRank > 0 && searchRank < 96) score += 14;
  if (searchRank >= 120) score -= 18;

  const collection = normalize(track.collectionName);
  if (/greatest hits|the best|essential|collection|karaoke|tribute/.test(collection)) {
    score -= 20;
  }

  return score;
}

function midRankDiscoveryBonus(index) {
  if (index >= 8 && index <= 32) return 22;
  if (index > 32) return 10;
  return -8;
}

function finalDiscoverySort(track) {
  return (track.score || 0) + discoveryScore(track, track.tags || []) * 0.7;
}

function isLowQualityVariant(track) {
  const text = normalize(`${track.trackName} ${track.artistName} ${track.collectionName}`);
  return /karaoke|tribute|cover|instrumental|lullaby|remix|sped up|slowed|made famous by/.test(
    text,
  );
}

function vibeProfile(track, features = null) {
  const mood = inferMood(track, features);
  const duration = track.trackTimeMillis || 0;
  const genre = normalize(track.primaryGenreName || "");
  const title = normalize(`${track.trackName} ${track.collectionName}`);

  let pace = "steady";
  if (duration && duration < 170000) pace = "quick";
  if (duration && duration > 245000) pace = "slow";
  if (genre.includes("dance") || genre.includes("electronic") || genre.includes("funk")) {
    pace = "quick";
  }
  if (genre.includes("classical") || genre.includes("ambient") || title.includes("acoustic")) {
    pace = "slow";
  }
  if (features) {
    if (features.pulse > 0.63) pace = "quick";
    if (features.pulse < 0.36) pace = "slow";
  }

  let texture = "polished";
  if (genre.includes("soul") || genre.includes("r&b") || genre.includes("jazz") || genre.includes("mpb")) {
    texture = "warm";
  }
  if (genre.includes("rock") || genre.includes("punk") || genre.includes("metal") || genre.includes("blues")) {
    texture = "raw";
  }
  if (genre.includes("ambient") || genre.includes("alternative") || genre.includes("indie")) {
    texture = "atmospheric";
  }
  if (genre.includes("hip-hop") || genre.includes("rap") || genre.includes("dance") || genre.includes("funk")) {
    texture = "rhythmic";
  }
  if (features) {
    if (features.brightness > 0.62 && features.dynamics < 0.34) texture = "polished";
    if (features.brightness < 0.38 && features.dynamics > 0.44) texture = "raw";
    if (features.brightness < 0.42 && features.pulse < 0.42) texture = "atmospheric";
    if (features.pulse > 0.58 && features.dynamics > 0.32) texture = "rhythmic";
    if (features.warmth > 0.55) texture = "warm";
  }

  return { mood, pace, texture };
}

function vibeAnalysis(track, seed, profile, audioSimilarity, sharedTags = []) {
  const genre = track.primaryGenreName || "its genre";
  const seedMood = moodLabels[inferMood(seed, seed.audioFeatures)];
  const currentMood = moodLabels[profile.mood];
  const contrast =
    currentMood === seedMood
      ? `It stays close to the reference's ${seedMood} emotional lane.`
      : `It adds a ${currentMood} shade around the reference's ${seedMood} center.`;

  const audioLine = audioSimilarity.available
    ? `The preview analysis puts it close to the reference in ${audioSimilarity.reason.replace("similar ", "")}, so this is based on the audio preview rather than just catalog tags.`
    : "The preview could not be analyzed, so this match uses catalog signals only.";
  const tagLine = sharedTags.length
    ? `It also shares ${sharedTags.slice(0, 5).join(", ")} categories.`
    : "It has fewer category overlaps, so the match leans more on sound and mood.";
  const discoveryLine = mainstreamArtists.has(normalize(track.artistName))
    ? "It is a more familiar pick, so it only stays when the match is strong."
    : "It gets a discovery boost for being a less obvious pick.";

  return `${moodAnalysis[profile.mood]}. ${paceAnalysis[profile.pace]} ${textureAnalysis[profile.texture]} ${audioLine} ${tagLine} ${discoveryLine} In context, ${genre} keeps it distinct instead of just repeating the same match. ${contrast}`;
}

function inferMood(track, features = null) {
  if (features) {
    if (features.energy > 0.66 && features.pulse > 0.56) return "energetic";
    if (features.energy < 0.34 && features.brightness < 0.46) return "melancholic";
    if (features.energy < 0.38 && features.pulse < 0.42) return "calm";
    if (features.brightness < 0.34 && features.dynamics > 0.42) return "dark";
    if (features.brightness > 0.62 && features.energy > 0.44) return "bright";
    if (features.warmth > 0.56 && features.energy < 0.62) return "romantic";
  }

  const haystack = normalize(
    `${track.trackName} ${track.collectionName} ${track.artistName} ${track.primaryGenreName}`,
  );

  const scores = Object.fromEntries(Object.keys(moodLexicon).map((mood) => [mood, 0]));

  for (const [mood, words] of Object.entries(moodLexicon)) {
    for (const word of words) {
      if (haystack.includes(word)) scores[mood] += 2;
    }
  }

  const genre = normalize(track.primaryGenreName || "");
  for (const [mood, hints] of Object.entries(genreMoodHints)) {
    for (const hint of hints) {
      if (genre.includes(normalize(hint))) scores[mood] += 3;
    }
  }

  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function renderSeed(track) {
  const profile = vibeProfile(track, track.audioFeatures);
  const audioStatus = track.audioFeatures ? "audio preview analyzed" : "audio preview not analyzed";
  seedSection.hidden = false;
  seedCard.innerHTML = `
    <img class="cover" src="${artwork(track, 300)}" alt="Capa de ${escapeHtml(track.trackName)}" />
    <div class="track-info">
      <div class="match-row">
        <span class="mood-tag">${moodLabels[profile.mood]} / ${profile.texture} ${profile.pace}</span>
      </div>
      <h3>${escapeHtml(track.trackName)}</h3>
      <p class="artist">${escapeHtml(track.artistName)} - ${escapeHtml(track.primaryGenreName || "Unknown genre")}</p>
      <p class="why">${escapeHtml(track.collectionName || "Album not available")} ${year(track.releaseDate) || ""}. ${audioStatus}. ${APP_VERSION}.</p>
      <div class="actions">
        ${track.previewUrl ? `<audio controls preload="none" src="${track.previewUrl}"></audio>` : ""}
        <a href="${track.trackViewUrl}" target="_blank" rel="noreferrer">Open in iTunes</a>
      </div>
      <small>Preview provided courtesy of iTunes.</small>
    </div>
  `;
}

function renderResults(tracks) {
  results.innerHTML = "";
  currentTracks.clear();

  for (const track of tracks) {
    const node = template.content.cloneNode(true);
    const article = node.querySelector(".track-card");
    const trackKey = String(track.trackId || `${track.artistName}-${track.trackName}`);
    currentTracks.set(trackKey, track);
    article.dataset.trackId = trackKey;
    node.querySelector(".cover").src = artwork(track, 300);
    node.querySelector(".cover").alt = `Cover of ${track.trackName}`;
    node.querySelector(".match-score").textContent = `${Math.round(track.score)}% match`;
    node.querySelector(".mood-tag").textContent =
      `${moodLabels[track.mood]} / ${track.profile.texture} ${track.profile.pace}`;
    node.querySelector("h3").textContent = track.trackName;
    node.querySelector(".artist").textContent = `${track.artistName} - ${track.primaryGenreName || "Unknown genre"}`;
    node.querySelector(".why").textContent = track.analysis;
    node.querySelector(".match-row").insertAdjacentHTML("beforeend", tagBadges(track));
    node.querySelector(".vibe-bars").innerHTML = vibeBars(track);

    const audio = node.querySelector("audio");
    if (track.previewUrl) {
      audio.src = track.previewUrl;
    } else {
      audio.remove();
    }

    const link = node.querySelector("a");
    link.href = track.trackViewUrl;
    link.textContent = "Open in iTunes";
    node.querySelector(".favorite").textContent = isFavorite(track) ? "Saved" : "Save";

    results.appendChild(node);
  }
}

function tagBadges(track) {
  const tags = (track.sharedTags?.length ? track.sharedTags : track.tags || []).slice(0, 4);
  return tags.map((tag) => `<span class="category-tag">${escapeHtml(tag)}</span>`).join("");
}

function seedScore(term, track) {
  const normalizedTerm = normalize(term);
  const normalizedTitle = normalize(track.trackName);
  const normalizedArtist = normalize(track.artistName);
  const normalizedAlbum = normalize(track.collectionName);
  const titleAndArtist = normalize(`${track.trackName} ${track.artistName}`);
  const artistAndTitle = normalize(`${track.artistName} ${track.trackName}`);
  const searchRank = track.searchRank || 0;
  let score = 0;
  if (titleAndArtist === normalizedTerm || artistAndTitle === normalizedTerm) score += 720;
  if (titleAndArtist.includes(normalizedTerm) || artistAndTitle.includes(normalizedTerm)) score += 220;
  if (normalizedTitle === normalizedTerm) score += 520;
  if (normalizedTitle.startsWith(normalizedTerm)) score += 120;
  if (normalizedTitle.includes(normalizedTerm)) score += 80;
  if (normalizedArtist.includes(normalizedTerm)) score += 35;
  if (normalizedAlbum.includes(normalizedTerm)) score += 10;
  if (track.previewUrl) score += 25;
  if (track.artworkUrl100) score += 10;
  score += searchRank;
  score += track.popularityProxy || 0;

  if (normalizedTitle === normalizedTerm) {
    score += globalArtistBoosts.get(normalizedArtist) || 0;
  }

  const knownArtist = knownOriginals.get(normalizedTerm);
  if (knownArtist && normalizedArtist === knownArtist) {
    score += 260;
  }

  const queryAsksForVariant = /live|remix|karaoke|cover|tribute|instrumental|sped|slowed/.test(
    normalizedTerm,
  );
  if (!queryAsksForVariant && isLowQualityVariant(track)) {
    score -= 220;
  }

  return score;
}

function mergeSearchResults(groups) {
  const byKey = new Map();

  for (const group of groups) {
    group.results.forEach((track, index) => {
      if (!isSong(track)) return;

      const key = track.trackId || `${normalize(track.artistName)}-${normalize(track.trackName)}`;
      const relevance = Math.max(0, group.weight - index * 2);
      const current = byKey.get(key);

      if (!current) {
        byKey.set(key, {
          ...track,
          searchRank: relevance,
          popularityProxy: relevance,
          sourceHits: 1,
        });
        return;
      }

      current.searchRank = Math.max(current.searchRank || 0, relevance);
      current.popularityProxy = (current.popularityProxy || 0) + relevance;
      current.sourceHits = (current.sourceHits || 1) + 1;
    });
  }

  return [...byKey.values()];
}

function tokens(value) {
  return normalize(value)
    .split(" ")
    .filter((word) => word.length > 3);
}

function dedupeTracks(tracks) {
  const seen = new Set();
  return tracks.filter((track) => {
    const key = track.trackId || `${track.artistName}-${track.trackName}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isSong(item) {
  return item && item.wrapperType === "track" && item.kind === "song" && item.trackName;
}

function same(a, b) {
  return normalize(a) === normalize(b);
}

function year(date) {
  return new Date(date).getFullYear();
}

function artwork(track, size) {
  return (track.artworkUrl100 || "").replace("100x100", `${size}x${size}`);
}

function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9/& ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readCache(key) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    const item = cache[key];
    if (!item || Date.now() - item.createdAt > CACHE_TTL) return null;
    return item.value;
  } catch (error) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

function writeCache(key, value) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    cache[key] = { createdAt: Date.now(), value: value.slice(0, 30) };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    localStorage.removeItem(CACHE_KEY);
  }
}

function setStatus(message) {
  statusText.textContent = message;
}

function setLoading(isLoading, message) {
  form.querySelector("button").disabled = isLoading;
  categoryButton.disabled = isLoading;
  surpriseButton.disabled = isLoading;
  if (message) setStatus(message);
}

function similarityValue() {
  return Number(similarityInput.value) / 100;
}

function updateSimilarityLabel() {
  const value = similarityValue();
  if (value < 0.35) similarityLabel.textContent = "wider discovery";
  else if (value < 0.7) similarityLabel.textContent = "balanced match";
  else similarityLabel.textContent = "closer sound";
}

function vibeBars(track) {
  const features = track.audioFeatures || fallbackFeatures(track.profile || vibeProfile(track));
  const meters = [
    ["Energy", features.energy],
    ["Pulse", features.pulse],
    ["Brightness", features.brightness],
    ["Warmth", features.warmth],
  ];

  return meters
    .map(
      ([label, value]) => `
        <div class="vibe-meter">
          <span>${label}</span>
          <div class="meter-track"><div class="meter-fill" style="--value: ${Math.round(
            clamp(value, 0, 1) * 100,
          )}%"></div></div>
        </div>
      `,
    )
    .join("");
}

function fallbackFeatures(profile) {
  const moodValues = {
    melancholic: { energy: 0.34, pulse: 0.34, brightness: 0.28, warmth: 0.52 },
    romantic: { energy: 0.46, pulse: 0.42, brightness: 0.48, warmth: 0.72 },
    energetic: { energy: 0.82, pulse: 0.76, brightness: 0.62, warmth: 0.48 },
    calm: { energy: 0.26, pulse: 0.24, brightness: 0.44, warmth: 0.62 },
    dark: { energy: 0.48, pulse: 0.42, brightness: 0.22, warmth: 0.34 },
    bright: { energy: 0.62, pulse: 0.58, brightness: 0.82, warmth: 0.56 },
  };

  return moodValues[profile.mood] || moodValues.calm;
}

function addHistory(query) {
  const history = readList(HISTORY_KEY).filter((item) => item !== query);
  history.unshift(query);
  writeList(HISTORY_KEY, history.slice(0, 8));
  renderHistory();
}

function renderHistory() {
  const history = readList(HISTORY_KEY);
  historyList.innerHTML = history.length
    ? history
        .map((query) => `<button type="button" data-query="${escapeHtml(query)}">${escapeHtml(query)}</button>`)
        .join("")
    : `<span class="empty-chip">No searches yet</span>`;
}

function toggleFavorite(track) {
  const favorites = readList(FAVORITES_KEY);
  const key = favoriteKey(track);
  const exists = favorites.some((item) => item.key === key);
  const next = exists
    ? favorites.filter((item) => item.key !== key)
    : [
        {
          key,
          query: `${track.trackName} ${track.artistName}`,
          label: `${track.trackName} - ${track.artistName}`,
        },
        ...favorites,
      ].slice(0, 10);

  writeList(FAVORITES_KEY, next);
}

function renderFavorites() {
  const favorites = readList(FAVORITES_KEY);
  favoritesList.innerHTML = favorites.length
    ? favorites
        .map(
          (item) =>
            `<button type="button" data-query="${escapeHtml(item.query)}">${escapeHtml(item.label)}</button>`,
        )
        .join("")
    : `<span class="empty-chip">No favorites saved</span>`;
}

function isFavorite(track) {
  const key = favoriteKey(track);
  return readList(FAVORITES_KEY).some((item) => item.key === key);
}

function favoriteKey(track) {
  return String(track.trackId || `${normalize(track.artistName)}-${normalize(track.trackName)}`);
}

function readList(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (error) {
    localStorage.removeItem(key);
    return [];
  }
}

function writeList(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function analyzeTrackAudio(track) {
  if (!track.previewUrl) return null;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    const response = await fetch(`${AUDIO_PROXY_URL}?url=${encodeURIComponent(track.previewUrl)}`);
    if (!response.ok) return null;

    const buffer = await response.arrayBuffer();
    const context = new AudioContextClass();
    const decoded = await context.decodeAudioData(buffer);
    const samples = decoded.getChannelData(0);
    await context.close();

    return extractAudioFeatures(samples, decoded.sampleRate);
  } catch (error) {
    return null;
  }
}

function extractAudioFeatures(samples, sampleRate) {
  const frameSize = 2048;
  const hop = 2048;
  const energies = [];
  const zeroCrossings = [];
  let previousFrameEnergy = 0;
  let onsetEnergy = 0;
  let totalAbs = 0;

  for (let start = 0; start + frameSize < samples.length; start += hop) {
    let sumSquares = 0;
    let crossings = 0;
    let absSum = 0;

    for (let i = start + 1; i < start + frameSize; i++) {
      const sample = samples[i];
      const previous = samples[i - 1];
      sumSquares += sample * sample;
      absSum += Math.abs(sample);
      if ((sample >= 0 && previous < 0) || (sample < 0 && previous >= 0)) {
        crossings++;
      }
    }

    const rms = Math.sqrt(sumSquares / frameSize);
    energies.push(rms);
    zeroCrossings.push(crossings / frameSize);
    totalAbs += absSum / frameSize;

    if (rms > previousFrameEnergy * 1.24 && rms > 0.018) {
      onsetEnergy++;
    }
    previousFrameEnergy = rms;
  }

  const avgEnergy = average(energies);
  const energyStd = standardDeviation(energies, avgEnergy);
  const brightness = clamp(average(zeroCrossings) * 18, 0, 1);
  const pulse = clamp((onsetEnergy / Math.max(energies.length, 1)) * 4.2, 0, 1);
  const dynamics = clamp(energyStd / Math.max(avgEnergy, 0.001), 0, 1);
  const warmth = clamp((1 - brightness) * 0.55 + avgEnergy * 5 * 0.45, 0, 1);

  return {
    energy: clamp(avgEnergy * 7, 0, 1),
    brightness,
    pulse,
    dynamics,
    warmth,
    loudness: clamp((totalAbs / Math.max(energies.length, 1)) * 8, 0, 1),
    sampleRate,
  };
}

function compareAudioFeatures(seedFeatures, trackFeatures) {
  if (!seedFeatures || !trackFeatures) {
    return {
      available: false,
      score: 0,
      reason: "catalog similarity",
    };
  }

  const weights = {
    energy: 0.3,
    brightness: 0.24,
    pulse: 0.28,
    dynamics: 0.14,
    warmth: 0.04,
  };
  let distance = 0;

  for (const [key, weight] of Object.entries(weights)) {
    distance += Math.abs(seedFeatures[key] - trackFeatures[key]) * weight;
  }

  const closest = Object.keys(weights).sort((a, b) => {
    const aDiff = Math.abs(seedFeatures[a] - trackFeatures[a]);
    const bDiff = Math.abs(seedFeatures[b] - trackFeatures[b]);
    return aDiff - bDiff;
  })[0];

  const labels = {
    energy: "energy",
    brightness: "brightness",
    pulse: "pulse",
    dynamics: "dynamic movement",
    warmth: "warmth",
  };

  return {
    available: true,
    score: clamp(1 - distance * 1.35, 0, 1),
    reason: `similar ${labels[closest]}`,
  };
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values, avg) {
  if (!values.length) return 0;
  const variance = values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = [];

  for (let index = 0; index < items.length; index += limit) {
    const chunk = items.slice(index, index + limit);
    results.push(...(await Promise.all(chunk.map(mapper))));
  }

  return results;
}
