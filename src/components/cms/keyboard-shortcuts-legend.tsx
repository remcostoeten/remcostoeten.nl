import { AnimatePresence, motion } from "framer-motion";
import { Command, HelpCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

type TShortcut = {
	keys: string[];
	description: string;
	context?: string;
};

const shortcuts: TShortcut[] = [
	{
		keys: ["Ctrl", "H"],
		description: "Edit homepage",
		context: "Pages list",
	},
	{
		keys: ["Ctrl", "S"],
		description: "Save current page",
		context: "Page editor",
	},
	{
		keys: ["Ctrl", "P"],
		description: "Preview page in new tab",
		context: "Page editor",
	},
	{
		keys: ["Ctrl", "E"],
		description: "Return to pages list",
		context: "Page editor",
	},
	{
		keys: ["CapsLock", "S"],
		description: "Quick save (legacy)",
		context: "Page editor",
	},
	{
		keys: ["CapsLock", "Z"],
		description: "Undo changes",
		context: "Page editor",
	},
	{
		keys: ["Backspace", "×3", "Space", "×3"],
		description: "Return to homepage",
		context: "CMS layout",
	},
	{
		keys: ["?"],
		description: "Show/hide keyboard shortcuts",
		context: "Global",
	},
];

function KeyboardShortcut({ shortcut }: { shortcut: TShortcut }) {
	return (
		<div className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
			<div className="flex items-center gap-2">
				<div className="flex items-center gap-1">
					{shortcut.keys.map((key, index) => (
						<span key={index} className="flex items-center gap-1">
							<kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono text-muted-foreground">
								{key === "Ctrl" && <Command className="w-3 h-3" />}
								{key !== "Ctrl" && key}
							</kbd>
							{index < shortcut.keys.length - 1 && (
								<span className="text-muted-foreground/60">+</span>
							)}
						</span>
					))}
				</div>
				<span className="text-sm text-foreground">{shortcut.description}</span>
			</div>
			{shortcut.context && (
				<span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
					{shortcut.context}
				</span>
			)}
		</div>
	);
}

export default function KeyboardShortcutsLegend() {
	const [isOpen, setIsOpen] = useState(false);

	// Handle keyboard shortcuts for the legend itself
	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "?" && !isOpen) {
				event.preventDefault();
				setIsOpen(true);
			} else if (event.key === "Escape" && isOpen) {
				event.preventDefault();
				setIsOpen(false);
			}
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen]);

	return (
		<>
			<motion.button
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				onClick={() => setIsOpen(true)}
				className="fixed bottom-6 right-6 p-3 bg-accent text-accent-foreground rounded-full shadow-lg hover:bg-accent/90 transition-colors z-40"
				title="Keyboard shortcuts"
			>
				<HelpCircle className="w-5 h-5" />
			</motion.button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
						onClick={() => setIsOpen(false)}
					>
						<motion.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.95, opacity: 0 }}
							className="bg-popover text-popover-foreground rounded-xl border border-border shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="sticky top-0 bg-popover border-b border-border p-6 flex items-center justify-between">
								<div>
									<h2 className="text-xl font-semibold text-foreground">
										Keyboard Shortcuts
									</h2>
									<p className="text-sm text-muted-foreground mt-1">
										Use these shortcuts to navigate and edit content faster
									</p>
								</div>
								<button
									onClick={() => setIsOpen(false)}
									className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<div className="p-6 space-y-3">
								{shortcuts.map((shortcut, index) => (
									<KeyboardShortcut key={index} shortcut={shortcut} />
								))}
							</div>

							<div className="sticky bottom-0 bg-popover border-t border-border p-6">
								<div className="flex items-center justify-between text-sm text-muted-foreground">
									<div className="flex items-center gap-2">
										<span>Press</span>
										<kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono">
											?
										</kbd>
										<span>to toggle this help</span>
									</div>
									<div className="flex items-center gap-2">
										<kbd className="px-2 py-1 bg-muted border border-border rounded text-xs font-mono">
											Esc
										</kbd>
										<span>to close</span>
									</div>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
