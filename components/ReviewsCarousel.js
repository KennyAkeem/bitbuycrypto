const REVIEWS = [
    { name: "Jordan P.", text: "Simple and clean — perfect for learning about BTC." },
    { name: "Aisha R.", text: "I love the simulated buys. Great for demoing to friends." },
    { name: "Marcus T.", text: "Clear UI. I like how the portfolio shows unrealized changes." }
  ];
  
  export default function ReviewsCarousel() {
    return (
      <div className="carousel" id="review-carousel">
        {REVIEWS.map((r, i) => (
          <div key={i} className="review">
            <strong>{r.name}</strong>
            <p className="muted">{r.text}</p>
          </div>
        ))}
      </div>
    );
  }