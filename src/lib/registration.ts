export function isRegistrationEnabled(): boolean {
	return process.env.ENABLE_REGISTER === "true";
}

export function getRegistrationStatus() {
	return {
		enabled: isRegistrationEnabled(),
		message: isRegistrationEnabled()
			? "Registration is currently enabled"
			: "Registration is currently disabled",
	};
}
