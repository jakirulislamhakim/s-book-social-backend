export const NOTIFICATION_ACTION = {
  REACTED: 'reacted',
  COMMENTED: 'commented',
  STORY_EXPIRED: 'storyExpired',
  REPLIED: 'replied',
  MENTIONED: 'mentioned',
  FRIEND_REQUEST: 'friendRequest',
  FRIEND_REQUEST_ACCEPTED: 'friendRequestAccepted',
  MESSAGE: 'message',
  TAGGED: 'tagged',
  POST_REMOVED: 'postRemoved',
  POST_APPEAL: 'postAppeal',
  SYSTEM_ALERT: 'systemAlert',
  SYSTEM_INFO: 'systemInfo',
} as const;

export const NOTIFICATION_TARGET_TYPE = {
  POST: 'post',
  STORY: 'story',
  COMMENT: 'comment',
  REPLY: 'reply',
  MESSAGE: 'message',
  FRIEND: 'friend',
  USER: 'user',
  SYSTEM: 'system',
  SECURITY: 'security',
} as const;

export const NOTIFICATION_URL_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;
