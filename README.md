# Yu-Gi-Oh! Web

Frontend Angular para consultar el catálogo de cartas de primera generación servido por `yugioh-api`. La aplicación solo consume endpoints de lectura.

## Requisitos

- Node.js `^22.22.3` para Angular 22.
- npm 10 o posterior.
- Angular `22.1.7` y Angular CLI `22.1.8` se instalan como dependencias del proyecto.
- Durante el desarrollo, `yugioh-api` debe estar disponible en `http://localhost:8080`.

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm start
```

El servidor de Angular configura `proxy.conf.json` para redirigir `/api/**` a `http://localhost:8080`. Así, la aplicación utiliza URLs relativas, por ejemplo `/api/v1/cards`, sin requerir cambios de CORS en el backend.

## Rutas

- `/` redirige a `/cards`.
- `/cards` muestra la primera página del catálogo.
- `/cards/:id` muestra el detalle básico de una carta.

## Verificación

```bash
npm test -- --run
npm run build
```

Las pruebas HTTP usan el backend de testing de Angular y no necesitan Spring Boot, MariaDB, internet ni archivos de imágenes.
