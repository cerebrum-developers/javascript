<template>
	<v-main>
		<v-row
			justify="center"
			align="center"
		>
			<v-container>
				<div class="search-row pa-0">
					<div class="lg:w-1/2 sm:w-full md:w-1/2">
						<v-text-field
							prepend-inner-icon="mdi-magnify"
							label="Search by name or attributes"
							solo
							light
							type="search"
							single-line
						>
							<!-- <v-icon slot="prepend " color="black" class="p-3 bg-white mt-0 mr-0">
                                mdi-magnify
                            </v-icon> -->
						</v-text-field>
					</div>
				</div>
			</v-container>
		</v-row>
		<v-row
			justify="center"
			align="center"
		>
			<v-container>
				<div class="w-full">
					<div>
						<div class="py-0 text-center">
							<h2
								class="font-36 dark:text-white text-primary font-semibold mt-0"
							>
								Explore All blockchains
							</h2>
						</div>
					</div>
				</div>
			</v-container>
		</v-row>
		<v-row
			justify="center"
			align="center"
		>
			<v-container
				fluid
				class="mt-5"
			>
				<div
					class="d-flex justify-space-between align-center flex-wrap"
				>
					<div class="row d-flex">
						<div
							class="w-6/12 sm:w-4/12 xl:w-2/12 px-3"
						>
							<v-select
								:menu-props="{ light: true }"
								:items="blockChain"
								label="Blockchain"
								solo
								light
							>
							</v-select>
						</div>

						<div
							class="w-6/12 sm:w-4/12 xl:w-2/12 px-3"
						>
							<v-select
								:menu-props="{ light: true }"
								:items="category"
								label="Category"
								solo
								light
							>
							</v-select>
						</div>

						<div
							class="w-6/12 sm:w-4/12 xl:w-2/12 px-3"
						>
							<v-select
								:menu-props="{ light: true }"
								:items="status"
								label="Status"
								solo
								light
							>
							</v-select>
						</div>

						<div
							class="w-6/12 sm:w-4/12 xl:w-2/12 px-3 xl:ml-auto"
						>
							<v-select
								:menu-props="{ light: true }"
								:items="sortBy"
								label="Sort By"
								solo
								light
							>
							</v-select>
						</div>

						<div class="w-auto explore-svg-main px-3">
							<div
								class="d-flex border explore-svg-wrapper border-black dark:border-white rounded cursor-pointer"
							>
								<div
									class="nft-active-grid h-12 d-flex align-center p-3 rounded"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
									>
										<path
											d="M10 2H2V10H10V2Z"
											fill="#fff"
										/>
										<path
											d="M22 2H14V10H22V2Z"
											fill="#fff"
										/>
										<path
											d="M22 14H14V22H22V14Z"
											fill="#fff"
										/>
										<path
											d="M10 14H2V22H10V14Z"
											fill="#fff"
										/>
									</svg>
								</div>
								<div
									class="h-12 d-flex explore-outline-svg align-center p-3 rounded"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
									>
										<path
											d="M7 3H3V7H7V3Z"
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
										<path
											d="M14 3H10V7H14V3Z"
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
										<path
											d="M14 10H10V14H14V10Z"
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
										<path
											d="M7 10H3V14H7V10Z"
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
										<path
											d="M14 17H10V21H14V17Z"
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
										<path
											d="M7 17H3V21H7V17Z"
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
										<path
											d="M21 10H17V14H21V10Z"
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
										<path
											d="M21 17H17V21H21V17Z"
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
										<path
											d="M21 3H17V7H21V3Z"
											stroke="#fff"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
								</div>
							</div>
						</div>
					</div>
				</div>
			</v-container>
		</v-row>
		<v-row align="center">
			<v-col
				col="12"
				sm="6"
				md="4"
				v-for="product in products"
				:key="product._id"
			>
				<NuxtLink
					:to="`/assets/ethereum/${product.slug}`"
				>
					<v-card
						class="nft-explore-card"
						light
					>
						<div class="w-full relative">
							<v-img
								class="align-end rounded-t h-[250px] object-cover"
								:src="product.assets[0].url"
							>
							</v-img>
							<div
								class="btn-grad text-white font-16 font-medium rounded-full py-2 px-6 absolute nft-card-category"
							>
								{{ product.collection.collection_name }}
							</div>
						</div>
						<div class="nft-card-body p-3 pb-5 pt-7">
							<div class="d-flex items-center">
								<v-card-text
									class="d-flex items-center pr-0"
								>
									<div
										class="d-flex overflow-hidden rounded-full"
									>
										<v-img
											class="img-fluid"
											height="30"
											width="30"
											:src="product.user.profile_image"
										>
										</v-img>
									</div>
									<div
										class="font-12 font-lg-13 font-xl-13 font-xxl-16 font-semibold ms-2"
									>
										{{ product.user.firstname }}
										{{ product.user.lastname }}
									</div>
								</v-card-text>

								<v-card-text
									class="pl-0 d-flex justify-end"
								>
									<p
										class="font-12 font-lg-14 font-xl-14 font-semibold mb-0 nft-duration"
									>
										12 Days 7hrs
									</p>
									<p
										class="font-12 font-lg-14 font-xl-14 font-semibold mb-0 nft-duration-left ml-2"
									>
										Left
									</p>
								</v-card-text>
							</div>
							<v-card-text class="d-flex pt-1 pb-3">
								<p
									class="pb-0 font-16 font-xl-20 font-bold mb-0"
								>
									{{ product.name }}
								</p>
							</v-card-text>

							<div class="px-4">
								<p
									class="pb-0 font-16 font-medium mb-0 text-slate-500"
								>
									Highest bid
								</p>
								<div
									class="d-flex justify-space-between align-center"
								>
									<div class="font-16 font-semibold">
										{{ product.price }} ETH
									</div>
									<div
										class="d-flex heart-svgbox justify-space-between align-center cursor-pointer"
										onclick="makeActive()"
										id="heart_box"
									>
										<div class="cursor-pointer">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="heart-svg"
												width="22"
												height="20"
												viewBox="0 0 22 20"
												fill="none"
											>
												<path
													d="M19.84 2.61012C19.3292 2.09912 18.7228 1.69376 18.0553 1.4172C17.3879 1.14064 16.6725 0.998291 15.95 0.998291C15.2275 0.998291 14.5121 1.14064 13.8446 1.4172C13.1772 1.69376 12.5707 2.09912 12.06 2.61012L11 3.67012L9.93997 2.61012C8.90827 1.57842 7.509 0.998826 6.04997 0.998826C4.59093 0.998826 3.19166 1.57842 2.15997 2.61012C1.12827 3.64181 0.548676 5.04108 0.548676 6.50012C0.548676 7.95915 1.12827 9.35842 2.15997 10.3901L3.21997 11.4501L11 19.2301L18.78 11.4501L19.84 10.3901C20.351 9.87936 20.7563 9.27293 21.0329 8.60547C21.3094 7.93801 21.4518 7.2226 21.4518 6.50012C21.4518 5.77763 21.3094 5.06222 21.0329 4.39476C20.7563 3.7273 20.351 3.12087 19.84 2.61012Z"
													fill="#9825B7"
												/>
											</svg>
										</div>
										<div class="font-16 font-semibold ms-2">
											{{ product.favoritesCount }}
										</div>
									</div>
								</div>
							</div>
						</div>
					</v-card>
				</NuxtLink>
			</v-col>
		</v-row>
	</v-main>
</template>

<script>
	export default {
		name: 'IndexPage',
		components: {},
		data: () => ({
			blockChain: ['Polygon', 'Ethereum', 'Cardano'],
			category: [
				'Art',
				'Music',
				'Sports',
				'Games',
				'Photography',
			],
			status: ['All', 'Buy', 'Auction'],
			sortBy: [
				'Recently added',
				'Price: low to high',
				'Price: high to low',
			],
			products: [],
		}),
		methods: {
			getProducts() {
				this.$axios
					.$get('/v1/products?allList=true')
					.then((response) => {
						this.products = response.data
					})
					.catch((error) => {
						console.log('Request canceled', error)
					})
			},
		},
		mounted() {
			this.getProducts()
		},
		created() {
			console.log(this.$store.state.counter)
		},
	}
</script>

<style>
	.search-row {
		@apply flex justify-center px-4 mx-5;
	}
</style>

<style lang="scss" scoped>
	::v-deep {
		html,
		body {
			background-color: #fff;

			#app.bg-1a2146 {
				background-color: #ffffff;
			}
		}
	}
</style>