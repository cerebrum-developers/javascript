<template>
	<div class="w-full my-5 px-3">
		<!-- HEADING SECTION  -->
		<v-row
			justify="center"
			align="center"
		>
			<div class="w-full px-3 flex justify-center mt-20">
				<div class="text-center team-heading">
					<h2 class="font-18 font-md-20 font-lg-20 font-xl-24 about-text-gradient">Creative</h2>
					<h2 class="font-24 font-lg-30 font-xl-36 font-semibold text-primary dark:text-white mt-0">
						Our Teams
					</h2>
					<p class="font-14 font-lg-16 text-primary dark:text-white opacity-75 mt-4 mb-8">
						Facilisi ipsum nunc dolor, viverra ornare. Odio commodo auctor nulla idet, quisque eu.
						Diam, nulla le
					</p>
				</div>
			</div>
		</v-row>
		<!-- CARDS SECTION -->
		<v-row
			justify="center"
			align="center"
		>
			<div class="w-full px-3 flex flex-wrap">
				<TeamComponent
					v-for="card in 4"
					:key="card"
				/>
			</div>
		</v-row>
	</div>
</template>

<script>
	import TeamComponent from './teamComponent.vue'
	export default {
		name: 'TeamsComponent',
		components: {
			TeamComponent,
		},
		data: () => ({
			model: null,
			colors: ['indigo', 'warning', 'pink darken-2', 'red lighten-1', 'deep-purple accent-4'],
			slides: ['First', 'Second', 'Third', 'Fourth', 'Fifth'],
		}),
	}
</script>
