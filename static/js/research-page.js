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

    // Early: ensure a lead container shows a temporary default image so page never appears blank.
    const earlyLead = document.getElementById('research-lead-media');
    if (earlyLead && earlyLead.childElementCount === 0) {
        const tempImg = document.createElement('img');
        tempImg.src = 'static/assets/img/background.jpeg';
        tempImg.alt = 'Loading…';
        tempImg.className = 'img-fluid mx-auto d-block mb-4 opacity-50';
        tempImg.style.maxWidth = '400px';
        earlyLead.appendChild(tempImg);
        console.debug('[ResearchPage] Inserted early placeholder image');
    }

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
                // On research page, brand acts as a back link labeled "<back"
                const brand = document.getElementById('page-top-title');
                if (brand) {
                    brand.textContent = '<BACK';
                    brand.setAttribute('href', 'index.html#research');
                    brand.setAttribute('aria-label', 'Back to Research');
                }
                siteTitle = yml && yml.title ? yml.title : '';
            } catch (e) {
                console.error('YAML parse error', e);
            }
        })
        .finally(() => {
            // After config, load cards to set page header/title and optional lead image
            const lead = document.getElementById('research-lead-media');
            const normalizeSize = (v) => {
                if (v == null) return null;
                if (typeof v === 'number') return `${v}px`;
                if (typeof v === 'string') {
                    const s = v.trim();
                    if (/^(\d+)(px|%|rem|em|vh|vw)$/.test(s)) return s;
                    const n = parseInt(s, 10);
                    if (!isNaN(n)) return `${n}px`;
                }
                return null;
            };

            const setLeadImage = (url, titleText, maxWidth) => {
                if (!lead) return;
                // Clean previous
                if (lead.replaceChildren) lead.replaceChildren(); else lead.innerHTML = '';
                const img = document.createElement('img');
                img.src = url;
                img.alt = titleText || 'Research figure';
                img.className = 'img-fluid mx-auto d-block mb-4';
                img.style.maxWidth = normalizeSize(maxWidth) || '400px';
                img.loading = 'eager';
                img.onerror = () => {
                    // Hide lead image on error
                    try { lead.style.display = 'none'; } catch {}
                };
                lead.appendChild(img);
                try { lead.style.display = ''; } catch {}
            };

            // No big title at the top anymore
            const applyTitle = (_) => {};

            if (topic) {
                const yamlUrl = contentDir + cardsFile + '?_ts=' + Date.now();
                fetch(yamlUrl)
                    .then(r => r.text())
                    .then(text => {
                        console.debug('[ResearchPage] YAML fetched length:', text.length);
                        let cfg;
                        try { cfg = jsyaml.load(text); } catch { cfg = null; }
                        const cards = cfg && cfg.cards ? cfg.cards : [];
                        const match = cards.find(c => c.slug === topic);
                        const imgUrl = (match && match.image) ? match.image : null;
                        const imgMaxW = match ? (match.image_max_width || match.imageWidth || match.image_width) : null;
                        const titleText = match && match.title ? match.title : 'Research';
                        applyTitle(titleText);
                        if (imgUrl) {
                            console.debug('[ResearchPage] Using card image:', imgUrl);
                            setLeadImage(imgUrl, titleText, imgMaxW);
                        } else {
                            console.debug('[ResearchPage] No image field, fallback to background.jpeg');
                            setLeadImage('static/assets/img/background.jpeg', titleText, imgMaxW);
                        }
                        if (match && siteTitle) document.title = `${match.title} | ${siteTitle}`;
                        else if (siteTitle) document.title = `Research | ${siteTitle}`;
                    })
                    .catch(() => { applyTitle('Research'); setLeadImage('static/assets/img/background.jpeg', 'Research', null); if (siteTitle) document.title = `Research | ${siteTitle}`; });
            } else {
                applyTitle('Research');
                setLeadImage('static/assets/img/background.jpeg', 'Research', null);
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
        // If no lead image yet, attempt to extract first markdown image
        const lead = document.getElementById('research-lead-media');
        if (lead && lead.childElementCount === 0) {
            const mdImageMatch = md.match(/!\[[^\]]*\]\(([^)]+)\)/);
            if (mdImageMatch) {
                const url = mdImageMatch[1];
                console.debug('[ResearchPage] Extracted first markdown image as lead:', url);
                const img = document.createElement('img');
                img.src = url;
                img.alt = 'Figure';
                img.className = 'img-fluid mx-auto d-block mb-4';
                img.style.maxWidth = '400px';
                img.onerror = () => { lead.style.display = 'none'; };
                lead.appendChild(img);
            }
        }
        if (window.MathJax && MathJax.typeset) MathJax.typeset();
    };

    fetch(mdPathPrimary)
        .then(r => { if (!r.ok) throw new Error('primary not found'); return r.text(); })
        .then(renderMd)
        .catch(() => fetch(mdPathFallback).then(r => r.text()).then(renderMd).catch(err => console.error('Failed to load research content', err)));
});
