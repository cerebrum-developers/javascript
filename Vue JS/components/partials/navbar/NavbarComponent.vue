<template>
  <div>
    <div class="navbar-container">
      <nav class="relative">
        <div class="w-full mx-auto relative">
          <div class="bg-grey-light-200 opacity-50 mx-6 py-2 -mb-2"></div>
          <div class="bg-grey-light-200 opacity-70 mx-4 py-1"></div>
        </div>
        <div
          class="
            container
            bg-grey-light-200
            mx-auto
            flex flex-col
            xl:flex-row
            justify-center
            items-center
          "
        >
          <button
            class="
              xl:hidden
              text-gray-500
              w-10
              h-10
              relative
              focus:outline-none
              bg-white
              my-2
              mx-auto
            "
            @click="toggleHamburger = !toggleHamburger"
          >
            <div
              class="
                block
                w-5
                absolute
                left-1/2
                top-1/2
                transform
                -translate-x-1/2 -translate-y-1/2
              "
            >
              <span
                aria-hidden="true"
                class="
                  block
                  absolute
                  h-0.5
                  w-5
                  bg-maroon-500
                  transform
                  transition
                  duration-500
                  ease-in-out
                "
                :class="{
                  'rotate-45': toggleHamburger,
                  ' -translate-y-1.5': !toggleHamburger,
                }"
              ></span>
              <span
                aria-hidden="true"
                class="
                  block
                  absolute
                  h-0.5
                  w-5
                  bg-maroon-500
                  transform
                  transition
                  duration-500
                  ease-in-out
                "
                :class="{ 'opacity-0': toggleHamburger }"
              ></span>
              <span
                aria-hidden="true"
                class="
                  block
                  absolute
                  h-0.5
                  w-5
                  bg-maroon-500
                  transform
                  transition
                  duration-500
                  ease-in-out
                "
                :class="{
                  '-rotate-45': toggleHamburger,
                  ' translate-y-1.5': !toggleHamburger,
                }"
              ></span>
            </div>
          </button>

          <ul
            :class="[toggleHamburger ? 'flex' : 'hidden xl:flex']"
            class="w-full flex-col xl:flex-row mt-2 xl:mt-0 xl:justify-center"
          >
            <li
              v-for="(navLink, index) in navbarLinks"
              :key="navLink.index"
              class="
                static
                hover:bg-grey-700 hover:text-white
                border-b-4 border-transparent
                hover:border-maroon-500
              "
            >
              <div
                :id="'navlink-' + index"
                @mouseover="openMegaMenu(index)"
                @mouseleave="closeMegaMenu()"
                @click="navLinkClick(index)"
              >
                <a
                  href="#"
                  class="
                    relative
                    block
                    pt-3
                    pb-3
                    px-3
                    text-sm
                    lg:text-sm
                    font-normal
                    hover:bg-grey-700 hover:text-white
                    uppercase
                  "
                  @mouseover="megaMenuNavContent(navLink.slug)"
                  >{{ navLink.name }}</a
                >
                <div v-if="navLink.sub_category.length > 0">
                  <MegaMenuComponent
                    :mega-menu="megaMenu"
                    :mega-menu-index="index"
                    :nav-sub-links="navLink.sub_category"
                    :mega-menu-contents="megaMenuContents"
                    @megaMenuSubNavContent="megaMenuSubNavContent"
                    @megaMenuNewsLinkClick="megaMenuNewsLinkClick"
                  />
                </div>
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </div>
</template>

<script>
import MegaMenuComponent from '~/components/partials/navbar/MegaMenuComponent.vue'
export default {
  name: 'Navbar',
  components: {
    MegaMenuComponent,
  },
  data() {
    return {
      toggleHamburger: null,
      megaMenu: null,
      megaMenuContents: null,
      navbarLinks: null,
      news: null,
    }
  },
  watch: {
    '$store.state.categories'() {
      this.navbarLinks = this.$store.state.categories
    },
    '$store.state.news'() {
      this.news = this.$store.state.news
    },
  },
  methods: {
    openMegaMenu(index) {
      this.megaMenu = index
    },
    closeMegaMenu() {
      this.megaMenu = null
    },
    megaMenuNavContent(navLinkSlug) {
      this.megaMenuContents = this.news.filter(
        (data) => data.main_category.slug === navLinkSlug
      )
    },
    megaMenuSubNavContent(navSubLinkSlug) {
      this.megaMenuContents = this.news.filter(
        (data) => data.sub_category && data.sub_category.slug === navSubLinkSlug
      )
    },
    megaMenuNewsLinkClick(){
      this.closeMegaMenu()
    },
    navLinkClick(index) {
      setTimeout(function () {
        document.getElementById('navlink-' + index).scrollIntoView()
      }, 10)
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
