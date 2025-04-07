export interface IPositionStatus {
  name: string;
  label: string;
  cssClass: string;
}
export const PositionStatusList: IPositionStatus[] = [
  {
    name: 'pink',
    label: 'Różowy',
    cssClass: 'row-pink',
  },
  {
    name: 'paid',
    label: 'Zapłacony',
    cssClass: 'row-green',
  },
  {
    name: 'inProgress',
    label: 'W trakcie wyceny',
    cssClass: 'row-red',
  },
];
