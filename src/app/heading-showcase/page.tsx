'use client';

import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  Settings,
  Heart,
  Download,
  ExternalLink,
  Search,
  Bell,
  User,
  Home,
  Mail,
  Calendar,
  Tag,
  Activity,
  Code,
  Zap,
  Shield,
  Globe,
  Lock,
  Eye,
  Edit,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  RotateCw
} from 'lucide-react';

export default function HeadingShowcasePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-12">

        {/* Title */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Heading Component Showcase</h1>
          <p className="text-muted-foreground">Demonstrating all variants and props of the Heading component</p>
        </div>

        {/* Basic Usage */}
        <section className="space-y-4">
          <div className="text-lg font-semibold text-foreground">Basic Usage</div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Simple heading with title only:</p>
              <Heading title="Basic Heading" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">No margin variant:</p>
              <Heading title="No Margin Heading" noMargin />
              <p className="text-sm text-muted-foreground mt-2">Content immediately after</p>
            </div>
          </div>
        </section>

        {/* With Icons */}
        <section className="space-y-4">
          <div className="text-lg font-semibold text-foreground">Visual Variants</div>

          <div className="space-y-6">
            {/* Animated Gradient Flow */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Animated Pattern Flow:</p>
              <Heading
                title="Dynamic Flow"
                icon={Activity}
                animated
                bgDirection="diagonal"
              />
            </div>

            {/* Hue Overlay */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Subtle Hue Overlay:</p>
              <Heading
                title="Hue Overlay Premium"
                icon={Zap}
                hueOverlay
                bgDirection="horizontal"
              />
            </div>

            {/* Dark & Animated */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Dark Theme Animated:</p>
              <Heading
                title="System Monitor"
                icon={Settings}
                animated
                colorPattern="dark"
                bgDirection="vertical"
                headerAction={<Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">Active</Badge>}
              />
            </div>

            {/* Custom Brand Integration */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Brand Styled:</p>
              <Heading
                title="Unlock Features"
                icon={Lock}
                hueOverlay
                borderColor="hsl(var(--brand-500))"
                backgroundColor="hsl(var(--brand-500) / 0.05)"
                headerAction={<Button size="sm" className="bg-brand-500 text-white hover:bg-brand-400">Upgrade</Button>}
              />
            </div>
          </div>
        </section>

        {/* With Header Actions */}
        <section className="space-y-4">
          <div className="text-lg font-semibold text-foreground">With Header Actions</div>

          <div className="space-y-6">
            <Heading
              title="User Management"
              icon={User}
              headerAction={<Button size="sm">Add User</Button>}
            />

            <Heading
              title="Notifications"
              icon={Bell}
              headerAction={<Badge variant="secondary">3 New</Badge>}
            />

            <Heading
              title="Quick Actions"
              icon={Zap}
              headerAction={
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Edit</Button>
                  <Button size="sm">Save</Button>
                </div>
              }
            />

            <Heading
              title="Repository Stats"
              icon={Code}
              headerAction={
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    42
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    128
                  </span>
                </div>
              }
            />
          </div>
        </section>

        {/* Background Directions */}
        <section className="space-y-4">
          <div className="text-lg font-semibold text-foreground">Background Directions</div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Default (no gradient):</p>
              <Heading title="Default Direction" bgDirection="default" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Horizontal gradient:</p>
              <Heading title="Horizontal Direction" bgDirection="horizontal" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Vertical gradient:</p>
              <Heading title="Vertical Direction" bgDirection="vertical" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Diagonal gradient:</p>
              <Heading title="Diagonal Direction" bgDirection="diagonal" />
            </div>
          </div>
        </section>

        {/* Color Patterns */}
        <section className="space-y-4">
          <div className="text-lg font-semibold text-foreground">Color Patterns</div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Light pattern:</p>
              <Heading title="Light Pattern" bgDirection="diagonal" colorPattern="light" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Dark pattern:</p>
              <Heading title="Dark Pattern" bgDirection="diagonal" colorPattern="dark" />
            </div>
          </div>
        </section>

        {/* Custom Colors */}
        <section className="space-y-4">
          <div className="text-lg font-semibold text-foreground">Custom Colors</div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Custom background color:</p>
              <Heading title="Custom Background" backgroundColor="bg-blue-50" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Custom border color:</p>
              <Heading title="Custom Border" borderColor="hsl(var(--blue-500))" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Both custom colors:</p>
              <Heading
                title="Custom Both"
                backgroundColor="bg-green-50"
                borderColor="hsl(var(--green-500))"
              />
            </div>
          </div>
        </section>

        {/* Custom Padding */}
        <section className="space-y-4">
          <div className="text-lg font-semibold text-foreground">Custom Padding</div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">No padding:</p>
              <Heading title="No Padding" padding="p-0" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Large padding:</p>
              <Heading title="Large Padding" padding="px-8" />
            </div>
          </div>
        </section>

        {/* Custom Classes */}
        <section className="space-y-4">
          <div className="text-lg font-semibold text-foreground">Custom Classes</div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">With additional styling:</p>
              <Heading
                title="Styled Heading"
                icon={Star}
                className="rounded-none AAAA"
              />
            </div>
          </div>
        </section>

        {/* Complex Examples */}
        <section className="space-y-4">
          <div className="text-lg font-semibold text-foreground">Complex Examples</div>

          <div className="space-y-6">
            <Heading
              title="Activity & Contributions"
              icon={Activity}
              bgDirection="diagonal"
              colorPattern="light"
              headerAction={
                <span className="text-muted-foreground/60 inline-flex items-baseline">
                  2025
                </span>
              }
            />

            <Heading
              title="Repository Management"
              icon={Code}
              bgDirection="horizontal"
              colorPattern="dark"
              headerAction={
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">View Docs</Button>
                  <Button size="sm">Get Started</Button>
                </div>
              }
            />

            <Heading
              title="User Preferences"
              icon={Settings}
              backgroundColor="bg-slate-50"
              borderColor="hsl(var(--slate-300))"
              headerAction={
                <div className="flex items-center gap-3">
                  <Badge variant="outline">Beta</Badge>
                  <Badge variant="secondary">New</Badge>
                </div>
              }
            />
          </div>
        </section>

        {/* Animated & Aesthetic */}
        <section className="space-y-4">
          <div className="text-lg font-semibold text-foreground">Animated & Aesthetic</div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Animated background pattern:</p>
              <Heading
                title="Flowing Pattern"
                icon={Activity}
                animated
              />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">With subtle hue overlay:</p>
              <Heading
                title="Hue Overlay"
                icon={Zap}
                hueOverlay
              />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Combined effects:</p>
              <Heading
                title="Premium Experience"
                icon={Star}
                animated
                hueOverlay
                headerAction={<Badge variant="secondary" className="bg-brand-500/10 text-brand-500 border-brand-500/20">Pro</Badge>}
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            This showcase demonstrates all props and variants of the Heading component.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Check the component source code for more details about implementation.
          </p>
        </div>
      </div>
    </div>
  );
}