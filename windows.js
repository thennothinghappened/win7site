// Window
class Window {

    #pos1;
    #pos2;
    #pos3;
    #pos4;

    constructor(windowTitle=this.constructor.FANCYNAME, width, height, zPos) {

        this.windowTitle = windowTitle;
        this.windowIcon = this.constructor.ICON;
        this.width = width;
        this.height = height;
        this.zPos = zPos;
        this.maximised = false;
        
        // Create window in DOM //

        // base window
        this.window = document.createElement('div');
        this.window.classList.add('window', 'pop_out', `window_${this.constructor.CSSNAME}`);
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
        if (this.windowIcon) {
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
    }

    /////////////////////
    // Window Dragging //
    /////////////////////

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

    ////////////////////
    // Window Buttons //
    ////////////////////

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

    //////////////////////
    // Application Info //
    //////////////////////

    static icon = null;
    static appname = 'UndefinedWindow';
    static appcatagories = [];
    static description = 'Undefined App!';

    static get ICON() {
        return this.icon;
    }

    static get FANCYNAME() {
        return this.appname;
    }

    static get CSSNAME() {
        return this.appname.toLowerCase().replace(' ', '');
    }

    static get CATAGORIES() {
        return this.appcatagories;
    }

    static get DESCRIPTION() {
        return this.description;
    }
}

class ResizableWindow extends Window {
    
    resizeX;
    resizeY;
    w;
    h;
    decorationWidth;
    decorationHeight;

    constructor(windowName, windowTitle, windowIcon=null, width, height, zPos) {
        
        super(windowName, windowTitle, windowIcon, width, height, zPos);

        // window -> titlebar -> button container -> fullscreen button
        this.window_title_maximisebutton = document.createElement('button');
        this.window_title_maximisebutton.classList.add('windowbutton');
        this.window_title_maximisebutton.textContent = '☐';
        this.window_title_maximisebutton.addEventListener('click', this.toggleMaximiseWindow);
        this.window_titlebar_buttons.insertBefore(this.window_title_maximisebutton, this.window_title_closebutton);

        // Double click to maximise
        this.window_titlebar.ondblclick = this.toggleMaximiseWindow;

        // Make resizable with bottom right corner
        const resizerBr = document.createElement('div');
        resizerBr.classList.add('resizer', 'resizer_br');
        resizerBr.onmousedown = this.#startResizeWindow;

        this.window.appendChild(resizerBr);

        // Get decoration size for resizing!
        this.decorationWidth = this.window.clientWidth - this.window_contents.clientWidth;
        this.decorationHeight = this.window.clientHeight - this.window_contents.clientHeight;
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
            this.window_title_maximisebutton.textContent = '☐';
            this.maximised = false;

            this.window_contents.style.width = `${this.width}px`;
            this.window_contents.style.height = `${this.height}px`;

            // We don't need the eventListener for the size anymore!
            window.removeEventListener('resize', this.setMaximisedSize);

            return;
        }

        this.window.classList.add('windowmaximised');
        this.window_title_maximisebutton.textContent = '⧉';
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

// Create window templates
class WindowManager {

    constructor() {

        // Create the desktop and start menu (later)
        this.desktop = document.createElement('div');
        this.desktop.id = 'desktop';

        // Get the startup sound
        const StartupSound = new Audio('https://archive.org/download/MicrosoftWindows7StartupSound/Microsoft%20Windows%207%20Startup%20Sound.ogg');

        // Create when document ready
        document.addEventListener('DOMContentLoaded', () => {
            
            document.body.appendChild(this.desktop);

            const loginSpinner = document.createElement('img');
            loginSpinner.src = 'http://www.rw-designer.com/cursor-view/14456.png';
            loginSpinner.width = '80';
            loginSpinner.style = 'object-fit: none';

            const logintext = document.getElementById('logintext');
            logintext.appendChild(loginSpinner);
            logintext.innerHTML += 'Welcome';

            // Remove the loading screen when we finish loading & play startup sound!
            window.addEventListener('load', () => {
                const loginElement = document.getElementById('login');
                loginElement.style.animationName = 'login_fadein';
                
                StartupSound.play();
          
                setTimeout(() => {
                  loginElement.style.display = 'none';
                }, 1000)
            });
        })

        // Window index is the Z positioning on screen
        this.windowIndex = [];
        this.windowIndexStart = 100;

        // DB of windows
        this.windowDB = {};
    }

    createWindow = (windowType, initData={}) => {
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

    // Register a window (add to desktop)
    register = (windowType) => {

        // Make sure we aren't adding it again
        if (this.windowDB[windowType.FANCYNAME])
            return;
        
        // Add to windowDB
        this.windowDB[windowType.FANCYNAME] = windowType;

        // Create desktop icon
        const desktopIcon = document.createElement('button');
        desktopIcon.classList.add('desktopicon');
        desktopIcon.addEventListener('dblclick', () => {this.createWindow(windowType)});

        const icon = document.createElement('img');
        icon.src = windowType.ICON;

        const title = document.createElement('span');
        title.textContent = windowType.FANCYNAME;

        desktopIcon.appendChild(icon);
        desktopIcon.appendChild(title);

        this.desktop.appendChild(desktopIcon);
    }

}

class Personalisation {
    static docRoot = document.querySelector(':root');

    static getCssVar = (variable) => {
        return this.docRoot.style.getPropertyValue(variable);
    }

    static setCssVar = (variable, value) => {
        this.docRoot.style.setProperty(variable, value);
    }

    static setWallpaperImg = (url) => {
        this.setCssVar('--wallpaper', `url(${url})`);
    }

    static setWallpaperSize = (displayType) => {
        this.setCssVar('--wallpaper-size', displayType);
    }

    static setWallpaperPosition = (position) => {
        this.setCssVar('--wallpaper-position', position);
    }

    static setWallpaperRepeat = (repeat) => {
        this.setCssVar('--wallpaper-repeat', repeat ? 'repeat':'no-repeat');
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
      return 'https://' + string;
    }
    return string;
}

function browserUrl(string) {
    string = addHttpProtocol(string);
    if (string.indexOf('google.co') !== -1 && string.indexOf('igu=1') === -1) {
        string += (string.indexOf('?') !== -1 ? '&' : '?') + 'igu=1'
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