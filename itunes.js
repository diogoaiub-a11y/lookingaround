module.exports = async function handler(request, response) {
  const params = new URLSearchParams(request.query);
  params.delete("callback");

  const url = `https://itunes.apple.com/search?${params.toString()}`;

  try {
    const itunesResponse = await fetch(url, {
      headers: {
        "User-Agent": "VibingEcho/1.0",
        Accept: "application/json",
      },
    });

    if (!itunesResponse.ok) {
      response.status(itunesResponse.status).json({
        resultCount: 0,
        results: [],
        error: `iTunes responded with ${itunesResponse.status}`,
      });
      return;
    }

    const data = await itunesResponse.json();

    response.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    response.status(200).json(data);
  } catch (error) {
    response.status(500).json({
      resultCount: 0,
      results: [],
      error: error.message || "Could not reach iTunes",
    });
  }
};
