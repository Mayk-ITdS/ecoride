import React from 'react'
import { Link } from 'react-router-dom'
export default function ContactPage() {
  const [nlOk, setNlOk] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  function handleNewsletter(e) {
    e.preventDefault()
    setNlOk(true)
  }

  function handleContact(e) {
    e.preventDefault()
    setSent(true)
    e.currentTarget.reset()
  }

  return (
    <div className="min-h-screen bg-[#0b1110] text-[#eaf1ed] antialiased">
      <header className="sticky top-0 z-50 backdrop-blur bg-[#0b1110]/70 border-b border-[#16211e]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="font-['Playfair Display'] tracking-[0.12em]
            text-2xl"
          >
            {' '}
            EcoRide
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-[#a8b8b0]">
            <Link
              to="/covoiturages"
              className="hover:text-[#5cd68e] transition"
            >
              Covoiturages
            </Link>
            <a href="#zones" className="hover:text-[#5cd68e] transition">
              Zones de service
            </a>
            <Link to="/login" className="hover:text-[#5cd68e] transition">
              Log in
            </Link>
          </nav>
          <a
            href="#form"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-tr from-[#5cd68e] to-[#9ae4bf] text-black font-medium shadow hover:saturate-125 transition"
          >
            Écrivez‑nous
          </a>
        </div>
      </header>
      <section className="grid md:grid-cols-2 min-h-[70vh]">
        <div className="relative">
          <img
            alt="Voiture partagée au lever du soleil"
            src="https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=1920&auto=format&fit=crop"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative h-full flex items-end p-8 md:p-12">
            <div className="max-w-xl">
              <h1 className="font-['Playfair Display'] text-4xl md:text-5xl leading-tight mb-2">
                Covoiturez, respirez mieux
              </h1>
              <p className="text-[#a8b8b0] mb-4">
                EcoRide connecte conducteurs et passagers pour des trajets
                quotidiens bas‑carbone.
              </p>
              <a
                href="#form"
                className="inline-flex px-5 py-3 rounded-full border border-[#16211e] hover:border-[#5cd68e] transition"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </div>
        <div className="relative">
          <img
            alt="Route verte"
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1920&auto=format&fit=crop"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative h-full flex items-end p-8 md:p-12">
            <div className="max-w-xl">
              <h2 className="font-['Playfair Display'] text-4xl md:text-5xl leading-tight mb-2">
                Événements & longues distances
              </h2>
              <p className="text-[#a8b8b0] mb-4">
                Partagez la route et divisez l’empreinte carbone pour festivals,
                week‑ends, déplacements pro.
              </p>
              <a
                href="#zones"
                className="inline-flex px-5 py-3 rounded-full border border-[#16211e] hover:border-[#5cd68e] transition"
              >
                Voir nos zones
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="border-y border-[#16211e] bg-[#0b1110]/50">
        <div className="max-w-6xl mx-auto px-5 py-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <p className="text-[#a8b8b0]">
            Recevoir les actus EcoRide (nouvelles villes, conseils éco, offres)
          </p>
          <form
            onSubmit={handleNewsletter}
            className="flex w-full md:w-auto gap-3"
          >
            <input
              required
              type="email"
              placeholder="E‑mail"
              className="w-full md:w-80 px-4 py-3 rounded-xl bg-[#0e1412] border border-[#16211e] focus:outline-none focus:ring-4 ring-[#5cd68e]/20 focus:border-[#5cd68e]"
            />
            <button className="px-5 py-3 rounded-xl bg-gradient-to-tr from-[#5cd68e] to-[#9ae4bf] text-black font-medium">
              S’abonner
            </button>
          </form>
          {nlOk && (
            <span className="text-sm text-[#9ae4bf]">
              Merci ! À très vite dans votre boîte mail.
            </span>
          )}
        </div>
      </section>
      <section
        id="contact"
        className="max-w-6xl mx-auto px-5 py-16 border-b border-[#16211e]"
      >
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h3 className="font-['Playfair Display'] text-3xl mb-2">
              Besoin d’aide ? Parlons‑en
            </h3>
            <p className="text-[#a8b8b0] mb-6">
              Réponse sous 24 h. Sélectionnez un sujet, notre équipe dédiée vous
              répondra.
            </p>

            <div className="grid sm:grid-cols-3 gap-3 mb-8">
              <button className="px-4 py-3 rounded-xl border border-[#16211e] hover:border-[#5cd68e]">
                Compte & trajets
              </button>
              <button className="px-4 py-3 rounded-xl border border-[#16211e] hover:border-[#5cd68e]">
                Entreprises
              </button>
              <button className="px-4 py-3 rounded-xl border border-[#16211e] hover:border-[#5cd68e]">
                Presse
              </button>
            </div>

            <form id="form" onSubmit={handleContact} className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#a8b8b0]">
                    Nom et prénom
                  </label>
                  <input
                    required
                    type="text"
                    className="mt-1 w-full px-4 py-3 rounded-xl bg-[#0e1412] border border-[#16211e] focus:outline-none focus:ring-4 ring-[#5cd68e]/20 focus:border-[#5cd68e]"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#a8b8b0]">E‑mail</label>
                  <input
                    required
                    type="email"
                    className="mt-1 w-full px-4 py-3 rounded-xl bg-[#0e1412] border border-[#16211e] focus:outline-none focus:ring-4 ring-[#5cd68e]/20 focus:border-[#5cd68e]"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#a8b8b0]">
                    Téléphone (optionnel)
                  </label>
                  <input
                    type="tel"
                    className="mt-1 w-full px-4 py-3 rounded-xl bg-[#0e1412] border border-[#16211e] focus:outline-none focus:ring-4 ring-[#5cd68e]/20 focus:border-[#5cd68e]"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#a8b8b0]">Sujet</label>
                  <select className="mt-1 w-full px-4 py-3 rounded-xl bg-[#0e1412] border border-[#16211e] focus:outline-none focus:ring-4 ring-[#5cd68e]/20 focus:border-[#5cd68e]">
                    <option>Question générale</option>
                    <option>Problème de trajet / paiement</option>
                    <option>Programme Entreprises</option>
                    <option>Partenariat / Presse</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-[#a8b8b0]">Message</label>
                <textarea
                  required
                  className="mt-1 min-h-[140px] w-full px-4 py-3 rounded-xl bg-[#0e1412] border border-[#16211e] focus:outline-none focus:ring-4 ring-[#5cd68e]/20 focus:border-[#5cd68e]"
                  placeholder="Décrivez brièvement votre demande…"
                />
              </div>
              <p className="text-xs text-[#a8b8b0]">
                En envoyant, vous acceptez notre Politique de confidentialité.
                EcoRide héberge sur des serveurs alimentés en énergies
                renouvelables.
              </p>
              <div className="flex items-center gap-3">
                <button className="px-6 py-3 rounded-full bg-gradient-to-tr from-[#5cd68e] to-[#9ae4bf] text-black font-semibold shadow hover:saturate-125">
                  Envoyer
                </button>
                {sent && (
                  <span className="text-sm text-[#9ae4bf]">
                    Merci ! Nous revenons vers vous très vite.
                  </span>
                )}
              </div>
            </form>
          </div>

          <aside className="space-y-4">
            <div className="p-6 rounded-2xl bg-[#0b1110]/60 border border-[#16211e]">
              <h4 className="font-['Playfair Display'] text-xl mb-2">
                Impact (30 derniers jours)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-[#16211e]">
                  <p className="text-xs text-[#a8b8b0]">CO₂ évité</p>
                  <p className="text-lg">142 t</p>
                </div>
                <div className="p-4 rounded-xl border border-[#16211e]">
                  <p className="text-xs text-[#a8b8b0]">Trajets partagés</p>
                  <p className="text-lg">18 420</p>
                </div>
                <div className="p-4 rounded-xl border border-[#16211e]">
                  <p className="text-xs text-[#a8b8b0]">Conducteurs vérifiés</p>
                  <p className="text-lg">12 700</p>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-[#0b1110]/60 border border-[#16211e]">
                <p className="text-[#a8b8b0]">Chat (lun‑ven)</p>
                <p className="text-lg">09:00–18:00</p>
              </div>
              <div className="p-6 rounded-2xl bg-[#0b1110]/60 border border-[#16211e]">
                <p className="text-[#a8b8b0]">Téléphone</p>
                <a
                  href="tel:+33123456789"
                  className="text-lg hover:text-[#5cd68e]"
                >
                  +33 1 23 45 67 89
                </a>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-[#0b1110]/60 border border-[#16211e]">
              <p className="text-[#a8b8b0]">E‑mail</p>
              <a
                href="mailto:bonjour@ecoride.example"
                className="text-lg hover:text-[#5cd68e]"
              >
                bonjour@ecoride.example
              </a>
            </div>
          </aside>
        </div>
      </section>
      <section id="zones" className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-[#16211e]">
            <iframe
              title="Carte des zones EcoRide"
              className="w-full h-[420px] grayscale-[25%]"
              src="https://maps.google.com/maps?q=France&t=&z=5&ie=UTF8&iwloc=&output=embed"
            />
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-[#16211e]">
              <h5 className="font-medium">Île‑de‑France</h5>
              <p className="text-sm text-[#a8b8b0]">
                Paris, Versailles, Marne‑la‑Vallée…
              </p>
            </div>
            <div className="p-4 rounded-xl border border-[#16211e]">
              <h5 className="font-medium">Auvergne‑Rhône‑Alpes</h5>
              <p className="text-sm text-[#a8b8b0]">Lyon, Grenoble, Annecy</p>
            </div>
            <div className="p-4 rounded-xl border border-[#16211e]">
              <h5 className="font-medium">Nouvelle‑Aquitaine</h5>
              <p className="text-sm text-[#a8b8b0]">Bordeaux, Bayonne</p>
            </div>
          </div>
        </div>
      </section>
      <footer id="faq" className="border-t border-[#16211e]">
        <div className="max-w-6xl mx-auto px-5 py-10 grid md:grid-cols-4 gap-8 text-sm">
          <div>
            <h6 className="font-['Playfair Display'] text-base mb-3">
              Contact
            </h6>
            <ul className="space-y-2 text-[#a8b8b0]">
              <li>
                <a href="#form" className="hover:text-[#5cd68e]">
                  Formulaire
                </a>
              </li>
              <li>
                <a
                  href="mailto:bonjour@ecoride.example"
                  className="hover:text-[#5cd68e]"
                >
                  E‑mail
                </a>
              </li>
              <li>
                <a href="tel:+33123456789" className="hover:text-[#5cd68e]">
                  Téléphone
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h6 className="font-['Playfair Display'] text-base mb-3">
              Sécurité & confiance
            </h6>
            <ul className="space-y-2 text-[#a8b8b0]">
              <li>Profils vérifiés</li>
              <li>Paiements sécurisés</li>
              <li>Assurance incluse</li>
            </ul>
          </div>
          <div>
            <h6 className="font-['Playfair Display'] text-base mb-3">
              Programme Entreprises
            </h6>
            <ul className="space-y-2 text-[#a8b8b0]">
              <li>Plan de mobilité</li>
              <li>Reporting CO₂</li>
            </ul>
          </div>
          <div>
            <h6 className="font-['Playfair Display'] text-base mb-3">
              Mentions
            </h6>
            <ul className="space-y-2 text-[#a8b8b0]">
              <li>Confidentialité</li>
              <li>Conditions générales</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-5 pb-10 flex items-center justify-between text-xs text-[#a8b8b0]">
          <p>© 2025 EcoRide</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => document.documentElement.classList.toggle('hc')}
              className="px-3 py-1.5 rounded-full border border-[#16211e] hover:border-[#5cd68e]"
            >
              Contraste amélioré
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
