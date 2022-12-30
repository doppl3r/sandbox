import { Test } from './test.js';
import '../scss/app.scss';

class App {
    constructor() {
        // Add test
        this.test = new Test();
    }
}
window.app = new App();