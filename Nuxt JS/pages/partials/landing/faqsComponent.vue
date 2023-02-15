<template>
	<div class="w-full my-5 px-3">
		<!-- QUESTION SECTION -->
		<v-row
			justify="center"
			align="center"
			class="test"
		>
			<div class="w-full px-3">
				<div class="w-full px-3 flex justify-center items-center rounded-lg">
					<div class="question team-heading text-center mt-10 lg:mt-20">
						<h2 class="font-18 font-md-20 font-lg-20 font-xl-24 opacity-75 about-text-gradient">
							Quick Questions
						</h2>
						<h2
							class="font-24 font-lg-30 font-xl-36 font-semibold text-primary dark:text-white mt-0"
						>
							Common Question about NFT
						</h2>
						<p class="font-14 font-lg-16 text-primary dark:text-white opacity-75 mt-4 mb-8">
							Facilisi ipsum nunc dolor, viverra ornare. Odio commodo auctor nulla id et, quisque
							eu. Diam, nulla le
						</p>
					</div>
				</div>
			</div>
		</v-row>
		<!-- ACCORDIAN -->
		<v-row
			justify="center"
			align="center"
		>
			<div class="w-full flex justify-center landing-accordian">
				<div class="accordian-outer sm:my-3 lg:my-7 px-3">
					<div class="accordian-inner text-start">
						<v-expansion-panels
							accordion
							light
						>
							<v-expansion-panel
								v-for="(item, i) in 6"
								:key="i"
							>
								<v-expansion-panel-header>What is NFT?</v-expansion-panel-header>
								<v-expansion-panel-content>
									Elementum ullamcorper felis nulla scelerisque. Nunc enim nunc mattis leo massa.
									Elementum ullamcorper felis nulla scelerisque. Nunc enim nunc mattis leo massa.
								</v-expansion-panel-content>
							</v-expansion-panel>
						</v-expansion-panels>
					</div>
				</div>
			</div>
		</v-row>
	</div>
</template>

<script>
	export default {
		name: 'FaqsComponent',
		components: {},
		data: () => ({}),
	}
</script>
