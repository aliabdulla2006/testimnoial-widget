// element.js — Pure Web Component with stacked/layered cards (no external libs)
(function () {
  const css = `
    :host{display:block}
    .wrap{
      max-width:64rem;margin:0 auto;padding:5rem 1.25rem;box-sizing:border-box;
      font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji";
      color:#0a0a0a
    }
    .grid{display:grid;grid-template-columns:1fr;gap:5rem}
    @media(min-width:768px){.grid{grid-template-columns:1fr 1fr}}
    .stage{position:relative;width:100%;height:24rem;overflow:visible}
    .card{
      position:absolute;inset:0;border-radius:1.25rem;opacity:0;
      transform:translateY(20px) scale(.96) rotate(0deg);
      transition:opacity .35s ease, transform .35s ease, filter .35s ease;
      box-shadow:0 20px 50px rgba(0,0,0,.20);
      will-change: transform, opacity, filter;
    }
    .card img{
      width:100%;height:100%;object-fit:cover;object-position:center;border-radius:1.25rem;-webkit-user-drag:none
    }
    /* Active & stack positions relative to the active index */
    .card[data-pos="0"]{opacity:1;transform:translate(0,0) scale(1) rotate(0deg); z-index:50; filter:none;}
    .card[data-pos="-1"]{opacity:.95;transform:translate(-18px,12px) scale(.96) rotate(-5deg); z-index:40; filter:saturate(.95) brightness(.98);}
    .card[data-pos="1"]{opacity:.95;transform:translate(18px,12px) scale(.96) rotate(5deg); z-index:40; filter:saturate(.95) brightness(.98);}
    .card[data-pos="-2"]{opacity:.75;transform:translate(-32px,24px) scale(.92) rotate(-8deg); z-index:30; filter:grayscale(.05) brightness(.96);}
    .card[data-pos="2"]{opacity:.75;transform:translate(32px,24px) scale(.92) rotate(8deg); z-index:30; filter:grayscale(.05) brightness(.96);}
    .card[data-pos="out"]{opacity:0;transform:translateY(30px) scale(.9); z-index:10;}

    .h3{font-size:1.5rem;font-weight:800;margin:0;color:#0a0a0a}
    .designation{font-size:.875rem;color:#666;margin-top:.25rem}
    .quote{font-size:1.125rem;color:#555;margin-top:2rem;line-height:1.6}
    .controls{display:flex;gap:.75rem;padding-top:2rem}
    .btn{
      width:2rem;height:2rem;border-radius:9999px;background:#f3f3f3;display:inline-flex;
      align-items:center;justify-content:center;border:none;cursor:pointer;font-weight:700;user-select:none;
      transition:transform .15s ease, background .15s ease
    }
    .btn:hover{transform:translateY(-1px);background:#ececec}
  `;

  class AnimatedTestimonialsElement extends HTMLElement {
    static get observedAttributes() { return ['testimon]()
