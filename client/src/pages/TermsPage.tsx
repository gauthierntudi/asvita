import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { TermsFooterLink } from '../components/legal/TermsFooterLink';
import { useAppNavigation } from '../context/AppNavigationContext';
import '../styles/mobile-form-surface.css';
import '../styles/terms.css';

export function TermsPage() {
  const { closeTerms } = useAppNavigation();

  useEffect(() => {
    document.body.classList.add('terms-active');
    return () => document.body.classList.remove('terms-active');
  }, []);

  return (
    <div className="terms-screen">
      <div className="terms-frame">
        <div className="terms-bg mobile-form-surface" aria-hidden="true" />

        <div className="terms-content">
          <header className="terms-header">
            <button type="button" className="terms-back" onClick={closeTerms}>
              <ArrowLeft size={20} strokeWidth={2} aria-hidden="true" />
              Retour
            </button>
          </header>

          <article className="terms-article">
            <h1 className="terms-title">Conditions générales d&apos;utilisation (CGU)</h1>
            <p className="terms-subtitle">Plateforme Vita Connect</p>
            <p className="terms-meta">Dernière mise à jour : Juin 2026</p>

            <section>
              <h2>1. Présentation</h2>
              <p>
                La plateforme Vita Connect est exploitée par Aksys Digital SAS, société de droit
                congolais ayant son siège à Kinshasa, République Démocratique du Congo.
              </p>
              <p>
                La plateforme est mise à la disposition des supporters de l&apos;Association Sportive
                Vita dans le cadre d&apos;un partenariat conclu entre le Club et Aksys Digital SAS.
              </p>
              <p>
                L&apos;utilisation de la plateforme implique l&apos;acceptation pleine et entière des
                présentes Conditions Générales d&apos;Utilisation.
              </p>
            </section>

            <section>
              <h2>2. Objet de la plateforme</h2>
              <p>
                Vita Connect a pour objet de permettre l&apos;identification, l&apos;enregistrement et
                la gestion des supporters du Club à travers l&apos;attribution d&apos;un Numéro Supporter
                Officiel ainsi que l&apos;émission de cartes digitales ou physiques permettant leur
                identification au sein de la communauté du Club.
              </p>
              <p>
                La plateforme constitue également une infrastructure destinée à renforcer la relation
                entre le Club et ses supporters et à accompagner le développement futur de services
                liés à cette communauté.
              </p>
            </section>

            <section>
              <h2>3. Conditions d&apos;accès</h2>
              <p>L&apos;inscription est réservée aux personnes âgées d&apos;au moins dix-huit (18) ans.</p>
              <p>
                Toute personne procédant à son inscription garantit l&apos;exactitude des informations
                communiquées lors de son enregistrement.
              </p>
              <p>
                L&apos;utilisateur s&apos;engage à maintenir des informations exactes et à jour pendant
                toute la durée de validité de son inscription.
              </p>
            </section>

            <section>
              <h2>4. Processus d&apos;inscription</h2>
              <p>L&apos;inscription comprend :</p>
              <ol className="terms-list terms-list--roman">
                <li>La saisie des informations demandées ;</li>
                <li>Le paiement des frais applicables ;</li>
                <li>L&apos;attribution d&apos;un Numéro Supporter Officiel unique ;</li>
                <li>La génération d&apos;une carte digitale ;</li>
                <li>Le cas échéant, la production d&apos;une carte physique.</li>
              </ol>
              <p>
                L&apos;inscription n&apos;est considérée comme valide qu&apos;après réception effective du
                paiement.
              </p>
            </section>

            <section>
              <h2>5. Frais d&apos;inscription</h2>
              <p>
                Les frais d&apos;inscription sont ceux affichés sur la plateforme au moment de la
                souscription.
              </p>
              <p>
                Ces frais sont exigibles immédiatement et conditionnent l&apos;activation de
                l&apos;inscription.
              </p>
              <p>Les frais perçus sont définitivement acquis dès validation de la transaction.</p>
              <p>Ils ne sont ni remboursables ni transférables.</p>
            </section>

            <section>
              <h2>6. Paiement incomplet ou dossier incomplet</h2>
              <p>
                Lorsqu&apos;un paiement a été effectué mais que le processus d&apos;inscription n&apos;a pas
                été finalisé, les sommes versées demeurent acquises.
              </p>
              <p>
                La situation fera l&apos;objet d&apos;un traitement manuel par les équipes de support afin
                de permettre, dans la mesure du possible, la finalisation de l&apos;inscription.
              </p>
            </section>

            <section>
              <h2>7. Validité de l&apos;inscription</h2>
              <p>
                Toute inscription est valable pour une durée de douze (12) mois à compter de sa date
                d&apos;activation.
              </p>
              <p>
                À l&apos;issue de cette période, le Numéro Supporter Officiel ainsi que les cartes
                associées deviennent inactifs jusqu&apos;au renouvellement de l&apos;inscription.
              </p>
            </section>

            <section>
              <h2>8. Numéro Supporter Officiel</h2>
              <p>Chaque supporter enregistré se voit attribuer un Numéro Supporter Officiel unique.</p>
              <p>
                Ce numéro constitue exclusivement un identifiant permettant son enregistrement et sa
                reconnaissance au sein de la plateforme.
              </p>
              <p>
                Il ne confère aucun droit de propriété, aucun droit de gouvernance, aucun droit de
                vote institutionnel et aucune participation dans le Club ou dans Aksys Digital SAS.
              </p>
            </section>

            <section>
              <h2>9. Fan clubs</h2>
              <p>
                L&apos;inscription sur la plateforme peut permettre l&apos;affiliation à un fan club
                reconnu ou partenaire.
              </p>
              <p>
                Toutefois, cette affiliation demeure soumise aux règles propres du fan club concerné.
              </p>
            </section>

            <section>
              <h2>10. Cartes digitales et physiques</h2>
              <p>
                Chaque supporter enregistré reçoit une carte digitale comportant un QR Code sécurisé.
              </p>
              <p>Les souscripteurs de l&apos;offre Premium peuvent également recevoir une carte physique.</p>
              <p>Les cartes sont strictement personnelles et ne peuvent être cédées à des tiers.</p>
              <p>
                En cas de perte, de vol ou de détérioration d&apos;une carte physique, son remplacement
                pourra être demandé moyennant le paiement d&apos;un montant forfaitaire de quinze dollars
                américains (15 USD).
              </p>
            </section>

            <section>
              <h2>11. Sécurité et vérification</h2>
              <p>Les QR Codes émis par la plateforme sont reliés à une base de données centralisée.</p>
              <p>
                Leur consultation permet de vérifier l&apos;authenticité de l&apos;inscription et le statut
                du supporter.
              </p>
              <p>
                Aksys se réserve le droit de suspendre ou désactiver tout identifiant présentant des
                anomalies ou faisant l&apos;objet d&apos;une utilisation frauduleuse.
              </p>
            </section>

            <section>
              <h2>12. Fraude et fausses déclarations</h2>
              <p>
                Toute fausse déclaration, usurpation d&apos;identité, utilisation frauduleuse d&apos;un QR
                Code ou fourniture volontaire d&apos;informations inexactes peut entraîner :
              </p>
              <ul className="terms-list">
                <li>L&apos;annulation immédiate de l&apos;inscription ;</li>
                <li>La désactivation du Numéro Supporter Officiel ;</li>
                <li>La suppression des avantages associés.</li>
              </ul>
              <p>Aucun remboursement ne pourra être réclamé dans ce cas.</p>
            </section>

            <section>
              <h2>13. Données collectées</h2>
              <p>Dans le cadre de l&apos;inscription, la plateforme peut collecter notamment :</p>
              <ul className="terms-list">
                <li>Nom et prénom ;</li>
                <li>Date de naissance ;</li>
                <li>Sexe ;</li>
                <li>Numéro de téléphone ;</li>
                <li>Ville ;</li>
                <li>Commune ;</li>
                <li>Quartier ;</li>
                <li>Profession ;</li>
                <li>Informations relatives à l&apos;utilisation de la plateforme.</li>
              </ul>
              <p>
                L&apos;utilisateur reconnaît que ces informations sont nécessaires au bon fonctionnement
                du service.
              </p>
            </section>

            <section>
              <h2>14. Utilisation des données</h2>
              <p>
                En utilisant la plateforme, l&apos;utilisateur autorise expressément le traitement de ses
                données par :
              </p>
              <ul className="terms-list">
                <li>Le Club ;</li>
                <li>Aksys Digital SAS ;</li>
                <li>Les partenaires autorisés du Club ;</li>
                <li>Les partenaires autorisés d&apos;Aksys Digital SAS.</li>
              </ul>
              <p>Ces données peuvent être utilisées dans le cadre :</p>
              <ul className="terms-list">
                <li>De la gestion des supporters ;</li>
                <li>De la communication institutionnelle ;</li>
                <li>Des campagnes d&apos;information ;</li>
                <li>Des activités liées aux services proposés par la plateforme ;</li>
                <li>
                  Du développement de nouveaux services destinés à la communauté des supporters.
                </li>
              </ul>
            </section>

            <section>
              <h2>15. Communications</h2>
              <p>
                L&apos;utilisateur accepte de recevoir des communications relatives aux activités du Club,
                de la plateforme et de leurs partenaires.
              </p>
              <p>Ces communications peuvent être transmises notamment par :</p>
              <ul className="terms-list">
                <li>SMS ;</li>
                <li>WhatsApp ;</li>
                <li>Courrier électronique ;</li>
                <li>Notifications digitales.</li>
              </ul>
            </section>

            <section>
              <h2>16. Données statistiques et anonymisées</h2>
              <p>
                Aksys Digital SAS et le Club peuvent produire, exploiter et partager des statistiques
                globales, agrégées ou anonymisées issues de la plateforme.
              </p>
              <p>
                Aucune donnée nominative ne sera communiquée dans ce cadre sans fondement légitime.
              </p>
            </section>

            <section>
              <h2>17. Évolution des services</h2>
              <p>La plateforme est conçue comme une infrastructure évolutive.</p>
              <p>
                À ce titre, elle pourra intégrer à l&apos;avenir des fonctionnalités complémentaires,
                notamment :
              </p>
              <ul className="terms-list">
                <li>Services digitaux ;</li>
                <li>Billetterie ;</li>
                <li>Contributions communautaires ;</li>
                <li>Cotisations ;</li>
                <li>Vente de produits ou services ;</li>
                <li>Programmes de fidélité ;</li>
                <li>Services proposés par les partenaires.</li>
              </ul>
              <p>
                L&apos;utilisateur accepte que ces services puissent être progressivement intégrés à
                l&apos;écosystème de la plateforme et puissent, selon leur nature, être soumis à des
                conditions particulières, frais de service ou commissions spécifiques qui seront
                communiqués préalablement à leur utilisation.
              </p>
            </section>

            <section>
              <h2>17.1 Frais de services et frais tiers</h2>
              <p>
                Dans le cadre de l&apos;exploitation de la plateforme et des services qui y sont proposés,
                certains services peuvent être soumis à des frais additionnels.
              </p>
              <p>Ces frais peuvent notamment résulter :</p>
              <ul className="terms-list">
                <li>De l&apos;intervention de partenaires techniques ;</li>
                <li>Des réseaux de télécommunications ;</li>
                <li>Des opérateurs mobile money ;</li>
                <li>Des établissements financiers ;</li>
                <li>Des services de messagerie électronique ou SMS ;</li>
                <li>Des plateformes de paiement ;</li>
                <li>Des services logistiques ;</li>
                <li>
                  Ou de tout autre prestataire nécessaire à l&apos;exécution du service concerné.
                </li>
              </ul>
              <p>
                Lorsque de tels frais sont applicables, ils sont portés à la connaissance de
                l&apos;utilisateur avant la validation de l&apos;opération concernée.
              </p>
              <p>
                L&apos;utilisateur reconnaît que ces frais peuvent être distincts des frais d&apos;inscription
                à la plateforme et qu&apos;ils peuvent varier selon le service utilisé, le partenaire
                concerné ou la localisation géographique de l&apos;utilisateur.
              </p>
              <p>
                Aksys Digital SAS se réserve le droit de percevoir directement ou indirectement des
                frais de service, commissions ou rémunérations liés à l&apos;utilisation des
                fonctionnalités proposées sur la plateforme, dans le respect des informations
                communiquées à l&apos;utilisateur.
              </p>
            </section>

            <section>
              <h2>18. Propriété intellectuelle</h2>
              <p>
                Les marques, logos, contenus, logiciels, interfaces, bases de données, algorithmes,
                codes sources, statistiques et technologies exploités sur la plateforme demeurent la
                propriété de leurs titulaires respectifs.
              </p>
              <p>
                Aucune disposition des présentes ne saurait être interprétée comme un transfert de
                propriété au profit des utilisateurs.
              </p>
            </section>

            <section>
              <h2>19. Désactivation</h2>
              <p>Un utilisateur peut demander la désactivation de son compte.</p>
              <p>Cette désactivation ne donne lieu à aucun remboursement.</p>
              <p>
                Les données nécessaires à la gestion administrative, financière ou légale du service
                peuvent être conservées conformément aux obligations applicables.
              </p>
            </section>

            <section>
              <h2>20. Responsabilité</h2>
              <p>
                Aksys Digital SAS met en œuvre les moyens raisonnables nécessaires pour assurer la
                disponibilité et la sécurité de la plateforme.
              </p>
              <p>Toutefois, sa responsabilité ne saurait être engagée en cas :</p>
              <ul className="terms-list">
                <li>D&apos;interruption temporaire du service ;</li>
                <li>De défaillance d&apos;un opérateur tiers ;</li>
                <li>De force majeure ;</li>
                <li>D&apos;utilisation abusive de la plateforme par un utilisateur.</li>
              </ul>
            </section>

            <section>
              <h2>21. Modification des conditions</h2>
              <p>
                Aksys Digital SAS se réserve le droit de modifier les présentes Conditions Générales
                d&apos;Utilisation à tout moment.
              </p>
              <p>
                Les nouvelles versions seront publiées sur la plateforme et entreront en vigueur dès
                leur mise en ligne.
              </p>
            </section>

            <section>
              <h2>22. Contact</h2>
              <p>Pour toute question relative à la plateforme :</p>
              <ul className="terms-list terms-list--contact">
                <li>WhatsApp : [À compléter]</li>
                <li>Email : [À compléter]</li>
              </ul>
            </section>

            <section>
              <h2>23. Droit applicable</h2>
              <p>
                Les présentes Conditions Générales d&apos;Utilisation sont régies par le droit de la
                République Démocratique du Congo.
              </p>
              <p>
                Tout différend sera soumis, à défaut d&apos;accord amiable, aux juridictions compétentes
                de la République Démocratique du Congo.
              </p>
            </section>
          </article>

          <footer className="terms-footer">
            <TermsFooterLink className="terms-footer__link" />
            <span className="terms-footer__credit">Powered by Aksys Digital</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
