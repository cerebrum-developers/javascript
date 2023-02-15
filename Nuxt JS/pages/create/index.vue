<template>
	<div class="w-full">
		<v-main>
			<v-row
				justify="center"
				align="center"
			>
				<v-container>
					<div class="flex justify-center mt-12">
						<div class="team-heading text-center">
							<div class="py-0 text-center">
								<h2
									class="font-36 text-primary dark:text-white font-semibold mt-0 font-urbanist"
								>
									Create NFT
								</h2>
								<p
									class="font-18 font-medium text-primary dark:text-white mt-3 font-urbanist mb-2"
								>
									Lorem Ipsum has been the industry's
									standard dummy text ever since the 1500s,
								</p>
							</div>
						</div>
					</div>
				</v-container>
			</v-row>
			<v-row
				justify="center"
				class="relative"
			>
				<v-col
					cols="12"
					sm="6"
					md="4"
					class="sticky top-0"
				>
					<!-- <h6 class="text-primary dark:text-white font-20 font-urbanist font-semibold mb-3">Preview item</h6> -->
					<div class="sticky top-5">
						<v-card
							class="nft-explore-card mt-2 sticky top-0"
							light
						>
							<div
								v-if="productData.assets.length"
								class="w-full relative"
							>
								<v-img
									class="align-end rounded-t"
									:src="productData.assets[0].url"
								>
								</v-img>
								<div
									v-if="collection.collection_name"
									class="btn-grad text-white font-16 font-medium rounded-full py-2 px-6 absolute nft-card-category"
								>
									{{ collection.collection_name }}
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
												:src="user.profile_image"
											>
											</v-img>
										</div>
										<div
											class="font-12 font-lg-13 font-xl-13 font-xxl-16 font-semibold ms-2"
										>
											{{ user.firstname }}
											{{ user.lastname }}
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
									class="d-flex pt-1 pb-3 overflow-hidden"
								>
									<p
										v-if="productData.name"
										class="pb-0 font-16 font-xl-20 font-bold mb-0"
									>
										{{ productData.name }}
									</p>
								</v-card-text>
								<div
									class="px-4"
									v-if="productData.price"
								>
									<p
										class="pb-0 font-16 font-medium mb-0 text-slate-500"
									>
										Highest bid
									</p>
									<div
										class="d-flex justify-space-between align-center"
									>
										<div class="font-16 font-semibold">
											{{ productData.price }}
											ETH
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
												40
											</div>
										</div>
									</div>
								</div>
							</div>
						</v-card>
					</div>
				</v-col>
				<v-col
					cols="12"
					sm="6"
					md="8"
				>
					<div class="w-full px-3 flex w-full">
						<div class="create-nft-form w-full">
							<v-form
								ref="form"
								lazy-validation
								class="w-full"
							>
								<!-- FILE UPLOAD -->
								<div class="w-full mb-8">
									<label
										for="dropzone"
										class="font-urbanist dark:text-white text-primary font-20 font-semibold"
										>Upload file
									</label>

									<div
										class="w-full bg-transparent my-2 py-8 px-5 border-2 rounded"
										:class="
											validations.isEmptyImage
												? 'border-[#ff3939]'
												: 'border-CBCBCB'
										"
									>
										<div class="flex">
											<div class="w-full flex align-center">
												<p class="mb-0">
													PNG, JPG, GIF, WEBP or MP4 Max 100 MB
												</p>
											</div>
											<div class="w-auto">
												<input
													id="fileInput"
													ref="uploadFile"
													type="file"
													name="file-upload"
													multiple=""
													accept="image/jpeg, image/png"
													v-on:input="onUploadFiles"
													class="hidden"
												/>
												<v-btn
													class="px-1 px-lg-1 py-1 py-lg-1 btn-grad rounded-lg w-[189px]"
													height="auto"
													@click="focusFileInput()"
												>
													<span
														class="capitalize font-16 font-urbanist w-full h-full px-1 px-lg-1 py-3 rounded-lg"
														>Upload</span
													>
												</v-btn>
											</div>
										</div>
									</div>
								</div>

								<!-- TITLE SECTION -->
								<div class="w-full">
									<label
										for="title"
										class="font-urbanist dark:text-white text-primary font-20 font-semibold"
										>Title
									</label>
									<v-text-field
										v-model="productData.name"
										class="mt-2 bg-transparent"
										background-color="transparent"
										placeholder="Enter Title"
										required
										outlined
										solo
										flat
										:rules="validations.titleRules"
									></v-text-field>
								</div>

								<!-- PRICE SECTION -->
								<div class="w-full">
									<label
										for="price"
										class="font-urbanist dark:text-white text-primary font-20 font-semibold"
										>Price
									</label>
									<v-text-field
										v-model="productData.price"
										class="mt-2 bg-transparent"
										background-color="transparent"
										placeholder="Enter Price"
										required
										outlined
										solo
										flat
										:rules="validations.priceRules"
									></v-text-field>
								</div>

								<!-- DESCRIPTION SECTION -->
								<div class="w-full">
									<label
										for="description"
										class="font-urbanist dark:text-white text-primary font-20 font-semibold"
										>Description
									</label>
									<v-textarea
										v-model="productData.description"
										class="mt-2 bg-transparent"
										height="200"
										background-color="transparent"
										placeholder="Enter Description"
										required
										outlined
										solo
										flat
										no-resize
										:rules="validations.descriptionRules"
									>
									</v-textarea>
								</div>

								<!-- ABOUT SECTION -->
								<div class="w-full">
									<label
										for="about"
										class="font-urbanist dark:text-white text-primary font-20 font-semibold"
										>About
									</label>
									<v-textarea
										v-model="productData.about"
										class="mt-2 bg-transparent"
										height="200"
										background-color="transparent"
										placeholder="Enter About"
										required
										outlined
										solo
										flat
										no-resize
										:rules="validations.aboutRules"
									></v-textarea>
								</div>

								<!-- COLLECTION SECTION -->
								<div class="w-full">
									<label
										for="collection"
										class="font-urbanist dark:text-white text-primary font-20 font-semibold"
										>Collection
										
									</label>
									
										<NuxtLink  to="/collections">
											<v-tooltip right>
												<template v-slot:activator="{ on, attrs }">
													<v-icon small
														v-bind="attrs"
          												v-on="on">
														mdi-plus
													</v-icon>
												</template>
												<span>Create Collections</span>
											</v-tooltip>
										</NuxtLink >
									
									<v-select
										v-model="productData.collection_id"
										class="mt-2"
										:items="collections"
										label="Select Collection"
										background-color="transparent"
										item-text="collection_name"
										item-value="_id"
										required
										outlined
										solo
										flat
										no-resize
										:rules="validations.collectionRules"
									>
									</v-select>
									<!-- <v-textarea class="mt-2 bg-transparent" height="200" background-color="transparent"
                                        placeholder="Enter Collection" required outlined solo flat no-resize>
                                    </v-textarea> -->
								</div>
							</v-form>
							<div class="lg:flex mt-3">
								<div class="div">
									<v-btn
										@click="validateForm()"
										class="px-1 px-lg-1 py-1 py-lg-1 btn-grad rounded-lg w-[189px]"
										height="auto"
									>
										<span
											class="capitalize font-16 font-urbanist w-full h-full px-1 px-lg-1 py-3 rounded-lg"
											>Create</span
										>
									</v-btn>
								</div>
							</div>
						</div>
					</div>
				</v-col>
			</v-row>
		</v-main>
	</div>
</template>

<script>
	export default {
		name: 'CreateNFTPage',
		data: () => ({
			baseUrl:'https://stgn.appsndevs.com/nft/',
			collections: [],
			collection: {},
			loading: false,
			selection: 1,
			user: {},
			productData: {
				collection_id: '',
				name: '',
				description: '',
				about: '',
				price: '',
				properties: [],
				assets: [],
			},
			options: {
				url: 'http://httpbin.org/anything',
				acceptedFiles: 'image/*',
				autoProcessQueue: true,
			},
			url: '',
			validations: {
				isEmptyImage: false,
				titleRules: [
					(v) => !!v || 'Title is required',
					(v) =>
						(v && v.length <= 50) ||
						'Title must be less than 50 characters',
				],
				priceRules: [
					(v) => !!v || 'Price is required',
					(v) =>
						/^[0-9]*$/.test(v) || 'Price must be valid',
					(v) =>
						(v && v.length <= 10) ||
						'Price must be less than 10 characters',
				],
				descriptionRules: [
					(v) => !!v || 'Description is required',
					(v) =>
						(v && v.length <= 500) ||
						'Description must be less than 500 characters',
				],
				aboutRules: [
					(v) => !!v || 'About is required',
					(v) =>
						(v && v.length <= 500) ||
						'About must be less than 500 characters',
				],
				collectionRules: [
					(v) => !!v || 'Collection is required',
					(v) =>
						(v && v.length <= 50) ||
						'Collection must be less than 50 characters',
				],
			},
		}),
		methods: {
			validateForm() {
				if (
					!this.productData.assets.length &&
					!this.$refs.form.validate()
				) {
					this.validations.isEmptyImage = true
				} else if (this.$refs.form.validate()) {
					this.storeProduct()
				} else {
					return false
				}
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
			getCollections() {
				this.$axios
					.$get('/v1/collections', {
						headers: {
							token: localStorage.getItem('authToken'),
						},
					})
					.then((response) => {
						this.collections = response.data
					})
					.catch((error) => {
						console.log('Request canceled', error)
					})
			},
			storeProduct() {
				console.log(
					'this.productData',
					this.productData
				)
				this.$axios
					.$post('/v1/products', this.productData, {
						headers: {
							token: localStorage.getItem('authToken'),
						},
					})
					.then((response) => {
						this.$router.push('/explore')
						console.log(response)
					})
					.catch((error) => {
						console.log('Request canceled', error)
					})
			},
			focusFileInput() {
				document.getElementById('fileInput').click()
			},
			onUploadFiles(event) {
				this.productData.assets = []
				this.productData.assets.push({
					asset_type: 'image',
					url: URL.createObjectURL(
						event.target.files[0]
					),
				})
				console.log('fff')
				const formData = new FormData();
				formData.append('asset',event.target.files[0])
				const config = {
					headers: {
						'Content-Type': 'multipart/form-data',
						'token': localStorage.getItem('authToken'),
					}
				}
				this.$axios
					.$post('/v1/assets', formData, config)
					.then((response) => {
						console.log('asset ',response.data)
						if(!response.success){
							this.productData.assets = []	
						}
						this.productData.assets[0].url = this.baseUrl+response.data;	
						
					})
					.catch((error) => {
						console.log('Request canceled', error)
					})
			},
		},
		created() {
			this.getProfile()
			this.getCollections()
		},
		mounted() {
			// const instance = this.$refs.el.dropzone
		},
		watch: {
			'productData.collection_id'(newVal, oldVal) {
				this.collection = this.collections.find(
					(val) => val._id === newVal
				)
			},
			'productData.assets'(newVal, oldVal) {
				if (this.productData.assets.length) {
					this.validations.isEmptyImage = false
				} else {
					this.validations.isEmptyImage = true
				}
			},
		},
	}
</script>