import { IPositionStatus } from './positions-table/types/IPositionStatus';
export const EMPTY_STATUS: IPositionStatus = {
  name: 'empty',
  label: '',
  cssClass: 'status-row-empty',
  color: '--status-empty-color',
  summary: true,
};

export const PositionStatusList: IPositionStatus[] = [
  {
    ...EMPTY_STATUS,
  },
  {
    name: 'duringValuation',
    label: 'W trakcie wyceny',
    cssClass: 'status-row-pink',
    color: '--status-pink-color',
    summary: false,
  },
  {
    name: 'substitute',
    label: 'Zamiennik',
    cssClass: 'status-row-yellow',
    color: '--status-yellow-color',
    summary: false,
  },
  {
    name: 'accepted',
    label: 'Produkt zaakceptowany',
    cssClass: 'status-row-lightgreen',
    color: '--status-lightgreen-color',
    summary: true,
  },
  {
    name: 'notBought',
    label: 'Produkt niezakupiony',
    cssClass: 'status-row-red',
    color: '--status-red-color',
    summary: true,
  },
  {
    name: 'bought',
    label: 'Produkt zakupiony',
    cssClass: 'status-row-green',
    color: '--status-green-color',
    summary: true,
  },
];
