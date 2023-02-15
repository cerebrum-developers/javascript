module.exports = {
	content: [
		'./components/**/*.{js,vue,ts}',
		'./layouts/**/*.vue',
		'./pages/**/*.vue',
		'./plugins/**/*.{js,ts}',
		'./nuxt.config.{js,ts}',
	],
	theme: {
		extend: {
			width: {
				// '150px': '150px',
				// '196px': '196px'
			},
			minWidth: {
				'470px': '470px',
				'585px': '585px',
			},
			margin: {
				'60px': '60px',
			},
			fontFamily: {
				urbanist: ['Urbanist', 'sans-serif'],
			},
			colors: {
				'1a2146': '#1a2146',
				primary: 'var(--primary-color)',
				secondary: 'var(--secondary-color)',
				CBCBCB: '#CBCBCB',
				'black-opacity-2': 'rgb(0, 0, 0, 0.2)' 
			},
		},
	},

	plugins: [],
	darkMode: 'class',
}
