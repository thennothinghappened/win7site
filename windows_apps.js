// Default windows installed with the OS

class NotepadWindow extends ResizableWindow {

    static icon = 'https://www.file-extensions.org/imgs/app-icon/128/759/microsoft-windows-notepad-icon.png';
    static appname = 'Notepad';
    static appcatagories = ['Word Processor', 'Office', 'Productivity'];
    static description = 'Simple writing app.';

    constructor(initData, zPos) {

        const data = initData.data ?? {filename: ''};
        super((data.filename !== '' ? `Notepad - ${stripFilePath(data.filename)}` : 'Notepad'), initData.width ?? 650, initData.height ?? 400, zPos);

        this.filename = data.filename;
        this.textarea = document.createElement('textarea');
        this.textarea.textContent = data.text;
        this.window_contents.appendChild(this.textarea);
    }
}

class AboutWindow extends BaseWindow {

    static icon = 'https://pbs.twimg.com/profile_images/1116640019/windows-7-logo_400x400.png';
    static appname = 'About Windows';
    static appcatagories = ['Information'];
    static description = 'Information about your installation.';

    constructor(initData, zPos) {
        super('About Windows', 500, 420, zPos);

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
        okButton.addEventListener('click', () => {
            this.closeWindow();
        });

        dialog.appendChild(okButton);
        p4.appendChild(dialog);
        container.appendChild(p4);

        this.window_contents.appendChild(container);
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

        const goButton = document.createElement('input');
        goButton.type = 'button';
        goButton.name = 'Go';
        goButton.value = 'Go';
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

class ExplorerWindow extends ResizableWindow {

    static icon = null;
    static appname = 'Windows Explorer';
    static appcatagories = [];
    static description = 'Folder viewer tool';

    constructor(initData, zPos) {

        super('Windows Explorer', initData.width ?? 650, initData.height ?? 400, zPos);
        
    }

}

class ControlPanel extends ResizableWindow {

    static icon = '';
    static appname = 'Control Panel';

}

fileSystem.installApp(ExplorerWindow);
fileSystem.installApp(NotepadWindow);
fileSystem.installApp(AboutWindow);
fileSystem.installApp(IEWindow);