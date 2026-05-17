module.exports = async function handler(request, response) {
  const track = request.query.track;
  const artist = request.query.artist;
  const textQuery = request.query.q;
  const limit = Math.min(Number(request.query.limit) || 24, 50);

  if (!track && !textQuery) {
    response.status(400).json({ error: "track or q is required" });
    return;
  }

  try {
    const query = textQuery || (artist ? `track:"${track}" artist:"${artist}"` : track);
    const url = `https://api.deezer.com/search/track?q=${encodeURIComponent(query)}&limit=${limit}`;
    const deezerResponse = await fetch(url, {
      headers: {
        "User-Agent": "VibingEcho/1.0",
        Accept: "application/json",
      },
    });

    if (!deezerResponse.ok) {
      response.status(deezerResponse.status).json({
        error: `Deezer responded with ${deezerResponse.status}`,
      });
      return;
    }

    const data = await deezerResponse.json();
    const normalizedTrack = normalize(track);
    const normalizedArtist = normalize(artist);
    const best = (data.data || [])
      .map((item, index) => ({
        item,
        score:
          similarity(normalizedTrack, normalize(item.title_short || item.title)) * 70 +
          (artist ? similarity(normalizedArtist, normalize(item.artist?.name)) * 55 : 20) -
          index,
      }))
      .sort((a, b) => b.score - a.score)[0]?.item;

    response.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    response.status(200).json({
      data: data.data || [],
      previewUrl: best?.preview || "",
      coverUrl: best?.album?.cover_xl || best?.album?.cover_big || best?.album?.cover_medium || "",
      deezerUrl: best?.link || "",
      title: best?.title_short || best?.title || "",
      artist: best?.artist?.name || "",
    });
  } catch (error) {
    response.status(500).json({ error: error.message || "Deezer lookup failed" });
  }
};

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function similarity(left, right) {
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) return 0.82;

  const a = new Set(left.split(" ").filter(Boolean));
  const b = new Set(right.split(" ").filter(Boolean));
  let overlap = 0;
  for (const word of a) if (b.has(word)) overlap += 1;
  return overlap / Math.max(a.size, b.size, 1);
}
