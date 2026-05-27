# Cumpleaños y Aniversarios Emaús Parejas

Aplicación sencilla para registrar fechas de miembros de la comunidad y mostrar los cumpleaños y aniversarios del día.

## Tecnología

- Frontend: React, Vite, Tailwind CSS, react-hook-form
- Backend: Node.js, Express, PostgreSQL

## Estructura del proyecto

```text
backend/   API en Node y esquema de PostgreSQL
frontend/  Aplicación React con formulario público y tablero
```

## Ejecutar localmente

Este proyecto necesita `npm` y Docker disponibles en tu máquina.

1. Inicia PostgreSQL:

```bash
docker compose up -d
```

2. Instala dependencias:

```bash
npm install --prefix backend
npm install --prefix frontend
```

3. Crea los archivos de entorno:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

4. Inicia el backend:

```bash
npm run dev --prefix backend
```

5. Inicia el frontend en una segunda terminal:

```bash
npm run dev --prefix frontend
```

Abre:

- Formulario público: `http://localhost:5173/registro`
- Panel admin: `http://localhost:5173/admin`
- Salud de la API: `http://localhost:4000/api/health`

PostgreSQL queda expuesto en el puerto local `5433` para evitar conflictos con cualquier servidor PostgreSQL local que use `5432`.

## Notas

- El tablero busca cumpleaños y aniversarios por mes y día.
- El botón del panel admin no aparece en la navegación pública. Entra directamente a `/admin`.
- El panel admin usa `ADMIN_TOKEN` desde `backend/.env`. En local, el valor inicial es `dev-admin-token`; cámbialo por un token privado antes de usar datos reales.
- El backend usa `APP_TIME_ZONE` desde `backend/.env` para decidir qué significa "hoy".
- En desarrollo local, las fotos se guardan en `backend/uploads` y la base de datos guarda la ruta pública, por ejemplo `/uploads/archivo.jpg`.
- Los archivos dentro de `backend/uploads` están ignorados por Git; solo se conserva `.gitkeep` para mantener la carpeta.
- Para producción, configura `DATABASE_URL`, `CORS_ORIGIN` y `VITE_API_BASE_URL` con tus servicios desplegados.

## Fotos en producción

No guardes fotos subidas por usuarios dentro del filesystem efímero de un servidor desplegado, porque se pueden perder al reiniciar, escalar o redeplegar. Lo recomendado es:

1. Subir la foto a un almacenamiento de objetos como S3, Cloudflare R2, Supabase Storage o Google Cloud Storage.
2. Validar tipo, tamaño y permisos en el backend antes de aceptar el archivo.
3. Guardar en PostgreSQL solo la URL pública o la llave privada del objeto.
4. Servir la imagen desde el proveedor de almacenamiento o desde un CDN.

Para este MVP local, `backend/uploads` está bien. Para producción, reemplaza `photoUrlFromFile` y el almacenamiento de `multer` por una subida al proveedor elegido.
