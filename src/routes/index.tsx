import { A } from '@solidjs/router'
import BaseLayout from '~/components/layout/BaseLayout'
import Button from '~/components/ui/Button'

const HomePage = () => {
  return (
    <BaseLayout>
      {/* Hero Section */}
      <section class="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div class="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div class="text-center">
            <h1 class="text-5xl md:text-6xl font-bold mb-6">
              Hi, I'm Remco Stoeten
            </h1>
            <p class="text-xl md:text-2xl mb-8 text-blue-100">
              Full-stack developer passionate about creating exceptional digital experiences
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <A href="/projects">
                <Button size="lg" class="bg-white text-blue-600 hover:bg-gray-100">
                  View My Work
                </Button>
              </A>
              <A href="/contact">
                <Button size="lg" variant="ghost" class="border border-white text-white hover:bg-white hover:text-blue-600">
                  Get In Touch
                </Button>
              </A>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section class="py-20 bg-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">About Me</h2>
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
              I'm a passionate developer who loves building modern web applications 
              with cutting-edge technologies. I focus on creating clean, efficient, 
              and user-friendly solutions.
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center">
              <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Frontend Development</h3>
              <p class="text-gray-600">
                Building responsive and interactive user interfaces with React, SolidJS, and modern CSS.
              </p>
            </div>
            
            <div class="text-center">
              <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Backend Development</h3>
              <p class="text-gray-600">
                Creating robust APIs and server-side applications with Node.js, PostgreSQL, and modern frameworks.
              </p>
            </div>
            
            <div class="text-center">
              <div class="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Performance & UX</h3>
              <p class="text-gray-600">
                Optimizing applications for speed, accessibility, and exceptional user experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section class="py-20 bg-gray-50">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-gray-900 mb-4">Technologies I Use</h2>
            <p class="text-lg text-gray-600">
              I work with modern tools and frameworks to build scalable applications.
            </p>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              'TypeScript', 'React', 'SolidJS', 'Next.js', 'Node.js', 'PostgreSQL',
              'Tailwind CSS', 'Drizzle ORM', 'Vite', 'Docker', 'Git', 'Vercel'
            ].map((tech) => (
              <div class="bg-white p-4 rounded-lg shadow-sm text-center">
                <p class="font-medium text-gray-900">{tech}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section class="py-20 bg-blue-600">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-4xl font-bold text-white mb-4">
            Ready to Work Together?
          </h2>
          <p class="text-xl text-blue-100 mb-8">
            I'm always interested in new opportunities and exciting projects.
          </p>
          <A href="/contact">
            <Button size="lg" class="bg-white text-blue-600 hover:bg-gray-100">
              Start a Conversation
            </Button>
          </A>
        </div>
      </section>
    </BaseLayout>
  )
}

export default HomePage
