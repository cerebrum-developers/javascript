<template>
	<div class="col-12">
		<v-row
			justify="center"
			align="center"
		>
			<!-- COUNTER SECTION -->
			<div class="counter-section w-full lg:w-8/12 px-4 mx-auto">
				<div class="row">
					<div class="flex flex-wrap">
						<div
							v-for="item in counter"
							:key="item.title"
							class="counter-row w-full lg:w-4/12 md:w-4/12 lg:my-12 my-6 relative"
						>
							<div class="w-full flex flex-col align-center px-4">
								<h2
									class="font-25 font-md-32 font-lg-36 font-xl-38 font-xxl-48 font-weight-bold text-primary dark:text-white"
								>
									{{ item.title }}
								</h2>
								<p class="font-16 text-primary dark:text-white opacity-75">
									{{ item.description }}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- COUNTER SECTION END  -->
		</v-row>
	</div>
</template>

<script>
	export default {
		name: 'CounterComponent',
		data() {
			return {
				counter: [
					{
						title: '13K+',
						description: 'Number of sales',
					},
					{
						title: '15 ETH',
						description: 'Highest Sale',
					},
					{
						title: '734k+',
						description: 'Total value of sale',
					},
				],
			}
		},
	}
</script>
