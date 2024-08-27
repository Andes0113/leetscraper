import openai from 'openai';
import {
  OPENAI_API_KEY,
  QUESTIONS_WITH_EMBEDDINGS_FILE,
} from './common/constants';
import type {
  EmbeddingPackage,
  QuestionWithEmbedding,
  Question,
} from './common/types';

const client = new openai({
  apiKey: OPENAI_API_KEY,
});

function wrapWithBrackets(content: string) {
  return '[' + content + ']';
}

async function fetchBatchEmbeddings(
  batchId: string
): Promise<EmbeddingPackage[]> {
  const batchStatus = await client.batches.retrieve(batchId);

  if (batchStatus.status !== 'completed' || !batchStatus.output_file_id) {
    throw new Error(
      `Batch status is not completed. Current status: ${batchStatus.status}`
    );
  }

  const outputFileId = batchStatus.output_file_id;

  const outputFile = await client.files.content(outputFileId);

  const rawContent = await outputFile.text();

  // Convert the raw content to a JSON array
  const jsonContent = wrapWithBrackets(
    rawContent
      .split('\n')
      .filter((line) => line.trim() !== '')
      .join(',')
  );
  const content = JSON.parse(jsonContent);

  const questionEmbeddings: EmbeddingPackage[] = content.map((request: any) => {
    return {
      questionId: request.custom_id,
      embedding: request.response.body.data[0].embedding,
    };
  });

  return questionEmbeddings;
}

async function groupQuestionsWithEmbeddings(
  questions: Question[],
  questionEmbeddings: EmbeddingPackage[]
): Promise<QuestionWithEmbedding[]> {
  // Technically, these should be in the same order, but just to be safe...
  const questionsWithEmbeddings = questions.map((question) => {
    const embedding = questionEmbeddings.find(
      (embedding) => embedding.questionId === question.id
    )?.embedding;

    if (!embedding) {
      throw new Error(`Embedding not found for question ${question.id}`);
    }

    return { ...question, embedding };
  });

  return questionsWithEmbeddings;
}

async function main() {
  const batchInfo = await Bun.file('batch.json').json();
  const batchId = batchInfo.id;

  const questions = await Bun.file('questions.json').json();

  const embeddings = await fetchBatchEmbeddings(batchId);
  const questionsWithEmbeddings = await groupQuestionsWithEmbeddings(
    questions,
    embeddings
  );

  await Bun.write(
    QUESTIONS_WITH_EMBEDDINGS_FILE,
    JSON.stringify(questionsWithEmbeddings)
  );
}

main();
