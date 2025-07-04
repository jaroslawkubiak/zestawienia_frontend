import { IBookmarkWidth } from './IBookmarksWidth';

export interface IBookmark {
  id: number;
  name: string;
  default?: boolean;
  width?: IBookmarkWidth[];
}
