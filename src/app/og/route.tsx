import { ImageResponse } from 'next/og'
import { siteConfig } from '@/core/config'

export function GET(request: Request) {
    let url = new URL(request.url)
    let title = url.searchParams.get('title') || siteConfig.name

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '64px',
                    backgroundImage: 'linear-gradient(135deg, #020617, #0f172a)',
                    color: '#f8fafc',
                    fontFamily: 'Geist Sans, sans-serif'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        width: '100%'
                    }}
                >
                    <div
                        style={{
                            padding: '8px 24px',
                            borderRadius: '999px',
                            border: '1px solid rgba(248, 250, 252, 0.4)',
                            fontSize: 28,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase'
                        }}
                    >
                        REMCO · STOETEN
                    </div>
                    <div
                        style={{
                            fontSize: 28,
                            color: '#94a3b8',
                            textAlign: 'right'
                        }}
                    >
                        {siteConfig.social.twitter}
                    </div>
                </div>
                <div style={{ width: '100%' }}>
                    <p
                        style={{
                            fontSize: 56,
                            fontWeight: 600,
                            marginBottom: 32,
                            lineHeight: 1.1
                        }}
                    >
                        {title}
                    </p>
                    <p
                        style={{
                            fontSize: 32,
                            color: '#cbd5f5',
                            maxWidth: '90%',
                            lineHeight: 1.4
                        }}
                    >
                        {siteConfig.description}
                    </p>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630
        }
    )
}
