import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Header } from "./Header";

const STORAGE_KEY = "userToken";

export default function Landing() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem(STORAGE_KEY);
    setIsAuthenticated(!!token);
  }, []);

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/dashboard"); // This will redirect to auth first
    }
  };

  return (
    <div className="landing-page">
      <Header />
      <HeroSection onCTA={handleCTA} isAuthenticated={isAuthenticated} />
      <SocialProofSection />
      <AboutSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CTASection onCTA={handleCTA} isAuthenticated={isAuthenticated} />
      <Footer />
    </div>
  );
}
function HeroSection({
  onCTA,
  isAuthenticated,
}: {
  onCTA: () => void;
  isAuthenticated: boolean;
}) {
  return (
    <section className="hero-section">
      <div className="landing-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Collaborate in Real-Time with{" "}
            <span className="hero-highlight">Interactive Boards</span>
          </h1>
          <p className="hero-description">
            Create, share, and collaborate on visual boards with your team.
            Draw, sketch, and brainstorm together in real-time from anywhere in
            the world.
          </p>
          <div className="hero-actions">
            <button
              className="button button-primary button-large"
              onClick={onCTA}
            >
              {isAuthenticated ? "Go to Dashboard" : "Create Your First Board"}
            </button>
            <button
              className="button button-secondary button-large"
              onClick={() => {
                document
                  .getElementById("about")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Learn More
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Boards Created</div>
            </div>
            <div className="stat">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="about-section">
      <div className="landing-container">
        <div className="about-content">
          <h2 className="section-title">Why Choose Collaborative Boards?</h2>
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">🎨</div>
              <h3>Intuitive Drawing Tools</h3>
              <p>
                Express your ideas with our powerful yet simple drawing tools.
                Create shapes, add text, and sketch freely.
              </p>
            </div>
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <h3>Real-Time Collaboration</h3>
              <p>
                See changes as they happen. Watch cursors move, shapes appear,
                and ideas come to life in real-time.
              </p>
            </div>
            <div className="feature">
              <div className="feature-icon">🔗</div>
              <h3>Easy Sharing</h3>
              <p>
                Share your boards with a simple link. No complex permissions or
                setup required.
              </p>
            </div>
            <div className="feature">
              <div className="feature-icon">📱</div>
              <h3>Cross-Platform</h3>
              <p>
                Works seamlessly across all devices and browsers. Start on
                desktop, continue on mobile.
              </p>
            </div>
            <div className="feature">
              <div className="feature-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>
                Your data is encrypted and secure. Control who has access to
                your boards.
              </p>
            </div>
            <div className="feature">
              <div className="feature-icon">💾</div>
              <h3>Auto-Save</h3>
              <p>
                Never lose your work. Everything is automatically saved as you
                create.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager at TechCorp",
      avatar: "👩‍💼",
      quote:
        "This tool has transformed how our team brainstorms. We can finally collaborate visually in real-time, no matter where we are.",
    },
    {
      name: "Mike Rodriguez",
      role: "UX Designer",
      avatar: "👨‍🎨",
      quote:
        "The drawing tools are intuitive and powerful. It's like having a shared whiteboard that never runs out of space.",
    },
    {
      name: "Emma Thompson",
      role: "Engineering Lead",
      avatar: "👩‍💻",
      quote:
        "Perfect for sprint planning and architecture discussions. The real-time updates keep everyone on the same page.",
    },
  ];

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="landing-container">
        <h2 className="section-title">What Our Users Say</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial">
              <div className="testimonial-content">
                <p>"{testimonial.quote}"</p>
              </div>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{testimonial.avatar}</div>
                <div>
                  <div className="testimonial-name">{testimonial.name}</div>
                  <div className="testimonial-role">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({
  onCTA,
  isAuthenticated,
}: {
  onCTA: () => void;
  isAuthenticated: boolean;
}) {
  return (
    <section className="cta-section">
      <div className="landing-container">
        <div className="cta-content">
          <h2>Ready to Start Collaborating?</h2>
          <p>
            Join thousands of teams already using Collaborative Boards to bring
            their ideas to life.
          </p>
          <button
            className="button button-primary button-large"
            onClick={onCTA}
          >
            {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
          </button>
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  const companies = [
    { name: "TechCorp", logo: "🏢" },
    { name: "InnovateCo", logo: "🚀" },
    { name: "CreativeStudio", logo: "🎨" },
    { name: "TeamSync", logo: "👥" },
    { name: "DesignFlow", logo: "✨" },
    { name: "CollabSpace", logo: "🌟" },
  ];

  return (
    <section className="social-proof-section">
      <div className="landing-container">
        <div className="social-proof-content">
          <p className="social-proof-text">Trusted by teams at</p>
          <div className="companies-grid">
            {companies.map((company, index) => (
              <div key={index} className="company-item">
                <span className="company-logo">{company.logo}</span>
                <span className="company-name">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Create Your Board",
      description:
        "Start with a blank canvas or choose from our templates to quickly set up your collaborative workspace.",
      icon: "📝",
    },
    {
      number: "02",
      title: "Invite Your Team",
      description:
        "Share a simple link with team members. No downloads or complicated setup required.",
      icon: "👥",
    },
    {
      number: "03",
      title: "Collaborate in Real-Time",
      description:
        "Draw, sketch, and brainstorm together. See changes instantly as your team creates amazing things.",
      icon: "⚡",
    },
  ];

  return (
    <section className="how-it-works-section">
      <div className="landing-container">
        <div className="how-it-works-content">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Get started in minutes, not hours</p>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={index} className="step-item">
                <div className="step-number">{step.number}</div>
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">Collaborative Boards</h3>
            <p className="footer-description">
              Real-time collaboration made simple. Create, share, and innovate
              together.
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Product</h4>
            <ul className="footer-links">
              <li>
                <a href="#features">Features</a>
              </li>
              <li>
                <a href="#pricing">Pricing</a>
              </li>
              <li>
                <a href="#templates">Templates</a>
              </li>
              <li>
                <a href="#integrations">Integrations</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#blog">Blog</a>
              </li>
              <li>
                <a href="#careers">Careers</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li>
                <a href="#help">Help Center</a>
              </li>
              <li>
                <a href="#docs">Documentation</a>
              </li>
              <li>
                <a href="#status">Status</a>
              </li>
              <li>
                <a href="#community">Community</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2024 Collaborative Boards. All rights reserved.
          </p>
          <div className="footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
