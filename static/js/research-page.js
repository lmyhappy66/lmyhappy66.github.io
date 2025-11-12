// Loader for standalone research.html with topic-based content
const contentDir = 'contents/';
const configFile = 'config.yml';
const cardsFile = 'research_cards.yml';
const defaultSection = 'research';

window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const topic = params.get('topic');
    const mdPathPrimary = topic ? `${contentDir}research/${topic}.md` : `${contentDir}${defaultSection}.md`;
    const mdPathFallback = `${contentDir}${defaultSection}.md`;

    // Load config.yml and set base title
    let siteTitle = '';
    fetch(contentDir + configFile)
        .then(r => r.text())
        .then(text => {
            try {
                const yml = jsyaml.load(text);
                Object.keys(yml).forEach(key => {
                    const el = document.getElementById(key);
                    if (el) {
                        el.innerHTML = yml[key];
                    }
                });
                siteTitle = yml && yml.title ? yml.title : '';
            } catch (e) {
                console.error('YAML parse error', e);
            }
        })
        .finally(() => {
            // Optionally load cards to get topic title for header and document.title
            if (topic) {
                fetch(contentDir + cardsFile)
                    .then(r => r.text())
                    .then(text => {
                        let cfg;
                        try { cfg = jsyaml.load(text); } catch { cfg = null; }
                        const cards = cfg && cfg.cards ? cfg.cards : [];
                        const match = cards.find(c => c.slug === topic);
                        const headerEl = document.getElementById('research-page-title');
                        if (match && headerEl) headerEl.innerHTML = `<i class=\"bi bi-gear-fill\"></i> ${match.title}`;
                        // Set hero background and text
                        const hero = document.getElementById('research-hero');
                        const heroText = document.getElementById('research-hero-text');
                        const imgUrl = (match && match.image) ? match.image : 'static/assets/img/background.jpeg';
                        if (hero) hero.style.backgroundImage = `url('${imgUrl}')`;
                        if (heroText) heroText.textContent = match && match.title ? match.title : 'Research';
                        if (match && siteTitle) document.title = `${match.title} | ${siteTitle}`;
                        else if (siteTitle) document.title = `Research | ${siteTitle}`;
                    })
                    .catch(() => { if (siteTitle) document.title = `Research | ${siteTitle}`; });
            } else {
                // No topic: set default hero
                const hero = document.getElementById('research-hero');
                const heroText = document.getElementById('research-hero-text');
                if (hero) hero.style.backgroundImage = `url('static/assets/img/background.jpeg')`;
                if (heroText) heroText.textContent = 'Research';
                if (siteTitle) document.title = `Research | ${siteTitle}`;
            }
        });

    // Load markdown (with fallback)
    const containerId = `${defaultSection}-md`;
    const renderMd = (md) => {
        marked.use({ mangle: false, headerIds: false });
        const html = marked.parse(md);
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = html;
        if (window.MathJax && MathJax.typeset) MathJax.typeset();
    };

    fetch(mdPathPrimary)
        .then(r => { if (!r.ok) throw new Error('primary not found'); return r.text(); })
        .then(renderMd)
        .catch(() => fetch(mdPathFallback).then(r => r.text()).then(renderMd).catch(err => console.error('Failed to load research content', err)));
});
