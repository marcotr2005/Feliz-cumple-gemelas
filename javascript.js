const SVG_NS = "http://www.w3.org/2000/svg";
const SVG_XLINK = "http://www.w3.org/1999/xlink";

const colors = [
  "#ba3763",
  "#d34076",
  "#dbb0cc",
  "#fddafa",
  "#fef2fe",
  "#eec0db",
  "#ca809a",
  "#e9d8e8"
];

const svg = document.getElementById("svg");

class Flower {
  constructor(n, pos, scale, parent) {
    this.n = n;
    this.scale = scale;
    this.pos = pos;
    this.width = 40;
    this.height = 40;
    this.color = colors[~~(Math.random() * colors.length)];
    this.parent = parent;
    this.markup();
  }

  markup() {
    this.G = document.createElementNS(SVG_NS, "g");
    this.G.setAttribute("style", `--scale:${this.scale};`);
    const rot = ~~(Math.random() * 180);
    this.G.setAttributeNS(
      null,
      "transform",
      `translate(${this.pos.x},${this.pos.y}) rotate(${rot})`
    );
    this.G.setAttributeNS(null, "fill", this.color);
    const ga = document.createElementNS(SVG_NS, "g");
    ga.setAttribute("class", "a");

    for (let i = 0; i < 2; i++) {
      const g = document.createElementNS(SVG_NS, "g");
      for (let j = 0; j < this.n; j++) {
        const use = document.createElementNS(SVG_NS, "use");
        use.setAttributeNS(SVG_XLINK, "xlink:href", `#petal${this.n}`);
        use.setAttributeNS(null, "width", this.width);
        use.setAttributeNS(null, "height", this.height);
        g.appendChild(use);
      }
      ga.appendChild(g);
    }
    this.G.appendChild(ga);
    this.parent.appendChild(this.G);
  }
}

function oMousePosSVG(e) {
  const p = svg.createSVGPoint();
  const pt = e.touches ? e.touches[0] : e;
  p.x = pt.clientX;
  p.y = pt.clientY;
  const ctm = svg.getScreenCTM().inverse();
  return p.matrixTransform(ctm);
}

function dist(p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

let drawing = false;
let lastPos = null;
let lastScale = 1;

function spawnFlowerAt(pos) {
  let n = 2 + ~~(Math.random() * 4);
  let scale = lastScale;
  if (lastPos) {
    const d = dist(pos, lastPos);
    scale = d / 30;
  }
  scale = Math.min(Math.max(scale, 0.3), 12);

  const flower = new Flower(n, { x: pos.x, y: pos.y }, scale, svg);
  setTimeout(() => flower.G.setAttribute("class", `_${flower.n}`), 50);

  lastPos = pos;
  lastScale = scale;
}

function clearAndDraw(pos) {
  while (svg.lastChild) svg.removeChild(svg.lastChild);
  lastPos = null;
  spawnFlowerAt(pos);
}

// Mouse
svg.addEventListener("mousedown", (e) => {
  drawing = true;
  clearAndDraw(oMousePosSVG(e));
});
svg.addEventListener("mouseup", () => {
  drawing = false;
  lastPos = null;
});
svg.addEventListener("mousemove", (e) => {
  if (drawing) spawnFlowerAt(oMousePosSVG(e));
});

// Touch
svg.addEventListener("touchstart", (e) => {
  e.preventDefault();
  drawing = true;
  clearAndDraw(oMousePosSVG(e));
}, { passive: false });
svg.addEventListener("touchend", () => {
  drawing = false;
  lastPos = null;
});
svg.addEventListener("touchmove", (e) => {
  if (!drawing) return;
  e.preventDefault()
  spawnFlowerAt(oMousePosSVG(e));
}, { passive: false });

function algorithmPoly(gon, R) {
  const points = [];
  for (let a = 0; a < 2 * Math.PI; a += 0.1) {
    const r =
      (R * Math.cos(Math.PI / gon)) /
      Math.cos(a % (2 * Math.PI / gon) - Math.PI / gon);
    points.push({
      x: 5000 + r * Math.cos(a),
      y: 5000 + r * Math.sin(a)
    });
  }
  return points;
}

let rid = null;
let autoFrame = 0;
const autoPoints = algorithmPoly(7, 2500);
const totalFrames = autoPoints.length;

setTimeout(() => {
  rid = window.requestAnimationFrame(animationLoop);
}, 120);

function animationLoop() {
  if (autoFrame >= totalFrames) {
    window.cancelAnimationFrame(rid);
    rid = null;
    return;
  }

  rid = window.requestAnimationFrame(animationLoop);

  for (let k = 0; k < 3; k++) {
    const m = autoPoints[autoFrame];
    const n = 2 + ~~(Math.random() * 4);
    const scale = ~~(Math.random() * 12) + 3;
    const flower = new Flower(n, { x: m.x, y: m.y }, scale, svg);
    setTimeout(() => flower.G.setAttribute("class", `_${flower.n}`), 50);
    autoFrame++;
    if (autoFrame >= totalFrames) break;
  }
}
