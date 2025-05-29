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
  epaycoCustomerId?: string;
  typePerson?: string;
  gender?: string;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  address?: string;
  googleId?: string;
  data?: any;
  isVerified?: boolean;
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
    epaycoCustomerId: {
      type: String,
      required: false,
    },
    typePerson: {
      type: String,
      required: false,
      default: 'natural',
    },
    gender: {
      type: String,
      required: false,
    },
    dateOfBirth: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    googleId: {
      type: String,
      required: false,
    },
    data: {
      type: Object,
      required: false,
    },
    isVerified: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
