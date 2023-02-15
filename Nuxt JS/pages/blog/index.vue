<template>
	<div class="w-full">
		<v-main>
			<v-row>
				<v-spacer></v-spacer>
				<v-col
					col="12"
					sm="6"
					md="4"
					lg="3"
					class="text-right"
				>
				<NuxtLink to="/blog/create">
					<v-btn
					class="mx-2 btn-grad"
      				fab
					small
					>
					<v-icon> mdi-plus</v-icon>
					</v-btn>
					
				</NuxtLink>
				</v-col>
			</v-row>
			<v-row>
				<v-col
					col="12"
					sm="6"
					md="4"
					lg="3"
					v-for="item in items" :key="item._id"
				>
					<NuxtLink :to="`/blog/${item.slug}`">
						<v-card
							:loading="loading"
							class="mx-auto mb-5"
							max-width="364"
							
						>
							<template slot="progress">
								<v-progress-linear
									color="deep-purple"
									height="10"
									indeterminate
								></v-progress-linear>
							</template>

							<v-img
								height="250"
								:src="item.logo_image"
							></v-img>
							<div class="bg-white">
								<v-card-title >
									<div
										class="flex items-center justify-between"
									>
										<div class="flex items-center">
											<img
												src="~/static/img/blog/usersvg.svg"
												alt=""
											/>
											<h6
												class="ps-3 text-primary font-urbanist font-semibold"
											>
												{{ item.user_name }}
											</h6>
										</div>
										<div class="div">
											<p
												class="font-13 blog-date-gradient mb-0"
											>
												{{ $moment(item.updatedAt.split("T")[0]).format('DD/MMM/YYYY')  }}
											</p>
										</div>
									</div>
								</v-card-title>
								<v-card-text>
									<h5
										class="text-primary font-urbanist font-bold font-20 mb-3"
									>
										{{ item.title }}
									</h5>
									<p
										class="text-primary font-urbanist font-medium mb-0"
									>
									{{ item.description.substring(0,100) }}
									</p>
								</v-card-text>
								<v-card-actions class="blog-card-btn">
									<v-btn
										class="font-13 readmore_arrow lowercase"
										text
										@click="reserve"
									>
										Read more
									</v-btn>
								</v-card-actions>
							</div>
						</v-card>
					</NuxtLink>
				</v-col>
			</v-row>
		</v-main>
	</div>
</template>

<script>
	export default {
		name: 'IndexPage',
		data: () => ({
			Category: ['Polygon', 'Ethereum', 'Cardano'],
			items: [],
			loading: true,
			selection: 1,
		}),
		methods: {
			getBlogs() {
				this.$axios
					.$get('/v1/blog', {
						headers: {
							token: localStorage.getItem('authToken'),
						},
					})
					.then((response) => {
						this.items = response.data;
						this.loading = false;
						console.log("this.items");
						console.log(this.items[0]);
					})
					.catch((error) => {
						console.log('Request canceled', error)
					})
			},
			reserve(){

			}
		},
		mounted() {
			this.getBlogs();
		},
	}
</script>