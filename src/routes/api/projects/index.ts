import { json } from '@solidjs/router'
import type { APIEvent } from '@solidjs/start/server'
import { projectsFactory } from '~/db/factories/projects-factory'

export async function GET(event: APIEvent) {
  try {
    const url = new URL(event.request.url)
    const limit = url.searchParams.get('limit')
    const status = url.searchParams.get('status') as 'active' | 'completed' | 'archived' | null

    if (status) {
      const projects = await projectsFactory.getProjectsByStatus(status)
      return json({ success: true, data: projects })
    }

    const projects = await projectsFactory.getAllProjects(limit ? parseInt(limit) : undefined)
    return json({ success: true, data: projects })
  } catch (error) {
    console.error('GET /api/projects error:', error)
    return json({ success: false, error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(event: APIEvent) {
  try {
    const body = await event.request.json()
    const { name, description, url, githubUrl, imageUrl, technologies, status } = body

    if (!name || !technologies || !status) {
      return json({ 
        success: false, 
        error: 'Missing required fields: name, technologies, status' 
      }, { status: 400 })
    }

    const project = await projectsFactory.createProject({
      name,
      description,
      url,
      githubUrl,
      imageUrl,
      technologies,
      status
    })

    if (!project) {
      return json({ success: false, error: 'Failed to create project' }, { status: 500 })
    }

    return json({ success: true, data: project }, { status: 201 })
  } catch (error) {
    console.error('POST /api/projects error:', error)
    return json({ success: false, error: 'Failed to create project' }, { status: 500 })
  }
}
