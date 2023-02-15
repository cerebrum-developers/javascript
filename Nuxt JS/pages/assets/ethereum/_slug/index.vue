<template>
	<v-main v-if="product.name">
		<v-row
			justify="center"
			align="center"
		>
			<v-container>
				<div class="flex justify-center mt-12 w-full">
					<div class="team-heading text-center">
						<div class="py-0 text-center">
							<h2 class="font-36 text-primary dark:text-white font-semibold mt-0 font-urbanist">
								Item Details
							</h2>
							<p
								v-if="true === false"
								class="font-18 font-medium text-primary dark:text-white mt-3 font-urbanist mb-2"
							>
								{{ product.about }}
							</p>
						</div>
					</div>
				</div>
			</v-container>
		</v-row>
		<v-row
			justify="center"
			align="start"
			class="relative"
		>
			<v-col
				cols="12"
				sm="6"
				class="sticky top-5"
			>
				<div class="sticky top-5">
					<div class="w-auto flex align-center justify-center relative">
						<div class="product-detail-img">
							<img
								class="img-fluid min-w-[290px] md:max-w-[380px] xl:min-w-[540px]"
								:src="product.assets[0].url"
								alt="about-img"
							/>
							<div class="product-detail-img-txt absolute top-9 left-8 2xl:left-24 min-w[30px]">
								<span class="px-4 py-2 rounded-lg font-urbanist font-14">{{
									product.collection.collection_name
								}}</span>
							</div>
						</div>
					</div>
					<!-- <v-carousel>
                        <v-carousel-item v-for="(item, i) in items" :key="i" :src="item.src"
                            reverse-transition="fade-transition" transition="fade-transition"></v-carousel-item>
                    </v-carousel> -->
				</div>
			</v-col>
			<v-col
				cols="12"
				sm="6"
			>
				<div>
					<div>
						<div>
							<div class="flex align-start justify-between flex-wrap">
								<div>
									<p class="pb-0 text-primary dark:text-white font-urbanist font-24 font-bold mb-0">
										{{ product.name }}
									</p>
								</div>
								<div class="flex flex-end">
									<div class="flex align-center justify-end">
										<div
											class="header-options cursor-pointer"
											@click="favoriteItem()"
										>
											<div class="flex align-center justify-center">
												<span>
													<svg
														width="12"
														height="12"
														viewBox="0 0 12 12"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															d="M11.0747 1.69216C10.7815 1.39881 10.4333 1.1661 10.0502 1.00733C9.66699 0.848564 9.25629 0.766846 8.84153 0.766846C8.42677 0.766846 8.01606 0.848564 7.63289 1.00733C7.24972 1.1661 6.90158 1.39881 6.60837 1.69216L5.99985 2.30068L5.39132 1.69216C4.79905 1.09989 3.99576 0.767153 3.15816 0.767153C2.32057 0.767153 1.51728 1.09989 0.925005 1.69216C0.332734 2.28443 6.24059e-09 3.08772 0 3.92532C-6.24059e-09 4.76292 0.332734 5.56621 0.925005 6.15848L1.53353 6.767L5.99985 11.2333L10.4662 6.767L11.0747 6.15848C11.368 5.86526 11.6007 5.51713 11.7595 5.13395C11.9183 4.75078 12 4.34008 12 3.92532C12 3.51055 11.9183 3.09985 11.7595 2.71668C11.6007 2.33351 11.368 1.98537 11.0747 1.69216Z"
															fill="#838383"
														/>
													</svg>
												</span>
												<span class="ml-1 font-14 font-semibold text-primary dark:text-white mb-0"
													>15K</span
												>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div class="flex align-start justify-between flex-wrap">
								<div>
									<p
										class="pb-0 text-primary dark:text-white font-16 font-urbanist font-semibold mb-0 mt-3"
									>
										{{ product.description }}
									</p>
								</div>
							</div>

							<div>
								<p
									class="pb-0 text-primary dark:text-white font-16 font-normal font-urbanist mb-0 pt-5 leading-7 pe-5"
								>
									Commodo elementum scelerisque varius aliquet. Etiam sagittis dignissim aliquam
									euismod sit posuere vulputate mauris pharetra. Id viverra nec in morbi mattis.
									Nisi tellus tempor quam pretium vel malesuada felis. Feugiat massa vulputate
									risus,
								</p>
							</div>
							<div class="border-b my-4"></div>
							<v-row
								justify="center"
								align="center"
							>
								<v-col cols="6">
									<p
										class="pb-0 text-primary dark:text-white font-18 font-semibold font-urbanist mb-0 pt-2"
									>
										Creator
									</p>
									<div class="flex justify-start align-center mt-4">
										<div class="d-flex w-10 h-10 overflow-hidden rounded-full">
											<v-img
												class=""
												:src="product.user.profile_image"
											>
											</v-img>
										</div>
										<p
											class="pb-0 text-primary dark:text-white font-16 font-semibold font-urbanist mb-0 ml-3"
										>
											{{ product.user.firstname }} {{ product.user.lastname }}
										</p>
									</div>
								</v-col>
								<v-col cols="6">
									<p
										class="pb-0 text-primary dark:text-white font-18 font-urbanist font-semibold mb-0 pt-2"
									>
										Collection
									</p>
									<div class="flex justify-start align-center mt-4">
										<div class="d-flex max-w-[40px] h-10 overflow-hidden rounded-full">
											<v-img
												class=""
												:src="product.collection.logo_image"
											>
											</v-img>
										</div>
										<p
											class="pb-0 text-primary dark:text-white font-urbanist font-16 font-semibold mb-0 ml-3"
										>
											{{ product.collection.collection_name }}
										</p>
									</div>
								</v-col>
							</v-row>
						</div>
					</div>
					<div class="mt-7 product-owner-detail">
						<v-card class="product-tab-section">
							<v-tabs v-model="tab">
								<v-tab
									class="product-tab"
									active-class="active-product-tab"
								>
									Owners
								</v-tab>
								<v-tab
									class="product-tab"
									active-class="active-product-tab"
								>
									Bids
								</v-tab>
								<v-tab
									class="product-tab"
									active-class="active-product-tab"
								>
									Details
								</v-tab>
								<v-tab
									class="product-tab"
									active-class="active-product-tab"
								>
									History
								</v-tab>
							</v-tabs>
							<div class="w-full">
								<hr />
							</div>
							<v-tabs-items v-model="tab">
								<v-tab-item>
									<v-card flat>
										<v-card-text>
											<div class="owner flex items-center">
												<div class="owner-svg">
													<img
														src="~/static/img/product-detail/User.svg"
														alt="product-detail"
													/>
												</div>
												<div class="owner-txt ps-4">
													<h5
														class="font-18 text-primary dark:text-white font-urbanist font-semibold"
													>
														Bid 10 wETH
													</h5>
													<p
														class="font-14 text-[#747681] dark:text-white font-urbanist font-semibold mb-0"
													>
														by domiriganji 11/3/2021, 10:57 AM
													</p>
												</div>
											</div>
											<div class="owner flex items-center my-8">
												<div class="owner-svg">
													<img
														src="~/static/img/product-detail/User.svg"
														alt="product-detail"
													/>
												</div>
												<div class="owner-txt ps-4">
													<h5
														class="font-18 text-primary dark:text-white font-urbanist font-semibold"
													>
														Bid 10 wETH
													</h5>
													<p
														class="font-14 text-[#747681] dark:text-white font-urbanist font-semibold mb-0"
													>
														by domiriganji 11/3/2021, 10:57 AM
													</p>
												</div>
											</div>
											<div class="owner flex items-center">
												<div class="owner-svg">
													<img
														src="~/static/img/product-detail/User.svg"
														alt="product-detail"
													/>
												</div>
												<div class="owner-txt ps-4">
													<h5
														class="font-18 text-primary dark:text-white font-urbanist font-semibold"
													>
														Bid 10 wETH
													</h5>
													<p
														class="font-14 text-[#747681] dark:text-white font-urbanist font-semibold mb-0"
													>
														by domiriganji 11/3/2021, 10:57 AM
													</p>
												</div>
											</div>
										</v-card-text>
									</v-card>
								</v-tab-item>
								<v-tab-item>
									<v-card flat>
										<v-card-text>
											<div class="owner flex items-center">
												<div class="owner-svg">
													<img
														src="~/static/img/product-detail/User.svg"
														alt="product-detail"
													/>
												</div>
												<div class="owner-txt ps-4">
													<h5
														class="font-18 text-primary dark:text-white font-urbanist font-semibold"
													>
														Bid 10 wETH
													</h5>
													<p
														class="font-14 text-[#747681] dark:text-white font-urbanist font-semibold mb-0"
													>
														by domiriganji 11/3/2021, 10:57 AM
													</p>
												</div>
											</div>
											<div class="owner flex items-center my-8">
												<div class="owner-svg">
													<img
														src="~/static/img/product-detail/User.svg"
														alt="product-detail"
													/>
												</div>
												<div class="owner-txt ps-4">
													<h5
														class="font-18 text-primary dark:text-white font-urbanist font-semibold"
													>
														Bid 10 wETH
													</h5>
													<p
														class="font-14 text-[#747681] dark:text-white font-urbanist font-semibold mb-0"
													>
														by domiriganji 11/3/2021, 10:57 AM
													</p>
												</div>
											</div>
											<div class="owner flex items-center">
												<div class="owner-svg">
													<img
														src="~/static/img/product-detail/User.svg"
														alt="product-detail"
													/>
												</div>
												<div class="owner-txt ps-4">
													<h5
														class="font-18 text-primary dark:text-white font-urbanist font-semibold"
													>
														Bid 10 wETH
													</h5>
													<p
														class="font-14 text-[#747681] dark:text-white font-urbanist font-semibold mb-0"
													>
														by domiriganji 11/3/2021, 10:57 AM
													</p>
												</div>
											</div>
										</v-card-text>
									</v-card>
								</v-tab-item>
								<v-tab-item>
									<v-card flat>
										<v-card-text>
											<div class="div">
												<div class="row align-items-center">
													<div class="col-md-6">
														<h5
															class="font-urbanist font-18 text-primary dark:text-white font-semibold mb-5"
														>
															Owner:
														</h5>
														<div class="row items-center">
															<div class="col-md-3">
																<img
																	src="~/static/img/product-detail/detail-svg.svg"
																	alt=""
																/>
															</div>
															<div class="col-md-9">
																<h5 class="font-18 font-semibold text-primary dark:text-white">
																	James Charlie
																</h5>
															</div>
														</div>
													</div>
													<div class="col-md-6">
														<h5
															class="font-urbanist font-18 text-primary dark:text-white font-semibold mb-5"
														>
															Blockchain:
														</h5>
														<div class="row items-center">
															<div class="col-md-3">
																<img
																	src="~/static/img/product-detail/blockchain-svg.svg"
																	alt=""
																/>
															</div>
															<div class="col-md-9">
																<h5 class="font-18 font-semibold text-primary dark:text-white">
																	Ethereum
																</h5>
															</div>
														</div>
													</div>
													<div class="col-12">
														<h5
															class="font-urbanist font-18 text-primary dark:text-white font-semibold mb-5"
														>
															Properties:
														</h5>
													</div>
												</div>
												<div class="d-block d-lg-flex justify-between">
													<div class="text-center border rounded-xl p-5 px-10">
														<p class="font-14 font-urbanist text-primary dark:text-white mb-2">
															Type
														</p>
														<h6
															class="font-16 font-semibold font-urbanist text-primary dark:text-white mb-1"
														>
															Legendary
														</h6>
														<p class="font-14 font-urbanist text-primary dark:text-white mb-2">
															12.6% rarity
														</p>
													</div>
													<div class="text-center border rounded-xl p-5 px-11 my-4 my-lg-0">
														<p class="font-14 font-urbanist text-primary dark:text-white mb-2">
															Body
														</p>
														<h6
															class="font-16 font-semibold font-urbanist text-primary dark:text-white mb-1"
														>
															Female
														</h6>
														<p class="font-14 font-urbanist text-primary dark:text-white mb-2">
															45.7% rarity
														</p>
													</div>
													<div class="text-center border rounded-xl p-5 px-9">
														<p class="font-14 font-urbanist text-primary dark:text-white mb-2">
															Hair
														</p>
														<h6
															class="font-16 font-semibold font-urbanist text-primary dark:text-white mb-1"
														>
															Mohan Thin
														</h6>
														<p class="font-14 font-urbanist text-primary dark:text-white mb-2">
															20% rarity
														</p>
													</div>
												</div>
											</div>
										</v-card-text>
									</v-card>
								</v-tab-item>
								<v-tab-item>
									<v-card flat>
										<v-card-text>
											<div class="owner flex items-center">
												<div class="owner-svg">
													<img
														src="~/static/img/product-detail/User.svg"
														alt="product-detail"
													/>
												</div>
												<div class="owner-txt ps-4">
													<h5
														class="font-18 text-primary dark:text-white font-urbanist font-semibold"
													>
														Bid 10 wETH
													</h5>
													<p
														class="font-14 text-[#747681] dark:text-white font-urbanist font-semibold mb-0"
													>
														by domiriganji 11/3/2021, 10:57 AM
													</p>
												</div>
											</div>
											<div class="owner flex items-center my-8">
												<div class="owner-svg">
													<img
														src="~/static/img/product-detail/User.svg"
														alt="product-detail"
													/>
												</div>
												<div class="owner-txt ps-4">
													<h5
														class="font-18 text-primary dark:text-white font-urbanist font-semibold"
													>
														Bid 10 wETH
													</h5>
													<p
														class="font-14 text-[#747681] dark:text-white font-urbanist font-semibold mb-0"
													>
														by domiriganji 11/3/2021, 10:57 AM
													</p>
												</div>
											</div>
											<div class="owner flex items-center">
												<div class="owner-svg">
													<img
														src="~/static/img/product-detail/User.svg"
														alt="product-detail"
													/>
												</div>
												<div class="owner-txt ps-4">
													<h5
														class="font-18 text-primary dark:text-white font-urbanist font-semibold"
													>
														Bid 10 wETH
													</h5>
													<p
														class="font-14 text-[#747681] dark:text-white font-urbanist font-semibold mb-0"
													>
														by domiriganji 11/3/2021, 10:57 AM
													</p>
												</div>
											</div>
										</v-card-text>
									</v-card>
								</v-tab-item>
							</v-tabs-items>
						</v-card>
					</div>
					<div class="border-b my-4"></div>
					<v-row
						justify="center"
						align="center"
					>
						<v-col
							cols="12"
							md="6"
						>
							<p class="pb-0 font-16 text-primary dark:text-white font-medium mb-0">Minimum bid</p>
							<div class="flex justify-start align-center mt-2">
								<p
									class="pb-0 font-16 font-md-18 font-lg-18 font-xl-18 font-xxl-28 text-primary dark:text-white font-bold mb-0"
								>
									{{ product.price }} ETH
								</p>
								<p
									v-if="true === false"
									class="pb-0 font-16 font-md-18 font-lg-18 font-xl-18 font-xxl-20 text-primary dark:text-white font-semibold mb-0"
								>
									$12,240.36
								</p>
							</div>
						</v-col>
						<v-col
							cols="12"
							md="6"
						>
							<div class="w-fit md:ml-0 lg:ml-auto">
								<p class="pb-0 font-16 pt-2 text-primary dark:text-white font-medium mb-0">
									Auctions ends in:
								</p>
								<div class="flex align-center mt-2">
									<div>
										<p
											class="pb-0 text-primary dark:text-white font-16 font-md-18 font-lg-18 font-xl-18 font-xxl-20 font-bold mb-0"
										>
											486
										</p>
										<p class="pb-0 text-primary dark:text-white font-16 font-medium mb-0 mt-2">
											Days
										</p>
									</div>
									<div class="ml-3">
										<p
											class="pb-0 font-16 font-md-18 font-lg-18 font-xl-18 font-xxl-20 text-primary dark:text-white font-bold mb-0"
										>
											11
										</p>
										<p class="pb-0 font-16 text-primary dark:text-white font-medium mb-0 mt-2">
											Hrs
										</p>
									</div>
									<div class="ml-3">
										<p
											class="pb-0 font-16 font-md-18 font-lg-18 font-xl-18 font-xxl-20 text-primary dark:text-white font-bold mb-0"
										>
											25
										</p>
										<p class="pb-0 font-16 text-primary dark:text-white font-medium mb-0 mt-2">
											Mins
										</p>
									</div>
									<div class="ml-3">
										<p
											class="pb-0 font-16 font-md-18 font-lg-18 font-xl-18 font-xxl-20 text-primary dark:text-white font-bold mb-0"
										>
											12
										</p>
										<p class="pb-0 font-16 text-primary dark:text-white font-medium mb-0 mt-2">
											Secs
										</p>
									</div>
								</div>
							</div>
						</v-col>
					</v-row>
					<div class="product-detail-btn">
						<v-row
							class="btn-row"
							align="center"
							justify="start"
						>
							<v-col
								cols="12"
								md="5"
								class="px-3"
							>
								<v-btn
									depressed
									class="btn-grad py-3 text-primary dark:text-white text-white w-full"
								>
									Buy Now
								</v-btn>
							</v-col>
							<v-col
								cols="12"
								md="6"
								class="px-3"
							>
								<v-btn class="px-0.5 py-0.5 btn-grad rounded-lg max-w-[190px]">
									<span
										class="capitalize font-18 font-lg-18 bg-[#fff] dark:bg-[#1a2146] text-primary dark:text-white w-full h-full px-7 pb-1.5 pt-1.5 rounded-lg"
									>
										place a Bid</span
									>
								</v-btn>
							</v-col>
						</v-row>
					</div>
				</div>
			</v-col>
		</v-row>
	</v-main>
</template>

<script>
	// import painting from ''
	export default {
		name: 'IndexPage',
		components: {},
		data: () => ({
			product: {},
			blockChain: ['Polygon', 'Ethereum', 'Cardano'],
			items: [
				{
					src: 'https://cdn.vuetifyjs.com/images/cards/docks.jpg',
				},
			],
			tab: null,
			tabs: [
				{ tab: 'Owners', content: 'list of owners' },
				{ tab: 'Bids', content: 'list of bids' },
				{ tab: 'Details', content: 'list of details' },
				{ tab: 'History', content: 'list of history' },
			],
			btns: [['Large', 'lg']],
			colors: ['#fff'],
		}),
		created() {
			this.getProduct(this.$route.params.slug)
		},
		mounted() {
			console.log(this.$store.state.counter)
			const body = document.body
			body.classList.add('dark')
		},
		methods: {
			getProduct(slug) {
				this.$axios
					.$get(`/v1/products/${slug}`)
					.then((response) => {
						this.product = response.data
					})
					.catch((error) => {
						console.log('Request canceled', error)
					})
			},
			favoriteItem() {
				this.$axios
					.$post(
						`/v1/favorites`,
						{
							product_id: this.product._id,
						},
						{
							headers: {
								token: localStorage.getItem('authToken'),
							},
						}
					)
					.then((response) => {})
					.catch((error) => {
						console.log('Request canceled', error)
					})
			},
		},
	}
</script>
