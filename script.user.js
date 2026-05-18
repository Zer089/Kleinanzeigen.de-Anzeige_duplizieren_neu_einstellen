// ==UserScript==
// @name          Kleinanzeigen - Anzeige duplizieren / neu einstellen
// @namespace     https://github.com/Zer089/Kleinanzeigen.de-Anzeige_duplizieren_neu_einstellen
// @description   Bietet eine "Anzeige duplizieren / neu einstellen" Funktion beim Bearbeiten einer vorhandenen Anzeige in Kleinanzeigen.
// @icon          https://play-lh.googleusercontent.com/PuqeuAmOMsDoB9gRCVr-EQHthinCbtaKPzMbxabfmCY9RI9r1fmWncCb4k6umBszzPaszT_o2RopSpIhy9BAiQ=w240-h480-rw
// @copyright     2026, Andi (Zer089)
// @license       MIT
// @version       2.6.90
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
    const isSettingsPage = window.location.href.includes('m-einstellungen.html');

    const isWidePage = isOverviewPage || isHomePage || isSearchPage || isMessagesPage;

    if (isOverviewPage) document.documentElement.classList.add('is-overview-page');
    if (isDetailPage) document.documentElement.classList.add('is-detail-page');
    if (isEditPage) document.documentElement.classList.add('is-edit-page');
    if (isSearchPage) document.documentElement.classList.add('is-search-page');
    if (isSettingsPage) document.documentElement.classList.add('is-settings-page');
    if (isWidePage) document.documentElement.classList.add('is-wide-page');

    // Original Kleinanzeigen & Eigene SVGs für saubere Button-Fluchtung
    const klPrinterSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 block align-middle" style="width: 14px; height: 14px;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>`;
    const klFlagSvg = `<svg viewBox="0 0 24 24" fill="none" data-title="reservedOutline" stroke="none" role="img" aria-hidden="true" focusable="false" class="shrink-0 fill-current block align-middle" style="width: 14px; height: 14px;"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.97961 2H18.187C18.5696 2 18.9172 2.22734 19.077 2.58214C19.2369 2.93694 19.1798 3.35428 18.9308 3.65079L15.4081 7.84615L18.9308 12.0415C19.1798 12.338 19.2369 12.7554 19.077 13.1102C18.9172 13.465 18.5696 13.6923 18.187 13.6923H5.95922V21C5.95922 21.5523 5.52063 22 4.97961 22C4.43859 22 4 21.5523 4 21V3C4 2.44772 4.43859 2 4.97961 2ZM5.95922 11.6923H16.0572L13.3741 8.49694C13.0597 8.12245 13.0597 7.56985 13.3741 7.19536L16.0572 4H5.95922V11.6923Z" fill="currentColor"></path></svg>`;
    const klReactivateSvg = `<svg viewBox="0 0 24 24" fill="none" data-title="reactivate" stroke="none" role="img" aria-hidden="true" focusable="false" class="shrink-0 fill-current block align-middle" style="width: 14px; height: 14px;"><path d="M14.7071 5.70711C14.9032 5.51106 15.0008 5.25386 15 4.99691C14.9993 4.74196 14.9016 4.48723 14.7071 4.29271L14.6954 4.28122L12.7071 2.29289C12.3166 1.90237 11.6834 1.90237 11.2929 2.29289C10.9024 2.68342 10.9024 3.31658 11.2929 3.70711L11.5947 4.00896C6.81226 4.22089 3 8.16524 3 13C3 17.9706 7.02944 22 12 22C16.2413 22 19.7973 19.0663 20.7495 15.1174C20.8914 14.5288 20.4158 14 19.8103 14C19.3047 14 18.8838 14.3748 18.7495 14.8624C17.9341 17.8243 15.2211 20 12 20C8.13401 20 5 16.866 5 13C5 9.27746 7.90573 6.2336 11.5728 6.01282L11.2929 6.29271C10.9024 6.68323 10.9024 7.3164 11.2929 7.70692C11.6834 8.09745 12.3166 8.09745 12.7071 7.70692L14.6954 5.71862L14.7071 5.70711Z" fill="currentColor"></path></svg>`;
    const klDupSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 block align-middle" style="width: 14px; height: 14px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    const klRelistSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 block align-middle" style="width: 14px; height: 14px;"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>`;
    const klShareSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 block align-middle" style="width: 14px; height: 14px;"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`;

    // ==========================================
    // CSS INJECTION (Design & Layout)
    // ==========================================
    const style = document.createElement('style');
    style.textContent = `
        /* Werbe- & Upsell-Säuberung (Cookie-Banner geschützt durch :not) */
        fieldset:has(#ad-feature-group), span:has(> div.bg-accentContainer), #feature-offer-section,
        .site-base--left-banner--full, .site-base--right-banner--full,
        #vip-billboard, #vip-belly, #vip-middle, #vip-bottom, #btf-billboard, #home-billboard,
        #srchrslt-adtop, #srchrslt-adtop--flex, [data-testid="top-banner"], /* Suchseite Werbebox */
        #srpb-top-banner, .mb-small:has(#srpb-top-banner), /* Entfernt die weiße leere Box der Werbung auf der Suchseite */
        #my-watchlist-atf, #my-msgbox-atf, #my-atf, .liberty-filled, .j-liberty-wrapper,
        [id^="vip-similar-ads-"], #pvap-featrs, .is-detail-page .icon-info-blue,
        .absolute.top-none.right-small.bottom-1\\/2, .absolute.bottom-none.top-1\\/2.right-small.pt-large,
        .absolute.top-none.left-small.bottom-1\\/2, .absolute.bottom-none.top-1\\/2.left-small.pt-large,
        .ad-module, div[data-testid*="banner"]:not([data-testid*="gdpr"]), div[data-testid*="ad-wrapper"],
        .mb-small:has(> .ad-module), .mb-small:has([id^="dfp-"]), li:has(> .ad-module),
        ul#srchrslt-adtable > li:has([data-liberty-position-name]), 
        ul#srchrslt-adtable > li:has([id^="srps-result-list"]),
        div.mx-auto.mb-small:has([data-liberty-position-name]):not(:has(#srchrslt-adtable)),
        div.mx-auto.mb-small:has([id^="srps-result-list"]):not(:has(#srchrslt-adtable)),
        li[id^="home-teaser-ads-"] { display: none !important; }

        /* Schützt den Cookie-Banner zusätzlich explizit */
        #gdpr-banner-container, dialog#gdpr-banner { display: block !important; visibility: visible !important; }

        section[data-testid="page-container"] { margin-bottom: 0px !important; }
        
        /* Verstecke Kleinanzeigen Original-Elemente (z.B. alte Views/Watchers über den Buttons) */
        .flex.text-bodySmall.my-xsmall.text-onSurface { display: none !important; }

        /* Allgemeine Abstands-Korrekturen nach Nutzer-Wunsch */
        .relative.mb-small.box-border.min-h-\\[10px\\].rounded-xsmall.text-onSurfaceSubdued { margin-bottom: 0px !important; }
        #tab-panel-all, [aria-labelledby="tabs-all"] { margin-top: 6px !important; }
        .text-left.text-bodySmall.text-onSurfaceNonessential { row-gap: 3px !important; }
        
        /* Spezifische Abstände laut Anforderung */
        .mx-none.my-xsmall.text-title4 { margin-top: 0px !important; margin-bottom: 0px !important; }
        .mb-xsmall.text-bodySmall.text-onSurfaceNonessential { margin-bottom: 3px !important; }
        .custom-bottom-row { margin-top: 0px !important; }
        
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

        /* Titel (Immer Platz für 2 Zeilen reservieren) FIX: Verdeckungen verhindern und Grid stabilisieren */
        .is-overview-page .custom-ad-grid .text-title4 {
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important; /* Auf 2 Zeilen limitiert */
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: normal !important;
            line-height: 1.3 !important;
            height: 2.6em !important; /* NEU: Erzwingt exakt den Platz von 2 Zeilen (1.3 * 2 = 2.6) */
            min-height: 2.6em !important;
        }
        
        /* Flex-Basis-Fix für Preis-Zeile mit Button und Abstandsanpassung */
        .is-overview-page .custom-ad-grid .text-title3.has-custom-btn {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            width: 100% !important;
            margin-top: 0px !important;
            margin-bottom: 0px !important;
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

        /* Galerie-Breite auf Detailseite anpassen (max 970px) */
        .is-detail-page .vip-image-gallery.galleryimage-large {
            max-width: 970px !important;
            width: 100% !important;
            margin-left: 0 !important; /* Gewährleistet linksbündige Ausrichtung im neuen 100% Grid */
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
            column-gap: 18px;
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
            .cpd-stats-actions-col { height: auto !important; border-left: none !important; border-right: none !important; border-top: 1px solid #e0e0e0; padding-left: 0 !important; padding-right: 0 !important; padding-top: 20px; flex-direction: row; flex-wrap: wrap; width: 100%; justify-content: center; }
            .cpd-actions-block { width: 100%; }
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
            display: flex; align-items: center; justify-content: center; 
            border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0; 
            padding-left: 18px; padding-right: 18px;
            height: 90px !important;
        }
        
        .cpd-stats-block { display: flex; flex-direction: column; align-items: center; }
        .cpd-stats-title { font-size: 12px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .cpd-stats-tiles { display: flex; column-gap: 8px; flex-wrap: wrap; justify-content: center; }
        .cpd-tile { display: flex; flex-direction: column; align-items: center; padding: 8px 8px; border-radius: 8px; transition: background 0.2s; min-width: 48px; }
        .cpd-tile:hover { background: #f9f9f9; }
        .cpd-tile-val { font-size: 14px; font-weight: 900; line-height: 1; color: #444; display: flex; align-items: center; justify-content: center; height: 14px; }
        .cpd-tile-val.online { color: #86B817; }
        .cpd-tile-lbl { font-size: 11px; color: #757575; font-weight: 600; text-transform: uppercase; margin-top: 4px; white-space: nowrap; }

        /* Actions Block */
        .cpd-actions-block { 
            display: flex; 
            flex-direction: column; 
            gap: 6px;
            width: 170px;
            box-sizing: border-box !important;
        }
        
        .cpd-action-btn {
            display: flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important;
            border-radius: 8px !important; transition: all 0.2s !important; text-decoration: none !important;
            cursor: pointer !important; box-sizing: border-box !important;
        }
        
        .cpd-action-btn.primary {
            border: 2px solid #e0e0e0 !important; 
            padding: 8px 12px !important; 
            font-size: 14px !important;
            font-weight: 700 !important; 
            color: #444 !important; 
            background: #fff !important; 
        }
        .cpd-action-btn.primary:hover { border-color: #5A33AE !important; color: #5A33AE !important; }
        .cpd-action-btn.primary svg { width: 16px !important; height: 16px !important; color: #999; transition: color 0.2s; flex-shrink: 0 !important; }
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
        .cpd-action-btn.secondary svg { 
            display: block !important; 
            flex-shrink: 0 !important; 
            overflow: visible !important; 
        }

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

        /* Gesamthöhe der Anzeige in der Übersicht */
        .is-overview-page article.cardbox {
            height: 145px !important;
            box-sizing: border-box !important;
        }

        /* 6-Spalten Grid (Bild | Infos | Trenn | Analyse | Trenn | Buttons) */
        .custom-ad-grid { 
            display: grid !important; 
            width: 100% !important; 
            grid-template-columns: 170px 1fr 1px max-content 1px max-content !important; 
            column-gap: 16px !important;
            height: 110px !important; /* Auf exakt 110px fixiert */
        }
        
        /* Einheitliche Höhen für die Anzeigenspalten */
        .custom-ad-grid > div:first-child,
        .custom-ad-grid > div:first-child a,
        .custom-ad-grid .pl-medium.align-top,
        .custom-stats-area.align-top,
        .mt-xsmall.custom-action-area {
            height: 110px !important; /* Auf exakt 110px fixiert */
            box-sizing: border-box !important;
        }

        .custom-ad-grid .mt-xsmall { margin-top: 0px !important; }
        
        /* Vorschaubild auf 170x110px erzwingen */
        .is-overview-page .custom-ad-grid > div:first-child,
        .is-overview-page .custom-ad-grid > div:first-child > a {
            width: 170px !important;
            height: 110px !important;
            box-sizing: border-box !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
        }
        .is-overview-page .custom-ad-grid > div:first-child img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
        }
        
        /* Überschreibt das originale Padding der Info-Spalte und macht sie zur Flexbox für vertikale Ausrichtung */
        .custom-ad-grid .pl-medium.align-top { 
            padding-left: 0px !important; 
            padding-right: 0px !important;
            display: flex !important;
            flex-direction: column !important;
        }

        /* Buttons-Liste in der Action Area (Spalte 6) - DYNAMISCHES GRID */
        .is-overview-page .custom-action-area ul,
        .is-overview-page .flex.list-none.flex-row.flex-wrap.p-none {
            display: grid !important; 
            grid-template-columns: max-content max-content !important; /* Passt sich exakt an den längsten Text in der jeweiligen Spalte an */
            column-gap: 8px !important; 
            row-gap: 6px !important; /* Etwas verringert für leicht höhere Buttons (32px) */
            margin: 0 !important; 
            padding: 0 !important; 
            width: max-content !important; 
            justify-content: start !important;
            height: 110px !important;
        }
        
        .is-overview-page .custom-action-area li,
        .is-overview-page .flex.list-none.flex-row.flex-wrap.p-none li { 
            margin: 0 !important; width: 100% !important; 
        }

        /* Zwingt sichtbare Listenelemente in die Flexbox, aber respektiert ausgeblendete Elemente! */
        .is-overview-page .custom-action-area li:not(.is-hidden):not(.hidden):not([style*="display: none"]):not([style*="display:none"]),
        .is-overview-page .flex.list-none.flex-row.flex-wrap.p-none li:not(.is-hidden):not(.hidden):not([style*="display: none"]):not([style*="display:none"]) {
            display: flex !important;
        }

        /* Native versteckte Elemente absolut und zwingend versteckt lassen */
        .is-overview-page .custom-action-area li.is-hidden,
        .is-overview-page .custom-action-area li.hidden,
        .is-overview-page .custom-action-area li[style*="display: none"],
        .is-overview-page .custom-action-area li[style*="display:none"] {
            display: none !important;
        }

        /* ====================================================
           CUSTOM LILA TOOLTIP (Deaktivierter Button)
           ==================================================== */
        [data-custom-tooltip] {
            position: relative;
        }
        [data-custom-tooltip]::after {
            content: attr(data-custom-tooltip);
            position: absolute;
            bottom: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%);
            background-color: #5A33AE;
            color: #ffffff;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 12px;
            white-space: pre; /* Erlaubt Zeilenumbrüche via \n */
            text-align: center; /* Zentriert den mehrzeiligen Text */
            line-height: 1.4;
            z-index: 1000;
            pointer-events: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            font-weight: normal;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s, visibility 0.2s;
        }
        [data-custom-tooltip]::before {
            content: '';
            position: absolute;
            bottom: calc(100% + 2px);
            left: 50%;
            transform: translateX(-50%);
            border-width: 6px;
            border-style: solid;
            border-color: #5A33AE transparent transparent transparent;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s, visibility 0.2s;
        }
        [data-custom-tooltip]:hover::after,
        [data-custom-tooltip]:hover::before {
            opacity: 1 !important;
            visibility: visible;
        }

        /* Lade-Animation für die Dashboard Zahl */
        @keyframes customPulse {
            0% { opacity: 1; }
            50% { opacity: 0.3; }
            100% { opacity: 1; }
        }

        /* EINHEITLICHE GRÖSSE UND LINIE FÜR ALLE BUTTONS IN SPALTE 6 */
        .is-overview-page .custom-action-area a,
        .is-overview-page .custom-action-area button,
        .is-overview-page .custom-purple-btn, 
        .is-overview-page .custom-native-btn {
            height: 32px !important; min-height: 32px !important; max-height: 32px !important;
            padding: 0 12px 0 10px !important; /* Fixer Abstand nach links (10px) = exakt gleiche Text/Icon Flucht! */
            font-size: 12px !important; line-height: 1 !important; margin: 0 !important; 
            box-sizing: border-box !important; border-width: 2px !important; border-radius: 9999px !important;
            display: inline-flex !important; align-items: center !important; justify-content: flex-start !important; 
            width: 100% !important; /* Button dehnt sich über das max-content Grid aus */
            gap: 6px !important; 
            text-align: left !important;
        }

        /* Icon-Only Buttons (für Teilen & Verkaufsschild in Spalte 2) überschreiben die obigen Regeln */
        .is-overview-page .custom-icon-only-btn,
        .custom-icon-only-btn {
            width: 24px !important;
            min-width: 24px !important;
            max-width: 24px !important;
            height: 24px !important;
            min-height: 24px !important;
            max-height: 24px !important;
            padding: 0 !important; /* Kein horizontales Padding! */
            display: flex !important;
            justify-content: center !important; /* Absolute Zentrierung */
            align-items: center !important;     
            flex-shrink: 0 !important;
            gap: 0 !important;
        }
        .custom-icon-only-btn span {
            display: none !important; /* Versteckt den Text explizit */
        }
        .custom-icon-only-btn svg {
            margin: 0 !important; /* Verhindert Verschiebungen */
        }

        /* Spezifische Margin-Anpassung für das Teilen Icon (etwas höher setzen) */
        .has-custom-btn .custom-icon-only-btn { margin-top: -5px !important; }

        .is-detail-page .custom-purple-btn,
        .is-detail-page .custom-native-btn-detail {
            height: 32px !important; min-height: 32px !important; max-height: 32px !important;
            padding: 0 12px !important; font-size: 12px !important; line-height: 1 !important; margin: 0 !important; 
            box-sizing: border-box !important; border-width: 2px !important; border-radius: 9999px !important;
            display: inline-flex !important; align-items: center !important; justify-content: center !important;
        }

        /* Native Buttons auf der Detailseite nachrüsten und an den Overview-Grün-Ton angleichen */
        .is-detail-page .custom-native-btn-detail {
            border: 2px solid #95958E !important; 
            background: transparent !important; 
            color: #326916 !important; 
            font-weight: 700 !important; 
            text-decoration: none !important; 
            transition: all 0.2s !important; 
            gap: 6px !important;
        }
        
        /* Einheitlicher grüner Hover-Effekt wie auf der Übersichtsseite */
        .is-detail-page .custom-native-btn-detail:not([disabled]):not([aria-disabled="true"]):not(.is-disabled):hover {
            background-color: #D3F28D !important; 
            border-color: #1D4B00 !important; 
            color: #1D4B00 !important; 
        }
        
        /* Deaktivierte Buttons auf der Detailseite (z.B. Verlängern) schützen */
        .is-detail-page .custom-native-btn-detail[disabled],
        .is-detail-page .custom-native-btn-detail[aria-disabled="true"],
        .is-detail-page .custom-native-btn-detail.is-disabled {
            color: rgba(50, 105, 22, 0.5) !important; 
            border-color: rgba(149, 149, 142, 0.5) !important;
            cursor: not-allowed !important;
            background: transparent !important;
            pointer-events: auto !important; 
        }
        
        /* Zwingend sicherstellen, dass inaktive Status-Buttons auf der Detailseite (Reservieren/Aktivieren Toggle) absolut versteckt bleiben */
        .is-detail-page .custom-native-btn-detail.is-hidden,
        .is-detail-page .custom-native-btn-detail.hidden,
        .is-detail-page .custom-native-btn-detail.hide,
        .is-detail-page li.is-hidden .custom-native-btn-detail,
        .is-detail-page li.hidden .custom-native-btn-detail {
            display: none !important;
        }
        
        /* Abstände für den Button-Container auf der Detailseite (pvap-mngad-actns) */
        #pvap-mngad-actns.list, #pvap-mngad-actns {
            margin-top: 12px !important;
            margin-bottom: 6px !important;
        }
        
        /* Allgemeine Fallback-Sicherheit für versteckte Elemente */
        .is-hidden, .hide, [style*="display: none"], [style*="display:none"] {
            display: none !important;
        }
        
        /* Icon Skalierung für SVGs in Action Area und Detail Buttons */
        .is-overview-page .custom-action-area a svg,
        .is-overview-page .custom-action-area button svg,
        .is-detail-page .custom-native-btn-detail svg {
            width: 14px !important; height: 14px !important; flex-shrink: 0 !important; margin: 0 !important;
            display: block !important;
        }
        
        /* Schützt native Kleinanzeigen CSS-Sprites (i-Tags) davor zerschossen zu werden */
        .is-detail-page .custom-native-btn-detail i {
            margin: 0 !important; 
        }

        /* Erzwinge Schriftgröße 12px für alle Text-Elemente innerhalb der Action Area Buttons */
        .custom-action-area button span, .custom-action-area a span,
        .is-detail-page .custom-native-btn-detail span, .is-detail-page .custom-purple-btn span {
            font-size: 12px !important;
        }

        .custom-shipping-info { font-size: 13px !important; color: #757575 !important; font-weight: normal !important; white-space: nowrap; border: none !important; }
        
        /* Einheitliches 3-Spalten Grid für die Anzeigenanalyse */
        .custom-analyse-grid {
            display: grid !important;
            grid-template-columns: minmax(101px, max-content) minmax(93px, max-content) max-content !important;
            column-gap: 8px !important;
            row-gap: 8px !important;
            width: 100% !important;
            margin-top: 4px !important; /* Update: Angepasst nach Wunsch */
        }
        .custom-analyse-item {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            white-space: nowrap !important;
            color: inherit !important; 
        }
        .custom-stat-label {
            display: inline-flex !important;
            align-items: center !important;
        }
        .custom-stat-value {
            font-weight: normal !important;
        }

        /* BEARBEITEN-SEITE: Hier bleiben die Buttons groß (44px) */
        .is-edit-page .custom-purple-btn { height: 44px !important; min-height: 44px !important; padding: 0 16px !important; font-size: 14px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; border-width: 2px !important; border-style: solid !important; }
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
    // CUSTOM TEILEN-MODAL (FÜR ÜBERSICHTSSEITE)
    // ==========================================
    function showCustomShareModal(url, title, imgUrl) {
        let overlay = document.getElementById('custom-share-overlay');
        
        const closeModal = () => {
            if (overlay) overlay.style.display = 'none';
            document.body.style.overflow = ''; // Scrollen wieder aktivieren
        };

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'custom-share-overlay';
            Object.assign(overlay.style, {
                position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
                backgroundColor: 'rgba(11, 11, 11, 0.8)', zIndex: '100000',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            });
            
            // Kompakteres Design mit reduzierten Paddings und Icon-Größen
            overlay.innerHTML = `
                <div class="mfp-container mfp-inline-holder" style="position:static; width:100%; height:auto; display:flex; justify-content:center; align-items:center; padding: 16px; box-sizing: border-box;">
                    <div class="mfp-content" style="max-width: 420px; width: 100%; margin: 0 auto; position:relative;">
                        <section class="modal-dialog mfp-popup-medium" style="display:block; position:relative; margin: 0 auto; background: #fff; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.25);">
                            <header style="padding: 10px 16px; border-bottom: 1px solid #e0e0e0; background: #f9f9f9;">
                                <h2 style="margin: 0; font-size: 16px; font-weight: 700; color: #333;">Anzeige teilen</h2>
                            </header>
                            <section class="modal-dialog-content" style="padding: 0;">
                                <ul class="selectable-list" style="margin: 0; padding: 0; list-style: none;">
                                    <li title="Anzeige per Email teilen" style="border-bottom: 1px solid #f0f0f0;">
                                        <a id="c-share-mail" href="#" style="display: flex; align-items: center; padding: 8px 16px; text-decoration: none; color: #333; transition: background 0.2s;">
                                            <i class="icon icon-tag icon-share-email-envelope-outline" style="margin-right: 10px; font-size: 20px;"></i>
                                            <span style="font-size: 14px;">via E-Mail teilen</span>
                                        </a>
                                    </li>
                                    <li title="Anzeige auf Facebook teilen" style="border-bottom: 1px solid #f0f0f0;">
                                        <a id="c-share-fb" href="#" target="_blank" style="display: flex; align-items: center; padding: 8px 16px; text-decoration: none; color: #333; transition: background 0.2s;">
                                            <i class="icon icon-tag icon-facebook-color" style="margin-right: 10px; font-size: 20px;"></i>
                                            <span style="font-size: 14px;">via Facebook teilen</span>
                                        </a>
                                    </li>
                                    <li title="Anzeige auf X teilen" style="border-bottom: 1px solid #f0f0f0;">
                                        <a id="c-share-x" href="#" target="_blank" style="display: flex; align-items: center; padding: 8px 16px; text-decoration: none; color: #333; transition: background 0.2s;">
                                            <i class="icon icon-tag icon-x-black" style="margin-right: 10px; font-size: 20px;"></i>
                                            <span style="font-size: 14px;">via X teilen</span>
                                        </a>
                                    </li>
                                    <li title="Anzeige auf Pinterest teilen" style="border-bottom: 1px solid #f0f0f0;">
                                        <a id="c-share-pin" href="#" target="_blank" style="display: flex; align-items: center; padding: 8px 16px; text-decoration: none; color: #333; transition: background 0.2s;">
                                            <i class="icon icon-tag icon-pinterest-color" style="margin-right: 10px; font-size: 20px;"></i>
                                            <span style="font-size: 14px;">via Pinterest teilen</span>
                                        </a>
                                    </li>
                                    <li title="Link kopieren" style="background-color: #fafafa;">
                                        <a id="c-share-copy" href="#" style="display: flex; align-items: center; padding: 8px 16px; text-decoration: none; color: #333; transition: background 0.2s; cursor: pointer;">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px; height:18px; margin-right:12px; margin-left: 1px; color:#5A33AE;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                            <span id="c-share-copy-text" style="font-size: 14px; font-weight: bold; color: #5A33AE;">Link kopieren</span>
                                        </a>
                                    </li>
                                </ul>
                            </section>
                            <button title="Schließen" class="mfp-close" style="position: absolute; right: 4px; top: 2px; width: 36px; height: 36px; background: transparent; border: none; font-size: 24px; line-height: 1; cursor: pointer; color: #999;">×</button>
                        </section>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            // Hover-Effekte simulieren (da die globalen CSS Hover-Regeln oft an andere Container gebunden sind)
            const links = overlay.querySelectorAll('a');
            links.forEach(l => {
                l.addEventListener('mouseover', () => l.style.backgroundColor = '#f0f0f0');
                l.addEventListener('mouseout', () => l.style.backgroundColor = 'transparent');
            });

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay || e.target.closest('.mfp-container') === overlay.firstChild || e.target.classList.contains('mfp-close') || e.target.closest('.mfp-close')) {
                    closeModal();
                }
            });
        }

        const encUrl = encodeURIComponent(url);
        const encTitle = encodeURIComponent(title);
        const encImg = encodeURIComponent(imgUrl);

        document.getElementById('c-share-mail').href = `mailto:?subject=Kleinanzeigen:%20${encTitle}&body=Gerade%20bei%20%23Kleinanzeigen%20gefunden.%20Wie%20findest%20du%20das%3F%0A${encUrl}`;
        document.getElementById('c-share-fb').href = `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`;
        document.getElementById('c-share-x').href = `https://x.com/intent/tweet?text=Schaut+mal,+was+ich+bei+%23Kleinanzeigen+gefunden+habe.+Wie+findet+ihr+das?&url=${encUrl}`;
        document.getElementById('c-share-pin').href = `https://pinterest.com/pin/create/button/?url=${encUrl}&media=${encImg}&description=${encTitle}`;
        
        const copyBtn = document.getElementById('c-share-copy');
        const copyText = document.getElementById('c-share-copy-text');
        copyText.textContent = "Link kopieren"; 
        copyBtn.onclick = (e) => {
            e.preventDefault();
            const tempInput = document.createElement("input");
            tempInput.style.position = "absolute";
            tempInput.style.left = "-9999px";
            tempInput.value = url;
            document.body.appendChild(tempInput);
            tempInput.select();
            try {
                document.execCommand("copy");
                copyText.textContent = "Kopiert!";
                setTimeout(() => { closeModal(); }, 800);
            } catch (err) {
                console.error("Copy failed", err);
            }
            document.body.removeChild(tempInput);
        };

        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Scrollen des Hintergrunds blockieren
    }

    // ==========================================
    // BUTTON LOGIK & METADATEN FETCHING
    // ==========================================
    function createBtn(text, iconStr, click) {
        const b = document.createElement('button');
        b.className = 'custom-purple-btn';
        // Genau dieselbe Struktur für SVG und Text wie bei nativen Buttons verwenden (SVG direkt im Button, Span für den Text)
        b.innerHTML = `${iconStr}<span>${text}</span>`;
        b.onclick = click;
        return b;
    }

    async function fetchAdDetails(adUrl, adId) {
        const cacheKey = `__KL_AD_DETAILS_V11_${adId}`; 
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
            
            let catSlug = '';
            const breadcrumbLinks = doc.querySelectorAll('#viewad-breadcrumb a[href*="/s-"]');
            if (breadcrumbLinks.length > 0) {
                for (let i = breadcrumbLinks.length - 1; i >= 0; i--) {
                    const href = breadcrumbLinks[i].getAttribute('href');
                    const match = href.match(/\/s-([^/]+)\/c\d+/);
                    if (match) {
                        catSlug = match[1]; 
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

    // ==========================================
    // 30-TAGE STATISTIK SCRAPER (HIDDEN JSON METHOD)
    // ==========================================
    const CACHE_KEY_30D = '__KL_ACTIVITY_30D_V9';

    // Holt die Zahl vollautomatisch im Hintergrund (ohne iframe, ohne Klick)
    async function fetchBackgroundStats() {
        try {
            // 1. Der schnelle & direkte Weg: Kleinanzeigen JSON-API abfragen
            const response = await fetch('/m-einstellungen-bearbeiten.json', { 
                headers: {
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin' 
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data && data.newAdCount !== undefined) {
                    const count = data.newAdCount.toString();
                    localStorage.setItem(CACHE_KEY_30D, count);
                    return count;
                }
            }
        } catch(e) {
            console.error("Fehler beim API-Abruf der 30-Tage Statistik:", e);
        }

        // 2. Fallback: Alte HTML-Methode
        try {
            const response = await fetch('/m-einstellungen.html', { credentials: 'same-origin' });
            if (!response.ok) return null;
            
            const html = await response.text();
            let match = html.match(/(?:adsInLast30Days|publishedAds30Days|thirtyDaysAdsCount|adsCount30Days)"?\s*:\s*(\d+)/i) || 
                        html.match(/letzten\s+30\s+Tagen\s+(\d+)/i);
            
            if (match && match[1]) {
                localStorage.setItem(CACHE_KEY_30D, match[1]);
                return match[1];
            }
        } catch(e) {
            console.error("Fehler beim HTML-Fallback der 30-Tage Statistik:", e);
        }
        return null;
    }

    // Passiver Scraper: Falls der User ohnehin auf der Einstellungen-Seite ist
    if (isSettingsPage) {
        setInterval(() => {
            const textContent = document.body.textContent || "";
            let match = textContent.match(/letzten\s+30\s+Tagen\s+(\d+)/i) || 
                        textContent.match(/(\d+)\s+Anzeigen\s+aufgegeben/i);
            
            if (match && match[1]) {
                localStorage.setItem(CACHE_KEY_30D, match[1]);
            }
        }, 2000);
    }

    const inject = () => {
        // --- DOM CLEANUP: Banner physisch entfernen ---
        const banners = document.querySelectorAll(`
            .site-base--left-banner--full, .site-base--right-banner--full,
            #btf-billboard, #home-billboard, #my-watchlist-atf, #my-msgbox-atf, #my-atf,
            #srchrslt-adtop, #srchrslt-adtop--flex, [data-testid="top-banner"], 
            #srpb-top-banner,
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
        banners.forEach(b => {
            if (b.id === 'srpb-top-banner') {
                const parent = b.closest('.mb-small');
                if (parent) parent.remove();
            }
            b.remove();
        });

        // --- SIDEBAR ENTFERNEN UND CONTENT STRECKEN (DETAILSEITE) ---
        // Dies muss passieren, BEVOR andere Skriptelemente nach Elementen in der Sidebar suchen!
        if (isDetailPage) {
            const sidebar = document.getElementById('viewad-sidebar');
            if (sidebar && !sidebar.dataset.removedSafely) {
                
                // 1a. Teilen-Button und das Modal retten, bevor die Sidebar gelöscht wird!
                const shareBtnOriginal = sidebar.querySelector('.j-share-ad, [href="#viewad-share-ad"], [data-mfp-src="#viewad-share-ad"]');
                if (shareBtnOriginal) {
                    shareBtnOriginal.id = 'custom-rescued-share-btn';
                    shareBtnOriginal.style.display = 'none';
                    document.body.appendChild(shareBtnOriginal);
                }
                const shareModal = sidebar.querySelector('#viewad-share-ad');
                if (shareModal) document.body.appendChild(shareModal);
                
                // 1b. Anzeigen-ID Box retten
                const adIdBoxOriginal = sidebar.querySelector('#viewad-ad-id-box');
                if (adIdBoxOriginal) {
                    adIdBoxOriginal.id = 'custom-rescued-ad-id-box';
                    adIdBoxOriginal.style.display = 'none';
                    document.body.appendChild(adIdBoxOriginal);
                }

                // 2. Sidebar sicher löschen
                sidebar.dataset.removedSafely = 'true';
                sidebar.remove();
                
                // 3. Content-Container auf volle Breite (a-span-24) aufziehen
                const mainCol = document.querySelector('#viewad-cntnt .a-span-16');
                if (mainCol) {
                    mainCol.classList.remove('a-span-16');
                    mainCol.classList.add('a-span-24'); // Kleinanzeigen Full-Width Layout-Klasse
                    mainCol.style.setProperty('width', '100%', 'important');
                    mainCol.style.setProperty('max-width', '100%', 'important');
                }
            }
        }

        // --- VISUAL FIXES FÜR DIE DETAILSEITE ---
        if (isDetailPage) {
            // 1. Datum Icon tauschen (Megafon) mit korrekter Farbe (#A6A6A6) und Abstand (6px)
            const calIcon = document.querySelector('.icon-calendar-gray-simple');
            if (calIcon && !calIcon.dataset.replaced) {
                calIcon.dataset.replaced = 'true';
                calIcon.outerHTML = `<span title="Erstellt am" style="display: inline-flex; align-items: center;"><svg viewBox="0 0 24 24" fill="none" stroke="#A6A6A6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 block align-middle" style="width: 16px !important; height: 16px !important; margin-right: 6px;"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg></span>`;
            }

            // Tooltip für Standort-Icon sicherstellen
            const locIcons = document.querySelectorAll('.icon-location-pin-filled, .icon-pin-gray-simple');
            locIcons.forEach(icon => {
                const parent = icon.parentElement;
                if (parent && !parent.title) parent.title = "Ort";
            });

            // 2. Besucher Counter anpassen (mit statischem grauen Icon)
            const cntrParent = document.getElementById('viewad-cntr');
            const cntrNum = document.getElementById('viewad-cntr-num');
            if (cntrParent && cntrNum && !cntrParent.dataset.styled) {
                cntrParent.dataset.styled = 'true';
                
                cntrNum.removeAttribute('title');
                
                cntrParent.classList.remove('textcounter');
                cntrParent.style.backgroundImage = 'none';
                cntrParent.style.paddingLeft = '0';
                cntrParent.style.display = 'inline-flex';
                cntrParent.style.alignItems = 'center';
                cntrParent.style.gap = '6px';
                
                const eyeSvg = document.createElement('span');
                eyeSvg.title = "Besucher";
                eyeSvg.style.display = 'inline-flex';
                eyeSvg.style.alignItems = 'center';
                eyeSvg.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#A6A6A6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 block align-middle"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
                cntrParent.insertBefore(eyeSvg, cntrNum);
                
                if (!document.getElementById('custom-besucher-text')) {
                    const txtSpan = document.createElement('span');
                    txtSpan.id = 'custom-besucher-text';
                    txtSpan.innerText = ' Besucher';
                    cntrNum.after(txtSpan);
                }
            }

            // 3. Info-Bereiche exakt nach Nutzer-HTML umbauen
            const dlStats = document.getElementById('pvap-mngad-stats');
            const extraInfo = document.getElementById('viewad-extra-info');

            if (dlStats && extraInfo && !dlStats.dataset.klStyledLayout) {
                dlStats.dataset.klStyledLayout = 'true';

                // Boxedarticle anordnen: dlStats soll *vor* extraInfo in einer eigenen Zeile stehen
                extraInfo.parentNode.insertBefore(dlStats, extraInfo);

                // Styling für die erste Zeile (Erstellt am & Endet am)
                dlStats.className = 'm-none p-none text-bodySmall text-onSurfaceNonessential';
                dlStats.style.display = 'flex';
                dlStats.style.flexWrap = 'wrap';
                dlStats.style.alignItems = 'center';
                dlStats.style.gap = '16px';
                dlStats.style.marginTop = '6px';
                dlStats.style.marginBottom = '0px';
                dlStats.style.padding = '0px';
                dlStats.style.width = '100%';

                // Styling für die zweite Zeile (Besucher & Merkliste)
                extraInfo.style.display = 'flex';
                extraInfo.style.flexWrap = 'wrap';
                extraInfo.style.alignItems = 'center';
                extraInfo.style.gap = '8px 16px';

                // Hilfsfunktion zum Finden bestimmten <dt> Knoten
                const getDtByText = (text) => Array.from(dlStats.querySelectorAll('dt')).find(dt => dt.textContent.includes(text));

                // A. "Besuche:" aus dlStats komplett ausblenden
                const dtVisits = getDtByText('Besuche');
                if (dtVisits) {
                    dtVisits.style.display = 'none';
                    if (dtVisits.nextElementSibling) dtVisits.nextElementSibling.style.display = 'none';
                }

                // B. "Erstellt am" Container in dlStats verschieben und vertikal zentrieren
                const erstelltAmSpan = document.querySelector('span[title="Erstellt am"]');
                if (erstelltAmSpan) {
                    const erstelltAmDiv = erstelltAmSpan.closest('div');
                    if (erstelltAmDiv) {
                        erstelltAmDiv.style.display = 'flex';
                        erstelltAmDiv.style.alignItems = 'center';
                        dlStats.appendChild(erstelltAmDiv);
                    }
                }

                // C. "Endet am" Container in dlStats belassen/formatieren
                const dtEnd = getDtByText('Endet am');
                if (dtEnd) {
                    const ddEnd = dtEnd.nextElementSibling;
                    if (ddEnd) {
                        const svgClock = `<svg viewBox="0 0 24 24" fill="none" stroke="#A6A6A6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 block align-middle" style="width: 16px; height: 16px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
                        dtEnd.innerHTML = `<span title="Endet am" style="display: flex; align-items: center; margin-right: 4px;">${svgClock}</span>`;
                        dtEnd.style.display = 'inline-flex';

                        ddEnd.style.display = 'inline-flex';
                        ddEnd.style.marginLeft = '0px';

                        const wrapper = document.createElement('div');
                        wrapper.style.display = 'flex'; wrapper.style.alignItems = 'center';
                        dlStats.appendChild(wrapper);
                        wrapper.appendChild(dtEnd);
                        wrapper.appendChild(ddEnd);
                    }
                }

                // D. "Besucher" wieder sauber in die zweite Zeile (extraInfo) hängen
                if (cntrParent) extraInfo.appendChild(cntrParent);

                // E. "Merkliste" aus dlStats in extraInfo verschieben und formatieren
                const dtMerk = getDtByText('Merkliste');
                if (dtMerk) {
                    const ddMerk = dtMerk.nextElementSibling;
                    if (ddMerk) {
                        const svgHeart = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#A6A6A6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 block align-middle"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
                        dtMerk.innerHTML = `<span title="Merkliste" style="display: flex; align-items: center;">${svgHeart}</span>`;
                        dtMerk.style.display = 'inline-flex';
                        dtMerk.style.marginRight = '4px';

                        ddMerk.style.display = 'inline-flex';
                        ddMerk.style.marginLeft = '0px';
                        
                        let t = ddMerk.innerText.trim();
                        if (t.includes(' mal gemerkt')) {
                            t = t.replace(' mal gemerkt', 'x gemerkt');
                        } else if (!t.includes('gemerkt')) {
                            t = t + 'x gemerkt';
                        }
                        ddMerk.innerText = t;

                        const wrapper = document.createElement('div');
                        wrapper.style.display = 'flex'; wrapper.style.alignItems = 'center';
                        extraInfo.appendChild(wrapper);
                        wrapper.appendChild(dtMerk);
                        wrapper.appendChild(ddMerk);
                    }
                }
                
                // 4. Eigene Anzeige Check & "Zur Merkliste hinzufügen" entfernen
                const isOwnAd = document.getElementById('pvap-mngad-actns') !== null || document.querySelector('a[href*="/p-anzeige-bearbeiten.html"]') !== null;
                if (isOwnAd) {
                    const watchlistBox = document.getElementById('viewad-action-watchlist');
                    if (watchlistBox) watchlistBox.style.setProperty('display', 'none', 'important');
                }

                // 5. Anzeigen-ID (aus der geretteten Box abgreifen) exakt einbauen - IN EIGENER ZEILE
                const adIdBox = document.getElementById('custom-rescued-ad-id-box') || document.getElementById('viewad-ad-id-box');
                if (adIdBox && extraInfo && !document.getElementById('custom-ad-id-row')) {
                    const idListItems = adIdBox.querySelectorAll('li');
                    if (idListItems.length >= 2) {
                        const idLabel = idListItems[0].textContent.trim();
                        const idValue = idListItems[1].textContent.trim();
                        
                        // Neuen, unabhängigen Container für die ID nach extraInfo erstellen
                        const wrapper = document.createElement('div');
                        wrapper.id = 'custom-ad-id-row';
                        wrapper.className = 'text-bodySmall text-onSurfaceNonessential';
                        wrapper.style.display = 'flex';
                        wrapper.style.alignItems = 'center';
                        wrapper.style.width = '100%'; 
                        wrapper.style.marginTop = '6px'; // Deutlich abgesetzt als eigene Zeile
                        
                        const svgHash = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#A6A6A6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 block align-middle" style="margin-right: 4px;"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>`;
                        
                        wrapper.innerHTML = `
                            <span title="${idLabel}" style="display: flex; align-items: center;">${svgHash}</span>
                            <span style="font-weight: normal; color: #757575;">${idLabel} ${idValue}</span>
                        `;
                        
                        // Direkt als nächstes Geschwisterelement von extraInfo einfügen (eigenständige Zeile!)
                        extraInfo.parentNode.insertBefore(wrapper, extraInfo.nextSibling);
                    }
                }
            }
        }

        // --- MOCKUP PROFIL REDESIGN INJECTOR ---
        if (isOverviewPage) {
            const profileBox = document.querySelector('.ownprofile-main');
            
            // --- REACT OVERWRITE SCHUTZ (AUTO-HEALING) ---
            if (profileBox && profileBox.dataset.redesignInjected && !profileBox.querySelector('.custom-profile-dashboard')) {
                delete profileBox.dataset.redesignInjected; // Setzt den Inject-Status zurück, um Neuaufbau zu erzwingen
                profileBox.classList.remove('custom-replaced');
            }

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

                if (nameText.length === 0 || !statsEl || !userInfoUl) return; 

                profileBox.dataset.redesignInjected = 'true';

                try {
                    // 2. Verstecke die originale Struktur (um React nicht zu stören)
                    Array.from(profileBox.children).forEach(child => {
                        child.style.display = 'none';
                        child.classList.add('kl-hidden-original');
                    });

                    // 3. Extrahieren der Original-Daten und Nodes
                    const avatarEl = profileBox.querySelector('.user-profile-badge') || profileBox.querySelector('img[src*="userportrait"]');
                    const avatarClone = avatarEl ? avatarEl.cloneNode(true) : null;

                    let userTypeHtml = '', activeSinceHtml = '', replyTimeHtml = '';
                    let followersA = null, followersSvg = null;

                    profileBox.querySelectorAll('[data-testid="user-info"] li').forEach(li => {
                        const txt = li.textContent.toLowerCase();
                        const svg = li.querySelector('svg');
                        
                        if (txt.includes('nutzer')) {
                            userTypeHtml = li.innerHTML; 
                        } else if (txt.includes('aktiv seit')) {
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
                            
                            replyTimeHtml = '';
                            if (svg) replyTimeHtml += svg.outerHTML;
                            replyTimeHtml += `<span class="cpd-footer-item-text">${text}</span>`;
                        } else if (txt.includes('follower')) {
                            followersSvg = svg ? svg.cloneNode(true) : null;
                            followersA = li.querySelector('a'); 
                        }
                    });

                    let onlineCount = "0", totalCount = "0";
                    if (statsEl) {
                        const m1 = statsEl.textContent.match(/(\d+)\s*Anzeigen/i);
                        const m2 = statsEl.textContent.match(/(\d+)\s*gesamt/i);
                        if (m1) onlineCount = m1[1];
                        if (m2) totalCount = m2[1];
                    }

                    const walletLink = profileBox.querySelector('a[href*="wallet.html"]'); 
                    const infoBtn = profileBox.querySelector('button[aria-label="Profilinformationen öffnen"]');

                    // 4. Aufbau des neuen Dashboards
                    const dashboard = document.createElement('div');
                    dashboard.className = 'custom-profile-dashboard';
                    
                    const colAvatar = document.createElement('div');
                    colAvatar.className = 'cpd-avatar-col';
                    if (avatarClone) {
                        avatarClone.className = 'user-profile-badge'; 
                        colAvatar.appendChild(avatarClone);
                    }
                    dashboard.appendChild(colAvatar);

                    const colInfo = document.createElement('div');
                    colInfo.className = 'cpd-info-col';
                    
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

                    const badgesRow = document.createElement('ul');
                    badgesRow.className = 'cpd-badges-row';
                    
                    const originalBadgeLis = profileBox.querySelectorAll('.ownprofile-badges.userbadges > li');
                    originalBadgeLis.forEach(li => {
                        li.className = 'custom-badge-wrapper'; 
                        
                        const btn = li.querySelector('button[data-testid="user-badge"]');
                        if (btn) {
                            btn.className = 'custom-badge-item'; 
                            
                            const innerDiv = btn.querySelector('.ActivityIndicator');
                            if (innerDiv) {
                                innerDiv.className = ''; 
                                innerDiv.style.display = 'flex';
                                innerDiv.style.alignItems = 'center';
                                innerDiv.style.justifyContent = 'center';
                                innerDiv.style.gap = '4px';
                            }
                            
                            const svg = btn.querySelector('svg');
                            if (svg) svg.classList.remove('w-small', 'h-small', 'text-onAccentContainer');
                            
                            const textEl = btn.querySelector('.ActivityIndicator--Name');
                            if (textEl) {
                                // FIX: Zeilenumbrüche und doppelte Leerzeichen werden hier nun korrekt durch ein einfaches Leerzeichen ersetzt.
                                textEl.textContent = textEl.textContent.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim();
                            }
                        }
                        badgesRow.appendChild(li); 
                    });
                    
                    colInfo.appendChild(badgesRow);

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
                        
                        followersA.className = 'follower-link'; 
                        followersA.style.display = 'inline-flex';
                        followersA.style.alignItems = 'center';
                        followersA.style.gap = '4px';
                        
                        const numMatch = followersA.textContent.match(/(\d+)/);
                        if (numMatch) {
                            followersA.innerHTML = `<span class="cpd-footer-item-text"><strong>${numMatch[1]}</strong> Follower</span>`;
                        }
                        folSpan.appendChild(followersA); 
                        rowFooter.appendChild(folSpan);
                    }
                    colInfo.appendChild(rowFooter);
                
                dashboard.appendChild(colInfo);

                const colStats = document.createElement('div');
                colStats.className = 'cpd-stats-actions-col';
                
                colStats.innerHTML = `
                    <div class="cpd-stats-block">
                        <span class="cpd-stats-title">Anzeigen</span>
                        <div class="cpd-stats-tiles">
                            <div class="cpd-tile" title="Du hast aktuell ${onlineCount} Anzeigen online.">
                                <span class="cpd-tile-val online">${onlineCount}</span>
                                <span class="cpd-tile-lbl">Online</span>
                            </div>
                            <div class="cpd-tile" title="Du hast insgesamt ${totalCount} Anzeigen erstellt.">
                                <span class="cpd-tile-val">${totalCount}</span>
                                <span class="cpd-tile-lbl">Gesamt</span>
                            </div>
                            <div class="cpd-tile" id="custom-30d-tile" title="Lade Statistik...">
                                <span class="cpd-tile-val" id="custom-30d-val"></span>
                                <span class="cpd-tile-lbl">30 Tage</span>
                            </div>
                        </div>
                    </div>
                `;

                const actionsBlock = document.createElement('div');
                actionsBlock.className = 'cpd-actions-block';
                
                if (walletLink) {
                        walletLink.innerHTML = `
                            <svg viewBox="0 0 24 24" fill="none" data-title="transactionsOverview" stroke="none" role="img" aria-hidden="true" focusable="false" class="shrink-0 fill-current block align-middle transition-colors text-gray-400 group-hover:text-[#5A33AE]" style="width: 16px; height: 16px;">
                                <path d="M8 8C8.55229 8 9 7.55228 9 7 9 6.44772 8.55229 6 8 6 7.44772 6 7 6.44772 7 7 7 7.55228 7.44772 8 8 8ZM8 12C8.55229 12 9 11.5523 9 11 9 10.4477 8.55229 10 8 10 7.44772 10 7 10.4477 7 11 7 11.5523 7.44772 12 8 12ZM9 15C9 15.5523 8.55229 16 8 16 7.44772 16 7 15.5523 7 15 7 14.4477 7.44772 14 8 14 8.55229 14 9 14.4477 9 15ZM11 6C10.4477 6 10 6.44772 10 7 10 7.55228 10.4477 8 11 8H16C16.5523 8 17 7.55228 17 7 17 6.44772 16.5523 6 16 6H11ZM10 11C10 10.4477 10.4477 10 11 10H16C16.5523 10 17 10.4477 17 11 17 11.5523 16.5523 12 16 12H11C10.4477 12 10 11.5523 10 11ZM11 14C10.4477 14 10 14.4477 10 15 10 15.5523 10.4477 16 11 16H16C16.5523 16 17 15.5523 17 15 17 14.4477 16.5523 14 16 14H11Z" fill="currentColor"></path>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M18.7071 21.2929C18.3166 21.6834 17.6834 21.6834 17.2929 21.2929L16 20L14.7071 21.2929L13.2929 21.2929L12 20L10.7071 21.2929H9.29289L8 20L6.7062 21.2938C6.3156 21.6834 5.68312 21.6831 5.29289 21.2929L4.29289 20.2929C4.10536 20.1054 4 19.851 4 19.5858V4C4 2.89543 4.89543 2 6 2H18C19.1046 2 20 2.89543 20 4V19.5858C20 19.851 19.8946 20.1054 19.7071 20.2929L18.7071 21.2929ZM14 19.1716L12 17.1716L10 19.1716L8 17.1716L6 19.1716V4H18V19.1716L16 17.1716L14 19.1716Z" fill="currentColor"></path>
                                <path d="M10.7063 21.2937 10.7071 21.2929 13.2929 21.2929 13.2937 21.2937 10.7063 21.2937ZM14.7063 21.2937 14.7071 21.2929 17.2929 21.2929 14.7063 21.2937ZM13.2937 21.2937 14.7063 21.2937C14.316 21.6831 13.684 21.6831 13.2937 21.2937ZM10.7063 21.2937C10.3159 21.6826 9.68382 21.683 9.2937 21.2937L10.7063 21.2937Z" fill="currentColor"></path>
                            </svg>
                            <span>Verkaufsübersicht</span>
                        `;
                        walletLink.className = 'cpd-action-btn primary';
                        walletLink.title = 'Einnahmen über das Bezahlsystem';
                        actionsBlock.appendChild(walletLink); 
                    }

                    if (infoBtn) {
                        const settingsLink = document.createElement('a');
                        settingsLink.href = 'https://www.kleinanzeigen.de/m-einstellungen.html';
                        settingsLink.className = 'cpd-action-btn secondary';
                        settingsLink.target = '_self';
                        
                        settingsLink.innerHTML = `
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px !important; height: 14px !important; display: block !important; flex-shrink: 0 !important; margin: 0 4px 0 0 !important;">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                            <span style="line-height: 1; transform: translateY(1px);">Profil-Einstellungen</span>
                        `;
                        
                        actionsBlock.appendChild(settingsLink); 
                }
                
                dashboard.appendChild(colStats);
                dashboard.appendChild(actionsBlock);

                profileBox.classList.add('custom-replaced');
                profileBox.appendChild(dashboard);

                // --- 30-Tage Statistik laden ---
                const val30d = dashboard.querySelector('#custom-30d-val');
                if (val30d) {
                    const cachedVal = localStorage.getItem(CACHE_KEY_30D);
                    
                    if (cachedVal && cachedVal !== '-') {
                        val30d.textContent = cachedVal;
                        val30d.parentElement.title = `Du hast in den letzten 30 Tagen ${cachedVal} Anzeigen eingestellt.`;
                    } else {
                        val30d.innerHTML = '<span style="font-size: 11px; font-weight: normal; animation: customPulse 1s infinite;">LÄDT</span>';
                        
                        // Versuche die Daten versteckt im Hintergrund zu holen
                        fetchBackgroundStats().then(val => {
                            if (val) {
                                val30d.textContent = val;
                                val30d.parentElement.title = `Du hast in den letzten 30 Tagen ${val} Anzeigen eingestellt.`;
                            } else {
                                val30d.innerHTML = '<span style="font-size: 14px; color: #999;">?</span>';
                                val30d.parentElement.title = "Konnte im Hintergrund nicht geladen werden. Bitte Einstellungen einmal manuell öffnen.";
                            }
                        });
                    }
                }

            } catch(e) {
                    console.error("Fehler beim Erstellen des Dashboards:", e);
                }
            }
        }

        // --- BEARBEITEN/DUPLIZIEREN BUTTONS BEI ANZEIGEN (DETAIL & ÜBERSICHT) ---
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
                let printBtn = null;
                let printLi = null;
                
                if (mehrBtn) {
                    const mehrLi = mehrBtn.closest('li');
                    if (mehrLi) {
                        mehrLi.style.position = 'absolute';
                        mehrLi.style.opacity = '0';
                        mehrLi.style.pointerEvents = 'none';
                    }

                    printBtn = document.createElement('button');
                    printBtn.type = 'button';
                    printBtn.className = "inline-flex items-center justify-center gap-xsmall text-bodyRegularStrong box-border rounded-full cursor-pointer whitespace-nowrap no-underline hover:no-underline focus:outline-none focus-visible:outline-2 focus-visible:ring-2 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent focus-visible:ring-surface border-2 border-solid border-utility text-interactive h-xlarge min-h-xlarge min-w-xlarge w-fit bg-transparent hover:border-secondary hover:bg-secondaryContainer hover:text-onSecondaryContainer active:border-secondary active:bg-secondaryContainer active:text-onSecondaryContainer px-medium custom-native-btn";
                    
                    if (isOverviewPage) {
                        printBtn.innerHTML = `${klPrinterSvg}`;
                        printBtn.classList.add('custom-icon-only-btn');
                        printBtn.title = "Verkaufsschild drucken";
                    } else {
                        printBtn.innerHTML = `${klPrinterSvg}<span>Verkaufsschild</span>`;
                        printLi = document.createElement(container.tagName === 'UL' ? 'li' : 'span');
                        printLi.style.margin = '0';
                        printLi.style.width = '100%';
                        printLi.style.display = 'flex';
                        printLi.appendChild(printBtn);
                    }

                    printBtn.onclick = async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        printBtn.blur(); // Optische Deaktivierung verhindern
                        printBtn.removeAttribute('disabled');
                        printBtn.classList.remove('is-disabled');

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
                                        
                                        // Sicherheitshalber Status sofort zurücksetzen
                                        printBtn.removeAttribute('disabled');
                                        printBtn.classList.remove('is-disabled');
                                    }, 100);
                                    return; 
                                }
                            }
                            
                            if (attempts > 30) {
                                clearInterval(interval);
                                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
                                document.body.click();
                                antiFlashStyle.remove();
                                
                                printBtn.removeAttribute('disabled');
                                printBtn.classList.remove('is-disabled');
                            }
                        }, 50);
                    };
                }

                // --- LILA CUSTOM BUTTONS ---
                const doAction = (e, type) => {
                    e.preventDefault();
                    localStorage.setItem('__KL_AUTO_ACTION', JSON.stringify({action: type, adId}));
                    localStorage.setItem('__KL_AUTO_REDIRECT', 'true');
                    window.location.href = link.href;
                };

                const liDup = document.createElement(container.tagName === 'UL' ? 'li' : 'span');
                liDup.style.margin = '0';
                liDup.appendChild(createBtn('Duplizieren', klDupSvg, (e) => doAction(e, 'duplicate')));

                const liRelist = document.createElement(container.tagName === 'UL' ? 'li' : 'span');
                liRelist.style.margin = '0';
                liRelist.appendChild(createBtn('Neu einstellen', klRelistSvg, (e) => doAction(e, 'relist')));

                // --- NEUER TEILEN BUTTON FÜR DIE ÜBERSICHTSSEITE ---
                let shareBtnEl = null;
                if (isOverviewPage) {
                    const shareAction = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const card = link.closest('li[data-testid="ad-card"]');
                        
                        const titleLink = card ? card.querySelector('a[href*="/s-anzeige/"]') : null;
                        const url = titleLink ? titleLink.href : window.location.href;
                        
                        // Titel explizit aus dem h2 (oder der Titel-Klasse) holen, da der erste Link oft das Bild mit der Foto-Anzahl ist!
                        const titleHeading = card ? card.querySelector('h2, .text-title4') : null;
                        let adTitle = 'Anzeige';
                        if (titleHeading) {
                            // Falls es einen Screenreader-Text davor gibt, bereinigen
                            const clone = titleHeading.cloneNode(true);
                            const srOnly = clone.querySelector('.sr-only');
                            if (srOnly) srOnly.remove();
                            adTitle = clone.textContent.trim();
                        } else if (titleLink) {
                            adTitle = titleLink.textContent.trim();
                        }
                        
                        const imgEl = card ? card.querySelector('.imagebox-image img') : null;
                        let imgUrl = '';
                        if (imgEl) {
                            imgUrl = imgEl.src;
                            if (imgUrl.includes('data:image') && imgEl.dataset.src) {
                                imgUrl = imgEl.dataset.src;
                            }
                        }
                        
                        showCustomShareModal(url, adTitle, imgUrl);
                    };
                    
                    shareBtnEl = document.createElement('button');
                    shareBtnEl.type = 'button';
                    shareBtnEl.className = "inline-flex items-center justify-center gap-xsmall text-bodyRegularStrong box-border rounded-full cursor-pointer whitespace-nowrap no-underline hover:no-underline focus:outline-none focus-visible:outline-2 focus-visible:ring-2 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent focus-visible:ring-surface border-2 border-solid border-utility text-interactive h-xlarge min-h-xlarge min-w-xlarge w-fit bg-transparent hover:border-secondary hover:bg-secondaryContainer hover:text-onSecondaryContainer active:border-secondary active:bg-secondaryContainer active:text-onSecondaryContainer px-medium custom-native-btn custom-icon-only-btn";
                    shareBtnEl.innerHTML = `${klShareSvg}`;
                    shareBtnEl.onclick = shareAction;
                    shareBtnEl.title = "Anzeige teilen";
                }

                // Platzierung der Buttons in der Action-Spalte (Spalte 6)
                if (isOverviewPage) {
                    container.append(liDup, liRelist); // Teilen und Verkaufsschild wurden hier auf der Übersichtsseite entfernt
                } else {
                    if (printLi) container.append(printLi);
                    container.append(liDup, liRelist);
                }
                
                // --- TEILEN BUTTON AUS DER GERETTETEN SIDEBAR IN DIE LEISTE HOLEN (NUR DETAILSEITE) ---
                if (isDetailPage) {
                    let shareBtn = document.getElementById('custom-rescued-share-btn') || document.querySelector('button.j-share-ad, a.j-share-ad');
                    if (shareBtn && !shareBtn.dataset.movedToActions) {
                        shareBtn.dataset.movedToActions = 'true';
                        
                        shareBtn.className = 'custom-native-btn-detail j-share-ad'; // Behalte Event-Klasse für natives Modal
                        shareBtn.style.display = 'inline-flex'; // Falls er während der Rettung ausgeblendet wurde
                        
                        shareBtn.innerHTML = `${klShareSvg}<span>Teilen</span>`;
                        
                        const liShareDetail = document.createElement(container.tagName === 'UL' ? 'li' : 'span');
                        liShareDetail.style.margin = '0';
                        liShareDetail.appendChild(shareBtn);
                        
                        container.appendChild(liShareDetail);
                    }
                }
                
                container.dataset.klInjected = 'true';

                // ====================================================
                // --- 1. NEU: DETAIL-SEITEN REDESIGN STYLING ---
                // ====================================================
                if (isDetailPage) {
                    // Styles auf den nativen Container und alle Buttons darin anwenden
                    if (!container.dataset.klStyled) {
                        container.dataset.klStyled = 'true';
                        container.style.display = 'flex';
                        container.style.flexWrap = 'wrap';
                        container.style.gap = '8px';
                        container.style.listStyle = 'none';
                        container.style.padding = '0';
                        container.style.margin = '0';

                        // Überschrift über den Action-Buttons einfügen
                        if (container.parentElement && !container.parentElement.querySelector('h2.sectionheadline')) {
                            const h2 = document.createElement('h2');
                            h2.className = 'sectionheadline';
                            h2.setAttribute('style', 'margin-bottom: 12px !important;');
                            h2.textContent = 'Deine Anzeige';
                            container.parentElement.insertBefore(h2, container);
                        }

                        // --- FESTE SORTIERUNG DER BUTTONS (Detailseite) ---
                        // Diese greift alle eingefügten & vorhandenen Buttons auf und reiht sie genau so auf.
                        const orderMap = {
                            'Bearbeiten': 1,
                            'Reservieren': 2,
                            'Aktivieren': 2,  // Fallback, wenn Reservieren z.B. umgeschalten wird
                            'Deaktivieren': 2, // Fallback für Pause
                            'Pausieren': 2,
                            'Löschen': 3,
                            'Verlängern': 4,
                            'Verkaufsschild': 5,
                            'drucken': 5,
                            'Duplizieren': 6,
                            'Neu einstellen': 7,
                            'Teilen': 8
                        };

                        const getOrder = (li) => {
                            const text = li.textContent || '';
                            for (const [key, val] of Object.entries(orderMap)) {
                                if (text.includes(key)) return val;
                            }
                            return 99; // Unbekannte Buttons reihen sich ganz am Ende ein
                        };

                        // Hole alle <li> Container (die die Buttons umschließen) und sortiere sie
                        const listItems = Array.from(container.children);
                        listItems.sort((a, b) => getOrder(a) - getOrder(b));
                        
                        // Setze sie in der neu sortierten Reihenfolge wieder ein
                        listItems.forEach(li => container.appendChild(li));
                    }
                }

                // Button-Styling und Icon-Injection (läuft periodisch über interval für nahtloses Toggle)
                Array.from(container.querySelectorAll('a, button')).forEach(btn => {
                    if (!btn.classList.contains('custom-purple-btn')) {
                        if (!btn.classList.contains('custom-native-btn-detail')) {
                            btn.classList.add('custom-native-btn-detail');
                        }
                        
                        const text = btn.textContent;
                        // Prüfen, ob das Icon fehlt oder der Text sich geändert hat (z.B. nach Toggle-Klick)
                        const needsInjection = !btn.dataset.iconInjected || !btn.querySelector('svg');
                        
                        if (needsInjection) {
                            btn.dataset.iconInjected = 'true';
                            
                            // Verkaufsschild (auf Detailseite)
                            if (text.includes('drucken') || text.includes('Verkaufsschild')) {
                                btn.innerHTML = `${klPrinterSvg}<span>Verkaufsschild</span>`;
                                
                                // Verhindert das Deaktivieren des Verkaufsschild-Buttons auf der Detailseite extrem zuverlässig
                                if (isDetailPage) {
                                    const preventDisable = () => {
                                        if (btn.hasAttribute('disabled') || btn.classList.contains('is-disabled')) {
                                            btn.removeAttribute('disabled');
                                            btn.classList.remove('is-disabled');
                                            btn.style.pointerEvents = 'auto';
                                            btn.style.opacity = '1';
                                        }
                                    };
                                    
                                    // Timeout fallback nach Klick
                                    btn.addEventListener('click', () => {
                                        setTimeout(preventDisable, 10);
                                        setTimeout(preventDisable, 100);
                                        setTimeout(preventDisable, 500);
                                    });
                                    
                                    // Permanenter MutationObserver, falls Kleinanzeigen-Scripts später eingreifen
                                    if (!btn.dataset.observerAttached) {
                                        btn.dataset.observerAttached = 'true';
                                        const observer = new MutationObserver(preventDisable);
                                        observer.observe(btn, { attributes: true, attributeFilter: ['disabled', 'class'] });
                                    }
                                }
                            } 
                            // Reservieren
                            else if (text.includes('Reservieren')) {
                                btn.innerHTML = `${klFlagSvg}<span>Reservieren</span>`;
                            } 
                            // Aktivieren (z.B. nach Klick auf Reservieren oder Pausieren)
                            else if (text.includes('Aktivieren')) {
                                const klPlaySvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 block align-middle" style="width: 14px; height: 14px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
                                btn.innerHTML = `${klPlaySvg}<span>Aktivieren</span>`;
                            } 
                            // Deaktivieren / Pausieren
                            else if (text.includes('Deaktivieren') || text.includes('Pausieren')) {
                                const klPauseSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 block align-middle" style="width: 14px; height: 14px;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
                                btn.innerHTML = `${klPauseSvg}<span>Deaktivieren</span>`;
                            } 
                            // Verlängern
                            else if (text.includes('Verlängern')) {
                                btn.innerHTML = `${klReactivateSvg}<span>Verlängern</span>`;
                            }
                        }

                        // Verlängern Tooltip Logik (wird immer geprüft, da sich der disabled Status ändern kann)
                        if (text.includes('Verlängern')) {
                            if (btn.hasAttribute('disabled') || btn.getAttribute('aria-disabled') === 'true' || btn.classList.contains('is-disabled')) {
                                btn.setAttribute('data-custom-tooltip', 'Du kannst deine Anzeigen innerhalb von 8\nTagen vor Ablauf um 60 Tage verlängern.');
                                btn.removeAttribute('title');
                                btn.onclick = (e) => e.preventDefault();
                            } else {
                                btn.removeAttribute('title');
                                btn.removeAttribute('data-custom-tooltip');
                                btn.onclick = null;
                            }
                        }
                    }
                });

                // ====================================================
                // --- 2. ÜBERSICHTS-SEITEN REDESIGN (GRID) ---
                // ====================================================
                if (isOverviewPage) {
                    const card = container.closest('li[data-testid="ad-card"]');
                    if (card) {
                        const footer = card.querySelector('footer');
                        const infoCol = card.querySelector('.pl-medium.align-top');
                        
                        if (infoCol) {
                            // --- EINBAU DES TEILEN-BUTTONS IN SPALTE 2 ---
                            if (shareBtnEl && !shareBtnEl.parentElement) {
                                let priceEl = card.querySelector('.text-title3');
                                if (!priceEl) {
                                    priceEl = Array.from(card.querySelectorAll('li, p, span, div')).find(el => 
                                        (el.textContent.includes('€') || el.textContent.includes('VB')) &&
                                        !el.classList.contains('custom-shipping-info') &&
                                        el.children.length === 0
                                    );
                                }
                                if (priceEl) {
                                    // Flexbox Setup mit space-between, drückt den Button garantiert ganz nach rechts
                                    priceEl.classList.add('has-custom-btn');
                                    
                                    // Wrapper für den Content links (Preis + Versand)
                                    const leftContent = document.createElement('div');
                                    leftContent.style.display = 'flex';
                                    leftContent.style.alignItems = 'center';
                                    leftContent.style.gap = '4px';
                                    leftContent.style.flexWrap = 'nowrap';
                                    
                                    // Verschiebe existierenden Inhalt in den linken Wrapper
                                    while (priceEl.firstChild) {
                                        leftContent.appendChild(priceEl.firstChild);
                                    }
                                    
                                    priceEl.appendChild(leftContent);
                                    priceEl.appendChild(shareBtnEl);
                                } else {
                                    shareBtnEl.style.marginLeft = 'auto';
                                    infoCol.appendChild(shareBtnEl);
                                }
                            }

                            // --- EINBAU DES VERKAUFSSCHILD-BUTTONS IN SPALTE 2 ---
                            if (printBtn && !printBtn.parentElement) {
                                let bottomRow = infoCol.querySelector('.custom-bottom-row');
                                if (!bottomRow) {
                                    bottomRow = document.createElement('div');
                                    bottomRow.className = 'custom-bottom-row';
                                    bottomRow.style.display = 'flex';
                                    bottomRow.style.justifyContent = 'space-between'; // Drückt links und rechts auseinander
                                    bottomRow.style.alignItems = 'center';
                                    bottomRow.style.marginTop = '0px'; 
                                    bottomRow.style.width = '100%';
                                    infoCol.appendChild(bottomRow);
                                } else {
                                    bottomRow.style.justifyContent = 'space-between';
                                }
                                bottomRow.appendChild(printBtn);
                            }
                            
                            if (footer) {
                                const mainWrapper = infoCol.parentElement;
                                
                                const featureSection = card.querySelector('#feature-offer-section');
                                if (featureSection) featureSection.remove();
                                
                                const oldCardFooterWrapper = card.querySelector('.card-footer');

                                const newFooterDiv = document.createElement('div');
                                newFooterDiv.className = 'mt-xsmall custom-action-area';
                                newFooterDiv.style.display = 'flex';
                                newFooterDiv.style.flexDirection = 'column';
                                newFooterDiv.style.justifyContent = 'center';
                                newFooterDiv.style.height = '100%';
                                
                                while (footer.firstChild) {
                                    newFooterDiv.appendChild(footer.firstChild);
                                }

                                const dividerDiv2 = document.createElement('div');
                                dividerDiv2.style.background = '#e0e0e0';
                                dividerDiv2.style.width = '1px';
                                dividerDiv2.style.height = '110px'; 

                                const statsContainer = document.createElement('div');
                                statsContainer.className = 'custom-stats-area align-top';
                                statsContainer.style.display = 'flex';
                                statsContainer.style.flexDirection = 'column';
                                statsContainer.style.height = '100%';

                                const analyseHeader = document.createElement('div');
                                analyseHeader.className = 'mb-xsmall text-bodySmall text-onSurfaceNonessential';
                                analyseHeader.style.textDecoration = 'underline';
                                analyseHeader.textContent = 'Anzeigenanalyse';
                                statsContainer.appendChild(analyseHeader);

                                let statsSection = infoCol.querySelector('section.text-onSurfaceNonessential') || infoCol.querySelector('section[class*="text-onSurfaceNonessential"]');
                                if (!statsSection) {
                                    statsSection = document.createElement('section');
                                    statsSection.className = 'text-bodySmall text-onSurfaceNonessential';
                                }
                                
                                statsSection.style.marginTop = '0'; 
                                statsSection.style.display = 'flex';
                                statsSection.style.flexDirection = 'column';
                                statsSection.style.gap = '12px'; 
                                statsSection.style.height = '100%';
                                statsContainer.appendChild(statsSection);

                                const dividerDiv1 = document.createElement('div');
                                dividerDiv1.style.background = '#e0e0e0';
                                dividerDiv1.style.width = '1px';
                                dividerDiv1.style.height = '110px'; 
                                
                                mainWrapper.className = "grid w-full custom-ad-grid";
                                
                                const originalHeader = infoCol.querySelector('.mb-xsmall.text-bodySmall.text-onSurfaceNonessential');
                                if (originalHeader) {
                                    originalHeader.style.textDecoration = 'underline';
                                }

                                mainWrapper.appendChild(dividerDiv1);
                                mainWrapper.appendChild(statsContainer);
                                mainWrapper.appendChild(dividerDiv2);
                                mainWrapper.appendChild(newFooterDiv);

                                footer.remove();
                                if (oldCardFooterWrapper) oldCardFooterWrapper.remove();
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
                        await new Promise(r => setTimeout(r, 800)); 

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
                                                let visitors = 0;
                                                let watchers = 0;
                                                let endDateStr = "Unbekannt";

                                                // Robuste Datumssuche für "Endet am" - Suchbereich auf 'card' erweitert
                                                const oldEndDateSpan = card.querySelector('.managead-listitem-enddate');
                                                if (oldEndDateSpan) {
                                                    endDateStr = oldEndDateSpan.textContent.replace(/Endet am/i, '').trim();
                                                    // Versteckt das originale Element, damit es nicht doppelt im UI auftaucht
                                                    if (oldEndDateSpan.parentElement) oldEndDateSpan.parentElement.style.display = 'none';
                                                }

                                                // Originale Statistiken extrahieren und dann das alte Element entfernen
                                                const originalStatsUl = statsSection.querySelector('ul');
                                                if (originalStatsUl) {
                                                    const statItems = originalStatsUl.querySelectorAll('li');
                                                    statItems.forEach(li => {
                                                        const text = li.textContent.trim();
                                                        if(text.includes('Besucher')) {
                                                            let match = text.match(/\d+/);
                                                            if(match) visitors = parseInt(match[0], 10);
                                                        }
                                                        else if(text.toLowerCase().includes('gemerkt')) {
                                                            let match = text.match(/\d+/);
                                                            if(match) watchers = parseInt(match[0], 10);
                                                        }
                                                        else if (endDateStr === "Unbekannt" && text.includes('Endet am')) {
                                                            endDateStr = text.replace(/Endet am/i, '').trim();
                                                        }
                                                    });
                                                    
                                                    // Entfernt die alte von Kleinanzeigen generierte Liste komplett!
                                                    originalStatsUl.remove();
                                                }
                                                
                                                // Fallback für Endet-am, falls das Format extrem abweicht
                                                if (endDateStr === "Unbekannt") {
                                                     const matchFallback = card.textContent.match(/Endet am\s*([\d\.]+)/i);
                                                     if (matchFallback) endDateStr = matchFallback[1];
                                                }

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

                                                // Ampelsystem Logik
                                                let daysColor = '#008000'; // Grün
                                                if (daysOnline >= 21 && daysOnline <= 34) {
                                                    daysColor = '#FFA500'; // Gelb
                                                } else if (daysOnline >= 35) {
                                                    daysColor = '#FF0000'; // Rot
                                                }
                                            
                                                const avgVisitors = (visitors / daysOnline).toFixed(1).replace('.0', '').replace('.', ',');
                                                const avgWatchers = (watchers / daysOnline).toFixed(1).replace('.0', '').replace('.', ',');

                                                let analyseGrid = statsSection.querySelector('.custom-analyse-grid');
                                                if (!analyseGrid) {
                                                    analyseGrid = document.createElement('div');
                                                    analyseGrid.className = 'custom-analyse-grid';
                                                    statsSection.appendChild(analyseGrid);
                                                }

                                                const svgClass = "shrink-0 block align-middle";
                                                const iconErstellt = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}" style="width: 14px; height: 14px;"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>`;
                                                const iconEndet = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}" style="width: 14px; height: 14px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
                                                const iconOnline = `<svg viewBox="0 0 24 24" fill="none" stroke="${daysColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}" style="width: 14px; height: 14px;"><rect x="3" y="2" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="1" x2="16" y2="6"></line><line x1="8" y1="1" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
                                                const iconBesucher = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
                                                const iconMerkliste = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
                                                const iconAvgVis = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}"><svg x="0" y="0" width="18" height="18" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg><svg x="7" y="9" width="16" height="16" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg></svg>`;
                                                const iconAvgWat = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}"><svg x="0" y="0" width="18" height="18" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg><svg x="7" y="9" width="16" height="16" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg></svg>`;
                                                const iconId = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>`;

                                                const makeItem = (icon, text, tooltip, color) => `
                                                    <div class="custom-analyse-item" title="${tooltip}">
                                                        ${icon ? `<span class="custom-stat-label" ${color ? `style="color:${color};"` : ''}>${icon}</span>` : ''}
                                                        <span class="custom-stat-value" ${color ? `style="color:${color}; font-weight:bold;"` : ''}>${text}</span>
                                                    </div>
                                                `;

                                                // Neues sauberes CSS Grid generieren:
                                                analyseGrid.innerHTML = `
                                                    ${makeItem(iconErstellt, details.date || 'Unbekannt', 'Erstellt am')}
                                                    ${makeItem(iconEndet, endDateStr, 'Endet am')}
                                                    ${makeItem(iconOnline, daysOnline === 1 ? '1 Tag' : daysOnline + ' Tage', 'Online seit', daysColor)}
                                                    
                                                    ${makeItem(iconBesucher, visitors + ' Besucher', 'Besucher')}
                                                    ${makeItem(iconMerkliste, watchers + 'x gemerkt', 'Merkliste')}
                                                    <div></div>
                                                    
                                                    ${makeItem(iconAvgVis, avgVisitors + ' pro Tag', 'Besucher pro Tag')}
                                                    ${makeItem(iconAvgWat, avgWatchers + ' pro Tag', 'Gemerkt pro Tag')}
                                                    <div></div>
                                                    
                                                    ${makeItem(iconId, 'Anzeigen-ID', 'Anzeigen-ID')}
                                                    ${makeItem('', adId, 'Anzeigen-ID')}
                                                    <div></div>
                                                `;
                                            }

                                            if (details.location && infoColTarget && !infoColTarget.querySelector('.custom-loc-ul')) {
                                                const locUl = document.createElement('ul');
                                                locUl.className = 'm-none flex min-h-[22px] list-none gap-x-xsmall p-none custom-loc-ul text-bodySmall text-onSurfaceNonessential';
                                                locUl.style.flexWrap = 'nowrap'; // Geändert auf nowrap, um alles auf einer Linie zu halten
                                                locUl.style.alignItems = 'center';

                                                const svgClass = "shrink-0 block align-middle text-onSurfaceNonessential";
                                                locUl.innerHTML = `
                                                    <li class="custom-analyse-item" title="Ort">
                                                        <span class="inline-block-icon" style="display: flex; align-items: center;">
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${svgClass}" style="width: 16px !important; height: 16px !important;">
                                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                                <circle cx="12" cy="10" r="3"></circle>
                                                            </svg>
                                                        </span>
                                                        <span style="font-weight: normal;">${details.location}</span>
                                                    </li>
                                                `;
                                                
                                                // Location in die neue untere Zeile (zusammen mit dem Verkaufsschild-Button) einfügen
                                                let bottomRow = infoColTarget.querySelector('.custom-bottom-row');
                                                if (bottomRow) {
                                                    const printB = bottomRow.querySelector('.custom-icon-only-btn');
                                                    if (printB) {
                                                        bottomRow.insertBefore(locUl, printB);
                                                    } else {
                                                        bottomRow.appendChild(locUl);
                                                    }
                                                } else {
                                                    locUl.style.marginTop = '0px'; 
                                                    infoColTarget.appendChild(locUl);
                                                }
                                            }

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
                                                    
                                                    // Die Info in den korrekten Container setzen (den linken Teil, falls Flexbox aktiv)
                                                    const leftContent = priceEl.querySelector('div');
                                                    if (leftContent) {
                                                        leftContent.appendChild(span);
                                                    } else {
                                                        priceEl.appendChild(span);
                                                    }
                                                }
                                            }

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
                                                        
                                                        let slug = details.catSlug;
                                                        if (!slug) {
                                                            slug = catText.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                                                        }
                                                        
                                                        const catLinkUrl = `https://www.kleinanzeigen.de/s-${slug}/${plz}/c${catId}l${locId}r10`;
                                                        
                                                        const lupeSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="#5A33AE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px; flex-shrink: 0; margin-top: 1px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
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
                localStorage.setItem('__KL_AUTO_REDIRECT', 'true');
                showLoading();
                saveBtn.click();
            };

            const btnDup = createBtn('Duplizieren', klDupSvg, (e) => doAction(e, 'duplicate'));
            const btnRelist = createBtn('Neu einstellen', klRelistSvg, (e) => doAction(e, 'relist'));

            saveBtn.after(btnDup, btnRelist);
            
            // NEU: Standard-Speichern fangen und auf Übersicht umleiten
            saveBtn.addEventListener('click', () => {
                if (!window.__KL_ACTION) {
                    localStorage.setItem('__KL_AUTO_REDIRECT', 'true');
                    
                    // Fallback: Falls die Validierung fehlschlägt, den Redirect bei nächster Interaktion abbrechen
                    const resetRedirect = (e) => {
                        // Ignoriere Interaktionen mit dem automatischen Werbe-Popup
                        if (e.target && e.target.textContent && e.target.textContent.includes('Ohne Hochschieben')) return;
                        localStorage.removeItem('__KL_AUTO_REDIRECT');
                        document.removeEventListener('input', resetRedirect);
                        document.removeEventListener('click', resetRedirect);
                    };
                    
                    setTimeout(() => {
                        document.addEventListener('input', resetRedirect);
                        document.addEventListener('click', resetRedirect);
                    }, 1500);
                }
            });

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
    // PAGINIERUNG (Suche) SYNC & ZENTRIERUNG
    // ==========================================
    if (isSearchPage) {
        setInterval(() => {
            const bottomContainer = document.getElementById('srchrslt-pagination');
            if (!bottomContainer) return;

            const currentHTML = bottomContainer.innerHTML;
            let topContainer = document.getElementById('custom-top-pagination-search');

            if (!topContainer) {
                topContainer = document.createElement('div');
                topContainer.id = 'custom-top-pagination-search';
                
                // Styling identisch zur unteren Leiste
                topContainer.className = bottomContainer.className;
                topContainer.style.paddingTop = '0px';
                topContainer.style.paddingBottom = '16px';
                topContainer.style.width = '100%';
                topContainer.style.display = 'flex';
                topContainer.style.justifyContent = 'center';
                topContainer.style.zIndex = '10';

                // Wir positionieren die neue Navigation exakt VOR der Liste der Suchergebnisse
                const adList = document.querySelector('#srchrslt-adtable');
                if (adList && adList.parentNode) {
                    adList.parentNode.insertBefore(topContainer, adList);
                } else {
                    return; // Falls die Liste noch nicht im DOM ist, beim nächsten Interval probieren
                }

                // Event Listener für geklonte Navigation
                topContainer.addEventListener('click', (e) => {
                    const spanWithUrl = e.target.closest('[data-url]');
                    if (spanWithUrl) {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = spanWithUrl.getAttribute('data-url');
                    }
                    // Info: Klicks auf native "a[href]" Links navigieren automatisch und müssen nicht abgefangen werden
                });
            }

            if (topContainer.dataset.sourceHtml !== currentHTML) {
                topContainer.dataset.sourceHtml = currentHTML;
                
                // Scripts blocken, damit Kleinanzeigens Pagination-Skript nicht versehentlich doppelt an den Knoten feuert
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = currentHTML;
                tempDiv.querySelectorAll('script').forEach(s => s.remove());
                tempDiv.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
                
                topContainer.innerHTML = tempDiv.innerHTML;
            }
        }, 500);
    }

    // ==========================================
    // AUTO-SAVE VERARBEITUNG
    // ==========================================
    if (isEditPage) {
        // --- Automatisches Wegklicken des Werbe-Popups ---
        const startSkipObserver = () => {
            if (!document.body) {
                requestAnimationFrame(startSkipObserver);
                return;
            }
            const skipObserver = new MutationObserver(() => {
                const skipBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Ohne Hochschieben weiter'));
                if (skipBtn && !skipBtn.dataset.autoClicked) {
                    skipBtn.dataset.autoClicked = 'true';
                    localStorage.setItem('__KL_AUTO_REDIRECT', 'true'); // Sicherstellen, dass der Redirect nach dem Popup läuft
                    skipBtn.click();
                }
            });
            skipObserver.observe(document.body, { childList: true, subtree: true });
        };
        startSkipObserver();

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
                    }
                }, 800);
            });
        }
    }

    // ==========================================
    // LÖSCHEN, REDIRECT & NETWORK INTERCEPTOR
    // ==========================================
    const shouldAutoRedirect = localStorage.getItem('__KL_AUTO_REDIRECT') === 'true';
    const delId = localStorage.getItem('__KL_PENDING_DELETE');

    // Falls der User den Prozess abbricht und manuell zur Übersicht wechselt: Status bereinigen
    if (isOverviewPage && !delId) {
        localStorage.removeItem('__KL_AUTO_REDIRECT');
    }

    // Abfangen der Zielseiten, um Seiten-Flackern beim Redirect zu verhindern
    if (shouldAutoRedirect && (isConfirmPage || isDetailPage)) {
        document.documentElement.style.opacity = '0'; // Seite sofort unsichtbar schalten
        
        window.addEventListener('DOMContentLoaded', () => {
            document.documentElement.style.opacity = '1';
            const spinner = document.createElement("div");
            Object.assign(spinner.style, {
                height: '100%', width: '100%', position: 'fixed', top: '0', left: '0',
                zIndex: '999999', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(5px)'
            });
            spinner.innerHTML = '<div style="font-size: 20px; font-weight: bold; padding: 30px; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); color: #86B817; text-align: center;">Aktion erfolgreich!<br><span style="font-size: 14px; color: #666; font-weight: normal; margin-top: 10px; display: block;">Rückkehr zur Übersicht...</span></div>';
            document.body.innerHTML = ''; // Entfernt Original-Body um Popups/Upsells zu blocken
            document.body.appendChild(spinner);
        });
    }

    // WICHTIG: Die Löschung darf nicht nur auf isConfirmPage geprüft werden!
    // Kleinanzeigen leitet manchmal direkt auf die neue Detailseite weiter.
    if (delId && (isConfirmPage || isDetailPage || isOverviewPage)) {
        localStorage.removeItem('__KL_PENDING_DELETE'); // Verhindert mehrfaches Auslösen

        (async () => {
            let token = document.querySelector('meta[name="_csrf"]')?.content;
            
            // Failsafe: Falls die Zielseite (z.B. Detailseite) keinen CSRF-Token im Head hat,
            // holen wir ihn uns schnell unsichtbar von der Übersichtsseite.
            if (!token) {
                try {
                    const response = await fetch('/m-meine-anzeigen.html');
                    const html = await response.text();
                    const match = html.match(/<meta\s+name="_csrf"\s+content="([^"]+)"/i);
                    if (match) token = match[1];
                } catch(e) {
                    console.error('Fehler beim Holen des CSRF Tokens:', e);
                }
            }

            if (token) {
                try {
                    await fetch(`/m-anzeigen-loeschen.json?ids=${delId}`, { 
                        method: 'POST', 
                        headers: { 'x-csrf-token': token }
                    });
                } catch(e) {
                    console.error('Fehler beim Löschen der alten Anzeige:', e);
                }
            }

            // Nach Abschluss navigieren
            if (shouldAutoRedirect && !isOverviewPage) {
                localStorage.removeItem('__KL_AUTO_REDIRECT');
                window.location.replace('/m-meine-anzeigen.html');
            } else if (isOverviewPage && shouldAutoRedirect) {
                localStorage.removeItem('__KL_AUTO_REDIRECT');
                window.location.reload();
            }
        })();
    } else if (shouldAutoRedirect && (isConfirmPage || isDetailPage)) {
        // Failsafe: Nur Redirect, wenn nichts gelöscht werden muss
        localStorage.removeItem('__KL_AUTO_REDIRECT');
        window.location.replace('/m-meine-anzeigen.html');
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
