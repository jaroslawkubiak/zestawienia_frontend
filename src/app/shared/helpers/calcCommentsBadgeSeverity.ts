import { IUnreadComments } from '../../components/comments/types/IUnreadComments';
import { BadgeSeverity } from '../../components/sets/action-btns/types/badgeSeverity.type';

export function calcCommentsBadgeSeverity(
  newCommentsCount: IUnreadComments,
): BadgeSeverity {
  if (!newCommentsCount) return 'secondary';

  const { needsAttention, unread, all } = newCommentsCount;

  if (needsAttention > 0 || unread > 0) {
    return 'danger';
  } else if (all > 0) {
    return 'contrast';
  } else {
    return 'secondary';
  }
}
