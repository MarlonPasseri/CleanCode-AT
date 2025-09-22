// Configuração da API
const API_BASE_URL = '/api';

// Elementos DOM
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const loading = document.getElementById('loading');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Configurar tabs
    setupTabs();
    
    // Configurar formulários
    setupForms();
});

// Configuração das tabs
function setupTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    // Remover classe active de todos os botões e conteúdos
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Adicionar classe active ao botão e conteúdo selecionados
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// Configuração dos formulários
function setupForms() {
    // Formulário de calcular frete
    document.getElementById('calcular-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await calcularFrete();
    });
    
    // Formulário de gerar etiqueta
    document.getElementById('etiqueta-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await gerarEtiqueta();
    });
    
    // Formulário de aplicar promoções
    document.getElementById('promocoes-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await aplicarPromocoes();
    });
}

// Funções de API
async function calcularFrete() {
    const dados = {
        destinatario: document.getElementById('calc-destinatario').value,
        endereco: document.getElementById('calc-endereco').value,
        peso: parseFloat(document.getElementById('calc-peso').value),
        tipo_frete: document.getElementById('calc-tipo-frete').value
    };
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/calcular-frete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            mostrarResultadoCalculo(result);
        } else {
            mostrarErro('calc-resultado', result.error);
        }
    } catch (error) {
        mostrarErro('calc-resultado', 'Erro de conexão com o servidor');
    } finally {
        showLoading(false);
    }
}

async function gerarEtiqueta() {
    const dados = {
        destinatario: document.getElementById('etiq-destinatario').value,
        endereco: document.getElementById('etiq-endereco').value,
        peso: parseFloat(document.getElementById('etiq-peso').value),
        tipo_frete: document.getElementById('etiq-tipo-frete').value
    };
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/gerar-etiqueta`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            mostrarResultadoEtiqueta(result);
        } else {
            mostrarErro('etiq-resultado', result.error);
        }
    } catch (error) {
        mostrarErro('etiq-resultado', 'Erro de conexão com o servidor');
    } finally {
        showLoading(false);
    }
}

async function aplicarPromocoes() {
    const dados = {
        destinatario: document.getElementById('promo-destinatario').value,
        endereco: document.getElementById('promo-endereco').value,
        peso: parseFloat(document.getElementById('promo-peso').value),
        tipo_frete: document.getElementById('promo-tipo-frete').value
    };
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/aplicar-promocoes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            mostrarResultadoPromocoes(result);
        } else {
            mostrarErro('promo-resultado', result.error);
        }
    } catch (error) {
        mostrarErro('promo-resultado', 'Erro de conexão com o servidor');
    } finally {
        showLoading(false);
    }
}

// Funções de exibição de resultados
function mostrarResultadoCalculo(result) {
    const resultadoDiv = document.getElementById('calc-resultado');
    const tipoFreteNome = getTipoFreteNome(result.entrega.tipo_frete);
    
    resultadoDiv.innerHTML = `
        <h3><i class="fas fa-check-circle" style="color: #27ae60;"></i> Frete Calculado</h3>
        <p><strong>Destinatário:</strong> ${result.entrega.destinatario}</p>
        <p><strong>Endereço:</strong> ${result.entrega.endereco}</p>
        <p><strong>Peso:</strong> ${result.entrega.peso} kg</p>
        <p><strong>Tipo de Frete:</strong> ${tipoFreteNome}</p>
        <div class="valor-frete">
            <i class="fas fa-money-bill-wave"></i> R$ ${result.valor_frete.toFixed(2)}
        </div>
    `;
    
    resultadoDiv.classList.remove('error');
    resultadoDiv.classList.add('show');
}

function mostrarResultadoEtiqueta(result) {
    const resultadoDiv = document.getElementById('etiq-resultado');
    
    resultadoDiv.innerHTML = `
        <h3><i class="fas fa-tag" style="color: #3498db;"></i> Etiqueta Gerada</h3>
        <div class="etiqueta">
${result.etiqueta}
        </div>
        <h4><i class="fas fa-file-alt"></i> Resumo do Pedido</h4>
        <p>${result.resumo}</p>
    `;
    
    resultadoDiv.classList.remove('error');
    resultadoDiv.classList.add('show');
}

function mostrarResultadoPromocoes(result) {
    const resultadoDiv = document.getElementById('promo-resultado');
    
    if (result.promocao_aplicada) {
        resultadoDiv.innerHTML = `
            <h3><i class="fas fa-percentage" style="color: #27ae60;"></i> Promoção Aplicada!</h3>
            <div class="promocao-comparacao">
                <div class="promocao-item">
                    <h4><i class="fas fa-shopping-cart"></i> Original</h4>
                    <p><strong>Peso:</strong> ${result.entrega_original.dados.peso} kg</p>
                    <p><strong>Frete:</strong> R$ ${result.entrega_original.valor_frete.toFixed(2)}</p>
                </div>
                <div class="promocao-item">
                    <h4><i class="fas fa-gift"></i> Com Promoção</h4>
                    <p><strong>Peso:</strong> ${result.entrega_promocional.dados.peso} kg</p>
                    <p><strong>Frete:</strong> R$ ${result.entrega_promocional.valor_frete.toFixed(2)}</p>
                </div>
            </div>
            <div class="economia">
                <i class="fas fa-piggy-bank"></i> Economia: R$ ${result.economia.toFixed(2)}
            </div>
        `;
    } else {
        resultadoDiv.innerHTML = `
            <h3><i class="fas fa-info-circle" style="color: #f39c12;"></i> Nenhuma Promoção Aplicável</h3>
            <div class="sem-promocao">
                <i class="fas fa-exclamation-triangle"></i> 
                Esta entrega não se qualifica para a promoção atual (peso deve ser maior que 10kg)
            </div>
            <p><strong>Peso atual:</strong> ${result.entrega_original.dados.peso} kg</p>
            <p><strong>Valor do frete:</strong> R$ ${result.entrega_original.valor_frete.toFixed(2)}</p>
        `;
    }
    
    resultadoDiv.classList.remove('error');
    resultadoDiv.classList.add('show');
}

function mostrarErro(elementId, mensagem) {
    const resultadoDiv = document.getElementById(elementId);
    
    resultadoDiv.innerHTML = `
        <h3><i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i> Erro</h3>
        <p>${mensagem}</p>
    `;
    
    resultadoDiv.classList.add('error');
    resultadoDiv.classList.add('show');
}

// Funções auxiliares
function showLoading(show) {
    if (show) {
        loading.classList.add('show');
    } else {
        loading.classList.remove('show');
    }
}

function getTipoFreteNome(codigo) {
    const tipos = {
        'EXP': 'Expresso',
        'PAD': 'Padrão',
        'ECO': 'Econômico'
    };
    return tipos[codigo] || codigo;
}

// Validação de formulários
function validarFormulario(dados) {
    if (!dados.destinatario || dados.destinatario.trim() === '') {
        throw new Error('Destinatário é obrigatório');
    }
    
    if (!dados.endereco || dados.endereco.trim() === '') {
        throw new Error('Endereço é obrigatório');
    }
    
    if (!dados.peso || dados.peso <= 0) {
        throw new Error('Peso deve ser um valor positivo');
    }
    
    if (!dados.tipo_frete || dados.tipo_frete.trim() === '') {
        throw new Error('Tipo de frete é obrigatório');
    }
}

// Animações e efeitos visuais
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar efeito de hover nos cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.08)';
        });
    });
    
    // Adicionar efeito de focus nos inputs
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
    });
});

