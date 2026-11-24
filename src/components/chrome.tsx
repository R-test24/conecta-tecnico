"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { GraduationCap, Menu, Moon, Sun, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { readProfile } from "@/lib/demo";
import { firebaseConfigured } from "@/lib/firebase/client";
import { useFirebaseSession } from "@/lib/firebase/session";

const subscribe = (notify: () => void) => {
  window.addEventListener("conecta-session", notify);
  return () => window.removeEventListener("conecta-session", notify);
};
const navigation = [["Início","/"],["Eventos","/eventos"],["Oportunidades","/oportunidades"],["Empresas","/empresas"],["Como funciona","/como-funciona"],["Sobre nós","/sobre"]];
export function Brand() {
  return <Link className="brand" href="/"><span className="brand-icon"><GraduationCap size={23}/></span><span>Conecta<span className="brand-accent">Técnico</span><small>EDUCAÇÃO & CARREIRA</small></span></Link>;
}
export function Header() {
  const path = usePathname();
  const demoSignedIn = useSyncExternalStore(subscribe, () => !firebaseConfigured && readProfile() !== null, () => false);
  const user = useFirebaseSession();
  const signedIn = firebaseConfigured ? Boolean(user) : demoSignedIn;
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const reduce = useReducedMotion();
  const menu = menuPath === path;
  useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; }, [dark]);
  const links = navigation.map(([label,url]) => <Link key={url} href={url} onClick={() => setMenuPath(null)} aria-current={(url === "/" ? path === url : path.startsWith(url)) ? "page" : undefined}>{label}</Link>);
  return <header className="top"><div className="wrap topbar"><Brand/><nav className="desktop" aria-label="Principal">{links}</nav><div className="header-actions"><button className="icon-button" aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"} onClick={() => setDark(!dark)}>{dark ? <Sun size={19}/> : <Moon size={18}/>}</button>{signedIn ? <Link className="button primary signup" href="/painel">Meu painel</Link> : <><Link className="login" href="/entrar">Entrar</Link><Link className="button primary signup" href="/cadastro">Criar conta</Link></>}{firebaseConfigured && <Link className="login" href="/admin" aria-label="Área administrativa" aria-current={path === "/admin" ? "page" : undefined}>Admin</Link>}<button className="icon-button hamburger" aria-label={menu ? "Fechar menu" : "Abrir menu"} aria-expanded={menu} onClick={() => setMenuPath(menu ? null : path)}>{menu ? <X/> : <Menu/>}</button></div></div><AnimatePresence>{menu && <motion.nav className="mobile-nav" aria-label="Menu móvel" initial={{opacity:0,y:reduce ? 0 : -8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>{links}{signedIn ? <Link href="/painel" onClick={() => setMenuPath(null)}>Meu painel</Link> : <><Link href="/entrar" onClick={() => setMenuPath(null)}>Entrar</Link><Link href="/cadastro" onClick={() => setMenuPath(null)}>Criar conta</Link></>}{firebaseConfigured && <Link href="/admin" onClick={() => setMenuPath(null)} aria-current={path === "/admin" ? "page" : undefined}>Área administrativa</Link>}</motion.nav>}</AnimatePresence></header>;
}
export function Footer() {
  return <footer><div className="wrap footer-grid"><div><Brand/><p>Conectando talentos às oportunidades do futuro.</p></div><nav aria-label="Rodapé">{navigation.slice(1).map(([name,url]) => <Link key={url} href={url}>{name}</Link>)}</nav>{firebaseConfigured && <Link className="button outline" href="/admin">Área administrativa</Link>}<span>© {new Date().getFullYear()} Conecta Técnico</span></div></footer>;
}
