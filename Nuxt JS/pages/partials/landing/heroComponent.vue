<template>
	<div class="col-12">
		<v-row justify="center">
			<!-- HERO SECTION -->
			<div class="hero-main">
				<div class="row">
					<div class="hero-content-wrapper my-40px xl:my-[60px]">
						<div class="hero-text">
							<h2
								class="font-25 font-md-40 font-lg-46 font-xl-54 font-xxl-66 mt-0 xl:mt-12 theme-text-color"
							>
								Welcome to the<br />
								<span
									class="font-30 font-md-44 font-lg-48 font-xl-58 font-xxl-66 font-bold banner-text-gradient"
									>Millionaire</span
								>
								<span
									class="font-30 font-md-44 font-lg-48 font-xl-58 font-xxl-66 font-bold theme-text-color"
									>Club</span
								>
							</h2>
							<p class="font-15 font-lg-18 theme-text-color opacity-75 my-3">
								Facilisi ipsum nunc dolor, viverra ornare. Odio commodo auctor nulla id et, quisque
								eu. Diam, nulla leo lectus arcu neque, aliquam. Tortor ut proin nibh rhoncus
								phasellus mattis.
							</p>
							<div class="w-auto flex items-center mt-12 hero-btn-wrapper">
								<NuxtLink to="/explore">
									<v-btn
										class="px-3 px-lg-3 py-4 py-lg-2 btn-grad rounded-lg lg:w-[154px] w-[250px]"
										height="auto"
									>
										<span class="capitalize font-16 font-lg-18 py-1">Explore</span>
									</v-btn></NuxtLink
								>
							</div>
						</div>
						<div class="w-auto hidden lg:flex flex items-center justify-center">
							<img
								class="img-fluid lg:min-w-[337px] xl:min-w-[337px]"
								src="~/static/img/landing/hero-section-1.svg"
								alt="hero-img"
							/>
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
		name: 'HeroComponent',
	}
</script>

<style>
	.hero-main {
		@apply w-full px-7 py-7;
	}
	.hero-content-wrapper {
		@apply flex flex-wrap;
	}
	.hero-text {
		@apply lg:w-6/12 sm:w-full xl:py-12 py-0;
	}
	.theme-text-color {
		@apply text-primary dark:text-white;
	}
</style>
