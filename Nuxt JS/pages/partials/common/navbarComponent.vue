<template>
	<v-row
		justify="center"
		align="center"
	>
		<!-- NAVBAR -->
		<div
			class="w-full flex flex-col md:flex-row my-5 py-5 px-2 mx-0"
		>
			<div
				class="w-full px-0 py-3 flex flex-row justify-between"
			>
				<!-- LOGO -->
				<div
					class="w-full xl:w-auto flex-row align-center logo flex"
				>
					<NuxtLink to="/">
						<p
							class="font-31 my-0 cursor-pointer text-black dark:text-white"
						>
							NFT
						</p>
					</NuxtLink>
				</div>
				<!-- LOGO END -->

				<!-- SM TOGGLE BTN  -->
				<div
					class="w-auto ml-auto xl:hidden flex items-center min-w-10"
				>
					<span
						@click.stop="drawer = !drawer"
						class="min-w-10"
					>
						<button
							type="button"
							id="openNav"
							class="navbar-toggler"
							data-toggle="collapse"
							data-target="#myNavbar"
						>
							<div class="navbar-toggler-icon-custom">
								<div></div>
								<div></div>
								<div></div>
							</div>
						</button>
					</span>
				</div>
				<!-- SM TOGGLE BTN END  -->

				<div class="hidden xl:flex w-full mx-auto">
					<!-- TABS -->
					<div class="w-full">
						<v-tabs
							fixed-tabs
							background-color="transparent"
							dark
							hideSlider
						>
							<NuxtLink
								v-for="link in navLinks"
								:to="`/${link.path}`"
								:key="link.name"
								:class="
									link.name.toLowerCase() == 'profile'
										? !$store.getters.isAuth
											? 'hidden'
											: ''
										: ''
								"
							>
								<v-tab>
									{{ link.name }}
								</v-tab>
							</NuxtLink>

							<v-tab>
								<span v-if="!$store.getters.isAuth">
									<NuxtLink to="/login">
										<span class="text-white">Login</span>
									</NuxtLink>
								</span>
								<div v-else>
									<h4 @click="logout()">Logout</h4>
								</div>
							</v-tab>

							<!-- <v-tab @click="themeSwitcher()">
                {{ theme }}
              </v-tab> -->
						</v-tabs>
					</div>
					<!-- TABS END  -->
				</div>

				<!-- ACTION BTN -->
				<div class="hidden xl:flex">
					<div
						class="w-auto flex flex-col md:flex-row align-center justify-end"
					>
						<NuxtLink to="/create">
							<v-btn
								class="px-6 py-3 btn-grad rounded-lg"
								height="auto"
							>
								<span class="capitalize font-16 py-1"
									>Create NFT</span
								>
							</v-btn>
						</NuxtLink>
					</div>
				</div>
				<!-- ACTION BTN END  -->
			</div>
		</div>
		<!-- NAVBAR END -->

		<!-- SM NAVBAR  -->
		<div class="sm-nav">
			<v-navigation-drawer
				v-model="drawer"
				absolute
				temporary
			>
				<v-list-item>
					<v-list-item-content>
						<v-list-item-title>NFT</v-list-item-title>
					</v-list-item-content>
				</v-list-item>

				<v-divider></v-divider>

				<v-list dense>
					<v-list-item
						v-for="link in navLinks"
						:key="link.name"
						link
					>
						<NuxtLink
							:to="link.path"
							:class="
								link.name.toLowerCase() == 'profile'
									? !$store.getters.isAuth
										? 'hidden'
										: ''
									: ''
							"
						>
							<v-list-item-content>
								<v-list-item-title>{{
									link.name
								}}</v-list-item-title>
							</v-list-item-content>
						</NuxtLink>
					</v-list-item>
				</v-list>
			</v-navigation-drawer>
		</div>
		<!-- SM NAVBAR END  -->
	</v-row>
</template>

<script>
	export default {
		name: 'NavbarComponent',
		data() {
			return {
				isMetaMaskInstalled: false,
				isLogedIn: false,
				drawer: null,
				theme: 'dark',
				navLinks: [
					{
						name: 'Explore',
						path: 'explore',
					},
					{
						name: 'Activity',
						path: 'activity',
					},
					{
						name: 'Ranking',
						path: 'ranking',
					},
					{
						name: 'Profile',
						path: 'profile',
					},
					{
						name: 'Vendors',
						path: 'vendors',
					},
					{
						name: 'Blog',
						path: 'blog',
					},
				],
			}
		},
		methods: {
			checkLogin() {
				const authToken =
					localStorage.getItem('authToken')
				if (authToken) {
					this.isLogedIn = true
					this.$store.dispatch('storeIsAuth', true)
				} else {
					this.isLogedIn = false
				}
			},
			themeSwitcher() {
				const body = document.body
				if (this.theme === 'dark') {
					body.classList.remove('dark')
					this.theme = 'light'
				} else {
					body.classList.add('dark')
					this.theme = 'dark'
				}
			},
			logout() {
				localStorage.removeItem('authToken')
				this.isLogedIn = false
				this.$store.dispatch('storeIsAuth', false)
				this.$router.push('/')
			},
		},
		mounted() {
			const body = document.body
			body.classList.add('dark')
			this.checkLogin()
			this.isMetaMaskInstalled = false
			this.isMetaMaskInstalled =
				typeof window.ethereum !== 'undefined'
			console.log(
				'this.$store.getters.isAuth()',
				this.$store.getters.isAuth
			)
		},
	}
</script>