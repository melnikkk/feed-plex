import { createWorkflow } from "@mastra/core/workflows";
import { fetchFeedArticlesStep } from "./steps/fetch-feed-articles-step";
import { scoreArticlesStep } from "./steps/score-articles-step";
import {
  WorkflowInputData,
  workflowInputDataSchema,
} from "../shared/schemas/workflowInputSchema";
import { workflowOutputSchema } from "../shared/schemas/workflowOutputSchema";

export const relevantArticlesWorkflow = createWorkflow({
  id: "relevant-articles-workflow",
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
