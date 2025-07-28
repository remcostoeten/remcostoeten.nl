import { createSignal, For, Show } from 'solid-js'
import { useGetProjects, useCreateProject } from '~/lib/queries/projects'
import BaseLayout from '~/components/layout/base-layout'
import type { TProject } from '~/db/schema'

function ProjectsPage() {
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

  async function handleSubmit(e: Event) {
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

  function updateFormField(field: string, value: string) {
    setFormData(function(prev) {
      return { ...prev, [field]: value };
    });
  }

  return (
    <BaseLayout>
      <div class="container-centered">
        <div class="py-12">
          <div class="mb-8">
            <h1 class="text-4xl font-bold text-foreground mb-4">Projects</h1>
            <p class="text-muted-foreground mb-6">
              A collection of my work and side projects
            </p>
            <button
              onClick={() => setShowForm(!showForm())}
              class="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors font-medium"
            >
              {showForm() ? 'Cancel' : 'Add Project'}
            </button>
          </div>

          <Show when={showForm()}>
            <div class="mb-8 p-6 bg-card/50 border border-border rounded-lg">
              <h2 class="text-xl font-semibold text-foreground mb-4">Create New Project</h2>
              <form onSubmit={handleSubmit} class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-foreground mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData().name}
                    onInput={(e) => updateFormField('name', e.currentTarget.value)}
                    class="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    required
                  />
                </div>
            
                <div>
                  <label class="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData().description}
                    onInput={(e) => updateFormField('description', e.currentTarget.value)}
                    class="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    rows={3}
                  />
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-1">
                      Project URL
                    </label>
                    <input
                      type="url"
                      value={formData().url}
                      onInput={(e) => updateFormField('url', e.currentTarget.value)}
                      class="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-1">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={formData().githubUrl}
                      onInput={(e) => updateFormField('githubUrl', e.currentTarget.value)}
                      class="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-foreground mb-1">
                    Status
                  </label>
                  <select
                    value={formData().status}
                    onChange={(e) => updateFormField('status', e.currentTarget.value)}
                    class="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                
                <button
                  type="submit"
                  disabled={createProjectMutation.isPending}
                  class="px-6 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                </button>
              </form>
        </div>
      </Show>

          <div class="space-y-6">
            <Show
              when={!projectsQuery.isLoading}
              fallback={<div class="text-center py-8 text-muted-foreground">Loading projects...</div>}
            >
              <Show
                when={projectsQuery.data && projectsQuery.data.length > 0}
                fallback={
                  <div class="text-center py-8 text-muted-foreground">
                    No projects found. Create your first project!
                  </div>
                }
              >
                <For each={projectsQuery.data}>
                  {(project: TProject) => (
                    <div class="p-6 bg-card/50 border border-border rounded-lg backdrop-blur-sm hover:bg-card/70 transition-colors group">
                      <div class="flex justify-between items-start mb-4">
                        <h3 class="text-xl font-semibold text-foreground group-hover:text-accent transition-colors">{project.name}</h3>
                        <span class={`px-2 py-1 text-xs font-medium rounded-full ${
                          project.status === 'active' ? 'bg-accent/20 text-accent' :
                          project.status === 'completed' ? 'bg-primary/20 text-primary' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      
                      <Show when={project.description}>
                        <p class="text-muted-foreground mb-4 leading-relaxed">{project.description}</p>
                      </Show>
                      
                      <div class="flex flex-wrap gap-2 mb-4">
                        <For each={project.technologies}>
                          {(tech) => (
                            <span class="px-2 py-1 bg-muted/50 text-muted-foreground text-sm rounded border border-border">
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
                            class="theme-link with-arrow"
                          >
                            View Project
                          </a>
                        </Show>
                        
                        <Show when={project.githubUrl}>
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="theme-link with-arrow"
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
              <div class="text-center py-8 text-destructive">
                Error loading projects: {projectsQuery.error?.message}
              </div>
            </Show>
          </div>
    </div>
    </BaseLayout>
  )
}

export default ProjectsPage
