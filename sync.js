import banco from "./banco.js";
import "./model/AutorModel.js";
import "./model/CategoriaModel.js";
import "./model/EditoraModel.js";
import "./model/LivroModel.js";
import "./model/UsuarioModel.js";
import "./model/EmprestimoModel.js";

async function sincronizar() {
  try {
    await banco.sync({ force: true });
    console.log("✅ Banco sincronizado!");
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    process.exit();
  }
}

sincronizar();