export interface INewComment {
  comment: string;
  authorType: 'client' | 'user';
  authorId: number;
  authorName: string;
  positionId: number;
  setId: number;
}
