import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import Hashids from 'hashids';

const defaultSalt = process.env.HASH_ID_SALT || 'toko-cv-indomurah-default-salt';
const defaultMinLen = parseInt(process.env.HASH_ID_MIN_LENGTH || '8', 10);
const hashids = new Hashids(defaultSalt, defaultMinLen);

/**
 * @HashId('id') — parameter decorator that auto-decodes a hashed URL param to a real integer.
 *
 * Example:
 *   @Get(':id/detail')
 *   findOne(@HashId('id') id: number) { ... }
 */
export const HashId = createParamDecorator((paramName: string = 'id', ctx: ExecutionContext): number => {
  const req = ctx.switchToHttp().getRequest();
  const raw: string | undefined = req.params?.[paramName];
  if (!raw) {
    throw new BadRequestException(`Missing route parameter: ${paramName}`);
  }
  const decoded = hashids.decode(raw);
  if (!decoded.length) {
    throw new BadRequestException(`Invalid ID format for parameter: ${paramName}`);
  }
  return decoded[0] as number;
});
