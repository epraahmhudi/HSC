import "./About.css";
import whatsappIcon from "../assets/whatsapp.png"; // Sawirka WhatsApp

export default function About() {
  return (
    <div className="about-container">
      <section className="about-hero">
        <h1 className="about-heading">About Hanad Shopping Center</h1>
        <p className="about-subtitle">
          Discover quality, trust, and innovation — all in one place.
        </p>
      </section>

      <section className="about-content">
        <p>
          <strong>Hanad Shopping Center</strong> is a modern retail hub founded in 2020
          with the mission of providing customers with high-quality products and fast, reliable service.
          We pride ourselves on being a one-stop destination offering everything from
          electronics and fashion to home essentials and fitness equipment.
        </p>
        <p>
          Our goal is to make shopping simple, enjoyable, and accessible for everyone.
          With affordable prices, trusted brands, and secure payments, we ensure
          every shopping experience is seamless and satisfying.
        </p>
      </section>

      <footer className="about-footer">
        <h3>📞 Contact Us</h3>
        <p><strong>Phone:</strong> +252 907701253</p>
        <p><strong>Email:</strong> hanadshoppingcenter@gmail.com</p>
        <p className="footer-copy">© 2025 Hanad Shopping Center</p>
      </footer>

      {/* === WHATSAPP FLOATING BUTTON === */}
      <a
        href="https://wa.me/252907701253"
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={whatsappIcon} alt="WhatsApp" className="whatsapp-icon" />
      </a>
    </div>
  );
}
