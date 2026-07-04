import Engine from './modules/Engine';
import { ChatWidget } from './modules/ChatWidget';
import { OPENROUTER_API_KEY as FILE_API_KEY } from './configs/apiKey';
import profileCustomContent from './configs/profile.custom.md';
import profileData from './configs/profile.json';

// __OPENROUTER_API_KEY__ is replaced by Webpack DefinePlugin at build time.
// In CI, it comes from the OPENROUTER_API_KEY secret. Locally, it's empty
// and we fall back to the gitignored apiKey.ts file.
declare const __OPENROUTER_API_KEY__: string;

const engine = new Engine('game-canvas');
engine.init();

const gameContainer = document.getElementById('canvas-container') as HTMLElement;

const chatWidget = new ChatWidget({
  profileCustomContent,
  profileData,
  apiKey: __OPENROUTER_API_KEY__ || FILE_API_KEY,
  gameContainer,
});

chatWidget.init();