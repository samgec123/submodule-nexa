import { html } from '../../../commons/scripts/vendor/htm-preact.js';

import {
  useRef,
  useEffect,
  useState,
} from '../../../commons/scripts/vendor/preact-hooks.js';
import utility from '../../../utility/utility.js';
import {
  EditIcon,
  RotateIcon,
  BackArrow,
  VideoFullIcon,
  PlayIcon,
  PauseIcon,
} from '../Icons.js';
import VideoCarousle from './VideoCarousle.js';
import interaction from '../interaction.js';

const VideoCompare = ({
  compaireList,
  setCompaireList,
  allVarient,
  showVideoCompair,
  setShowVideoCompair,
  setOnMoreClick,
  rsLabel,
}) => {
  const [featureList, setFeatureList] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState('');
  const [showVarietChangeTab, setShowVarietChangeTab] = useState(false);
  const videoRefs = useRef([]);
  const [sliderValue, setSliderValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    let count = 0;
    let featureObj = null;
    for (let i = 0; i < compaireList.length; i++) {
      if (count === 0) {
        count = compaireList[i].featureVideos.length;
        featureObj = compaireList[i].featureVideos;
      } else if (count > compaireList[i].featureVideos.length) {
        count = compaireList[i].featureVideos.length;
        featureObj = compaireList[i].featureVideos;
      }
    }
    setFeatureList([...featureObj]);
    setSelectedFeature(featureObj[0]?.name);
  }, [compaireList]);

  const getVideoSrc = (list) => {
    const videoObj = list.find((feature) => feature.name === selectedFeature);
    if (videoObj && videoObj.videoUrl) {
      return videoObj.videoUrl._dmS7Url || videoObj.videoUrl._publishUrl;
    }
    console.error('Video object or URL not found');
    return null; // Handle cases where videoObj or videoUrl doesn't exist
  };
  const toggleOrientation = async () => {
    if (screen.orientation) {
      try {
        if (!isLandscape) {
          await screen.orientation.lock('landscape');
          setIsLandscape(true);
        } else {
          await screen.orientation.lock('portrait');
          setIsLandscape(false);
        }
      } catch (error) {
        console.error('Screen orientation lock failed:', error);
      }
    } else {
      console.warn('Screen Orientation API is not supported in this browser.');
    }
  };
  const handleChangeFeature = (event) => {
    const featureName = event.currentTarget.querySelector('.thumbnail-label')?.textContent;
    setSelectedFeature(featureName);
    setTimeout(() => {
      setIsPlaying(showVideoCompair);
      videoRefs.current.forEach((ref) => {
        videoRefs.currentTime = 0;
        ref.play();
      });
    }, 10);
  };
  const handleChangeVarient = (event) => {
    const varientName = event.currentTarget.textContent;
    const videoIndex = event.currentTarget.getAttribute('video-index');
    const varient = allVarient.find((varient) => varient.variantName === varientName);
    const newCompaireList = compaireList?.map((item, index) => {
      if (videoIndex === `video_${index}`) {
        return {
          ...varient,
        };
      }
      return item;
    });
    setCompaireList(newCompaireList);
    // event.currentTarget.parentElement.classList.add('hide');
  };
  const handleFullscreen = (event) => {
    setIsFullScreen((prev) => {
      const newState = !prev;
      const videoIndex = event.currentTarget.getAttribute('video-index').split('_');
      const clasName = `full-screen${videoIndex[1] + 1}`;
      if (newState) {
        event.target.closest('.video-compare-block').classList.add(clasName);
        event.target.closest('.video-compare-block').querySelectorAll('.video-block').forEach((block, index) => {
          if (index.toString() !== videoIndex[1]) {
            block.classList.add('hide');
          }
        });
      } else {
        event.target.closest('.video-compare-block').classList.remove(clasName);
        event.target.closest('.video-compare-block').querySelectorAll('.video-block').forEach((block, index) => {
          if (index.toString() !== videoIndex[1]) {
            block.classList.remove('hide');
          }
        });
      }
      return newState;
    });
  };
  const toggelvarientChangeTab = (event) => {
    const editVarient = event.currentTarget.querySelector('.edit-varient');
    editVarient.classList.toggle('hide');
  };
  useEffect(() => {
    let syncInterval;
    if (isPlaying) {
      syncInterval = setInterval(synchronizeVideos, 10); // Check every 50ms
    } else {
      clearInterval(syncInterval);
    }
    return () => clearInterval(syncInterval);
  }, [isPlaying]);
  const synchronizeVideos = () => {
    const leaderVideo = videoRefs.current[0];
    if (leaderVideo) {
      const { currentTime } = leaderVideo;
      videoRefs.current.forEach((ref, index) => {
        if (index > 0 && ref) {
          const delta = Math.abs(ref.currentTime - currentTime);

          if (delta > 0.05) {
            // Sync other videos only if they are significantly out of sync
            ref.currentTime = currentTime;
          }
        }
      });
      setSliderValue(currentTime); // Update slider value
    }
  };
  useEffect(() => {
    videoRefs.current[0].addEventListener('ended', syncended);
    return () => {
      videoRefs.current[0].removeEventListener('ended', syncended);
    };
  }, []);
  useEffect(() => {
    if (showVideoCompair) {
      setTimeout(() => {
        setIsPlaying(showVideoCompair);
        videoRefs.current.forEach((ref) => {
          ref.play();
        });
      }, 1000);
    }
  }, [showVideoCompair]);
  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
    videoRefs.current.forEach((ref) => {
      if (!isPlaying) {
        ref.play();
      } else {
        ref.pause();
      }
    });
  };

  useEffect(() => {
    if (videoRefs.current[0]) {
      videoRefs.current[0].onloadedmetadata = () => {
        setVideoDuration(videoRefs.current[0].duration);
      };
    }
  }, []);
  const handleSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    setSliderValue(value);
    videoRefs.current.forEach((ref) => {
      if (ref) {
        ref.currentTime = value;
      }
    });
  };
  const syncended = (e) => {
    setIsPlaying(false);
    setSliderValue(videoDuration);
    videoRefs.current.forEach((video) => {
      video.pause();
    });
  };

  return html`
      <div class="video-compare-container">
    <div class="title-nav-bar">
        <div class="back-arrow" onClick=${() => {
    setShowVideoCompair(false);
    setOnMoreClick(true);
  }
}>
           <${BackArrow} />
        </div>
        <h3>Variants Comparison</h3>
        ${utility.isMobileDevice() && html`<div class="rotate-icon" onClick=${toggleOrientation}>
       <${RotateIcon} />
        </div>`}
    </div>
    <div class="video-compare-block">
        <!-- video-block begins -->
        ${compaireList && compaireList?.map((varient, index) => html`
        <div class="video-block">
            <div class="varient-info">
                <div class="varient-name">
                    ${varient.variantName}
                    <div class="edit" onClick=${toggelvarientChangeTab}>
                        <div class="icon">
                         <${EditIcon} />
                        </div>
                       
                        <ul class="edit-varient hide">
                             ${allVarient && allVarient?.map((varient) => html`
                             <li video-index=video_${index} onClick=${handleChangeVarient}>${varient.variantName}</li>
                             `)}
                         
                        </ul>

                    </div>
                </div>
                <div class="varient-price">
                ${varient?.variantPrice ? `${rsLabel} ${interaction.formatDisplayPrice(varient.variantPrice)}` : ''}
                </div>
            </div>
            <div class="video-full-icon" video-index=video_${index} onClick=${handleFullscreen}>
               ${isFullScreen ? html`<${VideoFullIcon} />` : html`<${VideoFullIcon} />`}
                
            </div>
            <video playsinline 
            ref=${(el) => (videoRefs.current[index] = el)} 
            src=${getVideoSrc(varient.featureVideos)} muted />
        </div>
        `)}
    </div>
    <div class="video-control-block">
      <button onClick=${togglePlayPause}>
        ${isPlaying ? html`<${PauseIcon} />` : html`<${PlayIcon} />`}
        </button>
         <input
          type="range"
          min="0"
          max=${videoDuration}
          step="0.1"
          value=${sliderValue}
          onChange=${handleSliderChange}
        />
    </div>
    ${selectedFeature && featureList && html`<${VideoCarousle}
      selectedFeature=${selectedFeature}
      featureList=${featureList}
      handleChangeFeature=${handleChangeFeature}
    />`}
</div>
  `;
};

export default VideoCompare;
