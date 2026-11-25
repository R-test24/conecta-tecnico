export const roles = ["estudante","empresa","escola"] as const;
export type Role = typeof roles[number];
export type Profile = { name: string; role: Role; email: string };

type DemoAccount = Profile & { salt: string; passwordHash: string };

const sessionKey = "conecta-demo-session";
const accountKey = (email: string) => "conecta-demo-account:" + email;
const normalizeEmail = (email: string) => email.trim().toLowerCase();

function readAccount(email: string): DemoAccount | null {
  const account = JSON.parse(localStorage.getItem(accountKey(email)) ?? "null") as DemoAccount | null;
  return account && account.email === email && typeof account.name === "string"
    && roles.includes(account.role) && typeof account.salt === "string"
    && typeof account.passwordHash === "string" ? account : null;
}

async function hashPassword(password: string, salt: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const hash = await crypto.subtle.deriveBits({
    name: "PBKDF2", salt: encoder.encode(salt), iterations: 600_000, hash: "SHA-256",
  }, key, 256);
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function registerDemoAccount(profile: Profile, password: string) {
  const email = normalizeEmail(profile.email);
  const name = profile.name.trim();
  if (name.length < 2 || name.length > 60 || !email || !roles.includes(profile.role)
    || password.length < 8 || password.length > 128) {
    throw new Error("Confira o nome, o perfil, o e-mail e a senha.");
  }
  if (readAccount(email)) throw new Error("Já existe uma conta com esse e-mail neste navegador.");
  const salt = crypto.randomUUID();
  const passwordHash = await hashPassword(password, salt);
  if (readAccount(email)) throw new Error("Já existe uma conta com esse e-mail neste navegador.");
  localStorage.setItem(accountKey(email), JSON.stringify({ name, role: profile.role, email, salt, passwordHash }));
}

export async function signInDemoAccount(email: string, password: string) {
  const account = readAccount(normalizeEmail(email));
  if (!account || await hashPassword(password, account.salt) !== account.passwordHash) {
    throw new Error("E-mail ou senha incorretos neste navegador.");
  }
  sessionStorage.setItem(sessionKey, account.email);
  window.dispatchEvent(new Event("conecta-session"));
}

export function signOutDemoAccount() {
  sessionStorage.removeItem(sessionKey);
  window.dispatchEvent(new Event("conecta-session"));
}

export type DemoData = {
  events:string[];
  jobs:string[];
  posts:{id:string;title:string;type:string;description:string;image?:string;date?:string;time?:string;city?:string;location?:string;course?:string;seats?:number;requirements?:string}[];
};
export const emptyData:DemoData = {events:[],jobs:[],posts:[]};
export function readProfile():Profile | null {
  try {
    const email = sessionStorage.getItem(sessionKey);
    const account = email ? readAccount(email) : null;
    return account ? { name: account.name, role: account.role, email: account.email } : null;
  } catch { return null; }
}
const key = (profile: Profile) => "conecta-demo-data:" + profile.email;
export function readData(profile:Profile):DemoData {
  try {return JSON.parse(localStorage.getItem(key(profile)) ?? "null") ?? emptyData;}
  catch {return emptyData;}
}
export function saveData(profile:Profile, data:DemoData) {
  localStorage.setItem(key(profile),JSON.stringify(data));
}
