# MoebelDesignLicencing

Interner Lizenzserver mit React-/Tailwind-Adminoberfläche, Express-API, Prisma und PostgreSQL. Das Frontend besitzt ausschließlich einen Adminzugang. Carpenters Production und die Wiest Design Suite greifen über getrennt authentifizierte Backend-APIs zu.

## Enthaltene Dienste

- `traefik`: Routing für Frontend und `/api`
- `frontend`: statischer Vite-/React-Build über nginx
- `backend`: Express, Admin-Sessions, CSRF-Schutz und Lizenz-API
- `postgres`: persistente Lizenz-, Admin-, Session- und Auditdaten

Der Backend-Container hängt zusätzlich im externen Netzwerk `MoebelDesign` und ist dort unter `http://licensing-api:5100` erreichbar.

## Start mit Docker

```bash
cp .env.example .env
openssl rand -base64 36   # für ADMIN_PASSWORD
openssl rand -hex 32      # für CARPENTERS_API_KEY
openssl rand -hex 32      # eigener DESIGN_SUITE_API_KEY
docker network inspect MoebelDesign >/dev/null 2>&1 || docker network create MoebelDesign
docker compose up --build
```

Danach:

- Adminoberfläche: `http://licence.localhost`
- Healthcheck: `http://licence.localhost/api/health`

Vor dem Start muss CarpentersProduction laufen, da dieser Stack Traefik und das
externe Netzwerk `carpenters-proxy` bereitstellt. Die Werte in `.env` müssen vor
dem Start ersetzt werden. In Produktion gehören Traefik-TLS, sichere DNS-Namen
und `ALLOWED_ORIGINS=https://...` davor.

## Verbindung mit CarpentersProduction

Beide Backends müssen am externen Netzwerk hängen. Im CarpentersProduction-Compose wird dessen Backend ergänzt:

```yaml
services:
  backendjs:
    networks:
      - carpenters-network
      - MoebelDesign

networks:
  MoebelDesign:
    external: true
    name: MoebelDesign
```

In `CarpentersProduction/Backend/.env`:

```dotenv
LICENSE_PROVIDER=remote
LICENSE_SERVER_URL=http://licensing-api:5100/
LICENSE_SERVER_API_KEY=<identisch mit CARPENTERS_API_KEY>
LICENSE_SERVER_PRODUCT_ID=carpenters-production
LICENSE_SERVER_TIMEOUT_MS=5000
```

Die direkte HTTP-Adresse ist für den aktuellen Development-Compose vorgesehen. Sobald CarpentersProduction mit `NODE_ENV=production` läuft, erzwingt dessen Remote-Provider auch für diese Verbindung HTTPS; dafür muss vor der Umschaltung ein interner TLS-Endpunkt konfiguriert werden.

## Lizenz-API für Produktanwendungen

Alle Client-Endpunkte erwarten `Authorization: Bearer <produktgebundener API-Key>` und den bestehenden API-Vertrag Version 1. `CARPENTERS_API_KEY` ist ausschließlich für `carpenters-production`, `DESIGN_SUITE_API_KEY` ausschließlich für `moebel-design-suite` freigeschaltet. Diese getrennten technischen Zugangsschlüssel schützen die Dienste; sie bilden keine getrennten Kundenlizenzen:

- `POST /api/v1/licenses/validate`
- `POST /api/v1/licenses/activate`

Der Aktivierungsschlüssel wird beim Anlegen oder Rotieren genau einmal vollständig im Admin-Frontend angezeigt. In PostgreSQL liegt nur sein SHA-256-Hash.

Pro Carpenters-Tenant-ID existiert höchstens ein Lizenzdatensatz. Darin können Carpenters Production, die Wiest Design Suite oder beide Produkte freigeschaltet werden. Derselbe Aktivierungsschlüssel gilt für alle ausgewählten Produkte; Laufzeit, Status und Benutzerlimit gelten gemeinsam. Die Module werden je Produkt einzeln gewählt.

Die Lizenzmodelle sind editierbare Presets: `starter` aktiviert Carpenters mit CRM, Arbeitsvorbereitung und Shop; `professional` ergänzt Kalkulation und Betriebsmanagement; `enterprise` aktiviert beide Produkte und alle Module; `design` aktiviert nur die Design Suite mit öffentlichen Inhalten und Moodboards. Jede Produktauswahl und jedes Modul kann anschließend individuell angepasst werden.

## Lokale Entwicklung

PostgreSQL bereitstellen und die zentrale `.env` im Projektstamm konfigurieren. Backend und Prisma laden beide diese Datei; eine zusätzliche `backend/.env` ist nicht erforderlich. Lokal wird `DATABASE_URL` automatisch aus den `POSTGRES_*`-Werten erzeugt. Eine explizit gesetzte `DATABASE_URL` kann diese Ableitung bei Bedarf überschreiben. Danach:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:deploy
npm run dev
```

In einem zweiten Terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite leitet `/api` lokal an Port `5100` weiter.

## Datenmodell

- `Admin`: ausschließlich administrative Benutzer
- `AdminSession`: gehashte, ablaufende Login-Sitzungen mit CSRF-Bindung
- `ApiClient`: gehashte Backend-zu-Backend-Zugangsschlüssel
- `License`: Lizenzumfang, Laufzeit, Tenant-Bindung und Aktivierungsschlüssel-Hash
- `AuditEvent`: Anlage, Änderung, Löschung, Aktivierung und Validierung

Die Initialmigration liegt unter `backend/prisma/migrations`. Beim Containerstart wird `prisma migrate deploy` automatisch ausgeführt.
