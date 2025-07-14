import React, { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import useKeyboardShortcuts from "@/hooks/use-keyboard-shortcuts";

type TProps = {
	children: ReactNode;
	showBackButton?: boolean;
	onBack?: () => void;
};

export default function CMSLayout({ children, showBackButton = false, onBack = () => {} }: TProps) {
	const router = useRouter();

	useKeyboardShortcuts(
		{
			"backspace backspace backspace space space space": () => {
				router.push("/");
			},
		},
		[]
	);

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8 flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold text-foreground mb-2">Content Manager</h1>
						<p className="text-muted-foreground">
							Manage your site pages and content
						</p>
					</div>
					<div className="flex items-center gap-3">
						<Button 
							variant="outline" 
							size="sm" 
							onClick={() => router.push("/")} 
							className="flex items-center"
							title="Go back to index page (Backspace 3x + Space 3x)"
						>
							<Home className="w-4 h-4 mr-1" />
							Back to Index
						</Button>
						{showBackButton && onBack && (
							<Button variant="outline" size="sm" onClick={onBack} className="flex items-center">
								<ArrowLeft className="w-4 h-4 mr-1" />
								Back
							</Button>
						)}
					</div>
				</div>
				<div className="bg-card rounded-lg border border-border p-6">
					{children}
				</div>
			</div>
		</div>
	);
}
