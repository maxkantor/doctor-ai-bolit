import { Link } from 'react-router-dom'
import './PrivacyPolicy.css'

export default function PrivacyPolicy() {
  return (
    <div className="privacy-policy-page">
      <div className="privacy-policy-container">
        <Link to="/" className="back-btn">← Back to Home</Link>
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2>1. Information We Collect</h2>
          <p>
            DoctorAibolit collects minimal information to provide our services:
          </p>
          <ul>
            <li><strong>Visitor ID:</strong> A unique identifier stored in your browser to track chat sessions</li>
            <li><strong>Chat Messages:</strong> The messages you send during chat sessions</li>
            <li><strong>Contact Information:</strong> Name and email address when you use the contact form</li>
            <li><strong>Usage Data:</strong> Basic analytics about how you interact with our service</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and improve our AI chat support services</li>
            <li>Maintain your chat session history</li>
            <li>Respond to your contact form submissions</li>
            <li>Analyze usage patterns to improve our service</li>
          </ul>
        </section>

        <section>
          <h2>3. Data Storage</h2>
          <p>
            Your data is stored securely on AWS infrastructure:
          </p>
          <ul>
            <li>Chat messages and sessions are stored in AWS DynamoDB</li>
            <li>Contact form submissions are stored in AWS DynamoDB</li>
            <li>All data is encrypted at rest and in transit</li>
            <li>We do not store payment information (handled by Stripe)</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. 
            We may share data only in the following circumstances:
          </p>
          <ul>
            <li>With your explicit consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
          </ul>
        </section>

        <section>
          <h2>5. Cookies and Tracking</h2>
          <p>
            We use local storage to maintain your visitor ID and session information. 
            This allows us to provide a continuous chat experience without requiring login.
          </p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of data collection (by clearing browser storage)</li>
            <li>Contact us with privacy concerns</li>
          </ul>
        </section>

        <section>
          <h2>7. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13. We do not knowingly 
            collect personal information from children under 13.
          </p>
        </section>

        <section>
          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you 
            of any changes by posting the new Privacy Policy on this page and updating 
            the "Last updated" date.
          </p>
        </section>

        <section>
          <h2>9. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us through 
            our <a href="/contact">contact form</a>.
          </p>
        </section>
      </div>
    </div>
  )
}

