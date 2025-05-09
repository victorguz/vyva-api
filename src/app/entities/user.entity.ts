import { Schema } from 'dynamoose';

export interface UserKey {
  id: string;
}

export interface User extends UserKey {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  status: boolean;
  documentType: string;
  documentNumber: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema(
  {
    id: {
      type: String,
      hashKey: true,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      index: {
        type: 'global',
        name: 'email-index',
      },
    },
    password: {
      type: String,
    },
    role: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
      required: true,
    },
    documentType: {
      type: String,
      required: false,
    },
    documentNumber: {
      type: String,
      required: false,
      index: {
        type: 'global',
        name: 'documentNumber-index',
      },
    },
    phone: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);
