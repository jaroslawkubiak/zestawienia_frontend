import { IUnreadComments } from '../../components/comments/types/IUnreadComments';
import { TBadgeSeverity } from '../../components/settings/types/badgeSeverity.type';

export function calcCommentsBadgeSeverity(
  newCommentsCount: IUnreadComments,
  theme: 'dark' | 'light' = 'dark',
): TBadgeSeverity {
  if (!newCommentsCount) {
    return theme === 'light' ? 'contrast' : 'secondary';
  }

  const { needsAttention, unread, all } = newCommentsCount;

  if (needsAttention > 0 || unread > 0) {
    return 'danger';
  }

  if (all > 0 && theme === 'dark') {
    return 'contrast';
  }

  return theme === 'light' ? 'secondary' : 'contrast';
}
