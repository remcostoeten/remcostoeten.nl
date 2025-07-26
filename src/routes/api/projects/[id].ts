import { json } from '@solidjs/router'
import type { APIEvent } from '@solidjs/start/server'
import { projectsFactory } from '~/db/factories/projects-factory'

export async function GET(event: APIEvent) {
  try {
    const id = event.params.id
    
    if (!id) {
      return json({ success: false, error: 'Project ID is required' }, { status: 400 })
    }

    const project = await projectsFactory.getProjectById(id)
    
    if (!project) {
      return json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    return json({ success: true, data: project })
  } catch (error) {
    console.error('GET /api/projects/[id] error:', error)
    return json({ success: false, error: 'Failed to fetch project' }, { status: 500 })
  }
}

export async function PUT(event: APIEvent) {
  try {
    const id = event.params.id
    const body = await event.request.json()
    
    if (!id) {
      return json({ success: false, error: 'Project ID is required' }, { status: 400 })
    }

    const project = await projectsFactory.updateProject({ id, ...body })
    
    if (!project) {
      return json({ success: false, error: 'Failed to update project or project not found' }, { status: 404 })
    }

    return json({ success: true, data: project })
  } catch (error) {
    console.error('PUT /api/projects/[id] error:', error)
    return json({ success: false, error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(event: APIEvent) {
  try {
    const id = event.params.id
    
    if (!id) {
      return json({ success: false, error: 'Project ID is required' }, { status: 400 })
    }

    const success = await projectsFactory.deleteProject(id)
    
    if (!success) {
      return json({ success: false, error: 'Failed to delete project or project not found' }, { status: 404 })
    }

    return json({ success: true, message: 'Project deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/projects/[id] error:', error)
    return json({ success: false, error: 'Failed to delete project' }, { status: 500 })
  }
}
