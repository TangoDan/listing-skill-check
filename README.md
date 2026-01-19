# Sistema de inteligencia de captación inmobiliaria

Sistema inteligente de evaluación de vendedores inmobiliarios mediante análisis de entrevistas en video usando IA.

## Características

- 📹 Análisis de entrevistas en video para evaluación de vendedores
- 🤖 Procesamiento inteligente usando IA (OpenAI)
- 📊 Generación de reportes detallados en PDF
- 🌐 Interfaz multiidioma (Español/Inglés)
- 🎨 Diseño moderno y responsivo con animaciones
- ⚡ Construido con Next.js 16 y React 19

## Requisitos previos

- Node.js 18+ 
- npm o yarn
- API Key de OpenAI

## Instalación

```bash
# Clonar el repositorio
git clone [URL del repositorio]

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env.local con:
OPENAI_API_KEY=tu_api_key_aqui
```

## Desarrollo

```bash
# Ejecutar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Compilación para producción

```bash
# Compilar aplicación
npm run build

# Iniciar en modo producción
npm start
```

## Deploy en Vercel

El proyecto está optimizado para deployment en Vercel:

1. Hacer push del código a GitHub
2. Importar el proyecto en Vercel
3. Configurar la variable de entorno `OPENAI_API_KEY`
4. Deploy automático

## Tecnologías utilizadas

- **Framework**: Next.js 16.1
- **UI**: React 19, Tailwind CSS 4, Framer Motion
- **IA**: OpenAI API
- **Generación PDF**: jsPDF
- **Iconos**: Lucide React

## Licencia

Todos los derechos reservados.
