import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import logo from "./assets/logo.png";
import { motion } from "framer-motion";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import ContentByAge from "./ContentByAge";


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


function Home() {
  const [title, setTitle] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [age, setAge] = useState("");
  const navigate = useNavigate();


  const fetchRecommendations = async () => {
    setError("");
    try {
      const res = await axios.get("http://127.0.0.1:5000/recommend", {
        params: { title, age },
      });
      setResult(res.data);
    } catch (err) {
      setResult(null);
      setError(err.response?.data?.error || "Something went wrong.");
    }
  };


  const RatingBar = ({ rating, outOf }) => {
    const [fill, setFill] = useState(0);
    const percentage = (rating / outOf) * 100;


    useEffect(() => {
      const timeout = setTimeout(() => {
        setFill(percentage);
      }, 100);
      return () => clearTimeout(timeout);
    }, [percentage]);


    return (
      <div style={{ display: "flex", alignItems: "center", width: "200px", marginBottom: "8px" }}>
        <div
          style={{
            height: "8px",
            flex: 1,
            backgroundColor: "#4b3f2b",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${fill}%`,
              height: "100%",
              backgroundColor: "#f47c20",
              borderRadius: "10px",
              transition: "width 1s ease-in-out",
            }}
          />
        </div>
      </div>
    );
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


  const handleMovieClick = (movie) => {
    setResult((prevResult) => ({
      ...prevResult,
      matched_title: movie.title,
      searched_movie: movie,
    }));
  };


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
      <button
          onClick={() => navigate("/content-by-age")}
          style={{
            marginLeft: "10px",
            padding: "0.8rem 1.2rem",
            borderRadius: "10px",
            background: "#f47c20",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Content by Age
        </button>
      {error && <p className="error">{error}</p>}


      {result && (
        <div className="results">
          <h2 className="matched-title">
            Results for:&nbsp; {result.matched_title.trim().toUpperCase()}
          </h2>


          <div className="movie-container">
            <div className="movie-card">
              <div className="movie-info">
                <h3>{result.searched_movie.title.trim().toUpperCase()}</h3>
                <p>
                  <strong>Age Rating:&nbsp;&nbsp; </strong>
                  {result.searched_movie.age || "Unrated"}
                </p>
                <p>
                  <strong>Genres:&nbsp;&nbsp; </strong>
                  {result.searched_movie.genres.split(",")[0].replace("'", "").trim().toUpperCase()}  {/* Handle list format */}
                </p>
                <p>
                  <strong>Director:&nbsp;&nbsp; </strong>
                  {result.searched_movie.director.split(",")[0].trim().toUpperCase()}
                </p>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                  <img
                    src="imdb.png"
                    alt="IMDb"
                    style={{ height: "30px", marginRight: "8px" }}
                  />
                  <RatingBar rating={parseFloat(result.searched_movie.imdb)} outOf={10} />
                  <span style={{ marginLeft: "8px" }}>{result.searched_movie.imdb}/10</span>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src="rottentomatoes.png"
                    alt="Rotten Tomatoes"
                    style={{ height: "30px", marginRight: "8px" }}
                  />
                  <RatingBar rating={parseFloat(result.searched_movie.rotten_tomatoes)} outOf={100} />
                  <span style={{ marginLeft: "8px" }}>{result.searched_movie.rotten_tomatoes}%</span>
                </div>
                <p>
                  <strong>Languages: &nbsp;&nbsp;</strong>
                  {result.searched_movie.language.trim().toUpperCase()}
                </p>
                <div className="platform-buttons">
                  {renderPlatformIcons(
                    result.searched_movie.platforms,
                    result.searched_movie.platform_links,
                    result.searched_movie.link
                  )}
                </div>
                <p
                  style={{
                    color: "#ddd",
                    marginTop: "8px",
                    fontSize: "14px",
                    fontWeight: "normal",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  <span style={{ fontWeight: "bold", color: "#f47c20" }}>Description: &nbsp;</span>
                  {result.searched_movie.description}
                </p>
              </div>
              {result.searched_movie.poster && (
                <img
                  src={result.searched_movie.poster}
                  alt={result.searched_movie.title}
                  className="movie-poster-corner"
                />
              )}
            </div>
          </div>


          <h3>Recommended Movies:</h3>
          <div className="recommendations">
            {result.recommendations.map((movie, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="movie-card"
                onClick={() => handleMovieClick(movie)}
                style={{ cursor: "pointer" }}
              >
                &nbsp;{movie.poster && (
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="movie-card-poster"
                  />
                )}
                &nbsp;&nbsp;<div className="movie-card-details">
                  <h4>{movie.title.trim().toUpperCase()}</h4>
                  <p>
                    <strong>&nbsp;Age Rating: &nbsp;</strong>
                    {movie.age || "Unrated"}
                  </p>
                  <p>
                    <strong>&nbsp;Genres: &nbsp;</strong>
                    {movie.genres.split(",")[0].replace("'", "").trim().toUpperCase()}
                  </p>
                  <div className="platform-buttons">
                    {renderPlatformIcons(
                      movie.platforms,
                      movie.platform_links,
                      movie.link
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/content-by-age" element={<ContentByAge />} />
      </Routes>
    </Router>
  );
}
export default App;