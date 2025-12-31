import { z } from "zod";

export const SyncActionSchema = z.enum(["create", "update", "delete"]);

export const SyncEventSchema = z.object({
  eventId: z.string().uuid(),              // idempotency key
  deviceId: z.string().min(1),
  entityType: z.enum(["lead", "visit", "deal", "work_session", "media"]),
  entityLocalId: z.string().uuid(),
  action: SyncActionSchema,
  dependsOnEventId: z.string().uuid().optional(),
  payload: z.record(z.any()),
  createdAt: z.string()
});

export type SyncEvent = z.infer<typeof SyncEventSchema>;
