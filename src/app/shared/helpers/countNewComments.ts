import { TAuthorType } from '../../components/comments/types/authorType.type';
import { IComment } from '../../components/comments/types/IComment';

export function countNewComments(
  comments: IComment[],
  author: TAuthorType,
): number {
  return comments.filter(
    (c: IComment) => (!c.seenAt || c.needsAttention) && c.authorType === author,
  ).length;
}
