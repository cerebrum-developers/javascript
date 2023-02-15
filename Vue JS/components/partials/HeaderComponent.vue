<template>
  <div class="container mx-auto bg-white">
    <div class="mx-5 py-4">
      <div class="row flex flex-wrap mb-4">
        <div class="w-full lg:w-4/12 flex align-center mb-8 lg:mb-0">
          <NuxtLink to="/">
            <img :src="Logo" alt="" class="my-auto" />
          </NuxtLink>
        </div>
        <div class="w-full lg:w-8/12 flex flex-col lg:flex-row mb-0 lg:mb-0">
          <div class="flex mb-5 lg:mb-0">
            <span
              class="
                bg-maroon-500
                px-8
                lg:px-4
                py-2
                lg:py-7
                text-white text-2xl
                rounded-l-sm
                w-auto
                h-auto
                lg:w-28
                lg:h-32
                font-bold
                uppercase
                items-center
                text-center
              "
              >Breaking News</span
            >
            <span class="w-0 h-0 breaking-triangle hidden lg:inline-block"></span>
          </div>
          <div class="">
            <div v-if="breakingNews" class="flex flex-col lg:px-10">
              <h6
                v-if="breakingNews.main_category"
                class="text-maroon-500 font-bold uppercase mb-2 text-xl"
              >
                {{ breakingNews.main_category.name }}
              </h6>
              <NuxtLink :to="'/news/' + breakingNews.slug">
                <h2
                  v-if="breakingNews.title"
                  class="text-lg mb-2 hover:text-maroon-500 capitalize"
                >
                  {{ trimText(breakingNews.title, 130, '...') }}
                </h2>
              </NuxtLink>
              <p v-if="breakingNews.created_at" class="text-sm uppercase">
                POSTED ON : {{ breakingNews.created_at }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="row hidden lg:flex">
        <div class="w-full text-center">
          <img :src="BannerAd" alt="" class="mx-auto" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SiteLogo from '~/assets/images/logo.jpg'
import BannerAd from '~/assets/images/banner-img.png'
export default {
  name: 'HeaderComponent',
  data() {
    return {
      Logo: SiteLogo,
      BannerAd,
      breakingNews: null,
      newsArrayNumber: 0,
      news: null,
      setIntervalCount: 1,
    }
  },
  watch: {
    '$store.state.news'() {
      this.updatebreakingNews()
      this.setIntervalCountInterval()
    },
  },
  methods: {
    trimText(text, length, clamp) {
      clamp = clamp || '...'
      return text.length > length ? text.slice(0, length) + clamp : text
    },
    setIntervalCountInterval() {
      if (this.setIntervalCount === 1) {
        setInterval(this.updatebreakingNews, 3000)
        this.setIntervalCount = 2
      }
    },
    updatebreakingNews() {
      this.news = this.$store.state.news.filter((data) => data.breaking === '1')
      this.breakingNews = this.news[this.newsArrayNumber]
      this.newsArrayNumber = this.newsArrayNumber + 1
      if (this.newsArrayNumber === this.news.length) {
        this.newsArrayNumber = 0
      }
      console.log('times')
    },
  },
}
</script>

<style>
/* Sample `apply` at-rules with Tailwind CSS
.container {
@apply min-h-screen flex justify-center items-center text-center mx-auto;
}
*/

.breaking-triangle {
  border-width: 4rem 0 4rem 2rem;
  border-color: transparent transparent transparent #e00000;
}

</style>
