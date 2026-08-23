import { useEffect, useRef, useState } from 'react';
import { FLOOR_LINE, HOVER_OUTLINE, LAYERS, SCENE_RATIO, SHELL_DEPTH } from '../js/sceneLayout.js';
import useAlphaHover from '../js/useAlphaHover.js';
import useParallaxRig from '../js/useParallaxRig.js';
import { assetUrl } from '../js/assetUrl.js';
import '../css/HeroScene.css';

// Load content from public/content.json at runtime
async function loadContent() {
  try {
    const response = await fetch(assetUrl('content.json'), { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to load content');
    return await response.json();
  } catch (err) {
    console.warn('Failed to load content.json, using fallback:', err);
    return null;
  }
}

// Fallback content (inlined for offline/fallback)
const FALLBACK_CONTENT = {
  panels: {
    person: {
      eyebrow: 'About Me',
      title: 'Karthikeyan VR',
      subtitle: 'Trying to be a Developer',
      body: "I'm a Computer Science graduate focused on building modern web applications and exploring AI/ML and Generative AI. I work with React, Java, Python, FastAPI, Spring Boot, and databases to create clean, scalable solutions.",
      stats: ['B.E. CSE', '2026 Graduate', 'CGPA 8.6 / 10', 'Chennai, India'],
      footer: 'S.A. Engineering College · Anna University',
      actions: [
        ['GitHub', 'https://github.com/Karthikn-VR'],
        ['LinkedIn', 'https://www.linkedin.com/in/karthikeyan-vr/'],
      ],
    },
    corkboard: {
      eyebrow: 'Certificates',
      title: 'Learning proof board',
      body: 'Certificates are loaded from a public GitHub-hosted JSON file, so you can update the list without touching React code.',
      certifications: [],
    },
    clock: {
      eyebrow: 'Timeline',
      title: 'Developer journey',
      timeline: [
        ['2022', 'Started B.E. Computer Science and Engineering.'],
        ['2024', 'Built stronger foundations in frontend, backend, databases, and APIs.'],
        ['2025', 'Expanded into AI/ML, RAG, embeddings, vector databases, and LLM tooling.'],
        ['2026', 'Graduating from S.A. Engineering College with 8.6 CGPA.'],
      ],
    },
    frames: {
      eyebrow: 'Gallery',
      title: 'A few moods',
      body: 'Small visual moments from the character set.',
      images: [
        ['assets/Me/MeBeige.jpeg', 'Hello pose'],
        ['assets/Me/Mirror.png', 'Ideas pose'],
        ['assets/Me/MyImage.png', 'Sunglasses pose'],
      ],
    },
    "bookshelf": {
      "eyebrow": "Skills & Stack",
      "title": "Full-stack + AI toolkit",
      "featured": ["React", "Java", "Python", "FastAPI", "Spring Boot", "RAG / LLMs"],
      "groups": [
        [
          "Frontend",
          [
            "HTML5",
            "CSS3",
            "JavaScript",
            "React.js",
            "Bootstrap"
          ]
        ],
        [
          "Backend",
          [
            "Java",
            "Python",
            "FastAPI",
            "Flask",
            "Node.js",
            "REST APIs",
            "JWT Authentication"
          ]
        ],
        [
          "Databases",
          [
            "MySQL",
            "SQLite",
            "MongoDB",
            "Firebase"
          ]
        ],
        [
          "AI / ML / GenAI",
          [
            "Machine Learning",
            "Generative AI",
            "LLMs",
            "Embeddings",
            "Vector Databases",
            "RAG",
            "Transformers"
          ]
        ],
        [
          "Tools",
          [
            "Git",
            "GitHub",
            "VS Code",
            "Postman",
            "Docker",
            "Figma",
            "Canva"
          ]
        ]
      ]
    },
    laptop: {
      eyebrow: 'Projects',
      title: 'Recent GitHub work',
      body: 'GitHub bio: Software Engineer building AI-powered systems, scalable backends, and modern full-stack applications.',
      projects: [
        [
          'CS-50-Ai-my-projects',
          'Python · AI projects covering search, logic, ML, neural networks, and NLP.',
          'https://github.com/Karthikn-VR/CS-50-Ai-my-projects',
        ],
        [
          'Pdf-RAG-system',
          'Python · Chat with PDF documents using FastAPI, React, Ollama, and vector search.',
          'https://github.com/Karthikn-VR/Pdf-RAG-system',
        ],
        [
          'Coffee-Shop',
          'JavaScript · Full-stack coffee builder with React, Framer Motion, FastAPI, and MySQL.',
          'https://github.com/Karthikn-VR/Coffee-Shop',
        ],
        [
          'CinimaVibe-MovieWebsite',
          'JavaScript · React movie browsing app with categorized exploration and pagination.',
          'https://github.com/Karthikn-VR/CinimaVibe-MovieWebsite',
        ],
      ],
      footer: 'GitHub: Karthikn-VR · 59 public repositories',
      actions: [['View GitHub', 'https://github.com/Karthikn-VR']],
    },
    usb: {
      eyebrow: 'Resume',
      title: 'Resume download',
      body: 'Download a lightweight resume summary with education, skills, interests, GitHub, and LinkedIn details.',
      actions: [['Download Resume', 'Karthikeyan_VR_Resume_DS.pdf', true]],
    },
    phone: {
      eyebrow: 'Contact',
      title: "Let's connect",
      body: 'Based in Chennai, Tamil Nadu, India. Open to software engineering, full-stack, AI/ML, Generative AI, and web development opportunities.',
      links: [
        [
          'LinkedIn',
          'linkedin.com/in/karthikeyan-vr',
          'https://www.linkedin.com/in/karthikeyan-vr/',
        ],
        ['GitHub', 'github.com/Karthikn-VR', 'https://github.com/Karthikn-VR'],
        [
          'Email',
          'Available on request through LinkedIn',
          'https://www.linkedin.com/in/karthikeyan-vr/',
        ],
      ],
      actions: [
        ['Open LinkedIn', 'https://www.linkedin.com/in/karthikeyan-vr/'],
        ['Open GitHub', 'https://github.com/Karthikn-VR'],
      ],
    },

      cat: {
        eyebrow: 'The Real Boss',
        title: 'Meet Mr. Winks',
        subtitle: 'Chief Napping Officer',
        body: "Mr. Winks has one job: sit there, look cute, and somehow make everyone else feel like they're working for him. He contributes absolutely nothing to the project and still expects credit.",
        stats: ['Professional Napper', 'Zero Meetings Attended', 'Keyboard Inspector', 'CEO of Doing Nothing'],
      },

      guitar: {
        eyebrow: 'Off the Clock',
        title: 'Hobbies & Vibes',
        body: "Not everything here has to be productive. Sometimes something just looks cool, feels nice, or gives me an excuse to say I have hobbies.",
        highlights: [
          'I do not know how to play guitar... yet',
          'Added the guitar because it looked cool',
          'Collecting ideas I may or may not build',
          'Staring at the screen and calling it thinking',
          'Exploring new coffee shops around Chennai',
          'Watching sci-fi movies and overthinking everything',
          'Saying "I will do it tomorrow" with confidence',
        ],
      },

      lamp: {
        eyebrow: 'Lightbulb Moments',
        title: 'Ideas & Thoughts',
        body: 'Random thoughts that arrive at the worst possible time and somehow feel like a million-dollar idea at 3 AM.',
        clouds: [
          'What if I actually finish this idea?',
          'Build something just because it looks cool',
          'Could this be automated?',
          'A coffee machine that knows when I am tired',
          'Teach a cat to do absolutely nothing',
          'Maybe CSS is not the enemy',
          'Every room looks better with warm lights',
          'Sleep can wait, this idea is important',
        ],
      },

      pencils: {
        eyebrow: 'Doodle Zone',
        title: 'Sketches & Scribbles',
        body: 'Some ideas deserve a proper plan. Others deserve a pencil, a random piece of paper, and absolutely no idea where they are going.',
        highlights: [
          'UI ideas drawn instead of actually designed',
          'One masterpiece, seventeen questionable doodles',
          'Flowcharts that somehow lead nowhere',
          'Random characters that became surprisingly important',
          'Great ideas discovered three minutes before sleep',
        ],
      },

      books: {
        eyebrow: 'Page Turners',
        title: 'Reading List',
        body: 'A collection of books I either genuinely enjoyed, learned from, or confidently pretend I have finished.',
        highlights: [
          'Twisted Love — Ana Huang (apparently I enjoy chaos)',
          'Atomic Habits — James Clear (still working on the habits part)',
          'Clean Code — Robert C. Martin (read it, then wrote questionable code anyway)',
          'The Pragmatic Programmer — Hunt & Thomas (trying to become more pragmatic)',
          'Designing Data-Intensive Applications — Martin Kleppmann (light bedtime reading, obviously)',
          'It Ends with Us — Colleen Hoover (emotional damage included)',
          'The Alchemist — Paulo Coelho (still looking for my personal legend)',
        ],
      },

      coffee: {
        eyebrow: 'Fuel Station',
        title: 'Coffee Break',
        subtitle: 'Just one more cup. Probably.',
        body: "Some people meditate, some people take long walks. I drink coffee and pretend I have my life together. Somehow, it works.",
        stats: ['Filter Kaapi Enthusiast', '3 Cups / Day Minimum', 'Good Mood Fuel', 'Better Ideas, Somehow'],
      },

      headphones: {
        eyebrow: 'Vibe Check',
        title: 'Music & Focus',
        body: 'Sometimes the best way to focus is to put on headphones, disappear from the world for a while, and pretend the outside world does not exist.',
        stats: ['Lo-Fi & Chill', 'Rainy Day Vibes', 'Songs on Repeat', 'Do Not Disturb'],
      },
  },
};

function panelFor(id, certifications, panels) {
  const panel = panels[id];
  if (id !== 'corkboard' || !panel) return panel;

  return {
    ...panel,
    certifications,
    body: certifications.length
      ? `Showing ${certifications.length} certification${certifications.length === 1 ? '' : 's'} from the GitHub-hosted certifications file.`
      : 'No certifications found yet. Add them in public/certifications.json and they will appear here automatically after deployment.',
  };
}

function GlassPanel({ panel, id, compact = false, visible = true, onClose }) {
  if (!panel) return null;

  return (
    <article
      className={`hero__glass-panel hero__glass-panel--${id}${
        compact ? ' hero__glass-panel--compact' : ''
      }${visible ? '' : ' is-exiting'}`}
    >
      {compact && onClose && (
        <button className="glass__close" type="button" onClick={e => { e.stopPropagation(); onClose(); }} aria-label="Close panel">
          ×
        </button>
      )}
      <p className="glass__eyebrow">{panel.eyebrow}</p>
      <h2 className="glass__title">{panel.title}</h2>
      {panel.subtitle && <p className="glass__subtitle">{panel.subtitle}</p>}
      {panel.body && <p className="glass__body">{panel.body}</p>}

      {panel.featured && (
        <div className="glass__featured">
          {panel.featured.map(skill => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      )}

      {panel.clouds && (
        <div className="glass__clouds">
          {panel.clouds.map((idea, i) => (
            <span key={idea} className={`glass__cloud glass__cloud--${i % 4}`}>
              {idea}
            </span>
          ))}
        </div>
      )}

      {panel.stats && (
        <div className="glass__stats">
          {panel.stats.map(stat => (
            <span key={stat}>{stat}</span>
          ))}
        </div>
      )}

      {panel.certifications && panel.certifications.length > 0 && (
        <div className="glass__certifications">
          {panel.certifications.map(cert => (
            <section className="glass__certificate" key={`${cert.name}-${cert.issuer}`}>
              <div>
                <h3>{cert.name}</h3>
                <p>
                  {cert.issuer}
                  {cert.issued ? ` · ${cert.issued}` : ''}
                </p>
              </div>
              {cert.url && (
                <a
                  className="glass__cred-btn"
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                >
                  Show credentials
                </a>
              )}
            </section>
          ))}
        </div>
      )}

      {panel.highlights && (
        <ul className="glass__highlights">
          {panel.highlights.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      {panel.timeline && (
        <div className="glass__timeline">
          {panel.timeline.map(([year, text]) => (
            <section key={year}>
              <strong>{year}</strong>
              <p>{text}</p>
            </section>
          ))}
        </div>
      )}

      {panel.groups && (
        <div className="glass__skill-groups">
          {panel.groups.map(([group, skills]) => (
            <section className="glass__skill-group" key={group}>
              <h3>{group}</h3>
              <div className="glass__chips">
                {skills.map(skill => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {panel.images && (
        <div className="glass__gallery">
          {panel.images.map(([src, alt]) => (
            <figure className="glass__gallery-card" key={src}>
              <img src={assetUrl(src)} alt={alt} draggable="false" />
            </figure>
          ))}
        </div>
      )}

      {panel.projects && (
        <div className="glass__projects">
          {panel.projects.map(([name, description, href]) => (
            <section className="glass__project" key={name}>
              <h3>{name}</h3>
              <p>{description}</p>
              {href && (
                <a href={href} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                  {href.replace('https://github.com/Karthikn-VR/', 'github.com/Karthikn-VR/')} ↗
                </a>
              )}
            </section>
          ))}
        </div>
      )}

      {panel.links && (
        <div className="glass__links">
          {panel.links.map(([label, value, href]) => (
            <div key={label}>
              <strong>{label}</strong>
              {href ? (
                <a className="glass__link-value" href={href} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                  {value} ↗
                </a>
              ) : (
                <span>{value}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {panel.actions && panel.actions.length > 0 && (
        <div className="glass__actions">
          {panel.actions.map(([label, target, isLocal]) => {
            const href = isLocal ? assetUrl(target) : target;
            const isExternal = typeof target === 'string' && /^https?:\/\//.test(target);
            return isExternal ? (
              <a
                key={label}
                className="glass__action"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
              >
                {label} ↗
              </a>
            ) : (
              <a
                key={label}
                className="glass__action"
                href={href}
                download={!!isLocal}
                onClick={e => e.stopPropagation()}
              >
                {label}
              </a>
            );
          })}
        </div>
      )}

      {panel.footer && <p className="glass__footer">{panel.footer}</p>}
    </article>
  );
}

/**
 * Calculates the transform-origin that pins the stage center.
 */
function planeOrigin(left, bottom, width, heightPct) {
  const x = ((50 - left) / width) * 100;
  const y = ((bottom + heightPct - 50) / heightPct) * 100;
  return `${x}% ${y}%`;
}

/**
 * Pins a depth plane's transform-origin at the stage center.
 */
function placePlane(depthEl, imgEl, layer) {
  if (!depthEl || !imgEl || !imgEl.naturalWidth) return;
  const aspect = imgEl.naturalHeight / imgEl.naturalWidth;
  const heightPct = layer.width * SCENE_RATIO * aspect;
  depthEl.style.transformOrigin = planeOrigin(layer.left, layer.bottom, layer.width, heightPct);
  depthEl.classList.add('is-ready');
}

export default function HeroScene({ onSelect }) {
  const { hovered, registerNode, onPointerMove, onPointerLeave } = useAlphaHover(LAYERS);
  const { stageRef, roomRef } = useParallaxRig();
  const [loaded, setLoaded] = useState(0);
  const [failed, setFailed] = useState([]);
  const [musicBlocked, setMusicBlocked] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [certifications, setCertifications] = useState([]);
  const [panels, setPanels] = useState(FALLBACK_CONTENT.panels);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const focusAudioRef = useRef(null);

  const pending = LAYERS.length - loaded - failed.length;
  const activePanel = hovered ? panelFor(hovered.id, certifications, panels) : null;
  const showMusicPlayer = hovered?.id === 'headphones';

  // Load content from JSON at runtime — merge on top of fallback so new
  // panels added to FALLBACK_CONTENT always appear even if content.json
  // hasn't been updated yet.
  useEffect(() => {
    let alive = true;
    loadContent().then(content => {
      if (alive && content?.panels) {
        setPanels(prev => ({ ...prev, ...content.panels }));
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  // Track mouse position for hover label
  useEffect(() => {
    const handleMove = e => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  useEffect(() => {
    let alive = true;

    fetch(assetUrl('certifications.json'), { cache: 'no-store' })
      .then(response => (response.ok ? response.json() : []))
      .then(items => {
        if (alive) setCertifications(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (alive) setCertifications([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const audio = focusAudioRef.current;
    if (!audio) return;

    if (!showMusicPlayer) {
      audio.pause();
      audio.currentTime = 0;
      setMusicPlaying(false);
      setMusicBlocked(false);
      return;
    }

    audio.volume = 0.28;
    const attempt = audio.play();
    if (attempt?.then) {
      attempt
        .then(() => {
          setMusicPlaying(true);
          setMusicBlocked(false);
        })
        .catch(() => {
          setMusicPlaying(false);
          setMusicBlocked(true);
        });
    }
  }, [showMusicPlayer]);

  const toggleMusic = event => {
    event.stopPropagation();
    const audio = focusAudioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.volume = 0.28;
      audio
        .play()
        .then(() => {
          setMusicPlaying(true);
          setMusicBlocked(false);
        })
        .catch(() => setMusicBlocked(true));
    } else {
      audio.pause();
      setMusicPlaying(false);
    }
  };

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleSelect = () => {
    if (!hovered) return;
    onSelect?.(hovered.id, hovered.section);
    if (panels[hovered.id]) setSelectedPanel(panelFor(hovered.id, certifications, panels));
  };

  return (
    <section className="hero">
      <div className="hero__intro" aria-hidden="true">
        <span>Hi, I'm Karthikeyan VR</span>
        <strong>Trying To be a Developer</strong>
      </div>

      <div
        className="hero__time-display"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Current time ${formattedTime}`}
      >
        <span>{formattedTime}</span>
        <small>Chennai</small>
      </div>

      {/* ---- Main 2.5D Interactive Room Stage ---- */}
      <div
        className="hero__scene"
        ref={stageRef}
        style={{ cursor: hovered ? 'pointer' : 'default', zIndex: 10 }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onClick={handleSelect}
      >
        <div className="hero__parallax">
          <div className="hero__room" ref={roomRef}>
            {/* Room shell: gray wall + carpet floor + baseboard + lamp light */}
            <div className="depth depth--shell" style={{ '--d': String(SHELL_DEPTH) }}>
              <div className="room__wall" />
              <div className="room__floor" style={{ top: `${FLOOR_LINE}%` }} />
              <div className="room__baseboard" style={{ top: `calc(${FLOOR_LINE}% - 1.4%)` }} />
              <div className="room__lamplight" />
            </div>

            {/* ---- Room Objects: Back to Front ---- */}
            {LAYERS.map(layer => {
              const isHovered = hovered?.id === layer.id;
              const isInteractive = !!layer.section;
              const filter = [
                isHovered ? HOVER_OUTLINE : '',
                layer.shadow ? `drop-shadow(${layer.shadow})` : '',
              ]
                .filter(Boolean)
                .join(' ');

              const handleKeyDown = e => {
                if ((e.key === 'Enter' || e.key === ' ') && isInteractive) {
                  e.preventDefault();
                  onSelect?.(layer.id, layer.section);
                  if (panels[layer.id])
                    setSelectedPanel(panelFor(layer.id, certifications, panels));
                }
              };

              return (
                <div
                  key={layer.id}
                  ref={registerNode(layer.id)}
                  className={`depth layer-plane layer-plane--${layer.id}`}
                  style={{
                    '--d': String(layer.depth),
                    left: `${layer.left}%`,
                    bottom: `${layer.bottom}%`,
                    width: `${layer.width}%`,
                    zIndex: layer.zIndex,
                  }}
                  role={isInteractive ? 'button' : undefined}
                  tabIndex={isInteractive ? 0 : -1}
                  aria-label={isInteractive ? layer.section : undefined}
                  onKeyDown={handleKeyDown}
                >
                  {layer.groundShadow && (
                    <span
                      className="layer__ground-shadow"
                      aria-hidden="true"
                      style={{
                        '--gs-left': `${layer.groundShadow.left ?? 50}%`,
                        '--gs-bottom': `${layer.groundShadow.bottom ?? 0}%`,
                        '--gs-width': `${layer.groundShadow.width ?? 70}%`,
                        '--gs-height': `${layer.groundShadow.height ?? 10}%`,
                        '--gs-opacity': layer.groundShadow.opacity ?? 0.28,
                      }}
                    />
                  )}
                  <img
                    className={`layer layer--${layer.id}${isHovered ? ' is-hovered' : ''}`}
                    src={assetUrl(layer.src)}
                    alt={layer.alt}
                    draggable="false"
                    decoding="async"
                    loading={layer.priority === 'high' ? 'eager' : 'lazy'}
                    onLoad={e => {
                      setLoaded(n => n + 1);
                      placePlane(e.currentTarget.parentElement, e.currentTarget, layer);
                    }}
                    onError={() => setFailed(f => [...f, layer.id])}
                    ref={imgEl => {
                      if (imgEl && imgEl.complete) placePlane(imgEl.parentElement, imgEl, layer);
                    }}
                    style={{
                      transform: layer.flip ? 'scaleX(-1)' : undefined,
                      filter: filter || undefined,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ---- Flat Overlay UI ---- */}
        <div className="hero__overlay">
          <audio ref={focusAudioRef} src={assetUrl('assets/focus-loop.wav')} loop preload="auto" />

          {showMusicPlayer && (
            <div className="hero__music-player">
              <div className="music__visualizer" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div>
                <p className="music__title">Focus Lo-Fi</p>
                <p className="music__meta">
                  Original royalty-free loop
                  {musicBlocked ? ' · click play' : ''}
                </p>
              </div>
              <button type="button" onClick={toggleMusic}>
                {musicPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
          )}

          {hovered && (
            <span
              className="hero__label"
              style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }}
            >
              {activePanel ? `${hovered.section} · click to see` : hovered.section}
            </span>
          )}

          {(pending > 0 || failed.length > 0) && (
            <span className="hero__status">
              {failed.length > 0
                ? `${failed.length} asset(s) failed: ${failed.join(', ')}`
                : `loading ${loaded}/${LAYERS.length}`}
            </span>
          )}
        </div>
      </div>

      {/* Modal lives on .hero (full viewport), not inside the 16:10 scene box.
          On tall phones the scene is short; viewport-based height keeps the
          panel readable. */}
      <GlassPanel
        panel={selectedPanel}
        id="modal"
        compact
        visible={!!selectedPanel}
        onClose={() => setSelectedPanel(null)}
      />

      <div className="hero__vignette" />
    </section>
  );
}
