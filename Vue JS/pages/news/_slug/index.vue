<template>
  <div class="container mx-auto">
    <div class="mx-0">
      <div class="row flex flex-wrap bg-white">
        <div class="w-full lg:w-8/12 flex flex-col">
          <SingleNews :news-slug="newsSlug" />
        </div>
        <div class="w-full lg:w-4/12 flex">
          <LatestNewsComponent :slice-limit="sliceLimit" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SingleNews from '~/components/news/single-news'
import LatestNewsComponent from '~/components/news/latest-news/LatestNewsComponent.vue'

export default {
  name: 'SingleNewsPage',
  components: {
    SingleNews,
    LatestNewsComponent,
  },
  data() {
    return {
      newsSlug: null,
      sliceLimit: 12,
    }
  },
  mounted() {
    this.newsSlug = this.$route.params.slug
    // this.$store.dispatch('getNews')
  },
}
</script>

<style>
/* Sample `apply` at-rules with Tailwind CSS
.container {
@apply min-h-screen flex justify-center items-center text-center mx-auto;
}
*/
</style>
