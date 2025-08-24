import { User } from 'src/app/schemas/user.schema';

export interface AuthRequest {
  username: string;
  pass: string;
}

export interface UserResponse extends Omit<User, 'password'> {}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}
