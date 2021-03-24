import './Appli.scss';
import Entete from './Entete';
import ListeDossiers from './ListeDossiers';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import Accueil from './Accueil';
import { useEffect, useState } from 'react';
import AjouterDossier from './AjouterDossier';
import * as crudDossiers from '../services/crud-dossiers';
import * as crudUtilisateurs from '../services/crud-utilisateurs';

export default function Appli() {
  // État de l'utilisateur (pas connecté = null / connecté = objet FB-Auth spécial)
  const [utilisateur, setUtilisateur] = useState(null);

  // État des dossiers (initial = tableau vide / rempli = tableau contenant les objets récupérés dans Firestore)
  const etatDossiers = useState([]);
  const [dossiers, setDossiers] = etatDossiers;

  // État de la boîte de dialogue "Ajout Dossier" (ouverte = true / fermée = false)
  const [ouvertAD, setOuvertAD] = useState(false);

 
  // Observer le changement d'état de la connexion utilisateur (FB-Auth)
  // Remarquez que ce code est dans un useEffect() car on veut l'exécuter 
  // UNE SEULE FOIS (regardez le tableau des 'deps' - dépendances) et ceci 
  // APRÈS l'affichage du composant
  useEffect(() => crudUtilisateurs.observerConnexion(setUtilisateur), []);
  
  /**
   * Gérer la soumission du formulaire pour ajouter un nouveau dossier
   * @param {string} nom nom du dossier
   * @param {string} couverture adresse URL de l'image de couverture du dossier
   * @param {string} couleur couleur associée au dossier, en format hexadécimal (avec le dièse #)
   */
  function gererAjouter(nom, couverture, couleur) {
    // Préparer l'bjet à ajouter dans la collection "dossiers" sur Firestore
    const objDossier = {
      nom: nom,
      couverture: couverture,
      couleur: couleur,
      signets: [] // ce tableau n'est pas utilisé en ce moment, mais c'est ici que je voudrais ajouter les "références" aux signets de chaque dossier (à compléter dans une autre vie)
    };
    // Créer le dossier dans Firestore
    crudDossiers.creer(utilisateur.uid, objDossier).then(
      // Modifier l'état des dossiers
      doc => setDossiers([...dossiers, {...doc.data(), id: doc.id}]) 
    );
    // Fermer la boîte de dialogue
    setOuvertAD(false);
  }

  return (
    <div className="Appli">
      {
        // Si un utilisateur est connecté :
        utilisateur ?
          <>
            <Entete utilisateur={utilisateur} />
            <section className="contenu-principal">
              <ListeDossiers utilisateur={utilisateur} etatDossiers={etatDossiers} />
              <AjouterDossier ouvert={ouvertAD} setOuvert={setOuvertAD} gererAjout={gererAjouter} />
              <Fab onClick={() => setOuvertAD(true)} className="ajoutRessource" color="primary" aria-label="Ajouter dossier">
                <AddIcon />
              </Fab>
            </section>
          </>
        // ... et sinon :
        :
          <Accueil />
      }
    </div>
  );
}
