import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import PixabayApi from './js/pixabayApi';
import InfiniteScroll from 'infinite-scroll'; // Import Infinite Scroll library

const pixabayApi = new PixabayApi();

const searchForm = document.getElementById('search-form');
// const loadMoreBtn = document.querySelector('.load-more');

const photoes = document.querySelector('.photoes');

searchForm.addEventListener('submit', handleSearchFormSubmit);
// loadMoreBtn.addEventListener('click', handleLoadMoreButtonClick);
let lightbox;

function initLightBox() {
  lightbox = new SimpleLightbox('.gallery a', {
    captionType: 'attr',
    captionSelector: 'img',
    captionsData: 'alt',
    captionDelay: 250,
  });
  console.log(lightbox);
}

function renderPhotoCard(photo) {
  const card = document.createElement('div');
  card.classList.add('gallery');

  const link = document.createElement('a');
  link.href = photo.largeImageURL;

  const img = document.createElement('img');
  img.src = photo.webformatURL;
  img.alt = photo.tags;
  img.loading = 'lazy';
  link.appendChild(img);

  const info = document.createElement('div');
  info.classList.add('info');

  const likes = document.createElement('p');
  likes.classList.add('info-item');
  likes.textContent = `Likes: ${photo.likes}`;

  const views = document.createElement('p');
  views.classList.add('info-item');
  views.textContent = `Views: ${photo.views}`;

  const comments = document.createElement('p');
  comments.classList.add('info-item');
  comments.textContent = `Comments: ${photo.comments}`;

  const downloads = document.createElement('p');
  downloads.classList.add('info-item');
  downloads.textContent = `Downloads: ${photo.downloads}`;

  // Например, строка info.append(likes, views, comments, downloads); добавляет элементы likes, views, comments и downloads в конец блока информации info.
  info.append(likes, views, comments, downloads);
  card.append(link, info);

  return card;
}

async function renderSearchResults(query) {
  // Здесь мне приходит один котик в query
  // console.log('это квери', query);

  try {
    const data = await pixabayApi.search(query);

    //   В data  приходит мавссив всех котов, там есть hits хранится массив всех котов
    //   hits: (40)[{… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }, {… }]
    //   total: 369
    //   totalHits: 369
    // console.log('this is log in data in render function', data);

    Notiflix.Notify.info(`Hooray! We found ${data.totalHits} images`);

    photoes.innerHTML = ''; // Clear the photoes before rendering new results
    if (data.hits.length === 0) {
      Notiflix.Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      const photoCards = data.hits.map(renderPhotoCard);

      // в photoCards приходит [div.photo-card, div.photo-card, div.photo-card, div.photo-card....]
      //   console.log(photoCards);

      photoes.append(...photoCards);

      // Таким образом, выражение data.totalHits > photoes.children.length проверяет, есть ли еще изображения, которые не были добавлены в галерею. Если это условие истинно (то есть общее количество найденных изображений больше, чем количество карточек фотографий, которые уже находятся в галерее), то блок if выполняется.
      // Внутри блока if устанавливается стиль display: 'block' для кнопки "Загрузить еще"(loadMoreBtn), чтобы показать ее, если еще есть результаты для загрузки.Если же условие не выполняется(все найденные изображения уже отображены в галерее), то стиль display для кнопки устанавливается на 'none', что скрывает ее.

      // if (data.totalHits > photoes.children.length) {
      //   loadMoreBtn.style.display = 'block'; // Show load more button if there are more results
      // } else {
      //   loadMoreBtn.style.display = 'none'; // Hide load more button if no more results
      // }

      const { height: cardHeight } = document
        .querySelector('.photoes')
        .firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }
  } catch (error) {
    console.error('Error rendering search results:', error);
  }
}

async function handleSearchFormSubmit(event) {
  event.preventDefault();

  // Метод trim() в JavaScript используется для удаления пробелов с начала и конца строки. Он не изменяет саму строку, а возвращает новую строку, в которой удалены все начальные и конечные пробелы. Можно писать код и  без него
  const searchQuery = event.target.elements.searchQuery.value.trim();
  if (searchQuery) {
    await renderSearchResults(searchQuery);
    initLightBox();
    // Initialize Infinite Scroll after rendering search results
    initializeInfiniteScroll();
  }
}

async function handleLoadMore() {
  try {
    const data = await pixabayApi.loadMore();
    const photoCards = data.hits.map(renderPhotoCard);
    photoes.append(...photoCards);
    if (lightbox) {
      lightbox.refresh();
    } else {
      initLightBox();
    }
    if (data.totalHits <= photoes.children.length) {
      loadMoreBtn.style.display = 'none'; // Hide load more button if no more results
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    console.error('Error loading more results:', error);
  }
}


function initializeInfiniteScroll() {
  let infScroll = new InfiniteScroll('.photoes', {
    path: function () { return 'page'; },
    loadOnScroll: false,
    scrollThreshold: 100,
    // status: '.page-load-status',
  });

  infScroll.on( 'scrollThreshold', function() {
    console.log('tim: scroll treshhold event')
    handleLoadMore();
  });

}
