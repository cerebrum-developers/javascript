<template>
	<v-main>
		<v-row
			justify="center"
			align="center"
		>
			<v-container>
				<div class="w-full">
					<div>
						<div class="py-0 text-center">
							<h2 class="font-28 font-lg-36 text-primary dark:text-white font-semibold mt-0">
								Top NFTs collections
							</h2>
							<p class="font-16 font-lg-18 text-primary dark:text-white font-medium mt-3">
								The top NFTs, ranked by volume, floor price and other statistics.
							</p>
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
				<div class="d-flex justify-space-between align-center flex-wrap">
					<div class="row d-flex">
						<div class="w-6/12 sm:w-4/12 xl:w-2/12 px-3 ml-auto">
							<v-select
								:menu-props="{ light: true }"
								:items="duration"
								label="Last 7 days"
								solo
								light
							>
							</v-select>
						</div>
						<div class="w-6/12 sm:w-4/12 xl:w-2/12 px-3">
							<v-select
								:menu-props="{ light: true }"
								:items="category"
								label="Category"
								solo
								light
							>
							</v-select>
						</div>
						<div class="w-6/12 sm:w-4/12 xl:w-2/12 px-3">
							<v-select
								:menu-props="{ light: true }"
								:items="blockChain"
								label="Blockchain"
								solo
								light
							>
							</v-select>
						</div>
					</div>
				</div>
			</v-container>
		</v-row>
		<v-row
			align="center"
			class="mx-1"
		>
			<v-data-table
				:headers="headers"
				:items="desserts"
				light
				class="w-full ranking-table"
			>
				<template v-slot:[`item.collection`]="{ item }">
					<div class="flex py-5 items-center">
						<span>
							<img
								:src="item.image"
								alt=""
							/>
						</span>
						<span class="font-14 font-lg-18 font-semibold pl-2"> {{ item.collection }}</span>
					</div>
				</template>
				<template v-slot:[`item.volume`]="{ item }">
					<div class="flex items-center py-5">
						<span>
							<img
								src="~/static/img/etherum.svg"
								alt=""
							/>
						</span>
						<span class="font-14 font-lg-18 font-semibold pl-2">
							{{ item.volume }}
						</span>
					</div>
				</template>
				<template v-slot:[`item.daily`]="{ item }">
					<div>
						<span class="ranking-table-daily-cell font-14 font-lg-18 font-semibold pl-2">
							{{ item.daily }}%
						</span>
					</div>
				</template>
				<template v-slot:[`item.weekly`]="{ item }">
					<div>
						<span class="ranking-table-weekly-cell font-14 font-lg-18 font-semibold pl-2">
							{{ item.weekly }}%
						</span>
					</div>
				</template>
				<template v-slot:[`item.price`]="{ item }">
					<div class="flex items-center py-5">
						<span>
							<img
								src="~/static/img/etherum.svg"
								alt=""
							/>
						</span>
						<span class="font-14 font-lg-18 font-semibold pl-2">
							{{ item.price }}
						</span>
					</div>
				</template>
				<template v-slot:[`item.owners`]="{ item }">
					<div>
						<span class="font-14 font-lg-18 font-semibold pl-2"> {{ item.owners }}K </span>
					</div>
				</template>

				<template v-slot:[`item.items`]="{ item }">
					<div>
						<span class="font-14 font-lg-18 font-semibold pl-2"> {{ item.items }}K </span>
					</div>
				</template>
			</v-data-table>
		</v-row>
	</v-main>
</template>

<script>
	export default {
		name: 'IndexPage',
		components: {},
		data: () => ({
			blockChain: ['Polygon', 'Ethereum', 'Cardano'],
			category: ['Art', 'Music', 'Sports', 'Games', 'Photography'],
			duration: ['Last 7 days', 'Last 24 hours', 'Last 30 days', 'All time'],
			headers: [
				{
					text: 'Collection',
					align: 'start',
					sortable: false,
					value: 'collection',
				},
				{ text: 'Volume', value: 'volume' },
				{ text: '24h %', value: 'daily' },
				{ text: '7d %', value: 'weekly' },
				{ text: 'Floor Price', value: 'price' },
				{ text: 'Owners', value: 'owners' },
				{ text: 'Items', value: 'items' },
			],
			desserts: [
				{
					image: 'https://picsum.photos/40/40',
					collection: 'CryptoPunks',
					volume: '133,871.43',
					daily: -48.31,
					weekly: '+1396.90',
					price: 133,
					owners: 3.2,
					items: 10.0,
				},
				{
					image: 'https://picsum.photos/40/40',
					collection: 'CryptoPunks',
					volume: '133,871.43',
					daily: -48.31,
					weekly: '+1396.90',
					price: 133,
					owners: 3.2,
					items: 10.0,
				},
				{
					image: 'https://picsum.photos/40/40',
					collection: 'CryptoPunks',
					volume: '133,871.43',
					daily: -48.31,
					weekly: '+1396.90',
					price: 133,
					owners: 3.2,
					items: 10.0,
				},
				{
					image: 'https://picsum.photos/40/40',
					collection: 'CryptoPunks',
					volume: '133,871.43',
					daily: -48.31,
					weekly: '+1396.90',
					price: 133,
					owners: 3.2,
					items: 10.0,
				},
				{
					image: 'https://picsum.photos/40/40',
					collection: 'CryptoPunks',
					volume: '133,871.43',
					daily: -48.31,
					weekly: '+1396.90',
					price: 133,
					owners: 3.2,
					items: 10.0,
				},
				{
					image: 'https://picsum.photos/40/40',
					collection: 'CryptoPunks',
					volume: '133,871.43',
					daily: -48.31,
					weekly: '+1396.90',
					price: 133,
					owners: 3.2,
					items: 10.0,
				},
				{
					image: 'https://picsum.photos/40/40',
					collection: 'CryptoPunks',
					volume: '133,871.43',
					daily: -48.31,
					weekly: '+1396.90',
					price: 133,
					owners: 3.2,
					items: 10.0,
				},
				{
					image: 'https://picsum.photos/40/40',
					collection: 'CryptoPunks',
					volume: '133,871.43',
					daily: -48.31,
					weekly: '+1396.90',
					price: 133,
					owners: 3.2,
					items: 10.0,
				},
			],
		}),
		mounted() {
			console.log(this.$store.state.counter)
		},
	}
</script>
