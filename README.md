# VibingEcho

Static website for recommending similar songs using the public iTunes catalog.
It does not need a backend, manual database, Java, Node, or API key.

## How it works

- The user types a song or artist.
- The site calls `https://itunes.apple.com/search` without an API key.
- The reference track is chosen from the best results.
- The app searches candidates by genre and vibe hints.
- Recommendations are ranked by detected vibe, nearby sound, and pacing.
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
That is why this project uses public iTunes metadata, genres, duration, and a
vibe-matching heuristic.
For even more accurate music recommendations, the next step would be combining this
app with an API that has audio attributes or a backend that stores user feedback.
