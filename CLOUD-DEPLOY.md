# ☁️ Deploy na Nuvem - API WhatsApp Profile Photo

## 🎯 **Recomendação: Railway**

**Railway é a melhor opção** para sua API porque:
- ✅ Suporte a conexões persistentes
- ✅ QR Code funciona no terminal
- ✅ WhatsApp Web funciona perfeitamente
- ✅ Deploy automático via Git
- ✅ Plano gratuito generoso

## 🚀 **Deploy no Railway (Recomendado)**

### Opção 1: Via Dashboard (Mais fácil)

1. **Acesse [railway.app](https://railway.app)**
2. **Faça login** com GitHub
3. **Clique em "New Project"**
4. **Selecione "Deploy from GitHub repo"**
5. **Escolha o repositório** `wpp-pfp-api`
6. **Clique em "Deploy Now"**

### Opção 2: Via CLI

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Fazer login
railway login

# 3. Inicializar projeto
railway init

# 4. Deploy
railway up

# 5. Ver logs (para ver QR Code)
railway logs
```

### Após o deploy:

1. **Acesse os logs** para ver o QR Code
2. **Escaneie o QR Code** com WhatsApp
3. **Use a API** via URL fornecida

## 🌐 **Deploy no Render**

### Via Dashboard:

1. **Acesse [render.com](https://render.com)**
2. **Faça login** com GitHub
3. **Clique em "New +" → "Web Service"**
4. **Conecte o repositório** `wpp-pfp-api`
5. **Configure:**
   - **Name**: `wpp-pfp-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. **Clique em "Create Web Service"**

### Após o deploy:

1. **Acesse a URL** fornecida
2. **Use a interface** para conectar WhatsApp
3. **Escaneie o QR Code** que aparecerá

## 🦸 **Deploy no Heroku**

### Via CLI:

```bash
# 1. Instalar Heroku CLI
# Windows: https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Criar app
heroku create wpp-pfp-api

# 4. Deploy
git push heroku master

# 5. Ver logs
heroku logs --tail
```

### Via Dashboard:

1. **Acesse [heroku.com](https://heroku.com)**
2. **Crie uma conta** gratuita
3. **Clique em "New" → "Create new app"**
4. **Conecte o GitHub**
5. **Selecione o repositório** e faça deploy

## 📊 **Comparação das Plataformas**

| Plataforma | Conexão Persistente | QR Code | Plano Gratuito | Facilidade |
|------------|-------------------|---------|----------------|------------|
| **Railway** | ✅ Sim | ✅ Sim | ✅ Generoso | ⭐⭐⭐⭐⭐ |
| **Render** | ✅ Sim | ✅ Sim | ✅ Bom | ⭐⭐⭐⭐ |
| **Heroku** | ✅ Sim | ✅ Sim | ❌ Pago | ⭐⭐⭐ |
| **Vercel** | ❌ Não | ❌ Não | ✅ Sim | ⭐⭐ |

## 🔧 **Configurações Específicas**

### Railway
- **Build**: Automático via Nixpacks
- **Start**: `npm start`
- **Health Check**: `/status`

### Render
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check**: `/status`

### Heroku
- **Build**: Automático via `package.json`
- **Start**: Via `Procfile`
- **Dyno**: Web (permite conexões persistentes)

## 🌍 **URLs após deploy**

### Railway
```
https://wpp-pfp-api-production.up.railway.app
```

### Render
```
https://wpp-pfp-api.onrender.com
```

### Heroku
```
https://wpp-pfp-api.herokuapp.com
```

## 🧪 **Testando após deploy**

```bash
# Verificar status
curl https://sua-url.railway.app/status

# Obter foto de perfil
curl https://sua-url.railway.app/profile-photo/5511999999999
```

## ⚠️ **Importante**

1. **Escaneie o QR Code** assim que aparecer nos logs
2. **Mantenha a conexão ativa** - não feche o terminal
3. **Use HTTPS** para requisições
4. **Monitore os logs** para problemas

## 🆘 **Solução de problemas**

### QR Code não aparece
- Verifique os logs da plataforma
- Reinicie o deploy se necessário

### Conexão perdida
- O Railway/Render/Heroku mantém a conexão
- Se perder, faça novo deploy

### Erro de timeout
- Aumente o timeout nas configurações
- Use health checks para manter ativo

## 💰 **Custos**

- **Railway**: Gratuito (500 horas/mês)
- **Render**: Gratuito (750 horas/mês)
- **Heroku**: Pago ($7/mês mínimo)

**Recomendação final: Railway** 🚀 