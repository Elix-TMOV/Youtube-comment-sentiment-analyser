import { NextResponse, NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: NextRequest) {
    const { texts } = await request.json();
    const query = `You are a sentiment analyst assistant that will help the user understand the sentiment of the comments and their users. 
                You will be given a list of comments and you will provide a summary of the general sentiment and the general response of the viewers. Are the comments positive? Are there any negative comments? 
                What are they about? Are they constructive or just hateful? Can the YouTuber learn something from them? Are they trolling or are they serious? 
                Or are they just joking and having fun in the comments?
                Here are the comments: ${texts}`;


    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: query,
    });
    return NextResponse.json(response.text);
}
