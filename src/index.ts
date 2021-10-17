import { MyPDFReader } from "./lib";
import { ItemsProps } from "./types";

const table = () => document.createElement("table");
const tr = () => document.createElement("tr");
const th = () => document.createElement("th");
const td = () => document.createElement("td");
export const init = (page: ItemsProps[]): void => {
  const myPDFReader = new MyPDFReader(page);

  const doc = table();
  const title = tr();

  myPDFReader.titleRow
    .map(t => {
      const _td = th();
      _td.innerText = t.text;
      return _td;
    })
    .forEach(txt => title.appendChild(txt));
  doc.appendChild(title);
  document.body.appendChild(doc);
  myPDFReader.data.map(el => {
    const contentRow = tr();
    myPDFReader.titleRow
      .map(t => {
        const contentCell = td();
        const cellText = el[t.text] || " ";
        contentCell.innerText = cellText;
        return contentCell;
      })
      .forEach(l => contentRow.appendChild(l));
    doc.appendChild(contentRow);
  });
};
