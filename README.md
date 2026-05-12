# 🚀 Kleinanzeigen - Anzeige duplizieren & neu einstellen

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-2.6.15-blue.svg)]()
[![Plattform](https://img.shields.io/badge/Plattform-Kleinanzeigen.de-green.svg)]()

Das Userscript, das dir auf **Kleinanzeigen.de** viel Zeit und Nerven spart. Es verwandelt deine "Meine Anzeigen"-Übersicht in ein smartes Dashboard: Ohne eine Anzeige erst öffnen oder auf "Bearbeiten" klicken zu müssen, hast du direkt in der Übersicht Zugriff auf zwei neue Buttons, mit denen du deine Anzeigen mit nur einem Klick duplizieren oder löschen und direkt wieder ganz oben neu einstellen kannst. Gleichzeitig zeigt dir das Dashboard alle wichtigen Infos (wie das Einstelldatum und Ablaufdatum deiner Anzeige sowie der errechneten Onlinezeit in Tagen, Ort, Anzeige-ID und Versand) auf einen Blick, für die du sonst ins Inserat klicken müsstest!

Die meisten Userscripte für Kleinanzeigen funktionieren nach den letzten großen Architektur-Updates der Plattform nicht mehr. Dieses Tool wurde von Grund auf neu entwickelt, um das aktuelle React-Frontend und die neuen JSON-Schnittstellen von Kleinanzeigen.de zu unterstützen. Es fängt Datenpakete direkt im Netzwerkverkehr ab, überspringt unsichtbare Werbe-Popups und bietet eine 100%ige "Zero-Data-Loss"-Garantie.

![Social Preview](https://raw.githubusercontent.com/Zer089/Kleinanzeigen.de-Anzeige_duplizieren_neu_einstellen/refs/heads/main/Social%20Preview.png)

---

## ✨ Features

* 🔄 **Neu einstellen (1-Klick):** Löscht deine alte Anzeige im Hintergrund und stellt sie exakt gleich als nagelneue Anzeige wieder ein (pusht sie wieder auf Seite 1).
* 👯‍♂️ **Duplizieren:** Erstellt eine exakte Kopie deiner Anzeige, ohne das Original zu löschen.

     💡 **Direkter Zugriff:** Beide Buttons befinden sich direkt in der Anzeigenübersicht, der Detailansicht und in der Bearbeitungsmaske. Die lästigen extra Klicks auf die Anzeige und dann auf "Bearbeiten" entfallen komplett!
  
* 📊 **Erweiterte Anzeigenanalyse & Dashboard (NEU):** Deine Übersicht wird zum voll ausgestatteten Dashboard. Ohne die Anzeige öffnen zu müssen, siehst du sofort Ort, Anzeigen-ID und Infos zum Versand. Im Hintergrund werden zudem das Erstelldatum, das Ablaufdatum sowie die durchschnittlichen Klicks/Gemerkt pro Tag geladen. Die Online-Tage zeigen dir dabei durch ein farbliches Ampelsystem auf einen Blick, welche Anzeigen dringend erneuert werden sollten.
* 🎨 **Komplettes Profil-Redesign (NEU):** Die Profilbox auf der Übersichtsseite wurde komplett modernisiert. Das neue "Custom Dashboard" bietet dir alle wichtigen Statistiken, Badges und Buttons auf einen Blick im eleganten Grid-Design.
* 🔍 **Kategorie- & Ranking-Check (NEU):** Die Kategorie einer Anzeige ist jetzt auf der Übersichtsseite klickbar. So springst du direkt in das exakte Suchergebnis für deinen Ort und deine Kategorie, um dein aktuelles Ranking zu prüfen.
* 🏷️ **Verkaufsschild Direktzugriff (NEU):** Der versteckte "Verkaufsschild" Button wurde aus dem Dropdown-Menü befreit und ist jetzt direkt mit einem Klick in der Anzeigenübersicht erreichbar.
* 📐 **Widescreen & Layout-Fixes (NEU):** Das starre Layout von Kleinanzeigen wird intelligent in der Breite aufgebrochen. Der  Platz wird nun effektiv und überichtlich genutzt.
* 🚫 **Popup- & Upsell-Blocker:** * Überspringt automatisch das nervige "Effektiver verkaufen" / "Hochschieben" Werbe-Popup beim Speichern.
    * Blendet störende kostenpflichtige Optionen (Highlight, Galerie, etc.) direkt auf der Bearbeiten-Seite aus.
    * Blendet jegliche Bannerwerbung aus! Egal ob Seitenbanner, als oberer Werbe-Karussell-Banner oder direkt innerhalb der Anzeigeergebnisse - Das Skript bockiert alles weg!
* 🎨 **Natives Design:** Die neuen Buttons fügen sich nahtlos in das moderne Design von Kleinanzeigen ein (inklusive schickem Hover-Effekt im originalen Lila-Ton).
* 🛡️ **Zero-Data-Loss Garantie:** Dank moderner Netzwerk-Interceptoren wird die alte Anzeige erst dann gelöscht, wenn der Server die Erstellung der neuen Anzeige zu 100 % bestätigt hat. Kein Datenverlust bei Verbindungsabbrüchen!

---

## 📸 Screenshots

![Screenshot der Buttons](https://raw.githubusercontent.com/Zer089/Kleinanzeigen.de-Anzeige_duplizieren_neu_einstellen/refs/heads/main/Buttons.png)
![Vergleich vorher - nachher](https://raw.githubusercontent.com/Zer089/Kleinanzeigen.de-Anzeige_duplizieren_neu_einstellen/refs/heads/main/Vergleich.png)

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

[![Installieren: Kleinanzeigen.de-Anzeige_duplizieren_neu_einstellen](https://img.shields.io/badge/Installieren-Skript-00aa00?style=for-the-badge&amp;logo=tampermonkey)](https://github.com/Zer089/Kleinanzeigen.de-Anzeige_duplizieren_neu_einstellen/raw/main/script.user.js)



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
