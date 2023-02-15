<template>
  <div class="container mx-auto">
    <div class="mx-0">
      <div class="row flex flex-wrap bg-white">
        <div class="w-full lg:w-3/12 flex">
          <LatestNewsComponent />
        </div>
        <div class="w-full lg:w-9/12 flex flex-col">
          <AxisTvComponent class="hidden lg:inline-block" />
          <BazaarMail />
          <TheGlobe />
        </div>
      </div>
      <div class="row flex flex-wrap bg-white">
        <div class="w-full flex">
          <TheNation />
        </div>
        <div class="w-full flex">
          <TheState />
        </div>
      </div>
      <div class="row flex flex-wrap bg-white">
        <div class="w-full flex">
          <Sports />
        </div>
        <div class="w-full flex">
          <ScienceTechnology />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LatestNewsComponent from '~/components/news/latest-news/LatestNewsComponent.vue'
import AxisTvComponent from '~/components/news/axis-tv/AxisTvComponent.vue'
import BazaarMail from '~/components/news/bazaar-mail'
import TheGlobe from '~/components/news/the-globe'
import TheNation from '~/components/news/the-nation'
import TheState from '~/components/news/the-state'
import Sports from '~/components/news/sports'
import ScienceTechnology from '~/components/news/science-technology'

export default {
  name: 'Home',
  components: {
    LatestNewsComponent,
    AxisTvComponent,
    BazaarMail,
    TheGlobe,
    TheNation,
    TheState,
    Sports,
    ScienceTechnology,
  },
  mounted() {
    this.$store.dispatch('getNews')
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
