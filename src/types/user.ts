
// Define string literal type for user status
export type UserStatusString = 'pending' | 'active';

// Define an object for easy access to status values, similar to an enum
export const UserStatus = {
  PENDING: 'pending' as UserStatusString,
  ACTIVE: 'active' as UserStatusString,
};
