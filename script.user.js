// ==UserScript==
// @name         Kleinanzeigen UI Tweaks & Adblocker
// @namespace    http://tampermonkey.net/
// @version      2.5.74
// @description  Globale Werbeblockierung, Profilbox-Redesign und UI-Anpassungen
// @author       Andi
// @match        https://www.kleinanzeigen.de/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kleinanzeigen.de
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // =========================================================================
    // 1. GLOBALER WERBEBLOCKER (Wird sofort ausgeführt)
    // =========================================================================
    function injectGlobalAdBlocker() {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `
            /* Oben / Header (Startseite, Suche, Merkliste, Nachrichten) */
            .liberty-filled, .j-liberty-wrapper, .banner.l-container, [id*="-atf"], [id^="dfp-"],
            /* Unten / Footer */
            [id*="btf-billboard"], [id*="billboard"],
            /* Seitenränder Klassisch */
            .site-base--left-banner--full, .site-base--right-banner--full, .site-base--left-banner, .site-base--right-banner,
            /* Seitenränder neues Tailwind-Design */
            .absolute.top-none.right-small.bottom-1\\/2, .absolute.bottom-none.top-1\\/2.right-small.pt-large,
            .absolute.top-none.left-small.bottom-1\\/2, .absolute.bottom-none.top-1\\/2.left-small.pt-large,
            /* Container in den Suchergebnissen */
            div[data-testid*="banner"], div[data-testid*="ad-wrapper"], .ad-module {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
                pointer-events: none !important;
                visibility: hidden !important;
                margin: 0 !important;
                padding: 0 !important;
            }
        `;
        document.head.appendChild(style);
    }
    injectGlobalAdBlocker();

    // =========================================================================
    // 2. CSS STYLING FÜR PROFILBOX & LAYOUT
    // =========================================================================
    GM_addStyle(`
        /* Profil Container Breiten */
        .ownprofile-header { width: 1000px !important; }
        .jsx-3029977195.mt-xxsmall.flex.flex-col { width: 610px !important; margin-top: 0px !important; row-gap: 8px !important; }
        h2.jsx-3029977195.text-title2 { width: 610px !important; height: 24px !important; margin-bottom: 0px !important; }
        .UserProfile--Info { width: 610px !important; }
        
        /* Badges Liste */
        .ownprofile-badges { 
            width: 610px !important; 
            padding-left: 0px !important; 
            margin: 0px !important; 
            height: 24px !important; 
            gap: 12px !important; 
            display: flex !important; 
            flex-direction: row !important; 
        }
        .userbadges--item { padding-left: 0px !important; }
        
        /* Kein Pointer-Cursor NUR für das neue Antwortzeit-Badge */
        .custom-reply-badge, .custom-reply-badge * { cursor: default !important; }

        /* Benutzer-Info Liste (Aktiv seit, etc.) */
        ul[data-testid="user-info"] { column-gap: 15px !important; row-gap: 8px !important; }

        /* Header & Paginierung ("Meine Anzeigen") */
        .flex.flex-row.justify-between:has(h2#my-ads-header) { 
            height: 40px !important; 
            align-items: center !important; 
            position: relative !important; 
        }
        #custom-top-pagination { 
            position: absolute; 
            left: 50%; 
            transform: translateX(-50%); 
            z-index: 10; 
            display: flex; 
            align-items: center; 
        }
        h2#my-ads-header { margin-bottom: 0px !important; width: 200px !important; }
    `);

    // =========================================================================
    // 3. DOM MANIPULATION (Profilbox umbauen & Paginierung klonen)
    // =========================================================================
    function modifyUI() {
        // --- A. Profilbox umbauen ---
        const mainContainer = document.querySelector('.jsx-3029977195.mt-xxsmall.flex.flex-col');
        const badgesContainer = document.querySelector('.ownprofile-badges');
        const userInfoList = document.querySelector('ul[data-testid="user-info"]');
        const infoZeile = document.querySelector('.UserProfile--Info');
        
        if (mainContainer) {
            // 1. Info-Icon löschen
            const infoIconContainer = document.querySelector('.pl-xsmall.pt-\\[10px\\]');
            if (infoIconContainer) infoIconContainer.remove();

            // 2. Antwortzeit aus Nutzerinfo extrahieren & als Badge umbauen
            if (userInfoList && badgesContainer) {
                const listItems = userInfoList.querySelectorAll('li.flex.gap-xxsmall');
                listItems.forEach(item => {
                    const text = item.textContent.trim();
                    // Sucht flexibel nach Stunden, Tagen oder Wochen
                    const match = text.match(/Antwortet.*innerhalb\s*(?:von\s*)?(\d+)\s*(Stunden?|Tagen?|Wochen?)/i) || text.match(/Antwortet.*innerhalb\s*(?:von\s*)?(.*?)$/i);
                    
                    if (match && !document.querySelector('.custom-reply-badge')) {
                        let formattedTime = "";
                        if (match[1] && match[2]) {
                            const unit = match[2].toLowerCase();
                            if (unit.includes('stunde')) formattedTime = `${match[1]}h`;
                            else if (unit.includes('tag')) formattedTime = `${match[1]}T`;
                            else if (unit.includes('woche')) formattedTime = `${match[1]}W`;
                        } else if (text.includes('Minuten')) {
                            const minMatch = text.match(/(\d+)\s*Min/i);
                            if (minMatch) formattedTime = `${minMatch[1]}m`;
                        }
                        if (!formattedTime) formattedTime = match[1] || "kurzer Zeit"; // Fallback

                        const newText = `Antwortet innerhalb ${formattedTime}`;
                        
                        // Neues Badge erstellen und Klasse 'custom-reply-badge' vergeben
                        const li = document.createElement('li');
                        li.className = 'jsx-1176518552 userbadges--item custom-reply-badge';
                        li.innerHTML = `
                            <div class="jsx-2505060003 bg-transparent h-auto min-h-none p-none" style="display:inline-block;">
                                <div class="jsx-464155839 ActivityIndicator text-bodySmall bg-accentContainer text-onAccentContainer rounded-full">
                                    <svg viewBox="0 0 24 24" fill="none" class="shrink-0 fill-current block align-middle w-small h-small text-onAccentContainer">
                                        <path d="M13 7C13 6.44772 12.5523 6 12 6C11.4477 6 11 6.44772 11 7V11.5858L9.29289 13.2929C8.90237 13.6834 8.90237 14.3166 9.29289 14.7071C9.68342 15.0976 10.3166 15.0976 10.7071 14.7071L12.6485 12.7657C12.8736 12.5406 13 12.2354 13 11.9172V7Z" fill="currentColor"></path>
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z" fill="currentColor"></path>
                                    </svg>
                                    <span class="jsx-464155839 ActivityIndicator--Name">${newText}</span>
                                </div>
                            </div>`;
                        badgesContainer.appendChild(li);
                        item.remove(); // Originales Info-Item löschen
                    }
                });
            }

            // 3. Badges ÜBER die Infozeile verschieben
            if (badgesContainer && infoZeile) {
                mainContainer.insertBefore(badgesContainer, infoZeile);
            }

            // 4. Nutzerinfo in den Main Container verschieben
            if (userInfoList) {
                mainContainer.appendChild(userInfoList);
            }
        }

        // --- B. Paginierung klonen & Header anpassen ---
        const originalNav = document.querySelector('nav[aria-labelledby*="-label"]');
        const headerContainer = document.querySelector('.flex.flex-row.justify-between:has(h2#my-ads-header)');
        
        if (originalNav && headerContainer && !document.getElementById('custom-top-pagination')) {
            const paginationWrapper = document.createElement('div');
            paginationWrapper.id = 'custom-top-pagination';
            paginationWrapper.innerHTML = originalNav.outerHTML;
            // Direkt an den bestehenden Header-Container hängen (erhält dadurch absolute Positionierung zur Zeile)
            headerContainer.appendChild(paginationWrapper);
        }
    }

    // =========================================================================
    // 4. STATISTIK TOOLTIP (Mouse-Over für Fetch-Ergebnisse)
    // =========================================================================
    function addStatsTooltip() {
        // Sucht generisch nach deinen eingefügten Durchschnittswerten und fügt den title-Tag hinzu
        const allListItems = document.querySelectorAll('li');
        allListItems.forEach(li => {
            if (li.textContent.includes('Ø') && !li.hasAttribute('title')) {
                // Prüft ob es wie deine Statistik aussieht (enthält Zahlen und ein Durchschnittszeichen)
                li.setAttribute('title', 'Besucher / Gemerkt pro Tag');
            }
        });
    }

    // =========================================================================
    // INITIALISIERUNG & OBSERVER (für dynamisch ladende Inhalte)
    // =========================================================================
    const observer = new MutationObserver(() => {
        modifyUI();
        addStatsTooltip();
    });
    
    // Überwache den gesamten Body auf Änderungen (wichtig bei React-Seiten wie Kleinanzeigen)
    observer.observe(document.body, { childList: true, subtree: true });

    // Führe es auch einmal direkt aus
    modifyUI();

})();
