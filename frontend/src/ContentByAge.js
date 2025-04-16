import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./App.css";
import logo from "./assets/logo.png";
import { useNavigate } from "react-router-dom";

function ContentByAge() {
  const [moviesByAge, setMoviesByAge] = useState({
    G: { movies: [], offset: 0, hasMore: true },
    PG: { movies: [], offset: 0, hasMore: true },
    "PG-13": { movies: [], offset: 0, hasMore: true },
    R: { movies: [], offset: 0, hasMore: true },
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();
  const scrollRefs = useRef({});

  useEffect(() => {
    const fetchInitialMovies = async () => {
      setLoading(true); // Start loading
      try {
        await Promise.all(
          Object.keys(moviesByAge).map(async (ageRating) => {
            const res = await axios.get("http://127.0.0.1:5000/movies-by-age", {
              params: { age: ageRating, offset: 0, limit: 20 },
            });
            console.log(`API Response for ${ageRating}:`, res.data);
            setMoviesByAge((prev) => ({
              ...prev,
              [ageRating]: {
                movies: res.data[ageRating] || [],
                offset: 20,
                hasMore: res.data[ageRating].length === 20,
              },
            }));
          })
        );
      } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
        setError(
          err.response?.data?.error ||
            "Failed to load movies. Check backend logs."
        );
      } finally {
        setLoading(false); // Stop loading
      }
    };
    fetchInitialMovies();
  }, []);

  const handleScroll = (ageRating) => {
    const scrollDiv = scrollRefs.current[ageRating];
    if (
      scrollDiv &&
      scrollDiv.scrollLeft + scrollDiv.clientWidth >=
        scrollDiv.scrollWidth - 200 && // Trigger when 200px from end
      moviesByAge[ageRating].hasMore
    ) {
      fetchMoreMovies(ageRating);
    }
  };

  const fetchMoreMovies = async (ageRating) => {
    setLoading(true);
    try {
      const currentOffset = moviesByAge[ageRating].offset;
      const res = await axios.get("http://127.0.0.1:5000/movies-by-age", {
        params: { age: ageRating, offset: currentOffset, limit: 20 },
      });
      console.log(`More movies for ${ageRating}:`, res.data);
      setMoviesByAge((prev) => ({
        ...prev,
        [ageRating]: {
          movies: [...prev[ageRating].movies, ...res.data[ageRating]],
          offset: currentOffset + 20,
          hasMore: res.data[ageRating].length === 20,
        },
      }));
    } catch (err) {
      console.error("Error fetching more movies:", err);
      setError("Failed to load more movies.");
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movie) => {
    navigate(`/?title=${encodeURIComponent(movie.title)}`);
  };

  return (
    <div className="app">
      <div className="logo-title">
        <img src={logo} alt="StreamSense Logo" className="app-logo" />
        <h1 className="title">StreamSense</h1>
      </div>

      <button
        onClick={() => navigate("/")}
        style={{
          margin: "20px auto",
          padding: "0.8rem 1.2rem",
          borderRadius: "10px",
          background: "#f47c20",
          color: "white",
          border: "none",
          cursor: "pointer",
          display: "block",
        }}
      >
        Back to Search
      </button>

      {loading && <p className="loading">Loading movies...</p>}
      {error && <p className="error">{error}</p>}

      <div className="content-by-age">
        {Object.entries(moviesByAge).map(([ageRating, data]) => (
          data.movies.length > 0 && (
            <div key={ageRating} className="age-section">
              <h2>{ageRating}</h2>
              <div
                className="movie-scroll"
                ref={(el) => (scrollRefs.current[ageRating] = el)}
                onScroll={() => handleScroll(ageRating)}
              >
                {data.movies.map((movie, index) => (
                  <div
                    key={index}
                    className="movie-item"
                    onClick={() => handleMovieClick(movie)}
                  >
                    {movie.poster ? (
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="movie-poster"
                        onError={(e) => {
                          e.target.onerror = null; // Prevent infinite loop
                          e.target.src =
                            "https://via.placeholder.com/150x225?text=No+Poster"; // Fallback
                        }}
                      />
                    ) : (
                      <div className="poster-placeholder">No Poster</div>
                    )}
                    <p className="movie-title">{movie.title}</p>
                  </div>
                ))}
                {loading && data.movies.length > 0 && (
                  <div className="loading-more">Loading more...</div>
                )}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

export default ContentByAge;
