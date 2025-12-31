import './ModalOverlay.css'
import './PrivacyModal.css'

interface PrivacyModalProps {
  onClose: () => void
}

export default function PrivacyModal({ onClose }: PrivacyModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="privacy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Privacy Policy</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="modal-content">
          <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h3>1. Information We Collect</h3>
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
            <h3>2. How We Use Your Information</h3>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and improve our AI chat support services</li>
              <li>Maintain your chat session history</li>
              <li>Respond to your contact form submissions</li>
              <li>Analyze usage patterns to improve our service</li>
            </ul>
          </section>

          <section>
            <h3>3. Data Storage</h3>
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
            <h3>4. Data Sharing</h3>
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
            <h3>5. Cookies and Tracking</h3>
            <p>
              We use local storage to maintain your visitor ID and session information. 
              This allows us to provide a continuous chat experience without requiring login.
            </p>
          </section>

          <section>
            <h3>6. Your Rights</h3>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of data collection (by clearing browser storage)</li>
              <li>Contact us with privacy concerns</li>
            </ul>
          </section>

          <section>
            <h3>7. Children's Privacy</h3>
            <p>
              Our service is not intended for children under 13. We do not knowingly 
              collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h3>8. Changes to This Policy</h3>
            <p>
              We may update this Privacy Policy from time to time. We will notify you 
              of any changes by posting the new Privacy Policy on this page and updating 
              the "Last updated" date.
            </p>
          </section>

          <section>
            <h3>9. Contact Us</h3>
            <p>
              If you have questions about this Privacy Policy, please contact us through 
              our contact form.
            </p>
          </section>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="modal-close-button">Close</button>
        </div>
      </div>
    </div>
  )
}

