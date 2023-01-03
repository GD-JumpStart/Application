const page = async (pg) => {
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

    document.querySelector('body > main > *').style.opacity = '0'
    await wait(200)

    document.querySelector('body > main').innerHTML = ''
    document.querySelectorAll(`aside span a`).forEach(e => { e.style.background = '' })
    document.querySelector(`aside span a[data-page="${pg}"]`).style.background = '#343a40'

    var units = {
        year  : 31536e6,
        month : 2628e6,
        day   : 864e5,
        hour  : 36e5,
        minute: 6e4,
        second: 1e3
    }

    var rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

    const getRelativeTime = (d1, d2 = new Date()) => {
        var elapsed = d1 - d2
        for (var u in units) if (Math.abs(elapsed) > units[u] || u == 'second') 
        return rtf.format(Math.round(elapsed/units[u]), u)
    }

    await new Promise(resolve => {
        switch (pg) {
            case 'library':
                let alloff = true

                document.querySelector('body > main').innerHTML = `<div style="padding: 10px 14px; min-height: calc(100vh - 53px);">
                    <div><h1>Mod Library</h1><p>Edit, Toggle, Manage and  your Installed Mods.</p></div>
                    <div id="options"><label tabindex="0">Install External Mod<input type="file" accept=".geode" style="display: none"></label><button>Check for Updates</button><button>Disable All Mods</button><button>Sort and Filter <span>&#xF282;</span></button></div>
                    <div id="filtermenu"></div>
            <div id="library">
                <div>
                    <span></span>
                    <span>Mod Name</span>
                    <span>Version</span>
                    <span>Last Modified</span>
                </div>
            </div>
        </div>`

        for (let i = 0; i < Object.keys(mods).length; i++) {
            let mod = Object.keys(mods)[i]
            let version = `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 12)}.${Math.floor(Math.random() * 30)}`
            document.getElementById('library').innerHTML += `<div data-modid="${i}" tabindex="0">
            <span><img src="../assets/defaultmod.png" alt="${mod}'s icon" style="border-radius: 11px; ${mods[mod].enabled ? '' : 'filter: grayscale(1)'}; transition: filter 200ms ease-in-out" height="60" width="60"></span>
                <span title="${mod}">${mod}</span>
                <span title="v${version}">v${version}</span>
                <span title="${new Date(mods[mod].time).toLocaleString()} (${getRelativeTime(mods[mod].time)})">${getRelativeTime(mods[mod].time)}</span>
            </div>`
            if (mods[mod].enabled) alloff = false
        }
        if (alloff) document.querySelectorAll('#options button')[1].innerText = 'Enable All Mods'

        for (let i = 0; i < Object.keys(mods).length; i++) {
            document.querySelector(`#library div[data-modid="${i}"]`).addEventListener('contextmenu', (e) => {
                let context = document.getElementsByTagName('context')[0]
                context.innerHTML = ''
                // let update = context.appendChild(document.createElement('button'))
                let rename = context.appendChild(document.createElement('button'))
                let disable = context.appendChild(document.createElement('button'))
                let del = context.appendChild(document.createElement('button'))
                // update.innerText = 'Update'
                if (mods[Object.keys(mods)[i]].enabled) disable.innerText = 'Disable'
                else disable.innerText = 'Enable'
                del.innerText = 'Delete'
                del.id = 'del'
                rename.innerText = 'Rename'
                rename.id = 'renameMod'
                context.style.display = 'flex'
                context.style.top = e.clientY + 10 + 'px'
                context.style.left = e.clientX + 10 + 'px'
                let bounding = context.getBoundingClientRect()
                if (bounding.bottom >= (window.innerHeight - 5 || document.documentElement.clientHeight - 5)) {
                    context.style.top = e.clientY - bounding.height + 'px'
                }
                if (bounding.right >= (window.innerWidth - 5 || document.documentElement.clientWidth - 5)) {
                    context.style.left = e.clientX - bounding.width + 'px'
                }
                context.style.display = 'flex'

                disable.addEventListener('click', () => {
                    context.style.display = 'none'
                    if (mods[Object.keys(mods)[i]].enabled == false) {
                        mods[Object.keys(mods)[i]].enabled = true
                        document.querySelector(`#library div[data-modid="${i}"] span img`).style.filter = ''
                    } else {
                        mods[Object.keys(mods)[i]].enabled = false
                        document.querySelector(`#library div[data-modid="${i}"] span img`).style.filter = 'grayscale(1)'
                    }

                    mods[Object.keys(mods)[i]].enabled
                    
                    let list = ''
                    try {
                        Object.keys(mods).forEach(m => { if (mods[m].enabled) list += m + '.dll\r\n' })
                        fs.writeFileSync(path.join(storage.GDDIR, '/quickldr/settings.txt'), list)
                    } catch {}
                    if (list == '') document.querySelectorAll('#options button')[1].innerText = 'Enable All Mods'
                    else document.querySelectorAll('#options button')[1].innerText = 'Disable All Mods'
                })

                del.addEventListener('click', async () => {
                    context.style.display = 'none'
                    const confirm = await modal({ title: 'Confirmation' })
                    confirm.innerHTML = `<div style="
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
                        justify-content: space-between;
                        align-items: center
                    ">
                        <button id="continue" class="style red">Delete Mod</button><button id="continue" class="style">Nevermind</button>
                    </div>`

                    confirm.querySelector('div').innerHTML = `
                    <p>Are you sure you want to delete <strong>${Object.keys(mods)[i]}</strong>?</p>
                        <p>This action <strong>cannot</strong> be undone!</p>
                    `

                    confirm.querySelectorAll('button')[0].addEventListener('click', async () => {
                        await fs.unlinkSync(path.join(gdfiles, `Contents/geode/mods/${Object.keys(mods)[i]}.geode`))
                        //let list = ''
                        //await _mods.forEach(m => { if (mods[m].enabled && m != _mods[i]) list += m + '.dll\r\n' })
                        //await fs.writeFileSync(path.join(localStorage.GDDIR, '/quickldr/settings.txt'), list)
                        document.querySelector('#modal').style.opacity = '0'
                        document.querySelector('#modalcontainer').style.opacity = '0'
                        await wait(200)
                        document.querySelector('#modalcontainer').style.display = 'none'
                        document.querySelector(`#library div[data-modid="${i}"]`).style.transition = '200ms ease-out'
                        document.querySelector(`#library div[data-modid="${i}"]`).style.opacity = '0'
                        await wait(200)
                        document.querySelector(`#library div[data-modid="${i}"]`).style.display = 'none'
                    })

                    confirm.querySelectorAll('button')[1].addEventListener('click', async () => {
                        document.querySelector('#modal').style.opacity = '0'
                        document.querySelector('#modalcontainer').style.opacity = '0'
                        await wait(200)
                        document.querySelector('#modalcontainer').style.display = 'none'
                    })
                })

                renameMod.addEventListener('click', async () => {
                    context.style.display = 'none'
                    const confirm = await modal({ title: 'Rename' })
                    confirm.innerHTML = `<div style="
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
                        justify-content: space-between;
                        align-items: center
                    ">
                        <button id="continue" class="style">Cancel</button><button id="continue" class="style">Rename Mod</button>
                    </div>`

                    confirm.querySelector('div').innerHTML = `
                        <label for="modName">Rename Mod to:</label>
                        <input type="text" id="modName" name="modName class="input" required
                        minlength="2" maxlength="16" size="20">
                    `

                    confirm.querySelectorAll('button')[1].addEventListener('click', async () => {
                        let renameName = modName.value;
                        await fs.renameSync(path.join(gdfiles, `Contents/geode/mods/${mods[Object.keys(mods)[i]]}.geode`), path.join(gdfiles, `Contents/geode/mods/${renameName}.geode`))
                        document.querySelector(`#library span[title="${mods[Object.keys(mods)[i]]}"]`).innerHTML = `<span title="${renameName}">${renameName}</span>`
                        document.querySelector('#modal').style.opacity = '0'
                        document.querySelector('#modalcontainer').style.opacity = '0'
                        await wait(200)
                        document.querySelector('#modalcontainer').style.display = 'none'
                        //document.querySelector(`#library div[data-modid="${i}"]`).style.transition = '200ms ease-out'
                        //document.querySelector(`#library div[data-modid="${i}"]`).style.opacity = '0'
                        await wait(200)
                        //document.querySelector(`#library div[data-modid="${i}"]`).style.display = 'none'
                    })

                    confirm.querySelectorAll('button')[0].addEventListener('click', async () => {
                        document.querySelector('#modal').style.opacity = '0'
                        document.querySelector('#modalcontainer').style.opacity = '0'
                        await wait(200)
                        document.querySelector('#modalcontainer').style.display = 'none'
                    })
                })
            })
        }

        document.addEventListener('click', e => {
            if (document.getElementsByTagName('context')[0].contains(e.target)) return;
            document.getElementsByTagName('context')[0].style.display = 'none'
        })

        document.querySelector('#options input').addEventListener('change', async e => {
            let mod = e.target.files[0]
            if (!mod.name.endsWith('.geode')) return
            if (Object.keys(mods).indexOf(mod.name.slice(0, -4)) == -1) {
                let read = fs.createReadStream(mod.path)
                let write = fs.createWriteStream(path.join(storage.GDDIR, '/quickldr/', mod.name))

                read.pipe(write)

                try {
                    fs.writeFileSync(path.join(storage.GDDIR, '/quickldr/settings.txt'), mod.name, { flag: 'a' })
                } catch {}
                mods[mod.name.slice(0, -4)] = { enabled: true, time: mod.lastModified }
                page('library')

                await wait(400)
            }

            document.querySelector(`#library div[data-modid="${Object.keys(mods).indexOf(mod.name.slice(0, -4))}"]`).scrollIntoView()
        })

        document.querySelectorAll('#options button')[1].addEventListener('click', e => {                    
            if (e.target.innerText.startsWith('Enable')) {
                Object.keys(mods).forEach(m => mods[m].enabled = true)
                document.querySelectorAll(`#library div span img`).forEach(e => e.style.filter = '')
                e.target.innerText = 'Disable All Mods'
            } else {
                Object.keys(mods).forEach(m => mods[m].enabled = false)
                document.querySelectorAll(`#library div span img`).forEach(e => e.style.filter = 'grayscale(1)')
                e.target.innerText = 'Enable All Mods'
            }

            let list = ''
            try {
                Object.keys(mods).forEach(m => { if (mods[m].enabled) list += m + '.geode\r\n' })
                fs.writeFileSync(path.join(storage.GDDIR, '/quickldr/settings.txt'), list)
            } catch {}
        })

        document.querySelector('main div').ondrop = async e => {
            e.preventDefault()
            let files = [...e.dataTransfer.files]
            let useful = false

            files.forEach(mod => {
                if (Object.keys(mods).indexOf(mod.name.slice(0, -4)) != -1 || !mod.name.endsWith('.geode')) return
                useful = true
                let read = fs.createReadStream(mod.path)
                let write = fs.createWriteStream(path.join(storage.GDDIR, mod.name))

                read.pipe(write)

                fs.writeFileSync(path.join(storage.GDDIR, '/quickldr/settings.txt'), mod.name, { flag: 'a' })
                mods[mod.name.slice(0, -4)] = { enabled: true, time: mod.lastModified }
            })

            if (useful) page('library')
        }

        document.querySelector('main div').ondragover = e => {
            e.preventDefault()
        }
        
        resolve()
        break
        case 'store':
            document.querySelector('body > main').innerHTML = `<div style="padding: 10px 14px; min-height: calc(100vh - 53px);">
            <div><h1>Mod Store</h1><p>Install and View Mods instantly.</p></div>
            <div id="store"></div>
        </div>`

        https.get({
            hostname: 'api.github.com',
            path: '/repos/geode-sdk/mods/contents/index',
            headers: {
                'User-Agent': navigator.userAgent + `User ${storage.UUID}`
            }
        }, res => {
            let _data = ''
            res.on('data', (d) => _data += d)
            res.on('end', async () => {
                _data = JSON.parse(_data)
                document.getElementById('store').innerHTML += '<h2>Popular</h2>'
                let div = document.getElementById('store').appendChild(document.createElement('div'))
                div.id = "storeContainer";
                let i = 0
                while (i < _data.length) {
                    let data = _data[i]
                    https.get({
                        hostname: 'raw.githubusercontent.com',
                        path: `/geode-sdk/mods/main/index/${data.name}/mod.json`,
                        headers: {
                            'User-Agent': navigator.userAgent + `User ${storage.UUID}`
                        }
                    }, res => {
                        let moddata = ''
                        res.on('data', (d) => moddata += d)
                        res.on('end', async () => {
                            moddata = JSON.parse(moddata)
                            div.innerHTML += `<button data-modid="${i}"
                            style="
                                background-image: url('../assets/background.jpg');
                            ">
                                <div>
                                    <img src="https://github.com/geode-sdk/mods/raw/main/index/${data.name}/logo.png">
                                    <span>
                                        <h3>${moddata.name}</h3>
                                        <p>by ${moddata.developer} - ${moddata.version}</p>
                                    </span>
                                </div>
                            </button>
                            `
                        })
                    })
                    i++
                }
            })
        })
        resolve();
        break
        case 'installations':
            let _mods3 = Object.keys(installs)
        document.querySelector('body > main').innerHTML = `
        <div style="padding: 10px 14px; min-height: calc(100vh - 53px);">
            <div><h1>Installations</h1><p>Launch, Manage, and <a id="add">Add</a> GD Installations.</p></div>
        <div style="display: flex; padding: 14px; flex-wrap: wrap; align-content: flex-start">
            <div id="library">
                <div>
                    <span></span>
                    <span>Installation Name</span>
                    <span>Type of Game</span>
                    <span>Path to Installation</span>
                </div>
            </div>
        </div>`
        add.addEventListener('click', async () => {
            const newInstall = await modal({ title: 'New Installation' })
            newInstall.innerHTML = `<div style="
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
                        justify-content: space-between;
                        align-items: center
                    ">
                        <button id="continue" class="style">Cancel</button><button id="installAdd" class="style">Add Installation</button>
                    </div>`
            newInstall.querySelector('div').innerHTML = `
                <label for="installName">Installation Name:</label>
                <input type="text" id="installName" name="installName" class="style" required
                minlength="2" maxlength="16" size="20">
                <label for="installPath">Installation Path:</label>
                <input type="text" id="installPath" name="installPath" class="style" required
                minlength="2" maxlength="100" size="20">
                <label for="installType">Installation Type</label>
                <select id="installType" name="installType">
                <option value="legalGame">Unmodified Steam Game</option>
                <option value="modifiedGame">Cracked or Modified Game</option>
                </select>
            `
            newInstall.querySelectorAll('button')[1].addEventListener('click', async () => {
                const username = os.userInfo ().username;
                document.querySelector('#modal').style.opacity = '0'
                document.querySelector('#modalcontainer').style.opacity = '0'
                await wait(200)
                if (document.getElementById('installType').value) document.getElementById('installPath').value = path.join('/Users/', username, '/Library/Application Support/Steam/steamapps/common/Geometry Dash/Geometry Dash.app/')
                document.querySelector('#modalcontainer').style.display = 'none'
                let install = { 
                    path: document.getElementById('installPath').value, 
                    type: document.getElementById('installType').value,
                    enabled: false
                };
    
                let installData = JSON.stringify(install);
                fs.writeFileSync(path.join('/Users/', username, 'Library/Application Support/JumpStart/', `Installations/${document.getElementById('installName').value}.json`), installData);
            })

            newInstall.querySelectorAll('button')[0].addEventListener('click', async () => {
                document.querySelector('#modal').style.opacity = '0'
                document.querySelector('#modalcontainer').style.opacity = '0'
                await wait(200)
                document.querySelector('#modalcontainer').style.display = 'none'
            })
        })
        for (let i = 0; i < _mods3.length; i++) {
            let mod = _mods3[i]
            let version = `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 12)}.${Math.floor(Math.random() * 30)}`
            document.getElementById('library').innerHTML += `<div data-modid="${i}">
                <span><img src="../assets/defaultmod.png" alt="${mod}'s icon" style="border-radius: 11px; ${installs[mod].enabled ? '' : 'filter: grayscale(1)'}" height="60" width="60"></span>
                <span title="${mod}">${mod}</span>
                <span title="${installs[mod].type}">${installs[mod].type}</span>
                <span title="${installs[mod].path}">${installs[mod].path}</span>
            </div>`
        }
        for (let i = 0; i < _mods3.length; i++) {
            document.querySelector(`#library div[data-modid="${i}"]`).addEventListener('contextmenu', (e) => {
                let context = document.getElementsByTagName('context')[0]
                context.innerHTML = ''
                // let update = context.appendChild(document.createElement('button'))
                let setDef = context.appendChild(document.createElement('button'))
                let disable = context.appendChild(document.createElement('button'))
                let rename = context.appendChild(document.createElement('button'))
                let del = context.appendChild(document.createElement('button'))
                // update.innerText = 'Update'
                setDef.innerText = 'Set as Main'
                disable.innerText = 'Launch'
                del.innerText = 'Delete'
                del.id = 'del'
                rename.innerText = 'Rename'
                rename.id = 'renameMod'
                context.style.top = e.clientY + 10 + 'px'
                context.style.left = e.clientX + 10 + 'px'
                let bounding = context.getBoundingClientRect()
                if (bounding.bottom >= (window.innerHeight - 5 || document.documentElement.clientHeight - 5)) {
                    context.style.top = e.clientY - bounding.height - 5 + 'px'
                }
                if (bounding.right >= (window.innerWidth - 5 || document.documentElement.clientWidth - 5)) {
                    context.style.left = e.clientX - bounding.width - 5 + 'px'
                }
                context.style.display = 'flex'

                disable.addEventListener('click', () => {
                    const username = os.userInfo ().username;
                    if (installs[_mods3[i]].type != 'legalGame') {
                        exec(`open '${installs[_mods3[i]].path}'`, (error, stdout, stderr) => {
                            if (error) {
                                console.log(`error: ${error.message}`);
                                return;
                            }
                            if (stderr) {
                                console.log(`stderr: ${stderr}`);
                                return;
                            }
                            console.log(`stdout: ${stdout}`);
                        });
                    } else {
                        location.href = 'steam://rungameid/322170'
                    }
                    installs[_mods3[i]].enabled
                })

                setDef.addEventListener('click', () => {
                    for (let n = 0; n < _mods3.length; n++) {
                        installs[_mods3[n]].enabled = false
                    }
                    context.style.display = 'none'
                    installs[_mods3[i]].enabled = true
                    document.querySelector(`#library div[data-modid="${i}"] span img`).style.filter = ''
                    gdfiles = installs[_mods3[i]].path
                    installs[_mods3[i]].enabled
                })

                del.addEventListener('click', async () => {
                    context.style.display = 'none'
                    const confirm = await modal({ title: 'Confirmation' })
                    confirm.innerHTML = `<div style="
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
                        justify-content: space-between;
                        align-items: center
                    ">
                        <button id="continue" class="style red">Delete Installation</button><button id="continue" class="style">Nevermind</button>
                    </div>`

                    confirm.querySelector('div').innerHTML = `
                        <p>Are you sure you want to delete <strong>${_mods3[i]}</strong>?</p>
                        <p>This action <strong>cannot</strong> be undone!</p>
                    `

                    confirm.querySelectorAll('button')[0].addEventListener('click', async () => {
                        await fs.unlinkSync(path.join('/Users/', username, 'Library/Application Support/JumpStart/', `Installations/${_mods3[i]}.json`))
                        //let list = ''
                        //await _mods.forEach(m => { if (mods[m].enabled && m != _mods[i]) list += m + '.dll\r\n' })
                        //await fs.writeFileSync(path.join(localStorage.GDDIR, '/quickldr/settings.txt'), list)
                        document.querySelector('#modal').style.opacity = '0'
                        document.querySelector('#modalcontainer').style.opacity = '0'
                        await wait(200)
                        document.querySelector('#modalcontainer').style.display = 'none'
                        document.querySelector(`#library div[data-modid="${i}"]`).style.transition = '200ms ease-out'
                        document.querySelector(`#library div[data-modid="${i}"]`).style.opacity = '0'
                        await wait(200)
                        document.querySelector(`#library div[data-modid="${i}"]`).style.display = 'none'
                    })

                    confirm.querySelectorAll('button')[1].addEventListener('click', async () => {
                        document.querySelector('#modal').style.opacity = '0'
                        document.querySelector('#modalcontainer').style.opacity = '0'
                        await wait(200)
                        document.querySelector('#modalcontainer').style.display = 'none'
                    })
                })

                renameMod.addEventListener('click', async () => {
                    context.style.display = 'none'
                    const confirm = await modal({ title: 'Rename' })
                    confirm.innerHTML = `<div style="
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
                        justify-content: space-between;
                        align-items: center
                    ">
                        <button id="continue" class="style">Cancel</button><button id="continue" class="style">Rename Mod</button>
                    </div>`

                    confirm.querySelector('div').innerHTML = `
                        <label for="modName">Rename Mod to:</label>
                        <input type="text" id="modName" name="modName" class="input" required
                        minlength="2" maxlength="16" size="20">
                    `

                    confirm.querySelectorAll('button')[1].addEventListener('click', async () => {
                        await fs.renameSync(path.join('/Users/', username, '/Library/Application Support/JumpStart/Installations/', `${document.getElementById('modName').value}.json`))
                        document.querySelector('#modal').style.opacity = '0'
                        document.querySelector('#modalcontainer').style.opacity = '0'
                        await wait(200)
                        document.querySelector('#modalcontainer').style.display = 'none'
                        //document.querySelector(`#library div[data-modid="${i}"]`).style.transition = '200ms ease-out'
                        //document.querySelector(`#library div[data-modid="${i}"]`).style.opacity = '0'
                        await wait(200)
                        //document.querySelector(`#library div[data-modid="${i}"]`).style.display = 'none'
                    })

                    confirm.querySelectorAll('button')[0].addEventListener('click', async () => {
                        document.querySelector('#modal').style.opacity = '0'
                        document.querySelector('#modalcontainer').style.opacity = '0'
                        await wait(200)
                        document.querySelector('#modalcontainer').style.display = 'none'
                    })
                })
            })
        }

        document.addEventListener('click', e => {
            if (document.getElementsByTagName('context')[0].contains(e.target)) return;
            document.getElementsByTagName('context')[0].style.display = 'none'
        })
        
        resolve()
        break
        case 'texturePacks':
            document.querySelector('body > main').innerHTML = `<div style="display: flex; padding: 14px; flex-wrap: wrap; align-content: flex-start">
            <div id="library">
                <div>
                    <span></span>
                    <span>Texture Pack Name</span>
                    <span>Version</span>
                    <span>Last Modified</span>
                </div>
            </div>
        </div>`

        let _mods4 = Object.keys(packs)
        for (let i = 0; i < _mods4.length; i++) {
            let pack = _mods4[i]
            let version = `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 12)}.${Math.floor(Math.random() * 30)}`
            document.getElementById('library').innerHTML += `<div data-modid="${i}">
                <span><img src="../assets/background.jpg" alt="${pack}'s icon" style="border-radius: 11px; ${packs[pack].enabled ? '' : 'filter: grayscale(1)'}" height="60" width="60"></span>
                <span title="${pack}">${pack}</span>
                <span title="v${version}">v${version}</span>
                <span title="${new Date(packs[pack].time).toLocaleString()} (${getRelativeTime(packs[pack].time)})">${getRelativeTime(packs[pack].time)}</span>
            </div>`
        }
        for (let i = 0; i < _mods4.length; i++) {
            document.querySelector(`#library div[data-modid="${i}"]`).addEventListener('contextmenu', (e) => {
                let context = document.getElementsByTagName('context')[0]
                context.innerHTML = ''
                // let update = context.appendChild(document.createElement('button'))
                let disable = context.appendChild(document.createElement('button'))
                let rename = context.appendChild(document.createElement('button'))
                let del = context.appendChild(document.createElement('button'))
                // update.innerText = 'Update'
                disable.innerText = 'Apply'
                del.innerText = 'Delete'
                del.id = 'del'
                rename.innerText = 'Rename'
                rename.id = 'renameMod'
                context.style.top = e.clientY + 10 + 'px'
                context.style.left = e.clientX + 10 + 'px'
                let bounding = context.getBoundingClientRect()
                if (bounding.bottom >= (window.innerHeight - 5 || document.documentElement.clientHeight - 5)) {
                    context.style.top = e.clientY - bounding.height - 5 + 'px'
                }
                if (bounding.right >= (window.innerWidth - 5 || document.documentElement.clientWidth - 5)) {
                    context.style.left = e.clientX - bounding.width - 5 + 'px'
                }
                context.style.display = 'flex'

                disable.addEventListener('click', () => {
                    context.style.display = 'none'
                    packs[_mods4[i]].enabled = true
                    document.querySelector(`#library div[data-modid="${i}"] span img`).style.filter = ''
                    const username = os.userInfo ().username;
                    var enabledPack = new AdmZip(path.join('/Users/', username, `/Library/Application Support/JumpStart/JumpStart-Resources/${_mods4[i]}.zip`));
                    enabledPack.extractAllTo(path.join(gdfiles, 'Contents/Resources/'), true);
                    packs[_mods4[i]].enabled
                })

                del.addEventListener('click', async () => {
                    context.style.display = 'none'
                    const confirm = await modal({ title: 'Confirmation' })
                    confirm.innerHTML = `<div style="
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
                        justify-content: space-between;
                        align-items: center
                    ">
                        <button id="continue" class="style red">Delete Mod</button><button id="continue" class="style">Nevermind</button>
                    </div>`

                    confirm.querySelector('div').innerHTML = `
                        <p>Are you sure you want to delete <strong>${_mods4[i]}</strong>?</p>
                        <p>This action <strong>cannot</strong> be undone!</p>
                    `

                    confirm.querySelectorAll('button')[0].addEventListener('click', async () => {
                        const username = os.userInfo ().username;
                        await fs.unlinkSync(path.join('/Users/', username, `/Library/Application Support/JumpStart/JumpStart-Resources/${_mods4[i]}.zip`))
                        //let list = ''
                        //await _mods.forEach(m => { if (mods[m].enabled && m != _mods[i]) list += m + '.dll\r\n' })
                        //await fs.writeFileSync(path.join(localStorage.GDDIR, '/quickldr/settings.txt'), list)
                        document.querySelector('#modal').style.opacity = '0'
                        document.querySelector('#modalcontainer').style.opacity = '0'
                        await wait(200)
                        document.querySelector('#modalcontainer').style.display = 'none'
                        document.querySelector(`#library div[data-modid="${i}"]`).style.transition = '200ms ease-out'
                        document.querySelector(`#library div[data-modid="${i}"]`).style.opacity = '0'
                        await wait(200)
                        document.querySelector(`#library div[data-modid="${i}"]`).style.display = 'none'
                    })

                    confirm.querySelectorAll('button')[1].addEventListener('click', async () => {
                        document.querySelector('#modal').style.opacity = '0'
                        document.querySelector('#modalcontainer').style.opacity = '0'
                        await wait(200)
                        document.querySelector('#modalcontainer').style.display = 'none'
                    })
                })

                renameMod.addEventListener('click', async () => {
                    context.style.display = 'none'
                    const confirm = await modal({ title: 'Rename' })
                    confirm.innerHTML = `<div style="
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
                        justify-content: space-between;
                        align-items: center
                    ">
                        <button id="continue" class="style">Cancel</button><button id="continue" class="style">Rename Mod</button>
                    </div>`

                    confirm.querySelector('div').innerHTML = `
                        <label for="texName">Rename Mod to:</label>
                        <input type="text" id="texName" name="texName" class="input" required
                        minlength="2" maxlength="16" size="20">
                    `

                    confirm.querySelectorAll('button')[1].addEventListener('click', async () => {
                        let renameName = texName.value;
                        const username = os.userInfo ().username;
                        await fs.renameSync(path.join('/Users/', username, `/Library/Application Support/JumpStart/JumpStart-Resources/${_mods4[i]}.zip`), path.join('/Users/', username, `/Library/Application Support/JumpStart/JumpStart-Resources/${renameName}.zip`))
                        document.querySelector(`#library span[title="${_mods4[i]}"]`).innerHTML = `<span title="${renameName}">${renameName}</span>`
                        document.querySelector('#modal').style.opacity = '0'
                        document.querySelector('#modalcontainer').style.opacity = '0'
                        await wait(200)
                        document.querySelector('#modalcontainer').style.display = 'none'
                    })

                    confirm.querySelectorAll('button')[0].addEventListener('click', async () => {
                        document.querySelector('#modal').style.opacity = '0'
                        document.querySelector('#modalcontainer').style.opacity = '0'
                        await wait(200)
                        document.querySelector('#modalcontainer').style.display = 'none'
                    })
                })
            })
        }

        document.addEventListener('click', e => {
            if (document.getElementsByTagName('context')[0].contains(e.target)) return;
            document.getElementsByTagName('context')[0].style.display = 'none'
        })
        
        resolve()
        break
        case 'saveData':
            document.querySelector('body > main').innerHTML = `<div style="display: flex; padding: 14px; flex-wrap: wrap; align-content: flex-start">
            <div id="library">
                <div>
                    <span></span>
                    <span>Save File Name</span>
                    <span>Version</span>
                    <span>Last Modified</span>
                </div>
            </div>
        </div>`
/*
        const confirm = await modal({ title: 'Options' })
                confirm.innerHTML = `<div style="
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
                            justify-content: space-between;
                            align-items: center
                        ">
                            <button id="continue" class="style">Cancel</button><button id="continue" class="style">Backup</button>
                        </div>`
                confirm.querySelector('div').innerHTML = `
                        <p>Are you sure you would like to backup your save file?</p>
                        <p><strong>This may take a couple seconds due to the file sizes.</strong></p>
                `
                confirm.querySelectorAll('button')[1].addEventListener('click', async () => {
                    var seconds = new Date().getTime() / 1000;
                    const username = os.userInfo ().username;
                    const zip = new AdmZip();
                    const outputFile = path.join('/Users/', username, `/Library/Application Support/GeometryDash/JUMPSTART_BACKUP_${seconds}.zip`);
                    document.querySelector('#modal').style.opacity = '0'
                    document.querySelector('#modalcontainer').style.opacity = '0'
                    await wait(200)
                    document.querySelector('#modalcontainer').style.display = 'none'
                    zip.addLocalFolder(path.join('/Users/', username, '/Library/Application Support/GeometryDash/'));
                    zip.writeZip(outputFile);
                })
    
                confirm.querySelectorAll('button')[0].addEventListener('click', async () => {
                    document.querySelector('#modal').style.opacity = '0'
                    document.querySelector('#modalcontainer').style.opacity = '0'
                    await wait(200)
                    document.querySelector('#modalcontainer').style.display = 'none'
                })
                */

        let _mods2 = Object.keys(saves)
        for (let i = 0; i < _mods2.length; i++) {
            let mod = _mods2[i]
            let version = `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 12)}.${Math.floor(Math.random() * 30)}`
            document.getElementById('library').innerHTML += `<div data-modid="${i}">
                <span><img src="../assets/defaultmod.png" alt="${mod}'s icon" style="border-radius: 11px; ${saves[mod].enabled ? '' : 'filter: grayscale(1)'}" height="60" width="60"></span>
                <span title="${mod}">${mod}</span>
                <span title="v${version}">v${version}</span>
                <span title="${new Date(saves[mod].time).toLocaleString()} (${getRelativeTime(saves[mod].time)})">${getRelativeTime(saves[mod].time)}</span>
            </div>`
        }
        for (let i = 0; i < _mods2.length; i++) {
            document.querySelector(`#library div[data-modid="${i}"]`).addEventListener('contextmenu', (e) => {
                let context = document.getElementsByTagName('context')[0]
                context.innerHTML = ''
                // let update = context.appendChild(document.createElement('button'))
                let rename = context.appendChild(document.createElement('button'))
                let disable = context.appendChild(document.createElement('button'))
                let del = context.appendChild(document.createElement('button'))
                // update.innerText = 'Update'
                if (saves[_mods2[i]].enabled) disable.innerText = 'Disable'
                else disable.innerText = 'Enable'
                del.innerText = 'Delete'
                del.id = 'del'
                rename.innerText = 'Rename'
                rename.id = 'renameMod'
                context.style.top = e.clientY + 10 + 'px'
                context.style.left = e.clientX + 10 + 'px'
                let bounding = context.getBoundingClientRect()
                if (bounding.bottom >= (window.innerHeight - 5 || document.documentElement.clientHeight - 5)) {
                    context.style.top = e.clientY - bounding.height - 5 + 'px'
                }
                if (bounding.right >= (window.innerWidth - 5 || document.documentElement.clientWidth - 5)) {
                    context.style.left = e.clientX - bounding.width - 5 + 'px'
                }
                context.style.display = 'flex'

                disable.addEventListener('click', () => {
                    context.style.display = 'none'
                    if (saves[_mods2[i]].enabled == false) {
                        saves[_mods2[i]].enabled = true
                        document.querySelector(`#library div[data-modid="${i}"] span img`).style.filter = ''
                    } else {
                        saves[_mods2[i]].enabled = false
                        document.querySelector(`#library div[data-modid="${i}"] span img`).style.filter = 'grayscale(1)'
                    }

                    saves[_mods2[i]].enabled
                })

                del.addEventListener('click', async () => {
                    context.style.display = 'none'
                    const confirm = await modal({ title: 'Confirmation' })
                    confirm.innerHTML = `<div style="
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
                        justify-content: space-between;
                        align-items: center
                    ">
                        <button id="continue" class="style red">Delete Mod</button><button id="continue" class="style">Nevermind</button>
                    </div>`

                    confirm.querySelector('div').innerHTML = `
                        <p>Are you sure you want to delete <strong>${_mods2[i]}</strong>?</p>
                        <p>This action <strong>cannot</strong> be undone!</p>
                    `

                    confirm.querySelectorAll('button')[0].addEventListener('click', async () => {
                        const username = os.userInfo ().username;
                        await fs.unlinkSync(path.join('/Users/', username, '/Library/Application Support/GeometryDash/', `/${_mods2[i]}.zip`))
                        //let list = ''
                        //await _mods.forEach(m => { if (mods[m].enabled && m != _mods[i]) list += m + '.dll\r\n' })
                        //await fs.writeFileSync(path.join(localStorage.GDDIR, '/quickldr/settings.txt'), list)
                        document.querySelector('#modal').style.opacity = '0'
                        document.querySelector('#modalcontainer').style.opacity = '0'
                        await wait(200)
                        document.querySelector('#modalcontainer').style.display = 'none'
                        document.querySelector(`#library div[data-modid="${i}"]`).style.transition = '200ms ease-out'
                        document.querySelector(`#library div[data-modid="${i}"]`).style.opacity = '0'
                        await wait(200)
                        document.querySelector(`#library div[data-modid="${i}"]`).style.display = 'none'
                    })

                    confirm.querySelectorAll('button')[1].addEventListener('click', async () => {
                        document.querySelector('#modal').style.opacity = '0'
                        document.querySelector('#modalcontainer').style.opacity = '0'
                        await wait(200)
                        document.querySelector('#modalcontainer').style.display = 'none'
                    })
                })

                renameMod.addEventListener('click', async () => {
                    context.style.display = 'none'
                    const confirm = await modal({ title: 'Rename' })
                    confirm.innerHTML = `<div style="
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
                        justify-content: space-between;
                        align-items: center
                    ">
                        <button id="continue" class="style">Cancel</button><button id="continue" class="style">Rename Mod</button>
                    </div>`

                    confirm.querySelector('div').innerHTML = `
                        <label for="texName">Rename Mod to:</label>
                        <input type="text" id="texName" name="texName" class="input" required
                        minlength="2" maxlength="16" size="20">
                    `

                    confirm.querySelectorAll('button')[1].addEventListener('click', async () => {
                        let renameName = texName.value;
                        const username = os.userInfo ().username;
                        await fs.renameSync(path.join('/Users/', username, '/Library/Application Support/GeometryDash/', `${_mods2[i]}.zip`), path.join('/Users/', username, '/Library/Application Support/GeometryDash/', `${renameName}.zip`))
                        document.querySelector(`#library span[title="${_mods2[i]}"]`).innerHTML = `<span title="${renameName}">${renameName}</span>`
                        document.querySelector('#modal').style.opacity = '0'
                        document.querySelector('#modalcontainer').style.opacity = '0'
                        await wait(200)
                        document.querySelector('#modalcontainer').style.display = 'none'
                    })

                    confirm.querySelectorAll('button')[0].addEventListener('click', async () => {
                        document.querySelector('#modal').style.opacity = '0'
                        document.querySelector('#modalcontainer').style.opacity = '0'
                        await wait(200)
                        document.querySelector('#modalcontainer').style.display = 'none'
                    })
                })
            })
        }

        document.addEventListener('click', e => {
            if (document.getElementsByTagName('context')[0].contains(e.target)) return;
            document.getElementsByTagName('context')[0].style.display = 'none'
        })
        
        resolve()
        break
        default:

                document.querySelector('body > main').innerHTML = '<center></center>'
                alert('Woah now! This feature isn\'t in place yet. Come back later, alright?')

                resolve()
        }
    })

    await wait(200)
    document.querySelector('body > main > *').style.opacity = '1'
}

module.exports = page