import { MEDICAL_DISCLAIMER_FULL } from '../../data/symptomPages'
import './SymptomsPages.css'

export default function MedicalDisclaimerBox() {
  return (
    <aside className="medical-disclaimer-box" role="note">
      <strong style={{ display: 'block', marginBottom: '0.35rem', color: '#0f172a' }}>
        Important
      </strong>
      {MEDICAL_DISCLAIMER_FULL}
    </aside>
  )
}
