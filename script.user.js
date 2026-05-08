// ==UserScript==
// @name          Kleinanzeigen - Anzeige duplizieren / neu einstellen
// @namespace     https://github.com/Zer089/Kleinanzeigen.de-Anzeige_duplizieren_neu_einstellen
// @description   Bietet eine "Anzeige duplizieren / neu einstellen" Funktion beim Bearbeiten einer vorhandenen Anzeige in Kleinanzeigen.
// @icon          https://play-lh.googleusercontent.com/PuqeuAmOMsDoB9gRCVr-EQHthinCbtaKPzMbxabfmCY9RI9r1fmWncCb4k6umBszzPaszT_o2RopSpIhy9BAiQ=w240-h480-rw
// @copyright     2026, Andi (Zer089)
// @license       MIT
// @version       2.5.33
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

    // Klassen für seitenspezifisches CSS vergeben
    if (isOverviewPage) document.documentElement.classList.add('is-overview-page');
    if (isDetailPage) document.documentElement.classList.add('is-detail-page');
    if (isEditPage) document.documentElement.classList.add('is-edit-page');

    // ==========================================
    // TRACKING-BLOCKER (DevTools Fix)
    // ==========================================
    const blockedKeywords = ['liberty', 'kameleoon', 'pubads', 'gpt.js', 'conversion.js', 'ads.js'];
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
        
        /* Die Anzeigen-Karte als Ankerpunkt für absolute Positionierung setzen */
        .is-overview-page li[data-testid="ad-card"] {
            position: relative !important;
        }

        /* Befreit den Button-Footer und zwingt ihn kompromisslos nach oben rechts */
        .is-overview-page li[data-testid="ad-card"] .card-footer {
            position: absolute !important;
            top: 16px !important; 
            right: 16px !important;
            max-width: 50% !important; 
            z-index: 10 !important;
        }

        /* Überschreiben nerviger Margins von Kleinanzeigen */
        .is-overview-page li[data-testid="ad-card"] .card-footer footer {
            margin-top: 0 !important;
        }

        /* Die UL-Liste zu einer Flexbox machen, die sich rechts anordnet. */
        .is-overview-page ul:has(> li > a[href*="/p-anzeige-bearbeiten.html"]) {
            display: flex !important;
            flex-wrap: wrap !important;
            justify-content: flex-end !important;
            align-content: flex-start !important;
            gap: 8px !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        
        /* Die Listenelemente ihrer Standard-Abstände berauben */
        .is-overview-page ul:has(> li > a[href*="/p-anzeige-bearbeiten.html"]) li {
            margin: 0 !important;
            width: auto !important;
        }

        /* Zwingt unsere lila Buttons auf der Übersicht in eine komplett neue Zeile und setzt exakt 8px Abstand */
        .custom-buttons-wrapper {
            display: flex !important;
            gap: 8px !important;
            justify-content: flex-end !important;
            margin: 0 !important;
        }
        .is-overview-page .custom-buttons-wrapper {
            flex-basis: 100% !important; 
        }

        /* Strenge Zwangshöhe für die lila Buttons UND den neuen Verkaufsschild-Button auf der Übersicht */
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

        /* Styling für die neuen Metadaten (Datum & Ort) auf der Übersicht */
        .custom-ad-extra-info {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            font-size: 13px;
            color: #555;
            margin-top: 4px;
            align-items: center;
        }
        .custom-ad-extra-info-item {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        /* Styling für die Versandinfo neben dem Preis */
        .custom-shipping-info {
            font-size: 13px !important;
            color: #555 !important;
            font-weight: normal !important;
            white-space: nowrap;
        }

        /* ----------------------------------------------------
           2. DETAILSEITE & BEARBEITEN-SEITE
           ---------------------------------------------------- */
           
        /* Größere Button-Höhe für Detail- & Bearbeiten-Seite */
        .is-detail-page .custom-purple-btn, 
        .is-edit-page .custom-purple-btn {
            height: 44px !important;
            min-height: 44px !important;
            padding: 0 16px !important;
            font-size: 14px !important;
        }

        .is-detail-page #pvap-mngad-stats { width: 150px !important; }
        
        /* Umstyling der nativen Textlinks auf der Detailseite zu runden Buttons */
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

    // Holt unsichtbar die Metadaten einer Anzeige und speichert sie lokal zwischen
    async function fetchAdDetails(adUrl, adId) {
        const cacheKey = `__KL_AD_DETAILS_V2_${adId}`; // Cache-Key V2 wegen neuer Versand-Info
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached);

        try {
            const response = await fetch(adUrl);
            const html = await response.text();
            
            // HTML im Hintergrund analysieren ohne es anzuzeigen
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, '
