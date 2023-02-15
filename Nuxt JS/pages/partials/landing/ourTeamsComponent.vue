<template>
	<div
		justify="center"
		align="center"
	>
		<TeamsComponent />
	</div>
</template>

<script>
	import TeamsComponent from '../teams/teamsComponent.vue'

	export default {
		name: 'OurTeamsComponent',
		components: {
			TeamsComponent,
		},
	}
</script>
