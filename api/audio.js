module.exports = async function handler(request, response) {
  const audioUrl = request.query.url;

  if (!audioUrl || !String(audioUrl).startsWith("https://audio-ssl.itunes.apple.com/")) {
    response.status(400).json({ error: "Invalid audio URL" });
    return;
  }

  try {
    const audioResponse = await fetch(audioUrl, {
      headers: {
        "User-Agent": "VibingEcho/1.0",
      },
    });

    if (!audioResponse.ok) {
      response.status(audioResponse.status).json({ error: "Could not fetch preview" });
      return;
    }

    const buffer = await audioResponse.arrayBuffer();
    response.setHeader("Content-Type", audioResponse.headers.get("content-type") || "audio/mp4");
    response.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    response.status(200).send(Buffer.from(buffer));
  } catch (error) {
    response.status(500).json({ error: error.message || "Audio proxy failed" });
  }
};
