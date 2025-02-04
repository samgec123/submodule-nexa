export default function decorate(block) {
  const [titleEl, subtitleEl, hrefEl, targetEl, imageEl, altEl] =
    block.children;
  const [title, subtitle, target, alt] = [
    titleEl,
    subtitleEl,
    targetEl,
    altEl,
  ].map((el) => el?.textContent?.trim() || "");
  const link = hrefEl?.querySelector("a")?.href || "";
  const image = imageEl?.querySelector("picture");
  if (image) {
    const img = image.querySelector("img");
    img?.setAttribute("alt", alt);
    img?.setAttribute("width", "100%");
    img?.removeAttribute("height");
  }
  block.innerHTML = `
        <div class="yy8-header-link-inner-container">
            <a href="${link}" target="${target || "_self"}">
                ${image ? image.outerHTML : ""}
                <div class="yy8-header-link-content">
                ${
                  title
                    ? `<span class="yy8-header-link-title">${title}</span>`
                    : ""
                }
                ${
                  subtitle
                    ? `<span class="yy8-header-link-subtitle">${subtitle}</span>`
                    : ""
                }
                </div>
            </a>
        </div>
    `;
}
