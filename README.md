# Calculadora distribuida (RPI)

Implementación pedagógica de una **calculadora distribuida** usando el modelo **RPI (Remote Procedure/Method Invocation)** sobre TCP/IP en Node.js, sin dependencias externas.

El cliente invoca operaciones aritméticas como si fueran locales; en realidad cada llamada viaja por la red al servidor. Las capas que en sistemas como CORBA o RMI son generadas por un compilador de IDL aquí se implementan a mano:

- **IDL** — contrato de la interfaz.
- **Stub** — proxy del lado cliente: serializa la llamada y la envía por TCP.
- **Skeleton** — receptor del lado servidor: deserializa el frame e invoca el BO.
- **Dispatcher** — registro que enruta cada frame al skeleton correcto según `className`.
- **BO (Business Object)** — la lógica real de la calculadora, JavaScript puro.
- **Protocolo + Transporte** — wire format en texto plano sobre TCP.

## Arquitectura

```
CLIENTE                                         SERVIDOR
────────────────────────                        ────────────────────────
client.js (menú)                                server.js (TCP bootstrap)
    │                                               │
    ▼                                               ▼
stubs/calculatorStub.js  ──── TCP :3000 ────► skeleton/dispatcher.js
    │  encodeRequest()                              │  handle(frame)
    │  decodeResponse()                             ▼
    │                                   skeleton/calculatorSkeleton.js
    │                                       │  decodeRequest()
    │                                       │  switch(op) → método BO
    │                                       ▼
    │                                   bo/calculator.js (BO)
    │                                       │  add / subtract / multiply / divide
    │                                       ▼
    │                                   encodeResponse()
    └◄───────────────── OK|<valor>\n ◄──────────────┘
```

| Componente | Responsabilidad |
|---|---|
| `idl/calculator.idl` | Contrato único. Stub y skeleton derivan de aquí. |
| `bo/calculator.js` | Lógica de negocio pura. Sin red, sin serialización. |
| `protocol/codec.js` | Única fuente de verdad del wire format. |
| `protocol/transport.js` | Lectura de frames TCP delimitados por `\n`. |
| `stubs/calculatorStub.js` | Presenta al cliente una API local que internamente va a TCP. |
| `skeleton/calculatorSkeleton.js` | Mapea frames TCP → llamadas al BO y devuelve la respuesta. |
| `skeleton/dispatcher.js` | Registro genérico; recibe el frame y delega al skeleton correcto. |
| `server.js` | Solo abre el socket y pasa frames al dispatcher. |
| `client.js` | Solo presenta el menú y usa el stub. |

## Estructura del proyecto

```
calculadora/
├── .gitignore
├── package.json
├── README.md
├── idl/
│   └── calculator.idl
├── bo/
│   └── calculator.js
├── protocol/
│   ├── codec.js
│   └── transport.js
├── stubs/
│   └── calculatorStub.js
├── skeleton/
│   ├── dispatcher.js
│   └── calculatorSkeleton.js
├── server.js
└── client.js
```

## Protocolo de comunicación

Wire format en texto plano, frames delimitados por `\n`.

**Request (cliente → servidor):**

```
<className>|<op>|<arg1>|<arg2>\n
```

Ejemplos:

```
calculator|add|3|5\n
calculator|divide|10|0\n
```

**Response (servidor → cliente):**

```
OK|<valor>\n
ERR|<mensaje>\n
```

Ejemplos:

```
OK|8\n
ERR|Division by zero\n
```

- Sin JSON, sin headers, sin longitud de frame.
- Los argumentos viajan como strings y se convierten a número en el skeleton.
- El transporte acumula bytes hasta encontrar `\n`.

## IDL

```idl
interface Calculator {
  number add(number a, number b);
  number subtract(number a, number b);
  number multiply(number a, number b);
  number divide(number a, number b);
}
```

## Cómo ejecutar

Requisitos: Node.js (ESM). El servidor escucha en el puerto `3000`.

En una terminal:

```
npm run start:server
```

En otra terminal:

```
npm run start:client
```

El cliente acepta opcionalmente el host del servidor como argumento:

```
node client.js 192.168.1.10
```

## Operaciones disponibles

| Operación | Firma | Descripción |
|---|---|---|
| `add` | `add(a, b)` | Suma `a + b`. |
| `subtract` | `subtract(a, b)` | Resta `a - b`. |
| `multiply` | `multiply(a, b)` | Multiplica `a * b`. |
| `divide` | `divide(a, b)` | Divide `a / b`. Si `b == 0` retorna `ERR\|Division by zero`. |
