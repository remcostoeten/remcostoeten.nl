'use client'

import { useState, useEffect } from 'react'

const ASCII_1 = `
                 ,,                                    ..
             .x888888hx  .uef^"                  .u.  .
            d888888888888h  'd0               .ud8888ub.
           8888888888888888  .d88.         . :88888888888:
          X888888888888888~:888888.      .u-"  "*8888888888"
         888888888888888888888888      .88:     **********"
        X888888888888888888888888~  .x8888       .."""""".
        888888888888888888888888b  888888x    .d8888888888"
      .888888888888888888888888/  @888888     88888888888b
     8888888888888888888888888   .@%888888.   "*8888888888b
    .88888888888888888888888"   ::"*888888   .h%%88888888
    """88888888888888888888"  :x.  "*88888""   .h  8888888
        ""**888888888888*"  :::.    "*888x"    d"   "98888
                              ::::::::.::"   .f"     "9888.
                                              :8      "*88x.
                                            ::        :"888"
                                           .:         :"9888"
                                          ..:'      .:'"   "*88x.
                                        .::::..  .::"      :"8"
                                    ..:::::::;;;;::"     ::::..
                                   ::::::::::::::::"
                                   ::::::''''::::::"
                                   ::::::    ::::::

`

const ASCII_2 = `
                    .--.
                   |o__o |
                   {__  }|
                   /      \\
                  (_/ \\_)
`

export function DevToolsBanner() {
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		if (process.env.NODE_ENV !== 'production') return

		const checkDevTools = () => {
			const threshold = 170
			const devToolsOpen =
				window.outerWidth - window.innerWidth > threshold ||
				window.outerHeight - window.innerHeight > threshold

			setIsVisible(devToolsOpen)
		}

		checkDevTools()
		window.addEventListener('resize', checkDevTools)
		const interval = setInterval(checkDevTools, 500)

		return () => {
			window.removeEventListener('resize', checkDevTools)
			clearInterval(interval)
		}
	}, [])

	if (!isVisible) {
		return null
	}

	return (
		<div
			style={{
				position: 'fixed',
				bottom: 0,
				left: 0,
				right: 0,
				zIndex: 999999,
				background: '#000',
				color: '#22c55e',
				fontFamily:
					'"Fira Code", "JetBrains Mono", ui-monospace, monospace',
				fontSize: '9px',
				lineHeight: 1.2,
				padding: '24px 8px 16px',
				borderTop: '3px solid #22c55e'
			}}
		>
			<pre
				style={{
					margin: 0,
					textAlign: 'center',
					whiteSpace: 'pre'
				}}
			>
				{ASCII_1}
			</pre>
			<div
				style={{
					textAlign: 'center',
					opacity: 0.4,
					margin: '2px 0'
				}}
			>
				────────────────────────────────────────────
			</div>
			<pre
				style={{
					margin: 0,
					textAlign: 'center',
					whiteSpace: 'pre'
				}}
			>
				{ASCII_2}
			</pre>
		</div>
	)
}