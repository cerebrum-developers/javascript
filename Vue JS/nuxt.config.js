export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'The Axis Point',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'The AXIS MEDIA GROUP is a young media venture launched from Jammu, the capital city of North Indian State of Jammu and Kashmir, aiming to grow gradually and steadily across the country. Currently we have an AXIS MEDIA GROUP web portal, an English Newspaper (The News Inn), an internet TV Channel (The News Inn TV), an English Lifestyle Magazine (Himalayan Axis) and an Urdu newspaper being done at our head office. 2020 is the year; we intend to full fill our dream of launching “AXIS MEDIA GROUP” Internationally with new country offices.' },
      { hid: 'keywords', name: 'keywords', content: 'axis media group, latest news, jammu news, kashmir news, jammu and kashmir news, news, today news, srinagar latest news, axis media news, axis news' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['~/assets/fonts.css'],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    // '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/stylelint
    // '@nuxtjs/stylelint-module',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ['@nuxtjs/axios'],

  axios: {
    // extra config e.g
    BaseURL: 'http://localhost/',
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
}
