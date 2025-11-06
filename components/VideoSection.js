import { motion } from "framer-motion";


const VIDEOS = [
  {
    id: "v1",
    title: "Take Charge",
    src: "https://www.youtube.com/embed/Rx1qMNeP96A?si=GSA2Gu3Xt270mhfD",
  },
  {
    id: "v2",
    title: "Live Masterpiece",
    src: "https://www.youtube.com/embed/rdqi0ptAHFs?si=Ww4s2FCB4X5QMNY0",
  },
  {
    id: "v3",
    title: "Convienient Investment",
    src: "https://www.youtube.com/embed/LGHsNaIv5os?si=M9jJRgms36EDFvs3",
  },
];

export default function VideoSection() {
  return (
    <motion.section
      className="video-section container"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.6 }}
      aria-labelledby="video-section-title"
    >
      <header className="video-head" style={{ textAlign: "center", marginBottom: 20 }}>
        <h3 id="video-section-title" style={{ margin: 0, color: "#0b1220" }}>
          Learn More — Video Guides
        </h3>
        <p style={{ marginTop: 6, color: "#475569" }}>
          Short walkthroughs and explanations — watch to understand how our plans work.
        </p>
      </header>

      <div className="video-grid" role="list">
        {VIDEOS.map((v, i) => (
          <motion.div
            key={v.id}
            className="video-card"
            role="listitem"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <div className="video-wrapper" aria-hidden={false}>
              <iframe
                title={v.title}
                src={v.src}
                frameBorder="0"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <div className="video-caption">
              <strong>{v.title}</strong>
            </div>
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 28px 18px 56px;
        }

        .video-head h3 {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .video-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }

        @media (min-width: 640px) {
          .video-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }

        @media (min-width: 992px) {
          .video-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
        }

        .video-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Responsive iframe wrapper: maintain 16:9 aspect ratio */
        .video-wrapper {
          position: relative;
          width: 100%;
          /* modern browsers support aspect-ratio; prefer that when available */
        }

        .video-wrapper iframe {
          width: 100%;
          height: 100%;
          border-radius: 10px;
          border: 1px solid rgba(15, 23, 42, 0.06);
          box-shadow: 0 8px 20px rgba(2,6,23,0.06);
          /* use aspect-ratio when supported */
          aspect-ratio: 16 / 9;
          display: block;
        }

        /* Fallback for browsers that don't support aspect-ratio:
           wrap the iframe in a padding-top box using a pseudo-element */
        @supports not (aspect-ratio: 16/9) {
          .video-wrapper {
            height: 0;
            padding-top: 56.25%; /* 16:9 */
          }
          .video-wrapper iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
        }

        .video-caption {
          color: #0f172a;
          font-weight: 700;
          font-size: 0.98rem;
        }

        /* Hover/tap affordance */
        .video-card:hover .video-wrapper iframe,
        .video-card:focus-within .video-wrapper iframe {
          transform: translateY(-4px);
          transition: transform 220ms ease;
          box-shadow: 0 18px 48px rgba(2,6,23,0.12);
        }

        /* Ensure iframe is tappable and has enough visual spacing on mobile */
        @media (max-width: 480px) {
          .container {
            padding-left: 12px;
            padding-right: 12px;
            padding-bottom: 36px;
          }
          .video-caption {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </motion.section>
  );
}