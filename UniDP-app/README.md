# UniDP

Plataforma de eventos universitarios para la Universidad Diego Portales. Permite a estudiantes crear y descubrir eventos organizados por facultad.

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- Una cuenta en [Supabase](https://supabase.com) con el proyecto configurado

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Jxsefa/UniDP.git 
cd UniDP/UniDP-app
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` dentro de la carpeta `UniDP-app/` con el siguiente contenido:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

> Puedes encontrar estos valores en tu proyecto de Supabase en **Project Settings → API**.


### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La app queda disponible en [http://localhost:5173](http://localhost:5173).

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera el build de producción en `dist/` |
| `npm run preview` | Previsualiza el build de producción localmente |
| `npm run lint` | Ejecuta ESLint en todo el proyecto |

## Estructura del proyecto

```
UniDP-app/
└── src/
    ├── components/
    │   ├── layout/       # Navbar y elementos de layout
    │   └── ui/           # Componentes reutilizables (Spinner, etc.)
    ├── config/           # Configuración de Supabase
    ├── constants/        # Facultades, categorías y datos estáticos
    ├── context/          # AuthContext (estado global de sesión)
    ├── hooks/            # useAuth y hooks personalizados
    ├── pages/            # Páginas de la aplicación
    │   ├── login/
    │   ├── register/
    │   └── create-event/
    ├── routes/           # AppRouter, ProtectedRoute, PublicRoute
    └── services/         # Lógica de llamadas a Supabase
        ├── auth.service.js
        └── events.service.js
```

## Acceso

Solo se permiten correos institucionales de la UDP:
- `@udp.cl`
- `@mail.udp.cl`

## Tecnologías

- [React 19](https://react.dev/)
- [Vite 8](https://vitejs.dev/)
- [React Router 7](https://reactrouter.com/)
- [Supabase](https://supabase.com/) — autenticación y base de datos
