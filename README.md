# ⚽ Academia de Fútbol - Sistema de Gestión

## 🎯 Descripción

Sistema completo de gestión para academias de fútbol desarrollado con **Next.js 14**, **TypeScript**, **Tailwind CSS** y **SQLite**. Permite administrar jugadores, equipos, entrenadores y realizar seguimiento completo de la academia.

## ✨ Características Principales

### 🔐 Sistema de Autenticación
- **Roles diferenciados**: Administrador, Entrenador, Padre de familia
- **Autenticación JWT** con tokens seguros
- **Protección de rutas** basada en permisos
- **Gestión de sesiones** persistente

### 👥 Gestión de Jugadores
- **Registro completo** con datos personales y médicos
- **Asignación a equipos** flexible
- **Información de contacto** de padres y emergencia
- **Estados activo/inactivo** para control de membresía
- **Búsqueda avanzada** por nombre, posición, equipo

### 🏆 Gestión de Equipos
- **Creación de equipos** por categorías (Sub-8, Sub-10, Sub-12, etc.)
- **Asignación de entrenadores** y límites de jugadores
- **Vista detallada** con estadísticas del equipo
- **Gestión de capacidad** y disponibilidad

### 📊 Panel de Control
- **Dashboard interactivo** con métricas clave
- **Gráficos y estadísticas** en tiempo real
- **Resumen de actividades** recientes
- **Indicadores de rendimiento** de la academia

### 🔍 Sistema de Búsqueda
- **Búsqueda global** de jugadores y equipos
- **Filtros avanzados** por múltiples criterios
- **Resultados en tiempo real** con paginación
- **Exportación de datos** para reportes

### 📱 Diseño Responsivo
- **Optimizado para móviles** y tablets
- **PWA (Progressive Web App)** con capacidades offline
- **Interfaz moderna** con Tailwind CSS
- **Experiencia de usuario** fluida y accesible

## 🚀 Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Base de Datos**: SQLite con migraciones automáticas
- **Autenticación**: JWT, bcryptjs
- **Validación**: Zod, React Hook Form
- **Icons**: Lucide React
- **Deployment**: Optimizado para Vercel/Netlify

## 📋 Credenciales de Demostración

### 👤 Administrador
- **Email**: `admin@academia.com`
- **Contraseña**: `admin123`
- **Permisos**: Acceso completo a todas las funcionalidades

### 🏃 Entrenador
- **Email**: `coach@academia.com`
- **Contraseña**: `coach123`
- **Permisos**: Gestión de jugadores y equipos asignados

### 👨‍👩‍👧‍👦 Padre de Familia
- **Email**: `parent@email.com`
- **Contraseña**: `coach123`
- **Permisos**: Vista de información de sus hijos

## 🏗️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd football-academy
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Editar `.env.local` con tus configuraciones:
   ```env
   JWT_SECRET=tu_jwt_secret_muy_seguro
   DATABASE_URL=./data/app.db
   ```

4. **Inicializar base de datos con datos de demostración**
   ```bash
   npm run seed
   ```

5. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🏭 Despliegue en Producción

### Build de Producción
```bash
npm run build
npm start
```

### Análisis del Bundle
```bash
npm run build:analyze
```

### Verificación de Tipos
```bash
npm run type-check
```

## 📊 Datos de Demostración

La aplicación incluye datos de ejemplo:

- **4 Equipos**: Leones Sub-10, Águilas Sub-12, Tigres Sub-14, Halcones Sub-16
- **7 Jugadores**: Con información completa de contacto y médica
- **3 Usuarios**: Con diferentes roles y permisos

## 🎮 Guía de Uso

### Para Administradores
1. **Iniciar sesión** con credenciales de admin
2. **Acceder al Dashboard** para ver métricas generales
3. **Gestionar equipos** desde la sección "Equipos"
4. **Registrar jugadores** y asignarlos a equipos
5. **Usar búsqueda avanzada** para encontrar información específica
6. **Generar más datos** desde el panel de administración

### Para Entrenadores
1. **Iniciar sesión** con credenciales de entrenador
2. **Ver jugadores asignados** a sus equipos
3. **Actualizar información** de jugadores
4. **Gestionar equipos** bajo su responsabilidad

### Para Padres
1. **Iniciar sesión** con credenciales de padre
2. **Ver información** de sus hijos registrados
3. **Consultar datos de contacto** y médicos
4. **Revisar asignaciones** de equipos

## 🔧 Características Técnicas

### Optimizaciones de Rendimiento
- **Code Splitting** automático por rutas
- **Lazy Loading** de componentes pesados
- **Optimización de imágenes** con Next.js Image
- **Caché inteligente** de consultas de base de datos
- **Bundle optimization** con webpack

### Seguridad
- **Validación de entrada** en cliente y servidor
- **Sanitización de datos** SQL injection prevention
- **Headers de seguridad** configurados
- **Autenticación robusta** con JWT
- **Protección CSRF** implementada

### Accesibilidad
- **ARIA labels** en componentes interactivos
- **Navegación por teclado** completa
- **Contraste de colores** optimizado
- **Responsive design** para todos los dispositivos
- **Screen reader** compatible

## 📱 PWA Features

- **Instalable** como aplicación nativa
- **Funcionalidad offline** básica
- **Service Worker** para caché
- **Manifest** configurado
- **Icons** optimizados para diferentes plataformas

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error de base de datos**
   ```bash
   # Eliminar y recrear la base de datos
   rm -rf data/
   npm run seed
   ```

2. **Problemas de autenticación**
   ```bash
   # Limpiar localStorage del navegador
   # O usar modo incógnito
   ```

3. **Errores de build**
   ```bash
   # Limpiar caché de Next.js
   rm -rf .next/
   npm run build
   ```

## 📞 Soporte

Para soporte técnico o preguntas sobre la demostración:
- Revisar la documentación en el código
- Verificar los logs de la consola del navegador
- Comprobar los logs del servidor en la terminal

## 📄 Licencia

Este proyecto es una demostración técnica. Todos los derechos reservados.

---

**🎯 ¡Listo para la demostración!** 

La aplicación está completamente configurada con datos de ejemplo y optimizada para mostrar todas sus capacidades. Utiliza las credenciales proporcionadas para explorar las diferentes funcionalidades según el rol de usuario.