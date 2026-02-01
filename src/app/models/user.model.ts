export interface User {
  id?: string;
  username: string;
  password: string; // hashed
  role: 'admin' | 'user';
  active: boolean;
  email?: string; // optional, for display
}