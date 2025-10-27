export interface AuthenticatedUser {
  id: string;
  email?: string;
  walletAddress: string;
  username: string;
  supabaseUser: Record<string, unknown>;
  accessToken: string;
  isInstructorRegistered: boolean;
  isInstructorApproved: boolean;
}
