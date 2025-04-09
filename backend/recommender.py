import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from fuzzywuzzy import process

class MovieRecommender:
    def __init__(self, csv_path):
        self.df = pd.read_csv(csv_path)
        self._prepare_data()

    def _prepare_data(self):
        self.df.columns = [col.strip().replace(" ", "_") for col in self.df.columns]
        self.df.fillna('', inplace=True)
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

    def get_recommendations(self, title, num_recs=6):
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
                return None, []
            idx = self.indices[best_match]
            matched_title = best_match

        sim_scores = list(enumerate(self.cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:num_recs+1]
        movie_indices = [i[0] for i in sim_scores]
    
        return self.df.loc[idx], self.df.iloc[movie_indices], matched_title
        
    
    


