export class AuthMeResponseDto {
  id: string;
  displayId: string;
  userType: 'PLATFORM' | 'STAFF';
  name: string;
  /** Owners sign in with their email; staff with a username and may have no email. */
  email: string | null;
  username: string | null;
  contactNo: string | null;
  role: { id: string; slug: string; name: string } | null;
  business: { id: string; displayId: string; name: string } | null;
}
