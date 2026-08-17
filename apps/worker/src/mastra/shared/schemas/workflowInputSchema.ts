import { z } from "zod";
import { interestSchema } from "../../../schemas/interestSchema";
import { sourceSchema } from "../../../schemas/sourceSchema";

export const workflowInputDataSchema = z.object({
  sources: z.array(sourceSchema).min(1),
  interests: z.array(interestSchema),
});

export type WorkflowInputData = z.infer<typeof workflowInputDataSchema>;
