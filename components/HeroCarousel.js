import Slider from "react-slick";
import { motion } from "framer-motion";

const slides = [
  {
    img: "/images/carousel-1.jpg",
    caption: "The Most Prestigious Investments Company",
    description: "Invest with confidence in BTC, ETH, and USDT — fast, secure, and reliable.",
    cta: "Apply Now",
  },
  {
    img: "/images/carousel-2.jpg",
    caption: "Real-Time Crypto Insights",
    description: "Stay ahead with live crypto price tracking and instant transaction updates.",
    cta: "Start Investing",
  },
  {
    img: "/images/carousel-3.jpg",
    caption: "Admin-Approved Transactions",
    description: "Every investment is reviewed manually for your safety and transparency.",
    cta: "Read More",
  },
];

export default function HeroCarousel({ onApply }) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    arrows: false,
    fade: true,
    pauseOnHover: false,
    adaptiveHeight: true,
  };

  return (
    <div className="hero-carousel-outer mb-8">
      <Slider {...settings}>
        {slides.map((slide, idx) => (
          <div key={idx}>
            <div className="carousel-slide-container">
              <motion.img
                src={slide.img}
                alt={slide.caption}
                className="carousel-slide-img"
                initial={{ scale: 1 }}
                animate={{ scale: 1.05 }}
                transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
              />

              <motion.div
                className="carousel-caption-future"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                <h1 className="carousel-caption-title">{slide.caption}</h1>
                <p className="carousel-caption-desc">{slide.description}</p>
                <motion.button onClick={() => setModalOpen(true)}
                  className="carousel-caption-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onApply}
                >
                  {slide.cta}
                </motion.button>
              </motion.div>
            </div>
          </div>
        ))}
      </Slider>

      <style jsx global>{`
        .hero-carousel-outer {
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 6px 50px 0 #00fff733, 0 0 0 3px #1bc6ff22;
        }

        .carousel-slide-container {
          position: relative;
          height: 100%;
        }

        .carousel-slide-img {
          width: 100%;
          height: clamp(220px, 55vw, 550px);
          object-fit: cover;
          border-radius: 18px;
          filter: brightness(0.6);
        }

        .carousel-caption-future {
          position: absolute;
          left: 6%;
          bottom: 15%;
          width: clamp(75vw, 70%, 650px);
          background: rgba(10, 20, 40, 0.4);
          border: 1px solid #1bc6ff55;
          border-radius: 16px;
          padding: 1.5rem 2rem;
          backdrop-filter: blur(10px);
          color: #fff;
          box-shadow: 0 0 40px #00fff722;
        }

        .carousel-caption-title {
          font-family: 'Orbitron', 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: clamp(1.4rem, 3.5vw, 2.6rem);
          background: linear-gradient(90deg, #00fff7, #1bc6ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 0.7rem;
          letter-spacing: 1.5px;
        }

        .carousel-caption-desc {
          font-size: clamp(0.95rem, 1.5vw, 1.2rem);
          color: #e0f7fa;
          margin-bottom: 1.2rem;
          line-height: 1.6;
        }

        .carousel-caption-btn {
          background: linear-gradient(90deg, #00fff7 10%, #1bc6ff 90%);
          color: #111;
          border: none;
          border-radius: 50px;
          font-weight: 600;
          letter-spacing: 1.5px;
          padding: 0.8rem 2rem;
          font-family: 'Orbitron', sans-serif;
          box-shadow: 0 0 25px #00fff766;
          cursor: pointer;
          transition: all 0.3s ease-in-out;
        }

        .carousel-caption-btn:hover {
          background: linear-gradient(90deg, #fff 10%, #1bc6ff 90%);
          color: #ff0055ff;
          box-shadow: 0 0 30px 10px #00fff788;
        }

        .slick-dots li button:before {
          font-size: 12px;
          color: #1bc6ff;
          opacity: 0.8;
        }
        .slick-dots li.slick-active button:before {
          color: #00fff7;
          opacity: 1;
          text-shadow: 0 0 10px #00fff7aa;
        }

        @media (max-width: 700px) {
          .carousel-caption-future {
            bottom: 10%;
            left: 4%;
            width: 90%;
            padding: 1rem 1.2rem;
            border-radius: 14px;
          }

          .carousel-caption-btn {
            width: 100%;
          }
        }
      `}</style>

      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700&display=swap"
        rel="stylesheet"
      />
    </div>
  );
}
