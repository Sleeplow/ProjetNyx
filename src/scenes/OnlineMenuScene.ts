import Phaser from 'phaser';
import { makeButton, nightBackground } from '../ui/widgets';
import { computeFrame, watchResize } from '../ui/layout';
import { NetClient, type JoinOptions } from '../net/NetClient';
import { serverUrl } from '../net/config';
import { ZAREKS } from '../zareks/registry';
import type { Room } from 'colyseus.js';

/**
 * Lobby en ligne : on entre un pseudo, puis on lance un match rapide, on crée un
 * salon (dont l'id sert de code à partager) ou on rejoint un ami via son code.
 * Les saisies sont des champs HTML superposés (clavier natif sur mobile).
 *
 * Mise en page paysage en deux colonnes (pseudo + actions à gauche, rejoindre à
 * droite) pour tenir sur un écran de téléphone court.
 */
export class OnlineMenuScene extends Phaser.Scene {
  private net = new NetClient();
  private nameInput!: HTMLInputElement;
  private codeInput!: HTMLInputElement;
  private status!: Phaser.GameObjects.Text;
  private serverText!: Phaser.GameObjects.Text;
  private busy = false;
  private zarekId = ZAREKS[0].id;
  private modeId = 'brawl-ball';
  // Positions design des deux champs (pour placer/redimensionner les inputs HTML).
  private nameSlot = { dx: -230, dy: 214 };
  private codeSlot = { dx: 230, dy: 214 };

  constructor() {
    super('OnlineMenu');
  }

  create(data: { zarekId?: string; modeId?: string; name?: string; code?: string }): void {
    // La scène est réutilisée : on repart d'un état propre (sinon `busy` peut
    // rester bloqué après un match et « Match rapide » ne répond plus).
    this.busy = false;
    this.net = new NetClient();
    this.zarekId = data?.zarekId ?? ZAREKS[0].id;
    this.modeId = data?.modeId ?? 'brawl-ball';
    nightBackground(this);
    const F = computeFrame(this);

    const sub = this.modeId === 'battle-royale' ? 'Battle Royale · dernier survivant, jusqu’à 6 joueurs' : 'Brawl Ball 3v3 · joue avec tes amis ou au hasard';
    const titleP = F.at(0, 58);
    this.add.text(titleP.x, titleP.y, 'EN LIGNE', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(44), color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    const subP = F.at(0, 102);
    this.add.text(subP.x, subP.y, sub, { fontFamily: 'system-ui, sans-serif', fontSize: F.font(18), color: '#9b8cff', align: 'center', wordWrap: { width: F.px(920) } }).setOrigin(0.5);

    // Colonne gauche : pseudo + actions.
    const nameLbl = F.at(this.nameSlot.dx, 166);
    this.add.text(nameLbl.x, nameLbl.y, 'Ton pseudo', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(16), color: '#d8d8ff' }).setOrigin(0.5);
    this.nameInput = this.makeInput('Pseudo', 16, data?.name ?? localStorage.getItem('nyxt.pseudo') ?? '');
    const quick = F.at(this.nameSlot.dx, 302);
    const create = F.at(this.nameSlot.dx, 384);
    makeButton(this, quick.x, quick.y, F.px(320), F.px(62), 'MATCH RAPIDE', () => this.go(() => this.net.quickMatch(this.opts())));
    makeButton(this, create.x, create.y, F.px(320), F.px(62), 'CRÉER UN SALON', () => this.go(() => this.net.createRoom(this.opts())), 0x2f8f5a);

    // Colonne droite : rejoindre un ami.
    const codeLbl = F.at(this.codeSlot.dx, 166);
    this.add.text(codeLbl.x, codeLbl.y, 'Code d’un ami', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(16), color: '#d8d8ff' }).setOrigin(0.5);
    this.codeInput = this.makeInput('Code', 12, data?.code ?? '');
    const join = F.at(this.codeSlot.dx, 342);
    makeButton(this, join.x, join.y, F.px(300), F.px(62), 'REJOINDRE', () => {
      const code = this.codeInput.value.trim();
      if (!code) return this.setStatus('Entre un code de salon.', '#ff6b5e');
      this.go(() => this.net.joinRoom(code, this.opts()));
    }, 0x3a3466);

    const back = F.at(-432, 40);
    makeButton(this, back.x, back.y, F.px(150), F.px(46), '‹ Retour', () => this.scene.start('Select', { modeId: this.modeId, online: true }), 0x3a3466);

    const st = F.at(0, 472);
    this.status = this.add.text(st.x, st.y, '', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(16), color: '#ffcf33' }).setOrigin(0.5);

    // Serveur ciblé (modifiable d'un tap) — pratique pour brancher un tunnel.
    const srv = F.at(0, 560);
    this.serverText = this.add
      .text(srv.x, srv.y, '', { fontFamily: 'system-ui, sans-serif', fontSize: F.font(13), color: '#6c6c99', align: 'center', wordWrap: { width: F.px(920) } })
      .setOrigin(0.5, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerup', () => this.changeServer());
    this.refreshServerText();

    this.layoutInputs();
    this.scale.on('resize', this.layoutInputs, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.layoutInputs, this);
      this.nameInput.remove();
      this.codeInput.remove();
    });

    // Rotation / redimensionnement : on reconstruit en conservant les saisies.
    watchResize(this, () => {
      if (this.busy) return;
      this.scene.restart({ zarekId: this.zarekId, modeId: this.modeId, name: this.nameInput.value, code: this.codeInput.value });
    });
  }

  private playerName(): string {
    const n = this.nameInput.value.trim().slice(0, 16) || 'Joueur';
    localStorage.setItem('nyxt.pseudo', n);
    return n;
  }

  private opts(): JoinOptions {
    return { name: this.playerName(), zarek: this.zarekId, mode: this.modeId };
  }

  /** Lance une connexion, gère l'attente et les erreurs, puis entre en partie. */
  private async go(connect: () => Promise<Room>): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.setStatus('Connexion…', '#ffcf33');
    try {
      const room = await connect();
      this.setStatus('Connecté !', '#46d160');
      this.scene.start('OnlineGame', { room, zarekId: this.zarekId, modeId: this.modeId });
    } catch (err) {
      this.busy = false;
      const msg = err instanceof Error ? err.message : String(err);
      this.setStatus(`Échec : ${msg}`, '#ff6b5e');
    }
  }

  private setStatus(text: string, color: string): void {
    this.status.setText(text).setColor(color);
  }

  private refreshServerText(): void {
    this.serverText.setText(`Serveur : ${serverUrl()}  (toucher pour changer)`);
  }

  /** Change l'URL du serveur (mémorisée) — utile pour brancher un tunnel wss://. */
  private changeServer(): void {
    const next = window.prompt('Adresse du serveur (ex. wss://mon-tunnel.trycloudflare.com)', serverUrl());
    if (next === null) return;
    const v = next.trim();
    try {
      if (v) localStorage.setItem('nyxt.server', v);
      else localStorage.removeItem('nyxt.server');
    } catch {
      /* localStorage indisponible */
    }
    this.net = new NetClient();
    this.refreshServerText();
    this.setStatus('Serveur mis à jour.', '#46d160');
  }

  private makeInput(placeholder: string, maxLen: number, value: string): HTMLInputElement {
    const el = document.createElement('input');
    el.type = 'text';
    el.placeholder = placeholder;
    el.maxLength = maxLen;
    el.value = value;
    el.autocomplete = 'off';
    el.style.cssText =
      'position:fixed;z-index:50;transform:translate(-50%,-50%);' +
      'width:280px;height:44px;padding:0 14px;border-radius:10px;' +
      'border:2px solid #6a4dff;background:#1a1636;color:#fff;' +
      'font:600 18px system-ui,sans-serif;text-align:center;outline:none;box-sizing:border-box;';
    document.body.appendChild(el);
    return el;
  }

  private layoutInputs(): void {
    const F = computeFrame(this);
    const place = (el: HTMLInputElement, slot: { dx: number; dy: number }): void => {
      const p = F.at(slot.dx, slot.dy);
      el.style.left = `${p.x}px`;
      el.style.top = `${p.y}px`;
      el.style.width = `${Math.round(F.px(300))}px`;
      el.style.height = `${Math.round(F.px(46))}px`;
      el.style.fontSize = `${Math.max(13, Math.round(F.px(18)))}px`;
    };
    place(this.nameInput, this.nameSlot);
    place(this.codeInput, this.codeSlot);
  }
}
