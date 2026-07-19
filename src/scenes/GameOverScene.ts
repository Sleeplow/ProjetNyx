import Phaser from 'phaser';
import { PLAYERS_PER_MATCH } from '../config/constants';
import { TEAM } from '../config/soccer';
import { makeButton, nightBackground } from '../ui/widgets';
import { computeFrame, watchResize } from '../ui/layout';

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
    const F = computeFrame(this);
    const isSoccer = data.mode === 'brawl-ball';

    const title = isSoccer ? (data.victory ? 'VICTOIRE !' : 'DÉFAITE') : data.victory ? 'VICTOIRE ROYALE !' : 'ÉLIMINÉ';
    const color = data.victory ? '#ffcf33' : '#ff6b5e';
    const tp = F.at(0, 200);
    this.add.text(tp.x, tp.y, title, { fontFamily: 'system-ui, sans-serif', fontSize: F.font(64), color, fontStyle: 'bold' }).setOrigin(0.5);

    const subtitle = isSoccer
      ? `${TEAM.labelA}  ${data.score?.[0] ?? 0} — ${data.score?.[1] ?? 0}  ${TEAM.labelB}`
      : `Classement : ${data.placement ?? 0}${ordinalSuffix(data.placement ?? 0)} / ${PLAYERS_PER_MATCH}`;
    const sp = F.at(0, 272);
    this.add.text(sp.x, sp.y, subtitle, { fontFamily: 'system-ui, sans-serif', fontSize: F.font(28), color: '#d8d8ff', align: 'center', wordWrap: { width: F.px(900) } }).setOrigin(0.5);

    const replayScene = isSoccer ? 'Soccer' : 'Game';
    // Boutons bien espacés : leurs zones de clic ne doivent pas se toucher, sinon
    // un tap près du centre risque de déclencher le mauvais (REJOUER ↔ MENU).
    const replay = F.at(-190, 410);
    const menu = F.at(190, 410);
    makeButton(this, replay.x, replay.y, F.px(280), F.px(66), 'REJOUER', () => this.scene.start(replayScene, { zarekId: data.zarekId, modeId: data.modeId }));
    makeButton(this, menu.x, menu.y, F.px(280), F.px(66), 'MENU', () => this.scene.start('Menu'), 0x3a3466);

    watchResize(this, () => this.scene.restart(data));
  }
}

function ordinalSuffix(n: number): string {
  return n === 1 ? 'er' : 'e';
}
