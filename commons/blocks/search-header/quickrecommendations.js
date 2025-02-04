export default function renderQuickRecommendations(
  quickSearch,
  searchRecommendation,
  redirection,
) {
  let recommendationHtml = '';
  if (searchRecommendation) {
    const recommendations = searchRecommendation?.split(',') || [];
    let totalRecommendation = 0;
    for (let i = 0; i < recommendations.length && totalRecommendation < 8; i += 1) {
      const recommendation = recommendations[i].trim();
      if (recommendation) {
        totalRecommendation += 1;
        recommendationHtml += `<a class="search-recomm-list-item" href="${redirection}?q=${recommendation}">${recommendation}</a>`;
      }
    }
  }
  return (
    recommendationHtml && `<div class="search-recomm">
          <h2 class="search-recomm-title">${quickSearch || ''}</h2>
           ${recommendationHtml ? `<div class="search-recomm-list">${recommendationHtml} </div>` : null}
      </div>`
  );
}
