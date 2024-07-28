"use client"
import React, { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [transcript, setTranscript] = useState("");

  const extractVideoId = (url) => {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    return params.get('v');
  };

  const handleInputChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = extractVideoId(url);
    console.log("ID", id)
    if (id) {
      setVideoId(id);
      await fetchTranscript(id); // Fetch transcript when a valid video ID is found
    } else {
      alert("Invalid YouTube URL");
    }
  };

  const fetchTranscript = async (id) => {
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY; // Replace with your YouTube Data API key
    try {
      // Fetch captions list
      const response = await fetch(`https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${id}&key=${apiKey}`);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        // Try to find an English caption or the first available caption
        const caption = data.items.find(item => item.snippet.language === 'en') || data.items[0];
        const captionId = caption.id;

        // Fetch the actual caption track
        const captionResponse = await fetch(`https://www.googleapis.com/youtube/v3/captions/${captionId}?tfmt=srt&key=${apiKey}`);
        const captionText = await captionResponse.text();
        setTranscript(captionText);
      } else {
        setTranscript("No captions available for this video.");
      }
    } catch (error) {
      console.error("Error fetching transcript:", error);
      setTranscript("Failed to fetch captions.");
    }
  };

  return (
    <main className="home">
      <div className="container">
        <div className="home-wrapper">
          <h1>VIDEO SUMMARIZER</h1>

          <p>NEED NEW OATH GOOGLE CLOUD KEY AFTER PROJECT DELETION</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter YouTube URL"
              value={url}
              onChange={handleInputChange}
            />
            <button type="submit">SUBMIT</button>
          </form>
          <h3>Enter the URL of a YouTube video you would like to be summarized.</h3>
          {videoId && (
            <div>
              <h2>Video ID: {videoId}</h2>
              <div className="transcript">
                <h3>Transcript:</h3>
                <pre>{transcript}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
