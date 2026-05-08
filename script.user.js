// ==UserScript==
// @name          Kleinanzeigen - Anzeige duplizieren / neu einstellen
// @namespace     https://github.com/Zer089/Kleinanzeigen.de-Anzeige_duplizieren_neu_einstellen
// @description   Bietet eine "Anzeige duplizieren / neu einstellen" Funktion beim Bearbeiten einer vorhandenen Anzeige in Kleinanzeigen.
// @icon          https://play-lh.googleusercontent.com/PuqeuAmOMsDoB9gRCVr-EQHthinCbtaKPzMbxabfmCY9RI9r1fmWncCb4k6umBszzPaszT_o2RopSpIhy9BAiQ=w240-h480-rw
// @copyright     2026, Andi (Zer089)
// @license       MIT
// @version       2.5.38
// @homepage      https://github.com/Zer089/Kleinanzeigen.de-Anzeige_duplizieren_neu_einstellen
// @updateURL     https://github.com/Zer089/Kleinanzeigen.de-Anzeige_duplizieren_neu_einstellen/raw/main/script.user.js
// @downloadURL   https://github.com/Zer089/Kleinanzeigen.de-Anzeige_duplizieren_neu_einstellen/raw/main/script.user.js
// @match         https://www.kleinanzeigen.de/p-anzeige-bearbeiten.html*
// @match         https://www.kleinanzeigen.de/p-anzeige-aufgeben-bestaetigung.html*
// @match         https://www.kleinanzeigen.de/m-meine-anzeigen.html*
// @match         https://www.kleinanzeigen.de/s-anzeige/*
// @grant         none
// @run-at        document-start
// ==/UserScript==

(function () {
    'use strict';

    // Seitenerkennung
    const isOverviewPage = window.location.href.includes('m-meine-anzeigen.html');
    const isEditPage = window.location.href.includes('p-anzeige-bearbeiten.html');
    const isConfirmPage = window.location.href.includes('bestaetigung.html');
    const isDetailPage = window.location.href.includes('/s-anzeige/');

    if (isOverviewPage) document.documentElement.classList.add('is-overview-page');
    if (isDetailPage) document.documentElement.classList.add('is-detail-page');
    if (isEditPage) document.documentElement.classList.add('is-edit-page');

    // ==========================================
    // TRACKING-BLOCKER
    // ==========================================
    const blockedKeywords = ['liberty', 'kameleoon', 'pubads', 'gpt.js', 'conversion.js', 'ads.js', 'prebid', 'casalemedia', 'criteo'];
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(document, tagName);
        if (typeof tagName === 'string' && tagName.toLowerCase() === 'script') {
            Object.defineProperty(element, 'src', {
                set: function(url) {
                    const urlString = url ? String(url) : '';
                    if (blockedKeywords.some(keyword => urlString.includes(keyword))) return; 
                    this.setAttribute('src', url);
                },
                get: function() { return this.getAttribute('src'); }
            });
        }
        return element;
    };

    // ==========================================
    // CSS INJECTION (Design & Layout)
    // ==========================================
    const style = document.createElement('style');
    style.textContent = `
        /* Werbe- & Upsell-Säuberung */
        fieldset:has(#ad-feature-group), span:has(> div.bg-accentContainer), #feature-offer-section,
        .site-base--left-banner, .site-base--right-banner, #vip-billboard, #vip-belly, #vip-middle, #vip-bottom,
        [id^="vip-similar-ads-"], #pvap-featrs, .is-detail-page .icon-info-blue { display: none !important; }

        section[data-testid="page-container"] { margin-bottom: 0px !important; }

        /* Basis-Design unserer lila Buttons */
        .custom-purple-btn {
            background-color: #5A33AE !important; 
            border-color: #5A33AE !important; 
            color: #ffffff !important;
            border-radius: 9999px !important;
            font-weight: bold !important; 
            cursor: pointer !important;
            display: inline-flex !important; 
            align-items: center !important; 
            justify-content: center !important;
            gap: 6px !important;
            border: 2px solid #5A33AE !important;
            text-decoration: none !important;
            transition: all 0.2s ease-in-out;
            box-sizing: border-box !important;
            margin: 0 !important; 
        }
        .custom-purple-btn:hover { 
            background-color: #D1C4E9 !important; 
            border-color: #D1C4E9 !important; 
            color: #5A33AE !important; 
        }

        /* ----------------------------------------------------
           1. ÜBERSICHTSSEITE ("Meine Anzeigen") 
           ---------------------------------------------------- */
        
        .is-overview-page li[data-testid="ad-card"] { position: relative !important; }

        .is-overview-page li[data-testid="ad-card"] .card-footer {
            position: absolute !important;
            top: 16px !important; 
            right: 16px !important;
            max-width: 50% !important; 
            z-index: 10 !important;
        }

        .is-overview-page li[data-testid="ad-card"] .card-footer footer { margin-top: 0 !important; }

        .is-overview-page ul:has(> li > a[href*="/p-anzeige-bearbeiten.html"]) {
            display: flex !important;
            flex-wrap: wrap !important;
            justify-content: flex-end !important;
            align-content: flex-start !important;
            gap: 8px !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        
        .is-overview-page ul:has(> li > a[href*="/p-anzeige-bearbeiten.html"]) li {
            margin: 0 !important;
            width: auto !important;
        }

        .custom-buttons-wrapper {
            display: flex !important;
            gap: 8px !important;
            justify-content: flex-end !important;
            margin: 0 !important;
        }
        .is-overview-page .custom-buttons-wrapper { flex-basis: 100% !important; }

        /* Strenge Zwangshöhe für Buttons */
        .is-overview-page .custom-purple-btn,
        .is-overview-page .custom-native-btn {
            height: 32px !important;
            min-height: 32px !important;
            max-height: 32px !important;
            padding: 0 12px !important;
            font-size: 13px !important;
            line-height: 1 !important;
            margin: 0 !important;
            box-sizing: border-box !important;
        }

        /* Styling für die Versandinfo neben dem Preis */
        .custom-shipping-info {
            font-size: 13px !important;
            color: #757575 !important;
            font-weight: normal !important;
            white-space: nowrap;
        }

        /* Styling für unsere neu verschobenen Statistik-Elemente (Ort, Datum) */
        .custom-stat-li {
            display: flex !important;
            align-items: center !important;
            gap: 4px !important;
            color: inherit !important; /* Erbt automatisch text-onSurfaceNonessential (Grau) vom Parent */
            white-space: nowrap;
        }

        /* ----------------------------------------------------
           2. DETAILSEITE & BEARBEITEN-SEITE
           ---------------------------------------------------- */
           
        .is-detail-page .custom-purple-btn, 
        .is-edit-page .custom-purple-btn {
            height: 44px !important;
            min-height: 44px !important;
            padding: 0 16px !important;
            font-size: 14px !important;
        }

        .is-detail-page #pvap-mngad-stats { width: 150px !important; }
        
        .is-detail-page .manageadbox--actions, .is-detail-page #pvap-mngad-actions {
            display: flex !important; flex-wrap: wrap !important; gap: 8px !important;
            justify-content: flex-end !important; list-style: none !important; margin-top: 15px !important;
        }
        .is-detail-page .manageadbox--actions a, .is-detail-page .manageadbox--actions button,
        .is-detail-page #pvap-mngad-actions a, .is-detail-page #pvap-mngad-actions button {
            display: inline-flex !important; align-items: center !important; height: 44px !important;
            padding: 0 16px !important; border-radius: 9999px !important; border: 2px solid #dcdcdc !important;
            background: transparent !important; color: #222 !important; font-weight: bold !important; text-decoration: none !important;
            box-sizing: border-box !important;
        }
    `;
    document.head ? document.head.appendChild(style) : document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));

    // ==========================================
    // UI FEEDBACK (Ladebildschirm)
    // ==========================================
    function showLoading() {
        if (document.getElementById('custom-loading-overlay')) return;
        const spinnerContainer = document.createElement("div");
        spinnerContainer.id = "custom-loading-overlay";
        Object.assign(spinnerContainer.style, {
            height: '100%', width: '100%', position: 'fixed', top: '0', left: '0',
            backdropFilter: 'blur(5px)', zIndex: '999999', display: 'flex',
            alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)'
        });
        spinnerContainer.innerHTML = '<div style="font-size: 20px; font-weight: bold; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); color: #86B817; text-align: center;">Aktion wird ausgeführt...<br><span style="font-size: 14px; color: #666; font-weight: normal; margin-top: 10px; display: block;">Bitte klicke nichts an. Die Seite lädt gleich neu.</span></div>';
        document.body.appendChild(spinnerContainer);
    }

    // ==========================================
    // BUTTON LOGIK & METADATEN FETCHING
    // ==========================================
    function createBtn(text, icon, click) {
        const b = document.createElement('button');
        b.className = 'custom-purple-btn';
        b.innerHTML = `<span>${icon}</span> <span>${text}</span>`;
        b.onclick = click;
        return b;
    }

    async function fetchAdDetails(adUrl, adId) {
        const cacheKey = `__KL_AD_DETAILS_V8_${adId}`; // Cache V8 für neues Statistik-Design
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached);

        try {
            const response = await fetch(adUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            const locationEl = doc.querySelector('#viewad-locality');
            const dateIcon = doc.querySelector('.icon-calendar-gray-simple');
            const shippingEl = doc.querySelector('.boxedarticle--details--shipping');
            
            let location = locationEl ? locationEl.textContent.replace(/\s+/g, ' ').trim() : 'Unbekannt';
            
            let date = 'Unbekannt';
            if (dateIcon && dateIcon.nextElementSibling) {
                date = dateIcon.nextElementSibling.textContent.trim();
            } else if (dateIcon && dateIcon.parentElement.textContent) {
                date = dateIcon.parentElement.textContent.replace(/\s+/g, ' ').trim();
            }

            let shipping = shippingEl ? shippingEl.textContent.trim() : '';

            const result = { location, date, shipping };
            sessionStorage.setItem(cacheKey, JSON.stringify(result));
            return result;
        } catch (e) {
            console.error('Fehler beim Abrufen der Inseratsdetails (CORS/Netzwerk blockiert?):', e);
            return null;
        }
    }

    const inject = () => {
        if (isOverviewPage || isDetailPage) {
            const editLinks = document.querySelectorAll('a[href*="/p-anzeige-bearbeiten.html"]');
            editLinks.forEach(link => {
                const container = link.closest('ul') || link.parentElement;
                if (!container || container.dataset.klInjected) return;
                
                const match = link.getAttribute('href').match(/adId=(\d+)/);
                if (!match) return;
                const adId = match[1];

                // --- DROP DOWN "MEHR" HACK & VERKAUFSSCHILD EINFÜGEN ---
                const mehrBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent.includes('Mehr'));
                if (mehrBtn) {
                    const mehrLi = mehrBtn.closest('li');
                    if (mehrLi) {
                        mehrLi.style.position = 'absolute';
                        mehrLi.style.opacity = '0';
                        mehrLi.style.pointerEvents = 'none';
                    }

                    const printLi = document.createElement(container.tagName === 'UL' ? 'li' : 'span');
                    printLi.style.margin = '0';

                    const printBtn = document.createElement('button');
                    printBtn.type = 'button';
                    printBtn.className = "inline-flex items-center justify-center gap-xsmall text-bodyRegularStrong box-border rounded-full cursor-pointer whitespace-nowrap no-underline hover:no-underline focus:outline-none focus-visible:outline-2 focus-visible:ring-2 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent focus-visible:ring-surface border-2 border-solid border-utility text-interactive h-xlarge min-h-xlarge min-w-xlarge w-fit bg-transparent hover:border-secondary hover:bg-secondaryContainer hover:text-onSecondaryContainer active:border-secondary active:bg-secondaryContainer active:text-onSecondaryContainer px-medium custom-native-btn";
                    printBtn.innerHTML = `
                        <div class="relative flex items-center justify-center">
                            <div class="flex items-center justify-center gap-xsmall">
                                <svg viewBox="0 0 24 24" fill="none" class="shrink-0 fill-current block align-middle w-medium h-medium">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M17 7V4H7V7H4C2.89543 7 2 7.89543 2 9V15H6V20H18V15H22V9C22 7.89543 21.1046 7 20 7H17ZM9 6H15V7H9V6ZM16 15V18H8V15H16ZM16 13H8C6.89543 13 6 12.1046 6 11C6 9.89543 6.89543 9 8 9H16C17.1046 9 18 9.89543 18 11C18 12.1046 17.1046 13 16 13ZM15 10H17V12H15V10Z" fill="currentColor"></path>
                                </svg>
                                <span>Verkaufsschild</span>
                            </div>
                        </div>`;

                    printBtn.onclick = async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
                        document.body.click();

                        const antiFlashStyle = document.createElement('style');
                        antiFlashStyle.id = 'hide-dropdown-flash';
                        antiFlashStyle.textContent = `
                            [role="menu"], [data-testid*="menu"], [id^="radix-"] { 
                                opacity: 0 !important; 
                                visibility: hidden !important; 
                                pointer-events: none !important;
                                transform: scale(0) !important;
                            }
                        `;
                        document.head.appendChild(antiFlashStyle);

                        await new Promise(r => setTimeout(r, 50));
                        mehrBtn.click(); 

                        let attempts = 0;
                        const interval = setInterval(() => {
                            attempts++;
                            
                            const menuId = mehrBtn.getAttribute('aria-controls');
                            let targetMenu = menuId ? document.getElementById(menuId) : null;
                            
                            if (!targetMenu) targetMenu = document.querySelector('[data-state="open"]');

                            if (targetMenu) {
                                const nativePrintBtn = Array.from(targetMenu.querySelectorAll('button, a, [role="menuitem"]'))
                                    .find(b => b.textContent.includes('Verkaufsschild') && b !== printBtn);

                                if (nativePrintBtn) {
                                    clearInterval(interval);
                                    nativePrintBtn.click(); 
                                    
                                    setTimeout(() => {
                                        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
                                        document.body.click(); 
                                        antiFlashStyle.remove();
                                    }, 100);
                                    return; 
                                }
                            }
                            
                            if (attempts > 30) {
                                clearInterval(interval);
                                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
                                document.body.click();
                                antiFlashStyle.remove();
                            }
                        }, 50);
                    };

                    printLi.appendChild(printBtn);
                    container.append(printLi);
                }

                // --- LILA CUSTOM BUTTONS ---
                const doAction = (e, type) => {
                    e.preventDefault();
                    localStorage.setItem('__KL_AUTO_ACTION', JSON.stringify({action: type, adId}));
                    window.location.href = link.href;
                };

                const wrapper = document.createElement(container.tagName === 'UL' ? 'li' : 'span');
                wrapper.className = 'custom-buttons-wrapper';
                
                wrapper.appendChild(createBtn('Duplizieren', '⧉', (e) => doAction(e, 'duplicate')));
                wrapper.appendChild(createBtn('Neu einstellen', '⟳', (e) => doAction(e, 'relist')));

                container.append(wrapper);
                container.dataset.klInjected = 'true';
            });
        }

        // --- BACKGROUND FETCH FÜR DATUM, ORT & VERSAND AUF ÜBERSICHTSSEITE ---
        if (isOverviewPage && !window.__KL_FETCHING_ADS) {
            const pendingCards = document.querySelectorAll('li[data-testid="ad-card"]:not([data-kl-details-injected])');
            if (pendingCards.length > 0) {
                window.__KL_FETCHING_ADS = true; 
                
                (async () => {
                    await new Promise(r => setTimeout(r, 800)); // Initiale Pause

                    for (const card of pendingCards) {
                        card.dataset.klDetailsInjected = 'pending'; 
                        
                        const titleLink = card.querySelector('a[href*="/s-anzeige/"]');
                        const editLink = card.querySelector('a[href*="adId="]');
                        
                        if (titleLink && editLink) {
                            const adUrl = titleLink.href;
                            const match = editLink.href.match(/adId=(\d+)/);
                            
                            if (match) {
                                const adId = match[1];
                                const details = await fetchAdDetails(adUrl, adId);
                                
                                if (details) {
                                    // 1. Hole die untere Statistik-Box ("Besucher" etc.)
                                    const statsSection = card.querySelector('section.text-onSurfaceNonessential');
                                    
                                    if (statsSection) {
                                        let statsUl = statsSection.querySelector('ul');
                                        if (!statsUl) {
                                            // Falls keine Statistik da war, baue die Liste nativgetreu auf
                                            statsUl = document.createElement('ul');
                                            statsUl.className = 'm-none mb-xxsmall flex min-h-[22px] list-none gap-x-xsmall p-none';
                                            statsSection.appendChild(statsUl);
                                        }

                                        // Marker setzen, damit wir nicht doppelt anhängen
                                        if (!statsUl.classList.contains('custom-stats-injected')) {
                                            statsUl.classList.add('custom-stats-injected');

                                            // Wir machen die Statistik-Liste mehrzeilenfähig und richten Abstände aus
                                            statsUl.style.flexWrap = 'wrap';
                                            statsUl.style.rowGap = '4px';
                                            statsUl.style.columnGap = '12px';

                                            // Bestehende native LIs perfekt auf der X-Achse zentrieren
                                            Array.from(statsUl.querySelectorAll('li')).forEach(li => {
                                                li.style.display = 'flex';
                                                li.style.alignItems = 'center';
                                                li.style.gap = '4px';
                                            });

                                            // 2. Wir pflücken das "Endet am" Datum aus dem ALTEN Container oben heraus
                                            let endDateStr = "Unbekannt";
                                            const oldEndDateSpan = card.querySelector('.managead-listitem-enddate');
                                            if (oldEndDateSpan) {
                                                endDateStr = oldEndDateSpan.textContent.trim();
                                                const oldLi = oldEndDateSpan.closest('li');
                                                if (oldLi) oldLi.remove(); // Komplettes <li> löschen, das "Endet am " enthielt
                                            }

                                            // Allgemeine SVG Klassen (Exakt wie Kleinanzeigen)
                                            const svgClass = "shrink-0 fill-current block align-middle w-medium h-medium text-onSurfaceNonessential";

                                            // 3. Ort anhängen
                                            if (details.location) {
                                                const liLoc = document.createElement('li');
                                                liLoc.className = 'custom-stat-li';
                                                liLoc.innerHTML = `
                                                    <span class="inline-block-icon">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}">
                                                            <title>Ort</title>
                                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                            <circle cx="12" cy="10" r="3"></circle>
                                                        </svg>
                                                    </span>
                                                    <span>${details.location}</span>
                                                `;
                                                statsUl.appendChild(liLoc);
                                            }

                                            // 4. Erstellt am anhängen
                                            if (details.date) {
                                                const liCreated = document.createElement('li');
                                                liCreated.className = 'custom-stat-li';
                                                liCreated.innerHTML = `
                                                    <span class="inline-block-icon">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}">
                                                            <title>Erstellt am</title>
                                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                                        </svg>
                                                    </span>
                                                    <span>${details.date}</span>
                                                `;
                                                statsUl.appendChild(liCreated);
                                            }

                                            // 5. Endet am NEU anhängen (jetzt im Statistik-Layout)
                                            if (endDateStr !== "Unbekannt") {
                                                const liEnd = document.createElement('li');
                                                liEnd.className = 'custom-stat-li';
                                                liEnd.innerHTML = `
                                                    <span class="inline-block-icon">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}">
                                                            <title>Endet am</title>
                                                            <circle cx="12" cy="12" r="10"></circle>
                                                            <polyline points="12 6 12 12 16 14"></polyline>
                                                        </svg>
                                                    </span>
                                                    <span class="managead-listitem-enddate">${endDateStr}</span>
                                                `;
                                                statsUl.appendChild(liEnd);
                                            }
                                        }
                                    }

                                    // 6. Versandkosten neben dem Preis platzieren
                                    if (details.shipping) {
                                        let priceEl = card.querySelector('.text-title3');
                                        
                                        if (!priceEl) {
                                            priceEl = Array.from(card.querySelectorAll('li, p, span, div')).find(el => 
                                                (el.textContent.includes('€') || el.textContent.includes('VB')) &&
                                                !el.classList.contains('custom-shipping-info') &&
                                                el.children.length === 0
                                            );
                                        }

                                        if (priceEl && !priceEl.querySelector('.custom-shipping-info')) {
                                            const shipSpan = document.createElement('span');
                                            shipSpan.className = 'custom-shipping-info';
                                            
                                            shipSpan.style.fontSize = '12px';
                                            shipSpan.style.fontWeight = 'normal';
                                            shipSpan.style.color = '#757575'; 
                                            shipSpan.style.marginLeft = '4px';
                                            shipSpan.textContent = details.shipping;
                                            
                                            priceEl.style.display = 'flex';
                                            priceEl.style.alignItems = 'baseline';
                                            priceEl.style.gap = '4px';
                                            priceEl.style.flexWrap = 'wrap'; 
                                            
                                            priceEl.appendChild(shipSpan);
                                        }
                                    }
                                }
                            }
                        }
                        await new Promise(r => setTimeout(r, 400)); 
                    }
                    window.__KL_FETCHING_ADS = false;
                })();
            }
        }

        // --- LOGIK FÜR DIE BEARBEITEN-SEITE ---
        if (isEditPage) {
            const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Anzeige speichern'));
            if (!saveBtn) return;
            
            const container = saveBtn.closest('.flex.gap-small') || saveBtn.parentElement;
            if (!container || container.dataset.klInjected) return;

            const urlParams = new URLSearchParams(window.location.search);
            const currentAdId = urlParams.get('adId');
            if (!currentAdId) return;

            const doAction = (e, type) => {
                e.preventDefault(); e.stopPropagation();
                window.__KL_ACTION = type;
                window.__KL_OLD_AD_ID = currentAdId;
                showLoading();
                saveBtn.click();
                
                setInterval(() => {
                    const skip = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Ohne Hochschieben weiter'));
                    if (skip) skip.click();
                }, 200);
            };

            const btnDup = createBtn('Duplizieren', '⧉', (e) => doAction(e, 'duplicate'));
            const btnRelist = createBtn('Neu einstellen', '⟳', (e) => doAction(e, 'relist'));

            saveBtn.after(btnDup, btnRelist);
            container.dataset.klInjected = 'true';
        }
    };
    
    setInterval(inject, 500);

    // ==========================================
    // PAGINIERUNG (Übersicht) SYNC & ZENTRIERUNG
    // ==========================================
    if (isOverviewPage) {
        
        function getBottomNavContainer() {
            const navs = Array.from(document.querySelectorAll('nav'));
            for (const nav of navs) {
                const span = nav.querySelector('span.sr-only');
                if (span && span.textContent.includes('Seiten-Navigation')) {
                    if (!nav.closest('#custom-top-pagination')) {
                        return nav.parentElement; 
                    }
                }
            }
            return null;
        }

        setInterval(() => {
            const bottomContainer = getBottomNavContainer();
            if (!bottomContainer) return;

            const currentHTML = bottomContainer.innerHTML;
            let topContainer = document.getElementById('custom-top-pagination');

            if (!topContainer) {
                topContainer = document.createElement('div');
                topContainer.id = 'custom-top-pagination';
                
                topContainer.style.position = 'absolute';
                topContainer.style.left = '50%';
                topContainer.style.transform = 'translateX(-50%)';
                topContainer.style.zIndex = '10';

                const header = document.getElementById('my-ads-header');
                if (header) {
                    const headerFlexBox = header.parentElement;
                    headerFlexBox.style.display = 'flex';
                    headerFlexBox.style.alignItems = 'center';
                    headerFlexBox.style.position = 'relative'; 
                    header.after(topContainer);
                }

                topContainer.addEventListener('click', (e) => {
                    const btn = e.target.closest('button');
                    if (btn) {
                        e.preventDefault();
                        e.stopPropagation();
                        const cloneButtons = Array.from(topContainer.querySelectorAll('button'));
                        const idx = cloneButtons.indexOf(btn);
                        
                        const realNavContainer = getBottomNavContainer();
                        if (realNavContainer) {
                            const realButtons = Array.from(realNavContainer.querySelectorAll('button'));
                            if (realButtons[idx]) {
                                realButtons[idx].click();
                            }
                        }
                    }
                });
            }

            if (topContainer.dataset.sourceHtml !== currentHTML) {
                topContainer.dataset.sourceHtml = currentHTML;
                topContainer.innerHTML = currentHTML;
                topContainer.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
            }

        }, 500);
    }

    // ==========================================
    // AUTO-SAVE VERARBEITUNG
    // ==========================================
    if (isEditPage) {
        const config = JSON.parse(localStorage.getItem('__KL_AUTO_ACTION') || '{}');
        const currentId = new URLSearchParams(window.location.search).get('adId');
        if (config.adId === currentId) {
            localStorage.removeItem('__KL_AUTO_ACTION');
            window.addEventListener('load', () => {
                showLoading();
                setTimeout(() => {
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Anzeige speichern'));
                    if (btn) {
                        window.__KL_ACTION = config.action;
                        window.__KL_OLD_AD_ID = currentId;
                        btn.click();
                        setInterval(() => {
                            const skip = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Ohne Hochschieben weiter'));
                            if (skip) skip.click();
                        }, 200);
                    }
                }, 800);
            });
        }
    }

    // ==========================================
    // LÖSCHEN & NETWORK INTERCEPTOR
    // ==========================================
    if (isConfirmPage) {
        const delId = localStorage.getItem('__KL_PENDING_DELETE');
        if (delId) {
            const token = document.querySelector('meta[name="_csrf"]')?.content;
            fetch(`/m-anzeigen-loeschen.json?ids=${delId}`, { method: 'POST', headers: { 'x-csrf-token': token }})
            .then(() => localStorage.removeItem('__KL_PENDING_DELETE'));
        }
    }

    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        if (window.__KL_ACTION) {
            if (typeof args[0] === 'string') args[0] = args[0].replace('bearbeiten', 'aufgeben').replace(/adId=\d+/, '');
            if (args[1]?.body) {
                if (typeof args[1].body === 'string') args[1].body = args[1].body.replace(/adId=\d+/, '').replace(/"adId":\d+/, '');
                else if (args[1].body instanceof FormData) { args[1].body.delete('adId'); args[1].body.delete('id'); }
            }
            if (window.__KL_ACTION === 'relist') localStorage.setItem('__KL_PENDING_DELETE', window.__KL_OLD_AD_ID);
        }
        return originalFetch.apply(this, args);
    };

})();
