import { IUnreadComments } from '../../components/comments/types/IUnreadComments';

export function calcCommentsBadgeTooltip(
  newCommentsCount: IUnreadComments,
): string {
  if (!newCommentsCount) return '';

  const { needsAttention, unread } = newCommentsCount;

  const tooltip =
    needsAttention > 0 || unread > 0
      ? 'Ilość nowych komentarzy'
      : 'Ilość komentarzy';

  return tooltip;
}
