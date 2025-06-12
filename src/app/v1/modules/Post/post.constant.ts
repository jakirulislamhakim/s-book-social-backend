export const POST_AUDIENCE = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  FRIENDS: 'friends',
} as const;

export const POST_STATUS = {
  ACTIVE: 'active',
  REMOVED: 'removed',
} as const;

export const POST_SEARCHABLE_FIELDS = ['content', 'location'];
