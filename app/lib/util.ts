import { createCookie } from "@remix-run/node";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function isValidIPv4(ip: string): boolean {
	const ipv4Regex =
		/^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;

	if (!ipv4Regex.test(ip)) {
		return false;
	}

	// Split the IP address into its individual octets
	const octets = ip.split(".").map(Number);

	// Check if each octet is within the range 0 to 255
	for (const octet of octets) {
		if (octet < 0 || octet > 255) {
			return false;
		}
	}

	return true;
}

export const hueAuth = createCookie("hueAuth");
