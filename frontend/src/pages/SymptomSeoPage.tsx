import { Navigate, useParams } from 'react-router-dom'
import { getSymptomBySlug } from '../data/symptomPages'
import SymptomPageTemplate from '../components/symptoms/SymptomPageTemplate'

export default function SymptomSeoPage() {
  const { slug } = useParams<{ slug: string }>()
  if (!slug) return <Navigate to="/symptoms" replace />
  const data = getSymptomBySlug(slug)
  if (!data) return <Navigate to="/symptoms" replace />
  return <SymptomPageTemplate data={data} />
}
