import EventEmitter from './event-emitter.js';

export default class ImgLoader extends EventEmitter {
  constructor(opts) {
    super();
    this.images = opts.imgsRef;
    this.imageNames = opts.images;
    this.imagesRoot = opts.imagesRoot;
    this.sequenceLength = opts.images.length;
    this.priorityFrames = opts.priorityFrames;
    this.complete = false;
    this.loadIndex = 0;

    this.priorityQueue = this.createPriorityQueue();
    this.loadingQueue = this.createLoadingQueue();

    this.loadNextImage();
  }

  loadImage(e) {
    if (this.images[e]) {
      this.loadNextImage();
    } else {
      const img = new Image();
      const onLoad = () => {
        img.removeEventListener('load', onLoad);
        this.images[e] = img;

        if (e === 0) {
          this.emit('FIRST_IMAGE_LOADED');
        }
        this.loadNextImage();
      };
      const onError = () => {
        img.removeEventListener('error', onError);
        this.loadNextImage();
      };
      img.addEventListener('load', onLoad);
      img.addEventListener('error', onError);
      img.src = (this.imagesRoot ? this.imagesRoot : '') + this.imageNames[e];
    }
  }

  loadNextImage() {
    if (this.priorityQueue.length) {
      this.loadImage(this.priorityQueue.shift());
      if (!this.priorityQueue.length) {
        this.emit('PRIORITY_IMAGES_LOADED');
      }
    } else if (this.loadingQueue.length) {
      this.loadImage(this.loadingQueue.shift());
    } else {
      this.complete = true;
      this.emit('IMAGES_LOADED');
    }
  }

  createPriorityQueue() {
    const p = this.priorityFrames || [];
    if (!p.length) {
      p.push(0);
      p.push(Math.round(this.sequenceLength / 2));
      p.push(this.sequenceLength - 1);
    }
    return p;
  }

  createLoadingQueue() {
    return this.imageNames
      .map((s, i) => i)
      .sort((e, n) => (
        Math.abs(e - this.sequenceLength / 2)
            - Math.abs(n - this.sequenceLength / 2)
      ));
  }
}
