import { Schema } from 'dynamoose';

export enum IntegrationType {
  GOOGLE_CALENDAR = 'google_calendar',
  // Add more integration types here as needed
}

export interface IntegrationKey {
  id?: string;
}

export interface Integration extends IntegrationKey {
  id: string;
  type: IntegrationType;
  userId: string; // User who owns this integration
  businessInfoId: string; // Business this integration belongs to
  data: string; // Encrypted JSON string containing integration-specific data
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const IntegrationSchema = new Schema(
  {
    id: {
      type: String,
      hashKey: true,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(IntegrationType),
      index: {
        type: 'global',
        name: 'type-index',
      },
    },
    userId: {
      type: String,
      required: true,
      index: {
        type: 'global',
        name: 'user-index',
      },
    },
    businessInfoId: {
      type: String,
      required: true,
      index: {
        type: 'global',
        name: 'businessInfo-index',
      },
    },
    data: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

