<template>
	<div class="w-full">
		<!-- profile-page-start -->
		<v-main class="my-10">
			<v-row justify="center">
				<v-col>
					<div
						class="w-full flex justify-center align-center relative"
					>
						<!-- IF HAS COVER IMAGE  -->
						<div
							class="w-full cover-image position-relative"
							v-if="user.cover_image"
						>
							<v-img
								:src="user.cover_image"
								:lazy-src="user.cover_image"
								max-width="1440"
								max-height="320"
								min-height="320"
							>
								<template v-slot:placeholder>
									<v-row
										class="fill-height ma-0"
										align="center"
										justify="center"
									>
										<v-progress-circular
											indeterminate
											color="grey lighten-5"
										></v-progress-circular>
									</v-row>
								</template>
							</v-img>
						</div>

						<!-- IF COVER IS EMPTY -->
						<div
							class="w-full position-relative bg-black-opacity-2 min-h-[300px]"
							v-else
						></div>

						<!-- EDIT ICON -->
						<div
							class="absolute inset-0 m-auto flex justify-center align-center z-index-9"
						>
							<input
								id="coverImageInput"
								ref="coverImageInput"
								type="file"
								name="cover-upload"
								multiple=""
								accept="image/jpeg, image/png"
								v-on:input="onUploadCoverImage"
								class="hidden"
							/>
							<span
								id="cover-image-icon"
								class="cursor-pointer bg-black p-2 bg-opacity-40 rounded-full"
								@click="focusCoverFileInput()"
							>
								<v-icon class="hov_icon">{{
									icons.mdiPencil
								}}</v-icon>
							</span>
						</div>
					</div>
				</v-col>
			</v-row>
			<div class="mb-16 profile-wrapper">
				<div
					class="w-full relative w-[200px] h-[200px]"
				>
					<!-- IF HAS PROFILE IMAGE -->
					<div
						class="cover-image position-relative"
						v-if="user.profile_image"
					>
						<v-img
							:src="user.profile_image"
							:lazy-src="user.profile_image"
							max-width="200"
							max-height="200"
							min-height="200"
							class="profile_img"
						>
							<template v-slot:placeholder>
								<v-row
									class="fill-height ma-0"
									align="center"
									justify="center"
								>
									<v-progress-circular
										indeterminate
										color="grey lighten-5"
									></v-progress-circular>
								</v-row>
							</template>
						</v-img>
					</div>

					<!-- IF PROFILE IMAGE IS EMPTY -->
					<div
						class="w-full position-relative bg-black-opacity-2 w-[200px] h-[200px] rounded-full"
						v-else
					></div>

					<!-- EDIT ICON -->
					<div
						class="absolute inset-0 m-auto flex justify-center align-center"
					>
						<input
							id="coverImageInput"
							ref="coverImageInput"
							type="file"
							name="cover-upload"
							multiple=""
							accept="image/jpeg, image/png"
							v-on:input="onUploadCoverImage"
							class="hidden"
						/>
						<span
							id="cover-image-icon"
							class="cursor-pointer bg-black p-2 bg-opacity-40 rounded-full"
							@click="focusCoverFileInput()"
						>
							<v-icon class="hov_icon">{{
								icons.mdiPencil
							}}</v-icon>
						</span>
					</div>
				</div>

				<div class="flex justify-between mt-7">
					<h4
						class="text-primary dark:text-white font-semibold font-30 font-urbanist"
					>
						{{
							user.firstname
								? `${user.firstname} ${user.lastname}`
								: 'Unnamed'
						}}
					</h4>
					<v-icon>{{ icons.mdiShareVariant }}</v-icon>
				</div>

				<div class="flex items-center">
					<img
						src="~/static/img/etherum.svg"
						alt=""
					/>
					<p
						class="text-primary dark:text-white mb-0 ps-3"
					>
						.
						{{ user.walletHash ? user.walletHash : '' }}
					</p>
					<p
						v-if="true === false"
						class="text-primary dark:text-white mb-0 ms-6"
					>
						Joined August 2022
					</p>
				</div>

				<div class="mt-7 product-owner-detail">
					<v-card class="product-tab-section">
						<v-tabs v-model="tab">
							<v-tab
								class="product-tab"
								active-class="active-product-tab"
							>
								Collected
							</v-tab>
							<v-tab
								class="product-tab"
								active-class="active-product-tab"
							>
								Created
							</v-tab>
							<v-tab
								class="product-tab"
								active-class="active-product-tab"
							>
								Favourited
							</v-tab>
							<v-tab
								class="product-tab"
								active-class="active-product-tab"
							>
								Activity
							</v-tab>

							<v-tab
								class="product-tab"
								active-class="active-product-tab"
							>
								Collections
							</v-tab>

							<div class="menu-dropdown">
								<v-menu offset-x>
									<template
										v-slot:activator="{ on, attrs }"
									>
										<v-btn
											dark
											v-bind="attrs"
											v-on="on"
										>
											Menu
										</v-btn>
									</template>
									<v-list>
										<v-list-item
											v-for="(item, index) in items"
											:key="index"
										>
											<v-list-item-title>{{
												item.title
											}}</v-list-item-title>
										</v-list-item>
									</v-list>
								</v-menu>
							</div>
						</v-tabs>

						<div class="w-full">
							<hr />
						</div>

						<v-tabs-items v-model="tab">
							<v-tab-item>
								<v-card flat>
									<v-card-text>
										<div class="search-row text-start ma-0">
											<div class="w-full mt-3">
												<v-row>
													<v-col
														col="12"
														sm="12"
														md="6"
														lg="7"
														class="pa-0"
													>
														<v-text-field
															prepend-inner-icon="mdi-magnify"
															label="Search by name or attributes"
															solo
															light
															type="search"
															class="ma-0"
															single-line
														>
														</v-text-field>
													</v-col>
													<v-col
														col="12"
														sm="12"
														md="6"
														lg="3"
														class="pa-0 ms-3"
													>
														<v-select
															:menu-props="{ light: true }"
															:items="Recently"
															label="Sort By"
															solo
															light
														>
														</v-select>
													</v-col>
												</v-row>
											</div>
										</div>
									</v-card-text>
								</v-card>
							</v-tab-item>

							<v-tab-item>
								<v-card flat>
									<!-- <div>
                    <div class="search-row text-start ma-0">
                      <div class="w-full mt-3">
                        <v-row>
                          <v-col col="12" sm="12" md="6" lg="7" class="pa-0">
                            <v-text-field
                              prepend-inner-icon="mdi-magnify"
                              label="Search by name or attributes"
                              solo
                              light
                              type="search"
                              class="ma-0"
                              single-line
                            >
                            </v-text-field>
                          </v-col>
                          <v-col
                            col="12"
                            sm="12"
                            md="6"
                            lg="3"
                            class="pa-0 ms-3"
                          >
                            <v-select
                              :menu-props="{ light: true }"
                              :items="Recently"
                              label="Sort By"
                              solo
                              light
                            >
                            </v-select>
                          </v-col>
                        </v-row>
                      </div>
                    </div>
                </div> -->
									<v-row
										justify="center"
										align="center"
									>
										<div
											class="w-full px-3 flex flex-wrap my-3"
										>
											<ProductComponent
												v-for="product in products"
												:key="product._id"
												:productData="product"
											/>
										</div>
									</v-row>
								</v-card>
							</v-tab-item>

							<v-tab-item>
								<v-card flat>
									<v-row
										justify="center"
										align="center"
									>
										<div
											class="w-full px-3 flex flex-wrap my-3"
										>
											<ProductComponent
												v-for="favorite in favorites"
												:key="favorite._id"
												:productData="favorite"
											/>
										</div>
									</v-row>
								</v-card>
							</v-tab-item>

							<v-tab-item>
								<v-card flat>
									<v-row
										justify="center"
										align="center"
									>
										<div
											class="w-full px-3 flex flex-wrap my-3"
										>
											Asla
										</div>
									</v-row>
								</v-card>
							</v-tab-item>

							<v-tab-item>
								<v-card flat>
									<v-row
										justify="center"
										align="center"
									>
										<v-col
											sm="12"
											md="4"
											lg="4"
											class="mt-6 text-left"
										>
											<ul class="pl-0">
												<li>
													<a href="">Art</a>
												</li>
												<li>
													<a href="">Sciense</a>
												</li>
												<li>
													<a href="">My Collection1</a>
												</li>
												<li>
													<a href="">My Collection2</a>
												</li>
											</ul>
										</v-col>
										<v-col
											sm="12"
											md="6"
											lg="6"
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
															{{
																product.collection.collection_name
															}}
														</div>
													</div>
													<div
														class="nft-card-body p-3 pb-5 pt-7"
													>
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
																		:src="
																			product.user.profile_image
																		"
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
														<v-card-text
															class="d-flex pt-1 pb-3"
														>
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
																<div
																	class="font-16 font-semibold"
																>
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
																	<div
																		class="font-16 font-semibold ms-2"
																	>
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
								</v-card>
							</v-tab-item>
						</v-tabs-items>
					</v-card>
				</div>
			</div>
		</v-main>
		<!-- profile-page-end -->
	</div>
</template>

<script>
	import {
		mdiPencil,
		mdiShareVariant,
	} from '@mdi/js'
	import ProductComponent from '../partials/products/productComponent.vue'

	export default {
		middleware: 'auth',
		name: 'ProfilePage',
		components: {
			ProductComponent,
		},
		data: () => ({
			baseUrl: 'https://stgn.appsndevs.com/nft/',
			user: {},
			favorites: [],
			products: [],
			icons: {
				mdiPencil,
				mdiShareVariant,
			},
			Recently: [
				'Recently listed',
				'Recently created',
				'Recently sold',
				'Recently recieved',
			],
			tab: null,
			tabs: [
				{
					tab: 'Collected',
					content: 'list of owners',
				},
				{ tab: 'Created', content: 'list of bids' },
				{
					tab: 'Favourited',
					content: 'list of details',
				},
				{
					tab: 'Activity',
					content: 'list of history',
				},
			],
			btns: [['Large', 'lg']],
			items: [
				{ title: 'Offers made' },
				{ title: 'Offers recieved' },
				{ title: 'Active listings' },
				{ title: 'Inactive listings' },
				{ title: 'Hidden' },
			],
		}),
		mounted() {
			this.getProfile()
			this.getFavoritesProducts()
			this.getUserProducts()
		},
		methods: {
			focusCoverFileInput() {
				console.log('rrr')
				document
					.getElementById('coverImageInput')
					.click()
			},
			onUploadCoverImage(event) {
				console.log(
					'event.target.files[0]',
					event.target.files[0]
				)
				const formData = new FormData()
				formData.append(
					'asset',
					event.target.files[0]
				)
				const config = {
					headers: {
						'Content-Type': 'multipart/form-data',
						token: localStorage.getItem('authToken'),
					},
				}
				this.$axios
					.$post('/v1/assets', formData, config)
					.then((response) => {
						this.user.cover_image = ''
						console.log('asset ', response.data)
						this.user.cover_image =
							this.baseUrl + response.data
					})
					.catch((error) => {
						console.log('Request canceled', error)
					})
			},
			getProfile() {
				this.$axios
					.$get('/v1/users/profile', {
						headers: {
							token: localStorage.getItem('authToken'),
						},
					})
					.then((response) => {
						this.user = response.data
					})
					.catch((error) => {
						console.log('Request canceled', error)
					})
			},
			getFavoritesProducts() {
				this.$axios
					.$get('/v1/favorites', {
						headers: {
							token: localStorage.getItem('authToken'),
						},
					})
					.then((response) => {
						this.favorites = response.data
					})
					.catch((error) => {
						console.log('Request canceled', error)
					})
			},
			getUserProducts() {
				this.$axios
					.$get('/v1/products', {
						headers: {
							token: localStorage.getItem('authToken'),
						},
					})
					.then((response) => {
						console.log(
							'response.data  ',
							response.data
						)
						this.products = response.data
					})
					.catch((error) => {
						console.log('Request canceled', error)
					})
			},
		},
	}
</script>
