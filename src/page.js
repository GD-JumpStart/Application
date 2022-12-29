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
                    <div id="options"><label tabindex="0">Install External Mod<input type="file" accept=".dll" style="display: none"></label><button>Check for Updates</button><button>Disable All Mods</button><button>Sort and Filter <span>\uF282</span></button></div>
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
                    Object.keys(mods).forEach(m => { if (mods[m].enabled) list += m + '.dll\r\n' })
                    fs.writeFileSync(path.join(storage.GDDIR, '/quickldr/settings.txt'), list)
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
                        await fs.unlinkSync(path.join(storage.GDDIR, `${Object.keys(mods)[i]}.geode`))
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
                        await fs.renameSync(path.join(localStorage.GDDIR, `/${_mods[i]}.geode`), path.join(localStorage.GDDIR, `/${renameName}.geode`))
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

                fs.writeFileSync(path.join(storage.GDDIR, '/quickldr/settings.txt'), mod.name, { flag: 'a' })
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
            Object.keys(mods).forEach(m => { if (mods[m].enabled) list += m + '.geode\r\n' })
            fs.writeFileSync(path.join(storage.GDDIR, '/quickldr/settings.txt'), list)
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
        case 'installations':
            document.querySelector('body > main').innerHTML = `<div style="display: flex; padding: 14px; flex-wrap: wrap; align-content: flex-start">
            <div id="library">
                <div>
                    <span></span>
                    <span>Mod Name</span>
                    <span>Version</span>
                    <span>Last Modified</span>
                </div>
            </div>
        </div>`

        let _mods3 = Object.keys(installs)
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
        if (_mods3.length == 0) {
            document.querySelector('body > main').innerHTML = `
            <center style="height: 100%; flex-direction: column;">
      <loading id="load" style="position: absolute; opacity: 0; bottom: calc(50% - 10px);"></loading>
      <h2 style="margin: 10px 0px; transform: translateY(10px); transition: 200ms ease-out">No installations to manage</h2>
      <p style="transform: translateY(10px); transition: 200ms ease-out">You have no installations! Manage your installations by <a id="idk">adding one</a> first.</p>
  </div>
    </center>
            `
        }
        idk.addEventListener('click', async () => {
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
                minlength="2" maxlength="16" size="20">
                <label for="installType">Installation Type</label>
                <select id="installType" name="installType">
                <option value="legalGame">Unmodified Steam Game</option>
                <option value="modifiedGame">Cracked or Modified Game</option>
                </select>
            `
            newInstall.querySelectorAll('button')[1].addEventListener('click', async () => {
                document.querySelector('body > main').innerHTML = `<div style="display: flex; padding: 14px; flex-wrap: wrap; align-content: flex-start">
                <div id="library">
                        <div>
                        <span></span>
                        <span>Installation Name</span>
                        <span>Path</span>
                        <span>Type</span>
                        </div>
                    </div>
                </div>`
                let installNameVal = installName.value;
                let installPathVal = installPath.value;
                let installTypeVal = installType.value;
                document.getElementById('library').innerHTML += `<div data-modid="${installNameVal}">
                    <span><img src="../assets/defaultmod.png" alt="${installTypeVal}'s icon" style="border-radius: 11px" height="60" width="60"></span>
                    <span title="${installNameVal}">${installNameVal}</span>
                    <span title="${installPathVal}">${installPathVal}</span>
                    <span title="${installTypeVal}">${installTypeVal}</span>
                </div>`
                document.querySelector('#modal').style.opacity = '0'
                document.querySelector('#modalcontainer').style.opacity = '0'
                await wait(200)
                document.querySelector('#modalcontainer').style.display = 'none'
            })
            newInstall.querySelectorAll('button')[0].addEventListener('click', async () => {
                document.querySelector('#modal').style.opacity = '0'
                document.querySelector('#modalcontainer').style.opacity = '0'
                await wait(200)
                document.querySelector('#modalcontainer').style.display = 'none'
            })
        })
        for (let i = 0; i < _mods3.length; i++) {
            document.querySelector(`#library div[data-modid="${i}"]`).addEventListener('contextmenu', (e) => {
                let context = document.getElementsByTagName('context')[0]
                context.innerHTML = ''
                // let update = context.appendChild(document.createElement('button'))
                let rename = context.appendChild(document.createElement('button'))
                let disable = context.appendChild(document.createElement('button'))
                let del = context.appendChild(document.createElement('button'))
                // update.innerText = 'Update'
                if (installs[_mods3[i]].enabled) disable.innerText = 'Disable'
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
                    if (installs[_mods3[i]].enabled == false) {
                        installs[_mods3[i]].enabled = true
                        document.querySelector(`#library div[data-modid="${i}"] span img`).style.filter = ''
                    } else {
                        installs[_mods[i]].enabled = false
                        document.querySelector(`#library div[data-modid="${i}"] span img`).style.filter = 'grayscale(1)'
                    }

                    installs[_mods3[i]].enabled
                    
                    let list = ''
                    _mods3.forEach(m => { if (installs[m].enabled) list += m + '.dll\r\n' })
                    fs.writeFileSync(path.join(localStorage.GDDIR, '/mods.txt'), list)
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
                        <p>Are you sure you want to delete <strong>${_mods3[i]}</strong>?</p>
                        <p>This action <strong>cannot</strong> be undone!</p>
                    `

                    confirm.querySelectorAll('button')[0].addEventListener('click', async () => {
                        await fs.unlinkSync(path.join(localStorage.GDDIR, `/${_mods3[i]}.geode`))
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
                        let renameName = modName.value;
                        await fs.renameSync(path.join(localStorage.GDDIR, `/${_mods3[i]}.geode`), path.join(localStorage.GDDIR, `/${renameName}.geode`))
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
                    <span>Mod Name</span>
                    <span>Version</span>
                    <span>Last Modified</span>
                </div>
            </div>
        </div>`

        let _mods2 = Object.keys(packs)
        for (let i = 0; i < _mods2.length; i++) {
            let mod = _mods2[i]
            let version = `${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 12)}.${Math.floor(Math.random() * 30)}`
            document.getElementById('library').innerHTML += `<div data-modid="${i}">
                <span><img src="../assets/defaultmod.png" alt="${mod}'s icon" style="border-radius: 11px; ${packs[mod].enabled ? '' : 'filter: grayscale(1)'}" height="60" width="60"></span>
                <span title="${mod}">${mod}</span>
                <span title="v${version}">v${version}</span>
                <span title="${new Date(packs[mod].time).toLocaleString()} (${getRelativeTime(packs[mod].time)})">${getRelativeTime(packs[mod].time)}</span>
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
                if (packs[_mods2[i]].enabled) disable.innerText = 'Disable'
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
                    if (packs[_mods2[i]].enabled == false) {
                        packs[_mods2[i]].enabled = true
                        document.querySelector(`#library div[data-modid="${i}"] span img`).style.filter = ''
                    } else {
                        packs[_mods2[i]].enabled = false
                        document.querySelector(`#library div[data-modid="${i}"] span img`).style.filter = 'grayscale(1)'
                    }

                    packs[_mods2[i]].enabled
                    
                    let list = ''
                    _mods2.forEach(m => { if (packs[m].enabled) list += m + '.dll\r\n' })
                    fs.writeFileSync(path.join(localStorage.GDDIR, '/mods.txt'), list)
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
                        await fs.unlinkSync(path.join(localStorage.GDDIR, `/${_mods2[i]}.geode`))
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
                        let oldTexture = path.join(localStorage.DEFAULT, '/Resources');
                        await fs.renameSync(path.join(localStorage.DEFAULT, '/Resources'), path.join(localStorage.DEFAULT, '/OldTextures'))
                        //await fs.renameSync(path.join(localStorage.DEFAULT, `${renameName}`), localStorage.RESOURCE)
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