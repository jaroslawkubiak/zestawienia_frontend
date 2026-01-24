import { ITableColumnWidth } from "./ITableColumnWidth";

export interface IBookmarksWithTableColumns {
  id: number;
  name: string;
  default?: boolean;
  columnWidth?: ITableColumnWidth[];
}
