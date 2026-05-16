const form = document.querySelector("#recommendation-form");
const queryInput = document.querySelector("#music-query");
const countryInput = document.querySelector("#country");
const moodInput = document.querySelector("#mood");
const statusText = document.querySelector("#status-text");
const seedSection = document.querySelector("#seed-section");
const seedCard = document.querySelector("#seed-card");
const results = document.querySelector("#results");
const clearCacheButton = document.querySelector("#clear-cache");
const template = document.querySelector("#track-card-template");

const API_URL = "https://itunes.apple.com/search";
const PROXY_API_URL = "/api/itunes";
const CACHE_KEY = "vibingecho-cache-v1";
const CACHE_TTL = 1000 * 60 * 60 * 24;

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

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const term = queryInput.value.trim();

  if (!term) return;

  setLoading(true, "Searching the iTunes catalog...");
  seedSection.hidden = true;
  results.innerHTML = "";

  try {
    const country = countryInput.value;
    const seed = await findSeedTrack(term, country);

    if (!seed) {
      setStatus("I could not find a song for that search. Try another artist or track.");
      return;
    }

    renderSeed(seed);
    setStatus("Building candidates and matching the vibe...");

    const selectedMood = moodInput.value === "auto" ? inferMood(seed) : moodInput.value;
    const candidates = await collectCandidates(seed, country, selectedMood);
    const recommendations = rankTracks(seed, candidates, selectedMood);

    if (!recommendations.length) {
      setStatus("I found the reference, but not enough strong recommendations.");
      return;
    }

    renderResults(recommendations, selectedMood);
    setStatus(
      `Scanned ${candidates.length} iTunes tracks and selected ${recommendations.length} with a ${moodLabels[selectedMood]} vibe.`,
    );
  } catch (error) {
    console.error(error);
    setStatus(`Search failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
});

clearCacheButton.addEventListener("click", () => {
  localStorage.removeItem(CACHE_KEY);
  setStatus("Local cache cleared. The next searches will call iTunes again.");
});

async function findSeedTrack(term, country) {
  const [artistResults, songResults] = await Promise.all([
    searchItunes({ term, country, attribute: "artistTerm", limit: 25 }),
    searchItunes({ term, country, attribute: "songTerm", limit: 25 }),
  ]);

  const combined = [...artistResults, ...songResults].filter(isSong);
  return dedupeTracks(combined).sort((a, b) => seedScore(term, b) - seedScore(term, a))[0];
}

async function collectCandidates(seed, country, mood) {
  const terms = [
    seed.primaryGenreName,
    ...genreMoodHints[mood].slice(0, 3),
  ].filter(Boolean);

  const batches = await Promise.all(
    terms.map((term) => searchItunes({ term, country, attribute: "mixTerm", limit: 50 })),
  );

  return dedupeTracks(batches.flat().filter(isSong));
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

function rankTracks(seed, tracks, mood) {
  const ranked = tracks
    .filter((track) => track.trackId !== seed.trackId)
    .map((track) => {
      const reasons = [];
      let score = 0;
      const profile = vibeProfile(track);
      const seedProfile = vibeProfile(seed);

      const moodMatch = inferMood(track) === mood;
      if (moodMatch) {
        score += 42;
        reasons.push(`${moodLabels[mood]} vibe`);
      }

      const durationDiff = Math.abs((seed.trackTimeMillis || 0) - (track.trackTimeMillis || 0));
      if (durationDiff && durationDiff < 45000) {
        score += 18;
        reasons.push("similar pacing");
      }

      if (profile.pace === seedProfile.pace) {
        score += 12;
        reasons.push(`${profile.pace} pace`);
      }

      if (profile.texture === seedProfile.texture) {
        score += 10;
        reasons.push(`${profile.texture} texture`);
      }

      if (same(seed.primaryGenreName, track.primaryGenreName)) {
        score += 28;
        reasons.push(`nearby sound: ${track.primaryGenreName}`);
      }

      return {
        ...track,
        score: Math.min(score, 99),
        reasons: reasons.slice(0, 3),
        mood: profile.mood,
        profile,
        analysis: vibeAnalysis(track, seed, profile),
      };
    })
    .filter((track) => track.score >= 28)
    .sort((a, b) => b.score - a.score);

  return diversifyTracks(ranked, 12);
}

function diversifyTracks(tracks, limit) {
  const selected = [];
  const profileCount = new Map();
  const artistCount = new Map();

  for (const track of tracks) {
    const profileKey = `${track.profile.mood}-${track.profile.pace}-${track.profile.texture}`;
    const artistKey = normalize(track.artistName);
    const profileUses = profileCount.get(profileKey) || 0;
    const artistUses = artistCount.get(artistKey) || 0;

    if (profileUses >= 2 || artistUses >= 2) {
      continue;
    }

    selected.push(track);
    profileCount.set(profileKey, profileUses + 1);
    artistCount.set(artistKey, artistUses + 1);

    if (selected.length === limit) {
      return selected;
    }
  }

  for (const track of tracks) {
    if (!selected.some((item) => item.trackId === track.trackId)) {
      selected.push(track);
    }

    if (selected.length === limit) {
      break;
    }
  }

  return selected;
}

function vibeProfile(track) {
  const mood = inferMood(track);
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

  return { mood, pace, texture };
}

function vibeAnalysis(track, seed, profile) {
  const genre = track.primaryGenreName || "its genre";
  const seedMood = moodLabels[inferMood(seed)];
  const currentMood = moodLabels[profile.mood];
  const contrast =
    currentMood === seedMood
      ? `It stays close to the reference's ${seedMood} emotional lane.`
      : `It adds a ${currentMood} shade around the reference's ${seedMood} center.`;

  return `${moodAnalysis[profile.mood]}. ${paceAnalysis[profile.pace]} ${textureAnalysis[profile.texture]} In context, ${genre} makes it feel distinct instead of just repeating the same match. ${contrast}`;
}

function inferMood(track) {
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
  seedSection.hidden = false;
  seedCard.innerHTML = `
    <img class="cover" src="${artwork(track, 300)}" alt="Capa de ${escapeHtml(track.trackName)}" />
    <div class="track-info">
      <div class="match-row">
        <span class="mood-tag">${moodLabels[inferMood(track)]}</span>
      </div>
      <h3>${escapeHtml(track.trackName)}</h3>
      <p class="artist">${escapeHtml(track.artistName)} - ${escapeHtml(track.primaryGenreName || "Unknown genre")}</p>
      <p class="why">${escapeHtml(track.collectionName || "Album not available")} ${year(track.releaseDate) || ""}</p>
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

  for (const track of tracks) {
    const node = template.content.cloneNode(true);
    node.querySelector(".cover").src = artwork(track, 300);
    node.querySelector(".cover").alt = `Capa de ${track.trackName}`;
    node.querySelector(".match-score").textContent = `${Math.round(track.score)}% match`;
    node.querySelector(".mood-tag").textContent =
      `${moodLabels[track.mood]} / ${track.profile.texture} ${track.profile.pace}`;
    node.querySelector("h3").textContent = track.trackName;
    node.querySelector(".artist").textContent = `${track.artistName} - ${track.primaryGenreName || "Unknown genre"}`;
    node.querySelector(".why").textContent = track.analysis;

    const audio = node.querySelector("audio");
    if (track.previewUrl) {
      audio.src = track.previewUrl;
    } else {
      audio.remove();
    }

    const link = node.querySelector("a");
    link.href = track.trackViewUrl;
    link.textContent = "Open in iTunes";

    results.appendChild(node);
  }
}

function seedScore(term, track) {
  const normalizedTerm = normalize(term);
  let score = 0;
  if (normalize(track.artistName).includes(normalizedTerm)) score += 40;
  if (normalize(track.trackName).includes(normalizedTerm)) score += 40;
  if (normalize(track.collectionName).includes(normalizedTerm)) score += 10;
  if (track.previewUrl) score += 4;
  if (track.artworkUrl100) score += 3;
  return score;
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
  if (message) setStatus(message);
}
