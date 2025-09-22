class EntregaInvalidaException(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

class FreteInvalidoException(Exception):
    def __init__(self, message):
        self.message = message
        super().__init__(self.message)

class Entrega:
    def __init__(self, endereco, peso, tipo_frete, destinatario):
        if not endereco or endereco.strip() == "":
            raise EntregaInvalidaException("Endereço não pode ser nulo ou vazio.")
        if peso <= 0:
            raise EntregaInvalidaException("Peso deve ser um valor positivo.")
        if not tipo_frete or tipo_frete.strip() == "":
            raise EntregaInvalidaException("Tipo de frete não pode ser nulo ou vazio.")
        if not destinatario or destinatario.strip() == "":
            raise EntregaInvalidaException("Destinatário não pode ser nulo ou vazio.")

        self.endereco = endereco
        self.peso = peso
        self.tipo_frete = tipo_frete
        self.destinatario = destinatario

    def to_dict(self):
        return {
            'endereco': self.endereco,
            'peso': self.peso,
            'tipo_frete': self.tipo_frete,
            'destinatario': self.destinatario
        }

class CalculadoraFrete:
    def calcular(self, peso):
        raise NotImplementedError("Subclasses devem implementar este método")

class FreteExpresso(CalculadoraFrete):
    def calcular(self, peso):
        if peso <= 0:
            raise FreteInvalidoException("Peso para frete expresso deve ser um valor positivo.")
        return peso * 1.5 + 10

class FretePadrao(CalculadoraFrete):
    def calcular(self, peso):
        if peso <= 0:
            raise FreteInvalidoException("Peso para frete padrão deve ser um valor positivo.")
        return peso * 1.2

class FreteEconomico(CalculadoraFrete):
    def calcular(self, peso):
        if peso <= 0:
            raise FreteInvalidoException("Peso para frete econômico deve ser um valor positivo.")
        return peso * 1.1 - 5

class GerenciadorFrete:
    def __init__(self):
        self.calculadoras = {
            "EXP": FreteExpresso(),
            "PAD": FretePadrao(),
            "ECO": FreteEconomico()
        }

    def get_calculadora(self, tipo_frete):
        if not tipo_frete or tipo_frete.strip() == "":
            raise FreteInvalidoException("Tipo de frete não pode ser nulo ou vazio.")
        calculadora = self.calculadoras.get(tipo_frete.upper())
        if calculadora is None:
            raise FreteInvalidoException(f"Tipo de frete desconhecido: {tipo_frete}")
        return calculadora

class EtiquetaService:
    def __init__(self, gerenciador_frete):
        if gerenciador_frete is None:
            raise ValueError("Gerenciador de frete não pode ser nulo.")
        self.gerenciador_frete = gerenciador_frete

    def gerar_etiqueta(self, entrega):
        if entrega is None:
            raise EntregaInvalidaException("Entrega não pode ser nula para gerar etiqueta.")
        calculadora_frete = self.gerenciador_frete.get_calculadora(entrega.tipo_frete)
        valor_frete = calculadora_frete.calcular(entrega.peso)
        return f"Destinatário: {entrega.destinatario}\nEndereço: {entrega.endereco}\nValor do Frete: R${valor_frete:.2f}"

    def gerar_resumo_pedido(self, entrega):
        if entrega is None:
            raise EntregaInvalidaException("Entrega não pode ser nula para gerar resumo.")
        calculadora_frete = self.gerenciador_frete.get_calculadora(entrega.tipo_frete)
        valor_frete = calculadora_frete.calcular(entrega.peso)
        return f"Pedido para {entrega.destinatario} com frete tipo {entrega.tipo_frete} no valor de R${valor_frete:.2f}"

class RegraPromocionalFrete:
    def is_aplicavel(self, entrega):
        raise NotImplementedError("Subclasses devem implementar este método")

    def aplicar(self, entrega):
        raise NotImplementedError("Subclasses devem implementar este método")

class ReducaoPesoFretePromocional(RegraPromocionalFrete):
    def is_aplicavel(self, entrega):
        return entrega.peso > 10

    def aplicar(self, entrega):
        if self.is_aplicavel(entrega):
            return Entrega(
                entrega.endereco,
                entrega.peso - 1,
                entrega.tipo_frete,
                entrega.destinatario
            )
        return entrega

class GerenciadorPromocoesFrete:
    def __init__(self, regras):
        self.regras = regras

    def aplicar_promocoes(self, entrega):
        entrega_atual = entrega
        for regra in self.regras:
            if regra.is_aplicavel(entrega_atual):
                entrega_atual = regra.aplicar(entrega_atual)
        return entrega_atual

