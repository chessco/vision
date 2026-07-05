---
name: Pitaya Visual Design System
colors:
  surface: '#0b0a0f'
  surface-dim: '#07060a'
  surface-bright: '#171522'
  surface-container-lowest: '#030304'
  surface-container-low: '#0f0d16'
  surface-container: '#13111c'
  surface-container-high: '#1c1929'
  surface-container-highest: '#242036'
  on-surface: '#f3f4f6'
  on-surface-variant: '#9ca3af'
  inverse-surface: '#f3f4f6'
  inverse-on-surface: '#111827'
  outline: '#4b5563'
  outline-variant: '#374151'
  surface-tint: '#8b5cf6'
  primary: '#8b5cf6'
  on-primary: '#ffffff'
  primary-container: '#1e1b29'
  on-primary-container: '#c084fc'
  inverse-primary: '#a78bfa'
  secondary: '#06b6d4'
  on-secondary: '#ffffff'
  secondary-container: '#083344'
  on-secondary-container: '#22d3ee'
  tertiary: '#f59e0b'
  on-tertiary: '#ffffff'
  tertiary-container: '#451a03'
  on-tertiary-container: '#fbbf24'
  error: '#ef4444'
  on-error: '#ffffff'
  error-container: '#7f1d1d'
  on-error-container: '#fca5a5'
  primary-fixed: '#ddd6fe'
  primary-fixed-dim: '#c4b5fd'
  on-primary-fixed: '#2e1065'
  on-primary-fixed-variant: '#5b21b6'
  secondary-fixed: '#cffafe'
  secondary-fixed-dim: '#a5f3fc'
  on-secondary-fixed: '#083344'
  on-secondary-fixed-variant: '#0369a1'
  tertiary-fixed: '#fef3c7'
  tertiary-fixed-dim: '#fde68a'
  on-tertiary-fixed: '#451a03'
  on-tertiary-fixed-variant: '#b45309'
  background: '#0b0a0f'
  on-background: '#f3f4f6'
  surface-variant: '#1c1929'
  paper-surface: '#13111c'
  ink-text: '#f3f4f6'
  heritage-gold: '#fbbf24'
  border-subtle: '#262235'
  muted-ink: '#9ca3af'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-xl:
    fontFamily: Outfit
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Outfit
    fontSize: 22px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.08em
  mono-ui:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.375rem
  md: 0.5rem
  lg: 0.75rem
  xl: 1rem
  full: 9999px
spacing:
  container-max: 1440px
  gutter: 1.5rem
  margin-mobile: 1rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
  stack-xl: 4rem
---

## Brand & Style
El sistema de diseño de **Pitaya Visual** está basado en una estética oscura premium, tecnológica pero profundamente creativa: **Velvet Obsidian**. Representa un espacio de cocreación agéntica donde la interfaz de usuario desaparece sutilmente para dar total prioridad al contenido visual generado.

Combina elementos de **Glassmorphic Minimalism** (paneles translúcidos, desenfoques de fondo, bordes de 1px con destellos violetas y cian) con una rigurosa rejilla geométrica. La experiencia evoca la sensación de una consola de comando creativo, sintiéndose profesional, estable y de alta gama.

## Colores
El núcleo cromático es un degradado sutil de violeta oscuro y negro terciopelo que crea una sensación de profundidad infinita.

- **Fondo base (surface):** `#0b0a0f` (Negro con matiz violeta profundo).
- **Superficies elevadas (paper-surface):** `#13111c` (Gris obsidiana con 1px de borde en `#262235` para destacar sobre el fondo).
- **Acento Primario (Electric Violet):** `#8b5cf6`. Utilizado en botones principales, estados activos y focus de controles. Representa la energía creativa de la IA.
- **Acento Secundario (Neon Emerald/Cyan):** `#06b6d4`. Reservado para indicadores de estado correcto, completitud de generaciones y botones de aprobación final.
- **Acento Terciario (Neon Amber):** `#f59e0b`. Indicadores de advertencia, logs de renderizado y progreso asíncrono.

## Tipografía
El sistema tipográfico utiliza fuentes modernas y limpias para equilibrar el carácter tecnológico y creativo:

- **Títulos y Encabezados (Outfit):** Una tipografía geométrica con excelente legibilidad y personalidad en tamaños grandes. Los titulares usan un espaciado ligeramente ajustado (-0.01em a -0.02em) para sentirse compactos y refinados.
- **Cuerpo y Controles de UI (Inter):** La tipografía estándar por excelencia en interfaces de alta densidad de datos. Proporciona claridad absoluta.
- **Metadatos y Etiquetas (Space Grotesk):** En mayúsculas compactas con tracking expandido (`0.08em`), confiere un look técnico y estructurado.
- **Datos y Logs (JetBrains Mono):** Para códigos de error, variables del sistema y logs del Workflow Center.

## Formas y Bordes
La redondez se estandariza en un radio suave y profesional:

- **Controles generales (Inputs, Botones, Chips):** `rounded-md` (8px / 0.5rem).
- **Tarjetas y Paneles principales:** `rounded-lg` (12px / 0.75rem).
- **Ventanas emergentes y Modales:** `rounded-xl` (16px / 1rem).
- **Bordes:** En lugar de sombras tradicionales que se pierden en el modo oscuro, usamos bordes delgados de `1px solid #262235` que actúan como "hilos de contorno" sutiles.
