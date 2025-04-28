const express = require('express');
const bodyParser = require('body-parser')
const path = require('path')

const app = express();
const PORT = process.env.PORT || 3000

//Configuracion "middleware" => Capa de comunicacion
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.render('index'); 
});

app.get('/create', (req, res) => {
  res.render('create'); 
});

app.get('/listar', (req, res) => {
  res.render('listar'); 
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
