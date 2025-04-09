import requests
import pandas as pd
import os

# ✅ Ensure file exists in this directory
file_path = os.path.join(os.path.dirname(__file__), "Broset_Dataset.csv")
if not os.path.exists(file_path):
    raise FileNotFoundError("Broset_Dataset.csv not found. Please check the file path.")

# 🔑 Your TMDb API Key
api_key = "e25bdbcc48f29908ffb9b6857c6eb4aa"
base_url = "https://api.themoviedb.org/3/search/movie"
image_base = "https://image.tmdb.org/t/p/w500"

# ✅ Load the dataset
df = pd.read_csv(file_path)

# 🔍 Confirm the column names
print("Columns in dataset:", df.columns.tolist())

# ✅ Use the correct column name
titles = df['Title'].dropna().unique()  # Drop NaN titles if any

# 📦 Dictionary to store title and poster URL
movie_posters = {}

print("Fetching poster URLs...")

for title in titles:
    params = {
        "api_key": api_key,
        "query": title
    }
    try:
        response = requests.get(base_url, params=params)
        data = response.json()
        if data.get("results"):
            poster_path = data["results"][0].get("poster_path")
            movie_posters[title] = image_base + poster_path if poster_path else None
        else:
            movie_posters[title] = None
    except Exception as e:
        print(f"Error fetching data for '{title}': {e}")
        movie_posters[title] = None

# 💾 Convert to DataFrame and save
poster_df = pd.DataFrame(movie_posters.items(), columns=["title", "poster_url"])
poster_df.to_csv("movie_posters.csv", index=False)
print("✅ Poster URLs saved to movie_posters.csv")
