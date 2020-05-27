interface ItemsProps {
  dir: string;
  fontName: string;
  height: number;
  width: number;
  str: string;
  transform: [number, number, number, number, number, number];
}

interface SimpleItemprops {
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
}

function writeAt(item: SimpleItemprops) {
  const d = document.createElement("div");
  d.style.position = "absolute";
  d.style.left = item.x + "px";
  d.style.top = 560 - item.y + "px";
  d.style.width = item.w + "px";
  d.style.fontSize = "8px";
  d.style.backgroundColor = "#cccccc";
  d.innerText = item.text;
  document.getElementById("doc").appendChild(d);
}
export const getRows = (items: ItemsProps[]): { [key: string]: SimpleItemprops[] } => {
  const rows: { [key: string]: SimpleItemprops[] } = {};
  const simpleItems = items.map(
    (item: ItemsProps): SimpleItemprops => {
      return { x: item.transform[4], y: item.transform[5], w: item.width, h: item.height, text: item.str };
    }
  );
  simpleItems.forEach(i => writeAt(i));

  simpleItems.forEach(item => {
    if (rows[item.y.toString()] === undefined) {
      rows[item.y.toString()] = [];
    }
    rows[item.y.toString()].push(item);
  });

  const sortedRows: { [key: string]: SimpleItemprops[] } = {};
  for (const item in rows) {
    sortedRows[item] = rows[item].sort((a, b) => (a.x < b.x ? -1 : 1));
  }

  const rowText: { [key: string]: string } = {};
  for (const item in sortedRows) {
    rowText[item] = sortedRows[item]
      .map((a, i) => {
        if (i === 0) return a.text;
        const currentItem = a;
        const prevItem = sortedRows[item][i - 1];

        return Math.abs(prevItem.x + prevItem.w - currentItem.x) > 1 ? " </td><td> " + a.text : a.text;
      })
      .join("");
  }

  document.getElementById("doc").innerHTML=`<table border="1">
  ${Object.values(rowText).map(m=>`<tr><td>${m}</td></tr>`)}
  </table>`  
  console.log(rowText);
  return rows;
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
