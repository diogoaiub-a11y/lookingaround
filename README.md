# VibingEcho

Static website for recommending similar songs with open music data.
It does not use iTunes anymore.

## Data sources

- MusicBrainz finds the reference song and public recording metadata.
- ListenBrainz finds recordings that listeners often connect to the reference.
- AcousticBrainz refines matches when a recording has audio descriptors.
- Lyrics are not used.
- Artist, album, era, and popularity are not used as similarity criteria.

## Matching criteria

VibingEcho compares open audio descriptors when available:

- Tonality / harmony
- BPM and rhythm
- Drum / percussion pattern
- Timbre
- Texture / production
- Structure
- Melody
- Emotional energy
- Dynamics
- Vocal style
- Dominant frequency range
- Repetitive motifs

If AcousticBrainz has no audio profile for a recording, the visible score is capped
and the site falls back to ListenBrainz neighbors plus MusicBrainz tags.

## Deploy to Vercel

1. Push these files to GitHub.
2. Import the repository in Vercel.
3. Framework preset: `Other`.
4. Build command: leave empty.
5. Output directory: leave empty or use `.`.

## Run locally

```bash
cd /Users/diogoaiub/Documents/Codex/2026-05-16/estou-fazendo-um-site-ja-tenho
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```
