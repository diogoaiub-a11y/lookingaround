module.exports = async function handler(request, response) {
  const mbid = request.query.mbid;
  const recordingName = request.query.recording_name;
  const artistName = request.query.artist_name;

  let url;
  if (mbid) {
    url = `https://musicbrainz.org/ws/2/recording/${encodeURIComponent(
      mbid,
    )}?fmt=json&inc=artists+releases+tags+genres`;
  } else if (recordingName && artistName) {
    const query = `recording:"${recordingName}" AND artist:"${artistName}"`;
    url = `https://musicbrainz.org/ws/2/recording?fmt=json&limit=5&query=${encodeURIComponent(
      query,
    )}`;
  } else {
    response.status(400).json({ error: "mbid or recording_name + artist_name are required" });
    return;
  }

  try {
    const musicBrainzResponse = await fetch(url, {
      headers: {
        "User-Agent": "VibingEcho/1.0 (https://vibingecho.vercel.app)",
        Accept: "application/json",
      },
    });

    if (!musicBrainzResponse.ok) {
      response.status(musicBrainzResponse.status).json({
        error: `MusicBrainz responded with ${musicBrainzResponse.status}`,
      });
      return;
    }

    const data = await musicBrainzResponse.json();
    response.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json({ error: error.message || "MusicBrainz lookup failed" });
  }
};
