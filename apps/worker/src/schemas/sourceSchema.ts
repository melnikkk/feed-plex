import { z } from "zod";

export const sourceSchema = z.object({
  url: z.url(),
  sourceAffinity: z.number().min(0).max(1),
});

export type Source = z.infer<typeof sourceSchema>;
