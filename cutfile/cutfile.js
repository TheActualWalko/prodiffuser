const SVGmargin = 10;
const SVGgapWidth = 0;
const SVGgapLeftover = 20;

let width = 13, height = 12, minHz = 500, maxHz = 5000;

const getWavelengthMM = hz => (343 / (hz / 1000));

const computeDepths = (width, height, values, minHz) =>
  values.map(
    (v) =>
      (v * getWavelengthMM(minHz))
      /
      (
        (+width * +height + 1)
        *
        2
      )
  );

const getPolyline = (column, wellWidth, offset) => {
  let y = offset;
  let x = SVGmargin;
  const pairs = [[x,y]];
  column.forEach((h, i) => {
    y = offset + h + SVGmargin + SVGgapLeftover;
    pairs.push([x,y]);
    x += wellWidth;
    pairs.push([x,y]);
    if (i < column.length - 1) {
      y = offset + SVGgapLeftover;
      pairs.push([x,y]);
      x += SVGgapWidth;
      pairs.push([x,y]);
    }
  });
  pairs.push([x, offset]);
  pairs.push([SVGmargin, offset]);
  return `  <polyline
    stroke="#000000"
    stroke-width="1"
    fill="none"
    points="${pairs.map(p => p.map(Math.round).join(' ')).join(' ')}"
  ></polyline>`;
}

const getSVG = (columns) => {
  const polylines = [];
  let currentOffset = SVGmargin * 3;
  const wellWidth = getWavelengthMM(maxHz)/2;
  columns.forEach((c) => {
    currentOffset += SVGmargin;
    const maxDepth = Math.max.apply(Math, c);
    polylines.push(getPolyline(c.map(d => maxDepth - d), wellWidth, currentOffset));
    currentOffset += maxDepth;
    currentOffset += SVGmargin;
    currentOffset += SVGgapLeftover;
  });
  const svgContentWidth = (height * wellWidth) + ((height-1) * SVGgapWidth);
  const svgWidth = (SVGmargin * 2) + svgContentWidth;
  const svgHeight = currentOffset + SVGmargin;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${svgWidth}px" height="${currentOffset}px" viewBox="0 0 ${svgWidth} ${currentOffset}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<text id="test-text">
  <tspan x="${SVGmargin}" y="${SVGmargin * 2}">Frame Width: ${Math.round(svgContentWidth)}mm</tspan>
</text>
${polylines.join('\n')}
</svg>`;
};

let svg;

const update = () => {
  $("#preview").css("width", "auto");
  $("#preview").empty();
  const cellSize = Math.min(Math.floor($("#preview").width() / width) - 2, 40);
  $("#preview").css("width", cellSize * width);
  const depths = computeDepths(width, height, sequences[`${width},${height}`], minHz, 1);
  const maxDepth = Math.max.apply(Math, depths).toFixed(0);
  const maxDepthChars = (''+maxDepth).length;
  const columns = [];
  for (let x = 0; x < width; x ++) {
    columns.push([]);
  }
  for (let y = 0; y < height; y ++) {
    for (let x = 0; x < width; x ++) {
      const depth = depths[(y * width) + x];
      columns[x].push(depth);
      const strOut = depth.toFixed(0);
      let spaces = '';
      let numSpaces = 0;
      while (numSpaces + strOut.length < maxDepthChars + 2) {
        numSpaces ++;
        spaces += '&nbsp';
      }
      $("#preview").append(
        `<div style="
          width: ${cellSize}px;
          height: ${cellSize}px;
          background-color: rgba(0,0,0,${0.5*(1-(depth/maxDepth))});
        ">${strOut}${spaces}</div>`
      );
    }
    $("#preview").append('<br />');
  }
  svg = getSVG(columns);

  renderDiffuser(width, height, getWavelengthMM(maxHz)/2, depths);
};

$("#svg").click(() => {
  var blob = new Blob([svg], {type: 'image/svg+xml'});

  var dlink = document.createElement('a');
  dlink.download = `ProDiffuser ${width}x${height} ${minHz}Hz-${maxHz}Hz Cutfile.svg`;
  dlink.href = window.URL.createObjectURL(blob);
  dlink.onclick = function(e) {
    setTimeout(() => { window.URL.revokeObjectURL(this.href) }, 1500);
  };
  dlink.click();
  dlink.remove();
});

$("#minHz").change(() => {
  minHz = $("#minHz").val();
  update();
});

$("#maxHz").change(() => {
  maxHz = $("#maxHz").val();
  update();
});

Object.keys(sequences).forEach((k) => {
  const [w, h] = k.split(',');
  const button = $(`<button>${w} by ${h}</button>`);
  $("#buttons").append(button);
  if (w == width && h == height) {
    button.addClass('active');
  }
  button.click(() => {
    width = w;
    height = h;
    $("#buttons button").removeClass('active');
    button.addClass('active');
    update();
  });
});

update();