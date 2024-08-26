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

console.log(questions[0].starterCode.python);

export {};
