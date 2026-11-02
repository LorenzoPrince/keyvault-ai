# KeyVault AI 🎮⚡
> Plataforma inteligente de venta asistida y validación técnica de hardware con IA para licencias digitales.

Desplegado en producción sobre **DonWeb Cloud Server** para la Hackatón *DonWeb Day Rosario 2026*.

---

## 🌐 URLs del Proyecto
* **Producción Oficial (HTTPS):** [https://dwday-1252412.online/](https://dwday-1252412.online/)
* **Panel de Métricas / Admin:** [https://dwday-1252412.online/admin](https://dwday-1252412.online/admin)
* **Respaldo IP Directa:** [http://201.32.132.181/](http://201.32.132.181/) *(redirige a HTTPS)*

---

## 1. Qué es y qué problema resuelve
En la venta de licencias digitales de videojuegos y software por WhatsApp y canales conversacionales, los comercios pierden hasta el **40% de las ventas** por demoras de más de 45 minutos en responder dudas técnicas sobre compatibilidad de hardware. Además, las compras de juegos que luego no corren en la PC del usuario generan reembolsos y fricción operativa.

**KeyVault AI** automatiza el ciclo de venta técnica:
1. Analiza en 1.5 segundos las especificaciones técnicas del usuario expresadas en lenguaje natural.
2. Si el hardware es insuficiente, frena la compra con un veredicto técnico honesto y recomienda títulos alternativos del catálogo que sí son compatibles.
3. Incorpora un Concierge conversacional que asiste el cierre de compra y emite la licencia digital en pantalla al instante para preservar la privacidad del usuario.

---

## 2. Componentes de la Solución
* **Catálogo & E-Commerce (Frontend):** SPA gamer desarrollada en React + Vite, optimizada para navegación móvil y de escritorio, con barra de búsqueda inteligente y tarjetas interactivas.
* **Motor de Compatibilidad con IA (OpenAI API):** Agente con modelo GPT-4o-mini que contrasta requerimientos de sistema mínimos y recomendados contra especificaciones informales ingresadas por el cliente.
* **Checkout Concierge:** Asistente guiado de cierre comercial que formaliza la orden y genera la clave digital en pantalla.
* **Panel de Administración (`/admin`):** Dashboard con métricas comerciales en tiempo real: pedidos procesados, tiempo ahorrado por la IA y registro de consultas atendidas.

---

## 3. Arquitectura y Stack Tecnológico
* **Frontend:** React, Vite, Tailwind CSS.
* **Backend:** Node.js, Express (API REST).
* **Integración IA:** OpenAI API (GPT-4o-mini) ejecutada desde backend protegiendo la clave en variables de entorno.
* **Servidor Web & Proxy Inverso:** Nginx gestionando tráfico en puerto 80 y 443 con certificado SSL Let's Encrypt y enrutamiento SPA.
* **Gestor de Procesos:** PM2 garantizando alta disponibilidad del servicio Node.js en puerto 3001.
* **Infraestructura:** DonWeb Cloud Server (Ubuntu 22.04 LTS) con UFW activo.

---

## 4. Guía de Evaluación para el Jurado
1. Ingresar a `https://dwday-1252412.online/`.
2. En la barra de búsqueda o en el chat, ingresar una consulta de hardware: *"Tengo gráficos integrados viejos, ¿me corre Cyberpunk?"*.
3. Observar el veredicto en tiempo real (Incompatible) y las sugerencias automáticas de juegos ligeros.
4. Solicitar la compra en el chat (*"Quiero comprarlo"*), completar el checkout rápido y recibir la clave digital en pantalla.
5. Acceder a `https://dwday-1252412.online/admin` para verificar el impacto en las métricas de negocio.

---

## 5. Seguridad del Panel `/admin` y Despliegue
* **Doble barrera:** Nginx protege `/admin` y `/api/admin` con autenticación básica HTTP (`auth_basic "Acceso Restringido - Administracion"`) y, opcionalmente, Express exige `ADMIN_TOKEN`.
* **Frontend:** si la API responde 401/403, React muestra la pantalla *Acceso restringido* y no renderiza métricas, ventas ni keys.
* **Credenciales fuera de Git:** `sudo bash deploy/setup-admin-auth.sh` genera `/etc/nginx/.htpasswd` (usuario `admin`, contraseña aleatoria mostrada una sola vez).
* **Configuración:** los bloques a pegar en el `server {}` de Nginx están en `deploy/nginx-admin-auth.conf`.
* **Deploy:** `WEB_ROOT=/ruta/publica bash deploy/deploy.sh` compila Vite, copia `client/dist` a la carpeta pública, valida Nginx (`nginx -t`), recarga Nginx, reinicia PM2 y verifica que `/admin` devuelva 401 sin credenciales.
