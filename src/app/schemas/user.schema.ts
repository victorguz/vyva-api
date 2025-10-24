import { Schema } from 'dynamoose';

export interface UserKey {
  id: string;
}

export interface User extends UserKey {
  firstName: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: string;
  status?: boolean;
  documentType?: string;
  documentNumber?: string;
  phone?: string;
  epaycoCustomerId?: string;
  typePerson?: string;
  gender?: string;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  address?: string;
  googleId?: string;
  profilePicture?: string;
  businessInfoId: string;
  data?: any;
  isVerified?: boolean;
  apiKey: string;
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
      default: '',
    },
    email: {
      type: String,
      required: false,
      default: '',
      index: {
        type: 'global',
        name: 'email-index',
      },
    },
    password: {
      type: String,
      required: false,
      default: '',
    },
    role: {
      type: String,
      required: false,
      default: '',
    },
    status: {
      type: Boolean,
      default: true,
      required: false,
    },
    documentType: {
      type: String,
      required: false,
      default: '',
    },
    documentNumber: {
      type: String,
      required: false,
      default: '',
    },
    phone: {
      type: String,
      required: false,
      default: '',
    },
    epaycoCustomerId: {
      type: String,
      required: false,
      default: '',
    },
    apiKey: {
      type: String,
      required: true,
    },
    typePerson: {
      type: String,
      required: false,
      default: 'natural',
    },
    gender: {
      type: String,
      required: false,
      default: '',
    },
    dateOfBirth: {
      type: String,
      required: false,
      default: '',
    },
    country: {
      type: String,
      required: false,
      default: '',
    },
    city: {
      type: String,
      required: false,
      default: '',
    },
    address: {
      type: String,
      required: false,
      default: '',
    },
    googleId: {
      type: String,
      required: false,
      default: '',
    },
    profilePicture: {
      type: String,
      required: false,
      default: '',
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
