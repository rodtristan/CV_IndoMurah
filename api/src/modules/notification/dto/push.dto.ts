import { IsNotEmpty, IsString, IsUrl, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PushKeysDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  p256dh: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  auth: string;
}

/** Bentuk sama dengan PushSubscription.toJSON() di browser (tanpa expirationTime). */
export class PushSubscribeDto {
  @ApiProperty({ description: 'Endpoint push service browser (https)' })
  @IsUrl({ protocols: ['https'], require_protocol: true, require_tld: false })
  @MaxLength(2000)
  endpoint: string;

  @ApiProperty({ type: PushKeysDto })
  @ValidateNested()
  @Type(() => PushKeysDto)
  keys: PushKeysDto;
}

export class PushUnsubscribeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  endpoint: string;
}
