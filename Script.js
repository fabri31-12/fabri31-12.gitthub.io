const car = document.getElementById('car');
const gameArea = document.getElementById('gameArea');
const pointsDisplay = document.getElementById('pointsDisplay'); // Contenedor donde se mostrarán los puntos

let posX, posY;
let angle = 0;
let driftMode = false;
let currentSpeed = 0;
const maxSpeed = 4;
const driftSpeed = 3;
const acceleration = 0.1;
const deceleration = 0.05;
const activeKeys = new Set();

let driftPoints = 0; // Puntos acumulados
let driftStartTime = 0; // Tiempo de inicio del drift

// Función para resetear el juego
function resetGame() {
    // Calcular la posición inicial centrada en el área de juego
    const gameRect = gameArea.getBoundingClientRect();
    posX = gameRect.width / 2 - car.offsetWidth / 2;  // Centrado en el eje X
    posY = gameRect.height / 2 - car.offsetHeight / 2; // Centrado en el eje Y

    angle = 0;   // Reiniciar ángulo
    currentSpeed = 0;  // Reiniciar velocidad
    driftPoints = 0;   // Reiniciar puntos
    driftMode = false; // Desactivar drift
    pointsDisplay.textContent = `Puntos: ${driftPoints}`; // Actualizar puntos en pantalla
    driftStartTime = 0; // Reiniciar el tiempo de drift
}

// Función de detección de colisiones con los bordes de la pista y con bloques
function checkCollision() {
    const carRect = car.getBoundingClientRect();
    const gameRect = gameArea.getBoundingClientRect();

    // Colisión con los bordes del área del juego
    if (
        carRect.left < gameRect.left ||
        carRect.right > gameRect.right ||
        carRect.top < gameRect.top ||
        carRect.bottom > gameRect.bottom
    ) {
        return true;
    }

    if (driftPoints >= 50) {
        // Espera de 2 segundos antes de redirigir
        setTimeout(() => {
            window.location.href = 'Mapas.html'; 
        }, 2000); // 2000 milisegundos = 2 segundos
    }    

    // Colisión con los obstáculos circulares
    const obstacles = document.querySelectorAll('.obstacle.circular');
    for (const obstacle of obstacles) {
        const obstacleRect = obstacle.getBoundingClientRect();
        const obstacleCenterX = obstacleRect.left + obstacleRect.width / 2;
        const obstacleCenterY = obstacleRect.top + obstacleRect.height / 2;
        const carCenterX = carRect.left + carRect.width / 2;
        const carCenterY = carRect.top + carRect.height / 2;

        const dx = carCenterX - obstacleCenterX;
        const dy = carCenterY - obstacleCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Compara la distancia con el radio de los obstáculos
        const obstacleRadius = obstacleRect.width / 2;
        const carRadius = carRect.width / 2;

        if (distance < obstacleRadius + carRadius) {
            return true; // Colisión detectada
        }
    }

    return false; // No hay colisión
}

// Eventos de teclado para activar/desactivar el drift
document.addEventListener('keydown', (event) => {
    activeKeys.add(event.key.toLowerCase());

    if (event.key === 'Shift') {
        driftMode = true; // Activa drift
        driftStartTime = Date.now(); // Guarda el tiempo de inicio
    }
});

document.addEventListener('keyup', (event) => {
    activeKeys.delete(event.key.toLowerCase());

    if (event.key === 'Shift') {
        driftMode = false; // Desactiva drift
    }
});

// Función para actualizar el movimiento del auto
function update() {
    // Contador de puntos mientras está en drift y se presiona "W"
    if (driftMode && activeKeys.has('w')) {
        const driftDuration = (Date.now() - driftStartTime) / 1000; // Duración del drift en segundos
        driftPoints = Math.floor(driftDuration); // Cada segundo de drift incrementa los puntos
        pointsDisplay.textContent = `Puntos: ${driftPoints}`; // Actualiza los puntos en pantalla
    }

    if (!driftMode) {
        // Modo normal
        if (activeKeys.has('w')) {
            currentSpeed = Math.min(currentSpeed + acceleration, maxSpeed);
        } else if (activeKeys.has('s')) {
            currentSpeed = Math.max(currentSpeed - acceleration, -maxSpeed);
        } else {
            if (currentSpeed > 0) {
                currentSpeed = Math.max(currentSpeed - deceleration, 0);
            } else if (currentSpeed < 0) {
                currentSpeed = Math.min(currentSpeed + deceleration, 0);
            }
        }

        // Rotación normal con "A" y "D"
        if (activeKeys.has('a')) {
            angle -= 2;
        }
        if (activeKeys.has('d')) {
            angle += 2;
        }
    } else {
        // Modo drift (W se mueve a la derecha)
        if (activeKeys.has('w')) {
            currentSpeed = Math.min(currentSpeed + acceleration, driftSpeed);
        } else if (activeKeys.has('s')) {
            currentSpeed = Math.max(currentSpeed - acceleration, -driftSpeed);
        } else {
            if (currentSpeed > 0) {
                currentSpeed = Math.max(currentSpeed - deceleration, 0);
            } else if (currentSpeed < 0) {
                currentSpeed = Math.min(currentSpeed + deceleration, 0);
            }
        }

        // En modo drift, "A" y "D" rotan el auto
        if (activeKeys.has('a')) {
            angle -= 3;
        }
        if (activeKeys.has('d')) {
            angle += 3;
        }
    }

    // Mueve el auto
    moveCar(currentSpeed);

    // Si hay colisión, reinicia el juego
    if (checkCollision()) {
        resetGame();
    }

    // Actualiza la posición y rotación del auto en la pantalla
    updateCarPosition();

    requestAnimationFrame(update);
}

// Función para mover el auto según la velocidad y modo drift
function moveCar(step) {
    const rad = (angle * Math.PI) / 180;
    const prevPosX = posX;
    const prevPosY = posY;

    // Si driftMode es true, "W" mueve a la derecha en lugar de hacia adelante
    if (driftMode) {
        posX += Math.cos(rad) * step;
        posY += Math.sin(rad) * step;
    } else {
        posX += Math.sin(rad) * step;
        posY -= Math.cos(rad) * step;
    }

    // Si hay colisión, vuelve a la posición anterior
    if (checkCollision()) {
        posX = prevPosX;
        posY = prevPosY;
    }
}

// Función para aplicar la posición y rotación al auto en pantalla
function updateCarPosition() {
    car.style.transform = `translate(${posX}px, ${posY}px) rotate(${angle}deg)`;
}

// Inicia el bucle de actualización
resetGame();  // Posiciona el auto en el centro al cargar la página
update();
