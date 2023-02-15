<template>
	<v-row
		justify="center"
		align="center"
		class="home-page"
	>
		<!-- HERO SECTION -->
		<HeroComponent />
		<!-- HERO SECTION END  -->

		<!-- COUNTER SECTION  -->
		<CounterComponent />
		<!-- COUNTER SECTION END  -->

		<!-- ABOUT US SECTION -->
		<AboutUsComponent />
		<!-- ABOUT US SECTION END -->

		<!-- TRENDING SECTION  -->
		<TrendingComponent />
		<!-- TRENDING SECTION END -->

		<!-- OUR TEAMS SECTION  -->
		<OurTeamsComponent />
		<!-- OUR TEAMS SECTION END -->

		<!-- COMMUNITY SECTION  -->
		<CommunityComponent />
		<!-- COMMUNITY SECTION END -->

		<!-- FAQS SECTION  -->
		<FaqsComponent />
		<!-- FAQS SECTION END -->
	</v-row>
</template>

<script>
	import HeroComponent from './partials/landing/heroComponent.vue'
	import CounterComponent from './partials/landing/counterComponent.vue'
	import AboutUsComponent from './partials/landing/aboutUsComponent.vue'
	import TrendingComponent from './partials/landing/trendingComponent.vue'
	import OurTeamsComponent from './partials/landing/ourTeamsComponent.vue'
	import CommunityComponent from './partials/landing/communityComponent.vue'
	import FaqsComponent from './partials/landing/faqsComponent.vue'

	export default {
		name: 'IndexPage',
		components: {
			HeroComponent,
			CounterComponent,
			AboutUsComponent,
			TrendingComponent,
			OurTeamsComponent,
			CommunityComponent,
			FaqsComponent,
		},
		mounted() {
			console.log(this.$store.state.counter)
			const body = document.body
			body.classList.add('dark')
		},
	}
</script>
