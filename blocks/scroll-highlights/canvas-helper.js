export default class Canvas {
  constructor(e) {
    this.block = e.block;
    this.images = e.images;
    this.container = e.container;
    this.cover = e.cover;
    this.displayIndex = 0;
  }

  setup() {
    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    window.addEventListener('resize', () => this.resize());
    requestAnimationFrame(() => {
      this.canvas.height = this.block.querySelector('.scroll-sequence').offsetHeight;
      this.canvas.width = this.block.querySelector('.scroll-sequence').offsetWidth;
      this.renderIndex(0);
    });
  }

  renderIndex(e) {
    if (this.images[e]) {
      return this.drawImage(e);
    }
    // Find closest loaded image
    let backward = 0;
    for (let i = e; i >= 0; i -= 1) {
      if (this.images[i]) {
        backward = i;
        break;
      }
    }
    let forward = this.images.length;
    for (let i = e; i < this.images.length; i += 1) {
      if (this.images[i]) {
        forward = i;
        break;
      }
    }
    return this.images[backward] ? this.drawImage(backward) : this.images[forward] && this.drawImage(forward);
  }

  drawImage(e) {
    this.displayIndex = e;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const x = Math.floor(
      (this.canvas.width - this.images[this.displayIndex].naturalWidth)
      / 2,
    );
    const y = Math.floor(
      (this.canvas.height
        - this.images[this.displayIndex].naturalHeight)
      / 2,
    );
    if (this.cover) {
      this.drawImageCover(this.ctx, this.images[this.displayIndex]);
    } else {
      this.ctx.drawImage(this.images[this.displayIndex], x, y);
    }
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.canvas.style.height = `${h}px`;
    this.canvas.style.width = `${w}px`;
    this.canvas.height = h;
    this.canvas.width = w;

    this.renderIndex(this.displayIndex);
  }

  drawImageCover(ctx, img) {
    const x = 0;
    const y = 0;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const offsetX = 0.5;
    const offsetY = 0.5;

    const iw = img.width;
    const ih = img.height;
    const r = Math.min(w / iw, h / ih);
    let nw = iw * r; // new prop. width
    let nh = ih * r; // new prop. height
    let cx;
    let cy;
    let cw;
    let ch;
    let ar = 1;

    // decide which gap to fill
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
  }
}
