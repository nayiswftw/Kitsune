import { api } from '@/trpc/react'
import React from 'react'

const useProject = () => {
    const { data: projects } = api.project.getProjects.useQuery()
    const [projectId, setProjectId] = React.useState<string>('')

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('kitsune-projectId')
            if (stored) setProjectId(stored)
        }
    }, [])

    React.useEffect(() => {
        if (typeof window !== 'undefined' && projectId) {
            localStorage.setItem('kitsune-projectId', projectId)
        }
    }, [projectId])

    const project = projects?.find(project => project.id === projectId)
    return { projects, project, projectId, setProjectId }
}

export default useProject