import { createWorkflow } from '@mastra/core/workflows';
import { fetchFeedArticlesStep } from './steps/fetchFeedArticlesStep';
import { scoreArticlesStep } from './steps/scoreArticlesStep';
import type { WorkflowInputData } from '@/mastra/shared/schemas/workflowInputSchema';
import { workflowInputDataSchema } from '@/mastra/shared/schemas/workflowInputSchema';
import { workflowOutputSchema } from '@/mastra/shared/schemas/workflowOutputSchema';

export const relevantArticlesWorkflow = createWorkflow({
  id: 'relevant-articles-workflow',
  inputSchema: workflowInputDataSchema,
  outputSchema: workflowOutputSchema,
});

relevantArticlesWorkflow
  .then(fetchFeedArticlesStep)
  .map(async ({ inputData, getInitData }) => {
    const initData = await getInitData<WorkflowInputData>();

    return {
      articles: inputData.articles,
      interests: initData.interests,
      sources: initData.sources,
    };
  })
  .then(scoreArticlesStep)
  .commit();
