module.exports = async function handler(request, response) {
  const query = request.query.q;
  const limit = Math.min(Number(request.query.limit) || 10, 50);

  if (!query) {
    response.status(400).json({ error: "q is required" });
    return;
  }

  try {
    const url = `https://musicbrainz.org/ws/2/recording?fmt=json&limit=${limit}&query=${encodeURIComponent(
      query,
    )}`;
    const searchResponse = await fetch(url, {
      headers: {
        "User-Agent": "VibingEcho/1.0 (https://vibingecho.vercel.app)",
        Accept: "application/json",
      },
    });

    if (!searchResponse.ok) {
      response.status(searchResponse.status).json({
        error: `MusicBrainz search responded with ${searchResponse.status}`,
      });
      return;
    }

    const data = await searchResponse.json();
    response.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json({ error: error.message || "MusicBrainz search failed" });
  }
};
