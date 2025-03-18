export enum SetStatus {
  new = 'Nowe',
  inPreparation = 'W przygotowaniu',
  ready = 'Gotowe',
  readed = 'Odczytane',
  inProgress = 'W realizacji',
  archive = 'Zamknięte',
}

export type IStatus ={
  name: string;
  label: SetStatus;
}