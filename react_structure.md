# Arquitectura Frontend y Configuración de Infraestructura (React + Docker)

Este documento detalla la estructura de carpetas de React (Vite + TypeScript), la integración con los componentes de **ShadCN UI**, la estrategia de navegación multi-tenant, y el despliegue integrado con Docker compartiendo la red y bases de datos de **PitayaCore**.

---

## 1. Alineación de Infraestructura y Base de Datos (Docker)

Para optimizar recursos y mantener una arquitectura desacoplada y eficiente, **Pitaya Visual** se integrará en la red existente de **PitayaCore**, utilizando las mismas instancias de base de datos MySQL y PostgreSQL (con soporte pgvector) pero bajo esquemas/bases de datos aisladas.

### Red de Docker Compartida
Ambos servicios (PitayaCore y Pitaya Visual) se comunican internamente en la red `pitaya_net` (definida como externa en docker-compose).

### Docker Compose de Pitaya Visual (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  visual-api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: pitayavisual-api
    restart: always
    environment:
      # Conexión al mismo MySQL de PitayaCore, pero usando un esquema diferente (pitayavisual_db)
      DATABASE_URL: "mysql://root:${DB_PASSWORD}@pitayacore-mysql:3306/pitayavisual_db"
      # Conexión al mismo Postgres de PitayaCore, pero usando una base de datos diferente (pitayavisual_vector)
      VECTOR_DATABASE_URL: "postgresql://${PG_USER}:${PG_PASSWORD}@pitayacore-pgvector:5432/pitayavisual_vector"
      # Clave de firma JWT compartida con PitayaCore para validación cruzada de tokens
      JWT_SECRET: "${JWT_SECRET}"
      PORT: 3016
    ports:
      - "3016:3016"
    networks:
      - pitaya_net

  visual-web:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: pitayavisual-web
    restart: always
    ports:
      - "5174:80"
    networks:
      - pitaya_net

networks:
  pitaya_net:
    external: true
```

---

## 2. Alineación de Autenticación y Multi-Tenant (API & Frontend)

Pitaya Visual no gestiona usuarios directamente; consume la autenticación de **PitayaCore**.

### Validación de JWT en el Backend (NestJS)
El backend de Pitaya Visual implementa el mismo `JwtStrategy` y `CombinedAuthGuard` que PitayaCore:
1.  **JWT_SECRET Compartido**: Verifica que las firmas de los tokens bearer provengan del emisor oficial de PitayaCore.
2.  **Payload del Token**:
    ```typescript
    interface JwtPayload {
      sub: string;       // userId / id
      email: string;
      tenantId: string;  // Aislamiento del tenant actual
      role: string;      // ROL del usuario (ej: OWNER, DIRECTOR, ADMIN)
    }
    ```
3.  **Bypass de Headers para CLI / Microservicios**:
    Soporta los mismos encabezados opcionales `x-user-role` y `x-tenant-id` para permitir la integración y pruebas locales por desarrolladores sin necesidad de tokens JWT en desarrollo.

### Aislamiento de Base de Datos en Prisma
El motor ejecuta migraciones automáticas al arrancar para crear y estructurar las bases de datos:
*   **MySQL**: `pitayavisual_db` mantendrá las tablas de `Character`, `Campaign`, `Asset`, `BrandConfig`, `Workflow`.
*   **PostgreSQL**: `pitayavisual_vector` guardará la tabla `VectorRecord` (embeddings de 1536 dimensiones para búsqueda semántica de la biblioteca).

---

## 3. Estructura de Carpetas React (Vite + TypeScript)

Para mantener la consistencia con el diseño modular y limpio, organizamos el frontend por **características (features)**:

```text
src/
├── assets/                  # Logos, imágenes estáticas y fuentes globales
├── common/                  # Elementos transversales reutilizables
│   ├── components/          # Componentes básicos de ShadCN personalizados (button, card, dialog, etc.)
│   ├── hooks/               # Custom hooks globales (useAuth, useTenant)
│   ├── layouts/             # Layouts globales (DashboardLayout, CleanLayout)
│   └── lib/                 # Utilidades comunes (utils.ts para cn, api-client.ts)
├── features/                # Módulos por dominio
│   ├── dashboard/           # Dashboard Principal
│   │   ├── components/      # Componentes exclusivos de Dashboard (RecentCampaigns, CreditRing)
│   │   ├── hooks/
│   │   └── pages/           # DashboardPage.tsx
│   ├── chat/                # Creative Chat (ChatGPT + Cursor layout)
│   │   ├── components/      # ChatSidebar, ChatInput, AssetInspector, ProgressLogs
│   │   └── pages/           # CreativeChatPage.tsx
│   ├── characters/          # Character Studio (LoRAs y avatares)
│   ├── campaigns/           # Campaign Builder (Visual lighttable)
│   ├── library/             # Asset Library (Grid y búsqueda pgvector)
│   ├── brand/               # Brand Studio (Guía de estilo)
│   └── workflows/           # Workflow Center (Automatizaciones simplificadas)
├── routes/                  # Configuración del enrutador (Vite Router)
│   ├── index.tsx            # Árbol de rutas con prefijo /t/:tenantId/
│   └── TenantGuard.tsx      # Middleware frontend para validar accesos e inyectar tenantId
├── App.tsx                  # Envoltura principal (React Query Client, Theme Provider)
├── index.css                # Importación de Tailwind + variables del Design System Velvet Obsidian
└── main.tsx                 # Entrada de React Vite
```

---

## 4. Componentes ShadCN UI Recomendados y Personalizaciones

El diseño Velvet Obsidian requiere un mapeo preciso de componentes interactivos altamente estilizados en `src/common/components/`:

### 1. Panel de Chat e Inspector (Creative Chat)
*   **`@/components/ui/scroll-area`**: Utilizado en el historial de chat (panel central) y en el sidebar de chats pasados. Permite scrolls suaves sin barras de desplazamiento visibles del navegador.
*   **`@/components/ui/sheet`**: El panel derecho de previsualización e inspección rápida de assets. Se despliega de forma suave desde el lateral con fondo translúcido (`bg-opacity-80 backdrop-blur-md`).

### 2. Tarjetas de Personajes y Campañas (Dashboard / Character Studio)
*   **`@/components/ui/card`**: Tarjetas con bordes sutiles de `1px solid var(--border-subtle)` y fondo de `var(--paper-surface)` (#13111c). En hover, se aplica una micro-transición con destello violeta en el borde:
    ```css
    .card-premium:hover {
      border-color: var(--primary);
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.15);
    }
    ```
*   **`@/components/ui/avatar`**: Para mostrar los personajes virtuales (Alba, Don Juan Camarón) con fallback estilizado en degradado cian/violeta.

### 3. Progreso de Procesamiento (Creative Chat / Workflow Center)
*   **`@/components/ui/progress`**: Barra de progreso con relleno en degradado (`from-primary to-secondary`) para simular la renderización asíncrona de Fal.ai/Replicate.
*   **`@/components/ui/badge`**: Etiquetas de estado. Personalizadas con estilo "glow":
    *   *Ready / Approved*: Fondo cian translúcido (`rgba(6, 182, 212, 0.1)`), texto `#06b6d4`.
    *   *Training / Review*: Fondo ámbar translúcido (`rgba(245, 158, 11, 0.1)`), texto `#f59e0b`.

### 4. Formularios e Inputs (Brand Studio / Character Creator)
*   **`@/components/ui/form`** (React Hook Form + Zod): Para validación estricta de variables de campaña y campos de personajes.
*   **`@/components/ui/slider`**: Para modificar parámetros visuales avanzados (como intensidad de marca o realismo) representados como diales minimalistas.

---

## 5. Modelo de Navegación y Enrutamiento (React Router V6)

Las rutas del frontend leen dinámicamente el `tenantId` de la URL para inyectarlo en las peticiones HTTP (mediante interceptores de Axios/Fetch).

### Configuración del Router (`src/routes/index.tsx`)

```tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { TenantGuard } from './TenantGuard';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { CreativeChatPage } from '../features/chat/pages/CreativeChatPage';
import { CharactersPage } from '../features/characters/pages/CharactersPage';
import { CampaignsPage } from '../features/campaigns/pages/CampaignsPage';
import { LibraryPage } from '../features/library/pages/LibraryPage';
import { BrandPage } from '../features/brand/pages/BrandPage';
import { WorkflowsPage } from '../features/workflows/pages/WorkflowsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/t/default/visual/dashboard" replace />
  },
  {
    path: '/t/:tenantId/visual',
    element: <TenantGuard />, // Valida accesos y configura el contexto de Axios
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'chat', element: <CreativeChatPage /> },
      { path: 'characters', element: <CharactersPage /> },
      { path: 'campaigns', element: <CampaignsPage /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'brand', element: <BrandPage /> },
      { path: 'workflows', element: <WorkflowsPage /> }
    ]
  }
]);
```

### Guardia del Tenant (`src/routes/TenantGuard.tsx`)

```tsx
import { useParams, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../common/hooks/useAuth';
import { api } from '../common/lib/api-client';
import { useEffect } from 'react';

export function TenantGuard() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (tenantId) {
      // Inyectar el tenantId en todas las llamadas API
      api.defaults.headers.common['x-tenant-id'] = tenantId;
    }
  }, [tenantId]);

  if (loading) return <div className="text-white">Cargando Suite Creativa...</div>;

  // Si el usuario no está autenticado o el tenantId no coincide con su token (y no es admin)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN' && user.tenantId !== tenantId) {
    return <Navigate to={`/t/${user.tenantId}/visual/dashboard`} replace />;
  }

  return <Outlet />;
}
```
