import axios from 'axios';
import axiosRateLimit from 'axios-rate-limit';
import { writeFile } from 'fs';

// Limit to 3 requests per second
const http = axiosRateLimit(axios.create(), { maxRPS: 3 });

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
    console.log('starting question fetching', q.id);
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

    console.log('fetched', questionData);

    return questionData;
  });

  const questions = await Promise.allSettled(questionPromises);

  console.log(questions);

  // Write to file
  const json = JSON.stringify({
    questions: questions
      .filter((q) => q.status == 'fulfilled')
      .map((q) => q.value),
  });

  writeFile('questions.json', json, (err) => {
    if (err) console.log(err);
    else {
      console.log('File written successfully');
    }
  });
}

scrape();
