"use client";
import get_youtube_comm from "./services/get_youtube_comm";
import get_sentiment from "./services/get_sentiment";
import { useState, useEffect, useRef, RefObject } from "react";
import { Chart, registerables } from "chart.js";
import chat_llm from "./services/chat_llm";
import ReactMarkdown from "react-markdown"; // Import react-markdown
import Image from "next/image";

// Register ChartJS components
Chart.register(...registerables);

const getVideoId = (url: string) => {
  // assumes that a youtube id is always 11 characters long
  const idStart = url.indexOf("v=");
  if (idStart === -1) return null;
  const id = url.slice(idStart + 2, idStart + 13);
  return id;
};

export default function Home() {
  const [videoURl, setVideoUrl] = useState<string>("null");
  const [comments, setComments] = useState<string[] | null>(null);
  const chartRef: RefObject<HTMLCanvasElement | null> = useRef(null);
  const [sentiments, setSentiments] = useState<string[]>([]);
  const [loadingSentiments, setLoadingSentiments] = useState<boolean>(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [videoId, setVideoId] = useState<string | null>(null);

  const get_comments = async () => {
    const videoId = getVideoId(videoURl);
    setVideoId(videoId);
    console.log(videoId)
    try {
      setLoadingSentiments(true);
      const comments = videoId ? await get_youtube_comm(videoId) : [];
      setComments(comments);
      // now just get the list of comments and send them to get sentiments
      const sentiment = comments && (await get_sentiment(comments));
      setSentiments(JSON.parse(sentiment));
      setLoadingSentiments(false);
      // console.log("Sentiment:", sentiment);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    if (comments) {
      (async () => {
        const response = await chat_llm(comments, "What is the sentiment of the comments?");
        setMessages((prevMessages) => []) // clear out the old messages
        setMessages((prevMessages) => [...prevMessages, response]);
      })();
    }
  }, [comments]);

  useEffect(() => {
    const canvas = chartRef.current; // get the canvas
    if (!canvas) return; // if it doesn't exist, return
    const chartContext = canvas.getContext("2d"); // get the context of the canvas
    if (!chartContext) return; // if the context doesn't exist, return

    const sentimentsObject: { [key: string]: number } = {
      "Very Negative": 0,
      "Negative": 0,
      "Neutral": 0,
      "Positive": 0,
      "Very Positive": 0,
    };

    console.log("Sentiments:", sentimentsObject);

    for (let sentiment of sentiments) {
      if (sentiment in sentimentsObject) {
        sentimentsObject[sentiment] += 1;
      }
    }

    const newChart = new Chart(chartContext, {
      type: "bar",
      data: {
        labels: Object.keys(sentimentsObject),
        datasets: [
          {
            label: "# of Comments",
            data: Object.values(sentimentsObject),
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",
              "rgba(255, 159, 64, 0.7)",
              "rgba(255, 205, 86, 0.7)",
              "rgba(75, 192, 192, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(153, 102, 255, 0.7)",
              "rgba(201, 203, 207, 0.7)",
            ],
            borderWidth: 1,
          },
        ],
      },

      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      newChart.destroy();
    };
  }, [sentiments]);

  return (
    <div className="w-full flex flex-col p-4 justify-center items-center"
      style={{
        backgroundImage: `url("/backgroundImage.png")`,
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      
      <div className="flex gap-4">
        <input
          type="text"
          className="oultine px-4 outline-white outline-2 rounded-md w-[400px] text-white"
          placeholder="Youtube-Video-Link from the address bar"
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <button
          onClick={() => get_comments()}
          disabled={loadingSentiments}
          className="bg-blue-400 p-4 rounded-md text-white font-bold hover:bg-blue-500 transition duration-300 ease-in-out"
        >
          {loadingSentiments ? "Loading..." : "Get Sentiments"}
        </button>
      </div>
      <p className="text-sm text-white p-2">Hang in Tight generating the graph may take a bit</p>
      {videoId && <iframe width="560" height="315" src={`https://www.youtube.com/embed/${videoId}`} className="p-4"></iframe>}
      
      <h2 className="text-2xl font-semibold text-white my-6">
        Sentiment Analysis Bar graphs
      </h2>
      
      <section className="w-[600px] h-[600px] rounded-md p-4 mb-10 bg-amber-50 opacity-95">
        <canvas id="chart-canvas" ref={chartRef} width={"100%"} height={"100%"}></canvas>
      </section>
      
      <h2 className="text-2xl font-semibold text-white my-6">
        AI Summary of Comments
      </h2>
      
      <section className="w-[600px] h-[600px] rounded-md p-4 mb-10 bg-blue-50 opacity-95">
        <div className="flex flex-col h-full">
          <div className="flex flex-col flex-1 p-4 gap-4 overflow-y-scroll">
            {/* Chat messages will be rendered as Markdown */}
            {messages.map((message, index) => (
              <div key={index} className="bg-white p-4 rounded-md shadow-md">
                <ReactMarkdown>{message}</ReactMarkdown>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
