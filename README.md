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

1. **GitHub-Repo anlegen** (falls noch nicht vorhanden): auf github.com einen
   kostenlosen Account anlegen (am besten eines, das Claudia langfristig
   selbst gehört), neues **privates** Repository erstellen, z. B.
   `greysoul-art-shop`.
2. Dieses Projekt dorthin pushen:
   ```bash
   cd greysoul-art-shop
   git remote add origin <URL des neuen Repos>
   git branch -M main
   git commit -m "Initial commit"   # falls noch nicht committet
   git push -u origin main
   ```
3. **Netlify-Account anlegen** (netlify.com, kostenlos) – am besten mit
   "Sign up with GitHub", dann sind die Konten gleich verbunden.
4. "Add new site" → "Import an existing project" → GitHub-Repo auswählen.
   Build command leer lassen, Publish directory: `.` (Root). Deploy klicken.
5. Im Netlify-Dashboard der Seite: **Site configuration → Identity → Enable
   Identity**. Unter Registration preferences **"Invite only"** einstellen
   (damit sich nicht jeder selbst anmelden kann).
6. **Site configuration → Identity → Services → Git Gateway → Enable Git
   Gateway.**
7. **Identity → Invite users** → Claudias E-Mail-Adresse eintragen. Sie
   bekommt eine E-Mail, setzt sich ein eigenes Passwort und kann sich danach
   einloggen.
8. Claudia öffnet `https://<ihre-seite>.netlify.app/admin/`, loggt sich ein
   und kann über die Formulare Werke und Blogbeiträge hinzufügen, bearbeiten
   oder löschen – inklusive Bild-Upload direkt im Formular.

Hinweis: Netlify Identity wird von Netlify nicht mehr aktiv weiterentwickelt.
Für eine so kleine, nicht-öffentliche Nutzergruppe (nur Claudia) funktioniert
es aber weiterhin zuverlässig. Sollte Netlify den Dienst für neue Sites doch
einmal sperren, ist die Alternative ein GitHub-Login direkt für Claudia
(dann braucht sie zusätzlich einen eigenen, kostenlosen GitHub-Account) –
sag Bescheid, dann stelle ich `admin/config.yml` entsprechend um.

## Danach offene Punkte

- **Zahlungen**: Aktuell nur simuliert (Demo-Bestätigung). Für echte Zahlungen
  braucht es einen Zahlungsdienstleister (z. B. Mollie: SEPA-Überweisung,
  PayPal und Klarna/Sofort in einem Gateway, keine Grundgebühr).
- **Impressum / Datenschutz**: Noch Platzhaltertexte – müssen vor dem
  Live-Start mit Claudias echten Angaben ausgefüllt werden (gesetzlich
  vorgeschrieben).
- **Eigene Domain**: optional, sonst läuft die Seite unter
  `<name>.netlify.app`.
