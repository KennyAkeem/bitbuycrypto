import Slider from "react-slick";
const slides = [
  {
    img: "/images/carousel-1.jpg",
    caption: "The most prestigious Investments company in worldwide.",
    description: "Invest with ease and security in BTC, ETH, USDT, and SOL.",
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
    <div className="mb-4">
      <Slider {...settings}>
        {slides.map((slide, idx) => (
          <div key={idx}>
            <div style={{position:"relative"}}>
              <img
                src={slide.img}
                alt={slide.caption}
                className="img-fluid w-100"
                style={{
                  maxHeight: "550px",
                  objectFit: "cover",
                  filter: "brightness(0.72)"
                }}
              />
              <div className="carousel-caption d-flex flex-column justify-content-center align-items-start"
                style={{
                  position: "absolute",
                  left: "5%",
                  top: "15%",
                  width: "90%",
                  height: "70%",
                  zIndex: 5,
                  color: "#fff"
                }}>
                <h1 className="display-4 fw-bold mb-3 animate__animated animate__fadeInUp">{slide.caption}</h1>
                <p className="lead mb-4 animate__animated animate__fadeInUp">{slide.description}</p>
                <div>
                  <button
                    className="btn btn-primary rounded-pill px-5 py-3 me-3"
                    onClick={onApply}
                  >
                    {slide.cta}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}