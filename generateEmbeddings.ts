import openai from 'openai';
import fs from 'fs';

const client = new openai({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateEmbeddings() {
  const batchInputFile = await client.files.create({
    file: fs.createReadStream('embeddingBatchRequest.jsonl'), // Use node file since BunFile not supported
    purpose: 'batch',
  });

  const batch = await client.batches.create({
    input_file_id: batchInputFile.id,
    endpoint: '/v1/embeddings',
    completion_window: '24h',
  });

  console.log('Created batch:', batch);

  await Bun.write('batch.json', JSON.stringify(batch));
}

generateEmbeddings();
