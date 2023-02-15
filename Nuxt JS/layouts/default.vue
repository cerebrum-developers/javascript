<template>
	<v-app>
		<v-main>
			<v-container>
				<!-- NAVBAR -->
				<NavbarComponent />
				<Nuxt />
				<!-- FOOTER  -->
				<FooterComponent />
			</v-container>
		</v-main>
	</v-app>
</template>

<script>
	import NavbarComponent from '../pages/partials/common/navbarComponent.vue'
	import FooterComponent from '../pages/partials/common/footerComponent.vue'
	export default {
		name: 'DefaultLayout',
		components: {
			NavbarComponent,
			FooterComponent,
		},
		data() {
			return {
				clipped: false,
				drawer: false,
				fixed: false,
				items: [
					{
						icon: 'mdi-apps',
						title: 'Welcome',
						to: '/',
					},
					{
						icon: 'mdi-chart-bubble',
						title: 'Inspire',
						to: '/inspire',
					},
				],
				miniVariant: false,
				right: true,
				rightDrawer: false,
				title: 'Vuetify.js',
			}
		},
	}
</script>
