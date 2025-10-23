// element.js — Pure Web Component with stacked/layered cards (compact, no external libs)
(function(){
  const css=`:host{display:block}.wrap{max-width:64rem;margin:0 auto;padding:5rem 1.25rem;box-sizing:border-box;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Apple Color Emoji","Segoe UI Emoji";color:#0a0a0a}.grid{display:grid;grid-template-columns:1fr;gap:5rem}@media(min-width:768px){.grid{grid-template-columns:1fr 1fr}}.stage{position:relative;width:100%;height:24rem;overflow:visible}.card{position:absolute;inset:0;border-radius:1.25rem;opacity:0;transform:translateY(20px) scale(.96) rotate(0);transition:opacity .35s ease,transform .35s ease,filter .35s ease;box-shadow:0 20px 50px rgba(0,0,0,.2);will-change:transform,opacity,filter}.card img{width:100%;height:100%;object-fit:cover;object-position:center;border-radius:1.25rem;-webkit-user-drag:none}.card[data-pos="0"]{opacity:1;transform:translate(0,0) scale(1) rotate(0);z-index:50;filter:none}.card[data-pos="-1"]{opacity:.95;transform:translate(-18px,12px) scale(.96) rotate(-5deg);z-index:40;filter:saturate(.95) brightness(.98)}.card[data-pos="1"]{opacity:.95;transform:translate(18px,12px) scale(.96) rotate(5deg);z-index:40;filter:saturate(.95) brightness(.98)}.card[data-pos="-2"]{opacity:.75;transform:translate(-32px,24px) scale(.92) rotate(-8deg);z-index:30;filter:grayscale(.05) brightness(.96)}.card[data-pos="2"]{opacity:.75;transform:translate(32px,24px) scale(.92) rotate(8deg);z-index:30;filter:grayscale(.05) brightness(.96)}.card[data-pos="out"]{opacity:0;transform:translateY(30px) scale(.9);z-index:10}.h3{font-size:1.5rem;font-weight:800;margin:0;color:#0a0a0a}.designation{font-size:.875rem;color:#666;margin-top:.25rem}.quote{font-size:1.125rem;color:#555;margin-top:2rem;line-height:1.6}.controls{display:flex;gap:.75rem;padding-top:2rem}.btn{
  width:2rem;height:2rem;border-radius:9999px;
  background:#A78BFA;            /* lavender circle */
  color:#fff;                     /* white arrows */
  display:inline-flex;align-items:center;justify-content:center;
  border:none;cursor:pointer;font-weight:700;user-select:none;
  transition:transform .15s ease, filter .15s ease, background .15s ease;
  box-shadow:0 6px 16px rgba(167,139,250,.35);
}
.btn:hover{ transform:translateY(-1px); filter:brightness(.95); }
.btn:active{ transform:translateY(0); filter:brightness(.9); }
;
  class X extends HTMLElement{
    static get observedAttributes(){return["testimonials","autoplay","class"];}
    constructor(){
      super();
      this._active=0; this._timer=null;
      const root=this.attachShadow({mode:"open"});
      const style=document.createElement("style"); style.textContent=css;
      this._wrap=document.createElement("div"); this._wrap.className="wrap";
      root.append(style,this._wrap);
      this._wrap.innerHTML=`<div class="grid">
        <div><div class="stage" id="stage"></div></div>
        <div><div id="text"></div>
          <div class="controls">
            <button class="btn" id="prev" aria-label="Previous">◀</button>
            <button class="btn" id="next" aria-label="Next">▶</button>
          </div>
        </div></div>`;
      this._els={
        stage:this._wrap.querySelector("#stage"),
        text:this._wrap.querySelector("#text"),
        prev:this._wrap.querySelector("#prev"),
        next:this._wrap.querySelector("#next")
      };
      this._els.prev.addEventListener("click",()=>this._prev());
      this._els.next.addEventListener("click",()=>this._next());
    }
    attributeChangedCallback(){this._render();}
    connectedCallback(){this._render();}
    disconnectedCallback(){this._stop();}
    _data(){
      let testimonials=[]; try{testimonials=JSON.parse(this.getAttribute("testimonials")||"[]");}catch(e){}
      const autoplay=(String(this.getAttribute("autoplay")||"false").toLowerCase()==="true");
      const className=this.getAttribute("class")||"";
      return{testimonials,autoplay,className};
    }
    _render(){
      const {testimonials,autoplay,className}=this._data();
      this._wrap.className=`wrap ${className}`.trim();
      if(!Array.isArray(testimonials)||!testimonials.length){
        this._els.stage.innerHTML=`<em>Add a valid \`testimonials\` JSON array in the element attributes.</em>`;
        this._els.text.innerHTML=""; this._stop(); return;
      }
      if(!this._cards||this._cards.length!==testimonials.length){
        this._els.stage.innerHTML=""; this._cards=testimonials.map(t=>{
          const c=document.createElement("div"); c.className="card";
          const img=document.createElement("img"); img.src=t.src; img.alt=t.name||"testimonial";
          c.appendChild(img); this._els.stage.appendChild(c); return c;
        });
      }else{
        testimonials.forEach((t,i)=>{
          const img=this._cards[i].querySelector("img");
          if(img&&(img.src!==t.src||img.alt!==(t.name||"testimonial"))){img.src=t.src; img.alt=t.name||"testimonial";}
        });
      }
      this._applyText(testimonials[this._active]); this._stack(testimonials.length);
      this._stop(); if(autoplay) this._timer=setInterval(()=>this._next(),5000);
    }
    _applyText(t){
      this._els.text.innerHTML=`<h3 class="h3">${h(t.name||"")}</h3>
        <p class="designation">${h(t.designation||"")}</p>
        <p class="quote">${h(t.quote||"")}</p>`;
    }
    _stack(n){
      for(let i=0;i<this._cards.length;i++){
        let d=i-this._active;
        if(d>n/2)d-=n; if(d<-n/2)d+=n;
        const pos=(d>=-2&&d<=2)?String(d):"out";
        this._cards[i].setAttribute("data-pos",pos);
      }
    }
    _next(){
      const {testimonials}=this._data(); if(!testimonials.length)return;
      this._active=(this._active+1)%testimonials.length;
      this._applyText(testimonials[this._active]); this._stack(testimonials.length);
    }
    _prev(){
      const {testimonials}=this._data(); if(!testimonials.length)return;
      this._active=(this._active-1+testimonials.length)%testimonials.length;
      this._applyText(testimonials[this._active]); this._stack(testimonials.length);
    }
    _stop(){ if(this._timer){clearInterval(this._timer); this._timer=null;} }
  }
  function h(s){return String(s).replace(/[&<>"']/g,c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));}
  if(!customElements.get("x-animated-testimonials")) customElements.define("x-animated-testimonials",X);
})();
