function random_range(min, max) {
    const maximum = max - min;
    return Math.floor(Math.random() * maximum) + min;
}

// Window
class Window {

    constructor(windowName, windowTitle, windowIcon=null, contents, width=300, height=200, canResize=true, zPos, initFunction) {

        this.windowTitle = windowTitle;
        this.windowIcon = windowIcon;
        this.width = width;
        this.height = height;
        this.zPos = zPos;
        
        // Create window in DOM //

        // base window
        this.window = document.createElement('div');
        this.window.classList.add('window', 'pop_out', windowName);
        this.window.style.top = random_range(10, 40) + 'vh';
        this.window.style.left = random_range(20, 40) + 'vw';

        // window -> titlebar
        this.window_titlebar = document.createElement('div');
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

        // window -> titlebar -> close button
        this.window_title_closebutton = document.createElement('button');
        this.window_title_closebutton.classList.add('windowbutton', 'closebutton');
        this.window_title_closebutton.innerText = 'X';
        this.window_title_closebutton.addEventListener('click', this.closeWindow);
        this.window_titlebar.appendChild(this.window_title_closebutton);

        // window -> content
        this.window_contents = document.createElement('div');
        this.window_contents.classList.add('windowmain');
        this.window_contents.innerHTML = contents;

        if (canResize) {
            this.window_contents.style.minWidth = `${width}px`;
            this.window_contents.style.minHeight = `${height}px`;
        } else {
            this.window_contents.style.width = `${width}px`;
            this.window_contents.style.height = `${height}px`;
        }
        this.window.appendChild(this.window_contents);

        // Make draggable
        this.window_titlebar.onmousedown = this.startDragWindow;

        initFunction(this);

        // Insert the window
        document.body.appendChild(this.window);
        this.window.style.display = 'block';
        this.window.focus();
    }

    startDragWindow = (e) => {
        this.pos1=0;
        this.pos2=0;
        this.pos3=0;
        this.pos4=0;

        e = e || window.event;
        e.preventDefault();

        // get the mouse cursor position at startup:
        this.pos3 = e.clientX;
        this.pos4 = e.clientY;
        document.onmouseup = this.stopDragWindow;
        // call a function whenever the cursor moves:
        document.onmousemove = this.dragWindow;
    }

    stopDragWindow = () => {
        document.onmouseup = null;
        document.onmousemove = null;
    }

    dragWindow = (e) => {
        // calculate the new cursor position:
        this.pos1 = this.pos3 - e.clientX;
        this.pos2 = this.pos4 - e.clientY;
        this.pos3 = e.clientX;
        this.pos4 = e.clientY;
        // set the element's new position:
        this.window.style.top = (this.window.offsetTop - this.pos2) + "px";
        this.window.style.left = (this.window.offsetLeft - this.pos1) + "px";
    }

    minimiseWindow = () => {
        if (this.window.style.display === 'block') this.window.style.display = 'none';
        else this.window.style.display = 'block';
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

// Create window templates
class WindowManager {

    constructor() {
        this.windowTemplates = {};
        this.windowIndex = [];
        this.windowIndexStart = 100;
    }

    createWindowTemplate = async (windowName, windowTitle, windowIcon=null, contents, width, height, canResize) => {

        this.windowTemplates[windowName] = {
            windowTitle: windowTitle,
            windowIcon: windowIcon,
            contents: contents,
            width: width,
            height: height,
            canResize: canResize
        };
    }

    windowFromTemplate = async (windowName, initFunction=()=>{}) => {
        const window = this.windowTemplates[windowName];
        if (window === null) {
            console.error(`Attempted to create a null window with name ${windowName}`);
            return;
        }

        const win = new Window(windowName, window.windowTitle, window.windowIcon, window.contents, window.width, window.height, window.canResize, this.windowIndex, initFunction);
        this.windowIndex.push(win);
        this.refreshWindowOrder();
    }

    refreshWindowOrder = () => {
        this.windowIndex.forEach((w, i) => {
            w.window.style.zIndex = this.windowIndexStart + i;
        });

        setTimeout(() => this.windowIndex[this.windowIndex.length - 1].window.focus(), 20);
    };

    removeWindow = (id) => {
        this.windowIndex.slice(id, id);
        //this.refreshWindowOrder();
    }

    createDesktopIcon = () => {
        
    }

}

// Override behaviour of some elements
document.addEventListener('click', (e) => {
    e = window.e || e;

    // Open links in internal browser
    if (e.target.tagName === 'A') {
        e.preventDefault();
        
        windowManager.windowFromTemplate('browser', w => {
            w.window.getElementsByClassName('url')[0].value = e.target.href;
            w.window.getElementsByClassName('browserWindow')[0].src = e.target.href;
        });
    }
});

function addHttpProtocol(string) {
    if (!string.startsWith('http://') && !string.startsWith('https://')) {
      return 'http://' + string;
    }
    return string;
}