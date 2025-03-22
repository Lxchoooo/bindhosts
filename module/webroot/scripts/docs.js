import { linkRedirect, applyRippleEffect, toast, developerOption, learnMore, setupSwipeToClose } from './util.js';
import { translations } from './language.js';

/**
 * Fetch documents from a link and display them in the specified element
 * @param {string} link - Primary link to fetch the document
 * @param {string} fallbackLink - Fallback link if the primary link fails
 * @param {string} element - ID of the element to display the document content
 * @returns {void}
 */
function getDocuments(link, fallbackLink, element) {
    fetch(link)
        .then(response => {
            if (!response.ok) {
                return fetch(fallbackLink).then(fallbackResponse => {
                    if (!fallbackResponse.ok) {
                        throw new Error(`Fallback link failed with status ${fallbackResponse.status}`);
                    }
                    return fallbackResponse.text();
                });
            }
            return response.text();
        })
        .then(data => {
            window.linkRedirect = linkRedirect;
            marked.setOptions({
                sanitize: true,
                walkTokens(token) {
                    if (token.type === 'link') {
                        const href = token.href;
                        const text = token.text;
                        if (text === href) {
                            token.type = "html";
                            token.text = `<span><p class="ripple-element" id="copy-link">${text}</p></span>`;
                        } else {
                            token.href = "javascript:void(0);";
                            token.type = "html";
                            token.text = `<a href="javascript:void(0);" onclick="linkRedirect('${href}')">${text}</a>`;
                        }
                    }
                }
            });
            // For overlay content
            const docsContent = document.getElementById(element);
            docsContent.innerHTML = marked.parse(data);
            
            const aboutContent = document.getElementById('about-document-content');
            if (aboutContent) aboutContent.innerHTML = marked.parse(data);

            addCopyToClipboardListeners();
            applyRippleEffect();
        })
        .catch(error => {
            console.error('Error fetching documents:', error);
            document.getElementById(element).textContent = 'Failed to load content: ' + error.message;
        });
}

/**
 * Add event listeners to copy link text to clipboard
 * @returns {void}
 */
function addCopyToClipboardListeners() {
    const sourceLinks = document.querySelectorAll("#copy-link");
    sourceLinks.forEach((element) => {
        element.addEventListener("click", function () {
            navigator.clipboard.writeText(element.innerText).then(() => {
                toast("Text copied to clipboard: " + element.innerText);
            }).catch(err => {
                console.error("Failed to copy text: ", err);
            });
        });
    });
}

// Setup documents menu
let activeDocs = null;

/**
 * Setup documents menu event listeners to open and close document overlays
 * @param {string} docsLang - Language code for the documents
 * @returns {Promise<void>}
 */
export async function setupDocsMenu(docsLang) {
    const docsData = {
        source: {
            link: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/sources_${docsLang}.md`,
            fallbackLink: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/sources.md`,
            element: 'source-content',
        },
        translate: {
            link: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/localize_${docsLang}.md`,
            fallbackLink: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/localize.md`,
            element: 'translate-content',
        },
        modes: {
            link: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/modes_${docsLang}.md`,
            fallbackLink: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/modes.md`,
            element: 'modes-content',
        },
        usage: {
            link: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/usage_${docsLang}.md`,
            fallbackLink: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/usage.md`,
            element: 'usage-content',
        },
        hiding: {
            link: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/hiding_${docsLang}.md`,
            fallbackLink: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/hiding.md`,
            element: 'hiding-content',
        },
        faq: {
            link: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/faq_${docsLang}.md`,
            fallbackLink: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/faq.md`,
            element: 'faq-content',
        },
    };

    // For document overlay
    const docsButtons = document.querySelectorAll(".docs-btn");
    const docsOverlay = document.querySelectorAll(".docs");

    docsButtons.forEach(button => {
        button.addEventListener("click", () => {
            const type = button.dataset.type;
            const overlay = document.getElementById(`${type}-docs`);
            if (type === 'modes' && developerOption && !learnMore) return;
            openOverlay(overlay);
            const { link, fallbackLink, element } = docsData[type] || {};
            getDocuments(link, fallbackLink, element);
        });
    });

    docsOverlay.forEach(overlay => {
        const closeButton = overlay.querySelector(".close-docs-btn");
        if (closeButton) {
            closeButton.addEventListener("click", () => closeOverlay(overlay));
        }
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                closeOverlay(overlay);
            }
        });
    });

    // For about content
    const aboutContent = document.querySelector('.document-content');
    const documentCover = document.querySelector('.document-cover');
    if (aboutContent) {
        const header = document.querySelector('.title-container');
        const title = document.getElementById('title');
        const backButton = document.getElementById('docs-back-btn');

        setupSwipeToClose(aboutContent, documentCover, backButton);

        // Attach click event to all about docs buttons
        document.querySelectorAll('.about-docs').forEach(element => {
            /** 
             * Manually listen to touch event to replace click event
             * Fix an issue caused by setupSwipeToClose
             * It could be an issue caused by momentum scrolling but currently I dont have a better workaround
            */
            let touchMoved = false;
            element.addEventListener('touchstart', () => touchMoved = false);
            element.addEventListener('touchmove', () => touchMoved = true);
            element.addEventListener('touchend', () => { if (!touchMoved) {
                document.getElementById('about-document-content').innerHTML = '';
                const { link, fallbackLink } = docsData[element.dataset.type] || {};
                getDocuments(link, fallbackLink, 'about-document-content');
                aboutContent.style.transform = 'translateX(0)';
                documentCover.style.opacity = '1';
                header.classList.add('back');
                backButton.style.transform = 'translateX(0)';
                const titleText = element.querySelector('.document-title').textContent;
                title.textContent = titleText;
            }});

            // Alternative way to close about docs with back button
            backButton.addEventListener('click', () => {
                aboutContent.style.transform = 'translateX(100%)';
                documentCover.style.opacity = '0';
                backButton.style.transform = 'translateX(-100%)';
                header.classList.remove('back');
                title.textContent = translations.more.title;
            });
        });
    } // End of about docs
}

/**
 * Open a document overlay
 * @param {HTMLElement} overlay - Overlay element to open
 * @returns {void}
 */
function openOverlay(overlay) {
    if (activeDocs) closeOverlay(activeDocs);
    activeDocs = overlay;
    document.body.style.overflow = "hidden";
    overlay.style.display = "flex";
    setTimeout(() => {
        overlay.style.opacity = "1";
    }, 10);
}

/**
 * Close a document overlay
 * @param {HTMLElement} overlay - Overlay element to close
 * @returns {void}
 */
function closeOverlay(overlay) {
    activeDocs = null;
    document.body.style.overflow = "";
    overlay.style.opacity = "0";
    setTimeout(() => {
        overlay.style.display = "none";
    }, 200);
}
