import apiUtils from '../../utility/apiUtils.js';
import analytics from '../../utility/analytics.js';
import { getMetadata } from '../../commons/scripts/aem.js';
import utility from '../../utility/utility.js';

const Helper = {
  getCarInfo: async (variantPath) => {
    const details = await apiUtils.getCarDetailsByVariantPath(variantPath);
    const topVariant = details?.variants?.find((item) => item._path === variantPath);
    return {
      details,
      topVariant,
    };
  },
  initExterior: (block, totalImages, carInfo, dynamicMediaFolderUrl, shadesOfWhite) => {
    const getAssetNamePrefix = (path) => path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('_') + 1);
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const colors = carInfo?.details?.colors?.filter((item) => item.spinSetAssetPath)
      .map((item) => ({
        assetNamePrefix: getAssetNamePrefix(item.spinSetAssetPath._path),
        hexCode: item.hexCode,
        name: item.eColorDesc || '',
        colorCd: item.eColorCd,
        isDefault: item.isDefault,
        isAvailable: typeof carInfo?.topVariant?.colors?.find((c) => c.eColorCd === item.eColorCd) === 'object',
        images: [],
      }));

    if (colors.length === 0) {
      return {};
    }

    const colorsList = block.querySelector('.view360__colors-list');
    const canvas = block.querySelector('#view360-canvas-exterior');
    const context = canvas.getContext('2d');
    let currentColorIndex = 0;
    let currentImageIndex = 0;
    let startX;
    let isDragging = false;
    let lastMove = Date.now();
    const minMoveDelay = 16;

    const calcDrawDimensions = (imageDims, canvasDims) => {
      const imageAspectRatio = imageDims.width / imageDims.height;
      const canvasAspectRatio = canvasDims.width / canvasDims.height;

      let drawWidth;
      let drawHeight;
      if (imageAspectRatio > canvasAspectRatio) {
        drawWidth = canvasDims.width;
        drawHeight = canvasDims.width / imageAspectRatio;
      } else {
        drawHeight = canvasDims.height;
        drawWidth = canvasDims.height * imageAspectRatio;
      }
      const x = (canvasDims.width - drawWidth) / 2;
      const y = (canvasDims.height - drawHeight) / 2;
      return {
        x, y, width: drawWidth, height: drawHeight,
      };
    };

    const drawImage = (img) => {
      if (canvas.width === 0 || canvas.height === 0) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
      const dims = calcDrawDimensions(
        {
          width: img.width,
          height: img.height,
        },
        {
          width: canvas.width,
          height: canvas.height,
        },
      );
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, dims.x, dims.y, dims.width, dims.height);
    };

    const loadImage = (index, eager) => {
      const img = new Image();
      const paddedNumber = index.toString().padStart(2, '0');
      img.src = `${dynamicMediaFolderUrl}/${colors[currentColorIndex].assetNamePrefix}${paddedNumber}?fmt=png-alpha&bfc=on`;
      img.crossOrigin = 'anonymous';
      if (eager) {
        img.loading = 'eager';
      }
      img.onload = () => {
        if (index === currentImageIndex) {
          drawImage(img);
        }
      };
      return img;
    };

    const loadImages = () => {
      loadImage(currentImageIndex, true);
      for (let i = 0; i < totalImages; i += 1) {
        colors[currentColorIndex].images.push(loadImage(i));
      }
    };

    const updateImage = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      const img = colors[currentColorIndex].images[currentImageIndex];
      if (!img || !img.complete) {
        loadImage(currentImageIndex);
        let flag = false;
        for (let i = currentImageIndex; i < totalImages; i += 1) {
          if (colors[currentColorIndex].images[i]?.complete) {
            drawImage(colors[currentColorIndex].images[i]);
            flag = true;
            break;
          }
        }
        if (!flag) {
          for (let i = currentColorIndex; i >= 0; i -= 1) {
            if (colors[currentColorIndex].images[i]?.complete) {
              drawImage(colors[currentColorIndex].images[i]);
              break;
            }
          }
        }
      } else if (img.complete) {
        drawImage(img);
      }
    };

    const onMouseDown = (e) => {
      isDragging = true;
      startX = e.pageX;
    };

    const onMouseMove = (e) => {
      if (!isDragging || Date.now() - lastMove < minMoveDelay) return;

      const deltaX = e.pageX - startX;
      const imageIndexChange = Math.floor(deltaX / -10);

      if (imageIndexChange !== 0) {
        startX = e.pageX;
        const targetIndex = (currentImageIndex + imageIndexChange + totalImages) % totalImages;
        currentImageIndex = targetIndex;
        updateImage();
        lastMove = Date.now();
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchStart = (e) => {
      isDragging = true;
      startX = e.touches[0].pageX;
    };

    const onTouchMove = (e) => {
      if (!isDragging || Date.now() - lastMove < minMoveDelay) return;

      const deltaX = e.touches[0].pageX - startX;
      const imageIndexChange = Math.floor(deltaX / -10);

      if (imageIndexChange !== 0) {
        startX = e.touches[0].pageX;
        const targetIndex = (currentImageIndex + imageIndexChange + totalImages) % totalImages;
        currentImageIndex = targetIndex;
        updateImage();
        lastMove = Date.now();
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    canvas.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
    const modelName = getMetadata('car-model-name') || '';

    const whiteColors = shadesOfWhite?.split(',')?.map((color) => color.toUpperCase()) || [];
    const colorContainer = document.querySelector('.view360__colors-list');
    const containerRect = colorContainer.getBoundingClientRect();
    colors.forEach((color, index) => {
      const swatch = document.createElement('div');
      swatch.setAttribute('data-content', color.name);
      swatch.style.height = '32px';
      swatch.style.width = '32px';
      swatch.style.position = 'relative';
      if (color.isDefault === 'Yes') {
        currentColorIndex = index;
        swatch.classList.add('selected');
      }
      if (color.hexCode.length > 1) {
        const percent = 100 / color.hexCode.length;
        let gradients = '';
        color.hexCode.forEach((hexCode) => {
          gradients += `,${hexCode} ${percent}%`;
        });
        swatch.style.background = `linear-gradient(225deg${gradients})`;
        swatch.classList.add('view-color-box');
      } else if (color.hexCode.length === 1) {
        swatch.style.height = '32px';
        swatch.classList.add('view-color-box');
        swatch.style.background = `linear-gradient(to bottom, ${color.hexCode[0]} 100%, rgba(255, 255, 255, 0) 50%)`;
        if(whiteColors.includes(color.hexCode[0].toUpperCase())) {
          swatch.classList.add('view360__colors-white');
          const borderEl = document.createElement('span');
          swatch.appendChild(borderEl);
        }
      }
      const dataColorName = color.name?.trim()?.replaceAll(' ', '_') || '';
      swatch.addEventListener('click', () => {
        if (!swatch.classList.contains('visible') && !utility.isMobileDevice()) return; 
        block.querySelectorAll('.view360__colors-list .colorbox-start, .view360__colors-list .colorbox-center, .view360__colors-list .colorbox-end').forEach((el) => {
          el.classList.remove('colorbox-start');
          el.classList.remove('colorbox-center');
          el.classList.remove('colorbox-end');
        })
        Array.from(block.querySelector('.view360__colors-list').children).slice(visibleIndex, visibleIndex + 2).forEach((el) => {
          el.classList.add('colorbox-start');
        });
        Array.from(block.querySelector('.view360__colors-list').children).slice(visibleIndex + 2, visibleIndex + 4).forEach((el) => {
          el.classList.add('colorbox-center');
        });
        Array.from(block.querySelector('.view360__colors-list').children).slice(visibleIndex + 4, visibleIndex + 6).forEach((el) => {
          el.classList.add('colorbox-end');
        });
        
        currentColorIndex = index;
        block.querySelectorAll('.view360__colors-list div').forEach((el) => {
          el.classList.remove('selected');
        });
        swatch.classList.add('selected');
        if (color.isAvailable) {
          block.querySelector('.view360__not-available').classList.add('hidden');
        } else {
          block.querySelector('.view360__not-available').classList.remove('hidden');
        }
        const data = {};
        data.componentName = block.dataset.blockName;
        data.componentType = 'button';
        data.webName = `${modelName}:${dataColorName}`;
        data.linkType = 'other';
        data.carModelName = modelName;
        data.carColorName = dataColorName;
        analytics.setColorChangeDetails(data);
        loadImages();
      });
      colorsList.append(swatch);
    });

    const itemWidth = 32;
    const itemSpacing = isMobile ? 12 : 16;
    const maxVisibleItems = 6;
    const scrollAmount = itemWidth + itemSpacing;

    const arrowLeft = block.querySelector('.slide-left');
    const arrowRight = block.querySelector('.slide-right');
    const colorItems = Array.from(colorsList.children);
    let visibleIndex = 0;

      function updateColorSelector() {
        if (utility.isMobileDevice()) {
          return;
        }
        const colorBlocks = document.querySelectorAll('.view-color-box');
        colorBlocks.forEach((block) => {
        const blockRect = block.getBoundingClientRect();
        const isFullyVisible =
          blockRect.left >= containerRect.left - 10 && 
          blockRect.right <= containerRect.right - 10;
  
        if (isFullyVisible) {
          block.classList.add("visible");
        } else {
          block.classList.remove("visible");
        }
        });
      }
      updateColorSelector();

    function swapSelectedItem(direction) {
      const selectedItem = colorsList.querySelector('.selected');
      const selectedIndex = colorItems.indexOf(selectedItem);
      const swapIndex = direction === 'right' ? selectedIndex + 1 : selectedIndex - 1;

      if (swapIndex >= 0 && swapIndex < colorItems.length) {
        const itemToSwap = colorItems[swapIndex];

        if (direction === 'right') {
          colorsList.insertBefore(itemToSwap, selectedItem);
        } else {
          colorsList.insertBefore(selectedItem, itemToSwap);
        }

        colorItems.splice(selectedIndex, 1, itemToSwap);
        colorItems.splice(swapIndex, 1, selectedItem);
      }
    }

    function updateScroll() {
      const totalOffset = -visibleIndex * scrollAmount;

      colorItems.forEach((item) => {
        item.style.transform = `translateX(${totalOffset}px)`;
      });

      arrowLeft.classList.toggle('disabled', visibleIndex === 0);
      arrowRight.classList.toggle('disabled', visibleIndex + maxVisibleItems >= colorItems.length);
    }

    arrowRight.addEventListener('click', () => {
      if (visibleIndex + maxVisibleItems < colorItems.length) {
        visibleIndex += 1;
        swapSelectedItem('right');
        updateScroll();
        updateColorSelector();
      }
    });

    arrowLeft.addEventListener('click', () => {
      if (visibleIndex > 0) {
        visibleIndex -= 1;
        swapSelectedItem('left');
        updateScroll();
        updateColorSelector();
      }
    });

    updateScroll();

    loadImages();

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      loadImage(currentImageIndex);
    };
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      context.clearRect(0, 0, canvas.width, canvas.height);
      resizeTimeout = setTimeout(() => {
        resizeCanvas();
      }, 100);
    });
    requestAnimationFrame(() => {
      setTimeout(() => {
        resizeCanvas();
      }, 50);
    });
    let scrolled = false;
    window.addEventListener('scroll', () => {
      if (!scrolled) {
        scrolled = true;
        requestAnimationFrame(() => {
          setTimeout(() => {
            resizeCanvas();
          }, 50);
        });
      }
    });
    return { resizeCanvas };
  },

  initInterior: (block, cdnScriptPrefix, assetType, carInfo) => {
    const hideOverlay = () => {
      block.querySelector('.view360-loading-overlay')?.classList?.add('hidden');
    };
    const script = document.createElement('script');
    const model = carInfo.details.model3dCode;
    const variant = carInfo.topVariant.variant3dCode;
    if (assetType === '4K') {
      script.src = `${cdnScriptPrefix}one3d/project/${model}/player/one3d_functions.min.js`;
    } else if (assetType === 'HD') {
      script.src = `${cdnScriptPrefix}one3d/assets/${model}/one3d_functions.min.js`;
    }
    script.type = 'text/javascript';

    script.onload = () => {
      // eslint-disable-next-line no-undef
      ONE3D.init(
        'one3d',
        `${cdnScriptPrefix}one3d/`,
        model,
        variant,
        {
          showDefaultLoader: false,
          onProgress: (e) => {
            block.querySelector('.view360-progress-bar').style.background = `linear-gradient(125deg, #FFF ${e}%, #767879 0%)`;
            block.querySelector('.view360-progress-text').textContent = `${e}%`;
          },
          showTutorial: false,
          showFeatureHp: false,
        },
      ).then(() => {
        // eslint-disable-next-line no-undef
        ONE3D.interiorView().then(hideOverlay);
      })
        .catch(() => { });
    };
    document.head.appendChild(script);
  },
};

export default Helper;
