<template>
	<v-main>
		<v-row
			justify="center"
			align="center"
		>
			<v-container
				fluid
				class="mt-5"
			>
				<div
					class="d-flex justify-space-between align-center flex-wrap my-6"
				>
					<div class="row d-flex">
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
						<div class="w-auto px-3 explore-svg-main">
							<div
								class="d-flex border border-black dark:border-white rounded cursor-pointer explore-svg-wrapper"
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
									class="h-12 explore-outline-svg d-flex align-center p-3 rounded"
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
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
								</div>
							</div>
						</div>
					</div>
					<div
						class="d-flex justify-space-between align-start"
					></div>
				</div>
			</v-container>
		</v-row>
		<v-row align="center">
			<v-col
				col="12"
				md="4"
				sm="6"
				v-for="vendor in vendors"
				:key="vendor._id"
			>
				<v-card
					class="nft-vendor-card"
					light
				>
					<v-img
						:src="vendor.cover_image"
						:lazy-src="vendor.cover_image"
						aspect-ratio="2.18"
						class="grey lighten-2 align-end nft-explore-card-img"
					></v-img>

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

					<v-card-title
						class="nft-card-vendor text-white py-2 px-6 relative mx-auto flex justify-center -mt-[100px]"
					>
						<div
							class="rounded-full w-[200px] h-[200px]"
						>
							<img
								:src="vendor.profile_image"
								class="grey lighten-2 align-end nft-explore-card-img rounded-full"
							/>
						</div>
					</v-card-title>

					<div class="nft-card-body p-3 pb-0 mb-5">
						<v-card-text class="pt-1 pb-3 text-center">
							<div
								class="d-flex justify-center items-center"
							>
								<h6 class="pb-0 font-20 font-bold mb-0">
									{{ vendor.firstname }}
									{{ vendor.lastname }}
								</h6>
								<div class="ps-2">
									<svg
										width="15"
										height="15"
										viewBox="0 0 15 15"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M6.73463 0.317026C7.22469 0.114038 7.77531 0.114037 8.26537 0.317025L12.0379 1.87967C12.528 2.08266 12.9173 2.47201 13.1203 2.96207L14.683 6.73463C14.886 7.22469 14.886 7.77531 14.683 8.26537L13.1203 12.0379C12.9173 12.528 12.528 12.9173 12.0379 13.1203L8.26537 14.683C7.77531 14.886 7.22469 14.886 6.73463 14.683L2.96207 13.1203C2.47201 12.9173 2.08266 12.528 1.87967 12.0379L0.317026 8.26537C0.114038 7.77531 0.114037 7.22469 0.317025 6.73463L1.87967 2.96207C2.08266 2.47201 2.47201 2.08266 2.96207 1.87967L6.73463 0.317026Z"
											fill="#0D6EFD"
										/>
										<path
											d="M4.28564 7.93433L6.4285 10.0772L10.7142 5.48535"
											stroke="white"
											stroke-width="0.714286"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
								</div>
							</div>
							<p class="mb-0">@{{ vendor.username }}</p>
						</v-card-text>
						<div class="d-flex items-center">
							<v-card-text class="pt-1 pb-3">
								<h6
									class="pb-0 font-14 font-lg-18 font-bold mb-0"
								>
									{{ vendor.productCount }}
									<span class="font-light">Creations</span>
								</h6>
							</v-card-text>
							<v-card-text class="text-end pl-0">
								<h6
									class="pb-0 font-14 font-lg-18 font-bold mb-0"
								>
									{{ vendor.productCount }}
									<span class="font-light">Followers</span>
								</h6>
							</v-card-text>
						</div>
						<div class="d-flex justify-center">
							<v-btn
								class="px-3 py-2 py-lg-1 elevation-0 px-lg-6 px-md-4 btn-follow rounded-lg w-full"
								height="auto"
							>
								<span
									class="capitalize font-lg-20 font-sm-15 py-1"
									>Follow</span
								>
							</v-btn>
						</div>
					</div>
				</v-card>
			</v-col>
		</v-row>
	</v-main>
</template>

<script>
	export default {
		name: 'VendorsPage',
		components: {},
		data: () => ({
			sortBy: [
				'Recently added',
				'Price: low to high',
				'Price: high to low',
			],
			vendors: [],
		}),
		methods: {
			getVendors() {
				this.$axios
					.$get('/v1/vendors', {
						headers: {
							token: localStorage.getItem('authToken'),
						},
					})
					.then((response) => {
						this.vendors = response.data
					})
					.catch((error) => {
						console.log('Request canceled', error)
					})
			},
		},
		created() {
			this.getVendors()
			console.log(this.$store.state.counter)
		},
	}
</script>