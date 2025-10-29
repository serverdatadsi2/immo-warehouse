import '../css/app.css';

import '@ant-design/v5-patch-for-react-19';
import { createInertiaApp } from '@inertiajs/react';
// import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { HotkeysProvider } from 'react-hotkeys-hook';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    // resolve: (name) =>
    //     resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx', )),
    resolve: async (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
        const page = pages[`./pages/${name}.tsx`];

        if (!page) {
            throw new Error(`Page not found: ${name}`);
        }

        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <HotkeysProvider initiallyActiveScopes={['global']}>
                <App {...props} />
            </HotkeysProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
