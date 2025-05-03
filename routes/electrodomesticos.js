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
  


  // Mostrar formulario para editar un producto
  router.get('/producto/actualizar/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const [categorias] = await db.query('SELECT * FROM categorias');
      const [resultados] = await db.query('SELECT * FROM electrodomesticos WHERE idelectrodomestico = ?', [id]);  // Cambié 'id' por 'idelectrodomestico'
  
      if (resultados.length === 0) {
        return res.status(404).send('Producto no encontrado');
      }
  
      const producto = resultados[0];
      res.render('edit', { producto, categorias });
    } catch (error) {
      console.error('Error al cargar producto para editar:', error);
      res.status(500).send('Error interno del servidor');
    }
  });
  

// Guardar cambios del producto
router.post('/producto/actualizar/:id', upload.single('imagen'), async (req, res) => {
  const { id } = req.params;
  const {
    nombre, precio, color, alto, ancho,
    marca, modelo, descripcion, stock, idcategoria
  } = req.body;

  let query, params;
  let imagen_url = null;

  // Si se sube una nueva imagen
  if (req.file) {
    imagen_url = '/uploads/' + req.file.filename;
  } else {
    // Si no se sube una nueva imagen, mantenemos la imagen actual
    const [productoActual] = await db.query('SELECT imagen_url FROM electrodomesticos WHERE idelectrodomestico = ?', [id]);
    imagen_url = productoActual[0]?.imagen_url || '';  // Si no existe, asignamos un valor vacío
  }

  query = `
    UPDATE electrodomesticos SET
      nombre = ?, precio = ?, color = ?, alto = ?, ancho = ?,
      marca = ?, modelo = ?, descripcion = ?, stock = ?, imagen_url = ?, idcategoria = ?
    WHERE idelectrodomestico = ?
  `;

  params = [nombre, precio, color, alto, ancho, marca, modelo, descripcion, stock, imagen_url, idcategoria, id];

  try {
    await db.query(query, params);
    res.redirect('/listar');
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).send('Error al actualizar producto');
  }
});


// Ruta para eliminar un producto
router.get('/producto/eliminar/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Eliminar el producto de la base de datos
    await db.query('DELETE FROM electrodomesticos WHERE idelectrodomestico = ?', [id]);

    // Redirigir a la lista de productos
    res.redirect('/listar');
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).send('Error al eliminar producto');
  }
});



module.exports = router;
