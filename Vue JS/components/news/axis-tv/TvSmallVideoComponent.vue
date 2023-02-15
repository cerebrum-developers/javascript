<template>
  <div class="container mx-auto">
    <div class="mx-5">
      <div v-if="news" class="row flex flex-wrap mb-4 pb-1">
        <div
          v-for="(data, index) in news.slice(0, 7)"
          :key="data.index"
          class="w-full flex flex-row mb-3"
        >
          <div class="hidden xl:flex w-3/12">
            <img
              class="w-full object-cover"
              :src="'https://img.youtube.com/vi/' + data.yt_video + '/1.jpg'"
              alt=""
            />
          </div>
          <div class="w-full xl:w-9/12">
            <div class="pl-3">
              <h2
                v-if="data.title"
                :class="[
                  index === activeNewsIndex ? 'text-maroon-500' : 'text-white',
                ]"
                class="text-xs mb-1 capitalize cursor-pointer"
                @click="toggleLargeTvNews(index, data.type)"
              >
                {{ trimText(data.title, 50, '...') }}
              </h2>
              <p
                v-if="data.created_at"
                class="text-10-lh-15 text-white uppercase"
              >
                POSTED ON : {{ data.created_at }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TvSmallVideoComponent',
  components: {},
  props: {
    activeAxistvType: {
      type: String,
      default: null,
    },
    activeNewsIndex: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      news: null,
    }
  },
  watch: {
    '$store.state.axistv'() {
      this.news = this.$store.state.axistv
    },
    activeAxistvType() {
      this.updateAxisTVNews()
    },
  },
  mounted() {
    this.news = this.$store.state.axistv
  },
  methods: {
    trimText(text, length, clamp) {
      clamp = clamp || '...'
      return text.length > length ? text.slice(0, length) + clamp : text
    },
    updateAxisTVNews() {
      this.news = this.$store.state.axistv.filter(
        (data) => data.type === this.activeAxistvType
      )
    },
    toggleLargeTvNews(index, type) {
      this.$emit('toggleLargeTvNews', index, type)
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
.tv-small-video-box::-webkit-scrollbar {
  display: none;
}
</style>
