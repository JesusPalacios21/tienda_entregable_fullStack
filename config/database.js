const mysql = require('mysql2/promise')

//Crear pool de acceso
const pool = mysql.createPool({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: '',
  database: 'tienda'
})

async function testConnection(){
  try{
    const connection = await pool.getConnection();
    console.log("Conexion Exitosa")
    connection.release() //Liberar
  }catch(error){
    console.error("Error: ", error)
  }
}

testConnection();
module.exports = pool;