<template>
  <div class="container mx-auto h-96 overflow-hidden video-container">
    <div class="h-full">
      <div class="row flex flex-wrap h-full">
        <div class="w-full flex h-full relative">
          <span
            class="
              absolute
              top-0
              bottom-0
              z-40
              w-full
              h-full
              mx-auto
              my-auto
              text-4xl text-maroon-500 text-center
              flex
              items-center
              justify-center
            "
            >Loading...</span
          >
          <div v-if="axistv" class="w-full h-full relative z-50">
            <video
              v-if="videoPlay"
              id="axistv-player"
              class="w-full h-100"
              autoplay
              :src="playerVideo"
            ></video>
            <img
              v-if="!videoPlay"
              class="w-full h-full object-cover"
              :src="'https://img.youtube.com/vi/' + axistv.yt_video + '/0.jpg'"
              alt=""
            />
            <span
              v-if="!videoPlay"
              class="
                absolute
                top-0
                bottom-0
                left-0
                right-0
                flex
                align-center
                justify-center
                play-pause-btn
              "
              @click="togglePlay"
            >
              <span class="m-auto">
                <img
                  :src="PlayBtn"
                  class="m-auto mb-20 cursor-pointer"
                  alt=""
                />
              </span>
            </span>
            <span
              v-if="videoPlay"
              class="
                absolute
                top-0
                bottom-0
                left-0
                right-0
                flex
                align-center
                justify-center
                play-pause-btn
              "
              @click="togglePause"
            >
              <span class="m-auto">
                <img
                  :src="PauseBtn"
                  class="m-auto mb-20 cursor-pointer"
                  alt=""
                />
              </span>
            </span>
            <div
              :class="videoPlay ? 'absolute' : 'absolute'"
              class="w-full bottom-0 bg-maroon-500 bg-opacity-80"
            >
              <div v-if="axistv" class="flex flex-col px-10 py-6">
                <h2
                  v-if="axistv.title"
                  class="text-lg mb-2 text-white capitalize"
                >
                  {{ axistv.title }}
                </h2>
                <p
                  v-if="axistv.created_at"
                  class="text-sm text-white uppercase"
                >
                  POSTED ON : {{ axistv.created_at }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PlayBtn from '~/assets/images/play-btn.svg'
import PauseBtn from '~/assets/images/pause-btn.svg'
import brackObama from '~/assets/videos/barack-obama.mp4'
export default {
  name: 'TvLargeVideoComponent',
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
    autoNewsSlider: {
      type: Boolean,
      default: true,
    },
    toggleVideoPlay: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      videoPlay: false,
      PlayBtn,
      PauseBtn,
      playerVideo: brackObama,
      news: null,
      axistv: null,
      newsArrayNumber: 0,
      sliderInterval: null,
      videoPlayerDefaultTime: 0,
      videoPlayerCurrentTime: null,
    }
  },
  watch: {
    '$store.state.axistv'() {
      this.updateAxisTVNews()
      this.newsSlider()
    },
    activeAxistvType() {
      this.newsArrayNumber = 0
      this.updateAxisTVNews()
    },
    activeNewsIndex() {
      this.newsArrayNumber = this.activeNewsIndex
      this.updateAxisTVNews()
    },
    autoNewsSlider() {
      this.newsSlider()
    },
    toggleVideoPlay() {
      this.videoPlay = this.toggleVideoPlay
    },
  },
  mounted() {
    if (this.$store.state.axistv) {
      this.updateAxisTVNews()
    }
  },
  methods: {
    newsSlider() {
      if (this.autoNewsSlider) {
        this.sliderInterval = setInterval(this.updateAxisTVNews, 3000)
      }
      if (!this.autoNewsSlider) {
        clearInterval(this.sliderInterval)
      }
    },
    updateAxisTVNews() {
      this.news = this.$store.state.axistv.filter(
        (data) => data.type === this.activeAxistvType
      )
      this.axistv = this.news[this.newsArrayNumber]
      this.$emit('activeAxistvNews', this.newsArrayNumber)
      this.newsArrayNumber = this.newsArrayNumber + 1
      if (this.newsArrayNumber === this.news.length) {
        this.newsArrayNumber = 0
      }
    },
    togglePlay() {
      this.$emit('autoNewsSliderToggle', false)
      this.$emit('toggleVideoPlayer', null)
      const _this = this
      setTimeout(function () {
        _this.videoPlay = true
        setTimeout(function () {
          const player = document.getElementById('axistv-player')
          if (player !== null) {
            player.play()
          }
        }, 500)
      }, 500)
    },
    togglePause() {
      const player = document.getElementById('axistv-player')
      player.pause()
      this.$emit('toggleVideoPlayer', null)
      this.$emit('toggleVideoPlayer', null)
      this.videoPlay = false
    },
    videoPauseEvent() {
      // REMOVE THIS USELESS
      if (this.videoPlay) {
        this.videoPlayerCurrentTime =
          document.getElementById('axistv-player').currentTime
        if (this.videoPlayerCurrentTime !== this.videoPlayerDefaultTime) {
          this.videoPlayerDefaultTime = this.videoPlayerCurrentTime
          // this.videoPlay = true
        } else {
          // this.videoPlay = false
        }
      }
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
@media (min-width: 992px) {
  .video-container .play-pause-btn {
    display: none;
  }
  .video-container:hover .play-pause-btn {
    display: flex;
  }
}
</style>
