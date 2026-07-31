VIAJAPRO - VIAJES, EVENTOS, PAGOS Y QR

ACCESO
- Sitio público: index.html
- Administración: admin.html
- Usuario: admin
- Contraseña: 1234

FUNCIONES AGREGADAS
- Venta de pasajes de viaje con selección de asientos.
- Venta de entradas para eventos con cantidad configurable.
- Medios de pago configurables: Webpay, Mercado Pago, transferencia y efectivo.
- Código QR único para cada compra.
- Descarga del QR en PNG.
- Consulta de compra por código.
- Panel administrativo completo organizado por tabs.
- Crear, editar y eliminar viajes.
- Crear, editar y eliminar eventos.
- Modificar comprador, correo, estado de compra y estado de pago.
- Control de pagos pagados, pendientes y reembolsados.
- Lector QR con cámara usando html5-qrcode.
- Validación manual por código.
- Registro de entrada/pasaje con tic, fecha y hora.
- Detección de QR ya usado, cancelado o inválido.

IMPORTANTE SOBRE PAGOS Y CORREOS
Esta versión funciona como demo local usando localStorage. Los botones de pago simulan la confirmación para poder probar todo el flujo.

Para cobrar dinero real con Webpay o Mercado Pago se necesita un backend seguro, credenciales oficiales y confirmación del pago mediante webhook. Nunca deben guardarse claves privadas dentro de app.js o admin.js.

Para enviar correos automáticamente, en Admin > Ajustes se puede indicar una URL de servicio de correo. El endpoint debe aceptar POST JSON con:
- to
- subject
- purchase
- qrData

Si no se configura el endpoint, el botón "Enviar comprobante" abre la aplicación de correo del teléfono o computador con toda la información preparada.

El lector QR necesita abrirse desde HTTPS o localhost para que el navegador permita usar la cámara.

CAMBIOS DE CANCELACIÓN Y DEVOLUCIÓN
- El index público ya no muestra acceso al panel de administración.
- Después de cada compra se intenta enviar automáticamente el comprobante al emailEndpoint configurado.
- Si no existe un servicio de correo configurado, el sistema conserva la compra y permite reenviar el correo manualmente.
- El cliente puede contactar al administrador por correo o WhatsApp desde el sitio y desde la consulta de compra.
- El administrador puede cancelar una compra, indicar motivo, monto y método de devolución.
- Al cancelar una compra, el QR queda inválido inmediatamente.
- La devolución queda registrada con fecha y estado Reembolsado.

IMPORTANTE
Para que los correos lleguen automáticamente sin abrir la aplicación de correo, configure una URL de backend en Admin > Ajustes > URL del servicio de correo. El frontend por sí solo no puede enviar emails de forma segura.
