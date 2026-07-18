import Phaser from 'phaser';
import { PLAYERS_PER_MATCH } from '../config/constants';
import { TEAM } from '../config/soccer';
import { makeButton, nightBackground } from '../ui/widgets';

interface GameOverData {
  victory: boolean;
  zarekId: string;
  /** Mode de la partie (pour l'affichage et le bouton REJOUER). */
  mode?: 'battle-royale' | 'brawl-ball';
  modeId?: string;
  /** Battle Royale : classement final. */
  placement?: number;
  /** Brawl Ball : score final [équipe 0, équipe 1]. */
  score?: [number, number];
}

/** Écran de fin de partie (Battle Royale ou Brawl Ball). */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data: GameOverData): void {
    nightBackground(this);
    const w = this.scale.width;
    const h = this.scale.height;
    const cx = w / 2;
    const isSoccer = data.mode === 'brawl-ball';

    const title = isSoccer ? (data.victory ? 'VICTOIRE !' : 'DÉFAITE') : data.victory ? 'VICTOIRE ROYALE !' : 'ÉLIMINÉ';
    const color = data.victory ? '#ffcf33' : '#ff6b5e';
    this.add.text(cx, h * 0.3, title, { fontFamily: 'system-ui, sans-serif', fontSize: '64px', color, fontStyle: 'bold' }).setOrigin(0.5);

    const subtitle = isSoccer
      ? `${TEAM.labelA}  ${data.score?.[0] ?? 0} — ${data.score?.[1] ?? 0}  ${TEAM.labelB}`
      : `Classement : ${data.placement ?? 0}${ordinalSuffix(data.placement ?? 0)} / ${PLAYERS_PER_MATCH}`;
    this.add.text(cx, h * 0.3 + 70, subtitle, { fontFamily: 'system-ui, sans-serif', fontSize: '28px', color: '#d8d8ff' }).setOrigin(0.5);

    const replayScene = isSoccer ? 'Soccer' : 'Game';
    // Boutons bien espacés : leurs zones de clic ne doivent pas se toucher, sinon
    // un tap près du centre risque de déclencher le mauvais (REJOUER ↔ MENU).
    makeButton(this, cx - 200, h * 0.62, 280, 66, 'REJOUER', () => this.scene.start(replayScene, { zarekId: data.zarekId, modeId: data.modeId }));
    makeButton(this, cx + 200, h * 0.62, 280, 66, 'MENU', () => this.scene.start('Menu'), 0x3a3466);
  }
}

function ordinalSuffix(n: number): string {
  return n === 1 ? 'er' : 'e';
}
