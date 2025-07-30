const express = require('express');
const cors = require('cors');
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const isVercel = process.env.VERCEL === '1';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Variável global para armazenar a conexão do WhatsApp
let sock = null;
let isConnected = false;
let currentQR = null;

// Função para inicializar a conexão do WhatsApp
async function connectToWhatsApp() {
    console.log('🔗 Iniciando conexão WhatsApp...');
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    sock = makeWASocket({
        auth: state,
        defaultQueryTimeoutMs: undefined,
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Log para debug
        if (connection) {
            console.log(`📡 Status da conexão: ${connection}`);
        }

        if (qr) {
            console.log('\n📱 QR Code gerado! Escaneie com o WhatsApp:');
            console.log('='.repeat(50));

            try {
                // Gerar QR Code como texto no terminal
                const qrText = await qrcode.toString(qr, {
                    type: 'terminal',
                    small: true
                });
                console.log(qrText);
                console.log('='.repeat(50));
                console.log('💡 Dica: Se o QR Code não aparecer bem, tente aumentar o tamanho da janela do terminal');

                // Gerar QR Code como imagem para a web
                const qrImage = await qrcode.toDataURL(qr, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
                currentQR = qrImage;
                console.log('✅ QR Code disponível na interface web!');
            } catch (error) {
                console.log('❌ Erro ao gerar QR Code:', error.message);
                console.log('🔗 QR Code string:', qr);
                currentQR = qr; // Usar string como fallback
            }
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

            // Verificar se é um erro de restart necessário (código 515)
            const isRestartRequired = lastDisconnect?.error?.message?.includes('restart required') ||
                lastDisconnect?.error?.data?.reason === '515' ||
                lastDisconnect?.error?.data?.code === '515';

            // Verificar se é um erro de Connection Failure
            const isConnectionFailure = lastDisconnect?.error?.message?.includes('Connection Failure');

            if (isConnectionFailure) {
                console.log('❌ Erro de conexão - sessão pode estar corrompida');
                console.log('🔄 Limpe os dados e tente conectar novamente');
                isConnected = false;
                currentQR = null;
            } else if (isRestartRequired) {
                console.log('🔄 Restart necessário após pairing, reconectando...');
                // Não limpar isConnected para permitir reconexão
                setTimeout(() => {
                    console.log('🔄 Iniciando reconexão após restart...');
                    connectToWhatsApp();
                }, 3000); // Aguardar 3 segundos para restart
            } else if (shouldReconnect && isConnected) {
                console.log('Conexão perdida, tentando reconectar...');
                setTimeout(() => {
                    if (isConnected) { // Só reconectar se ainda estiver marcado como conectado
                        connectToWhatsApp();
                    }
                }, 5000); // Aguardar 5 segundos antes de reconectar
            } else {
                console.log('Conexão fechada - não reconectando automaticamente');
                isConnected = false;
                currentQR = null;
            }
        } else if (connection === 'open') {
            console.log('✅ Conectado ao WhatsApp!');
            isConnected = true;
            currentQR = null; // Limpar QR Code quando conectado
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

// Rota para verificar status da conexão
app.get('/status', (req, res) => {
    res.json({
        connected: isConnected,
        qrCode: currentQR,
        message: isConnected ? 'Conectado ao WhatsApp' : 'Desconectado do WhatsApp'
    });
});

// Rota para obter foto de perfil
app.get('/profile-photo/:number', async (req, res) => {
    try {
        const { number } = req.params;

        if (!isConnected || !sock) {
            return res.status(503).json({
                error: 'WhatsApp não está conectado. Aguarde a conexão ser estabelecida.'
            });
        }

        // Formatar o número (remover caracteres especiais e adicionar @c.us)
        let formattedNumber = number.replace(/[^\d]/g, '');

        // Adicionar código do país se não estiver presente
        if (!formattedNumber.startsWith('55')) {
            formattedNumber = '55' + formattedNumber;
        }

        const jid = formattedNumber + '@s.whatsapp.net';

        console.log(`Tentando obter foto de perfil para: ${jid}`);

        // Obter foto de perfil
        const profilePictureUrl = await sock.profilePictureUrl(jid, 'image');

        res.json({
            success: true,
            number: number,
            jid: jid,
            profilePictureUrl: profilePictureUrl
        });

    } catch (error) {
        console.error('Erro ao obter foto de perfil:', error);

        if (error.message.includes('404')) {
            return res.status(404).json({
                error: 'Foto de perfil não encontrada para este número',
                number: req.params.number
            });
        }

        res.status(500).json({
            error: 'Erro interno do servidor',
            message: error.message
        });
    }
});

// Rota para conectar ao WhatsApp
app.post('/connect', async (req, res) => {
    try {
        if (isConnected) {
            return res.json({
                success: true,
                message: 'Já conectado ao WhatsApp',
                connected: true
            });
        }

        // Limpar estado anterior
        if (sock) {
            try {
                sock.end();
            } catch (e) {
                // Ignorar erros ao fechar conexão
            }
            sock = null;
        }
        isConnected = false;
        currentQR = null;

        // Sempre limpar dados antigos para forçar nova sessão
        try {
            const authDir = 'auth_info_baileys';
            if (fs.existsSync(authDir)) {
                const files = fs.readdirSync(authDir);
                files.forEach(file => {
                    fs.unlinkSync(path.join(authDir, file));
                });
                fs.rmdirSync(authDir);
                console.log('🗑️ Dados de autenticação removidos para nova sessão');
            }
        } catch (cleanError) {
            console.log('⚠️ Erro ao limpar dados:', cleanError.message);
        }

        console.log('🔄 Iniciando nova conexão com WhatsApp...');

        console.log('📱 Aguarde o QR Code aparecer...');
        await connectToWhatsApp();

        res.json({
            success: true,
            message: 'Iniciando conexão com WhatsApp. Aguarde o QR Code...',
            connected: false
        });

    } catch (error) {
        console.error('Erro ao conectar:', error);
        res.status(500).json({
            success: false,
            error: 'Erro ao conectar com WhatsApp',
            message: error.message
        });
    }
});

// Rota de health check para monitoramento
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        connected: isConnected
    });
});

// Rota para desconectar do WhatsApp
app.post('/disconnect', async (req, res) => {
    try {
        if (sock) {
            // Desconectar do WhatsApp
            await sock.logout();
            sock.end();
            sock = null;
            isConnected = false;
            currentQR = null;

            // Limpar dados de autenticação
            try {
                const authDir = 'auth_info_baileys';
                if (fs.existsSync(authDir)) {
                    const files = fs.readdirSync(authDir);
                    files.forEach(file => {
                        fs.unlinkSync(path.join(authDir, file));
                    });
                    fs.rmdirSync(authDir);
                    console.log('🗑️ Dados de autenticação removidos');
                }
            } catch (cleanError) {
                console.log('⚠️ Erro ao limpar dados de autenticação:', cleanError.message);
            }

            console.log('✅ Desconectado do WhatsApp com sucesso');
        }

        res.json({
            success: true,
            message: 'Desconectado do WhatsApp com sucesso',
            connected: false
        });

    } catch (error) {
        console.error('Erro ao desconectar:', error);

        // Mesmo com erro, limpar o estado
        sock = null;
        isConnected = false;
        currentQR = null;

        res.json({
            success: true,
            message: 'Desconectado do WhatsApp (com erro, mas estado limpo)',
            connected: false
        });
    }
});

// Rota de teste
app.get('/', (req, res) => {
    res.json({
        message: 'API WhatsApp Profile Photo',
        endpoints: {
            'GET /status': 'Verificar status da conexão',
            'POST /connect': 'Conectar ao WhatsApp',
            'POST /disconnect': 'Desconectar do WhatsApp',
            'GET /profile-photo/:number': 'Obter foto de perfil por número'
        },
        example: {
            url: '/profile-photo/5511999999999',
            description: 'Obter foto de perfil do número 11 99999-9999'
        },
        interface: {
            url: '/index.html',
            description: 'Interface gráfica para testar a API'
        }
    });
});

// Rota para a interface gráfica
app.get('/interface', (req, res) => {
    res.redirect('/index.html');
});

// Iniciar servidor
if (!isVercel) {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`📱 API WhatsApp Profile Photo`);
        console.log(`🌐 http://localhost:${PORT}`);
        console.log(`🎨 Interface gráfica: http://localhost:${PORT}/index.html`);
        console.log(`\nPara usar a API:`);
        console.log(`1. Acesse a interface: http://localhost:${PORT}/index.html`);
        console.log(`2. Clique em "Conectar" e escaneie o QR Code`);
        console.log(`3. Digite um número e clique em "Buscar"`);
        console.log(`\nOu use via API:`);
        console.log(`- GET /status - Verificar status`);
        console.log(`- POST /connect - Conectar ao WhatsApp`);
        console.log(`- GET /profile-photo/5511999999999 - Obter foto de perfil`);
    });

    // Não conectar automaticamente - aguardar comando do usuário
    console.log('📱 Aguardando comando para conectar ao WhatsApp...');
    console.log('💡 Clique em "Conectar" na interface para iniciar');
} else {
    console.log('🚀 API WhatsApp Profile Photo - Deployado no Vercel');
    console.log('📱 Use a interface local para conectar ao WhatsApp');
}

// Exportar para Vercel
module.exports = app; 