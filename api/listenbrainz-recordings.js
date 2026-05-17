module.exports = async function handler(request, response) {
  const mbids = String(request.query.mbids || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 50);

  if (!mbids.length) {
    response.status(400).json({ error: "mbids are required" });
    return;
  }

  try {
    const lbResponse = await fetch("https://api.listenbrainz.org/1/metadata/recording/", {
      method: "POST",
      headers: {
        "User-Agent": "VibingEcho/1.0",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        recording_mbids: mbids,
        inc: "artist tag release",
      }),
    });

    if (!lbResponse.ok) {
      response.status(lbResponse.status).json({
        error: `ListenBrainz metadata responded with ${lbResponse.status}`,
      });
      return;
    }

    const data = await lbResponse.json();
    response.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json({ error: error.message || "ListenBrainz metadata failed" });
  }
};
