# API WhatsApp Profile Photo

Uma API simples para obter fotos de perfil de usuários do WhatsApp através do número de telefone.

## 🚀 Funcionalidades

- ✅ Conectar ao WhatsApp Web via QR Code
- ✅ Obter foto de perfil por número de telefone
- ✅ Verificar status da conexão
- ✅ Reconexão automática
- ✅ API RESTful

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn
- WhatsApp instalado no celular

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd api-zap
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor:
```bash
npm start
```

Para desenvolvimento com auto-reload:
```bash
npm run dev
```

## 🔧 Como usar

### 1. Conectar ao WhatsApp

O servidor tentará conectar automaticamente ao iniciar. Você verá um QR Code no console que deve ser escaneado com o WhatsApp do seu celular.

**Endpoint:** `GET /status`
```bash
curl http://localhost:3000/status
```

**Resposta:**
```json
{
  "connected": true,
  "message": "Conectado ao WhatsApp"
}
```

### 2. Obter foto de perfil

**Endpoint:** `GET /profile-photo/:number`

**Exemplos:**
```bash
# Número com código do país
curl http://localhost:3000/profile-photo/5511999999999

# Número sem código do país (será adicionado automaticamente)
curl http://localhost:3000/profile-photo/11999999999

# Número com formatação (será limpo automaticamente)
curl http://localhost:3000/profile-photo/11-99999-9999
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "number": "5511999999999",
  "jid": "5511999999999@s.whatsapp.net",
  "profilePictureUrl": "https://pps.whatsapp.net/v/t61.24694-24/..."
}
```

**Resposta de erro (foto não encontrada):**
```json
{
  "error": "Foto de perfil não encontrada para este número",
  "number": "5511999999999"
}
```

**Resposta de erro (não conectado):**
```json
{
  "error": "WhatsApp não está conectado. Aguarde a conexão ser estabelecida."
}
```

## 📚 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Informações da API |
| GET | `/status` | Status da conexão com WhatsApp |
| POST | `/connect` | Conectar ao WhatsApp |
| POST | `/disconnect` | Desconectar do WhatsApp |
| GET | `/profile-photo/:number` | Obter foto de perfil |

## 🔍 Exemplos de uso

### JavaScript (Fetch)
```javascript
// Verificar status
const status = await fetch('http://localhost:3000/status');
const statusData = await status.json();
console.log(statusData);

// Obter foto de perfil
const response = await fetch('http://localhost:3000/profile-photo/5511999999999');
const data = await response.json();
console.log(data.profilePictureUrl);
```

### Python (Requests)
```python
import requests

# Verificar status
status = requests.get('http://localhost:3000/status')
print(status.json())

# Obter foto de perfil
response = requests.get('http://localhost:3000/profile-photo/5511999999999')
data = response.json()
print(data['profilePictureUrl'])
```

### cURL
```bash
# Verificar status
curl http://localhost:3000/status

# Obter foto de perfil
curl http://localhost:3000/profile-photo/5511999999999
```

## ⚠️ Importante

1. **Primeira execução**: Na primeira vez que executar, será necessário escanear o QR Code que aparecerá no console.

2. **Autenticação**: Após escanear o QR Code, as credenciais serão salvas na pasta `auth_info_baileys` e não será necessário escanear novamente nas próximas execuções.

3. **Números de telefone**: 
   - O código do país (55 para Brasil) será adicionado automaticamente se não estiver presente
   - Caracteres especiais como `-`, `(`, `)`, ` ` serão removidos automaticamente
   - O formato final será: `5511999999999@s.whatsapp.net`

4. **Limitações**:
   - A API só funciona com números que têm WhatsApp
   - Alguns usuários podem ter configurações de privacidade que impedem o acesso à foto de perfil
   - A conexão pode ser perdida e será restabelecida automaticamente

## 🐛 Solução de problemas

### Erro de conexão
Se a conexão falhar, tente:
1. Verificar se o WhatsApp está conectado à internet
2. Deletar a pasta `auth_info_baileys` e reconectar
3. Verificar se não há outro dispositivo conectado ao WhatsApp Web

### Foto não encontrada
- Verifique se o número está correto
- Confirme se o usuário tem WhatsApp
- Alguns usuários podem ter privacidade configurada

## 🚀 Deploy

### Vercel (Demonstração)
A API está configurada para deploy no Vercel. Veja o guia completo em [DEPLOY.md](DEPLOY.md).

```bash
# Deploy automático via Vercel
# 1. Conecte o repositório no Vercel
# 2. Deploy automático a cada push
```

### Alternativas para produção
- **Railway** - Suporte a conexões persistentes
- **Heroku** - Dynos permitem processos contínuos  
- **DigitalOcean** - Droplets para controle total
- **AWS EC2** - Instância dedicada

## 📄 Licença

MIT License

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests. 