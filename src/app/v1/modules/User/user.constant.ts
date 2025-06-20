export const USER_ROLE = {
  ADMIN: 'admin',
  USER: 'user',
  SUPER_ADMIN: 'superAdmin',
} as const;

export const USER_STATUS = {
  ACTIVE: 'active',
  DEACTIVATED: 'deactivated',
  SOFT_DELETED: 'softDeleted',
  SUSPENDED: 'suspended',
  PERMANENT_DELETED: 'permanentDeleted',
} as const;

export const USER_SEARCHABLE_FIELDS = ['email', 'username', 'role', 'status'];

export const ADMIN_BADGE = 'https://i.ibb.co/NcYMQtB/admin.jpg' as const;
