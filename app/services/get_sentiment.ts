
async function get_sentiment(texts: string[]) {
  try {
   
    const response = await fetch("/api/sentiment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ texts }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch sentiment");
    }

    const output = await response.json();
    return output;
  } catch (error) {
    console.error("Error fetching sentiment:", error);
    throw error;
  }
}

export default get_sentiment;

