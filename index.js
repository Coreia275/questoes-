import express from "express";
import banco from "./banco.js";
import editora from "./controller/EditoraController.js";
import autor from "./controller/AutorController.js";
import categoria from "./controller/CategoriaController.js";
import livro from "./controller/LivroController.js";
import usuario from "./controller/UsuarioController.js";
import emprestimo from "./controller/EmprestimoController.js";
import funcionario from "./controller/funcionarioController.js"; 

try {
    await banco.authenticate();
    console.log('Conexão com o banco de dados realizada com sucesso.');
} catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
}

const app = express();
app.use(express.json());

app.get('/teste', (req, res) => {
    res.send('Teste ok.');
});

app.get('/editora', editora.listar);
app.get('/editora/:id', editora.selecionar);
app.post('/editora', editora.inserir);
app.put('/editora/:id', editora.alterar);
app.delete('/editora/:id', editora.excluir);

app.get('/autor', autor.listar);
app.get('/autor/:id', autor.selecionar);
app.post('/autor', autor.inserir);
app.put('/autor/:id', autor.alterar);
app.delete('/autor/:id', autor.excluir);

app.get('/categoria', categoria.listar);
app.get('/categoria/:id', categoria.selecionar);
app.post('/categoria', categoria.inserir);
app.put('/categoria/:id', categoria.alterar);
app.delete('/categoria/:id', categoria.excluir);

app.get('/livro', livro.listar);
app.get('/livro/:id', livro.selecionar);
app.post('/livro', livro.inserir);
app.put('/livro/:id', livro.alterar);
app.delete('/livro/:id', livro.excluir);

app.get('/usuario', usuario.listar);
app.get('/usuario/:id', usuario.selecionar);
app.post('/usuario', usuario.inserir);
app.put('/usuario/:id', usuario.alterar);
app.delete('/usuario/:id', usuario.excluir);
app.put('/usuario/:id/definir-senha', usuario.definirSenha); 

app.get('/emprestimo', emprestimo.listar);
app.get('/emprestimo/:id', emprestimo.selecionar);
app.post('/emprestar', emprestimo.emprestar);
app.put('/devolver/:id', emprestimo.devolver);

app.get('/funcionario', funcionario.listar);
app.get('/funcionario/:id', funcionario.selecionar);
app.post('/funcionario', funcionario.inserir);
app.put('/funcionario/:id', funcionario.alterar);
app.put('/funcionario/:id/demitir', funcionario.demitir); 
app.put('/funcionario/:id/definir-senha', funcionario.definirSenha); 
app.post('/funcionario/login', funcionario.login);

app.listen(3000, () => { console.log(`Servidor rodando.`) });