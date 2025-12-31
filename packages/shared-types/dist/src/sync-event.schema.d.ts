import { z } from "zod";
export declare const SyncActionSchema: z.ZodEnum<["create", "update", "delete"]>;
export declare const SyncEventSchema: z.ZodObject<{
    eventId: z.ZodString;
    deviceId: z.ZodString;
    entityType: z.ZodEnum<["lead", "visit", "deal", "work_session", "media"]>;
    entityLocalId: z.ZodString;
    action: z.ZodEnum<["create", "update", "delete"]>;
    dependsOnEventId: z.ZodOptional<z.ZodString>;
    payload: z.ZodRecord<z.ZodString, z.ZodAny>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    eventId: string;
    deviceId: string;
    entityType: "lead" | "visit" | "deal" | "work_session" | "media";
    entityLocalId: string;
    action: "create" | "update" | "delete";
    payload: Record<string, any>;
    createdAt: string;
    dependsOnEventId?: string | undefined;
}, {
    eventId: string;
    deviceId: string;
    entityType: "lead" | "visit" | "deal" | "work_session" | "media";
    entityLocalId: string;
    action: "create" | "update" | "delete";
    payload: Record<string, any>;
    createdAt: string;
    dependsOnEventId?: string | undefined;
}>;
export type SyncEvent = z.infer<typeof SyncEventSchema>;
