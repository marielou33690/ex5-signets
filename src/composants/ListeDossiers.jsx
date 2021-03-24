import './ListeDossiers.scss';
import Dossier from './Dossier';
import * as crudDossiers from '../services/crud-dossiers';
import { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

export default function ListeDossiers({utilisateur, etatDossiers}) {
  // État des dossiers (vient du composant Appli)
  const [dossiers, setDossiers] = etatDossiers;

   // Select
   const utiliserStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 220,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }));

  const classes = utiliserStyles();
  const [optionTri, setOptionTri] = useState('datemodif-desc');

  const gererChangement = (event) => {
    setOptionTri(event.target.value);
  };

  // Lire les dossiers dans Firestore et forcer le réaffichage du composant
  // Remarquez que ce code est dans un useEffect() car on veut l'exécuter 
  // UNE SEULE FOIS (regardez le tableau des 'deps' - dépendances) et ceci 
  // APRÈS l'affichage du composant pour que la requête asynchrone à Firestore  
  // ait eu le temps d'être complétée et le réaffichage du composant soit
  // forcé par la mutation de l'état des dossiers
  useEffect(
    () => {
      crudDossiers.lireTout(utilisateur.uid, optionTri).then(
        dossiers => setDossiers(dossiers)
      )
    }, [optionTri, dossiers]
  );

  /**
   * Gérer le clic du bouton 'supprimer' correspondant au dossier identifié en argument
   * @param {string} idd identifiant Firestore du dossier
   */
  async function gererSupprimer(idd) {
    // On fait appel à la méthode supprimer de notre code d'interaction avec Firestore
    crudDossiers.supprimer(utilisateur.uid, idd).then(
      () => {
        const tempDossiers = [...dossiers]; // copier le tableau des dossiers existants
        const dossiersRestants = tempDossiers.filter((elt) => elt.id!==idd); // filtrer pour garder tous les dossiers sauf celui qu'on a demandé de supprimer
        setDossiers(dossiersRestants); // Muter l'état pour forcer le réaffichage du composant
      }).catch(erreur => console.log('Échec de la suppression - Firestore a répondu :', erreur.message));
  }
  
  return (
    <>
    <FormControl className={ `${classes.formControl} option-tri`}>
      <InputLabel shrink id="demo-simple-select-placeholder-label-label">
        Tri des dossiers
      </InputLabel>
      <Select
        labelId="demo-simple-select-placeholder-label-label"
        id="demo-simple-select-placeholder-label"
        value={optionTri}
        onChange={gererChangement}
        displayEmpty
        className={classes.selectEmpty}
      >
        <MenuItem value={"datemodif-desc"}>Date de modification descendante</MenuItem>
        <MenuItem value={"nom-asc"}>Nom de dossier ascendant</MenuItem>
        <MenuItem value={"nom-desc"}>Nom de dossier descendant</MenuItem>
      </Select>
    </FormControl>
    <ul className="ListeDossiers">
      {
        (dossiers.length > 0) ?
          dossiers.map(dossier => <li key={dossier.id}><Dossier {...dossier} gererSupprimer={gererSupprimer} /></li>)
        :
          <li className="msgAucunDossier">
            Votre liste de dossiers est vide 
            <p>;-(</p>
          </li>
      }
    </ul>
    </>
  );
}