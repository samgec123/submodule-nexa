import { loadScript, loadCSS } from '../../commons/scripts/aem.js';

const VIDEO_JS_SCRIPT = '/blocks/brand-film-carousel/videojs/video.min.js';
const VIDEO_JS_CSS = '/blocks/brand-film-carousel/videojs/video-js.min.css';
const VIDEO_JS_LOAD_EVENT = 'videojs-loaded';

const getVideojsScripts = (publishDomain) => ({
  scriptTag: document.querySelector(`head > script[src="${publishDomain}${VIDEO_JS_SCRIPT}"]`),
  cssLink: document.querySelector(`head > link[href="${publishDomain}${VIDEO_JS_CSS}"]`),
});

export async function waitForVideoJs() {
  return new Promise((resolve) => {
    const { scriptTag, cssLink } = getVideojsScripts();
    const isJsLoaded = scriptTag?.dataset?.loaded;
    const isCSSLoaded = cssLink?.dataset?.loaded;
    if (isJsLoaded && isCSSLoaded) {
      resolve();
    }

    const successHandler = () => {
      document.removeEventListener(VIDEO_JS_LOAD_EVENT, successHandler);
      resolve();
    };

    document.addEventListener(VIDEO_JS_LOAD_EVENT, successHandler);
  });
}

export const loadVideoJs = async (publishDomain) => {
  const { scriptTag, cssLink } = getVideojsScripts(publishDomain);
  if (scriptTag && cssLink) {
    await waitForVideoJs();
    return;
  }

  await Promise.all([loadCSS(publishDomain + VIDEO_JS_CSS), loadScript(publishDomain + VIDEO_JS_SCRIPT)]);

  const { scriptTag: jsScript, cssLink: css } = getVideojsScripts(publishDomain);
  jsScript.dataset.loaded = true;
  css.dataset.loaded = true;
  document.dispatchEvent(new Event(VIDEO_JS_LOAD_EVENT));
};
