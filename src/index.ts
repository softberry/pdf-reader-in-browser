import {
  ItemsProps,
  SimpeItemsObject,
  SimpleItemProps,
  CloumnStructure,
  ColumnAlignment,
} from "../@types/index.interface";

interface IResultsTable {
  header: IResultsTableHeader;
  data: IResultsTableData[];
}
interface IResultsTableHeader {
  id: string;
  date: string;
  version: string;
  company: string;
  pageTitle: string;
  page: string;
  subTitle: string;
}
interface IResultsTableData {
  [key: string]: string;
}

interface ITitleRowProps {
  text: string;
  min: number;
  max: number;
}
class MyPDFReader {
  // rows: SimpeItemsObject;
  private _page: ItemsProps[];
  private _structure: CloumnStructure[];

  result: IResultsTable;

  constructor(page: ItemsProps[]) {
    this._page = page;
    this._structure = this.getColumnStructure();

    this.result = {
      header: {
        id: this.rows[0][0].text,
        date: this.rows[0][1].text,
        version: this.rows[1][0].text,
        company: this.rows[11][0].text,
        pageTitle: this.rows[11][1].text,
        page: this.rows[11][2].text,
        subTitle: this.rows[21][0].text,
      },
      data: this.data,
    };
    console.log(this.result);
    console.log(this.titleRow);
    console.log(this.rows);
    // console.log(this.structure);
    // console.log(this.convert());
  }
  get structure(): CloumnStructure[] {
    return this._structure;
  }
  get page(): ItemsProps[] {
    return this._page;
  }
  /**
   *
   * @param items ItemsProps[] Raw items from a single PDF page
   */
  get rows(): SimpeItemsObject {
    const rows: { [key: string]: SimpleItemProps[] } = {};

    const simpleItems = this.page.map(
      (item: ItemsProps): SimpleItemProps => {
        return {
          x: Number(item.transform[4].toFixed(6)),
          y: Number(item.transform[5].toFixed(6)),
          w: Number(item.width.toFixed(6)),
          h: Number(item.height.toFixed(6)),
          text: item.str,
        };
      }
    );

    simpleItems.forEach(item => {
      const key = Math.floor(item.y).toString();
      if (rows[key] === undefined) {
        rows[key] = [];
      }

      rows[key].push({
        ...item,
        y: Math.floor(item.y),
      });
    });

    Object.keys(rows).forEach(rowKey => {
      rows[rowKey] = this.joinWords(rows[rowKey]);
    });

    const sortedRows: { [key: string]: SimpleItemProps[] } = {};
    for (const item in rows) {
      sortedRows[item] = rows[item].sort((a, b) => (a.x < b.x ? -1 : 1));
    }

    // Correct y-Axis-Values
    const correctionHeight = parseInt(Object.keys(rows).pop());
    const correctedRows: { [key: string]: SimpleItemProps[] } = {};
    Object.keys(rows).forEach(key => {
      correctedRows[`${correctionHeight - parseInt(key)}`] = rows[key].map(val => ({
        ...val,
        y: correctionHeight - parseInt(key),
      }));
    });

    return correctedRows;
  }

  get titleRow(): ITitleRowProps[] {
    const rows = this.rows;
    const titleRowKey = Object.keys(rows).find(key => {
      return rows[key][0].text === "Konto";
    });

    const t = [
      ...rows[titleRowKey],
      {
        ...rows[titleRowKey][rows[titleRowKey].length - 1],
        text: "x",
        x: rows[titleRowKey][rows[titleRowKey].length - 1].x + rows[titleRowKey][rows[titleRowKey].length - 1].w + 1,
        w: 20,
      },
    ];
    const titleInfo = t.map((item, i) => {
      const min = i === 0 ? 0 : item.x - 1;
      const max = i === t.length - 1 ? item.x + item.w : t[i + 1].x;
      return {
        text: item.text,
        min,
        max,
      };
    });

    return titleInfo;
  }

  getTitleForCell(cell: SimpleItemProps): string {
    const title = this.titleRow.find(item => {
      return item.min <= cell.x && item.max >= cell.x + cell.w;
    });
    return title && title.text ? title.text : "?";
  }

  get data(): IResultsTableData[] {
    const rows = this.rows;
    const result: IResultsTableData[] = [];
    const dataRows = Object.keys(rows)
      .map(key => {
        return rows[key];
      })
      .slice(6);

    dataRows.forEach(row => {
      const item: IResultsTableData = {};
      row.forEach(cell => {
        item[this.getTitleForCell(cell)] = cell.text;
      });

      result.push(item);
    });

    return result;
  }
  joinWords(row: SimpleItemProps[]): SimpleItemProps[] {
    const cols: SimpleItemProps[] = [row[0]];

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

  doesColumnExist(structure: CloumnStructure[], item: CloumnStructure): boolean {
    const exists = structure.filter(col => {
      return (
        col.alignment === item.alignment &&
        ((item.alignment === ColumnAlignment.LEFT && col.x0 === item.x0) || col.x1 === item.x1)
      );
    });
    return exists.length > 0;
  }

  convert() {
    const convertedData: any = {};
    Object.keys(this.rows).forEach((key: string) => {
      const row = this.rows[key];
      row.forEach(cell => {
        console.log(this.getTitleOfCell(cell, key), cell.text);
        const title = this.getTitleOfCell(cell, key);
        title
          ? Array.isArray(convertedData[title])
            ? convertedData[title].push(cell.text)
            : (convertedData[title] = [cell.text])
          : (convertedData[cell.text] = []);
      });
    });
    return convertedData;
  }
  getTitleOfCell(cell: SimpleItemProps, key: string) {
    const rowsBefore = Object.keys(this.rows).filter((chekKey: string) => parseInt(chekKey) < parseInt(key));
    let title;
    for (let t = 0; t < rowsBefore.length; t++) {
      if (title && title[0] && title[0].text) {
        return title[0].text;
      }
      title = this.rows[rowsBefore[t]].filter(subCell => {
        // console.log(subCell.x, cell.x, "- ", subCell.x + subCell.w, cell.x + cell.w);

        return Math.abs(subCell.x - cell.x) <= 1 || Math.abs(subCell.x + subCell.w - cell.x - cell.w) <= 1;
      });
    }
    return title && title[0] && title[0].text ? title[0].text : undefined;
  }
}

export const init = (page: ItemsProps[]) => {
  return new MyPDFReader(page);
};

const returndedJSON: any = {
  "78445/70008/2017": [],
  "Muster GmbH": [],
  Konto: [800, 1200, 1400, 1576, "..."],
  "800": {
    Beschriftung: "Gezeichnetes Kapital",
  },
  "Summe Klasse 0": {
    "EB-Wert": "0,00",
  },
};
