// Usage: bun run scripts/hash-password.ts <password> <session-secret>
// Or: npx tsx scripts/hash-password.ts <password> <session-secret>

const encoder = new TextEncoder();

async function hashPassword(password: string, secret: string): Promise<string> {
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		encoder.encode(password),
	);
	return Array.from(new Uint8Array(signature))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

const [password, secret] = process.argv.slice(2);

if (!password || !secret) {
	console.error(
		"Usage: bun run scripts/hash-password.ts <password> <session-secret>",
	);
	console.error("\nExample:");
	console.error(
		"  bun run scripts/hash-password.ts mypassword $(openssl rand -hex 32)",
	);
	process.exit(1);
}

const hash = await hashPassword(password, secret);

console.log(
	"\nAdd these to your .dev.vars file (for local dev) or Cloudflare secrets (for production):\n",
);
console.log(`SESSION_SECRET=${secret}`);
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log("\nTo set Cloudflare secrets, run:");
console.log(`  wrangler secret put SESSION_SECRET`);
console.log(`  wrangler secret put ADMIN_PASSWORD_HASH`);
