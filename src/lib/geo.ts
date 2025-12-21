export async function fetchGeoInfo(ip: string) {
    if (ip === 'unknown' || ip === '127.0.0.1' || ip === '::1') return null
    try {
        const token = process.env.IP_INFO_TOKEN
        if (!token) return null

        const response = await fetch(`https://ipinfo.io/${ip}?token=${token}`)
        if (!response.ok) return null

        return await response.json()
    } catch (error) {
        console.error('Failed to fetch geo info:', error)
        return null
    }
}
