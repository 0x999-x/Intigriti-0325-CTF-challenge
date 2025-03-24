
export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: 'var(--background)',
				foreground: 'var(--foreground)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				drip: {
					"0%": {
						transform: "translateY(0) scale(0.5)",
						opacity: "0"
					},
					"30%": {
						transform: "translateY(0) scale(1)",
						opacity: "1"
					},
					"70%": {
						transform: "translateY(0) scale(1)",
						opacity: "1"
					},
					"100%": {
						transform: "translateY(40px) scale(0.5)",
						opacity: "0"
					}
				}
			},
			animation: {
				"drip": "drip 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
};

