import 'dotenv/config';
import './env';
import { relevantArticlesWorkflow } from './mastra/workflow';
import { interests, SOURCES } from './constants';

const run = await relevantArticlesWorkflow.createRun();
const result = await run.start({
  inputData: { sources: SOURCES, interests },
});

if (result.status !== 'success') {
  console.error('Workflow run failed:', result);
  process.exit(1);
}

for (const { article, score, breakdown } of result.result.rankedArticles) {
  console.log(`${score.toFixed(3)}  ${article.link}`);
  console.log(`  ${article.title}`);
  console.log(`  source=${article.sourceUrl}`);
  console.log(
    `  semantic=${breakdown.semanticSimilarity.toFixed(3)} lexical=${breakdown.lexicalScore.toFixed(3)} freshness=${breakdown.freshnessScore.toFixed(3)} source=${breakdown.sourceAffinity.toFixed(3)}`,
  );
}
