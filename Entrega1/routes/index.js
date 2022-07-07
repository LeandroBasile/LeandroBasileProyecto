const { Router } = require("express");
const producto =require('./productos')
const carrito =require('./carrito')

const router = Router();

router.use('/productos',producto)
router.use('/carrito',carrito)


module.exports = router;
