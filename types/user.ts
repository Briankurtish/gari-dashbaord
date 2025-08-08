export interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  avatar?: string | null;
}

export default User;
