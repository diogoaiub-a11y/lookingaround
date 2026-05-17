module.exports = async function handler(request, response) {
  const mbid = request.query.mbid;
  const algorithm =
    request.query.algorithm ||
    "session_based_days_7500_session_300_contribution_5_threshold_15_limit_50_skip_30";

  if (!mbid) {
    response.status(400).json({ error: "mbid is required" });
    return;
  }

  try {
    const params = new URLSearchParams({
      recording_mbids: mbid,
      algorithm,
    });
    const url = `https://labs.api.listenbrainz.org/similar-recordings/json?${params.toString()}`;
    const similarResponse = await fetch(url, {
      headers: {
        "User-Agent": "VibingEcho/1.0",
        Accept: "application/json",
      },
    });

    if (!similarResponse.ok) {
      response.status(similarResponse.status).json({
        error: `ListenBrainz similar recordings responded with ${similarResponse.status}`,
      });
      return;
    }

    const data = await similarResponse.json();
    response.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json({ error: error.message || "ListenBrainz similar lookup failed" });
  }
};
