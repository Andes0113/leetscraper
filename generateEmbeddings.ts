import openai from 'openai';
import fs from 'fs';
import {
  EMBEDDING_BATCH_REQUEST_FILE,
  BATCH_METADATA_FILE,
  OPENAI_API_KEY,
} from './common/constants';

const client = new openai({
  apiKey: OPENAI_API_KEY,
});

async function generateEmbeddings() {
  const batchInputFile = await client.files.create({
    file: fs.createReadStream(EMBEDDING_BATCH_REQUEST_FILE), // Use node file since BunFile not supported
    purpose: 'batch',
  });

  const batch = await client.batches.create({
    input_file_id: batchInputFile.id,
    endpoint: '/v1/embeddings',
    completion_window: '24h',
  });

  console.log('Created batch:', batch);

  await Bun.write(BATCH_METADATA_FILE, JSON.stringify(batch));
}

generateEmbeddings();
