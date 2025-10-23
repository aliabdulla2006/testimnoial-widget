// element.js — Pure Web Component version (no React/FramerMotion/CDNs)
(function () {
  const css = `
    :host{display:block}
    .wrap{max-width:64rem;margin:0 auto;padding:5rem 1.25rem;box-sizing:border-box;
      font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji";color:#0a0a0a}
    .grid{display:grid;grid-template-columns:1fr;gap:5rem}
    @media(min-width:768px){.grid{grid-template-columns:1fr 1fr}}
    .stage{position:relative;width:100%;height:20rem;overflow:hidden}
    .card{position:absolute;inset:0;border-radius:1.5rem;opacity:0;transform:translateY(20px) scale(.98);
      transition:opacity .45s ease, transform .45s ease}
    .card.active{opacity:1;transform:translateY(0) scale(1)}
    .card img{width:100%;height:100%;object-fit:cover;object-position:center;border-radius:1.5rem;-webkit-user-drag:none}
    .h3{font-size:1.5rem;font-weight:800;margin:0}
    .designation{font-size:.875rem;color:#666;margin-top:.25rem}
    .quote{font-size:1.125rem;color:#555;margin-top:2rem;line-height:1.6}
    .controls{display:flex;gap:1rem;padding-top:3rem}
    .btn{width:1.75rem;height:1.75rem;border-radius:9999px;background:#f3f3f3;display:inline-flex;
      align-items:center;justify-content:center;border:none;cursor:pointer;font-weight:700;user-select:none}
  `;

  class AnimatedTestimonialsElement extends HTMLElement {
    static get observedAttributes() { return ['testimonials','autoplay','class']; }
    constructor() {
      super();
      this._active = 0;
      this._timer = null;

      const root = this.attachShadow({ mode: 'open' });
      const style = document.createElement('style'); style.textContent = css;
      this._wrap = document.createElement('div'); this._wrap.className = 'wrap';
      root.append(style, this._wrap);

      this._renderSkeleton();
    }

    attributeChangedCallback() { this._render(); }
    connectedCallback() { this._render(); }
    disconnectedCallback() { this._stopAutoplay(); }

    _parse() {
      let testimonials = [];
      try { testimonials = JSON.parse(this.getAttribute('testimonials') || '[]'); }
      catch(_) { /* ignore */ }
      const autoplay = String(this.getAttribute('autoplay') || 'false').toLowerCase() === 'true';
      const className = this.getAttribute('class') || '';
      return { testimonials, autoplay, className };
    }

    _renderSkeleton() {
      this._wrap.innerHTML = `
        <div class="grid">
          <div>
            <div class="stage" id="stage"></div>
          </div>
          <div>
            <div id="text"></div>
            <div class="controls">
              <button class="btn" id="prev" aria-label="Previous">◀</button>
              <button class="btn" id="next" aria-label="Next">▶</button>
            </div>
          </div>
        </div>
      `;
      this._els = {
        stage: this._wrap.querySelector('#stage'),
        text: this._wrap.querySelector('#text'),
        prev: this._wrap.querySelector('#prev'),
        next: this._wrap.querySelector('#next'),
      };
      this._els.prev.addEventListener('click', () => this._prev());
      this._els.next.addEventListener('click', () => this._next());
    }

    _render() {
      const { testimonials, autoplay, className } = this._parse();
      this._wrap.className = `wrap ${className||''}`.trim();

      if (!Array.isArray(testimonials) || testimonials.length === 0) {
        this._els.stage.innerHTML = `<em>Add a valid \`testimonials\` JSON array in the element attributes.</em>`;
        this._els.text.innerHTML = '';
        this._stopAutoplay();
        return;
      }

      // Images
      if (!this._cards || this._cards.length !== testimonials.length) {
        this._els.stage.innerHTML = '';
        this._cards = testimonials.map((t, i) => {
          const c = document.createElement('div');
          c.className = 'card' + (i===this._active ? ' active' : '');
          const img = document.createElement('img');
          img.src = t.src; img.alt = t.name || 'testimonial';
          c.appendChild(img);
          this._els.stage.appendChild(c);
          return c;
        });
      } else {
        // update src/alt if content changed
        testimonials.forEach((t, i) => {
          const img = this._cards[i].querySelector('img');
          if (img && (img.src !== t.src || img.alt !== (t.name||'testimonial'))) {
            img.src = t.src; img.alt = t.name || 'testimonial';
          }
        });
      }

      // Text
      const t = testimonials[this._active];
      this._els.text.innerHTML = `
        <h3 class="h3">${escapeHtml(t.name || '')}</h3>
        <p class="designation">${escapeHtml(t.designation || '')}</p>
        <p class="quote">${escapeHtml(t.quote || '')}</p>
      `;

      // Autoplay
      this._stopAutoplay();
      if (autoplay) {
        this._timer = setInterval(() => this._next(), 5000);
      }
    }

    _show(idx) {
      if (!this._cards) return;
      this._cards.forEach((c, i) => c.classList.toggle('active', i === idx));
    }

    _next() {
      const { testimonials } = this._parse();
      if (!testimonials.length) return;
      this._active = (this._active + 1) % testimonials.length;
      this._show(this._active);
      // update text
      const t = testimonials[this._active];
      this._els.text.innerHTML = `
        <h3 class="h3">${escapeHtml(t.name || '')}</h3>
        <p class="designation">${escapeHtml(t.designation || '')}</p>
        <p class="quote">${escapeHtml(t.quote || '')}</p>
      `;
    }

    _prev() {
      const { testimonials } = this._parse();
      if (!testimonials.length) return;
      this._active = (this._active - 1 + testimonials.length) % testimonials.length;
      this._show(this._active);
      // update text
      const t = testimonials[this._active];
      this._els.text.innerHTML = `
        <h3 class="h3">${escapeHtml(t.name || '')}</h3>
        <p class="designation">${escapeHtml(t.designation || '')}</p>
        <p class="quote">${escapeHtml(t.quote || '')}</p>
      `;
    }

    _stopAutoplay() { if (this._timer) { clearInterval(this._timer); this._timer = null; } }
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s]));
  }

  if (!customElements.get('x-animated-testimonials')) {
    customElements.define('x-animated-testimonials', AnimatedTestimonialsElement);
  }
})();
