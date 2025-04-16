import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [title, setTitle] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const fetchRecommendations = async () => {
    setError("");
    try {
      const res = await axios.get("http://127.0.0.1:5000/recommend", {
        params: { title },
      });
      setResult(res.data);
    } catch (err) {
      setResult(null);
      setError(err.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <div className="app">
      <h1 className="title">🎬StreamSense </h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for a movie..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchRecommendations()}
        />
        <button onClick={fetchRecommendations}>Search</button>
      </div>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="results">
          <h2 className="matched-title">Results for: {result.matched_title}</h2>

          {/* Searched Movie Card */}
          <div className="movie-container">
            <div className="movie-card">
              {result.searched_movie.poster && (
                <img
                  src={result.searched_movie.poster}
                  alt={result.searched_movie.title}
                  className="movie-poster"
                />
              )}
              <div className="movie-info">
                <h3>{result.searched_movie.title}</h3>

                <p><strong>Genres:</strong> {result.searched_movie.genres}</p>
                <p><strong>Director:</strong> {result.searched_movie.director}</p>
                <p><strong>Language:</strong> {result.searched_movie.language}</p>
                <p><strong>Platforms:</strong> {result.searched_movie.platforms.join(", ")}</p>

                <div className="platform-buttons">
                  {result.searched_movie.platforms.map((platform, index) => (
                    <a
                      key={index}
                      href={
                        result.searched_movie.platform_links?.[platform] ||
                        result.searched_movie.link
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="watch-now"
                    >
                      🎥 Watch on {platform}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <h3>Recommended Movies:</h3>
          <div className="recommendations">
            {result.recommendations.map((movie, index) => (
              <div key={index} className="movie-card">
                {movie.poster && (
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="movie-card-poster"
                  />
                )}
                <div className="movie-card-details">
                  <h4>{movie.title}</h4>
                  <p><strong>Genres:</strong> {movie.genres}</p>
                  <p><strong>Platforms:</strong> {movie.platforms.join(", ")}</p>

                  <div className="platform-buttons">
                    {movie.platforms.map((platform, i) => (
                      <a
                        key={i}
                        href={movie.platform_links?.[platform] || movie.link}
                        target="_blank"
                        rel="noreferrer"
                        className="watch-now"
                      >
                        🎥 Watch on {platform}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
