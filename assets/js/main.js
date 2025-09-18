// Utility: set active nav based on path
(function(){
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a=>{
    const href = a.getAttribute('href');
    if(!href) return;
    const file = href.includes('#') ? href.split('#')[0] : href;
    if((path === '' && file === 'index.html') || file === path){ a.classList.add('active'); }
  });
})();

// Robust loader: try fetching projects.json; if blocked (e.g., file://),
// fall back to inline <script type="application/json" id="projects-data">.
async function loadProjects(){
  try{
    const res = await fetch('assets/data/projects.json', {cache:'no-store'});
    if(!res.ok) throw new Error('HTTP '+res.status);
    return await res.json();
  }catch(err){
    const inline = document.getElementById('projects-data');
    if(inline && inline.textContent.trim().length){
      try { return JSON.parse(inline.textContent); }
      catch(parseErr){ console.error('Inline projects-data JSON invalid:', parseErr); }
    }
    console.warn('Could not fetch assets/data/projects.json. If running via file://, use a local server (e.g., `python3 -m http.server`).');
    throw err;
  }
}

// Work page: render cards
(async function(){
  const grid = document.getElementById('projects');
  if(!grid) return; // not on index
  try{
    const items = await loadProjects();
    const frag = document.createDocumentFragment();
    items.forEach(p=>{
      const card = document.createElement('article');
      card.className = 'card';
      const link = document.createElement('a');
      link.className = 'thumb';
      link.href = p.link || '#';
      const href = p.link || '#';
      link.href = href;
      // open external links in a new tab; internal (same-origin or relative) in same tab
      const isAbsolute = /^https?:\/\//i.test(href);
      const isExternal = isAbsolute && !href.startsWith(location.origin);
      if (isExternal) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      } else {
        link.removeAttribute('target');
        link.removeAttribute('rel');
      }
      if(p.thumb){ link.style.background = `center/cover no-repeat url('${p.thumb}')`; }
      const body = document.createElement('div');
      body.className = 'card-body';
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = p.tag || 'Project';
      const h3 = document.createElement('h3');
      h3.textContent = p.title || 'Untitled';
      const pEl = document.createElement('p');
      pEl.textContent = p.blurb || '';
      body.append(tag,h3,pEl);
      card.append(link,body);
      frag.append(card);
    });
    grid.replaceChildren(frag);
  }catch(err){
    console.error('Failed to load projects:', err);
    grid.innerHTML = '<p style="color:#cfd3de">(Couldn\'t load projects. If you\'re opening the HTML directly from your file system, start a local server or paste JSON into the inline fallback script.)</p>';
  }
})();

// Smooth scroll for on-page anchors (index contact)
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    if(id.length > 1){ e.preventDefault(); document.querySelector(id).scrollIntoView({behavior:'smooth'}); }
  });
});

// Footer year if present
const yearEl = document.getElementById('year');
if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

  (function () {
    const modal   = document.getElementById('lb');
    const imgEl   = document.getElementById('lb-img');
    const capEl   = document.getElementById('lb-cap');
    const closeEl = modal.querySelector('.lb-close');

    // Every gallery image becomes clickable
    const imgs = document.querySelectorAll('.gallery .tile img');

    imgs.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => openLB(img));
    });

    function openLB(sourceImg) {
      const src = sourceImg.getAttribute('src');
      const cap = sourceImg.dataset.caption || sourceImg.getAttribute('alt') || '';
      imgEl.src = src;
      imgEl.alt = sourceImg.alt || '';
      capEl.textContent = cap;
      modal.classList.add('open');
      document.body.classList.add('lb-lock');
      closeEl.focus();
    }

    function closeLB() {
      modal.classList.remove('open');
      document.body.classList.remove('lb-lock');
      // clear src to stop network/decoding if you want:
      // imgEl.src = '';
    }

    // Close interactions
    closeEl.addEventListener('click', closeLB);
    modal.addEventListener('click', (e) => {
      // only close if clicking the backdrop (not the figure/image)
      if (e.target === modal) closeLB();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeLB();
    });
  })();