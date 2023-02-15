<template>
  <div>
    <div
      v-if="megaMenu == megaMenuIndex"
      class="
        px-3
        py-6
        lg:px-6
        mega-menu
        relative
        xl:absolute
        mb-16
        sm:mb-0
        shadow-xl
        bg-grey-700
        border-t-4 border-maroon-500
      "
    >
      <div class="container mx-auto w-full flex flex-wrap justify-between mx-2">
        <ul
          class="
            px-4
            w-full
            lg:w-1/4
            border-white-600 border-b-0 border-r-0
            lg:border-r
            pb-6
          "
        >
          <div class="flex items-center">
            <ul>
              <li
                v-for="navSubLink in navSubLinks"
                :key="navSubLink.index"
                class="mb-2"
              >
                <span
                  class="text-sm uppercase text-white hover:text-maroon-500 cursor-pointer"
                  @mouseover="megaMenuSubNavContent(navSubLink.slug)"
                  >{{ navSubLink.name }}</span
                >
              </li>
            </ul>
          </div>
        </ul>
        <ul
          class="
            flex flex-wrap
            px-4
            w-full
            lg:w-3/4
            min-h-60
            max-h-96
            mega-menu-subdata
            overflow-y-scroll
            bg-grey-700
          "
        >
          <div v-if="!megaMenuContents.length > 0" class="w-full">
            <h4 class="text-sm text-white mb-2">No Content</h4>
          </div>
          <div v-if="megaMenuContents" class="w-full flex flex-wrap">
            <div
              v-for="megaMenuContent in megaMenuContents.slice(0, 12)"
              :key="megaMenuContent.index"
              class="
                px-0
                sm:px-4
                w-full
                sm:w-6/12
                lg:w-6/12
                xl:w-4/12
                pb-6
                cursor-pointer
              "
            >
              <div class="image-container mb-3 relative">
                <div
                  class="
                    w-full
                    h-40
                    overflow-hidden
                    bg-center bg-no-repeat bg-cover
                    relative
                    z-50
                  "
                  :style="{
                    'background-image':
                      'url(' +
                      'http://127.0.0.1:8000/' +
                      megaMenuContent.picture_xl +
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
              <NuxtLink :to="'/news/' + megaMenuContent.slug">
                <h4
                  class="
                    text-sm text-white
                    mb-2
                    h-10
                    overflow-hidden
                    hover:text-maroon-500
                    cursor-pointer
                  "
                  @click="megaMenuNewsLinkClick()"
                >
                  {{ megaMenuContent.title }}
                </h4>
              </NuxtLink>
            </div>
          </div>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Navbar',
  props: {
    megaMenu: {
      type: Number,
      default: null,
    },
    megaMenuIndex: {
      type: Number,
      default: null,
    },
    navSubLinks: {
      type: Array,
      default: null,
    },
    megaMenuContents: {
      type: Array,
      default: null,
    },
  },
  methods: {
    megaMenuSubNavContent(navSubLinkSlug) {
      this.$emit('megaMenuSubNavContent', navSubLinkSlug)
    },
    megaMenuNewsLinkClick(){
      this.$emit('megaMenuNewsLinkClick',true)
    }
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
<style>
.mega-menu {
  left: 0;
  text-align: left;
  width: 100%;
  z-index: 9999;
}

.mega-menu-subdata::-webkit-scrollbar {
  width: 8px;
}

.mega-menu-subdata::-webkit-scrollbar-track {
  background: transparent;
}

.mega-menu-subdata::-webkit-scrollbar-thumb {
  background: #888;
}

.mega-menu-subdata::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
