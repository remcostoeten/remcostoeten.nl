import { JSX, Show } from 'solid-js'
import { A } from '@solidjs/router'

type TProps = {
  readonly children: JSX.Element
  readonly title?: string
  readonly showNav?: boolean
}

function BaseLayout(props: TProps) {
  return (
    <div class="min-h-screen bg-gray-50">
      <Show when={props.showNav !== false}>
        <nav class="bg-white shadow-sm border-b border-gray-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
              <div class="flex items-center">
                <A href="/" class="text-2xl font-bold text-gray-900">
                  Remco Stoeten
                </A>
              </div>
              
              <div class="flex items-center space-x-8">
                <A 
                  href="/" 
                  class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  activeClass="text-blue-600 bg-blue-50"
                >
                  Home
                </A>
                <A 
                  href="/projects" 
                  class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  activeClass="text-blue-600 bg-blue-50"
                >
                  Projects
                </A>
                <A 
                  href="/contact" 
                  class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  activeClass="text-blue-600 bg-blue-50"
                >
                  Contact
                </A>
                <A 
                  href="/analytics" 
                  class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  activeClass="text-blue-600 bg-blue-50"
                >
                  Analytics
                </A>
                <A 
                  href="/auth/login" 
                  class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Login
                </A>
              </div>
            </div>
          </div>
        </nav>
      </Show>
      
      <main class="flex-1">
        {props.children}
      </main>
      
      <footer class="bg-white border-t border-gray-200 mt-auto">
        <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div class="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Remco Stoeten. Built with SolidStart.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default BaseLayout
