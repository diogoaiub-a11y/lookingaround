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
const AUDIO_PROXY_URL = "/api/audio";
const CACHE_KEY = "vibingecho-cache-v1";
const CACHE_TTL = 1000 * 60 * 60 * 24;
const AUDIO_ANALYSIS_LIMIT = 60;

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

    setStatus("Analyzing the reference preview...");
    seed.audioFeatures = await analyzeTrackAudio(seed);
    renderSeed(seed);
    setStatus("Analyzing candidate previews and matching the closest feel...");

    const selectedMood = moodInput.value === "auto" ? inferMood(seed, seed.audioFeatures) : moodInput.value;
    const candidates = await collectCandidates(seed, country, selectedMood);
    const recommendations = await rankTracks(seed, candidates, selectedMood);

    if (!recommendations.length) {
      setStatus("I found the reference, but not enough strong recommendations.");
      return;
    }

    renderResults(recommendations, selectedMood);
    setStatus(
      `Analyzed ${Math.min(candidates.length, AUDIO_ANALYSIS_LIMIT)} previews and selected ${recommendations.length} close matches.`,
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
  const [defaultResults, songResults, artistResults, usResults] = await Promise.all([
    searchItunes({ term, country, limit: 50 }),
    searchItunes({ term, country, attribute: "songTerm", limit: 25 }),
    searchItunes({ term, country, attribute: "artistTerm", limit: 25 }),
    country === "US" ? Promise.resolve([]) : searchItunes({ term, country: "US", limit: 25 }),
  ]);

  const combined = annotateSearchRank([
    ...defaultResults,
    ...songResults,
    ...usResults,
    ...artistResults,
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

async function rankTracks(seed, tracks, mood) {
  const seedProfile = vibeProfile(seed, seed.audioFeatures);
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
      const audioSimilarity = compareAudioFeatures(seed.audioFeatures, track.audioFeatures);

      if (audioSimilarity.available) {
        score += Math.round(audioSimilarity.score * 82);
        reasons.push(audioSimilarity.reason);
      } else if (seed.audioFeatures) {
        score -= 24;
      }

      const moodMatch = inferMood(track, track.audioFeatures) === mood;
      if (moodMatch) {
        score += audioSimilarity.available ? 10 : 30;
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
        score += audioSimilarity.available ? 5 : 24;
        reasons.push(`nearby sound: ${track.primaryGenreName}`);
      }

      if (same(seed.artistName, track.artistName)) {
        score += 4;
      }

      return {
        ...track,
        score: Math.min(score, 99),
        reasons: reasons.slice(0, 3),
        mood: profile.mood,
        profile,
        analysis: vibeAnalysis(track, seed, profile, audioSimilarity),
      };
    })
    .filter((track) => track.score >= 48)
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
      if (artist === seedArtist) priority += 12;
      if (isLowQualityVariant(track)) priority -= 140;

      return { ...track, candidatePriority: priority };
    })
    .sort((a, b) => b.candidatePriority - a.candidatePriority);
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

function vibeAnalysis(track, seed, profile, audioSimilarity) {
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

  return `${moodAnalysis[profile.mood]}. ${paceAnalysis[profile.pace]} ${textureAnalysis[profile.texture]} ${audioLine} In context, ${genre} keeps it distinct instead of just repeating the same match. ${contrast}`;
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
  seedSection.hidden = false;
  seedCard.innerHTML = `
    <img class="cover" src="${artwork(track, 300)}" alt="Capa de ${escapeHtml(track.trackName)}" />
    <div class="track-info">
      <div class="match-row">
        <span class="mood-tag">${moodLabels[inferMood(track, track.audioFeatures)]}</span>
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
  const normalizedTitle = normalize(track.trackName);
  const normalizedArtist = normalize(track.artistName);
  const normalizedAlbum = normalize(track.collectionName);
  const searchRank = track.searchRank || 0;
  let score = 0;
  if (normalizedTitle === normalizedTerm) score += 520;
  if (normalizedTitle.startsWith(normalizedTerm)) score += 120;
  if (normalizedTitle.includes(normalizedTerm)) score += 80;
  if (normalizedArtist.includes(normalizedTerm)) score += 35;
  if (normalizedAlbum.includes(normalizedTerm)) score += 10;
  if (track.previewUrl) score += 25;
  if (track.artworkUrl100) score += 10;
  score += searchRank;

  const queryAsksForVariant = /live|remix|karaoke|cover|tribute|instrumental|sped|slowed/.test(
    normalizedTerm,
  );
  if (!queryAsksForVariant && isLowQualityVariant(track)) {
    score -= 220;
  }

  return score;
}

function annotateSearchRank(tracks) {
  return tracks.map((track, index) => ({
    ...track,
    searchRank: Math.max(0, 90 - index),
  }));
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
