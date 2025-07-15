const REMEMBER_ME_KEY = "rememberMe";
const CREDENTIALS_KEY = "savedCredentials";

export function saveCredentials(email: string, password: string) {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ email, password }));
		localStorage.setItem(REMEMBER_ME_KEY, "true");
	} catch (error) {
		console.error("Failed to save credentials:", error);
	}
}

export function getSavedCredentials(): {
	email: string;
	password: string;
} | null {
	if (typeof window === "undefined") return null;

	try {
		const rememberMe = localStorage.getItem(REMEMBER_ME_KEY);
		if (rememberMe !== "true") return null;

		const saved = localStorage.getItem(CREDENTIALS_KEY);
		if (!saved) return null;

		return JSON.parse(saved);
	} catch (error) {
		console.error("Failed to get saved credentials:", error);
		return null;
	}
}

export function clearSavedCredentials() {
	if (typeof window === "undefined") return;

	try {
		localStorage.removeItem(CREDENTIALS_KEY);
		localStorage.removeItem(REMEMBER_ME_KEY);
	} catch (error) {
		console.error("Failed to clear saved credentials:", error);
	}
}

export function isRememberMeEnabled(): boolean {
	if (typeof window === "undefined") return false;

	try {
		return localStorage.getItem(REMEMBER_ME_KEY) === "true";
	} catch (error) {
		console.error("Failed to check remember me status:", error);
		return false;
	}
}
