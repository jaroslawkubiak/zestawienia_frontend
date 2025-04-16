export interface INewComment {
  comment: string;
  authorType: 'client' | 'user';
  authorId: number;
  positionId: number;
  setId: number;
}
