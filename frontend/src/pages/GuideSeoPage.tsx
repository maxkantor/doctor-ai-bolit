import { Navigate, useParams } from 'react-router-dom'
import { getGuideBySlug } from '../data/guides'
import GuidePageTemplate from '../components/guides/GuidePageTemplate'

export default function GuideSeoPage() {
  const { slug } = useParams<{ slug: string }>()
  if (!slug) return <Navigate to="/guides" replace />
  const data = getGuideBySlug(slug)
  if (!data) return <Navigate to="/guides" replace />
  return <GuidePageTemplate data={data} />
}
