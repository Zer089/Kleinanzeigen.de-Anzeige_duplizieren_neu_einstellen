// ==UserScript==
// @name          Kleinanzeigen - Anzeige duplizieren / neu einstellen
// @namespace     https://github.com/Zer089/Kleinanzeigen.de-Anzeige_duplizieren_neu_einstellen
// @description   Bietet eine "Anzeige duplizieren / neu einstellen" Funktion beim Bearbeiten einer vorhandenen Anzeige in Kleinanzeigen.
// @icon          https://play-lh.googleusercontent.com/PuqeuAmOMsDoB9gRCVr-EQHthinCbtaKPzMbxabfmCY9RI9r1fmWncCb4k6umBszzPaszT_o2RopSpIhy9BAiQ=w240-h480-rw
// @copyright     2026, Andi (Zer089)
// @license       MIT
// @version       2.6.15
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
        /* Werbe- & Upsell-Säuberung */
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
        
        /* Allgemeine Abstands-Korrekturen nach Nutzer-Wunsch */
        .relative.mb-small.box-border.min-h-\\[10px\\].rounded-xsmall.text-onSurfaceSubdued { margin-bottom: 0px !important; }
        #tab-panel-all, [aria-labelledby="tabs-all"] { margin-top: 6px !important; }
        .text-left.text-bodySmall.text-onSurfaceNonessential { row-gap: 3px !important; }
        .mx-none.my-xsmall.text-title4 { margin-bottom: 6px !important; }
        .mx-none.my-xsmall.text-title3.text-secondary { margin-top: 0px !important; margin-bottom: 0px !important; }
        
        /* Container-Padding Fix */
        .jsx-1105488430.l-page-wrapper.l-container-row { padding-top: 12px !important; }
        .l-page-wrapper.l-container-row { padding-top: 20px !important; }

        /* Das harte Grid von Kleinanzeigen aufbrechen (ersetzt 1fr 970px 1fr durch 1100px) */
        html.is-wide-page body .site-base,
        html.is-wide-page body .grid-cols-\\[1fr_970px_1fr\\] {
            grid-template-columns: 1fr minmax(auto, 1100px) 1fr !important;
        }

        /* Container-Breite anpassen und zentrieren */
        html.is-wide-page body .site-base--content,
        html.is-wide-page body .l-page-wrapper,
        html.is-wide-page body .l-container,
        html.is-wide-page body .l-container-row,
        html.is-wide-page body .l-splitpage,
        html.is-wide-page body #site-content,
        html.is-wide-page body main#main,
        html.is-wide-page body #my-ads-frontend,
        html.is-wide-page body [data-testid="site-content"],
        html.is-wide-page body [aria-labelledby="tabs-all"],
        html.is-wide-page body #tab-panel-all,
        html.is-wide-page body main .max-w-screen-custom {
            width: 100% !important;
            max-width: 1100px !important;
            margin-left: auto !important;
            margin-right: auto !important;
            box-sizing: border-box !important;
        }

        /* Feste 970px Container überschreiben (schützt Header!) */
        html.is-wide-page body main .w-\\[970px\\],
        html.is-wide-page body main div[class*="w-[970px]"] {
            width: 100% !important;
            max-width: 1100px !important;
            margin-left: auto !important;
            margin-right: auto !important;
        }

        /* Startseiten-Feed Flexibilität */
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

        html.is-wide-page body ul#my-manageitems-adlist,
        html.is-wide-page body li[data-testid="ad-card"] {
            width: 100% !important;
            max-width: 1100px !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            box-sizing: border-box !important;
        }

        /* Titel (2-Zeilig) Umbruch FIX: Verdeckungen verhindern */
        .is-overview-page .custom-ad-grid .text-title4 {
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important; /* Auf 2 Zeilen limitiert für mehr Platz */
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: normal !important;
            line-height: 1.3 !important;
            flex-shrink: 0 !important; /* Verhindert das Stauchen durch die Flexbox */
        }
        
        /* Preis und Versand */
        .is-overview-page .custom-ad-grid .text-title3 {
            flex-shrink: 0 !important;
        }

        /* KATEGORIE LINK */
        .custom-category-link {
            color: inherit !important;
            text-decoration: underline !important;
            transition: color 0.2s;
            display: inline-flex !important;
            align-items: flex-start !important; /* Lupe oben fixieren bei Umbruch */
            gap: 4px !important;
        }
        .custom-category-link svg {
            flex-shrink: 0 !important; /* Lupe darf nicht gestaucht werden */
            margin-top: 1px !important; /* Optischer Ausgleich zur ersten Textzeile */
        }
        .custom-category-link:hover {
            color: #5A33AE !important;
        }

        /* ====================================================
           NEUES PROFIL DASHBOARD (MOCKUP STYLES)
           ==================================================== */
        .kl-hidden-original { display: none !important; }
        
        .ownprofile-main.custom-replaced {
            background: transparent !important;
            padding: 0 !important;
            margin-bottom: 0px !important;
            border: none !important;
            box-shadow: none !important;
        }

        .custom-profile-dashboard {
            display: flex;
            flex-direction: row;
            gap: 24px;
            background: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            padding: 16px !important;
            position: relative;
            overflow: hidden;
            align-items: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            box-sizing: border-box;
            width: 100%;
            height: 127px !important;
        }
        @media (max-width: 800px) {
            .custom-profile-dashboard { flex-direction: column; gap: 16px; height: auto !important; padding: 16px !important; align-items: flex-start; }
            .cpd-stats-actions-col { height: auto !important; }
        }
        .custom-profile-dashboard::before {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 4px;
            background-color: #86B817;
        }

        /* 1. Avatar Column */
        .cpd-avatar-col .user-profile-badge {
            width: 90px !important;
            height: 90px !important;
            border-radius: 50% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 32px !important;
            font-weight: bold !important;
            background: #e0e0e0 !important;
            color: #666 !important;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1) !important;
            margin: 0 !important;
            padding: 0 !important;
            line-height: normal !important;
        }
        .cpd-avatar-col img { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
        
        /* 2. Main Info Column */
        .cpd-info-col {
            flex: 1;
            min-width: 250px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            justify-content: center;
        }
        .cpd-name-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .cpd-name-row h2 { font-size: 24px !important; font-weight: 700 !important; color: #111 !important; margin: 0 !important; line-height: 1 !important; }
        
        .cpd-usertype-tag {
            background: #f5f5f5 !important; color: #444 !important; border: 1px solid #e0e0e0 !important;
            font-size: 12px !important; padding: 4px 10px !important; border-radius: 999px !important;
            font-weight: 600 !important; display: flex !important; align-items: center !important; gap: 6px !important;
        }
        .cpd-usertype-tag svg { width: 14px !important; height: 14px !important; }
        
        .cpd-badges-row { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; margin: 0; padding: 0; }
        .custom-badge-wrapper { margin: 0 !important; padding: 0 !important; }
        
        /* Einheitliches Layout für ALLE Badges (Button & Span) */
        .custom-badge-item {
            background-color: #f3e8ff !important; color: #6b21a8 !important; font-size: 11px !important;
            padding: 0 8px !important; border-radius: 9999px !important; font-weight: 400 !important;
            display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 4px !important;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important; white-space: nowrap;
            border: none !important; font-family: inherit !important;
            height: 24px !important; min-height: 24px !important; line-height: 1 !important; box-sizing: border-box !important;
            transition: background-color 0.2s !important;
        }
        .custom-badge-item svg { width: 14px !important; height: 14px !important; flex-shrink: 0 !important; }
        
        /* Spezifische Button-Klassen (Klickbar) */
        button.custom-badge-item { cursor: pointer !important; }
        button.custom-badge-item:hover { background-color: #e9d5ff !important; text-decoration: underline !important; }
        
        /* Spezifische Span-Klassen (Nur Info) */
        span.custom-badge-item { cursor: default !important; }
        span.custom-badge-item:hover { text-decoration: underline !important; }

        /* PERFEKTE VERTIKALE AUSRICHTUNG FÜR ICONS/TEXT IM FOOTER */
        .cpd-footer-row { display: flex !important; align-items: center !important; flex-wrap: wrap !important; gap: 16px !important; font-size: 13px !important; color: #757575 !important; margin-top: 4px !important; }
        .cpd-footer-item { display: inline-flex !important; align-items: center !important; gap: 6px !important; height: 16px !important; }
        .cpd-footer-item svg { width: 16px !important; height: 16px !important; display: block !important; margin: 0 !important; padding: 0 !important; flex-shrink: 0 !important; }
        .cpd-footer-item-text { display: inline-flex !important; align-items: center !important; height: 16px !important; line-height: 1 !important; transform: translateY(1px); /* Optischer Ausgleich für Baseline */ }
        
        .cpd-footer-item a { color: #111 !important; font-weight: normal !important; text-decoration: none !important; display: inline-flex !important; align-items: center !important; gap: 4px !important; }
        .cpd-footer-item a:hover { text-decoration: underline !important; }
        
        /* Custom Farben und Hover für Follower-Element */
        .cpd-footer-item.follower-item, .cpd-footer-item.follower-item svg { color: rgb(50, 105, 22) !important; }
        .cpd-footer-item.follower-item a { color: rgb(50, 105, 22) !important; text-decoration: none !important; }
        .cpd-footer-item.follower-item a span { text-decoration: none !important; font-weight: normal !important; }
        .cpd-footer-item.follower-item a:hover { text-decoration: underline !important; }

        /* 3. Stats & Actions Column */
        .cpd-stats-actions-col {
            display: flex; align-items: center; gap: 24px; border-left: 1px solid #e0e0e0; padding-left: 24px;
            height: 90px !important;
        }
        @media (max-width: 800px) {
            .cpd-stats-actions-col { border-left: none; border-top: 1px solid #e0e0e0; padding-left: 0; padding-top: 20px; flex-direction: row; flex-wrap: wrap; width: 100%; }
            .cpd-divider { display: none !important; }
        }
        
        .cpd-stats-block { display: flex; flex-direction: column; align-items: center; }
        .cpd-stats-title { font-size: 12px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .cpd-stats-tiles { display: flex; gap: 16px; }
        .cpd-tile { display: flex; flex-direction: column; align-items: center; padding: 8px 12px; border-radius: 8px; transition: background 0.2s; }
        .cpd-tile:hover { background: #f9f9f9; }
        .cpd-tile-val { font-size: 14px; font-weight: 900; line-height: 1; color: #444; }
        .cpd-tile-val.online { color: #86B817; }
        .cpd-tile-lbl { font-size: 11px; color: #757575; font-weight: 600; text-transform: uppercase; margin-top: 4px; }

        .cpd-divider { width: 1px; align-self: stretch; height: auto; background: #e0e0e0; }

        .cpd-actions-block { display: flex; flex-direction: column; gap: 8px; }
        .cpd-action-btn {
            display: flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important;
            border-radius: 8px !important; transition: all 0.2s !important; text-decoration: none !important;
            cursor: pointer !important; box-sizing: border-box !important;
        }
        .cpd-action-btn.primary {
            border: 2px solid #e0e0e0 !important; padding: 8px 16px !important; font-size: 14px !important;
            font-weight: 700 !important; color: #444 !important; background: #fff !important; height: 50px !important;
        }
        .cpd-action-btn.primary:hover { border-color: #5A33AE !important; color: #5A33AE !important; }
        .cpd-action-btn.primary svg { width: 20px !important; height: 20px !important; color: #999; transition: color 0.2s; }
        .cpd-action-btn.primary:hover svg { color: #5A33AE !important; }
        
        .cpd-action-btn.secondary { 
            background: transparent !important; 
            border: none !important; 
            font-size: 12px !important; 
            font-weight: 600 !important; 
            color: #999 !important; 
            padding: 4px !important; 
            height: 28px !important;
            line-height: 1 !important;
        }
        .cpd-action-btn.secondary:hover { color: #666 !important; }
        .cpd-action-btn.secondary svg { width: 14px !important; height: 14px !important; display: block; }

        /* ====================================================
           LILA BUTTONS BEI ANZEIGEN (Bearbeiten/Duplizieren)
           ==================================================== */
        .custom-purple-btn {
            background-color: #5A33AE !important; border-color: #5A33AE !important; color: #ffffff !important;
            border-radius: 9999px !important; font-weight: bold !important; cursor: pointer !important;
            gap: 6px !important; text-decoration: none !important;
            transition: all 0.2s ease-in-out; 
        }
        .custom-purple-btn:hover { background-color: #D1C4E9 !important; border-color: #D1C4E9 !important; color: #5A33AE !important; }

        /* NEU: 6-Spalten Grid (Bild | Infos | Trenn | Analyse | Trenn | Buttons) */
        .custom-ad-grid { 
            display: grid !important; 
            width: 100% !important; 
            grid-template-columns: 200px auto 1px 260px 1px 240px !important; 
            column-gap: 18px !important;
        }
        
        /* Einheitliche Höhen für die Anzeigenspalten und das Vorschaubild */
        .custom-ad-grid > div:first-child a,
        .custom-ad-grid .pl-medium.align-top,
        .custom-stats-area.align-top,
        .mt-xsmall.custom-action-area {
            height: 130px !important;
            box-sizing: border-box !important;
        }

        .custom-ad-grid .mt-xsmall { margin-top: 0px !important; }
        
        /* Überschreibt das originale Padding der Info-Spalte und macht sie zur Flexbox für vertikale Ausrichtung */
        .custom-ad-grid .pl-medium.align-top { 
            padding-left: 0px !important; 
            display: flex !important;
            flex-direction: column !important;
        }

        /* Buttons-Liste in der Action Area (Spalte 6) Layout Fixes */
        .is-overview-page ul:has(> li > a[href*="/p-anzeige-bearbeiten.html"]),
        .flex.list-none.flex-row.flex-wrap.p-none {
            display: flex !important; flex-wrap: wrap !important; justify-content: flex-end !important;
            align-content: flex-start !important; column-gap: 8px !important; row-gap: 6px !important; 
            margin: 0 !important; padding: 0 !important; width: 100% !important; 
        }
        .is-overview-page ul:has(> li > a[href*="/p-anzeige-bearbeiten.html"]) li,
        .flex.list-none.flex-row.flex-wrap.p-none li { 
            margin: 0 !important; width: auto !important; 
        }

        /* EINHEITLICHE GRÖSSE FÜR ALLE BUTTONS IN SPALTE 6 (Native und Custom) */
        .is-overview-page .custom-action-area a,
        .is-overview-page .custom-action-area button,
        .is-overview-page .custom-purple-btn, 
        .is-overview-page .custom-native-btn {
            height: 28px !important; min-height: 28px !important; max-height: 28px !important;
            padding: 0 12px !important; font-size: 12px !important; line-height: 1 !important; margin: 0 !important; 
            box-sizing: border-box !important; border-width: 2px !important;
            display: inline-flex !important; align-items: center !important; justify-content: center !important;
        }
        
        /* Icon Skalierung für native Buttons auf 28px Höhe */
        .is-overview-page .custom-action-area a svg,
        .is-overview-page .custom-action-area button svg {
            width: 14px !important; height: 14px !important;
        }

        /* Erzwinge Schriftgröße 12px für alle Text-Elemente innerhalb der Action Area Buttons */
        .custom-action-area button *, .custom-action-area a * {
            font-size: 12px !important;
        }

        .custom-shipping-info { font-size: 13px !important; color: #757575 !important; font-weight: normal !important; white-space: nowrap; }
        .custom-stat-li { display: flex !important; align-items: center !important; gap: 4px !important; color: inherit !important; white-space: nowrap; }

        .is-detail-page .custom-purple-btn, .is-edit-page .custom-purple-btn { height: 44px !important; min-height: 44px !important; padding: 0 16px !important; font-size: 14px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; border-width: 2px !important; border-style: solid !important; }
        .is-detail-page #pvap-mngad-stats { width: 150px !important; }
        .is-detail-page .manageadbox--actions, .is-detail-page #pvap-mngad-actions {
            display: flex !important; flex-wrap: wrap !important; gap: 8px !important; justify-content: flex-end !important; list-style: none !important; margin-top: 15px !important;
        }
        .is-detail-page .manageadbox--actions a, .is-detail-page .manageadbox--actions button,
        .is-detail-page #pvap-mngad-actions a, .is-detail-page #pvap-mngad-actions button {
            display: inline-flex !important; align-items: center !important; height: 44px !important; padding: 0 16px !important; border-radius: 9999px !important;
            border: 2px solid #dcdcdc !important; background: transparent !important; color: #222 !important; font-weight: bold !important; text-decoration: none !important; box-sizing: border-box !important;
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
        const cacheKey = `__KL_AD_DETAILS_V11_${adId}`; // Aktualisierter CacheKey wegen neuer Felder
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
            
            // --- NEU: Extrahieren des präzisen Kategorie-Slugs aus der Breadcrumb Navigation ---
            let catSlug = '';
            const breadcrumbLinks = doc.querySelectorAll('#viewad-breadcrumb a[href*="/s-"]');
            if (breadcrumbLinks.length > 0) {
                // Suche vom letzten Element rückwärts nach dem Link, der auf /c[Zahl] endet
                for (let i = breadcrumbLinks.length - 1; i >= 0; i--) {
                    const href = breadcrumbLinks[i].getAttribute('href');
                    const match = href.match(/\/s-([^/]+)\/c\d+/);
                    if (match) {
                        catSlug = match[1]; // e.g. "handy-telekom"
                        break;
                    }
                }
            }

            const result = { location, date, shipping, catSlug };
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

        // --- MOCKUP PROFIL REDESIGN INJECTOR ---
        if (isOverviewPage) {
            const profileBox = document.querySelector('.ownprofile-main');
            
            if (profileBox && !profileBox.dataset.redesignInjected) {
                
                // 1. ASYNCHRONES LADEN VON REACT ABWARTEN
                const nameEl = profileBox.querySelector('h2');
                const statsEl = profileBox.querySelector('[data-testid="posted-ads"]');
                const userInfoUl = profileBox.querySelector('[data-testid="user-info"]');

                // Name sicher auslesen (ohne das Original-DOM zu zerstören)
                let nameText = '';
                if (nameEl) {
                    const clone = nameEl.cloneNode(true);
                    const srOnly = clone.querySelector('.sr-only');
                    if (srOnly) srOnly.remove();
                    nameText = clone.textContent.trim();
                }

                // WAIT CONDITION: Breche Inject ab und warte auf den nächsten Interval-Tick, falls React noch lädt
                if (nameText.length === 0 || !statsEl || !userInfoUl) {
                    return; 
                }

                // Jetzt sind die Daten da -> wir legen los!
                profileBox.dataset.redesignInjected = 'true';

                try {
                    // 2. Verstecke die originale Struktur (um React nicht zu stören)
                    Array.from(profileBox.children).forEach(child => {
                        child.style.display = 'none';
                        child.classList.add('kl-hidden-original');
                    });

                    // 3. Extrahieren der Original-Daten und Nodes
                    
                    // Avatar
                    const avatarEl = profileBox.querySelector('.user-profile-badge') || profileBox.querySelector('img[src*="userportrait"]');
                    const avatarClone = avatarEl ? avatarEl.cloneNode(true) : null;

                    // User Infos (Typ, Aktiv seit, Antworten, Follower)
                    let userTypeHtml = '', activeSinceHtml = '', replyTimeHtml = '';
                    let followersA = null, followersSvg = null;

                    profileBox.querySelectorAll('[data-testid="user-info"] li').forEach(li => {
                        const txt = li.textContent.toLowerCase();
                        const svg = li.querySelector('svg');
                        
                        if (txt.includes('nutzer')) {
                            userTypeHtml = li.innerHTML; 
                        } else if (txt.includes('aktiv seit')) {
                            // Text und SVG trennen für perfekte Flex-Zentrierung
                            const text = li.textContent.trim();
                            activeSinceHtml = '';
                            if (svg) activeSinceHtml += svg.outerHTML;
                            activeSinceHtml += `<span class="cpd-footer-item-text">${text}</span>`;
                        } else if (txt.includes('antwortet')) {
                            let text = li.textContent.trim();
                            text = text.replace(/Antwortet in der Regel innerhalb von/i, 'Antwortet innerhalb');
                            text = text.replace(/Antwortet in der Regel nach/i, 'Antwortet nach');
                            
                            const match = text.match(/(\d+)\s*(Stunden?|Minuten?|Tagen?|Wochen?)/i);
                            if (match) {
                                let val = match[1]; 
                                let type = match[2].toLowerCase();
                                let timeStr = type.includes('stunde') ? val + 'h' : type.includes('minute') ? val + 'min' : val + (val === '1' ? ' Tag' : ' Tage');
                                text = text.replace(match[0], timeStr);
                            }
                            
                            // Text und SVG trennen für perfekte Flex-Zentrierung
                            replyTimeHtml = '';
                            if (svg) replyTimeHtml += svg.outerHTML;
                            replyTimeHtml += `<span class="cpd-footer-item-text">${text}</span>`;
                        } else if (txt.includes('follower')) {
                            followersSvg = svg ? svg.cloneNode(true) : null;
                            followersA = li.querySelector('a'); // Diesen Node VERSCHIEBEN wir später für die Funktionalität!
                        }
                    });

                    // Statistiken
                    let onlineCount = "0", totalCount = "0";
                    if (statsEl) {
                        const m1 = statsEl.textContent.match(/(\d+)\s*Anzeigen/i);
                        const m2 = statsEl.textContent.match(/(\d+)\s*gesamt/i);
                        if (m1) onlineCount = m1[1];
                        if (m2) totalCount = m2[1];
                    }

                    // Original Buttons (Werden verschoben, um Event-Listener zu erhalten)
                    const walletLink = profileBox.querySelector('a[href*="wallet.html"]'); 
                    const infoBtn = profileBox.querySelector('button[aria-label="Profilinformationen öffnen"]');

                    // ==========================================
                    // 4. Aufbau des neuen Dashboards
                    // ==========================================
                    const dashboard = document.createElement('div');
                    dashboard.className = 'custom-profile-dashboard';
                    
                    // --- Avatar Spalte ---
                    const colAvatar = document.createElement('div');
                    colAvatar.className = 'cpd-avatar-col';
                    if (avatarClone) {
                        // Originale Klassen bereinigen, damit unsere Custom CSS greift
                        avatarClone.className = 'user-profile-badge'; 
                        colAvatar.appendChild(avatarClone);
                    }
                    dashboard.appendChild(colAvatar);

                    // --- Hauptinfos Spalte ---
                    const colInfo = document.createElement('div');
                    colInfo.className = 'cpd-info-col';
                    
                    // Name & Typ
                    const rowName = document.createElement('div');
                    rowName.className = 'cpd-name-row';
                    const nameH2 = document.createElement('h2');
                    nameH2.textContent = nameText;
                    rowName.appendChild(nameH2);
                    
                    if (userTypeHtml) {
                        const typeSpan = document.createElement('span');
                        typeSpan.className = 'cpd-usertype-tag';
                        typeSpan.innerHTML = userTypeHtml;
                        rowName.appendChild(typeSpan);
                    }
                    colInfo.appendChild(rowName);

                    // Badges (Wir übernehmen die React-Nodes!)
                    const badgesRow = document.createElement('ul');
                    badgesRow.className = 'cpd-badges-row';
                    
                    const originalBadgeLis = profileBox.querySelectorAll('.ownprofile-badges.userbadges > li');
                    originalBadgeLis.forEach(li => {
                        li.className = 'custom-badge-wrapper'; // Neutralisiert Tailwind-Margins des LIs
                        
                        const btn = li.querySelector('button[data-testid="user-badge"]');
                        if (btn) {
                            btn.className = 'custom-badge-item'; // Überschreibt Button mit unserem Lila Layout
                            
                            const innerDiv = btn.querySelector('.ActivityIndicator');
                            if (innerDiv) {
                                innerDiv.className = ''; // Löscht die grauen Tailwind-Hintergründe etc.
                                innerDiv.style.display = 'flex';
                                innerDiv.style.alignItems = 'center';
                                innerDiv.style.justifyContent = 'center';
                                innerDiv.style.gap = '4px';
                            }
                            
                            const svg = btn.querySelector('svg');
                            if (svg) {
                                svg.classList.remove('w-small', 'h-small', 'text-onAccentContainer');
                            }
                            
                            const textEl = btn.querySelector('.ActivityIndicator--Name');
                            if (textEl) {
                                // Zeilenumbruch (z.B. TOP\nZufriedenheit) durch ein Leerzeichen ersetzen
                                textEl.textContent = textEl.textContent.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
                            }
                        }
                        
                        badgesRow.appendChild(li); // Verschiebt den Node INKLUSIVE Modal (<dialog>) in unser Dashboard!
                    });
                    
                    colInfo.appendChild(badgesRow);

                    // Footer Links (Aktiv, Antwortet, Follower)
                    const rowFooter = document.createElement('div');
                    rowFooter.className = 'cpd-footer-row';
                    
                    if (activeSinceHtml) {
                        const asSpan = document.createElement('span');
                        asSpan.className = 'cpd-footer-item';
                        asSpan.innerHTML = activeSinceHtml;
                        rowFooter.appendChild(asSpan);
                    }
                    
                    if (replyTimeHtml) {
                        const rtSpan = document.createElement('span');
                        rtSpan.className = 'cpd-footer-item';
                        rtSpan.innerHTML = replyTimeHtml;
                        rowFooter.appendChild(rtSpan);
                    }
                    
                    if (followersA) {
                        const folSpan = document.createElement('span');
                        folSpan.className = 'cpd-footer-item follower-item hoverable';
                        if (followersSvg) folSpan.appendChild(followersSvg);
                        
                        // Original A-Tag nehmen, Style-Klassen löschen und exakte Flex-Zentrierung anwenden
                        followersA.className = 'follower-link'; 
                        followersA.style.display = 'inline-flex';
                        followersA.style.alignItems = 'center';
                        followersA.style.gap = '4px';
                        
                        const numMatch = followersA.textContent.match(/(\d+)/);
                        if (numMatch) {
                            followersA.innerHTML = `<span class="cpd-footer-item-text"><strong>${numMatch[1]}</strong>&nbsp;Follower</span>`;
                        }
                        folSpan.appendChild(followersA); // Verschiebt den Original-Node!
                        rowFooter.appendChild(folSpan);
                    }
                    colInfo.appendChild(rowFooter);
                    
                    dashboard.appendChild(colInfo);

                    // --- Stats & Actions Spalte ---
                    const colStats = document.createElement('div');
                    colStats.className = 'cpd-stats-actions-col';
                    
                    colStats.innerHTML = `
                        <div class="cpd-stats-block">
                            <span class="cpd-stats-title">Anzeigen</span>
                            <div class="cpd-stats-tiles">
                                <div class="cpd-tile">
                                    <span class="cpd-tile-val online">${onlineCount}</span>
                                    <span class="cpd-tile-lbl">Online</span>
                                </div>
                                <div class="cpd-tile">
                                    <span class="cpd-tile-val">${totalCount}</span>
                                    <span class="cpd-tile-lbl">Gesamt</span>
                                </div>
                            </div>
                        </div>
                        <div class="cpd-divider"></div>
                    `;

                    const actionsBlock = document.createElement('div');
                    actionsBlock.className = 'cpd-actions-block';
                    
                    if (walletLink) {
                        const svg = walletLink.querySelector('svg');
                        walletLink.innerHTML = ''; // Originalen Ballast leeren
                        if (svg) {
                            svg.classList.remove('w-large', 'h-large');
                            walletLink.appendChild(svg);
                        }
                        const textSpan = document.createElement('span');
                        textSpan.textContent = 'Verkaufsübersicht';
                        walletLink.appendChild(textSpan);
                        walletLink.className = 'cpd-action-btn primary';
                        actionsBlock.appendChild(walletLink); // Verschiebt den Original-Node!
                    }

                    if (infoBtn) {
                        const settingsLink = document.createElement('a');
                        settingsLink.href = 'https://www.kleinanzeigen.de/m-einstellungen.html';
                        settingsLink.className = 'cpd-action-btn secondary';
                        settingsLink.target = '_self';
                        
                        // Generiere neues Zahnrad SVG-Icon
                        const gearSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        gearSvg.setAttribute("viewBox", "0 0 24 24");
                        gearSvg.setAttribute("fill", "none");
                        gearSvg.setAttribute("stroke", "currentColor");
                        gearSvg.setAttribute("stroke-width", "2");
                        gearSvg.setAttribute("stroke-linecap", "round");
                        gearSvg.setAttribute("stroke-linejoin", "round");
                        gearSvg.innerHTML = '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>';
                        gearSvg.style.width = '14px';
                        gearSvg.style.height = '14px';
                        settingsLink.appendChild(gearSvg);
                        
                        const textSpan = document.createElement('span');
                        textSpan.style.marginTop = '0px';
                        textSpan.style.height = '14px';
                        textSpan.textContent = 'Profil-Einstellungen';
                        settingsLink.appendChild(textSpan);
                        
                        actionsBlock.appendChild(settingsLink); 
                    }
                    
                    colStats.appendChild(actionsBlock);
                    dashboard.appendChild(colStats);

                    // 5. Das fertige Dashboard in die Original-Box kleben
                    profileBox.classList.add('custom-replaced');
                    profileBox.appendChild(dashboard);

                } catch(e) {
                    console.error("Fehler beim Erstellen des Dashboards:", e);
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
                let printLi;
                
                if (mehrBtn) {
                    const mehrLi = mehrBtn.closest('li');
                    if (mehrLi) {
                        mehrLi.style.position = 'absolute';
                        mehrLi.style.opacity = '0';
                        mehrLi.style.pointerEvents = 'none';
                    }

                    printLi = document.createElement(container.tagName === 'UL' ? 'li' : 'span');
                    // FIX: Verkaufsschild auf 100% Breite setzen, damit es eine eigene Zeile (vorletzte) bildet
                    printLi.style.margin = '0';
                    printLi.style.flexBasis = '100%';
                    printLi.style.display = 'flex';
                    printLi.style.justifyContent = 'flex-end';

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

                // Jeden Button in ein einzelnes li packen 
                // Da das Verkaufsschild 100% Breite beansprucht, fallen diese beiden automatisch nebeneinander in die letzte Zeile
                const liDup = document.createElement(container.tagName === 'UL' ? 'li' : 'span');
                liDup.style.margin = '0';
                liDup.appendChild(createBtn('Duplizieren', '⧉', (e) => doAction(e, 'duplicate')));

                const liRelist = document.createElement(container.tagName === 'UL' ? 'li' : 'span');
                liRelist.style.margin = '0';
                liRelist.appendChild(createBtn('Neu einstellen', '⟳', (e) => doAction(e, 'relist')));

                container.append(liDup, liRelist);
                container.dataset.klInjected = 'true';

                // --- NEU: 6-SPALTEN GRID LAYOUT (Bild | Infos | Trennlinie | Analyse | Trennlinie | Buttons) ---
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

                            // 1. Spalte 6 (Buttons) sicher in ein DIV umbauen
                            const newFooterDiv = document.createElement('div');
                            newFooterDiv.className = 'mt-xsmall custom-action-area';
                            // Flexbox-Styling zur vertikalen Zentrierung
                            newFooterDiv.style.display = 'flex';
                            newFooterDiv.style.flexDirection = 'column';
                            newFooterDiv.style.justifyContent = 'center';
                            newFooterDiv.style.height = '100%';
                            
                            while (footer.firstChild) {
                                newFooterDiv.appendChild(footer.firstChild);
                            }

                            // 2. Spalte 5 (Trennlinie rechts) erstellen
                            const dividerDiv2 = document.createElement('div');
                            dividerDiv2.style.background = '#e0e0e0';
                            dividerDiv2.style.width = '1px';
                            dividerDiv2.style.height = '130px'; // Fest auf 130px limitiert

                            // 3. Spalte 4 (Anzeigenanalyse) erstellen
                            const statsContainer = document.createElement('div');
                            statsContainer.className = 'custom-stats-area align-top';
                            statsContainer.style.display = 'flex';
                            statsContainer.style.flexDirection = 'column';
                            statsContainer.style.height = '100%';

                            // Titel "Anzeigenanalyse" hinzufügen und unterstreichen
                            const analyseHeader = document.createElement('div');
                            analyseHeader.className = 'mb-xsmall text-bodySmall text-onSurfaceNonessential';
                            analyseHeader.style.textDecoration = 'underline';
                            analyseHeader.textContent = 'Anzeigenanalyse';
                            statsContainer.appendChild(analyseHeader);

                            // WICHTIGER FIX: Den Statistik-Block suchen ODER neu erzeugen (falls Inserat 0 Views hat)
                            let statsSection = infoCol.querySelector('section.text-onSurfaceNonessential') || infoCol.querySelector('section[class*="text-onSurfaceNonessential"]');
                            if (!statsSection) {
                                statsSection = document.createElement('section');
                                statsSection.className = 'text-bodySmall text-onSurfaceNonessential';
                            }
                            
                            statsSection.style.marginTop = '0'; // Damit es bündig bleibt
                            statsSection.style.display = 'flex';
                            statsSection.style.flexDirection = 'column';
                            statsSection.style.gap = '12px'; // Erhöhter Zeilenabstand in der Anzeigeanalyse
                            statsSection.style.height = '100%';
                            statsContainer.appendChild(statsSection);

                            // 4. Spalte 3 (Trennlinie links) erstellen
                            const dividerDiv1 = document.createElement('div');
                            dividerDiv1.style.background = '#e0e0e0';
                            dividerDiv1.style.width = '1px';
                            dividerDiv1.style.height = '130px'; // Fest auf 130px limitiert
                            
                            // Neues Grid auf den Haupt-Wrapper anwenden (6 Spalten)
                            mainWrapper.className = "grid w-full custom-ad-grid";
                            
                            // Originalen Header der Info-Spalte suchen und (als optischen Platzhalter) ebenfalls unterstreichen. 
                            // Wird im Background Fetch mit einem interaktiven Kategorie-Link ersetzt.
                            const originalHeader = infoCol.querySelector('.mb-xsmall.text-bodySmall.text-onSurfaceNonessential');
                            if (originalHeader) {
                                originalHeader.style.textDecoration = 'underline';
                            }

                            // Elemente in der richtigen Reihenfolge einfügen
                            mainWrapper.appendChild(dividerDiv1);
                            mainWrapper.appendChild(statsContainer);
                            mainWrapper.appendChild(dividerDiv2);
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
                    try {
                        await new Promise(r => setTimeout(r, 800)); // Initiale Pause

                        for (const card of pendingCards) {
                            card.dataset.klDetailsInjected = 'pending'; 
                            
                            try {
                                const titleLink = card.querySelector('a[href*="/s-anzeige/"]');
                                const editLink = card.querySelector('a[href*="adId="]');
                                
                                if (titleLink && editLink) {
                                    const adUrl = titleLink.href;
                                    const match = editLink.href.match(/adId=(\d+)/);
                                    
                                    if (match) {
                                        const adId = match[1];
                                        const details = await fetchAdDetails(adUrl, adId);
                                        
                                        if (details) {
                                            const statsSection = card.querySelector('section.text-onSurfaceNonessential') || card.querySelector('section[class*="text-onSurfaceNonessential"]');
                                            const infoColTarget = card.querySelector('.custom-ad-grid > div:nth-child(2)');
                                            
                                            if (statsSection) {
                                                // Originale Liste (Besucher/Gemerkt) - kann bei 0 Views fehlen
                                                let statsUl = statsSection.querySelector('ul');
                                                if (!statsUl) {
                                                    statsUl = document.createElement('ul');
                                                    statsUl.className = 'm-none mb-xxsmall flex min-h-[22px] list-none p-none';
                                                    statsSection.appendChild(statsUl);
                                                }

                                                // Optische Ausrichtung
                                                statsUl.style.flexWrap = 'wrap';
                                                statsUl.style.rowGap = '8px'; // Ebenfalls leicht erhöhter Abstand hier
                                                statsUl.style.columnGap = '12px';
                                                statsUl.style.marginBottom = '0'; // Flex gap übernimmt jetzt die Steuerung

                                                Array.from(statsUl.querySelectorAll('li')).forEach(li => {
                                                    li.style.display = 'flex';
                                                    li.style.alignItems = 'center';
                                                    li.style.gap = '4px';
                                                });

                                                // 2. Extrahiere "Endet am" aus dem Preis-Block
                                                let endDateStr = "Unbekannt";
                                                const oldEndDateSpan = card.querySelector('.managead-listitem-enddate');
                                                if (oldEndDateSpan) {
                                                    endDateStr = oldEndDateSpan.textContent.trim();
                                                    const oldLi = oldEndDateSpan.closest('li');
                                                    if (oldLi) oldLi.remove(); 
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

                                                let daysColor = '#008000'; // Grün für < 30 Tage
                                                if (daysOnline >= 30 && daysOnline <= 49) {
                                                    daysColor = '#FFA500'; // Orange
                                                } else if (daysOnline >= 50) {
                                                    daysColor = '#FF0000'; // Rot
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

                                                const svgClass = "shrink-0 block align-middle text-onSurfaceNonessential";

                                                // 3. NEUE ZEILE 1 (Erstellt & Endet) erzeugen
                                                if (!statsSection.querySelector('.custom-dates-ul')) {
                                                    const datesUl = document.createElement('ul');
                                                    datesUl.className = 'm-none flex min-h-[22px] list-none gap-x-xsmall p-none custom-dates-ul';
                                                    datesUl.style.flexWrap = 'wrap';
                                                    datesUl.style.rowGap = '8px';
                                                    datesUl.style.columnGap = '12px';
                                                    datesUl.style.marginTop = '8px';

                                                    if (details.date) {
                                                        datesUl.innerHTML += `
                                                            <li class="custom-stat-li" title="Erstellt am">
                                                                <span class="inline-block-icon" style="display: flex; align-items: center; padding-bottom: 0px;">
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}" style="width: 16px !important; height: 16px !important;">
                                                                        <path d="m3 11 18-5v12L3 14v-3z"></path>
                                                                        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>
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
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}" style="width: 16px !important; height: 16px !important;">
                                                                        <circle cx="12" cy="12" r="10"></circle>
                                                                        <polyline points="12 6 12 12 16 14"></polyline>
                                                                    </svg>
                                                                </span>
                                                                <span class="managead-listitem-enddate">${endDateStr}</span>
                                                                <span title="Online seit" style="margin-left: 8px; display: inline-flex; align-items: center; gap: 4px; color: ${daysColor};">
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 block align-middle" style="width: 16px !important; height: 16px !important;">
                                                                        <rect x="3" y="2" width="18" height="18" rx="2" ry="2"></rect>
                                                                        <line x1="16" y1="1" x2="16" y2="6"></line>
                                                                        <line x1="8" y1="1" x2="8" y2="6"></line>
                                                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                                                    </svg>
                                                                    ${daysOnline === 1 ? '1 Tag' : daysOnline + ' Tage'}
                                                                </span>
                                                            </li>
                                                        `;
                                                    }
                                                    
                                                    statsSection.insertBefore(datesUl, statsUl);
                                                }

                                                // NEUE <ul> FÜR DIE DURSCHNITTE ERSTELLEN (Trennt Original und Kalkuliert)
                                                let avgUl = statsSection.querySelector('.custom-avg-ul');
                                                if (!avgUl) {
                                                    avgUl = document.createElement('ul');
                                                    avgUl.className = 'm-none flex min-h-[22px] list-none p-none custom-avg-ul';
                                                    avgUl.style.flexWrap = 'wrap';
                                                    avgUl.style.rowGap = '8px';
                                                    avgUl.style.columnGap = '12px';
                                                    statsUl.after(avgUl); // Wird direkt nach der originalen ul eingefügt
                                                }

                                                // 4. Durchschnitte splitten (Kombi-Icons als Nested-SVG näher zusammengerückt)
                                                if (!avgUl.querySelector('.custom-avg-visitors')) {
                                                    const avgVisLi = document.createElement('li');
                                                    avgVisLi.className = 'custom-avg-visitors custom-stat-li';
                                                    avgVisLi.title = 'Besucher pro Tag';
                                                    avgVisLi.style.display = 'flex';
                                                    avgVisLi.style.alignItems = 'center';
                                                    avgVisLi.style.gap = '4px';
                                                    
                                                    // Kombi-Icon: Auge (w=18, h=18) + Trend (x=7, y=9)
                                                    avgVisLi.innerHTML = `
                                                        <span class="inline-block-icon" style="display: flex; align-items: center; margin-left: 2px;">
                                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}">
                                                                <svg x="0" y="0" width="18" height="18" viewBox="0 0 24 24">
                                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>
                                                                </svg>
                                                                <svg x="7" y="9" width="16" height="16" viewBox="0 0 24 24">
                                                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>
                                                                </svg>
                                                            </svg>
                                                        </span>
                                                        <span>${avgVisitors} pro Tag</span>
                                                    `;
                                                    avgUl.appendChild(avgVisLi);
                                                }

                                                if (!avgUl.querySelector('.custom-avg-watchers')) {
                                                    const avgWatLi = document.createElement('li');
                                                    avgWatLi.className = 'custom-avg-watchers custom-stat-li';
                                                    avgWatLi.title = 'Gemerkt pro Tag';
                                                    avgWatLi.style.display = 'flex';
                                                    avgWatLi.style.alignItems = 'center';
                                                    avgWatLi.style.gap = '4px';

                                                    // Kombi-Icon: Herz (w=18, h=18) + Trend (x=7, y=9)
                                                    avgWatLi.innerHTML = `
                                                        <span class="inline-block-icon" style="display: flex; align-items: center;">
                                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}">
                                                                <svg x="0" y="0" width="18" height="18" viewBox="0 0 24 24">
                                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                                                </svg>
                                                                <svg x="7" y="9" width="16" height="16" viewBox="0 0 24 24">
                                                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>
                                                                </svg>
                                                            </svg>
                                                        </span>
                                                        <span>${avgWatchers} pro Tag</span>
                                                    `;
                                                    avgUl.appendChild(avgWatLi);
                                                }

                                                // 5. NEUE ZEILE (Anzeigen-ID in der Analyse Spalte hinzufügen, rutscht durch auto margin nach unten)
                                                if (!statsSection.querySelector('.custom-ad-id-row')) {
                                                    const idUl = document.createElement('ul');
                                                    idUl.className = 'm-none flex min-h-[22px] list-none p-none custom-ad-id-row';
                                                    idUl.style.marginTop = 'auto'; // Drückt die ID nach ganz unten
                                                    
                                                    // Grid mit 2 Spalten: Links Text, Rechts Wert
                                                    idUl.innerHTML = `
                                                        <li class="custom-stat-li" style="width: 100%; display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center;">
                                                            <span style="color: inherit; padding-right: 12px;">Anzeigen-ID</span>
                                                            <span>${adId}</span>
                                                        </li>
                                                    `;
                                                    statsSection.appendChild(idUl);
                                                }
                                            }

                                            // 6. Ort erzeugen und in die Info-Spalte als letztes Element anhängen
                                            if (details.location && infoColTarget && !infoColTarget.querySelector('.custom-loc-ul')) {
                                                const locUl = document.createElement('ul');
                                                locUl.className = 'm-none flex min-h-[22px] list-none gap-x-xsmall p-none custom-loc-ul text-bodySmall text-onSurfaceNonessential';
                                                locUl.style.flexWrap = 'wrap';
                                                locUl.style.rowGap = '4px';
                                                locUl.style.columnGap = '12px';
                                                locUl.style.marginTop = 'auto'; // Durch Info-Flexbox drückt es den Ort nun genau auf Höhe der ID nach unten

                                                const svgClass = "shrink-0 block align-middle text-onSurfaceNonessential";
                                                locUl.innerHTML = `
                                                    <li class="custom-stat-li" title="Ort">
                                                        <span class="inline-block-icon" style="display: flex; align-items: center;">
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}" style="width: 16px !important; height: 16px !important;">
                                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                                <circle cx="12" cy="10" r="3"></circle>
                                                            </svg>
                                                        </span>
                                                        <span>${details.location}</span>
                                                    </li>
                                                `;
                                                
                                                infoColTarget.appendChild(locUl);
                                            }

                                            // 7. Versandkosten neben dem Preis platzieren
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

                                            // 8. Kategorie als Suchlink formatieren (dynamisch anhand ID, Ort und URL-Slug)
                                            const categoryHeader = infoColTarget ? infoColTarget.querySelector('.mb-xsmall.text-bodySmall.text-onSurfaceNonessential') : null;
                                            if (categoryHeader && !categoryHeader.dataset.linkInjected) {
                                                categoryHeader.dataset.linkInjected = 'true';
                                                
                                                const idsMatch = new URL(adUrl).pathname.match(/-(\d+)-(\d+)\/?$/);
                                                if (idsMatch) {
                                                    const catId = idsMatch[1];
                                                    const locId = idsMatch[2];
                                                    
                                                    const plzMatch = details.location.match(/\b\d{5}\b/);
                                                    const plz = plzMatch ? plzMatch[0] : '';
                                                    
                                                    if (plz && catId && locId) {
                                                        const catText = categoryHeader.textContent.trim();
                                                        
                                                        // Fallback-Slug generieren, falls die Breadcrumb Extraktion in fetchAdDetails fehlschlagen sollte
                                                        let slug = details.catSlug;
                                                        if (!slug) {
                                                            slug = catText.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                                                        }
                                                        
                                                        const catLinkUrl = `https://www.kleinanzeigen.de/s-${slug}/${plz}/c${catId}l${locId}r10`;
                                                        
                                                        // Überschreibe das DOM-Element mit einem aktiven Link
                                                        const lupeSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
                                                        const tooltipText = "Klicke hier, gelange direkt in die Kategorie & Ort deiner Anzeige und prüfe das aktuelle Ranking.";
                                                        categoryHeader.innerHTML = `<a href="${catLinkUrl}" class="custom-category-link" target="_blank" title="${tooltipText}">${lupeSvg}<span>${catText}</span></a>`;
                                                    }
                                                }
                                            }

                                        }
                                    }
                                }
                            } catch(err) {
                                console.error("Fehler beim Verarbeiten des Inserats:", err);
                            }
                            await new Promise(r => setTimeout(r, 400)); 
                        }
                    } finally {
                        window.__KL_FETCHING_ADS = false;
                    }
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
