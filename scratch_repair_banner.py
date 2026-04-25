import os

path = r'R:\Users\Usuario\Meu Drive\Painel site Mxxcontrol-x-sistema\web\src\pages\BannerGenerator.jsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Localizar componentes que ficaram "dentro" indevidamente ou no caminho
# Vamos identificar o ponto onde a BannerGenerator return parou prematuramente
# Vimos que estava em 984-985

# Ponto de quebra: linha 984 ()} )
# Queremos que o return continue ate o final do modal.

new_content = []
configurators_code = []
in_main = True
skip_until_modal = False

for i, line in enumerate(lines):
    # Se chegamos no ponto onde começou o configurador de futebol mas a BannerGenerator ainda não fechou
    if "const FootballConfigurator" in line:
        in_main = False
    
    if in_main:
        # Se for o fechamento prematuro que sobrou (apesar do meu del anterior, vamos garantir)
        if i >= 984 and i <= 987:
            if "</div>" in line or ")" in line or "}" in line:
               continue
        new_content.append(line)
    else:
        # Estamos lendo os configuradores. Vamos guardá-los para o fim do arquivo.
        # Mas atenção: O MODAL (showThemeModal) deve estar DENTRO da BannerGenerator.
        if "showThemeModal && (" in line:
            # Encontramos o Modal. Ele volta para dentro da BannerGenerator.
            # Mas primeiro precisamos fechar o bloco generator e abrir a aba themes? 
            # Não, precisamos manter a lógica condicional.
            
            # Precisamos injetar o fechamento do generator e a abertura da aba themes/modal aqui.
            new_content.append("        </>\n")
            new_content.append("      ) : (\n")
            new_content.append("        /* --- ABA TEMAS --- */\n")
            # Aqui entra o bloco das linhas 1378-1430 que já estão no arquivo.
            # Vamos deixar o loop continuar e mover o que for configurador.
            in_main = True
            new_content.append(line)
            continue
        
        configurators_code.append(line)

# Reajuste final: Adicionar o fechamento da função BannerGenerator e depois os configuradores
# (Isso é uma simplificação, vou usar uma abordagem mais direta via multi_replace para não bugar tudo)

print("Análise Concluída. Reestruturando via Multi-Replace.")
