import React from "react"

function PrismIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-400 transition-colors duration-500 group-hover:text-zinc-200"
    >
      <path d="M2 22 12 2l10 20" />
      <path d="m3.5 19 8.5-15" />
      <path d="m20.5 19-8.5-15" />
      <path d="M2 22h20" />
    </svg>
  )
}

function OrbitIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-400 transition-colors duration-500 group-hover:text-zinc-200"
    >
      <circle cx="12" cy="12" r="3" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <path d="M10.4 21.9a10 10 0 0 0 9.941-15.416" />
      <path d="M13.5 2.1a10 10 0 0 0-9.841 15.416" />
    </svg>
  )
}

function HexagonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-400 transition-colors duration-500 group-hover:text-zinc-200"
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  )
}

function WavelengthIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-400 transition-colors duration-500 group-hover:text-zinc-200"
    >
      <path d="M2 12c.6-.5 1.2-1 2.5-1C6 11 6 13 7.5 13c1.5 0 1.5-2 3-2s1.5 2 3 2 1.5-2 3-2 1.5 2 3 2 1-1 2.5-1" />
      <path d="M2 6c.6-.5 1.2-1 2.5-1C6 5 6 7 7.5 7 9 7 9 5 10.5 5s1.5 2 3 2 1.5-2 3-2 1.5 2 3 2 1-1 2.5-1" />
      <path d="M2 18c.6-.5 1.2-1 2.5-1 1.5 0 1.5 2 3 2s1.5-2 3-2 1.5 2 3 2 1.5-2 3-2 1-1 2.5-1" />
    </svg>
  )
}

function FlameIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-500 transition-colors duration-500 group-hover:text-orange-400/80"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )
}

function ScanIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-400 transition-colors duration-500 group-hover:text-zinc-200"
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 8v1" />
      <path d="M12 15v1" />
      <path d="M8 12h1" />
      <path d="M15 12h1" />
    </svg>
  )
}

function CrystalIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-400 transition-colors duration-500 group-hover:text-zinc-200"
    >
      <path d="M6 3h12l4 6-10 13L2 9z" />
      <path d="M11 3 8 9l4 13 4-13-3-6" />
      <path d="M2 9h20" />
    </svg>
  )
}

function SignalIcon() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/80 opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
    </span>
  )
}

function PulseRingIcon() {
  return (
    <span className="relative flex h-3 w-3 items-center justify-center">
      <span className="absolute inline-flex h-full w-full animate-pulse-subtle rounded-full border border-zinc-400/50" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-zinc-400 transition-colors duration-500 group-hover:bg-zinc-200" />
    </span>
  )
}

function SpinnerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-spin-slow text-zinc-400"
    >
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="m4.93 4.93 2.83 2.83" />
      <path d="m16.24 16.24 2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="m4.93 19.07 2.83-2.83" />
      <path d="m16.24 7.76 2.83-2.83" />
    </svg>
  )
}

// --- Icon Registry ---

export const ICON_REGISTRY: Record<string, () => React.ReactNode> = {
  prism: () => <PrismIcon />,
  orbit: () => <OrbitIcon />,
  hexagon: () => <HexagonIcon />,
  wavelength: () => <WavelengthIcon />,
  flame: () => <FlameIcon />,
  scan: () => <ScanIcon />,
  crystal: () => <CrystalIcon />,
  signal: () => <SignalIcon />,
  "pulse-ring": () => <PulseRingIcon />,
  spinner: () => <SpinnerIcon />,
}

export function getIconByKey(key: string | null): React.ReactNode | undefined {
  if (!key) return undefined
  const factory = ICON_REGISTRY[key]
  return factory ? factory() : undefined
}

export function getIconKeys(): string[] {
  return Object.keys(ICON_REGISTRY)
}
