# Greysoul Art – Shop

Statische Website (kein Server, kein Build-Schritt). Claudia pflegt Produkte und
Blogbeiträge selbst über die Admin-Oberfläche unter `/admin/` (Decap CMS) –
jede Änderung landet als Commit im Git-Repo und ist danach sofort live.

## Struktur

- `index.html` – der Shop selbst (lädt `data/products.json` und `data/posts.json` per fetch)
- `data/products.json` – alle Werke (vom CMS verwaltet)
- `data/posts.json` – alle Blogbeiträge (vom CMS verwaltet)
- `images/` – hochgeladene Bilder (vom CMS verwaltet)
- `admin/` – die Content-Manager-Oberfläche für Claudia

## Lokal testen

Diese Seite lädt Daten per `fetch()`, das funktioniert nicht per Doppelklick
auf `index.html` (file://). Lokal testen geht so:

```bash
cd greysoul-art-shop
python3 -m http.server 8080
```

Dann im Browser `http://127.0.0.1:8080` öffnen.

## Live schalten (einmalig, ca. 20–30 Minuten)

**Empfehlung: GitHub (kostenlos) + Netlify Free-Plan (kostenlos, 0 €/Monat).**
Für eine Seite dieser Größe reicht der kostenlose Netlify-Plan völlig aus
(100 GB Traffic/Monat, HTTPS inklusive). Eine eigene Domain (z. B.
greysoul-art.de) kostet separat bei einem Registrar ca. 10–15 €/Jahr – nicht
bei Netlify selbst kaufen, das ist dort meist teurer.

1. ✓ **GitHub-Repo** `greysoulart/greysoul-art-shop` angelegt und Code
   gepusht.
2. **Netlify-Account** (netlify.com, kostenlos) – mit "Log in with GitHub"
   und dabei das `greysoulart`-Konto wählen (wichtig, sonst verbindet
   Netlify das falsche Repo).
3. "Import an existing project" → GitHub → `greysoul-art-shop` auswählen.
   Build command leer lassen, Publish directory: `.` (Root). Deploy klicken.
4. Admin-Login einrichten (Git Gateway/Identity-Login ist für neue Netlify-
   Projekte nicht mehr verfügbar, daher direkter GitHub-Login):
   - Bei GitHub (als `greysoulart`): [github.com/settings/developers](https://github.com/settings/developers)
     → OAuth Apps → New OAuth App. Authorization callback URL muss exakt
     `https://api.netlify.com/auth/done` sein. Client ID und Client Secret
     notieren.
   - Bei Netlify: **Project configuration → Security → OAuth** → unter
     "Authentication Providers" → "Install provider" → GitHub → Client ID
     und Secret eintragen, speichern.
5. Claudia öffnet `https://<ihre-seite>.netlify.app/admin/`, klickt "Login
   with GitHub" und kann über die Formulare Werke und Blogbeiträge
   hinzufügen, bearbeiten oder löschen – inklusive Bild-Upload direkt im
   Formular.

Hinweis: Netlify Identity selbst läuft weiter, aber das dafür nötige
"Git Gateway" wurde von Netlify eingestellt (Stand November 2026) und lässt
sich bei neuen Projekten nicht mehr aktivieren. Der direkte GitHub-Login
(oben) ist der aktuell von Netlify dokumentierte, funktionierende Weg und
braucht kein zusätzliches Konto, da Claudia ihr GitHub-Konto ohnehin schon
hat.

## Danach offene Punkte

- **Zahlungen**: Aktuell nur simuliert (Demo-Bestätigung). Für echte Zahlungen
  braucht es einen Zahlungsdienstleister (z. B. Mollie: SEPA-Überweisung,
  PayPal und Klarna/Sofort in einem Gateway, keine Grundgebühr).
- **Impressum / Datenschutz**: Noch Platzhaltertexte – müssen vor dem
  Live-Start mit Claudias echten Angaben ausgefüllt werden (gesetzlich
  vorgeschrieben).
- **Eigene Domain**: optional, sonst läuft die Seite unter
  `<name>.netlify.app`.
