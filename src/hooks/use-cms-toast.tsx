import { X } from "lucide-react";
import { useState } from "react";

type ToastType = "success" | "error" | "warning" | "info";

type CMSToast = {
	id: string;
	type: ToastType;
	title: string;
	message?: string;
	duration?: number;
};

export function useCMSToast() {
	const [toasts, setToasts] = useState<CMSToast[]>([]);

	const addToast = (toast: Omit<CMSToast, "id">) => {
		const id = Math.random().toString(36).substr(2, 9);
		const newToast = { ...toast, id };
		setToasts((prev) => [...prev, newToast]);

		// Auto remove after duration
		setTimeout(() => {
			removeToast(id);
		}, toast.duration || 3000);
	};

	const removeToast = (id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	};

	const success = (title: string, message?: string) => {
		addToast({ type: "success", title, message });
	};

	const error = (title: string, message?: string) => {
		addToast({ type: "error", title, message });
	};

	const warning = (title: string, message?: string) => {
		addToast({ type: "warning", title, message });
	};

	const info = (title: string, message?: string) => {
		addToast({ type: "info", title, message });
	};

	return {
		toasts,
		removeToast,
		success,
		error,
		warning,
		info,
	};
}

type ToastComponentProps = {
	toast: CMSToast;
	onClose: (id: string) => void;
};

export function CMSToast({ toast, onClose }: ToastComponentProps) {
	const getStyles = () => {
		switch (toast.type) {
			case "success":
				return "bg-green-600 text-white";
			case "error":
				return "bg-red-600 text-white";
			case "warning":
				return "bg-yellow-600 text-white";
			case "info":
				return "bg-blue-600 text-white";
			default:
				return "bg-gray-600 text-white";
		}
	};

	return (
		<div
			className={`
        ${getStyles()}
        rounded-lg shadow-lg px-4 py-3
        animate-in slide-in-from-right duration-200 ease-out
        max-w-sm
      `}
		>
			<div className="flex items-center justify-between">
				<div className="text-sm font-medium">{toast.title}</div>
				<button
					onClick={() => onClose(toast.id)}
					className="ml-3 text-white/80 hover:text-white transition-colors"
				>
					<X className="w-4 h-4" />
				</button>
			</div>
			{toast.message && (
				<div className="text-xs text-white/90 mt-1">{toast.message}</div>
			)}
		</div>
	);
}

type ToastContainerProps = {
	toasts: CMSToast[];
	onRemove: (id: string) => void;
};

export function CMSToastContainer({ toasts, onRemove }: ToastContainerProps) {
	return (
		<div className="fixed bottom-6 right-6 z-50 space-y-3">
			{toasts.map((toast) => (
				<CMSToast key={toast.id} toast={toast} onClose={onRemove} />
			))}
		</div>
	);
}
