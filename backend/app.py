from flask import Flask, request, jsonify
from flask_cors import CORS
from recommender import MovieRecommender
from fuzzywuzzy import process

app = Flask(__name__)
CORS(app)  # Allow requests from frontend (especially for local dev)

# Load the dataset and initialize the recommender
recommender = MovieRecommender('Broset_Dataset.csv')

@app.route('/recommend', methods=['GET'])
def recommend():
    title = request.args.get('title', '').strip()

    if not title:
        return jsonify({'error': 'No title provided'}), 400

    movie_data, similar_movies, matched_title = recommender.get_recommendations(title)

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

        return {
            'title': row['Title'],
            'genres': genres,
            'director': row['Directors'],
            'language': row['Language'],
            'platforms': platforms,
            'link': fallback_link,
            'platform_links': platform_links,
            'imdb': row.get('IMDb', ''),
            'rotten_tomatoes': row.get('Rotten_Tomatoes', '')
        }

    main_movie = format_movie(movie_data)
    recommendations = [format_movie(row) for _, row in similar_movies.iterrows()]

    return jsonify({
        'searched_movie': main_movie,
        'matched_title': matched_title,
        'recommendations': recommendations
    })

if __name__ == '__main__':
    app.run(debug=True)
