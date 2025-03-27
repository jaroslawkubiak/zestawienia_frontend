export enum SetStatus {
  new = 'Nowe',
  inPreparation = 'W przygotowaniu',
  sended = 'Wysłane',
  readed = 'Odczytane',
  inProgress = 'W realizacji',
  archive = 'Zamknięte',
}

export type IStatus ={
  name: string;
  label: SetStatus;
}