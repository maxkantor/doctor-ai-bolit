import './SymptomsPages.css'

export default function EmergencyWarningBox({ items }: { items: string[] }) {
  return (
    <section className="emergency-warning-box" aria-labelledby="emergency-heading">
      <h2 id="emergency-heading">When to seek urgent or emergency care</h2>
      <ul>
        {items.map((text) => (
          <li key={text.slice(0, 48)}>{text}</li>
        ))}
      </ul>
    </section>
  )
}
