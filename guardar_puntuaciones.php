<?php
// Leer el contenido de la solicitud
$json = file_get_contents('php://input');
$datos = json_decode($json, true);

// Extraer los datos de la puntuación
$nombre = $datos['nombre'];
$puntos = $datos['puntos'];
$modo = $datos['modo'];

// Leer el archivo JSON existente o crear una estructura nueva si no existe
$filePath = 'ranking.json';
if (file_exists($filePath)) {
    $puntuaciones = json_decode(file_get_contents($filePath), true);
} else {
    $puntuaciones = [];
}

// Asegurarse de que existe un array para el modo actual
if (!isset($puntuaciones[$modo])) {
    $puntuaciones[$modo] = [];
}

// Agregar la nueva puntuación
$puntuaciones[$modo][] = [
    'nombre' => $nombre, 
    'puntos' => $puntos
];

// Guardar el archivo JSON actualizado
file_put_contents($filePath, json_encode($puntuaciones, JSON_PRETTY_PRINT));
?>
