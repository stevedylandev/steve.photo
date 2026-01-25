// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: { authenticated: boolean } | null;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				DB: D1Database;
				PHOTOS: R2Bucket;
				ADMIN_PASSWORD_HASH: string;
				SESSION_SECRET: string;
			};
		}
	}
}

export {};
