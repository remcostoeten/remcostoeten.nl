import React from 'react'
import {
	AlertTriangle,
	Info,
	CheckCircle,
	XCircle,
	AlertCircle,
	HelpCircle
} from 'lucide-react'

type NoticeType =
	| 'notice'
	| 'regular'
	| 'neutral'
	| 'warning'
	| 'alert'
	| 'success'

interface NoticeProps {
	type?: NoticeType
	title?: string
	children: React.ReactNode
	className?: string
}

const noticeConfig = {
	notice: {
		bgColor: 'bg-blue-500/10',
		borderColor: 'border-blue-500/30',
		textColor: 'text-blue-400',
		titleColor: 'text-blue-300',
		icon: Info,
		iconColor: 'text-blue-400',
		bgOpacity: 'bg-blue-500/20'
	},
	regular: {
		bgColor: 'bg-gray-500/10',
		borderColor: 'border-gray-500/30',
		textColor: 'text-gray-400',
		titleColor: 'text-gray-300',
		icon: Info,
		iconColor: 'text-gray-400',
		bgOpacity: 'bg-gray-500/20'
	},
	neutral: {
		bgColor: 'bg-slate-500/10',
		borderColor: 'border-slate-500/30',
		textColor: 'text-slate-400',
		titleColor: 'text-slate-300',
		icon: HelpCircle,
		iconColor: 'text-slate-400',
		bgOpacity: 'bg-slate-500/20'
	},
	warning: {
		bgColor: 'bg-amber-500/10',
		borderColor: 'border-amber-500/30',
		textColor: 'text-amber-400',
		titleColor: 'text-amber-300',
		icon: AlertTriangle,
		iconColor: 'text-amber-400',
		bgOpacity: 'bg-amber-500/20'
	},
	alert: {
		bgColor: 'bg-red-500/10',
		borderColor: 'border-red-500/30',
		textColor: 'text-red-400',
		titleColor: 'text-red-300',
		icon: XCircle,
		iconColor: 'text-red-400',
		bgOpacity: 'bg-red-500/20'
	},
	success: {
		bgColor: 'bg-green-500/10',
		borderColor: 'border-green-500/30',
		textColor: 'text-green-400',
		titleColor: 'text-green-300',
		icon: CheckCircle,
		iconColor: 'text-green-400',
		bgOpacity: 'bg-green-500/20'
	}
}

export function Notice({
	type = 'notice',
	title,
	children,
	className = ''
}: NoticeProps) {
	const config = noticeConfig[type]
	const Icon = config.icon

	return (
		<div
			className={`mb-6 p-4 ${config.bgColor} border ${config.borderColor} ${config.textColor} text-sm ${className}`}
		>
			<div className="flex items-start gap-3">
				<Icon
					className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`}
				/>
				<div className="flex-1 min-w-0">
					{title && (
						<div
							className={`font-semibold ${config.titleColor} mb-1`}
						>
							{title}
						</div>
					)}
					<div className={`${config.textColor} leading-relaxed`}>
						{children}
					</div>
				</div>
			</div>
		</div>
	)
}

export function NoticeAlert({
	title,
	children,
	className
}: Omit<NoticeProps, 'type'>) {
	return (
		<Notice type="alert" title={title} className={className}>
			{children}
		</Notice>
	)
}

export function NoticeWarning({
	title,
	children,
	className
}: Omit<NoticeProps, 'type'>) {
	return (
		<Notice type="warning" title={title} className={className}>
			{children}
		</Notice>
	)
}

export function NoticeSuccess({
	title,
	children,
	className
}: Omit<NoticeProps, 'type'>) {
	return (
		<Notice type="success" title={title} className={className}>
			{children}
		</Notice>
	)
}

export function NoticeInfo({
	title,
	children,
	className
}: Omit<NoticeProps, 'type'>) {
	return (
		<Notice type="notice" title={title} className={className}>
			{children}
		</Notice>
	)
}

export function NoticeNeutral({
	title,
	children,
	className
}: Omit<NoticeProps, 'type'>) {
	return (
		<Notice type="neutral" title={title} className={className}>
			{children}
		</Notice>
	)
}

export function NoticeRegular({
	title,
	children,
	className
}: Omit<NoticeProps, 'type'>) {
	return (
		<Notice type="regular" title={title} className={className}>
			{children}
		</Notice>
	)
}
