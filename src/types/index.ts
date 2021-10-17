export interface ItemsProps {
  dir: string;
  fontName: string;
  height: number;
  width: number;
  str: string;
  transform: [number, number, number, number, number, number];
}

export interface SimpleItemProps {
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
}
export interface SimpeItemsObject {
  [key: string]: SimpleItemProps[];
}
export interface CloumnStructure {
  alignment: ColumnAlignment;
  x0: number;
  x1: number;
  y: number;
}
export enum ColumnAlignment {
  LEFT,
  RIGHT,
}
export interface IResultsTable {
  header: IResultsTableHeader;
  data: IResultsTableData[];
}
export interface IResultsTableHeader {
  id: string;
  date: string;
  version: string;
  company: string;
  pageTitle: string;
  page: string;
  subTitle: string;
}
export interface IResultsTableData {
  [key: string]: string;
}

export interface ITitleRowProps {
  text: string;
  min: number;
  max: number;
}
