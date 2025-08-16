// Regras de segurança do Firestore para o Sistema de Gestão VisionX
// Copie e cole estas regras no Console do Firebase -> Firestore Database -> Rules

rules_version = "2"
\
service cloud.firestore
{
  \
  match /databases/
  database
  ;/documents {
 {4}/ / Permitir
  acesso
  a
  clientes
  para
  usuários
  autenticados
  match / clientes / { document }
  \
      allow read, write:
  if request.auth != null;
  \

  // Permitir acesso a receitas para usuários autenticados
  match / receitas / { document }
  \
      allow read, write:
  if request.auth != null;
  \

  // Permitir acesso a despesas para usuários autenticados
  match / despesas / { document }
  \
      allow read, write:
  if request.auth != null;
  \

  // Permitir acesso aos perfis de usuário
  match / users / { userId }
  \
      allow read, write:
  if request.auth != null && request.auth.uid == userId;
  \
}
\
}
