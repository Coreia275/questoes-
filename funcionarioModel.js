import { DataTypes } from "sequelize";
import banco from "../banco.js";

const Funcionario = banco.define(
  "funcionario",
  {
    idfuncionario: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    nomefuncionario: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING(15),
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    telefone: {
      type: DataTypes.STRING(15),
    },
    datanascimento: {
      type: DataTypes.DATE,
    },
    salario: {
      type: DataTypes.DECIMAL(11, 2),
      allowNull: false,
      defaultValue: 0,
    },
    datacontratacao: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    datademissao: {
      type: DataTypes.DATE,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    senha: {
      type: DataTypes.STRING(100),
    },
    token: {
      type: DataTypes.STRING(100),
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

export default Funcionario;