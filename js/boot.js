import { fileSystem, init } from './windows.js';
import { AboutWindow, NotepadWindow } from './windows_apps.js';

document.addEventListener('DOMContentLoaded', function() {
	init();
	fileSystem.installApp(NotepadWindow);
	fileSystem.installApp(AboutWindow);

	// Workaround for the awful way that window classes are currently built.
	window.NotepadWindow = NotepadWindow;
	window.AboutWindow = AboutWindow;
});
