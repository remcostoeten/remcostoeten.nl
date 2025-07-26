import { createSignal, For, Show } from 'solid-js'
import { useGetProjects, useCreateProject } from '~/lib/queries/projects'
import BaseLayout from '~/components/layout/BaseLayout'
import Button from '~/components/ui/Button'
import Input from '~/components/ui/Input'
import type { TProject } from '~/db/schema'

const ProjectsPage = () => {
  const [showForm, setShowForm] = createSignal(false)
  const [formData, setFormData] = createSignal({
    name: '',
    description: '',
    url: '',
    githubUrl: '',
    technologies: [] as string[],
    status: 'active' as const
  })

  const projectsQuery = useGetProjects()
  const createProjectMutation = useCreateProject()

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    const data = formData()
    
    if (!data.name) return

    try {
      await createProjectMutation.mutateAsync({
        ...data,
        technologies: data.technologies.length > 0 ? data.technologies : ['JavaScript']
      })
      
      setFormData({
        name: '',
        description: '',
        url: '',
        githubUrl: '',
        technologies: [],
        status: 'active'
      })
      setShowForm(false)
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const updateFormField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <BaseLayout>
      <div class="max-w-4xl mx-auto p-6">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Projects</h1>
        <button
          onClick={() => setShowForm(!showForm())}
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showForm() ? 'Cancel' : 'Add Project'}
        </button>
      </div>

      <Show when={showForm()}>
        <div class="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 class="text-xl font-semibold mb-4">Create New Project</h2>
          <form onSubmit={handleSubmit} class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                value={formData().name}
                onInput={(e) => updateFormField('name', e.currentTarget.value)}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData().description}
                onInput={(e) => updateFormField('description', e.currentTarget.value)}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Project URL
                </label>
                <input
                  type="url"
                  value={formData().url}
                  onInput={(e) => updateFormField('url', e.currentTarget.value)}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData().githubUrl}
                  onInput={(e) => updateFormField('githubUrl', e.currentTarget.value)}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData().status}
                onChange={(e) => updateFormField('status', e.currentTarget.value)}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={createProjectMutation.isPending}
              class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        </div>
      </Show>

      <div class="space-y-4">
        <Show
          when={!projectsQuery.isLoading}
          fallback={<div class="text-center py-8">Loading projects...</div>}
        >
          <Show
            when={projectsQuery.data && projectsQuery.data.length > 0}
            fallback={
              <div class="text-center py-8 text-gray-500">
                No projects found. Create your first project!
              </div>
            }
          >
            <For each={projectsQuery.data}>
              {(project: TProject) => (
                <div class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-semibold text-gray-900">{project.name}</h3>
                    <span class={`px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <Show when={project.description}>
                    <p class="text-gray-600 mb-4">{project.description}</p>
                  </Show>
                  
                  <div class="flex flex-wrap gap-2 mb-4">
                    <For each={project.technologies}>
                      {(tech) => (
                        <span class="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                          {tech}
                        </span>
                      )}
                    </For>
                  </div>
                  
                  <div class="flex gap-4">
                    <Show when={project.url}>
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Project
                      </a>
                    </Show>
                    
                    <Show when={project.githubUrl}>
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-gray-600 hover:text-gray-800 font-medium"
                      >
                        GitHub
                      </a>
                    </Show>
                  </div>
                </div>
              )}
            </For>
          </Show>
        </Show>
        
        <Show when={projectsQuery.isError}>
          <div class="text-center py-8 text-red-600">
            Error loading projects: {projectsQuery.error?.message}
          </div>
        </Show>
      </div>
    </div>
    </BaseLayout>
  )
}

export default ProjectsPage
