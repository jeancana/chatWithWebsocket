// IMPORTANTE: Aca Desarollamos todo el Contenido que va a hacer procesado por el motor de plantilla handlebars en la vista "chat.handlebars"
// IMPORTANTE: Aca se hace todo el proceso para Generar las Vistas del lado del CLIENTE

// Capturando los Datos enviados por el cliente - Obteniendo los datos del DOM POR SU id
// podemos manejarlos desde aquí - Usamos la teoria de NODOS 
const message = document.getElementById("message");
const received_messages = document.getElementById("received_messages");

// Creamos un nuevo CLIENTE de socket.io
// Habilitando socket.io del lado del CLIENTE
const socketClient = io();

// ------------- ESCUCHADORES DEL CLIENTE (listeners de Topicos) ----------//
// Puede tener todos los que Escuchadores que requiera por topico CREADO

// 1) Primer Listener: Poniendo a Escuchar el socket del lado del CLIENTE 
// Aca recibimos el mensaje enviado por el Servidor bajo el topico  'messageLogs'
socketClient.on('messageLogs', data => {
    
    console.log(data)

    // Creo una variable vacia para agregarle(Acumulador) la lista de mensajes que llegan del SERVIDOR
    let messages = ''

    // Aca recibimos el Mensaje enviado por el Servidor 
    // Creamos una lista de Mensajes
    data.forEach( message => {

        // aca voy acumulando los mensajes que me Envia el Servidor
        // Muestro los valores Contenidos en el Objeto Enviado por el Servidor en Forma de mensaje
        messages += ` ${message.user} dice: ${message.message} <br/>`

    })

    // Aca muestro por DOM la lista de mensajes creada
    // En Parrafo del html lo muestro 
    received_messages.innerHTML = messages

    // Aca estoy consologuenado el mensaje que viene del lado del servidor al cliente
    //console.log(data)

})


// 1) Segundo Listener: Poniendo a Escuchar el socket del lado del CLIENTE 
// Aca recibimos el mensaje enviado por el Servidor bajo el topico  'user_connected'
socketClient.on('user_connected', data => {
    // Verificando que contiene parametro data - Me traigo el Objeto Validado del Array 
    console.log(data)
    
    // El nuevo Usuario NO ES un nuevo usuario 100%, es un USUARIO-Validado del Array que EntroNUEVO a CONVERSAR al chat
    // Como se Valido un Nuevo CONVERSADOR emito un mensaje a todos los miembros del chat previamente conectados, avisando que llego un Nuevo CONVERSADOR
    // El evento lo envio mediante una ventana de Sweealert2
    Swal.fire({

        // Aca aprovechamos los otros Datos Suministrados en el Array de Objetos "user" - lo usamos por referencia
        text: `${data.user.firstName} ${data.user.lastName} se ha conectado al Chat!`,
        toast: true,
        position: "top-center",

    })
    
    console.log(data)

})


// ---------- DINAMISMO PARA HTML POR LA TEORIA DE LOS NODOS(elementos) ------------------------------------// 

// Recibiendo el Mensaje del CLIENTE y los ENVIAMOS al SERVIDOR - A trave de un "evento onclick"
// Le asigno la funcion sendMessage() al "evento onclick" creado en la plantilla de chat.handlebars
// Aca muestro donde fue la asignacion "<button onClick="sendMessage()">Enviar</button> "
const sendMessage = () => {

    // Validando el mensaje que TOMADO del cliente
    // Logica Operando: Si el dato//value contenido en el message NO es vacio entra
    // Usando el metodo .trim() le sacamos los espacio en blanco (uso de la barra de espacio) del texto recibido
    if (message.value.trim() !== ' ') {

        // Enviado el mensaje al SERVIDOR
        // IMPORTANTE: El Mensaje que enviamos al Servidor es un Objeto con 2 propiedades "user" y "message"
        // 1) En la propiedad "user" asignamos la variable "user"(es unarray de Objetos) y referenciamos al userName del objeto
        // 2) En la propiedad "message" asignamos el mensaje capturado del input creado en la plantilla chat.handlebars
        // Mandamos el mensaje TRIMANDO .trim()
        socketClient.emit('message', { user: user.userName, message: message.value.trim() })

        //Aca limpia la caja de texto del chat para que sea usada de nuevo
        message.value = ""
    }

}


// ----------------------- BLOQUE DE CODIGO AUTENTICADOR CON SWEEALERT2 -------------------------------------//

// Este array es solo demostrativo Para VALIDAR USUARIOS QUE INGRESAN AL CHAT, los datos de usuario normalmente se cotejarán contra una base de datos
const users = [

    { id: 1, firstName: "Kath", lastName: "Luna", userName: "klunatica" },
    { id: 2, firstName: "Michell", lastName: "Canache", userName: "mcanache" }
    
];

// Creamos una variable user para asignarle el nombre que coloco el Usuario
let user

// ****** Creando La funcion de AUTENTICACION CON LA LIBRERIA DE Sweetalert2 ******
const authenticate = () => {
    
    // -----  Sistema de Autenticacion con SweetAlert2 ------
    
    // Creando una ventana que le permita al usuario poner un nombre con el cual se identifique en el Chat
    Swal.fire({
        
        // Propiedades de la Ventana de Sweetalert2
        title: 'Chat Login',
        input: 'text',
        text: 'Ingresa userName ',
        
        // Esto es para asegurarnos de que el cliente ingreso el nombre de Usuario Requerido
        // inputValidator es un metodo que tiene Disponible el sweealert2 en su libreria 
        // Le pasamos un callback "value" que retorna una conjuncion para asegurarnos de que el Usuario ingrese el nombre
        inputValidator: value => {
            return !value && 'Por Favor Ingresar Usuario'
        },
        allowOutsideClick: false, // Impide que el Usuario salga de la Alerta al dar "click" FUERA DE LA ALERTA
        
        // Al identificarse el usurios se va ajecutar la funcion result
    }).then(result => {
        
        // Primersa forma sin validar Usuario- Asignamos el Valor de result(NombreIngresado por el Usuario) a la variable use
        // user = result.value
        
        // Segunda forma: comparo que el User que Ingrese Al Chat sea igual al del Array de "users" uso el la HOF.find()
        // NOTA IMPORTANTE: El .find() al encontrar que coincida el Nombre Ingresado por usuario con el dato guardado en la propiedad username, me DEVOLVERA EL OBJETO QUE COINCIDIO y al no encontrarlo devuelve UNDIFINED 
        user = users.find(item => {
           
            // Aca verifico y valido si el usuraio que ingresa ya esta cargado en mi array user(BD)
            return item.userName === result.value
            
        })
        
        if (user !== undefined) { 
            
            // Aca entre xq es una Usario VALIDO registrado en el Array 
            // Como es VALIDO emito al Servidor un Noticacion Bajo el topico 'user_connected' y le envio un objeto con el user NUEVO que se acaba de conectar
            socketClient.emit('user_connected', { user: user})

        } else {
            
            // Como es undifined = Usuario No registrado en el Array 
            // Emitimos otra ventana de usuario NO Valido
            Swal.fire({
                
                text: "Usuario NO válido",
                toast: true,
                position: "top-center",
                
            }).then((result) => {
                
                // Como el usuario NO es valido volvemos a Intentar Autenticarlo 
                authenticate();
                
            });
            
        } 
               
        // Verificando si Existe o no el usuario  - Aca veo si el .find() me regresa el objeto  
        console.log(user)
    })

}

// *** MUY IMPORTANTE: Aca hacemos el llamado de la funcion para que pueda activarse TODO EL PROCESO DE AUTENTICACION ***
authenticate()



// ------------------------ EVENTO DE TECLADO PARA EL CHAT -------------------------------------// 


// IMPORTANTE  - HACIENDO que los textos del Chat se envien al SERVIDOR cuando el usuario pise la tecla 'Enter'
// Creamos un Evento de teclado para poder ejecurtarlo 'keyup'
message.addEventListener('keyup', evt => {

    // Aca definimos y el mensaje se enviara con se apriete la tecla 'Enter' 
    if (evt.key === 'Enter') {

        // Aca corroboramos que el mensaje NO este vacio o solo contenga espacios
        // Usando el metodo .trim() le sacamos los espacio en blanco (uso de la barra de espacio) del texto recibido
        if (message.value.trim().length > 0) {
            socketClient.emit('message', { user: user.userName, message: message.value })// emitimos nuestro primer evento del lado del cliente

            //Aca limpia la caja de texto del chat para que sea usada de nuevo
            message.value = ""
        }

    }

})


// Esto ERA un chequeo previo para ver si la chat.js anda anda bien de lado del CLIENTE
//console.log('OK - solo para verificar')