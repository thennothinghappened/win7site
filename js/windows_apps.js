// Default windows installed with the OS

import { BaseWindow, FileNode, fileSystem, ResizableWindow, stripFilePath } from './windows.js';

export class NotepadWindow extends ResizableWindow {

    static icon = 'https://www.file-extensions.org/imgs/app-icon/128/759/microsoft-windows-notepad-icon.png';
    static appname = 'Notepad';
    static appcatagories = ['Word Processor', 'Office', 'Productivity'];
    static description = 'Simple writing app.';
    static fileassociations = ['.txt'];

    constructor(initData, zPos) {

        const data = initData.data ?? {path: ''};
        super('Notepad', initData.width ?? 650, initData.height ?? 400, zPos);

        this.textarea = document.createElement('textarea');
        this.window_contents.appendChild(this.textarea);
        this.file = new FileNode('');
        this.dataType = 'string';

        if (data.path !== '')
            this.openFile(data.path);
    }

    getNotepadName = (path) => {
        return (path !== '' ? `Notepad - ${stripFilePath(path)}` : 'Notepad');
    }

    setNotepadName = (filename) => {
        this.window_title.textContent = this.getNotepadName(filename);
    }

    openFile = (filename) => {

        this.filename = filename;
        const newFile = fileSystem.getNode(this.filename);

        if (newFile === undefined || fileSystem.nodeIsFolder(this.filename)) {
            // File doesnt exist or is a folder
            return false;
        }

        this.file = newFile;
        this.dataType = typeof this.file.data;
        this.textarea.value = this.dataType === 'string' ? this.file.data : JSON.stringify(this.file.data);
        this.setNotepadName(filename);

        return true;
    }

    saveFile = (filename=this.filename) => {
        // Save the file to a node

        let changing_file = false;
        if (this.filename !== filename) {
            // Changing file
            this.filename = filename;
            changing_file = true;

        }

        // if a string file, save directly, else assume its json.
        if (this.dataType === 'string')
            this.file.data = this.textarea.value;
        else {
            try {
                const newContent = JSON.parse(this.textarea.value);
                this.file.data = newContent;
            } catch (e) {
                // failed to parse, do not save.
                console.error('Failed to parse JSON for saving with notepad:', e);
                return false;
            }
        }

        if (changing_file)
            this.setNotepadName(this.filename);

        fileSystem.saveFile(this.filename, this.file);
        fileSystem.saveDrive();
        return true;
    }
}

export class AboutWindow extends BaseWindow {

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
