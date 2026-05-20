import { Navigate, useParams } from 'react-router-dom'
import { getConditionBySlug } from '../data/conditions'
import ConditionCategoryTemplate from '../components/conditions/ConditionCategoryTemplate'

export default function ConditionSeoPage() {
  const { slug } = useParams<{ slug: string }>()
  if (!slug) return <Navigate to="/conditions" replace />
  const data = getConditionBySlug(slug)
  if (!data) return <Navigate to="/conditions" replace />
  return <ConditionCategoryTemplate data={data} />
}
