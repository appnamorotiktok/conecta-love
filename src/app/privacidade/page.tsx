export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-sm leading-relaxed text-foreground">
      <h1 className="text-2xl font-bold">Política de Privacidade</h1>
      <p className="mt-2 text-muted-foreground">Última atualização: 05/07/2026</p>

      <p className="mt-6">
        Esta política explica como o ConectaLove coleta, usa e protege os
        dados dos usuários da plataforma.
      </p>

      <h2 className="mt-6 text-lg font-semibold">1. Quais dados coletamos</h2>
      <p className="mt-2">
        Nome completo, e-mail, data de nascimento, cidade, profissão, biografia,
        fotos, gênero e orientação sexual (necessários para o funcionamento do
        serviço de relacionamento), além de mensagens trocadas dentro do chat
        e recomendações escritas por terceiros.
      </p>

      <h2 className="mt-6 text-lg font-semibold">2. Dados sensíveis</h2>
      <p className="mt-2">
        Orientação sexual é considerada dado sensível pela LGPD (Lei Geral de
        Proteção de Dados). Coletamos esse dado apenas com a sua autorização
        expressa no cadastro, exclusivamente para viabilizar a funcionalidade
        principal do aplicativo (apresentar pessoas compatíveis).
      </p>

      <h2 className="mt-6 text-lg font-semibold">3. Finalidade do tratamento</h2>
      <p className="mt-2">
        Os dados são usados para: criar e exibir seu perfil, sugerir e
        viabilizar matches, permitir a troca de mensagens, processar
        recomendações de amigos, e (quando aplicável) processar assinaturas e
        comissões de indicação.
      </p>

      <h2 className="mt-6 text-lg font-semibold">4. Compartilhamento com terceiros</h2>
      <p className="mt-2">
        Seus dados são armazenados com o Supabase (infraestrutura de banco de
        dados e autenticação). Quando o pagamento de assinatura for ativado,
        dados de cobrança serão compartilhados com o Asaas, processador de
        pagamentos. Não vendemos dados pessoais a terceiros.
      </p>

      <h2 className="mt-6 text-lg font-semibold">5. Seus direitos</h2>
      <p className="mt-2">
        Você pode acessar, corrigir ou excluir seus dados a qualquer momento.
        A exclusão da conta (disponível na tela "Meu perfil") apaga
        permanentemente seu perfil, fotos, mensagens, matches e demais dados
        associados.
      </p>

      <h2 className="mt-6 text-lg font-semibold">6. Contato</h2>
      <p className="mt-2">
        Dúvidas sobre esta política podem ser enviadas para o e-mail de
        contato informado no aplicativo.
      </p>

      <p className="mt-8 text-xs text-muted-foreground">
        Este documento é um modelo inicial e não substitui a revisão de um
        profissional jurídico antes do lançamento comercial da plataforma.
      </p>
    </main>
  );
}
