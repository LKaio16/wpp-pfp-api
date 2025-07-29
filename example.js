// Exemplo de como usar a API WhatsApp Profile Photo

// Função para verificar o status da conexão
async function checkStatus() {
    try {
        const response = await fetch('http://localhost:3000/status');
        const data = await response.json();
        console.log('Status da conexão:', data);
        return data.connected;
    } catch (error) {
        console.error('Erro ao verificar status:', error);
        return false;
    }
}

// Função para obter foto de perfil
async function getProfilePhoto(number) {
    try {
        const response = await fetch(`http://localhost:3000/profile-photo/${number}`);
        const data = await response.json();

        if (data.success) {
            console.log('✅ Foto encontrada!');
            console.log('Número:', data.number);
            console.log('URL da foto:', data.profilePictureUrl);
            return data.profilePictureUrl;
        } else {
            console.log('❌ Erro:', data.error);
            return null;
        }
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
        return null;
    }
}

// Função para conectar ao WhatsApp
async function connectWhatsApp() {
    try {
        const response = await fetch('http://localhost:3000/connect', {
            method: 'POST'
        });
        const data = await response.json();
        console.log('Conexão:', data.message);
        return data.connected;
    } catch (error) {
        console.error('Erro ao conectar:', error);
        return false;
    }
}

// Exemplo de uso
async function main() {
    console.log('🔍 Verificando status da API...');

    // Verificar se está conectado
    const isConnected = await checkStatus();

    if (!isConnected) {
        console.log('📱 Conectando ao WhatsApp...');
        await connectWhatsApp();
        console.log('⚠️  Escaneie o QR Code no console do servidor');
        console.log('⏳ Aguardando conexão...');

        // Aguardar um pouco para a conexão ser estabelecida
        await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Exemplos de números para testar
    const testNumbers = [
        '5511999999999',  // Com código do país
        '11999999999',    // Sem código do país
        '11-99999-9999'   // Com formatação
    ];

    console.log('\n📸 Testando obtenção de fotos de perfil...');

    for (const number of testNumbers) {
        console.log(`\n🔍 Buscando foto para: ${number}`);
        const photoUrl = await getProfilePhoto(number);

        if (photoUrl) {
            console.log(`✅ Sucesso! URL: ${photoUrl}`);
        } else {
            console.log(`❌ Não foi possível obter a foto`);
        }

        // Aguardar um pouco entre as requisições
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Executar o exemplo
if (typeof window === 'undefined') {
    // Node.js
    const fetch = require('node-fetch');
    main();
} else {
    // Browser
    main();
}

// Para usar no Node.js, instale node-fetch:
// npm install node-fetch 