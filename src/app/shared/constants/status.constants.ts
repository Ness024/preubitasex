// constants/status.constants.ts

export const STATUS_KEYS = {
  RECEIVED: 'received',
  IN_PROCESS: 'in_process',
  IN_SIGNING: 'in_signing',
  IN_SIGNED: 'in_signed',
  COMPLETED: 'completed',
  DELIVERED: 'delivered',
  ARCHIVED: 'archived',
  CANCELLED: 'cancelled'
} as const;

export type StatusKey = typeof STATUS_KEYS[keyof typeof STATUS_KEYS];
