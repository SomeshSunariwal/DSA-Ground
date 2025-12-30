export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}"
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    bg: '#0f0f0f',
                    panel: '#1e1e1e',
                    border: '#333333',
                    text: '#e5e5e5',
                    textSec: '#a3a3a3',
                    accent: '#3b82f6'
                },
                light: {
                    bg: '#f8fafc',
                    panel: '#ffffff',
                    border: '#e2e8f0',
                    text: '#1e293b',
                    textSec: '#64748b',
                    accent: '#2563eb'
                }
            },
            boxShadow: {
                premium: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
                'premium-dark': '0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1)',
            }
        }
    },
    plugins: [require('@tailwindcss/typography')],
};
