<template>
  <div>
    <div class="container mx-auto bg-white">
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
              >SCIENCE AND TECHNOLOGY</span
            >
          </h5>
        </div>
        <div class="row flex lg:mb-4">
          <div v-if="news" class="bg-white flex flex-wrap -mx-5">
            <div
              v-for="data in news.slice(0, 1)"
              :key="data.text"
              class="mb-6 w-full lg:w-4/12 px-5"
            >
              <div class="">
                <div class="image-container mb-3 relative">
                  <div
                    class="
                      w-full
                      h-60
                      overflow-hidden
                      bg-center bg-no-repeat bg-cover
                      relative
                      z-50
                    "
                    :style="{
                      'background-image':
                        'url(' +
                        'http://127.0.0.1:8000/' +
                        data.picture_xl +
                        ')',
                    }"
                  ></div>
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
                </div>
                <NuxtLink :to="'/news/' + data.slug">
                  <h2
                    v-if="data.title"
                    class="text-lg mb-2 hover:text-maroon-500 capitalize pr-3"
                  >
                    {{ trimText(data.title, 130, '...') }}
                  </h2>
                </NuxtLink>
                <p v-if="data.created_at" class="text-xs uppercase">
                  POSTED ON : {{ data.created_at }}
                </p>
              </div>
            </div>
            <div class="lg:mb-6 w-full lg:w-8/12 px-5 flex flex-wrap">
              <div
                v-for="data in news.slice(1, 9)"
                :key="data.text"
                class="mb-6 w-full lg:w-6/12 lg:px-5"
              >
                <div class="">
                  <NuxtLink :to="'/news/' + data.slug">
                  <h2
                    v-if="data.title"
                    class="text-lg mb-2 hover:text-maroon-500 capitalize pr-3"
                  >
                    {{ trimText(data.title, 130, '...') }}
                  </h2>
                  </NuxtLink>
                  <p v-if="data.created_at" class="text-xs uppercase">
                    POSTED ON : {{ data.created_at }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScienceTechnologyComponent',
  data() {
    return {
      news: null,
    }
  },
  watch: {
    '$store.state.news'() {
      this.getScienceTechnologyNews()
    },
  },
  mounted() {
    if (this.$store.state.news) {
      this.getScienceTechnologyNews()
    }
  },
  methods: {
    trimText(text, length, clamp) {
      clamp = clamp || '...'
      return text.length > length ? text.slice(0, length) + clamp : text
    },
    getScienceTechnologyNews() {
      this.news = this.$store.state.news.filter(
        (data) => data.main_category.slug === 'science-and-technology'
      )
    },
  },
}
</script>

<style>
.done {
  text-decoration: line-through;
}
</style>
