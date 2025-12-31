"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncEventSchema = exports.SyncActionSchema = void 0;
const zod_1 = require("zod");
exports.SyncActionSchema = zod_1.z.enum(["create", "update", "delete"]);
exports.SyncEventSchema = zod_1.z.object({
    eventId: zod_1.z.string().uuid(), // idempotency key
    deviceId: zod_1.z.string().min(1),
    entityType: zod_1.z.enum(["lead", "visit", "deal", "work_session", "media"]),
    entityLocalId: zod_1.z.string().uuid(),
    action: exports.SyncActionSchema,
    dependsOnEventId: zod_1.z.string().uuid().optional(),
    payload: zod_1.z.record(zod_1.z.any()),
    createdAt: zod_1.z.string()
});
