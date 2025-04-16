from flask import Flask, request, jsonify
from flask_cors import CORS
from recommender import MovieRecommender
from fuzzywuzzy import process
import requests


app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication


# Initialize recommender
recommender = MovieRecommender('Broset_Dataset.csv')


# Function to get poster and description from TMDb
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


@app.route('/recommend', methods=['GET'])
def recommend():
    title = request.args.get('title', '').strip()
    age = request.args.get('age', '').strip()  # New age parameter


    if not title:
        return jsonify({'error': 'No title provided'}), 400


    movie_data, similar_movies, matched_title = recommender.get_recommendations(title, age=age)


    if movie_data is None:
        return jsonify({'error': f"Movie '{title}' not found."}), 404


    def format_platforms(row):
        platforms = []
        if row['Netflix']: platforms.append("Netflix")
        if row['Hulu']: platforms.append("Hulu")
        if row['Prime_Video']: platforms.append("Prime Video")
        if row['Disney+']: platforms.append("Disney+")
        return platforms


    def format_platform_links(row):
        links = {}
        title_encoded = row['Title'].replace(' ', '%20')
        if row['Netflix']:
            links['Netflix'] = f"https://www.netflix.com/search?q={title_encoded}"
        if row['Prime_Video']:
            links['Prime Video'] = f"https://www.primevideo.com/search/ref=atv_nb_sr?phrase={title_encoded}"
        if row['Hulu']:
            links['Hulu'] = f"https://www.hulu.com/search?q={title_encoded}"
        if row['Disney+']:
            links['Disney+'] = f"https://www.disneyplus.com/search/{title_encoded}"
        return links


    def format_movie(row):
        platforms = format_platforms(row)
        platform_links = format_platform_links(row)
        fallback_link = next(iter(platform_links.values()), "#")


        # Fix genres formatting
        if isinstance(row['Genres'], str) and row['Genres'].startswith("["):
            try:
                genres = ", ".join(eval(row['Genres']))
            except:
                genres = row['Genres']
        else:
            genres = row['Genres']


        # Get poster and description from TMDb
        poster_url, description = get_movie_details(row['Title'])


        return {
            'title': row['Title'],
            'genres': genres,
            'director': row['Directors'],
            'language': row['Language'],
            'platforms': platforms,
            'link': fallback_link,
            'platform_links': platform_links,
            'imdb': row.get('IMDb', ''),
            'rotten_tomatoes': row.get('Rotten_Tomatoes', ''),
            'poster': poster_url,
            'description': description,
            'age': str(row.get('Age', ''))  # Include age rating
        }


    main_movie = format_movie(movie_data)
    recommendations = [format_movie(row) for _, row in similar_movies.iterrows()]


    return jsonify({
        'searched_movie': main_movie,
        'matched_title': matched_title,
        'recommendations': recommendations
    })


@app.route('/movies-by-age', methods=['GET'])
def movies_by_age():
    df = recommender.df.copy()
   
    # Map numerical ages to standard ratings
    age_map = {7: 'G', 13: 'PG-13', 18: 'R'}  # Extend as needed based on dataset
    df['Age'] = df['Age'].map(age_map).fillna('Unrated')
   
    # Group movies by age rating
    movies_by_age = {'G': [], 'PG': [], 'PG-13': [], 'R': []}
    for rating in movies_by_age.keys():
        age_movies = df[df['Age'] == rating].head(20)  # Limit to 20 movies per rating
        movies_by_age[rating] = [
            {
                'title': row['Title'],
                'poster': get_movie_details(row['Title'])[0]  # Get only poster URL
            }
            for _, row in age_movies.iterrows()
        ]
   
    return jsonify(movies_by_age)


if __name__ == '__main__':
    app.run(debug=True)