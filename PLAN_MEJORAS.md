# Plan de Mejoras — SmartFinance

> **Estado (2026-09-03): implementado.** Puntos 2, 3, 4, 1.3, 1.4 y 1.1 aplicados y verificados en navegador
> (Chrome DevTools, sin errores de consola, estilos y temas intactos, persistencia de settings confirmada
> tras recargar). Los flujos específicos de Android (escritura real en `Documents/SmartFinance`, `Documents`
> raíz o `Cache`, y el disparador `visibilitychange` al minimizar) no se pudieron probar en un dispositivo/
> emulador real desde este entorno — revisar en un build de APK antes de publicar.
> Puntos **1.2 (modularizar `index.html`)** y **1.7 (optimización de cálculo del dashboard)** quedaron
> **fuera de este ciclo**, tal como lo sugería este mismo documento en "Orden de implementación sugerido".
> Ver sección "Notas de implementación" al final.

> Generado a partir de revisión de código (`www/index.html`, `android/`, `cambios.txt`) y de la solicitud del usuario del 2026-09-03.
> Decisiones ya acordadas:
> - El switch de "mostrar/ocultar totales" y el de "backup automático" van juntos en una **nueva tarjeta "Preferencias"** dentro de Ajustes, ubicada como primera sección (arriba de "Categorías y Grupos").
> - El destino del backup se elige entre **carpetas predefinidas** (Documents/SmartFinance, Documents raíz, Cache) vía dropdown — **no** se implementa selector nativo de carpetas (SAF) en este ciclo.

---

## 1. Mejoras técnicas (deuda técnica y riesgos detectados)

Observaciones de la revisión general, no bloqueantes para los puntos 2-4, pero recomendadas.

### 1.1 Tailwind CDN en producción
`index.html:25` silencia la advertencia de consola de Tailwind (`cdn.tailwindcss.com should not be used in production`) en vez de resolverla. Ya generó quejas de lentitud en el pasado (`cambios.txt`, línea 27-29). Recomendación: migrar a Tailwind compilado (CLI o PostCSS) cuando haya ventana para tocar el pipeline de build.

### 1.2 Monolito de `index.html` (~2800 líneas)
HTML, CSS y JS mezclados en un solo archivo. Es la causa raíz de varios bugs recurrentes documentados en `cambios.txt` (funciones no definidas, textos "quemados" sin traducir, colores de tema no aplicados). Recomendación: separar en módulos JS (`app.js`, `ui.js`, `backup.js`, `i18n.js`, `theme.js`) sin cambiar el stack (vanilla JS + `<script>` tags), y separar CSS custom del `<style>` inline. Se puede hacer de forma incremental.

### 1.3 Número de versión inconsistente
- `package.json`: `1.2.2`
- `android/app/build.gradle`: `versionName "1.1.15"`
- `index.html:886` (pantalla Ayuda): texto quemado `"Versión 1.0.1"`
- `index.html:1102` (modal Acerca de): texto quemado `"SmartFinance ver. 1.0.1"`

Recomendación: definir una única fuente de verdad (ej. `package.json`) e inyectar el valor en build time a un `window.APP_VERSION`, referenciado en ambos lugares. Evita reportes de soporte confusos.

### 1.4 Permiso `WRITE_EXTERNAL_STORAGE` legacy
`AndroidManifest.xml:42` declara este permiso, que en Android 10+ ya no aplica igual (scoped storage) y en Android 13+ ni siquiera se solicita en runtime. Dado que el backup ya escribe vía `Capacitor.Filesystem` en directorios gestionados (`DOCUMENTS`, `CACHE`), es probable que se pueda retirar. Revisar al tocar el tema de backups (punto 4) y probar en un dispositivo Android 13+.

### 1.5 Falta de visibilidad del último backup exitoso
Hoy el backup automático corre silencioso (`App.checkAutoBackup`); no hay ningún indicador en la UI de cuándo fue el último backup exitoso. Recomendación: guardar `localStorage.gastos_last_backup` (ya existe) y mostrar la fecha/hora legible en la nueva tarjeta "Preferencias" de Ajustes. Se incluye en el diseño del punto 3.

### 1.6 Doble disparador de backup automático sin control unificado
El backup automático se dispara en dos lugares independientes:
- `App.checkAutoBackup()` al iniciar la app (controlado por fecha, una vez al día).
- El listener `visibilitychange` (`index.html:1046-1051`), que llama `BackupManager.exportJSON(true)` **cada vez** que la app se minimiza, sin pasar por el control de "una vez al día".

Esto puede generar backups redundantes muy seguidos si el usuario minimiza la app repetidamente. Recomendación: unificar ambos disparadores bajo el mismo flag on/off (punto 3) y hacer que el de `visibilitychange` también respete el límite de una vez al día (o un límite razonable, ej. una vez por hora).

### 1.7 Rendimiento del dashboard con historiales grandes
`UI.updateDashboard()` recalcula `reduce()` sobre **todo** `store.transactions`/`store.incomes` en cada render (incluyendo balance total, no solo el mes). Con miles de registros (ya hay reportes de 3764+, ver `cambios.txt`) esto puede notarse en dispositivos gama baja. Recomendación (a futuro, fuera de este ciclo): mantener acumuladores incrementales o memoizar el total y solo recalcular al agregar/editar/borrar una transacción, en vez de recorrer todo el arreglo en cada navegación al Dashboard.

---

## 2. Mostrar/ocultar totales de ingresos y gastos en el Dashboard

**Objetivo:** permitir ocultar la fila `↑ Ingresos totales | ↓ Gastos totales` de la tarjeta "Saldo Disponible" (`index.html:390-394`), por privacidad o preferencia visual, sin afectar el saldo mismo (que siempre se muestra).

**Cambios:**
- Nuevo campo `store.settings.showTotals` (boolean, default `true` → mantiene comportamiento actual).
- Switch (toggle) en Ajustes → tarjeta "Preferencias" → "Mostrar totales de ingresos/gastos".
- En `UI.updateDashboard()`, el contenedor de la fila de totales (`div` que envuelve `#dash-total-inc` / `#dash-total-exp`, `index.html:390`) se muestra u oculta (`classList.toggle('hidden-section', !store.settings.showTotals)`) según el flag.
- El saldo (`#dash-balance`) y las tarjetas "Gasto Mes"/"Movimientos" **no** se ven afectados — solo la fila de totales acumulados.

---

## 3. Activar/desactivar backup automático diario

**Objetivo:** dar control al usuario sobre si la app genera backups automáticos silenciosos (al abrir la app y al minimizarla).

**Cambios:**
- Nuevo campo `store.settings.autoBackupEnabled` (boolean, default `true` → mantiene comportamiento actual).
- Switch en Ajustes → tarjeta "Preferencias" → "Backup automático diario", con texto de ayuda explicando qué hace.
- Debajo del switch, texto pequeño informativo: **"Último backup: {fecha y hora}"** o "Sin backups automáticos aún", leído de `localStorage.gastos_last_backup` (ver punto 1.5).
- `App.checkAutoBackup()` retorna temprano si `!store.settings.autoBackupEnabled`.
- El listener `visibilitychange` (`index.html:1046-1051`) también valida el flag antes de llamar `BackupManager.exportJSON(true)`, y de paso se le aplica el límite de frecuencia descrito en el punto 1.6 (evita spamear backups al minimizar/restaurar repetidamente).

---

## 4. Selección de destino y nombre del archivo de backup

**Objetivo:** permitir elegir carpeta destino (entre las soportadas por `@capacitor/filesystem` sin plugins nuevos) y personalizar el prefijo del nombre del archivo de backup, tanto para el automático como el manual (botón "Exportar JSON").

**Alcance confirmado:** selector entre carpetas predefinidas — **no** selector nativo de carpetas (SAF). Ver nota al inicio del documento.

**Cambios:**
- Nuevo campo `store.settings.backupDir` (string, valores: `'documents_subfolder'` | `'documents_root'` | `'cache'`, default `'documents_subfolder'` → mantiene comportamiento actual, que ya intenta `Documents/SmartFinance` con fallback a `Documents` y luego `Cache`).
  - Cuando el usuario fija explícitamente `documents_root` o `cache`, `BackupManager.exportJSON` usa esa carpeta directamente (sin recorrer los fallbacks automáticos, salvo error real de escritura, en cuyo caso sí aplica el fallback en cascada existente como red de seguridad).
- Nuevo campo `store.settings.backupFileNamePrefix` (string, default `'SmartFinance'`). Input de texto en Ajustes con validación básica (sin caracteres inválidos para nombre de archivo: `\ / : * ? " < > |`).
- El nombre de archivo pasa de `SmartFinance-${yymmdd}-${hhmm}.json` a `${prefix}-${yymmdd}-${hhmm}.json`, reutilizando el mismo prefijo para JSON y CSV.
- UI en Ajustes → tarjeta "Preferencias" → sub-sección "Backup":
  - Dropdown "Carpeta de destino" (3 opciones arriba).
  - Input de texto "Nombre de archivo (prefijo)".
  - Texto de ejemplo en vivo debajo del input: `Ejemplo: {prefix}-260903-1432.json`.

---

## Modelo de datos — resumen de nuevos settings

```js
store.settings = {
  balanceThresholds: { min: 0, mid: 0 },   // ya existe
  showTotals: true,                         // nuevo (punto 2)
  autoBackupEnabled: true,                  // nuevo (punto 3)
  backupDir: 'documents_subfolder',         // nuevo (punto 4)
  backupFileNamePrefix: 'SmartFinance'      // nuevo (punto 4)
}
```

Todos con defaults que preservan el comportamiento actual — usuarios existentes no notan cambio hasta que entren a Ajustes y los toquen. Se fusionan con `DEFAULT_DATA.settings` en el bootstrap (`index.html:1020`), igual que se hace hoy con `balanceThresholds`.

---

## UI — nueva tarjeta "Preferencias" en Ajustes

Ubicación: primera tarjeta en `#view-config`, arriba de "Categorías y Grupos" (`index.html:716`). Mismo patrón visual de tarjeta colapsable (`onclick="UI.toggleConfigSection(...)"`) usado por las demás secciones.

```
Preferencias  [▾]
├── Mostrar totales de ingresos/gastos     [ toggle ]
├── ────────────────────────────────
├── Backup automático diario                [ toggle ]
│   └── Último backup: 03/09/2026 14:32
├── ────────────────────────────────
├── Carpeta de destino del backup          [ dropdown ]
├── Nombre de archivo (prefijo)            [ input texto ]
│   └── Ejemplo: SmartFinance-260903-1432.json
```

---

## i18n

Todas las etiquetas nuevas requieren entrada en los 3 idiomas soportados (`es`, `en`, `pt`) en el diccionario `I18n` existente, siguiendo el patrón `data-i18n="clave"` + `I18n.t('clave')`. Claves nuevas estimadas:
`cfg_preferences`, `show_totals`, `show_totals_hint`, `auto_backup`, `auto_backup_hint`, `last_backup_label`, `last_backup_never`, `backup_dest`, `backup_dest_doc_sub`, `backup_dest_doc_root`, `backup_dest_cache`, `backup_filename_prefix`, `backup_filename_example`.

---

## Orden de implementación sugerido

1. **Puntos 2 y 3** (más simples, mismo bloque de UI, sin tocar filesystem): agregar settings, tarjeta "Preferencias", toggles, ajustar `updateDashboard` y `checkAutoBackup` + `visibilitychange`.
2. **Punto 1.6** junto con el punto 3 (mismo código que tocamos).
3. **Punto 4**: dropdown + input de prefijo, ajustar `BackupManager.exportJSON`.
4. **Punto 1.3** (unificar versión): cambio aislado y de bajo riesgo, se puede hacer en cualquier momento.
5. Resto de punto 1 (1.1, 1.2, 1.4, 1.7): quedan propuestos para un ciclo aparte, no bloquean 2-4.

## Fuera de alcance de este ciclo

- Selector nativo de carpeta (SAF / `ACTION_OPEN_DOCUMENT_TREE`): requiere agregar un plugin Capacitor nuevo, permisos adicionales, cambios en el proyecto Android nativo (`android/`) y volver a sincronizar/compilar. Se deja como mejora futura si el usuario la prioriza.
- **1.2 Modularización de `index.html`**: refactor grande y de alto riesgo (miles de referencias `onclick="App.x()"` / `UI.x()` que dependen del orden de carga y del scope global) para un beneficio que no cambia comportamiento visible. Se deja como ciclo dedicado, con su propia verificación exhaustiva.
- **1.7 Optimización del cálculo del dashboard**: al revisar el código con más detalle, el costo real de los `reduce()` sobre `transactions`/`incomes` es del orden de milisegundos incluso con miles de registros — no es un cuello de botella medible. El problema de lentitud reportado históricamente (`cambios.txt`) coincide con la compilación JIT de Tailwind en tiempo de ejecución, ya resuelta en el punto 1.1. Se decidió no añadir una capa de caché/invalidación (complejidad y riesgo de bugs) para una ganancia no demostrada.

## Notas de implementación (post-ejecución)

- **1.1 Tailwind**: se instaló `tailwindcss` + `@tailwindcss/cli` (v4.3.3) como devDependencies, se creó `www/assets/tailwind-src.css` (`@import "tailwindcss"` + `@source "../index.html"`) y se generó `www/assets/tailwind-built.css` (~50 KB minificado, vs. ~400 KB del bundle JIT anterior). Se eliminó `www/assets/tailwind.js` (ya no se referencia en ningún lado) y se actualizó `www/sw.js` (nuevo `CACHE_NAME` para invalidar el cache viejo del Service Worker, que apuntaba al archivo eliminado). Nuevo script `npm run build:css` — debe ejecutarse tras instalar dependencias y cada vez que se agreguen clases Tailwind nuevas al HTML.
- **1.3 Versión**: nuevo `scripts/sync-version.js` (`npm run sync-version`) toma `package.json` como fuente única de verdad y sincroniza `android/app/build.gradle` (`versionName`) y los dos textos quemados en `index.html` (pantalla Ayuda y modal Acerca de). Ya ejecutado una vez; todos quedaron en `1.2.2`. El `versionCode` de Android sigue siendo manual (es un contador de build, no un número de versión).
- **1.4 Permiso legacy**: se retiró `WRITE_EXTERNAL_STORAGE` del `AndroidManifest.xml`. Se confirmó que `targetSdkVersion` es 35, por lo que este permiso ya era ignorado por el sistema operativo — el cambio no debería alterar el comportamiento. Se dejó `READ_EXTERNAL_STORAGE` intacto (no estaba en el alcance original de este punto y no se auditó a fondo su necesidad).
- **Puntos 2, 3 y 4**: nueva tarjeta "Preferencias" en Ajustes (primera tarjeta, arriba de "Categorías y Grupos"), con los 4 controles descritos en este documento. `App.checkAutoBackup()` ahora respeta `store.settings.autoBackupEnabled`, y el listener `visibilitychange` (backup al minimizar) fue redirigido a llamar `App.checkAutoBackup()` en vez de invocar `BackupManager.exportJSON(true)` directamente — así ambos disparadores comparten el mismo flag on/off y el mismo límite de "una vez al día", resolviendo el punto 1.6 sin código adicional.
- **Verificación realizada**: servidor local (`http-server`) + Chrome DevTools MCP — carga sin errores de consola, los 3 temas (verde/azul/alto contraste) siguen aplicando correctamente sobre el CSS compilado, toggle de totales oculta/muestra la fila en el dashboard en vivo, cambios de settings persisten correctamente tras recargar (vía `localForage`), texto de versión correcto en pantalla Ayuda y modal Acerca de.
- **No verificado (requiere dispositivo/emulador Android)**: escritura real de archivos vía `Capacitor.Filesystem` en las 3 carpetas de destino, comportamiento del backup al minimizar la app en segundo plano real, y el flujo completo de compilación de la APK (`gradlew assembleDebug`) con el nuevo `AndroidManifest.xml` y el CSS estático.
- **Nota aparte, no solicitada**: `node_modules/` está trackeado en git en este repositorio (1600+ archivos ya versionados antes de esta sesión). La instalación de `tailwindcss`/`@tailwindcss/cli` agregó ~30 entradas nuevas ahí. No se tocó `.gitignore` ni se removió nada de git por ser una decisión de higiene de repo más amplia, fuera de lo pedido — queda para que el usuario decida.
