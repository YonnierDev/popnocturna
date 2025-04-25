# Documentación de Endpoints - Comentarios

## Estructura de Estados

### Estado de Visibilidad
- `estado: boolean`
  - `true`: Comentario visible
  - `false`: Comentario oculto

### Estado de Aprobación
- `aprobacion: ENUM`
  - `'pendiente'`: Comentario reportado, esperando revisión
  - `'aceptado'`: Comentario reportado y aprobado
  - `'rechazado'`: Comentario reportado y rechazado

## Endpoints por Rol

### 1. Usuarios Normales (Rol 8)

#### Crear Comentario
```http
POST /api/comentario
```
- **Body**:
  ```json
  {
    "eventoid": number,
    "contenido": string
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "id": number,
    "contenido": string,
    "fecha_hora": "YYYY-MM-DDTHH:mm:ss.sssZ",
    "estado": true,
    "aprobacion": null
  }
  ```

#### Actualizar Comentario
```http
PUT /api/comentario/:id
```
- **Body**:
  ```json
  {
    "contenido": string
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Comentario actualizado exitosamente",
    "comentario": {
      "id": number,
      "contenido": string,
      "fecha_hora": "YYYY-MM-DDTHH:mm:ss.sssZ"
    }
  }
  ```

### 2. Propietarios (Rol 3)

#### Reportar Comentario
```http
POST /api/comentario/:id/reportar
```
- **Body**:
  ```json
  {
    "motivo": string
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Comentario reportado exitosamente",
    "comentario": {
      "id": number,
      "estado": "pendiente",
      "contenido": string,
      "fecha_hora": "YYYY-MM-DDTHH:mm:ss.sssZ",
      "motivo_reporte": string
    }
  }
  ```

### 3. Administradores/SuperAdmin (Roles 1,2)

#### Ver Comentarios Reportados
```http
GET /api/comentario/reportados
```
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Comentarios reportados pendientes de revisión",
    "total": number,
    "comentarios": [
      {
        "id": number,
        "contenido": string,
        "fecha_hora": "YYYY-MM-DDTHH:mm:ss.sssZ",
        "motivo_reporte": string,
        "usuario": {
          "id": number,
          "nombre": string,
          "correo": string
        },
        "evento": {
          "id": number,
          "nombre": string,
          "descripcion": string,
          "fecha_hora": "YYYY-MM-DDTHH:mm:ss.sssZ",
          "lugar": {
            "id": number,
            "nombre": string,
            "propietario": {
              "id": number,
              "nombre": string,
              "correo": string
            }
          }
        }
      }
    ]
  }
  ```

#### Actualizar Estado de Comentario
```http
PUT /api/comentario/:id/estado
```
- **Body**:
  ```json
  {
    "estado": "aceptado" | "rechazado"
  }
  ```
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Estado del comentario actualizado exitosamente",
    "comentario": {
      "id": number,
      "estado": string,
      "contenido": string,
      "fecha_hora": "YYYY-MM-DDTHH:mm:ss.sssZ",
      "motivo_reporte": string
    }
  }
  ```

### 4. Todos los Roles

#### Ver Comentarios de Evento
```http
GET /api/comentarios/evento/:eventoid
```
- **Respuesta Exitosa**:
  ```json
  [
    {
      "id": number,
      "contenido": string,
      "fecha_hora": "YYYY-MM-DDTHH:mm:ss.sssZ",
      "usuario": {
        "id": number,
        "nombre": string
      }
    }
  ]
  ```

#### Listar Comentarios
```http
GET /api/comentarios
```
- **Respuesta según Rol**:
  - Admin/SuperAdmin: Todos los comentarios
  - Propietario: Comentarios de sus lugares
  - Usuario: Sus propios comentarios

### 5. Admin/SuperAdmin y Usuario Dueño (Roles 1,2,8)

#### Eliminar Comentario
```http
DELETE /api/comentario/:id
```
- **Respuesta Exitosa**:
  ```json
  {
    "mensaje": "Comentario eliminado exitosamente",
    "comentario": {
      "id": number,
      "contenido": string,
      "fecha_hora": "YYYY-MM-DDTHH:mm:ss.sssZ"
    }
  }
  ```

## Códigos de Error Comunes

- `400`: Solicitud incorrecta
- `403`: No autorizado
- `404`: Recurso no encontrado
- `500`: Error del servidor

## Notas de Implementación

1. Los comentarios nuevos se crean con:
   - `estado: true`
   - `aprobacion: null`

2. Al reportar un comentario:
   - Se mantiene `estado: true`
   - Se establece `aprobacion: 'pendiente'`
   - Se guarda el `motivo_reporte`

3. Al aprobar/rechazar:
   - Se mantiene `estado: true`
   - Se cambia `aprobacion` a `'aceptado'` o `'rechazado'`

4. Al eliminar:
   - Se establece `estado: false` 