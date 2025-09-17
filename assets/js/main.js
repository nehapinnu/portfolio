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
      link.target = p.link ? '_blank' : '';
      link.rel = p.link ? 'noreferrer' : '';
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