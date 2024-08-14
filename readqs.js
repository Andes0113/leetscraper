import fs from 'fs';

fs.readFile('questions.json', 'utf-8', (err, data) => {
  if (err) console.log(err);

  const obj = JSON.parse(data);
  console.log(obj);
});
