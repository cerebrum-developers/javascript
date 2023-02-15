<template>
	<v-main>
		<!-- LOGIN-FORM -->
		<v-row
			justify="space-between"
			align="center"
		>
			<v-main class="metamask-wrapper mt-10">
				<div class="mx-auto text-center md:w-full">
					<h2
						class="text-primary dark:text-white font-24 font-lg-30 font-xl-36 font-urbanist font-semibold"
					>
						You need an Ethereum wallet to use OpenSea.
					</h2>
					<p
						class="dark:text-white text-primary font-18 text-urbanist font-medium"
					>
						"If you don't have a<span
							class="text-[#1976d2]"
							>wallet</span
						>
						yet, you can select a provider and create
						one now".
					</p>
				</div>
				<div class="flex w-full justify-center">
					<v-card
						class="mx-5 sm:mx-auto metamask-list mt-10 rounded-xl w-full"
						max-width="660"
						tile
					>
						<v-list
							dense
							class="mx-auto overflow-hidden"
						>
							<v-list-item-group
								v-model="selectedItem"
								color="primary"
							>
								<v-list-item
									v-for="(item, i) in item"
									:key="i"
									@click="walletLogin(item.type)"
								>
									<v-list-item-icon>
										<v-img
											class="rounded"
											:src="item.image"
											alt=""
										></v-img>
									</v-list-item-icon>
									<v-list-item-content>
										<v-list-item-title
											v-text="item.text"
										></v-list-item-title>
									</v-list-item-content>
								</v-list-item>
							</v-list-item-group>
						</v-list>
					</v-card>
				</div>
			</v-main>
		</v-row>
		<!-- LOGIN-FORM-COMPLETE -->
	</v-main>
</template>

<script>
	// import { Signer } from '@waves/signer'
	// import { ProviderWeb } from '@waves.exchange/provider-web'
	// import { ProviderSeed } from '@waves/provider-seed'
	// import { libs } from '@waves/waves-transactions'
	import keeperLogo from '../../static/img/keeper.png'
	export default {
		name: 'LoginPage',
		components: {},
		data: () => ({
			keeperLogo,
			selectedItem: 1,
			item: [
				{
					text: 'MetaMask',
					image:
						'https://opensea.io/static/images/logos/metamask-fox.svg',
					type: 'metamask',
				},
				{
					text: 'Keeper Wallet',
					image: keeperLogo,
					type: 'keeper',
				},
			],
			isMetaMaskInstalled: false,
			isKeeperInstalled: false,
			isLogedIn: false,
		}),
		methods: {
			checkLogin() {
				const authToken =
					localStorage.getItem('authToken')
				if (authToken) {
					this.isLogedIn = true
				} else {
					this.isLogedIn = false
				}
			},
			async walletLogin(type) {

				const _this = this;
				try {
					if (type && type === 'metamask') {
						if (!this.isMetaMaskInstalled) {
							alert('Install Meta Mask Extension')
						}
						if (this.isMetaMaskInstalled) {
							const account =
								await window.ethereum.request({
									method: 'eth_requestAccounts',
								})
							if (account[0] !== 'undefined') {
								_this.registerUser(account[0], 'metamask')
							}
							console.log(account)
						}
					}

					if (type && type === 'keeper') {
						if (!this.isKeeperInstalled) {
							alert('Install Keeper Extension')
						}
						if (this.isKeeperInstalled) {
							const Waves = window.WavesKeeper

							console.log('Waves', Waves)

							Waves.auth({
								name: 'Your App',
								data: 'Any stuff',
							})
								.then(function (res) {
									console.log('res.publicKey', res.publicKey)
									_this.registerUser(
										res.publicKey,
										'keeper'
									)
								})
								.catch(function (err) {
									console.log('errerr', err)
								})
						}
					}
				} catch (error) {
					console.log(error)
					this.$toast.error(error.message, {
						duration: 3000,
					})
				}
			},
			logout() {
				localStorage.removeItem('authToken')
				this.isLogedIn = false
			},
			async registerUser(walletHash, walletType) {
				const data = {
					walletHash,
					walletType,
				}
				await this.$axios
					.$post('/v1/users/auth', data)
					.then((response) => {
						console.log('user data', response.token)
						localStorage.setItem(
							'authToken',
							response.token
						)
						this.isLogedIn = true
						this.$store.dispatch('storeIsAuth', {
							isAuth: true,
						})
						this.$router.push('profile')
					})
					.catch((error) => {
						console.log('Request canceled', error)
					})
			},
		},
		mounted() {
			// Waves.auth({
			// 	name: 'Your App',
			// 	data: 'Any stuff',
			// })
			// 	.then(function (res) {
			// 		console.log('resres', res)
			// 	})
			// 	.catch(function (err) {
			// 		console.log('errerr', err)
			// 	})

			// const seed = libs.crypto.randomSeed(15)
			// const signer = new Signer({
			// 	// Specify URL of the node on Testnet
			// 	NODE_URL:
			// 		'https://nodes-testnet.wavesnodes.com',
			// })
			// signer.setProvider(
			// 	new ProviderSeed(
			// 		'https://testnet.waves.exchange/signer/'
			// 	)
			// )

			// const waves = new Signer({
			// 	NODE_URL:
			// 		'https://nodes-testnet.wavesnodes.com',
			// })

			// const provider = new ProviderWeb(
			// 	'https://testnet.waves.exchange/signer/'
			// )
			// waves.setProvider(provider)

			// const userData = await waves.login()

			// console.log('userData', userData)

			console.log(this.$store.state.counter)
			this.checkLogin()
			this.isMetaMaskInstalled = false
			this.isMetaMaskInstalled =
				typeof window.ethereum !== 'undefined'

			this.isKeeperInstalled = false
			this.isKeeperInstalled =
				typeof window.WavesKeeper !== 'undefined'
		},
	}
</script>
