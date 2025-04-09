export interface IPositionStatus {
  name: string;
  label: string;
  cssClass: string;
  color: string;
}
export const PositionStatusList: IPositionStatus[] = [
  {
    name: 'pink',
    label: 'Różowy',
    cssClass: 'row-pink',
    color: '--status-pink-color',
  },
  {
    name: 'paid',
    label: 'Zapłacony',
    cssClass: 'row-green',
    color: '--status-green-color',
  },
  {
    name: 'inProgress',
    label: 'W trakcie wyceny',
    cssClass: 'row-red',
    color: '--status-red-color',
  },
];
