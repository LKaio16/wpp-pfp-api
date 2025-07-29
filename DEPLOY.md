# 🚀 Deploy no Vercel

## 📋 Pré-requisitos

1. **Conta no Vercel** - [vercel.com](https://vercel.com)
2. **Conta no GitHub** - Para conectar o repositório
3. **Vercel CLI** (opcional) - Para deploy via linha de comando

## 🔧 Deploy Automático (Recomendado)

### 1. Conectar repositório no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Conecte sua conta do GitHub
4. Selecione o repositório `wpp-pfp-api`
5. Clique em "Import"

### 2. Configurar o projeto

O Vercel detectará automaticamente que é um projeto Node.js. As configurações padrão são:

- **Framework Preset**: Node.js
- **Build Command**: `npm install`
- **Output Directory**: `.`
- **Install Command**: `npm install`

### 3. Variáveis de ambiente (opcional)

Se necessário, adicione variáveis de ambiente:

- `NODE_ENV`: `production`
- `PORT`: `3000` (será definido automaticamente pelo Vercel)

### 4. Deploy

Clique em "Deploy" e aguarde o processo ser concluído.

## 🔧 Deploy via CLI

### 1. Instalar Vercel CLI

```bash
npm i -g vercel
```

### 2. Fazer login

```bash
vercel login
```

### 3. Deploy

```bash
vercel
```

Siga as instruções no terminal.

## 🌐 URLs após o deploy

Após o deploy, você terá URLs como:

- **API**: `https://wpp-pfp-api.vercel.app`
- **Interface**: `https://wpp-pfp-api.vercel.app/index.html`

## ⚠️ Limitações do Vercel

### ❌ Problemas conhecidos:

1. **WhatsApp Web não funciona no Vercel** - O Vercel é serverless e não mantém conexões persistentes
2. **QR Code não pode ser escaneado** - Não há terminal para exibir o QR Code
3. **Conexão instável** - As funções serverless têm timeout de 30 segundos

### ✅ Soluções recomendadas:

1. **Usar localmente para conectar** - Execute localmente para escanear o QR Code
2. **Usar a API remota** - Depois de conectar localmente, use a API do Vercel
3. **Híbrido** - Interface local + API remota

## 🔄 Workflow recomendado

### 1. Conectar localmente

```bash
# Clone o repositório
git clone https://github.com/LKaio16/wpp-pfp-api.git
cd wpp-pfp-api

# Instalar dependências
npm install

# Iniciar servidor local
npm start

# Escanear QR Code no terminal
# Aguardar "✅ Conectado ao WhatsApp!"
```

### 2. Usar API remota

Depois de conectar localmente, você pode usar a API do Vercel:

```bash
# Verificar status
curl https://wpp-pfp-api.vercel.app/status

# Obter foto de perfil
curl https://wpp-pfp-api.vercel.app/profile-photo/5511999999999
```

### 3. Interface híbrida

Modifique a interface para usar a API remota:

```javascript
// Em public/script.js, altere:
const API_BASE_URL = 'https://wpp-pfp-api.vercel.app';
```

## 🛠️ Alternativas para produção

Para um ambiente de produção real, considere:

1. **Railway** - Suporte a conexões persistentes
2. **Heroku** - Dynos permitem processos contínuos
3. **DigitalOcean** - Droplets para controle total
4. **AWS EC2** - Instância dedicada

## 📝 Notas importantes

- O Vercel é ideal para APIs stateless
- WhatsApp Web requer conexão persistente
- Use localmente para desenvolvimento e testes
- Deploy no Vercel para demonstração e documentação 