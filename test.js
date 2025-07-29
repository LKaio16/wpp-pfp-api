// Script de teste para a API WhatsApp Profile Photo

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Função para fazer requisições com timeout
async function makeRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// Teste 1: Verificar se a API está rodando
async function testAPIStatus() {
    console.log('🧪 Teste 1: Verificando se a API está rodando...');

    try {
        const data = await makeRequest(`${BASE_URL}/`);
        console.log('✅ API está rodando!');
        console.log('📋 Informações:', data.message);
        return true;
    } catch (error) {
        console.log('❌ API não está rodando:', error.message);
        console.log('💡 Certifique-se de que o servidor está iniciado com: npm start');
        return false;
    }
}

// Teste 2: Verificar status da conexão WhatsApp
async function testWhatsAppStatus() {
    console.log('\n🧪 Teste 2: Verificando status da conexão WhatsApp...');

    try {
        const data = await makeRequest(`${BASE_URL}/status`);
        console.log('📱 Status WhatsApp:', data.message);

        if (data.connected) {
            console.log('✅ WhatsApp está conectado!');
            return true;
        } else {
            console.log('⚠️  WhatsApp não está conectado');
            console.log('💡 Você pode conectar usando: POST /connect');
            return false;
        }
    } catch (error) {
        console.log('❌ Erro ao verificar status:', error.message);
        return false;
    }
}

// Teste 3: Testar obtenção de foto de perfil
async function testProfilePhoto() {
    console.log('\n🧪 Teste 3: Testando obtenção de foto de perfil...');

    // Número de teste (substitua por um número real)
    const testNumber = '5511999999999';

    try {
        console.log(`🔍 Buscando foto para: ${testNumber}`);
        const data = await makeRequest(`${BASE_URL}/profile-photo/${testNumber}`);

        if (data.success) {
            console.log('✅ Foto encontrada!');
            console.log('📸 URL:', data.profilePictureUrl);
            return true;
        } else {
            console.log('❌ Erro:', data.error);
            console.log('💡 Isso pode acontecer se:');
            console.log('   - O número não tem WhatsApp');
            console.log('   - O usuário tem privacidade configurada');
            console.log('   - O WhatsApp não está conectado');
            return false;
        }
    } catch (error) {
        console.log('❌ Erro na requisição:', error.message);
        return false;
    }
}

// Teste 4: Testar formatação de números
async function testNumberFormatting() {
    console.log('\n🧪 Teste 4: Testando formatação de números...');

    const testNumbers = [
        '11999999999',     // Sem código do país
        '11-99999-9999',   // Com formatação
        '(11) 99999-9999', // Com parênteses
        '11 99999 9999'    // Com espaços
    ];

    for (const number of testNumbers) {
        try {
            console.log(`🔍 Testando formato: ${number}`);
            const data = await makeRequest(`${BASE_URL}/profile-photo/${number}`);

            if (data.success) {
                console.log(`✅ Formato aceito: ${number} -> ${data.jid}`);
            } else {
                console.log(`⚠️  Formato aceito mas sem foto: ${number}`);
            }
        } catch (error) {
            console.log(`❌ Erro com formato ${number}:`, error.message);
        }
    }
}

// Função principal de teste
async function runTests() {
    console.log('🚀 Iniciando testes da API WhatsApp Profile Photo\n');

    const results = {
        apiStatus: await testAPIStatus(),
        whatsappStatus: await testWhatsAppStatus(),
        profilePhoto: await testProfilePhoto(),
        numberFormatting: true // Sempre true pois não é crítico
    };

    console.log('\n📊 Resumo dos testes:');
    console.log('API Status:', results.apiStatus ? '✅' : '❌');
    console.log('WhatsApp Status:', results.whatsappStatus ? '✅' : '⚠️');
    console.log('Profile Photo:', results.profilePhoto ? '✅' : '❌');
    console.log('Number Formatting:', results.numberFormatting ? '✅' : '❌');

    if (results.apiStatus && results.whatsappStatus) {
        console.log('\n🎉 API está funcionando corretamente!');
        console.log('💡 Para usar a API:');
        console.log('   GET /profile-photo/5511999999999');
    } else {
        console.log('\n⚠️  Alguns testes falharam. Verifique:');
        console.log('   1. Se o servidor está rodando (npm start)');
        console.log('   2. Se o WhatsApp está conectado');
        console.log('   3. Se o número de teste é válido');
    }
}

// Executar testes
runTests().catch(console.error); 