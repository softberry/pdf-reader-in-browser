import {
  ItemsProps,
  SimpeItemsObject,
  SimpleItemprops,
  CloumnStructure,
  ColumnAlignment,
} from "../@types/index.interface";

class MyPDFReader {
  // rows: SimpeItemsObject;
  readonly page: ItemsProps[];
  structure: CloumnStructure[];

  constructor(page: ItemsProps[]) {
    this.page = page;
    // this.rows = this.getRows();
    this.structure = this.getColumnStructure();

    console.log(this.rows);
    console.log(this.structure);
  }
  /**
   *
   * @param items ItemsProps[] Raw items from a single PDF page
   */
  get rows(): SimpeItemsObject {
    const rows: { [key: string]: SimpleItemprops[] } = {};

    const simpleItems = this.page.map(
      (item: ItemsProps): SimpleItemprops => {
        return { x: item.transform[4], y: item.transform[5], w: item.width, h: item.height, text: item.str };
      }
    );

    simpleItems.forEach(item => {
      if (rows[item.y.toString()] === undefined) {
        rows[item.y.toString()] = [];
      }
      rows[item.y.toString()].push(item);
    });

    Object.keys(rows).forEach(rowKey => {
      rows[rowKey] = this.joinWords(rows[rowKey]);
    });

    const sortedRows: { [key: string]: SimpleItemprops[] } = {};
    for (const item in rows) {
      sortedRows[item] = rows[item].sort((a, b) => (a.x < b.x ? -1 : 1));
    }

    return sortedRows;
  }
  joinWords(row: SimpleItemprops[]): SimpleItemprops[] {
    const cols: SimpleItemprops[] = [row[0]];

    row.forEach((b, i, arr): void => {
      if (i > 0) {
        const a = cols[cols.length - 1];
        const absDiff = Math.abs(a.x + a.w - b.x);
        absDiff <= 3 ? (cols[cols.length - 1] = { ...a, w: a.w + b.w, text: a.text + b.text }) : cols.push(b);
      }
    });
    return cols;
  }
  getColumnStructure(): CloumnStructure[] {
    const columStructureResult: CloumnStructure[] = [];
    Object.values(this.rows).forEach(rawTable => {
      rawTable.forEach(item => {
        //"".replace(/[0-9\.\,]/g,"")
        // is String?Links:Right
        item.text = item.text.trim();
        const structuredColumn: CloumnStructure = {
          alignment: item.text.replace(/[0-9\.\,]/g, "") === "" ? ColumnAlignment.RIGHT : ColumnAlignment.LEFT,
          x0: item.x,
          x1: item.x + item.w,
          y: item.y,
        };
        if (!this.doesColumnExist(columStructureResult, structuredColumn)) {
          columStructureResult.push(structuredColumn);
        }
      });
    });

    return columStructureResult;
  }
  protected doesColumnExist(structure: CloumnStructure[], item: CloumnStructure): boolean {
    const exists = structure.filter(col => {
      return (
        col.alignment === item.alignment &&
        ((item.alignment === ColumnAlignment.LEFT && col.x0 === item.x0) || col.x1 === item.x1)
      );
    });
    return exists.length > 0;
  }
}

export const init = (page: ItemsProps[]) => {
  return new MyPDFReader(page);
};
/*
matrix( scaleX(), skewY(), skewX(), scaleY(), translateX(), translateY() )

dir: "ltr"
fontName: "g_d0_f1"
height: 12.8017296
str: "The Garda Village"
transform: (6) [12.8017296, 0, 0, 12.8017296, 129.89015711477998, 754.59075745]
width: 109.13730518592001
*/
