export default function MentionsLegales() {
  return (
    <div className="bg-white rounded-2xl shadow p-6 max-w-3xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Mentions légales</h2>
      <section>
        <h3 className="font-medium">Éditeur du site</h3>
        <p className="text-gray-600 text-sm">
          EcoRide — Société XYZ, 10 rue de l'Exemple, 75000 Paris —
          contact@ecoride.fr
        </p>
      </section>
      <section>
        <h3 className="font-medium">Hébergement</h3>
        <p className="text-gray-600 text-sm">
          Hébergé par ACME Cloud, 99 avenue du Cloud, 75000 Paris.
        </p>
      </section>
      <section>
        <h3 className="font-medium">Données personnelles</h3>
        <p className="text-gray-600 text-sm">
          Les données collectées sont nécessaires au fonctionnement du service
          (inscription, réservation, avis). Conformément au RGPD, vous disposez
          d’un droit d’accès, de rectification et d’effacement en écrivant à
          dpo@ecoride.fr.
        </p>
      </section>
      <section>
        <h3 className="font-medium">Propriété intellectuelle</h3>
        <p className="text-gray-600 text-sm">
          Tous les contenus présents sur le site sont protégés. Toute
          reproduction sans autorisation est interdite.
        </p>
      </section>
    </div>
  )
}
