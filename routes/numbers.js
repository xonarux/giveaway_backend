import express from 'express';
import pool from '../db.js'; // ← OJO: con extensión .js

const router = express.Router();

// GET /api/numbers
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT n.numero, n.sale_id, s.cliente, s.estado, s.abono
            FROM numbers n
            LEFT JOIN sales s ON n.sale_id = s.id
            ORDER BY n.numero
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;