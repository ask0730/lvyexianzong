import mongoose, { Schema, Document } from 'mongoose';

export interface INews extends Document {
  title: string;
  content: string;
  source: string;
  publishDate: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INews>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  source: { type: String, required: true },
  publishDate: { type: String, required: true },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

NewsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const NewsModel = mongoose.model<INews>('News', NewsSchema);