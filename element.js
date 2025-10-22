// public/element.js — UMD/Script-tag version (no ESM imports, no build needed)
(function () {
  // 1) Load UMD scripts once
  const loadScript = (src) =>
    new Promise((res, rej) => {
      if ([...document.scripts].some(s => s.src === src)) return res();
      const s = document.createElement('script');
      s.src = src; s.async = true; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });

  const libsReady = (async () => {
    // React 18 + ReactDOM 18 UMD
    await loadScript('https://unpkg.com/react@18/umd/react.production.min.js');
    await loadScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js');
    // Framer Motion UMD (exposes window.framerMotion)
    await loadScript('https://unpkg.com/framer-motion@11/dist/framer-motion.umd.js');
  })();

  // 2) Styles for the component (Shadow DOM safe)
  function styleTag() {
    const css = `
      :host{display:block}
      .wrapper{max-width:64rem;margin:0 auto;padding:5rem 1.25rem;box-sizing:border-box;
        font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji";color:#0a0a0a}
      .grid{display:grid;grid-template-columns:1fr;gap:5rem}
      @media(min-width:768px){.grid{grid-template-columns:1fr 1fr}}
      .left{position:relative}
      .stage{position:relative;width:100%;height:20rem;overflow:visible}
      .card{position:absolute;inset:0;transform-origin:bottom center}
      .card img{width:100%;height:100%;object-fit:cover;object-position:center;border-radius:1.5rem;-webkit-user-drag:none}
      .right{display:flex;flex-direction:column;justify-content:space-between}
      .h3{font-size:1.5rem;font-weight:800;margin:0;color:#0a0a0a}
      .designation{font-size:.875rem;color:#666;margin-top:.25rem}
      .quote{font-size:1.125rem;color:#555;margin-top:2rem;line-height:1.6}
      .controls{display:flex;gap:1rem;padding-top:3rem}
      .btn{width:1.75rem;height:1.75rem;border-radius:9999px;background:#f3f3f3;display:inline-flex;align-items:center;justify-content:center;border:none;cursor:pointer;font-weight:700}
    `;
    const tag = document.createElement('style');
    tag.textContent = css;
    return tag;
  }

  // 3) Define the custom element
  class AnimatedTestimonialsElement extends HTMLElement {
    static get observedAttributes() { return ['testimonials','autoplay','class']; }
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._container = document.createElement('div');
      this.shadowRoot.append(styleTag(), this._container);
      this._root = null;
      this._ready();
    }

    async _ready() {
      await libsReady;
      const React = window.React;
      const ReactDOM = window.ReactDOM;
      const { motion, AnimatePresence } = window.framerMotion;

      const { useEffect, useState } = React;
      const cn = (...xs) => xs.filter(Boolean).join(' ');

      const AnimatedTestimonials = ({ testimonials, autoplay=false, className }) => {
        const [active, setActive] = useState(0);
        const next = () => setActive(p => (p + 1) % testimonials.length);
        const prev = () => setActive(p => (p - 1 + testimonials.length) % testimonials.length);
        const isActive = (i) => i === active;

        useEffect(() => {
          if (autoplay) {
            const id = setInterval(next, 5000);
            return () => clearInterval(id);
          }
        }, [autoplay]);

        const randomRotateY = () => Math.floor(Math.random()*21)-10;

        return React.createElement('div', { className: cn('wrapper', className) },
          React.createElement('div', { className: 'grid' },
            React.createElement('div', { className: 'left' },
              React.createElement('div', { className: 'stage' },
                React.createElement(AnimatePresence, null,
                  testimonials.map((t, index) =>
                    React.createElement(motion.div, {
                      className:'card', key: t.src + index,
                      initial:{ opacity:0, scale:0.9, z:-100, rotate: randomRotateY() },
                      animate:{
                        opacity: isActive(index)?1:0.7,
                        scale: isActive(index)?1:0.95,
                        z: isActive(index)?0:-100,
                        rotate: isActive(index)?0:randomRotateY(),
                        zIndex: isActive(index)?999:testimonials.length + 2 - index,
                        y: isActive(index)?[0,-80,0]:0
                      },
                      exit:{ opacity:0, scale:0.9, z:100, rotate: randomRotateY() },
                      transition:{ duration:0.4, ease:'easeInOut' }
                    },
                      React.createElement('img', { src:t.src, alt:t.name, draggable:false })
                    )
                  )
                )
              )
            ),
            React.createElement('div', { className: 'right' },
              React.createElement(motion.div, {
                key: 'k'+active,
                initial:{ y:20, opacity:0 },
                animate:{ y:0, opacity:1 },
                exit:{ y:-20, opacity:0 },
                transition:{ duration:0.2, ease:'easeInOut' }
              },
                React.createElement('h3', { className:'h3' }, testimonials[active].name),
                React.createElement('p', { className:'designation' }, testimonials[active].designation),
                React.createElement(motion.p, { className:'quote' },
                  testimonials[active].quote.split(' ').map((w,i) =>
                    React.createElement(motion.span, {
                      key:i,
                      initial:{ filter:'blur(10px)', opacity:0, y:5 },
                      animate:{ filter:'blur(0px)', opacity:1, y:0 },
                      transition:{ duration:0.2, ease:'easeInOut', delay: 0.02 * i },
                      className:'inline-block'
                    }, w + '\u00A0')
                  )
                )
              ),
              React.createElement('div', { className:'controls' },
                React.createElement('button', { className:'btn', onClick: () => prev(), 'aria-label':'Previous' }, '◀'),
                React.createElement('button', { className:'btn', onClick: () => next(), 'aria-label':'Next' }, '▶')
              )
            )
          )
        );
      };

      this._Component = AnimatedTestimonials;
      this._React = React;
      this._ReactDOM = ReactDOM;
      this._render();
    }

    attributeChangedCallback() { this._render(); }
    connectedCallback() { this._render(); }

    _getProps() {
      let testimonials = [];
      try { testimonials = JSON.parse(this.getAttribute('testimonials') || '[]'); } catch {}
      const autoplay = String(this.getAttribute('autoplay') || 'false').toLowerCase() === 'true';
      const className = this.getAttribute('class') || '';
      return { testimonials, autoplay, className };
    }

    _render() {
      if (!this._Component || !this.isConnected) return;
      const props = this._getProps();
      if (!Array.isArray(props.testimonials) || props.testimonials.length === 0) {
        this._container.innerHTML = '<em>Add a `testimonials` JSON array in the element attributes.</em>';
        return;
      }
      if (!this._root) this._root = this._ReactDOM.createRoot(this._container);
      this._root.render(this._React.createElement(this._Component, props));
    }
  }

  if (!customElements.get('x-animated-testimonials')) {
    customElements.define('x-animated-testimonials', AnimatedTestimonialsElement);
  }
})();

