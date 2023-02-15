module.exports = {
  theme: {
    screens: {
      xs: '575px',
      sm: '639px',
      md: '767px',
      lg: '1023px',
      xl: '1279px',
      '2xl': '1439px',
    },
    extend: {
      colors: {
        'grey-700': '#1c1c1c',
        'maroon-500': '#e00000',
      },
      backgroundColor: {
        'navyblue-light': '#061f42',
        'grey-light-200': '#f8f8f8',
        'maroon-500': '#e00000',
        'maroon-100': '#fce8e8',
        'maroon-600': '#b30202',
      },
      width: {
        'avatar-40': '40px',
      },
      height: {
        'avatar-40': '40px',
      },
      minHeight: {
        60: '15rem',
      },
      maxHeight: {
        'hero-415': '415px',
      },
      fontSize: {
        '14-lh-20': ['14px', '20px'],
        '10-lh-15': ['10px', '15px'],
      },
      padding: {
        'btn-16-32': ['16px 32px'],
      },
      margin: {
        '20-10-0-80': ['20px 10px 0px 80px'],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      'components/**/*.vue',
      'layouts/**/*.vue',
      'pages/**/*.vue',
      'plugins/**/*.js',
      'nuxt.config.js',
      'plugins/**/*.ts',
      'nuxt.config.ts',
    ],
  },
}
