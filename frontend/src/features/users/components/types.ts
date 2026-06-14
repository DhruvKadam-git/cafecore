export type UserRole   = "Admin" | "Employee";
export type UserStatus = "Active" | "Archived";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;
  avatarColor: string; // hex for letter avatar bg
}
