import { NextResponse, NextRequest } from 'next/server';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: NextRequest) {
    const { texts } = await request.json();
    const query = `You are a sentiment analyst, You will be given a list of comments and you have to analyze the sentiment of each comment. and the sentiment can be from [Very Negative, Negative, Neutral, Positive, Very Positive].
                You will generate a sentiment for each comment and return the list of sentiments in this manner
                ["Very Poitive", "Negative", "Negative", "Neutral"]. don't include the actual comment in it and don't include anything else just the list.
                Here are the comments: ${texts}`;
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: query,
    });
    // console.log("Response:", response.text);
    return NextResponse.json(response.text);
}
