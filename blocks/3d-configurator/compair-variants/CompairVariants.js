import React, { useState, useRef, useEffect } from "react";
import "./VideoComparison.css";

const CompairVariants = ({ cars, onClose }) => {
  const carKeys = Object.keys(cars); // Get car keys like "car1", "car2", etc.
  const [activeTabIndex, setActiveTabIndex] = useState(0); // Active tab index
  const [sliderValue, setSliderValue] = useState(0); // Current slider value
  const videoRefs = useRef([]); // Refs for videos

  // Get sorted feature videos based on displayOrder (assuming all cars have the same tabs)
  const featureVideos = cars[carKeys[0]].featureVideos.sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  // Update all videos' current time based on the slider
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) video.currentTime = sliderValue;
    });
  }, [sliderValue]);

  // Sync slider with the first video
  const syncSlider = () => {
    if (videoRefs.current[0]) {
      setSliderValue(videoRefs.current[0].currentTime);
    }
  };

  // Handle tab switching
  const handleTabClick = (index) => {
    setActiveTabIndex(index);
    setSliderValue(0);
    videoRefs.current.forEach((video) => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });
    videoRefs.current.forEach((video) => video?.play());
  };

  return (
    <div className="video-comparison">
      <button className="close-modal" onClick={onClose}>
        ✖
      </button>

      {/* Tabs */}
      <div className="tabs">
        {featureVideos?.map((video, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            className={activeTabIndex === index ? "active" : ""}
          >
            {video.name}
          </button>
        ))}
      </div>

      {/* Videos */}
      <div className="videos">
        {carKeys?.map((carKey, carIndex) => {
          const currentVideoUrl = cars[carKey].featureVideos[activeTabIndex].videoUrl._dmS7Url 
    || cars[carKey].featureVideos[activeTabIndex].videoUrl._publishUrl;

          return (
            <video
              key={carIndex}
              ref={(el) => (videoRefs.current[carIndex] = el)}
              src={currentVideoUrl}
              controls={false}
              muted
              playsinline
              autoplay="autoplay"
              onTimeUpdate={syncSlider}
            />
          );
        })}
      </div>

      {/* Slider */}
      <input
        type="range"
        min="0"
        max={videoRefs.current[0]?.duration || 100}
        value={sliderValue}
        onChange={(e) => setSliderValue(Number(e.target.value))}
      />

      {/* Controls */}
      <div className="controls">
        <button onClick={() => videoRefs.current.forEach((v) => v?.play())}>
          Play
        </button>
        <button onClick={() => videoRefs.current.forEach((v) => v?.pause())}>
          Pause
        </button>
      </div>
    </div>
  );
};




export default CompairVariants;
