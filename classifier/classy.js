var natural = require('natural'),
  classifier = new natural.BayesClassifier(natural.PorterStemmerEs, null);
var Twit = require('twit');
var fs = require('fs');

var T = new Twit({
    consumer_key:         'bVqypJtXqUiiMH8d6FJd3A01w'
  , consumer_secret:      'UNK3wEZ1C5KA1DSrTC0v9smKPkRv2WTBgbZXKg4AcDwV6DiA3G'
  , access_token:         '17706291-KaAz42qBfUaQtKIqPPDXeUrq47HccxGiWq3XzeVJ7'
  , access_token_secret:  'FNQJ9S69xIbQh0k3A2gaMk5aZR4IuGLEPrT9UD3z7FMOs'
});

var hasNegativeWord = function(tweet)
{
	var negative_keywords = ['sammywilkfollowspree'];
	for (var i = negative_keywords.length - 1; i >= 0; i--) {
		var nega = negative_keywords[i];
		if (tweet.indexOf(nega) > -1) { return true; };
	};
	return false;
}

var bomba_phrases = ['Que mierda me importa quien se casa en Facebook',
						'Pero aún así y todo mi jefe insistió varias veces que quería acostarse conmigo y que no entendía por qué lo rechazaba.',
						'Que mierda me importa quien se casa en Facebook',
						'Mi vecina empezó a coger fuerte y me desperté por el ruido que hacía. Estaba babeando la almohada',
						'Todos los que se compraron zapatillas fluo te juro que se van a arrepentir.',
						'soy muy mala',
						'La amistad entre él y yo se terminó porque a él no se le paraba',
						'me esta haciendo cagar de frio en la calle',
						'Esta mal que me chupe todo un huevo',
						'Odio estar asi',
						'Que fea es la camiseta de atlanta no me gusta',
						'Mandaria todo a la concha de su madre',
						'que garron todo el dia sin luz',
						'Me rompe los huevos',
						'Nacha deja de romper las pelotas',
						'Se pueden ir bien a la mierda',
						'Me caias bien. Si seguis asi te voy a dejar pelada idiota',
						'Que impotencia por favor, te pasan por encima',
						'Negro sorete ! Se hace el bueno yo no hice nada y es un garca',
						'Haceme el favor y pegate un tiro',
						'Me caen mal las personas que cambian de actitud cuando se juntan con otras',
						'Sos una forra, una ignorante , puta , recogida de la calle',
						'Viernes de: Jefe hoy no hago ni mierda! (pura mierda)',
						'Si no me fumo un porro ahora voy a llorar del mal humor que tengo',
						'Tipo, lo tengo en frente mio y nose si pegarme un tiro yo o pegárselo a el',
						'Facebook es una mierda',
						'Como mierda voy hacer para aprobar esos dos parciales ese día. Voy a morir',
						'Me chupa la pija el mundo'];

for (var i = bomba_phrases.length - 1; i >= 0; i--) {
	classifier.addDocument(bomba_phrases[i], 'bomba');
};

var normal_phrases = ['El rock es una etapa que vas a pasar', 
						'Tanta cosa por hacer hoy en solo unas horas y yo tomando valor para meterme a bañar con agua fría',
						'4 Tweets retwitteados y un total de 5 RTs',
						'Si Lanata dice que Flor de la V es un hombre, no hay que dudar: si dice que hay inseguridad debe ser al revés',
						'Mis fans lo siguen intentando',
						'Llévame por china aunque vaya como sardina',
						'Sale a la disco a bailar una diva virtual',
						'Con luz en tela',
						'me hace cagar de risa lo amo',
						'Venezuela llegó al colmo y deberá importar petróleo',
						'nunca desistir',
						'Los abonados y socios tienen una semana más de plazo para comprar el adicional',
						'DIOSASSS que estarán en la pasarela VERANO2015',
						'yo también igual por ahí nos vemos en algún parador, estaría re bueno',
						'Fechas CONFIRMADAS',
						'Mi reina hermosa',
						'Yo soy de pueblo. Imagínate en esa red',
						'Ya falta poco para que termine el dia, y va a faltar menos para mi cumple',
						'Ancelotti. te hemos comprado el 9 que querías',
						'Este Miercoles va a estar con nosotros en el programa Chayanne',
						'Todos los osos de mi hermana tienen nombre',
						'Te amo mucho mi princesa',
						'Qué bien que anda Gallardo',
						'hola te acordas de mi? solías contarme todo',
						'Ay extrañaba esto',
						'Conocé gente de todo el mundo ¡Participá y ganá!',
						'Juro que amo esta foto. Y a vos, más que nada!',
						'Creo que se escribe así su nombre',
						'Mi vida que hermosos días pero además que hermosa vida si es al lado tuyo',
						'Que bien me hace la música',
						'mejor búscate uno que te ayude a crecer',
						'Que vengan mil, que yo te seguiré eligiendo a ti',
						'Te amo',
						'Gracias a todos por el aguante',
						'TODOS A ALENTAR',
						'Estoy haciendo un flyer de unas bandas bien under escuchando Estelares',
						'Hay que reírse mucho. Hay que reírse siempre.',
						'Me resulta muy tierno que me digan que me extrañan',
						'los amo',
						'Que lindo ya estar en casa',
						'Amigo querido muy feliz cumple para ti, lo mejor en todo siempre',
						'A veces esta bueno levantarse y poner un poco de música movida',
						'Posta se ven muy buenas',
						'Me encanta este programa de tatuajes',
						'Hoy juega VELEZ es mi felicidad',
						'Publiqué una nueva foto en Facebook',
						'Me gusta como te vestís y como andás, me gusta tu pelo, tu cuerpo',
						'Estoy feliz , a tres metros sobre el cielo'];

for (var i = normal_phrases.length - 1; i >= 0; i--) {
	classifier.addDocument(normal_phrases[i], 'normal');
};


classifier.train();

classifier.save('classifier.json', function(err, classifier) {
    // the classifier is saved to the classifier.json file!
});

var short_tweets = [];
T.get('search/tweets', { geocode:'-34.6158527,-58.4332985,10mi', count: 500, lang: 'es' }, function(err, data, response) {
  for (var i = data.statuses.length - 1; i >= 0; i--) {
  	tweet = data.statuses[i];
  	
  	if (classifier.classify(tweet.text) == 'bomba' && !hasNegativeWord(tweet.text)
  			&& tweet.text.length > 50) {
  		//console.log(tweet.text + "-" + "http://twitter.com/" +tweet.user.screen_name + '/status/' + tweet.id_str);
  		if (tweet.retweeted_status != null) {
  			tweet = tweet.retweeted_status;
  		};

  		short_tweets.push({
  			"username": tweet.user.screen_name,
  			"name": tweet.user.name,
  			"content": tweet.text,
  			"location": tweet.user.location,
  			"url": "http://twitter.com/" +tweet.user.screen_name + '/status/' + tweet.id_str,
  			"avatar_url": tweet.user.profile_image_url,
  			"tweet_id": tweet.id_str
  		});

  		console.log(tweet.text);
  	};
  };

  //console.log(short_tweets);


	fs.writeFile("tweets.json", JSON.stringify(short_tweets), function(err) {
	    if(err) {
	        console.log(err);
	    }
	}); 

});

