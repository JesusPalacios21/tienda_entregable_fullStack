CREATE DATABASE IF NOT EXISTS tienda;
USE tienda;

CREATE TABLE categorias (
  idcategoria 		INT AUTO_INCREMENT PRIMARY KEY,
  nombre 			VARCHAR(50) NOT NULL
);

CREATE TABLE electrodomesticos (
  idelectrodomestico 	INT AUTO_INCREMENT PRIMARY KEY,
  nombre 				VARCHAR(100) NOT NULL,
  precio 				DECIMAL(10,2) NOT NULL,
  color 				VARCHAR(30) NOT NULL,
  alto 					DECIMAL(5,2) NOT NULL,   
  ancho 				DECIMAL(5,2) NOT NULL,  
  marca 				VARCHAR(50) NOT NULL,
  modelo 				VARCHAR(50) NOT NULL,
  descripcion 			TEXT,
  stock 				INT DEFAULT 0,
  imagen_url 			VARCHAR(255),
  idcategoria 			INT,
  FOREIGN KEY (idcategoria) REFERENCES categorias(idcategoria)
);


INSERT INTO categorias (nombre) VALUES
('REFRIGERADORAS'),
('LICUADORAS'),
('LAVADORAS');
