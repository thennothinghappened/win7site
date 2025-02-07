
// Window
export class BaseWindow {

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
    static fileassociations = [];

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

    static get ASSOCIATIONS() {
        return this.fileassociations;
    }
}

export class ResizableWindow extends BaseWindow {
    
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

        // Get the startup sound
        const StartupSound = new Audio('https://archive.org/download/MicrosoftWindows7StartupSound/Microsoft%20Windows%207%20Startup%20Sound.ogg');

        // Create when document ready
        document.addEventListener('DOMContentLoaded', () => {
            
            document.body.appendChild(fileSystem.desktop);

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
                Personalisation.loadWallpaper();
          
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
        try {
            const window = new windowType(initData, this.windowIndex.length);
            this.windowIndex.push(window);
            this.refreshWindowOrder();
        } catch (e) {
            console.error(e);
        }
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

}

class Personalisation {
    // ill fix it later
    static defaultFileIcon = 'https://64.media.tumblr.com/ecebabec49b20582e38d37d22da38a10/5eebb6709b3b0f53-cc/s540x810/821ebf28566545369c64b31a33607b940f8c0b53.png';
    static defaultFolderIcon = 'https://icons.iconarchive.com/icons/visualpharm/must-have/256/Folder-icon.png';
    static docRoot = document.querySelector(':root');

    static loadWallpaper = () => {
        const wD = fileSystem.getRegistryKey('HKEY_CURRENT_USER', 'SOFTWARE', 'Microsoft\\Windows\\CurrentVersion\\Policies\\System\\Wallpaper');
        
        this.setWallpaperImg(wD.url);
        this.setWallpaperSize(wD.size);
        this.setWallpaperPosition(wD.position);
        this.setWallpaperRepeat(wD.repeat);
        this.setWallpaperFallbackColour(wD.fallbackColour);
    }

    static getCssVar = (variable) => {
        return this.docRoot.style.getPropertyValue(variable);
    }

    static setCssVar = (variable, value) => {
        this.docRoot.style.setProperty(variable, value);
    }

    static setWallpaperImg = (url) => {
        this.setCssVar('--wallpaper', `${url}`);
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

    static setWallpaperFallbackColour = (colour) => {
        this.setCssVar('--wallpaper-fallback-colour', colour);
    }

    static saveWallpaper = () => {
        fileSystem.setRegistryKey('HKEY_CURRENT_USER', 'SOFTWARE', 'Microsoft\\Windows\\CurrentVersion\\Policies\\System\\Wallpaper', {
            url: this.getCssVar('--wallpaper'),
            size: this.getCssVar('--wallpaper-size'),
            position: this.getCssVar('--wallpaper-position'),
            repeat: this.getCssVar('--wallpaper-repeat') == 'repeat' ? true : false,
            fallbackColour: this.getCssVar('--wallpaper-fallback-colour')
        });
    }
}

// Simple file class for new files
export class FileNode {

    static METADATA_PROPS = {
        icon: {fancyName: 'Icon'},
        dateModified: {fancyName: 'Date modified', readProp: (d) => {
            const date = new Date(d);
            return date.getDay() + '/' + date.getMonth() + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();
        }}
    };

    constructor(data, metadata={}) {
        this.data = data;
        this.metadata = metadata;
        if (this.metadata?.dateModified === undefined)
            this.metadata.dateModified = new Date();
    }
}

class InstallerFile extends FileNode {
    constructor(name, assets, installerAssets) {
        super(
            {
                name: name,
                assets: assets,
                installerAssets: installerAssets
            },
            
        );
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
                        Explorer: {
                            FileExts: {}
                        },
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

    #default_HKEY_CURRENT_USER = {
        Environment: new FileNode({}),
        SOFTWARE: new FileNode({
            Microsoft: {
                Windows: {
                    CurrentVersion: {
                        Explorer: {
                            FileExts: {}
                        },
                        Policies: {
                            System: {
                                Wallpaper: {
                                    url: 'url(\'https://wallpapercave.com/wp/Wn3Dygb.jpg\')',
                                    size: 'cover',
                                    position: 'center',
                                    repeat: true,
                                    fallbackColour: 'black'
                                },
                            }
                        }
                    }
                }
            }
        })
    };

    #defaultDrive = {
        'Program Files': {},
        'Windows': {
            'System32': {
                'config': this.#default_HKEY_LOCAL_MACHINE
            },
            'Profiles': {
                'DefaultUser': this.#default_HKEY_CURRENT_USER
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

        // Login
        this.CurrentUser = 'DefaultUser';

        // Prepare desktop

        // Create the desktop and start menu (later)
        this.desktop = document.createElement('div');
        this.desktop.id = 'desktop';

        const desktopNode = this.getNode(`Users\\${this.CurrentUser}\\Desktop`);
        Object.keys(desktopNode).forEach((node) => {
            this.createDesktopIcon(node, desktopNode[node]?.metadata?.icon ?? Personalisation.defaultFileIcon);
        });

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
        // Make sure we have a path
        if (path === '') return this.drive;
        return getNestedValue(this.drive, path, '\\');
    }

    /** Get the name of a node from a filepath */
    getNodeName = (path) => {
        const lastPosBackslash = path.lastIndexOf('\\');

        // Deal with top level...
        if (lastPosBackslash === -1) return path;

        return path.slice(lastPosBackslash+1);

    }

    /** Check if a node is a folder */
    nodeIsFolder = (path) => {
        const node = this.getNode(path);

        // Files always contain a member called metadata.
        // We know it is a folder if it doesn't (yes, that means 'metadata' is a disallowed filename)
        if (node && node?.metadata === undefined) return true;
        return false;
    }

    /** Check Node exists */
    checkNodeExists = (path) => {
        return (this.getNode(path) !== undefined);
    }

    /** Set a Node at a filepath */
    setNode = (path, node) => {
        setNestedValue(this.drive, path, '\\', node);
    }

    /** Save a file */
    saveFile = (path, file, overwrite_prompt=true) => {
        
        // Don't overwrite a folder.
        if (this.nodeIsFolder(path)) {
            return false;
        }

        // Check if we want to overwrite it
        if (overwrite_prompt && this.checkNodeExists(path)) {
            // TODO Overwrite prompt
        }

        // Set the modification date
        file.metadata.dateModified = new Date();
        console.log(file)

        this.setNode(path, file);
        return true;
    }

    getHkey = (hkeyName) => {
        switch (hkeyName) {
            case 'HKEY_USERS': return this.drive.Windows.Profiles;
            case 'HKEY_CURRENT_USER': return this.drive.Windows.Profiles[this.CurrentUser];
            case 'HKEY_LOCAL_MACHINE': return this.drive.Windows.System32.config;
            default: return null;
        }
    }

    /** Get a key from the registry */
    getRegistryKey = (hkeyName, hive, key) => {
        return getNestedValue(this.getHkey(hkeyName)[hive].data, key, '\\');
    }

    /** Set a key in the registry */
    setRegistryKey = (hkeyName, hive, key, value) => {
        setNestedValue(this.getHkey(hkeyName)[hive].data, key, '\\', value);
        this.saveDrive();
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
        this.setRegistryKey('HKEY_LOCAL_MACHINE', 'SOFTWARE', applistKey+'\\'+app.FANCYNAME, {
            InstallDate: new Date(),
        });

        // Create the Program Files folder for it
        const appFolder = {};
        appFolder[app.CSSNAME + '.exe'] = new FileNode(`windowManager.createWindow(${app.name}, initData);`, {icon: app.ICON});

        this.setNode('Program Files\\' + app.FANCYNAME, appFolder);

        // Create the desktop shortcut
        this.drive.Users.DefaultUser.Desktop[app.FANCYNAME + '.lnk'] = new FileNode(`file://Program Files\\${app.FANCYNAME}\\${app.CSSNAME}.exe`, {icon: app.ICON});

        // Add file associations
        app.ASSOCIATIONS.forEach((fileExtension) => {
            this.addFileExtensionAssociation(fileExtension, app);
        });

        // Save changes to disk
        this.saveDrive();

        return true;
    }

    /** Base get file extension... */
    getFileExtension = (fileExtension) => {
        const extPath = 'Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\'+fileExtension;
        if (this.getRegistryKey('HKEY_LOCAL_MACHINE', 'SOFTWARE', extPath) === undefined) {
            this.addFileExtension(fileExtension);
        }

        return this.getRegistryKey('HKEY_LOCAL_MACHINE', 'SOFTWARE', extPath);
    }

    /** Get the file extension name from a path */
    getFileExtensionName = (path) => {
        const filename = this.getNodeName(path);
        const extPos = filename.lastIndexOf('.');

        // Deal with no extension
        if (extPos === -1) return '';

        return filename.slice(extPos+1);
    }

    /** Get the app associated with a filetype.
     * If there is none, prompt the user. */
     getDefaultExtensionAssociation = (extension) => {
        const associations = this.getRegistryKey('HKEY_CURRENT_USER', 'SOFTWARE', 'Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts');
        if (!associations[extension]) {
            // Open it in notepad for now
            return 'NotepadWindow';
        }

        return associations[extension].Progid;
    }

    /** Get the default file extension icon */
    getFileExtensionIcon = (fileExtension) => {
        return this.getFileExtension(fileExtension)?.icon;
    }

    /** Create a file extension entry if it doesn't exist */
    addFileExtension = (fileExtension, icon) => {
        const extPath = 'Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\'+fileExtension;
        if (this.getRegistryKey('HKEY_LOCAL_MACHINE', 'SOFTWARE', extPath) !== undefined)
            return false;
        
        this.setRegistryKey('HKEY_LOCAL_MACHINE', 'SOFTWARE', extPath, {
            applist: [],
            icon: icon ?? null
        });

        this.saveDrive();

        return true;
        
    }

    /** Add a file extension association for a program */
    addFileExtensionAssociation = (fileExtension, app) => {
        // Add as possible to open with
        const extPath = 'Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts';

        // Get current list of apps to open it with
        const ext = this.getRegistryKey('HKEY_LOCAL_MACHINE', 'SOFTWARE', extPath);
        let appList = [app.name];

        if (ext[fileExtension] !== undefined) {
            // If the key already exists, append ours instead
            ext.applist.push(app.name);
            appList = ext.applist;

        }

        this.setRegistryKey('HKEY_LOCAL_MACHINE', 'SOFTWARE', extPath+'\\'+fileExtension, {
            applist: appList
        });

        this.saveDrive();
    }

    /** Set the default program to open a file with */
    setDefaultExtensionAssociation = (fileExtension, app) => {
        this.setRegistryKey('HKEY_CURRENT_USER', 'SOFTWARE', 'Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\'+fileExtension, {
            UserChoice: app.name
        });

        this.saveDrive();
    }

    /** Set the default icon for a file type */
    setDefaultExtensionIcon = (fileExtension, icon) => {
        const extPath = 'Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\'+fileExtension;
        const ext = this.getRegistryKey('HKEY_LOCAL_MACHINE', 'SOFTWARE', extPath);
        ext.icon = icon;
    }

    /** Open a file */
    openFile = (path, initData={}) => {

        // Make sure it exists...
        if (!this.checkNodeExists(path)) {
            return false;
        }

        // Handle folders
        if (this.nodeIsFolder(path)) {
            // Open in Explorer
            windowManager.createWindow(ExplorerWindow, {data: {path: path}});
            return false;
        }

        // Get file extension
        const ext = '.' + path.split('.').pop();

        switch (ext) {

            // Handle hard-coded cases first...
            case '.exe': 
                // Run the program using eval (very unsafe, as is windows :p)
                const program = this.getNode(path).data;
                try {
                    eval(program);
                } catch (error) {
                    // program failed to execute
					console.error(`Executable '${path}' failed to execute with exception`, error);
                }

                break;

            case '.lnk':
                // File is just a pointer to another file, so go open that one...
                const data = this.getNode(path).data;
                const link = trimAndGetUrlScheme(data);
                
                if (link.scheme === 'file') {
                    this.openFile(link.url);
                    break;
                }
                
                if (link.scheme === 'http' || link.scheme === 'https') {
                    windowManager.createWindow(IEWindow, {data: {url: data}})
                    break;
                }
                
                // Unknown scheme... show error (later)

                break;

            // Handle using app specified
            default: 
                windowManager.createWindow(eval(this.getDefaultExtensionAssociation(ext)), {data: {path: path}});
                break;
        }

        return true;
    }

    /** Get the icon for a file or folder from its path */
    getNodeIcon = (path) => {
        if (this.nodeIsFolder(path))
            return Personalisation.defaultFolderIcon;
        
        const node = this.getNode(path);
        if (path.indexOf('.') !== -1)
            // Get the node's icon, fallback default extension icon, fallback default icon.
            return node.metadata?.icon ?? this.getFileExtensionIcon(this.getFileExtensionName(path)) ?? Personalisation.defaultFileIcon;
        else
            // Default fallback icon
            return Personalisation.defaultFileIcon;
        
    }

    /** Create a desktop icon */
    createDesktopIcon = (filename, icon) => {

        // Get file extension
        const path = `Users\\${this.CurrentUser}\\Desktop\\${filename}`;
        const ext = '.' + path.split('.').pop();

        const desktopIcon = document.createElement('button');
        desktopIcon.type = 'button';
        desktopIcon.classList.add('desktopicon');
        desktopIcon.addEventListener('dblclick', () => {
            this.openFile(path);
        });

        const img = document.createElement('img');
        img.src = icon ?? this.getFileExtensionIcon(ext);

        const title = document.createElement('span');
        title.textContent = filename;

        desktopIcon.appendChild(img);
        desktopIcon.appendChild(title);

        this.desktop.appendChild(desktopIcon);
    }

}

export const fileSystem = new FileSystem();
export const windowManager = new WindowManager();

class ExplorerWindow extends ResizableWindow {

    static icon = 'https://winaero.com/blog/wp-content/uploads/2016/05/Windows-7-8.1.png';
    static appname = 'Windows Explorer';
    static appcatagories = [];
    static description = 'Folder viewer tool';
    static fileassociations = ['.htm', '.html'];

    url = '';
    columns = ['icon', 'name', 'dateModified'];

    constructor(initData, zPos) {

        super('Windows Explorer', initData.width ?? 650, initData.height ?? 400, zPos);

        this.main = document.createElement('div');
        this.main.classList.add('window_windowsexplorer_main');

        // Navbar
        this.navBar = document.createElement('nav');
        this.navBar.classList.add('window_windowsexplorer_navbar');

        // navbar > URL box for seeing current dir
        this.urlBox = document.createElement('input');
        this.urlBox.readOnly = true;

        // navbar > Go to previous directory
        this.goUpBox = document.createElement('button');
        this.goUpBox.textContent = '^';
        this.goUpBox.addEventListener('click', this.goUp);

        // Create the directory list
        this.dirListingContainer = document.createElement('table');
        this.dirListingContainer.classList.add('window_windowsexplorer_dirlist');

        // Create dirlist header
        this.dirListingHeader = document.createElement('thead');

        // Create dirlist contents
        this.dirListing = document.createElement('tbody');

        // Add them both as children of the dirlist container
        this.dirListingContainer.appendChild(this.dirListingHeader);
        this.dirListingContainer.appendChild(this.dirListing);

        this.navBar.appendChild(this.urlBox);
        this.navBar.appendChild(this.goUpBox);
        this.main.appendChild(this.navBar);
        this.main.appendChild(this.dirListingContainer);
        this.window_contents.appendChild(this.main);

        this.updateDirList();
        
    }

    createDirList = (nodes={}) => {
        // Reset dirlist
        this.dirListingHeader.innerHTML = '';
        this.dirListing.innerHTML = '';

        // Add header row
        const dir_list_header = document.createElement('tr');

        // Header > create column for each
        this.columns.forEach(column => {
            let fancy_name = FileNode.METADATA_PROPS[column]?.fancyName ?? column;

            // If the column is the name prop, it isn't found in metadata.
            if (column === 'name')
                fancy_name = 'Name';

            const new_column = document.createElement('th');
            new_column.textContent = fancy_name;
            dir_list_header.appendChild(new_column);

            return;
        });

        this.dirListingHeader.appendChild(dir_list_header);

        // Body > create file list
        Object.keys(nodes).forEach(key => {
            const url = this.url + '\\' + key;
            const node_is_folder = fileSystem.nodeIsFolder(url);
            const new_row = document.createElement('tr');

            this.columns.forEach(column => {
                const new_column = document.createElement('td');
                
                switch (column) {

                    case 'name':
                        new_column.textContent = key;
                        break;

                    case 'icon':
                        const icon = document.createElement('img');
                        icon.src = fileSystem.getNodeIcon(url);
                        icon.style.height = '20px';
                        new_column.appendChild(icon);
                        new_column.style.textAlign = 'center';

                        break;

                    default:
                        if (node_is_folder)
                            break;

                        let prop = nodes[key].metadata[column];
                        
                        if (prop !== undefined && FileNode.METADATA_PROPS[column]?.readProp !== undefined)
                            prop = FileNode.METADATA_PROPS[column]?.readProp(prop);

                        new_column.textContent = prop ?? '';
                        break;
                }

                new_row.appendChild(new_column);
            });

            if (node_is_folder)
                new_row.addEventListener('dblclick', () => {
                    this.updateDirList(url);
                });
            else
                new_row.addEventListener('dblclick', () => {
                    fileSystem.openFile(url);
                });

            this.dirListing.appendChild(new_row);
        });

        return true;
    }

    goUp = () => {
        this.updateDirList(this.url.slice(0, this.url.lastIndexOf('\\')));
    }

    updateDirList = (url=this.url) => {
        const list = fileSystem.getNode(url);
        if (!list) {
            return false;
        }

        if (url !== this.url) {
            this.url = url;
            this.urlBox.value = this.url;
        }

        this.createDirList(list);

        return true;
    }

}

class IEWindow extends ResizableWindow {

    static icon = 'https://static.wikia.nocookie.net/logopedia/images/a/a9/Internet_Explorer_logo_2007.svg/revision/latest?cb=20200726002419';
    static appname = 'Internet Explorer';
    static appcatagories = ['Web Browser'];
    static description = 'The default web browser for Windows 7.';

    url = 'https://google.com?igu=1';
    loadSpinner;
    iframe;

    constructor(initData, zPos) {

        super('Internet Explorer', initData.width ?? 1000, initData.height ?? 600, zPos);
        
        if (initData.data)
            this.url = initData.data.url ?? this.url;

        const navBar = document.createElement('div');
        this.urlBox = document.createElement('input');
        this.urlBox.type = 'text';
        this.urlBox.name = 'url';
        this.urlBox.value = this.url;
        this.urlBox.classList.add('window_internetexplorer_urlbox');

        const goButton = document.createElement('button');
        goButton.textContent = 'Go';
        // Go to the new address!
        goButton.addEventListener('click', () => {
            this.url = browserUrl(this.urlBox.value);
            this.urlBox.value = this.url;
            this.iframe.src = this.url;
            this.loadSpinner.style.opacity = 1;
        });

        this.loadSpinner = document.createElement('div');
        this.loadSpinner.classList.add('window_internetexplorer_spinner');

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

export function init() {

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

	fileSystem.installApp(ExplorerWindow);
	fileSystem.installApp(IEWindow);

}

function trimAndGetUrlScheme(string) {
    const tempStr = string.split('://');

    return {
        scheme: tempStr[0],
        url: tempStr[1]
    };
}

function addHttpProtocol(string) {
    if (!string.startsWith('http://') && !string.startsWith('https://') && !string.startsWith('file://')) {
      return 'https://' + string;
    }
    return string;
}

export function browserUrl(string) {
    string = addHttpProtocol(string);
    if (string.indexOf('google.co') !== -1 && string.indexOf('igu=1') === -1) {
        string += (string.indexOf('?') !== -1 ? '&' : '?') + 'igu=1'
    }

    return string;
}

export function stripFilePath(filename) {
    return filename.split('\\').pop();
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

    // Make sure it has a separator anyway
    if (key.indexOf(splitter) === -1)
        return obj[key];
    
    // remove leading
    while (key.startsWith(splitter))
        key = key.slice(splitter.length);

    return key.split(splitter).reduce((result, k) => {
        if (result === undefined) return undefined;
        return result[k];
    }, obj);
}

// Set a nested key from a string!
// https://dirask.com/posts/JavaScript-set-a-value-of-nested-key-string-descriptor-inside-an-object-DlAzWp
function setNestedValue(obj, key, splitter='.', value) {

    // Make sure it has a separator anyway
    if (key.indexOf(splitter) === -1) {
        obj[key] = value;
    }

    // remove leading
    while (key.startsWith(splitter))
        key = key.slice(splitter.length);

    const path = key.split(splitter);
    const limit = path.length - 1;

    for (let i = 0; i < limit; ++i) {
        const name = path[i];
        obj = obj[name] || (obj[name] == {});
    }

    const name = path[limit];
    obj[name] = value;
}