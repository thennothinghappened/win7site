// Window
class BaseWindow {

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

class ResizableWindow extends BaseWindow {
    
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

    /*createDesktopIcon = (icon, title, callback) => {
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

    // Register a window (add to desktop)
    installApp = (windowType) => {

        // Make sure we aren't adding it again
        if (this.windowDB[windowType.FANCYNAME])
            return;
        
        // Add to windowDB
        this.windowDB[windowType.FANCYNAME] = windowType;

        // Create desktop shortcut
        this.createDesktopIcon(windowType.ICON, windowType.FANCYNAME, windowType);
    }*/

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

// Simple file class for new files
class FileNode {
    constructor(data, metadata={}) {
        this.data = data;
        this.metadata = metadata;
    }
}

class FileSystem {

    #defaultUser = {
        'Desktop': {},
        'Documents': {},
        'AppData': {
            'Roaming': {},
            'LocalLow': {},
            'Local': {}
        }
    };

    #default_HKEY_LOCAL_MACHINE = {
        SOFTWARE: new FileNode({
            Microsoft: {
                Windows: {
                    CurrentVersion: {
                        Uninstall: {}
                    }
                }
            }
        }),
        SYSTEM: new FileNode({
            CurrentControlSet: {
                Control: {
                    'Session Manager': {
                        Environment: {}
                    }
                }
            }
        })
    };

    #default_HKEY_USERS = {
        Environment: {}
    };

    #defaultDrive = {
        'Program Files': {},
        'Windows': {
            'System32': {
                'config': this.#default_HKEY_LOCAL_MACHINE
            },
            'Profiles': {
                'DefaultUser': this.#default_HKEY_USERS
            }
        },
        'Users': {
            'DefaultUser': this.#defaultUser
        }
    };

    // Make sure localStorage is ready to go
    constructor() {

        let folders_need_check = true;

        // Format the drive for windows if it is empty (run installer!)
        if (!localStorage.getItem('d')) {
            // Drive doesn't exist...
            this.formatFS();
            // We don't need to re-check folder integrity.
            folders_need_check = false;
        }

        // Maintain a mirrored copy of the drive for easier access
        this.drive = this.getDrive();

        // Check folders...
        if (folders_need_check) {
            if (check_contains_keys(this.#defaultDrive, this.drive)) {
                console.log('Folder check passed.')
            } else {
                console.log('Folder check failed, appending missing...')
                this.drive = append_missing_keys(this.#defaultDrive, this.drive);
                this.saveDrive();
            }
        }
        
        console.log(this.fancyDriveSize());
    }

    // Remake the filesystem from scratch (throws away all data!!)
    formatFS = () => {
        this.drive = this.#defaultDrive;

        localStorage.setItem('d', JSON.stringify(this.drive));
    }

    /** Create new user */
    createUser = (name) => {
        if (this.drive['Users'][name]) 
            return false;
        
        this.drive['Users'][name] = this.#defaultUser;
    }

    /** Get the current drive state */ 
    getDrive = () => {
        return JSON.parse(localStorage.getItem('d'));
    }

    /** Save the drive state (bad, but good enough...) */
    saveDrive = () => {
        localStorage.setItem('d', JSON.stringify(this.drive));
    }

    /** Get the size of the drive in bytes */
    getDriveSize = () => {
        return new Blob(Object.values(localStorage)).size;
    }

    fancyDriveSize = () => {
        return `Drive size: ${Math.round(this.getDriveSize()/1024*100)/100}kb used of 5mb`;
    }

    /** Get a Node from a filepath */
    getNode = (path) => {
        if (!this.checkFileExists(path)) 
            return false;
        
        return getNestedValue(this.drive, path, '\\');
    }

    /** Check Node exists */
    checkNodeExists = (path) => {
        return (getNestedValue(this.drive, path, '\\') !== undefined);
    }

    /** Set a Node at a filepath */
    setNode = (path, node) => {
        setNestedValue(this.drive, path, '\\', node);
    }

    /** Get a key from the registry */
    getRegistryKey = (hive, key) => {
        return getNestedValue(this.drive.Windows.system32.config[hive].data, key, '\\');
    }

    /** Set a key in the registry */
    setRegistryKey = (hive, key, value) => {
        setNestedValue(this.drive.Windows.system32.config[hive].data, key, '\\', value);
    }

    /** Install an application from its window class */
    installApp = (app) => {
        // ""windows installer"" :p
        const applistKey = 'Microsoft\\Windows\\CurrentVersion\\Uninstall';
        const applist = this.getRegistryKey('HKEY_LOCAL_MACHINE', 'SOFTWARE', applistKey);

        // Check if app already installed
        if (applist[app.FANCYNAME] !== undefined) { 
            return false;
        }

        // Install the app...
        this.setRegistryKey('SOFTWARE', applistKey+'\\'+app.FANCYNAME, {
            InstallDate: new Date(),
        });

        // Create the Program Files folder for it
        const appFolder = {};
        appFolder[app.CSSNAME + '.exe'] = new FileNode(`windowManager.createWindow(${app.name}, initData);`);

        this.setNode('Program Files\\' + app.FANCYNAME, appFolder);

        // Create the desktop shortcut
        this.drive.Users.DefaultUser.Desktop[app.FANCYNAME + '.lnk'] = new FileNode(`Program Files\\${app.FANCYNAME}\\${app.CSSNAME}.exe`);

        // Save changes to disk
        this.saveDrive();

        return true;
    }

    /** Get the app associated with a filetype.
     * If there is none, prompt the user. */
    getProgramForFileExtension = (extension) => {
        const associations = this.getRegistryKey('')
    }

    /** Open a file */
    openFile = (path) => {

    }
}

const fileSystem = new FileSystem();
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

// Make sure an object has the same keys as a base to compare with
function check_contains_keys(base, test) {
    // https://stackoverflow.com/questions/33814687/best-way-to-check-a-javascript-object-has-all-the-keys-of-another-javascript-obj
    return Object.keys(base).every((key) => {
        return Object.prototype.hasOwnProperty.call(test, key);
    });
}

// Append missing keys from base object
function append_missing_keys(base, test) {
    Object.keys(base).forEach((key) => {
        // If property is missing...
        if (!Object.prototype.hasOwnProperty.call(test, key)) {
            test[key] = base[key];
        }
    });

    return test;
}

// Get a nested key from a string!
// https://stackoverflow.com/questions/34257474/how-to-get-the-value-of-nested-javascript-object-property-by-string-key
function getNestedValue(obj, key, splitter='.') {
    return key.split(splitter).reduce((result, k) => {
       return result[k] 
    }, obj);
}

// Set a nested key from a string!
// https://dirask.com/posts/JavaScript-set-a-value-of-nested-key-string-descriptor-inside-an-object-DlAzWp
function setNestedValue(obj, key, splitter='.', value) {
    const path = key.split(splitter);
    const limit = path.length - 1;

    for (let i = 0; i < limit; ++i) {
        const name = path[i];
        obj = obj[name] || (obj[name] == {});
    }

    const name = path[limit];
    obj[name] = value;
}