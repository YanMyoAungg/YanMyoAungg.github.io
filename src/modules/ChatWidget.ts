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
  }

  public init(): void {
    this.createFloatingIcon();
  }

  private createFloatingIcon(): void {
    this.floatingIcon = document.createElement('div');
    this.floatingIcon.classList.add('chat-floating-icon');
    this.floatingIcon.textContent = '\u{1F4AC}';
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
      // Prevent WASD/arrow keys from triggering game movement while typing
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

    const loadingMsg = this.createLoadingMessage();

    this.chatApi
      .sendMessage(text)
      .then((response) => {
        loadingMsg.remove();
        this.addMessage(response, 'assistant');
      })
      .catch((error) => {
        loadingMsg.remove();
        this.addMessage(error.message, 'assistant');
      })
      .finally(() => {
        this.isLoading = false;
        this.setInputEnabled(true);
        this.inputField!.focus();
      });
  }

  private setInputEnabled(enabled: boolean): void {
    if (this.inputField) {
      this.inputField.disabled = !enabled;
    }
    if (this.sendButton) {
      (this.sendButton as HTMLButtonElement).disabled = !enabled;
    }
  }

  private createLoadingMessage(): HTMLElement {
    const container = document.createElement('div');
    container.classList.add('chat-message-row', 'assistant-row');

    const avatar = document.createElement('div');
    avatar.classList.add('chat-avatar');
    avatar.innerHTML = '<img src="./images/objects/animated_coffee.gif" alt="AI" class="chat-avatar-img" />';

    const bubble = document.createElement('p');
    bubble.classList.add('chat-message', 'assistant');

    const dots = document.createElement('span');
    dots.classList.add('chat-loading-dots');
    dots.innerHTML =
      '<span class="dot">.</span>' +
      '<span class="dot">.</span>' +
      '<span class="dot">.</span>';
    bubble.appendChild(dots);

    container.appendChild(avatar);
    container.appendChild(bubble);
    this.messageList!.appendChild(container);
    this.messageList!.scrollTop = this.messageList!.scrollHeight;

    return container;
  }

  private addMessage(text: string, role: 'user' | 'assistant'): HTMLElement {
    const container = document.createElement('div');
    container.classList.add('chat-message-row', `${role}-row`);

    const bubble = document.createElement('p');
    bubble.classList.add('chat-message', role);

    if (role === 'assistant') {
      const avatar = document.createElement('div');
      avatar.classList.add('chat-avatar');
      avatar.innerHTML = '<img src="./images/objects/animated_coffee.gif" alt="AI" class="chat-avatar-img" />';
      container.appendChild(avatar);
    }

    container.appendChild(bubble);
    this.messageList!.appendChild(container);
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

    return container;
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
