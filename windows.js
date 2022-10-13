// Window
class Window {

    #pos1;
    #pos2;
    #pos3;
    #pos4;
    resizeX;
    resizeY;
    w;
    h;
    decorationWidth;
    decorationHeight;

    constructor(windowName, windowTitle, windowIcon=null, width, height, zPos) {

        this.windowTitle = windowTitle;
        this.windowIcon = windowIcon;
        this.width = width;
        this.height = height;
        this.zPos = zPos;
        this.maximised = false;
        
        // Create window in DOM //

        // base window
        this.window = document.createElement('div');
        this.window.classList.add('window', 'pop_out', `window_${windowName}`);
        this.window.style.top = random_range(10, 40) + 'vh';
        this.window.style.left = random_range(20, 40) + 'vw';
        
        // Store X and Y positions for maximising
        this.x = this.window.clientX;
        this.y = this.window.clientY;

        // window -> titlebar
        this.window_titlebar = document.createElement('header');
        this.window_titlebar.classList.add('windowtitle');
        this.window.appendChild(this.window_titlebar);

        // window -> titlebar -> title container
        this.window_title = document.createElement('span');

        // window -> titlebar -> title container -> image
        if (windowIcon !== null) {
            this.window_title_image = document.createElement('img');
            this.window_title_image.src = this.windowIcon;
            this.window_title.appendChild(this.window_title_image);
        }

        // window -> titlebar -> title container -> text
        this.window_title_text = document.createTextNode(windowTitle);
        this.window_title.appendChild(this.window_title_text);
        this.window_titlebar.appendChild(this.window_title);

        // window -> titlebar -> button container
        this.window_titlebar_buttons = document.createElement('div');
        this.window_titlebar_buttons.classList.add('windowbuttoncontainer');
        this.window_titlebar.appendChild(this.window_titlebar_buttons);

        // window -> titlebar -> button container -> close button
        this.window_title_closebutton = document.createElement('button');
        this.window_title_closebutton.classList.add('windowbutton', 'closebutton');
        this.window_title_closebutton.textContent = 'X';
        this.window_title_closebutton.addEventListener('click', this.closeWindow);
        this.window_titlebar_buttons.appendChild(this.window_title_closebutton);

        // window -> content
        this.window_contents = document.createElement('main');
        this.window_contents.classList.add('windowmain');

        this.window.appendChild(this.window_contents);

        // Make draggable
        this.window_titlebar.onmousedown = this.#startDragWindow;

        // Make focusable
        this.window.onmousedown = this.makeFocus;

        // Set size
        this.window_contents.style.width = `${width}px`;
        this.window_contents.style.height = `${height}px`;

        // Insert the window
        document.body.appendChild(this.window);
        this.window.style.display = 'flex';
        this.window.focus();

        // Get decoration size for resizing!
        this.decorationWidth = this.window.clientWidth - this.window_contents.clientWidth;
        this.decorationHeight = this.window.clientHeight - this.window_contents.clientHeight;
    }

    resetPositions = () => {
        this.#pos1=0;
        this.#pos2=0;
        this.#pos3=0;
        this.#pos4=0;
        this.resizeX=0;
        this.resizeY=0;
    }

    #startDragWindow = (e) => {
        this.resetPositions();

        e = e || window.event;
        e.preventDefault();

        // get the mouse cursor position at start of move
        this.#pos3 = e.clientX;
        this.#pos4 = e.clientY;
        document.onmouseup = this.#stopDragWindow;
        // call a function whenever the cursor moves:
        document.onmousemove = this.#dragWindow;
        this.makeFocus();
    }

    #stopDragWindow = () => {
        document.onmouseup = null;
        document.onmousemove = null;
    }

    #dragWindow = (e) => {
        if (this.maximised) {
            this.toggleMaximiseWindow();
            this.x = 0;
            this.window.style.top = 0;
        }

        // calculate the new cursor position:
        this.#pos1 = this.#pos3 - e.clientX;
        this.#pos2 = this.#pos4 - e.clientY;
        this.#pos3 = e.clientX;
        this.#pos4 = e.clientY;
        // set the element's new position:
        this.window.style.top = (this.window.offsetTop - this.#pos2) + "px";
        this.window.style.left = (this.window.offsetLeft - this.#pos1) + "px";
    }

    makeFocus = () => {
        windowManager.bringWindowToFront(this.zPos);
    }

    minimiseWindow = () => {
        if (this.window.style.display === 'flex') this.window.style.display = 'none';
        else this.window.style.display = 'flex';
    }

    closeWindow = () => {
        // Play closing animation
        this.window.classList.remove('pop_out');
        void this.window.offsetWidth;
        this.window.classList.add('pop_out', 'pop_in');

        setTimeout(() => {
            this.window.remove();
            windowManager.removeWindow(this.zPos);
        }, 150);
    }
}

class ResizableWindow extends Window {
    
    constructor(windowName, windowTitle, windowIcon=null, width, height, zPos) {
        
        super(windowName, windowTitle, windowIcon, width, height, zPos);

        // window -> titlebar -> button container -> fullscreen button
        this.window_title_maximisebutton = document.createElement('button');
        this.window_title_maximisebutton.classList.add('windowbutton');
        this.window_title_maximisebutton.textContent = 'o';
        this.window_title_maximisebutton.addEventListener('click', this.toggleMaximiseWindow);
        this.window_titlebar_buttons.insertBefore(this.window_title_maximisebutton, this.window_title_closebutton);

        // Double click to maximise
        this.window_titlebar.ondblclick = this.toggleMaximiseWindow;

        // Make resizable with bottom right corner
        const resizerBr = document.createElement('div');
        resizerBr.classList.add('resizer', 'resizer_br');
        resizerBr.onmousedown = this.#startResizeWindow;

        this.window.appendChild(resizerBr);
    }

    // https://htmldom.dev/make-a-resizable-element/ thanks!
    #startResizeWindow = (e) => {
        this.resetPositions();

        this.resizeX = e.clientX;
        this.resizeY = e.clientY;

            // Calculate the dimension of element
        this.w = this.window.clientWidth - this.decorationWidth;
        this.h = this.window.clientHeight - this.decorationHeight;

        // Attach the listeners to `document`
        document.addEventListener('mousemove', this.resizeMouseMoveHandler);
        document.addEventListener('mouseup', this.resizeMouseUpHandler);
    }

    resizeMouseMoveHandler = (e) => {
        // How far the mouse has been moved
        const dx = e.clientX - this.resizeX;
        const dy = e.clientY - this.resizeY;
        this.width = this.w + dx;
        this.height = this.h + dy;

        // Adjust the dimension of element
        this.window_contents.style.width = `${this.width}px`;
        this.window_contents.style.height = `${this.height}px`;
    }

    resizeMouseUpHandler = () => {
        // Remove the handlers of `mousemove` and `mouseup`
        document.removeEventListener('mousemove', this.resizeMouseMoveHandler);
        document.removeEventListener('mouseup', this.resizeMouseUpHandler);
    }

    toggleMaximiseWindow = () => {

        if (this.maximised) {
            
            this.window.classList.remove('windowmaximised');
            this.maximised = false;

            this.window_contents.style.width = `${this.width}px`;
            this.window_contents.style.height = `${this.height}px`;

            // We don't need the eventListener for the size anymore!
            window.removeEventListener('resize', this.setMaximisedSize);

            return;
        }

        this.window.classList.add('windowmaximised');
        this.maximised = true;

        this.setMaximisedSize();

        // Make sure size stays correct
        window.addEventListener('resize', this.setMaximisedSize);
    }

    setMaximisedSize = () => {
        this.h = this.window.clientHeight - this.window_titlebar.clientHeight;

        this.window_contents.style.width = `100vw`;
        this.window_contents.style.height = `${this.h}px`;
    }
}

// Window types
class NotepadWindow extends ResizableWindow {

    constructor(initData, zPos) {

        const data = initData.data;
        super('notepad',  (data.filename !== '' ? `Notepad - ${stripFilePath(data.filename)}` : 'Notepad'), 'https://www.file-extensions.org/imgs/app-icon/128/759/microsoft-windows-notepad-icon.png', initData.width ?? 650, initData.height ?? 400, zPos);

        this.filename = data.filename;
        this.textarea = document.createElement('textarea');
        this.textarea.textContent = data.text;
        this.window_contents.appendChild(this.textarea);
    }
}

class AboutWindow extends Window {

    constructor(initData, zPos) {
        super('about', 'About Windows', null, 500, 420, zPos);

        // Paragraph 1
        const container = document.createElement('div');
        const p1 = document.createElement('p');
        const winLogo = document.createElement('img');
        winLogo.src = 'http://pngimg.com/uploads/windows_logos/windows_logos_PNG1.png';
        const editionName = document.createElement('span');
        editionName.textContent = 'Ultimate';
        editionName.classList.add('window_about_edition');

        p1.appendChild(winLogo);
        p1.appendChild(editionName);
        p1.classList.add('center_text');

        container.appendChild(p1);
        
        const lineBreak = document.createElement('br');
        const horizontalLine = document.createElement('hr');

        container.appendChild(lineBreak);
        container.appendChild(horizontalLine);

        // Paragraph 2
        const p2 = document.createElement('p');
        p2.textContent = 'Microsoft Windows';
        p2.appendChild(lineBreak);
        p2.innerHTML += 'Copyright (c) 2009 Microsoft Corporation. All rights reserved.';
        p2.appendChild(lineBreak);
        p2.innerHTML += 'The Windows 7 Ultimate operating system and its user interface are protected by trademark and other pending or existing intellectual property rights in the United States and other countries.';

        container.appendChild(p2);

        // Paragraph 3
        const p3 = document.createElement('p');
        p3.textContent = 'This product is licensed under the ';
        const msSoftwareLicenseLink = document.createElement('a');
        msSoftwareLicenseLink.href = 'http://docs.google.com/gview?url=https://download.microsoft.com/Documents/UseTerms/Windows%207_Ultimate_English_1e53a4ca-c632-4776-90ce-70f027918132.pdf&embedded=true';
        msSoftwareLicenseLink.innerHTML = 'Microsoft Software License';
        msSoftwareLicenseLink.appendChild(lineBreak);
        msSoftwareLicenseLink.innerHTML += ' Terms';

        p3.appendChild(msSoftwareLicenseLink);
        p3.innerHTML += ' to:';

        const ownerList = document.createElement('ul');
        const owner = document.createElement('li');
        owner.textContent = 'thennothinghappened :p';

        ownerList.appendChild(owner);
        p3.appendChild(ownerList);

        container.appendChild(p3);
        container.appendChild(lineBreak);

        // OK button dialog
        const p4 = document.createElement('p');
        const dialog = document.createElement('div');
        dialog.classList.add('dialog');

        const okButton = document.createElement('button');
        okButton.classList.add('dialogbutton');
        okButton.textContent = 'OK';

        dialog.appendChild(okButton);
        p4.appendChild(dialog);
        container.appendChild(p4);

        this.window_contents.appendChild(container);
    }
}

class IEWindow extends ResizableWindow {

    url = 'https://google.com?igu=1';
    loadSpinner;
    iframe;

    constructor(initData, zPos) {

        super('browser', 'Internet Explorer', 'https://static.wikia.nocookie.net/logopedia/images/a/a9/Internet_Explorer_logo_2007.svg/revision/latest?cb=20200726002419', initData.width ?? 1000, initData.height ?? 600, zPos);
        
        if (initData.data !== undefined)
            this.url = initData.data.url ?? this.url;

        const navBar = document.createElement('div');
        this.urlBox = document.createElement('input');
        this.urlBox.type = 'text';
        this.urlBox.name = 'url';
        this.urlBox.value = this.url;
        this.urlBox.classList.add('window_browser_urlbox');

        const goButton = document.createElement('input');
        goButton.type = 'button';
        goButton.name = 'Go';
        goButton.value = 'Go';
        // Go to the new address!
        goButton.addEventListener('click', () => {
            this.iframe.src = browserUrl(this.urlBox.value);
            this.loadSpinner.style.opacity = 1;
        });

        this.loadSpinner = document.createElement('div');
        this.loadSpinner.classList.add('window_browser_spinner');

        navBar.appendChild(this.urlBox);
        navBar.appendChild(goButton);
        navBar.appendChild(this.loadSpinner);

        this.iframe = document.createElement('iframe');
        this.iframe.src = this.url;
        // Hide the load spinner when page loaded
        this.iframe.addEventListener('load', () => {
            this.loadSpinner.style.opacity = 0;
        });

        this.window_contents.appendChild(navBar);
        this.window_contents.appendChild(this.iframe);

    }
}

// Create window templates
class WindowManager {

    constructor() {
        // this.windowTemplates = {};
        this.windowIndex = [];
        this.windowIndexStart = 100;
    }

    createWindow = (windowType, initData) => {
        const window = new windowType(initData, this.windowIndex.length);
        this.windowIndex.push(window);
        this.refreshWindowOrder();
    }

    refreshWindowOrder = () => {
        this.windowIndex.forEach((w, i) => {
            const index = this.windowIndexStart + i;
            w.zPos = i;
            w.window.style.zIndex = index;
        });

        //console.table(this.windowIndex)

        // Focus class to top window
        if (this.windowIndex.length !== 0) {
            this.windowIndex[this.windowIndex.length-1].window.classList.add('focuswindow')
            
            // Unfocus prev focussed element
            if (this.windowIndex.length !== 1) {
                this.windowIndex[this.windowIndex.length-2].window.classList.remove('focuswindow');
            }
        }
    };

    bringWindowToFront = (id) => {
        this.windowIndex.push(this.windowIndex.splice(id, 1)[0]);
        this.refreshWindowOrder();
    }

    removeWindow = (id) => {
        delete this.windowIndex[id];
        this.windowIndex.splice(id, 1);
        this.refreshWindowOrder();
    }

    createDesktopIcon = () => {
        
    }

}

class FileSystem {

    constructor() {

        localStorage.setItem();
    }

    getSize = () => {
        return new Blob(Object.values(localStorage)).size;
    }
}

const windowManager = new WindowManager();

// Override behaviour of some elements
document.addEventListener('click', (e) => {
    e = window.e || e;

    // Open links in internal browser
    if (e.target.tagName === 'A') {
        e.preventDefault();
        
        windowManager.createWindow(IEWindow, {data: {url: e.target.href}});
    }
});

// Override right click menu
document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
});

function addHttpProtocol(string) {
    if (!string.startsWith('http://') && !string.startsWith('https://') && !string.startsWith('file://')) {
      return 'http://' + string;
    }
    return string;
}

function browserUrl(string) {
    string = addHttpProtocol(string);
    if (string.indexOf('google.co') !== -1 && string.indexOf('igu=1') === -1) {
        string += '?igu=1'
    }

    return string;
}

function stripFilePath(filename) {
    return filename.slice(filename.indexOf('/')+1);
}

function random_range(min, max) {
    const maximum = max - min;
    return Math.floor(Math.random() * maximum) + min;
}