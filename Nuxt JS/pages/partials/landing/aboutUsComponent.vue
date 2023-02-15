<template>
	<div class="col-12">
		<v-row
			justify="center"
			align="center"
		>
			<!-- HERO SECTION -->
			<div class="w-full px-4">
				<div class="row">
					<div
						class="flex flex-wrap justify-between items-center my-[40px] lg:my-[50px]"
					>
						<div class="about-us-image-wrapper">
							<img
								class="img-fluid min-w-[300px] md:max-w-[430px] xl:min-w-[492px]"
								src="~/static/img/landing/about-us.svg"
								alt="about-img"
							/>
						</div>
						<div class="w-full lg:w-6/12 py-0 px-2">
							<h2
								class="font-18 font-md-20 font-lg-24 about-text-gradient mb-2"
							>
								About Millionaire
							</h2>
							<h2
								class="font-26 font-md-30 font-lg-36 mt-0 font-semibold text-primary dark:text-white"
							>
								Let’s Drive into the world<br />
								of NFT
							</h2>
							<p
								class="font-14 font-lg-16 text-primary dark:text-white opacity-75 mt-6 mb-5"
							>
								Facilisi ipsum nunc dolor,viverra ornare.
								Odio commodo auctor nulla id et, quisque
								eu. Diam, nulla leo lectus arcu neque,
								aliquam.Tortor ut proin nibh rhoncus
								phasellus mattis.
							</p>
							<p
								class="font-14 font-lg-16 text-primary dark:text-white opacity-75 mb-6"
							>
								Facilisi ipsum nunc dolor, viverra ornare.
								Odio commodo auctor nulla id et, quisque
								eu. Diam, nulla leo lectus arcu neque,
								aliquam. Tortor ut proin nibh rhoncus
								phasellus mattis. nulla leo lectus arcu
								neque, aliquam. Tortor ut proin nibh
								rhoncus phasellus mattis.
							</p>
							<div class="w-auto flex align-center mt-8">
								<NuxtLink to="/explore">
									<v-btn
										class="px-1 px-lg-1 py-1 py-lg-1 btn-grad rounded-lg w-[250px] lg:w-[152px]"
										height="auto"
									>
										<span
											class="capitalize font-18 font-lg-20 bg-[#fff] dark:bg-[#1a2146] text-primary dark:text-white w-full h-full px-1 px-lg-1 py-2 rounded-lg"
											>Explore</span
										>
									</v-btn>
								</NuxtLink>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- HERO SECTION END  -->
		</v-row>
	</div>
</template>

<script>
	export default {
		name: 'AboutUsComponent',
	}
</script>
<style>
	.about-us-image-wrapper {
		@apply w-auto hidden lg:flex items-center justify-center;
	}
</style>