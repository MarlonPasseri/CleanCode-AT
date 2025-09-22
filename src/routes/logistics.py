from flask import Blueprint, request, jsonify
from src.models.entrega import (
    Entrega, EntregaInvalidaException, FreteInvalidoException,
    GerenciadorFrete, EtiquetaService, ReducaoPesoFretePromocional,
    GerenciadorPromocoesFrete
)

logistics_bp = Blueprint('logistics', __name__)

# Inicializar serviços
gerenciador_frete = GerenciadorFrete()
etiqueta_service = EtiquetaService(gerenciador_frete)
regras_promocionais = [ReducaoPesoFretePromocional()]
gerenciador_promocoes = GerenciadorPromocoesFrete(regras_promocionais)

@logistics_bp.route('/calcular-frete', methods=['POST'])
def calcular_frete():
    try:
        data = request.get_json()
        
        # Validar dados de entrada
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        endereco = data.get('endereco')
        peso = data.get('peso')
        tipo_frete = data.get('tipo_frete')
        destinatario = data.get('destinatario')
        
        # Criar entrega
        entrega = Entrega(endereco, peso, tipo_frete, destinatario)
        
        # Calcular frete
        calculadora = gerenciador_frete.get_calculadora(entrega.tipo_frete)
        valor_frete = calculadora.calcular(entrega.peso)
        
        return jsonify({
            'entrega': entrega.to_dict(),
            'valor_frete': round(valor_frete, 2)
        })
        
    except (EntregaInvalidaException, FreteInvalidoException) as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@logistics_bp.route('/gerar-etiqueta', methods=['POST'])
def gerar_etiqueta():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        endereco = data.get('endereco')
        peso = data.get('peso')
        tipo_frete = data.get('tipo_frete')
        destinatario = data.get('destinatario')
        
        # Criar entrega
        entrega = Entrega(endereco, peso, tipo_frete, destinatario)
        
        # Gerar etiqueta
        etiqueta = etiqueta_service.gerar_etiqueta(entrega)
        resumo = etiqueta_service.gerar_resumo_pedido(entrega)
        
        return jsonify({
            'entrega': entrega.to_dict(),
            'etiqueta': etiqueta,
            'resumo': resumo
        })
        
    except (EntregaInvalidaException, FreteInvalidoException) as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@logistics_bp.route('/aplicar-promocoes', methods=['POST'])
def aplicar_promocoes():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        endereco = data.get('endereco')
        peso = data.get('peso')
        tipo_frete = data.get('tipo_frete')
        destinatario = data.get('destinatario')
        
        # Criar entrega original
        entrega_original = Entrega(endereco, peso, tipo_frete, destinatario)
        
        # Aplicar promoções
        entrega_promocional = gerenciador_promocoes.aplicar_promocoes(entrega_original)
        
        # Calcular fretes
        calculadora = gerenciador_frete.get_calculadora(entrega_original.tipo_frete)
        valor_frete_original = calculadora.calcular(entrega_original.peso)
        valor_frete_promocional = calculadora.calcular(entrega_promocional.peso)
        
        return jsonify({
            'entrega_original': {
                'dados': entrega_original.to_dict(),
                'valor_frete': round(valor_frete_original, 2)
            },
            'entrega_promocional': {
                'dados': entrega_promocional.to_dict(),
                'valor_frete': round(valor_frete_promocional, 2)
            },
            'promocao_aplicada': entrega_original.peso != entrega_promocional.peso,
            'economia': round(valor_frete_original - valor_frete_promocional, 2)
        })
        
    except (EntregaInvalidaException, FreteInvalidoException) as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@logistics_bp.route('/tipos-frete', methods=['GET'])
def tipos_frete():
    return jsonify({
        'tipos': [
            {'codigo': 'EXP', 'nome': 'Expresso', 'descricao': 'Entrega rápida (peso * 1.5 + R$10)'},
            {'codigo': 'PAD', 'nome': 'Padrão', 'descricao': 'Entrega normal (peso * 1.2)'},
            {'codigo': 'ECO', 'nome': 'Econômico', 'descricao': 'Entrega econômica (peso * 1.1 - R$5)'}
        ]
    })

@logistics_bp.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK', 'message': 'API de Logística funcionando'})

