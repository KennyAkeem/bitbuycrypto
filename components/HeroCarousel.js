import Slider from "react-slick";

const slides = [
  {
    img: "/images/carousel-1.jpg",
    caption: "The most prestigious Investments company.",
    description: "Invest with ease and security in BTC, ETH, and USDT",
    cta: "Apply Now"
  },
  {
    img: "/images/carousel-2.jpg",
    caption: "Real-Time Crypto Prices",
    description: "Stay updated with live prices and global transaction alerts.",
    cta: "Start Investing"
  },
  {
    img: "/images/carousel-3.jpg",
    caption: "Admin-Approved Investments",
    description: "All transactions are manually reviewed for your safety.",
    cta: "Read More"
  }
];

export default function HeroCarousel({ onApply }) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    arrows: true,
    adaptiveHeight: true,
    fade: true
  };

  return (
    <div className="hero-carousel-outer mb-6">
      <Slider {...settings}>
        {slides.map((slide, idx) => (
          <div key={idx}>
            <div className="carousel-slide-container">
              <img
                src={slide.img}
                alt={slide.caption}
                className="carousel-slide-img"
              />
              <div className="carousel-caption-future">
                <h1 className="carousel-caption-title">{slide.caption}</h1>
                <p className="carousel-caption-desc">{slide.description}</p>
                <button
                  className="carousel-caption-btn"
                  onClick={onApply}
                >
                  {slide.cta}
                </button>
              </div>

              {/* Neon overlay glow */}
              <div className="carousel-glow-left"></div>
              <div className="carousel-glow-right"></div>
            </div>
          </div>
        ))}
      </Slider>

      <style jsx global>{`
        /* Base container */
        .hero-carousel-outer {
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 6px 50px 0 #00fff733, 0 0 0 3px #1bc6ff22;
        }

        .carousel-slide-container {
          position: relative;
        }

        /* Responsive image scaling */
        .carousel-slide-img {
          width: 100%;
          height: clamp(180px, 50vw, 480px);
          object-fit: cover;
          border-radius: 18px;
          filter: brightness(0.65) blur(0.4px);
          transition: transform 1.5s ease-in-out;
        }

        .carousel-slide-container:hover .carousel-slide-img {
          transform: scale(1.03);
        }

        /* Caption glass block */
        .carousel-caption-future {
          position: absolute;
          left: clamp(3vw, 6vw, 10vw);
          top: clamp(8%, 16%, 20%);
          width: clamp(75vw, 70%, 680px);
          background: rgba(14, 20, 40, 0.25);
          border-left: 4px solid #1bc6ff99;
          border-radius: 16px;
          box-shadow: 0 0 35px #1bc6ff33;
          color: #fff;
          text-shadow: 0 0 12px #00fff7bb;
          padding: clamp(1.2rem, 2vw, 2.3rem);
          backdrop-filter: blur(3px);
          z-index: 10;
        }

        .carousel-caption-title {
          font-family: 'Orbitron', 'Montserrat', 'Segoe UI', sans-serif;
          font-weight: 700;
          font-size: clamp(1.2rem, 3vw, 2.4rem);
          letter-spacing: 2px;
          margin-bottom: 0.9rem;
          background: linear-gradient(90deg, #15e0ff 30%, #fff 90%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 2px 10px #00fff7cc);
        }

        .carousel-caption-desc {
          font-size: clamp(0.9rem, 1.5vw, 1.2rem);
          letter-spacing: 1.1px;
          color: #e0f7fa;
          margin-bottom: 1.1rem;
          line-height: 1.5;
        }

        .carousel-caption-btn {
          background: linear-gradient(90deg, #00fff7 10%, #1bc6ff 90%);
          color: #111;
          border: none;
          border-radius: 100px;
          font-family: 'Orbitron', 'Montserrat', Arial, sans-serif;
          font-weight: 600;
          letter-spacing: 2px;
          font-size: clamp(0.8rem, 1.4vw, 1.1rem);
          padding: clamp(0.6rem, 1.2vw, 0.9rem) clamp(1.8rem, 3vw, 2.6rem);
          box-shadow: 0 0 22px #1bc6ff66;
          transition: all 0.3s ease-in-out;
        }

        .carousel-caption-btn:hover {
          background: linear-gradient(90deg, #fff 10%, #1bc6ff 90%);
          color: #00fff7;
          box-shadow: 0 0 30px 8px #00fff7aa;
        }

        /* Glow lights */
        .carousel-glow-left,
        .carousel-glow-right {
          position: absolute;
          top: 15%;
          width: 60px;
          height: 70%;
          z-index: 5;
          pointer-events: none;
        }

        .carousel-glow-left {
          left: 0;
          background: radial-gradient(circle at 0 50%, #00fff722 50%, transparent 90%);
        }

        .carousel-glow-right {
          right: 0;
          background: radial-gradient(circle at 100% 50%, #1bc6ff33 50%, transparent 90%);
        }

        /* Slick dots & arrows */
        .slick-dots li button:before {
          font-size: 13px;
          color: #1bc6ff;
          opacity: 1;
        }
        .slick-dots li.slick-active button:before {
          color: #00fff7;
          text-shadow: 0 0 8px #00fff7cc;
        }
        .slick-arrow {
          z-index: 20;
          width: 45px;
          height: 45px;
          background: linear-gradient(135deg, #1bc6ff88, #00fff722);
          border-radius: 50%;
          box-shadow: 0 0 18px #1bc6ff44;
        }
        .slick-prev:before,
        .slick-next:before {
          color: #00fff7;
          font-size: 28px;
          text-shadow: 0 0 10px #00fff7cc;
        }

        /* Mobile optimization */
        @media (max-width: 700px) {
          .carousel-caption-future {
            top: 8%;
            width: 92vw;
            left: 4vw;
            padding: 1rem 1rem 0.8rem;
            border-left: 2px solid #1bc6ff77;
          }
          .carousel-glow-left,
          .carousel-glow-right {
            display: none;
          }
          .carousel-caption-btn {
            width: 100%;
            text-align: center;
            padding: 0.6rem 0;
          }
        }

        @media (max-width: 450px) {
          .carousel-caption-future {
            width: 100%;
            left: 0;
            border-radius: 0 0 12px 12px;
            padding: 0.8rem 0.9rem;
          }
            .carousel-caption-btn{
            display:none;}
        }
      `}</style>

      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700&display=swap"
        rel="stylesheet"
      />
    </div>
  );
}
