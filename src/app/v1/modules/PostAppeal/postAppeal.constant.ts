export const POST_APPEAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const POST_APPEAL_SEARCHABLE_FIELDS = [
  'status',
  'message',
  'adminResponse',
];
