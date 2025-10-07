import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import CryptoPriceMarquee from "../components/CryptoPriceMarquee";
import SimulatedAlert from "../components/SimulatedAlert";
import HeroCarousel from "../components/HeroCarousel";
import AuthModal from "../components/AuthModal";
import InvestmentModal from "../components/InvestmentModal";
import InvestmentPlans from '../components/InvestmentPlans';

const unsplash = [
  "/images/about-2.jpg",
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
    <div>
      {/* Spinner */}
      <div id="spinner" className="show bg-white position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center" style={{zIndex:9999}}>
        <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
          <span className="sr-only">Wait...</span>
        </div>
      </div>

      {/* Topbar */}
      <div className="container-fluid topbar px-0 d-none d-lg-block bg-light">
        <div className="container px-0">
          <div className="row gx-0 align-items-center" style={{ height: 45 }}>
            <div className="col-lg-8 text-center text-lg-start mb-lg-0">
              <div className="d-flex flex-wrap">
                <a href="#" className="text-muted me-4"><i className="fas fa-map-marker-alt text-primary me-2"></i>Find A Location</a>
                <a href="#" className="text-muted me-4"><i className="fas fa-phone-alt text-primary me-2"></i>+01234567890</a>
                <a href="#" className="text-muted me-0"><i className="fas fa-envelope text-primary me-2"></i>Example@gmail.com</a>
              </div>
            </div>
            <div className="col-lg-4 text-center text-lg-end">
              <div className="d-flex align-items-center justify-content-end">
                <a href="#" className="btn btn-primary btn-square rounded-circle nav-fill me-3"><i className="fab fa-facebook-f text-white"></i></a>
                <a href="#" className="btn btn-primary btn-square rounded-circle nav-fill me-3"><i className="fab fa-twitter text-white"></i></a>
                <a href="#" className="btn btn-primary btn-square rounded-circle nav-fill me-3"><i className="fab fa-instagram text-white"></i></a>
                <a href="#" className="btn btn-primary btn-square rounded-circle nav-fill me-0"><i className="fab fa-linkedin-in text-white"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CryptoPriceMarquee />
      <SimulatedAlert showToast={showToast} />

      {/* Carousel */}
      <HeroCarousel onApply={() => { setAuthView("profile"); setShowModal(false); }} />

      {/* About Section */}
      <div className="container-fluid about bg-light py-5">
        <div className="container py-5">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6 col-xl-5">
              <div  className="about-img" >
                <img  src={unsplash[1]} className="img-fluid w-100 rounded-top bg-white" alt="About" />
                <img src={unsplash[8]} className="img-fluid w-100 rounded-bottom" alt="About2" />
              </div>
            </div>
            <div className="col-lg-6 col-xl-7">
              <h4 className="text-primary">About Us</h4>
              <h1 className="display-5 mb-4">The most Profitable Investments company in worldwide.</h1>
              <p className="text ps-4 mb-4">At Bitbuy, we redefine what it means to invest with confidence. Our platform connects you to profitable opportunities in crypto and digital finance, backed by transparency, expert management, and cutting-edge technology. Whether you’re a beginner or a seasoned investor, Bitbuy helps you grow your wealth securely — one smart investment at a time.</p>
              <div className="row g-4 justify-content-between mb-5">
                <div className="col-lg-6 col-xl-5">
                  <p className="text-dark"><i className="fas fa-check-circle text-primary me-1"></i> Strategy & Consulting</p>
                  <p className="text-dark mb-0"><i className="fas fa-check-circle text-primary me-1"></i> Business Process</p>
                </div>
                <div className="col-lg-6 col-xl-7">
                  <p className="text-dark"><i className="fas fa-check-circle text-primary me-1"></i> Marketing Rules</p>
                  <p className="text-dark mb-0"><i className="fas fa-check-circle text-primary me-1"></i> Partnerships</p>
                </div>
              </div>
              <div className="row g-4 justify-content-between mb-5">
                <div className="col-xl-5"><a href="#" className="btn btn-primary rounded-pill py-3 px-5">Discover More</a></div>
                <div className="col-xl-7 mb-5">
                  <div className="about-customer d-flex position-relative">
                    <img src={unsplash[4]} className="img-fluid btn-xl-square position-absolute" style={{left:0,top:0,width:45,height:45}} alt="Customer1"/>
                    <img src={unsplash[5]} className="img-fluid btn-xl-square position-absolute" style={{left:45,top:0,width:45,height:45}} alt="Customer2"/>
                    <img src={unsplash[6]} className="img-fluid btn-xl-square position-absolute" style={{left:90,top:0,width:45,height:45}} alt="Customer3"/>
                    <img src={unsplash[5]} className="img-fluid btn-xl-square position-absolute" style={{left:135,top:0,width:45,height:45}} alt="Customer4"/>
                    <div className="position-absolute text-dark" style={{left:220,top:10}}>
                      <p className="mb-0">5m+ Trusted</p>
                      <p className="mb-0">Global Customers</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row g-4 text-center align-items-center justify-content-center">
                <div className="col-sm-4">
                  <div className="bg-primary rounded p-4">
                    <div className="d-flex align-items-center justify-content-center">
                      <span className="counter-value fs-1 fw-bold text-dark">32</span>
                      <h4 className="text-dark fs-1 mb-0" style={{fontWeight:600,fontSize:25}}>k+</h4>
                    </div>
                    <div className="w-100 d-flex align-items-center justify-content-center">
                      <p className="text-white mb-0">Project Complete</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="bg-dark rounded p-4">
                    <div className="d-flex align-items-center justify-content-center">
                      <span className="counter-value fs-1 fw-bold text-white">21</span>
                      <h4 className="text-white fs-1 mb-0" style={{fontWeight:600,fontSize:25}}>+</h4>
                    </div>
                    <div className="w-100 d-flex align-items-center justify-content-center">
                      <p className="mb-0 text-white">Years Of Experience</p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-4">
                  <div className="bg-primary rounded p-4">
                    <div className="d-flex align-items-center justify-content-center">
                      <span className="counter-value fs-1 fw-bold text-dark">97</span>
                      <h4 className="text-dark fs-1 mb-0" style={{fontWeight:600,fontSize:25}}>+</h4>
                    </div>
                    <div className="w-100 d-flex align-items-center justify-content-center">
                      <p className="text-white mb-0">Team Members</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="container-fluid service py-5 bg-light">
        <div className="container py-5">
          <div className="text-center mx-auto pb-5" style={{maxWidth:800}}>
            <h4 className="text-primary">Our Services</h4>
            <h1 className="display-4"></h1>
          </div>
          <div className="row g-4 justify-content-center text-center">
            {[1,2,4,3].map((n, idx) => (
              <div className="col-md-6 col-lg-4 col-xl-3" key={idx}>
                <div className="service-item bg-light rounded">
                  <div className="service-img">
                    <img src={unsplash[idx]} className="img-fluid w-100 rounded-top" alt="Service" />
                  </div>
                  <div className="service-content text-center p-4">
                    <div className="service-content-inner">
                      <a href="#" className="h4 mb-4 d-inline-flex text-start">
                        <i className="fas fa-donate fa-2x me-2"></i>
                        {["Business Strategy Invesments","Consultancy & Advice","Invesments Planning","Private Client Investment"][idx]}
                      </a>
                      <p className="mb-4">"Empowering global investors with profitable, transparent opportunities."

"“The world’s trusted partner for secure, high-return investments.”"</p>
                      <a className="btn btn-light rounded-pill py-2 px-4" href="#">Read More</a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="col-12">
              <a className="btn btn-primary rounded-pill py-3 px-5" href="#">Services More</a>
            </div>
          </div>
        </div>
      </div>

      {/* Project Section */}
      <div className="container-fluid project bg-light py-5">
        <div className="container">
          <div className="text-center mx-auto pb-5" style={{maxWidth:800}}>
            <h4 className="text-primary">Our Projects</h4>
            <h1 className="display-4">Explore Our Latest Projects</h1>
          </div>
          <div className="row g-4">
            {[1,2,3].map((n, idx) => (
              <div className="col-md-6 col-lg-4" key={idx}>
                <div className="project-item h-100">
                  <div className="project-img">
                    <img src={unsplash[idx]} className="img-fluid w-100 rounded" alt="Project" />
                  </div>
                  <div className="project-content bg-light rounded p-4">
                    <div className="project-content-inner">
                      <div className="project-icon mb-3"><i className="fas fa-chart-line fa-4x text-primary"></i></div>
                      <p className="text-dark fs-5 mb-3">Business Growth</p>
                      <a href="#" className="h4">Innovative investments shaping the future of finance.</a>
                      <div className="pt-4">
                        <a className="btn btn-light rounded-pill py-3 px-5" href="#">Read More</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Investment Plans Section */}
      <InvestmentPlans />

      {/* Team Section */}
      <div className="container-fluid team pb-5 bg-light">
        <div className="container pb-5">
          <div className="text-center mx-auto pb-5" style={{maxWidth:800}}>
            <h4 className="text-primary">Our Team</h4>
            <h1 className="display-4">Our Bitbuy Company Dedicated Team Member</h1>
          </div>
          <div className="row g-4 justify-content-center">
            {[0,1,2,3].map((n, idx) => (
              <div className="col-sm-6 col-md-6 col-lg-4 col-xl-3" key={idx}>
                <div className="team-item rounded">
                  <div className="team-img">
                    <img src={unsplash[(idx+3)%unsplash.length]} className="img-fluid w-100 rounded-top" alt="Team" />
                  </div>
                  <div className="team-content bg-dark text-center rounded-bottom p-4">
                    <div className="team-content-inner rounded-bottom">
                      <h4 className="text-white">Mark D. Brock</h4>
                      <p className="text-muted mb-0">CEO & Founder</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="container-fluid testimonial bg-light py-5">
        <div className="container py-5">
          <div className="row g-4 align-items-center">
            <div className="col-xl-4">
              <div className="h-100 rounded">
                <h4 className="text-primary">Our Feedbacks </h4>
                <h1 className="display-4 mb-4">Clients are Talking</h1>
                <p className="mb-4">“Bitbuy has completely changed the way I invest — secure, fast, and reliable!... I started small, and within months, I could see real profits. Bitbuy delivers exactly what it promises.</p>
                <a className="btn btn-primary rounded-pill text-white py-3 px-5" href="#">Read All Reviews <i className="fas fa-arrow-right ms-2"></i></a>
              </div>
            </div>
            <div className="col-xl-8">
              <div className="row g-4">
                {[0,1,2].map((n, idx) => (
                  <div className="col-md-4" key={idx}>
                    <div className="testimonial-item bg-white rounded p-4">
                      <div className="d-flex">
                        <div><i className="fas fa-quote-left fa-3x text-dark me-3"></i></div>
                        <p className="mt-4">“Their admin approval system gives me total confidence in every transaction.”

“Finally, an investment platform that feels transparent and trustworthy.”</p>
                      </div>
                      <div className="d-flex justify-content-end">
                        <div className="my-auto text-end">
                          <h5>Joe Igbokwe</h5>
                          <p className="mb-0">Investor</p>
                        </div>
                        <div className="bg-white rounded-circle ms-3">
                          <img src={unsplash[idx]} className="rounded-circle p-2" style={{ width: 80, height: 80, border: "1px solid", borderColor: "#0d6efd" }} alt="Testimonial" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container-fluid faq py-5 bg-light">
        <div className="container py-5">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <div className="pb-5">
                <h4 className="text-primary">FAQs</h4>
                <h1 className="display-4">Get the Answers to Common Questions</h1>
              </div>
              <div className="accordion bg-light rounded p-4" id="accordionExample">
                {/* FAQ 1 */}
                <div className="accordion-item border-0 mb-4">
                  <h2 className="accordion-header" id="heading0">
                    <button className="accordion-button text-dark fs-5 fw-bold rounded-top" type="button" data-bs-toggle="collapse" data-bs-target="#collapse0" aria-expanded="true" aria-controls="collapse0">
                      What is Bitbuy?
                    </button>
                  </h2>
                  <div id="collapse0" className="accordion-collapse collapse show" aria-labelledby="heading0" data-bs-parent="#accordionExample">
                    <div className="accordion-body my-2">
                      <p>Bitbuy is a trusted investment platform that allows users to invest securely in cryptocurrencies such as Bitcoin, Ethereum, and USDT. Our goal is to make digital investing simple, transparent, and profitable for everyone.</p>
                    </div>
                  </div>
                </div>
                {/* FAQ 2 */}
                <div className="accordion-item border-0 mb-4">
                  <h2 className="accordion-header" id="heading1">
                    <button className="accordion-button collapsed text-dark fs-5 fw-bold rounded-top" type="button" data-bs-toggle="collapse" data-bs-target="#collapse1" aria-expanded="false" aria-controls="collapse1">
                      What industries do you specialize in?
                    </button>
                  </h2>
                  <div id="collapse1" className="accordion-collapse collapse" aria-labelledby="heading1" data-bs-parent="#accordionExample">
                    <div className="accordion-body my-2">
                      <p>We work with clients across multiple industries including finance, technology, and retail. [Random text: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vitae velit ex.]</p>
                    </div>
                  </div>
                </div>
                {/* FAQ 3 */}
                <div className="accordion-item border-0 mb-4">
                  <h2 className="accordion-header" id="heading2">
                    <button className="accordion-button collapsed text-dark fs-5 fw-bold rounded-top" type="button" data-bs-toggle="collapse" data-bs-target="#collapse2" aria-expanded="false" aria-controls="collapse2">
                      Can you guarantee for growth?
                    </button>
                  </h2>
                  <div id="collapse2" className="accordion-collapse collapse" aria-labelledby="heading2" data-bs-parent="#accordionExample">
                    <div className="accordion-body my-2">
                      <p>Growth depends on a variety of market factors. [Random text: Donec euismod, nisl eget consectetur sagittis, nisl nunc vehicula nunc, at convallis urna elit in urna.]</p>
                    </div>
                  </div>
                </div>
                {/* FAQ 4 */}
                <div className="accordion-item border-0 mb-4">
                  <h2 className="accordion-header" id="heading3">
                    <button className="accordion-button collapsed text-dark fs-5 fw-bold rounded-top" type="button" data-bs-toggle="collapse" data-bs-target="#collapse3" aria-expanded="false" aria-controls="collapse3">
                      What makes your business plans so special?
                    </button>
                  </h2>
                  <div id="collapse3" className="accordion-collapse collapse" aria-labelledby="heading3" data-bs-parent="#accordionExample">
                    <div className="accordion-body my-2">
                      <p>Our business plans are tailored to each client. [Random text: Fusce id velit ut tortor pretium viverra suspendisse potenti. Praesent semper feugiat nibh sed pulvinar proin gravida.]</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="faq-img RotateMoveRight rounded">
                <img src={unsplash[2]} className="img-fluid rounded w-100" alt="FAQ" />
                <a className="faq-btn btn btn-primary rounded-pill text-white py-3 px-5" href="#">Read More Q & A <i className="fas fa-arrow-right ms-2"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div> 

      {/* Footer */}
      <div className="container-fluid footer py-5 bg-dark text-white">
        <div className="container py-5">
          <div className="row g-5">
            <div className="col-md-6 col-lg-6 col-xl-3">
              <div className="footer-item d-flex flex-column">
                <h4 className="text-white mb-4">Newsletter</h4>
                <p className="mb-3">Dolor amet sit justo amet elitr clita ipsum elitr est.Lorem ipsum dolor sit amet, consectetur adipiscing elit consectetur adipiscing elit.</p>
                <div className="position-relative mx-auto rounded-pill">
                  <input className="form-control rounded-pill w-100 py-3 ps-4 pe-5" type="text" placeholder="Enter your email"/>
                  <button type="button" className="btn btn-primary rounded-pill position-absolute top-0 end-0 py-2 mt-2 me-2">SignUp</button>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-6 col-xl-3">
              <div className="footer-item d-flex flex-column">
                <h4 className="text-white mb-4">Explore</h4>
                <a href="#"><i className="fas fa-angle-right me-2"></i> Home</a>
                <a href="#"><i className="fas fa-angle-right me-2"></i> Services</a>
                <a href="#"><i className="fas fa-angle-right me-2"></i> About Us</a>
                <a href="#"><i className="fas fa-angle-right me-2"></i> Latest Projects</a>
                <a href="#"><i className="fas fa-angle-right me-2"></i> testimonial</a>
                <a href="#"><i className="fas fa-angle-right me-2"></i> Our Team</a>
                <a href="#"><i className="fas fa-angle-right me-2"></i> Contact Us</a>
              </div>
            </div>
            <div className="col-md-6 col-lg-6 col-xl-3">
              <div className="footer-item d-flex flex-column">
                <h4 className="text-white mb-4">Contact Info</h4>
                <a href=""><i className="fa fa-map-marker-alt me-2"></i> 123 Street, New York, USA</a>
                <a href=""><i className="fas fa-envelope me-2"></i> info@example.com</a>
                <a href=""><i className="fas fa-envelope me-2"></i> info@example.com</a>
                <a href=""><i className="fas fa-phone me-2"></i> +012 345 67890</a>
                <a href="" className="mb-3"><i className="fas fa-print me-2"></i> +012 345 67890</a>
                <div className="d-flex align-items-center">
                  <a className="btn btn-light btn-md-square me-2" href=""><i className="fab fa-facebook-f"></i></a>
                  <a className="btn btn-light btn-md-square me-2" href=""><i className="fab fa-twitter"></i></a>
                  <a className="btn btn-light btn-md-square me-2" href=""><i className="fab fa-instagram"></i></a>
                  <a className="btn btn-light btn-md-square me-0" href=""><i className="fab fa-linkedin-in"></i></a>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-6 col-xl-3">
              <div className="footer-item-post d-flex flex-column">
                <h4 className="text-white mb-4">Popular Post</h4>
                <div className="d-flex flex-column mb-3">
                  <p className="text-uppercase text-primary mb-2">Investment</p>
                  <a href="#" className="text-body">Revisiting Your Investment & Distribution Goals</a>
                </div>
                <div className="d-flex flex-column mb-3">
                  <p className="text-uppercase text-primary mb-2">Business</p>
                  <a href="#" className="text-body">Dimensional Fund Advisors Interview with Director</a>
                </div>
                <div className="footer-btn text-start">
                  <a href="#" className="btn btn-light rounded-pill px-4">View All Post <i className="fa fa-arrow-right ms-1"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="container-fluid copyright py-4 bg-dark text-white">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-md-6 text-center text-md-start mb-md-0">
              <span className="text-body"><a href="#" className="border-bottom text-primary"><i className="fas fa-copyright text-light me-2"></i>Bitbuy</a>, All right reserved.</span>
            </div>
            <div className="col-md-6 text-center text-md-end text-body">
              Designed By <a className="border-bottom text-primary" href="#">Myself</a>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top */}
      <a href="#" className="btn btn-primary btn-lg-square back-to-top"><i className="fa fa-arrow-up"></i></a>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal initialView="login" onClose={closeAuthModal} showToast={showToast} />
      )}

      {/* Investment Modal */}
      {showInvestModal && (
        <InvestmentModal show={showInvestModal} onClose={closeInvestModal} />
      )}
    </div>
  );
}