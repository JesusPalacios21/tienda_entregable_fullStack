const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const electrodomesticosRoutes = require('./routes/electrodomesticos');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración del motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/', electrodomesticosRoutes);

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
