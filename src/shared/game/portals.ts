/**
 * Système de portails (tableau « Portal »).
 *
 * - Portails VERTS : paires fixes reliant la grande salle au refuge. Le vert
 *   mène TOUJOURS vers l'autre pièce (plusieurs verts dans la grande salle pour
 *   ne jamais coincer un joueur loin d'une sortie).
 * - Paires ITINÉRANTES (bleu / orange) : dans la grande salle, elles se
 *   déplacent ENSEMBLE à intervalle régulier — une paire est toujours complète,
 *   donc on n'est jamais bloqué.
 *
 * Logique pure (aucun Phaser) : la scène solo la fait avancer et lit l'état
 * pour le rendu ; côté serveur en ligne, le serveur la fait avancer et diffuse
 * les positions.
 */

export type PortalColor = 'green' | 'blue' | 'orange';
export type PortalRegion = 'main' | 'refuge';

interface Vec2 {
  x: number;
  y: number;
}
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Ce qu'un portail sait téléporter (joueur solo ou combattant serveur). */
export interface PortalActor {
  id: string;
  x: number;
  y: number;
  alive: boolean;
  def: { radius: number };
}

/** Définition d'une paire de portails à la création. */
export interface PortalPairSpawn {
  color: PortalColor;
  /** true = paire itinérante (se relocalise) ; false = paire fixe (verts). */
  roaming: boolean;
  a: Vec2;
  b: Vec2;
  aRegion: PortalRegion;
  bRegion: PortalRegion;
}

export interface PortalConfig {
  /** Distance de déclenchement (centre de l'acteur ↔ centre du portail). */
  triggerRadius: number;
  /** Décalage de sortie pour ne pas rester collé au portail d'arrivée. */
  landingOffset: number;
  /** Temps d'immunité après une téléportation (évite le rebond immédiat). */
  cooldownMs: number;
  /** Intervalle de relocalisation des paires itinérantes (ms). */
  relocateMs: number;
}

export interface PortalEndpoint {
  color: PortalColor;
  colorHex: number;
  x: number;
  y: number;
  /** Index du portail partenaire dans le tableau. */
  link: number;
  region: PortalRegion;
  roaming: boolean;
  /** Identifiant de paire (les paires itinérantes se déplacent ensemble). */
  pair: number;
}

const COLOR_HEX: Record<PortalColor, number> = {
  green: 0x46e06a,
  blue: 0x4db4ff,
  orange: 0xff9d3c,
};

export class PortalSystem {
  readonly endpoints: PortalEndpoint[] = [];
  private readonly cooldowns = new Map<string, number>();
  private relocTimer = 0;
  /** Accumulateur d'animation (rotation du tourbillon), lu par le rendu. */
  spin = 0;

  private readonly mainCenter: Vec2;
  private readonly refugeCenter: Vec2;

  constructor(
    pairs: PortalPairSpawn[],
    private readonly bounds: { main: Rect; refuge: Rect },
    private readonly cfg: PortalConfig,
    /** Prédicat : la position est-elle libre (hors obstacle/bord) ? */
    private readonly isFreeSpot: (x: number, y: number, margin: number) => boolean,
  ) {
    this.mainCenter = { x: bounds.main.x + bounds.main.w / 2, y: bounds.main.y + bounds.main.h / 2 };
    this.refugeCenter = { x: bounds.refuge.x + bounds.refuge.w / 2, y: bounds.refuge.y + bounds.refuge.h / 2 };

    pairs.forEach((p, pairId) => {
      const iA = this.endpoints.length;
      const iB = iA + 1;
      this.endpoints.push({ color: p.color, colorHex: COLOR_HEX[p.color], x: p.a.x, y: p.a.y, link: iB, region: p.aRegion, roaming: p.roaming, pair: pairId });
      this.endpoints.push({ color: p.color, colorHex: COLOR_HEX[p.color], x: p.b.x, y: p.b.y, link: iA, region: p.bRegion, roaming: p.roaming, pair: pairId });
    });
  }

  update(dtMs: number): void {
    this.spin += dtMs / 1000;
    for (const [id, cd] of this.cooldowns) {
      const next = cd - dtMs;
      if (next <= 0) this.cooldowns.delete(id);
      else this.cooldowns.set(id, next);
    }
    this.relocTimer += dtMs;
    if (this.relocTimer >= this.cfg.relocateMs) {
      this.relocTimer = 0;
      this.relocateRoaming();
    }
  }

  /** Tente de téléporter l'acteur s'il est sur un portail. Renvoie true si téléporté. */
  tryTeleport(actor: PortalActor): boolean {
    if (!actor.alive) return false;
    if ((this.cooldowns.get(actor.id) ?? 0) > 0) return false;

    const trig = this.cfg.triggerRadius;
    for (const ep of this.endpoints) {
      const dx = actor.x - ep.x;
      const dy = actor.y - ep.y;
      if (dx * dx + dy * dy > trig * trig) continue;
      const dest = this.endpoints[ep.link];
      const center = dest.region === 'refuge' ? this.refugeCenter : this.mainCenter;
      let nx = center.x - dest.x;
      let ny = center.y - dest.y;
      const l = Math.hypot(nx, ny);
      if (l < 1e-3) {
        nx = 0;
        ny = 1;
      } else {
        nx /= l;
        ny /= l;
      }
      const off = this.cfg.landingOffset;
      actor.x = dest.x + nx * off;
      actor.y = dest.y + ny * off;
      this.cooldowns.set(actor.id, this.cfg.cooldownMs);
      return true;
    }
    return false;
  }

  /** Portail vert le plus proche dans une région donnée (pour l'IA en fuite). */
  nearestGreenTo(x: number, y: number, region: PortalRegion): Vec2 | null {
    let best: Vec2 | null = null;
    let bestD = Infinity;
    for (const ep of this.endpoints) {
      if (ep.color !== 'green' || ep.region !== region) continue;
      const d = (ep.x - x) ** 2 + (ep.y - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = { x: ep.x, y: ep.y };
      }
    }
    return best;
  }

  private relocateRoaming(): void {
    const pairs = new Map<number, PortalEndpoint[]>();
    for (const ep of this.endpoints) {
      if (!ep.roaming) continue;
      const arr = pairs.get(ep.pair) ?? [];
      arr.push(ep);
      pairs.set(ep.pair, arr);
    }
    for (const eps of pairs.values()) {
      if (eps.length !== 2) continue;
      const a = this.randSpotInMain();
      let b = this.randSpotInMain();
      // Éloigne les deux extrémités pour que la paire couvre du terrain.
      let tries = 0;
      while ((b.x - a.x) ** 2 + (b.y - a.y) ** 2 < 520 * 520 && tries < 12) {
        b = this.randSpotInMain();
        tries++;
      }
      eps[0].x = a.x;
      eps[0].y = a.y;
      eps[1].x = b.x;
      eps[1].y = b.y;
    }
  }

  private randSpotInMain(): Vec2 {
    const r = this.bounds.main;
    const margin = 70;
    for (let i = 0; i < 40; i++) {
      const x = r.x + margin + Math.random() * (r.w - margin * 2);
      const y = r.y + margin + Math.random() * (r.h - margin * 2);
      if (this.isFreeSpot(x, y, margin)) return { x, y };
    }
    return { x: this.mainCenter.x, y: this.mainCenter.y };
  }
}
