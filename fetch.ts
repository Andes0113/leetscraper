import axios from 'axios';
import axiosRateLimit from 'axios-rate-limit';

const RATE_LIMIT_PER_SECOND = 3;

// Limit to 3 requests per second
const http = axiosRateLimit(axios.create(), { maxRPS: RATE_LIMIT_PER_SECOND });

async function scrape() {
  // Fetch all questions from NeetCode.io
  const res = await http.post(
    'https://us-central1-neetcode-dd170.cloudfunctions.net/getProblemListFunction',
    {
      data: {},
    }
  );

  // Filter for highest quality questions (NeetCode150)
  const questionIds = Object.keys(res.data.result)
    .map((key) => res.data.result[key])
    .filter((q) => q.tag == 'NeetCode150');

  // Fetch question metadata (name, description, difficulty, concepts, solutions, starter code, video url)
  const questionPromises = questionIds.map(async (q) => {
    console.log('Started fetching', q.id);
    const { data } = await http.post(
      'https://us-central1-neetcode-dd170.cloudfunctions.net/getProblemMetadataFunction',
      {
        data: { problemId: q.id },
      }
    );
    const question = data.result;
    const video = question.video.substring(question.video.indexOf('src="') + 5);
    const videoUrl = video.substring(0, video.indexOf('"'));
    const questionData = {
      id: question.id,
      name: question.name,
      description: question.description,
      difficulty: question.difficulty,
      concepts: question.prereqs.map((req) => req.name),
      solutions: question.solutions,
      starterCode: question.starterCode,
      videoUrl: videoUrl,
    };

    console.log('Fetched', questionData.id);

    return questionData;
  });

  const questions = await Promise.allSettled(questionPromises);

  // Write to file
  const json = JSON.stringify({
    questions: questions
      .filter((q) => q.status == 'fulfilled')
      .map((q) => q.value),
  });

  await Bun.write('questions.json', json);
}

scrape();
