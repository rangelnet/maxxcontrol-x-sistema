import os

file_path = r'r:\Users\Usuario\Meu Drive\Painel Maxxcontrol-x-sistema\web\src\pages\Devices.jsx'

# Mapeamento de Mojibake (UTF-8 interpretado como Latin-1/Windows-1252)
replacements = {
    'í§ão': 'ção',
    'Aí§ão': 'Ação',
    'criaí§ão': 'criação',
    'Lí³gica': 'Lógica',
    'Díºvida': 'Dúvida',
    'Paginaí§ão': 'Paginação',
    'Confianí§a': 'Confiança',
    'í³ximo': 'óximo',
    'â€”': '--',
    'â€¦': '...',
    'â•': '-',
    'â”€': '-',
    'íªncia': 'ência',
    'ConexíƒÂµes': 'Conexões',
    'BotíƒÂµes': 'Botões',
    'AíƒÂ§íƒÂµes': 'Ações',
    'indisponíƒÂ­vel': 'indisponível'
}

with open(file_path, 'rb') as f:
    content = f.read().decode('utf-8', errors='ignore')

for old, new in replacements.items():
    content = content.replace(old, new)

# Limpeza de bordas repetitivas de comentarios
import re
content = re.sub(r'-{5,}', '---------------------------------------------------------', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("VARREDURA BINÁRIA PROFUNDA CONCLUÍDA!")
