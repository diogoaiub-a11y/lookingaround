module.exports = async function handler(request, response) {
  const recordingName = request.query.recording_name;
  const artistName = request.query.artist_name;
  const releaseName = request.query.release_name;

  if (!recordingName || !artistName) {
    response.status(400).json({ error: "recording_name and artist_name are required" });
    return;
  }

  const params = new URLSearchParams({
    recording_name: recordingName,
    artist_name: artistName,
  });

  if (releaseName) {
    params.set("release_name", releaseName);
  }

  try {
    const mapperUrl = `https://mapper.listenbrainz.org/mapping/lookup?artist_credit_name=${encodeURIComponent(
      artistName,
    )}&recording_name=${encodeURIComponent(recordingName)}${
      releaseName ? `&release_name=${encodeURIComponent(releaseName)}` : ""
    }`;
    const metadataUrl = `https://api.listenbrainz.org/1/metadata/lookup/?${params.toString()}`;

    const [mapperResult, metadataResult] = await Promise.allSettled([
      fetch(mapperUrl, { headers: { "User-Agent": "VibingEcho/1.0" } }),
      fetch(metadataUrl, { headers: { "User-Agent": "VibingEcho/1.0" } }),
    ]);

    const mapper =
      mapperResult.status === "fulfilled" && mapperResult.value.ok
        ? await mapperResult.value.json()
        : null;
    const metadata =
      metadataResult.status === "fulfilled" && metadataResult.value.ok
        ? await metadataResult.value.json()
        : null;

    response.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    response.status(200).json({ mapper, metadata });
  } catch (error) {
    response.status(500).json({ error: error.message || "ListenBrainz lookup failed" });
  }
};
