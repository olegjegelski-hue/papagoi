import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        // Papagoi Keskuse brändi värvid
        'papagoi-green': {
          DEFAULT: '#43A047',
          50: '#E8F5E8',
          100: '#D1EBD1',
          200: '#A3D7A4',
          300: '#75C377',
          400: '#47AF4A',
          500: '#43A047',
          600: '#368038',
          700: '#29602A',
          800: '#1C401C',
          900: '#0F200E'
        },
        'papagoi-blue': {
          DEFAULT: '#039BE5',
          50: '#E0F4FE',
          100: '#C1E9FC',
          200: '#83D3FA',
          300: '#45BDF7',
          400: '#07A7F4',
          500: '#039BE5',
          600: '#027CB7',
          700: '#025D89',
          800: '#013E5C',
          900: '#011F2E'
        },
        'papagoi-yellow': {
          DEFAULT: '#FFEB3B',
          50: '#FFFEF0',
          100: '#FFFDE1',
          200: '#FFFAC3',
          300: '#FFF8A5',
          400: '#FFF587',
          500: '#FFEB3B',
          600: '#F4D100',
          700: '#BFA200',
          800: '#8A7400',
          900: '#544600'
        },
        'papagoi-red': {
          DEFAULT: '#E53935',
          50: '#FBEAEA',
          100: '#F7D4D4',
          200: '#EFA9A9',
          300: '#E77E7E',
          400: '#DF5353',
          500: '#E53935',
          600: '#B72D2A',
          700: '#892220',
          800: '#5C1715',
          900: '#2E0B0A'
        },
        'papagoi-orange': {
          DEFAULT: '#FF9800',
          50: '#FFF3E0',
          100: '#FFE7C1',
          200: '#FFCF82',
          300: '#FFB744',
          400: '#FF9F05',
          500: '#FF9800',
          600: '#CC7A00',
          700: '#995B00',
          800: '#663D00',
          900: '#331E00'
        },
        'warm-gray': {
          DEFAULT: '#F5F5F5',
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121'
        },
        'deep-anthracite': {
          DEFAULT: '#263238',
          50: '#F5F6F6',
          100: '#ECEDEE',
          200: '#CFD8DC',
          300: '#B0BEC5',
          400: '#90A4AE',
          500: '#78909C',
          600: '#607D8B',
          700: '#546E7A',
          800: '#455A64',
          900: '#263238'
        }
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
