<template>
	<div class="w-full">
		<v-main>
			<v-row
				justify="center"
				align="center"
			>
				<div
					class="w-full px-3 flex justify-center mt-20"
				>
					<div class="text-center team-heading">
						<h2
							class="font-24 font-lg-30 font-xl-36 font-semibold text-primary dark:text-white mt-0"
						>
							NFT Blog
						</h2>
						<p
							class="font-14 font-lg-18 text-primary dark:text-white opacity-75 mt-4 mb-5 mb-lg-16"
						>
							Recent NFT Marketplace Blog
						</p>
					</div>
				</div>
				<div class="w-[920px] px-3">
					<h2
						class="text-primary dark:text-white font-24 font-lg-30 font-xl-36 font-urbanist font-semibold mb-5"
					>
					{{ item.title }}
					</h2>

					<div class="div">
						<v-card-title class="pa-0">
							<div class="flex items-center">
								<div class="flex items-center">
									<v-img
										class="rounded-lg"
										max-height="58"
										max-width="58"
										:src="item.logo_image"
										alt="avatar"
									></v-img>
									<h6
										class="px-4 dark:text-white text-primary font-urbanist font-semibold"
									>
										{{ item.user_name}}
									</h6>
									<div class="border-l-2">
										<p
											class="font-16 dark:text-white text-primary mb-0 px-4"
										>
											{{ $moment(item.updatedAt).format('DD/MMM/YYYY')  }}
										</p>
									</div>
								</div>
							</div>
							<div class="my-7">
								<!-- <img src="~/static/img/blog-detail/blogdetail-bnr.svg" alt=""> -->
							</div>
							<div class="div">
								<p
									class="dark:text-white text-primary font-18 text-urbanist font-medium"
								>
								{{ item.body }}
								</p>
							</div>
						</v-card-title>
					</div>
				</div>
			</v-row>
		</v-main>
	</div>
</template>


<script>
	export default {
		name: 'IndexPage',
		data: () => ({
			item:[],
			loading: false,
			selection: 1,
		}),
		methods: {
			getBlog(param) {
				this.$axios
					.$get(`/v1/blog/${param}`, {
						headers: {
							token: localStorage.getItem('authToken'),
						}
					},
					)
					.then((response) => {
						console.log(response.data[0])
						this.item = response.data[0];
					})
					.catch((error) => {
						console.log('Request canceled', error)
					})
			},
		},
		mounted() {
			console.log(this.$route.params.slug)
			this.getBlog(this.$route.params.slug);
		},
	}
</script>
