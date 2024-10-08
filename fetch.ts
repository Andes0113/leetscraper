import axios from 'axios';
import axiosRateLimit from 'axios-rate-limit';
import type { BatchEmbeddingRequest, Question } from './common/types';
import {
  QUESTIONS_TAG,
  BASE_URL,
  RATE_LIMIT_PER_SECOND,
  EMBEDDING_MODEL,
  EMBEDDING_BATCH_REQUEST_FILE,
  QUESTIONS_FILE,
} from './common/constants';

// Define http client for neetcode api w/ rate limit
const http = axiosRateLimit(
  axios.create({
    baseURL: BASE_URL,
  }),
  {
    maxRPS: RATE_LIMIT_PER_SECOND,
  }
);

async function scrape() {
  // Fetch all questions from NeetCode.io
  const res = await http.post('/getProblemListFunction', {
    data: {},
  });

  // Filter for highest quality questions (NeetCode150)
  const questionIds: string[] = Object.keys(res.data.result)
    .map((key) => res.data.result[key])
    .filter((q) => q.tag === QUESTIONS_TAG)
    .map((q) => q.id);

  // Fetch question metadata (name, description, difficulty, concepts, solutions, starter code, video url)
  const questionPromises = questionIds.map(
    async (questionId): Promise<Question> => fetchQuestionMetadata(questionId)
  );

  // Resolve all promises
  const questions: Question[] = (await Promise.allSettled(questionPromises))
    .filter((q) => q.status === 'fulfilled')
    .map((q) => q.value);

  console.log('Fetched all questions');

  if (questions.length != questionIds.length) {
    console.log(
      'Failed to fetch:',
      questionIds.filter((id) => !questions.map((q) => q.id).includes(id))
    );
    throw new Error('Some questions failed to fetch');
  }

  // Write questions to file
  const questionsJson = JSON.stringify(questions);

  await Bun.write(QUESTIONS_FILE, questionsJson);

  // Create and write to embedding request file
  const embeddingRequestFileContent =
    createEmbeddingRequestFileContent(questions);

  await Bun.write(EMBEDDING_BATCH_REQUEST_FILE, embeddingRequestFileContent);
}

// Fetch question metadata from neetcode api
async function fetchQuestionMetadata(questionId: string): Promise<Question> {
  console.log('Started fetching', questionId);

  const res = await http
    .post('/getProblemMetadataFunction', {
      data: { problemId: questionId },
    })
    .catch((err) => {
      console.log('Failed to fetch', questionId);
      console.log(err);
      return null;
    });

  if (!res?.data) {
    throw new Error('Failed to fetch question metadata');
  }

  const question = res.data.result;

  // Condense video data into only the youtube video id
  const video = question.video.substring(question.video.indexOf('src="') + 5);
  const videoUrl = video.substring(0, video.indexOf('"'));

  const questionData: Question = {
    id: question.id,
    name: question.name,
    description: question.description,
    difficulty: question.difficulty,
    concepts: question.prereqs?.map((req) => req.name) || [], // Prereqs are undefined, not empty, if question has no prereqs
    solutions: question.solutions,
    starterCode: question.starterCode,
    videoUrl: videoUrl,
  };

  console.log('Fetched', questionId);

  return questionData;
}

function createEmbeddingRequestFileContent(questions: Question[]): string {
  const embeddingRequestFileContent: string = questions
    .map(
      (question): BatchEmbeddingRequest => ({
        custom_id: question.id,
        method: 'POST',
        url: '/v1/embeddings',
        body: {
          input: question.solutions.python,
          model: EMBEDDING_MODEL,
        },
      })
    )
    .map((request) => JSON.stringify(request))
    .join('\n');

  return embeddingRequestFileContent;
}

scrape();
