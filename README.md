# VibingEcho

Static website for recommending similar songs using the public iTunes catalog.
It does not need a backend, manual database, Java, Node, or API key.

## How it works

- The user types a song or artist.
- The site calls `https://itunes.apple.com/search` without an API key.
- The reference track is chosen from repeated iTunes result relevance, exact-title
  matching, preview availability, and penalties for covers/karaoke/tribute/remix
  versions.
- The app searches candidates by genre and vibe hints.
- Recommendations are ranked by audio-preview similarity when iTunes provides a
  preview, using energy, brightness, pulse, dynamics, warmth, nearby sound,
  pacing, and texture.
- The final list is diversified so the results do not all repeat the same artist
  or the exact same vibe profile.
- Users can adjust how close the match should be, explore by category, ask for a
  surprise recommendation, save favorites, revisit recent searches, and use
  "More like this" from any recommendation.
- Songs receive multiple tags at once, such as genre family, mood, texture,
  pace, era, and audio-feel tags. Recommendations connect songs with more
  overlapping tags.
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

The iTunes API does not provide real audio analysis such as BPM, energy, or valence.
That is why this project analyzes the public iTunes preview clips when possible
and falls back to iTunes metadata, genres, duration, and a vibe-matching
heuristic. Lyrics are not used as a matching criterion.

iTunes Search does not provide play counts, so "most listened" is approximated
with search relevance, repeated appearances across searches, exact-title matching,
and known global artist tie-breakers.
For even more accurate music recommendations, the next step would be combining this
app with an API that has audio attributes or a backend that stores user feedback.
