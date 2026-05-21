const form = document.querySelector("#recommendation-form");
const queryInput = document.querySelector("#music-query");
const vibePromptInput = document.querySelector("#vibe-prompt");
const moodInput = document.querySelector("#mood");
const similarityInput = document.querySelector("#similarity");
const similarityLabel = document.querySelector("#similarity-label");
const categoryInput = document.querySelector("#category");
const statusText = document.querySelector("#status-text");
const seedSection = document.querySelector("#seed-section");
const seedCard = document.querySelector("#seed-card");
const results = document.querySelector("#results");
const clearCacheButton = document.querySelector("#clear-cache");
const spotifyPlaylistButton = document.querySelector("#spotify-playlist");
const categoryButton = document.querySelector("#category-button");
const vibePromptButton = document.querySelector("#vibe-prompt-button");
const surpriseButton = document.querySelector("#surprise-button");
const historyList = document.querySelector("#history-list");
const favoritesList = document.querySelector("#favorites-list");
const progressWrap = document.querySelector("#progress-wrap");
const progressLabel = document.querySelector("#progress-label");
const progressPercent = document.querySelector("#progress-percent");
const progressBar = document.querySelector("#progress-bar");
const template = document.querySelector("#track-card-template");

const APP_VERSION = "vibingecho-vibe-prompt-v47";
const OPEN_SEARCH_API_URL = "/api/open-search";
const SIMILARBRAINZ_API_URL = "/api/similarbrainz";
const LISTENBRAINZ_RECORDINGS_API_URL = "/api/listenbrainz-recordings";
const MUSICBRAINZ_API_URL = "/api/musicbrainz";
const ACOUSTICBRAINZ_API_URL = "/api/acousticbrainz";
const MEDIA_API_URL = "/api/deezer";
const CACHE_KEY = "vibingecho-vibe-prompt-cache-v47";
const HISTORY_KEY = "vibingecho-history-v1";
const FAVORITES_KEY = "vibingecho-favorites-v1";
const SPOTIFY_TOKEN_KEY = "vibingecho-spotify-token-v1";
const SPOTIFY_VERIFIER_KEY = "vibingecho-spotify-verifier-v1";
const SPOTIFY_PENDING_PLAYLIST_KEY = "vibingecho-spotify-pending-playlist-v1";
const SPOTIFY_PENDING_TRACKS_KEY = "vibingecho-spotify-pending-tracks-v1";
const SPOTIFY_CLIENT_ID_KEY = "vibingecho-spotify-client-id-v1";
const CACHE_TTL = 1000 * 60 * 60 * 24;
const RECOMMENDATION_LIMIT = 36;
const CATEGORY_LIMIT = 36;
const FAST_CANDIDATE_LIMIT = 48;
const SPOTIFY_CLIENT_ID = "PASTE_YOUR_SPOTIFY_CLIENT_ID_HERE";

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

const knownArtistVibes = [
  {
    match: ["justin bieber"],
    tags: [
      "glossy",
      "romantic",
      "soft vocal",
      "bright",
      "clean",
      "smooth",
      "warm",
      "midtempo",
      "intimate",
      "bittersweet",
      "uplifting",
      "hook",
    ],
    queries: [
      "Stitches Shawn Mendes",
      "There's Nothing Holdin' Me Back Shawn Mendes",
      "Attention Charlie Puth",
      "We Don't Talk Anymore Charlie Puth Selena Gomez",
      "Stay The Kid LAROI Justin Bieber",
      "i'm so tired Lauv Troye Sivan",
      "Eastside benny blanco Halsey Khalid",
      "Young Dumb & Broke Khalid",
      "One Call Away Charlie Puth",
      "Treat You Better Shawn Mendes",
      "Slow Hands Niall Horan",
      "Dusk Till Dawn ZAYN Sia",
      "Pillowtalk ZAYN",
      "Mercy Shawn Mendes",
      "Love Me Like You Do Ellie Goulding",
      "Let Me Down Slowly Alec Benjamin",
    ],
  },
  {
    match: ["shawn mendes"],
    tags: ["glossy", "romantic", "soft vocal", "bright", "clean", "smooth", "midtempo", "uplifting", "hook"],
    queries: [
      "Love Yourself Justin Bieber",
      "Attention Charlie Puth",
      "Slow Hands Niall Horan",
      "i'm so tired Lauv Troye Sivan",
      "One Call Away Charlie Puth",
      "Eastside benny blanco Halsey Khalid",
    ],
  },
  {
    match: ["charlie puth"],
    tags: ["glossy", "clean", "smooth", "bright", "soft vocal", "midtempo", "hook", "romantic"],
    queries: [
      "Love Yourself Justin Bieber",
      "Stitches Shawn Mendes",
      "Slow Hands Niall Horan",
      "Stay The Kid LAROI Justin Bieber",
      "i'm so tired Lauv Troye Sivan",
    ],
  },
  {
    match: ["lauv"],
    tags: ["glossy", "bittersweet", "soft vocal", "clean", "smooth", "intimate", "midtempo", "romantic"],
    queries: [
      "Love Yourself Justin Bieber",
      "Eastside benny blanco Halsey Khalid",
      "We Don't Talk Anymore Charlie Puth Selena Gomez",
      "Let Me Down Slowly Alec Benjamin",
      "Slow Hands Niall Horan",
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

const vibePromptCatalog = [
  {
    label: "party rush",
    needles: ["party", "festa", "balada", "animado", "dançar", "dancar", "drinks", "friends", "amigos"],
    tags: ["euphoric", "bright", "groovy", "body-led", "punchy", "clean", "hook", "confident"],
    queries: ["Levitating Dua Lipa", "Can't Stop the Feeling Justin Timberlake", "Don't Start Now Dua Lipa", "Uptown Funk Mark Ronson Bruno Mars", "Where Have You Been Rihanna", "Rather Be Clean Bandit Jess Glynne"],
  },
  {
    label: "midnight drive",
    needles: ["drive", "dirigir", "madrugada", "night drive", "estrada", "carro", "cidade vazia", "late night"],
    tags: ["nocturnal", "spacious", "pulse", "smooth", "bittersweet", "cinematic", "bass-heavy", "glossy"],
    queries: ["Midnight City M83", "After Dark Mr.Kitty", "Nightcall Kavinsky", "The Less I Know The Better Tame Impala", "Sweater Weather The Neighbourhood", "505 Arctic Monkeys"],
  },
  {
    label: "missing an ex",
    needles: ["ex", "saudade", "termino", "término", "heartbreak", "sentir falta", "voltar", "breakup"],
    tags: ["melancholic", "bittersweet", "romantic", "lonely", "intimate", "soft vocal", "nostalgic", "slow-burn"],
    queries: ["Someone Like You Adele", "Before You Go Lewis Capaldi", "Let Her Go Passenger", "Heather Conan Gray", "drivers license Olivia Rodrigo", "All I Want Kodaline"],
  },
  {
    label: "remembering mother",
    needles: ["mae", "mãe", "mother", "mama", "familia", "família", "colo", "casa", "infancia", "infância"],
    tags: ["tender", "warm", "nostalgic", "organic", "soft vocal", "comforting", "intimate", "hopeful"],
    queries: ["Supermarket Flowers Ed Sheeran", "The Best Day Taylor Swift", "Slipping Through My Fingers ABBA", "Fix You Coldplay", "Landslide Fleetwood Mac", "A Song For Mama Boyz II Men"],
  },
  {
    label: "future thoughts",
    needles: ["futuro", "future", "pensar na vida", "crescer", "dream", "sonhar", "destino", "amanha", "amanhã"],
    tags: ["hopeful", "cinematic", "wide", "uplifting", "dreamy", "build-up", "reflective", "bright"],
    queries: ["Outro M83", "A Sky Full of Stars Coldplay", "Dog Days Are Over Florence The Machine", "Unwritten Natasha Bedingfield", "The Nights Avicii", "On Top Of The World Imagine Dragons"],
  },
  {
    label: "study focus",
    needles: ["study", "estudar", "foco", "focus", "ler", "reading", "concentrar", "trabalho", "homework"],
    tags: ["calm", "smooth", "spacious", "linear", "soft", "low-distraction", "warm", "steady"],
    queries: ["Intro The xx", "Avril 14th Aphex Twin", "Experience Ludovico Einaudi", "Sunset Lover Petit Biscuit", "Weightless Marconi Union", "River Flows in You Yiruma"],
  },
  {
    label: "rain window",
    needles: ["rain", "chuva", "janela", "frio", "winter", "inverno", "nublado", "cloudy"],
    tags: ["melancholic", "cozy", "soft", "spacious", "nostalgic", "warm", "intimate", "slow"],
    queries: ["Roslyn Bon Iver St. Vincent", "Holocene Bon Iver", "Apocalypse Cigarettes After Sex", "The Night We Met Lord Huron", "Cherry Wine Hozier", "I Know The End Phoebe Bridgers"],
  },
  {
    label: "confidence walk",
    needles: ["confiante", "confidence", "poderoso", "power", "boss", "se sentir foda", "autoestima", "walk"],
    tags: ["confident", "punchy", "sharp", "bass-heavy", "glossy", "dramatic", "bold", "driving"],
    queries: ["Power Kanye West", "bad guy Billie Eilish", "Needed Me Rihanna", "Industry Baby Lil Nas X Jack Harlow", "S&M Rihanna", "Seven Nation Army The White Stripes"],
  },
  {
    label: "gym pressure",
    needles: ["gym", "academia", "treino", "workout", "correr", "run", "raiva", "rage"],
    tags: ["aggressive", "punchy", "driving", "heavy", "percussive", "tense", "explosive", "confident"],
    queries: ["Till I Collapse Eminem", "Can't Hold Us Macklemore Ryan Lewis", "Believer Imagine Dragons", "Stronger Kanye West", "DNA Kendrick Lamar", "Remember The Name Fort Minor"],
  },
  {
    label: "sensual night",
    needles: ["sensual", "sexy", "seduzir", "romantic night", "quente", "ficar", "date", "encontro"],
    tags: ["sensual", "smooth", "warm", "bass-heavy", "intimate", "slow groove", "soft vocal", "dark"],
    queries: ["Earned It The Weeknd", "Often The Weeknd", "Get You Daniel Caesar Kali Uchis", "Adorn Miguel", "Pink + White Frank Ocean", "Come Through H.E.R. Chris Brown"],
  },
  {
    label: "alone at night",
    needles: ["sozinho", "alone", "lonely", "vazio", "empty", "insomnia", "insonia", "insônia", "overthinking"],
    tags: ["lonely", "dark", "spacious", "minimal", "soft vocal", "melancholic", "nocturnal", "intimate"],
    queries: ["when the party's over Billie Eilish", "Liability Lorde", "Space Song Beach House", "Fourth of July Sufjan Stevens", "Ivy Frank Ocean", "The Night We Met Lord Huron"],
  },
  {
    label: "beach sunset",
    needles: ["praia", "beach", "sunset", "por do sol", "pôr do sol", "verao", "verão", "mar"],
    tags: ["warm", "open-air", "bright", "relaxed", "groovy", "organic", "nostalgic", "smooth"],
    queries: ["Sunflower Rex Orange County", "Sunday Best Surfaces", "Banana Pancakes Jack Johnson", "Island In The Sun Weezer", "Brazil Declan McKenna", "Electric Feel MGMT"],
  },
  {
    label: "nostalgic friends",
    needles: ["amigos antigos", "old friends", "nostalgia", "adolescencia", "adolescência", "lembranças", "memories"],
    tags: ["nostalgic", "bright", "bittersweet", "anthemic", "warm", "uplifting", "open-air", "hook"],
    queries: ["Ribs Lorde", "Tongue Tied Grouplove", "Kids MGMT", "Young Blood The Naked and Famous", "Some Nights fun.", "We Are Young fun. Janelle Monae"],
  },
];

const curatedPromptMedia = {
  "someone like you adele": {
    title: "Someone Like You",
    artist: "Adele",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/eb/ca/25/ebca2596-cd1e-b295-91a3-771c868d0a79/191404113868.png/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/ef/18/7b/ef187b7d-f487-e935-4ca1-af5748313710/mzaf_8455263230305249048.plus.aac.p.m4a",
    mediaUrl: "https://music.apple.com/us/album/someone-like-you/1544491232?i=1544491998&uo=4",
  },
  "before you go lewis capaldi": {
    title: "Before You Go",
    artist: "Lewis Capaldi",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/9f/58/7c/9f587c97-f0e9-e335-d8e2-60b8e2d62bad/19UMGIM90850.rgb.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/60/b9/cc/60b9cc69-2e37-f867-bc15-91e2ce767b4a/mzaf_18421692819209045993.plus.aac.p.m4a",
    mediaUrl: "https://music.apple.com/us/album/before-you-go/1485383702?i=1485384412&uo=4",
  },
  "let her go passenger": {
    title: "Let Her Go",
    artist: "Passenger",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/9b/7e/28/9b7e2896-e049-1663-6791-e0111690ffc1/067003051361.png/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/1c/93/e5/1c93e5ed-eadc-effc-093a-cbaadc17f897/mzaf_16074705324618158471.plus.aac.p.m4a",
    mediaUrl: "https://music.apple.com/us/album/let-her-go/1623014082?i=1623014090&uo=4",
  },
  "heather conan gray": {
    title: "Heather",
    artist: "Conan Gray",
    coverUrl: "https://cdn-images.dzcdn.net/images/cover/0a5209aec8e37012eb07eb6ef01fa7e6/1000x1000-000000-80-0-0.jpg",
    previewUrl: "https://cdnt-preview.dzcdn.net/api/1/1/b/5/c/0/b5cfb18a3e62693393c84e7d30ffc028.mp3?hdnea=exp=1779405013~acl=/api/1/1/b/5/c/0/b5cfb18a3e62693393c84e7d30ffc028.mp3*~data=user_id=0,application_id=42~hmac=55fdac715792fe1810ef975a00d40e1c81ae440bf01014117228769a4b1de59a",
    mediaUrl: "https://www.deezer.com/track/903771442",
  },
  "drivers license olivia rodrigo": {
    title: "drivers license",
    artist: "Olivia Rodrigo",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/02/ed/8c/02ed8cab-c089-2fdd-7ce6-ab334a9a4e19/21UMGIM26093.rgb.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/36/62/61/366261be-0996-d73d-de6f-03417867c800/mzaf_8201528327761821135.plus.aac.p.m4a",
    mediaUrl: "https://music.apple.com/us/album/drivers-license/1560734944?i=1560735480&uo=4",
  },
  "all i want kodaline": {
    title: "All I Want",
    artist: "Kodaline",
    coverUrl: "https://cdn-images.dzcdn.net/images/cover/ae1ef143dd6852df87eefe8a405c091b/1000x1000-000000-80-0-0.jpg",
    previewUrl: "https://cdnt-preview.dzcdn.net/api/1/1/9/3/e/0/93ef116a1a3ee70ccd1fbb9cbdc45b9d.mp3?hdnea=exp=1779405014~acl=/api/1/1/9/3/e/0/93ef116a1a3ee70ccd1fbb9cbdc45b9d.mp3*~data=user_id=0,application_id=42~hmac=49489855a171204b78a271035bc2a3e6aef2bc90c8421c1a8e440869d8a6a81c",
    mediaUrl: "https://www.deezer.com/track/927608952",
  },
  "when the party s over billie eilish": {
    title: "when the party's over",
    artist: "Billie Eilish",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1a/37/d1/1a37d1b1-8508-54f2-f541-bf4e437dda76/19UMGIM05028.rgb.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/2a/ba/44/2aba4410-ba71-89ce-e075-10120409c31c/mzaf_16887001963655152332.plus.aac.p.m4a",
    mediaUrl: "https://music.apple.com/us/album/when-the-partys-over/1450695723?i=1450695872&uo=4",
  },
  "liability lorde": {
    title: "Liability",
    artist: "Lorde",
    coverUrl: "https://cdn-images.dzcdn.net/images/cover/0c424dbe627530cd06a6fd408baba3f3/1000x1000-000000-80-0-0.jpg",
    previewUrl: "https://cdnt-preview.dzcdn.net/api/1/1/f/6/4/0/f64334a02e92bd25ebc6af9a6fa5e3a3.mp3?hdnea=exp=1779405014~acl=/api/1/1/f/6/4/0/f64334a02e92bd25ebc6af9a6fa5e3a3.mp3*~data=user_id=0,application_id=42~hmac=4ba3ea8f8e988f254e3547ac5d4de8b80c7f730a6877426149a03844cbafa158",
    mediaUrl: "https://www.deezer.com/track/371625811",
  },
  "space song beach house": {
    title: "Space Song",
    artist: "Beach House",
    coverUrl: "https://cdn-images.dzcdn.net/images/cover/34cd5be5dbedbf061566eb976614c25d/1000x1000-000000-80-0-0.jpg",
    previewUrl: "https://cdnt-preview.dzcdn.net/api/1/1/0/4/d/0/04d8af6f7be42510d509531b428dd3fd.mp3?hdnea=exp=1779405015~acl=/api/1/1/0/4/d/0/04d8af6f7be42510d509531b428dd3fd.mp3*~data=user_id=0,application_id=42~hmac=6fcbda0e2a85609a5a3684b1923dabe253cfd063d657cde6a8789398026332a1",
    mediaUrl: "https://www.deezer.com/track/373082391",
  },
  "the night we met lord huron": {
    title: "The Night We Met",
    artist: "Lord Huron",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/55/41/4a/55414a18-861a-79d1-e575-5bf8cf205dbe/886445056839_Cover.jpg/600x600bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/4b/36/b7/4b36b739-1de7-e0ae-45da-9a66463127ac/mzaf_1821541347983595183.plus.aac.p.m4a",
    mediaUrl: "https://music.apple.com/us/album/the-night-we-met/1806531135?i=1806531961&uo=4",
  },
};

const styleTags = new Set([
  "pop",
  "rock",
  "funk",
  "dance",
  "r&b",
  "rb",
  "soul",
  "rap",
  "hip hop",
  "hip-hop",
  "trap",
  "latin",
  "reggaeton",
  "mpb",
  "jazz",
  "blues",
  "folk",
  "metal",
  "punk",
  "indie",
  "alternative",
  "electronic",
  "house",
  "disco",
  "synthpop",
  "new wave",
  "grunge",
  "catalog track",
]);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const term = queryInput.value.trim();
  const prompt = vibePromptInput.value.trim();
  if (prompt) {
    await runVibePrompt(prompt, term);
  } else if (term) {
    await runRecommendation(term);
  } else {
    setStatus("Describe a vibe, or add a reference song.");
  }
});

vibePromptButton.addEventListener("click", async () => {
  const prompt = vibePromptInput.value.trim();
  const term = queryInput.value.trim();
  if (!prompt) {
    setStatus("Write what the music should feel like first.");
    vibePromptInput.focus();
    return;
  }
  await runVibePrompt(prompt, term);
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

spotifyPlaylistButton.addEventListener("click", async () => {
  await createSpotifyPlaylistFromResults();
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
  const query = button.dataset.query;
  if (looksLikeVibePrompt(query)) {
    vibePromptInput.value = query;
    queryInput.value = "";
    await runVibePrompt(query);
  } else {
    queryInput.value = query;
    await runRecommendation(query);
  }
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
handleSpotifyCallback();

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
    seed.openMusic = seed.openMusic || quickOpenMusic(seed);
    renderSeed(seed);
    hydrateSeedMedia(seed);
    updateProgress(42, "Collecting catalog matches");
    setStatus("Finding catalog matches and ranking vibes...");

    const candidates = await collectCandidates(seed);
    updateProgress(66, "Ranking vibe matches");
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
      `${APP_VERSION}: selected ${recommendations.length} Deezer catalog matches. Previews keep loading after results appear.`,
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
    const enriched = candidates.slice(0, 60).map((track) => ({
      ...track,
      openMusic: track.openMusic || quickOpenMusic(track),
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

async function runVibePrompt(prompt, referenceTerm = "") {
  const profile = analyzeVibePrompt(prompt);
  setLoading(true, `Building a vibe from your description... ${APP_VERSION}`);
  updateProgress(8, "Reading your vibe");
  seedSection.hidden = true;
  seedCard.innerHTML = "";
  results.innerHTML = "";

  try {
    let referenceSeed = null;
    if (referenceTerm) {
      updateProgress(18, "Reading optional reference song");
      try {
        referenceSeed = await findSeedTrack(referenceTerm);
        if (referenceSeed) {
          referenceSeed.openMusic = referenceSeed.openMusic || quickOpenMusic(referenceSeed);
        }
      } catch (error) {
        console.warn(`Reference song skipped: ${error.message}`);
      }
    }

    updateProgress(32, "Expanding vibe combinations");
    const combinedProfile = referenceSeed ? blendPromptWithReference(profile, referenceSeed) : profile;
    renderVibePromptSeed(combinedProfile, referenceSeed);
    addHistory(prompt);

    updateProgress(50, "Building local recommendations");
    const candidates = await promptCandidates(combinedProfile, referenceSeed);
    updateProgress(72, "Ranking by described essence");
    const recommendations = rankPromptTracks(combinedProfile, candidates, referenceSeed, similarityValue());

    if (!recommendations.length) {
      setStatus("I understood the vibe, but not enough tracks passed the filters. Try a little more detail.");
      updateProgress(0, "Ready", { hidden: true });
      return;
    }

    updateProgress(84, "Rendering recommendations");
    renderResults(recommendations);
    setStatus(`${APP_VERSION}: built ${recommendations.length} recommendations for "${combinedProfile.label}".`);
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
  const deezerTracks = await deezerTracksPromise;
  if (deezerTracks.length >= Math.min(RECOMMENDATION_LIMIT, 24)) return deezerTracks;

  const fallbackTracks = await fallbackCandidates(seed);
  return dedupeTracks([...deezerTracks, ...fallbackTracks]);
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

async function searchDeezerTracksSafe(query, limit = 12) {
  try {
    return await searchDeezerTracks(query, limit);
  } catch (error) {
    console.warn(`Deezer search skipped for "${query}": ${error.message}`);
    return [];
  }
}

async function deezerCandidates(seed) {
  const queries = deezerSearchQueries(seed).slice(0, 6);
  const seedVibes = essenceTags(seed);
  const batches = await Promise.all(
    queries.map(async (queryData) => {
      const query = queryData.query || queryData;
      const queryVibes = essenceTags({ trackName: query, artistName: seed.artistName, collectionName: "", tags: queryData.tags || [] });
      const tracks = await searchDeezerTracks(query, 18);
      return tracks.map((track) => ({
        ...track,
        tags: [...new Set([...essenceTags(track), ...queryVibes, ...seedVibes, languageTag(seed)])].filter(Boolean).slice(0, 24),
        candidateQuery: query,
        candidateSpecificity: queryData.specificity || querySpecificity(query),
        seedLanguage: detectTrackLanguage(seed),
      }));
    }),
  );
  return dedupeTracks(batches.flat())
    .filter((track) => track.trackId !== seed.trackId)
    .filter((track) => !sameSongFamily(seed, track))
    .filter((track) => !isLowQualityVariant(track))
    .filter((track) => candidateRelevantToSeed(seed, track))
    .slice(0, FAST_CANDIDATE_LIMIT);
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

function quickOpenMusic(track) {
  return {
    mbid: isMbid(track.trackId) ? track.trackId : null,
    musicBrainz: null,
    acousticBrainz: null,
    tags: essenceTags(track)
      .filter(Boolean)
      .slice(0, 24),
    sources: ["Deezer"],
  };
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

async function enrichMediaSafe(track) {
  try {
    return await enrichMedia(track);
  } catch (error) {
    console.warn(`Preview skipped for "${track.trackName}": ${error.message}`);
    return {
      coverUrl: "",
      previewUrl: "",
      mediaUrl: track.media?.mediaUrl || track.trackViewUrl,
      title: track.media?.title || track.trackName,
      artist: track.media?.artist || track.artistName,
      source: "Preview unavailable",
      skipHydration: true,
    };
  }
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
  const seedOpen = seed.openMusic || quickOpenMusic(seed);
  const selectedMood = mood === "auto" ? null : mood;
  const enrichedTracks = tracks.slice(0, FAST_CANDIDATE_LIMIT).map((track) => ({
    ...track,
    openMusic: track.openMusic || quickOpenMusic(track),
  }));
  const seedLanguage = detectTrackLanguage(seed);
  const seedEssence = essenceTags(seed);

  const ranked = enrichedTracks
    .filter((track) => track.trackId !== seed.trackId)
    .filter((track) => !sameSongFamily(seed, track))
    .filter((track) => !isLowQualityVariant(track))
    .map((track, index) => {
      const comparison = compareOpenAudio(seedOpen, track.openMusic, index);
      const languageScore = languageMatchScore(seedLanguage, detectTrackLanguage(track));
      const candidateEssence = essenceTags(track);
      const sharedEssence = sharedEssenceCount(seedEssence, candidateEssence);
      const essenceScore = essenceOverlapScore(seedEssence, candidateEssence);
      const score = applyStrictness(clamp(comparison.score * 0.72 + essenceScore * 0.26 + languageScore, 0, 0.98), similarity, comparison.acousticLevel);
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
          essenceCriterion(seedEssence, candidateEssence),
          languageCriterion(seedLanguage, track),
          ...comparison.criteria,
        ].filter(Boolean),
        profile: {
          mood: moodValue,
          pace: comparison.pace || "open",
          texture: comparison.texture || "open",
        },
        analysis: criteriaAnalysis(comparison),
        essencePassed: sharedEssence >= requiredEssenceMatches(seedEssence) && score >= passThreshold(similarity, comparison.acousticLevel),
        acousticLevel: comparison.acousticLevel,
        sharedEssence,
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
  const listenBrainzTrust = clamp(0.52 - index * 0.006, 0.28, 0.52);
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
  const artistProfile = knownArtistProfile(seed);
  if (artistProfile?.queries?.length) {
    return artistProfile.queries.map((query) => {
      const parsed = parsePlainSongQuery(query);
      return parsed.artist
        ? `recording:"${escapeLucene(parsed.title)}" AND artist:"${escapeLucene(parsed.artist)}"`
        : `recording:"${escapeLucene(parsed.title)}"`;
    });
  }

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
  const artistProfile = knownArtistProfile(seed);
  const anchorQueries = (profile?.queries || [])
    .map(parseAnchorQuery)
    .filter(Boolean)
    .map((item) => ({ query: `${item.title} ${item.artist}`, tags: profile.tags || [], specificity: 1 }));
  const artistAnchorQueries = (artistProfile?.queries || [])
    .map((query) => ({
      query,
      tags: artistProfile.tags || [],
      specificity: 0.95,
    }));
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
    ...artistAnchorQueries,
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

function analyzeVibePrompt(prompt) {
  const text = normalize(prompt);
  const matched = vibePromptCatalog
    .map((item) => {
      const hits = item.needles.filter((needle) => text.includes(normalize(needle))).length;
      return { ...item, hits };
    })
    .filter((item) => item.hits > 0)
    .sort((a, b) => b.hits - a.hits);

  const tags = new Set();
  const queries = [];
  const labels = [];

  for (const item of matched.slice(0, 4)) {
    labels.push(item.label);
    item.tags.forEach((tag) => tags.add(tag));
    queries.push(...item.queries);
  }

  promptRuleTags(prompt).forEach((tag) => tags.add(tag));

  if (!queries.length) {
    queries.push(
      "Midnight City M83",
      "Sweater Weather The Neighbourhood",
      "The Less I Know The Better Tame Impala",
      "Space Song Beach House",
      "Ribs Lorde",
      "Pink + White Frank Ocean",
    );
  }

  const label = labels.length ? labels.join(" + ") : "custom described vibe";
  const descriptionTags = [...tags].filter(Boolean);

  return {
    label,
    prompt,
    tags: descriptionTags.length ? descriptionTags : ["reflective", "smooth", "spacious", "bittersweet", "warm"],
    queries: [...new Set(queries)].slice(0, 24),
  };
}

function promptRuleTags(prompt) {
  const text = normalize(prompt);
  const tags = new Set();
  const rules = [
    [["calm", "calma", "relax", "peace", "paz", "tranquilo"], ["calm", "soft", "smooth", "warm"]],
    [["sad", "triste", "chorar", "cry", "depress", "down"], ["melancholic", "lonely", "soft vocal", "slow"]],
    [["happy", "feliz", "alegre", "animada", "animado"], ["bright", "uplifting", "euphoric", "hook"]],
    [["dark", "sombrio", "pesado", "tenso", "tension"], ["dark", "tense", "bass-heavy", "dramatic"]],
    [["dream", "sonho", "flutuar", "space", "viajar"], ["dreamy", "spacious", "hazy", "wide"]],
    [["love", "amor", "romance", "apaixonar", "crush"], ["romantic", "intimate", "warm", "soft vocal"]],
    [["fast", "rapido", "rápido", "correr", "pressa"], ["driving", "punchy", "percussive", "pulse"]],
    [["slow", "lento", "devagar"], ["slow", "soft", "intimate", "spacious"]],
    [["bass", "grave", "808", "sub"], ["bass-heavy", "dark", "punchy"]],
    [["guitar", "guitarra", "violao", "violão"], ["textured", "organic", "warm"]],
    [["piano"], ["soft", "organic", "intimate", "cinematic"]],
    [["vocal", "voz", "sing", "cantando"], ["soft vocal", "intimate", "human"]],
  ];

  for (const [needles, values] of rules) {
    if (needles.some((needle) => text.includes(normalize(needle)))) {
      values.forEach((tag) => tags.add(tag));
    }
  }

  return [...tags];
}

function looksLikeVibePrompt(value) {
  const text = normalize(value);
  if (text.split(" ").length >= 7) return true;
  return vibePromptCatalog.some((item) => item.needles.some((needle) => text.includes(normalize(needle))));
}

function blendPromptWithReference(profile, referenceSeed) {
  const referenceTags = essenceTags(referenceSeed).filter((tag) => !isStyleTag(tag));
  const referenceQueries = deezerSearchQueries(referenceSeed)
    .slice(0, 4)
    .map((item) => item.query);

  return {
    ...profile,
    label: `${profile.label} + ${displayTitle(referenceSeed)}`,
    tags: [...new Set([...profile.tags, ...referenceTags])].slice(0, 32),
    queries: [...new Set([...profile.queries, ...referenceQueries])].slice(0, 28),
    referenceSeed,
  };
}

async function promptCandidates(profile, referenceSeed) {
  const queryData = profile.queries
    .map((query) => ({ query, tags: profile.tags, specificity: 0.9 }))
    .slice(0, 18);
  const batches = queryData.map((item, queryIndex) => [
    {
      ...promptFallbackTrack(item.query, profile, queryIndex),
      candidateQuery: item.query,
      promptQueryIndex: queryIndex,
      candidateSpecificity: item.specificity,
    },
  ]);

  return dedupeTracks(batches.flat())
    .filter((track) => !isLowQualityVariant(track))
    .filter((track) => !referenceSeed || (track.trackId !== referenceSeed.trackId && !sameSongFamily(referenceSeed, track)))
    .slice(0, 96);
}

function promptFallbackTrack(query, profile, index) {
  const parsed = parsePromptSongQuery(query);
  const curated = curatedPromptMedia[normalize(query)] || {};
  const searchUrl = curated.mediaUrl || `https://www.deezer.com/search/${encodeURIComponent(query)}`;
  return {
    trackId: `prompt-fallback:${normalize(query)}:${index}`,
    trackName: curated.title || parsed.title,
    artistName: curated.artist || parsed.artist || "Search result",
    collectionName: "Open in Deezer to play",
    primaryGenreName: "vibe prompt",
    releaseDate: "",
    trackViewUrl: searchUrl,
    artworkUrl100: curated.coverUrl || "",
    releaseMbid: "",
    offlineFallback: true,
    allowPreviewHydration: !curated.previewUrl && !curated.coverUrl,
    tags: profile.tags.slice(0, 16),
    media: {
      coverUrl: curated.coverUrl || "",
      previewUrl: curated.previewUrl || "",
      mediaUrl: searchUrl,
      title: curated.title || parsed.title,
      artist: curated.artist || parsed.artist || "Search result",
      source: curated.previewUrl ? "Curated Apple preview" : "Fallback search link",
      skipHydration: Boolean(curated.previewUrl || curated.coverUrl),
    },
    score: Math.max(100000 - index * 1000, 1),
  };
}

function parsePromptSongQuery(query) {
  const knownArtists = [
    ...new Set(
      vibePromptCatalog
        .flatMap((item) => item.queries)
        .flatMap((item) => {
          const normalized = normalize(item);
          return [
            "dua lipa",
            "justin timberlake",
            "mark ronson",
            "bruno mars",
            "rihanna",
            "m83",
            "mr kitty",
            "kavinsky",
            "tame impala",
            "the neighbourhood",
            "arctic monkeys",
            "adele",
            "lewis capaldi",
            "passenger",
            "conan gray",
            "olivia rodrigo",
            "kodaline",
            "ed sheeran",
            "taylor swift",
            "abba",
            "coldplay",
            "fleetwood mac",
            "boyz ii men",
            "florence the machine",
            "natasha bedingfield",
            "avicii",
            "imagine dragons",
            "the xx",
            "aphex twin",
            "ludovico einaudi",
            "petit biscuit",
            "marconi union",
            "yiruma",
            "bon iver",
            "st vincent",
            "cigarettes after sex",
            "lord huron",
            "hozier",
            "phoebe bridgers",
            "kanye west",
            "billie eilish",
            "lil nas x",
            "jack harlow",
            "the white stripes",
            "eminem",
            "macklemore",
            "ryan lewis",
            "kendrick lamar",
            "fort minor",
            "the weeknd",
            "daniel caesar",
            "kali uchis",
            "miguel",
            "frank ocean",
            "beach house",
            "sufjan stevens",
            "rex orange county",
            "surfaces",
            "jack johnson",
            "weezer",
            "declan mckenna",
            "mgmt",
            "lorde",
            "grouplove",
            "fun",
          ].filter((artist) => normalized.includes(artist));
        }),
    ),
  ].sort((a, b) => b.length - a.length);

  const normalizedQuery = normalize(query);
  const artist = knownArtists.find((name) => normalizedQuery.includes(name));
  if (!artist) return { title: query, artist: "" };
  const title = query.replace(new RegExp(`\\s+${escapeRegExp(artist)}\\s*$`, "i"), "").trim();
  return { title: title || query, artist };
}

function rankPromptTracks(profile, tracks, referenceSeed, similarity = 0.72) {
  const targetTags = [...new Set(profile.tags.map(normalizeEssenceTag).filter(Boolean).filter((tag) => !isStyleTag(tag)))];
  const referenceTags = referenceSeed ? essenceTags(referenceSeed) : [];
  const ranked = tracks
    .map((track, index) => {
      const trackTags = essenceTags(track);
      const promptScore = vibeTagSimilarity(targetTags, trackTags);
      const referenceScore = referenceTags.length ? vibeTagSimilarity(referenceTags, trackTags) : 0;
      const queryScore = textSimilarity(track.candidateQuery || "", `${track.trackName} ${track.artistName}`);
      const queryTrust = clamp(0.34 - Number(track.promptQueryIndex || 0) * 0.025, 0.08, 0.34);
      const score = clamp(promptScore * 0.54 + referenceScore * 0.16 + queryScore * 0.12 + queryTrust - index * 0.002, 0, 0.96);
      const adjusted = applyStrictness(score, Math.max(0.54, similarity - 0.08), "tags");
      const shared = targetTags.filter((tag) => trackTags.includes(tag));
      const criteria = [
        criterion("Described vibe", promptScore, promptScore >= 0.16, shared.slice(0, 5).join(", ") || "custom feeling match", 1.5),
        referenceSeed
          ? criterion("Reference song support", referenceScore, referenceScore >= 0.12, displayTitle(referenceSeed), 0.9)
          : null,
        criterion("Search context", queryScore, queryScore >= 0.08, track.candidateQuery || profile.label, 0.65),
      ].filter(Boolean);

      return {
        ...track,
        score: Math.round(adjusted * 100),
        matchPercent: Math.round(adjusted * 100),
        mood: cleanVibeLabel(profile.label),
        tags: trackTags,
        reasons: criteria.map((item) => item.label),
        criterionMatches: criteria,
        profile: { mood: profile.label, pace: "described", texture: "vibe prompt" },
        analysis: `Matched your description through ${shared.slice(0, 4).join(", ") || "combined emotional and sonic cues"}.`,
        essencePassed: promptScore >= 0.08 || queryScore >= 0.16 || (referenceSeed && referenceScore >= 0.12),
      };
    })
    .filter((track) => track.essencePassed)
    .sort((a, b) => b.score - a.score);

  return diversifyTracks(ranked, RECOMMENDATION_LIMIT);
}

function trackMicroVibes(track) {
  const text = normalize(`${track.trackName} ${track.artistName} ${track.collectionName} ${(track.tags || []).join(" ")}`);
  const tags = new Set();

  const knownProfile = knownTrackProfile(track);
  if (knownProfile) {
    knownProfile.tags.forEach((tag) => tags.add(tag));
    return [...tags];
  }

  const artistProfile = knownArtistProfile(track);
  if (artistProfile) {
    artistProfile.tags.forEach((tag) => tags.add(tag));
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

  return [...tags].slice(0, 16);
}

function essenceTags(track) {
  const raw = [
    ...(track.tags || []),
    ...(track.openMusic?.tags || []),
    ...trackMicroVibes(track),
    ...inferEssenceFromText(track),
    languageTag(track),
  ];

  return [...new Set(raw.map(normalizeEssenceTag).filter(Boolean).filter((tag) => !isStyleTag(tag)))]
    .slice(0, 28);
}

function inferEssenceFromText(track) {
  const text = normalize(`${track.trackName} ${track.artistName} ${track.collectionName}`);
  const tags = new Set();
  const rules = [
    [["ceu", "azul", "sun", "summer", "good", "happy", "sweet", "light"], ["bright", "open-air", "uplifting"]],
    [["again", "saudade", "remember", "memories", "yesterday", "home"], ["nostalgic", "bittersweet"]],
    [["cry", "tears", "sad", "alone", "lonely", "sem voce", "without"], ["melancholic", "lonely"]],
    [["night", "dark", "shadow", "bad", "black"], ["dark", "tense"]],
    [["love", "amor", "heart", "baby", "voce"], ["romantic", "intimate"]],
    [["fire", "danger", "fight", "wild", "power"], ["tense", "driving", "confident"]],
    [["dream", "moon", "space"], ["dreamy", "spacious"]],
    [["dance", "move", "groove"], ["groovy", "body-led"]],
    [["acoustic", "unplugged"], ["organic", "warm", "intimate"]],
  ];

  for (const [needles, values] of rules) {
    if (needles.some((needle) => text.includes(normalize(needle)))) {
      values.forEach((value) => tags.add(value));
    }
  }

  return [...tags];
}

function normalizeEssenceTag(value) {
  const tag = normalize(value).replace(/^language /, "language:");
  const aliases = new Map([
    ["dance rock", "driving"],
    ["guitar", "textured"],
    ["drums", "percussive"],
    ["bass", "bass-heavy"],
    ["sub bass", "bass-heavy"],
    ["808", "bass-heavy"],
    ["bright synth", "bright"],
    ["minor", "melancholic"],
    ["explosive chorus", "explosive"],
    ["build up", "build-up"],
    ["raspy vocal", "rough vocal"],
    ["whisper vocal", "soft vocal"],
    ["reverb", "spacious"],
    ["polished", "clean"],
    ["raw", "rough"],
    ["distortion", "rough"],
    ["syncopated", "groovy"],
  ]);
  return aliases.get(tag) || tag;
}

function isStyleTag(value) {
  const tag = normalize(value);
  return styleTags.has(tag) || /^(pop|rock|funk|soul|jazz|blues|folk|metal|punk|trap|rap|latin|reggaeton|mpb|indie|alternative|electronic|house|disco|grunge|synthpop|new wave)$/.test(tag);
}

function sharedEssenceCount(seedTags, candidateTags) {
  const candidate = new Set(candidateTags);
  return seedTags.filter((tag) => candidate.has(tag)).length;
}

function essenceOverlapScore(seedTags, candidateTags) {
  if (!seedTags.length || !candidateTags.length) return 0;
  return sharedEssenceCount(seedTags, candidateTags) / Math.min(seedTags.length, 8);
}

function requiredEssenceMatches(seedTags) {
  if (seedTags.length >= 8) return 3;
  if (seedTags.length >= 4) return 2;
  return 1;
}

function essenceCriterion(seedTags, candidateTags) {
  const shared = seedTags.filter((tag) => candidateTags.includes(tag));
  return criterion(
    "Shared essence vibes",
    clamp(shared.length / Math.max(requiredEssenceMatches(seedTags), 1), 0, 1),
    true,
    shared.slice(0, 5).join(", ") || "few shared vibes",
    1.35,
  );
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
  const tagScore = vibeTagSimilarity(essenceTags(seed), essenceTags(track));
  const textScore = textSimilarity(seedText, trackText);
  const queryScore = textSimilarity(track.candidateQuery || "", trackText);
  const sameArtist = seedArtist && trackArtist && seedArtist === trackArtist;
  const specificity = track.candidateSpecificity || 0;
  const languageScore = languageMatchScore(detectTrackLanguage(seed), detectTrackLanguage(track));

  return sameArtist || tagScore >= 0.22 || (languageScore >= 0.08 && tagScore >= 0.14) || textScore >= 0.1 || (specificity >= 0.75 && queryScore >= 0.12);
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
    [/wiz khalifa|charlie puth|taylor swift|billie eilish|michael jackson|weeknd|queen|nirvana|coldplay|adele|bruno mars|beyonce|rihanna|justin bieber|shawn mendes|lauv|kid laroi|khalid|niall horan|zayn|ellie goulding|alec benjamin/, "en"],
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

function knownArtistProfile(track) {
  const text = normalize(`${track.trackName} ${track.artistName} ${track.collectionName} ${(track.tags || []).join(" ")}`);
  return knownArtistVibes.find((item) => item.match.every((part) => text.includes(normalize(part)))) || null;
}

function parsePlainSongQuery(query) {
  const artistNames = knownArtistVibes.flatMap((profile) => profile.match);
  const extraArtists = [
    "the kid laroi",
    "selena gomez",
    "troye sivan",
    "benny blanco",
    "halsey",
    "khalid",
    "niall horan",
    "zayn",
    "sia",
    "ellie goulding",
    "alec benjamin",
  ];
  const artists = [...new Set([...artistNames, ...extraArtists])].sort((a, b) => b.length - a.length);
  const normalizedQuery = normalize(query);
  const artist = artists.find((name) => normalizedQuery.includes(normalize(name)));
  if (!artist) return { title: query.trim(), artist: "" };
  const title = query.replace(new RegExp(`\\s+${escapeRegExp(artist)}\\s*$`, "i"), "").trim();
  return { title: title || query.trim(), artist };
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

function renderVibePromptSeed(profile, referenceSeed) {
  seedSection.hidden = false;
  const tagList = profile.tags
    .slice(0, 14)
    .map((tag) => `<span class="category-tag">${escapeHtml(cleanVibeLabel(tag))}</span>`)
    .join("");
  const reference = referenceSeed
    ? `<p class="why">Reference support: ${escapeHtml(displayTitle(referenceSeed))} by ${escapeHtml(displayArtist(referenceSeed))}. The description still leads the search.</p>`
    : `<p class="why">No reference song used. The recommendations are built from the described situation and emotional/sonic cues.</p>`;

  seedCard.dataset.trackId = "vibe-prompt";
  seedCard.innerHTML = `
    <div class="prompt-art">VE</div>
    <div>
      <span class="mood-tag">described vibe</span>
      <h3>${escapeHtml(profile.label)}</h3>
      <p class="artist">${escapeHtml(profile.prompt)}</p>
      ${reference}
      <div class="prompt-tags">${tagList}</div>
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
    if (track.media?.previewUrl) {
      audio.src = track.media.previewUrl;
      audio.hidden = false;
      audio.onerror = () => {
        audio.hidden = true;
        if (small) small.textContent = "Preview expired. Open the track link to play it.";
      };
      small.textContent = "Preview and cover loaded.";
    } else {
      audio.hidden = true;
      small.textContent = track.offlineFallback
        ? "Open the track link to play it. Preview appears when available."
        : "Loading cover and preview...";
    }

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
    audio.onerror = () => {
      audio.hidden = true;
      if (small) small.textContent = "Preview expired. Open the track link to play it.";
    };
  }
}

async function hydrateMediaForTracks(tracks) {
  let completed = 0;
  updateProgress(82, "Loading covers and previews");
  for (const track of tracks.filter((item) => item.media?.previewUrl || item.media?.coverUrl)) {
    applyTrackMedia(track);
  }
  const liveMediaLimit = 8;
  const needsMedia = tracks
    .filter((track) => (!track.offlineFallback || track.allowPreviewHydration) && !track.media?.skipHydration && !track.media?.previewUrl && !track.media?.coverUrl)
    .slice(0, liveMediaLimit);
  completed = tracks.length - needsMedia.length;
  await mapWithConcurrency(needsMedia, 2, async (track) => {
    track.media = { ...(track.media || {}), ...(await enrichMediaSafe(track)) };
    completed += 1;
    updateProgress(82 + (completed / Math.max(tracks.length, 1)) * 18, "Loading covers and previews");
    applyTrackMedia(track);
  });
  updateProgress(100, "Done");
  window.setTimeout(() => updateProgress(0, "Ready", { hidden: true }), 900);
}

function applyTrackMedia(track) {
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
      ? "Preview and cover from Deezer. Similarity data from the VibingEcho vibe matcher."
      : track.offlineFallback
        ? "Open the track link to play it. Preview loads only when Deezer allows the request."
        : "Cover loaded when available. Preview unavailable for this track.";
  }
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
  if (track.trackViewUrl?.includes("music.apple.com") || track.media?.mediaUrl?.includes("music.apple.com")) {
    return "Open in Apple Music";
  }
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
  const query = canonicalSearchTitle(term);
  const title = canonicalTrackTitle(track);
  const artist = normalize(track.artistName);
  const text = `${title} ${artist}`;
  let score = 0;

  if (title === query) score += 3000;
  if (title && query && (title.startsWith(`${query} `) || query.startsWith(`${title} `))) score += 900;
  if (text.includes(query)) score += 420;
  if (query.includes(title)) score += 220;
  if (title && query.startsWith(title)) score += 120;

  const originalArtist = knownOriginals.get(title);
  if (originalArtist && artist.includes(originalArtist)) score += 240;
  if (query.includes(artist)) score += 70;
  if (isLowQualityVariant(track)) score -= 900;
  score += Number(track.score || 0) / 100000;

  return score;
}

function isLowQualityVariant(track) {
  const text = normalize(`${track.trackName} ${track.artistName} ${track.collectionName}`);
  const artist = normalize(track.artistName);
  return (
    /\b(live|karaoke|tribute|cover|covers|covering|remix|instrumental|made famous by|as made famous|originally performed|sped up|slowed|speed up|nightcore|re recorded|demos?|outtake|rehearsal|parody|piano cover|piano version|sleep piano|lullaby|music box|sing along|sound alike|soundalike)\b/.test(text) ||
    /\b(karaoke|tribute|covering|piano cover|soundalike|lullaby|music box)\b/.test(artist)
  );
}

function canonicalTrackTitle(track) {
  return canonicalSearchTitle(track.trackName || displayTitle(track));
}

function canonicalSearchTitle(value) {
  return normalize(
    String(value || "")
      .replace(/\([^)]*\)/g, " ")
      .replace(/\[[^\]]*\]/g, " ")
      .replace(/\{[^}]*\}/g, " ")
      .replace(/\s[-–—:]\s.*/g, " "),
  )
    .replace(/\bfeat(?:uring)?\b.*$/g, "")
    .replace(/\bft\b.*$/g, "")
    .replace(/\bwith\b.*$/g, "")
    .replace(/\bfrom\b.*$/g, "")
    .replace(/\b(live|karaoke|tribute|cover|covers|covering|remix|instrumental|acoustic|sped up|slowed|speed up|nightcore|radio edit|edit|version|remaster(?:ed)?|re recorded|demo|outtake|rehearsal|explicit|clean|parody|lullaby|music box|sing along)\b/g, "")
    .replace(/\b\d{4}\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sameSongFamily(seed, track) {
  const seedTitle = canonicalTrackTitle(seed);
  const trackTitle = canonicalTrackTitle(track);
  if (!seedTitle || !trackTitle) return false;
  if (seedTitle === trackTitle) return true;
  if (trackTitle.startsWith(`${seedTitle} `) || seedTitle.startsWith(`${trackTitle} `)) return true;
  return false;
}

function canonicalArtistName(track) {
  return normalize(track.artistName || displayArtist(track))
    .replace(/\bfeat(?:uring)?\b.*$/g, "")
    .replace(/\bft\b.*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function duplicateQualityScore(track) {
  let score = Number(track.score || 0);
  if (track.media?.previewUrl) score += 1200000;
  if (track.media?.coverUrl || track.artworkUrl100) score += 400000;
  if (track.trackViewUrl || track.media?.mediaUrl) score += 200000;
  if (isLowQualityVariant(track)) score -= 2500000;
  if (!usableArtistName(track.artistName)) score -= 800000;
  return score;
}

function trackDuplicateKey(track) {
  const title = canonicalTrackTitle(track);
  const artist = canonicalArtistName(track);
  return title && artist ? `${title}:${artist}` : track.trackId;
}

function isMbid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ""));
}

function diversifyTracks(tracks, limit) {
  const selected = [];
  const artistCounts = new Map();
  const titles = new Set();

  for (const track of tracks) {
    const artist = canonicalArtistName(track);
    const title = canonicalTrackTitle(track);
    const artistUses = artistCounts.get(artist) || 0;
    if (artistUses >= 1 || titles.has(title)) continue;
    selected.push(track);
    artistCounts.set(artist, artistUses + 1);
    titles.add(title);
    if (selected.length === limit) return selected;
  }

  for (const track of tracks) {
    const artist = canonicalArtistName(track);
    const title = canonicalTrackTitle(track);
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
  if (isMediaUrl(url) && data?.error) {
    return { data: [], error: String(data.error) };
  }
  if (data?.error) throw new Error(data.error);
  writeCache(url, data);
  return data;
}

function isMediaUrl(url) {
  return new URL(url, location.origin).pathname === MEDIA_API_URL;
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
  vibePromptButton.disabled = isLoading;
  surpriseButton.disabled = isLoading;
  spotifyPlaylistButton.disabled = isLoading;
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

async function createSpotifyPlaylistFromResults() {
  const tracks = spotifyPlaylistTracks();
  if (!tracks.length) {
    setStatus("Generate recommendations first, then add them to Spotify.");
    return;
  }

  let clientId = spotifyClientId();
  if (!clientId) {
    const wantsSetup = window.confirm(
      "Automatic playlist creation needs a Spotify Client ID from your Spotify account.\n\nPress OK to paste it now, or Cancel to open Spotify links for these recommendations.",
    );
    if (wantsSetup) clientId = spotifyClientId({ ask: true });
  }

  if (!clientId) {
    await openSpotifySearchFallback(tracks);
    return;
  }

  localStorage.setItem(SPOTIFY_PENDING_PLAYLIST_KEY, "1");
  localStorage.setItem(SPOTIFY_PENDING_TRACKS_KEY, JSON.stringify(tracks));
  const token = await getSpotifyToken();
  if (!token) {
    await startSpotifyLogin(clientId);
    return;
  }

  setLoading(true, "Creating Spotify playlist...");
  updateProgress(8, "Connecting to Spotify");

  try {
    const profile = await spotifyFetch("https://api.spotify.com/v1/me", token);
    updateProgress(22, "Matching tracks on Spotify");
    const uris = await findSpotifyTrackUris(tracks, token);

    if (!uris.length) {
      setStatus("Spotify could not match these recommendations.");
      return;
    }

    updateProgress(64, "Creating playlist");
    const playlist = await spotifyFetch(`https://api.spotify.com/v1/users/${profile.id}/playlists`, token, {
      method: "POST",
      body: JSON.stringify({
        name: `VibingEcho - ${new Date().toLocaleDateString()}`,
        description: "Playlist created from VibingEcho recommendations.",
        public: false,
      }),
    });

    updateProgress(82, "Adding songs");
    for (const chunk of chunks(uris, 100)) {
      await spotifyFetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, token, {
        method: "POST",
        body: JSON.stringify({ uris: chunk }),
      });
    }

    localStorage.removeItem(SPOTIFY_PENDING_PLAYLIST_KEY);
    localStorage.removeItem(SPOTIFY_PENDING_TRACKS_KEY);
    updateProgress(100, "Spotify playlist created");
    setStatus(`Spotify playlist created with ${uris.length} songs.`);
    if (playlist.external_urls?.spotify) {
      window.open(playlist.external_urls.spotify, "_blank", "noopener,noreferrer");
    }
    window.setTimeout(() => updateProgress(0, "Ready", { hidden: true }), 900);
  } catch (error) {
    console.error(error);
    setStatus(`Spotify failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
}

function spotifyPlaylistTracks() {
  const liveTracks = [...currentTracks.values()].slice(0, RECOMMENDATION_LIMIT);
  if (liveTracks.length) return liveTracks;
  const savedTracks = readJson(SPOTIFY_PENDING_TRACKS_KEY);
  return Array.isArray(savedTracks) ? savedTracks.slice(0, RECOMMENDATION_LIMIT) : [];
}

async function openSpotifySearchFallback(tracks) {
  const uniqueTracks = dedupeTracks(tracks).slice(0, RECOMMENDATION_LIMIT);
  await copySpotifyTrackList(uniqueTracks);

  const links = uniqueTracks
    .map((track, index) => {
      const title = displayTitle(track);
      const artist = displayArtist(track);
      return `<li><a href="${spotifySearchUrl(track)}" target="_blank" rel="noopener noreferrer">${index + 1}. ${escapeHtml(title)} - ${escapeHtml(artist)}</a></li>`;
    })
    .join("");

  const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>VibingEcho Spotify Links</title>
  <style>
    body { margin: 0; padding: 32px; background: #111216; color: #f7edf5; font: 18px/1.5 Arial, sans-serif; }
    h1 { margin: 0 0 10px; color: #ff38d4; }
    p { color: #c9c0c8; max-width: 760px; }
    ol { padding-left: 24px; max-width: 880px; }
    li { margin: 12px 0; }
    a { color: #ff38d4; font-weight: 800; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>VibingEcho Spotify Links</h1>
  <p>Automatic playlist creation needs a Spotify Client ID. For now, open these links to find each recommendation on Spotify. The full list was also copied to your clipboard when possible.</p>
  <ol>${links}</ol>
</body>
</html>`;

  const blob = new Blob([page], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  setStatus(`Opened Spotify search links for ${uniqueTracks.length} recommendations. Playlist creation needs a Spotify Client ID.`);
}

async function copySpotifyTrackList(tracks) {
  if (!navigator.clipboard?.writeText) return;
  const text = tracks
    .map((track, index) => `${index + 1}. ${displayTitle(track)} - ${displayArtist(track)}\n${spotifySearchUrl(track)}`)
    .join("\n\n");
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard permission is optional; the generated link page still works.
  }
}

function spotifySearchUrl(track) {
  return `https://open.spotify.com/search/${encodeURIComponent(`${displayTitle(track)} ${displayArtist(track)}`)}`;
}

async function findSpotifyTrackUris(tracks, token) {
  const found = [];
  let completed = 0;

  await mapWithConcurrency(tracks, 4, async (track) => {
    const query = `track:${displayTitle(track)} artist:${displayArtist(track)}`;
    const params = new URLSearchParams({ q: query, type: "track", limit: "5" });
    const data = await spotifyFetch(`https://api.spotify.com/v1/search?${params.toString()}`, token);
    const best = (data.tracks?.items || [])
      .map((item, index) => ({
        item,
        score:
          textSimilarity(displayTitle(track), item.name) * 0.65 +
          textSimilarity(displayArtist(track), item.artists?.map((artist) => artist.name).join(" ")) * 0.35 -
          index * 0.02,
      }))
      .sort((a, b) => b.score - a.score)[0];

    if (best?.item?.uri && best.score >= 0.34) found.push(best.item.uri);
    completed += 1;
    updateProgress(22 + (completed / Math.max(tracks.length, 1)) * 42, "Matching tracks on Spotify");
  });

  return [...new Set(found)];
}

async function getSpotifyToken() {
  const stored = readJson(SPOTIFY_TOKEN_KEY);
  if (stored?.access_token && stored.expires_at > Date.now() + 60000) {
    return stored.access_token;
  }
  return null;
}

async function startSpotifyLogin(clientId = spotifyClientId()) {
  if (!clientId) {
    setStatus("Spotify setup needed: paste a Spotify Client ID to connect once.");
    return;
  }

  const verifier = randomString(64);
  const challenge = await pkceChallenge(verifier);
  const state = randomString(20);
  localStorage.setItem(SPOTIFY_VERIFIER_KEY, JSON.stringify({ verifier, state }));

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: "playlist-modify-private playlist-modify-public",
    code_challenge_method: "S256",
    code_challenge: challenge,
    redirect_uri: spotifyRedirectUri(),
    state,
  });

  location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

async function handleSpotifyCallback() {
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  const state = params.get("state");
  if (!code) return;

  const saved = readJson(SPOTIFY_VERIFIER_KEY);
  history.replaceState({}, document.title, location.pathname);

  if (!saved?.verifier || saved.state !== state) {
    setStatus("Spotify login could not be verified. Try again.");
    return;
  }

  const clientId = spotifyClientId();
  if (!clientId) {
    setStatus("Spotify login returned, but the Client ID was not saved. Click Add all to Spotify again.");
    return;
  }

  try {
    const body = new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: spotifyRedirectUri(),
      code_verifier: saved.verifier,
    });
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const token = await response.json();
    if (!response.ok) throw new Error(token.error_description || token.error || "Spotify token failed");

    localStorage.setItem(
      SPOTIFY_TOKEN_KEY,
      JSON.stringify({ ...token, expires_at: Date.now() + token.expires_in * 1000 }),
    );
    localStorage.removeItem(SPOTIFY_VERIFIER_KEY);

    if (localStorage.getItem(SPOTIFY_PENDING_PLAYLIST_KEY) === "1") {
      setStatus("Spotify connected. Creating playlist now...");
      await createSpotifyPlaylistFromResults();
    } else {
      setStatus("Spotify connected.");
    }
  } catch (error) {
    console.error(error);
    setStatus(`Spotify login failed: ${error.message}`);
  }
}

async function spotifyFetch(url, token, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `Spotify returned ${response.status}`);
  return data;
}

function spotifyConfigured() {
  return Boolean(spotifyClientId());
}

function spotifyClientId(options = {}) {
  const fixed = String(SPOTIFY_CLIENT_ID || "").trim();
  if (fixed && fixed !== "PASTE_YOUR_SPOTIFY_CLIENT_ID_HERE") return fixed;

  const saved = String(localStorage.getItem(SPOTIFY_CLIENT_ID_KEY) || "").trim();
  if (saved) return saved;

  if (!options.ask) return "";

  const entered = window.prompt(
    `Paste your Spotify Client ID once.\n\nRedirect URI to add in Spotify Dashboard:\n${spotifyRedirectUri()}`,
  );
  const trimmed = String(entered || "").trim();
  if (trimmed) {
    localStorage.setItem(SPOTIFY_CLIENT_ID_KEY, trimmed);
  }
  return trimmed;
}

function spotifyRedirectUri() {
  return `${location.origin}${location.pathname}`;
}

async function pkceChallenge(verifier) {
  const bytes = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return base64Url(new Uint8Array(digest));
}

function base64Url(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function randomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return [...values].map((value) => chars[value % chars.length]).join("");
}

function chunks(items, size) {
  const result = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
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
    const key = trackDuplicateKey(track);
    const current = seen.get(key);
    if (!current || duplicateQualityScore(track) > duplicateQualityScore(current)) {
      seen.set(key, track);
    }
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

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
