# LeetScraper

A tool for scraping LeetCode questions and generating embeddings for them.

## Usage

### Fetching Questions

This creates a file called `questions.json` containing all the questions from NeetCode150, with their solutions.

```bash
bun fetch
```

### Generating Embeddings

This creates a batch request for the openai embeddings api and stores the results in a file called `batch.json`.

```bash
bun embed
```

### Grouping Questions with Embeddings

Fetches the result of the batch, groups the questions with their embeddings based on question id.

```bash
bun group
```
