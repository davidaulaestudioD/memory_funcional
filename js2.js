$(document).ready(function() {

    $("#modoClasico").click(function() {
        menuModos('clasico');
    });

    $("#modoContrarreloj").click(function() {
        menuModos('contrarreloj');
    });

    $("#modoVidas").click(function() {
        menuModos('vidas');
    });

    function menuModos(modo) {
        if (modo === 'clasico') {
            mostrarTablero(); 
            modoClasico(); 
        } else if (modo === 'contrarreloj') {
            mostrarTablero(); 
            modoContrarreloj(); 
        } else if (modo === 'vidas') {
            mostrarTablero(); 
            modoVidas(); 
        }
    }

    //Ocultar o mostrar
    function mostrarTablero() {
        $("#menu-modos").hide();  
        $("#contenedor-juego").show(); 
        $("#temporizador").hide();
        $("#vidas").hide();
        
    }

    function mostrarIngresoJugador(){
        $('#contenedor-juego').hide();
        $('#pedir-nombre').show();
    }

    function esconderIngresoJugador(){
        $('#pedir-nombre').hide();
        $('#contenedor-juego').show();
    }

    function mostrarDerrota(){
        $("#derrota").show();
        $("#contenedor-juego").hide();
    }

    function esconderDerrota(){
        $("#derrota").hide();
        $("#menu-modos").show();
    }
    

    //Puntuaciones
    let puntuacionesPorModo = {
        "Clasico": [],
        "Contrarreloj": [],
        "Vidas": []
    };

    function actualizarPuntuaciones(modoActual) {
        let puntuacionesModo = puntuacionesPorModo[modoActual] || [];
        let textoPuntuaciones = puntuacionesModo.map(function(puntuacion) {
            return puntuacion.nombre + ": " + puntuacion.puntos;
        }).join(', ');

        $("#puntuaciones").html("Puntuaciones " + modoActual + ":<br> " + textoPuntuaciones);
    }

    function agregarPuntuacion(nombre, puntos, modo) {
        let nuevaPuntuacion = {
            nombre: nombre,
            puntos: puntos
        };

        if (puntuacionesPorModo[modo]) {
            puntuacionesPorModo[modo].push(nuevaPuntuacion);
        }
        actualizarPuntuaciones(modo);

        $.ajax({
            url: 'guardar_puntuaciones.php',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ nombre, puntos, modo }),
            success: function(response) {
                //console.log(response); 
            },
            /*
            error: function(xhr, status, error) {
                console.error('Error al guardar la puntuación:', error);
            }
            */
        });
    }

    

    //Modo clasico 
    function modoClasico() {
        let cartas = [1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6]; 
        let primeraCarta = null;
        let segundaCarta = null;
        let bloqueoClick = false; 
        let modo = "Clasico";
        let puntos = 0; 
        actualizarPuntuaciones(modo);

        function mezclarCartas(array) {
            for (let i = array.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        function generarTablero() {
            $("#tablero").empty();
            cartas = mezclarCartas(cartas);

            cartas.forEach(function(valor) {
                let carta = $('<div class="carta" data-valor="' + valor + '"></div>');
                $("#tablero").append(carta);
            });

            $(".carta").click(voltearCarta);
        }

        function actualizarMarcador() {
            $("#marcador").text("Puntos: " + puntos.toFixed(1)); 
        }
       

        function verificarVictoria() {
            //Comprobar si estan volteadas
            if ($(".carta").length === $(".carta.volteada").length) {
                mostrarIngresoJugador();
                $("#guardarNombre").off("click").click(function() {
                    let nombreJugador = $('#nombreJugador').val();
                    if(nombreJugador){
                        esconderIngresoJugador();
                        agregarPuntuacion(nombreJugador, puntos, modo);
                    }

                    puntos = 0;
                    actualizarMarcador();
                    setTimeout(function () {
                        generarTablero();
                    }, 1500);
                });
            }
        }


        function voltearCarta() {
            if (bloqueoClick) return; // Si estamos dando la vuelta a las cartas, no permitir más clics
            if ($("#carta").hasClass('volteada')){
                $("#contenedor-juego").hide();

            }
            if ($(this).hasClass('volteada') || $(this).hasClass('emparejada')) return; // No hacer nada si la carta ya está volteada o emparejada

            if (!primeraCarta) {
                primeraCarta = $(this);
                primeraCarta.addClass("volteada"); //Cambiar el valor a volteada
                primeraCarta.text(primeraCarta.data("valor")); // Mostrar el valor en la carta
                
            } else if (!segundaCarta) {
                segundaCarta = $(this);
                segundaCarta.addClass("volteada"); 
                segundaCarta.text(segundaCarta.data("valor")); 

                bloqueoClick = true; //Activar bloqueo

                // Comprobar si las cartas son iguales
                if (primeraCarta.data("valor") === segundaCarta.data("valor")) {
                    puntos += 1; 
                    actualizarMarcador(); 
                    verificarVictoria();

                    primeraCarta.addClass("emparejada");
                    segundaCarta.addClass("emparejada");

                    //Reinicar y desbloquear
                    primeraCarta = null;
                    segundaCarta = null;
                    bloqueoClick = false; 
                } else {
                    puntos -= 0.2;
                    actualizarMarcador(); 

                    setTimeout(function() {
                        primeraCarta.removeClass("volteada").text(""); // Voltear la primera carta
                        segundaCarta.removeClass("volteada").text(""); // Voltear la segunda carta
                        primeraCarta = null; // Reiniciar para nuevas selecciones
                        segundaCarta = null; // Reiniciar para nuevas selecciones
                        bloqueoClick = false; // Desbloquear clics
                    }, 1000); 
                }
            }
        }


        $("#volverMenu").click(function() {
            $("#contenedor-juego").hide();  
            $("#menu-modos").show();  
            $("#tablero").empty();
            $("#marcador").text("Puntos: 0");
        });

        $("#resetear").click(function() {
            generarTablero();
            puntos = 0;
            actualizarMarcador();
        });

        generarTablero();
    }


    function modoContrarreloj() {
        let cartas = [1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6]; 
        let primeraCarta = null;
        let segundaCarta = null;
        let bloqueoClick = false;
        let modo = "Contrarreloj";
        let puntos = 0; 
        let temporizador = 25;
        let intervaloTemporizador;
        actualizarPuntuaciones(modo);
    
        function iniciarTemporizador() {
            $("#temporizador").show();
            
            //temporizador decreciente
            intervaloTemporizador = setInterval(function() {
                temporizador--;
                actualizarTemporizador(); 
                if (temporizador === 0) { 
                    clearInterval(intervaloTemporizador); //Detener temporizador
                    verificarVictoria(); 
                }
            }, 1000);
        }
    
        function detenerTemporizador() {
            clearInterval(intervaloTemporizador);
            temporizador = 25; 
            actualizarTemporizador();
        }
    
        function mezclarCartas(array) {
            for (let i = array.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
    
        function generarTablero() {
            $("#tablero").empty();
            cartas = mezclarCartas(cartas);
    
            cartas.forEach(function(valor) {
                let carta = $('<div class="carta" data-valor="' + valor + '"></div>');
                $("#tablero").append(carta);
            });
    
            $(".carta").click(voltearCarta);
        }
    
        function actualizarMarcador() {
            $("#marcador").text("Puntos: " + puntos.toFixed(1)); 
        }
    
        function actualizarTemporizador() {
            $("#temporizador").text("Temporizador: " + temporizador + " segundos");
        }
    
        function verificarVictoria() {
            if ($(".carta").length === $(".carta.volteada").length) {
                detenerTemporizador(); 
                mostrarIngresoJugador();
                $("#guardarNombre").off("click").click(function() {
                    let nombreJugador = $('#nombreJugador').val();
                    if(nombreJugador){
                        esconderIngresoJugador();
                        agregarPuntuacion(nombreJugador, puntos, modo);
                    }
    
                    puntos = 0;
                    actualizarMarcador();
                    detenerTemporizador();
                    setTimeout(function () {
                        generarTablero();
                        iniciarTemporizador();
                    }, 1500);
                });
            } else if (temporizador === 0 && $(".carta").length !== $(".carta.volteada").length) {
                puntos = 0;
                actualizarMarcador();
                mostrarDerrota();
                setTimeout(function () {
                    esconderDerrota();
                }, 2000);
            }
        }
    
        function voltearCarta() {
            if (bloqueoClick) return; 
            if ($(this).hasClass('volteada') || $(this).hasClass('emparejada')) return; 
    
            if (!primeraCarta) {
                primeraCarta = $(this);
                primeraCarta.addClass("volteada");
                primeraCarta.text(primeraCarta.data("valor")); 
            } else if (!segundaCarta) {
                segundaCarta = $(this);
                segundaCarta.addClass("volteada");
                segundaCarta.text(segundaCarta.data("valor")); 
    
                bloqueoClick = true;
    
                if (primeraCarta.data("valor") === segundaCarta.data("valor")) {
                    puntos += 1;
                    actualizarMarcador(); 
                    verificarVictoria();
    
                    primeraCarta.addClass("emparejada");
                    segundaCarta.addClass("emparejada");
    
                    primeraCarta = null;
                    segundaCarta = null;
                    bloqueoClick = false;
                } else {
                    puntos -= 0.2;
                    actualizarMarcador(); 
    
                    setTimeout(function() {
                        primeraCarta.removeClass("volteada").text("");
                        segundaCarta.removeClass("volteada").text("");
                        primeraCarta = null;
                        segundaCarta = null;
                        bloqueoClick = false;
                    }, 1000);
                }
            }
        }
        
        $("#volverMenu").click(function() {
            $("#contenedor-juego").hide();  
            $("#menu-modos").show();  
    
            detenerTemporizador(); 
            puntos = 0; 
            actualizarMarcador(); 
            $("#tablero").empty(); 
        });

        $("#resetear").click(function() {
            detenerTemporizador(); 
            generarTablero(); 
            puntos = 0;
            actualizarMarcador(); 
        });
    
        iniciarTemporizador(); 
        generarTablero(); 
    }

    function modoVidas() {
        let cartas = [1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6]; 
        let primeraCarta = null;
        let segundaCarta = null;
        let bloqueoClick = false; 
        let modo = "Vidas";
        let puntos = 0; 
        let vidas = 6; 
        actualizarPuntuaciones(modo);

        $("#vidas").show();

        function mezclarCartas(array) {
            for (let i = array.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        function generarTablero() {
            $("#tablero").empty();
            cartas = mezclarCartas(cartas);

            cartas.forEach(function(valor) {
                let carta = $('<div class="carta" data-valor="' + valor + '"></div>');
                $("#tablero").append(carta);
            });

            $(".carta").click(voltearCarta);
        }

        function actualizarMarcador() {
            $("#marcador").text("Puntos: " + puntos.toFixed(1)); 
        }
        

        function actualizarVidas() {
            $("#vidas").text("Vidas: " + vidas);
        }

        function verificarVictoria() {
            if ($(".carta").length === $(".carta.volteada").length && vidas > 0) {
                mostrarIngresoJugador();
                $("#guardarNombre").off("click").click(function() {
                    let nombreJugador = $('#nombreJugador').val();
                    if(nombreJugador){
                        esconderIngresoJugador();
                        agregarPuntuacion(nombreJugador, puntos, modo);
                    }

                    puntos = 0;
                    vidas = 6;
                    actualizarMarcador();
                    actualizarVidas();
                    setTimeout(function () {
                        generarTablero();
                    }, 1500);
                });
            }else if(vidas <= 0){
                puntos = 0;
                actualizarMarcador();
                mostrarDerrota();
                setTimeout(function () {
                    esconderDerrota();
                }, 2000);
            }
        }


        function voltearCarta() {
            if (bloqueoClick) return; 
            if ($("#carta").hasClass('volteada')){
                $("#contenedor-juego").hide();

            }
            if ($(this).hasClass('volteada') || $(this).hasClass('emparejada')) return; 

            if (!primeraCarta) {
                primeraCarta = $(this);
                primeraCarta.addClass("volteada"); 
                primeraCarta.text(primeraCarta.data("valor")); 
            } else if (!segundaCarta) {
                segundaCarta = $(this);
                segundaCarta.addClass("volteada"); 
                segundaCarta.text(segundaCarta.data("valor")); 

                bloqueoClick = true;

                if (primeraCarta.data("valor") === segundaCarta.data("valor")) {
                    console.log("¡Pareja encontrada!");
                    puntos += 1;
                    actualizarMarcador(); 
                    verificarVictoria();

                    primeraCarta.addClass("emparejada");
                    segundaCarta.addClass("emparejada");

                    primeraCarta = null;
                    segundaCarta = null;
                    bloqueoClick = false;
                } else {
                    puntos -= 0.2;
                    vidas -= 1;
                    actualizarMarcador(); 
                    actualizarVidas();
                    verificarVictoria();

                    setTimeout(function() {
                        primeraCarta.removeClass("volteada").text(""); 
                        segundaCarta.removeClass("volteada").text(""); 
                        primeraCarta = null; 
                        segundaCarta = null; 
                        bloqueoClick = false; 
                    }, 1000); 
                }
            }
        }


        $("#volverMenu").click(function() {
            $("#contenedor-juego").hide();  
            $("#menu-modos").show();  
            puntos = 0;
            vidas = 6;
            actualizarMarcador();
            actualizarVidas();
            $("#tablero").empty();
        });

        $("#resetear").click(function() {
            generarTablero(); 
            puntos = 0; 
            vidas = 6;
            actualizarMarcador(); 
            actualizarVidas();
        });

        generarTablero();
    }
});
