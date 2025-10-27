import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import CryptoPriceMarquee from "../components/CryptoPriceMarquee";
import SimulatedAlert from "../components/SimulatedAlert";
import HeroCarousel from "../components/HeroCarousel";
import AuthModal from "../components/AuthModal";
import InvestmentPlans from '../components/InvestmentPlans';
import InvestFooter from "../components/InvestFooter";
import ServicesSection from "../components/ServicesSection";
import TestimonialCarousel from "../components/TestimonialCarousel";
import VideoSection from "../components/VideoSection";
import FAQSection from "../components/FAQSection";
import BackToTop from "../components/BackToTop";



// ✅ Import Framer Motion for animations
import { motion } from "framer-motion";



const unsplash = [
  "/images/about-2.jpg",
   "/images/about-4.jpg",
    "/images/about-5.jpg",

  "/images/about-3.png",
  "/images/blog-1.jpg",
  "/images/blog-2.jpg",
  "/images/blog-3.jpg",
  "/images/carousel-1.jpg",
  "/images/carousel-2.jpg",
  "/images/carousel-3.jpg",
  "/images/customer-img-1.jpg",
  "/images/customer-img-2.jpg",
  "/images/customer-img-3.jpg",
  "/images/faq-img.jpg",
  "/images/project-3.jpg",
  "/images/projects-1.jpg",
  "/images/projects-2.jpg",
  "/images/service-1.jpg",
  "/images/service-2.jpg",
  "/images/service-3.jpg",
  "/images/service-4.jpg",
  "/images/team-1.jpg",
  "/images/team-2.jpg",
  "/images/team-3.jpg",
  "/images/team-4.jpg",
  "/images/testimonial-1.jpg",
  "/images/testimonial-2.jpg",
  "/images/testimonial-3.jpg"
];

export default function LandingPage({ showToast }) {
  const {
    showAuthModal,
    closeAuthModal,
    showInvestModal,
    closeInvestModal
  } = useUser();

  const [showModal, setShowModal] = useState(false);
  const [authView, setAuthView] = useState("register");

  

  useEffect(() => {
    const timer = setTimeout(() => {
      const spinner = document.getElementById("spinner");
      if (spinner) spinner.classList.remove("show");
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="sci-fi-bg" style={{ minHeight: "100vh", position: "relative"}}>
      {/* Animated sci-fi background elements */}
      <div className="sci-fi-animated-bg">
        <div className="sci-fi-orb sci-fi-orb1"></div>
        <div className="sci-fi-orb sci-fi-orb2"></div>
        <div className="sci-fi-orb sci-fi-orb3"></div>
        {/* SVG circuit line overlays, visually subtle */}
        <svg className="sci-fi-circuit sci-fi-circuit1" viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <polyline points="0,40 150,20 300,60 450,30 600,70 750,30 900,60 1050,20 1200,60 1440,40"
            stroke="#00ffe7" strokeWidth="2.5" fill="none" strokeDasharray="12 8" opacity="0.4"/>
        </svg>
        <svg className="sci-fi-circuit sci-fi-circuit2" viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <polyline points="0,60 120,10 260,70 400,40 600,70 800,25 980,70 1200,40 1440,60"
            stroke="#2563eb" strokeWidth="2.5" fill="none" strokeDasharray="16 12" opacity="0.33"/>
        </svg>
      </div>

      {/* Spinner */}
      <div id="spinner" className="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center" style={{zIndex:9999}}>
        <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
          
        </div>
      </div>

      <br />
      <br />

      <CryptoPriceMarquee />
      <SimulatedAlert showToast={showToast} />

      {/* Carousel */}
      <HeroCarousel onApply={() => { setAuthView("profile"); setShowModal(false); }} />
      <section id="services"><ServicesSection /></section>
      
    <br />

    

      {/* Investment Plans Section */}
      <section id="investment-plans"><InvestmentPlans /></section>
 <br /> <br />
{/*VideoSection*/}
 <VideoSection />


 <br /> <br />




{/* TestimonialCarousl */}
<section id="testimony"><TestimonialCarousel /></section>

 <br />
  <br />
  
{/* FAQ Section */}
<section id="faq"><FAQSection /></section>





 <br /> <br />
    
{/*InvestFooter*/}
      <InvestFooter />



      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal initialView="login" onClose={closeAuthModal} showToast={showToast} />
      )}

      {/* Investment Modal */}
      {showInvestModal && (
        <InvestmentModal show={showInvestModal} onClose={closeInvestModal} />
      )}


      <BackToTop />
    </div>
  );
}