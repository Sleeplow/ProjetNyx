/**
 * Noms des effets sonores — fichier de TYPES PURS (aucun code exécuté, aucune
 * dépendance DOM/Web Audio). Il est importé à la fois par le moteur audio
 * (`sfx.ts`, côté navigateur) et par les définitions de Zarek (`core/types.ts`),
 * lesquelles sont partagées avec le SERVEUR — dont le typecheck tourne sans la
 * bibliothèque DOM. Garder cette liste ici évite d'y tirer Web Audio.
 */
export type SfxName =
  // Interface
  | 'click' // tap sur un bouton
  // Attaques génériques (repli quand un Zarek n'a pas de son dédié)
  | 'shoot' // tir de base
  | 'bolt' // éclair
  | 'potion' // lancer de potion
  | 'splash' // flaque de potion qui s'étale
  // Attaques SIGNATURE par Zarek
  | 'shoot_wave' // Zephyr — « Ondes sonores »
  | 'shoot_heavy' // Atlas — « Impact »
  | 'rock_break' // Atlas — roche qui éclate au sol
  | 'potion_hecate' // Hécate — « Potion toxique »
  | 'bolt_astrape' // Astrapé — « Éclair »
  // Ultimes SIGNATURE par Zarek
  | 'ult_wave' // Zephyr — « Break Dance »
  | 'ult_quake' // Atlas — « Séisme »
  | 'ult_poison' // Hécate — « Aura de poison »
  | 'ult_thunder' // Astrapé — « Surcharge »
  // Combat / déroulé de partie
  | 'hit' // impact sur un combattant
  | 'kick' // frappe de la balle (Brawl Ball)
  | 'ult' // ultime générique (repli)
  | 'ultready' // jauge d'ultime pleine (joueur local)
  | 'goal' // but marqué
  | 'death' // élimination
  | 'cube' // gemme de puissance ramassée
  | 'countdown' // bip du compte à rebours « 3-2-1 »
  | 'go' // top départ
  | 'whistle' // coup de sifflet (engagement)
  | 'victory' // fin de partie gagnée
  | 'defeat' // fin de partie perdue
  | 'teleport'; // passage de portail

/** Sons signature d'un Zarek (repli sur le son générique si absent). */
export interface ZarekSound {
  /** Son de l'attaque de base. */
  attack?: SfxName;
  /** Son de l'ultimate. */
  ult?: SfxName;
}
