import { useCallback, useEffect, useRef } from "react";

type TShortcutHandler = () => void;

type TShortcuts = {
	[key: string]: TShortcutHandler;
};

function useKeyboardShortcuts(shortcuts: TShortcuts, deps: any[] = []) {
	const keySequence = useRef<string[]>([]);
const sequenceTimeout = useRef<NodeJS.Timeout | null>(null);

	const handleKeyDown = useCallback((event: KeyboardEvent) => {
		// Don't trigger shortcuts when typing in inputs
		if (
			event.target instanceof HTMLInputElement ||
			event.target instanceof HTMLTextAreaElement ||
			(event.target as HTMLElement).contentEditable === "true"
		) {
			return;
		}

		const { key, metaKey, ctrlKey, shiftKey, altKey } = event;

		// Build shortcut string
		let shortcut = "";
		if (metaKey || ctrlKey) shortcut += "cmd+";
		if (shiftKey) shortcut += "shift+";
		if (altKey) shortcut += "alt+";
		if (event.getModifierState("CapsLock")) shortcut += "capslock+";
		shortcut += key.toLowerCase();

		// Check simple shortcuts first
		if (shortcuts[shortcut]) {
			event.preventDefault();
			shortcuts[shortcut]();
			return;
		}

		// Handle sequence shortcuts
		const keyName = key.toLowerCase();
		if (keyName === "backspace" || keyName === " " || keyName === "space") {
			// Clear any existing timeout
			if (sequenceTimeout.current) {
				clearTimeout(sequenceTimeout.current);
			}

			// Add key to sequence
			const normalizedKey = keyName === " " ? "space" : keyName;
			keySequence.current.push(normalizedKey);

			// Check if we have a matching sequence
			const sequenceString = keySequence.current.join(" ");
			if (shortcuts[sequenceString]) {
				event.preventDefault();
				shortcuts[sequenceString]();
				keySequence.current = [];
				return;
			}

			// Set timeout to clear sequence
			sequenceTimeout.current = setTimeout(() => {
				keySequence.current = [];
			}, 1000);
		} else {
			// Reset sequence on any other key
			keySequence.current = [];
			if (sequenceTimeout.current) {
				clearTimeout(sequenceTimeout.current);
			}
		}
	}, deps);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			if (sequenceTimeout.current) {
				clearTimeout(sequenceTimeout.current);
			}
		};
	}, [handleKeyDown]);
}

export default useKeyboardShortcuts;
