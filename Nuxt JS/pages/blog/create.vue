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
									Write Blog
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
					sm="12"
					md="10"
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
										v-model="blogData.title"
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

                                <!-- Writer SECTION -->
								<div class="w-full">
									<label
										for="title"
										class="font-urbanist dark:text-white text-primary font-20 font-semibold"
										>Writer Name
									</label>
									<v-text-field
										v-model="blogData.user_name"
										class="mt-2 bg-transparent"
										background-color="transparent"
										placeholder="Enter Writer Name"
										required
										outlined
										solo
										flat
										:rules="validations.titleRules"
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
										v-model="blogData.description"
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

								<!-- Body SECTION -->
								<div class="w-full">
									<label
										for="body"
										class="font-urbanist dark:text-white text-primary font-20 font-semibold"
										>Body
									</label>
									<v-textarea
										v-model="blogData.body"
										class="mt-2 bg-transparent"
										height="200"
										background-color="transparent"
										placeholder="Enter body"
										required
										outlined
										solo
										flat
										no-resize
										:rules="validations.bodyRules"
									></v-textarea>
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
			collections: [],
			collection: {},
			loading: false,
			selection: 1,
			user: {},
			blogData: {
				title: '',
				description: '',
				body: '',
				logo_image: [],
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
				descriptionRules: [
					(v) => !!v || 'Description is required',
					(v) =>
						(v && v.length <= 500) ||
						'Description must be less than 500 characters',
				],
				bodyRules: [
					(v) => !!v || 'Body is required',
					(v) =>
						(v && v.length <= 1000) ||
						'Body must be less than 1000 characters',
				],
			},
		}),
		methods: {
			validateForm() {
				if (
					!this.blogData.logo_image.length &&
					!this.$refs.form.validate()
				) {
					this.validations.isEmptyImage = true
				} else if (this.$refs.form.validate()) {
					this.storeBlog()
				} else {
					return false
				}
			},
			storeBlog() {
				console.log(
					'this.blogData',
					this.blogData
				)
				this.$axios
					.$post('/v1/blog', this.blogData, {
						headers: {
							token: localStorage.getItem('authToken'),
						},
					})
					.then((response) => {
						this.$router.push('/blog')
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
				this.blogData.logo_image = []
				this.blogData.logo_image.push({
					asset_type: 'image',
					url: URL.createObjectURL(
						event.target.files[0]
					),
				});
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
						// console.log('asset ',response.data)
						if(!response.success){
							this.blogData.logo_image = []	
						}
						this.blogData.logo_image = response.data;	
						
					})
					.catch((error) => {
						console.log('Request canceled', error)
					})
				// console.log('formData ', formData)
			},
		},
		created() {
		},
		mounted() {
			// const instance = this.$refs.el.dropzone
		},
	}
</script>