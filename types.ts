import type { EmbeddingCreateParams } from 'openai/resources/embeddings';

export type Embedding = number[];

export type Question = {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  concepts: string[];
  starterCode: {
    [key: string]: string;
  };
  solutions: {
    [key: string]: string;
  };
  videoUrl: string;
};

export type EmbeddingPackage = { questionId: string; embedding: Embedding };

export type QuestionWithEmbedding = Question & { embedding: Embedding };

// Custom id required for batch embedding requests
export type BatchEmbeddingRequest = {
  custom_id: string;
  method: 'GET' | 'POST';
  url: string;
  body: EmbeddingCreateParams;
};
