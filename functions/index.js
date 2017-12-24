const functions = require('firebase-functions');
var admin = require("firebase-admin");


admin.initializeApp(functions.config().firebase);

var firestore = admin.firestore();

exports.webhook = functions.https.onRequest((request, response) => {
	
	console.log("request.body.result.parameters: ", request.body.result.parameters);
	
	
	switch(request.body.result.action){

		case 'PedirOrdenRestaurante':

				let params = request.body.result.parameters;
	
				firestore.collection('reservas')
				.add(params)
				.then(() => {

					response.send({
						speech:
							`${params.name} tu orden de menu ${params.TipoMenu} es para ${params.persons} personas. Me encargaré de enviarte el detalle de tu orden a tu correo ${params.email} pronto. Antes que me olvide, el medio de pago elegido es ${params.TipoPago}. Un gusto poder haberte ayudado, hasta pronto !! `

					}).catch((e => {

						console.log('Error en el documento', e);

						response.send({
							speech: "Algo sucedió con el servidor - 404" 
						});
					}))

				});

		break;

		case 'ContarOrdenRestaurante':

				firestore.collection('reservas').get()
				.then((querySnapshot) => {

					var reservas = [];
					querySnapshot.forEach((doc) => { reservas.push(doc.data()) });

					response.send({
						speech: `Tu tienes ${reservas.length} reservas. ¿Deseas obtener el detalle de tus órdenes? (Si/No)`
					});

				}).catch((err) => {

					console.log('Error en el documento', err);
					response.send({
						speech: "Ha ocurrido un error en la base de datos firebase"
					});

				});

		break;


		case 'MostrarOrdenRestaurante':

				firestore.collection('reservas').get()
				.then((querySnapshot) => {

					var reservas = [];
					querySnapshot.forEach((doc) => { reservas.push(doc.data()) });

					var speech = `A continuación el detalle de tus órdenes: \n`;

					reservas.forEach((eachReserva, index) => {
						speech += `- Nro. ${index + 1} es: ${eachReserva.TipoMenu} menu para ${eachReserva.persons} personas, ordenadas por ${eachReserva.name}  \n` 
					})

					response.send({
						speech: speech + `. Un gusto poder haberte ayudado, hasta pronto !!`
					});

				}).catch((err) => {

					console.log('Error en el documento', err);
					response.send({
						speech: "Ha ocurrido un error en la base de datos firebase"
					});

				});

		break;

		default:
			response.send({
				speech: "No se ha encontrado coinciencia con su búsqueda"
			})

	}
	
});

