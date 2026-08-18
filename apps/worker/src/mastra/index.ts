import { Mastra } from '@mastra/core';
import { relevantArticlesWorkflow } from './workflow';

export const mastra = new Mastra({
  workflows: { relevantArticlesWorkflow },
});
