import { Schema } from 'dynamoose';

export interface DomainKey {
  id: string;
}

export interface Domain extends DomainKey {
  businessInfoId: string;
  name: string;
  group?: string;
  value?: string;
  description?: string;
  isActive?: boolean;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

export const DomainSchema = new Schema(
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
        name: 'domain-businessinfoid-index',
      },
    },
    name: {
      type: String,
      required: true,
    },
    group: {
      type: String,
      required: false,
      index: {
        type: 'global',
        name: 'domain-group-index',
      },
    },
    value: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      required: false,
      default: true,
    },
    order: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

