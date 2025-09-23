import useAxiosWithAuth from '../../hooks/useAxiosWithAuth'
import AvisCard from '../Avis/AvisCards'

const AcceuilPresentation = () => {
  return (
    <>
      <section className="relative min-h-screen w-full bg-ecoWhite">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Nous restons fidèles à nos{' '}
            <span className="text-ecoGreen">principes.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <figure>
              <img
                src="/slidePrincipes1.webp"
                alt="Lac et forêt - symbole de l’écologie"
                className="rounded-lg shadow-lg mb-4 mx-auto"
              />
              <figcaption className="font-medium">Écologie</figcaption>
            </figure>
            <figure>
              <img
                src="/SlidePrincipes2.webp"
                alt="Groupe d’amis souriants - convivialité"
                className="rounded-lg shadow-lg mb-4 mx-auto"
              />
              <figcaption className="font-medium">Convivialité</figcaption>
            </figure>

            <figure>
              <img
                src="/slidePrincipes3.webp"
                alt="Borne de recharge pour voiture électrique - solutions modernes"
                className="rounded-lg shadow-lg mb-4 mx-auto"
              />
              <figcaption className="font-medium">
                Solutions modernes
              </figcaption>
            </figure>
          </div>
          <h3 className="text-xl font-semibold text-center mt-20 mb-8">
            Votre satisfaction au premier plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <AvisCard
              text="Covoiturage avec EcoRide m’a permis de réduire mes coûts tout en protégeant l’environnement."
              author="Julie"
              location="Lyon"
              rating={5}
            />
            <AvisCard
              text="La plateforme est simple, sécurisée et super conviviale."
              author="Karim"
              location="Paris"
              rating={4}
            />
            <AvisCard
              text="J’apprécie surtout les trajets vérifiés et la confiance entre voyageurs."
              author="Sophie"
              location="Marseille"
              rating={5}
            />
          </div>
          <footer></footer>
        </div>
      </section>
      <footer className="bg-ecoGray text-ecoWhite py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <a href="/" className="text-2xl font-bold font-display">
            <span className="text-ecoGreen">Eco</span>
            <span className="text-white">Ride</span>
          </a>
          <nav className="flex gap-6 text-sm">
            <a href="/covoiturages" className="hover:text-ecoGreen">
              Covoiturages
            </a>
            <a
              href="/contact"
              className="hover:text-ecoGreen max-[443px]:hidden"
            >
              Contact
            </a>
            <a
              href="/login"
              className="xs:hidden hover:text-ecoGreen max-[443px]:hidden"
            >
              Connexion
            </a>
            <a href="/mentions-legales" className="hover:text-ecoGreen">
              Mentions légales
            </a>
          </nav>
          <div className="text-center md:text-right text-xs text-gray-400">
            <p>contact@ecoride.fr</p>
            <p>© 2025 EcoRide. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </>
  )
}
export default AcceuilPresentation
