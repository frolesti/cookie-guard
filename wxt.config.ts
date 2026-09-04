import { defineConfig } from 'wxt';

export default defineConfig({
	manifest: {
		name: 'Cookie Guard',
		description: 'Deletes cookies and rejects supported consent banners locally.',
		permissions: ['alarms', 'cookies', 'storage'],
		host_permissions: ['<all_urls>'],
		browser_specific_settings: {
			gecko: {
				id: 'cookie-guard@frolesti.github.io',
				strict_min_version: '128.0',
				data_collection_permissions: { required: ['none'] },
			},
		},
	},
});
