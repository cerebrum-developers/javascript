<template>
  <div class="container mx-auto bg-white">
    <div class="bg-grey-700">
      <div class="row flex flex-wrap">
        <div v-if="axistv" class="w-full flex">
          <ul
            class="
              w-full
              flex flex-col
              lg:flex-row
              lg:mt-0
              xl:mt-0 xl:justify-start
            "
          >
            <li
              v-for="(data, index) in uniqueAxistv.slice(0, 3)"
              :key="data.index"
              :class="[
                activeToggleNavType === data.type
                  ? 'bg-maroon-500'
                  : 'bg-grey-700',
              ]"
              class="static text-white uppercase px-3 py-2 cursor-pointer"
              @click="toggleNavType(index, data.type)"
            >
              {{ data.type.replace(/_/g, ' ') }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TvNavbarComponent',
  components: {},
  data() {
    return {
      activeToggleNavType: null,
      axistv: null,
      uniqueAxistv: [],
    }
  },
  computed: {},
  watch: {
    '$store.state.axistv'() {
      this.axistv = this.$store.state.axistv
      this.getUniqueAxistv()
      this.activeNavLink()
    },
    $route() {
      this.axistv = this.$store.state.axistv
      this.getUniqueAxistv()
      this.activeNavLink()
    },
  },
  methods: {
    activeNavLink() {
      this.activeToggleNavType = this.axistv[0].type
      this.$emit('defaultToggleNavType', this.activeToggleNavType)
    },
    toggleNavType(index, type) {
      this.activeToggleNavType = type
      this.$emit('toggleNavType', type)
    },
    getUniqueAxistv() {
      const map = new Map()
      for (const item of this.axistv) {
        if (!map.has(item.type)) {
          map.set(item.type, true)
          this.uniqueAxistv.push({
            type: item.type,
          })
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
</style>
