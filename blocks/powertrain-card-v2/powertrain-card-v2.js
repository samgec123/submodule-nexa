import utility from "../../utility/utility.js";
import { fetchPlaceholders } from "../../commons/scripts/aem.js";
import { moveInstrumentation } from "../../commons/scripts/scripts.js";
import analytics from "../../utility/analytics.js";
import '../../commons/scripts/splide/splide.js';

export default async function decorate(block) {
  const [
    idEl,
    titleEl,
    descriptionEl,
,,,,,,
 ...powertrainItemsContainer
  ] = block.children;

  block.classList.add('separator', 'separator-black', 'separator-sm');

  const { ariaLabelPrev, ariaLabelNext } = await fetchPlaceholders();

  const id = idEl?.querySelector("p")?.textContent || null;
  const { allFilterText } = await fetchPlaceholders();

  const title = titleEl?.querySelector(":is(h1,h2,h3,h4,h5,h6,p)") || "";
  if (title) title.classList.add("powertrain-card-v2-title");
  const description = descriptionEl?.children[0]?.innerHTML || "";

  let newContainerHTML = '<div class="powertrain-items-container">';

  powertrainItemsContainer.forEach((item) => {
    const [
      itemTitleEl,
      itemVariantsEl,
      itemDescriptionEl,
      itemImageContainer,
      altTextEl,
      itemDetailsEl,
    ] = item.children;
    const itemTitle =
      itemTitleEl?.querySelector(":is(h1,h2,h3,h4,h5,h6,p)") || "";
    itemTitle.classList.add("item-title");

    const itemVariants = itemVariantsEl?.children[0]?.innerHTML || "";

    const itemDescription = itemDescriptionEl?.children[0]?.innerHTML || "";

    const picture = itemImageContainer?.querySelector("picture");

    if (picture) {
      const img = picture.querySelector("img");
      img.removeAttribute("width");
      img.removeAttribute("height");
      const alt = altTextEl?.textContent?.trim() || "image";
      img.setAttribute("alt", alt);
    }
    const itemDetailsArray =
      itemDetailsEl?.textContent?.trim().split("\n") || []; // Adjust the delimiter as needed
    const itemDetailsList = itemDetailsArray
      .map((detail) => `<li>${detail.trim()}</li>`)
      .join("");

    const itemDetailsHTML = `<ul>${itemDetailsList}</ul>`;

    item.innerHTML = `
      <div class="powertrain-item">
        ${itemTitle.outerHTML || ""}
        <div class="powertrain-item-description" >${itemDescription}</div>
        <div class="img-list-container">
        <div class="powertrain-item-details" >${itemDetailsHTML}</div>
        <div class="powertrain-item-image">${
          picture ? picture.outerHTML : ""
        }</div>
        </div>
        
      </div>`;
    moveInstrumentation(item, item.firstElementChild);
    newContainerHTML += item.innerHTML;
  });

  newContainerHTML += "</div>";

  if (id) {
    block.setAttribute("id", id);
  }

  block.innerHTML = utility.sanitizeHtml(`
    <div class="powertrain-card-v2-list block">
      <div class="container">
        <div class="powertrain-card-v2-heading-container">
          <div class='powertrain-card-v2-list-header'>${
            title.outerHTML || ""
          }</div>
          <div class="powertrain-card-v2-list-description">${description}</div>
        </div>
        <div class="powertrain_wrapper">
        <div class="mobgradient"></div> 
        <div class="powertrain-card-v2-items">
          ${newContainerHTML}
        </div>
        </div>
        <div class="powertrain-card-v2-ctas-container">
          <div class="carousel-arrow_navigation-container">
            <div class="carousel-arrow_navigation">
              <button class="prev_arrow" aria-label= ${ariaLabelPrev}></button>
              <button class="next_arrow" aria-label= ${ariaLabelNext}></button>
            </div
          </div>
        </div>
      </div>
    </div>
  `);

  const isMobile = utility.isMobileDevice();
  const powerTrainContainer = block.querySelector(
    ".powertrain-items-container"
  );
  const nextBtn = block.querySelector(".next_arrow");
  const prevBtn = block.querySelector(".prev_arrow");
  const primaryBtn = block.querySelector(".primary-cta-container");
  let currentIndex = 0;
  const cardNumbers = 1;
  let blockNumbers = 0;
  let variantText = "";



function createCardsWrapper() {
  const powertrainItems = block.querySelectorAll(".powertrain-item");
  powerTrainContainer.innerHTML = "";
  for (let i = 0; i < powertrainItems.length; i++) {
    powerTrainContainer.innerHTML += powertrainItems[i].outerHTML;
    blockNumbers += 1;
  }
}

  function hideSelectedItem(powerItemContainer) {
    powerItemContainer.forEach((container) => {
      container.classList.remove("selected");
      container.querySelector(".powertrain-item-details").style.display =
        "none";
      container.querySelector(".powertrain-item-description").style.display =
        "none";
    });
  }

  function updateDesktopCards() {
    const powertrainItems = block.querySelectorAll(".powertrain-item");
    if (powertrainItems.length === 2) {
      powertrainItems[0]?.classList?.add("selected");
      powertrainItems[1]?.classList?.add("selected");
    } else {
      powertrainItems[0]?.classList?.add("selected");
    }
    powertrainItems.forEach((item) => {
      if (item.classList.contains("selected")) {
        item.querySelector(".powertrain-item-details").style.display = "none";
        item.querySelector(".powertrain-item-description").style.display =
          "block";
      } else {
        item.querySelector(".powertrain-item-details").style.display = "none";
        item.querySelector(".powertrain-item-description").style.display =
          "none";
      }
      item.addEventListener("click", (e) => {
        const powerItemContainer = e.target
          .closest(".cardsWrapper")
          .querySelectorAll(".powertrain-item");
        const powertrainItem = e.target.closest(".powertrain-item");
        hideSelectedItem(powerItemContainer);
        powertrainItem.classList.add("selected");
        powertrainItem.querySelector(".powertrain-item-details").style.display =
          "none";
        powertrainItem.querySelector(
          ".powertrain-item-description"
        ).style.display = "block";
      });
    });
  }

  function updateArrows() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === blockNumbers - 1;
  }


  function showItem(index) {
    currentIndex = index;
    const powertrainItems = block.querySelectorAll(".powertrain-item");
    powertrainItems.forEach((item, i) => {
      if (item.classList.contains("selected")) {
        item.classList.remove("selected");
        item.querySelector(".powertrain-item-details").style.display = "none";
        item.querySelector(".powertrain-item-description").style.display =
          "none";
      }
      if (cardNumbers * currentIndex === i) {
        const switchIndexContainer = item.querySelectorAll(".powertrain-item");
        item.classList.add("selected");
        item.querySelector(".powertrain-item-details").style.display = "block";
        item.querySelector(".powertrain-item-description").style.display =
          "block";
      }
    });
    updateArrows();
  }


  function nextSlide() {
    if (currentIndex < blockNumbers - 1) {
      showItem(currentIndex + 1);
      updateArrows();
    }
    const selectedIndex = Array.from(document.querySelectorAll('.powertrain-item')).findIndex(item => item.classList.contains('selected'));
    if (window.innerWidth > 768 && selectedIndex !== -1 && selectedIndex < document.querySelectorAll('.powertrain-item').length - 1) {
      document.querySelectorAll('.powertrain-item')[selectedIndex + 1].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }
  
  function prevSlide() {
    if (currentIndex > 0) {
      showItem(currentIndex - 1);
      updateArrows();
    }
    if (window.innerWidth > 768 && document.querySelectorAll('.powertrain-item')[1].classList.contains('selected')) {
      document.querySelectorAll('.powertrain-item')[0].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
      });
  }
  }


  nextBtn.addEventListener("click", nextSlide);
  prevBtn.addEventListener("click", prevSlide);

  function updateMobileArrows() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled =
      currentIndex === block.querySelectorAll(".powertrain-item").length - 1;
  }

  function updateMobileCards() {
    const powertrainItems = block.querySelectorAll(".powertrain-item");
    powertrainItems[0]?.classList?.add("selected");
    powertrainItems.forEach((item) => {
      if (item.classList.contains("selected")) {
        item.querySelector(".powertrain-item-description").style.display =
          "block";
      } else {
        item.querySelector(".powertrain-item-description").style.display =
          "none";
      }
    });
    updateMobileArrows();
  }

  function updateMobileCardsPosition(index) {
    const items = block.querySelectorAll(".powertrain-item");
    items.forEach((item, i) => {
        if (i === index) {
            item.style.transform = `translateX(-${index * 100}%)`;
            item.style.transition = 'transform 0.9s ease';
        } else {
            item.style.transform = 'translateX(0)';
            item.style.transition = 'transform 0.9s ease';
        }
    });
}
 

  function showMobileItem(index) {
    currentIndex = index;
    
    const powertrainItems = block.querySelectorAll(".powertrain-item");
    powertrainItems.forEach((item, i) => {
      if (item.classList.contains("selected")) {
        item.classList.remove("selected");
        item.querySelector(".powertrain-item-description").style.display =
          "none";
      }
      if (i === currentIndex) {
        item.classList.add("selected");
        item.querySelector(".powertrain-item-description").style.display =
          "block";
      }
    });
    updateMobileArrows();
    updateMobileCardsPosition();
    
  }

document.addEventListener('DOMContentLoaded', function() {
  checkPowertrainItem();
});

function checkPowertrainItem() {
  const powertrainItems = document.querySelectorAll('.powertrain-item');
  powertrainItems.forEach(item => {
      if (item.classList.contains('selected')) {
          item.style.display = 'block';
      } else {
          item.style.display = 'none';
      }
  });
}



  function nextMobileSlide() {
    if (currentIndex < block.querySelectorAll(".powertrain-item").length) {
      updateMobileCardsPosition(currentIndex);
      showMobileItem(currentIndex + 1);
    }
  }

  function prevMobileSlide() {
    if (currentIndex >= 0) {
      showMobileItem(currentIndex);
      updateMobileCardsPosition();
    }
  }

 
  if (isMobile) {
    block.querySelector(".carousel-arrow_navigation-container").style.display =
      "block";
    updateMobileCards();
    nextBtn.addEventListener("click", function(){
       nextMobileSlide();
       checkPowertrainItem();
      
      });
    prevBtn.addEventListener("click", function() {
      prevMobileSlide();
      checkPowertrainItem();

    });
  } else {
    const powertrainItems = block.querySelectorAll(".powertrain-item");
    if (powertrainItems.length > cardNumbers) {
      powerTrainContainer
        .closest(".powertrain-card-v2-list")
        .querySelector(".carousel-arrow_navigation-container").style.display =
        "flex";
      prevBtn.disabled = true;
    } else {
      powerTrainContainer
        .closest(".powertrain-card-v2-list")
        .querySelector(".carousel-arrow_navigation-container").style.display =
        "none";
    }
    createCardsWrapper();
    updateDesktopCards();
  }

  block.addEventListener("click", (e) => {
    const link = e.target?.closest("a");
    if (!link) {
      return;
    }
    const data = {};
    data.componentTitle =
      block.querySelector(".powertrain-card-v2-title")?.textContent?.trim() ||
      "";
    data.componentName = block.dataset.blockName;
    data.componentType = "button";
    data.webName = link.textContent?.trim() || "";
    data.linkType = link;
    analytics.setButtonDetails(data);
  });

  return block;
}
