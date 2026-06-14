import { IsNotEmpty, IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({ example: 'user', enum: ['user', 'assistant', 'system'] })
  @IsNotEmpty()
  @IsString()
  role: string;

  @ApiProperty({ example: 'Why are sales down?' })
  @IsNotEmpty()
  @IsString()
  content: string;
}

export class ChatRequestDto {
  @ApiProperty({ example: 'Why are sales down?' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    type: [ChatMessageDto],
    required: false,
    example: [{ role: 'user', content: 'Hello' }, { role: 'assistant', content: 'Hi there! How can I help you manage the cafe today?' }]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];
}
