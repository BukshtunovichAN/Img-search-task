import Notiflix from 'notiflix';
import axios from 'axios'; // Импортируем axios

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '42494029-89ffd91f8b64ac9b988c0500e';
const PER_PAGE = 5; // Number of results per page

export default class PixabayApi {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }

  async fetchArticles() {
    const searchParams = new URLSearchParams({
      key: API_KEY,
      q: this.searchQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: this.page,
      per_page: PER_PAGE,
    });

    try {
      const response = await axios.get(BASE_URL, { params: searchParams });
      const data = response.data; // Получаем данные из ответа

      // console.log('this is log in fetch:', data);

      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      Notiflix.Notify.failure(
        'Oops! Something went wrong! Try reloading the page!'
      );
    }
  }

  async search(query) {
    // Здесь мне приходит один котик в query
    // console.log('this is log in search:', query);
    this.searchQuery = query;
    this.page = 1; // Reset page when performing a new search
    return this.fetchArticles();
  }

  async loadMore() {
    this.page++; // Increment page for pagination
    return this.fetchArticles();
  }

  getNextPageUrl() {
    console.log('tim: this is getNextPageUrl execution');
    // Construct the URL for the next page based on the current page number
    const searchParams = new URLSearchParams({
      key: API_KEY,
      q: this.searchQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: this.page + 1, // Increment page for the next page
      per_page: PER_PAGE,
    });

    return `${BASE_URL}?${searchParams}`;
  }
}
