'use client';

import { Shield, Eye, Database, Users, Mail, Cookie } from 'lucide-react'
import { Section, SubSection, TimelineItem } from '@/components/ui/section'

export default function PrivacyContent() {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="space-y-6">
      <header className="px-4 md:px-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
      </header>

      <div className="space-y-4">
        <Section title="Introduction">
          <div className="px-4 md:px-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              This Privacy Policy explains how I collect, use, and protect your information when you visit remcostoeten.nl.
              I believe in transparency and only collect data that's necessary to improve your experience on this site.
            </p>
          </div>
        </Section>

        <Section title="Information I Collect">
          <div className="px-4 md:px-5 space-y-4">
            <SubSection title="Analytics Data" icon={Eye}>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  I use PostHog to understand how people interact with my site. This includes:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Pages you visit and how long you stay</li>
                  <li>General location (country/city level, not precise)</li>
                  <li>Browser type and screen size</li>
                  <li>Interaction with blog posts and features</li>
                </ul>
                <p className="text-xs">
                  This data is anonymized and never linked to your personal identity.
                </p>
              </div>
            </SubSection>

            <SubSection title="Authentication Data" icon={Users}>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  When you sign in with GitHub to leave blog reactions or comment:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Your GitHub username and profile picture</li>
                  <li>Email address (from your GitHub profile)</li>
                  <li>Your blog reactions and comments</li>
                </ul>
                <p className="text-xs">
                  I only store what's necessary for authentication and personalization.
                </p>
              </div>
            </SubSection>

            <SubSection title="Contact Form Data" icon={Mail}>
              <div className="text-sm text-muted-foreground">
                <p>
                  When you contact me through the contact form, I receive your email address and message.
                  This data is only used to respond to your inquiry.
                </p>
              </div>
            </SubSection>

            <SubSection title="Technical Data" icon={Database}>
              <div className="text-sm text-muted-foreground">
                <p>
                  Basic technical information like IP address, browser headers, and cookies are collected
                  for security and site functionality.
                </p>
              </div>
            </SubSection>
          </div>
        </Section>

        <Section title="How I Use Your Data">
          <div className="px-4 md:px-5 space-y-3">
            <TimelineItem
              title="Improve the website"
              icon={Eye}
              indicator="Analytics"
            >
              Analytics help me understand what content is valuable and where to improve the user experience.
            </TimelineItem>
            <TimelineItem
              title="Personalize your experience"
              icon={Users}
              indicator="Authentication"
            >
              GitHub authentication allows me to show your profile picture and remember your blog reactions.
            </TimelineItem>
            <TimelineItem
              title="Communicate with you"
              icon={Mail}
              indicator="Contact"
            >
              I only use your contact information to respond to your messages.
            </TimelineItem>
            <TimelineItem
              title="Security and maintenance"
              icon={Shield}
              indicator="Safety"
            >
              Basic data helps me keep the site secure and running smoothly.
            </TimelineItem>
          </div>
        </Section>

        <Section title="Data Storage and Security">
          <div className="px-4 md:px-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              Your data is stored securely on:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>Vercel:</strong> Analytics and site hosting (EU/US data centers)</li>
              <li><strong>Neon:</strong> User data and blog interactions (EU data centers)</li>
              <li><strong>GitHub:</strong> OAuth authentication data</li>
            </ul>
            <p>
              I take reasonable security measures to protect your data, including encryption for data transmission
              and limited access to personal information.
            </p>
          </div>
        </Section>

        <Section title="Cookies and Tracking">
          <div className="px-4 md:px-5">
            <SubSection title="Essential Cookies" icon={Cookie}>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Required for the site to function:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Authentication tokens (if logged in)</li>
                  <li>Theme preference (light/dark mode)</li>
                  <li>Session management</li>
                </ul>
              </div>
            </SubSection>

            <SubSection title="Analytics Cookies" icon={Eye}>
              <div className="text-sm text-muted-foreground">
                <p>
                  PostHog cookies for anonymous usage tracking. You can opt out by disabling cookies
                  in your browser or using the privacy settings.
                </p>
              </div>
            </SubSection>
          </div>
        </Section>

        <Section title="Your Rights">
          <div className="px-4 md:px-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              Under GDPR and other privacy laws, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Request your data in a machine-readable format</li>
            </ul>
            <p>
              To exercise these rights, email me at stoetenremco [dot] rs [at] gmail [dot] com.
            </p>
          </div>
        </Section>

        <Section title="Third-Party Services">
          <div className="px-4 md:px-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              This site uses the following third-party services:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>GitHub:</strong> OAuth authentication</li>
              <li><strong>PostHog:</strong> Analytics and user behavior tracking</li>
              <li><strong>Vercel:</strong> Website hosting and performance monitoring</li>
              <li><strong>Neon:</strong> Database hosting for user data</li>
            </ul>
            <p>
              Each service has its own privacy policy and data handling practices.
            </p>
          </div>
        </Section>

        <Section title="Contact Me">
          <div className="px-4 md:px-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              If you have questions about this Privacy Policy or how I handle your data,
              please contact me:
            </p>
            <p className="font-mono text-xs">
              stoetenremco [dot] rs [at] gmail [dot] com
            </p>
            <p className="text-xs">
              I'll respond to your privacy concerns within 7 days.
            </p>
          </div>
        </Section>
      </div>
    </div>
  )
}