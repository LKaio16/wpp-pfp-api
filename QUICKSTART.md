# 🚀 Início Rápido - API WhatsApp Profile Photo

## ⚡ Passos para começar

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar o servidor
```bash
npm start
```

### 3. Conectar ao WhatsApp
- Um QR Code aparecerá no console
- Escaneie com o WhatsApp do seu celular
- Aguarde a mensagem "Conectado ao WhatsApp!"

### 4. Testar a API
```bash
# Verificar status
curl http://localhost:3000/status

# Obter foto de perfil
curl http://localhost:3000/profile-photo/5511999999999
```

## 📱 Como usar

### Endpoint principal
```
GET /profile-photo/:number
```

### Exemplos de números
- `5511999999999` - Com código do país
- `11999999999` - Sem código do país (será adicionado automaticamente)
- `11-99999-9999` - Com formatação (será limpa automaticamente)

### Resposta de sucesso
```json
{
  "success": true,
  "number": "5511999999999",
  "jid": "5511999999999@s.whatsapp.net",
  "profilePictureUrl": "https://pps.whatsapp.net/v/t61.24694-24/..."
}
```

## 🧪 Executar testes
```bash
node test.js
```

## 📚 Documentação completa
Veja o arquivo `README.md` para documentação detalhada.

## ⚠️ Importante
- Na primeira execução, você precisará escanear o QR Code
- As credenciais são salvas automaticamente para próximas execuções
- A API só funciona com números que têm WhatsApp
- Alguns usuários podem ter privacidade configurada 