'use client'

import { useEffect } from 'react'
import { installIconHover } from './icon-frame'

export function IconHoverInstaller() {
	useEffect(() => installIconHover(), [])

	return null
}
