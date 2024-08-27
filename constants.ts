// Files
export const EMBEDDING_BATCH_REQUEST_FILE = 'embeddingBatchRequest.jsonl';
export const QUESTIONS_FILE = 'questions.json';
export const QUESTIONS_WITH_EMBEDDINGS_FILE = 'questionsWithEmbeddings.json';
export const BATCH_METADATA_FILE = 'batch.json';

// OpenAI
export const EMBEDDING_MODEL = 'text-embedding-3-small';

// Scraping Settings
export const QUESTIONS_TAG = 'NeetCode150';
export const BASE_URL = 'https://us-central1-neetcode-dd170.cloudfunctions.net';
export const RATE_LIMIT_PER_SECOND = 1;

// Environment Variables
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
if (!OPENAI_API_KEY) {
  throw new Error('Environment variable OPENAI_API_KEY is not set');
}
export const POSTGRES_URL = process.env.POSTGRES_URL!;
if (!POSTGRES_URL) {
  throw new Error('Environment variable POSTGRES_URL is not set');
}
