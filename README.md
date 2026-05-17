# VibingEcho

Static website for recommending similar songs using the public iTunes catalog.
It does not need a backend, manual database, Java, Node, or API key.

## How it works

- The user types a song or artist.
- The site calls `https://itunes.apple.com/search` without an API key.
- The site maps songs to open-data IDs with ListenBrainz and MusicBrainz.
- When available, AcousticBrainz features refine BPM/key/mood criteria.
- The reference track is chosen from repeated iTunes result relevance, exact-title
  matching, preview availability, and penalties for covers/karaoke/tribute/remix
  versions.
- The app uses iTunes search only to collect candidate songs.
- Recommendations are ranked by audio-preview similarity when iTunes provides a
  preview, using tonality/harmony color, BPM/rhythm, percussion pattern, timbre,
  texture/production, structure, melodic contour, emotional energy, dynamics,
  vocal style, dominant frequency range, and repetitive motifs.
- The final list is diversified so the results do not all repeat the same artist
  or the exact same vibe profile.
- Users can adjust how close the match should be, explore by category, ask for a
  surprise recommendation, save favorites, revisit recent searches, and use
  "More like this" from any recommendation.
- Song-match scoring does not use tags, popularity, artist, album, or generic
  genre overlap.
- Song-based recommendations stay close to the reference by comparing audio
  preview features such as beat pulse, bass weight, treble/high-end sharpness,
  punch, production texture, dynamics, and multiple shared vibes. Category
  exploration can still use deep-cut and emerging-artist terms for broader
  discovery.
- Song recommendations now use only the requested audio criteria. Genre,
  popularity, discovery score, artist name, era, tags, and generic category
  overlap do not add to the song-match score.
- The visible percentage is an audio-criteria score. A recommendation must pass
  gates for tonality/harmony, BPM/rhythm, percussion pattern, timbre,
  production texture, structure, melody, emotional energy, dynamics, vocal style,
  dominant frequency range, and repetitive motifs.
- The browser keeps a local cache for 24 hours to avoid repeated calls.

## Deploy to Vercel

1. Push these files to a GitHub repository.
2. Import the repository in Vercel.
3. Framework preset: `Other`.
4. Build command: leave empty.
5. Output directory: leave empty or use `.`.

## Run from the terminal

```bash
cd /Users/diogoaiub/Documents/Codex/2026-05-16/estou-fazendo-um-site-ja-tenho
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Important note

The iTunes API does not provide real audio analysis such as BPM, key, or valence.
That is why this project analyzes the public iTunes preview clips, then enriches
tracks with ListenBrainz, MusicBrainz, and AcousticBrainz when open data is
available. Lyrics are not used as a matching criterion.

iTunes Search does not provide play counts, so "most listened" is approximated
with search relevance, repeated appearances across searches, exact-title matching,
and known global artist tie-breakers.
For even more accurate music recommendations, the next step would be combining this
app with an API that has audio attributes or a backend that stores user feedback.
