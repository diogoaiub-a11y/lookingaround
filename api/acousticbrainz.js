module.exports = async function handler(request, response) {
  const mbid = request.query.mbid;

  if (!mbid) {
    response.status(400).json({ error: "mbid is required" });
    return;
  }

  try {
    const [lowLevelResult, highLevelResult] = await Promise.allSettled([
      fetch(`https://acousticbrainz.org/api/v1/${encodeURIComponent(mbid)}/low-level`, {
        headers: { "User-Agent": "VibingEcho/1.0" },
      }),
      fetch(`https://acousticbrainz.org/api/v1/${encodeURIComponent(mbid)}/high-level`, {
        headers: { "User-Agent": "VibingEcho/1.0" },
      }),
    ]);

    const lowLevel =
      lowLevelResult.status === "fulfilled" && lowLevelResult.value.ok
        ? await lowLevelResult.value.json()
        : null;
    const highLevel =
      highLevelResult.status === "fulfilled" && highLevelResult.value.ok
        ? await highLevelResult.value.json()
        : null;

    response.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    response.status(200).json({ lowLevel, highLevel });
  } catch (error) {
    response.status(500).json({ error: error.message || "AcousticBrainz lookup failed" });
  }
};
