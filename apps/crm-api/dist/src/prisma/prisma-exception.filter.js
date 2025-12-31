"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const library_1 = require("@prisma/client/runtime/library");
let PrismaExceptionFilter = class PrismaExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        let statusCode = common_1.HttpStatus.BAD_REQUEST;
        let message = 'Database error';
        switch (exception.code) {
            case 'P2002':
                statusCode = common_1.HttpStatus.CONFLICT;
                message = 'Unique constraint failed';
                break;
            case 'P2025':
                statusCode = common_1.HttpStatus.NOT_FOUND;
                message = 'Record not found';
                break;
            default:
                message = exception.message;
                break;
        }
        response.status(statusCode).json({
            statusCode,
            message,
            code: exception.code,
        });
    }
};
exports.PrismaExceptionFilter = PrismaExceptionFilter;
exports.PrismaExceptionFilter = PrismaExceptionFilter = __decorate([
    (0, common_1.Catch)(library_1.PrismaClientKnownRequestError)
], PrismaExceptionFilter);
//# sourceMappingURL=prisma-exception.filter.js.map