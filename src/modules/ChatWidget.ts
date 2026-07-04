import { Typewriter } from "./Typewriter";
import { ChatApi, ProfileData } from "../utils/chatApi";
import { ChatWidgetConfig } from "../types/Chat";

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
      config.profileCustomContent,
      config.profileData as ProfileData | null,
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
    this.floatingIcon = document.createElement("div");
    this.floatingIcon.classList.add("chat-floating-icon");
    this.floatingIcon.textContent = "\u{1F4AC}";
    this.floatingIcon.addEventListener("click", () => this.open());
    this.gameContainer.appendChild(this.floatingIcon);
  }

  private createOverlay(): void {
    this.chatOverlay = document.createElement("div");
    this.chatOverlay.classList.add("chat-overlay");

    this.chatOverlay.innerHTML = `
      <div class="chat-overlay-header">
        <span>Ask Me Anything</span>
        <div class="chat-header-actions">
          <a class="chat-resume-button" href="/resume.pdf" target="_blank" title="Download Resume (PDF)">📎</a>
          <button class="chat-close-button message-button">X</button>
        </div>
      </div>
      <div class="chat-message-list"></div>
      <div class="chat-input-container">
        <input type="text" class="chat-input" placeholder="Ask about my skills, experience..." />
        <button class="chat-send-button">Send</button>
      </div>
    `;

    this.messageList = this.chatOverlay.querySelector(
      ".chat-message-list",
    ) as HTMLElement;
    this.inputField = this.chatOverlay.querySelector(
      ".chat-input",
    ) as HTMLInputElement;
    this.sendButton = this.chatOverlay.querySelector(".chat-send-button");

    const closeButton = this.chatOverlay.querySelector(".chat-close-button");
    closeButton!.addEventListener("click", () => this.close());

    this.sendButton!.addEventListener("click", () => this.handleSend());

    this.inputField.addEventListener("keypress", (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.handleSend();
      }
      // Prevent spacebar from triggering game interactions (InteractionInput listens on keypress)
      if (e.key === " ") {
        e.stopPropagation();
      }
    });

    this.inputField.addEventListener("keydown", (e: KeyboardEvent) => {
      // Prevent WASD/arrow keys from triggering game movement while typing
      if (
        [
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
          "w",
          "a",
          "s",
          "d",
          " ",
        ].includes(e.key)
      ) {
        e.stopPropagation();
      }
    });

    this.chatOverlay.addEventListener("click", (e: MouseEvent) => {
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
    this.stopLoadingDots();

    this.isLoading = true;
    this.setInputEnabled(false);

    this.addMessage(text, "user");
    this.inputField!.value = "";

    const loadingMsg = this.addMessage("...", "assistant", false);
    loadingMsg.style.minWidth = "50px";
    loadingMsg.style.textAlign = "left";
    let dotCount = 1;
    this.loadingDotsInterval = setInterval(() => {
      dotCount = (dotCount % 3) + 1;
      loadingMsg.textContent = ".".repeat(dotCount);
    }, 400);

    this.chatApi
      .sendMessage(text)
      .then((response) => {
        this.stopLoadingDots();
        loadingMsg.remove();
        this.addMessage(response, "assistant");
      })
      .catch((error) => {
        this.stopLoadingDots();
        loadingMsg.remove();
        this.addMessage(error.message, "assistant", false);
      })
      .finally(() => {
        this.isLoading = false;
        this.setInputEnabled(true);
        this.inputField!.focus();
      });
  }

  private stopLoadingDots(): void {
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

  private static readonly URL_REGEX =
    /(https?:\/\/[^\s]+|(?<!\w)\/[^\s]*\.pdf(?:\?[^\s]*)?)/gi;

  private addMessage(
    text: string,
    role: "user" | "assistant",
    animate: boolean = true,
  ): HTMLElement {
    const messageEl = document.createElement("p");
    messageEl.classList.add("chat-message", role);
    this.messageList!.appendChild(messageEl);
    this.messageList!.scrollTop = this.messageList!.scrollHeight;

    const hasUrl = ChatWidget.URL_REGEX.test(text);
    // Reset lastIndex since test() advances it
    ChatWidget.URL_REGEX.lastIndex = 0;

    if (role === "assistant" && animate && !hasUrl) {
      this.activeTypewriter = new Typewriter({
        element: messageEl,
        text,
        speed: 20,
      });
      this.activeTypewriter.init();
    } else if (hasUrl) {
      // Render URLs as clickable links
      messageEl.innerHTML = this.linkifyUrls(text);
    } else {
      messageEl.textContent = text;
    }

    return messageEl;
  }

  private linkifyUrls(text: string): string {
    // Reset state first
    ChatWidget.URL_REGEX.lastIndex = 0;
    return text.replace(ChatWidget.URL_REGEX, (url) => {
      // Normalize relative paths to absolute URLs
      const href = url.startsWith('/') ? url : url;
      return `<a href="${href}" target="_blank" rel="noopener">${url}</a>`;
    });
  }

  private open(): void {
    if (this.isOpen) return;
    this.isOpen = true;

    this.floatingIcon!.style.display = "none";

    this.createOverlay();
    this.gameContainer.appendChild(this.chatOverlay!);

    this.escapeHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        this.close();
      }
    };
    document.addEventListener("keydown", this.escapeHandler);

    document.dispatchEvent(new CustomEvent("ChatOpened"));

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
    this.stopLoadingDots();

    if (this.escapeHandler) {
      document.removeEventListener("keydown", this.escapeHandler);
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

    this.floatingIcon!.style.display = "";

    document.dispatchEvent(new CustomEvent("ChatClosed"));
  }
}
