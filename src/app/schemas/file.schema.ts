import { Schema } from 'dynamoose';

export interface FileKey {
  id: string;
}

export interface File extends FileKey {
  fileName: string;
  url: string;
  mimeType?: string;
  size?: number;
  businessInfoId: string;
  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const FileSchema = new Schema(
  {
    id: {
      type: String,
      hashKey: true,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: false,
    },
    size: {
      type: Number,
      required: false,
    },
    businessInfoId: {
      type: String,
      required: true,
      index: {
        type: 'global',
        name: 'businessInfo-index',
      },
    },
    uploadedBy: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);
