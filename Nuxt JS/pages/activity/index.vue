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
							<h2 class="font-lg-36 text-primary dark:text-white font-20 font-semibold mt-0">
								Top NFTs activity
							</h2>
							<p class="font-lg-18 font-16 text-primary dark:text-white font-medium mt-3">
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
								:items="eventType"
								label="Event type"
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
				<template v-slot:[`item.events`]="{ item }">
					<div class="flex items-center py-5">
						<span>
							<img
								:src="item.image"
								alt=""
							/>
						</span>
						<span class="font-14 font-lg-18 font-semibold pl-2"> {{ item.events }}</span>
					</div>
				</template>

				<template v-slot:[`item.item`]="{ item }">
					<div class="flex items-center py-5">
						<span>
							<img
								:src="item.image"
								alt=""
							/>
						</span>
						<span class="font-14 font-lg-18 font-semibold pl-2">
							{{ item.item }} <br />
							<span class="font-12 font-lf-18 font-normal">{{ item.item2 }}</span>
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

				<template v-slot:[`item.from`]="{ item }">
					<div>
						<span class="font-14 font-lg-18 font-semibold pl-2">
							{{ item.from }}
						</span>
					</div>
				</template>

				<template v-slot:[`item.to`]="{ item }">
					<div>
						<span class="font-14 font-lg-18 font-semibold pl-2">
							{{ item.to }}
						</span>
					</div>
				</template>

				<template v-slot:[`item.time`]="{ item }">
					<div>
						<span class="font-14 font-lg-18 font-semibold pl-2"> {{ item.time }} seconds ago </span>
					</div>
				</template>
			</v-data-table>
		</v-row>
	</v-main>
</template>

<script>
	// import { url } from 'inspector';

	export default {
		name: 'IndexPage',
		components: {},
		data: () => ({
			blockChain: ['Polygon', 'Ethereum', 'Cardano'],
			category: ['Art', 'Music', 'Sports', 'Games', 'Photography'],
			eventType: ['Listing', 'Sales', 'Bids'],
			headers: [
				{
					text: 'Events',
					align: 'start',
					sortable: false,
					value: 'events',
				},
				{
					text: 'Item',
					value: 'item',
				},
				{
					text: 'Price',
					value: 'price',
				},
				{
					text: 'From',
					value: 'from',
				},
				{
					text: 'To',
					value: 'to',
				},
				{
					text: 'Time',
					value: 'time',
				},
			],
			desserts: [
				{
					image: 'https://picsum.photos/40/40',
					events: 'Sale',
					item: 'Masked Ape Deo',
					item2: 'Masked Ape Deo #57',
					price: '133,871.43',
					from: 'Magiedin',
					to: 'HYJFB',
					time: '12',
				},
				{
					image: 'https://picsum.photos/40/40',
					events: 'Sale',
					item: 'Masked Ape Deo',
					item2: 'Masked Ape Deo #57',
					price: '133,871.43',
					from: 'Magiedin',
					to: 'HYJFB',
					time: '12',
				},
				{
					image: 'https://picsum.photos/40/40',
					events: 'Sale',
					item: 'Masked Ape Deo',
					item2: 'Masked Ape Deo #57',
					price: '133,871.43',
					from: 'Magiedin',
					to: 'HYJFB',
					time: '12',
				},
				{
					image: 'https://picsum.photos/40/40',
					events: 'Sale',
					item: 'Masked Ape Deo',
					item2: 'Masked Ape Deo #57',
					price: '133,871.43',
					from: 'Magiedin',
					to: 'HYJFB',
					time: '12',
				},
				{
					image: 'https://picsum.photos/40/40',
					events: 'Sale',
					item: 'Masked Ape Deo',
					item2: 'Masked Ape Deo #57',
					price: '133,871.43',
					from: 'Magiedin',
					to: 'HYJFB',
					time: '12',
				},
				{
					image: 'https://picsum.photos/40/40',
					events: 'Sale',
					item: 'Masked Ape Deo',
					item2: 'Masked Ape Deo #57',
					price: '133,871.43',
					from: 'Magiedin',
					to: 'HYJFB',
					time: '12',
				},
			],
		}),
		mounted() {
			console.log(this.$store.state.counter)
		},
	}
</script>
