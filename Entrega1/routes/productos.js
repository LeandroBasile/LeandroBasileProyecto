const fs = require("fs");
const { Router } = require("express");
const router = Router();

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
      let obj = arch.filter((e) => e.id == id);

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
        return console.log("Array Vacio");
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

const productos = new Contenedor("productos.json");

const checkAdmin = (admin) => {
  return (req, res, next) => {
    if (admin === true) {
      next();
    } else {
      res.json({
        error: -1,
        descripcion: `Ruta '${req.route.path}' Método '${req.route.stack[0].method}' - No Autorizada`,
      });
    }
  };
};

const admin = true;
let check = checkAdmin(admin);

router.get("/", async (req, res) => {
  try {
    let todosLosProductos = await productos.getAll();
    res.json(todosLosProductos);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
});

router.post("/", check, async (req, res) => {
  let title = req.body.title;
  let timestamp = Date.now();
  let descripcion = req.body.descripcion;
  let codigo = req.body.codigo;
  let price = req.body.price;
  let thumbnail = req.body.thumbnail;
  let stock = req.body.stock;

  let obj = { timestamp, title, descripcion, codigo, thumbnail, price, stock };
  try {
    await productos.save(obj).then((res) => {
      return res;
    });
    console.log("creado");
  } catch (error) {
    console.log(`Error: ${error}`);
  }
  res.sendStatus(201);
});

router.put("/:id", check, async (req, res) => {
  let id = Number(req.params.id);
  let newTitle = req.body.title;
  let newTimestamp = Date.now();
  let newDescripcion = req.body.descripcion;
  let newCodigo = req.body.codigo;
  let newPrice = req.body.price;
  let newThumbnail = req.body.thumbnail;
  let newStock = req.body.stock;
  let todo = await productos.getAll().then((res) => {
    return res;
  });
  let productoBuscado = await productos.getById(id).then((res) => {
    return res;
  });
  
  let title = (productoBuscado.title = newTitle);
  let price = (productoBuscado.price = newPrice);
  let thumbnail = (productoBuscado.thumbnail = newThumbnail);
  let descripcion = (productoBuscado.descripcion = newDescripcion)
  let timestamp = (productoBuscado.timestamp = newTimestamp)
  let codigo = (productoBuscado.codigo = newCodigo)
  let stock = (productoBuscado.stock = newStock)
  
  productoBuscado = { timestamp, title, descripcion, codigo, thumbnail, price, stock,id };
  try {

    const indiceEncontrado = todo.findIndex((producto) => {
      return producto.id === id;
    });
    if (indiceEncontrado === -1) {
      return;
    } else {
      todo[indiceEncontrado] = productoBuscado;
      fs.writeFileSync(`./${productos.archivo}`, JSON.stringify(todo));
    }

    res.json(201);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
});

router.get("/:id", check, async (req, res) => {
  let id = req.params.id;
  let productoBuscado = await productos.getById(id).then((res) => {
    return res;
  });

  try {
    if (productoBuscado) {
      res.json(productoBuscado);
    } else if (productoBuscado === null) {
      let todo = await productos.getAll().then((res) => {
        return res;
      });
      res.json(todo);
    }
  } catch (error) {
    console.log(`Error: ${error}`);
  }
});



router.delete("/:id", async (req, res) => {
  let id = req.params.id;
  try {
    await productos.deleteById(id).then((res) => {
      return res;
    });
    res.sendStatus(201);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
});

module.exports = router;
