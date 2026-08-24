import { TAuthorType } from './authorType.type';

export interface INewComment {
  comment: string;
  authorType: TAuthorType;
  authorId: number;
  authorName: string;
  positionId: number | null;
  fileId: number | null;
  setId: number;
}
