import Emprestimo from "../model/EmprestimoModel.js";
import Livro from "../model/LivroModel.js";
import Usuario from "../model/UsuarioModel.js";
import moment from 'moment';

const EmprestimoController = {
  async listarTodos(req, res) {
    try {
      const emprestimos = await Emprestimo.findAll({
        include: [
          { model: Livro, attributes: ['titulo'] },
          { model: Usuario, attributes: ['nome'] }
        ]
      });
      res.json(emprestimos);
    } catch (erro) {
      console.error('Erro ao listar empréstimos:', erro);
      res.status(500).json({ mensagem: 'Falha ao buscar empréstimos' });
    }
  },

  async buscarPorId(req, res) {
    const { id } = req.params;
    
    try {
      const emprestimo = await Emprestimo.findByPk(id, {
        include: [
          { model: Livro, attributes: ['titulo', 'autor'] },
          { model: Usuario, attributes: ['nome', 'email'] }
        ]
      });
      
      if (!emprestimo) {
        return res.status(404).json({ mensagem: 'Empréstimo não encontrado' });
      }
      
      res.json(emprestimo);
    } catch (erro) {
      console.error(`Erro ao buscar empréstimo ID ${id}:`, erro);
      res.status(500).json({ mensagem: 'Erro ao buscar empréstimo' });
    }
  },

  async registrarEmprestimo(req, res) {
    const { idlivro, idusuario } = req.body;
    
    // Validações básicas
    if (!idlivro || !idusuario) {
      return res.status(400).json({ 
        mensagem: 'Dados incompletos',
        camposFaltantes: {
          idlivro: !idlivro,
          idusuario: !idusuario
        }
      });
    }

    try {
      // Verificar existência dos recursos
      const [livro, usuario] = await Promise.all([
        Livro.findByPk(idlivro),
        Usuario.findByPk(idusuario)
      ]);

      if (!livro) return res.status(404).json({ mensagem: 'Livro não encontrado' });
      if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado' });

      // Validações de negócio
      if (!livro.ativo) {
        return res.status(403).json({ mensagem: 'Livro inativo para empréstimo' });
      }

      if (livro.emprestado) {
        return res.status(409).json({ mensagem: 'Livro já emprestado' });
      }

      const emprestimoAtivo = await Emprestimo.findOne({
        where: { idusuario, devolucao: null }
      });

      if (emprestimoAtivo) {
        return res.status(409).json({ 
          mensagem: 'Usuário possui empréstimo pendente',
          emprestimoId: emprestimoAtivo.idemprestimo
        });
      }

      // Processar empréstimo
      const dataEmprestimo = moment().format('YYYY-MM-DD');
      const dataVencimento = moment().add(15, 'days').format('YYYY-MM-DD');

      const novoEmprestimo = await Emprestimo.create({
        idlivro,
        idusuario,
        emprestimo: dataEmprestimo,
        vencimento: dataVencimento
      });

      await livro.update({ emprestado: true });

      res.status(201).json({
        mensagem: 'Empréstimo registrado com sucesso',
        dados: novoEmprestimo,
        vencimento: dataVencimento
      });

    } catch (erro) {
      console.error('Erro ao registrar empréstimo:', erro);
      res.status(500).json({ mensagem: 'Falha ao processar empréstimo' });
    }
  },

  async registrarDevolucao(req, res) {
    const { id } = req.params;
    
    try {
      const emprestimo = await Emprestimo.findByPk(id);
      
      if (!emprestimo) {
        return res.status(404).json({ mensagem: 'Empréstimo não encontrado' });
      }

      if (emprestimo.devolucao) {
        return res.status(409).json({ 
          mensagem: 'Devolução já registrada anteriormente',
          dataDevolucao: emprestimo.devolucao
        });
      }

      const dataDevolucao = moment().format('YYYY-MM-DD');
      const livro = await Livro.findByPk(emprestimo.idlivro);

      await Promise.all([
        emprestimo.update({ devolucao: dataDevolucao }),
        livro.update({ emprestado: false })
      ]);

      res.json({
        mensagem: 'Devolução registrada com sucesso',
        dataDevolucao,
        diasAtraso: moment(dataDevolucao).diff(emprestimo.vencimento, 'days')
      });

    } catch (erro) {
      console.error(`Erro ao registrar devolução ID ${id}:`, erro);
      res.status(500).json({ mensagem: 'Falha ao processar devolução' });
    }
  }
};

export default EmprestimoController;