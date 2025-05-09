import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../dtos/auth.dto';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthUser => {
    const req: any = ctx.switchToHttp().getRequest<Request>();
    return req['user'];
  },
);
