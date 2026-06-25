import express from 'express';
import pool from '../db.js';

const router = express.Router();

// POST /api/sales
router.post('/', async (req, res) => {
    const { cliente, estado, numeros, abono } = req.body;
    
    if (!cliente || !estado || !numeros || numeros.length !== 2) {
        return res.status(400).json({ error: 'Debes seleccionar exactamente 2 números' });
    }

    if (estado === 'abonado' && (!abono || abono <= 0)) {
        return res.status(400).json({ error: 'Debes especificar el monto abonado' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [check] = await connection.query(
            'SELECT numero FROM numbers WHERE numero IN (?, ?) AND sale_id IS NULL',
            numeros
        );
        if (check.length !== 2) {
            throw new Error('Uno o ambos números no están disponibles');
        }

        const [result] = await connection.query(
            'INSERT INTO sales (cliente, estado, abono) VALUES (?, ?, ?)',
            [cliente, estado, abono || null]
        );
        const saleId = result.insertId;

        await connection.query(
            'UPDATE numbers SET sale_id = ? WHERE numero IN (?, ?)',
            [saleId, numeros[0], numeros[1]]
        );

        await connection.commit();
        res.status(201).json({ message: 'Venta creada', saleId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// PUT /api/sales/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { estado, abono } = req.body;
    
    if (!estado) {
        return res.status(400).json({ error: 'Estado requerido' });
    }

    if (estado === 'abonado' && (!abono || abono <= 0)) {
        return res.status(400).json({ error: 'Debes especificar el monto abonado' });
    }

    try {
        const query = abono !== undefined 
            ? 'UPDATE sales SET estado = ?, abono = ? WHERE id = ?'
            : 'UPDATE sales SET estado = ? WHERE id = ?';
        
        const params = abono !== undefined 
            ? [estado, abono, id]
            : [estado, id];

        await pool.query(query, params);
        res.json({ message: 'Estado actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;