import mongoose, { Schema, Document } from 'mongoose';

export interface ISpiderNews extends Document {
  title: string;
  content: string;
  source: string;
  publishDate: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

const SpiderNewsSchema = new Schema<ISpiderNews>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    source: { type: String, required: true },
    publishDate: { type: String, required: true },
    url: { type: String, required: true }
  },
  { timestamps: true }
);

export const SpiderNewsModel = mongoose.model<ISpiderNews>('SpiderNews', SpiderNewsSchema);