'use client'

import { useEffect } from 'react'
import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals'

type Metric = {
	name: string
	value: number
	rating: 'good' | 'needs-improvement' | 'poor'
}

const formatValue = (name: string, value: number): string => {
	if (name === 'CLS') return value.toFixed(3)
	return (value / 1000).toFixed(2) + 's'
}

const getEmoji = (rating: string): string => {
	switch (rating) {
		case 'good':
			return '🟢'
		case 'needs-improvement':
			return '🟡'
		case 'poor':
			return '🔴'
		default:
			return '⚪'
	}
}

export function WebVitalsReporter() {
	useEffect(() => {
		if (process.env.NODE_ENV === 'production') {
			return
		}

		const logMetric = (metric: Metric) => {
			console.log(
				`%c${metric.name}%c ${formatValue(metric.name, metric.value)} ${getEmoji(metric.rating)}`,
				'font-weight: bold; color: #10b981',
				'color: inherit'
			)
		}

		console.log(
			'%c📊 Web Vitals Reporter Active',
			'font-size: 14px; font-weight: bold'
		)

		onLCP(logMetric)
		onFCP(logMetric)
		onCLS(logMetric)
		onTTFB(logMetric)
	}, [])

	return null
}
