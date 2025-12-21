'use client'

import { useAdmin } from '@/hooks/use-admin'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface PostAdminControlsProps {
  post: {
    slug: string
    metadata: {
      draft?: boolean
    }
  }
}

export function PostAdminControls({ post }: PostAdminControlsProps) {
  const { isAdmin } = useAdmin()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null
  
  if (post.metadata.draft && !isAdmin) {
    return null
  }

  if (!isAdmin) return null
  
  return (
    <>
      {post.metadata.draft && (
        <div className="mb-6 px-4 py-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 border border-amber-500/30">
            Draft
          </span>
          <span>This post is not published and only visible to you.</span>
        </div>
      )}
      
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Admin Controls</h3>
        <div className="flex gap-2">
          <Link 
            href={`/admin/posts/${post.slug}/edit`}
            className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-800/50 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-700 dark:text-blue-200 rounded transition-colors"
          >
            Edit Post
          </Link>
          <button 
            className="text-xs px-3 py-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-700 dark:text-red-300 rounded transition-colors"
            onClick={() => {
              if (confirm('Are you sure you want to delete this post?')) {
              }
            }}
          >
            Delete Post
          </button>
        </div>
      </div>
    </>
  )
}
