<template>
	<div class="col-12">
		<v-row
			justify="center"
			align="center"
		>
			<ProductsComponent />
		</v-row>
	</div>
</template>

<script>
	import ProductsComponent from '../products/productsComponent.vue'

	export default {
		name: 'TrendingComponent',
		components: {
			ProductsComponent,
		},
	}
</script>
