import { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const testimonials = [
  {
    review:
      "Bitbuy made investing so easy! I doubled my returns in just a few months. Highly recommend.",
    name: "Joe Iris",
    role: "Investor",
    img: "/images/customer-img-1.jpg",
  },
  {
    review:
      "The dashboard is super intuitive, and support is fantastic. My withdrawals are always fast!",
    name: "Linda Chen",
    role: "Trader",
    img: "/images/customer-img-2.jpg",
  },
  {
    review:
      "The transparency of Bitbuy gives me peace of mind. I trust my funds are safe.",
    name: "Alex Bush",
    role: "Entrepreneur",
    img: "/images/customer-img-3.jpg",
  },
  {
    review:
      "Bitbuy’s advice helped me diversify. The weekly reports are a gamechanger.",
    name: "Marta John",
    role: "Investor",
    img: "/images/customer-img-2.jpg",
  },
  {
    review:
      "I love the clean design and how easy it is to track my growth.",
    name: "Duke James",
    role: "Investor",
    img: "/images/customer-img-3.jpg",
  },
];

export default function TestimonialCarousel() {
  const [mounted, setMounted] = useState(false);
  const sliderRef = useRef(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    arrows: true,
    responsive: [
      { breakpoint: 1100, settings: { slidesToShow: 2 } },
      { breakpoint: 700, settings: { slidesToShow: 1 } },
    ],
  };

  // ✅ Wait until window is available to prevent SSR mismatch
  useEffect(() => {
    if (typeof window !== "undefined") {
      setMounted(true);

      const handleResize = () => {
        if (sliderRef.current && sliderRef.current.innerSlider) {
          sliderRef.current.innerSlider.onWindowResized();
        }
      };

      window.addEventListener("resize", handleResize);

      // Fix hydration timing issues (force re-render)
      const timeout = setTimeout(handleResize, 500);

      return () => {
        window.removeEventListener("resize", handleResize);
        clearTimeout(timeout);
      };
    }
  }, []);

  if (!mounted) return null; // Prevent rendering until client is ready

  return (
    <div className="testimonial-container">
      <h1 className="section-title text-center mb-5">What Our Clients Say</h1>
      <Slider ref={sliderRef} {...settings}>
        {testimonials.map((t, idx) => (
          <div key={idx}>
            <div className="testimonial-slide">
              <i className="fas fa-quote-left quote-icon"></i>
              <p className="testimonial-text">“{t.review}”</p>

              <div className="testimonial-footer">
                <div className="testimonial-info">
                  <h5 className="testimonial-name">{t.name}</h5>
                  <p className="testimonial-role">{t.role}</p>
                </div>
                <img
                  src={t.img}
                  alt={t.name}
                  className="testimonial-avatar"
                />
              </div>
            </div>
          </div>
        ))}
      </Slider>

      <style jsx>{`
        .testimonial-container {
          width: 100%;
          padding: 50px 5%;
          background: #f9fbff;
          overflow: hidden;
        }

        .testimonial-slide {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
          padding: 32px;
          margin: 10px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 280px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .testimonial-slide:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 40px rgba(27, 198, 255, 0.25);
        }

        .quote-icon {
          color: #1bc6ff;
          font-size: 2rem;
          margin-bottom: 14px;
        }

        .testimonial-text {
          font-size: 1rem;
          line-height: 1.6;
          color: #333;
          margin-bottom: 22px;
        }

        .testimonial-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }

        .testimonial-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .testimonial-name {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0a223a;
        }

        .testimonial-role {
          font-size: 0.9rem;
          color: #6a7a8a;
        }

        .testimonial-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 3px solid #1bc6ff;
          object-fit: cover;
        }

        /* ✅ Full mobile responsiveness */
        @media (max-width: 1024px) {
          .testimonial-slide {
            padding: 28px;
          }
        }

        @media (max-width: 700px) {
          .testimonial-slide {
            text-align: center;
            padding: 24px;
            margin: 5px;
          }

          .testimonial-footer {
            flex-direction: column-reverse;
            gap: 12px;
          }

          .testimonial-info {
            align-items: center;
          }

          .testimonial-avatar {
            width: 70px;
            height: 70px;
          }
        }

        @media (max-width: 480px) {
          .testimonial-text {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
}
