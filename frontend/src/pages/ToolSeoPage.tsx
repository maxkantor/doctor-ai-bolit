import { Navigate, useParams } from 'react-router-dom'
import { getToolBySlug } from '../data/tools'
import ToolPageTemplate from '../components/tools/ToolPageTemplate'

export default function ToolSeoPage() {
  const { slug } = useParams<{ slug: string }>()
  if (!slug) return <Navigate to="/tools" replace />
  const data = getToolBySlug(slug)
  if (!data) return <Navigate to="/tools" replace />
  return <ToolPageTemplate data={data} />
}
