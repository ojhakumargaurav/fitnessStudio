
// Defines the roles available for administrative accounts (Trainers, Admins, IT Admins)
export type AdminRoleString = 'trainer' | 'admin' | 'it_admin';

export const AdminRoles = {
  TRAINER: 'trainer' as AdminRoleString,
  ADMIN: 'admin' as AdminRoleString,
  IT_ADMIN: 'it_admin' as AdminRoleString,
};
