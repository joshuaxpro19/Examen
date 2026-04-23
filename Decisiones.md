Mira tuve complicaciones, con la elaboracion, al principio, porque le di todo el stack, pero se quedo corto, hasta que llegue a un punto donde tuve que ver cada cosa, desde los componetes porque me generaban error, tuve que usar copilot para entender cuales eran los problemas, observar los logs, y en base a los errores que me salian arreglaba, y me ayudaba, ejemplo el error comun de bcrypt, con las contraseñas, o que no me generaba la conexion correcta con el orm, de sqlite, al final me decidi por hacerlo en docker porque era mejor tener en contenedores y se me hacia mas facil ejecutarlo desde alli, lo que si que no estoy seguro, es que no tengo forma de saber, si el docker-compose, funcionara en otra pc, no me dio el tiempo de verlo, aca abajo dejo el prompt principal,

Tu empresa necesita una plataforma interna de blog donde los desarrolladores publiquen artículos técnicos, los comenten y los voten. Deberás construir un backend REST con FastAPI y un frontend en React que consuma esa API. Los usuarios se registran, inician sesión y publican contenido según su rol. Todo el código vive en un único repositorio de GitHub con historial de commits organizado y un Pull Request abierto al finalizar.

El stack que usaremos sera 
-python 3.12.8
-fastAPI
-SQLAlchemy + SQLite
-React 18 o superior
-Vite
-GitHub + JWT

Método	Ruta	Descripción
POST	/auth/register	Registro con email + password + rol (author/reader)
POST	/auth/login	Retorna JWT de acceso
GET	/articles	Lista artículos publicados (paginado, filtrable por tag)
POST	/articles	Crea artículo — solo autores autenticados
GET	/articles/{slug}	Detalle del artículo con sus comentarios
PUT	/articles/{slug}	Edita artículo propio
DELETE	/articles/{slug}	Elimina artículo propio
POST	/articles/{slug}/comments	Agrega comentario (cualquier usuario autenticado)
POST	/articles/{slug}/vote	Vota artículo: upvote/downvote, una vez por usuario
GET	/articles?search=	Búsqueda por texto en título y contenido


El sistema debe cumplir estrictamente las siguientes reglas de negocio, las cuales deben ser validadas en el backend desarrollado con FastAPI:

Estados del artículo

Cada artículo debe tener un estado: draft, published o archived.
Solo se permiten transiciones válidas:
draft → published
published → archived
No se permite saltar estados ni regresar a un estado anterior.

Autorización de acciones sobre artículos
Solo el usuario que creó el artículo (autor) puede editarlo o eliminarlo.
Cualquier intento de modificación por otro usuario debe ser rechazado con un error de autorización (HTTP 403).

Sistema de votación
Un usuario solo puede emitir un voto por artículo.
Si el usuario vuelve a votar el mismo artículo, el voto anterior debe actualizarse (no duplicarse).
Se debe garantizar unicidad por combinación usuario + artículo.

Generación automática de slug
El campo slug debe generarse automáticamente a partir del título del artículo.
Debe ser único y apto para URLs (minúsculas, sin espacios, separado por guiones).
El usuario no puede definir ni modificar el slug manualmente.

Autenticación y seguridad
La autenticación debe implementarse mediante tokens JWT.
Los tokens deben tener un tiempo de expiración de 60 minutos.
Las contraseñas de los usuarios deben almacenarse de forma segura utilizando hashing con bcrypt.
Nunca se deben guardar contraseñas en texto plano.

4.1 Pantallas requeridas
• Pantalla de login / registro con selector de rol (author/reader)
• Feed de artículos publicados con buscador y filtro por tag
• Vista de detalle del artículo con comentarios y botón de voto
• Panel del autor: mis artículos con botón para cambiar estado
• Formulario para crear y editar artículo (con campo de tags)
• Logout y manejo del token en localStorage

4.2 Criterios de calidad UI
• Estado de autenticación persiste al recargar
• Mensajes de error visibles cuando falla el login o una petición
• Loading state mientras cargan los artículos
Nota: no se requiere CSS sofisticado — la funcionalidad tiene prioridad sobre el diseño.


-crear correctamente el archivo .gitignore
-dockerizalo mejor para poder mejorar la ejecución del proyecto.
-es imporante que el backend cumpla con la arquitectura limpia, siguiendo el flujo de carpetas de 

app/
│
├── domain/                  # Núcleo (sin dependencias externas)
│   ├── entities/            # Entidades (User, Article, Vote, Comment)
│   ├── repositories/        # Interfaces de repositorios (abstractos)
│   └── enums/               # Estados (draft, published, archived)
│
├── usecases/	              # Casos de uso (lógica del sistema)
│   ├── use_cases/           # Crear artículo, votar, comentar, etc.
│   ├── dto/                 # Objetos de transferencia de datos
│   └── services/            # Lógica adicional (slug, validaciones)
│
├── infrastructure/          # Implementaciones técnicas
│   ├── database/            # Config DB, conexión, sesión
│   ├── models/              # Modelos ORM (SQLAlchemy)
│   ├── repositories/        # Implementación concreta de repos
│   ├── security/            # JWT, bcrypt
│   └── migrations/          # Migraciones (Alembic)
│
├── api/         			  # Capa de entrada (API)
│   ├── routes/              # Endpoints (FastAPI routers)
│   ├── controllers/         # Lógica intermedia (opcional)
│   ├── schemas/             # Pydantic (request/response)
│
├── main.py                  # Punto de entrada (FastAPI app)
└── config.py                # Configuración general
