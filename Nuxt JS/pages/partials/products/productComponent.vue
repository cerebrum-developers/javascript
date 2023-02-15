<template>
	<div class=" mb-3 w-full sm:w-6/12 md:w-6/12 lg:w-4/12 xl:w-3/12 xxl:w-3/12 px-lg-3 px-sm-3 px-md-3">
		<NuxtLink :to="`/assets/ethereum/${productData.slug}`" class="h-full">
			<div class="w-full h-full card my-3 text-white dark:text-primary">
				<div class="w-full h-full inner-card p-6">
					<img
						class="img-fluid w-full h-[200px] object-cover"
						:src="productData.assets[0].url"
						alt="card"
					/>
					<div class="flex flex-wrap py-5 items-center">
						<img
							class="img-fluid w-10 rounded-full"
							:src="productData.user.profile_image"
							alt="card-creator"
						/>
						<div class="px-4">
							<p class="font-14 mb-0 leading-7 text-primary dark:text-white">
								@{{ productData.user.firstname }}
							</p>
							<p class="font-12 mb-0 text-primary dark:text-white">Creator</p>
						</div>
					</div>
					<div class="monkey-txt-border relative">
						<h5 class="font-16 font-lg-20 font-semibold pb-4 text-primary dark:text-white">
							{{ productData.name }}
						</h5>
						<div class="w-7/12">
							<hr />
						</div>
					</div>
					<p class="font-14 font-lg-18 font-medium pt-4 mb-2 text-primary dark:text-white">
						{{ productData.price }} ETH
					</p>
				</div>
			</div>
		</NuxtLink>
	</div>
</template>

<script>
	export default {
		name: 'ProductComponent',
		props: {
			productData: {
				type: Object,
			},
		},
	}
</script>
