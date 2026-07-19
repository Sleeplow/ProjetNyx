import Phaser from 'phaser';
import type { Room } from 'colyseus.js';
import { PlayerController } from '../input/PlayerController';
import { PITCH_NYXT } from '../maps/pitchNyxt';
import { COLORS } from '../config/constants';
import { TEAM } from '../config/soccer';
import { ZAREKS, ZAREK_BY_ID } from '../zareks/registry';
import type { ZarekDef } from '../core/types';
import { stepMovement } from '../shared/game/movement';
import { clamp, dist } from '../core/geometry';
import { makeButton, type Button } from '../ui/widgets';
import { createAvatarVisual, type AvatarVisual } from '../render/avatarVisual';
import { drawCartoonPitch } from '../render/pitchRender';
import { drawChainBolt } from '../render/fx';
import type { MatchSnapshot, SnapPlayer, FxEvent } from '../shared/game/snapshot';

interface Avatar {
  vis: AvatarVisual;
  zarekId: string;
  team: number;
  isSelf: boolean;
}

function zdef(id: string): ZarekDef {
  return ZAREK_BY_ID[id] ?? ZAREKS[0];
}

/**
 * Rendu d'une partie EN LIGNE (Brawl Ball 3v3). Le serveur fait autorité : cette
 * scène envoie les intentions du joueur et affiche l'état reçu. Le joueur local
 * est PRÉDIT (bouge tout de suite, se recale sur le serveur) pour masquer le lag.
 */
export class OnlineGameScene extends Phaser.Scene {
  private room!: Room;
  private zarekId = ZAREKS[0].id;
  private controller!: PlayerController;
  private snap: MatchSnapshot | null = null;

  private mode = 'brawl-ball';
  private avatars = new Map<string, Avatar>();
  private ballGfx!: Phaser.GameObjects.Container;
  private projGfx!: Phaser.GameObjects.Graphics;
  private hazGfx!: Phaser.GameObjects.Graphics;
  private zoneGfx!: Phaser.GameObjects.Graphics; // (Battle Royale) zone qui rétrécit
  private cubeGfx!: Phaser.GameObjects.Graphics; // (Battle Royale) cubes de power-up
  private dangerVignette!: Phaser.GameObjects.Rectangle; // (Battle Royale) hors zone
  private localStub = { x: PITCH_NYXT.centerX, y: PITCH_NYXT.centerY, def: zdef(ZAREKS[0].id) };
  private predX = PITCH_NYXT.centerX;
  private predY = PITCH_NYXT.centerY;
  private camX = 0;
  private camY = 0;

  // HUD
  private scoreText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private hpFill!: Phaser.GameObjects.Rectangle;
  private hpText!: Phaser.GameObjects.Text;
  private ultFill!: Phaser.GameObjects.Rectangle;
  private bigText!: Phaser.GameObjects.Text;

  // Overlays (salle d'attente / résultat)
  private overlayPhase = '';
  private overlayObjs: Phaser.GameObjects.GameObject[] = [];
  private overlayButtons: Button[] = [];
  private lobbyInfo?: Phaser.GameObjects.Text;
  private lobbyList?: Phaser.GameObjects.Text;

  // Spectateur (Battle Royale) après élimination
  private spectateId: string | null = null;
  private spectateAliveIds: string[] = [];
  private spectateBanner?: Phaser.GameObjects.Text;
  private spectateBtn?: Button;

  constructor() {
    super('OnlineGame');
  }

  create(data: { room?: Room; zarekId?: string; modeId?: string }): void {
    if (!data?.room) {
      this.scene.start('OnlineMenu');
      return;
    }
    this.room = data.room;
    this.zarekId = data.zarekId ?? ZAREKS[0].id;
    this.mode = data.modeId ?? 'brawl-ball';
    this.localStub.def = zdef(this.zarekId);
    this.snap = null;
    this.avatars = new Map();
    this.spectateId = null;

    const { width, height } = PITCH_NYXT.map;
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.setZoom(1);
    this.drawPitch();

    this.zoneGfx = this.add.graphics().setDepth(1);
    this.cubeGfx = this.add.graphics().setDepth(12);
    this.hazGfx = this.add.graphics().setDepth(11);
    this.ballGfx = this.makeBall();
    if (this.mode === 'battle-royale') this.ballGfx.setVisible(false);
    this.projGfx = this.add.graphics().setDepth(18);
    this.dangerVignette = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0xff2a2a, 0).setScrollFactor(0).setDepth(800);

    this.controller = new PlayerController(this);
    this.buildHud();

    this.predX = PITCH_NYXT.centerX;
    this.predY = PITCH_NYXT.centerY;
    this.camX = PITCH_NYXT.centerX;
    this.camY = PITCH_NYXT.centerY;
    this.cameras.main.centerOn(this.camX, this.camY);

    this.room.onMessage('snap', (s: MatchSnapshot) => {
      this.snap = s;
      this.playFx(s.fx);
    });
    this.room.onError((code, message) => this.leave(`Erreur ${code} : ${message ?? ''}`));
    this.room.onLeave(() => this.scene.isActive('OnlineGame') && this.leave());

    this.events.once('shutdown', () => {
      this.controller.destroy();
      this.destroyOverlay();
      this.teardownSpectate();
    });
  }

  update(_time: number, delta: number): void {
    if (!this.room || !this.snap) return;
    const dtMs = Math.min(delta, 50);
    const dtSec = dtMs / 1000;
    const snap = this.snap;
    const meId = this.room.sessionId;
    const me = snap.players.find((p) => p.i === meId);
    const localDef = me ? zdef(me.z) : this.localStub.def;

    // 1) Entrée + prédiction locale (le joueur local bouge tout de suite).
    this.localStub.x = this.predX;
    this.localStub.y = this.predY;
    this.localStub.def = localDef;
    const input = this.controller.getInput(this.localStub as never);

    if (me && me.al && snap.phase === 'playing') {
      let spd = localDef.moveSpeed;
      if (me.carry) spd *= 0.9;
      const moved = stepMovement(this.predX, this.predY, localDef.radius, input.moveX, input.moveY, spd, dtSec, PITCH_NYXT.map.obstacles, PITCH_NYXT.map.width, PITCH_NYXT.map.height);
      this.predX = moved.x;
      this.predY = moved.y;
      // Recalage vers l'autorité serveur : TRÈS doux en mouvement (sinon le retard
      // réseau tire le perso en arrière = effet élastique), plus ferme à l'arrêt.
      const err = dist(this.predX, this.predY, me.x, me.y);
      if (err > 240) {
        this.predX = me.x;
        this.predY = me.y;
      } else {
        const k = input.moveX !== 0 || input.moveY !== 0 ? 0.05 : 0.2;
        this.predX = Phaser.Math.Linear(this.predX, me.x, k);
        this.predY = Phaser.Math.Linear(this.predY, me.y, k);
      }
      this.room.send('input', input);
    } else if (me) {
      this.predX = me.x;
      this.predY = me.y;
    }

    // 2) Avatars.
    const seen = new Set<string>();
    for (const p of snap.players) {
      seen.add(p.i);
      if (!p.al) {
        this.avatars.get(p.i)?.vis.container.setVisible(false);
        continue;
      }
      let av = this.avatars.get(p.i);
      if (!av || av.zarekId !== p.z || av.team !== p.t) {
        av?.vis.destroy();
        av = this.spawnAvatar(p, p.i === meId);
      }
      const isSelf = p.i === meId;
      const tx = isSelf ? this.predX : p.x;
      const ty = isSelf ? this.predY : p.y;
      if (isSelf) {
        av.vis.container.setPosition(tx, ty);
      } else {
        av.vis.container.x = Phaser.Math.Linear(av.vis.container.x, tx, 0.35);
        av.vis.container.y = Phaser.Math.Linear(av.vis.container.y, ty, 0.35);
      }
      av.vis.container.setVisible(true);
      av.vis.setAim(p.a);
      av.vis.setHealth(p.hm > 0 ? p.h / p.hm : 0);
      av.vis.setUltReady(p.uc >= 100);
      av.vis.setCubes(p.cb ?? 0);
    }
    for (const [id, av] of this.avatars) {
      if (!seen.has(id)) {
        av.vis.destroy();
        this.avatars.delete(id);
      }
    }

    // 3) Balle (foot) OU zone + cubes (BR), puis projectiles + zones d'effet.
    if (this.mode === 'battle-royale') {
      this.renderZone(snap);
      this.renderCubes(snap);
      this.updateDanger(snap, me);
    } else {
      this.ballGfx.x = Phaser.Math.Linear(this.ballGfx.x, snap.ball.x, 0.5);
      this.ballGfx.y = Phaser.Math.Linear(this.ballGfx.y, snap.ball.y, 0.5);
    }
    this.projGfx.clear();
    for (const p of snap.proj) {
      this.projGfx.fillStyle(p.c, 1).fillCircle(p.x, p.y, p.r);
      this.projGfx.lineStyle(2, 0xffffff, 0.7).strokeCircle(p.x, p.y, p.r);
    }
    this.hazGfx.clear();
    for (const h of snap.haz) {
      this.hazGfx.fillStyle(h.c, 0.18).fillCircle(h.x, h.y, h.r);
      this.hazGfx.lineStyle(3, h.c, 0.7).strokeCircle(h.x, h.y, h.r);
    }

    // 4) Caméra : joueur local prédit, ou survivant observé (spectateur BR).
    const spec = this.updateSpectator(snap, me);
    const fx = spec ? spec.x : me ? this.predX : PITCH_NYXT.centerX;
    const fy = spec ? spec.y : me ? this.predY : PITCH_NYXT.centerY;
    this.camX = Phaser.Math.Linear(this.camX, fx, spec ? 0.14 : 0.12);
    this.camY = Phaser.Math.Linear(this.camY, fy, spec ? 0.14 : 0.12);
    this.cameras.main.centerOn(this.camX, this.camY);

    // 5) HUD + overlays.
    this.controller.setUltReady(!!me && me.al && me.uc >= 100 && snap.phase === 'playing');
    this.updateHud(snap, me);
    if (snap.phase !== this.overlayPhase) {
      this.buildOverlay(snap.phase);
      this.overlayPhase = snap.phase;
    }
    this.updateOverlay(snap, me);
  }

  // ---------- Rendu ----------

  private spawnAvatar(p: SnapPlayer, isSelf: boolean): Avatar {
    // FFA (Battle Royale) : anneau rouge « ennemi » pour tous les autres.
    const teamColor = this.mode === 'battle-royale' ? 0xff6b5e : p.t === 0 ? TEAM.colorA : TEAM.colorB;
    const vis = createAvatarVisual(this, zdef(p.z), { isSelf, teamColor, label: isSelf ? `${p.n} (toi)` : p.n });
    vis.container.setPosition(p.x, p.y).setDepth(isSelf ? 20 : 15);
    vis.popIn();
    const av: Avatar = { vis, zarekId: p.z, team: p.t, isSelf };
    this.avatars.set(p.i, av);
    return av;
  }

  private makeBall(): Phaser.GameObjects.Container {
    const r = 20;
    const shadow = this.add.ellipse(0, r * 0.9, r * 2.1, r * 0.9, 0x000000, 0.22);
    const body = this.add.circle(0, 0, r, COLORS.white).setStrokeStyle(3, 0x1a1a2e, 1);
    const dot = this.add.circle(0, 0, r * 0.34, 0x1a1a2e, 0.9);
    const s1 = this.add.circle(r * 0.55, -r * 0.35, r * 0.2, 0x1a1a2e, 0.7);
    const s2 = this.add.circle(-r * 0.55, r * 0.4, r * 0.2, 0x1a1a2e, 0.7);
    return this.add.container(PITCH_NYXT.centerX, PITCH_NYXT.centerY, [shadow, body, dot, s1, s2]).setDepth(14);
  }

  private playFx(fx: FxEvent[]): void {
    for (const f of fx) {
      if (f.k === 'goal') {
        this.cameras.main.shake(260, 0.008);
        const gc = (f.t ?? 0) === 0 ? TEAM.colorA : TEAM.colorB;
        for (let i = 0; i < 3; i++) {
          const ring = this.add.circle(f.x, f.y, 40, gc, 0.15).setStrokeStyle(6, gc, 0.9).setDepth(26).setScale(0.2);
          this.tweens.add({ targets: ring, scale: 2 + i * 0.6, alpha: 0, duration: 520 + i * 120, ease: 'Cubic.out', onComplete: () => ring.destroy() });
        }
        const palette = [gc, COLORS.white, COLORS.ultReady, COLORS.healthGood];
        for (let i = 0; i < 26; i++) {
          const ang = Math.random() * Math.PI * 2;
          const spd = 90 + Math.random() * 230;
          const c = this.add.rectangle(f.x, f.y, 8, 12, palette[i % palette.length]).setDepth(27).setAngle(Math.random() * 360);
          this.tweens.add({ targets: c, x: f.x + Math.cos(ang) * spd, y: f.y + Math.sin(ang) * spd + 70, angle: c.angle + 360, alpha: 0, duration: 700 + Math.random() * 320, ease: 'Quad.out', onComplete: () => c.destroy() });
        }
        const flash = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, COLORS.white, 0.32).setScrollFactor(0).setDepth(900);
        this.tweens.add({ targets: flash, alpha: 0, duration: 260, onComplete: () => flash.destroy() });
      } else if (f.k === 'ult') {
        const ring = this.add.circle(f.x, f.y, f.r ?? 100, f.c ?? 0xffffff, 0.12).setStrokeStyle(8, f.c ?? 0xffffff, 0.9).setDepth(25).setScale(0.15);
        this.tweens.add({ targets: ring, scale: 1, duration: 320, ease: 'Cubic.out' });
        this.tweens.add({ targets: ring, alpha: 0, duration: 440, ease: 'Quad.in', onComplete: () => ring.destroy() });
      } else if (f.k === 'hit') {
        const color = f.c ?? 0xffffff;
        const pop = this.add.circle(f.x, f.y, 10, COLORS.white, 0.95).setDepth(24);
        this.tweens.add({ targets: pop, scale: 2.2, alpha: 0, duration: 160, ease: 'Quad.out', onComplete: () => pop.destroy() });
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2 + Math.random() * 0.6;
          const d = 18 + Math.random() * 12;
          const shard = this.add.circle(f.x, f.y, 4, color, 1).setDepth(24);
          this.tweens.add({ targets: shard, x: f.x + Math.cos(ang) * d, y: f.y + Math.sin(ang) * d, scale: 0.2, alpha: 0, duration: 220, ease: 'Cubic.out', onComplete: () => shard.destroy() });
        }
      } else if (f.k === 'kick') {
        const ring = this.add.circle(f.x, f.y, 26, COLORS.white, 0.1).setStrokeStyle(4, COLORS.white, 0.8).setDepth(23).setScale(0.4);
        this.tweens.add({ targets: ring, scale: 1.2, alpha: 0, duration: 260, ease: 'Cubic.out', onComplete: () => ring.destroy() });
      } else if (f.k === 'death') {
        const s = this.add.circle(f.x, f.y, 26, f.c ?? 0xffffff, 0.5).setStrokeStyle(4, f.c ?? 0xffffff, 1).setDepth(24).setScale(0.6);
        this.tweens.add({ targets: s, scale: 2.6, alpha: 0, duration: 440, ease: 'Cubic.out', onComplete: () => s.destroy() });
      } else if (f.k === 'bolt') {
        drawChainBolt(this, f.x, f.y, f.x2 ?? f.x, f.y2 ?? f.y, f.c ?? 0xffffff);
      }
    }
  }

  // ---------- HUD ----------

  private buildHud(): void {
    const d = 950;
    this.scoreText = this.add.text(0, 12, '', { fontFamily: 'system-ui, sans-serif', fontSize: '30px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(d);
    this.timerText = this.add.text(0, 50, '', { fontFamily: 'system-ui, sans-serif', fontSize: '20px', fontStyle: 'bold', color: '#d8d8ff' }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(d);
    this.add.rectangle(0, 0, 260, 20, COLORS.healthBack, 0.85).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d).setName('hpback').setStrokeStyle(2, 0x000000, 0.6);
    this.hpFill = this.add.rectangle(0, 0, 260, 20, COLORS.healthGood).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d);
    this.hpText = this.add.text(0, 0, '', { fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d + 1);
    this.add.rectangle(0, 0, 260, 11, COLORS.healthBack, 0.85).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d).setName('ultback').setStrokeStyle(2, 0x000000, 0.6);
    this.ultFill = this.add.rectangle(0, 0, 0, 11, COLORS.ultReady).setOrigin(0, 0.5).setScrollFactor(0).setDepth(d);
    this.bigText = this.add.text(0, 0, '', { fontFamily: 'system-ui, sans-serif', fontSize: '52px', fontStyle: 'bold', color: '#ffffff', align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);
    this.add.text(20, 16, '‹ Quitter', { fontFamily: 'system-ui, sans-serif', fontSize: '17px', color: '#d8d8ff', fontStyle: 'bold' }).setScrollFactor(0).setDepth(1005).setInteractive({ useHandCursor: true }).on('pointerup', () => this.leave());
    this.layoutHud();
    this.scale.on('resize', this.layoutHud, this);
  }

  private layoutHud(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    this.scoreText.setPosition(w / 2, 12);
    this.timerText.setPosition(w / 2, 50);
    const hx = 24;
    const hy = h - 52;
    (this.children.getByName('hpback') as Phaser.GameObjects.Rectangle)?.setPosition(hx, hy);
    this.hpFill.setPosition(hx, hy);
    this.hpText.setPosition(hx + 8, hy);
    (this.children.getByName('ultback') as Phaser.GameObjects.Rectangle)?.setPosition(hx, hy + 20);
    this.ultFill.setPosition(hx, hy + 20);
    this.bigText.setPosition(w / 2, h / 2 - 60);
  }

  private updateHud(snap: MatchSnapshot, me?: SnapPlayer): void {
    if (this.mode === 'battle-royale') this.scoreText.setText(`🏆 Survivants : ${snap.alive ?? snap.players.filter((p) => p.al).length}`);
    else this.scoreText.setText(`${TEAM.labelA}  ${snap.score[0]} — ${snap.score[1]}  ${TEAM.labelB}`);

    if (snap.phase === 'playing') {
      if (snap.sudden) this.timerText.setText('MORT SUBITE').setColor('#ffcf33');
      else {
        const s = Math.ceil(snap.timer / 1000);
        this.timerText.setText(`${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`).setColor(s <= 15 ? '#ff6b5e' : '#d8d8ff');
      }
    } else this.timerText.setText('');

    const ratio = me && me.al ? clamp(me.h / me.hm, 0, 1) : 0;
    this.hpFill.width = 260 * ratio;
    this.hpFill.fillColor = ratio > 0.35 ? COLORS.healthGood : COLORS.healthLow;
    this.hpText.setText(me ? `${Math.ceil(me.al ? me.h : 0)} / ${me.hm}` : '');
    this.ultFill.width = me ? (260 * me.uc) / 100 : 0;
    this.ultFill.fillColor = me && me.uc >= 100 ? COLORS.ultReady : 0x8a7bd8;

    // Grand texte central (compte à rebours / but / réapparition).
    if (snap.phase === 'countdown') {
      this.bigText.setText(`${Math.max(1, Math.ceil(snap.timer / 1000))}`).setColor('#ffcf33').setVisible(true);
    } else if (snap.phase === 'goal') {
      this.bigText.setText('BUT !').setColor('#ffffff').setVisible(true);
    } else if (snap.phase === 'playing' && me && !me.al) {
      // En BR, le bandeau spectateur affiche l'état ; on masque le grand texte central.
      if (this.mode === 'battle-royale') this.bigText.setVisible(false);
      else this.bigText.setText(`Réapparition dans ${Math.ceil(me.rs / 1000)}…`).setColor('#ff6b5e').setVisible(true);
    } else {
      this.bigText.setVisible(false);
    }
  }

  // ---------- Overlays (salle d'attente / résultat) ----------

  private destroyOverlay(): void {
    for (const b of this.overlayButtons) b.destroy();
    for (const o of this.overlayObjs) o.destroy();
    this.overlayButtons = [];
    this.overlayObjs = [];
    this.lobbyInfo = undefined;
    this.lobbyList = undefined;
  }

  private buildOverlay(phase: string): void {
    this.destroyOverlay();
    const w = this.scale.width;
    const h = this.scale.height;
    const cx = w / 2;
    const D = 1000;
    const add = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
      this.overlayObjs.push(o);
      return o;
    };

    if (phase === 'lobby') {
      const isBR = this.mode === 'battle-royale';
      const py = h * 0.42;
      add(this.add.rectangle(cx, py, 520, 300, 0x120f28, 0.92).setStrokeStyle(3, 0x2f8f5a).setScrollFactor(0).setDepth(D));
      add(this.add.text(cx, py - 120, 'SALLE D’ATTENTE', { fontFamily: 'system-ui, sans-serif', fontSize: '28px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));
      this.lobbyInfo = add(this.add.text(cx, py - 82, '', { fontFamily: 'system-ui, sans-serif', fontSize: '17px', color: '#ffcf33' }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));
      if (isBR) {
        add(this.add.text(cx, py - 44, 'Chacun pour soi — dernier survivant gagne', { fontFamily: 'system-ui, sans-serif', fontSize: '15px', color: '#d8d8ff' }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));
      } else {
        add(this.add.text(cx, py - 48, 'Ton équipe :', { fontFamily: 'system-ui, sans-serif', fontSize: '16px', color: '#d8d8ff' }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));
        this.overlayButtons.push(this.uiButton(cx - 90, py - 12, 150, 46, 'BLEU', 0x2f6fd8, () => this.room.send('team', 0)));
        this.overlayButtons.push(this.uiButton(cx + 90, py - 12, 150, 46, 'ROUGE', 0xc0392b, () => this.room.send('team', 1)));
      }
      this.lobbyList = add(this.add.text(cx, isBR ? py - 12 : py + 26, '', { fontFamily: 'system-ui, sans-serif', fontSize: '15px', color: '#cfcfe6', align: 'center', lineSpacing: 3, wordWrap: { width: 480 } }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(D + 1));
      this.overlayButtons.push(this.uiButton(cx, py + 118, 260, 56, 'DÉMARRER', 0x2f8f5a, () => this.room.send('start')));
    } else if (phase === 'ended') {
      add(this.add.rectangle(cx, h * 0.42, 520, 260, 0x120f28, 0.94).setStrokeStyle(3, 0x6a4dff).setScrollFactor(0).setDepth(D));
      const me = this.snap?.players.find((p) => p.i === this.room.sessionId);
      const winner = this.snap?.winner ?? -1;
      const myTeam = me?.t ?? 0;
      const title = winner < 0 ? 'ÉGALITÉ' : winner === myTeam ? 'VICTOIRE !' : 'DÉFAITE';
      const color = winner < 0 ? '#d8d8ff' : winner === myTeam ? '#ffcf33' : '#ff6b5e';
      const sub =
        this.mode === 'battle-royale'
          ? winner < 0
            ? 'Personne n’a survécu'
            : `Survivant : ${this.snap?.players.find((p) => p.t === winner)?.n ?? '—'}`
          : `${TEAM.labelA}  ${this.snap?.score[0] ?? 0} — ${this.snap?.score[1] ?? 0}  ${TEAM.labelB}`;
      add(this.add.text(cx, h * 0.42 - 78, title, { fontFamily: 'system-ui, sans-serif', fontSize: '44px', fontStyle: 'bold', color }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));
      add(this.add.text(cx, h * 0.42 - 22, sub, { fontFamily: 'system-ui, sans-serif', fontSize: '22px', color: '#d8d8ff' }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));
      this.overlayButtons.push(this.uiButton(cx - 130, h * 0.42 + 60, 220, 58, 'REVANCHE', 0x2f8f5a, () => this.room.send('rematch')));
      this.overlayButtons.push(this.uiButton(cx + 130, h * 0.42 + 60, 220, 58, 'QUITTER', 0x3a3466, () => this.leave()));
    }
  }

  private uiButton(x: number, y: number, w: number, h: number, label: string, color: number, onClick: () => void): Button {
    const b = makeButton(this, x, y, w, h, label, onClick, color);
    // IMPORTANT : fixer le visuel ET la zone cliquable à l'écran, sinon la zone
    // suit le monde (caméra) et se décale du bouton → impossible à cliquer.
    b.setScrollFactor(0);
    b.container.setDepth(1001);
    return b;
  }

  private updateOverlay(snap: MatchSnapshot, me?: SnapPlayer): void {
    if (snap.phase === 'lobby') {
      if (this.lobbyInfo) this.lobbyInfo.setText(`Départ auto dans ${Math.ceil(snap.timer / 1000)} s  ·  places vides = bots`);
      if (this.lobbyList) {
        const humans = snap.players.filter((p) => !p.bot);
        const marker = (p: SnapPlayer) => (this.mode === 'battle-royale' ? '👤' : p.t === 0 ? '🔵' : '🔴');
        const line = humans.map((p) => `${marker(p)} ${p.n}${p.i === me?.i ? ' (toi)' : ''}`).join('   ');
        this.lobbyList.setText(humans.length ? line : '(en attente de joueurs)');
      }
    }
  }

  // ---------- Spectateur (Battle Royale) ----------

  /** Si le joueur est éliminé en BR, suit un survivant ; renvoie sa position à observer. */
  private updateSpectator(snap: MatchSnapshot, me?: SnapPlayer): { x: number; y: number } | null {
    const spectating = this.mode === 'battle-royale' && !!me && !me.al && snap.phase === 'playing';
    if (!spectating) {
      this.teardownSpectate();
      return null;
    }
    this.spectateAliveIds = snap.players.filter((p) => p.al && p.i !== me!.i).map((p) => p.i);
    if (this.spectateAliveIds.length === 0) {
      this.teardownSpectate();
      return null;
    }
    if (!this.spectateId || !this.spectateAliveIds.includes(this.spectateId)) this.spectateId = this.spectateAliveIds[0];
    const target = snap.players.find((p) => p.i === this.spectateId);
    if (!target) return null;
    if (!this.spectateBanner) this.buildSpectateUI();
    this.spectateBanner!.setText(`👁 Éliminé — tu observes ${target.n}`).setVisible(true);
    return { x: target.x, y: target.y };
  }

  private buildSpectateUI(): void {
    const cx = this.scale.width / 2;
    const by = this.scale.height * 0.16;
    this.spectateBanner = this.add.text(cx, by - 30, '', { fontFamily: 'system-ui, sans-serif', fontSize: '20px', color: '#ffcf33', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);
    this.spectateBtn = this.uiButton(cx, by + 18, 210, 48, 'Observer le suivant ›', 0x6a4dff, () => this.cycleSpectate());
  }

  private cycleSpectate(): void {
    if (this.spectateAliveIds.length === 0) return;
    const i = this.spectateAliveIds.indexOf(this.spectateId ?? '');
    this.spectateId = this.spectateAliveIds[(i + 1) % this.spectateAliveIds.length];
  }

  private teardownSpectate(): void {
    this.spectateBanner?.destroy();
    this.spectateBanner = undefined;
    this.spectateBtn?.destroy();
    this.spectateBtn = undefined;
  }

  // ---------- Divers ----------

  private leave(message?: string): void {
    try {
      this.room?.leave();
    } catch {
      /* déjà déconnecté */
    }
    if (message) console.warn(message);
    this.scene.start('OnlineMenu', { zarekId: this.zarekId, modeId: this.mode });
  }

  private drawPitch(): void {
    drawCartoonPitch(this, PITCH_NYXT, { soccer: this.mode !== 'battle-royale' });
  }

  /** (Battle Royale) Zone sûre : halo léger + anneau vif à la limite. */
  private renderZone(snap: MatchSnapshot): void {
    this.zoneGfx.clear();
    const z = snap.zone;
    if (!z) return;
    this.zoneGfx.fillStyle(0x9b4dff, 0.04).fillCircle(z.x, z.y, z.r);
    this.zoneGfx.lineStyle(10, 0x9b4dff, 0.35).strokeCircle(z.x, z.y, z.r);
    this.zoneGfx.lineStyle(5, 0xc9a3ff, 0.95).strokeCircle(z.x, z.y, z.r);
  }

  /** (Battle Royale) Cubes de power-up en losanges. */
  private renderCubes(snap: MatchSnapshot): void {
    this.cubeGfx.clear();
    for (const q of snap.cubes ?? []) {
      const r = q.r + 2;
      this.cubeGfx.fillStyle(q.c, 1);
      this.cubeGfx.lineStyle(2, 0xffffff, 0.85);
      this.cubeGfx.beginPath();
      this.cubeGfx.moveTo(q.x, q.y - r);
      this.cubeGfx.lineTo(q.x + r, q.y);
      this.cubeGfx.lineTo(q.x, q.y + r);
      this.cubeGfx.lineTo(q.x - r, q.y);
      this.cubeGfx.closePath();
      this.cubeGfx.fillPath();
      this.cubeGfx.strokePath();
    }
  }

  /** (Battle Royale) Voile rouge quand le joueur local est hors de la zone. */
  private updateDanger(snap: MatchSnapshot, me?: SnapPlayer): void {
    const z = snap.zone;
    const outside = !!z && !!me && me.al && snap.phase === 'playing' && Math.hypot(this.predX - z.x, this.predY - z.y) > z.r;
    this.dangerVignette.alpha = Phaser.Math.Linear(this.dangerVignette.alpha, outside ? 0.28 : 0, 0.15);
  }
}
