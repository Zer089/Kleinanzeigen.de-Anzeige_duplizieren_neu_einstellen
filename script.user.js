// ==UserScript==
// @name          Kleinanzeigen - Anzeige duplizieren / neu einstellen
// @namespace     https://github.com/Zer089/Kleinanzeigen.de-Anzeige_duplizieren_neu_einstellen
// @description   Bietet eine "Anzeige duplizieren / neu einstellen" Funktion beim Bearbeiten einer vorhandenen Anzeige in Kleinanzeigen.
// @icon          https://play-lh.googleusercontent.com/PuqeuAmOMsDoB9gRCVr-EQHthinCbtaKPzMbxabfmCY9RI9r1fmWncCb4k6umBszzPaszT_o2RopSpIhy9BAiQ=w240-h480-rw
// @copyright     2026, Andi (Zer089)
// @license       MIT
// @version       2.5.89
// @homepage      https://github.com/Zer089/Kleinanzeigen.de-Anzeige_duplizieren_neu_einstellen
// @updateURL     https://github.com/Zer089/Kleinanzeigen.de-Anzeige_duplizieren_neu_einstellen/raw/main/script.user.js
// @downloadURL   https://github.com/Zer089/Kleinanzeigen.de-Anzeige_duplizieren_neu_einstellen/raw/main/script.user.js
// @match         https://www.kleinanzeigen.de/*
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
    const isHomePage = window.location.pathname === '/' || window.location.pathname === '';
    const isSearchPage = window.location.pathname.startsWith('/s-') && !isDetailPage;
    const isMessagesPage = window.location.href.includes('m-nachrichten.html');

    const isWidePage = isOverviewPage || isHomePage || isSearchPage || isMessagesPage;

    if (isOverviewPage) document.documentElement.classList.add('is-overview-page');
    if (isDetailPage) document.documentElement.classList.add('is-detail-page');
    if (isEditPage) document.documentElement.classList.add('is-edit-page');
    if (isWidePage) document.documentElement.classList.add('is-wide-page');

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
        /* Werbe- & Upsell-Säuberung (Banner werden zusätzlich per JS aus dem DOM gelöscht) */
        fieldset:has(#ad-feature-group), span:has(> div.bg-accentContainer), #feature-offer-section,
        .site-base--left-banner--full, .site-base--right-banner--full,
        #vip-billboard, #vip-belly, #vip-middle, #vip-bottom, #btf-billboard, #home-billboard,
        #my-watchlist-atf, #my-msgbox-atf, #my-atf, .liberty-filled, .j-liberty-wrapper,
        [id^="vip-similar-ads-"], #pvap-featrs, .is-detail-page .icon-info-blue,
        .absolute.top-none.right-small.bottom-1\\/2, .absolute.bottom-none.top-1\\/2.right-small.pt-large,
        .absolute.top-none.left-small.bottom-1\\/2, .absolute.bottom-none.top-1\\/2.left-small.pt-large,
        .ad-module, div[data-testid*="banner"], div[data-testid*="ad-wrapper"],
        .mb-small:has(> .ad-module), .mb-small:has([id^="dfp-"]), li:has(> .ad-module),
        ul#srchrslt-adtable > li:has([data-liberty-position-name]), 
        ul#srchrslt-adtable > li:has([id^="srps-result-list"]),
        div.mx-auto.mb-small:has([data-liberty-position-name]):not(:has(#srchrslt-adtable)),
        div.mx-auto.mb-small:has([id^="srps-result-list"]):not(:has(#srchrslt-adtable)),
        li[id^="home-teaser-ads-"] { display: none !important; }

        section[data-testid="page-container"] { margin-bottom: 0px !important; }

        /* Das harte Grid von Kleinanzeigen aufbrechen (ersetzt 1fr 970px 1fr durch 1100px in der Mitte) */
        html.is-wide-page body .site-base,
        html.is-wide-page body .grid-cols-\\[1fr_970px_1fr\\] {
            grid-template-columns: 1fr minmax(auto, 1100px) 1fr !important;
        }

        /* Container-Breite anpassen und Zentrierung reparieren - Mit absoluter maximaler CSS-Spezifität! */
        html.is-wide-page body .site-base--content,
        html.is-wide-page body .l-page-wrapper,
        html.is-wide-page body .l-container,
        html.is-wide-page body .l-container-row,
        html.is-wide-page body .l-splitpage,
        html.is-wide-page body #site-content,
        html.is-wide-page body main#main,
        html.is-wide-page body #my-ads-frontend,
        html.is-wide-page body [data-testid="site-content"],
        html.is-wide-page body .ownprofile-main,
        html.is-wide-page body [aria-labelledby="tabs-all"],
        html.is-wide-page body #tab-panel-all,
        html.is-wide-page body main .max-w-screen-custom {
            width: 100% !important;
            max-width: 1100px !important;
            margin-left: auto !important;
            margin-right: auto !important;
            box-sizing: border-box !important;
        }

        /* Feste 970px Container überschreiben (Nur im Inhaltsbereich, schützt den Header!) */
        html.is-wide-page body main .w-\\[970px\\],
        html.is-wide-page body main div[class*="w-[970px]"] {
            width: 100% !important;
            max-width: 1100px !important;
            margin-left: auto !important;
            margin-right: auto !important;
        }

        /* Startseiten-Feed und Suche Flexibilität (Löst den harten Tailwind-Lock wie w-[700px] und w-[728px]) */
        html.is-wide-page body #homepage-main,
        html.is-wide-page body #srchrslt-content,
        html.is-wide-page body main .w-\\[700px\\],
        html.is-wide-page body main .w-\\[728px\\],
        html.is-wide-page body main div[class*="w-[700px]"],
        html.is-wide-page body main main[class*="w-[728px]"],
        html.is-wide-page body #main > div:nth-child(2) {
            width: 100% !important;
            max-width: none !important;
            flex: 1 1 0% !important;
        }

        /* Verhindert das Ausbrechen der Anzeigenliste (1232px Bug) durch negative Tailwind-Margins */
        html.is-wide-page body ul#my-manageitems-adlist,
        html.is-wide-page body li[data-testid="ad-card"] {
            width: 100% !important;
            max-width: 1100px !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            box-sizing: border-box !important;
        }

        /* ----------------------------------------------------
           PROFIL-BOX CUSTOM FARBEN (Mockup Design)
           ---------------------------------------------------- */
        .badge-purple {
            background-color: #f3e8ff !important; 
            color: #6b21a8 !important; 
        }

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
        
        /* Grid Layout vom User erzwungen, falls Tailwind-Klasse bei Kleinanzeigen fehlt (Spalte 2 auf 570px verbreitert) */
        .custom-ad-grid {
            display: grid !important;
            width: 100% !important;
            grid-template-columns: 200px 570px auto !important;
        }

        /* Margin-Korrektur für die 3. Spalte (Footer-Div) */
        .custom-ad-grid .mt-xsmall {
            margin-top: 0px !important;
        }

        .is-overview-page ul:has(> li > a[href*="/p-anzeige-bearbeiten.html"]) {
            display: flex !important;
            flex-wrap: wrap !important;
            justify-content: flex-end !important; /* Buttons rechtsbündig in der 3. Spalte */
            align-content: flex-start !important;
            gap: 8px !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important; /* Zwingt den Container auf volle Breite, um flex-end zu garantieren */
        }
        
        .is-overview-page ul:has(> li > a[href*="/p-anzeige-bearbeiten.html"]) li {
            margin: 0 !important;
            width: auto !important;
        }

        .custom-buttons-wrapper {
            display: flex !important;
            gap: 8px !important;
            justify-content: flex-end !important; /* Buttons rechtsbündig */
            margin: 0 !important;
        }
        .is-overview-page .custom-buttons-wrapper { flex-basis: 100% !important; } /* Zwingt custom Buttons in eine neue Zeile */

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
            color: inherit !important; 
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
        const cacheKey = `__KL_AD_DETAILS_V10_${adId}`; 
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
            console.error('Fehler beim Abrufen der Inseratsdetails:', e);
            return null;
        }
    }

    const inject = () => {
        // --- DOM CLEANUP: Banner physisch entfernen ---
        const banners = document.querySelectorAll(`
            .site-base--left-banner--full, .site-base--right-banner--full,
            #btf-billboard, #home-billboard, #my-watchlist-atf, #my-msgbox-atf, #my-atf,
            .absolute.top-none.right-small.bottom-1\\/2, 
            .absolute.bottom-none.top-1\\/2.right-small.pt-large,
            .absolute.top-none.left-small.bottom-1\\/2, 
            .absolute.bottom-none.top-1\\/2.left-small.pt-large,
            ul#srchrslt-adtable > li:has([data-liberty-position-name]), 
            ul#srchrslt-adtable > li:has([id^="srps-result-list"]),
            div.mx-auto.mb-small:has([data-liberty-position-name]):not(:has(#srchrslt-adtable)),
            div.mx-auto.mb-small:has([id^="srps-result-list"]):not(:has(#srchrslt-adtable)),
            li[id^="home-teaser-ads-"]
        `);
        banners.forEach(b => b.remove());

        // --- NEUES PROFIL-LAYOUT INJECTOR ---
        if (isOverviewPage) {
            // Ermitteln des Original-Wrappers des Profils
            const headerTestId = document.querySelector('[data-testid="ownprofile-header"]');
            const profileBox = document.querySelector('.ownprofile-main') || (headerTestId ? headerTestId.parentElement : null);

            if (profileBox && !profileBox.dataset.mockupInjected) {
                profileBox.dataset.mockupInjected = 'true';

                try {
                    // 1. DATEN AUS ORIGINAL-DOM EXTRAHIEREN
                    const name = profileBox.querySelector('h1')?.textContent || '';
                    const userTypeEl = Array.from(profileBox.querySelectorAll('p, span')).find(el => el.textContent.includes('Privater Nutzer') || el.textContent.includes('Gewerblicher Nutzer'));
                    const userType = userTypeEl ? userTypeEl.textContent.trim() : 'Privater Nutzer';
                    
                    const avatarImg = profileBox.querySelector('img[src*="userportrait"]');
                    let avatarContent = name ? name.charAt(0).toUpperCase() : 'U';
                    if (avatarImg && avatarImg.src) {
                        avatarContent = `<img src="${avatarImg.src}" class="w-full h-full object-cover" />`;
                    }

                    // Badges extrahieren
                    const badges = [];
                    profileBox.querySelectorAll('.ownprofile-badges.userbadges li').forEach(li => {
                        const svg = li.querySelector('svg')?.outerHTML || '';
                        const text = li.textContent.trim();
                        if (text) badges.push({ svg, text });
                    });

                    // Spezielle Logik: "Antwortet..." Text kürzen
                    let replyBadge = badges.find(b => b.text.includes('Antwortet'));
                    if (replyBadge) {
                        const match = replyBadge.text.match(/(\d+)\s*(Stunden?|Minuten?|Tagen?|Wochen?)/i);
                        if (match) {
                            let val = match[1];
                            let type = match[2].toLowerCase();
                            let timeStr = '';
                            if (type.includes('stunde')) timeStr = val + 'h';
                            else if (type.includes('minute')) timeStr = val + 'm';
                            else if (type.includes('tag')) timeStr = val + (val === '1' ? ' Tag' : ' Tage');
                            else if (type.includes('woche')) timeStr = val + (val === '1' ? ' Woche' : ' Wochen');
                            replyBadge.text = `Antwortet innerhalb ${timeStr}`;
                        } else {
                            replyBadge.text = replyBadge.text.replace(/Antwortet in der Regel innerhalb von/i, 'Antwortet innerhalb').replace(/wenigen Minuten/i, '1m').trim();
                        }
                    }

                    // Footer Daten (Aktiv seit, Follower) extrahieren
                    let activeSince = 'Unbekannt';
                    let followerCount = '0';
                    profileBox.querySelectorAll('ul.text-onBackgroundSubdued li, .m-none.flex.text-onBackgroundSubdued li').forEach(li => {
                        if (li.textContent.includes('Aktiv')) activeSince = li.textContent.trim();
                        if (li.textContent.includes('Follower')) followerCount = li.textContent.replace(/\D/g, ''); 
                    });

                    // Stats (Online/Gesamt) extrahieren
                    let onlineCount = "0", totalCount = "0";
                    const trxEl = profileBox.querySelector('.user--trx-overview');
                    if (trxEl) {
                        const m1 = trxEl.textContent.match(/(\d+)\s*Anzeigen online/i);
                        const m2 = trxEl.textContent.match(/(\d+)\s*gesamt/i);
                        if (m1) onlineCount = m1[1];
                        if (m2) totalCount = m2[1];
                    }

                    // Links extrahieren
                    const salesLinkHref = profileBox.querySelector('a[href*="m-verkaufsuebersicht"]')?.href || '/m-verkaufsuebersicht.html';

                    // 2. ORIGINAL-INHALTE VERSTECKEN 
                    // (Wir löschen sie nicht, damit die React-Hintergrundprozesse nicht crashen)
                    Array.from(profileBox.children).forEach(child => {
                        child.style.display = 'none';
                    });

                    // 3. MOCKUP-LAYOUT BAUEN & INJIZIEREN
                    let badgesHtml = badges.map(b => {
                        let svgStr = b.svg;
                        if (svgStr) {
                            // Ersetzt bestehende Klassen im SVG durch unsere einheitlichen Tailwind-Klassen
                            svgStr = svgStr.replace(/class="[^"]*"/, 'class="w-3.5 h-3.5 shrink-0 fill-current block align-middle"');
                            if (!svgStr.includes('class=')) svgStr = svgStr.replace('<svg', '<svg class="w-3.5 h-3.5 shrink-0 fill-current block align-middle"');
                        }
                        return `<span class="badge-purple text-[11px] px-2 py-1 rounded-full font-semibold flex items-center gap-1 shadow-sm">${svgStr} ${b.text}</span>`;
                    }).join('');

                    const mockupDiv = document.createElement('div');
                    // Fügt die Klassen aus unserem HTML-Mockup hinzu
                    mockupDiv.className = "bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden mb-6 w-full";
                    mockupDiv.innerHTML = `
                        <div class="absolute top-0 left-0 w-full h-1 bg-[#86B817]"></div>
                        
                        <div class="flex-shrink-0">
                            <div class="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-3xl font-bold shadow-inner uppercase overflow-hidden">
                                ${avatarContent}
                            </div>
                        </div>

                        <div class="flex-1 flex flex-col gap-3 min-w-[300px]">
                            <div class="flex items-center gap-3">
                                <h1 class="text-2xl font-bold text-gray-900 leading-none m-0 p-0">${name}</h1>
                                <span class="bg-gray-100 text-gray-600 border border-gray-200 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5">
                                    <svg class="w-3.5 h-3.5 shrink-0 fill-current block align-middle text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                    ${userType}
                                </span>
                            </div>

                            <div class="flex flex-wrap gap-2">
                                ${badgesHtml}
                            </div>

                            <div class="flex items-center gap-4 text-[13px] text-gray-500 mt-1">
                                <span class="flex items-center gap-1.5">
                                    <svg class="w-4 h-4 shrink-0 fill-current block align-middle text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                                    ${activeSince}
                                </span>
                                <span class="text-gray-300">|</span>
                                <span class="flex items-center gap-1.5 hover:text-gray-800 cursor-pointer transition-colors">
                                    <svg viewBox="0 0 24 24" fill="none" data-title="followers" stroke="none" role="img" aria-hidden="true" focusable="false" class="w-4 h-4 shrink-0 fill-current block align-middle text-gray-500"><path d="M14 6C14 4.89543 13.1046 4 12 4C10.8955 4 10 4.89543 10 6C10 7.10457 10.8955 8 12 8C13.1046 8 14 7.10457 14 6ZM16 6C16 8.20914 14.2092 10 12 10C9.79089 10 8.00002 8.20914 8.00002 6C8.00002 3.79086 9.79089 2 12 2C14.2092 2 16 3.79086 16 6Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M11.9991 11C13.5893 11 15.0929 11.3718 16.4278 12.0322C16.6155 12.0108 16.8066 12 17 12C19.7614 12.0001 22 14.2386 22 17C22 19.7614 19.7614 21.9999 17 22C14.2386 22 12 19.7614 12 17C12 15.4765 12.6813 14.1124 13.7559 13.1953C13.1906 13.0686 12.6026 13 11.9991 13C8.22844 13.0002 5.06732 15.609 4.22172 19.1201C4.10212 19.6168 3.67788 20 3.16703 20C2.56824 20 2.0964 19.481 2.22172 18.8955C3.18829 14.3834 7.19839 11.0002 11.9991 11ZM19.4756 14.8701C18.7952 14.2082 17.5013 14.4485 17 15.4756C16.5013 14.4485 15.205 14.2083 14.5245 14.8701C13.844 15.5325 13.8262 16.5958 14.4707 17.2793L14.4688 17.2803L17 20L19.5313 17.2803L19.5293 17.2793C20.1738 16.5958 20.1559 15.5325 19.4756 14.8701Z" fill="currentColor"></path></svg>
                                    <strong class="text-gray-700">${followerCount}</strong> Follower
                                </span>
                            </div>
                        </div>

                        <div class="flex flex-col sm:flex-row items-center gap-5 md:pl-6 md:border-l border-gray-200">
                            <div class="flex flex-col items-center">
                                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Anzeigen</span>
                                <div class="flex gap-4">
                                    <div class="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                        <span class="text-2xl font-black text-[#86B817] leading-none">${onlineCount}</span>
                                        <span class="text-[11px] text-gray-500 font-medium uppercase tracking-wider mt-1">Online</span>
                                    </div>
                                    <div class="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                        <span class="text-2xl font-black text-gray-700 leading-none">${totalCount}</span>
                                        <span class="text-[11px] text-gray-500 font-medium uppercase tracking-wider mt-1">Gesamt</span>
                                    </div>
                                </div>
                            </div>

                            <div class="hidden sm:block w-px h-12 bg-gray-200"></div>
                            <div class="sm:hidden w-full h-px bg-gray-200"></div>

                            <div class="flex flex-col gap-2">
                                <a href="${salesLinkHref}" class="flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-[#5A33AE] hover:text-[#5A33AE] text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition-all group no-underline">
                                    <svg viewBox="0 0 24 24" fill="none" data-title="transactionsOverview" stroke="none" role="img" aria-hidden="true" focusable="false" class="w-5 h-5 text-gray-400 group-hover:text-[#5A33AE] shrink-0 fill-current block align-middle transition-colors"><path d="M8 8C8.55229 8 9 7.55228 9 7 9 6.44772 8.55229 6 8 6 7.44772 6 7 6.44772 7 7 7 7.55228 7.44772 8 8 8ZM8 12C8.55229 12 9 11.5523 9 11 9 10.4477 8.55229 10 8 10 7.44772 10 7 10.4477 7 11 7 11.5523 7.44772 12 8 12ZM9 15C9 15.5523 8.55229 16 8 16 7.44772 16 7 15.5523 7 15 7 14.4477 7.44772 14 8 14 8.55229 14 9 14.4477 9 15ZM11 6C10.4477 6 10 6.44772 10 7 10 7.55228 10.4477 8 11 8H16C16.5523 8 17 7.55228 17 7 17 6.44772 16.5523 6 16 6H11ZM10 11C10 10.4477 10.4477 10 11 10H16C16.5523 10 17 10.4477 17 11 17 11.5523 16.5523 12 16 12H11C10.4477 12 10 11.5523 10 11ZM11 14C10.4477 14 10 14.4477 10 15 10 15.5523 10.4477 16 11 16H16C16.5523 16 17 15.5523 17 15 17 14.4477 16.5523 14 16 14H11Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M18.7071 21.2929C18.3166 21.6834 17.6834 21.6834 17.2929 21.2929L16 20L14.7071 21.2929L13.2929 21.2929L12 20L10.7071 21.2929H9.29289L8 20L6.7062 21.2938C6.3156 21.6834 5.68312 21.6831 5.29289 21.2929L4.29289 20.2929C4.10536 20.1054 4 19.851 4 19.5858V4C4 2.89543 4.89543 2 6 2H18C19.1046 2 20 2.89543 20 4V19.5858C20 19.851 19.8946 20.1054 19.7071 20.2929L18.7071 21.2929ZM14 19.1716L12 17.1716L10 19.1716L8 17.1716L6 19.1716V4H18V19.1716L16 17.1716L14 19.1716Z" fill="currentColor"></path><path d="M10.7063 21.2937 10.7071 21.2929 13.2929 21.2929 13.2937 21.2937 10.7063 21.2937ZM14.7063 21.2937 14.7071 21.2929 17.2929 21.2929 14.7063 21.2937ZM13.2937 21.2937 14.7063 21.2937C14.316 21.6831 13.684 21.6831 13.2937 21.2937ZM10.7063 21.2937C10.3159 21.6826 9.68382 21.683 9.2937 21.2937L10.7063 21.2937Z" fill="currentColor"></path></svg>
                                Verkaufsübersicht
                            </a>
                            <a href="/m-einstellungen.html" class="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors no-underline">
                                <svg class="w-3.5 h-3.5 shrink-0 fill-current block align-middle text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                Profil-Einstellungen
                            </a>
                        </div>
                    </div>
                `;
                
                // Füge den neuen HTML-Block an den versteckten Original-Container an
                profileBox.appendChild(mockupDiv);
                
                // Native Tailwind Margin-Klassen des Original-Wrappers entfernen, damit unser Margin greift
                profileBox.classList.remove('gap-small'); 
                
                } catch(e) {
                    console.error("Fehler beim Ersetzen der Profil-Box:", e);
                }
            }
        }

        // --- BEARBEITEN/DUPLIZIEREN BUTTONS BEI ANZEIGEN ---
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

                // --- NEU: 3-SPALTEN GRID LAYOUT ---
                if (isOverviewPage) {
                    const card = container.closest('li[data-testid="ad-card"]');
                    if (card) {
                        const footer = card.querySelector('footer');
                        const infoCol = card.querySelector('.pl-medium.align-top');
                        
                        if (footer && infoCol) {
                            const mainWrapper = infoCol.parentElement;
                            
                            // Unnötige Werbesektion löschen
                            const featureSection = card.querySelector('#feature-offer-section');
                            if (featureSection) featureSection.remove();
                            
                            // Leeres Wrapper-Div von Kleinanzeigen aufspüren, bevor wir den Footer herausholen
                            const oldCardFooterWrapper = card.querySelector('.card-footer');

                            // Footer sicher in ein DIV umbauen, indem wir Nodes verschieben (erhält Klick-Events/React-Listener)
                            const newFooterDiv = document.createElement('div');
                            newFooterDiv.className = 'mt-xsmall';
                            while (footer.firstChild) {
                                newFooterDiv.appendChild(footer.firstChild);
                            }
                            
                            // Neues Grid auf den Haupt-Wrapper anwenden (Spalte 2 auf 570px vergrößert)
                            mainWrapper.className = "grid w-full grid-cols-[200px_570px_auto] custom-ad-grid";
                            
                            // Neues DIV als 3. Spalte in den Wrapper verschieben
                            mainWrapper.appendChild(newFooterDiv);

                            // Den nun leeren, alten <footer> Tag sauber entfernen
                            footer.remove();

                            // Alten Container löschen, wenn er leer ist
                            if (oldCardFooterWrapper) {
                                oldCardFooterWrapper.remove();
                            }
                        }
                    }
                }
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
                                        // Originale Liste (Besucher/Gemerkt)
                                        let statsUl = statsSection.querySelector('ul');
                                        if (!statsUl) {
                                            statsUl = document.createElement('ul');
                                            statsUl.className = 'm-none mb-xxsmall flex min-h-[22px] list-none gap-x-xsmall p-none';
                                            statsSection.appendChild(statsUl);
                                        }

                                        // Optische Ausrichtung der Besucher/Gemerkt Zeile
                                        statsUl.style.flexWrap = 'wrap';
                                        statsUl.style.rowGap = '4px';
                                        statsUl.style.columnGap = '12px';
                                        statsUl.style.marginBottom = '4px'; 

                                        Array.from(statsUl.querySelectorAll('li')).forEach(li => {
                                            li.style.display = 'flex';
                                            li.style.alignItems = 'center';
                                            li.style.gap = '4px';
                                        });

                                        // 2. Extrahiere "Endet am" aus dem Preis-Block oben und LÖSCHE es dort
                                        let endDateStr = "Unbekannt";
                                        const oldEndDateSpan = card.querySelector('.managead-listitem-enddate');
                                        if (oldEndDateSpan) {
                                            endDateStr = oldEndDateSpan.textContent.trim();
                                            const oldLi = oldEndDateSpan.closest('li');
                                            if (oldLi) oldLi.remove(); // Das alte <li> restlos löschen!
                                        }

                                        // Berechne Tage online
                                        let daysOnline = 1;
                                        if (details.date && details.date !== "Unbekannt") {
                                            const parts = details.date.split('.');
                                            if (parts.length === 3) {
                                                const createdDate = new Date(parts[2], parts[1] - 1, parts[0]);
                                                const today = new Date();
                                                const diffTime = Math.abs(today - createdDate);
                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                if(diffDays > 0) daysOnline = diffDays;
                                            }
                                        }

                                        // Berechne Durchschnitte
                                        let visitors = 0;
                                        let watchers = 0;
                                        const statItems = statsUl.querySelectorAll('li');
                                        statItems.forEach(li => {
                                            if(li.textContent.includes('Besucher')) {
                                                visitors = parseInt(li.textContent.replace(/\D/g, '')) || 0;
                                            }
                                            if(li.textContent.includes('gemerkt')) {
                                                watchers = parseInt(li.textContent.replace(/\D/g, '')) || 0;
                                            }
                                        });
                                    
                                        const avgVisitors = (visitors / daysOnline).toFixed(1).replace('.0', '').replace('.', ',');
                                        const avgWatchers = (watchers / daysOnline).toFixed(1).replace('.0', '').replace('.', ',');

                                        // Einheitliche Icon-Klasse ohne das fehlerhafte 'fill-current'
                                        const svgClass = "shrink-0 block align-middle w-medium h-medium text-onSurfaceNonessential";

                                        // 3. NEUE ZEILE 1 (Erstellt & Endet) erzeugen und VOR die Besucher-Liste setzen
                                        if (!statsSection.querySelector('.custom-dates-ul')) {
                                            const datesUl = document.createElement('ul');
                                            datesUl.className = 'm-none flex min-h-[22px] list-none gap-x-xsmall p-none custom-dates-ul';
                                            datesUl.style.flexWrap = 'wrap';
                                            datesUl.style.rowGap = '4px';
                                            datesUl.style.columnGap = '12px';
                                            datesUl.style.marginBottom = '4px'; // Abstand zur nächsten Zeile

                                            if (details.date) {
                                                datesUl.innerHTML += `
                                                    <li class="custom-stat-li" title="Erstellt am">
                                                        <span class="inline-block-icon" style="display: flex; align-items: center;">
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}">
                                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                                                <line x1="3" y1="10" x2="21" y2="10"></line>
                                                            </svg>
                                                        </span>
                                                        <span>${details.date}</span>
                                                    </li>
                                                `;
                                            }

                                            if (endDateStr !== "Unbekannt") {
                                                datesUl.innerHTML += `
                                                    <li class="custom-stat-li" title="Endet am">
                                                        <span class="inline-block-icon" style="display: flex; align-items: center;">
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}">
                                                                <circle cx="12" cy="12" r="10"></circle>
                                                                <polyline points="12 6 12 12 16 14"></polyline>
                                                            </svg>
                                                        </span>
                                                        <span class="managead-listitem-enddate">${endDateStr}</span>
                                                        <span style="margin-left: 8px; display: inline-flex; align-items: center; gap: 4px; color: #757575;">
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-small h-small"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                            ${daysOnline} Tage
                                                        </span>
                                                    </li>
                                                `;
                                            }
                                            
                                            // VOR die originale Besucher-Statistik einfügen
                                            statsSection.insertBefore(datesUl, statsUl);
                                        }

                                        // 4. Durchschnitte anfügen an Besucher-Statistik
                                        if (!statsSection.querySelector('.custom-avg-li')) {
                                            const avgLi = document.createElement('li');
                                            avgLi.className = 'custom-avg-li';
                                            avgLi.title = 'Besucher / Gemerkt pro Tag';
                                            avgLi.style.display = 'flex';
                                            avgLi.style.alignItems = 'center';
                                            avgLi.style.gap = '4px';
                                            avgLi.innerHTML = `
                                                <span class="inline-block-icon" style="display: flex; align-items: center;">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}">
                                                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                                        <polyline points="17 6 23 6 23 12"></polyline>
                                                    </svg>
                                                </span>
                                                <span>${avgVisitors} / ${avgWatchers}</span>
                                            `;
                                            statsUl.appendChild(avgLi);
                                        }

                                        // 5. NEUE ZEILE 3 (Ort) erzeugen und NACH der Besucher-Liste setzen
                                        if (details.location && !statsSection.querySelector('.custom-loc-ul')) {
                                            const locUl = document.createElement('ul');
                                            locUl.className = 'm-none flex min-h-[22px] list-none gap-x-xsmall p-none custom-loc-ul';
                                            locUl.style.flexWrap = 'wrap';
                                            locUl.style.rowGap = '4px';
                                            locUl.style.columnGap = '12px';

                                            locUl.innerHTML = `
                                                <li class="custom-stat-li" title="Ort">
                                                    <span class="inline-block-icon" style="display: flex; align-items: center;">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}">
                                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                            <circle cx="12" cy="10" r="3"></circle>
                                                        </svg>
                                                    </span>
                                                    <span>${details.location}</span>
                                                </li>
                                            `;
                                            
                                            // HINTER die originale Besucher-Statistik einfügen
                                            statsSection.appendChild(locUl);
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
                                            const span = document.createElement('span');
                                            span.className = 'custom-shipping-info';
                                            
                                            span.style.fontSize = '12px';
                                            span.style.fontWeight = 'normal';
                                            span.style.color = '#757575'; 
                                            span.style.marginLeft = '4px';
                                            span.textContent = details.shipping;
                                            
                                            priceEl.style.display = 'flex';
                                            priceEl.style.alignItems = 'baseline';
                                            priceEl.style.gap = '4px';
                                            priceEl.style.flexWrap = 'wrap'; 
                                            
                                            priceEl.appendChild(span);
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
                topContainer.style.top = '0px';
                topContainer.style.bottom = '0px';
                topContainer.style.transform = 'translateX(-50%)';
                topContainer.style.zIndex = '10';
                topContainer.style.display = 'flex';
                topContainer.style.alignItems = 'center';

                const header = document.getElementById('my-ads-header');
                if (header) {
                    const headerFlexBox = header.closest('.flex.flex-row.justify-between') || header.parentElement;
                    headerFlexBox.style.display = 'flex';
                    headerFlexBox.style.alignItems = 'center';
                    headerFlexBox.style.position = 'relative'; 
                    headerFlexBox.style.height = '40px';
                    
                    header.style.marginBottom = '0px';
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
