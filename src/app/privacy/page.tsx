import { Suspense } from 'react'
import PrivacyContent from './privacy-content'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for remcostoeten.nl - How we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrivacyContent />
    </Suspense>
  )
}