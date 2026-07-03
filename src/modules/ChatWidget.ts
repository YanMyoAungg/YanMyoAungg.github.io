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
  private activeTypewriter: Typewriter | null;
  private isOpen: boolean;

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
    this.activeTypewriter = null;
    this.isOpen = false;
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

    this.chatOverlay.innerHTML =
      '<div class="chat-overlay-header">' +
      '<span>Ask Me Anything</span>' +
      '<button class="chat-close-button message-button">X</button>' +
      '</div>' +
      '<div class="chat-message-list"></div>' +
      '<div class="chat-input-container">' +
      '<input type="text" class="chat-input" placeholder="Ask about my skills, experience..." />' +
      '<button class="chat-send-button">Send</button>' +
      '</div>';

    this.messageList = this.chatOverlay.querySelector(
      '.chat-message-list',
    ) as HTMLElement;
    this.inputField = this.chatOverlay.querySelector(
      '.chat-input',
    ) as HTMLInputElement;

    const closeButton = this.chatOverlay.querySelector('.chat-close-button');
    closeButton!.addEventListener('click', () => this.close());

    const sendButton = this.chatOverlay.querySelector('.chat-send-button');
    sendButton!.addEventListener('click', () => this.handleSend());

    this.inputField.addEventListener('keypress', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        this.handleSend();
      }
    });

    // Click outside the overlay to close
    this.chatOverlay.addEventListener('click', (e: MouseEvent) => {
      if (e.target === this.chatOverlay) {
        this.close();
      }
    });
  }

  private handleSend(): void {
    const text = this.inputField!.value.trim();
    if (!text) return;

    if (this.activeTypewriter && !this.activeTypewriter.isDone) {
      this.activeTypewriter.warpToDone();
    }

    this.addMessage(text, 'user');
    this.inputField!.value = '';

    const loadingMsg = this.addMessage('...', 'assistant');

    this.chatApi
      .sendMessage(text)
      .then((response) => {
        loadingMsg.remove();
        this.addMessage(response, 'assistant');
      })
      .catch((error) => {
        loadingMsg.remove();
        this.addMessage(error.message, 'assistant');
      });
  }

  private addMessage(text: string, role: 'user' | 'assistant'): HTMLElement {
    const messageEl = document.createElement('p');
    messageEl.classList.add('chat-message', role);
    this.messageList!.appendChild(messageEl);
    this.messageList!.scrollTop = this.messageList!.scrollHeight;

    if (role === 'assistant' && text !== '...') {
      this.activeTypewriter = new Typewriter({
        element: messageEl,
        text,
        speed: 20,
      });
      this.activeTypewriter.init();
    } else {
      messageEl.textContent = text;
    }

    return messageEl;
  }

  private open(): void {
    if (this.isOpen) return;
    this.isOpen = true;

    this.floatingIcon!.style.display = 'none';

    this.createOverlay();
    this.gameContainer.appendChild(this.chatOverlay!);

    setTimeout(() => this.inputField!.focus(), 100);
  }

  private close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;

    if (this.activeTypewriter && !this.activeTypewriter.isDone) {
      this.activeTypewriter.warpToDone();
    }
    this.activeTypewriter = null;

    if (this.chatOverlay) {
      this.chatOverlay.remove();
      this.chatOverlay = null;
      this.messageList = null;
      this.inputField = null;
    }

    this.chatApi.clearHistory();

    this.floatingIcon!.style.display = '';
  }
}
