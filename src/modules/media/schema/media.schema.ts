// src/common/schemas/media.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class MediaObject {
  @Prop({ required: false })
  url!: string;

  @Prop({ required: false })
  fileId!: string;

  @Prop({ default: 'image' })
  fileType!: string; // 'image', 'audio', dll
}

export const MediaObjectSchema = SchemaFactory.createForClass(MediaObject);