import Phaser from 'phaser';
import { PLAYERS_PER_MATCH } from '../config/constants';
import { makeButton, nightBackground } from '../ui/widgets';

interface GameOverData {
  victory: boolean;
  placement: number;
  zarekId: string;
}

/** Écran de fin de partie. */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data: GameOverData): void {
    nightBackground(this);
    const w = this.scale.width;
    const h = this.scale.height;
    const cx = w / 2;

    const title = data.victory ? 'VICTOIRE ROYALE !' : 'ÉLIMINÉ';
    const color = data.victory ? '#ffcf33' : '#ff6b5e';
    this.add.text(cx, h * 0.3, title, { fontFamily: 'system-ui, sans-serif', fontSize: '64px', color, fontStyle: 'bold' }).setOrigin(0.5);

    this.add
      .text(cx, h * 0.3 + 70, `Classement : ${data.placement}${ordinalSuffix(data.placement)} / ${PLAYERS_PER_MATCH}`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '28px',
        color: '#d8d8ff',
      })
      .setOrigin(0.5);

    makeButton(this, cx - 160, h * 0.62, 280, 66, 'REJOUER', () => this.scene.start('Game', { zarekId: data.zarekId }));
    makeButton(this, cx + 160, h * 0.62, 280, 66, 'MENU', () => this.scene.start('Menu'), 0x3a3466);
  }
}

function ordinalSuffix(n: number): string {
  return n === 1 ? 'er' : 'e';
}
