// 1) PRIMER BLOQUE - MODULOS DE TERCEROS: Importando los frameworks y Modulos completos 
import express from 'express' // MODULOS DE TERCEROS
import handlebars from 'express-handlebars' // MODULOS DE TERCEROS
import { Server } from 'socket.io' // MODULOS DE TERCEROS

// 2) SEGUNDO BLOQUE: Importando Rutas para el Manejo de Plantilla  
import viewsRouter from './routers/views.routers.js' // MODULOS PROPIOS

// 3) TERCER BLOQUE: habilitando el archivo utils.js para poder trabajar con Rutas Absolutas
import { __dirname } from './utils.js' // MODULOS PROPIOS 


// 4) CUARTO BLOQUE: Configuracion de los Servicios de la App

// 4.1) Configuramos el puerto de trabajo 
const PORT = 5000

// 4.2)Asignando el Servidor Express a la constante app 
const app = express()

// 4.3) Array para guardar los mensajes del Chat 
// Sirve para guardar todo los mensajes 
// Aca guarda todos los Objetos(mensajes) que me envian TODOS los clientes conectados al chat 
const chat_messages = []

// 4.4)Inicializamos Express y lo asignamos a httpServer para poder luego pasarlo dentro del server de socket.io
const httpServer = app.listen(PORT, () => {
    console.log(`Servicio Activo en el Puerto: ${PORT}`)
})

// 4.5) Instanciamos un servidor websockets con socket.io del lado del SERVIDOR
// Nota: el new Server() tiene 2 parametros y le pusimos su nombre 'io' el usado por convencion 
// 1er parametro: el servidor de Express
// 2do parametro: Le pasamos el Objeto "cors"... es una Herramienta "UN control de seguridad"
const io = new Server( httpServer, {
    
    // Es un control se seguridad - cuando hay solicitudes que viene de otros lugares y nuestra App pueda recibirlas 
    cors: {

        origin: "*",
        methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
        credentials: false
    }

}) // Servidor de Socket.io (websocket) "Activo" del LADO del SERVIDOR


// Inicializado el apartado de los Eventos para websockets, lo Ponemos a "escuchar" al SERVIDOR LO QUE VENGA DEL CLIENTE
io.on('connection', socket => {
    
    // Aca recibimos La Notificacion del CLIENTE que se CONECTO un nuevo usuario
    // bajo el topico 'user_connected' en el parametro 2 recibimos el objeto con el dato(nombre) del  NUEVO CLIENTE Conectado y lo procesamos con una callback
    socket.on('user_connected', data => {
        // Verificando el usuario que se conecto y me enviaron del cliente
        //console.log(data)

        // Enviando a TODOS los clientes conectados que se Conecto un NUEVO usario al Chat 
        // - Opcion 2 Comunicacion de Servidor al Cliente (emite a todos menos al que envio el topico)
        // mandamos por el parametro 2 el Objeto con el dato(Nuevo Usuario Conectado)
        socket.broadcast.emit('user_connected', data)

    })


    // Aca recibimos TODO los mensajes de cualquier cliente que este conectado al chat
    // bajo el topico 'message'  en el parametro 2 recibimos el texto enviado por el CLIENTE y lo procesamos con una callback
    socket.on('message', data => {

        //Guardando en un array todos los mensajes recibido del CLIENTE
        chat_messages.push(data)
        
        // Enviando a TODOS los clientes conectados al Chat - Opcion 3 Comunicacion de Servidor al Cliente
        // mandamos por el parametro 2 el array 'chat_messager' con los Logs(mensajes guardados hasta el momento)
        io.emit('messageLogs', chat_messages)

    })

}) 
    
// 6) SEXTO BLOQUE - Habilitacion de "Middlewares" de la app 

// 6.1) Middlewares para el Manejo de url's
app.use(express.json())
app.use(express.urlencoded({ extended: true })) 

// 6.2) Activacion del Modulo Handlebars (motor de Plantillas)
app.engine('handlebars', handlebars.engine())
app.set('views', `${__dirname}/views`)
app.set('view engine', 'handlebars')
//Aca activo el socket.io para handlebars
app.set('io', io)

//6.3) ASIGNAMOS LAS RUTAS DINAMICAS - Servicios de contenidos dinamicos
app.use('/', viewsRouter)

// 6.4) ASGINAMOS LAS RUTAS ESTATICAS - Servicios de contenidos estaticos
app.use('/static', express.static(`${__dirname}/public`))