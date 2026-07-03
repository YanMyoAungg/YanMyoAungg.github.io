import { Typewriter } from './Typewriter';
import { ChatApi } from '../utils/chatApi';
import { ChatWidgetConfig } from '../types/Chat';

export class ChatWidget {
  private chatApi: ChatApi;
  private gameContainer: HTMLElement;
  private floatingIcon: HTMLElement | null;
  private chatOverlay: HTMLElement | null;
  private messageList: HTMLElement | null;
  private inputField: HTMLInputElement | null;
  private sendButton: HTMLElement | null;
  private activeTypewriter: Typewriter | null;
  private isOpen: boolean;
  private isLoading: boolean;
  private escapeHandler: ((e: KeyboardEvent) => void) | null;
  private loadingDotsInterval: ReturnType<typeof setInterval> | null;

  constructor(config: ChatWidgetConfig) {
    this.chatApi = new ChatApi(
      config.apiKey,
      config.profileContent,
      config.model,
    );
    this.gameContainer = config.gameContainer;
    this.floatingIcon = null;
    this.chatOverlay = null;
    this.messageList = null;
    this.inputField = null;
    this.sendButton = null;
    this.activeTypewriter = null;
    this.isOpen = false;
    this.isLoading = false;
    this.escapeHandler = null;
    this.loadingDotsInterval = null;
  }

  public init(): void {
    this.createFloatingIcon();
  }

  private createFloatingIcon(): void {
    this.floatingIcon = document.createElement('div');
    this.floatingIcon.classList.add('chat-floating-icon');
    this.floatingIcon.textContent = 'AI';
    this.floatingIcon.addEventListener('click', () => this.open());
    this.gameContainer.appendChild(this.floatingIcon);
  }

  private createOverlay(): void {
    this.chatOverlay = document.createElement('div');
    this.chatOverlay.classList.add('chat-overlay');

    this.chatOverlay.innerHTML = `
      <div class="chat-overlay-header">
        <span>Ask Me Anything</span>
        <button class="chat-close-button message-button">X</button>
      </div>
      <div class="chat-message-list"></div>
      <div class="chat-input-container">
        <input type="text" class="chat-input" placeholder="Ask about my skills, experience..." />
        <button class="chat-send-button">Send</button>
      </div>
    `;

    this.messageList = this.chatOverlay.querySelector(
      '.chat-message-list',
    ) as HTMLElement;
    this.inputField = this.chatOverlay.querySelector(
      '.chat-input',
    ) as HTMLInputElement;
    this.sendButton = this.chatOverlay.querySelector('.chat-send-button');

    const closeButton = this.chatOverlay.querySelector('.chat-close-button');
    closeButton!.addEventListener('click', () => this.close());

    this.sendButton!.addEventListener('click', () => this.handleSend());

    this.inputField.addEventListener('keypress', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleSend();
      }
    });

    this.inputField.addEventListener('keydown', (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.stopPropagation();
      }
    });

    this.chatOverlay.addEventListener('click', (e: MouseEvent) => {
      if (e.target === this.chatOverlay) {
        this.close();
      }
    });
  }

  private handleSend(): void {
    if (this.isLoading) return;

    const text = this.inputField!.value.trim();
    if (!text) return;

    if (this.activeTypewriter && !this.activeTypewriter.isDone) {
      this.activeTypewriter.warpToDone();
    }

    this.isLoading = true;
    this.setInputEnabled(false);

    this.addMessage(text, 'user');
    this.inputField!.value = '';

    const loadingRow = this.addLoadingDots();

    this.chatApi
      .sendMessage(text)
      .then((response) => {
        this.clearLoadingDots();
        loadingRow.remove();
        this.addMessage(response, 'assistant');
      })
      .catch((error) => {
        this.clearLoadingDots();
        loadingRow.remove();
        this.addMessage(error.message, 'assistant');
      })
      .finally(() => {
        this.isLoading = false;
        this.setInputEnabled(true);
        this.inputField!.focus();
      });
  }

  private addLoadingDots(): HTMLElement {
    const row = document.createElement('div');
    row.classList.add('chat-message-row', 'assistant');

    const avatar = document.createElement('span');
    avatar.classList.add('chat-avatar');
    avatar.textContent = 'AI';

    const dotsEl = document.createElement('span');
    dotsEl.classList.add('chat-loading-dots');
    dotsEl.textContent = '...';

    row.appendChild(avatar);
    row.appendChild(dotsEl);
    this.messageList!.appendChild(row);
    this.messageList!.scrollTop = this.messageList!.scrollHeight;

    let frame = 0;
    this.loadingDotsInterval = setInterval(() => {
      frame = (frame + 1) % 4;
      dotsEl.textContent = '.'.repeat(frame);
    }, 400);

    return row;
  }

  private clearLoadingDots(): void {
    if (this.loadingDotsInterval) {
      clearInterval(this.loadingDotsInterval);
      this.loadingDotsInterval = null;
    }
  }

  private setInputEnabled(enabled: boolean): void {
    if (this.inputField) {
      this.inputField.disabled = !enabled;
    }
    if (this.sendButton) {
      (this.sendButton as HTMLButtonElement).disabled = !enabled;
    }
  }

  private addMessage(text: string, role: 'user' | 'assistant'): HTMLElement {
    const row = document.createElement('div');
    row.classList.add('chat-message-row', role);

    const avatar = document.createElement('span');
    avatar.classList.add('chat-avatar');
    avatar.textContent = role === 'user' ? 'YOU' : 'AI';

    const bubble = document.createElement('div');
    bubble.classList.add('chat-message', role);

    row.appendChild(avatar);
    row.appendChild(bubble);
    this.messageList!.appendChild(row);
    this.messageList!.scrollTop = this.messageList!.scrollHeight;

    if (role === 'assistant') {
      this.activeTypewriter = new Typewriter({
        element: bubble,
        text,
        speed: 20,
      });
      this.activeTypewriter.init();
    } else {
      bubble.textContent = text;
    }

    return row;
  }

  private open(): void {
    if (this.isOpen) return;
    this.isOpen = true;

    this.floatingIcon!.style.display = 'none';

    this.createOverlay();
    this.gameContainer.appendChild(this.chatOverlay!);

    this.escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', this.escapeHandler);

    document.dispatchEvent(new CustomEvent('ChatOpened'));

    setTimeout(() => this.inputField!.focus(), 100);
  }

  private close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;

    if (this.activeTypewriter && !this.activeTypewriter.isDone) {
      this.activeTypewriter.warpToDone();
    }
    this.activeTypewriter = null;
    this.isLoading = false;
    this.clearLoadingDots();

    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
      this.escapeHandler = null;
    }

    if (this.chatOverlay) {
      this.chatOverlay.remove();
      this.chatOverlay = null;
      this.messageList = null;
      this.inputField = null;
      this.sendButton = null;
    }

    this.chatApi.clearHistory();

    this.floatingIcon!.style.display = '';

    document.dispatchEvent(new CustomEvent('ChatClosed'));
  }
}
