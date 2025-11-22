import React from "react";
import "./Home.css";
import mallImage from "../assets/3.jpg";        // Sawirka hore
import mallImage2 from "../assets/4.jpg";       // Sawirka labaad
import cardDisplay from "../assets/g.jpg";      // Sawirka cusub ee card-ka cad
import whatsappIcon from "../assets/whatsapp.png"; // Sawirka WhatsApp

export default function Home() {
  return (
    <main className="home">
      {/* === HERO SECTION === */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">WELCOME TO HANAD SHOPPING CENTER</h1>
          <p className="hero-sub">
            Quality products. Great prices. Fast delivery. Browse our collections and find what you love.
          </p>

          <div className="hero-ctas">
            <a className="btn primary" href="/products">
              Shop Now
            </a>
            <a className="btn outline" href="/about">
              Learn More
            </a>
          </div>
        </div>

        {/* Decorative Product Card with new image */}
        <div className="hero-illustration" aria-hidden="true">
          <div className="card-mock">
            <img src={cardDisplay} alt="Shopping Display" className="card-img" />
            <div className="card-body">
              <div className="line short"></div>
              <div className="line long"></div>
            </div>
          </div>
        </div>
      </section>

      {/* === WHY SHOP WITH US SECTION === */}
      <section className="shop-section">
        <div className="shop-text">
          <h2>Why shop with us?</h2>
          <p>
            We bring you the best deals, quality products, and fast delivery right to your door.
            Experience shopping like never before — trusted by hundreds of happy customers!
          </p>

          <div className="features">
            <div className="feature">
              <h3>🚚 Fast Shipping</h3>
              <p>Get your order delivered quickly with reliable couriers.</p>
            </div>

            <div className="feature">
              <h3>💳 Secure Payment</h3>
              <p>Safe checkout with all major payment methods supported.</p>
            </div>

            <div className="feature">
              <h3>⭐ Top Quality</h3>
              <p>We curate products for the best value and performance.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Mall Images */}
        <div className="shop-image">
          <img src={mallImage} alt="Shopping Mall 1" className="mall-img" />
          <img src={mallImage2} alt="Shopping Mall 2" className="mall-img second" />
        </div>
      </section>

      {/* === WHATSAPP FLOATING BUTTON === */}
      <a
        href="https://wa.me/252907701253"
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={whatsappIcon} alt="WhatsApp" className="whatsapp-icon" />
      </a>
    </main>
  );
}
