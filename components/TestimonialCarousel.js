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
  const [settings, setSettings] = useState({
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    arrows: true,
    adaptiveHeight: true,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1100,
        settings: { slidesToShow: 2, arrows: true },
      },
      {
        breakpoint: 700,
        settings: { slidesToShow: 1, arrows: false, centerMode: false },
      },
    ],
  });
  const sliderRef = useRef(null);

  // Wait until window is available to prevent SSR mismatch and adjust settings based on real viewport
  useEffect(() => {
    if (typeof window === "undefined") return;
    setMounted(true);

    // Set initial responsive behavior using actual viewport width (fixes some slick sizing issues)
    const applyResponsive = () => {
      const w = window.innerWidth;
      let newSettings = { ...settings };

      if (w <= 700) {
        newSettings = { ...newSettings, slidesToShow: 1, arrows: false };
      } else if (w <= 1100) {
        newSettings = { ...newSettings, slidesToShow: 2, arrows: true };
      } else {
        newSettings = { ...newSettings, slidesToShow: 3, arrows: true };
      }

      // replace responsive breakpoints too to ensure consistency
      newSettings.responsive = [
        { breakpoint: 1100, settings: { slidesToShow: 2, arrows: true } },
        { breakpoint: 700, settings: { slidesToShow: 1, arrows: false, centerMode: false } },
      ];

      setSettings(newSettings);

      // trigger slick to recalc sizes
      if (sliderRef.current && sliderRef.current.innerSlider) {
        try {
          sliderRef.current.innerSlider.onWindowResized();
        } catch (err) {
          // ignore
        }
      }
    };

    applyResponsive();

    const onResize = () => {
      // throttle with requestAnimationFrame
      requestAnimationFrame(applyResponsive);
    };

    window.addEventListener("resize", onResize);

    // small delay to ensure slick measures correctly after mount
    const t = setTimeout(() => {
      if (sliderRef.current && sliderRef.current.innerSlider) {
        try {
          sliderRef.current.innerSlider.onWindowResized();
        } catch (err) {}
      }
    }, 450);

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  return (
    <div className="testimonial-container">
      <h2 className="section-title text-center mb-5">What Our Clients Say</h2>

      <Slider ref={sliderRef} {...settings} className="testimonial-slick">
        {testimonials.map((t, idx) => (
          <div key={idx} className="slick-slide-item">
            <div className="testimonial-slide" tabIndex={0}>
              <i className="fas fa-quote-left quote-icon" aria-hidden="true"></i>
              <p className="testimonial-text">“{t.review}”</p>

              <div className="testimonial-footer">
                <div className="testimonial-info">
                  <h5 className="testimonial-name">{t.name}</h5>
                  <p className="testimonial-role">{t.role}</p>
                </div>
                <div className="testimonial-avatar">
                  <img src={t.img} alt={t.name} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      <style jsx>{`
        .testimonial-container {
          width: 100%;
          padding: 48px 6% 56px;
          background: #f9fbff;
          overflow: hidden;
        }

        .section-title {
          font-size: 1.6rem;
          margin: 0 0 18px;
          color: #07304a;
        }

        /* Global adjustments to slick children to ensure proper sizing on mobile */
        :global(.testimonial-slick) {
          padding: 8px 6px;
        }
        :global(.testimonial-slick .slick-track) {
          display: flex;
          align-items: stretch;
        }
        :global(.testimonial-slick .slick-slide) {
          display: flex !important;
          height: auto !important;
          padding: 8px;
          box-sizing: border-box;
        }

        .slick-slide-item {
          display: flex;
          align-items: stretch;
          height: 100%;
        }

        .testimonial-slide {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
          padding: 28px;
          margin: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 220px;
          transition: transform 200ms ease, box-shadow 200ms ease;
          width: 100%;
          box-sizing: border-box;
        }

        .testimonial-slide:focus,
        .testimonial-slide:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 40px rgba(27, 198, 255, 0.14);
          outline: none;
        }

        .quote-icon {
          color: #1bc6ff;
          font-size: 1.9rem;
          margin-bottom: 12px;
        }

        .testimonial-text {
          font-size: 1rem;
          line-height: 1.6;
          color: #243444;
          margin: 0 0 18px;
          flex: 1 1 auto;
        }

        .testimonial-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 18px;
          gap: 12px;
        }

        .testimonial-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .testimonial-name {
          font-size: 1.02rem;
          font-weight: 700;
          color: #0a223a;
          margin: 0;
        }

        .testimonial-role {
          font-size: 0.9rem;
          color: #6a7a8a;
          margin: 4px 0 0;
        }

        .testimonial-avatar {
          width: 60px;
          height: 60px;
          border-radius: 999px;
          overflow: hidden;
          border: 3px solid #1bc6ff;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .testimonial-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Tablet responsiveness */
        @media (max-width: 1100px) {
          .testimonial-container {
            padding: 40px 5%;
          }
          .testimonial-slide {
            padding: 22px;
            min-height: 200px;
          }
          .testimonial-avatar {
            width: 56px;
            height: 56px;
          }
        }

        /* Mobile responsiveness: stack footer, center text, larger avatar */
        @media (max-width: 700px) {
          .testimonial-container {
            padding: 30px 4%;
          }
          .testimonial-slide {
            padding: 18px;
            min-height: auto;
            text-align: center;
          }
          .quote-icon {
            margin-bottom: 10px;
          }
          .testimonial-text {
            font-size: 0.98rem;
            margin-bottom: 16px;
          }
          .testimonial-footer {
            flex-direction: column-reverse;
            align-items: center;
            gap: 10px;
          }
          .testimonial-info {
            align-items: center;
          }
          .testimonial-avatar {
            width: 76px;
            height: 76px;
            border-width: 3px;
          }
          /* Make dots more prominent on mobile and hide arrows */
          :global(.slick-dots) {
            bottom: -8px;
          }
          :global(.slick-arrow) {
            display: none !important;
          }
        }

        @media (max-width: 480px) {
          .testimonial-container {
            padding: 22px 4% 36px;
          }
          .testimonial-avatar {
            width: 72px;
            height: 72px;
          }
          .testimonial-text {
            font-size: 0.95rem;
            line-height: 1.65;
          }
        }
      `}</style>
    </div>
  );
}