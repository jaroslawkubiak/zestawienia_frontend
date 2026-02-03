import { IUnreadComments } from '../../components/comments/types/IUnreadComments';

export function countCommentsBadgeValue(
  newCommentsCount: IUnreadComments,
): number {
  if (!newCommentsCount) return 0;

  const { needsAttention, unread, all } = newCommentsCount;

  if (needsAttention > 0 && unread > 0) {
    return needsAttention + unread;
  }

  return needsAttention > 0 ? needsAttention : unread > 0 ? unread : all;
}
