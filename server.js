const express = require('express');
require('dotenv').config();

const pool = require('./config/database');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Ruta principal
app.get('/api', (req, res) => {
    res.json({
        mensaje: 'Bienvenido a Librety',
        sistema: 'API REST de Librería',
        estado: 'Funcionando correctamente'
    });
});

// Comprobar conexión con PostgreSQL
app.get('/api/test-db', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT NOW() AS fecha');

        res.json({
            mensaje: 'Conexión exitosa con PostgreSQL',
            fecha: resultado.rows[0].fecha
        });
    } catch (error) {
        console.error('Error de PostgreSQL:', error.message);

        res.status(500).json({
            mensaje: 'Error al conectar con PostgreSQL'
        });
    }
});

// Obtener todos los libros
app.get('/api/libros', async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT * FROM libros ORDER BY id DESC'
        );

        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al consultar libros:', error.message);

        res.status(500).json({
            mensaje: 'Error al obtener los libros'
        });
    }
});



// Registrar un nuevo libro
app.post('/api/libros', async (req, res) => {
    try {
        const { titulo, autor, precio, stock } = req.body;

        if (
            typeof titulo !== 'string' || !titulo.trim() ||
            typeof autor !== 'string' || !autor.trim() ||
            typeof precio !== 'number' || !Number.isFinite(precio) || precio < 0 ||
            !Number.isInteger(stock) || stock < 0
        ) {
            return res.status(400).json({
                mensaje: 'Datos inválidos. Verifica título, autor, precio y stock.'
            });
        }

        const resultado = await pool.query(
            `INSERT INTO libros (titulo, autor, precio, stock)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [titulo.trim(), autor.trim(), precio, stock]
        );

        res.status(201).json({
            mensaje: 'Libro registrado correctamente',
            libro: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error al registrar libro:', error.message);

        res.status(500).json({
            mensaje: 'Error al registrar el libro'
        });
    }
});

// Actualizar un libro
app.put('/api/libros/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { titulo, autor, precio, stock } = req.body;

        if (
            !Number.isInteger(id) || id <= 0 ||
            typeof titulo !== 'string' || !titulo.trim() ||
            typeof autor !== 'string' || !autor.trim() ||
            typeof precio !== 'number' || !Number.isFinite(precio) || precio < 0 ||
            !Number.isInteger(stock) || stock < 0
        ) {
            return res.status(400).json({
                mensaje: 'Datos inválidos'
            });
        }

        const resultado = await pool.query(
            `UPDATE libros
             SET titulo = $1, autor = $2, precio = $3, stock = $4
             WHERE id = $5
             RETURNING *`,
            [titulo.trim(), autor.trim(), precio, stock, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Libro no encontrado'
            });
        }

        res.json({
            mensaje: 'Libro actualizado correctamente',
            libro: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error al actualizar:', error.message);
        res.status(500).json({
            mensaje: 'Error al actualizar el libro'
        });
    }
});

// Eliminar un libro
app.delete('/api/libros/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'ID inválido'
            });
        }

        const resultado = await pool.query(
            'DELETE FROM libros WHERE id = $1 RETURNING *',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Libro no encontrado'
            });
        }

        res.json({
            mensaje: 'Libro eliminado correctamente',
            libro: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error al eliminar:', error.message);
        res.status(500).json({
            mensaje: 'Error al eliminar el libro'
        });
    }
});

// Obtener un libro por su ID
app.get('/api/libros/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: 'ID inválido'
            });
        }

        const resultado = await pool.query(
            'SELECT * FROM libros WHERE id = $1',
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Libro no encontrado'
            });
        }

        res.json(resultado.rows[0]);

    } catch (error) {
        console.error('Error al buscar libro:', error.message);

        res.status(500).json({
            mensaje: 'Error al consultar el libro'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor Librety ejecutándose en http://localhost:${PORT}`);
});