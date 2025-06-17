import { Schema } from 'dynamoose';

export interface BusinessInfoKey {
  id: string;
}

export interface BusinessInfo extends BusinessInfoKey {
  userId: string;
  name?: string;
  taxId?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  slug?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const BusinessInfoSchema = new Schema(
  {
    id: {
      type: String,
      hashKey: true,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: {
        type: 'global',
        name: 'userId-index',
      },
    },
    name: {
      type: String,
      required: false,
    },
    taxId: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    website: {
      type: String,
      required: false,
    },
    logo: {
      type: String,
      required: false,
    },
    slug: {
      type: String,
      required: false,
      index: {
        type: 'global',
        name: 'slug-index',
      },
    },
  },
  {
    timestamps: true,
  },
);
