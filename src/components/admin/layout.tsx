"use client";

import { ArrowLeft, Home, MessageSquare, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CMSSection } from "@/components/admin/cms/cms-section";
import { FeedbackManagement } from "@/components/admin/feedback-management";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useKeyboardShortcuts from "@/hooks/use-keyboard-shortcuts";

type TProps = {
	showBackButton?: boolean;
	onBack?: () => void;
};

export default function AdminLayout({
	showBackButton = false,
	onBack = () => {},
}: TProps) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("content");
	const [unreadCount, setUnreadCount] = useState(0);

	async function fetchUnreadCount() {
		try {
			const response = await fetch("/api/feedback/unread-count");
			if (response.ok) {
				const data = await response.json();
				setUnreadCount(data.count);
			}
		} catch (error) {
			console.error("Failed to fetch unread count:", error);
		}
	}

	useEffect(function loadUnreadCount() {
		fetchUnreadCount();
	}, []);

	useEffect(function handleHashRouting() {
		function updateTabFromHash() {
			const hash = window.location.hash.replace("#", "");
			if (hash === "cms") {
				setActiveTab("content");
			} else if (hash === "feedback") {
				setActiveTab("feedback");
			}
		}

		updateTabFromHash();
		window.addEventListener("hashchange", updateTabFromHash);
		return function cleanup() {
			window.removeEventListener("hashchange", updateTabFromHash);
		};
	}, []);

	function handleTabChange(value: string) {
		setActiveTab(value);
		if (value === "content") {
			window.history.pushState(null, "", "#cms");
		} else if (value === "feedback") {
			window.history.pushState(null, "", "#feedback");
		}
	}

	useKeyboardShortcuts(
		{
			"backspace backspace backspace space space space": () => {
				router.push("/");
			},
		},
		[],
	);

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8 flex justify-between items-center">
					<div>
						<h1 className="text-2xl font-bold text-foreground mb-2">
							Admin Dashboard
						</h1>
						<p className="text-muted-foreground">
							Manage your site content and user feedback
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
							<Button
								variant="outline"
								size="sm"
								onClick={onBack}
								className="flex items-center"
							>
								<ArrowLeft className="w-4 h-4 mr-1" />
								Back
							</Button>
						)}
						<LogoutButton variant="outline" size="sm" />
					</div>
				</div>

				<div className="bg-card rounded-lg border border-border p-6">
					<Tabs
						value={activeTab}
						onValueChange={handleTabChange}
						className="w-full"
					>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="content" className="flex items-center gap-2">
								<Settings className="w-4 h-4" />
								Content Management
							</TabsTrigger>
							<TabsTrigger value="feedback" className="flex items-center gap-2">
								<MessageSquare className="w-4 h-4" />
								Feedback Management
								{unreadCount > 0 && (
									<span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
										{unreadCount}
									</span>
								)}
							</TabsTrigger>
						</TabsList>

						<TabsContent value="content" className="mt-6">
							<CMSSection />
						</TabsContent>

						<TabsContent value="feedback" className="mt-6">
							<FeedbackManagement onUnreadCountChange={fetchUnreadCount} />
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
}
