# Flask API for Alice in Wonderland Vector Database
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import traceback
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

class CustomE5Embedding(HuggingFaceEmbeddings):
    def embed_documents(self, texts):
        texts = [f"passage: {t}" for t in texts]
        return super().embed_documents(texts)
    
    def embed_query(self, text):
        return super().embed_query(f"query: {text}")

# Initialize the embedding model and load the vector database
def load_vector_db():
    try:
        print("Loading vector database...")
        print(f"Current working directory: {os.getcwd()}")
        print(f"Contents of current directory: {os.listdir('.')}")
        
        # Check if wonderland_db exists
        db_path = "wonderland_db"
        if not os.path.exists(db_path):
            print(f"ERROR: {db_path} does not exist!")
            print("Available directories:", [d for d in os.listdir('.') if os.path.isdir(d)])
            return None
        
        print(f"Contents of {db_path}: {os.listdir(db_path)}")
        
        embedding_model = CustomE5Embedding(model_name="intfloat/multilingual-e5-small")
        print("Embedding model created successfully")
        
        db = FAISS.load_local(db_path, embedding_model, allow_dangerous_deserialization=True)
        print("Vector database loaded successfully!")
        return db
    except Exception as e:
        print(f"Error loading vector database: {e}")
        print("Full traceback:")
        traceback.print_exc()
        return None

vector_db = load_vector_db()

@app.route('/api/query', methods=['POST'])
def query_vector_db():
    try:
        print(f"Received request: {request.json}")
        
        if not vector_db:
            error_msg = "Vector database not loaded"
            print(f"ERROR: {error_msg}")
            return jsonify({"error": error_msg}), 500
        
        data = request.json
        if not data or 'query' not in data:
            error_msg = "Query parameter is required"
            print(f"ERROR: {error_msg}")
            return jsonify({"error": error_msg}), 400
        
        query = data['query']
        top_k = data.get('topK', 3)  # Default to 3 results if not specified
        
        print(f"Processing query: '{query}' with top_k: {top_k}")
        
        # Get relevant documents from the vector store
        retriever = vector_db.as_retriever(search_kwargs={"k": top_k})
        docs = retriever.get_relevant_documents(query)
        
        print(f"Found {len(docs)} documents")
        
        # Extract and return the page content
        contexts = [doc.page_content for doc in docs]
        
        response = {
            "query": query,
            "contexts": contexts
        }
        
        print(f"Sending response with {len(contexts)} contexts")
        return jsonify(response)
        
    except Exception as e:
        error_msg = f"Error processing query: {str(e)}"
        print(f"ERROR: {error_msg}")
        print("Full traceback:")
        traceback.print_exc()
        return jsonify({"error": error_msg}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "running",
        "vector_db_loaded": vector_db is not None,
        "current_directory": os.getcwd()
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    print(f"Starting Flask app on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)