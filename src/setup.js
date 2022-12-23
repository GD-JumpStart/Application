const modal = require('./modal')
const fs = require('fs')
const https = require('https')
const path = require('path')
const decompress = require('decompress')
const crypto = require('crypto')

const setup = () => new Promise(async (resolve, reject) => {
    localStorage.NEWUSER = false
        document.querySelector('#modal').style.opacity = '0'
        location.reload()
    await new Promise(async resolve => {
        const valid = await new Promise(async resolve => {
            try {
                resolve(true)
            } catch {
                resolve(false)
            }
        })
        const dirwindow = await modal({ mouseLeave: false, close: false, title: 'Setup' })
        let dir = localStorage.GDDIR
        dirwindow.innerHTML = `<div style="
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        "></div><div style="
            padding: 10px;
            height: 43px;
            border-top: 1px #343a40 solid;
            margin-top: 10px;
            display: flex;
            justify-content: flex-end;
            align-items: center
        ">
            <button id="continue" class="style">Continue</button>
        </div>`

        if (fs.existsSync(localStorage.GDDIR) && valid) dirwindow.querySelector('div').innerHTML = `
            <p>Do you want to change your game directory?</p>
            <p>This can be used for installing mods with GDPSes.</p>
            <label style="margin: 10px 0px;" class="button"><input type="file" style="display: none" accept=".exe"/>Find Directory</label>
            <p style="font-size: 70%;" class="muted">Current directory: ${localStorage.GDDIR}</p>
        `
        else {
            dirwindow.querySelector('div').innerHTML = `
                <p>The default game directory could not be found.</p>
                <p>To continue, please locate to a working directory.</p>
                <label style="margin: 10px 0px;" class="button"><input type="file" style="display: none" accept=".exe"/>Find Directory</label>
                <p style="font-size: 70%;" class="muted">Current directory: none</p>
            `
            document.getElementById('continue').classList.add('disabled')
        }

        dirwindow.querySelector('input').addEventListener('change', async (e) => {
            dirwindow.querySelectorAll('p')[2].innerText = 'Current directory: ' + path.join(e.target.files[0].path, '../').replace(/\\/g, '/')
            const valid = await new Promise(async resolve => {
                try {
                    resolve(true)
                } catch {
                    resolve(false)
                }
            })
            if (valid) {
                document.getElementById('continue').classList.remove('disabled')
                dir = path.join(e.target.files[0].path, '../')
            } else {
                document.getElementById('continue').classList.add('disabled')
            }
        })

        document.getElementById('continue').addEventListener('click', async () => {
            if (!document.getElementById('continue').className.includes('disabled')) {
                localStorage.GDDIR = dir
                document.querySelector('#modal').style.opacity = '0'
                document.querySelector('#modalcontainer').style.opacity = '0'
                await wait(200)
                document.querySelector('#modalcontainer').style.display = 'none'
                await wait(100)
                resolve()
            }
        })
    })

    const setupwindow = await modal({ mouseLeave: false, close: false, title: 'Setup' })
    setupwindow.innerHTML = `<pre style="
        width: 100%;
        height: 100%;
        background: #121313;
        border: 1px solid #495057;
        border-radius: 6px;
        height: 300px;
        margin: 0px;
        display: flex;
        justify-content: stretch;
        align-items: flex-start;
        flex-direction: column;
        overflow-y: auto;
        margin-bottom: 10px;
    "></pre>`
    let console = setupwindow.querySelector('pre')
    await wait(200)

    function printconsole(input, type = 'log') {
        let color
        switch (type) {
            default:
            case 'log':
                color = '#f0f0f0'
                break
            case 'error':
                color = '#dc3545'
                break
            case 'warning':
                color = '#ffc107'
                break
            
        }
        console.innerHTML += `<code style="
            width: calc(100% - 8px);
            padding: 4px;
            background: ${console.querySelectorAll('code').length % 2 != 0 ? '#212529' : 'transparent'};
            white-space: pre-wrap;
            color: ${color};
        ">${input}</code>`
        console.scrollTop = console.scrollHeight
    }

    printconsole('Starting Setup')

    if (!fs.existsSync(path.join(localStorage.GDDIR, 'quickldr.dll'))) {
        printconsole('Quickldr Not Detected')
        printconsole('Installing Quickldr...')
        
        printconsole('    Downloading .zip')
        await new Promise(resolve => {
            https.get('https://cdn.discordapp.com/attachments/837026406282035300/859008315413626920/quickldr-v1.1.zip', async res => {
                const fp = fs.createWriteStream(path.join(process.env.TEMP, '/quickldr.zip'))
                res.pipe(fp)
                fp.on('finish', () => {
                    fp.close()
                    resolve()
                })
            }).on('error', err => {
                printconsole('    Unable to Download .zip: ' + err, 'error')
                
            })
        })
        if (!fs.existsSync(path.join(localStorage.GDDIR, '/libcurl.dll.bak'))) {
            printconsole('    Creating Backup libcurl.dll')
            fs.renameSync(path.join(localStorage.GDDIR, '/libcurl.dll'), path.join(localStorage.GDDIR, '/libcurl.dll.bak'))
        }
        printconsole('    Unpacking .zip')
        await new Promise(resolve => {
            decompress(path.join(process.env.TEMP, '/quickldr.zip'), localStorage.GDDIR)
                .catch(err => {
                    printconsole('    Error Unpacking .zip: ' + err, 'error')
                })
                .then(() => { resolve() })
        })
        if (!fs.existsSync(path.join(localStorage.GDDIR, '/quickldr'))) {
            printconsole('    Creating Mods Directory')
            fs.mkdirSync(path.join(localStorage.GDDIR, '/quickldr'))
        }
        if (!fs.existsSync(path.join(localStorage.GDDIR, '/quickldr/settings.txt'))) {
            printconsole('    Creating settings.txt')
            fs.writeFileSync(path.join(localStorage.GDDIR, '/quickldr/settings.txt'), '')
        }
        printconsole('    Install Finished')
    } else printconsole('Quickldr Detected')

    if (!fs.existsSync(path.join(localStorage.GDDIR, 'minhook.x32.dll'))) {
        printconsole('Minhook Not Detected')
        await new Promise(resolve => {
            https.get('https://cdn.discordapp.com/attachments/837026406282035300/856484662028795924/minhook.x32.dll', async res => {
            printconsole('    Downloading minhook.x32.dll')
                const fp = fs.createWriteStream(path.join(localStorage.GDDIR, '/minhook.x32.dll'))
                res.pipe(fp)
                fp.on('finish', () => {
                    fp.close()
                    resolve()
                })
            })
        })
    } else {
        printconsole('Minhook Detected')
    }

    if (fs.existsSync(path.join(localStorage.GDDIR, 'hackpro.dll'))) {
        printconsole('Mega Hack v7 Detected')
        localStorage.MHV7 = true
    } else {
        printconsole('Mega Hack v7 Not Detected')
        localStorage.MHV7 = false
    }

    printconsole('Setup Finished')
    
    document.querySelector('#topsection button').style.display = 'flex'
    document.querySelector('#topsection button').addEventListener('click', async () => {
        localStorage.NEWUSER = false
        document.querySelector('#modal').style.opacity = '0'
        location.reload()
    })

    printconsole('Please Close This Popup to Continue')

    resolve()
})

module.exports = setup