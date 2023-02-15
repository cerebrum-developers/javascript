<template>
  <div class="container mx-auto">
    <div class="mx-5 py-2">
      <div class="row block mb-4">
        <h5 class="inline-block">
          <span
            class="
              inline-block
              px-8
              py-2
              bg-maroon-500
              text-white
              font-bold
              text-xl
              uppercase
            "
            >AXIS TV</span
          >
        </h5>
      </div>
      <div class="w-full border-4 border-maroon-500 bg-grey-700">
        <TvNavbarComponent
          @toggleNavType="toggleNavType"
          @defaultToggleNavType="defaultToggleNavType"
        />
        <div class="row flex flex-wrap h-96 overflow-hidden">
          <div class="w-full lg:w-8/12 flex">
            <TvLargeVideoComponent
              :active-axistv-type="activeAxistvType"
              :active-news-index="activeNewsIndex"
              :auto-news-slider="autoNewsSlider"
              :toggle-video-play="toggleVideoPlay"
              @activeAxistvNews="activeAxistvNews"
              @autoNewsSliderToggle="autoNewsSliderToggle"
              @toggleVideoPlayer="toggleVideoPlayer"
            />
          </div>
          <div class="w-full lg:w-4/12 flex">
            <TvSmallVideoComponent
              :active-news-index="activeNewsIndex"
              :active-axistv-type="activeAxistvType"
              @toggleLargeTvNews="toggleLargeTvNews"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TvNavbarComponent from '~/components/news/axis-tv/TvNavbarComponent.vue'
import TvLargeVideoComponent from '~/components/news/axis-tv/TvLargeVideoComponent.vue'
import TvSmallVideoComponent from '~/components/news/axis-tv/TvSmallVideoComponent.vue'
export default {
  name: 'AxisTvComponent',
  components: {
    TvNavbarComponent,
    TvLargeVideoComponent,
    TvSmallVideoComponent,
  },
  data() {
    return {
      activeAxistvType: null,
      activeNewsIndex: null,
      autoNewsSlider: true,
      toggleVideoPlay: null,
    }
  },
  methods: {
    toggleNavType(type) {
      this.activeAxistvType = type
    },
    defaultToggleNavType(type) {
      this.activeAxistvType = type
    },
    activeAxistvNews(index) {
      this.activeNewsIndex = index
    },
    toggleLargeTvNews(index, type) {
      this.activeAxistvType = type
      this.activeNewsIndex = index
      this.autoNewsSlider = false
      this.toggleVideoPlay = false
    },
    autoNewsSliderToggle() {
      this.autoNewsSlider = false
    },
    toggleVideoPlayer() {
      this.toggleVideoPlay = null
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
</style>
