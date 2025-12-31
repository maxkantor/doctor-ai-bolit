import './ModalOverlay.css'
import './AboutModal.css'

interface AboutModalProps {
  onClose: () => void
}

export default function AboutModal({ onClose }: AboutModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>About DoctorAibolit</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="modal-content">
          <section>
            <h3>Our Mission</h3>
            <p>
              DoctorAibolit provides instant, accessible health guidance through AI-powered conversations. 
              We believe everyone deserves a safe space to express their feelings and find calm, especially 
              when you need health information and wellness guidance.
            </p>
          </section>

          <section>
            <h3>How It Works</h3>
            <p>
              Our AI assistant is designed to listen, understand, and provide empathetic support. 
              Simply start a conversation about what's on your mind. No signup required, no judgment, 
              just a compassionate ear available 24/7.
            </p>
          </section>

          <section>
            <h3>What We Offer</h3>
            <ul>
              <li><strong>Free Support:</strong> Start with 5 free messages to experience our service</li>
              <li><strong>Privacy First:</strong> Your conversations are private and secure</li>
              <li><strong>No Login Required:</strong> Start chatting immediately without creating an account</li>
              <li><strong>24/7 Availability:</strong> Support whenever you need it, day or night</li>
              <li><strong>AI-Powered:</strong> Advanced AI technology trained to provide empathetic, helpful responses</li>
            </ul>
          </section>

          <section>
            <h3>Important Notice</h3>
            <p>
              <strong>DoctorAibolit is not a medical service.</strong> We provide general health information and 
              wellness guidance, but we cannot diagnose, treat, or provide medical advice. If you are 
              experiencing a mental health crisis or are in immediate danger, please contact your local 
              emergency services or a mental health professional.
            </p>
          </section>

          <section>
            <h3>Our Commitment</h3>
            <p>
              We are committed to providing a safe, supportive environment for everyone. We continuously 
              work to improve our AI's understanding and responses to better serve those who need 
              emotional support.
            </p>
          </section>

          <section>
            <h3>Contact Us</h3>
            <p>
              Have questions or feedback? We'd love to hear from you. Use our contact form to reach out, 
              and we'll get back to you as soon as possible.
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

