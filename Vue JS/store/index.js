export const state = () => ({
  news: [],
  categories: [],
  axistv: [],
  singleNews:{}
})

export const mutations = {
  STORE_CATEGORIES(state, categories) {
    state.categories = categories
  },
  STORE_NEWS(state, news) {
    state.news = news
  },
  STORE_AXIS_TV_NEWS(state, axistv) {
    state.axistv = axistv
  },
  STORE_SINGLE_NEWS(state, singleNews) {
    state.singleNews = singleNews
  },
}

export const getters = {
  getNews(state) {
    return state.news
  },
  getSingleNews(state) {
    return state.singleNews
  },
}

export const actions = {
  storeNews({ commit }, news) {
    commit('STORE_NEWS', news)
  },
  async getNews({ commit }) {
    try {
      const res = await this.$axios.$get(`http://127.0.0.1:8000/api/news`)
      commit('STORE_NEWS', res.news.data)
      commit('STORE_CATEGORIES', res.categories.data)
      commit('STORE_AXIS_TV_NEWS', res.axistv.data)
      console.log('store news----------------', res.news.data)
      console.log('store categories----------------', res.categories.data)
      console.log('store axistv----------------', res.axistv.data)
    } catch (error) {
      console.error(error)
    }
  },
  async getSingleNews({ commit },newsSlug) {
    if(newsSlug)
    try {
      const res = await this.$axios.$get(`http://127.0.0.1:8000/api/news/slug/${newsSlug}`)
      commit('STORE_SINGLE_NEWS', res.data)
      console.log('STORE_SINGLE_NEWS----------------', res.data)
    } catch (error) {
      console.error(error)
    }
  },
}
