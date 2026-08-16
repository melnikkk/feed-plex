import { z } from "zod";
import { interestSchema } from "./interestSchema";

export const workflowInputDataSchema = z.object({
  feedUrl: z.url(),
  sourceAffinity: z.number().min(0).max(1),
  interests: z.array(interestSchema),
});

export type WorkflowInputData = z.infer<typeof workflowInputDataSchema>;
