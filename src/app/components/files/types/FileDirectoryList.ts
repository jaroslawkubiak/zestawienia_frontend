export enum FileDirectoryList {
  moodboard = 'moodboard',
  model3d = 'model3d',
  drawings = 'rysunki',
  visualizations = 'wizualizacje',
  working = 'robocze',
}

export type IFileDirectoryList = {
  name: string;
  label: FileDirectoryList;
};
