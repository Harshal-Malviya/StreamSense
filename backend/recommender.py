import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from fuzzywuzzy import process
import requests


class MovieRecommender:
    def __init__(self, csv_path):
        self.df = pd.read_csv(csv_path)
        self._prepare_data()


    def _prepare_data(self):
        self.df.columns = [col.strip().replace(" ", "_") for col in self.df.columns]
        self.df.fillna('', inplace=True)
        # Map numerical ages to ratings (optional, done in app.py for now)
        # self.df['Age'] = self.df['Age'].map({7: 'G', 13: 'PG-13', 18: 'R'}).fillna('Unrated')
        self.df['combined_features'] = (
            self.df['Title'] + ' ' +
            self.df['Directors'] + ' ' +
            self.df['Genres'] + ' ' +
            self.df['Language']
        )
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = self.vectorizer.fit_transform(self.df['combined_features'])
        self.cosine_sim = cosine_similarity(self.tfidf_matrix, self.tfidf_matrix)
        self.indices = pd.Series(self.df.index, index=self.df['Title'].str.lower())


    def get_recommendations(self, title, num_recs=6, age=None):
        title = title.lower()


        # Try exact match
        if title in self.indices:
            idx = self.indices[title]
            matched_title = title
        else:
            # Use fuzzy matching if exact title not found
            all_titles = self.df['Title'].str.lower().tolist()
            best_match, score = process.extractOne(title, all_titles)
            if score < 70:
                return None, [], None
            idx = self.indices[best_match]
            matched_title = best_match


        sim_scores = list(enumerate(self.cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:num_recs+1]
        movie_indices = [i[0] for i in sim_scores]


        # Add poster for matched movie and recommendations
        matched_movie = self.df.loc[idx].copy()
        matched_movie['poster'] = get_movie_poster(matched_movie['Title'])


        recommended_movies = self.df.iloc[movie_indices].copy()
        if age:
            # Map age ratings to numerical values for comparison
            age_map = {'G': 7, 'PG': 7, 'PG-13': 13, 'R': 18}  # Adjusted to match dataset (7, 18)
            max_age = age_map.get(age, 18)  # Default to R if unknown
            recommended_movies = recommended_movies[recommended_movies['Age'].astype(float) <= max_age]
        recommended_movies['poster'] = recommended_movies['Title'].apply(get_movie_poster)


        return matched_movie, recommended_movies, matched_title


def get_movie_poster(movie_title):
    url = f"https://api.themoviedb.org/3/search/movie?api_key=e25bdbcc48f29908ffb9b6857c6eb4aa&query={movie_title}"
    try:
        response = requests.get(url, timeout=10)  # Add timeout here
        response.raise_for_status()  # Raise an exception for bad status codes
        data = response.json()
        if data['results']:
            poster_path = data['results'][0].get('poster_path')
            return f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None
        return None
    except requests.exceptions.Timeout:
        print("TMDb API request timed out.")
        return None
    except requests.exceptions.RequestException as e:
        print(f"Error accessing TMDb API: {e}")
        return None


def get_movie_details(title):
    api_key = 'e25bdbcc48f29908ffb9b6857c6eb4aa'  # Replace with your actual TMDb API key
    query = title.replace(' ', '+')
    url = f'https://api.themoviedb.org/3/search/movie?api_key={api_key}&query={query}'


    response = requests.get(url)
    if response.status_code != 200:
        return None, None


    data = response.json()
    if data['results']:
        movie = data['results'][0]
        poster_path = movie.get('poster_path')
        description = movie.get('overview', '')
        poster_url = f'https://image.tmdb.org/t/p/w500{poster_path}' if poster_path else None
        return poster_url, description


    return None, None