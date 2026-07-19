import Phaser from 'phaser';
import type { Combatant } from '../core/Combatant';
import type { InputState } from '../core/types';
import { emptyInput } from '../core/types';
import { Joystick } from '../ui/Joystick';
import { safeInsets } from '../ui/layout';
import { COLORS } from '../config/constants';

/**
 * Contrôleur du joueur humain. Fusionne clavier + souris (ordi) ET double
 * joystick tactile + bouton ultimate (tablette) en un unique `InputState`.
 * Les deux modes coexistent : le jeu marche à la souris comme au doigt.
 *
 * Ordi :  ZQSD/WASD/flèches = déplacement · souris = visée · clic gauche = tir ·
 *         E ou Espace = ultimate.
 * Tablette : joystick gauche = déplacement · joystick droit = viser+tirer ·
 *            bouton = ultimate.
 */
export class PlayerController {
  private readonly scene: Phaser.Scene;
  private readonly moveStick: Joystick;
  private readonly aimStick: Joystick;
  private readonly keys: Record<string, Phaser.Input.Keyboard.Key>;

  private readonly ultBtn: Phaser.GameObjects.Arc;
  private readonly ultLabel: Phaser.GameObjects.Text;

  private ultQueued = false;
  private mouseActive = false;
  private lastAimX = 1;
  private lastAimY = 0;
  /** Dernière visée pendant qu'on maintient l'attaque (pour lancer au bon endroit à la relâche). */
  private heldAimX = 1;
  private heldAimY = 0;
  private attackWasHeld = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.moveStick = new Joystick(scene, COLORS.powerCube);
    this.aimStick = new Joystick(scene, COLORS.playerAccent);

    // Jusqu'à 3 pointeurs simultanés (2 joysticks + bouton) sur tablette.
    scene.input.addPointer(2);

    const kb = scene.input.keyboard!;
    this.keys = kb.addKeys(
      'W,A,S,D,UP,LEFT,DOWN,RIGHT',
    ) as Record<string, Phaser.Input.Keyboard.Key>;
    kb.on('keydown-E', () => (this.ultQueued = true));
    kb.on('keydown-SPACE', () => (this.ultQueued = true));

    this.ultBtn = scene.add
      .circle(0, 0, 54, COLORS.ultReady, 0.22)
      .setStrokeStyle(4, COLORS.ultReady, 0.9)
      .setScrollFactor(0)
      .setDepth(1005);
    this.ultLabel = scene.add
      .text(0, 0, 'ULT', { fontFamily: 'system-ui, sans-serif', fontSize: '20px', color: '#ffcf33', fontStyle: 'bold' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1006);
    this.layout();

    scene.scale.on('resize', this.layout, this);
    scene.input.on('pointerdown', this.onDown, this);
    scene.input.on('pointermove', this.onMove, this);
    scene.input.on('pointerup', this.onUp, this);
    scene.input.on('pointerupoutside', this.onUp, this);
  }

  private layout(): void {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const i = safeInsets();
    const bx = w - 96 - i.right;
    const by = h - 104 - i.bottom;
    this.ultBtn.setPosition(bx, by);
    this.ultLabel.setPosition(bx, by);
  }

  /** Appui sur le bouton ULT lui-même (petite tolérance pour le doigt). */
  private overUltBtn(x: number, y: number): boolean {
    return Math.hypot(x - this.ultBtn.x, y - this.ultBtn.y) <= this.ultBtn.radius + 12;
  }

  private onDown(pointer: Phaser.Input.Pointer): void {
    // Le bouton ULT est prioritaire : un appui DESSUS déclenche l'ultimate et
    // ne crée jamais de joystick. Tout le reste du coin reste dispo pour viser
    // (le joystick n'est bloqué que sur le bouton lui-même).
    if (this.overUltBtn(pointer.x, pointer.y)) {
      this.ultQueued = true;
      return;
    }
    if (!pointer.wasTouch) {
      this.mouseActive = true;
      return; // souris : visée gérée dans getInput, pas de joystick
    }
    const half = this.scene.scale.width * 0.5;
    if (pointer.x < half) {
      if (!this.moveStick.active) this.moveStick.engage(pointer.id, pointer.x, pointer.y);
    } else if (!this.aimStick.active) {
      this.aimStick.engage(pointer.id, pointer.x, pointer.y);
    }
  }

  private onMove(pointer: Phaser.Input.Pointer): void {
    if (!pointer.wasTouch) this.mouseActive = true;
    if (pointer.id === this.moveStick.pointerId) this.moveStick.move(pointer.x, pointer.y);
    if (pointer.id === this.aimStick.pointerId) this.aimStick.move(pointer.x, pointer.y);
  }

  private onUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.moveStick.pointerId) this.moveStick.release();
    if (pointer.id === this.aimStick.pointerId) this.aimStick.release();
  }

  /** Indique au bouton ultimate s'il est prêt (retour visuel). */
  setUltReady(ready: boolean): void {
    this.ultBtn.setFillStyle(COLORS.ultReady, ready ? 0.5 : 0.12);
    this.ultBtn.setStrokeStyle(3, COLORS.ultReady, ready ? 1 : 0.4);
    this.ultLabel.setAlpha(ready ? 1 : 0.5);
  }

  getInput(player: Combatant): InputState {
    const input = emptyInput();

    // --- Déplacement ---
    if (this.moveStick.active && this.moveStick.magnitude > 0.15) {
      input.moveX = this.moveStick.vecX;
      input.moveY = this.moveStick.vecY;
    } else {
      let mx = 0;
      let my = 0;
      if (this.keys.A.isDown || this.keys.LEFT.isDown) mx -= 1;
      if (this.keys.D.isDown || this.keys.RIGHT.isDown) mx += 1;
      if (this.keys.W.isDown || this.keys.UP.isDown) my -= 1;
      if (this.keys.S.isDown || this.keys.DOWN.isDown) my += 1;
      input.moveX = mx;
      input.moveY = my;
    }

    // --- Visée + tir ---
    // Pour une potion (kind 'potion'), le vecteur de visée porte AUSSI la distance :
    // souris = distance au curseur ; joystick = amplitude du stick mappée sur la portée.
    const isPotion = player.def.attack.kind === 'potion';
    let attacking = false;
    let aimX = this.lastAimX;
    let aimY = this.lastAimY;

    if (this.aimStick.active && this.aimStick.magnitude > 0.2) {
      const m = this.aimStick.magnitude;
      const nx = this.aimStick.vecX / m;
      const ny = this.aimStick.vecY / m;
      if (isPotion) {
        const range = player.def.attack.range;
        const t = Phaser.Math.Clamp((m - 0.2) / 0.8, 0, 1);
        const throwD = Phaser.Math.Linear(range * 0.4, range, t);
        aimX = nx * throwD;
        aimY = ny * throwD;
      } else {
        aimX = nx;
        aimY = ny;
      }
      attacking = true;
    } else if (this.mouseActive) {
      const mp = this.scene.input.mousePointer;
      const ax = mp.worldX - player.x;
      const ay = mp.worldY - player.y;
      if (Math.hypot(ax, ay) > 1) {
        aimX = ax;
        aimY = ay;
      }
      attacking = mp.leftButtonDown();
    } else if (input.moveX !== 0 || input.moveY !== 0) {
      aimX = input.moveX;
      aimY = input.moveY;
    }

    // On mémorise la visée tant qu'on charge, et on détecte la relâche.
    if (attacking) {
      this.heldAimX = aimX;
      this.heldAimY = aimY;
    }
    const released = this.attackWasHeld && !attacking;
    this.attackWasHeld = attacking;
    // Au moment de relâcher, on lance là où on visait pendant la charge.
    if (released) {
      aimX = this.heldAimX;
      aimY = this.heldAimY;
    }

    input.aimX = aimX;
    input.aimY = aimY;
    input.attack = attacking;
    input.attackReleased = released;
    this.lastAimX = aimX;
    this.lastAimY = aimY;

    // --- Ultimate (front montant) ---
    if (this.ultQueued) {
      input.ultimate = true;
      this.ultQueued = false;
    }

    return input;
  }

  destroy(): void {
    this.scene.scale.off('resize', this.layout, this);
    this.scene.input.off('pointerdown', this.onDown, this);
    this.scene.input.off('pointermove', this.onMove, this);
    this.scene.input.off('pointerup', this.onUp, this);
    this.scene.input.off('pointerupoutside', this.onUp, this);
  }
}
