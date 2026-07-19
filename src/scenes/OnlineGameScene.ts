import Phaser from 'phaser';
import type { Room } from 'colyseus.js';
import { PlayerController } from '../input/PlayerController';
import { PITCH_NYXT } from '../maps/pitchNyxt';
import { PORTAL_ARENA, PORTAL_REGIONS } from '../maps/portalArena';
import { COLORS } from '../config/constants';
import { TEAM } from '../config/soccer';
import { ZAREKS, ZAREK_BY_ID } from '../zareks/registry';
import type { ZarekDef, MapDef } from '../core/types';
import { stepMovement } from '../shared/game/movement';
import { clamp, dist } from '../core/geometry';
import { makeButton, type Button } from '../ui/widgets';
import { safeInsets } from '../ui/layout';
import { LeaderboardTable, type BoardRow } from '../ui/LeaderboardTable';
import { createAvatarVisual, type AvatarVisual } from '../render/avatarVisual';
import { drawCartoonPitch } from '../render/pitchRender';
import { drawChainBolt } from '../render/fx';
import type { MatchSnapshot, SnapPlayer, FxEvent } from '../shared/game/snapshot';

const TAU = Math.PI * 2;

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
  private arena: MapDef = PITCH_NYXT.map;
  private avatars = new Map<string, Avatar>();
  private ballGfx!: Phaser.GameObjects.Container;
  private projGfx!: Phaser.GameObjects.Graphics;
  private hazGfx!: Phaser.GameObjects.Graphics;
  private zoneGfx!: Phaser.GameObjects.Graphics; // (Battle Royale) zone qui rétrécit
  private cubeGfx!: Phaser.GameObjects.Graphics; // (Battle Royale) cubes de power-up
  private gasGfx!: Phaser.GameObjects.Graphics; // (Portal) voiles de neurotoxine
  private portalGfx!: Phaser.GameObjects.Graphics; // (Portal) anneaux de portails
  private fxTime = 0;
  private dangerVignette!: Phaser.GameObjects.Rectangle; // (Battle Royale) hors zone
  private quitText!: Phaser.GameObjects.Text;
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
  private endBoard?: LeaderboardTable; // tableau de classement (écran de fin)
  private specBoard?: LeaderboardTable; // tableau de classement (mode spectateur)

  // Spectateur (Battle Royale) après élimination
  private spectateId: string | null = null;
  private spectateAliveIds: string[] = [];
  private spectateBanner?: Phaser.GameObjects.Text;
  private spectateBtn?: Button;

  constructor() {
    super('OnlineGame');
  }

  /** Toute variante de Battle Royale (classic + Portal). */
  private isBR(): boolean {
    return this.mode !== 'brawl-ball';
  }
  private isPortal(): boolean {
    return this.mode === 'battle-royale-portal';
  }

  create(data: { room?: Room; zarekId?: string; modeId?: string }): void {
    if (!data?.room) {
      this.scene.start('OnlineMenu');
      return;
    }
    this.room = data.room;
    this.zarekId = data.zarekId ?? ZAREKS[0].id;
    this.mode = data.modeId ?? 'brawl-ball';
    this.arena = this.isPortal() ? PORTAL_ARENA : PITCH_NYXT.map;
    this.localStub.def = zdef(this.zarekId);
    this.snap = null;
    this.avatars = new Map();
    this.spectateId = null;
    this.fxTime = 0;

    const { width, height } = this.arena;
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.setZoom(1);
    this.drawPitch();

    this.zoneGfx = this.add.graphics().setDepth(1);
    this.cubeGfx = this.add.graphics().setDepth(12);
    this.gasGfx = this.add.graphics().setDepth(12);
    this.portalGfx = this.add.graphics().setDepth(13);
    this.hazGfx = this.add.graphics().setDepth(11);
    this.ballGfx = this.makeBall();
    if (this.isBR()) this.ballGfx.setVisible(false);
    this.projGfx = this.add.graphics().setDepth(18);
    this.dangerVignette = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0xff2a2a, 0).setScrollFactor(0).setDepth(800);

    this.controller = new PlayerController(this);
    this.buildHud();

    const acx = width / 2;
    const acy = height / 2;
    this.predX = acx;
    this.predY = acy;
    this.camX = acx;
    this.camY = acy;
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
    this.fxTime += dtMs;
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
      const moved = stepMovement(this.predX, this.predY, localDef.radius, input.moveX, input.moveY, spd, dtSec, this.arena.obstacles, this.arena.width, this.arena.height);
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
      } else if (dist(av.vis.container.x, av.vis.container.y, tx, ty) > 240) {
        av.vis.container.setPosition(tx, ty); // téléportation (Portal) : saut net, pas de glisse à travers le mur
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

    // 3) Balle (foot) OU zone/portails + cubes (BR), puis projectiles + zones d'effet.
    if (this.isBR()) {
      if (this.isPortal()) this.renderPortalFx(snap);
      else this.renderZone(snap);
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
    const fx = spec ? spec.x : me ? this.predX : this.arena.width / 2;
    const fy = spec ? spec.y : me ? this.predY : this.arena.height / 2;
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
    const teamColor = this.isBR() ? 0xff6b5e : p.t === 0 ? TEAM.colorA : TEAM.colorB;
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
    this.quitText = this.add.text(0, 0, '‹ Quitter', { fontFamily: 'system-ui, sans-serif', fontSize: '17px', color: '#d8d8ff', fontStyle: 'bold' }).setScrollFactor(0).setDepth(1005).setInteractive({ useHandCursor: true }).on('pointerup', () => this.leave());
    this.layoutHud();
    this.scale.on('resize', this.layoutHud, this);
  }

  private layoutHud(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    const i = safeInsets();
    // Voile « hors zone » : couvre tout l'écran (recalé à chaque resize).
    this.dangerVignette.setPosition(w / 2, h / 2).setSize(w, h);
    this.scoreText.setPosition(w / 2, 12 + i.top);
    this.timerText.setPosition(w / 2, 50 + i.top);
    this.quitText.setPosition(20 + i.left, 16 + i.top);
    const hx = 24 + i.left;
    const hy = h - 52 - i.bottom;
    (this.children.getByName('hpback') as Phaser.GameObjects.Rectangle)?.setPosition(hx, hy);
    this.hpFill.setPosition(hx, hy);
    this.hpText.setPosition(hx + 8, hy);
    (this.children.getByName('ultback') as Phaser.GameObjects.Rectangle)?.setPosition(hx, hy + 20);
    this.ultFill.setPosition(hx, hy + 20);
    this.bigText.setPosition(w / 2, h / 2 - 60);
  }

  private updateHud(snap: MatchSnapshot, me?: SnapPlayer): void {
    if (this.isBR()) this.scoreText.setText(`🏆 Survivants : ${snap.alive ?? snap.players.filter((p) => p.al).length}`);
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
      if (this.isBR()) this.bigText.setVisible(false);
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
    this.endBoard?.destroy();
    this.endBoard = undefined;
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
      const isBR = this.isBR();
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
      const me = this.snap?.players.find((p) => p.i === this.room.sessionId);
      const winner = this.snap?.winner ?? -1;
      const myTeam = me?.t ?? 0;
      const title = winner < 0 ? 'ÉGALITÉ' : winner === myTeam ? 'VICTOIRE !' : 'DÉFAITE';
      const color = winner < 0 ? '#d8d8ff' : winner === myTeam ? '#ffcf33' : '#ff6b5e';
      const sub = this.isBR()
        ? winner < 0
          ? 'Personne n’a survécu'
          : `Survivant : ${this.snap?.players.find((p) => p.t === winner)?.n ?? '—'}`
        : `${TEAM.labelA}  ${this.snap?.score[0] ?? 0} — ${this.snap?.score[1] ?? 0}  ${TEAM.labelB}`;
      const cy = h * 0.42;
      add(this.add.text(cx, cy - 150, title, { fontFamily: 'system-ui, sans-serif', fontSize: '36px', fontStyle: 'bold', color }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));
      add(this.add.text(cx, cy - 114, sub, { fontFamily: 'system-ui, sans-serif', fontSize: '18px', color: '#d8d8ff' }).setOrigin(0.5).setScrollFactor(0).setDepth(D + 1));
      this.endBoard = new LeaderboardTable(this, cx, cy - 92, 380, 5, 34, D + 2);
      this.overlayButtons.push(this.uiButton(cx - 130, cy + 178, 220, 56, 'REVANCHE', 0x2f8f5a, () => this.room.send('rematch')));
      this.overlayButtons.push(this.uiButton(cx + 130, cy + 178, 220, 56, 'QUITTER', 0x3a3466, () => this.leave()));
    }
  }

  /**
   * Lignes du classement : le board cumulatif du serveur FUSIONNÉ avec les
   * combattants de la manche en cours. Ainsi, dès la 1re partie, les survivants
   * (encore sans points) apparaissent quand même — on voit le top bouger en
   * direct pendant qu'on spectate, au lieu de n'afficher que les éliminés.
   */
  private boardRows(snap: MatchSnapshot): BoardRow[] {
    const byKey = new Map<string, BoardRow>();
    for (const e of snap.board ?? []) byKey.set(`${e.b ? 1 : 0}:${e.n}`, { n: e.n, s: e.s, b: e.b });
    for (const p of snap.players) {
      const k = `${p.bot ? 1 : 0}:${p.n}`;
      if (!byKey.has(k)) byKey.set(k, { n: p.n, s: 0, b: p.bot });
    }
    return [...byKey.values()].sort((a, b) => b.s - a.s || (a.b === b.b ? a.n.localeCompare(b.n) : a.b ? 1 : -1));
  }

  /** Statut « vivant / éliminé » d'une entrée du classement dans la manche en cours. */
  private boardStatus(snap: MatchSnapshot): (name: string, isBot: boolean) => 'alive' | 'dead' | null {
    return (name, isBot) => {
      if (snap.phase !== 'playing') return null;
      const p = snap.players.find((q) => q.n === name && q.bot === isBot);
      return p ? (p.al ? 'alive' : 'dead') : null;
    };
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
        const marker = (p: SnapPlayer) => (this.isBR() ? '👤' : p.t === 0 ? '🔵' : '🔴');
        const line = humans.map((p) => `${marker(p)} ${p.n}${p.i === me?.i ? ' (toi)' : ''}`).join('   ');
        this.lobbyList.setText(humans.length ? line : '(en attente de joueurs)');
      }
    }
    if (this.endBoard) this.endBoard.setData(this.boardRows(snap), me?.n, this.boardStatus(snap));
  }

  // ---------- Spectateur (Battle Royale) ----------

  /** Si le joueur est éliminé en BR, suit un survivant ; renvoie sa position à observer. */
  private updateSpectator(snap: MatchSnapshot, me?: SnapPlayer): { x: number; y: number } | null {
    const spectating = this.isBR() && !!me && !me.al && snap.phase === 'playing';
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
    // Classement en direct pendant qu'on spectate (statut 🟢/💀 qui bouge).
    this.specBoard?.setData(this.boardRows(snap), me!.n, this.boardStatus(snap));
    return { x: target.x, y: target.y };
  }

  private buildSpectateUI(): void {
    const cx = this.scale.width / 2;
    const by = this.scale.height * 0.16;
    this.spectateBanner = this.add.text(cx, by - 30, '', { fontFamily: 'system-ui, sans-serif', fontSize: '20px', color: '#ffcf33', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);
    this.spectateBtn = this.uiButton(cx, by + 18, 210, 48, 'Observer le suivant ›', 0x6a4dff, () => this.cycleSpectate());
    const i = safeInsets();
    const bw = 300;
    this.specBoard = new LeaderboardTable(this, this.scale.width - bw / 2 - 20 - i.right, 60 + i.top, bw, 4, 30, 1004);
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
    this.specBoard?.destroy();
    this.specBoard = undefined;
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
    if (this.isPortal()) {
      this.drawPortalArena();
      return;
    }
    drawCartoonPitch(this, PITCH_NYXT, { soccer: !this.isBR() });
  }

  /** Décor du tableau Portal en ligne : deux salles « labo », cloison, refuge. */
  private drawPortalArena(): void {
    const { width, height } = PORTAL_ARENA;
    const main = PORTAL_REGIONS.main;
    const refuge = PORTAL_REGIONS.refuge;
    const cell = 120;

    this.add.rectangle(main.x + main.w / 2, main.y + main.h / 2, main.w, main.h, 0x20233f).setDepth(0);
    const g = this.add.graphics().setDepth(0);
    g.lineStyle(2, 0x2f3360, 0.55);
    for (let x = main.x; x <= main.x + main.w; x += cell) g.lineBetween(x, 0, x, height);
    for (let y = 0; y <= height; y += cell) g.lineBetween(main.x, y, main.x + main.w, y);

    this.add.rectangle(refuge.x + refuge.w / 2, refuge.y + refuge.h / 2, refuge.w, refuge.h, 0x263a44).setDepth(0);
    const rg = this.add.graphics().setDepth(0);
    rg.lineStyle(2, 0x3f5f6e, 0.5);
    for (let x = refuge.x; x <= refuge.x + refuge.w; x += cell) rg.lineBetween(x, 0, x, height);
    for (let y = 0; y <= height; y += cell) rg.lineBetween(refuge.x, y, refuge.x + refuge.w, y);
    this.add.rectangle(refuge.x + refuge.w / 2, refuge.y + refuge.h / 2, refuge.w - 14, refuge.h - 14).setStrokeStyle(4, 0x46e0c0, 0.45).setDepth(1);
    this.add.text(refuge.x + refuge.w / 2, 52, '🛡  REFUGE', { fontFamily: 'system-ui, sans-serif', fontSize: '30px', color: '#8ff0dc', fontStyle: 'bold' }).setOrigin(0.5).setDepth(1);

    this.add.rectangle(width / 2, height / 2, width, height).setStrokeStyle(10, 0x5a6cff, 1).setDepth(7);

    for (const b of PORTAL_ARENA.bushes) {
      this.add.rectangle(b.x + b.w / 2, b.y + b.h / 2, b.w, b.h, 0x2fae57, 0.9).setStrokeStyle(3, 0x53d97b, 0.9).setDepth(8);
      this.add.rectangle(b.x + b.w / 2, b.y + Math.min(12, b.h * 0.22), b.w - 8, Math.min(12, b.h * 0.24), 0x5fe08d, 0.9).setDepth(8);
    }
    for (const o of PORTAL_ARENA.obstacles) {
      if (o.h >= height - 1) {
        this.add.rectangle(o.x + o.w / 2, o.y + o.h / 2, o.w, o.h, 0x3a3f66).setStrokeStyle(4, 0x181b33, 1).setDepth(9);
        const stripes = this.add.graphics().setDepth(9);
        stripes.fillStyle(0xffcf33, 0.5);
        for (let y = 0; y < height; y += 90) stripes.fillRect(o.x + 6, y + 30, o.w - 12, 30);
      } else {
        this.add.rectangle(o.x + o.w / 2, o.y + o.h / 2, o.w, o.h, 0x3c4a66).setStrokeStyle(4, 0x1b2540, 1).setDepth(9);
        this.add.rectangle(o.x + o.w / 2, o.y + Math.min(12, o.h * 0.25), o.w - 8, Math.min(14, o.h * 0.28), 0x5f739b).setDepth(9);
      }
    }
  }

  /** (Portal) Voiles de neurotoxine (grande salle / refuge) + anneaux de portails. */
  private renderPortalFx(snap: MatchSnapshot): void {
    const main = PORTAL_REGIONS.main;
    const refuge = PORTAL_REGIONS.refuge;
    const pulse = 0.85 + 0.15 * Math.sin(this.fxTime / 300);
    const gas = snap.gas ?? { m: 0, r: 0 };

    const gm = this.gasGfx;
    gm.clear();
    const mainA = Math.min(0.5, gas.m / 120) * pulse;
    if (mainA > 0.01) gm.fillStyle(COLORS.poison, mainA).fillRect(main.x, main.y, main.w, main.h);
    const refA = Math.min(0.5, gas.r / 120) * pulse;
    if (refA > 0.01) gm.fillStyle(COLORS.poison, refA).fillRect(refuge.x, refuge.y, refuge.w, refuge.h);

    const gp = this.portalGfx;
    gp.clear();
    const spin = this.fxTime / 500;
    for (const ep of snap.portals ?? []) {
      const rr = 30 + 3 * Math.sin(this.fxTime / 200 + ep.x);
      gp.fillStyle(ep.c, 0.16).fillCircle(ep.x, ep.y, rr + 10);
      gp.fillStyle(0x0b0b1a, 0.82).fillCircle(ep.x, ep.y, rr - 6);
      gp.lineStyle(6, ep.c, 0.95).strokeCircle(ep.x, ep.y, rr);
      gp.lineStyle(2, 0xffffff, 0.75).strokeCircle(ep.x, ep.y, rr - 8);
      gp.lineStyle(3, ep.c, 0.9);
      for (let k = 0; k < 3; k++) {
        const a0 = spin * 2 + (k * TAU) / 3;
        gp.beginPath();
        gp.arc(ep.x, ep.y, rr - 12, a0, a0 + 1.15);
        gp.strokePath();
      }
    }
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
    let outside = false;
    if (me && me.al && snap.phase === 'playing') {
      if (this.isPortal()) {
        const gas = snap.gas ?? { m: 0, r: 0 };
        const inRefuge = this.predX >= PORTAL_REGIONS.refugeMinX;
        outside = (inRefuge ? gas.r : gas.m) > 0;
      } else {
        const z = snap.zone;
        outside = !!z && Math.hypot(this.predX - z.x, this.predY - z.y) > z.r;
      }
    }
    this.dangerVignette.alpha = Phaser.Math.Linear(this.dangerVignette.alpha, outside ? 0.28 : 0, 0.15);
  }
}
