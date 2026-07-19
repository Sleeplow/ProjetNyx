import Phaser from 'phaser';
import { makeButton, nightBackground } from '../ui/widgets';
import { NetClient, type JoinOptions } from '../net/NetClient';
import { serverUrl } from '../net/config';
import { ZAREKS } from '../zareks/registry';
import type { Room } from 'colyseus.js';

/**
 * Lobby en ligne : on entre un pseudo, puis on lance un match rapide, on crée un
 * salon (dont l'id sert de code à partager) ou on rejoint un ami via son code.
 * Les saisies sont des champs HTML superposés (clavier natif sur tablette).
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

  constructor() {
    super('OnlineMenu');
  }

  create(data: { zarekId?: string; modeId?: string }): void {
    // La scène est réutilisée : on repart d'un état propre (sinon `busy` peut
    // rester bloqué après un match et « Match rapide » ne répond plus).
    this.busy = false;
    this.net = new NetClient();
    this.zarekId = data?.zarekId ?? ZAREKS[0].id;
    this.modeId = data?.modeId ?? 'brawl-ball';
    nightBackground(this);
    const w = this.scale.width;
    const cx = w / 2;
    const h = this.scale.height;

    this.add.text(cx, 70, 'EN LIGNE', { fontFamily: 'system-ui, sans-serif', fontSize: '44px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(cx, 116, 'Brawl Ball 3v3 · joue avec tes amis ou au hasard', { fontFamily: 'system-ui, sans-serif', fontSize: '18px', color: '#9b8cff' }).setOrigin(0.5);

    this.add.text(cx, h * 0.24, 'Ton pseudo', { fontFamily: 'system-ui, sans-serif', fontSize: '16px', color: '#d8d8ff' }).setOrigin(0.5);
    this.nameInput = this.makeInput('Pseudo', 16, localStorage.getItem('nyxt.pseudo') ?? '');

    makeButton(this, cx, h * 0.44, 320, 64, 'MATCH RAPIDE', () => this.go(() => this.net.quickMatch(this.opts())));
    makeButton(this, cx, h * 0.56, 320, 64, 'CRÉER UN SALON', () => this.go(() => this.net.createRoom(this.opts())), 0x2f8f5a);

    this.add.text(cx, h * 0.68, 'Code du salon d’un ami', { fontFamily: 'system-ui, sans-serif', fontSize: '16px', color: '#d8d8ff' }).setOrigin(0.5);
    this.codeInput = this.makeInput('Code', 12, '');
    makeButton(this, cx, h * 0.86, 300, 60, 'REJOINDRE', () => {
      const code = this.codeInput.value.trim();
      if (!code) return this.setStatus('Entre un code de salon.', '#ff6b5e');
      this.go(() => this.net.joinRoom(code, this.opts()));
    }, 0x3a3466);

    makeButton(this, 96, 48, 150, 46, '‹ Retour', () => this.scene.start('Select', { modeId: this.modeId, online: true }), 0x3a3466);

    this.status = this.add.text(cx, h * 0.93, '', { fontFamily: 'system-ui, sans-serif', fontSize: '16px', color: '#ffcf33' }).setOrigin(0.5);

    // Serveur ciblé (modifiable d'un tap) — pratique pour brancher un tunnel.
    this.serverText = this.add
      .text(cx, h - 16, '', { fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#6c6c99' })
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
  }

  private playerName(): string {
    const n = this.nameInput.value.trim().slice(0, 16) || 'Joueur';
    localStorage.setItem('nyxt.pseudo', n);
    return n;
  }

  private opts(): JoinOptions {
    return { name: this.playerName(), zarek: this.zarekId };
  }

  /** Lance une connexion, gère l'attente et les erreurs, puis entre en partie. */
  private async go(connect: () => Promise<Room>): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.setStatus('Connexion…', '#ffcf33');
    try {
      const room = await connect();
      this.setStatus('Connecté !', '#46d160');
      this.scene.start('OnlineGame', { room, zarekId: this.zarekId });
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
      "font:600 18px system-ui,sans-serif;text-align:center;outline:none;box-sizing:border-box;";
    document.body.appendChild(el);
    return el;
  }

  private layoutInputs(): void {
    const place = (el: HTMLInputElement, yFrac: number) => {
      el.style.left = `${window.innerWidth / 2}px`;
      el.style.top = `${window.innerHeight * yFrac}px`;
    };
    place(this.nameInput, 0.3);
    place(this.codeInput, 0.74);
  }
}
