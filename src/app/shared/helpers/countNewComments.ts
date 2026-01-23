import { IComment } from '../../components/comments/types/IComment';

export function countNewComments(
  comments: IComment[],
  author: 'user' | 'client',
): number {

  return comments.filter(
    (c: IComment) => (!c.seenAt || c.needsAttention) && c.authorType === author,
  ).length;
}
