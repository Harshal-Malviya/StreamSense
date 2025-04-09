import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import logo from "./assets/logo.png";

// Platform logo mapping
const platformLogos = {
  Netflix: require("./assets/platforms/netflix.png"),
  Prime: require("./assets/platforms/prime.png"),
  "Prime Video": require("./assets/platforms/prime.png"),
  Hulu: require("./assets/platforms/hulu.png"),
  Disney: require("./assets/platforms/hot.jpeg"),
  "Disney+": require("./assets/platforms/hot.jpeg"),
};

// Load Poppins font
const poppinsFont = document.createElement("link");
poppinsFont.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap";
poppinsFont.rel = "stylesheet";
document.head.appendChild(poppinsFont);

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

  const renderPlatformIcons = (platforms, platformLinks, fallbackLink) =>
    platforms.map((platform, index) => (
      <a
        key={index}
        href={platformLinks?.[platform] || fallbackLink}
        target="_blank"
        rel="noreferrer"
        className="watch-now"
      >
        {platformLogos[platform] ? (
          <img
            src={platformLogos[platform]}
            alt={platform}
            className="platform-icon"
          />
        ) : (
          <span>{platform}</span>
        )}
      </a>
    ));

  return (
    <div className="app">
      <div className="logo-title">
        <img src={logo} alt="StreamSense Logo" className="app-logo" />
        <h1 className="title">StreamSense</h1>
      </div>

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
          <h2 className="matched-title">Results for: &nbsp;&nbsp;{result.matched_title.trim().toUpperCase()}</h2>

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
                <h3>{result.searched_movie.title.trim().toUpperCase()}</h3>

                <p>
                  <strong>Genres:&nbsp;&nbsp;</strong>
                  {result.searched_movie.genres.split(",").map((genre, idx) => (
                    <span key={idx} style={{ marginRight: "8px" }}>
                      {genre.trim().toUpperCase()}
                                
                    </span>
                  ))}
                </p>

                <p>
                    <strong>Director:&nbsp;&nbsp;</strong>
                    {result.searched_movie.director.split(",").map((dir, idx, arr) => (
                      <span key={idx} style={{ marginRight: "8px" }}>
                        {dir.trim().toUpperCase()}
                        {idx < arr.length - 1 ? "," : ""}
                      </span>
                    ))}
                  </p>

                <p>
                    <strong>Languages:&nbsp;&nbsp;</strong>
                    {result.searched_movie.language.split(",").map((lang, idx, arr) => (
                      <span key={idx} style={{ marginRight: "8px" }}>
                        {lang.trim().toUpperCase()}
                        {idx < arr.length - 1 ? "," : ""}
                      </span>
                    ))}
                  </p>



                <div className="platform-buttons">
                  {renderPlatformIcons(
                    result.searched_movie.platforms,
                    result.searched_movie.platform_links,
                    result.searched_movie.link
                  )}
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
                  <h4>{movie.title.trim().toUpperCase()}</h4>
                  <p>
                    <strong>Genres:&nbsp;&nbsp;</strong>
                    {result.searched_movie.genres.split(",").map((genre, idx) => (
                      <span key={idx} style={{ marginRight: "8px" }}>
                        {genre.trim().toUpperCase()}
                      </span>
                    ))}
                  </p>

                  <div className="platform-buttons">
                    {renderPlatformIcons(
                      movie.platforms,
                      movie.platform_links,
                      movie.link
                    )}
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
