const { Router } = require("express");
const router = Router();

const fs = require("fs");

class Contenedor {
  constructor(archivo) {
    this.archivo = archivo;
    this.productos = [];
  }

  async save(objeto) {
    let obj = objeto;
    let archivo = fs.readFile(`./${this.archivo}`, "utf-8", (err, res) => {
      if (err) {
        obj.id = this.productos.length + 1;
        this.productos.push(obj);
        fs.promises.writeFile(
          `./${this.archivo}`,
          JSON.stringify(this.productos)
        );
        console.log(`Archivo creado y objeto agregado con numero ${obj.id}`);
      } else {
        let data = JSON.parse(res);
        obj.id = data.length + 1;
        data.push(obj);
        this.productos = data;
        fs.promises.writeFile(
          `./${this.archivo}`,
          JSON.stringify(this.productos)
        );
        console.log(`Nuevo objeto agregado con ID: ${obj.id}`);
      }
    });
  }

  async getById(id) {
    try {
      let arch = JSON.parse(
        await fs.promises.readFile(`./${this.archivo}`, "utf-8")
      );
      let obj = await arch.filter((e) => e.id == id);
      //   console.log(obj);
      if (obj[0].id != id) {
        return null;
      } else {
        return obj[0];
      }
    } catch (error) {
      console.log("No existe el objeto");

      return null;
    }
  }

  async getAll() {
    try {
      let data = await fs.promises.readFile(`./${this.archivo}`, "utf-8");
      let obj = JSON.parse(data);
      if (obj.length <= 0) {
        return 0;
      } else {
        return obj;
      }
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  }

  async deleteById(id) {
    try {
      this.productos = await this.getAll().then((res) => {
        return res;
      });
      let objBorrado = this.productos.filter((e) => e.id == id);

      let obj = this.productos.filter((e) => e.id != id);
      let arrNew = obj;
      if (objBorrado) {
        await fs.promises.writeFile(
          `./${this.archivo}`,
          JSON.stringify(arrNew)
        );
      } else {
        console.log("No existe el objeto");
      }
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  }

  async deleteAll() {
    this.productos = await this.getAll().then((res) => {
      return res;
    });

    this.productos = [];
    await fs.promises.writeFile(
      `./${this.archivo}`,
      JSON.stringify(this.productos)
    );
  }
}

const carrito = new Contenedor("carrito.json");

router.post("/", async (req, res) => {
  let todo = await carrito.getAll();
  let id = todo + 1;

  const carritoObj = { id: id, timestamp: Date.now(), productos: [] };
  carrito.save(carritoObj);
  console.log(carrito);
  res.sendStatus(201);
});

router.delete("/:id", async (req, res) => {
  let id = req.params.id;
  try {
    await carrito.deleteById(id).then((res) => {
      return res;
    });
    res.sendStatus(201);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
});

router.get("/:id/productos", async (req, res) => {
  let id = req.params.id;
  let carritoBuscado = await carrito.getById(id).then((res) => {
    return res;
  });

  //   res.send(carritoBuscado)
  try {
    if (carritoBuscado) {
      res.json(carritoBuscado.productos);
    }
  } catch (error) {
    console.log(`Error: ${error}`);
  }
});

router.post("/:id/productos", async (req, res) => {
  let id = req.params.id;

  const idProd = req.body.id;
  let carritoBuscado = await carrito.getById(id).then((res) => {
    return res;
  });

  let data = await fs.promises.readFile(`./productos.json`, "utf-8");

  let prod = JSON.parse(data);

  let productoCompra = prod.filter((e) => {
    return e.id == idProd;
  });

  if (productoCompra[0] == undefined) {
    res.sendStatus(404);
  } else {
    let todo = await carrito.getAll();

    let carritoCompra = todo.filter((e) => e.id == id);

    let nuevo = todo.filter((e) => e.id != id);

    carritoCompra[0].productos.push(productoCompra[0]);

    nuevo.push(carritoCompra[0]);

    console.log("despues", nuevo);
    fs.promises.writeFile(`./carrito.json`, JSON.stringify(nuevo));

    res.sendStatus(201);
  }
});

router.delete("/:id/productos/:id_prod", async (req, res) => {
  let id = req.params.id;

  const idProd = req.params.id_prod;
  let carritoBuscado = await carrito.getById(id).then((res) => {
    return res;
  });

  let todo = await carrito.getAll();

  let carritoCompra = await carrito.getById(id);
  if (carritoCompra == null) {
    res.sendStatus(404);
  } else {
    let carritoProductos = carritoCompra.productos;
    let prodEliminado = carritoProductos.filter((e) => {
      return e.id == idProd;
    });

    console.log(prodEliminado);
    if (prodEliminado.length <= 0) {
      res.sendStatus(404);
    } else {
      let prodModificado = carritoProductos.filter((e) => {
        return e.id != idProd;
      });

      let nuevo = todo.filter((e) => e.id != id);

      carritoCompra.productos = prodModificado;

      nuevo.push(carritoCompra);

      console.log("despues", nuevo);
      fs.promises.writeFile(`./carrito.json`, JSON.stringify(nuevo));

      res.sendStatus(201);
    }
  }
});

module.exports = router;
