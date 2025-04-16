'use server'
import axios from "axios";

console.log("Youtube API Key:", process.env.YOUTUBE_DATA_API_KEY)
const youtubeApiKey = process.env.YOUTUBE_DATA_API_KEY

async function get_youtube_comm(videoId: string): Promise<string[] | null> {
    const apiUrl = `https://www.googleapis.com/youtube/v3/commentThreads`
    try {
        const response = await axios.get(apiUrl, {
            params: {
                part: "snippet",
                videoId: videoId,
                maxResults: 100,
                key: youtubeApiKey,
            },
        })
        const comments: string[] = [];
        response.data.items.forEach((item: any) => {
            const comment = item.snippet.topLevelComment.snippet.textOriginal
            comments.push(comment)
        })
        return comments
    }
    catch (error) {
        console.error("Error fetching YouTube comments:", error)
        return null
    }
}

export default get_youtube_comm