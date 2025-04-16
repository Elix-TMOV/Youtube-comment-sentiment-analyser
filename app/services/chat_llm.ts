import axios from "axios"
async function chat_llm(comments: string[], query: string) {
    try {
        const response = await axios.post("api/chat", {
            texts: comments,
        })
        return response.data
    }
    catch (error) {
        console.error("Error fetching YouTube comments:", error)
        return "llm could not be reached"
    }
    
}

export default chat_llm