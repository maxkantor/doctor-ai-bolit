import type { SymptomFaq } from '../../data/symptomPages'
import './SymptomsPages.css'

export default function FAQSection({ faqs }: { faqs: SymptomFaq[] }) {
  return (
    <section className="symptom-faq-section" aria-labelledby="faq-heading">
      <h2 id="faq-heading">Frequently asked questions</h2>
      <div className="symptom-faq-list">
        {faqs.map((item) => (
          <article key={item.question} className="symptom-faq-item">
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
