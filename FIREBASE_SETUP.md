# Configuración de Firebase

## Pasos para configurar Firebase

### 1. Crear proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Add project" o "Agregar proyecto"
3. Ingresa el nombre de tu proyecto: `api-tester`
4. Sigue los pasos del asistente

### 2. Configurar Firestore Database

1. En el panel izquierdo, ve a **Firestore Database**
2. Haz clic en "Create database"
3. Selecciona **"Start in test mode"** (para desarrollo)
4. Elige una ubicación cercana a ti

### 3. Configurar Authentication

1. En el panel izquierdo, ve a **Authentication**
2. Ve a la pestaña **"Sign-in method"**
3. Habilita **"Anonymous"** (para usuarios sin registro)
4. Opcionalmente, habilita **"Email/Password"** para registro de usuarios

### 4. Obtener configuración del proyecto

1. Ve a **Project Settings** (ícono de engranaje)
2. Baja hasta la sección **"Your apps"**
3. Haz clic en **"</>"** para agregar una aplicación web
4. Registra la app con el nombre: `api-tester-web`
5. Copia la configuración que aparece

### 5. Configurar variables de entorno

1. Crea un archivo `.env` en la raíz del proyecto
2. Copia el contenido de `.env.example`
3. Reemplaza los valores con tu configuración de Firebase:

```env
VITE_FIREBASE_API_KEY=tu-api-key-aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-project-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=tu-app-id
```

### 6. Reglas de seguridad de Firestore (Opcional para producción)

En **Firestore Database > Rules**, puedes usar estas reglas básicas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Los usuarios solo pueden acceder a sus propios proyectos
    match /projects/{projectId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Características implementadas

- ✅ **Autenticación anónima** - Los usuarios pueden usar la app sin registrarse
- ✅ **Base de datos en tiempo real** - Los cambios se sincronizan automáticamente
- ✅ **Persistencia offline** - Funciona sin internet y sincroniza después
- ✅ **Proyectos por usuario** - Cada usuario ve solo sus proyectos
- ✅ **CRUD completo** - Crear, leer, actualizar y eliminar proyectos

## Comandos

```bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev

# Construir para producción
pnpm build
```