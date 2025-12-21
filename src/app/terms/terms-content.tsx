'use client';

import { FileText, Users, Shield, AlertTriangle, Mail, Github } from 'lucide-react'
import { Section, SubSection, TimelineItem } from '@/components/ui/section'

export default function TermsContent() {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="space-y-6">
      <header className="px-4 md:px-5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated}
        </p>
      </header>

      <div className="space-y-4">
        <Section title="Overview">
          <div className="px-4 md:px-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              Welcome to remcostoeten.nl. These Terms of Service govern your use of my personal website and blog.
              By accessing or using this site, you agree to these terms.
            </p>
            <p>
              This is a personal portfolio and blog. I'm not a company - just a developer sharing my work and thoughts.
            </p>
          </div>
        </Section>

        <Section title="What You Can Do">
          <div className="px-4 md:px-5 space-y-3">
            <TimelineItem
              title="Read and share content"
              icon={FileText}
              indicator="✓"
            >
              You're welcome to read, share, and discuss blog posts and content. Linking is appreciated!
            </TimelineItem>
            <TimelineItem
              title="Use code examples"
              icon={Github}
              indicator="✓"
            >
              Code snippets and examples are provided for learning. Check individual licenses for usage terms.
            </TimelineItem>
            <TimelineItem
              title="Interact with the community"
              icon={Users}
              indicator="✓"
            >
              Leave thoughtful comments and reactions on blog posts using GitHub authentication.
            </TimelineItem>
            <TimelineItem
              title="Contact me"
              icon={Mail}
              indicator="✓"
            >
              Reach out with questions, collaboration opportunities, or feedback.
            </TimelineItem>
          </div>
        </Section>

        <Section title="What You Cannot Do">
          <div className="px-4 md:px-5 space-y-3">
            <TimelineItem
              title="Copy entire content"
              icon={FileText}
              indicator="✗"
            >
              Don't copy and republish entire articles without permission. Excerpts with attribution are fine.
            </TimelineItem>
            <TimelineItem
              title="Spam or abuse"
              icon={AlertTriangle}
              indicator="✗"
            >
              No spamming, harassment, or inappropriate behavior in comments or contact forms.
            </TimelineItem>
            <TimelineItem
              title="Automated access"
              icon={Shield}
              indicator="✗"
            >
              Don't use scrapers, bots, or automated tools without my permission.
            </TimelineItem>
            <TimelineItem
              title="Reverse engineer"
              icon={Github}
              indicator="✗"
              className="text-xs"
            >
              Don't attempt to reverse engineer or extract proprietary site features.
            </TimelineItem>
          </div>
        </Section>

        <Section title="Content and Intellectual Property">
          <div className="px-4 md:px-5 space-y-4">
            <SubSection title="My Content">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  Blog posts, tutorials, and original content are my intellectual property.
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Written content is copyright protected</li>
                  <li>Code examples may have specific licenses</li>
                  <li>Design and layout are proprietary</li>
                </ul>
              </div>
            </SubSection>

            <SubSection title="User Content">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  When you leave comments or reactions:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>You retain ownership of your content</li>
                  <li>You grant me permission to display it on this site</li>
                  <li>You're responsible for what you post</li>
                </ul>
              </div>
            </SubSection>

            <SubSection title="Fair Use">
              <div className="text-sm text-muted-foreground">
                <p>
                  Limited quoting and sharing for educational, commentary, or criticism purposes
                  is welcome under fair use principles, provided proper attribution is given.
                </p>
              </div>
            </SubSection>
          </div>
        </Section>

        <Section title="GitHub Authentication">
          <div className="px-4 md:px-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              This site uses GitHub OAuth for authentication. By signing in:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>You're connecting your GitHub account to this site</li>
              <li>Your public profile information is displayed with your comments</li>
              <li>You agree to GitHub's Terms of Service</li>
              <li>You can revoke access anytime from your GitHub settings</li>
            </ul>
            <p>
              I only access the minimum information needed for authentication and personalization.
            </p>
          </div>
        </Section>

        <Section title="Privacy and Data">
          <div className="px-4 md:px-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              Your privacy matters. My Privacy Policy explains:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>What data I collect and why</li>
              <li>How I use and protect your information</li>
              <li>Your rights regarding your data</li>
            </ul>
            <p>
              Using this site means you consent to the data collection practices described in the Privacy Policy.
            </p>
          </div>
        </Section>

        <Section title="Disclaimers">
          <div className="px-4 md:px-5 space-y-4">
            <SubSection title="Content Accuracy" icon={AlertTriangle}>
              <div className="text-sm text-muted-foreground">
                <p>
                  I do my best to provide accurate information, but content may contain errors or become outdated.
                  Technical tutorials might not work in all environments. Use at your own risk.
                </p>
              </div>
            </SubSection>

            <SubSection title="No Professional Advice" icon={Shield}>
              <div className="text-sm text-muted-foreground">
                <p>
                  This is a personal blog, not professional advice. Content reflects my personal opinions
                  and experiences, not professional guidance.
                </p>
              </div>
            </SubSection>
          </div>
        </Section>

        <Section title="Service Availability">
          <div className="px-4 md:px-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              This is a personal website, not a commercial service. I try to keep it running smoothly,
              but:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>No uptime guarantees or service level agreements</li>
              <li>Temporary downtime for maintenance may occur</li>
              <li>Features may change or be removed without notice</li>
            </ul>
            <p>
              This service is provided "as is" without warranties.
            </p>
          </div>
        </Section>

        <Section title="Limitation of Liability">
          <div className="px-4 md:px-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              To the fullest extent permitted by law:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>I'm not liable for damages arising from site use</li>
              <li>I'm not responsible for third-party content or links</li>
              <li>I'm not liable for code issues in tutorials</li>
            </ul>
            <p className="text-xs">
              This is a personal project - use it responsibly and at your own risk.
            </p>
          </div>
        </Section>

        <Section title="Changes to Terms">
          <div className="px-4 md:px-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              I may update these Terms occasionally. Changes are effective immediately upon posting.
              Continued use of the site means you accept the updated terms.
            </p>
            <p className="text-xs">
              Major changes will be announced in a blog post or site notice.
            </p>
          </div>
        </Section>

        <Section title="Contact">
          <div className="px-4 md:px-5 space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              Questions about these Terms or want to report violations?
            </p>
            <p className="font-mono text-xs">
              stoetenremco [dot] rs [at] gmail [dot] com
            </p>
            <p className="text-xs">
              I'm reasonable and happy to discuss concerns about site usage or content.
            </p>
          </div>
        </Section>
      </div>
    </div>
  )
}