import type { EmbeddingCreateParams } from 'openai/resources/embeddings';

const data = await Bun.file('questions.json').text();

type Question = {
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
};

const { questions } = JSON.parse(data) as { questions: Question[] };

type BatchEmbeddingRequest = EmbeddingCreateParams & { custom_id: string };

const embeddingRequestFileContent: string = questions
  .map(
    (question): BatchEmbeddingRequest => ({
      custom_id: question.id,
      input: question.solutions.python,
      model: 'text-embedding-3-large',
    })
  )
  .map((request) => JSON.stringify(request))
  .join('\n');

await Bun.write('embeddingBatchRequest.jsonl', embeddingRequestFileContent);

export {};
