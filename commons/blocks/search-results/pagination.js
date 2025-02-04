import search from '../../scripts/search/search.js';

export default function paginate(block, currentPage, totalPages, maxVisiblePages, placeholders, customEventType = '') {
  let currentPageCopy = currentPage;
  let maxVisiblePagesCopy = maxVisiblePages;
  const container = block.querySelector('.pagination-container');
  const invalidCurrentPage = currentPageCopy > totalPages;
  const onlySinglePage = totalPages === 1;
  if (!container || invalidCurrentPage || onlySinglePage) {
    if (container) {
      if (container.firstElementChild) {
        container.firstElementChild.remove();
      }
    }
    return;
  }
  if (maxVisiblePagesCopy > totalPages) {
    maxVisiblePagesCopy = totalPages;
  }
  function handlePageChange(event) {
    if (event.target.dataset.page) {
      const { page } = event.target.dataset;
      const btnPage = Number(page);
      if (page === 'prev') {
        if (currentPageCopy - 1 >= 1) {
          currentPageCopy -= 1;
        }
      } else if (page === 'next') {
        if (currentPageCopy + 1 <= totalPages) {
          currentPageCopy += 1;
        }
      } else {
        currentPageCopy = btnPage;
      }
      if (customEventType) {
        search.dispatchCustomEvent(event.target, customEventType, currentPageCopy);
      }
      // eslint-disable-next-line no-use-before-define
      renderPagination();
    }
  }

  function renderPagination() {
    let endPage;
    let startPage;
    const lastPage = currentPageCopy >= totalPages;
    const nextBtn = search.getListButton('next', search.usei18n('nextPage', placeholders), false, lastPage, true);
    const previousBtn = search.getListButton('prev', search.usei18n('previousPage', placeholders), false, currentPageCopy <= 1, true);
    if (container.firstElementChild) {
      container.firstElementChild.remove();
    }
    const ul = document.createElement('ul');
    ul.classList.add('pagination');
    ul.addEventListener('click', handlePageChange);
    if (totalPages <= maxVisiblePagesCopy) {
      startPage = 1;
      endPage = totalPages;
    } else if (currentPageCopy <= 4) {
      startPage = 1;
      endPage = maxVisiblePagesCopy;
    } else if (currentPageCopy + 3 >= totalPages) {
      startPage = totalPages - maxVisiblePagesCopy + 1;
      endPage = totalPages;
    } else {
      startPage = currentPageCopy - 3;
      endPage = currentPageCopy + 3;
    }

    ul.appendChild(previousBtn);
    ul.appendChild(nextBtn);
    const nextBtnRef = ul.querySelector('.next').closest('li');
    const pageLabel = search.usei18n('pageLabel', placeholders);
    for (let i = startPage; i <= endPage; i += 1) {
      const btn = search.getListButton(i, `${pageLabel} ${i}`, i === currentPageCopy);
      ul.insertBefore(btn, nextBtnRef);
    }
    while (ul.childElementCount < maxVisiblePagesCopy + 2) {
      if (currentPageCopy <= 4) {
        const btn = search.getListButton(endPage + 1, `${pageLabel} ${endPage + 1}`);
        ul.insertBefore(btn, nextBtnRef);
        endPage += 1;
      } else {
        const li = search.getListButton(startPage - 1, `${pageLabel} ${startPage - 1}`);
        ul.insertBefore(li, ul.firstChild.nextSibling);
        startPage -= 1;
      }
    }
    container.appendChild(ul);
  }
  renderPagination();
}

export const removePagination = (block) => {
  const container = block.querySelector('.pagination-container');
  if (container && container.firstElementChild) {
    container.firstElementChild.remove();
  }
};
