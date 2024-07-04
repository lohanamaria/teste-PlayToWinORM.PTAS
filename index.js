// Importações de módulos:
require("dotenv").config();
const conn = require("./db/conn");
const express = require("express");
const exphbs = require("express-handlebars");

const Usuario = require("./models/Usuario");
const Cartao = require("./models/Cartao");
const Conquista = require("./models/Conquistas");
const Jogo = require("./models/Jogo");

Jogo.belongsToMany(Usuario, { through: "aquisicoes" });
Usuario.belongsToMany(Jogo, { through: "aquisicoes" });

// Instanciação do servidor:
const app = express();

// Vinculação do Handlebars ao Express:
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");


app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/usuarios", async (req, res) => {
  const usuarios = await Usuario.findAll({ raw: true });

  res.render("usuarios", { usuarios });
});

app.get("/usuarios/novo", (req, res) => {
  res.render("formUsuario");
});

app.post("/usuarios/novo", async (req, res) => {
  const dadosUsuario = {
    nickname: req.body.nickname,
    nome: req.body.nome,
  };

  const usuario = await Usuario.create(dadosUsuario);
  res.send("Usuário inserido sob o id " + usuario.id);
});

app.get("/usuarios/:id/update", async (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = await Usuario.findByPk(id, { raw: true });

  res.render("formUsuario", { usuario });
  // const usuario = Usuario.findOne({
  //   where: { id: id },
  //   raw: true,
  // });
});

app.post("/usuarios/:id/update", async (req, res) => {
  const id = parseInt(req.params.id);

  const dadosUsuario = {
    nickname: req.body.nickname,
    nome: req.body.nome,
  };

  const retorno = await Usuario.update(dadosUsuario, { where: { id: id } });

  if (retorno > 0) {
    res.redirect("/usuarios");
  } else {
    res.send("Erro ao atualizar usuário");
  }
});

app.post("/usuarios/:id/delete", async (req, res) => {
  const id = parseInt(req.params.id);

  const retorno = await Usuario.destroy({ where: { id: id } });

  if (retorno > 0) {
    res.redirect("/usuarios");
  } else {
    res.send("Erro ao excluir usuário");
  }
});

// Rotas para cartões

//Ver cartões do usuário
app.get("/usuarios/:id/cartoes", async (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = await Usuario.findByPk(id, { raw: true });

  const cartoes = await Cartao.findAll({
    raw: true,
    where: { UsuarioId: id },
  });

  res.render("cartoes.handlebars", { usuario, cartoes });
});

//Formulário de cadastro de cartão
app.get("/usuarios/:id/novoCartao", async (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = await Usuario.findByPk(id, { raw: true });

  res.render("formCartao", { usuario });
});

//Cadastro de cartão
app.post("/usuarios/:id/novoCartao", async (req, res) => {
  const id = parseInt(req.params.id);

  const dadosCartao = {
    numero: req.body.numero,
    nome: req.body.nome,
    codSeguranca: req.body.codSeguranca,
    UsuarioId: id,
  };

  await Cartao.create(dadosCartao);

  res.redirect(`/usuarios/${id}/cartoes`);
});

// Rotas para jogos
app.get("/usuarios/:id/jogos", async (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = await Usuario.findByPk(id, { raw: true });

  const jogos = await Jogo.findAll({
    raw: true,
    include: {
      model: Usuario,
      through: { attributes: [] },
      where: { id: id }
    },
  });

  res.render("jogos.handlebars", { usuario, jogos });
});

app.get("/usuarios/:id/novoJogo", async (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = await Usuario.findByPk(id, { raw: true });

  res.render("formJogo", { usuario });
});

app.post("/usuarios/:id/novoJogo", async (req, res) => {
  const id = parseInt(req.params.id);

  const dadosJogo = {
    nome: req.body.nome,
    descricao: req.body.descricao,
    preco: req.body.preco,
  };

  const jogo = await Jogo.create(dadosJogo);

  await jogo.addUsuario(id);
  res.redirect(`/usuarios/${id}/jogos`);
});

// Rotas para conquistas
app.get("/usuarios/:id/conquistas", async (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = await Usuario.findByPk(id, { raw: true });

  const conquistas = await Conquista.findAll({
    raw: true,
    include: {
      model: Usuario,
      through: { attributes: [] },
      where: { id: id }
    },
  });

  res.render("conquistas.handlebars", { usuario, conquistas });
});

app.get("/usuarios/:id/novaConquista", async (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = await Usuario.findByPk(id, { raw: true });

  res.render("formConquista", { usuario });
});

app.post("/usuarios/:id/novaConquista", async (req, res) => {
  const id = parseInt(req.params.id);

  const dadosConquista = {
    nome: req.body.nome,
    descricao: req.body.descricao,
  };

  const conquista = await Conquista.create(dadosConquista);

  await conquista.addUsuario(id);
  res.redirect(`/usuarios/${id}/conquistas`);
});


app.listen(8000, () => {
  console.log("Server rodando!");
});

conn
  .sync()
  .then(() => {
    console.log("Conectado e sincronizado com o banco de dados!");
  })
  .catch((err) => {
    console.log("Ocorreu um erro: " + err);
  });

// conn
//   .authenticate()
//   .then(() => {
//     console.log("Conectado ao banco de dados com sucesso!");
//   })
//   .catch((err) => {
//     console.log("Ocorreu um erro: " + err);
//   });
