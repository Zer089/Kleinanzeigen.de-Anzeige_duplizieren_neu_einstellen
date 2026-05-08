// ... existing code ...
// @version       2.5.66
// ... existing code ...
                        // Reply-Element (Antwortzeit) in die Badges verschieben und Text kürzen
                        if (badgesUl) {
                            const replyLi = Array.from(userInfoUl.querySelectorAll('li')).find(li => li.textContent.includes('Antwortet'));
                            if (replyLi) {
                                // Suche nach dem Uhr-Icon im ursprünglichen Element
                                const svgIcon = replyLi.querySelector('svg');
                                
                                // Text extrahieren und formatieren
                                let timeText = '';
                                const match = replyLi.textContent.match(/(\d+)\s*(Stunden?|Minuten?|Tagen?|Wochen?)/i);
                                if (match) {
                                    let unit = '';
                                    if (match[2].toLowerCase().includes('stunde')) unit = 'h';
                                    else if (match[2].toLowerCase().includes('minute')) unit = 'm';
                                    else if (match[2].toLowerCase().includes('tage')) unit = 'T';
                                    else if (match[2].toLowerCase().includes('woche')) unit = 'W';
                                    
                                    timeText = `Antwortet in <${match[1]}${unit}`;
                                } else {
                                    // Fallback
                                    timeText = replyLi.textContent
                                        .replace('Antwortet in der Regel innerhalb von', 'Antwortet in <')
                                        .replace('wenigen Minuten', '1m')
                                        .replace('Stunden', 'h')
                                        .replace('Stunde', 'h')
                                        .replace('Minuten', 'm')
                                        .replace('Tagen', 'T')
                                        .replace('Tage', 'T')
                                        .replace('Tag', 'T')
                                        .replace('Wochen', 'W')
                                        .replace('Woche', 'W')
                                        .trim();
                                }

                                // Erstelle ein neues Listenelement im Badge-Format
                                const newBadgeLi = document.createElement('li');
                                newBadgeLi.className = 'jsx-1176518552 userbadges--item';
                                
                                // Baue die innere Struktur exakt wie bei den anderen Badges nach
                                newBadgeLi.innerHTML = `
                                    <button data-testid="user-badge" aria-haspopup="dialog" class="jsx-2505060003 bg-transparent h-auto min-h-none p-none" style="cursor: default;">
                                        <div class="jsx-464155839 ActivityIndicator text-bodySmall bg-accentContainer text-onAccentContainer rounded-full">
                                            ${svgIcon ? svgIcon.outerHTML.replace('w-medium h-medium', 'w-small h-small text-onAccentContainer') : ''}
                                            <span class="jsx-464155839 ActivityIndicator--Name">${timeText}</span>
                                        </div>
                                    </button>
                                `;

                                // Icon anpassen, falls es verschoben wurde
                                const movedSvg = newBadgeLi.querySelector('svg');
                                if (movedSvg) {
                                    movedSvg.setAttribute('class', 'shrink-0 fill-current block align-middle w-small h-small text-onAccentContainer');
                                }

                                badgesUl.appendChild(newBadgeLi);
                                replyLi.remove(); // Lösche das alte Element aus der userInfoUl
                            }
                        }
                    }

                    // Neue Style-Vorgaben für Header und Badges-Container anwenden
// ... existing code ...
