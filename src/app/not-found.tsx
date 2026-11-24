import Link from "next/link";
export default function NotFound() {
  return <section className="wrap section"><h1>Página não encontrada</h1><Link className="button primary" href="/">Voltar ao início</Link></section>;
}
