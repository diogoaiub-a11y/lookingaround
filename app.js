const form = document.querySelector("#recommendation-form");
const queryInput = document.querySelector("#music-query");
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
const progressWrap = document.querySelector("#progress-wrap");
const progressLabel = document.querySelector("#progress-label");
const progressPercent = document.querySelector("#progress-percent");
const progressBar = document.querySelector("#progress-bar");
const template = document.querySelector("#track-card-template");

const APP_VERSION = "vibingecho-deezer-main-v32";
const OPEN_SEARCH_API_URL = "/api/open-search";
const SIMILARBRAINZ_API_URL = "/api/similarbrainz";
const LISTENBRAINZ_RECORDINGS_API_URL = "/api/listenbrainz-recordings";
const MUSICBRAINZ_API_URL = "/api/musicbrainz";
const ACOUSTICBRAINZ_API_URL = "/api/acousticbrainz";
const MEDIA_API_URL = "/api/deezer";
const CACHE_KEY = "vibingecho-deezer-cache-v32";
const HISTORY_KEY = "vibingecho-history-v1";
const FAVORITES_KEY = "vibingecho-favorites-v1";
const CACHE_TTL = 1000 * 60 * 60 * 24;
const RECOMMENDATION_LIMIT = 36;
const CATEGORY_LIMIT = 36;

const currentTracks = new Map();

const moodLabels = {
  melancholic: "melancholic",
  romantic: "romantic",
  energetic: "active",
  calm: "calm",
  dark: "dark",
  bright: "bright",
  dreamy: "dreamy",
  nostalgic: "nostalgic",
  groovy: "groovy",
  aggressive: "aggressive",
  sensual: "sensual",
  cinematic: "cinematic",
  lonely: "lonely",
  euphoric: "euphoric",
};

const categoryCatalog = {
  pop: { label: "Pop", terms: ["pop", "dance pop", "art pop"], tags: ["pop", "polished", "hook", "bright"] },
  "r&b": { label: "R&B / Soul", terms: ["r&b", "soul", "neo soul"], tags: ["r&b", "soul", "warm", "sensual"] },
  rock: { label: "Rock", terms: ["rock", "alternative rock", "classic rock"], tags: ["rock", "guitar", "drums", "anthem"] },
  "hip-hop": { label: "Hip-Hop", terms: ["hip-hop", "rap", "boom bap"], tags: ["hip-hop", "rap", "bass", "rhythm"] },
  dance: { label: "Dance / Electronic", terms: ["house", "electronic", "dance"], tags: ["electronic", "club", "pulse", "synth"] },
  indie: { label: "Indie / Alternative", terms: ["indie", "alternative", "dream pop"], tags: ["indie", "alternative", "texture", "intimate"] },
  latin: { label: "Latin", terms: ["latin", "latin pop", "salsa"], tags: ["latin", "warm", "rhythm", "percussion"] },
  funk: { label: "Funk", terms: ["funk", "boogie", "funk rock"], tags: ["funk", "bass", "groove", "syncopated"] },
  disco: { label: "Disco", terms: ["disco", "nu disco", "boogie"], tags: ["disco", "dance", "groove", "bright"] },
  "new-wave": { label: "New Wave", terms: ["new wave", "post-punk", "synth pop"], tags: ["new wave", "synth", "angular", "retro"] },
  "synth-pop": { label: "Synth Pop", terms: ["synth pop", "electropop", "new wave"], tags: ["synth", "electronic", "polished", "bright"] },
  trap: { label: "Trap", terms: ["trap", "dark trap", "rap"], tags: ["trap", "808", "bass", "dark"] },
  reggaeton: { label: "Reggaeton", terms: ["reggaeton", "dembow", "urbano latino"], tags: ["reggaeton", "dembow", "latin", "percussion"] },
  mpb: { label: "MPB", terms: ["mpb", "bossa nova", "samba"], tags: ["brazilian", "organic", "warm", "acoustic"] },
  jazz: { label: "Jazz", terms: ["jazz", "vocal jazz", "bebop"], tags: ["jazz", "improvised", "warm", "swing"] },
  blues: { label: "Blues", terms: ["blues", "electric blues", "blues rock"], tags: ["blues", "guitar", "minor", "raw"] },
  folk: { label: "Folk", terms: ["folk", "indie folk", "americana"], tags: ["folk", "acoustic", "organic", "intimate"] },
  acoustic: { label: "Acoustic", terms: ["acoustic", "unplugged", "piano"], tags: ["acoustic", "organic", "soft", "intimate"] },
  ambient: { label: "Ambient", terms: ["ambient", "downtempo", "new age"], tags: ["ambient", "spacious", "slow", "texture"] },
  metal: { label: "Metal", terms: ["metal", "heavy metal", "metalcore"], tags: ["metal", "distortion", "heavy", "aggressive"] },
  punk: { label: "Punk", terms: ["punk", "garage rock", "post-punk"], tags: ["punk", "fast", "raw", "guitar"] },
  "k-pop": { label: "K-Pop", terms: ["k-pop", "korean pop", "idol"], tags: ["k-pop", "pop", "polished", "bright"] },
  soundtrack: { label: "Soundtrack", terms: ["soundtrack", "score", "film score"], tags: ["cinematic", "orchestral", "dramatic", "spacious"] },
  calm: { label: "Calm", terms: ["calm", "ambient", "piano"], tags: ["calm", "soft", "slow", "space"] },
  dark: { label: "Dark", terms: ["dark pop", "industrial", "darkwave"], tags: ["dark", "minor", "heavy", "shadow"] },
  party: { label: "Party", terms: ["party", "club", "dance"], tags: ["club", "dance", "bright", "pulse"] },
  workout: { label: "Workout", terms: ["workout", "hard rock", "edm"], tags: ["drums", "drive", "heavy", "fast"] },
  "night-drive": { label: "Night Drive", terms: ["synthwave", "dark pop", "night drive"], tags: ["synth", "night", "pulse", "atmospheric"] },
  heartbreak: { label: "Heartbreak", terms: ["heartbreak", "sad", "ballad"], tags: ["sad", "minor", "intimate", "melancholic"] },
};

const surpriseQueries = [
  "Beat It Michael Jackson",
  "Bad Guy Billie Eilish",
  "Dreams Fleetwood Mac",
  "Redbone Childish Gambino",
  "Come As You Are Nirvana",
  "Sweet Dreams Eurythmics",
  "Somebody That I Used To Know Gotye",
];

const knownOriginals = new Map([
  ["beat it", "michael jackson"],
  ["billie jean", "michael jackson"],
  ["thriller", "michael jackson"],
  ["bohemian rhapsody", "queen"],
  ["smells like teen spirit", "nirvana"],
  ["purple rain", "prince"],
  ["rolling in the deep", "adele"],
  ["bad romance", "lady gaga"],
  ["blinding lights", "the weeknd"],
]);

const knownTrackVibes = [
  {
    match: ["beat it", "michael jackson"],
    tags: ["rock", "funk", "dance-rock", "guitar", "drums", "sharp", "confident", "syncopated", "bright", "tense"],
    queries: [
      "recording:\"Let's Dance\" AND artist:\"David Bowie\"",
      "recording:\"Easy Lover\" AND artist:\"Philip Bailey\"",
      "recording:\"Sledgehammer\" AND artist:\"Peter Gabriel\"",
      "recording:\"Black or White\" AND artist:\"Michael Jackson\"",
      "recording:\"Another One Bites the Dust\" AND artist:\"Queen\"",
      "recording:\"Walk This Way\" AND artist:\"Aerosmith\"",
      "recording:\"Superstition\" AND artist:\"Stevie Wonder\"",
      "recording:\"I Was Made for Lovin' You\" AND artist:\"Kiss\"",
      "recording:\"The Power of Love\" AND artist:\"Huey Lewis\"",
      "recording:\"You Give Love a Bad Name\" AND artist:\"Bon Jovi\"",
      "recording:\"Danger Zone\" AND artist:\"Kenny Loggins\"",
      "recording:\"Footloose\" AND artist:\"Kenny Loggins\"",
      "recording:\"Addicted to Love\" AND artist:\"Robert Palmer\"",
      "recording:\"The Heat Is On\" AND artist:\"Glenn Frey\"",
      "recording:\"Rebel Yell\" AND artist:\"Billy Idol\"",
      "recording:\"Owner of a Lonely Heart\" AND artist:\"Yes\"",
    ],
  },
  {
    match: ["beautiful things", "benson boone"],
    tags: ["pop rock", "ballad", "dramatic", "raspy vocal", "build-up", "emotional", "explosive chorus", "minor"],
    queries: [
      "recording:\"Before You Go\" AND artist:\"Lewis Capaldi\"",
      "recording:\"Someone You Loved\" AND artist:\"Lewis Capaldi\"",
      "recording:\"Arcade\" AND artist:\"Duncan Laurence\"",
    ],
  },
  {
    match: ["bad guy", "billie eilish"],
    tags: ["minimal", "dark pop", "bass", "whisper vocal", "dry", "playful", "sub bass", "sparse"],
    queries: [
      "recording:\"bury a friend\" AND artist:\"Billie Eilish\"",
      "recording:\"Tennis Court\" AND artist:\"Lorde\"",
      "recording:\"Genesis\" AND artist:\"Grimes\"",
    ],
  },
  {
    match: ["smells like teen spirit", "nirvana"],
    tags: ["grunge", "distorted guitar", "loud", "raw", "angry", "explosive chorus", "rock"],
    queries: [
      "recording:\"Cherub Rock\" AND artist:\"The Smashing Pumpkins\"",
      "recording:\"Plush\" AND artist:\"Stone Temple Pilots\"",
      "recording:\"Alive\" AND artist:\"Pearl Jam\"",
    ],
  },
  {
    match: ["blinding lights", "the weeknd"],
    tags: ["synthpop", "new wave", "night drive", "bright synth", "pulse", "retro", "dance"],
    queries: [
      "recording:\"Take On Me\" AND artist:\"a-ha\"",
      "recording:\"Midnight City\" AND artist:\"M83\"",
      "recording:\"Sweet Dreams\" AND artist:\"Eurythmics\"",
    ],
  },
];

const everyNoiseInspiredVibes = {
  rock: ["rock", "guitar", "drums", "raw", "distortion", "anthem"],
  funk: ["funk", "bass", "groove", "syncopated", "dance", "warm"],
  "dark-pop": ["dark pop", "bass", "minimal", "shadow", "dry", "tense"],
  "synth-pop": ["synthpop", "electronic", "new wave", "bright", "pulse", "polished"],
  "pop-rock": ["pop rock", "guitar", "chorus", "dramatic", "bright", "drums"],
  "indie-dream": ["indie", "dream pop", "hazy", "reverb", "soft", "nostalgic"],
  "cinematic-ballad": ["ballad", "cinematic", "build-up", "dramatic", "emotional", "wide"],
  "club-pulse": ["dance", "house", "club", "pulse", "kick", "bright"],
  "bass-heavy": ["bass", "trap", "808", "sub bass", "dark", "rhythmic"],
  "organic-acoustic": ["acoustic", "folk", "organic", "warm", "soft", "intimate"],
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const term = queryInput.value.trim();
  if (term) await runRecommendation(term);
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

clearCacheButton.addEventListener("click", () => {
  localStorage.removeItem(CACHE_KEY);
  setStatus("Local cache cleared. The next searches will call MusicBrainz, ListenBrainz, and AcousticBrainz again.");
});

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
  setLoading(true, `Searching Deezer catalog... ${APP_VERSION}`);
  updateProgress(5, "Starting search");
  seedSection.hidden = true;
  results.innerHTML = "";

  try {
    updateProgress(12, "Finding reference track");
    const seed = await findSeedTrack(term);

    if (!seed) {
      setStatus("I could not find that song in Deezer. Try writing the song plus artist or band.");
      updateProgress(0, "Ready", { hidden: true });
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
  setLoading(true, `Reading catalog data... ${APP_VERSION}`);
  updateProgress(22, "Reading reference data");
  seedSection.hidden = true;
  results.innerHTML = "";

  try {
    seed.openMusic = seed.openMusic || (await enrichOpenMusic(seed));
    renderSeed(seed);
    hydrateSeedMedia(seed);
    updateProgress(38, "Collecting similar tracks");
    setStatus("Finding catalog matches, then comparing vibe criteria...");

    const candidates = await collectCandidates(seed);
    updateProgress(58, "Comparing sound criteria");
    const recommendations = await rankTracks(seed, candidates, moodInput.value, similarityValue());

    if (!recommendations.length) {
      setStatus("I found the reference, but not enough catalog matches passed the vibe filters.");
      updateProgress(0, "Ready", { hidden: true });
      return;
    }

    updateProgress(78, "Rendering recommendations");
    renderResults(recommendations);
    const acousticCount = recommendations.filter((track) => hasAcousticData(track.openMusic)).length;
    setStatus(
      `${APP_VERSION}: selected ${recommendations.length} Deezer catalog matches with ${acousticCount} optional AcousticBrainz profiles.`,
    );
  } catch (error) {
    console.error(error);
    setStatus(`Search failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
}

async function runCategory(category) {
  const data = categoryData(category);
  setLoading(true, `Exploring ${data.label} with Deezer... ${APP_VERSION}`);
  updateProgress(8, "Starting category search");
  seedSection.hidden = true;
  seedCard.innerHTML = "";
  results.innerHTML = "";

  try {
    updateProgress(28, "Collecting category tracks");
    const batches = await Promise.all(data.terms.map((term) => searchDeezerTracks(term, 30)));
    const candidates = dedupeTracks(batches.flat());
    updateProgress(52, "Reading catalog data");
    const enriched = await mapWithConcurrency(candidates.slice(0, 60), 8, async (track) => ({
      ...track,
      openMusic: await enrichOpenMusic(track),
    }));
    updateProgress(74, "Ranking category matches");
    const recommendations = rankCategoryTracks(category, enriched);

    renderResults(recommendations);
    setStatus(`${APP_VERSION}: ${recommendations.length} ${data.label} tracks selected by shared open-data categories.`);
  } catch (error) {
    console.error(error);
    setStatus(`Search failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
}

async function findSeedTrack(term) {
  const deezerResults = await searchDeezerTracks(term, 25);
  const deezerSeed = deezerResults.sort((a, b) => seedScore(term, b) - seedScore(term, a))[0];
  if (deezerSeed) return deezerSeed;

  const batches = await Promise.all(seedSearchQueries(term).map((query) => searchOpenRecordings(query, 12)));
  return mergeSearchResults(batches)
    .map((recording) => normalizeMusicBrainzRecording(recording))
    .filter(Boolean)
    .sort((a, b) => seedScore(term, b) - seedScore(term, a))[0];
}

async function collectCandidates(seed) {
  const deezerTracksPromise = deezerCandidates(seed);
  const mbid = seed.openMusic?.mbid || seed.trackId;
  const similar = isMbid(mbid) ? await fetchJsonSafe(`${SIMILARBRAINZ_API_URL}?mbid=${encodeURIComponent(mbid)}`) : null;
  const mbids = extractSimilarMbids(similar).filter((id) => id && id !== mbid).slice(0, 50);
  const fallbackTracksPromise = fallbackCandidates(seed);

  if (!mbids.length) {
    const deezerTracks = await deezerTracksPromise;
    const fallbackTracks = await fallbackTracksPromise;
    return dedupeTracks([...deezerTracks, ...fallbackTracks]);
  }

  const metadata = await fetchJsonSafe(
    `${LISTENBRAINZ_RECORDINGS_API_URL}?mbids=${encodeURIComponent(mbids.join(","))}`,
  );
  const metadataTracks = normalizeListenBrainzBatch(metadata);
  const known = new Map(metadataTracks.map((track) => [track.trackId, track]));

  for (const item of flattenSimilarItems(similar)) {
    const id = item.recording_mbid || item.mbid || item.recording?.recording_mbid || item.recording?.mbid;
    if (!id || known.has(id)) continue;
    const fallback = normalizeSimilarItem(item);
    if (fallback) known.set(id, fallback);
  }

  const listenBrainzTracks = dedupeTracks([...known.values()]);
  const deezerTracks = await deezerTracksPromise;
  if (deezerTracks.length >= RECOMMENDATION_LIMIT) return deezerTracks;

  const fallbackTracks = await fallbackTracksPromise;
  return dedupeTracks([...deezerTracks, ...listenBrainzTracks, ...fallbackTracks]);
}

async function searchDeezerTracks(query, limit = 24) {
  const cacheKey = `deezer-search:${query}:${limit}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const data = await fetchJson(`${MEDIA_API_URL}?q=${encodeURIComponent(query)}&limit=${limit}`);
  const tracks = (data?.data || []).map(normalizeDeezerTrack).filter(Boolean);
  writeCache(cacheKey, tracks);
  return tracks;
}

async function deezerCandidates(seed) {
  const queries = deezerSearchQueries(seed);
  const seedVibes = [...new Set([...trackMicroVibes(seed), ...(seed.tags || []), ...(seed.openMusic?.tags || [])])].filter(Boolean);
  const batches = await Promise.all(
    queries.map(async (queryData) => {
      const query = queryData.query || queryData;
      const queryVibes = [...everyNoiseQueryTags(query), ...(queryData.tags || []), cleanGenreLabel(query)].filter(Boolean);
      const tracks = await searchDeezerTracks(query, 28);
      return tracks.map((track) => ({
        ...track,
        tags: [...new Set([...(track.tags || []), ...queryVibes, ...seedVibes, languageTag(seed)])].filter(Boolean).slice(0, 24),
        candidateQuery: query,
        candidateSpecificity: queryData.specificity || querySpecificity(query),
        seedLanguage: detectTrackLanguage(seed),
      }));
    }),
  );
  return dedupeTracks(batches.flat())
    .filter((track) => track.trackId !== seed.trackId)
    .filter((track) => !isLowQualityVariant(track))
    .filter((track) => candidateRelevantToSeed(seed, track))
    .slice(0, 90);
}

async function searchOpenRecordings(term, limit = 10) {
  const cacheKey = `musicbrainz-search:${term}:${limit}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const data = await fetchJson(`${OPEN_SEARCH_API_URL}?q=${encodeURIComponent(term)}&limit=${limit}`);
  const recordings = data?.recordings || [];
  writeCache(cacheKey, recordings);
  return recordings;
}

async function fallbackCandidates(seed) {
  const queries = fallbackSearchQueries(seed);
  const batches = await Promise.all(
    queries.map(async (query) => {
      const anchor = parseAnchorQuery(query);
      const recordings = await searchOpenRecordings(query, anchor ? 5 : 16);
      const tracks = recordings.map(normalizeMusicBrainzRecording).filter(Boolean);

      if (!anchor) return tracks;

      return tracks
        .filter((track) => normalize(track.trackName) === normalize(anchor.title))
        .filter((track) => normalize(track.artistName).includes(normalize(anchor.artist)))
        .slice(0, 1);
    }),
  );

  return dedupeTracks(batches.flat())
    .filter((track) => track.trackId !== seed.trackId)
    .filter((track) => !isLowQualityVariant(track))
    .slice(0, 72);
}

async function enrichOpenMusic(track) {
  const cacheKey = `open:${track.trackId || track.artistName}:${track.trackName}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  if (!isMbid(track.trackId)) {
    const enriched = {
      mbid: null,
      musicBrainz: null,
      acousticBrainz: null,
      tags: [...new Set([...(track.tags || []), ...trackMicroVibes(track), cleanGenreLabel(track.primaryGenreName)])].filter(Boolean).slice(0, 24),
      sources: ["Deezer"],
    };
    writeCache(cacheKey, enriched);
    return enriched;
  }

  const mbid = track.trackId;
  const [musicBrainz, acousticBrainz] = await Promise.all([
    fetchJsonSafe(`${MUSICBRAINZ_API_URL}?mbid=${encodeURIComponent(mbid)}`),
    fetchJsonSafe(`${ACOUSTICBRAINZ_API_URL}?mbid=${encodeURIComponent(mbid)}`),
  ]);
  const normalizedAcoustic = acousticBrainz?.lowlevel || acousticBrainz?.rhythm || acousticBrainz?.tonal
    ? { lowLevel: acousticBrainz, highLevel: null }
    : acousticBrainz;

  const enriched = {
    mbid,
    musicBrainz,
    acousticBrainz: normalizedAcoustic,
    tags: [...new Set([...(track.tags || []), ...trackMicroVibes(track), ...openMusicTags(musicBrainz, track.listenBrainz, normalizedAcoustic)])].slice(0, 24),
    sources: [
      "MusicBrainz",
      track.listenBrainz ? "ListenBrainz" : null,
      hasAcousticPayload(normalizedAcoustic) ? "AcousticBrainz" : null,
    ].filter(Boolean),
  };

  writeCache(cacheKey, enriched);
  return enriched;
}

async function enrichMedia(track) {
  const cacheKey = `media:${track.artistName}:${track.trackName}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  const media = await fetchMediaWithFallback(track);
  const directDeezer = normalizeDeezerMedia(media, track);
  const enriched = {
    coverUrl: directDeezer.coverUrl || media.coverUrl || coverArtArchiveUrl(track) || "",
    previewUrl: directDeezer.previewUrl || media.previewUrl || "",
    mediaUrl: directDeezer.mediaUrl || media.deezerUrl || track.trackViewUrl,
    title: directDeezer.title || media.title || "",
    artist: directDeezer.artist || media.artist || "",
    source: directDeezer.previewUrl || media.previewUrl || media.coverUrl ? "Deezer preview" : "MusicBrainz cover fallback",
  };

  writeCache(cacheKey, enriched);
  return enriched;
}

async function fetchMediaWithFallback(track) {
  const artist = usableArtistName(track.artistName) ? track.artistName : "";
  const primary =
    (await fetchJsonSafe(
      `${MEDIA_API_URL}?track=${encodeURIComponent(track.trackName)}&artist=${encodeURIComponent(artist)}`,
    )) || {};
  if (primary.previewUrl || primary.coverUrl || primary.data?.length) return primary;

  return (
    (await fetchJsonSafe(
      `${MEDIA_API_URL}?track=${encodeURIComponent(track.trackName)}&artist=`,
    )) || {}
  );
}

function normalizeDeezerMedia(media, track) {
  const items = media?.data || [];
  if (!Array.isArray(items) || !items.length) return {};

  const best = items
    .map((item, index) => ({
      item,
      score:
        textSimilarity(track.trackName, item.title_short || item.title) * 70 +
        textSimilarity(track.artistName, item.artist?.name) * 55 -
        index,
    }))
    .sort((a, b) => b.score - a.score)[0]?.item;

  return {
    coverUrl: best?.album?.cover_xl || best?.album?.cover_big || best?.album?.cover_medium || "",
    previewUrl: best?.preview || "",
    mediaUrl: best?.link || "",
    title: best?.title_short || best?.title || "",
    artist: best?.artist?.name || "",
  };
}

function normalizeDeezerTrack(item) {
  if (!item?.id || !item?.title) return null;
  const title = item.title_short || item.title;
  const artist = item.artist?.name || "Unknown artist";
  const album = item.album?.title || "";

  return {
    trackId: `deezer:${item.id}`,
    deezerId: item.id,
    trackName: title,
    artistName: artist,
    collectionName: album,
    primaryGenreName: "catalog track",
    releaseDate: "",
    trackViewUrl: item.link || "",
    artworkUrl100: item.album?.cover_medium || item.album?.cover || "",
    releaseMbid: "",
    tags: trackMicroVibes({ trackName: title, artistName: artist, collectionName: album, tags: [] }),
    media: {
      coverUrl: item.album?.cover_xl || item.album?.cover_big || item.album?.cover_medium || "",
      previewUrl: item.preview || "",
      mediaUrl: item.link || "",
      title,
      artist,
      source: "Deezer preview",
    },
    score: Number(item.rank || 0),
  };
}

async function rankTracks(seed, tracks, mood, similarity = 0.72) {
  const seedOpen = seed.openMusic || (await enrichOpenMusic(seed));
  const selectedMood = mood === "auto" ? null : mood;
  const enrichedTracks = await mapWithConcurrency(tracks.slice(0, 80), 8, async (track) => ({
    ...track,
    openMusic: track.openMusic || (await enrichOpenMusic(track)),
  }));
  const seedLanguage = detectTrackLanguage(seed);

  const ranked = enrichedTracks
    .filter((track) => track.trackId !== seed.trackId)
    .map((track, index) => {
      const comparison = compareOpenAudio(seedOpen, track.openMusic, index);
      const languageScore = languageMatchScore(seedLanguage, detectTrackLanguage(track));
      const score = applyStrictness(clamp(comparison.score + languageScore, 0, 0.98), similarity, comparison.acousticLevel);
      const tags = track.openMusic?.tags || [];
      const moodValue = cleanVibeLabel(selectedMood || inferMoodFromOpenData(track.openMusic) || comparison.mood);

      return {
        ...track,
        score: Math.round(score * 100),
        matchPercent: Math.round(score * 100),
        mood: moodValue,
        tags,
        reasons: comparison.criteria.slice(0, 3).map((item) => item.label),
        criterionMatches: [
          languageCriterion(seedLanguage, track),
          ...comparison.criteria,
        ].filter(Boolean),
        profile: {
          mood: moodValue,
          pace: comparison.pace || "open",
          texture: comparison.texture || "open",
        },
        analysis: criteriaAnalysis(comparison),
        essencePassed: score >= passThreshold(similarity, comparison.acousticLevel),
        acousticLevel: comparison.acousticLevel,
      };
    })
    .filter((track) => track.essencePassed)
    .sort((a, b) => b.score - a.score);

  return diversifyTracks(ranked, RECOMMENDATION_LIMIT);
}

function rankCategoryTracks(category, tracks) {
  const data = categoryData(category);
  return tracks
    .map((track) => {
      const tags = track.openMusic?.tags || [];
      const overlap = weightedTagOverlap(tags, data.tags);
      const acoustic = acousticProfile(track.openMusic);
      const criteria = [
        criterion("Category tags", overlap, overlap > 0, `${overlapToText(overlap)} tag overlap`),
        criterion("Timbre / texture", acoustic.timbreReady ? 0.68 : 0.42, acoustic.timbreReady, "Open texture profile"),
        criterion("Rhythm family", acoustic.rhythmReady ? 0.66 : 0.4, acoustic.rhythmReady, "Open rhythm profile"),
      ];
      const score = clamp(0.5 + overlap * 0.42 + (hasAcousticData(track.openMusic) ? 0.08 : 0), 0, 0.9);
      const moodValue = cleanVibeLabel(inferMoodFromOpenData(track.openMusic) || data.label.toLowerCase());

      return {
        ...track,
        score: Math.round(score * 100),
        matchPercent: Math.round(score * 100),
        mood: moodValue,
        tags,
        reasons: criteria.map((item) => item.label),
        criterionMatches: criteria,
        profile: { mood: moodValue, pace: "category", texture: "open" },
        analysis: criteriaAnalysis({ criteria, acousticLevel: hasAcousticData(track.openMusic) ? "full" : "tags" }),
      };
    })
    .filter((track) => track.score >= 52)
    .sort((a, b) => b.score - a.score)
    .slice(0, CATEGORY_LIMIT);
}

function compareOpenAudio(seedOpen, trackOpen, index = 0) {
  const seed = acousticProfile(seedOpen);
  const track = acousticProfile(trackOpen);
  const criteria = [
    compareTonality(seed, track),
    compareBpm(seed, track),
    comparePercussion(seed, track),
    compareTimbre(seed, track),
    compareTexture(seed, track),
    compareStructure(seed, track),
    compareMelody(seed, track),
    compareEmotionalEnergy(seed, track, seedOpen, trackOpen),
    compareDynamics(seed, track),
    compareVocalStyle(seed, track),
    compareFrequency(seed, track),
    compareMotifs(seed, track),
  ];
  const available = criteria.filter((item) => item.available);
  const acousticLevel = available.length >= 7 ? "full" : available.length >= 3 ? "partial" : "tags";
  const dataScore = available.length
    ? weightedAverage(available.map((item) => [item.score, item.weight]))
    : 0;
  const tagScore = vibeTagSimilarity(seedOpen?.tags || [], trackOpen?.tags || []);
  const listenBrainzTrust = clamp(0.72 - index * 0.006, 0.38, 0.72);
  const rawScore =
    acousticLevel === "full"
      ? dataScore * 0.78 + tagScore * 0.12 + listenBrainzTrust * 0.1
      : acousticLevel === "partial"
        ? dataScore * 0.55 + tagScore * 0.18 + listenBrainzTrust * 0.27
        : tagScore * 0.5 + listenBrainzTrust * 0.22;
  const ceiling = acousticLevel === "full" ? 0.96 : acousticLevel === "partial" ? 0.84 : 0.74;

  return {
    score: clamp(rawScore, 0.28, ceiling),
    criteria: criteria.sort((a, b) => b.score - a.score),
    acousticLevel,
    mood: inferMoodFromOpenData(trackOpen),
    pace: track.bpm ? `${Math.round(track.bpm)} bpm` : "unknown bpm",
    texture: track.texture || "open data",
  };
}

function compareTonality(seed, track) {
  const hasKey = seed.key && track.key;
  const hasScale = seed.scale && track.scale;
  const score = hasKey || hasScale ? average([hasKey ? equalityScore(seed.key, track.key) : null, hasScale ? equalityScore(seed.scale, track.scale) : null]) : 0;
  return criterion("Tonality / harmony", score, hasKey || hasScale, `${track.key || "unknown"} ${track.scale || ""}`.trim(), 1.18);
}

function compareBpm(seed, track) {
  if (!seed.bpm || !track.bpm) return criterion("BPM and rhythm", 0, false, "BPM unavailable", 1.22);
  const diff = Math.abs(seed.bpm - track.bpm);
  const score = clamp(1 - diff / 42, 0, 1);
  return criterion("BPM and rhythm", score, true, `${Math.round(track.bpm)} BPM`, 1.22);
}

function comparePercussion(seed, track) {
  const score = vectorSimilarity(seed.rhythmVector, track.rhythmVector);
  return criterion("Drum / percussion pattern", score || 0, Boolean(score), "Beat loudness and onset pattern", 1.12);
}

function compareTimbre(seed, track) {
  const score = vectorSimilarity(seed.timbreVector, track.timbreVector);
  return criterion("Timbre", score || 0, Boolean(score), "MFCC and spectral color", 1.16);
}

function compareTexture(seed, track) {
  const score = vectorSimilarity(seed.textureVector, track.textureVector);
  return criterion("Texture / production", score || 0, Boolean(score), "Loudness, complexity, reverb-like texture", 1.08);
}

function compareStructure(seed, track) {
  const score = vectorSimilarity(seed.structureVector, track.structureVector);
  return criterion("Structure", score || 0, Boolean(score), "Dynamic shape and segment feel", 0.92);
}

function compareMelody(seed, track) {
  const score = vectorSimilarity(seed.melodyVector, track.melodyVector);
  return criterion("Melody", score || 0, Boolean(score), "Chroma and tonal movement", 1.04);
}

function compareEmotionalEnergy(seed, track, seedOpen, trackOpen) {
  const acousticScore = vectorSimilarity(seed.moodVector, track.moodVector);
  const tagScore = vibeTagSimilarity(seedOpen?.tags || [], trackOpen?.tags || []);
  const score = acousticScore ? acousticScore * 0.72 + tagScore * 0.28 : tagScore;
  return criterion("Emotional energy", score, Boolean(acousticScore || tagScore), "Mood classes and emotional tags", 1.02);
}

function compareDynamics(seed, track) {
  const score = vectorSimilarity(seed.dynamicVector, track.dynamicVector);
  return criterion("Dynamics", score || 0, Boolean(score), "Growth, punch, and loudness range", 0.9);
}

function compareVocalStyle(seed, track) {
  const score = vectorSimilarity(seed.vocalVector, track.vocalVector);
  return criterion("Vocal style", score || 0, Boolean(score), "Voice/instrumental and timbre cues", 0.88);
}

function compareFrequency(seed, track) {
  const score = vectorSimilarity(seed.frequencyVector, track.frequencyVector);
  return criterion("Dominant frequency range", score || 0, Boolean(score), "Bass, mids, and brightness", 1);
}

function compareMotifs(seed, track) {
  const score = vectorSimilarity(seed.motifVector, track.motifVector);
  return criterion("Repetitive motifs", score || 0, Boolean(score), "Repeated rhythm and tonal patterns", 0.92);
}

function acousticProfile(openMusic) {
  const low = openMusic?.acousticBrainz?.lowLevel || {};
  const high = openMusic?.acousticBrainz?.highLevel?.highlevel || {};
  const rhythm = low.rhythm || {};
  const tonal = low.tonal || {};
  const ll = low.lowlevel || {};

  const bpm = number(rhythm.bpm);
  const key = tonal.key_key || null;
  const scale = tonal.key_scale || null;
  const mfcc = arrayMean(ll.mfcc?.mean || ll.mfcc?.dmean || ll.mfcc);
  const chroma = arrayMean(tonal.chords_histogram || tonal.hpcp?.mean || tonal.hpcp);
  const spectral = [
    number(ll.spectral_centroid?.mean),
    number(ll.spectral_rolloff?.mean),
    number(ll.spectral_flux?.mean),
    number(ll.spectral_complexity?.mean),
    number(ll.barkbands_crest?.mean),
  ];
  const loudness = [
    number(low.metadata?.audio_properties?.replay_gain),
    number(ll.average_loudness),
    number(ll.dynamic_complexity),
  ];
  const rhythmVector = [
    bpm,
    number(rhythm.beats_loudness?.mean),
    number(rhythm.onset_rate),
    number(rhythm.danceability),
  ];
  const moodVector = [
    highLevelScore(high.mood_aggressive),
    highLevelScore(high.mood_happy),
    highLevelScore(high.mood_party),
    highLevelScore(high.mood_relaxed),
    highLevelScore(high.mood_sad),
    highLevelScore(high.mood_acoustic),
    highLevelScore(high.mood_electronic),
  ];

  return {
    bpm,
    key,
    scale,
    rhythmVector,
    timbreVector: [...mfcc.slice(0, 13), ...spectral],
    textureVector: [...spectral, ...loudness],
    structureVector: [number(ll.dynamic_complexity), number(rhythm.beats_count), number(rhythm.onset_rate), bpm],
    melodyVector: [...chroma.slice(0, 24), keyToNumber(key), scale === "minor" ? 0 : scale === "major" ? 1 : null],
    moodVector,
    dynamicVector: [number(ll.dynamic_complexity), number(ll.average_loudness), number(rhythm.beats_loudness?.stdev)],
    vocalVector: [highLevelScore(high.voice_instrumental), ...mfcc.slice(0, 6)],
    frequencyVector: [
      number(ll.spectral_centroid?.mean),
      number(ll.spectral_rolloff?.mean),
      number(ll.barkbands?.mean?.[0]),
      number(ll.barkbands?.mean?.[10]),
      number(ll.barkbands?.mean?.[20]),
    ],
    motifVector: [bpm, number(rhythm.onset_rate), number(rhythm.beats_loudness?.mean), ...chroma.slice(0, 8)],
    texture: inferTextureFromProfile(ll, high),
    timbreReady: mfcc.length > 3 || spectral.some(isFiniteNumber),
    rhythmReady: Boolean(bpm || rhythm.onset_rate),
  };
}

function normalizeMusicBrainzRecording(recording) {
  if (!recording?.id || !recording?.title) return null;
  const artistName = artistCreditName(recording["artist-credit"]) || "Unknown artist";
  const release = recording.releases?.[0] || {};
  const tags = [...(recording.tags || []), ...(recording.genres || [])].map((item) => item.name).filter(Boolean);

  return {
    trackId: recording.id,
    trackName: recording.title,
    artistName,
    collectionName: release.title || "",
    primaryGenreName: tags[0] || "Open music",
    releaseDate: recording["first-release-date"] || release.date || "",
    trackViewUrl: `https://musicbrainz.org/recording/${recording.id}`,
    artworkUrl100: "",
    releaseMbid: release.id || "",
    tags,
    score: recording.score || 0,
  };
}

function normalizeListenBrainzBatch(data) {
  const recordings =
    data?.recordings ||
    data?.metadata ||
    data?.payload?.recordings ||
    data?.payload?.metadata ||
    [];

  return (Array.isArray(recordings) ? recordings : Object.values(recordings))
    .map((item) => normalizeListenBrainzRecording(item))
    .filter(Boolean);
}

function normalizeListenBrainzRecording(item) {
  const id = item.recording_mbid || item.mbid || item.recording?.recording_mbid || item.recording?.mbid;
  const title = item.recording_name || item.title || item.recording?.name || item.recording?.recording_name;
  const artist =
    item.artist_name ||
    item.artist_credit_name ||
    item.artist?.name ||
    item.recording?.artist_name ||
    artistCreditName(item["artist-credit"]);
  if (!id || !title) return null;

  const release = item.release_name || item.release?.name || item.release?.title || "";
  const tags = openListenBrainzTags(item);

  return {
    trackId: id,
    trackName: title,
    artistName: artist || "Unknown artist",
    collectionName: release,
    primaryGenreName: tags[0] || "Open music",
    releaseDate: item.release_date || item.date || "",
    trackViewUrl: `https://musicbrainz.org/recording/${id}`,
    artworkUrl100: "",
    releaseMbid: item.release_mbid || item.release?.mbid || item.release?.id || "",
    tags,
    listenBrainz: item,
  };
}

function normalizeSimilarItem(item) {
  const id = item.recording_mbid || item.mbid || item.recording?.recording_mbid || item.recording?.mbid;
  const title = item.recording_name || item.name || item.title || item.recording?.name;
  const artist = item.artist_name || item.artist_credit_name || item.artist?.name || item.recording?.artist_name;
  if (!id || !title) return null;

  return {
    trackId: id,
    trackName: title,
    artistName: artist || "Unknown artist",
    collectionName: "",
    primaryGenreName: "Open music",
    releaseDate: "",
    trackViewUrl: `https://musicbrainz.org/recording/${id}`,
    artworkUrl100: "",
    releaseMbid: item.release_mbid || item.release?.mbid || item.release?.id || "",
    tags: [],
    listenBrainz: item,
  };
}

function extractSimilarMbids(data) {
  return flattenSimilarItems(data)
    .map((item) => item.recording_mbid || item.mbid || item.recording?.recording_mbid || item.recording?.mbid)
    .filter(Boolean);
}

function flattenSimilarItems(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  const candidates = [
    data.payload,
    data.recordings,
    data.similar_recordings,
    data.results,
    data.data,
    data.payload?.recordings,
    data.payload?.similar_recordings,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (candidate && typeof candidate === "object") {
      const values = Object.values(candidate).flat();
      if (values.length) return values;
    }
  }
  return [];
}

function openMusicTags(musicBrainz, listenBrainz, acousticBrainz) {
  const tags = new Set();
  const recording = musicBrainz?.recordings?.[0] || musicBrainz || {};

  for (const item of [...(recording.tags || []), ...(recording.genres || [])]) {
    if (item?.name) tags.add(item.name.toLowerCase());
  }
  for (const tag of openListenBrainzTags(listenBrainz)) tags.add(tag.toLowerCase());

  const high = acousticBrainz?.highLevel?.highlevel || {};
  for (const [key, value] of Object.entries(high)) {
    if (key.startsWith("mood_") && value?.value) tags.add(value.value.toLowerCase());
    if (key.startsWith("genre_") && value?.value) tags.add(value.value.toLowerCase());
  }

  return [...tags].slice(0, 18);
}

function openListenBrainzTags(item) {
  const tags = new Set();
  const blocks = [
    item?.tag,
    item?.tags,
    item?.recording?.tag,
    item?.metadata?.tag,
    item?.metadata?.tag?.recording,
  ];

  for (const block of blocks) {
    if (!block) continue;
    const values = Array.isArray(block) ? block : Object.values(block).flat();
    for (const value of values) {
      if (typeof value === "string") tags.add(value);
      if (value?.tag) tags.add(value.tag);
      if (value?.name) tags.add(value.name);
    }
  }

  return [...tags].filter(Boolean).slice(0, 18);
}

function seedSearchQueries(term) {
  const normalized = normalize(term);
  const queries = [];
  const known = knownSearchQuery(normalized);
  if (known) queries.push(known);

  queries.push(term);

  const words = normalized.split(" ").filter(Boolean);
  if (words.length <= 5) {
    queries.push(`recording:"${escapeLucene(term)}"`);
  }

  const artistGuess = knownArtistFromQuery(normalized);
  if (artistGuess) {
    const titleGuess = normalized.replace(artistGuess, "").trim();
    if (titleGuess) {
      queries.push(`recording:"${escapeLucene(titleGuess)}" AND artist:"${escapeLucene(artistGuess)}"`);
    }
  }

  return [...new Set(queries.filter(Boolean))].slice(0, 5);
}

function knownSearchQuery(normalizedTerm) {
  for (const [title, artist] of knownOriginals) {
    if (normalizedTerm.includes(title) && (normalizedTerm.includes(artist) || normalizedTerm === title)) {
      return `recording:"${escapeLucene(title)}" AND artist:"${escapeLucene(artist)}"`;
    }
  }
  return null;
}

function knownArtistFromQuery(normalizedTerm) {
  for (const artist of knownOriginals.values()) {
    if (normalizedTerm.includes(artist)) return artist;
  }
  return null;
}

function fallbackSearchQueries(seed) {
  const knownProfile = knownTrackProfile(seed);
  if (knownProfile?.queries?.length) return knownProfile.queries;

  const tags = [...new Set([...trackMicroVibes(seed), ...(seed.openMusic?.tags || []), ...(seed.tags || [])])]
    .map(normalize)
    .filter(Boolean);
  const tagQueries = tags.slice(0, 8).map((tag) => `tag:${quoteTag(tag)}`);
  const pairQueries = [];

  for (let index = 0; index < Math.min(tags.length - 1, 5); index += 1) {
    pairQueries.push(`tag:${quoteTag(tags[index])} AND tag:${quoteTag(tags[index + 1])}`);
  }

  const genre = normalize(seed.primaryGenreName);
  const genreQueries = genre && genre !== "open music" ? [`tag:${quoteTag(genre)}`] : [];
  const artistFallback = seed.artistName && normalize(seed.artistName) !== "unknown artist"
    ? [`artist:"${escapeLucene(seed.artistName)}"`]
    : [];

  return [...new Set([...(knownProfile?.queries || []), ...pairQueries, ...tagQueries, ...genreQueries, ...artistFallback])].slice(0, 14);
}

function deezerSearchQueries(seed) {
  const profile = knownTrackProfile(seed);
  const anchorQueries = (profile?.queries || [])
    .map(parseAnchorQuery)
    .filter(Boolean)
    .map((item) => ({ query: `${item.title} ${item.artist}`, tags: profile.tags || [], specificity: 1 }));
  const vibes = [...new Set([...trackMicroVibes(seed), ...(seed.tags || []), ...(seed.openMusic?.tags || [])])]
    .map(cleanGenreLabel)
    .filter(Boolean)
    .filter((vibe) => !genericQueryTerm(vibe))
    .slice(0, 8);
  const artist = usableArtistName(seed.artistName) ? seed.artistName : displayArtist(seed);
  const title = seed.trackName || displayTitle(seed);
  const genre = cleanGenreLabel(seed.primaryGenreName);
  const genreQuery = genre && !genericQueryTerm(genre)
    ? [{ query: `${genre} ${artist}`, tags: [genre], specificity: 0.72 }]
    : [];

  return [
    ...anchorQueries,
    { query: `${title} ${artist}`, tags: trackMicroVibes(seed), specificity: 1 },
    { query: `${title} ${artist} similar`, tags: trackMicroVibes(seed), specificity: 0.92 },
    { query: `${artist} ${vibes.slice(0, 2).join(" ")}`, tags: vibes.slice(0, 2), specificity: 0.78 },
    ...genreQuery,
    ...vibes.map((vibe) => ({ query: `${vibe} ${artist}`, tags: [vibe], specificity: 0.68 })),
  ]
    .map((item) => ({ ...item, query: String(item.query || "").trim() }))
    .filter((item) => item.query && querySpecificity(item.query) >= 0.45)
    .filter((item, index, list) => list.findIndex((other) => other.query === item.query) === index)
    .slice(0, 12);
}

function trackMicroVibes(track) {
  const text = normalize(`${track.trackName} ${track.artistName} ${track.collectionName} ${(track.tags || []).join(" ")}`);
  const tags = new Set();

  const knownProfile = knownTrackProfile(track);
  if (knownProfile) {
    knownProfile.tags.forEach((tag) => tags.add(tag));
    return [...tags];
  }

  for (const [vibe, vibeTags] of Object.entries(everyNoiseInspiredVibes)) {
    if (vibeTags.some((tag) => text.includes(normalize(tag))) || text.includes(normalize(vibe))) {
      vibeTags.forEach((tag) => tags.add(tag));
    }
  }

  if (text.includes("rock")) ["rock", "guitar", "drums"].forEach((tag) => tags.add(tag));
  if (text.includes("funk")) ["funk", "bass", "groove"].forEach((tag) => tags.add(tag));
  if (text.includes("pop")) ["pop", "polished", "hook"].forEach((tag) => tags.add(tag));
  if (text.includes("ambient")) ["ambient", "spacious", "texture"].forEach((tag) => tags.add(tag));
  if (text.includes("metal")) ["metal", "distortion", "heavy"].forEach((tag) => tags.add(tag));
  if (text.includes("soul") || text.includes("r b")) ["soul", "warm", "vocal"].forEach((tag) => tags.add(tag));

  return [...tags].slice(0, 12);
}

function everyNoiseQueryTags(query) {
  const text = normalize(query);
  const tags = new Set();
  for (const [vibe, vibeTags] of Object.entries(everyNoiseInspiredVibes)) {
    if (text.includes(normalize(vibe)) || vibeTags.some((tag) => text.includes(normalize(tag)))) {
      vibeTags.forEach((tag) => tags.add(tag));
    }
  }
  return [...tags].slice(0, 10);
}

function candidateRelevantToSeed(seed, track) {
  const seedText = normalize(`${seed.trackName} ${seed.artistName} ${(seed.tags || []).join(" ")} ${(seed.openMusic?.tags || []).join(" ")}`);
  const trackText = normalize(`${track.trackName} ${track.artistName} ${track.collectionName} ${(track.tags || []).join(" ")}`);
  const seedArtist = normalize(seed.artistName);
  const trackArtist = normalize(track.artistName);
  const tagScore = vibeTagSimilarity(
    [...trackMicroVibes(seed), ...(seed.tags || []), ...(seed.openMusic?.tags || [])],
    [...trackMicroVibes(track), ...(track.tags || [])],
  );
  const textScore = textSimilarity(seedText, trackText);
  const queryScore = textSimilarity(track.candidateQuery || "", trackText);
  const sameArtist = seedArtist && trackArtist && seedArtist === trackArtist;
  const specificity = track.candidateSpecificity || 0;
  const languageScore = languageMatchScore(detectTrackLanguage(seed), detectTrackLanguage(track));

  return sameArtist || languageScore >= 0.08 || tagScore >= 0.18 || textScore >= 0.1 || (specificity >= 0.75 && queryScore >= 0.12);
}

function querySpecificity(query) {
  const words = normalize(query).split(" ").filter(Boolean);
  const useful = words.filter((word) => !genericQueryTerm(word));
  return clamp(useful.length / 5, 0, 1);
}

function genericQueryTerm(value) {
  return /^(pop|rock|music|song|track|hits?|best|top|official|similar|catalog|vibe|dance|rap|hip|hop|indie|latin|r b|rb)$/.test(normalize(value));
}

function detectTrackLanguage(track) {
  const text = normalize(`${track.trackName} ${track.artistName} ${track.collectionName} ${(track.tags || []).join(" ")}`);
  const ptWords = ["ceu", "azul", "voce", "pra", "pro", "amor", "saudade", "vida", "minha", "meu", "nao", "mais", "bem", "quando", "tudo", "tempo", "casa", "mar", "dia", "noite", "brasil"];
  const esWords = ["que", "amor", "vida", "corazon", "cuando", "quiero", "noche", "baila", "contigo", "hasta", "siempre", "sin", "para", "como"];
  const enWords = ["the", "you", "again", "love", "see", "blue", "night", "heart", "baby", "dream", "never", "forever", "with", "without"];
  const artistHints = [
    [/charlie brown|skank|legiao urbana|cassia eller|jorge ben|caetano|gilberto gil|anavitoria|maneva|natiruts|engenheiros|raimundos|marisa monte|tribalistas|o rappa|capital inicial/, "pt"],
    [/wiz khalifa|charlie puth|taylor swift|billie eilish|michael jackson|weeknd|queen|nirvana|coldplay|adele|bruno mars|beyonce|rihanna/, "en"],
    [/bad bunny|shakira|rosalia|maluma|karol g|enrique iglesias|rauw alejandro|mana|juanes/, "es"],
  ];

  for (const [pattern, language] of artistHints) {
    if (pattern.test(text)) return language;
  }

  const pt = wordHits(text, ptWords);
  const es = wordHits(text, esWords);
  const en = wordHits(text, enWords);
  const best = Math.max(pt, es, en);
  if (best === 0) return "unknown";
  if (best === pt && pt >= es && pt >= en) return "pt";
  if (best === es && es >= pt && es >= en) return "es";
  return "en";
}

function wordHits(text, words) {
  return words.reduce((count, word) => count + (new RegExp(`\\b${word}\\b`).test(text) ? 1 : 0), 0);
}

function languageMatchScore(seedLanguage, candidateLanguage) {
  if (!seedLanguage || seedLanguage === "unknown" || candidateLanguage === "unknown") return 0;
  return seedLanguage === candidateLanguage ? 0.12 : -0.16;
}

function languageCriterion(seedLanguage, track) {
  if (!seedLanguage || seedLanguage === "unknown") return null;
  const candidateLanguage = detectTrackLanguage(track);
  if (candidateLanguage === "unknown") return null;
  return criterion(
    "Same language",
    seedLanguage === candidateLanguage ? 1 : 0,
    true,
    `${languageName(candidateLanguage)} catalog signal`,
    0.96,
  );
}

function languageTag(track) {
  const language = detectTrackLanguage(track);
  return language === "unknown" ? "" : `language:${language}`;
}

function languageName(language) {
  return { pt: "Portuguese", en: "English", es: "Spanish" }[language] || "Unknown";
}

function knownTrackProfile(track) {
  const text = normalize(`${track.trackName} ${track.artistName} ${track.collectionName} ${(track.tags || []).join(" ")}`);
  return knownTrackVibes.find((item) => item.match.every((part) => text.includes(normalize(part)))) || null;
}

function mergeSearchResults(batches) {
  const byId = new Map();
  batches.forEach((batch, batchIndex) => {
    batch.forEach((recording, index) => {
      const current = byId.get(recording.id);
      const bonus = Math.max(0, 60 - batchIndex * 8 - index);
      const score = Number(recording.score || 0) + bonus;
      if (!current || score > current.score) byId.set(recording.id, { ...recording, score });
    });
  });
  return [...byId.values()];
}

function quoteTag(tag) {
  return tag.includes(" ") ? `"${escapeLucene(tag)}"` : escapeLucene(tag);
}

function escapeLucene(value) {
  return String(value || "").replace(/["\\]/g, " ").trim();
}

function parseAnchorQuery(query) {
  const match = String(query).match(/^recording:"([^"]+)" AND artist:"([^"]+)"$/);
  return match ? { title: match[1], artist: match[2] } : null;
}

function renderSeed(track) {
  seedSection.hidden = false;
  const sources = track.openMusic?.sources?.join(" + ") || "MusicBrainz";
  const acoustic = hasAcousticData(track.openMusic)
    ? "AcousticBrainz audio criteria available."
    : "AcousticBrainz has no audio profile for this recording, so matches use ListenBrainz neighbors plus MusicBrainz tags.";

  seedCard.dataset.trackId = track.trackId;
  seedCard.innerHTML = `
    <img class="cover" src="${artwork(track, 300)}" alt="Cover for ${escapeHtml(track.trackName)}" />
    <div>
      <span class="mood-tag">${escapeHtml(cleanVibeLabel(inferMoodFromOpenData(track.openMusic)))}</span>
      <h3>${escapeHtml(displayTitle(track))}</h3>
      <p class="artist">${escapeHtml(displayArtist(track))}</p>
      <p class="why">${escapeHtml(track.collectionName || "Release not listed")} ${year(track.releaseDate) || ""}. ${escapeHtml(acoustic)} Sources: ${escapeHtml(sources)}.</p>
      <audio controls preload="none" hidden></audio>
      <div class="actions">
        <a href="${track.trackViewUrl}" target="_blank" rel="noreferrer">${escapeHtml(linkLabel(track))}</a>
      </div>
    </div>
  `;
}

function renderResults(tracks) {
  currentTracks.clear();
  results.innerHTML = "";

  tracks.forEach((track) => {
    currentTracks.set(track.trackId, track);
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".track-card");
    const audio = node.querySelector("audio");
    const link = node.querySelector("a");
    const small = node.querySelector("small");

    card.dataset.trackId = track.trackId;
    node.querySelector(".cover").src = artwork(track, 300);
    node.querySelector(".cover").alt = `Cover for ${track.trackName}`;
    node.querySelector(".match-score").textContent = `${track.matchPercent || track.score}% match`;
    node.querySelector(".mood-tag").textContent = cleanVibeLabel(track.mood);
    node.querySelector("h3").textContent = displayTitle(track);
    node.querySelector(".artist").textContent = displayArtistLine(track);
    node.querySelector(".why").textContent = track.analysis;
    node.querySelector(".vibe-bars").innerHTML = vibeBars(track.criterionMatches || []);
    node.querySelector(".favorite").textContent = isFavorite(track) ? "Saved" : "Save";
    link.href = track.trackViewUrl;
    link.textContent = linkLabel(track);
    audio.hidden = true;
    small.textContent = "Loading cover and preview...";

    results.appendChild(node);
  });

  hydrateMediaForTracks(tracks);
}

async function hydrateSeedMedia(track) {
  track.media = track.media || (await enrichMedia(track));
  if (seedCard.dataset.trackId !== track.trackId) return;
  const image = seedCard.querySelector("img.cover");
  const audio = seedCard.querySelector("audio");
  if (image) image.src = artwork(track, 300);
  if (audio && track.media?.previewUrl) {
    audio.src = track.media.previewUrl;
    audio.hidden = false;
  }
}

async function hydrateMediaForTracks(tracks) {
  let completed = 0;
  updateProgress(82, "Loading covers and previews");
  await mapWithConcurrency(tracks, 8, async (track) => {
    track.media = track.media || (await enrichMedia(track));
    completed += 1;
    updateProgress(82 + (completed / Math.max(tracks.length, 1)) * 18, "Loading covers and previews");
    const card = results.querySelector(`[data-track-id="${cssEscape(track.trackId)}"]`);
    if (!card) return;

    const image = card.querySelector("img.cover");
    const audio = card.querySelector("audio");
    const small = card.querySelector("small");
    const title = card.querySelector("h3");
    const artist = card.querySelector(".artist");
    if (image) image.src = artwork(track, 300);
    if (title) title.textContent = displayTitle(track);
    if (artist) artist.textContent = displayArtistLine(track);
    if (audio && track.media?.previewUrl) {
      audio.src = track.media.previewUrl;
      audio.hidden = false;
    }
    if (small) {
      small.textContent = track.media?.previewUrl
        ? "Preview and cover from Deezer. Similarity data from MusicBrainz, ListenBrainz, and AcousticBrainz."
      : "Cover loaded when available. Preview unavailable for this track.";
    }
  });
  updateProgress(100, "Done");
  window.setTimeout(() => updateProgress(0, "Ready", { hidden: true }), 900);
}

function vibeBars(criteria) {
  return criteria
    .slice(0, 12)
    .map(
      (item) => `
        <div class="vibe-bar">
          <span>${escapeHtml(item.label)}</span>
          <b style="width: ${Math.round((item.score || 0) * 100)}%"></b>
        </div>
      `,
    )
    .join("");
}

function criteriaAnalysis(comparison) {
  const labels = (comparison.criteria || [])
    .filter((item) => item.available && item.score >= 0.58)
    .slice(0, 4)
    .map((item) => item.label.toLowerCase());
  const source =
    comparison.acousticLevel === "full"
      ? "AcousticBrainz profile"
      : comparison.acousticLevel === "partial"
        ? "partial AcousticBrainz profile"
        : "ListenBrainz + MusicBrainz open data";

  if (!labels.length) {
    return `Matched by ${source}. Acoustic data is limited for this recording, so the score is capped.`;
  }

  return `Matched by ${source}: ${labels.join(", ")}.`;
}

function artwork(track) {
  if (track.media?.coverUrl) return track.media.coverUrl;
  if (track.artworkUrl100) return track.artworkUrl100;
  const coverArt = coverArtArchiveUrl(track);
  if (coverArt) return coverArt;
  const title = encodeURIComponent(track.trackName || "VibingEcho");
  const artist = encodeURIComponent(track.artistName || "Open music");
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23151418'/%3E%3Ccircle cx='225' cy='72' r='60' fill='%23ff3bd4' opacity='.22'/%3E%3Ccircle cx='85' cy='222' r='88' fill='%23333338'/%3E%3Ctext x='28' y='136' fill='%23ff3bd4' font-family='Arial' font-size='28' font-weight='700'%3EVibingEcho%3C/text%3E%3Ctext x='28' y='174' fill='%23f6edf4' font-family='Arial' font-size='18'%3E${title}%3C/text%3E%3Ctext x='28' y='202' fill='%23bdb5c0' font-family='Arial' font-size='15'%3E${artist}%3C/text%3E%3C/svg%3E`;
}

function coverArtArchiveUrl(track) {
  if (!isMbid(track.releaseMbid)) return "";
  return track.releaseMbid
    ? `https://coverartarchive.org/release/${encodeURIComponent(track.releaseMbid)}/front-500`
    : "";
}

function displayTitle(track) {
  return track.media?.title || track.trackName || "Unknown track";
}

function displayArtist(track) {
  if (usableArtistName(track.media?.artist)) return track.media.artist;
  if (usableArtistName(track.artistName)) return track.artistName;
  return "Artist unavailable";
}

function displayArtistLine(track) {
  const genre = cleanGenreLabel(track.primaryGenreName);
  return genre ? `${displayArtist(track)} - ${genre}` : displayArtist(track);
}

function linkLabel(track) {
  return track.deezerId || track.media?.mediaUrl?.includes("deezer.com") || track.trackViewUrl?.includes("deezer.com")
    ? "Open in Deezer"
    : "Open in MusicBrainz";
}

function cleanVibeLabel(value) {
  const normalized = normalize(value);
  if (!normalized || normalized === "open data" || normalized === "open music") return "vibe match";
  if (normalized.length > 24 || suspiciousTag(normalized)) return "vibe match";
  return String(value).replace(/-/g, " ");
}

function cleanGenreLabel(value) {
  const normalized = normalize(value);
  if (!normalized || normalized === "open music" || normalized === "open data") return "";
  if (normalized.length > 28 || suspiciousTag(normalized)) return "";
  return String(value).replace(/-/g, " ");
}

function usableArtistName(value) {
  const normalized = normalize(value);
  if (!normalized || normalized === "unknown artist" || normalized === "open music") return false;
  return !suspiciousTag(normalized);
}

function suspiciousTag(value) {
  const normalized = normalize(value);
  return /^(sinkus|sikus|unknown|various artists?|open data|open music)$/.test(normalized);
}

function seedScore(term, track) {
  const query = normalize(term);
  const title = normalize(track.trackName);
  const artist = normalize(track.artistName);
  const text = `${title} ${artist}`;
  let score = 0;

  if (text.includes(query)) score += 120;
  if (query.includes(title)) score += 80;
  if (title && query.startsWith(title)) score += 45;

  const originalArtist = knownOriginals.get(title);
  if (originalArtist && artist.includes(originalArtist)) score += 240;
  if (query.includes(artist)) score += 70;
  if (isLowQualityVariant(track)) score -= 220;
  score += Number(track.score || 0) / 2;

  return score;
}

function isLowQualityVariant(track) {
  const text = normalize(`${track.trackName} ${track.artistName} ${track.collectionName}`);
  return /\b(live|karaoke|tribute|cover|remix|instrumental|made famous by|sped up|slowed|re-recorded|demos?|outtake|rehearsal)\b/.test(text);
}

function isMbid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function diversifyTracks(tracks, limit) {
  const selected = [];
  const artistCounts = new Map();
  const titles = new Set();

  for (const track of tracks) {
    const artist = normalize(track.artistName);
    const title = normalize(track.trackName);
    const artistUses = artistCounts.get(artist) || 0;
    if (artistUses >= 1 || titles.has(title)) continue;
    selected.push(track);
    artistCounts.set(artist, artistUses + 1);
    titles.add(title);
    if (selected.length === limit) return selected;
  }

  for (const track of tracks) {
    const artist = normalize(track.artistName);
    const title = normalize(track.trackName);
    const artistUses = artistCounts.get(artist) || 0;
    if (artistUses >= 2 || titles.has(title)) continue;
    selected.push(track);
    artistCounts.set(artist, artistUses + 1);
    titles.add(title);
    if (selected.length === limit) return selected;
  }

  return selected;
}

function applyStrictness(score, similarity, acousticLevel) {
  const floor = acousticLevel === "full" ? 0.34 : acousticLevel === "partial" ? 0.3 : 0.24;
  const adjusted = score - Math.max(0, similarity - 0.72) * 0.28;
  return clamp(adjusted, floor, 0.96);
}

function passThreshold(similarity, acousticLevel) {
  if (acousticLevel === "tags") return 0.42;
  if (acousticLevel === "partial") return Math.max(0.44, similarity - 0.2);
  return Math.max(0.5, similarity - 0.12);
}

function categoryData(category) {
  return categoryCatalog[category] || categoryCatalog.pop;
}

function inferMoodFromOpenData(openMusic) {
  const tags = (openMusic?.tags || []).map(normalize);
  const text = tags.join(" ");
  if (text.includes("sad") || text.includes("melancholic") || text.includes("minor")) return "melancholic";
  if (text.includes("aggressive") || text.includes("metal") || text.includes("punk")) return "aggressive";
  if (text.includes("relaxed") || text.includes("ambient") || text.includes("calm")) return "calm";
  if (text.includes("happy") || text.includes("bright")) return "bright";
  if (text.includes("electronic") || text.includes("dance") || text.includes("party")) return "club";
  if (text.includes("acoustic") || text.includes("folk")) return "organic";
  if (text.includes("dark")) return "dark";
  return tags[0] || null;
}

function hasAcousticData(openMusic) {
  return hasAcousticPayload(openMusic?.acousticBrainz);
}

function hasAcousticPayload(acousticBrainz) {
  return Boolean(acousticBrainz?.lowLevel || acousticBrainz?.highLevel);
}

function criterion(label, score, available, detail, weight = 1) {
  return {
    label,
    score: clamp(score || 0, 0, 1),
    available,
    detail,
    weight,
  };
}

function tagSimilarity(a, b) {
  const left = new Set(a.map(normalize).filter(Boolean));
  const right = new Set(b.map(normalize).filter(Boolean));
  if (!left.size || !right.size) return 0;
  let overlap = 0;
  for (const tag of left) if (right.has(tag)) overlap += 1;
  return overlap / Math.sqrt(left.size * right.size);
}

function vibeTagSimilarity(a, b) {
  const expandedA = expandVibeTags(a);
  const expandedB = expandVibeTags(b);
  return tagSimilarity(expandedA, expandedB);
}

function textSimilarity(left, right) {
  const a = normalize(left);
  const b = normalize(right);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.82;

  const wordsA = new Set(a.split(" ").filter(Boolean));
  const wordsB = new Set(b.split(" ").filter(Boolean));
  let overlap = 0;
  for (const word of wordsA) if (wordsB.has(word)) overlap += 1;
  return overlap / Math.max(wordsA.size, wordsB.size, 1);
}

function expandVibeTags(tags) {
  const expanded = new Set();
  for (const tag of tags || []) {
    const normalized = normalize(tag);
    if (!normalized) continue;
    expanded.add(normalized);
    for (const vibeTags of Object.values(everyNoiseInspiredVibes)) {
      if (vibeTags.map(normalize).includes(normalized)) {
        vibeTags.forEach((item) => expanded.add(normalize(item)));
      }
    }
  }
  return [...expanded];
}

function weightedTagOverlap(tags, targets) {
  return tagSimilarity(tags, targets);
}

function overlapToText(value) {
  if (value >= 0.7) return "Strong";
  if (value >= 0.4) return "Medium";
  if (value > 0) return "Light";
  return "No";
}

function vectorSimilarity(a, b) {
  const pairs = (a || [])
    .map((value, index) => [number(value), number(b?.[index])])
    .filter(([x, y]) => isFiniteNumber(x) && isFiniteNumber(y));
  if (pairs.length < 2) return null;

  const diffs = pairs.map(([x, y]) => {
    const scale = Math.max(Math.abs(x), Math.abs(y), 1);
    return Math.abs(x - y) / scale;
  });
  return clamp(1 - average(diffs), 0, 1);
}

function weightedAverage(values) {
  const usable = values.filter(([value]) => isFiniteNumber(value));
  const weight = usable.reduce((sum, item) => sum + item[1], 0);
  if (!usable.length || !weight) return 0;
  return usable.reduce((sum, item) => sum + item[0] * item[1], 0) / weight;
}

function average(values) {
  const usable = values.filter(isFiniteNumber);
  if (!usable.length) return 0;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

function equalityScore(a, b) {
  if (!a || !b) return 0;
  return normalize(a) === normalize(b) ? 1 : 0.25;
}

function highLevelScore(value) {
  if (!value) return null;
  if (isFiniteNumber(value.probability)) return value.value === "not_" || String(value.value).startsWith("not_") ? 1 - value.probability : value.probability;
  if (value.value === true || value.value === "true") return 1;
  if (value.value === false || String(value.value).startsWith("not_")) return 0;
  return 0.5;
}

function arrayMean(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(number).filter(isFiniteNumber);
  if (typeof value === "object") return Object.values(value).map(number).filter(isFiniteNumber);
  return [];
}

function keyToNumber(key) {
  const keys = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
  const index = keys.indexOf(normalize(key));
  return index >= 0 ? index / 11 : null;
}

function inferTextureFromProfile(lowLevel, highLevel) {
  if (highLevel?.mood_acoustic?.value === "acoustic") return "organic";
  if (highLevel?.mood_electronic?.value === "electronic") return "electronic";
  const loudness = number(lowLevel.average_loudness);
  const complexity = number(lowLevel.dynamic_complexity);
  if (loudness > 0.85 || complexity > 0.75) return "dense";
  if (complexity < 0.35) return "smooth";
  return "textured";
}

async function fetchJson(url) {
  const cached = readCache(url);
  if (cached) return cached;

  let response = await fetch(url);
  if (!response.ok) {
    const fallbackUrl = externalFallbackUrl(url);
    if (fallbackUrl) {
      response = await fetch(fallbackUrl, { headers: { Accept: "application/json" } });
    }
  }
  if (!response.ok) {
    throw new Error(`${url.split("?")[0]} returned ${response.status}`);
  }
  const data = await response.json();
  if (data?.error) throw new Error(data.error);
  writeCache(url, data);
  return data;
}

function externalFallbackUrl(url) {
  const parsed = new URL(url, location.origin);
  const path = parsed.pathname;

  if (path === OPEN_SEARCH_API_URL) {
    const query = parsed.searchParams.get("q") || "";
    const limit = parsed.searchParams.get("limit") || "10";
    return `https://musicbrainz.org/ws/2/recording?fmt=json&limit=${encodeURIComponent(limit)}&query=${encodeURIComponent(query)}`;
  }

  if (path === MUSICBRAINZ_API_URL) {
    const mbid = parsed.searchParams.get("mbid");
    if (mbid) {
      return `https://musicbrainz.org/ws/2/recording/${encodeURIComponent(mbid)}?fmt=json&inc=artists+releases+tags+genres`;
    }
  }

  if (path === ACOUSTICBRAINZ_API_URL) {
    const mbid = parsed.searchParams.get("mbid");
    if (mbid) {
      return `https://acousticbrainz.org/api/v1/${encodeURIComponent(mbid)}/low-level`;
    }
  }

  if (path === SIMILARBRAINZ_API_URL) {
    const mbid = parsed.searchParams.get("mbid");
    if (mbid) {
      return `https://labs.api.listenbrainz.org/similar-recordings/json?recording_mbids=${encodeURIComponent(mbid)}&algorithm=session_based_days_7500_session_300_contribution_5_threshold_15_limit_50_skip_30`;
    }
  }

  if (path === MEDIA_API_URL) {
    const query = parsed.searchParams.get("q");
    if (query) {
      const limit = parsed.searchParams.get("limit") || "24";
      return `https://api.deezer.com/search/track?q=${encodeURIComponent(query)}&limit=${encodeURIComponent(limit)}`;
    }
    const track = parsed.searchParams.get("track") || "";
    const artist = parsed.searchParams.get("artist") || "";
    const mediaQuery = artist ? `track:"${track}" artist:"${artist}"` : track;
    return `https://api.deezer.com/search/track?q=${encodeURIComponent(mediaQuery)}&limit=12`;
  }

  return null;
}

async function fetchJsonSafe(url) {
  try {
    return await fetchJson(url);
  } catch (error) {
    console.warn(error);
    return null;
  }
}

function readCache(key) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    const item = cache[key];
    if (!item || Date.now() - item.time > CACHE_TTL) return null;
    return item.value;
  } catch {
    return null;
  }
}

function writeCache(key, value) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    cache[key] = { time: Date.now(), value };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore private-mode storage failures.
  }
}

function addHistory(query) {
  const history = readList(HISTORY_KEY).filter((item) => item !== query);
  history.unshift(query);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 8)));
  renderHistory();
}

function toggleFavorite(track) {
  const query = `${track.trackName} ${track.artistName}`;
  const favorites = readList(FAVORITES_KEY);
  const next = favorites.includes(query)
    ? favorites.filter((item) => item !== query)
    : [query, ...favorites].slice(0, 10);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
}

function isFavorite(track) {
  return readList(FAVORITES_KEY).includes(`${track.trackName} ${track.artistName}`);
}

function renderHistory() {
  renderChipList(historyList, readList(HISTORY_KEY));
}

function renderFavorites() {
  renderChipList(favoritesList, readList(FAVORITES_KEY));
}

function renderChipList(container, items) {
  container.innerHTML = items.length
    ? items
        .map(
          (item) => `<button type="button" data-query="${escapeHtml(item)}">${escapeHtml(item)}</button>`,
        )
        .join("")
    : `<span class="empty-state">Nothing here yet.</span>`;
}

function readList(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function updateSimilarityLabel() {
  const value = similarityValue();
  similarityLabel.textContent = value >= 0.82 ? "very strict" : value >= 0.66 ? "closer sound" : "more discovery";
}

function similarityValue() {
  return Number(similarityInput.value) / 100;
}

function setLoading(isLoading, message) {
  form.querySelector("button[type='submit']").disabled = isLoading;
  categoryButton.disabled = isLoading;
  surpriseButton.disabled = isLoading;
  if (message) setStatus(message);
}

function setStatus(message) {
  statusText.textContent = message;
}

function updateProgress(value, label, options = {}) {
  const percent = Math.round(clamp(value, 0, 100));
  progressWrap.hidden = Boolean(options.hidden);
  if (!options.hidden) {
    progressLabel.textContent = label;
    progressPercent.textContent = `${percent}%`;
    progressBar.style.width = `${percent}%`;
  }
}

async function mapWithConcurrency(items, limit, worker) {
  const resultsList = [];
  let index = 0;
  async function next() {
    const current = index;
    index += 1;
    if (current >= items.length) return;
    resultsList[current] = await worker(items[current], current);
    await next();
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
  return resultsList;
}

function dedupeTracks(tracks) {
  const seen = new Map();
  for (const track of tracks) {
    const key =
      track.trackName && track.artistName
        ? `${normalize(track.trackName)}:${normalize(track.artistName)}`
        : track.trackId;
    if (!seen.has(key)) seen.set(key, track);
  }
  return [...seen.values()];
}

function artistCreditName(credit) {
  if (!Array.isArray(credit)) return "";
  return credit
    .map((item) => item.name || item.artist?.name || "")
    .filter(Boolean)
    .join(" & ");
}

function year(value) {
  return value ? String(value).slice(0, 4) : "";
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isFiniteNumber(value) {
  return Number.isFinite(value);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cssEscape(value) {
  if (window.CSS?.escape) return CSS.escape(String(value));
  return String(value).replace(/["\\]/g, "\\$&");
}
