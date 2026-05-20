import { Navigate, useParams } from 'react-router-dom'
import { getFaqTopicBySlug } from '../data/faqs'
import FaqTopicTemplate from '../components/faq/FaqTopicTemplate'

export default function FaqTopicSeoPage() {
  const { slug } = useParams<{ slug: string }>()
  if (!slug) return <Navigate to="/faq" replace />
  const data = getFaqTopicBySlug(slug)
  if (!data) return <Navigate to="/faq" replace />
  return <FaqTopicTemplate data={data} />
}
