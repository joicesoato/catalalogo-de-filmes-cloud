const form = document.querySelector("#clienteForm");
const lista = document.querySelector("#lista");
const total = document.querySelector("#total");
const mensagem = document.querySelector("#mensagem");
const status = document.querySelector("#status");
const atualizar = document.querySelector("#atualizar");

const dinheiro = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

async function verificarConexao() {
  try {
    const response = await fetch("/api/health");
    if (!response.ok) throw new Error();
    status.textContent = "MySQL conectado";
    status.className = "status ok";
  } catch {
    status.textContent = "MySQL indisponível";
    status.className = "status error";
  }
}

async function carregarClientes() {
  try {
    const response = await fetch("/api/clientes");
    if (!response.ok) throw new Error();
    const clientes = await response.json();

    total.textContent = `Total de registros: ${clientes.length}`;

    if (!clientes.length) {
      lista.innerHTML = `<tr><td colspan="5" class="empty">Nenhum cadastro ainda.</td></tr>`;
      return;
    }

    lista.innerHTML = clientes.map(cliente => `
      <tr>
        <td>${cliente.id}</td>
        <td>${escapeHtml(cliente.nome)}</td>
        <td>${escapeHtml(cliente.telefone)}</td>
        <td>${dinheiro.format(Number(cliente.valor))}</td>
        <td><button class="delete" onclick="excluirCliente(${cliente.id})">Excluir</button></td>
      </tr>
    `).join("");
  } catch {
    lista.innerHTML = `<tr><td colspan="5" class="empty">Não foi possível carregar os dados.</td></tr>`;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  mensagem.textContent = "Salvando...";

  const body = {
    nome: document.querySelector("#nome").value,
    telefone: document.querySelector("#telefone").value,
    valor: document.querySelector("#valor").value
  };

  try {
    const response = await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Erro ao cadastrar.");

    form.reset();
    document.querySelector("#valor").value = "0";
    mensagem.textContent = "Cliente cadastrado com sucesso.";
    await carregarClientes();
  } catch (error) {
    mensagem.textContent = error.message;
  }
});

async function excluirCliente(id) {
  if (!confirm("Excluir este cadastro?")) return;

  const response = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
  if (response.ok) await carregarClientes();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

atualizar.addEventListener("click", async () => {
  await verificarConexao();
  await carregarClientes();
});

verificarConexao();
carregarClientes();