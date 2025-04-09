import pandas as pd

df = pd.read_csv("backend/Broset_Dataset.csv")

# Convert all titles to lowercase for consistency
df['Title'] = df['Title'].str.strip().str.lower()

# Search for 'taxi driver'
result = df[df['Title'].str.contains("taxi driver", case=False, na=False)]

if not result.empty:
    print("✅ 'Taxi Driver' is in the dataset:")
    print(result[['Title', 'Directors', 'Genres']])
else:
    print("❌ 'Taxi Driver' not found in the dataset.")
