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
              >LATEST NEWS</span
            >
          </h5>
        </div>
        <div class="row flex mb-4">
          <div v-if="news" class="bg-white">
            <div
              v-for="data in news.slice(0, sliceLimit)"
              :key="data.text"
              class="mb-4"
            >
              <h6
                v-if="data.main_category"
                class="text-maroon-500 font-bold uppercase mb-2 text-xl"
              >
                {{ data.main_category.name }}
              </h6>
              <NuxtLink :to="'/news/' + data.slug">
                <h2
                  v-if="data.title"
                  class="text-lg mb-2 hover:text-maroon-500 capitalize"
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
</template>

<script>
export default {
  name: 'LatestNewsComponent',
  props: {
    sliceLimit: {
      type: Number,
      default: 14,
    },
  },
  data() {
    return {
      news: null,
    }
  },
  watch: {
    '$store.state.news'() {
      this.news = this.$store.state.news
    },
  },
  mounted() {
    if (this.$store.state.news) {
      this.news = this.$store.state.news
    }
  },
  methods: {
    trimText(text, length, clamp) {
      clamp = clamp || '...'
      return text.length > length ? text.slice(0, length) + clamp : text
    },
  },
}
</script>

<style>
.done {
  text-decoration: line-through;
}
</style>
