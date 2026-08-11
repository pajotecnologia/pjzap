// Segredos conhecidos que nunca devem valer em produção: estavam como fallback
// no código e como exemplo no .env.example, então podem ter sido copiados.
const KNOWN_WEAK_SECRETS = [
  "mysecret",
  "myanothersecret",
  "kZaOTd+YZpjRUyyuQUpigJaEMk4vcW4YOymKPZX0Ts8=",
  "dBSXqFg9TaNUEDXVp6fhMTRLBysP+j2DSqf7+raxD3A="
];

const requireSecret = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} não está definido. Gere um segredo com "openssl rand -base64 32" e configure no .env.`
    );
  }

  if (KNOWN_WEAK_SECRETS.includes(value)) {
    throw new Error(
      `${name} está usando um valor público de exemplo. Gere um segredo próprio com "openssl rand -base64 32".`
    );
  }

  if (value.length < 32) {
    throw new Error(
      `${name} é curto demais (mínimo 32 caracteres). Gere um segredo com "openssl rand -base64 32".`
    );
  }

  return value;
};

export default {
  secret: requireSecret("JWT_SECRET"),
  // expiresIn: "24h",
  expiresIn: "15m",
  refreshSecret: requireSecret("JWT_REFRESH_SECRET"),
  refreshExpiresIn: "7d"
};
