// ==UserScript==
// @name          Kleinanzeigen - Anzeige duplizieren / neu einstellen
// @namespace     https://github.com/Zer089/Kleinanzeigen.de-Anzeige_duplizieren_neu_einstellen
// @description   Bietet eine "Anzeige duplizieren / neu einstellen" Funktion beim Bearbeiten einer vorhandenen Anzeige in Kleinanzeigen.
// @icon          https://play-lh.googleusercontent.com/PuqeuAmOMsDoB9gRCVr-EQHthinCbtaKPzMbxabfmCY9RI9r1fmWncCb4k6umBszzPaszT_o2RopSpIhy9BAiQ=w240-h480-rw
// @copyright     2026, Andi (Zer089)
// @license       MIT
// @version       2.6.130
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

    // Globale Filter-Status
    window.__KL_ACTIVE_AGE_FILTER = 'all';

    // Hält ein sauberes Template für die JSON-API bereit
    let pristineTemplate = null;

    // Robuste Erkennung von Anzeigekarten ohne IDs
    function __getKLAds(context = document) {
        const ads = Array.from(context.querySelectorAll('li')).filter(li => {
            const hasAdLink = li.querySelector('a[href*="/s-anzeige/"]');
            const hasEditLink = li.querySelector('a[href*="/p-anzeige-bearbeiten.html"], a[href*="adId="], button[data-url*="adId="]');
            const isInnerLi = li.parentElement && li.parentElement.closest('li');
            return hasAdLink && hasEditLink && !isInnerLi && !li.closest('#custom-share-overlay');
        });

        // Speichere das allererste saubere Element als Template für den JSON-Fetch
        if (ads.length > 0 && !pristineTemplate && context === document) {
            const cleanAd = ads.find(ad => !ad.dataset.klInjected && !ad.dataset.klDetailsInjected);
            if (cleanAd) pristineTemplate = cleanAd.cloneNode(true);
        }

        return ads;
    }

    // Original Kleinanzeigen & Eigene SVGs für saubere Button-Fluchtung
    const klPrinterSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 block align-middle pointer-events-none" style="width: 14px; height: 14px;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>`;
    const klFlagSvg = `<svg viewBox="0 0 24 24" fill="none" data-title="reservedOutline" stroke="none" role="img" aria-hidden="true" focusable="false" class="shrink-0 fill-current block align-middle pointer-events-none" style="width: 14px; height: 14px;"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.97961 2H18.187C18.5696 2 18.9172 2.22734 19.077 2.58214C19.2369 2.93694 19.1798 3.35428 18.9308 3.65079L15.4081 7.84615L18.9308 12.0415C19.1798 12.338 19.2369 12.7554 19.077 13.1102C18.9172 13.465 18.5696 13.6923 18.187 13.6923H5.95922V21C5.95922 21.5523 5.52063 22 4.97961 22C4.43859 22 4 21.5523 4 21V3C4 2.44772 4.43859 2 4.97961 2ZM5.95922 11.6923H16.0572L13.3741 8.49694C13.0597 8.12245 13.0597 7.56985 13.3741 7.19536L16.0572 4H5.95922V11.6923Z" fill="currentColor"></path></svg>`;
    const klReactivateSvg = `<svg viewBox="0 0 24 24" fill="none" data-title="reactivate" stroke="none" role="img" aria-hidden="true" focusable="false" class="shrink-0 fill-current block align-middle pointer-events-none" style="width: 14px; height: 14px;"><path d="M14.7071 5.70711C14.9032 5.51106 15.0008 5.25386 15 4.99691C14.9993 4.74196 14.9016 4.48723 14.7071 4.29271L14.6954 4.28122L12.7071 2.29289C12.3166 1.90237 11.6834 1.90237 11.2929 2.29289C10.9024 2.68342 10.9024 3.31658 11.2929 3.70711L11.5947 4.00896C6.81226 4.22089 3 8.16524 3 13C3 17.9706 7.02944 22 12 22C16.2413 22 19.7973 19.0663 20.7495 15.1174C20.8914 14.5288 20.4158 14 19.8103 14C19.3047 14 18.8838 14.3748 18.7495 14.8624C17.9341 17.8243 15.2211 20 12 20C8.13401 20 5 16.866 5 13C5 9.27746 7.90573 6.2336 11.5728 6.01282L11.2929 6.29271C10.9024 6.68323 10.9024 7.3164 11.2929 7.70692C11.6834 8.09745 12.3166 8.09745 12.7071 7.70692L14.6954 5.71862L14.7071 5.70711Z" fill="currentColor"></path></svg>`;
    const klDupSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 block align-middle pointer-events-none" style="width: 14px; height: 14px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    const klRelistSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 block align-middle pointer-events-none" style="width: 14px; height: 14px;"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>`;
    const klShareSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 block align-middle pointer-events-none" style="width: 14px; height: 14px;"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>`;
    const klEditSvg = `<svg viewBox="0 0 24 24" fill="none" data-title="edit" stroke="none" role="img" aria-hidden="true" focusable="false" class="shrink-0 fill-current block align-middle pointer-events-none" style="width: 14px; height: 14px;"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.0608 19.9393C9.68568 20.3143 9.17697 20.5251 8.64654 20.5251H5.02522C4.70508 20.5251 4.39805 20.3979 4.17167 20.1715C3.94529 19.9451 3.81812 19.6381 3.81812 19.318L3.81812 15.6966C3.81812 15.1662 4.02883 14.6575 4.4039 14.2824L15.4854 3.20095C16.6569 2.02937 18.5564 2.02937 19.728 3.20095L21.1422 4.61516C22.3138 5.78673 22.3138 7.68623 21.1422 8.8578L10.0608 19.9393ZM16.1925 5.32225L16.8996 4.61516C17.2901 4.22463 17.9233 4.22463 18.3138 4.61516L19.728 6.02937C20.1185 6.4199 20.1185 7.05306 19.728 7.44359L8.64654 18.5251L5.81811 18.5251L5.81812 15.6966L14.7783 6.73647C14.7868 6.73995 15.9787 7.22985 16.546 7.79711C17.1153 8.36639 17.6067 9.56488 17.6067 9.56488L19.0209 8.15066C19.0209 8.15066 18.5295 6.95218 17.9602 6.3829C17.393 5.81564 16.201 5.32573 16.1925 5.32225Z" fill="currentColor"></path></svg>`;
    const klTrashSvg = `<svg viewBox="0 0 24 24" fill="none" data-title="trashOutline" stroke="none" role="img" aria-hidden="true" focusable="false" class="shrink-0 fill-current block align-middle pointer-events-none" style="width: 14px; height: 14px;"><path d="M10 9C9.44772 9 9 9.44772 9 10V18C9 18.5523 9.44772 19 10 19 10.5523 19 11 18.5523 11 18V10C11 9.44772 10.5523 9 10 9ZM14 9C13.4477 9 13 9.44772 13 10V18C13 18.5523 13.4477 19 14 19 14.5523 19 15 18.5523 15 18V10C15 9.44772 14.5523 9 14 9Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M8 5.84375C8.08207 3.70703 9.84019 2 11.997 2C14.1538 2 15.9119 3.70703 15.994 5.84375H21V7.84375H19V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V7.84375H3V5.84375H8ZM11.997 4C13.049 4 13.9113 4.81221 13.991 5.84375H10.003C10.0827 4.81221 10.945 4 11.997 4ZM7 8H17V20H7L7 8Z" fill="currentColor"></path></svg>`;

    // ==========================================
    // CSS INJECTION (Design & Layout)
    // ==========================================
    const style = document.createElement('style');
    style.textContent = `
        /* Werbe- & Upsell-Säuberung (Cookie-Banner geschützt durch :not) */
        fieldset:has(#ad-feature-group), span:has(> div.bg-accentContainer), #feature-offer-section,
        .site-base--left-banner--full, .site-base--right-banner--full,
        #vip-billboard, #vip-belly, #vip-middle, #vip-bottom, #btf-billboard, #home-billboard,
        #srchrslt-adtop, #srchrslt-adtop--flex, [data-testid="top-banner"],
        #srpb-top-banner, .mb-small:has(#srpb-top-banner),
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

        /* Unerwünschte Container ausblenden */
        [data-testid="revision-container"] { display: none !important; }

        /* Schützt den Cookie-Banner zusätzlich explizit */
        #gdpr-banner-container, dialog#gdpr-banner { display: block !important; visibility: visible !important; }

        section[data-testid="page-container"] { margin-bottom: 0px !important; }

        /* Verstecke Kleinanzeigen Original-Elemente */
        .flex.text-bodySmall.my-xsmall.text-onSurface { display: none !important; }

        .kl-search-hidden { display: none !important; }

        /* Allgemeine Abstands-Korrekturen */
        .relative.mb-small.box-border.min-h-\\[10px\\].rounded-xsmall.text-onSurfaceSubdued { margin-bottom: 0px !important; }
        #tab-panel-all, [aria-labelledby="tabs-all"] { margin-top: 6px !important; }
        .text-left.text-bodySmall.text-onSurfaceNonessential { row-gap: 3px !important; }

        .mx-none.my-xsmall.text-title4 { margin-top: 0px !important; margin-bottom: 0px !important; }
        .mb-xsmall.text-bodySmall.text-onSurfaceNonessential { margin-bottom: 3px !important; }
        .custom-bottom-row { margin-top: 0px !important; }

        .jsx-1105488430.l-page-wrapper.l-container-row,
        .l-page-wrapper.l-container-row { padding-bottom: 0px !important; margin-bottom: 0px !important; padding-top: 12px !important; }

        .jsx-1105488430.flex.justify-center.py-small,
        .flex.justify-center.py-small { height: 45px !important; box-sizing: border-box !important; }

        /* MwSt.-Hinweis und Paginierung in der Reihenfolge tauschen */
        div:has(> .align-right.l-container-row.text-bodySmall):has(> .flex.justify-center.py-small) { display: flex !important; flex-direction: column !important; }
        .align-right.l-container-row.text-bodySmall { order: 2 !important; margin-top: -20px !important; }
        .flex.justify-center.py-small { order: 1 !important; }

        #custom-ad-search-input::placeholder { color: #8c8c8c !important; opacity: 1 !important; }

        /* Grid und Breiten Fixes (Mit Scrollbar-Korrektur!) */
        html { overflow-y: scroll !important; } /* Behebt das Breiten-Zucken beim Filtern */

        html.is-wide-page body .site-base,
        html.is-wide-page body .grid-cols-\\[1fr_970px_1fr\\] { grid-template-columns: 1fr minmax(auto, 1100px) 1fr !important; }

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
        html.is-wide-page body main .max-w-screen-custom { width: 100% !important; max-width: 1100px !important; margin-left: auto !important; margin-right: auto !important; box-sizing: border-box !important; }

        html.is-wide-page body main .w-\\[970px\\],
        html.is-wide-page body main div[class*="w-[970px]"] { width: 100% !important; max-width: 1100px !important; margin-left: auto !important; margin-right: auto !important; }

        html.is-wide-page body #homepage-main,
        html.is-wide-page body #srchrslt-content,
        html.is-wide-page body main .w-\\[700px\\],
        html.is-wide-page body main .w-\\[728px\\],
        html.is-wide-page body main div[class*="w-[700px]"],
        html.is-wide-page body main main[class*="w-[728px]"],
        html.is-wide-page body #main > div:nth-child(2) { width: 100% !important; max-width: none !important; flex: 1 1 0% !important; }

        html.is-wide-page body ul#my-manageitems-adlist,
        html.is-wide-page body li[data-testid="ad-card"] { width: 100% !important; max-width: 1100px !important; margin-left: 0 !important; margin-right: 0 !important; box-sizing: border-box !important; }

        /* Titel Limitierung (2 Zeilen) */
        .is-overview-page .custom-ad-grid .text-title4 {
            display: -webkit-box !important; -webkit-line-clamp: 2 !important; -webkit-box-orient: vertical !important;
            overflow: hidden !important; text-overflow: ellipsis !important; white-space: normal !important;
            line-height: 1.3 !important; height: 2.6em !important; min-height: 2.6em !important;
        }

        .is-overview-page .custom-ad-grid .text-title3.has-custom-btn {
            display: flex !important; justify-content: space-between !important; align-items: center !important;
            width: 100% !important; margin-top: 0px !important; margin-bottom: 0px !important; flex-shrink: 0 !important;
        }

        .custom-category-link { color: inherit !important; text-decoration: underline !important; transition: color 0.2s; display: inline-flex !important; align-items: flex-start !important; gap: 4px !important; }
        .custom-category-link svg { flex-shrink: 0 !important; margin-top: 1px !important; }
        .custom-category-link:hover { color: #5A33AE !important; }

        .is-detail-page .vip-image-gallery.galleryimage-large { max-width: 970px !important; width: 100% !important; margin-left: 0 !important; }

        /* ====================================================
           NEUES PROFIL DASHBOARD
           ==================================================== */
        .kl-hidden-original { display: none !important; }
        .ownprofile-main.custom-replaced { background: transparent !important; padding: 0 !important; margin-bottom: 0px !important; border: none !important; box-shadow: none !important; }
        .custom-profile-dashboard {
            display: flex; flex-direction: row; column-gap: 18px; background: #ffffff; border: 1px solid #e0e0e0;
            border-radius: 12px; padding: 16px !important; position: relative; overflow: hidden; align-items: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05); box-sizing: border-box; width: 100%; height: 127px !important;
        }
        @media (max-width: 800px) {
            .custom-profile-dashboard { flex-direction: column; gap: 16px; height: auto !important; padding: 16px !important; align-items: flex-start; }
            .cpd-stats-actions-col { height: auto !important; border-left: none !important; border-right: none !important; border-top: 1px solid #e0e0e0; padding-left: 0 !important; padding-right: 0 !important; padding-top: 20px; flex-direction: row; flex-wrap: wrap; width: 100%; justify-content: center; }
            .cpd-actions-block { width: 100%; }
        }
        .custom-profile-dashboard::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 4px; background-color: #86B817; }

        .cpd-avatar-col .user-profile-badge { width: 90px !important; height: 90px !important; border-radius: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important; font-size: 32px !important; font-weight: bold !important; background: #e0e0e0 !important; color: #666 !important; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1) !important; margin: 0 !important; padding: 0 !important; line-height: normal !important; }
        .cpd-avatar-col img { width: 90px; height: 90px; border-radius: 50%; object-fit: cover; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }

        .cpd-info-col { flex: 1; min-width: 250px; display: flex; flex-direction: column; gap: 8px; justify-content: center; }
        .cpd-name-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .cpd-name-row h2 { font-size: 24px !important; font-weight: 700 !important; color: #111 !important; margin: 0 !important; line-height: 1 !important; }

        .cpd-usertype-tag { background: #f5f5f5 !important; color: #444 !important; border: 1px solid #e0e0e0 !important; font-size: 12px !important; padding: 4px 10px !important; border-radius: 999px !important; font-weight: 600 !important; display: flex !important; align-items: center !important; gap: 6px !important; }
        .cpd-usertype-tag svg { width: 14px !important; height: 14px !important; }

        .cpd-badges-row { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; margin: 0; padding: 0; }
        .custom-badge-wrapper { margin: 0 !important; padding: 0 !important; }

        .custom-badge-item { background-color: #f3e8ff !important; color: #6b21a8 !important; font-size: 11px !important; padding: 0 8px !important; border-radius: 9999px !important; font-weight: 400 !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 4px !important; box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important; white-space: nowrap; border: none !important; font-family: inherit !important; height: 24px !important; min-height: 24px !important; line-height: 1 !important; box-sizing: border-box !important; transition: background-color 0.2s !important; }
        .custom-badge-item svg { width: 14px !important; height: 14px !important; flex-shrink: 0 !important; }
        button.custom-badge-item { cursor: pointer !important; }
        button.custom-badge-item:hover { background-color: #e9d5ff !important; text-decoration: underline !important; }
        span.custom-badge-item { cursor: default !important; }
        span.custom-badge-item:hover { text-decoration: underline !important; }

        .cpd-footer-row { display: flex !important; align-items: center !important; flex-wrap: wrap !important; gap: 16px !important; font-size: 13px !important; color: #757575 !important; margin-top: 4px !important; }
        .cpd-footer-item { display: inline-flex !important; align-items: center !important; gap: 6px !important; height: 16px !important; }
        .cpd-footer-item svg { width: 16px !important; height: 16px !important; display: block !important; margin: 0 !important; padding: 0 !important; flex-shrink: 0 !important; }
        .cpd-footer-item-text { display: inline-flex !important; align-items: center !important; height: 16px !important; line-height: 1 !important; transform: translateY(1px); }
        .cpd-footer-item a { color: #111 !important; font-weight: normal !important; text-decoration: none !important; display: inline-flex !important; align-items: center !important; gap: 4px !important; }
        .cpd-footer-item a:hover { text-decoration: underline !important; }

        .cpd-footer-item.follower-item, .cpd-footer-item.follower-item svg { color: rgb(50, 105, 22) !important; }
        .cpd-footer-item.follower-item a { color: rgb(50, 105, 22) !important; text-decoration: none !important; }
        .cpd-footer-item.follower-item a span { text-decoration: none !important; font-weight: normal !important; }
        .cpd-footer-item.follower-item a:hover { text-decoration: underline !important; }

        .cpd-stats-actions-col { display: flex; align-items: center; justify-content: center; border-left: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0; padding-left: 18px; padding-right: 18px; height: 90px !important; }

        .cpd-stats-block { display: flex; flex-direction: column; align-items: center; }
        .cpd-stats-title { font-size: 12px; font-weight: 700; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .cpd-stats-tiles { display: flex; column-gap: 8px; flex-wrap: wrap; justify-content: center; }
        .cpd-tile { display: flex; flex-direction: column; align-items: center; padding: 8px 8px; border-radius: 8px; transition: background 0.2s; min-width: 48px; }
        .cpd-tile:hover { background: #f9f9f9; }
        .cpd-tile-val { font-size: 14px; font-weight: 900; line-height: 1; color: #444; display: flex; align-items: center; justify-content: center; height: 14px; }
        .cpd-tile-val.online { color: #86B817; }
        .cpd-tile-lbl { font-size: 11px; color: #757575; font-weight: 600; text-transform: uppercase; margin-top: 4px; white-space: nowrap; }

        .cpd-actions-block { display: flex; flex-direction: column; gap: 6px; width: 170px; box-sizing: border-box !important; }

        .cpd-action-btn { display: flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important; border-radius: 8px !important; transition: all 0.2s !important; text-decoration: none !important; cursor: pointer !important; box-sizing: border-box !important; }
        .cpd-action-btn.primary { border: 2px solid #e0e0e0 !important; padding: 8px 16px !important; height: 55px !important; min-height: 55px !important; font-size: 14px !important; font-weight: 700 !important; color: #444 !important; background: #fff !important; }
        .cpd-action-btn.primary:hover { border-color: #5A33AE !important; color: #5A33AE !important; }
        .cpd-action-btn.primary svg { width: 16px !important; height: 16px !important; color: #999; transition: color 0.2s; flex-shrink: 0 !important; }
        .cpd-action-btn.primary:hover svg { color: #5A33AE !important; }
        .cpd-action-btn.secondary { background: transparent !important; border: none !important; font-size: 12px !important; font-weight: 600 !important; color: #999 !important; padding: 4px !important; height: 28px !important; line-height: 1 !important; }
        .cpd-action-btn.secondary:hover { color: #666 !important; }
        .cpd-action-btn.secondary svg { display: block !important; flex-shrink: 0 !important; overflow: visible !important; }

        /* BUTTONS */
        .custom-purple-btn { background-color: #5A33AE !important; border-color: #5A33AE !important; color: #ffffff !important; border-radius: 9999px !important; font-weight: bold !important; cursor: pointer !important; gap: 6px !important; text-decoration: none !important; transition: all 0.2s ease-in-out; }
        .custom-purple-btn:hover { background-color: #D1C4E9 !important; border-color: #D1C4E9 !important; color: #5A33AE !important; }

        /* Grid Overview */
        .is-overview-page article.cardbox, .is-overview-page li.cardbox { height: 145px !important; box-sizing: border-box !important; }
        .custom-ad-grid { display: grid !important; width: 100% !important; grid-template-columns: 170px 1fr 1px max-content 1px max-content !important; column-gap: 16px !important; height: 110px !important; }
        .custom-ad-grid > div:first-child, .custom-ad-grid > div:first-child a, .custom-ad-grid .pl-medium.align-top, .custom-stats-area.align-top, .mt-xsmall.custom-action-area { height: 110px !important; box-sizing: border-box !important; }
        .is-overview-page .custom-ad-grid > div:first-child, .is-overview-page .custom-ad-grid > div:first-child > a { width: 170px !important; height: 110px !important; box-sizing: border-box !important; display: flex !important; align-items: center !important; justify-content: center !important; overflow: hidden !important; border-radius: 4px !important; }
        .is-overview-page .custom-ad-grid > div:first-child img { width: 100% !important; height: 100% !important; object-fit: cover !important; border-radius: 4px !important; }

        .custom-ad-grid .pl-medium.align-top { padding-left: 0px !important; padding-right: 0px !important; display: flex !important; flex-direction: column !important; }
        .custom-ad-grid .mt-xsmall { margin-top: 0px !important; }

        /* Dynamic Action Grid */
        .is-overview-page .custom-action-area ul, .is-overview-page .flex.list-none.flex-row.flex-wrap.p-none { display: grid !important; grid-template-columns: max-content max-content !important; column-gap: 8px !important; row-gap: 8px !important; margin: 0 !important; padding: 0 !important; width: max-content !important; justify-content: start !important; height: 110px !important; }
        .is-overview-page .custom-action-area li, .is-overview-page .flex.list-none.flex-row.flex-wrap.p-none li { margin: 0 !important; width: 100% !important; }
        .is-overview-page .custom-action-area li:not(.is-hidden):not(.hidden):not([style*="display: none"]):not([style*="display:none"]), .is-overview-page .flex.list-none.flex-row.flex-wrap.p-none li:not(.is-hidden):not(.hidden):not([style*="display: none"]):not([style*="display:none"]) { display: flex !important; }
        .is-overview-page .custom-action-area li.is-hidden, .is-overview-page .custom-action-area li.hidden, .is-overview-page .custom-action-area li[style*="display: none"], .is-overview-page .custom-action-area li[style*="display:none"] { display: none !important; }

        /* Tooltip */
        [data-custom-tooltip] { position: relative; }
        [data-custom-tooltip]::after { content: attr(data-custom-tooltip); position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%); background-color: #5A33AE; color: #ffffff; padding: 6px 10px; border-radius: 6px; font-size: 12px; white-space: pre; text-align: center; line-height: 1.4; z-index: 1000; pointer-events: none; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-weight: normal; opacity: 0; visibility: hidden; transition: opacity 0.2s, visibility 0.2s; }
        [data-custom-tooltip]::before { content: ''; position: absolute; bottom: calc(100% + 2px); left: 50%; transform: translateX(-50%); border-width: 6px; border-style: solid; border-color: #5A33AE transparent transparent transparent; z-index: 1000; pointer-events: none; opacity: 0; visibility: hidden; transition: opacity 0.2s, visibility 0.2s; }
        [data-custom-tooltip]:hover::after, [data-custom-tooltip]:hover::before { opacity: 1 !important; visibility: visible; }

        @keyframes customPulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .custom-spin { animation: spin 1s linear infinite; }

        /* Icon Buttons */
        .is-overview-page .custom-action-area a, .is-overview-page .custom-action-area button, .is-overview-page .custom-purple-btn, .is-overview-page .custom-native-btn { height: 32px !important; min-height: 32px !important; max-height: 32px !important; padding: 0 12px 0 10px !important; font-size: 12px !important; line-height: 1 !important; margin: 0 !important; box-sizing: border-box !important; border-width: 2px !important; border-radius: 9999px !important; display: inline-flex !important; align-items: center !important; justify-content: flex-start !important; width: 100% !important; gap: 6px !important; text-align: left !important; }
        .is-overview-page .custom-icon-only-btn, .custom-icon-only-btn { width: 24px !important; min-width: 24px !important; max-width: 24px !important; height: 24px !important; min-height: 24px !important; max-height: 24px !important; padding: 0 !important; display: flex !important; justify-content: center !important; align-items: center !important; flex-shrink: 0 !important; gap: 0 !important; border-radius: 9999px !important; border-width: 1px !important; }
        .custom-icon-only-btn span { display: none !important; }
        .custom-icon-only-btn svg { margin: 0 !important; width: 14px !important; height: 14px !important; }
        .has-custom-btn .custom-icon-only-btn { margin-top: -2px !important; transform: translateY(-4px) !important; }

        /* Detailseite Buttons */
        .is-detail-page .custom-purple-btn, .is-detail-page .custom-native-btn-detail { height: 32px !important; min-height: 32px !important; max-height: 32px !important; padding: 0 12px !important; font-size: 12px !important; line-height: 1 !important; margin: 0 !important; box-sizing: border-box !important; border-width: 2px !important; border-radius: 9999px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; }
        .is-detail-page .custom-native-btn-detail { border: 2px solid #95958E !important; background: transparent !important; color: #326916 !important; font-weight: 700 !important; text-decoration: none !important; transition: all 0.2s !important; gap: 6px !important; }
        .is-detail-page .custom-native-btn-detail:not([disabled]):not([aria-disabled="true"]):not(.is-disabled):hover { background-color: #D3F28D !important; border-color: #1D4B00 !important; color: #1D4B00 !important; }
        .is-detail-page .custom-native-btn-detail[disabled], .is-detail-page .custom-native-btn-detail[aria-disabled="true"], .is-detail-page .custom-native-btn-detail.is-disabled { color: rgba(50, 105, 22, 0.5) !important; border-color: rgba(149, 149, 142, 0.5) !important; cursor: not-allowed !important; background: transparent !important; pointer-events: auto !important; }

        .is-detail-page .custom-native-btn-detail.is-hidden, .is-detail-page .custom-native-btn-detail.hidden, .is-detail-page .custom-native-btn-detail.hide, .is-detail-page li.is-hidden .custom-native-btn-detail, .is-detail-page li.hidden .custom-native-btn-detail { display: none !important; }
        #pvap-mngad-actns.list, #pvap-mngad-actns { margin-top: 12px !important; margin-bottom: 6px !important; }
        .is-hidden, .hide, [style*="display: none"], [style*="display:none"] { display: none !important; }

        .is-overview-page .custom-action-area a svg, .is-overview-page .custom-action-area button svg, .is-detail-page .custom-native-btn-detail svg { width: 14px !important; height: 14px !important; flex-shrink: 0 !important; margin: 0 !important; display: block !important; }
        .is-detail-page .custom-native-btn-detail i { margin: 0 !important; }
        .custom-action-area button span, .custom-action-area a span, .is-detail-page .custom-native-btn-detail span, .is-detail-page .custom-purple-btn span { font-size: 12px !important; pointer-events: none !important; }

        .custom-shipping-info { font-size: 13px !important; color: #757575 !important; font-weight: normal !important; white-space: nowrap; border: none !important; }

        /* Analyse Grid Fixed Widths */
        .custom-analyse-grid { display: grid !important; grid-template-columns: 100px 95px 70px !important; column-gap: 8px !important; row-gap: 8px !important; width: 100% !important; margin-top: 4px !important; }
        .custom-analyse-item { display: flex !important; align-items: center !important; gap: 6px !important; white-space: nowrap !important; color: inherit !important; }
        .custom-stat-label { display: inline-flex !important; align-items: center !important; }
        .custom-stat-value { font-weight: normal !important; }

        .is-edit-page .custom-purple-btn { height: 44px !important; min-height: 44px !important; padding: 0 16px !important; font-size: 14px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; border-width: 2px !important; border-style: solid !important; }

        html, body { max-width: 100vw !important; overflow-x: hidden !important; }

        /* ====================================================
           CUSTOM PAGINATION DESIGN (Vollständig versiegelt)
           ==================================================== */
        nav[aria-label*="Seiten-Navigation"], .flex.justify-center.py-small nav, #custom-top-pagination, #custom-top-pagination-search, #srchrslt-pagination { display: flex !important; justify-content: center !important; align-items: center !important; margin-top: 16px !important; margin-bottom: 16px !important; padding: 0 !important; width: auto !important; max-width: none !important; z-index: 1 !important; }
        nav[aria-label*="Seiten-Navigation"] > ul, .flex.justify-center.py-small nav > ul, #custom-top-pagination ul, #custom-top-pagination-search ul, #srchrslt-pagination ul { background-color: #ffffff !important; border: 2px solid #f3f4f6 !important; border-radius: 9999px !important; box-shadow: 0 4px 10px rgba(0,0,0,0.06) !important; padding: 4px !important; display: inline-flex !important; align-items: center !important; gap: 4px !important; margin: 0 !important; list-style: none !important; width: auto !important; max-width: 100% !important; height: auto !important; box-sizing: border-box !important; }
        nav[aria-label*="Seiten-Navigation"] > ul > li, .flex.justify-center.py-small nav > ul > li, #custom-top-pagination ul > li, #custom-top-pagination-search ul > li, #srchrslt-pagination ul > li { margin: 0 !important; padding: 0 !important; display: flex !important; width: 34px !important; height: 34px !important; min-width: 34px !important; min-height: 34px !important; max-width: 34px !important; max-height: 34px !important; flex-shrink: 0 !important; }

        nav[aria-label*="Seiten-Navigation"] > ul > li > a, nav[aria-label*="Seiten-Navigation"] > ul > li > button, nav[aria-label*="Seiten-Navigation"] > ul > li > span, .flex.justify-center.py-small nav > ul > li > a, .flex.justify-center.py-small nav > ul > li > button, .flex.justify-center.py-small nav > ul > li > span, #custom-top-pagination ul > li > a, #custom-top-pagination ul > li > button, #custom-top-pagination ul > li > span, #custom-top-pagination-search ul > li > a, #custom-top-pagination-search ul > li > button, #custom-top-pagination-search ul > li > span, #srchrslt-pagination ul > li > a, #srchrslt-pagination ul > li > button, #srchrslt-pagination ul > li > span { width: 34px !important; height: 34px !important; min-width: 34px !important; min-height: 34px !important; max-width: 34px !important; max-height: 34px !important; flex-shrink: 0 !important; padding: 0 !important; margin: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 50% !important; aspect-ratio: 1 / 1 !important; font-size: 15px !important; font-weight: 800 !important; font-family: inherit !important; border: none !important; background: transparent !important; color: #326916 !important; text-decoration: none !important; transition: all 0.2s ease !important; box-sizing: border-box !important; line-height: 1 !important; cursor: pointer !important; overflow: hidden !important; }

        #custom-top-pagination ul > li > a > span, #custom-top-pagination ul > li > button > span { pointer-events: none !important; }

        nav[aria-label*="Seiten-Navigation"] > ul > li:not(:first-child):not(:last-child) > *:not([aria-current="page"]):hover, .flex.justify-center.py-small nav > ul > li:not(:first-child):not(:last-child) > *:not([aria-current="page"]):hover, #custom-top-pagination ul > li:not(:first-child):not(:last-child) > *:not([aria-current="page"]):hover, #custom-top-pagination-search ul > li:not(:first-child):not(:last-child) > *:not([aria-current="page"]):hover, #srchrslt-pagination ul > li:not(:first-child):not(:last-child) > *:not([aria-current="page"]):hover { background-color: #f5f5f5 !important; }
        nav[aria-label*="Seiten-Navigation"] > ul > li > [aria-current="page"], nav[aria-label*="Seiten-Navigation"] > ul > li > .bg-accent, nav[aria-label*="Seiten-Navigation"] > ul > li > .bg-accentContainer, .flex.justify-center.py-small nav > ul > li > [aria-current="page"], .flex.justify-center.py-small nav > ul > li > .bg-accent, .flex.justify-center.py-small nav > ul > li > .bg-accentContainer, #custom-top-pagination ul > li > [aria-current="page"], #custom-top-pagination ul > li > .bg-accent, #custom-top-pagination-search ul > li > [aria-current="page"], #custom-top-pagination-search ul > li > .bg-accent, #srchrslt-pagination ul > li > [aria-current="page"], #srchrslt-pagination ul > li > .bg-accent { background-color: #326916 !important; color: #ffffff !important; box-shadow: 0 4px 10px rgba(50, 105, 22, 0.3) !important; }

        nav[aria-label*="Seiten-Navigation"] > ul > li:first-child > *, nav[aria-label*="Seiten-Navigation"] > ul > li:last-child > *, .flex.justify-center.py-small nav > ul > li:first-child > *, .flex.justify-center.py-small nav > ul > li:last-child > *, #custom-top-pagination ul > li:first-child > *, #custom-top-pagination ul > li:last-child > *, #custom-top-pagination-search ul > li:first-child > *, #custom-top-pagination-search ul > li:last-child > *, #srchrslt-pagination ul > li:first-child > *, #srchrslt-pagination ul > li:last-child > * { background-color: #cfff00 !important; color: #326916 !important; opacity: 1 !important; }
        nav[aria-label*="Seiten-Navigation"] > ul > li:first-child > *:not([disabled]):hover, nav[aria-label*="Seiten-Navigation"] > ul > li:last-child > *:not([disabled]):hover, .flex.justify-center.py-small nav > ul > li:first-child > *:not([disabled]):hover, .flex.justify-center.py-small nav > ul > li:last-child > *:not([disabled]):hover, #custom-top-pagination ul > li:first-child > *:not([disabled]):hover, #custom-top-pagination ul > li:last-child > *:not([disabled]):hover, #custom-top-pagination-search ul > li:first-child > *:not([disabled]):hover, #custom-top-pagination-search ul > li:last-child > *:not([disabled]):hover, #srchrslt-pagination ul > li:first-child > *:not([disabled]):hover, #srchrslt-pagination ul > li:last-child > *:not([disabled]):hover { background-color: #b8e600 !important; }
        nav[aria-label*="Seiten-Navigation"] > ul > li:first-child > [disabled], nav[aria-label*="Seiten-Navigation"] > ul > li:first-child > [aria-disabled="true"], nav[aria-label*="Seiten-Navigation"] > ul > li:last-child > [disabled], nav[aria-label*="Seiten-Navigation"] > ul > li:last-child > [aria-disabled="true"], .flex.justify-center.py-small nav > ul > li:first-child > [disabled], .flex.justify-center.py-small nav > ul > li:first-child > [aria-disabled="true"], .flex.justify-center.py-small nav > ul > li:last-child > [disabled], .flex.justify-center.py-small nav > ul > li:last-child > [aria-disabled="true"], #custom-top-pagination ul > li:first-child > [disabled], #custom-top-pagination ul > li:first-child > [aria-disabled="true"], #custom-top-pagination ul > li:last-child > [disabled], #custom-top-pagination ul > li:last-child > [aria-disabled="true"], #custom-top-pagination-search ul > li:first-child > [disabled], #custom-top-pagination-search ul > li:first-child > [aria-disabled="true"], #custom-top-pagination-search ul > li:last-child > [disabled], #custom-top-pagination-search ul > li:last-child > [aria-disabled="true"], #srchrslt-pagination ul > li:first-child > [disabled], #srchrslt-pagination ul > li:first-child > [aria-disabled="true"], #srchrslt-pagination ul > li:last-child > [disabled], #srchrslt-pagination ul > li:last-child > [aria-disabled="true"] { background-color: #dcf2b0 !important; cursor: not-allowed !important; opacity: 1 !important; }

        nav[aria-label*="Seiten-Navigation"] > ul > li:first-child svg, nav[aria-label*="Seiten-Navigation"] > ul > li:last-child svg, .flex.justify-center.py-small nav > ul > li:first-child svg, .flex.justify-center.py-small nav > ul > li:last-child svg, #custom-top-pagination ul > li:first-child svg, #custom-top-pagination ul > li:last-child svg, #custom-top-pagination-search ul > li:first-child svg, #custom-top-pagination-search ul > li:last-child svg, #srchrslt-pagination ul > li:first-child svg, #srchrslt-pagination ul > li:last-child svg { width: 18px !important; height: 18px !important; stroke: #326916 !important; stroke-width: 3px !important; color: #326916 !important; fill: none !important; display: block !important; }

        /* Ellipsis (...) zentriert und perfekt geformt */
        nav[aria-label*="Seiten-Navigation"] > ul > li > span.text-onSurfaceNonessential, .flex.justify-center.py-small nav > ul > li > span.text-onSurfaceNonessential, #custom-top-pagination ul > li > span.text-onSurfaceNonessential, #custom-top-pagination-search ul > li > span.text-onSurfaceNonessential, #srchrslt-pagination ul > li > span.text-onSurfaceNonessential { width: 24px !important; height: 34px !important; flex-shrink: 0 !important; background: transparent !important; box-shadow: none !important; cursor: default !important; font-weight: bold !important; }

        /* ====================================================
           NEU: CUSTOM AGE FILTER PILL (Alter der Anzeigen)
           ==================================================== */
        .kit-filter-bar { background: #ffffff; padding: 6px !important; border-radius: 9999px; border: 2px solid #f3f4f6; display: flex; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.06); font-family: inherit; height: 46px !important; box-sizing: border-box; z-index: 1 !important; }
        .kit-btn { padding: 0 16px !important; height: 34px !important; min-height: 34px !important; max-height: 34px !important; margin: 0 !important; border-radius: 9999px !important; font-size: 13px !important; font-weight: 800 !important; cursor: pointer !important; background: transparent !important; color: #9ca3af !important; transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important; box-sizing: border-box !important; line-height: 1 !important; border: none !important; flex-shrink: 0 !important; }
        .kit-btn:hover { color: #4b5563 !important; background: transparent !important; }
        .kit-dot { width: 10px !important; height: 10px !important; border-radius: 50% !important; display: inline-block !important; flex-shrink: 0 !important; }

        .kit-btn.active-all { background: #f0f4f8 !important; color: #0f172a !important; }
        .kit-btn.active-all .kit-dot { background: #cbd5e1 !important; }
        .kit-btn.active-orange { background: #fff7ed !important; color: #c2410c !important; }
        .kit-btn.active-orange .kit-dot { background: #ffb07c !important; }
        .kit-btn.active-red { background: #fef2f2 !important; color: #b91c1c !important; }
        .kit-btn.active-red .kit-dot { background: #e11d48 !important; box-shadow: 0 0 8px rgba(225, 29, 72, 0.4) !important; }

        .kit-separator { width: 1px; height: 16px; background-color: #f3f4f6; margin: 0 4px; }

        .kl-filter-hidden { display: none !important; }
    `;
    document.head ? document.head.appendChild(style) : document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));

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

    function showCustomShareModal(url, title, imgUrl) {
        let overlay = document.getElementById('custom-share-overlay');
        const closeModal = () => {
            if (overlay) overlay.style.display = 'none';
            document.body.style.overflow = '';
        };

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'custom-share-overlay';
            Object.assign(overlay.style, {
                position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
                backgroundColor: 'rgba(11, 11, 11, 0.8)', zIndex: '100000',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            });

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
        document.body.style.overflow = 'hidden';
    }

    function createBtn(text, iconStr, click) {
        const b = document.createElement('button');
        b.className = 'custom-purple-btn';
        b.innerHTML = `${iconStr}<span>${text}</span>`;
        b.onclick = click;
        return b;
    }

    async function fetchAdDetails(adUrl, adId) {
        const cacheKey = `__KL_AD_DETAILS_V12_${adId}`;
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

            let viewCount = null;
            const cntrNum = doc.getElementById('viewad-cntr-num');
            if (cntrNum) {
                const match = cntrNum.textContent.replace(/\./g, '').match(/\d+/);
                if (match) viewCount = parseInt(match[0], 10);
            }

            const result = { location, date, shipping, catSlug, viewCount };
            sessionStorage.setItem(cacheKey, JSON.stringify(result));
            return result;
        } catch (e) {
            console.error('Fehler beim Abrufen der Inseratsdetails:', e);
            return null;
        }
    }

    const CACHE_KEY_30D = '__KL_ACTIVITY_30D_V9';

    async function fetchBackgroundStats() {
        try {
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

        if (isDetailPage) {
            const sidebar = document.getElementById('viewad-sidebar');
            if (sidebar && !sidebar.dataset.removedSafely) {
                const shareBtnOriginal = sidebar.querySelector('.j-share-ad, [href="#viewad-share-ad"], [data-mfp-src="#viewad-share-ad"]');
                if (shareBtnOriginal) {
                    shareBtnOriginal.id = 'custom-rescued-share-btn';
                    shareBtnOriginal.style.display = 'none';
                    document.body.appendChild(shareBtnOriginal);
                }
                const shareModal = sidebar.querySelector('#viewad-share-ad');
                if (shareModal) document.body.appendChild(shareModal);

                const adIdBoxOriginal = sidebar.querySelector('#viewad-ad-id-box');
                if (adIdBoxOriginal) {
                    adIdBoxOriginal.id = 'custom-rescued-ad-id-box';
                    adIdBoxOriginal.style.display = 'none';
                    document.body.appendChild(adIdBoxOriginal);
                }

                sidebar.dataset.removedSafely = 'true';
                sidebar.remove();

                const mainCol = document.querySelector('#viewad-cntnt .a-span-16');
                if (mainCol) {
                    mainCol.classList.remove('a-span-16');
                    mainCol.classList.add('a-span-24');
                    mainCol.style.setProperty('width', '100%', 'important');
                    mainCol.style.setProperty('max-width', '100%', 'important');
                }
            }
        }

        if (isDetailPage) {
            const calIcon = document.querySelector('.icon-calendar-gray-simple');
            if (calIcon && !calIcon.dataset.replaced) {
                calIcon.dataset.replaced = 'true';
                calIcon.outerHTML = `<span title="Erstellt am" style="display: inline-flex; align-items: center;"><svg viewBox="0 0 24 24" fill="none" stroke="#A6A6A6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 block align-middle" style="width: 16px !important; height: 16px !important; margin-right: 6px;"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg></span>`;
            }

            const locIcons = document.querySelectorAll('.icon-location-pin-filled, .icon-pin-gray-simple');
            locIcons.forEach(icon => {
                const parent = icon.parentElement;
                if (parent && !parent.title) parent.title = "Ort";
            });

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

            const dlStats = document.getElementById('pvap-mngad-stats');
            const extraInfo = document.getElementById('viewad-extra-info');

            if (dlStats && extraInfo && !dlStats.dataset.klStyledLayout) {
                dlStats.dataset.klStyledLayout = 'true';
                extraInfo.parentNode.insertBefore(dlStats, extraInfo);

                dlStats.className = 'm-none p-none text-bodySmall text-onSurfaceNonessential';
                dlStats.style.display = 'flex';
                dlStats.style.flexWrap = 'wrap';
                dlStats.style.alignItems = 'center';
                dlStats.style.gap = '16px';
                dlStats.style.marginTop = '6px';
                dlStats.style.marginBottom = '0px';
                dlStats.style.padding = '0px';
                dlStats.style.width = '100%';

                extraInfo.style.display = 'flex';
                extraInfo.style.flexWrap = 'wrap';
                extraInfo.style.alignItems = 'center';
                extraInfo.style.gap = '8px 16px';

                const getDtByText = (text) => Array.from(dlStats.querySelectorAll('dt')).find(dt => dt.textContent.includes(text));

                const dtVisits = getDtByText('Besuche');
                if (dtVisits) {
                    dtVisits.style.display = 'none';
                    if (dtVisits.nextElementSibling) dtVisits.nextElementSibling.style.display = 'none';
                }

                const erstelltAmSpan = document.querySelector('span[title="Erstellt am"]');
                if (erstelltAmSpan) {
                    const erstelltAmDiv = erstelltAmSpan.closest('div');
                    if (erstelltAmDiv) {
                        erstelltAmDiv.style.display = 'flex';
                        erstelltAmDiv.style.alignItems = 'center';
                        dlStats.appendChild(erstelltAmDiv);
                    }
                }

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

                if (cntrParent) extraInfo.appendChild(cntrParent);

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

                const isOwnAd = document.getElementById('pvap-mngad-actns') !== null || document.querySelector('a[href*="/p-anzeige-bearbeiten.html"]') !== null;
                if (isOwnAd) {
                    const watchlistBox = document.getElementById('viewad-action-watchlist');
                    if (watchlistBox) watchlistBox.style.setProperty('display', 'none', 'important');
                }

                const adIdBox = document.getElementById('custom-rescued-ad-id-box') || document.getElementById('viewad-ad-id-box');
                if (adIdBox && extraInfo && !document.getElementById('custom-ad-id-row')) {
                    const idListItems = adIdBox.querySelectorAll('li');
                    if (idListItems.length >= 2) {
                        const idLabel = idListItems[0].textContent.trim();
                        const idValue = idListItems[1].textContent.trim();

                        const wrapper = document.createElement('div');
                        wrapper.id = 'custom-ad-id-row';
                        wrapper.className = 'text-bodySmall text-onSurfaceNonessential';
                        wrapper.style.display = 'flex';
                        wrapper.style.alignItems = 'center';
                        wrapper.style.width = '100%';
                        wrapper.style.marginTop = '6px';

                        const svgHash = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#A6A6A6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 block align-middle" style="margin-right: 4px;"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>`;

                        wrapper.innerHTML = `
                            <span title="${idLabel}" style="display: flex; align-items: center;">${svgHash}</span>
                            <span style="font-weight: normal; color: #757575;">${idLabel} ${idValue}</span>
                        `;
                        extraInfo.parentNode.insertBefore(wrapper, extraInfo.nextSibling);
                    }
                }
            }
        }

        if (isOverviewPage) {
            const profileBox = document.querySelector('.ownprofile-main');

            if (profileBox && profileBox.dataset.redesignInjected && !profileBox.querySelector('.custom-profile-dashboard')) {
                delete profileBox.dataset.redesignInjected;
                profileBox.classList.remove('custom-replaced');
            }

            if (profileBox && !profileBox.dataset.redesignInjected) {
                const nameEl = profileBox.querySelector('h2');
                const statsEl = profileBox.querySelector('[data-testid="posted-ads"]');
                const userInfoUl = profileBox.querySelector('[data-testid="user-info"]');

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
                    Array.from(profileBox.children).forEach(child => {
                        child.style.display = 'none';
                        child.classList.add('kl-hidden-original');
                    });

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
                            followersA.innerHTML = `<span class="cpd-footer-item-text"><strong>${numMatch[1]}</strong> Follower</span>`;
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

                const val30d = dashboard.querySelector('#custom-30d-val');
                if (val30d) {
                    val30d.innerHTML = '<span style="font-size: 11px; font-weight: normal; animation: customPulse 1s infinite;">LÄDT</span>';

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

            } catch(e) {
                    console.error("Fehler beim Erstellen des Dashboards:", e);
                }
            }
        }

        if (isOverviewPage || isDetailPage) {
            const editLinks = document.querySelectorAll('a[href*="/p-anzeige-bearbeiten.html"]');
            editLinks.forEach(link => {
                const container = link.closest('ul') || link.parentElement;
                if (!container || container.dataset.klInjected) return;

                const match = link.getAttribute('href').match(/adId=(\d+)/);
                if (!match) return;
                const adId = match[1];

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
                    printBtn.className = "inline-flex items-center justify-center gap-xsmall text-bodyRegularStrong box-border rounded-full cursor-pointer whitespace-nowrap no-underline hover:no-underline focus:outline-none focus-visible:outline-2 focus-visible:ring-2 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent focus-visible:ring-surface border-2 border-solid border-utility text-interactive h-xlarge min-h-xlarge min-w-xlarge w-fit bg-transparent hover:border-secondary hover:bg-secondaryContainer hover:text-onSecondaryContainer active:border-secondary active:bg-secondaryContainer active:text-onSecondaryContainer px-medium " + (isDetailPage ? "custom-native-btn-detail" : "custom-native-btn");

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

                        printBtn.blur();
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

                let shareBtnEl = null;
                if (isOverviewPage) {
                    const shareAction = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const card = link.closest('li');

                        const titleLink = card ? card.querySelector('a[href*="/s-anzeige/"]') : null;
                        const url = titleLink ? titleLink.href : window.location.href;

                        let adTitle = 'Anzeige';
                        const titleHeading = card ? card.querySelector('h2, h3, .text-title4') : null;
                        if (titleHeading) {
                            const clone = titleHeading.cloneNode(true);
                            const srOnly = clone.querySelector('.sr-only');
                            if (srOnly) srOnly.remove();
                            adTitle = clone.textContent.trim();
                        } else if (titleLink) {
                            adTitle = titleLink.textContent.trim();
                        }

                        const imgEl = card ? card.querySelector('.imagebox-image img, img') : null;
                        let imgUrl = '';
                        if (imgEl) {
                            imgUrl = imgEl.src;
                            if (imgUrl.includes('data:image') && imgEl.dataset && imgEl.dataset.src) {
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

                if (isOverviewPage) {
                    container.append(liDup, liRelist);
                } else {
                    if (printLi) container.append(printLi);
                    container.append(liDup, liRelist);
                }

                if (isDetailPage) {
                    let shareBtn = document.getElementById('custom-rescued-share-btn') || document.querySelector('button.j-share-ad, a.j-share-ad');
                    if (shareBtn && !shareBtn.dataset.movedToActions) {
                        shareBtn.dataset.movedToActions = 'true';
                        shareBtn.className = 'custom-native-btn-detail j-share-ad';
                        shareBtn.style.display = 'inline-flex';
                        shareBtn.innerHTML = `${klShareSvg}<span>Teilen</span>`;
                        const liShareDetail = document.createElement(container.tagName === 'UL' ? 'li' : 'span');
                        liShareDetail.style.margin = '0';
                        liShareDetail.appendChild(shareBtn);
                        container.appendChild(liShareDetail);
                    }
                }

                container.dataset.klInjected = 'true';

                if (isDetailPage) {
                    if (!container.dataset.klStyled) {
                        container.dataset.klStyled = 'true';
                        container.style.display = 'flex';
                        container.style.flexWrap = 'wrap';
                        container.style.gap = '8px';
                        container.style.listStyle = 'none';
                        container.style.padding = '0';
                        container.style.margin = '0';

                        if (container.parentElement && !container.parentElement.querySelector('h2.sectionheadline')) {
                            const h2 = document.createElement('h2');
                            h2.className = 'sectionheadline';
                            h2.setAttribute('style', 'margin-bottom: 12px !important;');
                            h2.textContent = 'Deine Anzeige';
                            container.parentElement.insertBefore(h2, container);
                        }

                        const orderMap = {
                            'Bearbeiten': 1, 'Reservieren': 2, 'Aktivieren': 2, 'Deaktivieren': 2, 'Pausieren': 2,
                            'Löschen': 3, 'Verlängern': 4, 'Verkaufsschild': 5, 'drucken': 5,
                            'Duplizieren': 6, 'Neu einstellen': 7, 'Teilen': 8
                        };

                        const getOrder = (li) => {
                            const text = li.textContent || '';
                            for (const key in orderMap) {
                                if (text.includes(key)) return orderMap[key];
                            }
                            return 99;
                        };

                        const listItems = Array.from(container.children);
                        listItems.sort((a, b) => getOrder(a) - getOrder(b));
                        listItems.forEach(li => container.appendChild(li));
                    }
                }

                Array.from(container.querySelectorAll('a, button')).forEach(btn => {
                    if (!btn.classList.contains('custom-purple-btn')) {
                        if (isDetailPage && !btn.classList.contains('custom-native-btn-detail')) {
                            btn.classList.add('custom-native-btn-detail');
                        }

                        const text = btn.textContent;
                        const needsInjection = !btn.dataset.iconInjected || !btn.querySelector('svg');

                        if (needsInjection) {
                            btn.dataset.iconInjected = 'true';

                            if (text.includes('Bearbeiten')) {
                                btn.innerHTML = `${klEditSvg}<span>Bearbeiten</span>`;
                            } else if (text.includes('Löschen')) {
                                btn.innerHTML = `${klTrashSvg}<span>Löschen</span>`;
                            } else if (text.includes('drucken') || text.includes('Verkaufsschild')) {
                                btn.innerHTML = `${klPrinterSvg}<span>Verkaufsschild</span>`;

                                if (isDetailPage) {
                                    const preventDisable = () => {
                                        if (btn.hasAttribute('disabled') || btn.classList.contains('is-disabled')) {
                                            btn.removeAttribute('disabled');
                                            btn.classList.remove('is-disabled');
                                            btn.style.pointerEvents = 'auto';
                                            btn.style.opacity = '1';
                                        }
                                    };
                                    btn.addEventListener('click', () => {
                                        setTimeout(preventDisable, 10);
                                        setTimeout(preventDisable, 100);
                                        setTimeout(preventDisable, 500);
                                    });
                                    if (!btn.dataset.observerAttached) {
                                        btn.dataset.observerAttached = 'true';
                                        const observer = new MutationObserver(preventDisable);
                                        observer.observe(btn, { attributes: true, attributeFilter: ['disabled', 'class'] });
                                    }
                                }
                            } else if (text.includes('Reservieren')) {
                                btn.innerHTML = `${klFlagSvg}<span>Reservieren</span>`;
                            } else if (text.includes('Aktivieren')) {
                                const klPlaySvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 block align-middle pointer-events-none" style="width: 14px; height: 14px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
                                btn.innerHTML = `${klPlaySvg}<span>Aktivieren</span>`;
                            } else if (text.includes('Deaktivieren') || text.includes('Pausieren')) {
                                const klPauseSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 block align-middle pointer-events-none" style="width: 14px; height: 14px;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
                                btn.innerHTML = `${klPauseSvg}<span>Deaktivieren</span>`;
                            } else if (text.includes('Verlängern')) {
                                btn.innerHTML = `${klReactivateSvg}<span>Verlängern</span>`;
                            }
                        }

                        if (text.includes('Verlängern')) {
                            if (btn.hasAttribute('disabled') || btn.getAttribute('aria-disabled') === 'true' || btn.classList.contains('is-disabled') || btn.classList.contains('hover:cursor-not-allowed')) {
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

                if (isOverviewPage) {
                    const card = container.closest('li');
                    if (card) {
                        const footer = card.querySelector('footer');
                        const infoCol = card.querySelector('.pl-medium.align-top') || card.querySelector('.pl-medium.align-top.flex-1');

                        if (infoCol) {
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
                                    priceEl.classList.add('has-custom-btn');
                                    const leftContent = document.createElement('div');
                                    leftContent.style.display = 'flex';
                                    leftContent.style.alignItems = 'center';
                                    leftContent.style.gap = '4px';
                                    leftContent.style.flexWrap = 'nowrap';
                                    while (priceEl.firstChild) leftContent.appendChild(priceEl.firstChild);
                                    priceEl.appendChild(leftContent);
                                    priceEl.appendChild(shareBtnEl);
                                } else {
                                    shareBtnEl.style.marginLeft = 'auto';
                                    infoCol.appendChild(shareBtnEl);
                                }
                            }

                            if (printBtn && !printBtn.parentElement) {
                                let bottomRow = infoCol.querySelector('.custom-bottom-row');
                                if (!bottomRow) {
                                    bottomRow = document.createElement('div');
                                    bottomRow.className = 'custom-bottom-row';
                                    bottomRow.style.display = 'flex';
                                    bottomRow.style.justifyContent = 'space-between';
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
                                while (footer.firstChild) newFooterDiv.appendChild(footer.firstChild);

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
                                if (originalHeader) originalHeader.style.textDecoration = 'underline';

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

        if (isOverviewPage && !window.__KL_FETCHING_ADS) {
            const allValidCards = __getKLAds(document);
            const pendingCards = allValidCards.filter(c => !c.dataset.klDetailsInjected);

            if (pendingCards.length > 0) {
                window.__KL_FETCHING_ADS = true;

                (async () => {
                    try {
                        await new Promise(r => setTimeout(r, 400));

                        for (const card of pendingCards) {
                            card.dataset.klDetailsInjected = 'pending';

                            try {
                                const titleLink = card.querySelector('a[href*="/s-anzeige/"]');
                                const editLink = card.querySelector('a[href*="adId="], button[data-url*="adId="]');

                                if (titleLink && editLink) {
                                    const adUrl = titleLink.href;
                                    const match = (editLink.href || editLink.dataset.url).match(/adId=(\d+)/);

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

                                                const oldEndDateSpan = card.querySelector('.managead-listitem-enddate');
                                                if (oldEndDateSpan) {
                                                    endDateStr = oldEndDateSpan.textContent.replace(/Endet am/i, '').trim();
                                                    if (oldEndDateSpan.parentElement) oldEndDateSpan.parentElement.style.display = 'none';
                                                }

                                                const originalStatsUl = statsSection.querySelector('ul');
                                                if (originalStatsUl) {
                                                    const statItems = originalStatsUl.querySelectorAll('li');
                                                    statItems.forEach(li => {
                                                        const text = li.textContent.trim();
                                                        if(text.includes('Besucher')) {
                                                            let match = text.match(/\d+/);
                                                            if(match) visitors = parseInt(match[0], 10);
                                                        } else if(text.toLowerCase().includes('gemerkt')) {
                                                            let match = text.match(/\d+/);
                                                            if(match) watchers = parseInt(match[0], 10);
                                                        } else if (endDateStr === "Unbekannt" && text.includes('Endet am')) {
                                                            endDateStr = text.replace(/Endet am/i, '').trim();
                                                        }
                                                    });
                                                    originalStatsUl.remove();
                                                }

                                                if (endDateStr === "Unbekannt") {
                                                     const matchFallback = card.textContent.match(/Endet am\s*([\d\.]+)/i);
                                                     if (matchFallback) endDateStr = matchFallback[1];
                                                }

                                                if (visitors === 0 && details.viewCount !== null && details.viewCount !== undefined) {
                                                    visitors = details.viewCount;
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

                                                card.dataset.daysOnline = daysOnline;

                                                let daysColor = '#008000';
                                                card.dataset.ageStatus = 'normal';

                                                if (daysOnline >= 14 && daysOnline <= 34) {
                                                    daysColor = '#FFA500';
                                                    card.dataset.ageStatus = 'warn';
                                                } else if (daysOnline >= 35) {
                                                    daysColor = '#FF0000';
                                                    card.dataset.ageStatus = 'danger';
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
                                                locUl.style.flexWrap = 'nowrap';
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

                                                let bottomRow = infoColTarget.querySelector('.custom-bottom-row');
                                                if (bottomRow) {
                                                    const printB = bottomRow.querySelector('.custom-icon-only-btn');
                                                    if (printB) bottomRow.insertBefore(locUl, printB);
                                                    else bottomRow.appendChild(locUl);
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

                                                    const leftContent = priceEl.querySelector('div');
                                                    if (leftContent) leftContent.appendChild(span);
                                                    else priceEl.appendChild(span);
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
                            card.dataset.klDetailsInjected = 'done';
                            if (window.applyCustomFilters) window.applyCustomFilters();
                            await new Promise(r => setTimeout(r, 200));
                        }
                    } finally {
                        window.__KL_FETCHING_ADS = false;
                    }
                })();
            }
        }

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

            saveBtn.addEventListener('click', () => {
                if (!window.__KL_ACTION) {
                    localStorage.setItem('__KL_AUTO_REDIRECT', 'true');
                    const resetRedirect = (e) => {
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
            for (let i = 0; i < navs.length; i++) {
                const nav = navs[i];
                const span = nav.querySelector('span.sr-only');
                if (span && span.textContent.includes('Seiten-Navigation')) {
                    if (!nav.closest('#custom-top-pagination')) {
                        return nav.parentElement;
                    }
                }
            }
            return null;
        }

        let hasFetchedAllPages = false;
        let fetchAdsPromise = null;

        // API-basiert, kein Template-Klon (vermeidet den Bearbeiten-Link-Bug)
        async function fetchAllUserAds() {
            try {
                const mainUl = document.getElementById('my-manageitems-adlist');
                if (!mainUl) return;

                const currentUrl = new URL(window.location.href);
                const currentPage = parseInt(currentUrl.searchParams.get('pageNum') || '1');

                let pageNum = 1;
                let lastPage = null;

                while (true) {
                    // Aktuelle Seite überspringen – bereits im DOM vorhanden
                    if (pageNum === currentPage) {
                        pageNum++;
                        continue;
                    }

                    let res;
                    try {
                        res = await fetch(`/m-meine-anzeigen-verwalten.json?pageNum=${pageNum}&sort=DEFAULT`, {
                            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                            credentials: 'same-origin'
                        });
                    } catch (fetchErr) {
                        break;
                    }

                    if (!res.ok) break;

                    let data;
                    try {
                        data = await res.json();
                    } catch (e) {
                        break;
                    }

                    if (!data || !data.ads || data.ads.length === 0) break;

                    // Gesamtseitenanzahl einmalig aus paging.last ermitteln
                    if (lastPage === null && data.paging && data.paging.last) {
                        lastPage = data.paging.last;
                    }

                    data.ads.forEach(ad => {
                        // Alters-Status direkt aus API-Daten berechnen
                        let daysOnline = 1;
                        if (ad.creationDate) {
                            const p = ad.creationDate.split('.');
                            if (p.length === 3) {
                                const created = new Date(parseInt(p[2], 10), parseInt(p[1], 10) - 1, parseInt(p[0], 10));
                                const diff = Math.ceil((new Date() - created) / (1000 * 60 * 60 * 24));
                                if (diff > 0) daysOnline = diff;
                            }
                        }
                        const ageStatus = daysOnline >= 35 ? 'danger' : daysOnline >= 14 ? 'warn' : 'normal';

                        // HTML-Entities im Titel dekodieren (z.B. &#x2F; -> /)
                        const decoder = document.createElement('div');
                        decoder.innerHTML = ad.title || 'Unbekannte Anzeige';
                        const cleanTitle = decoder.textContent;

                        const imgSrc = ad.adImage
                            ? (ad.adImage.url || ad.adImage.link || ad.adImage.src || '')
                            : '';

                        // Anzahl der Bilder berechnen und Badge erzeugen
                        const imgCount = (ad.pictures && ad.pictures.length) ? ad.pictures.length : (ad.imageCount || (ad.adImage ? 1 : 0));
                        const imgBadgeHtml = imgCount > 1 ? `
                            <div style="position: absolute; bottom: 8px; left: 8px; background: rgba(17, 17, 17, 0.7); color: white; border-radius: 999px; padding: 2px 6px; font-size: 11px; font-weight: bold; display: flex; align-items: center; gap: 4px; z-index: 2;">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                ${imgCount}
                            </div>
                        ` : '';

                        // Native Tailwind CSS-Klassen für korrekt aussehende Buttons
                        const btnClasses = "inline-flex items-center justify-center gap-xsmall text-bodyRegularStrong box-border rounded-full cursor-pointer whitespace-nowrap no-underline hover:no-underline focus:outline-none focus-visible:outline-2 focus-visible:ring-2 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent focus-visible:ring-surface border-2 border-solid border-utility text-interactive h-xlarge min-h-xlarge min-w-xlarge w-fit bg-transparent hover:border-secondary hover:bg-secondaryContainer hover:text-onSecondaryContainer active:border-secondary active:bg-secondaryContainer active:text-onSecondaryContainer px-medium custom-native-btn";

                        // Karte von Grund auf neu bauen - NATIVER AUFBAU
                        const li = document.createElement('li');
                        li.dataset.adid = ad.id;
                        li.dataset.daysOnline = daysOnline;
                        li.dataset.ageStatus = ageStatus;
                        // Verwendung der echten nativen Klassen statt harter Inline-Styles
                        li.className = 'cardbox bg-surface p-medium mb-xsmall rounded-small border border-solid border-utilityNonessential custom-fetched-ad kl-search-hidden';
                        li.style.setProperty('display', 'none', 'important');

                        // Kompletter, fertiger DOM-Aufbau für die Kachel exakt nach nativem Vorbild
                        li.innerHTML = `
                            <div class="grid w-full custom-ad-grid">
                                <div class="self-start">
                                    <a href="${ad.seoUrl || '#'}" class="flex justify-center items-center rounded-small bg-surfaceSubdued overflow-hidden w-[200px] h-[150px] relative" aria-label="Anzeige ${cleanTitle.replace(/"/g, '&quot;')}" style="border-radius: 4px;">
                                        <img src="${imgSrc || 'https://www.kleinanzeigen.de/static/img/common/default_image_thumbnail.png'}"
                                             alt="${cleanTitle.replace(/"/g, '&quot;')}"
                                             class="w-full h-full object-cover" data-testid="ad-image">
                                        ${imgBadgeHtml}
                                    </a>
                                </div>
                                <div class="pl-medium align-top">
                                    <div class="mb-xsmall text-bodySmall text-onSurfaceNonessential">
                                        ${ad.category || ''}
                                    </div>
                                    <h3 class="mx-none my-xsmall text-title4">
                                        <div class="-m-xxsmall line-clamp-2 max-h-[2.6em] text-ellipsis p-xxsmall leading-[1.3em]">
                                            <a class="inline-flex items-center gap-xxsmall hover:text-accent forced-colors:underline focus:&not(:focus-visible):outline-none focus-visible:outline-2 focus-visible:ring-2 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent focus-visible:ring-surface text-onSurface inline-block hover:no-underline" href="${ad.seoUrl || '#'}">
                                                <span class="sr-only">Anzeige </span>${cleanTitle}
                                            </a>
                                        </div>
                                    </h3>
                                    <ul class="list">
                                        <li class="mx-none my-xsmall text-title3 text-secondary has-custom-btn">
                                            <div style="display: flex; align-items: center; gap: 4px; flex-wrap: nowrap;">
                                                ${ad.price || ''}
                                                ${ad.shipping ? `<span class="custom-shipping-info" style="font-size: 12px; font-weight: normal; color: rgb(117, 117, 117); margin-left: 4px;">${ad.shipping}</span>` : ''}
                                            </div>
                                            <button type="button" class="inline-flex items-center justify-center gap-xsmall text-bodyRegularStrong box-border rounded-full cursor-pointer whitespace-nowrap no-underline hover:no-underline focus:outline-none focus-visible:outline-2 focus-visible:ring-2 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent focus-visible:ring-surface border-2 border-solid border-utility text-interactive h-xlarge min-h-xlarge min-w-xlarge w-fit bg-transparent hover:border-secondary hover:bg-secondaryContainer hover:text-onSecondaryContainer active:border-secondary active:bg-secondaryContainer active:text-onSecondaryContainer px-medium custom-native-btn custom-icon-only-btn" title="Anzeige teilen">
                                                ${klShareSvg}
                                            </button>
                                        </li>
                                    </ul>
                                    <div class="custom-bottom-row" style="display: flex; justify-content: space-between; align-items: center; margin-top: 0px; width: 100%;">
                                        <a href="/p-verkaufsschild.html?adId=${ad.id}" target="_blank" class="${btnClasses} custom-icon-only-btn" title="Verkaufsschild drucken" style="margin-left: auto;">
                                            ${klPrinterSvg}
                                        </a>
                                    </div>
                                </div>

                                <div style="background: rgb(224, 224, 224); width: 1px; height: 110px;"></div>

                                <div class="custom-stats-area align-top" style="display: flex; flex-direction: column; height: 100%;">
                                    <div class="mb-xsmall text-bodySmall text-onSurfaceNonessential" style="text-decoration: underline;">Anzeigenanalyse</div>
                                    <section class="text-left text-bodySmall text-onSurfaceNonessential" style="margin-top: 0px; display: flex; flex-direction: column; gap: 12px; height: 100%;">
                                        <!-- Versteckte Liste für fetchAdDetails zum Auslesen und Generieren des Analyse-Grids -->
                                        <ul style="display:none;">
                                            <li>${ad.viewCount != null ? ad.viewCount : 0} Besucher</li>
                                            <li>${ad.watchCount != null ? ad.watchCount : 0}x gemerkt</li>
                                            ${ad.endDate ? `<li class="managead-listitem-enddate">Endet am ${ad.endDate}</li>` : ''}
                                        </ul>
                                    </section>
                                </div>

                                <div style="background: rgb(224, 224, 224); width: 1px; height: 110px;"></div>

                                <div class="mt-xsmall custom-action-area" style="display: flex; flex-direction: column; justify-content: center; height: 100%;">
                                    <ul class="flex list-none flex-row flex-wrap p-none" data-kl-injected="true">
                                        <li class="mr-xsmall mt-xsmall">
                                            <a class="${btnClasses}" href="/p-anzeige-bearbeiten.html?adId=${ad.id}" data-icon-injected="true">${klEditSvg}<span>Bearbeiten</span></a>
                                        </li>
                                        <li class="mr-xsmall mt-xsmall">
                                            <button class="kl-remote-action ${btnClasses}" data-action="Reservieren" data-url="/m-anzeige-reservieren.html?adId=${ad.id}" data-icon-injected="true">${klFlagSvg}<span>Reservieren</span></button>
                                        </li>
                                        <li class="mr-xsmall mt-xsmall">
                                            <button class="kl-remote-action ${btnClasses}" data-action="Löschen" data-url="#" data-icon-injected="true">${klTrashSvg}<span>Löschen</span></button>
                                        </li>
                                        <li class="mr-xsmall mt-xsmall">
                                            <button class="kl-remote-action ${btnClasses}" data-action="Verlängern" data-url="/m-anzeige-verlaengern.html?adId=${ad.id}" data-icon-injected="true">${klReactivateSvg}<span>Verlängern</span></button>
                                        </li>
                                        <li style="margin: 0px;">
                                            <button class="custom-purple-btn" onclick="localStorage.setItem('__KL_AUTO_ACTION', JSON.stringify({action: 'duplicate', adId: '${ad.id}'})); localStorage.setItem('__KL_AUTO_REDIRECT', 'true'); window.location.href='/p-anzeige-bearbeiten.html?adId=${ad.id}';">
                                                ${klDupSvg}<span>Duplizieren</span>
                                            </button>
                                        </li>
                                        <li style="margin: 0px;">
                                            <button class="custom-purple-btn" onclick="localStorage.setItem('__KL_AUTO_ACTION', JSON.stringify({action: 'relist', adId: '${ad.id}'})); localStorage.setItem('__KL_AUTO_REDIRECT', 'true'); window.location.href='/p-anzeige-bearbeiten.html?adId=${ad.id}';">
                                                ${klRelistSvg}<span>Neu einstellen</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        `;

                        // Teilen-Button Funktion für die generierte Karte einhängen
                        const shareBtnEl = li.querySelector('.custom-icon-only-btn[title="Anzeige teilen"]');
                        if (shareBtnEl) {
                            shareBtnEl.onclick = (e) => {
                                e.preventDefault(); e.stopPropagation();
                                showCustomShareModal(ad.seoUrl || '#', cleanTitle, imgSrc || '');
                            };
                        }

                        mainUl.appendChild(li);
                    });

                    // Sofort filtern
                    if (window.applyCustomFilters) window.applyCustomFilters();

                    pageNum++;

                    // Stoppen wenn letzte Seite erreicht
                    if (lastPage !== null && pageNum > lastPage) break;

                    await new Promise(r => setTimeout(r, 200));
                }

                // inject() verarbeitet neue Karten
                inject();

            } catch (err) {
                console.error('Fehler beim seitenübergreifenden Abruf:', err);
            } finally {
                hasFetchedAllPages = true;
            }
        }

        window.applyCustomFilters = function() {
            const searchInput = document.getElementById('custom-ad-search-input');
            const term = (searchInput ? searchInput.value : '').toLowerCase().trim();
            const ageFilter = window.__KL_ACTIVE_AGE_FILTER || 'all';

            const adCards = __getKLAds(document);

            adCards.forEach(card => {
                let title = '';
                const titleLink = card.querySelector('h3 a[href*="/s-anzeige/"], h2 a[href*="/s-anzeige/"], .text-title4 a');
                if (titleLink) {
                    title = titleLink.textContent.toLowerCase().trim();
                } else {
                    const titleHeading = card.querySelector('h2, h3, .text-title4');
                    if (titleHeading) {
                        const clone = titleHeading.cloneNode(true);
                        const srOnly = clone.querySelector('.sr-only');
                        if (srOnly) srOnly.remove();
                        title = clone.textContent.toLowerCase().trim();
                    }
                }

                let id = '';
                const idLink = card.querySelector('a[href*="adId="], button[data-url*="adId="]');
                if (idLink) {
                    const hrefOrData = idLink.href || idLink.dataset.url;
                    const idMatch = hrefOrData.match(/adId=(\d+)/);
                    if (idMatch) id = idMatch[1];
                }

                const matchesText = term === '' || title.includes(term) || id.includes(term);

                let matchesAge = true;
                const status = card.dataset.ageStatus;

                if (ageFilter === 'warn') matchesAge = (status === 'warn');
                else if (ageFilter === 'danger') matchesAge = (status === 'danger');

                // Verstecke Hintergrund-Anzeigen im Standard-Zustand!
                const isBackgroundAd = card.classList.contains('custom-fetched-ad');
                const isSearchingOrFiltering = term !== '' || ageFilter !== 'all';

                if (isBackgroundAd && !isSearchingOrFiltering) {
                    card.classList.add('kl-search-hidden');
                    card.style.setProperty('display', 'none', 'important');
                } else if (matchesText && matchesAge) {
                    card.classList.remove('kl-search-hidden', 'kl-filter-hidden');
                    card.style.setProperty('display', '', 'important');
                } else {
                    card.classList.add('kl-filter-hidden');
                    card.style.setProperty('display', 'none', 'important');
                }
            });
        };

        document.addEventListener('click', (e) => {
            const remoteBtn = e.target.closest('.kl-remote-action');
            if (remoteBtn) {
                e.preventDefault();
                e.stopPropagation();

                const action = remoteBtn.dataset.action;
                const url = remoteBtn.dataset.url;
                const card = remoteBtn.closest('li[data-adid]');
                const adId = card ? card.dataset.adid : null;

                if (action === 'Bearbeiten') {
                    window.location.href = url;
                } else if (action === 'Löschen') {
                    if (adId && confirm('Möchtest du diese Anzeige wirklich löschen?')) {
                        localStorage.setItem('__KL_PENDING_DELETE', adId);
                        localStorage.setItem('__KL_AUTO_REDIRECT', 'true');
                        window.location.reload();
                    }
                } else if (action === 'Reservieren' || action === 'Deaktivieren' || action === 'Verlängern') {
                    showLoading();
                    localStorage.setItem('__KL_REMOTE_CLICK', action);
                    localStorage.setItem('__KL_AUTO_REDIRECT', 'true');
                    window.location.href = url;
                }
            }
        });

        setInterval(() => {
            const bottomContainer = getBottomNavContainer();
            if (!bottomContainer) return;

            const currentHTML = bottomContainer.innerHTML;
            let topContainer = document.getElementById('custom-top-pagination');

            if (!topContainer) {
                topContainer = document.createElement('div');
                topContainer.id = 'custom-top-pagination';
                topContainer.style.display = 'flex';
                topContainer.style.alignItems = 'center';

                const header = document.getElementById('my-ads-header');
                if (header) {
                    const headerFlexBox = header.closest('.flex.flex-row.justify-between') || header.parentElement;
                    headerFlexBox.style.display = 'flex';
                    headerFlexBox.style.alignItems = 'center';
                    headerFlexBox.style.justifyContent = 'space-between';
                    headerFlexBox.style.gap = '16px';
                    header.style.marginBottom = '0px';

                    const controlsWrapper = document.createElement('div');
                    controlsWrapper.style.display = 'flex';
                    controlsWrapper.style.alignItems = 'center';
                    controlsWrapper.style.gap = '12px';
                    controlsWrapper.style.marginLeft = 'auto';

                    controlsWrapper.appendChild(topContainer);

                    const spinnerSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#326916" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="custom-spin" style="flex-shrink: 0;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`;
                    const svgSearch = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

                    if (!document.getElementById('custom-age-filter')) {
                        const filterWrapper = document.createElement('div');
                        filterWrapper.id = 'custom-age-filter';
                        filterWrapper.className = 'kit-filter-bar';
                        filterWrapper.innerHTML = `
                            <button type="button" class="kit-btn active-all" data-filter="all"><span class="kit-dot"></span>Alle</button>
                            <div class="kit-separator"></div>
                            <button type="button" class="kit-btn" data-filter="warn"><span class="kit-dot" style="background: #ffb07c;"></span>14-34</button>
                            <div class="kit-separator"></div>
                            <button type="button" class="kit-btn" data-filter="danger"><span class="kit-dot" style="background: #e11d48;"></span>= 35</button>
                        `;

                        filterWrapper.addEventListener('click', (e) => {
                            const btn = e.target.closest('.kit-btn');
                            if (!btn) return;

                            const allBtns = filterWrapper.querySelectorAll('.kit-btn');
                            for (let i = 0; i < allBtns.length; i++) {
                                allBtns[i].classList.remove('active-all', 'active-orange', 'active-red');
                            }

                            if(btn.dataset.filter === 'all') btn.classList.add('active-all');
                            if(btn.dataset.filter === 'warn') btn.classList.add('active-orange');
                            if(btn.dataset.filter === 'danger') btn.classList.add('active-red');

                            window.__KL_ACTIVE_AGE_FILTER = btn.dataset.filter;

                            if (window.applyCustomFilters) window.applyCustomFilters();

                            if (!hasFetchedAllPages && btn.dataset.filter !== 'all') {
                                if (!fetchAdsPromise) {
                                    const originalIconContainer = document.querySelector('#custom-ad-search-wrapper > div:first-child');
                                    if (originalIconContainer) originalIconContainer.innerHTML = spinnerSvg;

                                    fetchAdsPromise = fetchAllUserAds();

                                    fetchAdsPromise.finally(() => {
                                        if (originalIconContainer) originalIconContainer.innerHTML = svgSearch;
                                        if (window.applyCustomFilters) window.applyCustomFilters();
                                    });
                                }
                            }
                        });

                        controlsWrapper.appendChild(filterWrapper);
                    }

                    if (!document.getElementById('custom-ad-search-wrapper')) {
                        const searchWrapper = document.createElement('div');
                        searchWrapper.id = 'custom-ad-search-wrapper';
                        searchWrapper.style.cssText = 'position: relative; display: flex; align-items: center; z-index: 1; background: #ffffff; border: 2px solid #f3f4f6; border-radius: 9999px; height: 46px; width: 280px; padding: 0 36px 0 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.06); transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box; cursor: text; flex-shrink: 0;';

                        const iconContainer = document.createElement('div');
                        iconContainer.innerHTML = svgSearch;
                        iconContainer.style.display = 'flex';
                        searchWrapper.appendChild(iconContainer);

                        const input = document.createElement('input');
                        input.id = 'custom-ad-search-input';
                        input.type = 'text';
                        input.placeholder = 'Anzeigen durchsuchen';
                        input.style.cssText = 'border: none; outline: none; background: transparent; font-size: 14px; width: 100%; margin-left: 10px; color: #333; font-family: inherit;';

                        input.addEventListener('focus', () => {
                            searchWrapper.style.borderColor = '#326916';
                            searchWrapper.style.boxShadow = '0 4px 12px rgba(50, 105, 22, 0.15)';
                        });
                        input.addEventListener('blur', () => {
                            searchWrapper.style.borderColor = '#f3f4f6';
                            searchWrapper.style.boxShadow = '0 4px 10px rgba(0,0,0,0.06)';
                        });
                        searchWrapper.addEventListener('click', () => input.focus());
                        searchWrapper.appendChild(input);

                        const clearBtn = document.createElement('div');
                        clearBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
                        clearBtn.title = "Suche leeren";
                        clearBtn.style.cssText = 'display: none; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; transition: background 0.2s;';
                        clearBtn.addEventListener('mouseover', () => clearBtn.style.backgroundColor = '#f3f4f6');
                        clearBtn.addEventListener('mouseout', () => clearBtn.style.backgroundColor = 'transparent');

                        clearBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            input.value = '';
                            input.dispatchEvent(new Event('input'));
                            input.focus();
                        });
                        searchWrapper.appendChild(clearBtn);

                        input.addEventListener('input', (e) => {
                            const searchTerm = e.target.value.toLowerCase().trim();

                            if (searchTerm.length > 0) {
                                clearBtn.style.display = 'flex';
                            } else {
                                clearBtn.style.display = 'none';
                            }

                            if (window.applyCustomFilters) window.applyCustomFilters();

                            if (!hasFetchedAllPages && searchTerm.length > 0) {
                                if (!fetchAdsPromise) {
                                    iconContainer.innerHTML = spinnerSvg;
                                    fetchAdsPromise = fetchAllUserAds();

                                    fetchAdsPromise.finally(() => {
                                        iconContainer.innerHTML = svgSearch;
                                        if (window.applyCustomFilters) window.applyCustomFilters();
                                    });
                                }
                            }
                        });

                        controlsWrapper.appendChild(searchWrapper);
                    }

                    header.after(controlsWrapper);
                }

                // >>> HIER BEGANN DIE ABGEBROCHENE STELLE <<<

                topContainer.addEventListener('click', (e) => {
                    const btn = e.target.closest('button, a');
                    if (btn && btn.tagName === 'BUTTON') {
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

                // HTML zwischen Bottom und Top Paginierung synchron halten
                setInterval(() => {
                    const realNavContainer = getBottomNavContainer();
                    if (realNavContainer && topContainer.innerHTML !== realNavContainer.innerHTML) {
                        topContainer.innerHTML = realNavContainer.innerHTML;
                    }
                }, 500);
            }
        }, 500);
    } // Ende isOverviewPage Paginierung

    // ==========================================
    // AUTO ACTION LISTENER (Für Duplizieren/Neu Einstellen)
    // ==========================================
    const autoActionStr = localStorage.getItem('__KL_AUTO_ACTION');
    if (autoActionStr && isEditPage) {
        try {
            const data = JSON.parse(autoActionStr);
            const urlParams = new URLSearchParams(window.location.search);
            const currentAdId = urlParams.get('adId');

            if (data && data.adId === currentAdId) {
                window.__KL_ACTION = data.action;
                window.__KL_OLD_AD_ID = currentAdId;

                localStorage.removeItem('__KL_AUTO_ACTION');

                const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Anzeige speichern'));
                if (saveBtn) {
                    showLoading();
                    setTimeout(() => saveBtn.click(), 500);
                }
            }
        } catch(e) {
            console.error("Fehler beim Verarbeiten der Auto-Action", e);
            localStorage.removeItem('__KL_AUTO_ACTION');
        }
    }

    // ==========================================
    // CONFIRM PAGE HANDLER (Löschen der alten Anzeige nach Erfolg)
    // ==========================================
    if (isConfirmPage) {
        if (window.__KL_ACTION && window.__KL_OLD_AD_ID) {
            if (window.__KL_ACTION === 'relist') {
                showLoading();
                fetch('/m-anzeige-loeschen.html?adId=' + window.__KL_OLD_AD_ID, { method: 'GET' })
                    .then(() => {
                        window.__KL_ACTION = null;
                        window.__KL_OLD_AD_ID = null;
                        if (localStorage.getItem('__KL_AUTO_REDIRECT')) {
                            localStorage.removeItem('__KL_AUTO_REDIRECT');
                            window.location.href = '/m-meine-anzeigen.html';
                        }
                    })
                    .catch(err => {
                        console.error('Fehler beim Löschen der alten Anzeige:', err);
                        alert('Die Anzeige wurde neu eingestellt, aber die alte konnte nicht gelöscht werden. Bitte manuell löschen.');
                    });
            } else if (window.__KL_ACTION === 'duplicate') {
                window.__KL_ACTION = null;
                window.__KL_OLD_AD_ID = null;
                if (localStorage.getItem('__KL_AUTO_REDIRECT')) {
                    localStorage.removeItem('__KL_AUTO_REDIRECT');
                    window.location.href = '/m-meine-anzeigen.html';
                }
            }
        } else if (localStorage.getItem('__KL_AUTO_REDIRECT')) {
            localStorage.removeItem('__KL_AUTO_REDIRECT');
            window.location.href = '/m-meine-anzeigen.html';
        }
    }
})();
