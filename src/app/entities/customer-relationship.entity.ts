import { Schema } from 'dynamoose';

export interface CustomerKey {
  id: string;
}

export interface Customer extends CustomerKey {
  businessInfoId: string;
  customerUserId: string;
  status: boolean;
  notes?: string;
  metadata?: any;
  // Contact info fields
  fullName: string;
  email: string;
  phone?: string;
  documentType?: string;
  documentNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const CustomerSchema = new Schema(
  {
    id: {
      type: String,
      hashKey: true,
      required: true,
    },
    businessInfoId: {
      type: String,
      required: true,
      index: {
        type: 'global',
        name: 'businessInfoId-index',
      },
    },
    customerUserId: {
      type: String,
      required: true,
      index: {
        type: 'global',
        name: 'customerUserId-index',
      },
    },
    status: {
      type: Boolean,
      default: true,
      required: true,
    },
    // Contact info fields
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: false,
    },
    documentType: {
      type: String,
      required: false,
    },
    documentNumber: {
      type: String,
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
    metadata: {
      type: Object,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);
