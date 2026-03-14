export type ContentType = 'set' | 'avatar';

export const CONTENT_TOGGLE: Record<ContentType, ContentType> = {
  set: 'avatar',
  avatar: 'set',
};
