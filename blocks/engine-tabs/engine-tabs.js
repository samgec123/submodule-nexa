import HighlightUtils from "../../utility/highlightUtils.js";
import utility from "../../utility/utility.js";

export default function decorate(block) {
  if (utility.isEditorMode(block)) {
    block.classList.add("highlightItems-container-editor-mode");
  }
  const highlightItemButtons = {};
  const [idEl, clippingEl, themeTypeEl, titleEl, subtitleEl, separatorEl] =
    block.children;

  const id = utility.textContentChecker(idEl);
  const clipping = utility.textContentChecker(clippingEl);
  const themeType = utility.textContentChecker(themeTypeEl);

  const title = titleEl?.querySelector(":is(h1,h2,h3,h4,h5,h6)");
  title?.classList?.add("engine-tabs__title");
  const subtitle = utility.textContentChecker(subtitleEl);
  const separator = utility.textContentChecker(separatorEl);

  if (id) {
    block.setAttribute("id", id);
  }

  if (separator === "L") {
    block.classList.add("separator", "separator-grey", "separator-lg");
  } else {
    block.classList.add("separator", "separator-grey", "separator-sm");
  }

  function generateHighlightItemHTML(highlightItem, index) {
    const [
      imageEl,
      altTextEl,
      ,
      descriptionEl,
      descriptionExEl,
      expandDescriptionEl,
      collapseDescriptionEL,
    ] = highlightItem.children;

    const image = imageEl?.querySelector("picture");
    if (image) {
      const img = image.querySelector("img");
      img?.classList?.add("highlightItem-img");
      if (themeType === "variation1") {
        img?.classList?.add("zoom");
      }
      img?.removeAttribute("width");
      img?.removeAttribute("height");
      img?.removeAttribute("loading");
      const alt = altTextEl?.textContent?.trim() || "Image Description";
      img?.setAttribute("alt", alt);
    }

    if (descriptionEl) {
      descriptionEl.classList.add("more-content");
    }

    if (descriptionExEl) {
      descriptionExEl.classList.add("more-content-expanded");
      descriptionExEl.style.display = "none";
    }

    const expandDescription = utility.textContentChecker(expandDescriptionEl);
    const collapseDescription = utility.textContentChecker(
      collapseDescriptionEL
    );
    highlightItemButtons[index] = {
      expandBtn: expandDescription,
      collapseBtn: collapseDescription,
    };

    const newHTML = utility.sanitizeHtml(`
        ${image ? image.outerHTML : ""}
        <div class="highlightItem-content">
        <div class="highlightItem-content-wrp">
        <div class="highlightItem-content-inn">
         ${
           expandDescription
             ? `<a  class="read-more">${expandDescription}</a>`
             : ""
         }
          ${descriptionEl ? descriptionEl.outerHTML : ""}
          ${descriptionExEl ? descriptionExEl.outerHTML : ""}
         </div>
        </div>
        </div>
    `);
    highlightItem?.classList?.add("highlightItem", `switch-index-${index}`);
    highlightItem.innerHTML = newHTML;
    return highlightItem?.outerHTML;
  }

  const blockClone = block.cloneNode(true);
  const highlightItemListElements = Array.from(block.children).slice(6);
  const highlightItemListElementsClone = Array.from(blockClone.children).slice(
    6
  );
  // flag for clipping --- value -'Y' or 'N'
  if (clipping === "Y") {
    block.closest(".engine-tabs")?.classList?.add("allow-clipping");
  }
  if (themeType === "variation2") {
    block.closest(".engine-tabs")?.classList?.add("no-zoomin-effect");
  } else {
    block.closest(".engine-tabs")?.classList?.add("zoomin-effect");
  }

  const highlightItemsHTML = highlightItemListElements
    .map((highlightItem, index) =>
      generateHighlightItemHTML(highlightItem, index)
    )
    .join("");
  const switchListHTML = HighlightUtils.generateSwitchListHTML(
    highlightItemListElementsClone,
    (highlightItem) => {
      const [, , tabNameEl] = highlightItem.children;
      return utility.textContentChecker(tabNameEl);
    }
  );

  const highlightItemsContainer = document.createElement("div");
  highlightItemsContainer?.classList?.add("highlightItems-container");
  highlightItemsContainer.innerHTML = highlightItemsHTML;

  block.innerHTML = `
    <div class="text-section">
      ${title ? `<div class="top-left"> ${title.outerHTML}</div>` : ""}
      ${
        subtitle
          ? `<div class="top-right"> <p>${utility.addNonBreakingSpace(
              subtitle
            )}</p> </div>`
          : ""
      }
    </div>
    ${
      switchListHTML
        ? `<div class="switch-list-container"> 
      <p class="switchList-prev-arrow"></p> 
      ${switchListHTML}
      <p class="switchList-next-arrow"></p> 
    </div>`
        : ""
    }
    <div class="highlighItem-switchList-container">
      
      
      ${
        highlightItemsHTML
          ? `<div class="highlightItems-container"> ${highlightItemsHTML} </div>`
          : ""
      }
    </div>
    </div>`;

  HighlightUtils.setupTabs(block, "highlightItem");

  const nextBtn = block.querySelector(".switchList-next-arrow");
  const prevBtn = block.querySelector(".switchList-prev-arrow");

  function hideReadMoreText(highlighItems) {
    highlighItems.forEach((item) => {
      if (
        item.querySelector(".read-more") !== null &&
        item.querySelector(".read-more") !== undefined
      ) {
        item.querySelector(".read-more").style.display = "none";
      }
      if (
        item.querySelector(".more-content-expanded") !== null &&
        item.querySelector(".more-content-expanded") !== undefined
      ) {
        item.querySelector(".more-content-expanded").style.display = "block";
      }
    });
  }

  const switchListContainer = block.querySelector(".switch-list");
  let switchListItemsLength =
    block.querySelectorAll(".switch-list-item").length;
  if (themeType === "variation2") {
    switchListItemsLength = (switchListItemsLength - 1) * 2;
    const highlighItems = block.querySelectorAll(".highlightItem");
    hideReadMoreText(highlighItems);
  } else {
    switchListItemsLength *= 2;
  }
  switchListContainer.style.top = `-${switchListItemsLength}rem`;

  function nextSlide() {
    switchListContainer.scrollBy({
      left: switchListContainer.clientWidth,
      behavior: "smooth",
    });
    prevBtn.style.display = "block";
    prevBtn.classList.remove("hidden");
    if (
      Math.round(switchListContainer.scrollLeft) +
        Math.round(switchListContainer.clientWidth) >=
      switchListContainer.scrollWidth -
        Math.round(switchListContainer.clientWidth)
    ) {
      nextBtn.classList.add("hidden");
    } else {
      nextBtn.classList.remove("hidden");
    }
  }

  function prevSlide() {
    switchListContainer.scrollBy({
      left: -switchListContainer.clientWidth,
      behavior: "smooth",
    });
    nextBtn.classList.remove("hidden");
    if (
      Math.round(switchListContainer.scrollLeft) -
        Math.round(switchListContainer.clientWidth) <=
      0
    ) {
      prevBtn.classList.add("hidden");
    } else {
      prevBtn.classList.remove("hidden");
    }
  }

  nextBtn.addEventListener("click", nextSlide);
  prevBtn.addEventListener("click", prevSlide);

  document.querySelectorAll(".switch-list-item").forEach((item) => {
    item.addEventListener("click", function scrollInView() {
      const container = document.querySelector(".switch-list-container");

      const target = this;

      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      if (
        targetRect.top < containerRect.top ||
        targetRect.bottom > containerRect.bottom
      ) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    });
  });

  function updateButtonVisibility() {
    // Show/hide previous button
    if (switchListContainer.scrollLeft > 0) {
      prevBtn.classList.remove("hidden");
    } else {
      prevBtn.classList.add("hidden");
    }

    // Show/hide next button
    if (
      switchListContainer.scrollLeft + switchListContainer.clientWidth <
      switchListContainer.scrollWidth - 8
    ) {
      prevBtn.style.display = "block";
      nextBtn.classList.remove("hidden");
    } else {
      nextBtn.classList.add("hidden");
    }
  }

  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  if (isMobile) {
    prevBtn.style.display = "none";
    // Add scroll event listener
    switchListContainer.addEventListener("scroll", updateButtonVisibility);
  } else {
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";
  }
}
