# SmartFinance 💰
> **Control de Gastos Personales Inteligente**

![Android](https://img.shields.io/badge/Platform-Android-green?logo=android)
![Web](https://img.shields.io/badge/Platform-PWA-blue?logo=google-chrome)
![Stack](https://img.shields.io/badge/Stack-Tailwind%20%2B%20JS-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-yellow)

**SmartFinance** es una aplicación moderna y ligera diseñada para ayudarte a tomar el control de tus finanzas personales. Sin servidores externos, sin suscripciones, y con total privacidad: tus datos se guardan en tu dispositivo.

## ✨ Características Principales

### 📊 Dashboard Inteligente
*   **Balance en Tiempo Real**: Visualiza tu saldo disponible, ingresos y gastos totales al instante.
*   **Tarjetas de Resumen**: Acceso rápido a gastos del mes y conteo de movimientos.
*   **Actividad Reciente**: Historial de las últimas transacciones.

### 💸 Gestión de Transacciones
*   **Registro Rápido**: Interfaz optimizada para registrar Ingresos y Gastos en segundos.
*   **Servicios Recurrentes**: Configura pagos fijos (internet, arriendo, servicios) para no olvidar ninguno.
*   **Categorización**: Organiza tus gastos por categorías y grupos (Hogar, Transporte, Comida, etc.).

### 📈 Reportes y Análisis
*   **Gráficos Dinámicos**:
    *   *Distribución de Gastos* (Donut Chart).
    *   *Tendencias Mensuales* (Bar Chart).
    *   *Comparativa de Grupos* (Multi-line Chart).
*   **Tablas Dinámicas (Pivot)**: Analiza tus datos cruzando Fechas, Categorías y Grupos.
*   **Exportación**: Descarga tu historial completo en **CSV** (Excel) o **JSON** (Copia de seguridad).

### 🌍 Internacionalización y Personalización
*   **Multilenguaje**: Disponible en **Español 🇪🇸**, **Inglés 🇺🇸** y **Portugués 🇧🇷**.
*   **Temas Visuales**:
    *   🌑 **Modo Oscuro** (Elegante y cómodo para la vista).
    *   ☀️ **Modo Claro** (Clásico y nítido).
    *   🌗 **Alto Contraste** (Accesibilidad).
*   **Personalización**: Define tus propios límites de alerta de gastos.

---

## 🛠️ Stack Tecnológico

Proyecto construido con tecnologías web estándar, empaquetado para móvil:

*   **Core**: HTML5, Vanilla JavaScript (ES6+).
*   **Estilos**: [Tailwind CSS](https://tailwindcss.com/) (vía CDN para desarrollo ágil).
*   **Mobile Engine**: [Capacitor](https://capacitorjs.com/) (convierte la Web App en APK nativa).
*   **Librerías**:
    *   *SweetAlert2* (Alertas modales hermosas).
    *   *Chart.js* (Gráficos interactivos).
    *   *LocalForage* (Persistencia de datos robusta).
    *   *FontAwesome* (Íconos vectoriales).

---

## 💻 Instalación y Desarrollo

### Prerrequisitos
*   Node.js instalado.
*   Android Studio (para compilar la APK).

### Pasos
1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/tu-usuario/SmartFinance.git
    cd SmartFinance
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Ejecutar en Web (Desarrollo)**:
    ```bash
    npx http-server www
    ```
    Abre tu navegador en la URL mostrada (usualmente `http://127.0.0.1:8080`).

4.  **Compilar para Android**:
    ```bash
    # Sincronizar cambios de 'www' a la carpeta nativa android
    npx cap sync android

    # Abrir proyecto en Android Studio (opcional)
    npx cap open android
    
    # O compilar directamente desde terminal (Windows Powershell)
    cd android
    .\gradlew assembleDebug
    ```

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar la app:
1.  Haz un Fork del proyecto.
2.  Crea una rama (`git checkout -b feature/NuevaIdea`).
3.  Haz commit de tus cambios (`git commit -m 'Add: Nueva funcionalidad increíble'`).
4.  Haz Push (`git push origin feature/NuevaIdea`).
5.  Abre un Pull Request.

## 📄 Licencia

Distribuido bajo la licencia MIT. Eres libre de usar, modificar y distribuir este proyecto.

---
*Hecho con ❤️ para el manejo inteligente del dinero.*
