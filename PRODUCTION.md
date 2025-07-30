# 🚀 Deploy em Produção - API WhatsApp Profile Photo

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Git configurado
- Acesso SSH ao servidor (se VPS)
- Conta no serviço de cloud (se PaaS)

## 🎯 Opções de Deploy

### 1. **Render (Recomendado para começar)**
- ✅ Gratuito para começar
- ✅ Deploy automático via Git
- ✅ SSL automático
- ⚠️ Spin down após inatividade (plano free)

### 2. **Railway (Melhor para conexões persistentes)**
- ✅ Sem spin down
- ✅ Deploy automático
- ✅ SSL automático
- 💰 $5/mês após uso gratuito

### 3. **VPS (DigitalOcean, AWS, etc.)**
- ✅ Controle total
- ✅ Sem limitações
- ⚠️ Requer configuração manual
- 💰 $5-10/mês

## 🚀 Deploy no Render

### Passo 1: Preparar o Projeto
```bash
# Instalar dependências
npm install

# Testar localmente
npm start
```

### Passo 2: Deploy no Render
1. Acesse [render.com](https://render.com)
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - **Name**: `wpp-pfp-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (para começar)

### Passo 3: Variáveis de Ambiente
Adicione no Render:
```
NODE_ENV=production
PORT=10000
```

### Passo 4: Health Check
O Render vai usar automaticamente: `/health`

## 🚀 Deploy no Railway

### Passo 1: Preparar
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login
```

### Passo 2: Deploy
```bash
# Inicializar projeto
railway init

# Deploy
railway up

# Abrir no navegador
railway open
```

## 🖥️ Deploy em VPS (DigitalOcean)

### Passo 1: Configurar Servidor
```bash
# Conectar via SSH
ssh root@seu-ip

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Instalar PM2
npm install -g pm2

# Instalar Nginx
apt install nginx -y
```

### Passo 2: Deploy da Aplicação
```bash
# Clonar projeto
git clone https://github.com/LKaio16/wpp-pfp-api.git
cd wpp-pfp-api

# Instalar dependências
npm install

# Criar diretório de logs
mkdir logs

# Iniciar em produção
npm run prod

# Salvar configuração PM2
pm2 save
pm2 startup
```

### Passo 3: Configurar Nginx
```bash
# Criar configuração
nano /etc/nginx/sites-available/wpp-pfp-api
```

Conteúdo:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
ln -s /etc/nginx/sites-available/wpp-pfp-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Passo 4: SSL com Certbot
```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
certbot --nginx -d seu-dominio.com
```

## 🔧 Comandos de Produção

### PM2 (VPS)
```bash
# Iniciar aplicação
npm run prod

# Ver logs
npm run prod:logs

# Monitorar
npm run prod:monitor

# Reiniciar
npm run prod:restart

# Parar
npm run prod:stop
```

### Render/Railway
```bash
# Ver logs
railway logs  # Railway
# Ou no dashboard do Render

# Reiniciar
railway service restart  # Railway
# Ou no dashboard do Render
```

## 📊 Monitoramento

### Health Check
```bash
# Verificar status
curl https://sua-api.com/health

# Resposta esperada:
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "memory": {...},
  "connected": true
}
```

### Logs
```bash
# PM2 (VPS)
pm2 logs wpp-pfp-api

# Railway
railway logs

# Render
# Dashboard → Logs
```

## 🔒 Segurança

### Variáveis de Ambiente
```bash
# Nunca commitar senhas/keys
echo ".env" >> .gitignore
echo "auth_info_baileys/" >> .gitignore
```

### Firewall (VPS)
```bash
# Configurar UFW
ufw allow ssh
ufw allow 'Nginx Full'
ufw enable
```

## 🚨 Troubleshooting

### Problema: App não inicia
```bash
# Verificar logs
pm2 logs wpp-pfp-api

# Verificar porta
netstat -tlnp | grep :3000

# Reiniciar
pm2 restart wpp-pfp-api
```

### Problema: WhatsApp desconecta
```bash
# Verificar conexão
curl https://sua-api.com/status

# Reconectar via interface
# Acesse: https://sua-api.com
```

### Problema: Erro de memória
```bash
# Aumentar limite PM2
pm2 restart wpp-pfp-api --max-memory-restart 2G
```

## 📈 Escalabilidade

### Para mais tráfego:
1. **Upgrade do plano** (Render/Railway)
2. **Load Balancer** (VPS)
3. **Múltiplas instâncias** (PM2 cluster)

### Monitoramento avançado:
- **New Relic** para performance
- **Sentry** para erros
- **UptimeRobot** para uptime

## 🎯 Próximos Passos

1. **Deploy no Render** (mais fácil)
2. **Configurar domínio personalizado**
3. **Monitorar logs e performance**
4. **Configurar backup automático**
5. **Implementar rate limiting**

---

**🎉 Sua API está pronta para produção!** 