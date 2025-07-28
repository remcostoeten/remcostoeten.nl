import BaseLayout from "~/components/layout/base-layout"

export default function AboutPage() {
  return (
    <BaseLayout>
      <div class="container-centered">
        <div class="py-12">
          <h1 class="text-4xl font-bold text-foreground mb-8">About</h1>
          <div class="prose prose-lg max-w-none">
            <p class="text-foreground leading-relaxed text-base mb-6">
              With extensive experience in{" "}
              <span class="highlight">
                TypeScript and React & Next.js
              </span>
              {" "}I specialize in building scalable web applications, from Magento shops to modern SaaS platforms.
            </p>
            <p class="text-foreground leading-relaxed text-base mb-6">
              Currently working on an{" "}
              <span class="highlight">
                LMS system for Dutch MBO students
              </span>
              {" "}while continuously exploring new technologies and best practices.
            </p>
            <p class="text-muted-foreground">
              This site is built with{" "}
              <a href="https://solidjs.com" target="_blank" class="theme-link with-arrow">
                SolidJS
              </a>
              {" "}and demonstrates modern web development practices.
            </p>
          </div>
        </div>
      </div>
    </BaseLayout>
  )
}
