export interface IWelcomeScreenUnread {
  positions: { unreadForPositions: number; needsAttentionForPositions: number };
  files: { unreadForFiles: number; needsAttentionForFiles: number };
}
