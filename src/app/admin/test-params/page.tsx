'use client'

import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

export default function TestParamsPage() {
  const { id } = useParams()
  const router = useRouter()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Params Test</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <p>Params ID: {id ? id : 'undefined'}</p>
        <p>Type of ID: {typeof id}</p>
        <p>Is string: {id && typeof id === 'string' ? 'Yes' : 'No'}</p>
      </div>
      <button 
        onClick={() => router.push('/admin/products')}
        className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
      >
        Back to Products
      </button>
    </div>
  )
}