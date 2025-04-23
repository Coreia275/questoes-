import bcrypt from 'bcrypt';
import Usuario from "../model/UsuarioModel.js";

const UserService = {
  async obterTodosUsuarios(req, res) {
    try {
      const usuarios = await Usuario.findAll({
        attributes: { exclude: ['senha'] } // Não retornar senhas
      });
      res.status(200).json({
        success: true,
        data: usuarios,
        count: usuarios.length
      });
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({
        success: false,
        message: 'Falha ao carregar usuários'
      });
    }
  },

  async obterUsuarioPorId(req, res) {
    const { id } = req.params;
    
    try {
      const usuario = await Usuario.findByPk(id, {
        attributes: { exclude: ['senha'] }
      });

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: usuario
      });
    } catch (error) {
      console.error(`Erro ao buscar usuário ${id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar usuário'
      });
    }
  },

  async criarUsuario(req, res) {
    const dadosUsuario = req.body;
    
    try {
      // Validação básica
      if (!dadosUsuario.nome || !dadosUsuario.email) {
        return res.status(400).json({
          success: false,
          message: 'Nome e email são obrigatórios'
        });
      }

      const novoUsuario = await Usuario.create(dadosUsuario);
      
      // Não retornar a senha
      const usuarioResponse = novoUsuario.toJSON();
      delete usuarioResponse.senha;

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: usuarioResponse
      });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Falha ao criar usuário'
      });
    }
  },

  async atualizarUsuario(req, res) {
    const { id } = req.params;
    const dadosAtualizacao = req.body;
    
    try {
      // Verificar se usuário existe
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Atualizar apenas campos permitidos
      const camposPermitidos = ['nome', 'cpf', 'email', 'telefone', 'nascimento'];
      const dadosParaAtualizar = {};
      
      camposPermitidos.forEach(campo => {
        if (dadosAtualizacao[campo] !== undefined) {
          dadosParaAtualizar[campo] = dadosAtualizacao[campo];
        }
      });

      await Usuario.update(dadosParaAtualizar, {
        where: { idusuario: id }
      });

      res.status(200).json({
        success: true,
        message: 'Usuário atualizado com sucesso'
      });
    } catch (error) {
      console.error(`Erro ao atualizar usuário ${id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Falha ao atualizar usuário'
      });
    }
  },

  async removerUsuario(req, res) {
    const { id } = req.params;
    
    try {
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      await usuario.destroy();
      
      res.status(200).json({
        success: true,
        message: 'Usuário removido com sucesso'
      });
    } catch (error) {
      console.error(`Erro ao remover usuário ${id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Falha ao remover usuário'
      });
    }
  },

  async atualizarSenha(req, res) {
    const { id } = req.params;
    const { senha } = req.body;
    
    try {
      // Validações
      if (!senha) {
        return res.status(400).json({
          success: false,
          message: 'Senha é obrigatória'
        });
      }

      if (senha.length < 6 || senha.length > 20) {
        return res.status(400).json({
          success: false,
          message: 'Senha deve ter entre 6 e 20 caracteres'
        });
      }

      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Criptografar senha
      const hashSenha = await bcrypt.hash(senha, 10);
      
      await usuario.update({ senha: hashSenha });
      
      res.status(200).json({
        success: true,
        message: 'Senha atualizada com sucesso'
      });
    } catch (error) {
      console.error(`Erro ao atualizar senha do usuário ${id}:`, error);
      res.status(500).json({
        success: false,
        message: 'Falha ao atualizar senha'
      });
    }
  }
};

export default UserService;