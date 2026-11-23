import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import catalog from '../backend/projects.json';
import './style.css';

const labels = { music: 'Music', builds: 'PC builds' };
const categories = [['all', 'All work'], ...Object.entries(labels)];
const api = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '')).replace(/\/$/, '');
const media = (name) => `${import.meta.env.BASE_URL}media/${name}`;

function Mark() {
  return <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width="34" height="34" />;
}

function Photo({ project, eager = false }) {
  return <img src={media(project.image)} alt={project.alt} width={project.width} height={project.height}
    loading={eager ? 'eager' : 'lazy'} decoding="async" fetchPriority={eager ? 'high' : undefined} />;
}

function ProjectDialog({ project, onClose }) {
  const dialog = useRef(null);
  const [videoFailed, setVideoFailed] = useState(false);
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    element.showModal();
    return () => {
      element.close();
      trigger?.focus();
    };
  }, []);
  return <dialog ref={dialog} aria-labelledby="project-title" onCancel={onClose}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="dialog-content">
      <button className="pill close" onClick={onClose} autoFocus>Close</button>
      <span className="eyebrow accent">{labels[project.category]}</span>
      <h2 id="project-title">{project.title}</h2>
      <p>{project.description}</p>
      {project.video && !videoFailed
        ? <video controls playsInline preload="none" poster={media(project.image)}
            aria-label={project.title} onError={() => setVideoFailed(true)} src={media(project.video)} />
        : <Photo project={project} />}
      {videoFailed && <p role="alert">This video could not play. <a href={media(project.video)}>Open the MP4</a>.</p>}
    </div>
  </dialog>;
}

function Gallery({ filter, setFilter }) {
  const [selection, setSelection] = useState(null);
  const [retry, setRetry] = useState(0);
  const [data, setData] = useState(catalog);
  const [status, setStatus] = useState(api ? 'loading' : 'offline');

  useEffect(() => {
    if (!api) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 75000);
    let active = true;
    async function load() {
      try {
        const response = await fetch(`${api}/api/projects`, { signal: controller.signal });
        if (!response.ok) throw new Error('Catalog unavailable');
        const projects = await response.json();
        if (!Array.isArray(projects)) throw new Error('Invalid catalog');
        if (active) {
          setData(projects);
          setStatus('ready');
        }
      } catch {
        if (active) {
          setData(catalog);
          setStatus('error');
        }
      } finally {
        window.clearTimeout(timeout);
      }
    }
    load();
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [retry]);

  const projects = data.filter((project) => filter === 'all' || project.category === filter);
  return <section className="gallery wrap" id="work" aria-labelledby="work-title">
    <div className="section-heading">
      <h2 id="work-title">Project archive<span>.</span></h2>
      <div className="filters" role="group" aria-label="Filter projects">
        {categories.map(([key, label]) => <button className="pill" key={key}
          aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>)}
      </div>
    </div>
    <p className="status" role="status">
      {status === 'loading' && 'Checking for updates. The saved gallery is available below.'}
      {status === 'error' && <>The live gallery is unavailable. Showing saved projects. <button onClick={() => {
        setStatus('loading');
        setRetry((value) => value + 1);
      }}>Retry</button></>}
      {status === 'ready' && `${projects.length} ${projects.length === 1 ? 'project' : 'projects'}`}
    </p>
    {projects.length ? <div className="project-grid">
      {projects.map((project) => <button className="project" key={project.id} onClick={() => setSelection(project)}>
        <div className="project-image"><Photo project={project} /></div>
        <div className="project-info">
          <span className="eyebrow">{labels[project.category]}{project.video ? ' / Video' : ' / Photo'}</span>
          <strong>{project.title}</strong>
          <span>{project.description}</span>
        </div>
      </button>)}
    </div> : <p className="empty">There are no projects in this view yet.</p>}
    {selection && <ProjectDialog key={selection.id} project={selection} onClose={() => setSelection(null)} />}
  </section>;
}

function App() {
  const [filter, setFilter] = useState('all');
  const music = catalog.find((project) => project.id === 'studio-session');
  const build = catalog.find((project) => project.id === 'red-build');
  return <>
    <a className="skip" href="#main">Skip to content</a>
    <header className="header">
      <div className="wrap header-inner">
        <a className="brand" href="#top"><Mark /><span>Signal<span className="amp"> &amp; </span>Silicon</span></a>
        <nav aria-label="Main navigation">
          <a href="#about">About</a>
          <a href="#music">Music</a>
          <a href="#builds">PC builds</a>
          <a href="#services">Services</a>
          <a className="nav-work" href="#work" onClick={() => setFilter('all')}>All work</a>
        </nav>
      </div>
    </header>
    <main id="main" tabIndex={-1}>
      <section className="hero wrap" id="top" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow accent"><span className="dot" /> Kalilov Akylbek</p>
          <h1 id="hero-title">Making music.<br /><em>Building PCs.</em></h1>
          <p className="intro">I make music and build custom PCs. This is where I share what happens in the studio and at the workbench.</p>
          <a href="#work" className="cta" onClick={() => setFilter('all')}>Explore my work</a>
        </div>
        <figure className="hero-media">
          <Photo project={build} eager />
          <figcaption><span className="dot" /> From the workbench</figcaption>
        </figure>
      </section>
      <div className="feature-band">
        <div className="wrap features">
          <section className="feature" id="music" aria-labelledby="music-title">
            <p className="eyebrow accent">The studio</p>
            <h2 id="music-title">Making music</h2>
            <p>Ideas take shape one layer at a time. Step inside a session and see what I work on in the timeline.</p>
            <a href="#work" onClick={() => setFilter('music')}>Browse studio projects</a>
            <div className="feature-image"><Photo project={music} /></div>
          </section>
          <section className="feature" id="builds" aria-labelledby="builds-title">
            <p className="eyebrow accent">The workbench</p>
            <h2 id="builds-title">Building PCs</h2>
            <p>From picking the parts to the first power-on, I enjoy seeing a pile of components become a working machine.</p>
            <a href="#work" onClick={() => setFilter('builds')}>Browse PC builds</a>
            <div className="feature-image"><Photo project={catalog.find((project) => project.id === 'open-case')} /></div>
          </section>
        </div>
      </div>
      <section className="services wrap" id="services" aria-labelledby="services-title">
        <h2 id="services-title">Services</h2>
        <div className="service-grid">
          <div>
            <h3>Custom PCs and parts advice</h3>
            <p>I can build a custom PC for you or suggest compatible parts and upgrades based on your budget and what you'll use it for.</p>
          </div>
          <div>
            <h3>Custom music and sound effects</h3>
            <p>I can make original music in any style you need and create custom sound effects for your project.</p>
          </div>
        </div>
      </section>
      <Gallery filter={filter} setFilter={setFilter} />
      <section className="about wrap" id="about" aria-labelledby="about-title">
        <div>
          <p className="eyebrow accent">About me</p>
          <h2 id="about-title">Kalilov Akylbek</h2>
        </div>
        <p>I'm a sophomore at the American University of Central Asia (AUCA). I play basketball and used to play table tennis professionally. I also make music and build custom PCs.</p>
      </section>
    </main>
    <footer>
      <div className="wrap footer-inner">
        <a className="brand" href="#top"><Mark /> Signal &amp; Silicon</a>
        <p>Music production &amp; custom PC builds</p>
        <a href="#top">Back to top</a>
      </div>
    </footer>
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
