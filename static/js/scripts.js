

const content_dir = 'contents/'
const config_file = 'config.yml'
const research_cards_file = 'research_cards.yml'
const section_names = ['home', 'research', 'publications', 'awards']


window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        fetch(content_dir + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                document.getElementById(name + '-md').innerHTML = html;
            }).then(() => {
                // MathJax
                MathJax.typeset();
            })
            .catch(error => console.log(error));
    })

    // Research Cards (optional, dynamic from YAML)
    const cardsContainer = document.getElementById('research-cards');
    if (cardsContainer) {
        fetch(content_dir + research_cards_file)
            .then(r => r.text())
            .then(text => {
                let cfg;
                try { cfg = jsyaml.load(text); } catch (e) { console.error('YAML error', e); return; }
                const cards = (cfg && cfg.cards) ? cfg.cards : [];
                if (!Array.isArray(cards) || cards.length === 0) return;

                const row = document.createElement('div');
                row.className = 'row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4';
                cards.forEach(card => {
                    const col = document.createElement('div');
                    col.className = 'col';
                    const link = card.slug ? `research.html?topic=${encodeURIComponent(card.slug)}` : 'research.html';
                    const img = card.image || 'static/assets/img/background.jpeg';
                    const title = card.title || 'Research';
                    const excerpt = card.excerpt || '';
                    col.innerHTML = `
                        <div class="card h-100 shadow-sm">
                            <img src="${img}" class="card-img-top" alt="${title}">
                            <div class="card-body">
                                <h5 class="card-title">${title}</h5>
                                <p class="card-text">${excerpt}</p>
                                <a href="${link}" class="stretched-link text-primary">Read More &gt;&gt;</a>
                            </div>
                        </div>`;
                    row.appendChild(col);
                });
                cardsContainer.replaceChildren(row);
            })
            .catch(err => console.log('research_cards.yml not found or failed to load', err));
    }

}); 
