import { IPositionStatus } from '../types/IPositionStatus';

export const PositionStatusList: IPositionStatus[] = [
  {
    name: 'duringValuation',
    label: 'W trakcie wyceny',
    cssClass: 'row-pink',
    color: '--status-pink-color',
    summary: false,
  },
  {
    name: 'substitute',
    label: 'Zamiennik',
    cssClass: 'row-yellow',
    color: '--status-yellow-color',
    summary: false,
  },
  {
    name: 'accepted',
    label: 'Produkt zaakceptowany',
    cssClass: 'row-lightgreen',
    color: '--status-lightgreen-color',
    summary: true,
  },
  {
    name: 'notBought',
    label: 'Produkt niezakupiony',
    cssClass: 'row-red',
    color: '--status-red-color',
    summary: true,
  },
  {
    name: 'bought',
    label: 'Produkt zakupiony',
    cssClass: 'row-green',
    color: '--status-green-color',
    summary: true,
  },
];
