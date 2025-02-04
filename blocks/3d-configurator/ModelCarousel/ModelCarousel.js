import { html } from '../../../commons/scripts/vendor/htm-preact.js';
import {
  useState,
  useEffect,
  useRef,
} from '../../../commons/scripts/vendor/preact-hooks.js';
import apiUtils from '../../../utility/apiUtils.js';
import { fetchPlaceholders } from '../../../commons/scripts/aem.js';
import utility from '../../../utility/utility.js';

const { publishDomain, cfPrefix } = await fetchPlaceholders();
const ModelCarousel = ({ setNewCarousel }) => {
  const [modelsData, setModelsData] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const scrollContainer = useRef(null);
  const scrollDistance = scrollContainer?.current?.querySelectorAll('.model-card')[0]?.offsetWidth;

  useEffect(() => {
    const fetchModelData = async () => {
      const resp = await apiUtils.getConfiguratorCarList();
      setModelsData(resp);
    };

    fetchModelData();
  }, []);

  const next = () => {
    scrollContainer.current.scrollBy({ left: scrollDistance, behavior: 'smooth' });
  };

  const prev = () => {
    scrollContainer.current.scrollBy({ left: -scrollDistance, behavior: 'smooth' });
  };

  const onContinue = () => {
    // console.log(selectedModel)
    // console.log(cfPrefix)
    window.location.href = selectedModel?.configuratorPagePath?._path?.replace(cfPrefix, '');
  };

  return html`
    <div className="modal model-carousel__modal">
      <div className="popup-container">
        <button className="icon-button close-btn" onClick=${() => setNewCarousel(false)}></button>
        <div className="header">
          <h3 className="heading">Select your model</h3>
        </div>
        <div className="body" ref=${scrollContainer}>
          ${modelsData?.map(
    (model) => html`
                <div
                  className=${'model-card'}
                  onClick=${() => setSelectedModel(model)}
                >
                  <div
                    className=${`model-content ${
    selectedModel?.modelCd === model?.modelCd
      ? 'selected'
      : ''
  }`}
                  >
                    <div className="content">
                      <p className="model-name">${model?.altText}</p>
                      <p className="model-price">
                      ${selectedModel?.modelCd !== model?.modelCd || utility.isMobileView()
    ? html`<span class='rupeeLabel'>Rs.</span> <strong>${model?.price || '40,000'}</strong>`
    : html``}
                      </p>
                    </div>
                    <div className="image-container">
                      <img
                        src=${publishDomain}${model?.carImage?._dynamicUrl}
                        alt=${model?.altText}
                        className="model-image"
                      />
                    </div>
                    ${selectedModel?.modelCd === model?.modelCd && !utility.isMobileView()
                    && html`<p className="model-price">
                        <span class='rupeeLabel'>Rs.</span> <strong>${model?.price || '40,000'}</strong>
                       </p>`}
                  </div>
                  <button
                    className="continue-btn button button-primary"
                    onClick=${onContinue}
                  >
                    Continue
                  </button>
                </div>
              `,
  )}
        </div>
        <div className="footer">
          <button
            className="continue-btn button button-primary"
            onClick=${onContinue}
          >
            Continue
          </button>
          <div className="carousel-controls">
            <button className="icon-button prev-btn" onClick=${prev}></button>
            <button className="icon-button next-btn" onClick=${next}></button>
          </div>
        </div>
      </div>
    </div>
  `;
};

export default ModelCarousel;
