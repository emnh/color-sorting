require('simplex-noise');

// Import stylesheets
import './style.css';

import SimplexNoise from 'simplex-noise';

const simplex = new SimplexNoise('seed');

// const value2d = simplex.noise2D(x, y);

function main() {
  const canvas = document.createElement('canvas');

  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');

  const w = 100;
  const h = 100;

  const ws = 0.005;
  const hs = 0.005;
  const ds = 0.5;
  //const ds = 1.0;

  canvas.width = w;
  canvas.height = h;

  const imageData = ctx.createImageData(w, h);

  const f = (x) => Math.min(255.0, Math.floor(x * 255.0));

  const noise3 = (x, y, z) =>
    (simplex.noise3D(x * ws, y * hs, z * ds) + 1.0) * 0.5;

  const f2 = (x, y) => Math.max(x, y);

  const colors = [];

  const maxi = w * h;
  for (let i = 0; i < maxi; i++) {
    colors.push([Math.random(), Math.random(), Math.random()]);
    // const r = i % 256;
    // const g = (i * 3) % 256;
    // const b = (i * 7) % 256;
    // colors.push([r, g, b]);
  }

  const seen = {};
  let last = w * h - 1;
  const frontier = [[w * 0.5, h * 0.5]];
  const colormap = {};
  colormap[frontier[0][0] + ',' + frontier[0][1]] = colors[0];

  const neighbours = [];
  const k = 1.0 + Math.floor(Math.random() * 5.0);

  for (let x = -k; x <= k; x++) {
    for (let y = -k; y <= k; y++) {
      if (x == 0 && y == 0) {
        continue;
      }
      if (Math.sqrt(x * x + y * y) > k) {
        continue;
      }
      const t = [x, y];
      neighbours.push(t);
    }
  }

  function shuffle(array) {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }

  for (let i = 0; i < frontier.length; i++) {
    const front = frontier[i];

    // console.log(front);
    const t = front[0] + ',' + front[1];
    // if (t in seen) continue;
    // seen[t] = true;

    if (last < 0) {
      break;
    }

    // const color = colormap[t];

    shuffle(neighbours);

    for (let nbi = 0; nbi < neighbours.length; nbi++) {
      const nb = neighbours[nbi];
      const x = front[0] + nb[0];
      const y = front[1] + nb[1];

      const t2 = x + ',' + y;
      if (!(0 <= x && x < w && 0 <= y && y <= h)) {
        continue;
      }
      const dx = x - 0.5 * w;
      const dy = y - 0.5 * h;
      if (Math.sqrt(dx * dx + dy * dy) >= 0.5 * w) {
        //Math.sqrt(0.25 * w * w + 0.25 * h * h)) {
        continue;
      }
      if (t2 in seen) {
        continue;
      }
      seen[t2] = true;

      const colorlist = [];
      for (let nbj = 0; nbj < neighbours.length; nbj++) {
        const t3 = x + neighbours[nbj][0] + ',' + (y + neighbours[nbj][1]);
        if (t3 in colormap) {
          colorlist.push(colormap[t3]);
        }
      }

      let mind = 100.0 * Math.sqrt(3);
      let mini = 0;
      for (let k = 0; k < last && k < 1000; k++) {
        const j = Math.floor(Math.random() * last);
        const nbcolor = colors[j];

        let d = 0;
        for (let m = 0; m < colorlist.length; m++) {
          const color = colorlist[m];
          const dx = nbcolor[0] - color[0];
          const dy = nbcolor[1] - color[1];
          const dz = nbcolor[2] - color[2];
          const dd = Math.sqrt(dx * dx + dy * dy + dz * dz);
          d += dd;
        }

        if (d < mind) {
          mini = j;
          mind = d;
        }
      }
      colormap[t2] = colors[mini];
      colors[mini] = colors[last];
      last--;
      if (last <= 0) {
        break;
      }

      frontier.push([x, y]);
    }
  }

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const idx = y * (w * 4) + x * 4;

      const t = x + ',' + y;
      const color = t in colormap ? colormap[t] : [0, 0, 0];

      let r = color[0];
      let g = color[1];
      let b = color[2];

      imageData.data[idx + 0] = f(r);
      imageData.data[idx + 1] = f(g);
      imageData.data[idx + 2] = f(b);
      imageData.data[idx + 3] = f(1);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

for (let n = 0; n < 49; n++) {
  main();
}
