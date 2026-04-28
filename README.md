# 🚀 Kleinanzeigen - Anzeige duplizieren & neu einstellen

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.0.4-blue.svg)]()
[![Plattform](https://img.shields.io/badge/Plattform-Kleinanzeigen.de-green.svg)]()

Das Userscript (für Tampermonkey / Greasemonkey), das dir auf **Kleinanzeigen.de** viel Zeit und Nerven spart. Es fügt der "Anzeige bearbeiten"-Seite zwei neue Buttons hinzu, mit denen du deine Anzeigen mit nur einem Klick duplizieren oder löschen und direkt wieder ganz oben neu einstellen kannst.

---

## ✨ Features

* 🔄 **Neu einstellen (1-Klick):** Löscht deine alte Anzeige im Hintergrund und stellt sie exakt gleich als nagelneue Anzeige wieder ein (pusht sie wieder auf Seite 1).
* 👯‍♂️ **Duplizieren:** Erstellt eine exakte Kopie deiner Anzeige, ohne das Original zu löschen.
* 🛡️ **Zero-Data-Loss Garantie:** Dank moderner Netzwerk-Interceptoren wird die alte Anzeige **erst dann gelöscht**, wenn der Server die Erstellung der neuen Anzeige zu 100 % bestätigt hat. Kein Datenverlust bei Verbindungsabbrüchen!
* 🚫 **Popup- & Upsell-Blocker:** * Überspringt automatisch das nervige "Effektiver verkaufen" / "Hochschieben" Werbe-Popup beim Speichern.
    * Blendet störende kostenpflichtige Optionen (Highlight, Galerie, etc.) direkt auf der Bearbeiten-Seite aus.
* 🎨 **Natives Design:** Die neuen Buttons fügen sich nahtlos in das moderne Design von Kleinanzeigen ein (inklusive schickem Hover-Effekt im originalen Lila-Ton).

---

## 📸 Screenshots

![Screenshot der Buttons](https://raw.githubusercontent.com/Zer089/Kleinanzeigen.de-Anzeige_duplizieren_neu_einstellen/refs/heads/main/Buttons.png)

---

## ⚙️ Installation

Um dieses Skript zu nutzen, benötigst du eine Userscript-Erweiterung für deinen Browser.

**Schritt 1: Browser-Erweiterung installieren**
Installiere eine der folgenden Erweiterungen (kostenlos):
* **Chrome / Edge:** [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) oder [Violentmonkey](https://chrome.google.com/webstore/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag)
* **Firefox:** [Tampermonkey](https://addons.mozilla.org/de/firefox/addon/tampermonkey/) oder [Greasemonkey](https://addons.mozilla.org/de/firefox/addon/greasemonkey/)
* **Safari:** [Tampermonkey](https://apps.apple.com/de/app/tampermonkey/id1482490089)

**Schritt 2: Skript installieren**
Klicke auf den folgenden Link, um das Skript direkt in deiner Erweiterung zu installieren:
👉 **[Skript jetzt installieren](https://github.com/Zer089/Kleinanzeigen.de-Anzeige_duplizieren_neu_einstellen/blob/main/script.user.js)**

*(Alternativ: Kopiere den Code aus der `script.user.js` Datei und füge ihn manuell als neues Skript in Tampermonkey ein.)*

---

## 🛠️ Bedienung

1. Gehe auf Kleinanzeigen.de zu **"Meine Anzeigen"**.
2. Klicke bei einer beliebigen Anzeige auf **"Bearbeiten"**.
3. Scrolle ganz nach unten. Rechts neben dem "Anzeige speichern" Button findest du nun die beiden neuen Buttons **Duplizieren** und **Neu einstellen**.
4. Klicke auf deine gewünschte Aktion. Das Skript übernimmt den Rest (Ladebildschirm abwarten) und leitet dich direkt zur Bestätigungsseite weiter.

---

## ⚠️ Disclaimer & Sicherheit

> **Hinweis:** Dieses Skript ist ein inoffizielles Tool und steht in keiner Verbindung zu Kleinanzeigen (Marktplaats B.V.). Die Nutzung erfolgt auf eigene Gefahr. 

Das Skript agiert datenkonform:
* Es liest keine Passwörter oder privaten Nachrichten aus.
* Es nutzt keine externen Server (alles läuft lokal in deinem Browser).
* Es umgeht **keine** Limits von Kleinanzeigen (z. B. das Limit für kostenlose Anzeigen in bestimmten Kategorien). Wenn dein Limit erreicht ist, zeigt Kleinanzeigen dir den regulären Bezahl-Dialog an.

---

## 📜 Lizenz

Dieses Projekt ist lizenziert unter der **MIT License** - siehe [LICENSE](LICENSE) Datei für Details.

**© 2026, Andi (Zer089)**
