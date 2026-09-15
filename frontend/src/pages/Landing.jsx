// src/pages/Landing.jsx
import { Link } from 'react-router-dom'
import './Landing.css'

function Landing() {
  return (
    <div className="landing-page">
      {/* ===== TOP NAV ===== */}
      <header className="landing-nav">
        <div className="landing-logo">
          <div className="logo-icon">H</div>
          <span className="logo-text">Huddle</span>
        </div>

        <div className="landing-nav-actions">
          <Link to="/login" className="nav-link-btn">
            Log in
          </Link>
          <Link to="/register" className="btn-primary">
            Get started
          </Link>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <main className="landing-hero">
        {/* LEFT SIDE — Text */}
        <div className="landing-hero-text">
          <div className="landing-badge">
            <span className="badge-dot"></span>
            Built for modern teams
          </div>

          <h1 className="landing-headline">
            Teamwork,
            <br />
            <span className="headline-gradient">without the clutter.</span>
          </h1>

          <p className="landing-subtext">
            Huddle gives teams a focused place to organize
            conversations, collaborate in channels, and stay in sync —
            without the noise.
          </p>

          <div className="landing-stats">
            <div className="stat-item">
              <div className="stat-value">10x</div>
              <div className="stat-label">Faster onboarding</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">100%</div>
              <div className="stat-label">Focused teams</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">0</div>
              <div className="stat-label">Endless notifications</div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — Chat Mockup */}
        <div className="landing-hero-visual">
          <div className="mockup-glow"></div>
          <div className="chat-mockup">
            {/* Sidebar */}
            <div className="chat-sidebar">
              <div className="chat-section-title">CHANNELS</div>
              <div className="chat-channel-item chat-channel-active">
                <span className="chat-hash">#</span> general
              </div>
              <div className="chat-channel-item">
                <span className="chat-hash">#</span> design
              </div>
              <div className="chat-channel-item">
                <span className="chat-hash">#</span> engineering
              </div>
              <div className="chat-channel-item">
                <span className="chat-hash">#</span> marketing
              </div>

              <div className="chat-section-title">DIRECT MESSAGES</div>
              <div className="chat-dm-item">
                <div className="chat-avatar chat-avatar-pink">S</div>
                Sarah Chen
              </div>
              <div className="chat-dm-item">
                <div className="chat-avatar chat-avatar-green">A</div>
                Alex Rivers
              </div>
            </div>

            {/* Main Chat Area — NO PDF attachment */}
            <div className="chat-main">
              <div className="chat-messages chat-messages-clean">
                <div className="chat-message">
                  <div className="chat-avatar chat-avatar-pink">M</div>
                  <div className="chat-message-body">
                    <div className="chat-message-meta">
                      <strong>Maya Williams</strong>
                      <span>9:42 AM</span>
                    </div>
                    <p>
                      Hey team! I've uploaded the new brand guidelines
                      to the #design channel. Let me know what you think
                      about the secondary palette.
                    </p>
                  </div>
                </div>

                <div className="chat-message">
                  <div className="chat-avatar chat-avatar-blue">J</div>
                  <div className="chat-message-body">
                    <div className="chat-message-meta">
                      <strong>Jordan Smith</strong>
                      <span>9:45 AM</span>
                    </div>
                    <p>
                      Looking good Maya! Love the indigo accent. I'll
                      take a deeper look after the sprint review.
                    </p>
                  </div>
                </div>

                <div className="chat-message">
                  <div className="chat-avatar chat-avatar-pink">S</div>
                  <div className="chat-message-body">
                    <div className="chat-message-meta">
                      <strong>Sarah Chen</strong>
                      <span>9:47 AM</span>
                    </div>
                    <p>
                      Love this direction! The secondary palette feels
                      much warmer. Let's ship it. 🎉
                    </p>
                  </div>
                </div>

                <div className="chat-message">
                  <div className="chat-avatar chat-avatar-green">A</div>
                  <div className="chat-message-body">
                    <div className="chat-message-meta">
                      <strong>Alex Rivers</strong>
                      <span>9:48 AM</span>
                    </div>
                    <p>
                      Agreed — clean and simple. Ready for the demo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Landing