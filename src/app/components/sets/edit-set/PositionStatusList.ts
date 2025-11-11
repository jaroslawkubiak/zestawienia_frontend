import { IPositionStatus } from '../types/IPositionStatus';

export const PositionStatusList: IPositionStatus[] = [
  {
    name: 'duringValuation',
    label: 'W trakcie wyceny',
    cssClass: 'row-pink',
    color: '--status-pink-color',
    notSummary: true,
  },
  {
    name: 'substitute',
    label: 'Zamiennik',
    cssClass: 'row-yellow',
    color: '--status-yellow-color',
    notSummary: true,
  },
  {
    name: 'accepted',
    label: 'Produkt zaakceptowany',
    cssClass: 'row-lightgreen',
    color: '--status-lightgreen-color',
    notSummary: false,
  },
  {
    name: 'notBought',
    label: 'Produkt niezakupiony',
    cssClass: 'row-red',
    color: '--status-red-color',
    notSummary: false,
  },
  {
    name: 'bought',
    label: 'Produkt zakupiony',
    cssClass: 'row-green',
    color: '--status-green-color',
    notSummary: false,
  },
];
