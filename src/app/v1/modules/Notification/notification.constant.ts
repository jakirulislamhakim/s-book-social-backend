export const NOTIFICATION_ACTION = {
  REACTED: 'reacted',
  COMMENTED: 'commented',
  STORY_EXPIRED: 'story_expired',
  REPLIED: 'replied',
  MENTIONED: 'mentioned',
  FRIEND_REQUEST: 'friend_request',
  FRIEND_REQUEST_ACCEPTED: 'friend_request_accepted',
  MESSAGE: 'message',
  TAGGED: 'tagged',
  POST_REMOVED: 'post_removed',
  POST_APPEAL: 'post_appeal',
  SYSTEM_ALERT: 'system_alert',
  SYSTEM_INFO: 'system_info',
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
