import { Section } from "~/components/ui/Section";
import { Heading } from "~/components/ui/Heading";
import { OpenToWorkBadge } from "~/components/ui/OpenToWorkBadge";
import { SocialLink } from "~/components/ui/SocialLink";
import { ProjectBadge } from "~/components/ui/ProjectBadge";
import { Pill } from "~/components/ui/Pill";
import { IconPill } from "~/components/ui/IconPill";

export default function Home() {
  return (
    <main class="mx-auto flex min-h-dvh antialiased max-w-2xl flex-col items-center justify-between gap-20 font-sans">
      <div class="flex w-full flex-col">
        <header class="mt-3 flex w-full items-center justify-between px-8 py-6 sm:mt-10">
          <div class="flex items-center">
            <img alt="logo" width="100" height="100" class="size-5 overflow-hidden rounded-full object-cover" src="/gradient.png" />
          </div>
          <nav class="flex items-center space-x-8">
            <a target="_blank" class="text-gray-600 transition-colors hover:text-[#00997e] hover:underline" href="https://www.figma.com/proto/V0gqcvrLqb8H05Mo90mOCL/Portfolio?node-id=1-3601&t=3QozI3ydj9zgIlkI-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A3601" rel="noreferrer">work</a>
            <a class="text-gray-600 transition-colors hover:text-[#00997e] hover:underline" href="/experience">experience</a>
            <a class="text-gray-600 transition-colors hover:text-[#00997e] hover:underline" href="/connect">connect</a>
          </nav>
        </header>

        <Section class="mx-auto mt-5 w-full px-8">
          <Section class="mb-8">
            <Heading text="Ritu Gaur" level={1} class="mb-2 font-serif text-4xl leading-tight text-[#00997e]" />
            <div class="flex items-center justify-start gap-2">
              <p class="text-md text-gray-600">design • ui/ux • branding • no code</p>
              <OpenToWorkBadge text="open to work" />
            </div>
          </Section>

          <Section class="mb-12 max-w-3xl">
            <p class="text-sm leading-relaxed text-gray-700">
              Hi there, I'm Hritu, a student and designer focused on
              <span class="font-medium text-gray-900"> digital experiences</span>.
              I blend <span class="font-medium text-gray-900">aesthetics</span> with
              <span class="font-medium text-gray-900"> functionality</span> to create intuitive interfaces.
              Through <span class="font-medium text-gray-900">research</span> and
              <span class="font-medium text-gray-900"> design</span>, I craft solutions that solve real user needs.
            </p>
          </Section>

          <Section class="mb-8 flex flex-wrap items-center gap-4 md:mb-12 md:gap-6">
            <SocialLink label="twitter" href="https://x.com/ritss32" svgPath="M214.75,211.71l-62.6-98.38,61.77-67.95a8,8,0,0,0-11.84-10.76L143.24,99.34,102.75,35.71A8,8,0,0,0,96,32H48a8,8,0,0,0-6.75,12.3l62.6,98.37-61.77,68a8,8,0,1,0,11.84,10.76l58.84-64.72,40.49,63.63A8,8,0,0,0,160,224h48a8,8,0,0,0,6.75-12.29ZM164.39,208,62.57,48h29L193.43,208Z" />
            <SocialLink label="dribbble" href="https://dribbble.com/thisisritu" svgPath="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm87.65,96.18Q211.83,120,208,120a168.58,168.58,0,0,0-43.94,5.84A166.52,166.52,0,0,0,150.61,96a168.32,168.32,0,0,0,38.2-31.55A87.78,87.78,0,0,1,215.65,120.18ZM176.28,54.46A151.75,151.75,0,0,1,142,82.52a169.22,169.22,0,0,0-38.63-39,88,88,0,0,1,73,10.94ZM85.65,50.88a153.13,153.13,0,0,1,42,39.18A151.82,151.82,0,0,1,64,104a154.19,154.19,0,0,1-20.28-1.35A88.39,88.39,0,0,1,85.65,50.88ZM40,128a87.73,87.73,0,0,1,.53-9.64A168.85,168.85,0,0,0,64,120a167.84,167.84,0,0,0,72.52-16.4,150.82,150.82,0,0,1,12.31,27.13,167.11,167.11,0,0,0-24.59,11.6,169.22,169.22,0,0,0-55.07,51.06A87.8,87.8,0,0,1,40,128Zm42,75a152.91,152.91,0,0,1,50.24-46.79,148.81,148.81,0,0,1,20.95-10,152.48,152.48,0,0,1,3.73,33.47,152.93,152.93,0,0,1-3.49,32.56A87.92,87.92,0,0,1,82,203Zm89.06,1.73a170,170,0,0,0,1.86-25,168.69,168.69,0,0,0-4.45-38.47A152.31,152.31,0,0,1,208,136q3.8,0,7.61.19A88.13,88.13,0,0,1,171.06,204.72Z" />
            <SocialLink label="behance" href="https://www.behance.net/thisisritu" svgPath="M160,80a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H168A8,8,0,0,1,160,80Zm-24,78a42,42,0,0,1-42,42H32a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H90a38,38,0,0,1,25.65,66A42,42,0,0,1,136,158ZM40,116H90a22,22,0,0,0,0-44H40Zm80,42a26,26,0,0,0-26-26H40v52H94A26,26,0,0,0,120,158Zm128-6a8,8,0,0,1-8,8H169a32,32,0,0,0,56.59,11.2,8,8,0,0,1,12.8,9.61A48,48,0,1,1,248,152Zm-17-8a32,32,0,0,0-62,0Z" />
            <SocialLink label="linkedin" href="https://www.linkedin.com/in/ritu-gaur-b717a0315/" svgPath="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z" />
            <SocialLink label="email" href="mailto:ritugaur564@gmail.com" svgPath="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z" />
          </Section>

          <Section class="flex w-full flex-col items-start justify-start">
            <div class="flex items-center justify-start gap-1 rounded-2xl rounded-b-none bg-gray-100 px-4 py-2 font-serif text-sm leading-tight text-black">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256">
                <path d="M208,88H48a16,16,0,0,0-16,16v96a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V104A16,16,0,0,0,208,88Zm0,112H48V104H208v96ZM48,64a8,8,0,0,1,8-8H200a8,8,0,0,1,0,16H56A8,8,0,0,1,48,64ZM64,32a8,8,0,0,1,8-8H184a8,8,0,0,1,0,16H72A8,8,0,0,1,64,32Z" />
              </svg>
              latest projects
            </div>
            <div class="flex flex-wrap items-center justify-start gap-1 rounded-full rounded-t-none">
              <ProjectBadge label="Lucia Dashboard" href="https://github.com/remcostoeten/nextjs-lucia-neon-postgresql-drizzle-dashboard" class="rounded-2xl rounded-tl-none" />
              <ProjectBadge label="File Tree" href="https://github.com/remcostoeten/Beautiful-interactive-file-tree" />
              <ProjectBadge label="Sync Node" href="https://www.figma.com/proto/V0gqcvrLqb8H05Mo90mOCL/Portfolio?node-id=1-2912&t=3QozI3ydj9zgIlkI-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A3601" />
            </div>
          </Section>

          <Section class="mt-5 flex w-full flex-col items-start justify-start gap-3">
            <div class="flex items-center justify-start gap-1 rounded-full bg-gray-100 px-4 py-2 font-serif text-sm leading-tight text-black">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256">
                <path d="M229.5,113,166.06,89.94,143,26.5a16,16,0,0,0-30,0L89.94,89.94,26.5,113a16,16,0,0,0,0,30l63.44,23.07L113,229.5a16,16,0,0,0,30,0l23.07-63.44L229.5,143a16,16,0,0,0,0-30ZM157.08,152.3a8,8,0,0,0-4.78,4.78L128,223.9l-24.3-66.82a8,8,0,0,0-4.78-4.78L32.1,128l66.82-24.3a8,8,0,0,0,4.78-4.78L128,32.1l24.3,66.82a8,8,0,0,0,4.78,4.78L223.9,128Z" />
              </svg>
              tools
            </div>
            <div class="flex flex-wrap items-center justify-start gap-1">
              <IconPill
                text="Figma"
                icon={(
                  <svg width="12" height="12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_17_203)">
                      <path d="M16.0001 48C20.4162 48 24.0002 44.4159 24.0002 39.9999V31.9999H16.0001C11.5841 31.9999 8 35.5839 8 39.9999C8 44.4159 11.5841 48 16.0001 48Z" fill="#0ACF83" />
                      <path d="M8 23.9999C8 19.5839 11.5841 15.9999 16.0001 15.9999H24.0002V31.9999H16.0001C11.5841 31.9999 8 28.4158 8 23.9999Z" fill="#A259FF" />
                      <path d="M8 8C8 3.58401 11.5841 0 16.0001 0H24.0002V16H16.0001C11.5841 16 8 12.416 8 8Z" fill="#F24E1E" />
                      <path d="M24 0H32C36.4183 0 40 3.58172 40 8C40 12.4183 36.4183 16 32 16H24V0Z" fill="#FF7262" />
                      <path d="M40 24C40 28.4183 36.4183 32 32 32C27.5817 32 24 28.4183 24 24C24 19.5817 27.5817 16 32 16C36.4183 16 40 19.5817 40 24Z" fill="#1ABCFE" />
                    </g>
                    <defs>
                      <clipPath id="clip0_17_203">
                        <rect width="48" height="48" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                )}
              />
              <Pill text="Framer" />
              <Pill text="Spline" />
              <Pill text="Rive" />
              <Pill text="Photoshop" />
              <Pill text="Canva" />
            </div>

            <div class="flex items-center justify-start gap-1 rounded-full bg-gray-100 px-4 py-2 font-serif text-sm leading-tight text-black">ai tools</div>
            <div class="flex flex-wrap items-center justify-start gap-1">
              <Pill text="Synthesia" />
              <Pill text="Galileo" />
              <Pill text="Relume" />
              <Pill text="Midjourney" />
              <Pill text="Stitch by Google" />
            </div>
          </Section>
        </Section>
      </div>
    </main>
  );
}
