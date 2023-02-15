<template>
	<div class="w-full my-5 px-3">
		<!-- COMMUNITY SECTION -->
		<v-row
			justify="center"
			align="center"
		>
			<div class="w-full px-5 py-4 py-lg-20 py-md-10">
				<div class="w-full card flex justify-center items-center rounded-lg">
					<div class="w-full text-center card-wrapper flex justify-center rounded-lg">
						<div class="inner-card team-heading text-center mt-20 mb-16">
							<h3
								class="font-sm-22 font-md-26 font-lg-30 font-xl-36 font-semibold text-primary dark:text-white"
							>
								Join Our Community
							</h3>
							<p class="font-16 font-lg-20 text-primary dark:text-white opacity-75 mt-6 mb-8">
								Meet the Team, artists and collections for problem updates, announcements, and more
							</p>
							<v-btn
								class="px-3 py-2 py-lg-3 btn-grad rounded-lg w-244px"
								height="auto"
							>
								<span class="capitalize font-16 py-1">Join Discord Community</span>
							</v-btn>
						</div>
					</div>
				</div>
			</div>
		</v-row>
	</div>
</template>

<script>
	export default {
		name: 'CommunityComponent',
		components: {},
		data: () => ({}),
	}
</script>
