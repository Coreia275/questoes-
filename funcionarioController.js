import bcrypt from 'bcrypt';
import Funcionario from "../model/funcionarioModel.js";

const FuncionarioController = {
  async listarTodos(req, res) {
    try {
      const funcionarios = await Funcionario.findAll();
      res.json(funcionarios);
    } catch (erro) {
      console.error('Erro ao listar funcionários:', erro);
      res.status(500).json({ mensagem: 'Falha ao buscar funcionários' });
    }
  },

  async buscarPorId(req, res) {
    const { id } = req.params;
    
    try {
      const funcionario = await Funcionario.findByPk(id);
      
      if (!funcionario) {
        return res.status(404).json({ mensagem: 'Funcionário não encontrado' });
      }
      
      res.json(funcionario);
    } catch (erro) {
      console.error(`Erro ao buscar funcionário ID ${id}:`, erro);
      res.status(500).json({ mensagem: 'Erro ao buscar funcionário' });
    }
  },

  async cadastrar(req, res) {
    const camposObrigatorios = ['nomefuncionario', 'email', 'salario', 'datacontratacao'];
    const camposFaltantes = camposObrigatorios.filter(campo => !req.body[campo]);

    if (camposFaltantes.length > 0) {
      return res.status(400).json({ 
        mensagem: 'Dados incompletos', 
        camposFaltantes 
      });
    }

    try {
      const novoFuncionario = await Funcionario.create(req.body);
      res.status(201).json({
        mensagem: 'Funcionário cadastrado com sucesso',
        dados: novoFuncionario
      });
    } catch (erro) {
      console.error('Erro ao cadastrar funcionário:', erro);
      res.status(500).json({ mensagem: 'Falha ao cadastrar funcionário' });
    }
  },

  async atualizar(req, res) {
    const { id } = req.params;
    const camposObrigatorios = ['nomefuncionario', 'email', 'salario', 'datacontratacao'];
    const camposFaltantes = camposObrigatorios.filter(campo => !req.body[campo]);

    if (camposFaltantes.length > 0) {
      return res.status(400).json({ 
        mensagem: 'Dados incompletos', 
        camposFaltantes 
      });
    }

    try {
      const [atualizado] = await Funcionario.update(req.body, {
        where: { idfuncionario: id }
      });
      
      if (!atualizado) {
        return res.status(404).json({ mensagem: 'Funcionário não encontrado' });
      }
      
      const dadosAtualizados = await Funcionario.findByPk(id);
      res.json({
        mensagem: 'Funcionário atualizado',
        dados: dadosAtualizados
      });
    } catch (erro) {
      console.error(`Erro ao atualizar funcionário ID ${id}:`, erro);
      res.status(500).json({ mensagem: 'Falha ao atualizar funcionário' });
    }
  },

  async registrarDemissao(req, res) {
    const { id } = req.params;
    const { datademissao } = req.body;

    if (!datademissao) {
      return res.status(400).json({ mensagem: 'Data de demissão é obrigatória' });
    }

    try {
      const funcionario = await Funcionario.findByPk(id);
      
      if (!funcionario) {
        return res.status(404).json({ mensagem: 'Funcionário não encontrado' });
      }
      
      if (funcionario.datademissao) {
        return res.status(400).json({ mensagem: 'Funcionário já possui data de demissão' });
      }

      await funcionario.update({
        datademissao,
        ativo: false
      });

      res.json({ mensagem: 'Demissão registrada com sucesso' });
    } catch (erro) {
      console.error(`Erro ao registrar demissão ID ${id}:`, erro);
      res.status(500).json({ mensagem: 'Falha ao registrar demissão' });
    }
  },

  async configurarSenha(req, res) {
    const { id } = req.params;
    const { senha } = req.body;

    if (!senha || senha.length < 6 || senha.length > 20) {
      return res.status(400).json({ 
        mensagem: 'A senha deve conter entre 6 e 20 caracteres' 
      });
    }

    try {
      const funcionario = await Funcionario.findByPk(id);
      
      if (!funcionario) {
        return res.status(404).json({ mensagem: 'Funcionário não encontrado' });
      }

      const hash = await bcrypt.hash(senha, 10);
      await funcionario.update({ 
        senha: hash,
        token: null 
      });

      res.json({ mensagem: 'Senha configurada com sucesso' });
    } catch (erro) {
      console.error(`Erro ao configurar senha ID ${id}:`, erro);
      res.status(500).json({ mensagem: 'Falha ao configurar senha' });
    }
  },

  async autenticar(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ mensagem: 'Credenciais são obrigatórias' });
    }

    try {
      const funcionario = await Funcionario.findOne({ where: { email } });
      
      if (!funcionario) {
        return res.status(404).json({ mensagem: 'Credenciais inválidas' });
      }

      if (!funcionario.senha) {
        return res.status(403).json({ 
          mensagem: 'Cadastro incompleto', 
          solucao: 'É necessário definir uma senha primeiro' 
        });
      }

      const senhaValida = await bcrypt.compare(senha, funcionario.senha);
      
      if (!senhaValida) {
        return res.status(401).json({ mensagem: 'Credenciais inválidas' });
      }

      const token = new Date().toISOString();
      await funcionario.update({ token });

      res.json({
        mensagem: 'Autenticação realizada',
        token,
        usuario: {
          id: funcionario.idfuncionario,
          nome: funcionario.nomefuncionario,
          email: funcionario.email
        }
      });
    } catch (erro) {
      console.error('Erro na autenticação:', erro);
      res.status(500).json({ mensagem: 'Falha na autenticação' });
    }
  }
};

export default FuncionarioController;