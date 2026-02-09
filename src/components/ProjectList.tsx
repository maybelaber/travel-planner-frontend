'use client'

import { useState } from 'react'
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

interface Place {
  id: number
  external_id: number
  notes: string | null
  is_visited: boolean
}

interface ProjectDetails extends Project {
  places: Place[]
}

interface ProjectListProps {
  projects: Project[]
  onDelete: (id: number) => void
  onRefresh: () => void
}

export default function ProjectList({ projects, onDelete, onRefresh }: ProjectListProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectDetails | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [newPlaceId, setNewPlaceId] = useState('')
  const [newPlaceNotes, setNewPlaceNotes] = useState('')
  const [addingPlace, setAddingPlace] = useState(false)

  const handleViewDetails = async (projectId: number) => {
    if (selectedProject?.id === projectId) {
      setSelectedProject(null)
      return
    }

    setLoadingDetails(true)
    try {
      const response = await axios.get(`${API_URL}/projects/${projectId}`)
      setSelectedProject(response.data)
    } catch (err) {
      alert('Failed to load project details')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleAddPlace = async (projectId: number) => {
    if (!newPlaceId.trim()) {
      alert('Please enter an artwork ID')
      return
    }

    setAddingPlace(true)
    try {
      await axios.post(`${API_URL}/projects/${projectId}/places/`, {
        external_id: parseInt(newPlaceId),
        notes: newPlaceNotes.trim() || null
      })
      
      setNewPlaceId('')
      setNewPlaceNotes('')
      
      const response = await axios.get(`${API_URL}/projects/${projectId}`)
      setSelectedProject(response.data)
      onRefresh()
    } catch (err: any) {
      if (err.response?.status === 400) {
        alert(err.response.data.detail || 'Failed to add place')
      } else {
        alert('Failed to add place')
      }
    } finally {
      setAddingPlace(false)
    }
  }

  const handleToggleVisited = async (placeId: number, currentStatus: boolean) => {
    try {
      await axios.put(`${API_URL}/places/${placeId}`, {
        is_visited: !currentStatus
      })
      
      if (selectedProject) {
        const response = await axios.get(`${API_URL}/projects/${selectedProject.id}`)
        setSelectedProject(response.data)
        onRefresh()
      }
    } catch (err) {
      alert('Failed to update place status')
    }
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No projects yet</h3>
        <p className="mt-1 text-gray-500">Get started by creating a new travel project.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{project.name}</h3>
                {project.description && (
                  <p className="text-gray-600 mb-2">{project.description}</p>
                )}
                <div className="flex gap-4 text-sm text-gray-500">
                  {project.start_date && (
                    <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                  )}
                  <span>{project.places_count} place{project.places_count !== 1 ? 's' : ''}</span>
                  {project.is_completed && (
                    <span className="text-green-600 font-medium">✓ Completed</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetails(project.id)}
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                >
                  {selectedProject?.id === project.id ? 'Hide' : 'View'} Details
                </button>
                <button
                  onClick={() => onDelete(project.id)}
                  className="px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            {selectedProject?.id === project.id && (
              <div className="border-t pt-4 mt-4">
                {loadingDetails ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Add New Place</h4>
                      <div className="flex gap-3">
                        <input
                          type="number"
                          value={newPlaceId}
                          onChange={(e) => setNewPlaceId(e.target.value)}
                          placeholder="Artwork ID (e.g., 27992)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        <input
                          type="text"
                          value={newPlaceNotes}
                          onChange={(e) => setNewPlaceNotes(e.target.value)}
                          placeholder="Notes (optional)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        <button
                          onClick={() => handleAddPlace(project.id)}
                          disabled={addingPlace || !newPlaceId.trim()}
                          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          {addingPlace ? 'Adding...' : 'Add'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Places ({selectedProject.places.length})</h4>
                      {selectedProject.places.length === 0 ? (
                        <p className="text-gray-500 text-sm">No places added yet. Add your first place above.</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedProject.places.map((place) => (
                            <div
                              key={place.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  Artwork ID: {place.external_id}
                                </div>
                                {place.notes && (
                                  <div className="text-sm text-gray-600 mt-1">{place.notes}</div>
                                )}
                              </div>
                              <button
                                onClick={() => handleToggleVisited(place.id, place.is_visited)}
                                className={`px-4 py-2 rounded transition-colors ${
                                  place.is_visited
                                    ? 'bg-green-100 text-green-700 border border-green-300'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {place.is_visited ? '✓ Visited' : 'Mark Visited'}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
