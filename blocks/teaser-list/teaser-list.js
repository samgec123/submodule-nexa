import utility from '../../utility/utility.js';
import teaser from '../../utility/teaserUtils.js';
import analytics from '../../utility/analytics.js';
import authUtils from '../../commons/utility/authUtils.js';

export default function decorate(block) {
  function resetFocus(cards) {
    cards.forEach((card) => {
      card.classList.remove('teaser__card--focused');
      card.classList.add('teaser__card--unfocused');
    });
  }

  function resetAnimation(cards) {
    cards.forEach((card) => {
      card.classList.remove('fadeIn');
    });
  }

  function setupDealerCards() {
    const cards = block.querySelectorAll('.teaser__cards .teaser__card');

    cards[0].classList.add('teaser__card--primary');
    cards[1].classList.add('teaser__card--secondary');
  }

  function setupRegisterCards() {
    const cards = block.querySelectorAll('.teaser__cards .teaser__card');

    cards[0]?.classList.add('register__card--primary');
    cards[1]?.classList.add('register__card--secondary');
  }

  function toggleFocusedClass() {
    const isMobile = !window.matchMedia('(min-width: 768px)').matches;
    const cardsContainer = block.querySelector('.teaser__cards');
    const cards = block.querySelectorAll('.teaser__cards .teaser__card');

    // left card will be focused initially
    cards[0].classList.add('teaser__card--focused', 'teaser__left');
    cards[1].classList.add('teaser__card--unfocused', 'teaser__right');

    cardsContainer.style.paddingLeft = isMobile ? '24px' : '64px';

    if (isMobile) {
      cardsContainer.style.left = '0';
    } else {
      cardsContainer.style.paddingLeft = '64px';
    }

    cards.forEach((card) => {
      card.addEventListener('click', () => {
        resetFocus(cards);
        resetAnimation(cards);
        card.classList.add('teaser__card--focused');
        card.classList.add('fadeIn');
        card.classList.remove('teaser__card--unfocused');

        if (card.classList.contains('teaser__left')) {
          cardsContainer.style.paddingLeft = isMobile ? '24px' : '64px';
          cardsContainer.style.paddingRight = '0';

          if (isMobile) {
            cardsContainer.style.left = '0';
            cardsContainer.style.right = 'initial';
            cardsContainer.style.gridTemplateColumns = '1fr 1fr';
          } else {
            cardsContainer.style.gridTemplateColumns = '3fr 1fr';
          }
        }

        if (card.classList.contains('teaser__right')) {
          cardsContainer.style.paddingLeft = '0';
          cardsContainer.style.paddingRight = isMobile ? '24px' : '64px';

          if (isMobile) {
            cardsContainer.style.right = '0';
            cardsContainer.style.left = 'initial';
            cardsContainer.style.gridTemplateColumns = '1fr 1fr';
          } else {
            cardsContainer.style.gridTemplateColumns = '1fr 3fr';
          }
        }

        const focusedTeaserCard = block.querySelector('.teaser__card--focused');
        if (focusedTeaserCard) {
          const container = focusedTeaserCard.closest('.teaser__cards');
          const cardOffsetLeft = focusedTeaserCard.offsetLeft;
          const containerOffsetLeft = container.offsetLeft;
          const scrollLeft = cardOffsetLeft - containerOffsetLeft;
          const containerWidth = container.clientWidth;
          const maxScrollLeft = Math.min(
            scrollLeft,
            container.scrollWidth - containerWidth,
          );
          container.scrollTo({
            left: maxScrollLeft,
            behavior: 'smooth',
          });
        }
      });
    });
  }

  const [idEl, titleEl, themeEl, themeTypeEl, ...teaserListEl] = block.children;
  const id = idEl?.textContent?.trim() || '';
  const theme = themeEl?.textContent?.trim();
  const themeType = themeTypeEl?.textContent?.trim();

  if (theme) {
    block.classList.add(theme);
  }
  if (themeType) {
    block.classList.add(themeType);
  }

  const commonTitle = titleEl?.querySelector(':is(h1,h2,h3,h4,h5,h6)');
  commonTitle?.classList?.add('text-color', 'teaser-list__title');
  let signInTeasers = [];
  const teasers = teaserListEl.map((card) => {
    const teaserObj = teaser.getTeaser(card, (details) => { signInTeasers.push(details) });
    utility.mobileLazyLoading(teaserObj, '.teaser__image img');
    return teaserObj.outerHTML;
  });

  const newHtml = `
    <div class="container">
        <div class="row">
            <div class="col-lg-6 col-sm-8 col-sm-10">
                ${commonTitle ? commonTitle.outerHTML : ''}
            </div>
        </div>
        <div class="row">
            <div class="teaser__cards-container col-lg-12">
                <div class="teaser__cards">
                     ${teasers.join('')}
                </div>
            </div>
        </div>
    </div>
    `;
  if (id) {
    block.setAttribute('id', id);
  }
  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(newHtml));

  if (themeType === 'dealer-cards-list') {
    setupDealerCards();
  }
  if (themeType === 'register-cards-list' || themeType === 'yy8-register-cards-list') {
    setupRegisterCards();
  }
  if (themeType !== 'dealer-cards-list' && themeType !== 'register-cards-list' && themeType !== 'yy8-register-cards-list') {
    toggleFocusedClass();
  }

  const registerInrestBtn = block.querySelector('.register__card--secondary .primary__btn') || block.querySelector('.yy8-register-cards-list .primary__btn');
  const btnUrl = registerInrestBtn?.href;
  const compId = btnUrl?.substr(btnUrl.lastIndexOf('#') + 1);

  registerInrestBtn?.addEventListener('click', (event) => {
    event.preventDefault();
    const registerInrestBlocks = document.querySelectorAll('.register-your-interest-container');
    registerInrestBlocks.forEach((registerInrestBlock) => {
      const popupId = registerInrestBlock?.querySelector('.register-your-interest-wrapper')?.querySelector('.modal').id || '';
      if (popupId === compId) {
        registerInrestBlock.querySelector('.register-your-interest-wrapper').style.display = 'block';
        document.body.style.overflow = 'hidden';
      }
      document.addEventListener('keyup', function(e) {
          if (e.keyCode == 27) {
            registerInrestBlock.querySelector('.register-your-interest-wrapper').style.display = 'none';
          }
      });

    });
  });

  block.querySelectorAll('a').forEach((link) => {
    const data = {};
    data.componentName = block.dataset.blockName;
    data.componentTitle = link.closest('.teaser__card')?.querySelector('.teaser__title')?.textContent?.trim() || '';
    data.componentType = 'button';
    data.webName = link.textContent.trim() || '';
    data.linkType = link;
    link.addEventListener('click', () => {
      analytics.setButtonDetails(data);
    });
  });

  authUtils.waitForAuth().then(async () => {
    const profile = await authUtils.getProfile();
    block.querySelectorAll('.teaser__card').forEach((teaser, index) => {
      if(index >= signInTeasers.length) {
        return;
      }
      const details = signInTeasers[index];
      let finalTitle = (details.isSignInTeaser) ? (details.signOutTitle || details.titleText || '') : (details.titleText || '');
      finalTitle = finalTitle?.replace('{name}', (profile?.fname) ? ` ${profile.fname}` : '');
      const currentTitleEl = teaser.querySelector('.teaser__title-text');
      if(currentTitleEl && finalTitle) {
        currentTitleEl.textContent = finalTitle;
      }
      const currentDescEl = block.querySelector('.teaser__description');
      if(details.isSignInTeaser && currentDescEl && details.signOutDescription) {
        currentDescEl.textContent = details.signOutDescription;
      }
      const currentCta = block.querySelector('.primary_btn');
      if(details.isSignInTeaser && currentCta && details.signOutCtaText) {
        currentCta.textContent = details.signOutCtaText;
      }
      if(details.isSignInTeaser) {
        if(profile) {
          currentCta?.addEventListener('click', () => {
            authUtils.logout();
          }, false);
        } else {
          currentCta?.addEventListener('click', () => {
            authUtils.login();
          }, false);
        }
      }
    });
  });
}
