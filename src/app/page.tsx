'use client'

import { useState, useEffect } from 'react'
import ProjectForm from '@/components/ProjectForm'
import ProjectList from '@/components/ProjectList'
import axios from 'axios'

const API_URL = 'http://localhost:8000'

interface Project {
  id: number
  name: string
  description: string | null
  start_date: string | null
  is_completed: boolean
  places_count: number
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/projects/`)
      setProjects(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch projects')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleProjectCreated = () => {
    setShowForm(false)
    fetchProjects()
  }

  const handleDeleteProject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return
    }

    try {
      await axios.delete(`${API_URL}/projects/${id}`)
      fetchProjects()
    } catch (err: any) {
      if (err.response?.status === 400) {
        alert(err.response.data.detail || 'Cannot delete project with visited places')
      } else {
        alert('Failed to delete project')
      }
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Travel Planner</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {showForm ? 'Cancel' : 'New Project'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-8">
            <ProjectForm onSuccess={handleProjectCreated} />
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : (
          <ProjectList projects={projects} onDelete={handleDeleteProject} onRefresh={fetchProjects} />
        )}
      </div>
    </main>
  )
}
