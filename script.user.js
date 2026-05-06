// ==UserScript==
// @name          Kleinanzeigen - Anzeige duplizieren / neu einstellen
// @namespace     https://github.com/Zer089/Kleinanzeigen.de-Anzeige_duplizieren_neu_einstellen
// @description   Bietet eine "Anzeige duplizieren / neu einstellen" Funktion beim Bearbeiten einer vorhandenen Anzeige in Kleinanzeigen.
// @icon          https://play-lh.googleusercontent.com/PuqeuAmOMsDoB9gRCVr-EQHthinCbtaKPzMbxabfmCY9RI9r1fmWncCb4k6umBszzPaszT_o2RopSpIhy9BAiQ=w240-h480-rw
// @copyright     2026, Andi (Zer089)
// @license       MIT
// @version       2.5.19
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

    const isOverviewPage = window.location.href.includes('m-meine-anzeigen.html');
    const isEditPage = window.location.href.includes('p-anzeige-bearbeiten.html');
    const isConfirmPage = window.location.href.includes('bestaetigung.html');
    const isDetailPage = window.location.href.includes('/s-anzeige/');

    if (isOverviewPage) document.documentElement.classList.add('is-overview-page');
    if (isDetailPage || isEditPage) document.documentElement.classList.add('is-detail-page');

    // ==========================================
    // TRACKING-BLOCKER
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
    // CSS INJECTION (Layout Fixes)
    // ==========================================
    const style = document.createElement('style');
    style.textContent = `
        /* Werbe-Säuberung */
        fieldset:has(#ad-feature-group), span:has(> div.bg-accentContainer), #feature-offer-section,
        .site-base--left-banner, .site-base--right-banner, #vip-billboard, #vip-belly, #vip-middle, #vip-bottom,
        [id^="vip-similar-ads-"], #pvap-featrs, .is-detail-page .icon-info-blue { display: none !important; }

        section[data-testid="page-container"] { margin-bottom: 0px !important; }

        /* Lila Buttons Design */
        .custom-purple-btn {
            background-color: #5A33AE !important; border-color: #5A33AE !important; color: #ffffff !important;
            height: 44px !important; padding: 0 16px !important; border-radius: 9999px !important;
            font-weight: bold !important; font-size: 14px !important; cursor: pointer !important;
            display: inline-flex !important; align-items: center !important; gap: 8px !important;
        }
        .custom-purple-btn:hover { background-color: #D1C4E9 !important; border-color: #D1C4E9 !important; color: #5A33AE !important; }

        /* Detailseite: Statistik & Button-Umbau */
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
        }

        /* Übersicht Seite Fix */
        .is-overview-page .managead-list-item-action-buttons { display: flex !important; flex-wrap: wrap !important; gap: 8px !important; justify-content: flex-end !important; }
        .is-overview-page .managead-list-item-action-buttons li { margin: 0 !important; width: auto !important; }
    `;
    document.head ? document.head.appendChild(style) : document.addEventListener('DOMContentLoaded', () => document.head.appendChild(style));

    // ==========================================
    // BUTTON LOGIK
    // ==========================================
    function createBtn(text, icon, click) {
        const b = document.createElement('button');
        b.className = 'custom-purple-btn';
        b.innerHTML = `<span>${icon}</span> <span>${text}</span>`;
        b.onclick = click;
        return b;
    }

    const inject = () => {
        const editLinks = document.querySelectorAll('a[href*="/p-anzeige-bearbeiten.html"]');
        editLinks.forEach(link => {
            const container = link.closest('ul') || link.parentElement;
            if (!container || container.dataset.klInjected) return;
            
            const adId = link.getAttribute('href').match(/adId=(\d+)/)[1];
            const doAction = (type) => {
                localStorage.setItem('__KL_AUTO_ACTION', JSON.stringify({action: type, adId}));
                window.location.href = link.href;
            };

            const li1 = document.createElement(container.tagName === 'UL' ? 'li' : 'span');
            li1.appendChild(createBtn('Duplizieren', '⧉', () => doAction('duplicate')));
            const li2 = document.createElement(container.tagName === 'UL' ? 'li' : 'span');
            li2.appendChild(createBtn('Neu einstellen', '⟳', () => doAction('relist')));

            container.append(li1, li2);
            container.dataset.klInjected = 'true';
        });
    };
    setInterval(inject, 500);

    // Top Paginierung Übersicht
    if (isOverviewPage) {
        setInterval(() => {
            const bottomNav = document.querySelector('div.flex.justify-center:has(nav)');
            if (!bottomNav || document.getElementById('custom-top-pagination')) return;
            const topNav = bottomNav.cloneNode(true);
            topNav.id = 'custom-top-pagination';
            topNav.className = 'flex items-center justify-center';
            const header = document.getElementById('my-ads-header');
            if (header) {
                header.parentElement.style.display = 'flex';
                header.parentElement.style.alignItems = 'center';
                header.style.flex = '1';
                header.after(topNav);
                topNav.onclick = (e) => {
                    const idx = Array.from(topNav.querySelectorAll('button')).indexOf(e.target.closest('button'));
                    if (idx > -1) bottomNav.querySelectorAll('button')[idx].click();
                };
            }
        }, 500);
    }

    // Auto-Save Logik
    if (isEditPage) {
        const config = JSON.parse(localStorage.getItem('__KL_AUTO_ACTION') || '{}');
        const currentId = new URLSearchParams(window.location.search).get('adId');
        if (config.adId === currentId) {
            localStorage.removeItem('__KL_AUTO_ACTION');
            window.addEventListener('load', () => {
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

    // Löschen & Interceptor
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
