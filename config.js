// Configurações da API WhatsApp Profile Photo

module.exports = {
    // Configurações do servidor
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost'
    },

    // Configurações do WhatsApp
    whatsapp: {
        // Tempo limite para operações (em milissegundos)
        timeout: 30000,

        // Configurações de reconexão
        reconnect: {
            enabled: true,
            maxRetries: 5,
            retryDelay: 5000
        },

        // Configurações de QR Code
        qr: {
            printInTerminal: true,
            saveToFile: false
        }
    },

    // Configurações de números de telefone
    phone: {
        // Código do país padrão (Brasil)
        defaultCountryCode: '55',

        // Formatação de números
        formatting: {
            removeSpecialChars: true,
            autoAddCountryCode: true
        }
    },

    // Configurações de cache
    cache: {
        enabled: true,
        ttl: 3600000, // 1 hora em milissegundos
        maxSize: 100 // Máximo de itens no cache
    },

    // Configurações de logs
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        enableConsole: true,
        enableFile: false
    },

    // Configurações de segurança
    security: {
        // Rate limiting
        rateLimit: {
            enabled: true,
            windowMs: 15 * 60 * 1000, // 15 minutos
            maxRequests: 100 // Máximo de requisições por janela
        },

        // CORS
        cors: {
            enabled: true,
            origin: '*', // Em produção, especifique domínios específicos
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }
    }
}; 