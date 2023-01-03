const modal = require('./modal')
const fs = require('fs')
const https = require('https')
const path = require('path')
const decompress = require('decompress')
const crypto = require('crypto')
const os = require ('os');
const username = os.userInfo ().username;
let dir = path.join('/Users/', username, '/Library/Application Support/Steam/steamapps/common/Geometry Dash/Geometry Dash.app/Contents')

const setup = () => new Promise(async (resolve, reject) => {
    await new Promise(async resolve => {
        const valid = await new Promise(async resolve => {
            try {
                resolve(true)
            } catch {
                resolve(false)
            }
        })
        const dirwindow = await modal({ mouseLeave: false, close: false, title: 'Setup' })
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

        if (fs.existsSync(dir) && valid) dirwindow.querySelector('div').innerHTML = `
            <p>Do you want to change your game directory?</p>
            <p>This can be used for installing mods with GDPSes.</p>
            <label style="margin: 10px 0px;" class="button"><input type="file" style="display: none" accept=".app"/>Find Directory</label>
            <p style="font-size: 70%;" class="muted">Current directory: ${localStorage.GDDIR}</p>
        `
        else {
            dirwindow.querySelector('div').innerHTML = `
                <p>The default game directory could not be found.</p>
                <p>To continue, please locate to a working directory.</p>
                <label style="margin: 10px 0px;" class="button"><input type="file" style="display: none" accept=".app"/>Find Directory</label>
                <p style="font-size: 70%;" class="muted">Current directory: none</p>
            `
            document.getElementById('continue').classList.add('disabled')
        }

        dirwindow.querySelector('input').addEventListener('change', async (e) => {
            document.getElementById('continue').classList.remove('disabled')
        })

        document.getElementById('continue').addEventListener('click', async () => {
            if (!document.getElementById('continue').className.includes('disabled')) {
                storage.GDDIR = dir
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

    if (!fs.existsSync(path.join(dir, 'Geode.dylib'))) {
        printconsole('Geode Loader Not Detected')
        printconsole('Installing Geode...')
        printconsole('    Downloading .dylib')
        await new Promise(resolve => {
            https.get('https://cdn.discordapp.com/attachments/993154713304449124/1056322658297462784/Geode.dylib', async res => {
                const fp = fs.createWriteStream(path.join(dir, 'Frameworks/Geode.dylib'))
                res.pipe(fp)
                fp.on('finish', () => {
                    fp.close()
                    printconsole('    Completed Downloading Geode.dylib')
                    resolve()
                })
            }).on('error', err => {
                printconsole('    Unable to Download .dylib: ' + err, 'error')
                
            })
            
        })
    } else {
        printconsole('Geode Loader Detected')
    }

    if (!fs.existsSync(path.join(storage.FRAMEWORKS, 'GeodeBootstrapper.dylib'))) {
        printconsole('Geode Bootstrapper Not Detected')
        printconsole('Installing Geode Bootstrapper...')
        printconsole('    Downloading .dylib')
        await new Promise(resolve => {
            https.get('https://cdn.discordapp.com/attachments/993154713304449124/1056322682288865310/GeodeBootstrapper.dylib', async res => {
                const fp = fs.createWriteStream(path.join(dir, 'Frameworks/GeodeBootstrapper.dylib'))
                res.pipe(fp)
                fp.on('finish', () => {
                    fp.close()
                    printconsole('    Completed Downloading GeodeBootstrapper.dylib')
                    resolve()
                })
            }).on('error', err => {
                printconsole('    Unable to Download .dylib: ' + err, 'error')
                
            })
            
        })
    } else {
        printconsole('Geode Bootstrapper Detected')
    }

    if (fs.existsSync(path.join(dir, 'libfmod.dylib'))) {
        printconsole('libfmod Detected')
        printconsole('Replacing libfmod...')
        await new Promise(resolve => {
            fs.rename(path.join(dir, 'Frameworks/libfmod.dylib'), path.join(dir, 'Frameworks/libfmod.dylib.original'), (error) => {
                if (error) {
                    printconsole('    Unable to Replace libfmod: ' + err, 'error')
                } else {
                    printconsole('    Completed Replacing libfmod')
                    resolve()
                }
            });
            
        })
        printconsole('    Downloading New libfmod')
        await new Promise(resolve => {
            https.get('https://cdn.discordapp.com/attachments/993154713304449124/1056358949835780207/libfmod.dylib', async res => {
                const fp = fs.createWriteStream(path.join(dir, 'Frameworks/libfmod.dylib'))
                res.pipe(fp)
                fp.on('finish', () => {
                    fp.close()
                    printconsole('    Completed Downloading libfmod.dylib')
                    resolve()
                })
            }).on('error', err => {
                printconsole('    Unable to Download .dylib: ' + err, 'error')
                
            })
            
        })
    } else {
        printconsole('libfmod Not Detected')
        printconsole('Downloading libfmod...')
        printconsole('    Downloading .dylib')
        await new Promise(resolve => {
            https.get('https://cdn.discordapp.com/attachments/993154713304449124/1056358949835780207/libfmod.dylib', async res => {
                const fp = fs.createWriteStream(path.join(dir, 'Frameworks/libfmod.dylib'))
                res.pipe(fp)
                fp.on('finish', () => {
                    fp.close()
                    printconsole('    Completed Downloading libfmod.dylib')
                    resolve()
                })
            }).on('error', err => {
                printconsole('    Unable to Download .dylib: ' + err, 'error')
                
            })
        })
    }

    printconsole('Setup Finished')
    
    document.querySelector('#topsection button').style.display = 'flex'
    document.querySelector('#topsection button').addEventListener('click', async () => {

        document.querySelector('#modal').style.opacity = '0'
        location.reload()
    })

    printconsole('Please Close This Popup to Continue')


    resolve()

})

module.exports = setup