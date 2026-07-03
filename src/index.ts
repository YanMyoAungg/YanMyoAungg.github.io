import Engine from './modules/Engine';
import { ChatWidget } from './modules/ChatWidget';
import { OPENROUTER_API_KEY } from './configs/apiKey';
import profileContent from './configs/profile.md';

const engine = new Engine('game-canvas');
engine.init();

const gameContainer = document.getElementById('canvas-container') as HTMLElement;

const chatWidget = new ChatWidget({
  profileContent,
  apiKey: OPENROUTER_API_KEY,
  gameContainer,
});

chatWidget.init();