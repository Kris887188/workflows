export const ENTRY_STATUSES = [
  { value: 'RAW', label: 'raw' },
  { value: 'PROCESSED', label: 'processed' },
  { value: 'SELECTED', label: 'selected' },
  { value: 'EDITED', label: 'edited' },
  { value: 'FINAL', label: 'final' }
] as const;

export const PRIVACY_LEVELS = [
  { value: 'PRIVATE', label: 'private' },
  { value: 'SENSITIVE', label: 'sensitive' },
  { value: 'READY_FOR_BOOK', label: 'ready for book' }
] as const;
