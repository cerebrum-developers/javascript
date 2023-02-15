<template>
	<div class="w-full my-5 px-3">
		<!-- HEADING SECTION  -->
		<v-row
			justify="center"
			align="center"
		>
			<div class="w-full px-3 flex justify-center">
				<div class="text-center">
					<h2
						class="font-20 font-medium font-lg-24 lg:mt-7 mt-10 about-text-gradient"
					>
						Trending
					</h2>
					<h2
						class="font-24 font-lg-30 font-xl-36 font-semibold text-primary dark:text-white mt-0"
					>
						Biggest Sale
					</h2>
					<p
						class="font-14 font-lg-16 text-primary dark:text-white opacity-75 mt-4 mb-8"
					>
						Facilisi ipsum nunc dolor, viverra ornare.
						Odio commodo auctor nulla id
					</p>
				</div>
			</div>
		</v-row>
		<!-- CARDS SECTION -->
		<v-row
			justify="center"
			align="center"
		>
			<div class="w-full px-3 flex flex-wrap">
				<ProductComponent
					v-for="product in products"
					:key="product._id"
					:productData="product"
				/>
			</div>
		</v-row>
		<!-- BTN SECTION -->
		<v-row
			justify="center"
			align="center"
		>
			<div
				class="w-full px-3 flex justify-center mt-10"
			>
				<NuxtLink to="/explore">
					<v-btn
						class="px-3 px-lg-6 py-4 py-lg-3 btn-grad rounded-lg w-[250px] lg:w-[165px]"
						height="auto"
					>
						<span
							class="capitalize font-16 font-lg-16 py-1"
							>View all</span
						>
					</v-btn>
				</NuxtLink>
			</div>
		</v-row>
	</div>
</template>

<script>
	import ProductComponent from './productComponent.vue'
	export default {
		name: 'ProductsComponent',
		components: {
			ProductComponent,
		},
		data() {
			return {
				products: [],
			}
		},
		mounted() {
			this.getProducts()
		},
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
	}
</script>
