// Navbar ativa conforme rolagem
const sections = document.querySelectorAll("section");
const navButtons = document.querySelectorAll("#navbar button");


window.addEventListener("scroll", () => {
  let current = "";
  const scrollPos = window.scrollY + 150;

  sections.forEach(sec => {
    if (scrollPos >= sec.offsetTop) {
      current = sec.getAttribute("id");
    }
  });

  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
    current = sections[sections.length - 1].getAttribute("id");
  }

  navButtons.forEach(btn => {
    btn.classList.remove("active");
    if (btn.dataset.target === current) btn.classList.add("active");
  });
});

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    const section = document.getElementById(targetId);
    const offset = section.offsetTop - 120;
    window.scrollTo({ top: offset, behavior: "smooth" });
  });
});

// Toggle horário
const toggle = document.getElementById("toggle-horario");
const detalhe = document.getElementById("horario-detalhe");
toggle.addEventListener("click", () => {
  detalhe.style.display = detalhe.style.display === "block" ? "none" : "block";
});

// Pesquisa
const searchInput = document.getElementById("search");
searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    const value = searchInput.value.toLowerCase();
    const ids = ["ovos", "copos", "brigadeiros", "bolo", "brownie", "bebidas"];
    const match = ids.find(id => id.includes(value));
    if (match) {
      const section = document.getElementById(match);
      const offset = section.offsetTop - 120;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
  }
});

// Modal produto
const modal = document.getElementById("modal");
const closeBtn = document.getElementById("close");
const confirmarBtn = document.getElementById("confirmar");
let produtoSelecionado = "";

document.querySelectorAll(".pedir").forEach(btn => {
  btn.addEventListener("click", () => {
    produtoSelecionado = btn.closest(".card").querySelector("h3").innerText;
    modal.style.display = "block";
  });
});

closeBtn.onclick = () => modal.style.display = "none";

// Carrinho
const cart = document.getElementById("cart");
const cartItems = document.getElementById("cart-items");
const toast = document.getElementById("toast");
const closeCart = document.getElementById("close-cart");
const openCart = document.getElementById("open-cart");

let subtotal = 0;
let frete = 0;

function atualizarTotais() {
  document.getElementById("subtotal").textContent = `Subtotal: R$${subtotal}`;
  document.getElementById("total").textContent = `Total: R$${subtotal + frete}`;
}

function criarItem(produto, casca, desc, valor) {
  let quantidade = 1;

  const li = document.createElement("li");
  li.innerHTML = `
    ${produto} | Casca: ${casca} | ${desc}
    <div class="actions">
      <button class="btn add">+</button>
      <span class="quantidade">${quantidade}</span>
      <span class="valor">R$${valor}</span>
      <button class="btn remove">🗑️</button>
    </div>
  `;

  const qtdSpan = li.querySelector(".quantidade");

  // Botão de adicionar mais
  li.querySelector(".add").addEventListener("click", () => {
    quantidade++;
    qtdSpan.textContent = quantidade;
    subtotal += valor;
    atualizarTotais();
  });

  // Botão de remover
  li.querySelector(".remove").addEventListener("click", () => {
    subtotal -= valor * quantidade;
    li.remove();
    atualizarTotais();
  });

  cartItems.appendChild(li);
  subtotal += valor;
  atualizarTotais();
}

// Botão continuar comprando
document.getElementById("continuar").addEventListener("click", () => {
  cart.style.display = "none";
});

// Confirmar produto
confirmarBtn.addEventListener("click", () => {
  const casca = document.getElementById("casca").value;
  const tamanho = document.getElementById("tamanho");
  const desc = tamanho.options[tamanho.selectedIndex].text;
  const valor = parseFloat(tamanho.value);

  criarItem(produtoSelecionado, casca, desc, valor);

  modal.style.display = "none";

  toast.textContent = `${produtoSelecionado} adicionado ao seu carrinho`;
  toast.style.display = "block";
  setTimeout(() => toast.style.display = "none", 2000);
});

// Abrir carrinho
openCart.addEventListener("click", (e) => {
  e.preventDefault();
  cart.style.display = "block";
});

// Fechar carrinho
closeCart.addEventListener("click", () => {
  cart.style.display = "none";
});

// Calcular frete (CEP obrigatório)
document.getElementById("calcular-frete").addEventListener("click", async () => {
  const cep = document.getElementById("cep").value.trim();
  if (!cep) {
    alert("O campo CEP é obrigatório!");
    return;
  }
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();
    if (data.erro) {
      document.getElementById("frete").innerText = "CEP inválido!";
    } else {
      frete = (data.uf === "SP") ? 10 : 15;
      document.getElementById("frete").innerText = `Frete: R$${frete}`;
      atualizarTotais();
    }
  } catch {
    document.getElementById("frete").innerText = "Erro ao calcular frete.";
  }
});



// Finalizar pedido → abre formulário
document.getElementById("finalizar").addEventListener("click", () => {
  const cep = document.getElementById("cep").value.trim();
  if (!cep) {
    alert("Preencha o CEP antes de finalizar o pedido!");
    return;
  }

  cart.style.display = "none";
  document.getElementById("checkout-form").style.display = "block";

  document.getElementById("resumo").innerHTML = `
    <h4>Resumo do Pedido</h4>
    ${cartItems.innerHTML}
    <p>Subtotal: R$${subtotal}</p>
    <p>Frete: R$${frete}</p>
    <p>Total: R$${subtotal + frete}</p>
  `;
});

document.getElementById("finalizar").addEventListener("click", () => {
  const cep = document.getElementById("cep").value.trim();
  if (!cep) {
    alert("Preencha o CEP antes de finalizar o pedido!");
    return;
  }

  cart.style.display = "none";
  document.getElementById("checkout-form").style.display = "block";

  // monta resumo sem botões
  let resumoHTML = "<h4>Resumo do Pedido</h4><ul>";
  document.querySelectorAll("#cart-items li").forEach(li => {
    const texto = li.childNodes[0].textContent.trim(); // pega só a descrição
    const qtd = li.querySelector(".quantidade").textContent;
    const valor = li.querySelector(".valor").textContent;
    resumoHTML += `<li>${texto} | Quantidade: ${qtd} | ${valor}</li>`;
  });
  resumoHTML += "</ul>";
  resumoHTML += `<p>Subtotal: R$${subtotal}</p>
                 <p>Frete: R$${frete}</p>
                 <p>Total: R$${subtotal + frete}</p>`;

  document.getElementById("resumo").innerHTML = resumoHTML;
});


// Voltar ao carrinho
document.getElementById("voltar-carrinho").addEventListener("click", () => {
  document.getElementById("checkout-form").style.display = "none";
  cart.style.display = "block";
});


// Fechar formulário
document.getElementById("close-form").addEventListener("click", () => {
  document.getElementById("checkout-form").style.display = "none";
});

// Enviar via WhatsApp
document.getElementById("enviar-whats").addEventListener("click", () => {
  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const endereco = document.getElementById("endereco").value.trim();
  const pagamento = document.getElementById("pagamento").value.trim();
  const observacao = document.getElementById("observacao").value.trim();
  const cep = document.getElementById("cep").value.trim();

  // Validação dos campos obrigatórios
  if (!nome || !telefone || !endereco || !pagamento || !cep) {
    alert("Por favor, preencha todos os campos obrigatórios (CEP, Nome, Telefone, Endereço e Forma de Pagamento).");
    return; // <-- interrompe aqui, não vai para o WhatsApp
  }

  let pedido = `\n${document.getElementById("resumo").innerText}\n\n`;
  pedido += `Nome: ${nome}\nTelefone: ${telefone}\nEndereço: ${endereco}\nPagamento: ${pagamento}\nObservação: ${observacao}`;

  const numeroWhatsApp = "5511968646651"; // substitua pelo seu número
  const url = "https://wa.me/" + numeroWhatsApp + "?text=" + encodeURIComponent(pedido);

  window.open(url, "_blank");
});

