import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import {
  useState,
  useEffect,
  useRef,
} from '../../../commons/scripts/vendor/preact-hooks.js';
import apiUtils from '../../../utility/apiUtils.js';

const Highlights = (props) => {
  const { setHighlightsView, selectedModel, selectedVariant } = props;

  const [highlightsData, setHighlightsData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const videoRefs = useRef([]);
  const playBtnRef = useRef();

  useEffect(() => {
    const fetchHighlights = async () => {
      const data = await apiUtils.getCarHighlights(selectedModel);
      setHighlightsData(data);
    };
    fetchHighlights();
  }, []);

  const hideHighlights = () => {
    const currentVideo = videoRefs.current[activeIndex];
    currentVideo?.pause();
    setHighlightsView(false);
    setIsVideoPlaying(false);
  };

  const previousSlide = () => {
    const currentVideo = videoRefs.current[activeIndex];
    currentVideo?.pause();

    setIsVideoPlaying(false);
    setActiveIndex((prev) => {
      const length = highlightsData?.length || 0;
      if (prev === 0) {
        return length > 0 ? length - 1 : 0;
      }
      return prev - 1;
    });
  };

  const nextSlide = () => {
    const currentVideo = videoRefs.current[activeIndex];
    currentVideo?.pause();

    setIsVideoPlaying(false);
    setActiveIndex((prev) => {
      const length = highlightsData?.length ?? 0;
      return prev === length - 1 ? 0 : prev + 1;
    });
  };

  const playActiveVideo = () => {
    const currentVideo = videoRefs.current[activeIndex];

    if (currentVideo?.paused) {
      currentVideo?.play();
      setIsVideoPlaying(true);
    } else {
      currentVideo?.pause();
      setIsVideoPlaying(false);
    }
  };

  const syncSlider = () => {
    const currentVideo = videoRefs.current[activeIndex];
    if (currentVideo) {
      setSliderValue(currentVideo.currentTime);
    }
  };

  const updateVideoProgress = (e) => {
    const { value } = e.target;
    const currentVideo = videoRefs.current[activeIndex];
    if (currentVideo) {
      currentVideo.currentTime = value;
    }
  };

  return html`<div className="highlights">
    <div className="header">
      <button
        class="back-button"
        type="button"
        onClick=${hideHighlights}
      ></button>
      <h3 class="variant-name">${selectedVariant?.variantName} Highlights</h3>
    </div>
    <div className="videos">
      <div className="video-controls-overlay">
        <button
          className=${`icon-button ${
    isVideoPlaying ? 'pause-btn' : 'play-btn'
  }`}
          onClick=${playActiveVideo}
          ref=${playBtnRef}
        ></button>
        <div className="progress-bar-container">
          <input
            type="range"
            min="0"
            max=${videoRefs.current[activeIndex]?.duration || 100}
            value=${sliderValue}
            onChange=${updateVideoProgress}
          />
        </div>
      </div>
      <div
        className="video-reel"
        style=${{ transform: `translateX(${-100 * activeIndex}%)` }}
      >
        ${highlightsData?.map((item, index) => html`
            <div className="video-container" key=${index}>
              <video
                className="highlight-video"
                ref=${(el) => {
    videoRefs.current[index] = el;
  }}
                src=${item?.hotspotVideoMobile?._dmS7Url || item?.hotspotVideoMobile?._publishUrl || ''}
                controls=${false}
                muted
                playsinline
                autoplay=${false}
                loop=${true}
                onTimeUpdate=${syncSlider}
              />
            </div>
          `)}
      </div>
    </div>
    <div className="footer">
      <div className="content">
        <h3 class="feature-name">
          ${highlightsData[activeIndex]?.hotspotTitle}
        </h3>
      </div>
      <div className="carousel-controls">
        <button
          class="icon-button prev-btn"
          type="button"
          onClick=${previousSlide}
        ></button>
        <div className="carousel-dots">
          ${highlightsData?.map(
    (_item, index) => html`
                <span
                  className="dot ${index === activeIndex
    ? 'active'
    : 'inactive'}"
                ></span>
              `,
  )}
        </div>
        <button
          className="icon-button next-btn"
          type="button"
          onClick=${nextSlide}
        ></button>
      </div>
    </div>
  </div>`;
};

export default Highlights;
