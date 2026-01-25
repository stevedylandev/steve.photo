const encoder = new TextEncoder();

export async function hashPassword(
	password: string,
	secret: string,
): Promise<string> {
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
	return arrayBufferToHex(signature);
}

export async function verifyPassword(
	password: string,
	hash: string,
	secret: string,
): Promise<boolean> {
	const computed = await hashPassword(password, secret);
	return timingSafeEqual(computed, hash);
}

export async function createSession(secret: string): Promise<string> {
	const sessionId = crypto.randomUUID();
	const timestamp = Date.now().toString();
	const data = `${sessionId}.${timestamp}`;

	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
	const sig = arrayBufferToHex(signature);

	return `${data}.${sig}`;
}

export async function verifySession(
	token: string,
	secret: string,
): Promise<boolean> {
	const parts = token.split(".");
	if (parts.length !== 3) return false;

	const [sessionId, timestamp, providedSig] = parts;
	const data = `${sessionId}.${timestamp}`;

	// Check if session is expired (24 hours)
	const sessionTime = parseInt(timestamp, 10);
	if (isNaN(sessionTime) || Date.now() - sessionTime > 24 * 60 * 60 * 1000) {
		return false;
	}

	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
	const expectedSig = arrayBufferToHex(signature);

	return timingSafeEqual(providedSig, expectedSig);
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
	return Array.from(new Uint8Array(buffer))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	}
	return result === 0;
}
