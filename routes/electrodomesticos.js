const express = require('express');
const multer = require('multer');
const router = express.Router();
const db = require('../config/database');
const path = require('path');

router.get('/', (req, res) => {
  res.render('index');
});

// Ruta para crear un producto
router.get('/create', async (req, res) => {
  try {
    const [categorias] = await db.query('SELECT * FROM categorias');
    res.render('create', { categorias });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Configuracion del Multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

// Ruta para guardar el producto creado
router.post('/create', upload.single('imagen'), async (req, res) => {
  const {
    nombre, precio, color, alto, ancho,
    marca, modelo, descripcion, stock, idcategoria
  } = req.body;

  const imagen_url = '/uploads/' + req.file.filename;

  try {
    await db.query(`
      INSERT INTO electrodomesticos
      (nombre, precio, color, alto, ancho, marca, modelo, descripcion, stock, imagen_url, idcategoria)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [nombre, precio, color, alto, ancho, marca, modelo, descripcion, stock, imagen_url, idcategoria]);

    res.redirect('/listar');
  } catch (error) {
    console.error('Error al registrar el producto:', error);
    res.status(500).send('Error al guardar producto');
  }
});

// Ruta para listar productos con filtros
router.get('/listar', async (req, res) => {
    const { categoria, precio, buscador } = req.query; // Recibe filtros desde la URL
  
    let query = `
      SELECT e.*, c.nombre AS categoria
      FROM electrodomesticos e
      LEFT JOIN categorias c ON e.idcategoria = c.idcategoria
      WHERE 1=1
    `;
    const queryParams = [];
  
    // Filtrar por categoría
    if (categoria) {
      query += ' AND e.idcategoria = ?';
      queryParams.push(categoria);
    }
  
    // Filtrar por precio (rango de precio)
    if (precio) {
      if (precio === '500+') {
        query += ' AND e.precio >= ?';
        queryParams.push(500);
      } else {
        const [minPrice, maxPrice] = precio.split('-').map(parseFloat);
        query += ' AND e.precio BETWEEN ? AND ?';
        queryParams.push(minPrice, maxPrice);
      }
    }
  
    // Filtrar por nombre del producto (buscador)
    if (buscador) {
      query += ' AND e.nombre LIKE ?';
      queryParams.push(`%${buscador}%`);
    }
  
    try {
      // Ejecutamos la consulta con los parámetros
      const [productos] = await db.query(query, queryParams);
      const [categorias] = await db.query('SELECT * FROM categorias');
  
      // Renderizamos la vista con los productos y los filtros
      res.render('listar', { productos, categorias, categoria, precio, buscador });
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).send('Error al listar productos');
    }
  });
  

module.exports = router;
