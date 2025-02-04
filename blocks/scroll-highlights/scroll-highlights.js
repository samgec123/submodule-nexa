import { fetchPlaceholders } from '../../commons/scripts/aem.js';
import ImgLoader from './image-loader.js';
import Canvas from './canvas-helper.js';
import utility from '../../utility/utility.js';

export default async function decorate(block) {
  if (utility.isEditorMode(block)) {
    block.classList.add('scroll-highlights-editor-mode');
  }
  const [
    titleEl,
    descriptionEl,
    totalImagesEl,
    interiorNumberEl,
    skipToInteriorLabelEl,
    skipSectionLabelEl,
    scrollHeightEl,
    modelPathEl,
    idEl,
    ...highlightsEl
  ] = block.children;

  const { dynamicMediaFolderUrl } = await fetchPlaceholders();

  const title = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  title?.classList?.add('scroll-highlights-title');
  const description = descriptionEl?.firstElementChild?.innerHTML?.trim();
  const totalImages = parseInt(totalImagesEl?.textContent?.trim() || '0', 10);
  const modelPath = modelPathEl?.textContent?.trim() || '';
  const interiorNumber = parseInt(interiorNumberEl?.textContent?.trim() || '0', 10);
  const skipToInteriorLabel = skipToInteriorLabelEl?.textContent?.trim() || '';
  const skipSectionLabel = skipSectionLabelEl?.textContent?.trim() || '';
  const scrollHeight = parseInt(scrollHeightEl?.textContent?.trim() || '100', 10);
  const id = idEl?.textContent?.trim() || '';
  if (id) {
    block.setAttribute('id', id);
  }
  const highlights = highlightsEl?.map((item, index) => {
    const [highlightEl, startNumberEl, endNumberEl] = item.children;
    const startNumber = parseInt(startNumberEl?.textContent?.trim() || '0', 10);
    const endNumber = parseInt(endNumberEl?.textContent?.trim() || '0', 10);
    item.classList.add('scroll-sequence-highlight');
    if (endNumber > interiorNumber) {
      item.classList.add('scroll-sequence-highlight-interior');
    }
    item.innerHTML = `
      <div class="scroll-highlight-item-text speak speak-${index + 1} scroll-out${(endNumber > interiorNumber) ? ' interior' : ''}" data-start-number=${startNumber} data-end-number=${endNumber}>
        ${highlightEl?.innerHTML?.trim() || ''}
      </div>`;
    return {
      element: item,
      startNumber,
      endNumber,
    };
  }) ?? [];

  block.innerHTML = `
  <div class="scroll-container">
      <div class="scroll-sequence__container">
        <div class="scroll-sequence" id="scroll-sequence">
          <div class="scroll-sequence-overlay">
            <div class="speak-initial scroll-in">
              <div class="speak-initial-text">
                ${title.outerHTML}
                ${description}
              </div>
              <button class="skip-link skip-to-interior-initial">${skipToInteriorLabel}</button>
            </div>
            ${highlights.map((item) => item.element.outerHTML).join('')}
            <div class="scroll-sequence-actions">
            <button class="skip-link skip-to-interior">${skipToInteriorLabel}</button>
            <a href="#technology-block" class="skip-link skip-to-next-section">${skipSectionLabel}</a>
            </div>
          </div>
        </div>
        <div class="scroll-sequence-scroller">
        </div>
      </div>
    </div>
  `;

  if (utility.isEditorMode(block)) {
    block.querySelector('.scroll-sequence-scroller').style.height = `${768 * (highlights.length || 1)}px`;
  } else {
    block.querySelector('.scroll-sequence-scroller').style.height = `${scrollHeight}vh`;
  }

  const scrollSequenceImages = [];

  for (let i = 0; i < totalImages; i += 1) {
    scrollSequenceImages.push(`${i.toString().padStart(totalImages.toString().length, '0')}?fmt=png-alpha&bfc=on`);
  }

  const priorityFrames = [0, ...highlights.map((item) => item.startNumber), ...highlights.map((item) => item.endNumber)];
  const requestAnimationFrame = window.requestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame;
  class ScrollSequence {
    constructor(opts) {
      this.opts = {
        container: 'body',
        starts: 'out',
        ends: 'out',
        imagesRoot: '',
        cover: false,
        ...opts,
      };
      this.block = block;
      this.container = this.block.querySelector(opts.container);
      this.scrollWith = this.block.querySelector(opts.scrollWith);
      this.images = Array(opts.images.length);
      this.imagesToLoad = opts.images;
      this.priorityFrames = opts.priorityFrames;

      this.loader = new ImgLoader({
        imgsRef: this.images,
        images: this.imagesToLoad,
        imagesRoot: this.opts.imagesRoot,
        priorityFrames: this.priorityFrames,
      });

      this.canvas = new Canvas({
        block: this.block,
        container: this.container,
        images: this.images,
        cover: this.opts.cover,
      });

      const highlightsList = Array.from(this.block.querySelectorAll('.scroll-sequence-highlight'));
      this.highlights = highlightsList.map((item) => {
        const el = item.querySelector('.speak');
        const obj = {
          element: el,
          startNumber: parseInt(el.dataset.startNumber, 10),
          endNumber: parseInt(el.dataset.endNumber, 10),
          container: item,
        };
        return obj;
      });
      this.initalHighlight = this.block.querySelector('.speak-initial');
      this.skipToInteriorButton = this.block.querySelector('.skip-to-interior');
      this.skipToInteriorButtonInitial = this.block.querySelector('.skip-to-interior-initial');
      this.skipToNextSectionButton = this.block.querySelector('.skip-to-next-section');
      this.scrollOverlay = this.block.querySelector('.scroll-sequence-overlay');
      this.init();
    }

    init() {
      this.canvas.setup();
      this.loader.once('FIRST_IMAGE_LOADED', () => {
        this.canvas.renderIndex(0);
      });
      this.loader.once('PRIORITY_IMAGES_LOADED', () => {
        window.addEventListener('scroll', () => this.changeOnWindowScroll());
      });
      this.loader.once('IMAGES_LOADED', () => {
        this.canvas.resize();
      });
      this.highlights.forEach((highlight) => highlight.element.classList.add('scroll-out'));
      [this.skipToInteriorButtonInitial, this.skipToInteriorButton].forEach(btn => {
        btn.addEventListener('click', () => {
          const allocatedPx = ((this.scrollWith.clientHeight || this.scrollWith.offsetHeight) - this.container.clientHeight) / this.images.length;
          const step = 100 / (this.images.length - 1);
          let index = this.percentScrolled / step;
          const scrolledPx = index * allocatedPx;
          const firstInteriorHighlightNumber = parseInt(this.block.querySelector('.interior').dataset.startNumber, 10);
          const targetPx = (firstInteriorHighlightNumber * allocatedPx) - scrolledPx;
          const finalPx = (btn.classList.contains('skip-to-interior')) ? targetPx + (allocatedPx/2) : targetPx + allocatedPx;
          requestAnimationFrame(() => {
            window.scrollBy({
              left: 0,
              top: finalPx,
              behavior: 'smooth',
            });
          });
        });
      });
      this.skipToNextSectionButton.addEventListener('click', () => {
        this.block.parentElement.nextSibling.scrollIntoView({ behavior: 'smooth' });
      });
      let isFirstInterior = false;
      for (let i = 0; i < this.highlights.length; i += 1) {
        if (isFirstInterior) {
          this.secondInteriorHighlight = this.highlights[i];
          break;
        }
        isFirstInterior = this.highlights[i].startNumber > interiorNumber;
      }
    }

    refreshSkipButtons(imageNumber) {
      const toggleButton = (button, hide) => {
        button.style.opacity = (hide) ? '0' : '1';
        button.style.visibility = (hide) ? 'hidden' : 'visible';
      };
      if (imageNumber > 0 && imageNumber < interiorNumber) {
        console.log("in 1")
        toggleButton(this.skipToInteriorButton, false);
        toggleButton(this.skipToNextSectionButton, true);
      } else if (imageNumber >= interiorNumber && imageNumber >= this.secondInteriorHighlight?.startNumber) {
        console.log("in 2")
        toggleButton(this.skipToInteriorButton, true);
        toggleButton(this.skipToNextSectionButton, false);
      } else {
        console.log("in 3")
        toggleButton(this.skipToInteriorButton, true);
        toggleButton(this.skipToNextSectionButton, false);
      }
    }

    refreshHighlights(imageNumber) {
      const toggleScrollAnimation = (el, isScrollIn) => {
        if (isScrollIn) {
          el.classList.add('scroll-in');
          el.classList.remove('scroll-out');
        } else {
          el.classList.add('scroll-out');
          el.classList.remove('scroll-in');
        }
      };

      if (imageNumber > 0) {
        toggleScrollAnimation(this.initalHighlight, false);
      } else {
        toggleScrollAnimation(this.initalHighlight, true);
      }
      this.highlights.forEach((highlight) => {
        if (imageNumber > 0 && imageNumber >= highlight.startNumber && imageNumber <= highlight.endNumber) {
          toggleScrollAnimation(highlight.element, true);
          highlight.container.style.visibility = 'visible';
          highlight.container.style.opacity = '1';
          this.skipToInteriorButtonInitial.style.display = 'block'
        } else { 
          toggleScrollAnimation(highlight.element, false);
          highlight.container.style.visibility = 'hidden';
          highlight.container.style.opacity = '0';
          this.skipToInteriorButtonInitial.style.display = 'none'
        }
      });
    }

    changeOnWindowScroll() {
      const step = 100 / (this.images.length - 1);
      const percent = this.percentScrolled;
      const mapToIndex = Math.floor(percent / step);
      this.refreshHighlights(mapToIndex);
      this.refreshSkipButtons(mapToIndex);
      requestAnimationFrame(() => {
        this.canvas.renderIndex(mapToIndex);
      });
    }

    get percentScrolled() {
      const { starts, ends } = this.opts;
      const el = this.scrollWith;
      const doc = document.documentElement;
      const clientOffsety = doc.scrollTop || window.scrollY;
      const elementHeight = (el.clientHeight || el.offsetHeight) - this.container.clientHeight;
      const { clientHeight } = doc;
      let target = el;
      let offsetY = 0;
      do {
        offsetY += target.offsetTop;
        target = target.offsetParent;
      } while (target && target !== window);

      let u = clientOffsety - offsetY;
      let d = elementHeight + clientHeight;

      if (starts === 'out') u += clientHeight;
      if (ends === 'in') d -= clientHeight;
      if (starts === 'in') d -= clientHeight;

      const value = (u / d) * 100;
      let result = value;
      if (value > 100) {
        result = 100;
      } else if (value < 0) {
        result = 0;
      }
      return result;
    }
  }

  const initImages = async () => {
    const obj = await utility.getScrollHighlightsAssetPrefix(modelPath);
    let assetPrefix = obj.prefix;
    if (!assetPrefix) {
      return;
    }

    if (window.matchMedia('(width < 768px)').matches) {
      assetPrefix = obj.mobilePrefix || assetPrefix;
    }

    const scrollSequence = new ScrollSequence({
      block,
      container: '.scroll-sequence',
      scrollWith: '.scroll-sequence__container',
      images: scrollSequenceImages,
      imagesRoot: `${dynamicMediaFolderUrl}/${assetPrefix}`,
      priorityFrames,
      cover: true,
      playUntil: 'scroll-out',
      starts: 'in',
    });

    scrollSequence.loader.once('FIRST_IMAGE_LOADED', () => {
      setTimeout(() => {
        scrollSequence.canvas.resize();
        scrollSequence.canvas.renderIndex(0);
        scrollSequence.changeOnWindowScroll();
      }, 50);
    });

    const checkDimensions = () => {
      if (scrollSequence.canvas.container.clientHeight && scrollSequence.canvas.container.clientWidth) {
        scrollSequence.canvas.resize();
        scrollSequence.canvas.renderIndex(0);
        scrollSequence.changeOnWindowScroll();
      } else {
        requestAnimationFrame(checkDimensions);
      }
    };
    checkDimensions();
  };

  initImages();
}
