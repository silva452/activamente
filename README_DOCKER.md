# Activamente - Guía de Docker

## 🚀 Inicio Rápido

### Requisitos Previos
- Docker Desktop instalado ([Descargar aquí](https://www.docker.com/products/docker-desktop))
- Docker Compose (incluido con Docker Desktop)

### Levantar la aplicación

1. **Construir y levantar los contenedores:**
   ```bash
   docker-compose up -d
   ```

2. **Esperar a que la base de datos esté lista** (aproximadamente 30 segundos)

3. **Acceder a la aplicación:**
   - Abrir navegador en: http://localhost:8082

### Comandos Útiles

**Ver logs de los contenedores:**
```bash
docker-compose logs -f
```

**Ver logs solo del servidor web:**
```bash
docker-compose logs -f web
```

**Ver logs solo de la base de datos:**
```bash
docker-compose logs -f db
```

**Detener los contenedores:**
```bash
docker-compose down
```

**Detener y eliminar volúmenes (⚠️ borra la base de datos):**
```bash
docker-compose down -v
```

**Reiniciar los contenedores:**
```bash
docker-compose restart
```

**Reconstruir las imágenes:**
```bash
docker-compose up -d --build
```

### Acceso a la Base de Datos

**Credenciales:**
- Host: `localhost`
- Puerto: `3306`
- Base de datos: `activamente`
- Usuario: `activamente_user`
- Contraseña: `activamente_pass`
- Usuario root: `root`
- Contraseña root: `rootpassword`

**Conectar desde la línea de comandos:**
```bash
docker exec -it activamente_db mysql -u activamente_user -pactivamente_pass activamente
```

### Estructura de Servicios

- **web**: Servidor Apache con PHP 8.2 (puerto 8082)
- **db**: MySQL 8.0 (puerto 3306)

### Solución de Problemas

**Si la aplicación no carga:**
1. Verificar que los contenedores estén corriendo:
   ```bash
   docker-compose ps
   ```

2. Revisar los logs:
   ```bash
   docker-compose logs
   ```

**Si hay error de conexión a la base de datos:**
1. Esperar unos segundos más (la BD tarda en inicializarse)
2. Reiniciar el contenedor web:
   ```bash
   docker-compose restart web
   ```

**Para empezar de cero:**
```bash
docker-compose down -v
docker-compose up -d
```

### Archivos Persistentes

- Los archivos subidos se guardan en `./uploads` (persisten aunque se eliminen los contenedores)
- La base de datos se guarda en un volumen Docker llamado `db_data`

### Notas Importantes

- La primera vez que se ejecuta, Docker descargará las imágenes necesarias (puede tardar unos minutos)
- El archivo `database.sql` se importa automáticamente al crear el contenedor de MySQL
- Los cambios en el código PHP se reflejan inmediatamente (no necesitas reconstruir)
- Para cambios en el Dockerfile, usa `docker-compose up -d --build`
